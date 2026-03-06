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

// GET /api/compounds/:id - Compound detail with state history
router.get('/:id', async (req, res, next) => {
  try {
    const compoundResult = await pool.query(
      'SELECT * FROM compounds WHERE id = $1',
      [req.params.id]
    );
    if (compoundResult.rows.length === 0) {
      return res.status(404).json({ error: 'Compound not found' });
    }

    const timelineResult = await pool.query(
      `SELECT csh.*, a.title as alert_title
       FROM compound_state_history csh
       LEFT JOIN alerts a ON csh.trigger_alert_id = a.id
       WHERE csh.compound_id = $1
       ORDER BY csh.changed_at DESC`,
      [req.params.id]
    );

    res.json({
      data: compoundResult.rows[0],
      timeline: timelineResult.rows,
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
