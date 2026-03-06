import { extractCompoundsFromText, extractLegalActionsFromText } from './compoundDictionary.js';
import type { SemanticChunk } from './semanticChunker.js';
import { logger } from '../utils/logger.js';

/**
 * Extracted legal entities from a document or chunk.
 */
export interface ExtractedEntities {
  compounds_detected: string[];
  product_forms_detected: string[];
  legal_actions_detected: string[];
  agencies_detected: string[];
  dates_detected: ExtractedDate[];
  risk_signals: string[];
}

export interface ExtractedDate {
  date: string;
  context: string;      // e.g., "enforcement", "public_comment_close", "designation"
  confidence: number;
}

// ---------------------------------------------------------------------------
// Product form keywords
// ---------------------------------------------------------------------------
const PRODUCT_FORM_KEYWORDS: Record<string, string> = {
  'オイル': 'oil',
  'oil': 'oil',
  'グミ': 'gummy',
  'gummy': 'gummy',
  'gummies': 'gummy',
  'カプセル': 'capsule',
  'capsule': 'capsule',
  'パウダー': 'powder',
  '粉末': 'powder',
  'powder': 'powder',
  'ベイプ': 'vape',
  'vape': 'vape',
  '電子タバコ': 'vape',
  'クリーム': 'cream',
  'cream': 'cream',
  '化粧品': 'cosmetic',
  'cosmetic': 'cosmetic',
  'ドリンク': 'drink',
  '飲料': 'drink',
  '水溶液': 'aqueous_solution',
  'リキッド': 'liquid',
  'liquid': 'liquid',
  'ワックス': 'wax',
  'wax': 'wax',
  'ハーブ': 'herb',
  'herb': 'herb',
  'チンキ': 'tincture',
  'tincture': 'tincture',
};

// ---------------------------------------------------------------------------
// Agency keywords
// ---------------------------------------------------------------------------
const AGENCY_KEYWORDS: Record<string, string> = {
  '厚生労働省': 'MHLW',
  'MHLW': 'MHLW',
  '医薬局': 'MHLW',
  '薬事': 'MHLW',
  '麻薬取締部': 'NCD',
  'NCD': 'NCD',
  '消費者庁': 'CAA',
  'CAA': 'CAA',
  '警察庁': 'NPA',
  'NPA': 'NPA',
  '税関': 'Customs',
  '関税': 'Customs',
  '食品安全委員会': 'FSC',
  '経済産業省': 'METI',
  '農林水産省': 'MAFF',
};

// ---------------------------------------------------------------------------
// Risk signal patterns
// ---------------------------------------------------------------------------
const RISK_SIGNAL_PATTERNS: Array<{ pattern: RegExp; signal: string }> = [
  { pattern: /緊急/i, signal: 'emergency_action' },
  { pattern: /健康被害/i, signal: 'health_incident' },
  { pattern: /死亡/i, signal: 'fatality_reported' },
  { pattern: /入院/i, signal: 'hospitalization_reported' },
  { pattern: /逮捕/i, signal: 'arrest_reported' },
  { pattern: /回収命令/i, signal: 'recall_order' },
  { pattern: /自主回収/i, signal: 'voluntary_recall' },
  { pattern: /販売停止/i, signal: 'sales_suspension' },
  { pattern: /輸入禁止/i, signal: 'import_ban' },
  { pattern: /使用罪/i, signal: 'use_crime_applicable' },
  { pattern: /即日施行/i, signal: 'immediate_enforcement' },
  { pattern: /パブリックコメント/i, signal: 'public_comment_period' },
];

// ---------------------------------------------------------------------------
// Date extraction patterns
// ---------------------------------------------------------------------------
const DATE_PATTERNS: Array<{ regex: RegExp; context: string }> = [
  // Japanese: 令和X年Y月Z日
  { regex: /令和(\d+)年(\d+)月(\d+)日/g, context: 'japanese_date' },
  // Japanese: 20XX年Y月Z日
  { regex: /(20\d{2})年(\d{1,2})月(\d{1,2})日/g, context: 'japanese_date' },
  // ISO-like: 2024-12-12
  { regex: /(20\d{2})[/-](\d{1,2})[/-](\d{1,2})/g, context: 'iso_date' },
  // Enforcement: 施行日
  { regex: /施行[日期][:：]?\s*(.+?)(?:\s|$)/g, context: 'enforcement' },
  // Effective: 適用日
  { regex: /適用[日期][:：]?\s*(.+?)(?:\s|$)/g, context: 'effective' },
  // Public comment deadline
  { regex: /意見募集[期間]*[:：]?\s*(.+?)(?:まで|迄|\s|$)/g, context: 'public_comment_close' },
];

