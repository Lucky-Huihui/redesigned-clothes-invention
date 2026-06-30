import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store';
import { setAuth } from '@/store/slices/authSlice';
import { getMe } from '@/api/auth';
import { getCategories } from '@/api/categories';
import { getItems } from '@/api/items';
import BottomNav from '@/components/BottomNav';
import { cn } from '@/lib/utils';
import type { AppCategory, AppItem } from '@/types';

const CATEGORY_ICONS: Record<string, string> = {
  '上装': '👕', '下装': '👖', '袜子': '🧦', '鞋子': '👟',
  '发饰': '🎀', '耳饰': '💎', '外套': '🧥', '背包': '🎒',
};

export default function Items() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const [categories, setCategories] = useState<AppCategory[]>([]);
  const [allItems, setAllItems] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      if (!user) {
        const me = await getMe();
        dispatch(setAuth({ user: me, token: localStorage.getItem('closetmate_token') || '' }));
      }
      const [cats, items] = await Promise.all([getCategories(), getItems()]);
      setCategories(cats);
      setAllItems(items);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, [user, dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getItemCount = (catId: string) => allItems.filter(i => i.category_id === catId).length;

  const handleFabClick = () => {
    if (categories.length === 0) {
      navigate('/categories/manage');
    } else {
      navigate(`/items/new/${categories[0].id}`);
    }
  };

  return (
    <div className="app-shell min-h-screen bg-bg">
      {/* Header */}
      <header className="relative flex items-center justify-center pt-4 px-5">
        <h1 className="text-xl font-semibold text-ink tracking-tight">我的衣橱</h1>
        <button
          aria-label="分类管理"
          onClick={() => navigate('/categories/manage')}
          className="absolute right-5 top-4 p-1 text-ink-2 transition-colors duration-150 active:text-ink"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
          </svg>
        </button>
      </header>

      {/* Stats */}
      <div className="px-5 pt-2 pb-4 text-center">
        <span className="text-sm text-ink-2">
          共 {allItems.length} 件物品 · {categories.length} 个分类
        </span>
      </div>

      {/* Category Grid */}
      <main className="px-5 pb-28">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-ink-3">
            <div className="w-8 h-8 border-2 border-border-light border-t-primary rounded-full animate-spin mb-3" />
            <span className="text-sm">加载中...</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-4xl mb-3">🗂️</div>
            <p className="text-sm text-ink-2 mb-1">还没有分类</p>
            <p className="text-xs text-ink-3">点击下方按钮添加分类</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {categories.map(cat => (
              <div
                key={cat.id}
                onClick={() => navigate(`/categories/${cat.id}`)}
                className={cn(
                  'col-span-1 flex flex-col items-center gap-2 p-4 rounded-xl bg-surface border border-border-light cursor-pointer',
                  'transition-all duration-150 ease-app-fast active:scale-[0.98]'
                )}
                style={{ borderLeftWidth: '3px', borderLeftColor: 'var(--color-primary)' }}
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-md bg-primary-bg text-2xl">
                  {CATEGORY_ICONS[cat.name] || cat.icon}
                </div>
                <span className="text-sm font-medium text-ink">{cat.name}</span>
                <span className="text-xs text-ink-3">{getItemCount(cat.id)} 件</span>
              </div>
            ))}

            {/* Add Category Button */}
            <div
              onClick={() => navigate('/categories/manage')}
              className={cn(
                'col-span-2 flex flex-col items-center justify-center gap-2 p-4 rounded-xl',
                'border-2 border-dashed border-border cursor-pointer',
                'transition-colors duration-150 active:bg-bg-secondary'
              )}
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-md text-ink-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <span className="text-sm font-medium text-ink-3">添加分类</span>
            </div>
          </div>
        )}
      </main>

      {/* FAB */}
      <button
        onClick={handleFabClick}
        className={cn(
          'fixed bottom-20 right-5 z-sticky w-[52px] h-[52px] rounded-full',
          'flex items-center justify-center bg-primary text-brand-ink',
          'shadow-fab border-none transition-transform duration-150 ease-app-fast active:scale-95'
        )}
        aria-label="添加物品"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      <BottomNav current="items" />
    </div>
  );
}
