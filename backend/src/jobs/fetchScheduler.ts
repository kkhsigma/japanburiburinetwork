import { pool } from '../db/index.js';
import { fetchSource, storeDocument } from '../services/sourceFetcher.js';
import { normalizeDocument } from '../services/documentNormalizer.js';
import { chunkDocument, mergeSmallChunks } from '../services/semanticChunker.js';
import { extractEntitiesFromChunk, mergeExtractedEntities, extractEntitiesRuleBased } from '../services/legalEntityExtractor.js';
import { classifyAlert } from '../services/alertClassifier.js';
import { generateSummary } from '../services/alertSummarizer.js';
import { compareSnapshots, suppressFalsePositives } from '../services/diffEngine.js';
import type { DocumentSnapshot } from '../services/diffEngine.js';
import { calculateImportanceScore, getNotificationTier } from '../services/importanceScorer.js';
import type { SourceTier } from '../types/index.js';
import { logger } from '../utils/logger.js';

// ---------------------------------------------------------------------------
// Fetch Scheduler — orchestrates the entire ingestion pipeline
// ---------------------------------------------------------------------------

interface SourceRow {
  id: string;
  name: string;
  url: string;
  source_type: string;
  tier: string;
  fetch_frequency: number;
  last_fetched_at: Date | null;
  is_active: boolean;
}

/**
 * Run one fetch cycle for all sources that are due.
 * This is the main entry point called by the scheduler.
 */
export async function runFetchCycle(): Promise<void> {
  logger.info('Starting fetch cycle...');

  try {
    // Get all active sources that are due for fetching
    const result = await pool.query<SourceRow>(
      `SELECT * FROM sources
       WHERE is_active = true
         AND (last_fetched_at IS NULL
              OR last_fetched_at < NOW() - (fetch_frequency || ' seconds')::INTERVAL)
       ORDER BY tier ASC, last_fetched_at ASC NULLS FIRST`
    );

    const sources = result.rows;
    logger.info(`Found ${sources.length} sources due for fetching`);

    for (const source of sources) {
      try {
        await processSource(source);
      } catch (err) {
        logger.error(`Failed to process source ${source.name}:`, { error: err });
      }

      // Small delay between sources to be polite
      await sleep(2000);
    }

    logger.info('Fetch cycle complete');
  } catch (err) {
    logger.error('Fetch cycle failed:', { error: err });
  }
}

/**
 * Process a single source: fetch -> normalize -> chunk -> extract -> classify -> alert
 */
