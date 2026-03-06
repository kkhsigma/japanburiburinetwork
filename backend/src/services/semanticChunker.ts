import type { NormalizedDocument, DocumentSection } from './documentNormalizer.js';

/**
 * SemanticChunk — a meaningful unit of a legal document that can be
 * independently analyzed, compared, and extracted from.
 */
export interface SemanticChunk {
  id: string;                  // docId + chunk index
  docId: string;
  chunkIndex: number;
  chunkType: ChunkType;
  heading: string;
  content: string;
  tokenEstimate: number;       // rough token count for LLM budget
  metadata: {
    sectionIndex?: number;
    tableRowIndex?: number;
    articleNumber?: string;
    clauseNumber?: string;
  };
}

export type ChunkType =
  | 'article'           // Legal article (第X条)
  | 'clause'            // Sub-clause (第X項)
  | 'table_entry'       // Single table row (e.g., designated substance entry)
  | 'notice'            // Government notice / announcement
  | 'faq_item'          // FAQ question-answer pair
  | 'heading_section'   // Section under a heading
  | 'annotation'        // Annotation / footnote block
  | 'paragraph'         // General paragraph
  | 'list_block';       // Bulleted / numbered list

// Max tokens per chunk (to stay within LLM context window budget)
const MAX_CHUNK_TOKENS = 800;
const AVG_CHARS_PER_TOKEN_JA = 1.5;  // Japanese uses ~1.5 chars per token
const AVG_CHARS_PER_TOKEN_EN = 4;

/**
 * Split a normalized document into semantic chunks.
 */
export function chunkDocument(doc: NormalizedDocument): SemanticChunk[] {
  const chunks: SemanticChunk[] = [];
  let chunkIndex = 0;

  // 1. Chunk table rows individually (critical for designated substances list)
  if (doc.tables.length > 0) {
    for (let rowIdx = 0; rowIdx < doc.tables.length; rowIdx++) {
      const row = doc.tables[rowIdx];
      const content = row.join(' | ');
      chunks.push({
        id: `${doc.docId}_table_${rowIdx}`,
        docId: doc.docId,
        chunkIndex: chunkIndex++,
        chunkType: 'table_entry',
        heading: `Table Row ${rowIdx + 1}`,
        content,
        tokenEstimate: estimateTokens(content, doc.language),
        metadata: { tableRowIndex: rowIdx },
      });
    }
  }

  // 2. Chunk document sections
  for (const section of doc.sections) {
    const sectionChunks = chunkSection(section, doc.docId, doc.language, chunkIndex);
    chunks.push(...sectionChunks);
    chunkIndex += sectionChunks.length;
  }

  return chunks;
}

/**
 * Chunk a single document section. If the section is too large,
 * split it into sub-chunks at natural boundaries.
 */
function chunkSection(
  section: DocumentSection,
  docId: string,
  language: string,
  startIndex: number
): SemanticChunk[] {
  const chunks: SemanticChunk[] = [];
  const content = section.content.trim();
  if (!content) return chunks;

  const chunkType = classifyChunkType(section.heading, content);
  const tokens = estimateTokens(content, language);

  // If small enough, return as single chunk
  if (tokens <= MAX_CHUNK_TOKENS) {
    chunks.push({
      id: `${docId}_sec_${startIndex}`,
      docId,
      chunkIndex: startIndex,
      chunkType,
      heading: section.heading,
      content,
      tokenEstimate: tokens,
      metadata: {
        sectionIndex: section.index,
        articleNumber: extractArticleNumber(section.heading),
        clauseNumber: extractClauseNumber(section.heading),
      },
    });
    return chunks;
  }

  // Split large sections at natural boundaries
  const subChunks = splitAtBoundaries(content, language);
  for (let i = 0; i < subChunks.length; i++) {
    const subContent = subChunks[i].trim();
    if (!subContent) continue;

    chunks.push({
      id: `${docId}_sec_${startIndex + i}`,
      docId,
      chunkIndex: startIndex + i,
      chunkType,
      heading: `${section.heading} (part ${i + 1})`,
      content: subContent,
      tokenEstimate: estimateTokens(subContent, language),
      metadata: {
        sectionIndex: section.index,
        articleNumber: extractArticleNumber(section.heading),
      },
    });
  }

  return chunks;
}

