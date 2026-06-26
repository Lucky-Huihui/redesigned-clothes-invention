import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import db from '../db.js';
import { generateToken, authMiddleware } from '../middleware/auth.js';

const router = Router();

const DEFAULT_CATEGORIES = [
  { name: '上装', icon: '👕', sort_order: 0 },
  { name: '下装', icon: '👖', sort_order: 1 },
  { name: '袜子', icon: '🧦', sort_order: 2 },
  { name: '鞋子', icon: '👟', sort_order: 3 },
  { name: '发饰', icon: '🎀', sort_order: 4 },
  { name: '耳饰', icon: '💎', sort_order: 5 },
  { name: '外套', icon: '🧥', sort_order: 6 },
  { name: '背包', icon: '🎒', sort_order: 7 },
];

// Register
router.post('/register', (req, res) => {
  const { phone, email, password, nickname, gender } = req.body;

  if (!password || password.length < 6) {
    return res.status(400).json({ error: '密码不能少于6位' });
  }
  if (!phone && !email) {
    return res.status(400).json({ error: '请输入手机号或邮箱' });
  }

  const existing = phone
    ? db.prepare('SELECT id FROM users WHERE phone = ?').get(phone)
    : db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(400).json({ error: '该账号已被注册' });
  }

  const id = uuid();
  const hashed = bcrypt.hashSync(password, 10);
  const nick = nickname || (phone ? phone.slice(-4) : email?.split('@')[0]) || '新用户';

  db.prepare(`
    INSERT INTO users (id, phone, email, password, nickname, gender, theme)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, phone || null, email || null, hashed, nick, gender || 'FEMALE', gender === 'MALE' ? 'GRAY' : 'PINK');

  // Create default categories
  const insertCat = db.prepare(`
    INSERT INTO categories (id, user_id, name, icon, is_default, sort_order)
    VALUES (?, ?, ?, ?, 1, ?)
  `);
  for (const cat of DEFAULT_CATEGORIES) {
    insertCat.run(uuid(), id, cat.name, cat.icon, cat.sort_order);
  }

  const token = generateToken(id);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  const { password: _, ...safeUser } = user;

  res.json({ token, user: safeUser });
});

// Login
router.post('/login', (req, res) => {
  const { account, password } = req.body;
  if (!account || !password) {
    return res.status(400).json({ error: '请输入账号和密码' });
  }

  const user = db.prepare(
    'SELECT * FROM users WHERE phone = ? OR email = ?'
  ).get(account, account);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(400).json({ error: '账号或密码错误' });
  }

  const token = generateToken(user.id);
  const { password: _, ...safeUser } = user;

  res.json({ token, user: safeUser });
});

// Get current user
router.get('/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
  if (!user) return res.status(404).json({ error: '用户不存在' });
  const { password: _, ...safeUser } = user;
  res.json(safeUser);
});

// Update profile
router.put('/profile', authMiddleware, (req, res) => {
  const { nickname, gender, avatar, theme } = req.body;
  const updates = [];
  const params = [];

  if (nickname !== undefined) { updates.push('nickname = ?'); params.push(nickname); }
  if (gender !== undefined) { updates.push('gender = ?'); params.push(gender); }
  if (avatar !== undefined) { updates.push('avatar = ?'); params.push(avatar); }
  if (theme !== undefined) { updates.push('theme = ?'); params.push(theme); }

  if (updates.length === 0) {
    return res.status(400).json({ error: '没有需要更新的内容' });
  }

  updates.push("updated_at = datetime('now')");
  params.push(req.userId);

  db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
  const { password: _, ...safeUser } = user;
  res.json(safeUser);
});

// Change password
router.put('/password', authMiddleware, (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);

  if (!bcrypt.compareSync(oldPassword, user.password)) {
    return res.status(400).json({ error: '原密码错误' });
  }
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: '新密码不能少于6位' });
  }

  db.prepare("UPDATE users SET password = ?, updated_at = datetime('now') WHERE id = ?")
    .run(bcrypt.hashSync(newPassword, 10), req.userId);
  res.json({ message: '密码修改成功' });
});

// Delete account
router.delete('/account', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM users WHERE id = ?').run(req.userId);
  res.json({ message: '账号已注销' });
});

export default router;
