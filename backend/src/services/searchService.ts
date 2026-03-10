import { pool } from '../db/index.js';
import { logger } from '../utils/logger.js';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface SearchResultItem {
  id: string;
  type: 'compound' | 'alert' | 'thc_regulation' | 'source' | 'government_notice' | 'designated_substance';
  title: string;
  subtitle: string | null;
  rank: number;
  metadata: Record<string, unknown>;
}

export interface CategorizedSearchResults {
  compounds: SearchResultItem[];
  alerts: SearchResultItem[];
  thc_regulations: SearchResultItem[];
  sources: SearchResultItem[];
  government_notices: SearchResultItem[];
  designated_substances: SearchResultItem[];
  total_count: number;
  query: string;
  search_mode: 'fulltext' | 'fuzzy';
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

export function emptyCategorizedResults(query = ''): CategorizedSearchResults {
  return {
    compounds: [],
    alerts: [],
    thc_regulations: [],
    sources: [],
    government_notices: [],
    designated_substances: [],
    total_count: 0,
    query,
    search_mode: 'fulltext',
  };
}

/**
 * Sanitize raw user input and build a tsquery string compatible with
 * PostgreSQL's `to_tsquery('simple', ...)`.
 *
 * - Strips characters that are special to tsquery (!, &, |, (, ), :, *, <, >)
 * - Splits on whitespace
 * - Joins tokens with ' & ' (AND)
 * - Appends ':*' for prefix matching
 */
export function buildTsQuery(raw: string): string {
  const sanitized = raw.replace(/[!&|():*<>\\'"]/g, ' ').trim();
  const tokens = sanitized.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return '';
  return tokens.map((t) => `${t}:*`).join(' & ');
}

/* ------------------------------------------------------------------ */
/*  Per-table full-text search functions                               */
/* ------------------------------------------------------------------ */

async function searchCompounds(tsquery: string, limit: number): Promise<SearchResultItem[]> {
  const { rows } = await pool.query(
    `SELECT id, name, aliases, legal_status_japan, risk_level,
            ts_rank(search_vector, to_tsquery('simple', $1)) AS rank
     FROM compounds
     WHERE search_vector @@ to_tsquery('simple', $1)
     ORDER BY rank DESC
     LIMIT $2`,
    [tsquery, limit],
  );
  return rows.map((r: any) => ({
    id: String(r.id),
    type: 'compound' as const,
    title: r.name,
    subtitle: r.legal_status_japan ?? null,
    rank: parseFloat(r.rank),
    metadata: { aliases: r.aliases, risk_level: r.risk_level },
  }));
}

async function searchAlerts(tsquery: string, limit: number): Promise<SearchResultItem[]> {
  const { rows } = await pool.query(
    `SELECT id, title, severity, category, status, published_at, compounds,
            ts_rank(search_vector, to_tsquery('simple', $1)) AS rank
     FROM alerts
     WHERE search_vector @@ to_tsquery('simple', $1)
     ORDER BY rank DESC
     LIMIT $2`,
    [tsquery, limit],
  );
  return rows.map((r: any) => ({
    id: String(r.id),
    type: 'alert' as const,
    title: r.title,
    subtitle: r.severity ?? null,
    rank: parseFloat(r.rank),
    metadata: { category: r.category, status: r.status, published_at: r.published_at, compounds: r.compounds },
  }));
}

async function searchThcRegulations(tsquery: string, limit: number): Promise<SearchResultItem[]> {
  const { rows } = await pool.query(
    `SELECT id, product_category, max_thc_level, measurement_method, effective_date, is_current,
            ts_rank(search_vector, to_tsquery('simple', $1)) AS rank
     FROM thc_regulations
     WHERE search_vector @@ to_tsquery('simple', $1)
     ORDER BY rank DESC
     LIMIT $2`,
    [tsquery, limit],
  );
  return rows.map((r: any) => ({
    id: String(r.id),
    type: 'thc_regulation' as const,
    title: r.product_category,
    subtitle: `Max THC: ${r.max_thc_level}`,
    rank: parseFloat(r.rank),
    metadata: { max_thc_level: r.max_thc_level, measurement_method: r.measurement_method, effective_date: r.effective_date, is_current: r.is_current },
  }));
}

async function searchSources(tsquery: string, limit: number): Promise<SearchResultItem[]> {
  const { rows } = await pool.query(
    `SELECT id, name, url, source_type, tier,
            ts_rank(search_vector, to_tsquery('simple', $1)) AS rank
     FROM sources
     WHERE search_vector @@ to_tsquery('simple', $1)
     ORDER BY rank DESC
     LIMIT $2`,
    [tsquery, limit],
  );
  return rows.map((r: any) => ({
    id: String(r.id),
    type: 'source' as const,
    title: r.name,
    subtitle: r.source_type ?? null,
    rank: parseFloat(r.rank),
    metadata: { url: r.url, tier: r.tier },
  }));
}

async function searchGovernmentNotices(tsquery: string, limit: number): Promise<SearchResultItem[]> {
  const { rows } = await pool.query(
    `SELECT id, title, agency, date, summary, risk_level,
            ts_rank(search_vector, to_tsquery('simple', $1)) AS rank
     FROM government_notices
     WHERE search_vector @@ to_tsquery('simple', $1)
     ORDER BY rank DESC
     LIMIT $2`,
    [tsquery, limit],
  );
  return rows.map((r: any) => ({
    id: String(r.id),
    type: 'government_notice' as const,
    title: r.title,
    subtitle: r.agency ?? null,
    rank: parseFloat(r.rank),
    metadata: { date: r.date, summary: r.summary, risk_level: r.risk_level },
  }));
}

async function searchDesignatedSubstances(tsquery: string, limit: number): Promise<SearchResultItem[]> {
  const { rows } = await pool.query(
    `SELECT id, name, chemical_family, designation_date, legal_status,
            ts_rank(search_vector, to_tsquery('simple', $1)) AS rank
     FROM designated_substances
     WHERE search_vector @@ to_tsquery('simple', $1)
     ORDER BY rank DESC
     LIMIT $2`,
    [tsquery, limit],
  );
  return rows.map((r: any) => ({
    id: String(r.id),
    type: 'designated_substance' as const,
    title: r.name,
    subtitle: r.chemical_family ?? null,
    rank: parseFloat(r.rank),
    metadata: { designation_date: r.designation_date, legal_status: r.legal_status },
  }));
}

/* ------------------------------------------------------------------ */
/*  Fuzzy search (pg_trgm fallback)                                    */
/* ------------------------------------------------------------------ */

export async function executeFuzzySearch(
  query: string,
  limit: number = 20,
): Promise<CategorizedSearchResults> {
  logger.debug(`Fuzzy search fallback for: "${query}"`);

  const [compounds, alerts, governmentNotices, designatedSubstances] = await Promise.all([
    pool.query(
      `SELECT id, name, aliases, legal_status_japan, risk_level,
              similarity(name, $1) AS rank
       FROM compounds
       WHERE similarity(name, $1) > 0.2
       ORDER BY rank DESC
       LIMIT $2`,
      [query, limit],
    ),
    pool.query(
      `SELECT id, title, severity, category, status, published_at, compounds,
              similarity(title, $1) AS rank
       FROM alerts
       WHERE similarity(title, $1) > 0.2
       ORDER BY rank DESC
       LIMIT $2`,
      [query, limit],
    ),
    pool.query(
      `SELECT id, title, agency, date, summary, risk_level,
              similarity(title, $1) AS rank
       FROM government_notices
       WHERE similarity(title, $1) > 0.2
       ORDER BY rank DESC
       LIMIT $2`,
      [query, limit],
    ),
    pool.query(
      `SELECT id, name, chemical_family, designation_date, legal_status,
              similarity(name, $1) AS rank
       FROM designated_substances
       WHERE similarity(name, $1) > 0.2
       ORDER BY rank DESC
       LIMIT $2`,
      [query, limit],
    ),
  ]);

  const mappedCompounds: SearchResultItem[] = compounds.rows.map((r: any) => ({
    id: String(r.id),
    type: 'compound' as const,
    title: r.name,
    subtitle: r.legal_status_japan ?? null,
    rank: parseFloat(r.rank),
    metadata: { aliases: r.aliases, risk_level: r.risk_level },
  }));

  const mappedAlerts: SearchResultItem[] = alerts.rows.map((r: any) => ({
    id: String(r.id),
    type: 'alert' as const,
    title: r.title,
    subtitle: r.severity ?? null,
    rank: parseFloat(r.rank),
    metadata: { category: r.category, status: r.status, published_at: r.published_at, compounds: r.compounds },
  }));

  const mappedGovNotices: SearchResultItem[] = governmentNotices.rows.map((r: any) => ({
    id: String(r.id),
    type: 'government_notice' as const,
    title: r.title,
    subtitle: r.agency ?? null,
    rank: parseFloat(r.rank),
    metadata: { date: r.date, summary: r.summary, risk_level: r.risk_level },
  }));

  const mappedDesignated: SearchResultItem[] = designatedSubstances.rows.map((r: any) => ({
    id: String(r.id),
    type: 'designated_substance' as const,
    title: r.name,
    subtitle: r.chemical_family ?? null,
    rank: parseFloat(r.rank),
    metadata: { designation_date: r.designation_date, legal_status: r.legal_status },
  }));

  const totalCount =
    mappedCompounds.length + mappedAlerts.length + mappedGovNotices.length + mappedDesignated.length;

  return {
    compounds: mappedCompounds,
    alerts: mappedAlerts,
    thc_regulations: [],
    sources: [],
    government_notices: mappedGovNotices,
    designated_substances: mappedDesignated,
    total_count: totalCount,
    query,
    search_mode: 'fuzzy',
  };
}

/* ------------------------------------------------------------------ */
/*  Main entry point                                                   */
/* ------------------------------------------------------------------ */

export async function executeSearch(
  query: string,
  limit: number = 20,
): Promise<CategorizedSearchResults> {
  const tsquery = buildTsQuery(query);
  if (!tsquery) {
    return emptyCategorizedResults(query);
  }

  logger.debug(`Full-text search: "${query}" → tsquery: ${tsquery}`);

  const [compounds, alerts, thcRegulations, sources, governmentNotices, designatedSubstances] =
    await Promise.all([
      searchCompounds(tsquery, limit),
      searchAlerts(tsquery, limit),
      searchThcRegulations(tsquery, limit),
      searchSources(tsquery, limit),
      searchGovernmentNotices(tsquery, limit),
      searchDesignatedSubstances(tsquery, limit),
    ]);

  const totalCount =
    compounds.length +
    alerts.length +
    thcRegulations.length +
    sources.length +
    governmentNotices.length +
    designatedSubstances.length;

  // Fallback to fuzzy search when full-text yields no results
  if (totalCount === 0) {
    logger.debug(`No full-text results for "${query}", falling back to fuzzy search`);
    return executeFuzzySearch(query, limit);
  }

  return {
    compounds,
    alerts,
    thc_regulations: thcRegulations,
    sources,
    government_notices: governmentNotices,
    designated_substances: designatedSubstances,
    total_count: totalCount,
    query,
    search_mode: 'fulltext',
  };
}
