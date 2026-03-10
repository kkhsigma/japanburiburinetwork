import { Router } from 'express';
import { executeSearch, emptyCategorizedResults } from '../services/searchService.js';

const router = Router();

// GET /api/search?q=<query>&limit=<n> - Full-text search across all tables
router.get('/', async (req, res, next) => {
  try {
    const query = (req.query.q as string || '').trim();

    if (!query) {
      return res.json({ data: emptyCategorizedResults() });
    }

    if (query.length > 200) {
      return res.status(400).json({ error: 'Query must be 200 characters or fewer' });
    }

    const rawLimit = parseInt(req.query.limit as string, 10);
    const limit = Math.min(Math.max(rawLimit || 20, 1), 50);

    const results = await executeSearch(query, limit);

    res.json({ data: results });
  } catch (err) {
    next(err);
  }
});

export default router;
