import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Get all outfits
router.get('/', authMiddleware, (req, res) => {
  const outfits = db.prepare(
    'SELECT * FROM outfits WHERE user_id = ? ORDER BY created_at DESC'
  ).all(req.userId);

  const result = outfits.map(o => ({
    ...o,
    items: JSON.parse(o.items),
  }));
  res.json(result);
});

// Create outfit
router.post('/', authMiddleware, (req, res) => {
  const { items, result_image, feedback } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: '请选择搭配物品' });
  }

  const id = uuid();
  db.prepare(
    'INSERT INTO outfits (id, user_id, items, result_image, feedback) VALUES (?, ?, ?, ?, ?)'
  ).run(id, req.userId, JSON.stringify(items), result_image || '', feedback || null);

  const outfit = db.prepare('SELECT * FROM outfits WHERE id = ?').get(id);
  res.json({ ...outfit, items: JSON.parse(outfit.items) });
});

// Update outfit feedback
router.put('/:id/feedback', authMiddleware, (req, res) => {
  const { feedback } = req.body;
  if (!['LIKE', 'FAVORITE', 'DISLIKE'].includes(feedback)) {
    return res.status(400).json({ error: '无效的反馈类型' });
  }

  const outfit = db.prepare(
    'SELECT * FROM outfits WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.userId);
  if (!outfit) return res.status(404).json({ error: '搭配记录不存在' });

  db.prepare('UPDATE outfits SET feedback = ? WHERE id = ?').run(feedback, req.params.id);

  // Remove old reaction and create new one
  db.prepare('DELETE FROM reactions WHERE user_id = ? AND outfit_id = ?').run(req.userId, req.params.id);
  db.prepare(
    'INSERT INTO reactions (id, user_id, outfit_id, type) VALUES (?, ?, ?, ?)'
  ).run(uuid(), req.userId, req.params.id, feedback);

  res.json({ message: '反馈成功' });
});

// Get reactions by type
router.get('/reactions/:type', authMiddleware, (req, res) => {
  const { type } = req.params;
  const reactions = db.prepare(`
    SELECT r.*, o.items, o.result_image, o.created_at as outfit_created
    FROM reactions r
    JOIN outfits o ON r.outfit_id = o.id
    WHERE r.user_id = ? AND r.type = ?
    ORDER BY r.created_at DESC
  `).all(req.userId, type);

  const result = reactions.map(r => ({
    ...r,
    outfit: { id: r.outfit_id, items: JSON.parse(r.items), result_image: r.result_image, created_at: r.outfit_created }
  }));
  res.json(result);
});

// Get reaction counts
router.get('/reactions-count', authMiddleware, (req, res) => {
  const counts = db.prepare(`
    SELECT type, COUNT(*) as count
    FROM reactions
    WHERE user_id = ?
    GROUP BY type
  `).all(req.userId);

  const result = { LIKE: 0, FAVORITE: 0, DISLIKE: 0 };
  for (const c of counts) result[c.type] = c.count;
  res.json(result);
});

// Delete outfit
router.delete('/:id', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM outfits WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  res.json({ message: '删除成功' });
});

export default router;
