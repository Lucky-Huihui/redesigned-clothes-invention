import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store';
import { setAuth } from '@/store/slices/authSlice';
import { getMe } from '@/api/auth';
import { getCategories } from '@/api/categories';
import { getItems } from '@/api/items';
import BottomNav from '@/components/BottomNav';
import { getThemeColors } from '@/utils/theme';
import type { AppCategory, AppItem } from '@/types';

export default function Items() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useAppSelector((s) => s.theme.theme);
  const user = useAppSelector((s) => s.auth.user);
  const colors = getThemeColors(theme);

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
  }, []);

  const getItemCount = (catId: string) => allItems.filter(i => i.category_id === catId).length;

  const CATEGORY_ICONS: Record<string, string> = {
    '上装': '👕', '下装': '👖', '袜子': '🧦', '鞋子': '👟',
    '发饰': '🎀', '耳饰': '💎', '外套': '🧥', '背包': '🎒',
  };

  return (
    <div className="min-h-screen relative" style={{ background: colors.bg, fontFamily: "'Inter','Noto Sans SC',sans-serif", maxWidth: '375px', margin: '0 auto' }}>
      {/* Header */}
      <header className="flex items-center justify-center pt-4 pb-0 px-5 relative">
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">我的衣橱</h1>
        <button aria-label="分类管理" onClick={() => navigate('/categories/manage')}
          className="absolute right-5 top-4 p-1 text-gray-500">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
          </svg>
        </button>
      </header>

      {/* Stats */}
      <div className="px-5 pt-2 pb-4 text-center">
        <span className="text-sm text-gray-500">
          共 {allItems.length} 件物品 · {categories.length} 个分类
        </span>
      </div>

      {/* Category Grid */}
      <main className="px-5 pb-28">
        {loading ? (
          <div className="text-center py-12 text-gray-400">加载中...</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {categories.map(cat => (
              <div key={cat.id}
                onClick={() => navigate(`/categories/${cat.id}`)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border cursor-pointer transition-all duration-150 active:scale-[0.98]"
                style={{
                  background: colors.bg,
                  borderColor: colors.borderLight,
                  borderLeftWidth: '3px',
                  borderLeftColor: colors.primary,
                }}
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-lg text-2xl"
                  style={{ background: colors.primaryBg }}>
                  {CATEGORY_ICONS[cat.name] || cat.icon}
                </div>
                <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                <span className="text-xs text-gray-400">{getItemCount(cat.id)} 件</span>
              </div>
            ))}
            {/* Add Category Button */}
            <div
              onClick={() => navigate('/categories/manage')}
              className="col-span-2 flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-150 active:bg-gray-50"
              style={{ borderColor: colors.border }}
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-lg text-gray-400">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v14M5 12h14"/></svg>
              </div>
              <span className="text-sm text-gray-400 font-medium">添加分类</span>
            </div>
          </div>
        )}
      </main>

      {/* FAB */}
      <button
        onClick={() => navigate('/categories/manage')}
        className="fixed bottom-20 right-5 w-[52px] h-[52px] rounded-full flex items-center justify-center z-20 border-none transition-transform duration-150 active:scale-95"
        style={{
          background: colors.primary,
          color: colors.textOnPrimary,
          boxShadow: `0 4px 12px ${theme === 'GRAY' ? 'rgba(59,89,152,0.35)' : 'rgba(232,160,191,0.35)'}`,
        }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
      </button>

      <BottomNav current="items" />
    </div>
  );
}