async function processSource(source: SourceRow): Promise<void> {
  logger.info(`Processing source: ${source.name} (Tier ${source.tier})`);

  // Step 1: Fetch
  const fetchResult = await fetchSource(source);

  if (!fetchResult.success) {
    logger.warn(`Fetch failed for ${source.name}: ${fetchResult.error}`);
    return;
  }

  if (fetchResult.unchanged) {
    logger.debug(`Source unchanged: ${source.name}`);
    // Update last_fetched_at even if unchanged
    await pool.query(
      'UPDATE sources SET last_fetched_at = NOW() WHERE id = $1',
      [source.id]
    );
    return;
  }

  if (!fetchResult.content) {
    logger.warn(`No content from source: ${source.name}`);
    return;
  }

  // Step 2: Store document snapshot
  const docId = await storeDocument(fetchResult.content);
  logger.info(`Stored document ${docId} from ${source.name}`);

  // Step 3: Normalize
  const normalizedDoc = normalizeDocument(fetchResult.content, docId);

  // Step 4: Check for diff against previous snapshot
  const previousDoc = await getPreviousSnapshot(source.id, docId);
  if (previousDoc) {
    const currentSnapshot: DocumentSnapshot = {
      docId: normalizedDoc.docId,
      title: normalizedDoc.title,
      bodyText: normalizedDoc.bodyText,
      rawHash: normalizedDoc.rawHash,
      tables: normalizedDoc.tables,
    };

    const diffResult = compareSnapshots(previousDoc, currentSnapshot);
    const filtered = suppressFalsePositives(diffResult);

    if (!filtered.hasChanged || filtered.diffType === 'surface') {
      logger.debug(`Only surface changes detected for ${source.name}, skipping alert generation`);
      return;
    }

    logger.info(`Meaningful changes detected for ${source.name}: ${filtered.changes.length} changes`);
  }

  // Step 5: Chunk document
  const chunks = mergeSmallChunks(chunkDocument(normalizedDoc));

  // Step 6: Extract entities from all chunks
  const chunkEntities = chunks.map(chunk => extractEntitiesFromChunk(chunk));
  const mergedEntities = mergeExtractedEntities(chunkEntities);

  // Also extract from full text for completeness
  const fullTextEntities = extractEntitiesRuleBased(normalizedDoc.bodyText);
  const finalEntities = mergeExtractedEntities([mergedEntities, fullTextEntities]);

  // Skip alert generation if no meaningful entities found
  if (
    finalEntities.compounds_detected.length === 0 &&
    finalEntities.legal_actions_detected.length === 0 &&
    finalEntities.risk_signals.length === 0
  ) {
    logger.debug(`No relevant entities found in ${source.name}`);
    return;
  }

  // Step 7: Classify
  const classification = classifyAlert(
    normalizedDoc.title,
    normalizedDoc.bodyText,
    finalEntities,
    parseInt(source.tier, 10)
  );

  // Step 8: Generate summary
  const summary = generateSummary(
    normalizedDoc.title,
    normalizedDoc.bodyText,
    classification,
    finalEntities
  );

  // Step 9: Calculate importance score
  const effectiveDates = finalEntities.dates_detected
    .filter(d => d.context === 'enforcement' || d.context === 'effective');
  const daysToEnforcement = effectiveDates.length > 0
    ? Math.ceil((new Date(effectiveDates[0].date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : undefined;

  const importanceScore = calculateImportanceScore({
    sourceTier: parseInt(source.tier, 10) as SourceTier,
    legalAction: classification.action,
    daysToEnforcement: daysToEnforcement !== undefined && daysToEnforcement > 0 ? daysToEnforcement : undefined,
    isNovel: previousDoc === null, // first time seeing this source content
  });

  const notificationTier = getNotificationTier(importanceScore);

  // Step 10: Store alert in database
  const alertResult = await pool.query(
    `INSERT INTO alerts (
      title, category, severity, status, source_tier, confidence_level,
      published_at, effective_at, summary_what, summary_why, summary_who,
      compounds, product_forms, agencies,
      diff_before, diff_after, diff_type,
      primary_source_url, importance_score
    ) VALUES ($1, $2::alert_category, $3::alert_severity, $4::alert_status, $5::source_tier, $6,
              $7, $8, $9, $10, $11,
              $12, $13, $14,
              $15, $16, $17,
              $18, $19)
    RETURNING id`,
    [
      normalizedDoc.title,
      classification.category_primary,
      classification.severity,
      classification.status,
      source.tier,
      classification.confidence_level,
      normalizedDoc.publishedAt,
      classification.effective_dates[0] || null,
      summary.summary_what,
      summary.summary_why,
      summary.summary_who,
      JSON.stringify(classification.compounds),
      JSON.stringify(classification.forms),
      JSON.stringify(finalEntities.agencies_detected),
      summary.diff_before,
      summary.diff_after,
      summary.diff_type,
      normalizedDoc.canonicalUrl,
      importanceScore,
    ]
  );

  const alertId = alertResult.rows[0].id;
  logger.info(`Created alert ${alertId} (score: ${importanceScore}, tier: ${notificationTier})`);

  // Step 11: If compounds detected, update compound state history if needed
  for (const compoundName of classification.compounds) {
    await updateCompoundStateIfNeeded(compoundName, classification, alertId, source);
  }
}

/**
 * Get the previous document snapshot for a source (for diff comparison).
 */
async function getPreviousSnapshot(sourceId: string, currentDocId: string): Promise<DocumentSnapshot | null> {
  const result = await pool.query(
    `SELECT id, title, body_text, raw_hash FROM documents
     WHERE source_id = $1 AND id != $2
     ORDER BY fetched_at DESC LIMIT 1`,
    [sourceId, currentDocId]
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    docId: row.id,
    title: row.title || '',
    bodyText: row.body_text || '',
    rawHash: row.raw_hash,
  };
}

/**
 * Update compound legal status based on alert classification.
 * CRITICAL: Tier 4 alone CANNOT update legal status. Only Tier 1 triggers official_confirmed.
 */
async function updateCompoundStateIfNeeded(
  compoundName: string,
  classification: ReturnType<typeof classifyAlert>,
  alertId: string,
  source: SourceRow
): Promise<void> {
  const tier = parseInt(source.tier, 10);

  // CRITICAL RULE: Only Tier 1 can trigger status updates
  if (tier > 1) {
    logger.debug(`Tier ${tier} source cannot update compound status (rule: Tier 4 alone CANNOT update legal status)`);
    return;
  }

  // Only specific actions should trigger state changes
  const stateChangingActions = [
    'designated_substance_addition',
    'narcotic_designation',
    'promulgation',
    'enforcement_date_confirmed',
  ];

  if (!stateChangingActions.includes(classification.action)) {
    return;
  }

  // Look up the compound
  const compoundResult = await pool.query(
    'SELECT id, legal_status_japan FROM compounds WHERE name = $1',
    [compoundName]
  );

  if (compoundResult.rows.length === 0) return;

  const compound = compoundResult.rows[0];
  const currentStatus = compound.legal_status_japan;

  // Determine new status based on action
  let newStatus: string | null = null;
  switch (classification.action) {
    case 'designated_substance_addition':
      if (currentStatus !== 'effective') newStatus = 'official_confirmed';
      break;
    case 'narcotic_designation':
      if (currentStatus !== 'effective') newStatus = 'official_confirmed';
      break;
    case 'promulgation':
      if (currentStatus !== 'effective') newStatus = 'promulgated';
      break;
    case 'enforcement_date_confirmed':
      if (currentStatus === 'promulgated') newStatus = 'effective';
      break;
  }

  if (!newStatus || newStatus === currentStatus) return;

  // Update compound status
  await pool.query(
    `UPDATE compounds SET legal_status_japan = $1::legal_status, legal_status_updated_at = NOW(), updated_at = NOW()
     WHERE id = $2`,
    [newStatus, compound.id]
  );

  // Record state transition
  await pool.query(
    `INSERT INTO compound_state_history (compound_id, previous_state, new_state, trigger_alert_id, source_url, notes)
     VALUES ($1, $2::legal_status, $3::legal_status, $4, $5, $6)`,
    [
      compound.id,
      currentStatus,
      newStatus,
      alertId,
      source.url,
      `Triggered by ${classification.action} from Tier ${source.tier} source: ${source.name}`,
    ]
  );

  logger.info(`Updated compound ${compoundName}: ${currentStatus} -> ${newStatus}`);
}

// ---------------------------------------------------------------------------
// Scheduler loop — runs fetch cycles on a timer
// ---------------------------------------------------------------------------

let schedulerInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Start the periodic fetch scheduler.
 * @param intervalMinutes How often to run the fetch cycle (default: 15 minutes)
 */
export function startScheduler(intervalMinutes: number = 15): void {
  if (schedulerInterval) {
    logger.warn('Scheduler already running');
    return;
  }

  const intervalMs = intervalMinutes * 60 * 1000;

  logger.info(`Starting fetch scheduler (interval: ${intervalMinutes} minutes)`);

  // Run immediately on start
  runFetchCycle().catch(err => logger.error('Initial fetch cycle failed:', { error: err }));

  // Then run periodically
  schedulerInterval = setInterval(() => {
    runFetchCycle().catch(err => logger.error('Scheduled fetch cycle failed:', { error: err }));
  }, intervalMs);
}

/**
 * Stop the fetch scheduler.
 */
export function stopScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    logger.info('Fetch scheduler stopped');
  }
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
