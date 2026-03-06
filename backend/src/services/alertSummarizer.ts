import type { AlertClassification } from './alertClassifier.js';
import type { ExtractedEntities } from './legalEntityExtractor.js';
import { logger } from '../utils/logger.js';

/**
 * Alert summary — the "decision card" shown to users.
 * Answers: What changed / Why / Who is affected.
 */
export interface AlertSummary {
  summary_what: string;
  summary_why: string;
  summary_who: string;
  diff_before: string;
  diff_after: string;
  diff_type: string;
}

// ---------------------------------------------------------------------------
// Rule-based summarizer — generates summaries from structured data
// ---------------------------------------------------------------------------

/**
 * Generate an alert summary from classification and entity data.
 * Uses rule-based templates when no LLM is available.
 */
export function generateSummary(
  title: string,
  bodyText: string,
  classification: AlertClassification,
  entities: ExtractedEntities
): AlertSummary {
  const summaryWhat = generateWhatChanged(title, classification, entities);
  const summaryWhy = generateWhyItMatters(classification, entities);
  const summaryWho = generateWhoAffected(classification, entities);
  const { diffBefore, diffAfter, diffType } = generateDiffPair(classification, entities);

  return {
    summary_what: summaryWhat,
    summary_why: summaryWhy,
    summary_who: summaryWho,
    diff_before: diffBefore,
    diff_after: diffAfter,
    diff_type: diffType,
  };
}

/**
 * LLM-enhanced summary generation.
 */