/**
 * Split text at natural boundaries (paragraph breaks, numbered items,
 * bullet points) to stay under the token limit.
 */
function splitAtBoundaries(text: string, language: string): string[] {
  const maxChars = MAX_CHUNK_TOKENS * (language === 'ja' ? AVG_CHARS_PER_TOKEN_JA : AVG_CHARS_PER_TOKEN_EN);

  // First try splitting on double newlines (paragraphs)
  const paragraphs = text.split(/\n\n+/);
  const chunks: string[] = [];
  let current = '';

  for (const para of paragraphs) {
    if ((current + '\n\n' + para).length > maxChars && current.length > 0) {
      chunks.push(current);
      current = para;
    } else {
      current = current ? current + '\n\n' + para : para;
    }
  }
  if (current) chunks.push(current);

  // If any chunk is still too large, split on single newlines
  const result: string[] = [];
  for (const chunk of chunks) {
    if (estimateTokens(chunk, language) <= MAX_CHUNK_TOKENS) {
      result.push(chunk);
    } else {
      const lines = chunk.split('\n');
      let acc = '';
      for (const line of lines) {
        if ((acc + '\n' + line).length > maxChars && acc.length > 0) {
          result.push(acc);
          acc = line;
        } else {
          acc = acc ? acc + '\n' + line : line;
        }
      }
      if (acc) result.push(acc);
    }
  }

  return result;
}

/**
 * Classify the type of chunk based on heading and content patterns.
 */
function classifyChunkType(heading: string, content: string): ChunkType {
  // Japanese legal articles
  if (/^第[一二三四五六七八九十百千\d]+条/.test(heading)) return 'article';
  if (/^第[一二三四五六七八九十百千\d]+項/.test(heading)) return 'clause';

  // FAQ patterns
  if (/^[QＱ][.．:\s\d]/.test(heading) || /^問[\d０-９]/.test(heading)) return 'faq_item';

  // Notice patterns
  if (/通知|通達|告示|お知らせ/.test(heading)) return 'notice';

  // Annotation patterns
  if (/注[）)\d]|※|附則/.test(heading)) return 'annotation';

  // List patterns in content
  if (/^[\s]*[・•‣▸]\s/m.test(content) || /^[\s]*[-–]\s/m.test(content)) return 'list_block';

  return 'heading_section';
}

/**
 * Estimate token count for text. Japanese text uses roughly 1.5 chars per token.
 */
function estimateTokens(text: string, language: string): number {
  const charsPerToken = language === 'ja' ? AVG_CHARS_PER_TOKEN_JA : AVG_CHARS_PER_TOKEN_EN;
  return Math.ceil(text.length / charsPerToken);
}

/**
 * Extract article number from heading text (e.g., "第3条" -> "3").
 */
function extractArticleNumber(heading: string): string | undefined {
  const match = heading.match(/第([一二三四五六七八九十百千\d]+)条/);
  return match ? match[1] : undefined;
}

/**
 * Extract clause number from heading text (e.g., "第2項" -> "2").
 */
function extractClauseNumber(heading: string): string | undefined {
  const match = heading.match(/第([一二三四五六七八九十百千\d]+)項/);
  return match ? match[1] : undefined;
}

/**
 * Merge small adjacent chunks that are below a minimum size threshold.
 */
export function mergeSmallChunks(chunks: SemanticChunk[], minTokens: number = 50): SemanticChunk[] {
  if (chunks.length <= 1) return chunks;

  const merged: SemanticChunk[] = [];
  let current = chunks[0];

  for (let i = 1; i < chunks.length; i++) {
    const next = chunks[i];
    if (current.tokenEstimate < minTokens && current.chunkType === next.chunkType) {
      // Merge into current
      current = {
        ...current,
        content: current.content + '\n\n' + next.content,
        tokenEstimate: current.tokenEstimate + next.tokenEstimate,
        heading: current.heading,
      };
    } else {
      merged.push(current);
      current = next;
    }
  }
  merged.push(current);

  return merged;
}
