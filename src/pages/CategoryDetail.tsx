import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCategories } from '@/api/categories';
import { getItems, deleteItem } from '@/api/items';
import { useAppSelector } from '@/store';
import { getThemeColors, formatDate } from '@/utils/theme';
import type { AppCategory, AppItem } from '@/types';

export default function CategoryDetail() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const theme = useAppSelector((s) => s.theme.theme);
  const colors = getThemeColors(theme);

  const [category, setCategory] = useState<AppCategory | null>(null);
  const [items, setItems] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const cats = await getCategories();
      const cat = cats.find(c => c.id === categoryId);
      setCategory(cat || null);
      const its = await getItems(categoryId!);
      setItems(its);
    } catch (err) {
      console.error('Failed to load:', err);
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (itemId: string) => {
    if (!confirm('确定要删除这个物品吗？')) return;
    try {
      await deleteItem(itemId);
      setItems(prev => prev.filter(i => i.id !== itemId));
    } catch (err: any) {
      alert(err.message || '删除失败');
    }
  };

  return (
    <div className="min-h-screen" style={{ background: colors.bgSecondary, fontFamily: "'Inter','Noto Sans SC',sans-serif", maxWidth: '375px', margin: '0 auto' }}>
      {/* Top Nav */}
      <nav className="sticky top-0 z-20 flex items-center justify-between px-4 h-14 border-b"
        style={{ background: colors.bg, borderColor: colors.borderLight, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
        <button onClick={() => navigate('/items')} className="flex items-center justify-center w-9 h-9 -ml-1 rounded-lg text-gray-900">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5m7-7-7 7 7 7"/></svg>
        </button>
        <h1 className="text-base font-semibold text-gray-900">{category?.name || '加载中...'}</h1>
        <button onClick={() => navigate('/categories/manage')} className="text-sm font-medium px-2 py-1 rounded-lg"
          style={{ color: colors.primary }}>管理</button>
      </nav>

      {/* Item Waterfall Grid */}
      <div className="px-3 pt-3 pb-24">
        {loading ? (
          <div className="text-center py-12 text-gray-400">加载中...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-gray-400 text-sm">还没有物品，点击下方按钮添加</p>
          </div>
        ) : (
          <div className="columns-2 gap-3 space-y-3">
            {items.map(item => (
              <div key={item.id}
                className="break-inside-avoid rounded-xl overflow-hidden transition-transform duration-200 cursor-pointer active:scale-[0.97]"
                style={{ background: colors.bg, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}
                onClick={() => navigate(`/items/${item.id}`)}
              >
                <div className="relative">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full object-cover" style={{ aspectRatio: '3/4', background: colors.primaryBg }} />
                  ) : (
                    <div className="w-full flex items-center justify-center text-4xl" style={{ aspectRatio: '3/4', background: colors.primaryBg }}>
                      👗
                    </div>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center opacity-60 hover:opacity-100"
                    style={{ background: colors.bg, color: colors.textTertiary }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                  </button>
                </div>
                <div className="px-3 pt-2 pb-3">
                  <p className="text-sm font-medium leading-tight text-gray-900">{item.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-400">{formatDate(item.created_at)}</span>
                    {item.price && <span className="text-xs font-medium" style={{ color: colors.primary }}>¥{item.price}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate(`/items/new/${categoryId}`)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center z-30 transition-transform duration-200 active:scale-95 border-none"
        style={{
          background: colors.primary,
          color: colors.textOnPrimary,
          boxShadow: `0 8px 24px -4px ${theme === 'GRAY' ? 'rgba(59,89,152,0.45)' : 'rgba(232,160,191,0.45)'}`,
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
      </button>
    </div>
  );
}
