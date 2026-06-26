import { Router } from 'express';
import multer from 'multer';
import { v4 as uuid } from 'uuid';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import db from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const uploadsDir = join(__dirname, '..', 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, `${uuid()}.${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const router = Router();

// Get all items for a category
router.get('/category/:categoryId', authMiddleware, (req, res) => {
  const items = db.prepare(
    'SELECT * FROM items WHERE category_id = ? AND user_id = ? ORDER BY created_at DESC'
  ).all(req.params.categoryId, req.userId);
  res.json(items);
});

// Get all items for user
router.get('/', authMiddleware, (req, res) => {
  const items = db.prepare(
    'SELECT items.*, categories.name as category_name FROM items LEFT JOIN categories ON items.category_id = categories.id WHERE items.user_id = ? ORDER BY items.created_at DESC'
  ).all(req.userId);
  res.json(items);
});

// Get single item
router.get('/:id', authMiddleware, (req, res) => {
  const item = db.prepare(
    'SELECT * FROM items WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.userId);
  if (!item) return res.status(404).json({ error: '物品不存在' });
  res.json(item);
});

// Create item
router.post('/', authMiddleware, upload.single('image'), (req, res) => {
  const { name, category_id, price } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: '物品名称不能为空' });
  }
  if (!category_id) {
    return res.status(400).json({ error: '请选择分类' });
  }

  const id = uuid();
  const imagePath = req.file ? `/uploads/${req.file.filename}` : '';

  db.prepare(
    'INSERT INTO items (id, user_id, category_id, name, image, price) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, req.userId, category_id, name.trim(), imagePath, price ? parseFloat(price) : null);

  res.json(db.prepare('SELECT * FROM items WHERE id = ?').get(id));
});

// Update item
router.put('/:id', authMiddleware, upload.single('image'), (req, res) => {
  const item = db.prepare(
    'SELECT * FROM items WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.userId);
  if (!item) return res.status(404).json({ error: '物品不存在' });

  const { name, price, category_id } = req.body;
  const updates = [];
  const params = [];

  if (name !== undefined) { updates.push('name = ?'); params.push(name.trim()); }
  if (price !== undefined) { updates.push('price = ?'); params.push(parseFloat(price) || null); }
  if (category_id !== undefined) { updates.push('category_id = ?'); params.push(category_id); }

  if (req.file) {
    // Delete old image if exists
    if (item.image && item.image.startsWith('/uploads/')) {
      const oldPath = join(__dirname, '..', item.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    updates.push('image = ?');
    params.push(`/uploads/${req.file.filename}`);
  }

  if (updates.length > 0) {
    updates.push("updated_at = datetime('now')");
    params.push(req.params.id);
    db.prepare(`UPDATE items SET ${updates.join(', ')} WHERE id = ?`).run(...params);
  }

  res.json(db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id));
});

// Delete item
router.delete('/:id', authMiddleware, (req, res) => {
  const item = db.prepare(
    'SELECT * FROM items WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.userId);
  if (!item) return res.status(404).json({ error: '物品不存在' });

  if (item.image && item.image.startsWith('/uploads/')) {
    const imgPath = join(__dirname, '..', item.image);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
  }

  db.prepare('DELETE FROM items WHERE id = ?').run(req.params.id);
  res.json({ message: '删除成功' });
});

export default router;
