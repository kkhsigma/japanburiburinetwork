import * as cheerio from 'cheerio';
import crypto from 'crypto';
import { pool } from '../db/index.js';
import { logger } from '../utils/logger.js';

// Types for fetched content
export interface FetchedContent {
  sourceId: string;
  sourceName: string;
  sourceType: string;
  tier: string;
  url: string;
  title: string;
  bodyText: string;
  rawHtml?: string;
  contentType: string;
  rawHash: string;
  fetchedAt: Date;
  publishedAt?: Date;
  language: string;
  metadata?: Record<string, unknown>;
}

export interface FetchResult {
  success: boolean;
  content?: FetchedContent;
  error?: string;
  unchanged?: boolean;
}

// ---------------------------------------------------------------------------
// HTML Fetcher — uses cheerio to parse static HTML pages
// ---------------------------------------------------------------------------
export async function fetchHtmlSource(
  sourceId: string,
  sourceName: string,
  url: string,
  tier: string,
  previousHash?: string
): Promise<FetchResult> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'JBN-RegIntel/1.0 (Regulatory Intelligence Bot)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'ja,en;q=0.5',
      },
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }

    const html = await response.text();
    const rawHash = crypto.createHash('sha256').update(html).digest('hex');

    // Quick check: if hash matches previous, content is unchanged
    if (previousHash && rawHash === previousHash) {
      return { success: true, unchanged: true };
    }

    const $ = cheerio.load(html);

    // Remove script/style tags
    $('script, style, noscript, nav, footer, header').remove();

    // Extract title
    const title = $('title').text().trim()
      || $('h1').first().text().trim()
      || sourceName;

    // Extract main content body text
    const bodyText = extractMainContent($);

    // Try to extract published date from common meta tags
    const publishedAt = extractPublishedDate($);

    return {
      success: true,
      content: {
        sourceId,
        sourceName,
        sourceType: 'official_html',
        tier,
        url,
        title,
        bodyText,
        rawHtml: html,
        contentType: 'text/html',
        rawHash,
        fetchedAt: new Date(),
        publishedAt,
        language: 'ja',
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`HTML fetch failed for ${url}: ${message}`);
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// PDF Fetcher — downloads PDF and extracts text via pdf-parse
// ---------------------------------------------------------------------------
export async function fetchPdfSource(
  sourceId: string,
  sourceName: string,
  url: string,
  tier: string,
  previousHash?: string
): Promise<FetchResult> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'JBN-RegIntel/1.0 (Regulatory Intelligence Bot)',
        'Accept': 'application/pdf',
      },
      signal: AbortSignal.timeout(60_000),
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const rawHash = crypto.createHash('sha256').update(buffer).digest('hex');

    if (previousHash && rawHash === previousHash) {
      return { success: true, unchanged: true };
    }

    // Dynamic import pdf-parse (CommonJS module)
    const pdfParse = (await import('pdf-parse')).default;
    const pdfData = await pdfParse(buffer);

    const bodyText = pdfData.text || '';
    const title = pdfData.info?.Title || sourceName;

    return {
      success: true,
      content: {
        sourceId,
        sourceName,
        sourceType: 'official_pdf',
        tier,
        url,
        title,
        bodyText,
        contentType: 'application/pdf',
        rawHash,
        fetchedAt: new Date(),
        language: 'ja',
        metadata: {
          pageCount: pdfData.numpages,
          pdfInfo: pdfData.info,
        },
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`PDF fetch failed for ${url}: ${message}`);
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// RSS Fetcher — parses RSS/Atom feeds
// ---------------------------------------------------------------------------
export async function fetchRssSource(
  sourceId: string,
  sourceName: string,
  url: string,
  tier: string
): Promise<FetchResult> {
  try {
    const RssParser = (await import('rss-parser')).default;
    const parser = new RssParser({
      timeout: 30_000,
      headers: {
        'User-Agent': 'JBN-RegIntel/1.0 (Regulatory Intelligence Bot)',
      },
    });

    const feed = await parser.parseURL(url);

    // Combine all items into body text
    const items = (feed.items || []).slice(0, 20);
    const bodyText = items
      .map(item => `[${item.pubDate || ''}] ${item.title || ''}\n${item.contentSnippet || item.content || ''}`)
      .join('\n\n---\n\n');

    const rawHash = crypto.createHash('sha256').update(bodyText).digest('hex');
    const title = feed.title || sourceName;

    return {
      success: true,
      content: {
        sourceId,
        sourceName,
        sourceType: 'rss_feed',
        tier,
        url,
        title,
        bodyText,
        contentType: 'application/rss+xml',
        rawHash,
        fetchedAt: new Date(),
        publishedAt: feed.lastBuildDate ? new Date(feed.lastBuildDate) : undefined,
        language: 'ja',
        metadata: {
          feedTitle: feed.title,
          itemCount: items.length,
          items: items.map(i => ({
            title: i.title,
            link: i.link,
            pubDate: i.pubDate,
          })),
        },
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`RSS fetch failed for ${url}: ${message}`);
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Unified fetch dispatcher — routes to the correct fetcher by source type
// ---------------------------------------------------------------------------
export async function fetchSource(source: {
  id: string;
  name: string;
  url: string;
  source_type: string;
  tier: string;
}): Promise<FetchResult> {
  // Get the previous document hash for change detection
  const prevDoc = await pool.query(
    `SELECT raw_hash FROM documents
     WHERE source_id = $1
     ORDER BY fetched_at DESC LIMIT 1`,
    [source.id]
  );
  const previousHash = prevDoc.rows[0]?.raw_hash as string | undefined;

  switch (source.source_type) {
    case 'official_html':
    case 'committee_page':
    case 'news_article':
    case 'industry_article':
    case 'product_page':
    case 'review_page':
      return fetchHtmlSource(source.id, source.name, source.url, source.tier, previousHash);

    case 'official_pdf':
      return fetchPdfSource(source.id, source.name, source.url, source.tier, previousHash);

    case 'rss_feed':
      return fetchRssSource(source.id, source.name, source.url, source.tier);

    default:
      return { success: false, error: `Unknown source type: ${source.source_type}` };
  }
}

// ---------------------------------------------------------------------------
// Store fetched content as a document snapshot in the database
// ---------------------------------------------------------------------------
export async function storeDocument(content: FetchedContent): Promise<string> {
  const result = await pool.query(
    `INSERT INTO documents (source_id, fetched_at, published_at, title, body_text, canonical_url, content_type, language, raw_hash, metadata_json)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id`,
    [
      content.sourceId,
      content.fetchedAt,
      content.publishedAt || null,
      content.title,
      content.bodyText,
      content.url,
      content.contentType,
      content.language,
      content.rawHash,
      content.metadata ? JSON.stringify(content.metadata) : null,
    ]
  );

  // Update last_fetched_at on the source
  await pool.query(
    'UPDATE sources SET last_fetched_at = $1 WHERE id = $2',
    [content.fetchedAt, content.sourceId]
  );

  return result.rows[0].id;
}

// ---------------------------------------------------------------------------
// Helper: extract main content from cheerio-parsed HTML
// ---------------------------------------------------------------------------
function extractMainContent($: cheerio.CheerioAPI): string {
  // Try common content selectors (Japanese government sites)
  const selectors = [
    'main',
    '#content',
    '#main-content',
    '.main-content',
    'article',
    '.contents',
    '#contents',
    '.content-body',
    '#honbun',        // common in Japanese gov sites
    '.honbun',
  ];

  for (const sel of selectors) {
    const el = $(sel);
    if (el.length > 0 && el.text().trim().length > 100) {
      return el.text().replace(/\s+/g, ' ').trim();
    }
  }

  // Fallback: get body text
  return $('body').text().replace(/\s+/g, ' ').trim();
}

// ---------------------------------------------------------------------------
// Helper: extract published date from meta tags
// ---------------------------------------------------------------------------
function extractPublishedDate($: cheerio.CheerioAPI): Date | undefined {
  const candidates = [
    $('meta[property="article:published_time"]').attr('content'),
    $('meta[name="date"]').attr('content'),
    $('meta[name="DC.date"]').attr('content'),
    $('time[datetime]').first().attr('datetime'),
  ];

  for (const candidate of candidates) {
    if (candidate) {
      const d = new Date(candidate);
      if (!isNaN(d.getTime())) return d;
    }
  }

  return undefined;
}
