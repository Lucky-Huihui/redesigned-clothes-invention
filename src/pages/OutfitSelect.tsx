import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories } from '@/api/categories';
import { getItems } from '@/api/items';
import { createOutfit } from '@/api/outfits';
import { useAppSelector } from '@/store';
import BottomNav from '@/components/BottomNav';
import { getThemeColors } from '@/utils/theme';
import type { AppCategory, AppItem } from '@/types';

// 上衣类：上装 or 连衣裙可以充当"上装"
const TOP_CATS = ['上装', '连衣裙'];
// 下装类：下装 or 连衣裙可以充当"下装"
const BOTTOM_CATS = ['下装', '连衣裙'];
const SHOE_CATS = ['鞋子'];

// 优先展示的分类
const PRIMARY_CATS = ['上装', '下装', '连衣裙', '外套', '鞋子'];

export default function OutfitSelect() {
  const navigate = useNavigate();
  const theme = useAppSelector((s) => s.theme.theme);
  const colors = getThemeColors(theme);

  const [categories, setCategories] = useState<AppCategory[]>([]);
  const [items, setItems] = useState<Record<string, AppItem[]>>({});
  const [selectedCat, setSelectedCat] = useState<string>('');
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const cats = await getCategories();
      setCategories(cats);
      const allItems = await getItems();
      const grouped: Record<string, AppItem[]> = {};
      for (const cat of cats) {
        grouped[cat.id] = allItems.filter(i => i.category_id === cat.id);
      }
      setItems(grouped);
      if (cats.length > 0) setSelectedCat(cats[0].id);
    } catch (err) {
      console.error('Failed to load:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const selectItem = (catId: string, itemId: string) => {
    setSelections(prev => {
      if (prev[catId] === itemId) {
        const next = { ...prev };
        delete next[catId];
        return next;
      }
      return { ...prev, [catId]: itemId };
    });
  };

  const getSelectedItem = (catId: string) => {
    const itemId = selections[catId];
    if (!itemId) return null;
    const catItems = items[catId] || [];
    return catItems.find(i => i.id === itemId) || null;
  };

  // 检查必选项：上衣（上装或连衣裙）+ 下装（下装或连衣裙）+ 鞋子
  const checkRequired = () => {
    const hasTop = TOP_CATS.some(name => {
      const cat = categories.find(c => c.name === name);
      return cat && selections[cat.id];
    });
    const hasBottom = BOTTOM_CATS.some(name => {
      const cat = categories.find(c => c.name === name);
      return cat && selections[cat.id];
    });
    const hasShoe = SHOE_CATS.some(name => {
      const cat = categories.find(c => c.name === name);
      return cat && selections[cat.id];
    });
    return hasTop && hasBottom && hasShoe;
  };

  const handleTryOn = async () => {
    if (!checkRequired()) return;
    setSaving(true);
    try {
      const itemIds = Object.values(selections);
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 560;
      const ctx = canvas.getContext('2d')!;

      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, theme === 'GRAY' ? '#EFF3FA' : '#FDF2F8');
      grad.addColorStop(1, theme === 'GRAY' ? '#E8EDF5' : '#FCEEF5');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = theme === 'GRAY' ? '#3B5998' : '#E8A0BF';
      ctx.lineWidth = 2;
      ctx.fillStyle = theme === 'GRAY' ? 'rgba(59,89,152,0.1)' : 'rgba(232,160,191,0.1)';
      ctx.beginPath(); ctx.ellipse(200, 80, 32, 38, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(200, 118); ctx.lineTo(200, 320); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(140, 140); ctx.lineTo(260, 140); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(140, 140); ctx.lineTo(110, 260); ctx.moveTo(260, 140); ctx.lineTo(290, 260); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(200, 320); ctx.lineTo(170, 460); ctx.moveTo(200, 320); ctx.lineTo(230, 460); ctx.stroke();

      ctx.fillStyle = theme === 'GRAY' ? '#3B5998' : '#B76E79';
      ctx.font = 'bold 14px "Noto Sans SC", sans-serif';
      ctx.textAlign = 'center';
      let y = 400;
      for (const itemId of itemIds) {
        const allIt = Object.values(items).flat();
        const it = allIt.find(i => i.id === itemId);
        if (it) { ctx.fillText(it.name, 200, y); y += 22; }
      }
      ctx.fillStyle = theme === 'GRAY' ? 'rgba(59,89,152,0.4)' : 'rgba(232,160,191,0.4)';
      ctx.font = '12px "Noto Sans SC", sans-serif';
      ctx.fillText('AI 试穿模拟效果', 200, 500);
      ctx.fillText('本图为前端模拟生成，仅供演示', 200, 520);

      const resultImage = canvas.toDataURL('image/jpeg', 0.8);
      const outfit = await createOutfit(itemIds, resultImage);
      navigate('/outfits/result', { state: { outfit } });
    } catch (err: any) {
      alert(err.message || '试穿失败');
    } finally {
      setSaving(false);
    }
  };

  const catItems = selectedCat ? (items[selectedCat] || []) : [];
  const currentCat = categories.find(c => c.id === selectedCat);
  const allSelected = checkRequired();
  const selectedCount = Object.keys(selections).length;

  // 分离主分类和剩余分类
  const primaryCats = categories.filter(c => PRIMARY_CATS.includes(c.name));
  const moreCats = categories.filter(c => !PRIMARY_CATS.includes(c.name));

  const CAT_ICONS: Record<string, string> = {
    '上装': '👕', '下装': '👖', '连衣裙': '👗', '袜子': '🧦', '鞋子': '👟',
    '发饰': '🎀', '耳饰': '💎', '外套': '🧥', '背包': '👜',
  };

  // 判断某个分类是否被选中
  const isCatSelected = (catId: string) => !!selections[catId];

  // 必选提示
  const getMissingHint = () => {
    const missing = [];
    const hasTop = TOP_CATS.some(n => { const c = categories.find(cc => cc.name === n); return c && selections[c.id]; });
    const hasBottom = BOTTOM_CATS.some(n => { const c = categories.find(cc => cc.name === n); return c && selections[c.id]; });
    const hasShoe = SHOE_CATS.some(n => { const c = categories.find(cc => cc.name === n); return c && selections[c.id]; });
    if (!hasTop) missing.push('上衣');
    if (!hasBottom) missing.push('下装');
    if (!hasShoe) missing.push('鞋子');
    return missing.join('、');
  };

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter','Noto Sans SC',sans-serif", maxWidth: '375px', margin: '0 auto', background: colors.bg }}>
      <header className="flex items-center justify-center pt-3 pb-2 h-14">
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">搭配</h1>
      </header>

      {loading ? (
        <div className="text-center py-12 text-gray-400">加载中...</div>
      ) : (
        <>
          {/* 已选物品栏 */}
          <div className="px-4 pb-2">
            <div className="flex items-center gap-2 py-2">
              <span className="text-xs text-gray-400 whitespace-nowrap">已选 ({selectedCount})</span>
              <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1">
                {Object.entries(selections).map(([catId]) => {
                  const cat = categories.find(c => c.id === catId);
                  const it = getSelectedItem(catId);
                  return (
                    <div key={catId}
                      className="w-10 h-10 rounded-full border-2 flex-shrink-0 flex items-center justify-center relative overflow-hidden"
                      style={{ borderColor: colors.primary, background: colors.primaryBg }}>
                      {it?.image ? (
                        <img src={it.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg">{CAT_ICONS[cat?.name || ''] || cat?.icon || '📦'}</span>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-[15px] h-[15px] rounded-full flex items-center justify-center"
                        style={{ background: colors.primary }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
                      </div>
                    </div>
                  );
                })}
                {Object.keys(selections).length === 0 && (
                  <span className="text-xs text-gray-300 whitespace-nowrap self-center">请选择 上衣 + 下装 + 鞋子</span>
                )}
              </div>
            </div>
          </div>

          <div className="mx-4 h-px" style={{ background: colors.borderLight }} />

          {/* 分类选择区 */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 flex-wrap">
              {primaryCats.map(cat => {
                const isSel = selectedCat === cat.id;
                const hasSelected = isCatSelected(cat.id);
                return (
                  <button key={cat.id}
                    onClick={() => { setSelectedCat(cat.id); setShowMore(false); }}
                    className="flex-shrink-0 px-3 py-1.5 text-[13px] font-medium rounded-full transition-all relative flex items-center gap-1 border-0 cursor-pointer"
                    style={{
                      background: isSel ? colors.primary : colors.bgTertiary,
                      color: isSel ? colors.textOnPrimary : colors.textSecondary,
                      outline: hasSelected && !isSel ? `2px solid ${colors.primary}` : 'none',
                      outlineOffset: '1px',
                    }}>
                    {CAT_ICONS[cat.name] || cat.icon}
                    {cat.name}
                    {hasSelected && (
                      <span className="ml-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ background: isSel ? 'rgba(255,255,255,0.3)' : colors.primary }}>
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
                      </span>
                    )}
                  </button>
                );
              })}

              {/* 更多 ▼ 按钮 */}
              {moreCats.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowMore(!showMore)}
                    className="flex-shrink-0 px-3 py-1.5 text-[13px] font-medium rounded-full transition-all flex items-center gap-1 border-0 cursor-pointer"
                    style={{
                      background: showMore ? colors.primary : colors.bgTertiary,
                      color: showMore ? colors.textOnPrimary : colors.textSecondary,
                    }}>
                    更多
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      style={{ transform: showMore ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </button>

                  {/* 下拉菜单 */}
                  {showMore && (
                    <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 p-2 z-20 min-w-[120px]"
                      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                      {moreCats.map(cat => {
                        const isSel = selectedCat === cat.id;
                        const hasSelected = isCatSelected(cat.id);
                        return (
                          <button key={cat.id}
                            onClick={() => { setSelectedCat(cat.id); setShowMore(false); }}
                            className="w-full px-3 py-2 text-[13px] font-medium rounded-lg transition-all flex items-center gap-2 border-0 cursor-pointer text-left"
                            style={{
                              background: isSel ? colors.primaryBg : 'transparent',
                              color: isSel ? colors.primary : colors.textSecondary,
                            }}>
                            {CAT_ICONS[cat.name] || cat.icon}
                            {cat.name}
                            {hasSelected && (
                              <span className="ml-auto text-xs px-1.5 py-0.5 rounded" style={{ background: colors.primary, color: 'white' }}>✓</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mx-4 h-px" style={{ background: colors.borderLight }} />

          {/* 物品网格 */}
          <div className="px-4 pt-4 pb-4">
            {currentCat && (
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-900">
                  {CAT_ICONS[currentCat.name] || currentCat.icon} {currentCat.name}
                  <span className="text-gray-400 font-normal ml-1">· {catItems.length}件</span>
                </span>
              </div>
            )}
            <div className="grid grid-cols-3 gap-2.5">
              {catItems.map(item => {
                const isSelected = selections[item.category_id] === item.id;
                return (
                  <div key={item.id}
                    onClick={() => selectItem(item.category_id, item.id)}
                    className="rounded-xl overflow-hidden cursor-pointer transition-all active:scale-[0.97]"
                    style={{
                      background: colors.bg,
                      boxShadow: isSelected ? `0 0 0 2px ${colors.primary}` : '0 1px 3px rgba(0,0,0,0.03)',
                      border: isSelected ? 'none' : `1px solid ${colors.borderLight}`,
                    }}>
                    <div className="w-full aspect-square relative" style={{ background: colors.primaryBg }}>
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center text-[36px]">
                          {CAT_ICONS[currentCat?.name || ''] || '📦'}
                        </span>
                      )}
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-[22px] h-[22px] rounded-full flex items-center justify-center"
                          style={{ background: colors.primary }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
                        </div>
                      )}
                    </div>
                    <div className="px-2 py-2 text-center">
                      <p className="text-xs font-medium truncate" style={{ color: isSelected ? colors.textPrimary : colors.textSecondary }}>
                        {item.name}
                      </p>
                      {item.price && (
                        <p className="text-[10px] mt-0.5" style={{ color: colors.primary }}>¥{item.price}</p>
                      )}
                    </div>
                  </div>
                );
              })}
              {catItems.length === 0 && (
                <div className="col-span-3 text-center py-6 text-gray-400 text-sm">
                  暂无物品，先在衣橱中添加
                </div>
              )}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[375px] px-4 pt-3 pb-2 bg-gradient-to-t from-white via-white z-10">
            <button
              onClick={handleTryOn}
              disabled={!allSelected || saving}
              className="w-full py-3.5 rounded-full text-base font-semibold transition-all active:scale-[0.98]"
              style={{
                background: allSelected ? colors.primary : colors.bgTertiary,
                color: allSelected ? colors.textOnPrimary : colors.textTertiary,
                cursor: allSelected ? 'pointer' : 'not-allowed',
              }}>
              {saving ? '生成中...' : allSelected ? '开始试穿' : `请选择 ${getMissingHint()}`}
            </button>
          </div>
        </>
      )}

      <BottomNav current="outfits" />
    </div>
  );
}
