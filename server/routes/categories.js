import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Get all categories
router.get('/', authMiddleware, (req, res) => {
  const cats = db.prepare(
    'SELECT * FROM categories WHERE user_id = ? ORDER BY sort_order'
  ).all(req.userId);
  res.json(cats);
});

// Create custom category
router.post('/', authMiddleware, (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: '分类名称不能为空' });
  }
  const id = uuid();
  const maxOrder = db.prepare(
    'SELECT MAX(sort_order) as m FROM categories WHERE user_id = ?'
  ).get(req.userId);
  const sortOrder = (maxOrder?.m ?? 7) + 1;

  db.prepare(
    'INSERT INTO categories (id, user_id, name, icon, is_default, sort_order) VALUES (?, ?, ?, ?, 0, ?)'
  ).run(id, req.userId, name.trim(), '📦', sortOrder);

  res.json(db.prepare('SELECT * FROM categories WHERE id = ?').get(id));
});

// Rename category
router.put('/:id', authMiddleware, (req, res) => {
  const cat = db.prepare(
    'SELECT * FROM categories WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.userId);
  if (!cat) return res.status(404).json({ error: '分类不存在' });
  if (cat.is_default) return res.status(403).json({ error: '默认分类不可重命名' });

  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: '分类名称不能为空' });
  }

  db.prepare('UPDATE categories SET name = ? WHERE id = ?').run(name.trim(), req.params.id);
  res.json(db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id));
});

// Delete category
router.delete('/:id', authMiddleware, (req, res) => {
  const cat = db.prepare(
    'SELECT * FROM categories WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.userId);
  if (!cat) return res.status(404).json({ error: '分类不存在' });

  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ message: '删除成功' });
});

export default router;