export async function generateSummaryWithLLM(
  title: string,
  bodyText: string,
  classification: AlertClassification,
  entities: ExtractedEntities
): Promise<AlertSummary> {
  const ruleBasedSummary = generateSummary(title, bodyText, classification, entities);

  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey || apiKey === 'your-api-key-here') {
    return ruleBasedSummary;
  }

  try {
    const truncatedText = bodyText.slice(0, 2000);
    const prompt = `You are a Japanese regulatory intelligence summarizer for the cannabinoid market. Generate a clear, factual alert summary.

TITLE: ${title}
CLASSIFICATION: ${JSON.stringify(classification)}
TEXT EXCERPT: ${truncatedText}

Generate THREE concise summaries (in English, professional tone):
1. "What Changed" - Factual description of the regulatory change (1-2 sentences)
2. "Why It Matters" - Business and consumer impact (1-2 sentences)
3. "Who Is Affected" - Specific groups impacted (1 sentence)

Also generate a before/after comparison pair.

Return ONLY valid JSON:
{
  "summary_what": "...",
  "summary_why": "...",
  "summary_who": "...",
  "diff_before": "previous state",
  "diff_after": "new state"
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
      logger.warn(`Anthropic API returned ${response.status} during summarization`);
      return ruleBasedSummary;
    }

    const data = await response.json() as {
      content: Array<{ type: string; text: string }>;
    };
    const text = data.content?.[0]?.text;
    if (!text) return ruleBasedSummary;

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return ruleBasedSummary;

    const llmResult = JSON.parse(jsonMatch[0]);

    return {
      summary_what: llmResult.summary_what || ruleBasedSummary.summary_what,
      summary_why: llmResult.summary_why || ruleBasedSummary.summary_why,
      summary_who: llmResult.summary_who || ruleBasedSummary.summary_who,
      diff_before: llmResult.diff_before || ruleBasedSummary.diff_before,
      diff_after: llmResult.diff_after || ruleBasedSummary.diff_after,
      diff_type: ruleBasedSummary.diff_type,
    };
  } catch (err) {
    logger.warn('LLM summarization failed, using rule-based summary', { error: err });
    return ruleBasedSummary;
  }
}

// ---------------------------------------------------------------------------
// Template-based summary generators
// ---------------------------------------------------------------------------

function generateWhatChanged(
  title: string,
  classification: AlertClassification,
  entities: ExtractedEntities
): string {
  const compounds = classification.compounds.length > 0
    ? classification.compounds.join(', ')
    : 'cannabinoid substances';

  const dates = entities.dates_detected
    .filter(d => d.context === 'enforcement' || d.context === 'effective')
    .map(d => d.date);
  const dateStr = dates.length > 0 ? ` effective ${dates[0]}` : '';

  switch (classification.action) {
    case 'designated_substance_addition':
      return `${compounds} ${classification.compounds.length === 1 ? 'has' : 'have'} been designated as controlled substance(s) (Shitei Yakubutsu)${dateStr}. Possession, sale, and import will become criminal offenses.`;

    case 'narcotic_designation':
      return `${compounds} ${classification.compounds.length === 1 ? 'has' : 'have'} been classified as narcotic(s)${dateStr}. This is the highest level of substance control in Japan.`;

    case 'thc_threshold_change':
      return `THC residual limits for cannabis-derived products have been updated${dateStr}. Products exceeding new limits will be classified as narcotics.`;

    case 'enforcement_date_confirmed':
      return `Enforcement date confirmed${dateStr} for regulatory changes affecting ${compounds}.`;

    case 'promulgation':
      return `New regulation officially promulgated${dateStr} affecting ${compounds}.`;

    case 'use_crime':
      return `"Use crimes" (使用罪) for ${compounds} are now enforceable${dateStr}. Using these substances is now a criminal offense.`;

    case 'recall':
      return `Product recall issued for items containing ${compounds}. ${entities.risk_signals.includes('health_incident') ? 'Health incidents have been reported.' : ''}`;

    case 'import_procedure_change':
      return `Import procedures for ${compounds} products have been modified${dateStr}. Importers must comply with updated requirements.`;

    case 'administrative_warning':
      return `Administrative warning issued regarding ${compounds}. Regulatory attention has increased.`;

    case 'public_comment_open':
      return `Public comment period opened for proposed regulations affecting ${compounds}.${dates.length > 0 ? ` Comments accepted until ${dates[0]}.` : ''}`;

    default:
      return title || `Regulatory update affecting ${compounds}.`;
  }
}

function generateWhyItMatters(
  classification: AlertClassification,
  entities: ExtractedEntities
): string {
  const riskSignals = entities.risk_signals;

  switch (classification.action) {
    case 'designated_substance_addition':
    case 'narcotic_designation':
      return 'Products containing these substances must be immediately removed from sale. Existing inventory becomes illegal to possess. Importers and retailers face criminal liability.';

    case 'thc_threshold_change':
      return 'Products exceeding the new THC limits are legally classified as narcotics. All importers and manufacturers must verify compliance through certified testing.';

    case 'enforcement_date_confirmed':
      return 'The enforcement deadline is confirmed. All affected parties must complete compliance preparations before this date.';

    case 'use_crime':
      return 'Previously, using cannabis was not explicitly criminalized in Japan (only possession). This closes a long-standing legal gap and significantly increases legal risk for consumers.';

    case 'recall':
      if (riskSignals.includes('health_incident') || riskSignals.includes('hospitalization_reported')) {
        return 'Health incidents have been reported. Consumer safety is at risk. Affected products must be immediately removed from market.';
      }
      return 'Affected products must be removed from sale. Retailers should check inventory against recall notices.';

    case 'public_comment_open':
      return 'This is an opportunity for industry stakeholders to provide input on proposed regulations. Comments may influence the final scope and timeline.';

    default:
      return 'This regulatory change may affect the legality, import procedures, or market availability of affected substances and products in Japan.';
  }
}

function generateWhoAffected(
  classification: AlertClassification,
  _entities: ExtractedEntities
): string {
  const groups: string[] = [];

  switch (classification.category_primary) {
    case 'designated_substance':
    case 'regulation':
      groups.push('consumers', 'retailers', 'importers', 'manufacturers');
      break;
    case 'threshold':
      groups.push('CBD/cannabinoid product importers', 'manufacturers', 'retailers');
      break;
    case 'enforcement':
      groups.push('retailers', 'consumers', 'distributors');
      break;
    case 'market':
      groups.push('importers', 'product manufacturers', 'brands');
      break;
  }

  if (classification.forms.length > 0) {
    const formStr = classification.forms.join(', ');
    return `All ${groups.join(', ')} handling ${formStr} products in Japan.`;
  }

  return `All ${groups.join(', ')} of cannabinoid products in Japan.`;
}

function generateDiffPair(
  classification: AlertClassification,
  entities: ExtractedEntities
): { diffBefore: string; diffAfter: string; diffType: string } {
  const compounds = classification.compounds.join(', ') || 'affected substances';

  switch (classification.action) {
    case 'designated_substance_addition':
      return {
        diffBefore: `${compounds}: Not designated`,
        diffAfter: `${compounds}: Designated Substance (Shitei Yakubutsu)`,
        diffType: 'status',
      };

    case 'narcotic_designation':
      return {
        diffBefore: `${compounds}: Legal / Under review`,
        diffAfter: `${compounds}: Narcotic (controlled substance)`,
        diffType: 'status',
      };

    case 'thc_threshold_change':
      return {
        diffBefore: 'THC limits: Previous limits or none',
        diffAfter: 'THC limits: Updated (see details)',
        diffType: 'threshold',
      };

    case 'enforcement_date_confirmed':
      const dateStr = entities.dates_detected
        .filter(d => d.context === 'enforcement')
        .map(d => d.date)[0] || 'TBD';
      return {
        diffBefore: `Enforcement date: Not confirmed`,
        diffAfter: `Enforcement date: ${dateStr}`,
        diffType: 'date',
      };

    case 'use_crime':
      return {
        diffBefore: `Cannabis "use": Not criminalized`,
        diffAfter: `Cannabis "use": Criminal offense (使用罪)`,
        diffType: 'status',
      };

    case 'recall':
      return {
        diffBefore: `${compounds} products: On sale`,
        diffAfter: `${compounds} products: Recalled`,
        diffType: 'status',
      };

    default:
      return {
        diffBefore: 'Previous state',
        diffAfter: 'Updated state',
        diffType: 'text',
      };
  }
}
