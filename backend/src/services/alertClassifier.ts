import type { AlertCategory, AlertSeverity, AlertStatus, ConfidenceLevel } from '../types/index.js';
import type { ExtractedEntities } from './legalEntityExtractor.js';
import { logger } from '../utils/logger.js';

/**
 * Classification result for an alert candidate.
 */
export interface AlertClassification {
  category_primary: AlertCategory;
  category_secondary?: string;
  jurisdiction: string;
  compounds: string[];
  forms: string[];
  action: string;
  severity: AlertSeverity;
  status: AlertStatus;
  confidence: number;
  confidence_level: ConfidenceLevel;
  effective_dates: string[];
  summary_ja?: string;
}

// ---------------------------------------------------------------------------
// CRITICAL RULE: Tier 4 alone CANNOT update legal status.
// Only Tier 1 triggers official_confirmed.
// ---------------------------------------------------------------------------

/**
 * Classify an alert candidate using rule-based logic + optional LLM.
 *
 * @param title - Document or section title
 * @param bodyText - Relevant text content
 * @param entities - Previously extracted entities
 * @param sourceTier - Source tier (1-5)
 */
export function classifyAlert(
  title: string,
  bodyText: string,
  entities: ExtractedEntities,
  sourceTier: number
): AlertClassification {
  const category = determineCategory(entities, bodyText);
  const action = determinePrimaryAction(entities);
  const severity = determineSeverity(entities, category, action, sourceTier);
  const status = determineStatus(sourceTier, entities);
  const confidence = calculateConfidence(sourceTier, entities);
  const confidenceLevel = determineConfidenceLevel(sourceTier);

  return {
    category_primary: category,
    jurisdiction: 'Japan',
    compounds: entities.compounds_detected,
    forms: entities.product_forms_detected,
    action,
    severity,
    status,
    confidence,
    confidence_level: confidenceLevel,
    effective_dates: entities.dates_detected
      .filter(d => d.context === 'enforcement' || d.context === 'effective')
      .map(d => d.date),
  };
}

/**
 * LLM-enhanced classification. Falls back to rule-based if no API key.
 */