// ---------------------------------------------------------------------------
// Rule-based entity extraction (no LLM required)
// ---------------------------------------------------------------------------

/**
 * Extract all legal entities from text using rule-based methods.
 * This is the primary extraction method — fast and deterministic.
 */
export function extractEntitiesRuleBased(text: string): ExtractedEntities {
  return {
    compounds_detected: extractCompoundsFromText(text),
    product_forms_detected: extractProductForms(text),
    legal_actions_detected: extractLegalActionsFromText(text),
    agencies_detected: extractAgencies(text),
    dates_detected: extractDates(text),
    risk_signals: extractRiskSignals(text),
  };
}

/**
 * Extract entities from a semantic chunk (combines chunk metadata).
 */
export function extractEntitiesFromChunk(chunk: SemanticChunk): ExtractedEntities {
  const textToAnalyze = `${chunk.heading}\n${chunk.content}`;
  return extractEntitiesRuleBased(textToAnalyze);
}

/**
 * Merge entities extracted from multiple chunks into a single result.
 */
export function mergeExtractedEntities(results: ExtractedEntities[]): ExtractedEntities {
  const compounds = new Set<string>();
  const forms = new Set<string>();
  const actions = new Set<string>();
  const agencies = new Set<string>();
  const signals = new Set<string>();
  const allDates: ExtractedDate[] = [];

  for (const r of results) {
    r.compounds_detected.forEach(c => compounds.add(c));
    r.product_forms_detected.forEach(f => forms.add(f));
    r.legal_actions_detected.forEach(a => actions.add(a));
    r.agencies_detected.forEach(a => agencies.add(a));
    r.risk_signals.forEach(s => signals.add(s));
    allDates.push(...r.dates_detected);
  }

  // Deduplicate dates by date string
  const uniqueDates = deduplicateDates(allDates);

  return {
    compounds_detected: Array.from(compounds),
    product_forms_detected: Array.from(forms),
    legal_actions_detected: Array.from(actions),
    agencies_detected: Array.from(agencies),
    dates_detected: uniqueDates,
    risk_signals: Array.from(signals),
  };
}

// ---------------------------------------------------------------------------
// LLM-enhanced entity extraction (when API key is configured)
// ---------------------------------------------------------------------------

/**
 * Use LLM to extract entities from text when rule-based extraction
 * may miss nuanced legal language. Falls back to rule-based if no API key.
 */
