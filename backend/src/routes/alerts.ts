import { Router } from 'express';
import { pool } from '../db/index.js';
import type { AlertFilters, PaginationParams } from '../types/index.js';

const router = Router();

// GET /api/alerts - List alerts with filters and pagination
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;

    const { severity, category, compound, status } = req.query as Partial<AlertFilters>;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramIdx = 1;

    if (severity) {
      whereClause += ` AND severity = $${paramIdx}::alert_severity`;
      params.push(severity);
      paramIdx++;
    }
    if (category) {
      whereClause += ` AND category = $${paramIdx}::alert_category`;
      params.push(category);
      paramIdx++;
    }
    if (compound) {
      whereClause += ` AND compounds @> $${paramIdx}::jsonb`;
      params.push(JSON.stringify([compound]));
      paramIdx++;
    }
    if (status) {
      whereClause += ` AND status = $${paramIdx}::alert_status`;
      params.push(status);
      paramIdx++;
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM alerts ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT * FROM alerts ${whereClause}
       ORDER BY importance_score DESC, created_at DESC
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...params, limit, offset]
    );

    res.json({
      data: result.rows,
      pagination: {
        page,
        total,
        hasMore: offset + limit < total,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/alerts/critical - Critical alerts for home dashboard
router.get('/critical', async (_req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT * FROM alerts
       WHERE severity = 'critical' AND status IN ('verified', 'official_confirmed')
       ORDER BY importance_score DESC, created_at DESC
       LIMIT 5`
    );
    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/alerts/upcoming - Upcoming enforcement dates
router.get('/upcoming', async (_req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT * FROM alerts
       WHERE effective_at > NOW()
       ORDER BY effective_at ASC
       LIMIT 10`
    );
    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/alerts/:id - Alert detail with diff data
router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM alerts WHERE id = $1',
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

export default router;
