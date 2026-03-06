import { Router } from 'express';
import { pool } from '../db/index.js';

const router = Router();

// GET /api/search?q= - Universal search across compounds, alerts, products
router.get('/', async (req, res, next) => {
  try {
    const query = (req.query.q as string || '').trim();
    if (!query) {
      return res.json({ data: { compounds: [], alerts: [], products: [] } });
    }

    const searchPattern = `%${query}%`;

    const [compoundsResult, alertsResult] = await Promise.all([
      pool.query(
        `SELECT id, name, aliases, legal_status_japan, risk_level
         FROM compounds
         WHERE name ILIKE $1 OR aliases::text ILIKE $1
         ORDER BY name ASC
         LIMIT 10`,
        [searchPattern]
      ),
      pool.query(
        `SELECT id, title, severity, category, status, published_at, compounds
         FROM alerts
         WHERE title ILIKE $1 OR summary_what ILIKE $1 OR compounds::text ILIKE $1
         ORDER BY importance_score DESC
         LIMIT 10`,
        [searchPattern]
      ),
    ]);

    res.json({
      data: {
        compounds: compoundsResult.rows,
        alerts: alertsResult.rows,
        products: [], // v1: product search
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
