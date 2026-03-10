import { executeSearch } from './searchService.js';
import type { CategorizedSearchResults, SearchResultItem } from './searchService.js';
import { logger } from '../utils/logger.js';

/* ------------------------------------------------------------------ */
/*  Stop-word filter for better context retrieval                      */
/* ------------------------------------------------------------------ */

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for',
  'on', 'with', 'at', 'by', 'from', 'as', 'into', 'about', 'between',
  'through', 'during', 'before', 'after', 'above', 'below', 'up', 'down',
  'and', 'but', 'or', 'nor', 'not', 'so', 'yet', 'both', 'either',
  'neither', 'each', 'every', 'all', 'any', 'few', 'more', 'most',
  'other', 'some', 'such', 'no', 'only', 'own', 'same', 'than', 'too',
  'very', 'just', 'because', 'if', 'when', 'where', 'how', 'what',
  'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'it', 'its',
  'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'she', 'they', 'them',
  'tell', 'please', 'know', 'think', 'want', 'need', 'like',
]);

/**
 * Extract meaningful search terms from a natural language question.
 * Removes stop words so that "Is CBD legal in Japan?" becomes "CBD legal Japan".
 */
function extractSearchTerms(question: string): string {
  return question
    .replace(/[?!.,;:'"()\[\]{}]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w.toLowerCase()))
    .join(' ');
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface AskJbnRequest {
  query: string;
  language: 'en' | 'ja';
}

export interface AskJbnResponse {
  answer: string;
  context: CategorizedSearchResults;
}

export interface AskJbnStreamResponse {
  stream: ReadableStream<Uint8Array>;
  context: CategorizedSearchResults;
}

/* ------------------------------------------------------------------ */
/*  Context builder                                                    */
/* ------------------------------------------------------------------ */

/**
 * Format categorized search results into a readable context string
 * for the LLM, using [Compound-1], [Alert-2] style labels.
 */
export function buildContext(results: CategorizedSearchResults): string {
  const sections: string[] = [];

  const formatItems = (items: SearchResultItem[], label: string): string => {
    return items
      .map((item, i) => {
        const ref = `[${label}-${i + 1}]`;
        const meta = Object.entries(item.metadata)
          .filter(([, v]) => v != null)
          .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
          .join(', ');
        return `${ref} ${item.title}${item.subtitle ? ` (${item.subtitle})` : ''}${meta ? `\n  ${meta}` : ''}`;
      })
      .join('\n');
  };

  if (results.compounds.length > 0) {
    sections.push(`=== Compounds ===\n${formatItems(results.compounds, 'Compound')}`);
  }
  if (results.alerts.length > 0) {
    sections.push(`=== Alerts ===\n${formatItems(results.alerts, 'Alert')}`);
  }
  if (results.thc_regulations.length > 0) {
    sections.push(`=== THC Regulations ===\n${formatItems(results.thc_regulations, 'Regulation')}`);
  }
  if (results.government_notices.length > 0) {
    sections.push(`=== Government Notices ===\n${formatItems(results.government_notices, 'Notice')}`);
  }
  if (results.designated_substances.length > 0) {
    sections.push(`=== Designated Substances ===\n${formatItems(results.designated_substances, 'Substance')}`);
  }
  if (results.sources.length > 0) {
    sections.push(`=== Sources ===\n${formatItems(results.sources, 'Source')}`);
  }

  if (sections.length === 0) {
    return 'No relevant data found in the JBN database for this query.';
  }

  return sections.join('\n\n');
}

/* ------------------------------------------------------------------ */
/*  System prompt                                                      */
/* ------------------------------------------------------------------ */

export function getSystemPrompt(language: 'en' | 'ja'): string {
  const langInstruction = language === 'ja'
    ? 'Respond entirely in Japanese.'
    : 'Respond entirely in English.';

  return `You are JBN AI, the intelligent assistant for Japan Buri Buri Network — a regulatory intelligence platform tracking Japanese cannabinoid and psychoactive substance regulations.

Rules you MUST follow:
1. Answer ONLY based on the provided context data. Do not use outside knowledge.
2. Cite your sources using reference labels like [Compound-1], [Alert-2], [Regulation-1], [Notice-1], [Substance-1], [Source-1].
3. Be precise about legal statuses, enforcement dates, and regulatory details.
4. If the context data might be outdated, explicitly warn the user.
5. NEVER provide legal advice. Always include a disclaimer that this is informational only, not legal counsel.
6. If the context does not contain enough information to answer the question, say so clearly.
7. ${langInstruction}`;
}

/* ------------------------------------------------------------------ */
/*  Non-streaming ask                                                  */
/* ------------------------------------------------------------------ */

/**
 * Answer a user question using search results as context + Claude LLM.
 * Falls back to a static message if no LLM_API_KEY is configured.
 */
export async function askJbn(request: AskJbnRequest): Promise<AskJbnResponse> {
  const { query, language } = request;
  const searchTerms = extractSearchTerms(query) || query;

  const context = await executeSearch(searchTerms, 15);
  const contextStr = buildContext(context);

  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey || apiKey === 'your-api-key-here') {
    return {
      answer: language === 'ja'
        ? 'AI機能は現在利用できません。LLM APIキーが設定されていません。検索結果をご確認ください。'
        : 'AI answering is currently unavailable. No LLM API key is configured. Please review the search results below.',
      context,
    };
  }

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
        system: getSystemPrompt(language),
        messages: [
          {
            role: 'user',
            content: `Context from JBN database:\n${contextStr}\n\nUser question: ${query}`,
          },
        ],
      }),
      signal: AbortSignal.timeout(60_000),
    });

    if (!response.ok) {
      logger.warn(`Anthropic API returned ${response.status} during Ask JBN`);
      return {
        answer: language === 'ja'
          ? 'AI応答の生成中にエラーが発生しました。検索結果をご確認ください。'
          : 'An error occurred while generating the AI response. Please review the search results below.',
        context,
      };
    }

    const data = await response.json() as {
      content: Array<{ type: string; text: string }>;
    };
    const answer = data.content?.[0]?.text || '';

    return { answer, context };
  } catch (err) {
    logger.warn('Ask JBN LLM call failed', { error: err });
    return {
      answer: language === 'ja'
        ? 'AI応答の生成中にエラーが発生しました。検索結果をご確認ください。'
        : 'An error occurred while generating the AI response. Please review the search results below.',
      context,
    };
  }
}

/* ------------------------------------------------------------------ */
/*  Streaming ask                                                      */
/* ------------------------------------------------------------------ */

/**
 * Stream an answer using the Anthropic streaming API.
 * Returns the raw response body stream for SSE forwarding.
 */
export async function askJbnStream(request: AskJbnRequest): Promise<AskJbnStreamResponse> {
  const { query, language } = request;
  const searchTerms = extractSearchTerms(query) || query;

  const context = await executeSearch(searchTerms, 15);
  const contextStr = buildContext(context);

  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey || apiKey === 'your-api-key-here') {
    throw new Error('LLM_API_KEY is not configured');
  }

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
      stream: true,
      system: getSystemPrompt(language),
      messages: [
        {
          role: 'user',
          content: `Context from JBN database:\n${contextStr}\n\nUser question: ${query}`,
        },
      ],
    }),
    signal: AbortSignal.timeout(60_000),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Anthropic API returned ${response.status}: ${errorText}`);
  }

  if (!response.body) {
    throw new Error('No response body from Anthropic API');
  }

  return { stream: response.body as ReadableStream<Uint8Array>, context };
}
