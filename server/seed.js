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

// Create 9 default categories
const categories = [
  { name: '上装', icon: '👕', sort: 0 },
  { name: '下装', icon: '👖', sort: 1 },
  { name: '连衣裙', icon: '👗', sort: 2 },
  { name: '外套', icon: '🧥', sort: 3 },
  { name: '鞋子', icon: '👟', sort: 4 },
  { name: '袜子', icon: '🧦', sort: 5 },
  { name: '背包', icon: '👜', sort: 6 },
  { name: '发饰', icon: '🎀', sort: 7 },
  { name: '耳饰', icon: '💎', sort: 8 },
];

const catIds = {};
for (const cat of categories) {
  const id = uuid();
  db.prepare(
    'INSERT INTO categories (id, user_id, name, icon, is_default, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, userId, cat.name, cat.icon, 1, cat.sort);
  catIds[cat.name] = id;
}

console.log('Created 9 categories.');

// Rich item data: name, price, color hex for emoji background
const items = [
  // 上装 (7)
  { cat: '上装', name: '白色纯棉T恤', price: 89, color: '#F9FAFB' },
  { cat: '上装', name: '蓝白条纹衬衫', price: 299, color: '#EFF6FF' },
  { cat: '上装', name: '驼色针织毛衣', price: 389, color: '#FFF7ED' },
  { cat: '上装', name: '碎花雪纺衫', price: 199, color: '#FDF2F8' },
  { cat: '上装', name: '白色蕾丝上衣', price: 259, color: '#FCEEF5' },
  { cat: '上装', name: '粉色宽松卫衣', price: 149, color: '#FCE7F3' },
  { cat: '上装', name: '黑色修身打底衫', price: 79, color: '#F3F4F6' },
  // 下装 (6)
  { cat: '下装', name: '浅蓝直筒牛仔裤', price: 399, color: '#EFF6FF' },
  { cat: '下装', name: '黑色阔腿裤', price: 289, color: '#F3F4F6' },
  { cat: '下装', name: '粉色百褶短裙', price: 199, color: '#FCE7F3' },
  { cat: '下装', name: '白色高腰短裤', price: 149, color: '#F9FAFB' },
  { cat: '下装', name: '格纹西装长裤', price: 349, color: '#F5F3FF' },
  { cat: '下装', name: '深灰A字半身裙', price: 229, color: '#F3F4F6' },
  // 连衣裙 (6)
  { cat: '连衣裙', name: '碎花吊带长裙', price: 359, color: '#FDF2F8' },
  { cat: '连衣裙', name: '纯色针织连衣裙', price: 429, color: '#FEF3C7' },
  { cat: '连衣裙', name: '法式茶歇裙', price: 299, color: '#FCE7F3' },
  { cat: '连衣裙', name: '修身小黑裙', price: 499, color: '#F3F4F6' },
  { cat: '连衣裙', name: '波西米亚长裙', price: 389, color: '#FFF7ED' },
  { cat: '连衣裙', name: '蕾丝拼接连衣裙', price: 459, color: '#FCEEF5' },
  // 外套 (5)
  { cat: '外套', name: '浅蓝牛仔外套', price: 699, color: '#EFF6FF' },
  { cat: '外套', name: '卡其色风衣', price: 899, color: '#FFF7ED' },
  { cat: '外套', name: '米白短款羽绒服', price: 1299, color: '#F9FAFB' },
  { cat: '外套', name: '驼色针织开衫', price: 459, color: '#FFF7ED' },
  { cat: '外套', name: '黑色皮夹克', price: 799, color: '#F3F4F6' },
  // 鞋子 (6)
  { cat: '鞋子', name: '经典小白鞋', price: 499, color: '#F9FAFB' },
  { cat: '鞋子', name: '黑色高帮帆布鞋', price: 359, color: '#F3F4F6' },
  { cat: '鞋子', name: '裸色尖头高跟鞋', price: 699, color: '#FFF7ED' },
  { cat: '鞋子', name: '棕色马丁靴', price: 899, color: '#FFF7ED' },
  { cat: '鞋子', name: '粉色运动跑鞋', price: 599, color: '#FCE7F3' },
  { cat: '鞋子', name: '银色平底凉鞋', price: 299, color: '#F9FAFB' },
  // 袜子 (4)
  { cat: '袜子', name: '纯棉短筒袜白', price: 39, color: '#F9FAFB' },
  { cat: '袜子', name: '复古中筒袜', price: 49, color: '#FCE7F3' },
  { cat: '袜子', name: '隐形船袜套装', price: 29, color: '#F3F4F6' },
  { cat: '袜子', name: '羊毛保暖袜', price: 69, color: '#FFF7ED' },
  // 背包 (4)
  { cat: '背包', name: '简约帆布托特包', price: 129, color: '#FFF7ED' },
  { cat: '背包', name: '迷你双肩背包', price: 299, color: '#FCE7F3' },
  { cat: '背包', name: '链条斜挎小方包', price: 359, color: '#F3F4F6' },
  { cat: '背包', name: '通勤手提公文包', price: 599, color: '#FFF7ED' },
  // 发饰 (4)
  { cat: '发饰', name: '珍珠蝴蝶发夹', price: 29, color: '#FCEEF5' },
  { cat: '发饰', name: '水晶发箍头饰', price: 89, color: '#FDF2F8' },
  { cat: '发饰', name: '丝绒蝴蝶结发圈', price: 19, color: '#FCE7F3' },
  { cat: '发饰', name: '金属鲨鱼夹', price: 39, color: '#FFF7ED' },
  // 耳饰 (4)
  { cat: '耳饰', name: '淡水珍珠耳钉', price: 199, color: '#FCEEF5' },
  { cat: '耳饰', name: '星星流苏耳坠', price: 159, color: '#FFF7ED' },
  { cat: '耳饰', name: '极简金属圆环', price: 89, color: '#F3F4F6' },
  { cat: '耳饰', name: '水晶花朵耳钉', price: 129, color: '#FDF2F8' },
];

// Generate unique placeholder images per item
// Each item gets a unique pattern based on its name hash
function hashName(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = ((h << 5) - h) + name.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

// Category-specific item emojis for variety
const itemEmojis = {
  '上装': ['👚', '👕', '🎽', '👔', '🧵', '🧶', '✨'],
  '下装': ['👖', '🩳', '👗', '👘', '🩲', '🎯'],
  '连衣裙': ['👗', '💃', '✨', '🎀', '🌸', '🌺'],
  '外套': ['🧥', '🧣', '🧤', '🦺', '🧵', '❄️'],
  '鞋子': ['👟', '👠', '👢', '👡', '🥿', '👞'],
  '袜子': ['🧦', '🧤', '🩲', '✨'],
  '背包': ['👜', '🎒', '👝', '💼'],
  '发饰': ['🎀', '💝', '🌸', '✨'],
  '耳饰': ['💎', '⭐', '💫', '✨'],
};

function generatePlaceholderImage(name, colorHex, catName, idx) {
  const { r, g, b } = {
    r: parseInt(colorHex.slice(1, 3), 16),
    g: parseInt(colorHex.slice(3, 5), 16),
    b: parseInt(colorHex.slice(5, 7), 16),
  };

  const h = hashName(name);
  const emojis = itemEmojis[catName] || ['📦'];
  const emoji = emojis[idx % emojis.length];

  // Lighter version of color for gradient
  const lr = Math.min(255, r + 40);
  const lg = Math.min(255, g + 40);
  const lb = Math.min(255, b + 40);
  const lightColor = `rgb(${lr},${lg},${lb})`;

  // Darker version for accents
  const dr = Math.max(0, r - 30);
  const dg = Math.max(0, g - 30);
  const db = Math.max(0, b - 30);
  const darkColor = `rgb(${dr},${dg},${db})`;

  // Unique decorative elements based on hash
  const cx1 = 50 + (h % 75);
  const cy1 = 80 + (h % 60);
  const cx2 = 220 + (h % 50);
  const cy2 = 250 + (h % 80);
  const cx3 = 100 + (h % 80);
  const cy3 = 320 + (h % 50);
  const rot = h % 45;
  const dotCount = 3 + (h % 6);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colorHex}"/>
      <stop offset="100%" stop-color="${lightColor}"/>
    </linearGradient>
  </defs>
  <rect width="300" height="400" fill="url(#bg)"/>
  <!-- decorative circles -->
  <circle cx="${cx1}" cy="${cy1}" r="${15 + (h % 20)}" fill="${darkColor}" opacity="0.3"/>
  <circle cx="${cx2}" cy="${cy2}" r="${12 + (h % 18)}" fill="${darkColor}" opacity="0.25"/>
  <circle cx="${cx3}" cy="${cy3}" r="${10 + (h % 15)}" fill="${darkColor}" opacity="0.2"/>
  <!-- decorative dots -->
  ${Array.from({length: dotCount}, (_, i) =>
    `<circle cx="${60 + i * 50 + (h % 30)}" cy="${60 + ((h + i * 31) % 300)}" r="3" fill="${darkColor}" opacity="0.4"/>`
  ).join('\n  ')}
  <!-- main emoji -->
  <text x="150" y="200" text-anchor="middle" font-size="72" transform="rotate(${rot}, 150, 200)">${emoji}</text>
  <!-- item name -->
  <rect x="30" y="340" width="240" height="40" rx="10" fill="rgba(255,255,255,0.8)"/>
  <text x="150" y="366" text-anchor="middle" font-size="16" font-family="sans-serif" fill="#333" font-weight="bold">${name}</text>
  </svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

for (let idx = 0; idx < items.length; idx++) {
  const item = items[idx];
  const id = uuid();
  const cId = catIds[item.cat];
  if (!cId) continue;
  const catIndex = items.filter((_, i) => i < idx && items[i].cat === item.cat).length;
  const placeholder = generatePlaceholderImage(item.name, item.color, item.cat, catIndex);
  db.prepare(
    'INSERT INTO items (id, user_id, category_id, name, image, price) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, userId, cId, item.name, placeholder, item.price);
}

console.log(`Created ${items.length} sample items with unique styled images.`);

// Show summary
const uc = db.prepare('SELECT COUNT(*) as c FROM users').get();
const cc = db.prepare('SELECT COUNT(*) as c FROM categories').get();
const ic = db.prepare('SELECT COUNT(*) as c FROM items').get();

console.log(`\nSeed complete!`);
console.log(`  Users: ${uc.c}`);
console.log(`  Categories: ${cc.c} (上装/下装/连衣裙/外套/鞋子/袜子/背包/发饰/耳饰)`);
console.log(`  Items: ${ic.c}`);
console.log(`\n  Demo account: 13800001111 / 123456`);
