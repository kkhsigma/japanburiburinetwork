import { Router } from 'express';
import { pool } from '../db/index.js';

const router = Router();

// For v0, use the default user. In v1+, extract from auth.
async function getDefaultUserId(): Promise<string> {
  const result = await pool.query(
    "SELECT id FROM users WHERE device_id = 'default' LIMIT 1"
  );
  return result.rows[0]?.id;
}

// GET /api/watchlist - User's watchlist
router.get('/', async (_req, res, next) => {
  try {
    const userId = await getDefaultUserId();
    if (!userId) return res.json({ data: [] });

    const result = await pool.query(
      `SELECT w.*, c.name as entity_name, c.legal_status_japan, c.risk_level
       FROM watchlists w
       LEFT JOIN compounds c ON w.entity_type = 'compound' AND w.entity_id = c.id
       WHERE w.user_id = $1
       ORDER BY w.created_at DESC`,
      [userId]
    );
    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/watchlist/highlights - Recent changes for watched entities
router.get('/highlights', async (_req, res, next) => {
  try {
    const userId = await getDefaultUserId();
    if (!userId) return res.json({ data: [] });

    const result = await pool.query(
      `SELECT
         w.entity_type,
         c.name as entity_name,
         csh.previous_state as previous_status,
         csh.new_state as new_status,
         csh.changed_at,
         csh.notes as change_description
       FROM watchlists w
       JOIN compounds c ON w.entity_type = 'compound' AND w.entity_id = c.id
       LEFT JOIN compound_state_history csh ON csh.compound_id = c.id
       WHERE w.user_id = $1 AND csh.changed_at IS NOT NULL
       ORDER BY csh.changed_at DESC
       LIMIT 20`,
      [userId]
    );
    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/watchlist - Add entity to watchlist
router.post('/', async (req, res, next) => {
  try {
    const userId = await getDefaultUserId();
    if (!userId) return res.status(400).json({ error: 'No user found' });

    const entityType = req.body.entity_type || req.body.entityType;
    const entityId = req.body.entity_id || req.body.entityId;
    const notificationEnabled = req.body.notification_enabled ?? req.body.notificationEnabled ?? true;
    if (!entityType || !entityId) {
      return res.status(400).json({ error: 'entity_type and entity_id are required' });
    }

    const result = await pool.query(
      `INSERT INTO watchlists (user_id, entity_type, entity_id, notification_enabled)
       VALUES ($1, $2::entity_type, $3, $4)
       RETURNING *`,
      [userId, entityType, entityId, notificationEnabled]
    );
    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/watchlist/:id - Remove from watchlist
router.delete('/:id', async (req, res, next) => {
  try {
    const userId = await getDefaultUserId();
    const result = await pool.query(
      'DELETE FROM watchlists WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Watchlist entry not found' });
    }
    res.json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;