export async function extractEntitiesWithLLM(text: string): Promise<ExtractedEntities> {
  const apiKey = process.env.LLM_API_KEY;
  const provider = process.env.LLM_PROVIDER || 'anthropic';

  // Fall back to rule-based if no API key
  if (!apiKey || apiKey === 'your-api-key-here') {
    logger.debug('No LLM API key configured, using rule-based extraction');
    return extractEntitiesRuleBased(text);
  }

  try {
    // Start with rule-based extraction
    const ruleBasedResult = extractEntitiesRuleBased(text);

    // Supplement with LLM for nuanced extraction
    const truncatedText = text.slice(0, 3000); // Keep within token limits

    const prompt = `You are a Japanese regulatory intelligence analyst. Extract legal entities from this text about Japanese cannabinoid/pharmaceutical regulations.

TEXT:
${truncatedText}

Return ONLY valid JSON with this structure:
{
  "compounds_detected": ["compound names found"],
  "product_forms_detected": ["product types found"],
  "legal_actions_detected": ["regulatory actions described"],
  "agencies_detected": ["government agencies mentioned"],
  "dates_detected": [{"date": "YYYY-MM-DD", "context": "what the date refers to", "confidence": 0.0-1.0}],
  "risk_signals": ["risk indicators found"]
}`;

    let llmResult: ExtractedEntities | null = null;

    if (provider === 'anthropic') {
      llmResult = await callAnthropicAPI(apiKey, prompt);
    }
    // Additional providers can be added here

    if (llmResult) {
      // Merge rule-based and LLM results
      return mergeExtractedEntities([ruleBasedResult, llmResult]);
    }

    return ruleBasedResult;
  } catch (err) {
    logger.warn('LLM entity extraction failed, falling back to rule-based', { error: err });
    return extractEntitiesRuleBased(text);
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function extractProductForms(text: string): string[] {
  const found = new Set<string>();
  const lowerText = text.toLowerCase();

  for (const [keyword, canonical] of Object.entries(PRODUCT_FORM_KEYWORDS)) {
    if (lowerText.includes(keyword.toLowerCase()) || text.includes(keyword)) {
      found.add(canonical);
    }
  }

  return Array.from(found);
}

function extractAgencies(text: string): string[] {
  const found = new Set<string>();

  for (const [keyword, canonical] of Object.entries(AGENCY_KEYWORDS)) {
    if (text.includes(keyword)) {
      found.add(canonical);
    }
  }

  return Array.from(found);
}

function extractDates(text: string): ExtractedDate[] {
  const dates: ExtractedDate[] = [];

  for (const { regex, context } of DATE_PATTERNS) {
    // Reset regex lastIndex
    regex.lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      let dateStr: string | null = null;

      if (context === 'japanese_date' && match[1] && match[2] && match[3]) {
        let year = parseInt(match[1], 10);
        // Convert Reiwa era to Gregorian
        if (year < 100) year += 2018; // Reiwa 1 = 2019
        const month = match[2].padStart(2, '0');
        const day = match[3].padStart(2, '0');
        dateStr = `${year}-${month}-${day}`;
      } else if (context === 'iso_date' && match[1] && match[2] && match[3]) {
        dateStr = `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
      }

      if (dateStr) {
        // Determine context from surrounding text
        const surroundingText = text.slice(
          Math.max(0, match.index - 30),
          Math.min(text.length, match.index + match[0].length + 30)
        );
        const dateContext = inferDateContext(surroundingText, context);

        dates.push({
          date: dateStr,
          context: dateContext,
          confidence: context === 'iso_date' ? 0.9 : 0.85,
        });
      }
    }
  }

  return dates;
}

function inferDateContext(surroundingText: string, defaultContext: string): string {
  if (/施行|enforcement/i.test(surroundingText)) return 'enforcement';
  if (/適用|effective/i.test(surroundingText)) return 'effective';
  if (/公布|promulgat/i.test(surroundingText)) return 'promulgation';
  if (/指定|designat/i.test(surroundingText)) return 'designation';
  if (/募集|comment/i.test(surroundingText)) return 'public_comment';
  if (/公開|publi/i.test(surroundingText)) return 'publication';
  return defaultContext;
}

function extractRiskSignals(text: string): string[] {
  const signals: string[] = [];

  for (const { pattern, signal } of RISK_SIGNAL_PATTERNS) {
    if (pattern.test(text)) {
      signals.push(signal);
    }
  }

  return signals;
}

function deduplicateDates(dates: ExtractedDate[]): ExtractedDate[] {
  const seen = new Map<string, ExtractedDate>();
  for (const d of dates) {
    const key = `${d.date}_${d.context}`;
    const existing = seen.get(key);
    if (!existing || d.confidence > existing.confidence) {
      seen.set(key, d);
    }
  }
  return Array.from(seen.values());
}

async function callAnthropicAPI(apiKey: string, prompt: string): Promise<ExtractedEntities | null> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: prompt,
        }],
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      logger.warn(`Anthropic API returned ${response.status}`);
      return null;
    }

    const data = await response.json() as {
      content: Array<{ type: string; text: string }>;
    };
    const text = data.content?.[0]?.text;
    if (!text) return null;

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    return JSON.parse(jsonMatch[0]) as ExtractedEntities;
  } catch (err) {
    logger.warn('Anthropic API call failed', { error: err });
    return null;
  }
}
