import { Router } from 'express';
import { pool } from '../db/index.js';

const router = Router();

async function getDefaultUserId(): Promise<string> {
  const result = await pool.query(
    "SELECT id FROM users WHERE device_id = 'default' LIMIT 1"
  );
  return result.rows[0]?.id;
}

// GET /api/settings - User preferences
router.get('/', async (_req, res, next) => {
  try {
    const userId = await getDefaultUserId();
    if (!userId) return res.status(404).json({ error: 'User not found' });

    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];
    res.json({
      data: {
        notificationPreference: user.notification_preference,
        language: user.language,
      },
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/settings - Update user preferences
router.put('/', async (req, res, next) => {
  try {
    const userId = await getDefaultUserId();
    if (!userId) return res.status(404).json({ error: 'User not found' });

    const { notificationPreference, language } = req.body;

    const updates: string[] = [];
    const params: any[] = [];
    let paramIdx = 1;

    if (notificationPreference) {
      updates.push(`notification_preference = $${paramIdx}::notification_preference`);
      params.push(notificationPreference);
      paramIdx++;
    }
    if (language) {
      updates.push(`language = $${paramIdx}`);
      params.push(language);
      paramIdx++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    params.push(userId);
    await pool.query(
      `UPDATE users SET ${updates.join(', ')}, last_active_at = NOW() WHERE id = $${paramIdx}`,
      params
    );

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
