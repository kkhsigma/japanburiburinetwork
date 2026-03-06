import { Router } from 'express';
import { pool } from '../db/index.js';

const router = Router();

// GET /api/admin/review-queue - Pending alerts for human verification
router.get('/review-queue', async (_req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT * FROM alerts
       WHERE status = 'pending'
       ORDER BY importance_score DESC, created_at DESC`
    );
    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/alerts/:id/verify - Approve alert
router.post('/alerts/:id/verify', async (req, res, next) => {
  try {
    const result = await pool.query(
      `UPDATE alerts SET status = 'verified', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/alerts/:id/reject - Reject false positive
router.post('/alerts/:id/reject', async (req, res, next) => {
  try {
    const result = await pool.query(
      'DELETE FROM alerts WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json({ data: result.rows[0], rejected: true });
  } catch (err) {
    next(err);
  }
});

export default router;
