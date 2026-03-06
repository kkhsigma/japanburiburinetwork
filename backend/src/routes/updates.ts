import { Router } from 'express';
import { pool } from '../db/index.js';

const router = Router();

// GET /api/updates/recent - Update cards for intro animation popup
router.get('/recent', async (_req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, title, severity, category, summary_what, compounds, published_at
       FROM alerts
       WHERE created_at > NOW() - INTERVAL '7 days'
         AND importance_score >= 50
       ORDER BY importance_score DESC, created_at DESC
       LIMIT 5`
    );
    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
});

export default router;
