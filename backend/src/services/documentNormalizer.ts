import crypto from 'crypto';
import type { FetchedContent } from './sourceFetcher.js';

/**
 * NormalizedDocument — the common schema all source types are converted to.
 * This is the canonical internal representation used by the diff engine,
 * entity extractor, and chunker.
 */
export interface NormalizedDocument {
  docId: string;
  sourceName: string;
  sourceTier: number;
  fetchedAt: string;       // ISO 8601
  publishedAt: string | null;
  title: string;
  bodyText: string;
  canonicalUrl: string;
  contentType: string;
  language: string;
  rawHash: string;
  sections: DocumentSection[];
  tables: string[][];
  metadata: Record<string, unknown>;
}

export interface DocumentSection {
  heading: string;
  content: string;
  level: number;        // heading depth (1 = h1, etc.)
  index: number;
}

/**
 * Normalize fetched content into the common document schema.
 */
export function normalizeDocument(
  content: FetchedContent,
  docId: string
): NormalizedDocument {
  const bodyText = cleanText(content.bodyText);
  const sections = extractSections(bodyText);
  const tables = extractTables(content.rawHtml || content.bodyText);

  return {
    docId,
    sourceName: content.sourceName,
    sourceTier: parseInt(content.tier, 10),
    fetchedAt: content.fetchedAt.toISOString(),
    publishedAt: content.publishedAt?.toISOString() || null,
    title: content.title.trim(),
    bodyText,
    canonicalUrl: content.url,
    contentType: content.contentType,
    language: content.language,
    rawHash: content.rawHash,
    sections,
    tables,
    metadata: content.metadata || {},
  };
}

/**
 * Clean raw text: normalize whitespace, remove zero-width chars, etc.
 */
function cleanText(text: string): string {
  return text
    // Remove zero-width and invisible characters
    .replace(/[\u200B-\u200D\uFEFF\u00AD]/g, '')
    // Normalize multiple whitespace to single spaces
    .replace(/[ \t]+/g, ' ')
    // Normalize multiple newlines to double newlines (paragraph breaks)
    .replace(/\n{3,}/g, '\n\n')
    // Trim each line
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .trim();
}

/**
 * Extract sections from body text by detecting heading-like patterns.
 * Works for both HTML-extracted text and PDF text.
 */
function extractSections(text: string): DocumentSection[] {
  const sections: DocumentSection[] = [];
  const lines = text.split('\n');

  let currentHeading = '(Document Start)';
  let currentLevel = 1;
  let currentContent: string[] = [];
  let sectionIndex = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      currentContent.push('');
      continue;
    }

    // Detect heading patterns
    const headingMatch = detectHeading(trimmed);
    if (headingMatch) {
      // Save previous section
      if (currentContent.length > 0) {
        sections.push({
          heading: currentHeading,
          content: currentContent.join('\n').trim(),
          level: currentLevel,
          index: sectionIndex++,
        });
      }
      currentHeading = headingMatch.text;
      currentLevel = headingMatch.level;
      currentContent = [];
    } else {
      currentContent.push(trimmed);
    }
  }

  // Save last section
  if (currentContent.length > 0 || sections.length === 0) {
    sections.push({
      heading: currentHeading,
      content: currentContent.join('\n').trim(),
      level: currentLevel,
      index: sectionIndex,
    });
  }

  return sections;
}

/**
 * Detect heading patterns in Japanese legal / government documents.
 */
function detectHeading(line: string): { text: string; level: number } | null {
  // Japanese article numbering: 第X条, 第X項
  if (/^第[一二三四五六七八九十百千\d]+[条章節項]/.test(line)) {
    return { text: line, level: 2 };
  }

  // Numbered sections: 1., 2., (1), (2), etc.
  if (/^[\d０-９]+[.．]\s/.test(line) && line.length < 120) {
    return { text: line, level: 3 };
  }
  if (/^[（(][\d０-９]+[）)]\s/.test(line) && line.length < 120) {
    return { text: line, level: 4 };
  }

  // Short all-caps or all-katakana lines that look like headings
  if (line.length < 60 && /^[A-Z\s]+$/.test(line) && line.length > 3) {
    return { text: line, level: 2 };
  }

  // Lines ending with common heading markers
  if (line.length < 80 && /(?:について|に関する|の件|概要|目的|定義|適用範囲)$/.test(line)) {
    return { text: line, level: 2 };
  }

  return null;
}

/**
 * Extract table data from HTML content.
 * Returns array of rows, each row being an array of cell strings.
 */
function extractTables(htmlOrText: string): string[][] {
  // Simple regex-based table extraction (for HTML)
  const rows: string[][] = [];

  // Match <tr>...</tr> blocks
  const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let trMatch;
  while ((trMatch = trRegex.exec(htmlOrText)) !== null) {
    const rowContent = trMatch[1];
    const cells: string[] = [];
    const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
    let cellMatch;
    while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
      // Strip HTML tags from cell content
      const cellText = cellMatch[1].replace(/<[^>]+>/g, '').trim();
      cells.push(cellText);
    }
    if (cells.length > 0) {
      rows.push(cells);
    }
  }

  return rows;
}

/**
 * Compute a normalized hash for content comparison.
 * Unlike rawHash, this ignores formatting differences.
 */
export function computeNormalizedHash(text: string): string {
  const normalized = text
    .replace(/\s+/g, ' ')
    .replace(/[、。！？,.\s]/g, '')
    .toLowerCase()
    .trim();
  return crypto.createHash('sha256').update(normalized).digest('hex');
}
