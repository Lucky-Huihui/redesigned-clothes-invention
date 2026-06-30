import { Router } from 'express';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const router = Router();

// 加载环境配置
let REPLICATE_TOKEN = '';
try {
  const envPath = join(__dirname, '..', '.env');
  const envContent = readFileSync(envPath, 'utf-8');
  const match = envContent.match(/REPLICATE_API_TOKEN=(.*)/);
  if (match && match[1].trim()) {
    REPLICATE_TOKEN = match[1].trim();
  }
} catch { /* env file not found */ }

// Demo mode: 精美时尚效果图生成
function generateDemoImage(outfitItems, theme) {
  // 构建一个漂亮的时尚搭配展示图
  const w = 400, h = 600;
  const isMale = theme === 'GRAY';
  const primary = isMale ? '#3B5998' : '#E8A0BF';
  const accent = isMale ? '#F59E0B' : '#B76E79';
  const bg1 = isMale ? '#EFF3FA' : '#FDF2F8';
  const bg2 = isMale ? '#D6E0F0' : '#F5D5E5';

  const items = outfitItems || [];
  const topItem = items.find(i => i.catName === '上装' || i.catName === '连衣裙');
  const bottomItem = items.find(i => i.catName === '下装');
  const shoeItem = items.find(i => i.catName === '鞋子');
  const accessoryItems = items.filter(i => !['上装','下装','连衣裙','鞋子'].includes(i.catName));

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bg1}"/>
      <stop offset="100%" stop-color="${bg2}"/>
    </linearGradient>
    <filter id="shadow"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.1"/></filter>
  </defs>
  <!-- Background -->
  <rect width="${w}" height="${h}" fill="url(#bgGrad)"/>
  
  <!-- Fashion illustration silhouette -->
  <g transform="translate(200, 0)" opacity="0.6">
    <!-- Head -->
    <ellipse cx="0" cy="55" rx="22" ry="26" fill="${primary}" opacity="0.2"/>
    <!-- Hair -->
    <ellipse cx="0" cy="40" rx="24" ry="20" fill="${primary}" opacity="0.15"/>
    <!-- Neck -->
    <rect x="-4" y="79" width="8" height="12" rx="3" fill="${primary}" opacity="0.15"/>
    <!-- Upper body -->
    <path d="M-32,95 Q-38,120 -36,200 Q0,210 36,200 Q38,120 32,95 Z" fill="${primary}" opacity="0.12"/>
    <!-- Waist -->
    <rect x="-18" y="200" width="36" height="8" rx="4" fill="${primary}" opacity="0.08"/>
    <!-- Lower body -->
    <path d="M-18,208 Q-24,300 -16,400 Q0,410 16,400 Q24,300 18,208 Z" fill="${primary}" opacity="0.08"/>
    <!-- Arms -->
    <path d="M-32,100 Q-44,140 -42,200 Q-40,210 -34,200 Q-36,140 -28,105 Z" fill="${primary}" opacity="0.1"/>
    <path d="M32,100 Q44,140 42,200 Q40,210 34,200 Q36,140 28,105 Z" fill="${primary}" opacity="0.1"/>
    <!-- Shoes -->
    <ellipse cx="-14" cy="405" rx="16" ry="8" fill="${primary}" opacity="0.15"/>
    <ellipse cx="14" cy="405" rx="16" ry="8" fill="${primary}" opacity="0.15"/>
  </g>

  <!-- Title -->
  <rect x="30" y="440" width="${w-60}" height="28" rx="8" fill="${primary}" opacity="0.9"/>
  <text x="${w/2}" y="459" text-anchor="middle" font-size="13" font-family="sans-serif" fill="white" font-weight="bold">✨ AI 虚拟试穿效果</text>

  <!-- Items list -->
  <rect x="30" y="478" width="${w-60}" height="${28 + Math.min(items.length, 5) * 22}" rx="8" fill="white" opacity="0.9"/>
  <text x="${w/2}" y="498" text-anchor="middle" font-size="12" font-family="sans-serif" fill="${primary}" font-weight="bold">搭配组合</text>
  ${items.slice(0, 5).map((it, i) => `
    <text x="50" y="${520 + i * 22}" font-size="11" font-family="sans-serif" fill="#666">
      ${it.catName || '物品'} · ${it.name}
    </text>`).join('')}

  <!-- Footer -->
  <text x="${w/2}" y="${h-15}" text-anchor="middle" font-size="10" font-family="sans-serif" fill="${primary}" opacity="0.5">
    Powered by AI · 仅供演示
  </text>
  </svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// AI Virtual Try-On endpoint
router.post('/try-on', async (req, res) => {
  const { items, theme } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: '请选择搭配物品' });
  }

  // 如果没有配置 API Token，使用 Demo 模式
  if (!REPLICATE_TOKEN) {
    console.log('[Try-On] Demo mode: generating fashion illustration');
    const image = generateDemoImage(items, theme);
    return res.json({
      image,
      mode: 'demo',
      message: 'Demo 模式：配置 Replicate API Token 后可生成真人试穿效果',
    });
  }

  // AI 模式：调用 Replicate IDM-VTON
  try {
    const Replicate = (await import('replicate')).default;
    const replicate = new Replicate({ auth: REPLICATE_TOKEN });

    // 分类物品
    const topItem = items.find(i => i.catName === '上装');
    const bottomItem = items.find(i => i.catName === '下装');
    const dressItem = items.find(i => i.catName === '连衣裙');
    const shoeItem = items.find(i => i.catName === '鞋子');

    // 优先级：连衣裙 > 上装
    const primaryGarment = dressItem || topItem;

    if (!primaryGarment || !primaryGarment.image) {
      const image = generateDemoImage(items, theme);
      return res.json({ image, mode: 'demo', message: '该物品无照片，无法进行AI试穿' });
    }

    // 判断类别
    let category = 'upper_body';
    if (dressItem) category = 'dresses';
    else if (primaryGarment.catName === '下装') category = 'lower_body';

    // 使用默认模特照片（后续可让用户上传自己的照片）
    // 这里需要一个公开可访问的模特照片URL
    const modelImageUrl = 'https://replicate.delivery/yhqm/GWptmjO5Uu4C0EoTl3NHJDfpJbXpGByx6VSUuPLBdCu4yW7nA/out.png';

    console.log(`[Try-On] AI mode: generating try-on for ${primaryGarment.name} (${category})`);

    const output = await replicate.run(
      'cuuupid/idm-vton:e3893af4fb4bd5741752b35b395348c5f7a9ab5c4776264f5d38e41418081ed7',
      {
        input: {
          category,
          human_img: modelImageUrl,
          garm_img: primaryGarment.image,
          garment_des: primaryGarment.name,
        },
      }
    );

    // Replicate 返回文件URL
    const resultUrl = Array.isArray(output) ? output[0] : output;
    console.log(`[Try-On] AI try-on complete: ${resultUrl}`);

    return res.json({
      image: resultUrl,
      mode: 'ai',
      message: 'AI 试穿生成完成',
    });
  } catch (err) {
    console.error('[Try-On] Error:', err.message);
    // AI 失败时降级为 Demo 模式
    const image = generateDemoImage(items, theme);
    return res.json({
      image,
      mode: 'demo',
      message: 'AI 服务暂时不可用，显示 Demo 效果',
    });
  }
});

// 检查 API 状态
router.get('/try-on-status', (req, res) => {
  res.json({
    aiAvailable: !!REPLICATE_TOKEN,
    mode: REPLICATE_TOKEN ? 'ai' : 'demo',
  });
});

export default router;
