import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { selectItem, deselectItem } from '@/store/slices/outfitDraftSlice';
import BottomNav from '@/components/BottomNav';

export default function OutfitSelect() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userId = useAppSelector((s) => s.auth.currentUserId);
  const theme = useAppSelector((s) => s.theme.theme);
  const categories = useAppSelector((s) =>
    s.categories.categories.filter((c) => c.userId === userId)
  );
  const items = useAppSelector((s) => s.items.items.filter((i) => i.userId === userId));
  const selections = useAppSelector((s) => s.outfitDraft.selections);

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const itemsByCategory = useMemo(() => {
    const map: Record<string, typeof items> = {};
    categories.forEach((c) => {
      map[c.categoryId] = items.filter((i) => i.categoryId === c.categoryId);
    });
    return map;
  }, [categories, items]);

  const activeCategory = useMemo(() => {
    if (activeCategoryId) return categories.find((c) => c.categoryId === activeCategoryId) || null;
    const withItems = categories.find((c) => (itemsByCategory[c.categoryId] || []).length > 0);
    return withItems || null;
  }, [activeCategoryId, categories, itemsByCategory]);

  const requiredNames = ['上装', '下装', '鞋子'];
  const requiredCategoryIds = categories
    .filter((c) => requiredNames.includes(c.name))
    .map((c) => c.categoryId);

  const canGenerate = requiredCategoryIds.every((id) => !!selections[id]);

  const selectedItems = useMemo(() => {
    return Object.entries(selections)
      .map(([categoryId, itemId]) => {
        const category = categories.find((c) => c.categoryId === categoryId);
        const item = items.find((i) => i.itemId === itemId);
        return category && item ? { category, item } : null;
      })
      .filter(Boolean) as { category: typeof categories[number]; item: typeof items[number] }[];
  }, [selections, categories, items]);

  const bg = theme === 'PINK' ? 'bg-[#FFF5F7]' : 'bg-[#F8F9FA]';
  const primaryText = theme === 'PINK' ? 'text-[#FF6B81]' : 'text-[#2C3E50]';
  const primaryBg = theme === 'PINK' ? 'bg-[#FF6B81]' : 'bg-[#2C3E50]';
  const radius = theme === 'PINK' ? 'rounded-2xl' : 'rounded-lg';

  return (
    <div className={`min-h-screen pb-32 ${bg}`}>
      <header className="sticky top-0 z-10 bg-white/90 px-5 py-4 backdrop-blur">
        <h1 className={`text-xl font-bold ${primaryText}`}>搭配试穿</h1>
      </header>

      <main className="mx-auto max-w-md px-4 pt-4">
        <section className={`mb-4 bg-white p-4 shadow-sm ${radius}`}>
          <h2 className="mb-2 text-sm font-bold text-gray-700">已选清单</h2>
          <div className="flex flex-wrap gap-2">
            {selectedItems.length === 0 && (
              <span className="text-sm text-gray-400">还未选择任何物品</span>
            )}
            {selectedItems.map(({ category, item }) => (
              <span
                key={category.categoryId}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-white ${primaryBg}`}
              >
                {category.name}：{item.name}
              </span>
            ))}
          </div>
          {!canGenerate && (
            <p className="mt-2 text-xs text-red-400">请至少选择上装、下装和鞋子</p>
          )}
        </section>

        <section className={`mb-4 bg-white p-4 shadow-sm ${radius}`}>
          <h2 className="mb-3 text-sm font-bold text-gray-700">选择分类</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const isActive = activeCategory?.categoryId === category.categoryId;
              const hasSelection = !!selections[category.categoryId];
              return (
                <button
                  key={category.categoryId}
                  onClick={() => setActiveCategoryId(category.categoryId)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? `${primaryBg} border-transparent text-white`
                      : hasSelection
                      ? `border-current ${primaryText} bg-white`
                      : 'border-gray-200 bg-white text-gray-600'
                  }`}
                >
                  {category.name}
                  {hasSelection && ' ✓'}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-bold text-gray-700">
            {activeCategory ? activeCategory.name : '请选择分类'}
          </h2>
          {activeCategory && (
            <div className="grid grid-cols-3 gap-3">
              {(itemsByCategory[activeCategory.categoryId] || []).map((item) => {
                const selected = selections[activeCategory.categoryId] === item.itemId;
                return (
                  <button
                    key={item.itemId}
                    onClick={() =>
                      selected
                        ? dispatch(
                            deselectItem({ categoryId: activeCategory.categoryId, itemId: item.itemId })
                          )
                        : dispatch(
                            selectItem({ categoryId: activeCategory.categoryId, itemId: item.itemId })
                          )
                    }
                    className={`relative overflow-hidden bg-white p-2 shadow-sm transition-transform active:scale-95 ${radius} ${
                      selected ? `ring-2 ${theme === 'PINK' ? 'ring-[#FF6B81]' : 'ring-[#2C3E50]'}` : ''
                    }`}
                  >
                    <div style={{ aspectRatio: '1/1' }}>
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full rounded-lg object-cover"
                      />
                    </div>
                    <p className="mt-1 truncate text-xs text-gray-700">{item.name}</p>
                    {selected && (
                      <span
                        className={`absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full text-xs text-white ${primaryBg}`}
                      >
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <div className="fixed bottom-16 left-0 right-0 border-t border-gray-100 bg-white p-4">
        <div className="mx-auto max-w-md">
          <button
            onClick={() => canGenerate && navigate('/outfits/result')}
            disabled={!canGenerate}
            className={`w-full py-3.5 font-bold text-white shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 ${primaryBg} ${radius}`}
          >
            开始试穿
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