export async function classifyAlertWithLLM(
  title: string,
  bodyText: string,
  entities: ExtractedEntities,
  sourceTier: number
): Promise<AlertClassification> {
  const ruleBasedResult = classifyAlert(title, bodyText, entities, sourceTier);

  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey || apiKey === 'your-api-key-here') {
    return ruleBasedResult;
  }

  try {
    const truncatedText = bodyText.slice(0, 2000);
    const prompt = `You are a Japanese regulatory intelligence classifier. Classify this regulatory content:

TITLE: ${title}
TEXT: ${truncatedText}
DETECTED ENTITIES: ${JSON.stringify(entities, null, 2)}

Categories: regulation, designated_substance, threshold, enforcement, market
Severities: critical, high, medium, low

Return ONLY valid JSON:
{
  "category_primary": "one of the categories",
  "category_secondary": "optional sub-category",
  "action": "primary regulatory action",
  "severity": "one of the severities",
  "summary_ja": "one-line Japanese summary"
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      logger.warn(`Anthropic API returned ${response.status} during classification`);
      return ruleBasedResult;
    }

    const data = await response.json() as {
      content: Array<{ type: string; text: string }>;
    };
    const text = data.content?.[0]?.text;
    if (!text) return ruleBasedResult;

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return ruleBasedResult;

    const llmResult = JSON.parse(jsonMatch[0]);

    // Merge: prefer LLM for nuanced fields, keep rule-based for safety-critical fields
    return {
      ...ruleBasedResult,
      category_primary: isValidCategory(llmResult.category_primary)
        ? llmResult.category_primary
        : ruleBasedResult.category_primary,
      category_secondary: llmResult.category_secondary,
      action: llmResult.action || ruleBasedResult.action,
      summary_ja: llmResult.summary_ja,
      // CRITICAL: status and confidence_level are NEVER overridden by LLM
      // Only source tier determines these (safety rule)
    };
  } catch (err) {
    logger.warn('LLM classification failed, using rule-based result', { error: err });
    return ruleBasedResult;
  }
}

// ---------------------------------------------------------------------------
// Rule-based determination functions
// ---------------------------------------------------------------------------

function determineCategory(entities: ExtractedEntities, bodyText: string): AlertCategory {
  const actions = entities.legal_actions_detected;

  if (actions.includes('designated_substance_addition') || actions.includes('narcotic_designation')) {
    return 'designated_substance';
  }
  if (actions.includes('thc_threshold_change')) {
    return 'threshold';
  }
  if (actions.includes('recall') || entities.risk_signals.includes('arrest_reported')) {
    return 'enforcement';
  }
  if (actions.includes('promulgation') || actions.includes('enforcement_date_confirmed')
    || actions.includes('public_comment_open') || actions.includes('use_crime')) {
    return 'regulation';
  }
  if (actions.includes('import_procedure_change')) {
    return 'market';
  }

  // Fallback: check body text
  if (/指定薬物|designated\s+substance/i.test(bodyText)) return 'designated_substance';
  if (/残留|threshold|ppm/i.test(bodyText)) return 'threshold';
  if (/逮捕|arrest|回収|recall/i.test(bodyText)) return 'enforcement';
  if (/法|regulation|省令|ordinance/i.test(bodyText)) return 'regulation';

  return 'regulation';
}

function determinePrimaryAction(entities: ExtractedEntities): string {
  const actions = entities.legal_actions_detected;

  // Priority order: most impactful actions first
  const actionPriority = [
    'narcotic_designation',
    'designated_substance_addition',
    'thc_threshold_change',
    'enforcement_date_confirmed',
    'promulgation',
    'use_crime',
    'recall',
    'import_procedure_change',
    'administrative_warning',
    'public_comment_open',
  ];

  for (const action of actionPriority) {
    if (actions.includes(action)) return action;
  }

  return actions[0] || 'regulatory_update';
}

function determineSeverity(
  entities: ExtractedEntities,
  category: AlertCategory,
  action: string,
  sourceTier: number
): AlertSeverity {
  // Emergency risk signals = critical
  const emergencySignals = ['emergency_action', 'fatality_reported', 'immediate_enforcement'];
  if (entities.risk_signals.some(s => emergencySignals.includes(s))) {
    return 'critical';
  }

  // Tier 1 + designation / narcotic = critical
  if (sourceTier === 1 && (action === 'designated_substance_addition' || action === 'narcotic_designation')) {
    return 'critical';
  }

  // THC threshold change = critical
  if (action === 'thc_threshold_change') {
    return 'critical';
  }

  // Enforcement dates within 14 days = high
  const urgentDates = entities.dates_detected.filter(d => {
    if (d.context !== 'enforcement' && d.context !== 'effective') return false;
    const daysAway = (new Date(d.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return daysAway > 0 && daysAway <= 14;
  });
  if (urgentDates.length > 0) {
    return sourceTier <= 2 ? 'critical' : 'high';
  }

  // Category-based defaults
  if (category === 'designated_substance') return sourceTier <= 2 ? 'high' : 'medium';
  if (category === 'enforcement') return 'high';
  if (category === 'threshold') return 'high';
  if (category === 'regulation') return sourceTier <= 2 ? 'medium' : 'low';
  if (category === 'market') return 'low';

  return 'medium';
}

/**
 * CRITICAL RULE: Tier 4 alone CANNOT update legal status to official_confirmed.
 * Only Tier 1 triggers official_confirmed.
 */
function determineStatus(sourceTier: number, entities: ExtractedEntities): AlertStatus {
  // Tier 1 sources (official government) → official_confirmed
  if (sourceTier === 1) {
    const hasOfficialAction = entities.legal_actions_detected.some(a =>
      ['promulgation', 'enforcement_date_confirmed', 'designated_substance_addition',
        'narcotic_designation', 'ministerial_ordinance'].includes(a)
    );
    if (hasOfficialAction) return 'official_confirmed';
    return 'verified';
  }

  // Tier 2 sources → verified
  if (sourceTier === 2) return 'verified';

  // Tier 3-5 sources → always pending (requires human review)
  return 'pending';
}

function calculateConfidence(sourceTier: number, entities: ExtractedEntities): number {
  let confidence = 0;

  // Base confidence from source tier
  switch (sourceTier) {
    case 1: confidence = 0.90; break;
    case 2: confidence = 0.75; break;
    case 3: confidence = 0.60; break;
    case 4: confidence = 0.40; break;
    case 5: confidence = 0.20; break;
  }

  // Boost confidence if multiple signals align
  if (entities.compounds_detected.length > 0) confidence += 0.02;
  if (entities.legal_actions_detected.length > 0) confidence += 0.03;
  if (entities.dates_detected.length > 0) confidence += 0.02;
  if (entities.agencies_detected.length > 0) confidence += 0.03;

  return Math.min(1.0, confidence);
}

function determineConfidenceLevel(sourceTier: number): ConfidenceLevel {
  if (sourceTier === 1) return 'official';
  if (sourceTier === 2) return 'verified';
  if (sourceTier <= 4) return 'unverified';
  return 'rumor';
}

function isValidCategory(value: unknown): value is AlertCategory {
  return typeof value === 'string' &&
    ['regulation', 'designated_substance', 'threshold', 'enforcement', 'market'].includes(value);
}
