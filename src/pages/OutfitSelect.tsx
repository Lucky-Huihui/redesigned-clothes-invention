import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import { getCategories } from '@/api/categories';
import { getItems } from '@/api/items';
import { createOutfit, tryOnAI } from '@/api/outfits';
import { useAppSelector } from '@/store';
import BottomNav from '@/components/BottomNav';
import { getErrorMessage } from '@/utils/error';
import { cn } from '@/lib/utils';
import type { AppCategory, AppItem } from '@/types';

// 上装类：上装 or 连衣裙可以充当"上装"
const TOP_CATS = ['上装', '连衣裙'];
// 下装类：下装 or 连衣裙可以充当"下装"
const BOTTOM_CATS = ['下装', '连衣裙'];
const SHOE_CATS = ['鞋子'];

const CAT_ICONS: Record<string, string> = {
  上装: '👕',
  下装: '👖',
  连衣裙: '👗',
  袜子: '🧦',
  鞋子: '👟',
  发饰: '🎀',
  耳饰: '💎',
  外套: '🧥',
  背包: '👜',
};

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const SmallCheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export default function OutfitSelect() {
  const navigate = useNavigate();
  const theme = useAppSelector((s) => s.theme.theme);

  const [categories, setCategories] = useState<AppCategory[]>([]);
  const [items, setItems] = useState<Record<string, AppItem[]>>({});
  const [selectedCat, setSelectedCat] = useState<string>('');
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const loadData = useCallback(async () => {
    try {
      const cats = await getCategories();
      const allItems = await getItems();
      const grouped: Record<string, AppItem[]> = {};
      for (const cat of cats) {
        grouped[cat.id] = allItems.filter((i) => i.category_id === cat.id);
      }
      setCategories(cats);
      setItems(grouped);
      if (cats.length > 0) setSelectedCat(cats[0].id);
    } catch (err) {
      console.error('Failed to load:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const el = tabRefs.current[selectedCat];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedCat]);

  const selectItem = (catId: string, itemId: string) => {
    setSelections((prev) => {
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
    return (items[catId] || []).find((i) => i.id === itemId) || null;
  };

  const requiredSteps = useMemo(
    () => [
      { key: 'top', label: '上装', names: TOP_CATS },
      { key: 'bottom', label: '下装', names: BOTTOM_CATS },
      { key: 'shoe', label: '鞋子', names: SHOE_CATS },
    ],
    []
  );

  const stepStates = useMemo(() => {
    const states = requiredSteps.map((step) => {
      const completed = step.names.some((name) => {
        const cat = categories.find((c) => c.name === name);
        return cat && selections[cat.id];
      });
      return { ...step, completed };
    });
    const firstPendingIndex = states.findIndex((s) => !s.completed);
    return states.map((s, idx) => ({
      ...s,
      status: s.completed ? 'completed' : idx === firstPendingIndex ? 'current' : 'pending',
    }));
  }, [requiredSteps, categories, selections]);

  const allSelected = stepStates.every((s) => s.completed);

  const isRequiredCat = (cat: AppCategory) =>
    cat.name === '上装' || cat.name === '下装' || cat.name === '鞋子';

  const isCatCompleted = (cat: AppCategory) => {
    if (cat.name === '上装') {
      return TOP_CATS.some((name) => {
        const c = categories.find((cc) => cc.name === name);
        return c && selections[c.id];
      });
    }
    if (cat.name === '下装') {
      return BOTTOM_CATS.some((name) => {
        const c = categories.find((cc) => cc.name === name);
        return c && selections[c.id];
      });
    }
    if (cat.name === '鞋子') {
      return SHOE_CATS.some((name) => {
        const c = categories.find((cc) => cc.name === name);
        return c && selections[c.id];
      });
    }
    return !!selections[cat.id];
  };

  const handleTryOn = async () => {
    if (!allSelected) return;
    setSaving(true);
    try {
      const allIt: AppItem[] = Object.values(items).flat();
      const selectedItems: { id: string; name: string; image: string; catName: string }[] = Object.entries(
        selections
      ).map(([catId, itemId]) => {
        const it = allIt.find((i) => i.id === itemId);
        const cat = categories.find((c) => c.id === catId);
        return {
          id: itemId,
          name: it?.name || '',
          image: it?.image || '',
          catName: cat?.name || '',
        };
      });

      const tryOnResult = await tryOnAI(selectedItems, theme);
      const itemIds = Object.values(selections) as string[];
      const outfit = await createOutfit(itemIds, tryOnResult.image);
      navigate('/outfits/result', {
        state: {
          outfit: { ...outfit, result_image: tryOnResult.image },
          selectedItems,
          tryOnMode: tryOnResult.mode,
          tryOnMessage: tryOnResult.message,
        },
      });
    } catch (err) {
      alert(getErrorMessage(err, '试穿失败'));
    } finally {
      setSaving(false);
    }
  };

  const catItems = selectedCat ? items[selectedCat] || [] : [];
  const currentCat = categories.find((c) => c.id === selectedCat);
  const filteredItems = filterQuery.trim()
    ? catItems.filter((it) => it.name.toLowerCase().includes(filterQuery.trim().toLowerCase()))
    : catItems;

  return (
    <div className="app-shell min-h-screen bg-bg">
      {/* Header */}
      <header className="flex items-center justify-center h-14 px-4">
        <h1 className="text-xl font-semibold tracking-tight text-ink">搭配</h1>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-ink-3">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-3" />
          <p className="text-sm">加载中...</p>
        </div>
      ) : (
        <>
          {/* Progress Indicator */}
          <section className="flex items-center justify-center px-8 py-4" aria-label="搭配进度">
            {stepStates.map((step, idx) => (
              <div key={step.key} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors',
                      step.status === 'completed' && 'bg-primary text-brand-ink',
                      step.status === 'current' && 'bg-primary text-brand-ink shadow-[0_0_0_3px_var(--color-primary-light)]',
                      step.status === 'pending' && 'bg-bg-tertiary text-ink-3'
                    )}
                  >
                    {step.status === 'completed' ? <CheckIcon /> : idx + 1}
                  </div>
                  <span
                    className={cn(
                      'text-[10px]',
                      step.status === 'completed' && 'text-primary',
                      step.status === 'current' && 'text-ink-2',
                      step.status === 'pending' && 'text-ink-3'
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < stepStates.length - 1 && (
                  <div
                    className={cn(
                      'h-0.5 flex-1 max-w-10 mx-2 transition-colors',
                      step.status === 'completed' ? 'bg-primary' : 'bg-border'
                    )}
                  />
                )}
              </div>
            ))}
          </section>

          {/* Category Tabs */}
          <section className="px-4 pb-3">
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1" role="tablist">
              {categories.map((cat) => {
                const active = selectedCat === cat.id;
                const required = isRequiredCat(cat);
                const completed = isCatCompleted(cat);
                return (
                  <button
                    key={cat.id}
                    ref={(el) => { tabRefs.current[cat.id] = el; }}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setSelectedCat(cat.id)}
                    className={cn(
                      'relative flex-shrink-0 px-3.5 py-1.5 text-sm font-medium rounded-full border-none outline-none transition-colors duration-150',
                      active ? 'bg-primary text-brand-ink' : 'bg-bg-tertiary text-ink-2'
                    )}
                  >
                    {cat.name}
                    {required && !completed && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-error" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Selected Items Preview */}
          <section className="px-4 pb-3">
            <div className="flex items-center gap-3">
              <span className="text-xs text-ink-3 whitespace-nowrap">已选</span>
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {Object.entries(selections).map(([catId]) => {
                  const cat = categories.find((c) => c.id === catId);
                  const it = getSelectedItem(catId);
                  return (
                    <div
                      key={catId}
                      className="relative w-11 h-11 rounded-full border-2 border-primary bg-bg flex-shrink-0 flex items-center justify-center overflow-hidden"
                    >
                      {it?.image ? (
                        <img src={it.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl">{CAT_ICONS[cat?.name || ''] || cat?.icon || '📦'}</span>
                      )}
                      <div className="absolute -bottom-px -right-px w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                        <SmallCheckIcon className="text-white" />
                      </div>
                    </div>
                  );
                })}
                {Object.keys(selections).length === 0 && (
                  <span className="text-xs text-ink-3 py-2">请先选择搭配物品</span>
                )}
              </div>
            </div>
          </section>

          {/* Divider */}
          <div className="h-px bg-border-light mx-4" />

          {/* Item Grid */}
          <section className="px-4 pt-4 pb-32" aria-label="物品列表">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-ink">
                {currentCat?.name} · {filterQuery.trim() ? `${filteredItems.length}/${catItems.length}件` : `${catItems.length}件`}
              </span>
              <button
                className={cn(
                  'flex items-center gap-1 text-xs transition-opacity active:opacity-70',
                  filterOpen ? 'text-primary' : 'text-ink-3'
                )}
                onClick={() => { setFilterOpen(v => !v); if (filterOpen) setFilterQuery(''); }}
                aria-pressed={filterOpen}
              >
                <SlidersHorizontal size={14} />
                筛选
              </button>
            </div>

            {filterOpen && (
              <div className="mb-3 animate-fade-in">
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="搜索物品名称"
                  className="form-input"
                  autoFocus
                />
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              {filteredItems.map((item) => {
                const isSelected = selections[item.category_id] === item.id;
                return (
                  <div
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${item.name}${isSelected ? ' 已选择' : ''}`}
                    onClick={() => selectItem(item.category_id, item.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        selectItem(item.category_id, item.id);
                      }
                    }}
                    className={cn(
                      'rounded-xl overflow-hidden cursor-pointer transition-all duration-150 active:scale-[0.97] bg-surface shadow-card',
                      isSelected && 'ring-2 ring-primary ring-offset-0'
                    )}
                  >
                    <div className="w-full aspect-square relative bg-bg-secondary flex items-center justify-center text-[40px]">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{CAT_ICONS[currentCat?.name || ''] || currentCat?.icon || '📦'}</span>
                      )}
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-[22px] h-[22px] rounded-full bg-primary flex items-center justify-center">
                          <CheckIcon className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className="px-2 py-2 text-center">
                      <span
                        className={cn(
                          'text-xs font-medium line-clamp-1',
                          isSelected ? 'text-ink' : 'text-ink-2'
                        )}
                      >
                        {item.name}
                      </span>
                    </div>
                  </div>
                );
              })}
              {filteredItems.length === 0 && (
                <div className="col-span-3 text-center py-8 text-ink-3 text-sm">
                  {filterQuery.trim() ? '没有匹配的物品' : '暂无物品，先在衣橱中添加吧'}
                </div>
              )}
            </div>
          </section>

          {/* Bottom CTA */}
          <section className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[375px] px-4 pt-3 pb-2 bg-gradient-to-t from-bg via-bg to-transparent z-sticky">
            <button
              onClick={handleTryOn}
              disabled={!allSelected || saving}
              className={cn(
                'w-full py-3.5 rounded-full text-base font-semibold text-center border-none outline-none transition-colors duration-150',
                allSelected
                  ? 'bg-primary text-brand-ink active:scale-[0.98]'
                  : 'bg-bg-tertiary text-ink-3 cursor-not-allowed'
              )}
            >
              {saving ? '生成中...' : allSelected ? '开始试穿' : '请选择必选分类物品'}
            </button>
          </section>
        </>
      )}

      <BottomNav current="outfits" />
    </div>
  );
}
