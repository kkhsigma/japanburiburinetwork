import { Router } from 'express';
import { pool } from '../db/index.js';

const router = Router();

// GET /api/compounds - List all tracked compounds
router.get('/', async (_req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, name, aliases, chemical_family, natural_or_synthetic,
              legal_status_japan, legal_status_updated_at, risk_level, effects_summary
       FROM compounds
       ORDER BY name ASC`
    );
    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/compounds/:id - Compound detail with state history, related alerts, and sources
router.get('/:id', async (req, res, next) => {
  try {
    const compoundResult = await pool.query(
      'SELECT * FROM compounds WHERE id = $1',
      [req.params.id]
    );
    if (compoundResult.rows.length === 0) {
      return res.status(404).json({ error: 'Compound not found' });
    }

    const compound = compoundResult.rows[0];

    // Run remaining queries in parallel
    const [timelineResult, relatedAlertsResult, sourcesResult] = await Promise.all([
      pool.query(
        `SELECT csh.*, a.title as alert_title
         FROM compound_state_history csh
         LEFT JOIN alerts a ON csh.trigger_alert_id = a.id
         WHERE csh.compound_id = $1
         ORDER BY csh.changed_at DESC`,
        [req.params.id]
      ),
      // Find alerts that mention this compound by name
      pool.query(
        `SELECT id, title, severity, category, status, source_tier, confidence_level,
                published_at, effective_at, summary_what, summary_why, summary_who,
                compounds, agencies, importance_score, primary_source_url, created_at
         FROM alerts
         WHERE compounds @> $1::jsonb
         ORDER BY importance_score DESC, published_at DESC
         LIMIT 20`,
        [JSON.stringify([compound.name])]
      ),
      // Find sources relevant to this compound (search in name/url for compound name)
      pool.query(
        `SELECT id, name, url, source_type, tier
         FROM sources
         WHERE search_vector @@ to_tsquery('simple', $1)
            OR name ILIKE '%' || $2 || '%'
         ORDER BY tier ASC
         LIMIT 10`,
        [compound.name.replace(/[^a-zA-Z0-9]/g, '') + ':*', compound.name]
      ),
    ]);

    res.json({
      data: compound,
      timeline: timelineResult.rows,
      related_alerts: relatedAlertsResult.rows,
      sources: sourcesResult.rows,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/compounds/:id/timeline - State machine transition history
router.get('/:id/timeline', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT csh.*, a.title as alert_title
       FROM compound_state_history csh
       LEFT JOIN alerts a ON csh.trigger_alert_id = a.id
       WHERE csh.compound_id = $1
       ORDER BY csh.changed_at DESC`,
      [req.params.id]
    );
    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
});

export default router;
