import db from './db.js';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';

// Clear existing data
db.exec('DELETE FROM reactions');
db.exec('DELETE FROM outfits');
db.exec('DELETE FROM items');
db.exec('DELETE FROM categories');
db.exec('DELETE FROM users');

console.log('Cleared existing data.');

// Create demo user
const userId = uuid();
const hash = bcrypt.hashSync('123456', 10);
db.prepare(
  'INSERT INTO users (id, phone, email, nickname, avatar, gender, theme, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
).run(userId, '13800001111', null, '小美', '', 'FEMALE', 'PINK', hash);

console.log('Created demo user: 13800001111 / 123456 (小美)');

// Create 8 default categories
const categories = [
  { name: '上装', icon: '👕', sort: 1 },
  { name: '下装', icon: '👖', sort: 2 },
  { name: '袜子', icon: '🧦', sort: 3 },
  { name: '鞋子', icon: '👟', sort: 4 },
  { name: '发饰', icon: '🎀', sort: 5 },
  { name: '耳饰', icon: '💎', sort: 6 },
  { name: '外套', icon: '🧥', sort: 7 },
  { name: '背包', icon: '🎒', sort: 8 },
];

const catIds = {};
for (const cat of categories) {
  const id = uuid();
  db.prepare(
    'INSERT INTO categories (id, user_id, name, icon, is_default, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, userId, cat.name, cat.icon, 1, cat.sort);
  catIds[cat.name] = id;
}

console.log('Created 8 categories.');

// Create sample items for each category
const items = [
  { cat: '上装', name: '白色T恤', price: 89 },
  { cat: '上装', name: '条纹衬衫', price: 299 },
  { cat: '上装', name: '针织毛衣', price: 389 },
  { cat: '上装', name: '雪纺衫', price: 199 },
  { cat: '上装', name: '蕾丝上衣', price: 259 },
  { cat: '上装', name: '粉色卫衣', price: 149 },
  { cat: '下装', name: '牛仔裤', price: 399 },
  { cat: '下装', name: '阔腿裤', price: 289 },
  { cat: '下装', name: '百褶裙', price: 199 },
  { cat: '下装', name: '黑色短裤', price: 149 },
  { cat: '下装', name: '格子长裤', price: 349 },
  { cat: '鞋子', name: '小白鞋', price: 499 },
  { cat: '鞋子', name: '帆布鞋', price: 359 },
  { cat: '鞋子', name: '高跟鞋', price: 699 },
  { cat: '鞋子', name: '马丁靴', price: 899 },
  { cat: '鞋子', name: '运动鞋', price: 599 },
  { cat: '外套', name: '牛仔外套', price: 699 },
  { cat: '外套', name: '风衣', price: 899 },
  { cat: '外套', name: '羽绒服', price: 1299 },
  { cat: '外套', name: '针织开衫', price: 459 },
  { cat: '背包', name: '帆布包', price: 129 },
  { cat: '背包', name: '双肩包', price: 299 },
  { cat: '背包', name: '斜挎包', price: 359 },
  { cat: '背包', name: '手提包', price: 599 },
  { cat: '袜子', name: '短袜', price: 39 },
  { cat: '袜子', name: '中筒袜', price: 49 },
  { cat: '袜子', name: '丝袜', price: 29 },
  { cat: '发饰', name: '蝴蝶结发夹', price: 29 },
  { cat: '发饰', name: '珍珠发箍', price: 89 },
  { cat: '发饰', name: '丝带发圈', price: 19 },
  { cat: '耳饰', name: '珍珠耳钉', price: 199 },
  { cat: '耳饰', name: '星星耳坠', price: 159 },
  { cat: '耳饰', name: '金属耳环', price: 89 },
];

for (const item of items) {
  const id = uuid();
  const catId = catIds[item.cat];
  if (!catId) continue;
  db.prepare(
    'INSERT INTO items (id, user_id, category_id, name, image, price) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, userId, catId, item.name, '', item.price);
}

console.log(`Created ${items.length} sample items.`);

// Show summary
const uc = db.prepare('SELECT COUNT(*) as c FROM users').get();
const cc = db.prepare('SELECT COUNT(*) as c FROM categories').get();
const ic = db.prepare('SELECT COUNT(*) as c FROM items').get();

console.log(`\nSeed complete!`);
console.log(`  Users: ${uc.c}`);
console.log(`  Categories: ${cc.c}`);
console.log(`  Items: ${ic.c}`);
console.log(`\n  Demo account: 13800001111 / 123456`);
