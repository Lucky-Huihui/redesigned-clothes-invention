import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories } from '@/api/categories';
import { getItems } from '@/api/items';
import { createOutfit } from '@/api/outfits';
import { useAppSelector } from '@/store';
import BottomNav from '@/components/BottomNav';
import { getThemeColors } from '@/utils/theme';
import type { AppCategory, AppItem } from '@/types';

const REQUIRED_CATEGORIES = ['上装', '下装', '鞋子'];

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

  const checkRequired = () => {
    return REQUIRED_CATEGORIES.every(name => {
      const cat = categories.find(c => c.name === name);
      return cat && selections[cat.id];
    });
  };

  const handleTryOn = async () => {
    if (!checkRequired()) return;
    setSaving(true);
    try {
      const itemIds = Object.values(selections);

      // Simulate AI try-on with a gradient canvas
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 560;
      const ctx = canvas.getContext('2d')!;

      // Draw gradient background
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, theme === 'GRAY' ? '#EFF3FA' : '#FDF2F8');
      grad.addColorStop(1, theme === 'GRAY' ? '#E8EDF5' : '#FCEEF5');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw human silhouette
      ctx.strokeStyle = theme === 'GRAY' ? '#3B5998' : '#E8A0BF';
      ctx.lineWidth = 2;
      ctx.fillStyle = theme === 'GRAY' ? 'rgba(59,89,152,0.1)' : 'rgba(232,160,191,0.1)';

      // Head
      ctx.beginPath();
      ctx.ellipse(200, 80, 32, 38, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Body
      ctx.beginPath();
      ctx.moveTo(200, 118);
      ctx.lineTo(200, 320);
      ctx.stroke();
      // Shoulders
      ctx.beginPath();
      ctx.moveTo(140, 140);
      ctx.lineTo(260, 140);
      ctx.stroke();
      // Arms
      ctx.beginPath();
      ctx.moveTo(140, 140);
      ctx.lineTo(110, 260);
      ctx.moveTo(260, 140);
      ctx.lineTo(290, 260);
      ctx.stroke();
      // Legs
      ctx.beginPath();
      ctx.moveTo(200, 320);
      ctx.lineTo(170, 460);
      ctx.moveTo(200, 320);
      ctx.lineTo(230, 460);
      ctx.stroke();

      // Draw selected item names
      ctx.fillStyle = theme === 'GRAY' ? '#3B5998' : '#B76E79';
      ctx.font = 'bold 14px "Noto Sans SC", sans-serif';
      ctx.textAlign = 'center';
      let y = 400;
      for (const itemId of itemIds) {
        const allIts = Object.values(items).flat();
        const it = allIts.find(i => i.id === itemId);
        if (it) {
          ctx.fillText(it.name, 200, y);
          y += 22;
        }
      }

      // Draw watermark
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

  // Build progress steps (only show required categories)
  const progressSteps = REQUIRED_CATEGORIES.map(name => {
    const cat = categories.find(c => c.name === name);
    if (!cat) return { name, done: false, current: false };
    const done = !!selections[cat.id];
    const current = selectedCat === cat.id;
    return { name, done: done && !current, current };
  });

  const CAT_ICONS: Record<string, string> = {
    '上装': '👕', '下装': '👖', '袜子': '🧦', '鞋子': '👟',
    '发饰': '🎀', '耳饰': '💎', '外套': '🧥', '背包': '🎒',
  };

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter','Noto Sans SC',sans-serif", maxWidth: '375px', margin: '0 auto', background: colors.bg }}>
      {/* Header */}
      <header className="flex items-center justify-center pt-3 pb-2 h-14">
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">搭配</h1>
      </header>

      {loading ? (
        <div className="text-center py-12 text-gray-400">加载中...</div>
      ) : (
        <>
          {/* Progress */}
          <div className="flex items-center justify-center gap-0 px-8 py-4">
            {progressSteps.map((step, i) => (
              <div key={step.name} className="flex items-center gap-0">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                    style={{
                      background: step.done ? colors.primary : step.current ? colors.primary : colors.bgTertiary,
                      color: step.done || step.current ? colors.textOnPrimary : colors.textTertiary,
                      boxShadow: step.current ? `0 0 0 3px ${colors.primaryLight}` : 'none',
                    }}>
                    {step.done ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
                    ) : i + 1}
                  </div>
                  <span className="text-[10px]" style={{ color: step.done ? colors.primary : step.current ? colors.textSecondary : colors.textTertiary }}>
                    {step.name}
                  </span>
                </div>
                {i < progressSteps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2 max-w-[40px]"
                    style={{ background: step.done ? colors.primary : colors.border }} />
                )}
              </div>
            ))}
          </div>

          {/* Category Pills */}
          <div className="px-4 pb-3">
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
              {categories.map(cat => (
                <button key={cat.id}
                  onClick={() => setSelectedCat(cat.id)}
                  className="flex-shrink-0 px-3.5 py-1.5 text-sm font-medium rounded-full whitespace-nowrap border-none cursor-pointer transition-all relative"
                  style={{
                    background: selectedCat === cat.id ? colors.primary : colors.bgTertiary,
                    color: selectedCat === cat.id ? colors.textOnPrimary : colors.textSecondary,
                  }}>
                  {CAT_ICONS[cat.name] || cat.icon} {cat.name}
                  {REQUIRED_CATEGORIES.includes(cat.name) && !selections[cat.id] && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Items */}
          <div className="px-4 pb-3">
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 whitespace-nowrap">已选 ({selectedCount})</span>
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {Object.entries(selections).map(([catId, itemId]) => {
                  const cat = categories.find(c => c.id === catId);
                  const it = getSelectedItem(catId);
                  return (
                    <div key={catId} className="w-11 h-11 rounded-full border-2 flex-shrink-0 flex items-center justify-center relative text-xl"
                      style={{ borderColor: colors.primary, background: colors.bg }}>
                      {CAT_ICONS[cat?.name || ''] || '📦'}
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ background: colors.primary }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mx-4 h-px" style={{ background: colors.borderLight }} />

          {/* Item Grid */}
          <div className="px-4 pt-4 pb-4">
            {currentCat && (
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-900">
                  {currentCat.name} · {catItems.length}件
                </span>
              </div>
            )}
            <div className="grid grid-cols-3 gap-3">
              {catItems.map(item => {
                const isSelected = selections[item.category_id] === item.id;
                return (
                  <div key={item.id}
                    onClick={() => selectItem(item.category_id, item.id)}
                    className="rounded-xl overflow-hidden cursor-pointer transition-all active:scale-[0.97] relative"
                    style={{
                      background: colors.bg,
                      boxShadow: isSelected ? `0 0 0 2px ${colors.primary}` : '0 1px 3px rgba(0,0,0,0.03)',
                      border: isSelected ? 'none' : `1px solid ${colors.borderLight}`,
                    }}>
                    <div className="w-full aspect-square flex items-center justify-center text-[40px] relative"
                      style={{ background: colors.primaryBg }}>
                      {CAT_ICONS[currentCat?.name || ''] || '📦'}
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-[22px] h-[22px] rounded-full flex items-center justify-center"
                          style={{ background: colors.primary }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
                        </div>
                      )}
                    </div>
                    <div className="px-2 py-2 text-center">
                      <span className="text-xs" style={{ color: isSelected ? colors.textPrimary : colors.textSecondary, fontWeight: 500 }}>{item.name}</span>
                    </div>
                  </div>
                );
              })}
              {catItems.length === 0 && (
                <div className="col-span-3 text-center py-8 text-gray-400 text-sm">
                  此分类暂未添加物品
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
              {saving ? '生成中...' : allSelected ? '开始试穿' : '请选择必选分类物品'}
            </button>
          </div>
        </>
      )}

      <BottomNav current="outfits" />
    </div>
  );
}
