import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Settings2 } from 'lucide-react';
import { useAppSelector } from '@/store';
import BottomNav from '@/components/BottomNav';

export default function Items() {
  const userId = useAppSelector((s) => s.auth.currentUserId);
  const categories = useAppSelector((s) =>
    s.categories.categories.filter((c) => c.userId === userId)
  );
  const items = useAppSelector((s) => s.items.items.filter((i) => i.userId === userId));
  const theme = useAppSelector((s) => s.theme.theme);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    items.forEach((i) => {
      map[i.categoryId] = (map[i.categoryId] || 0) + 1;
    });
    return map;
  }, [items]);

  const bg = theme === 'PINK' ? 'bg-[#FFF5F7]' : 'bg-[#F8F9FA]';
  const primaryText = theme === 'PINK' ? 'text-[#FF6B81]' : 'text-[#2C3E50]';
  const cardRadius = theme === 'PINK' ? 'rounded-2xl' : 'rounded-lg';

  return (
    <div className={`min-h-screen pb-24 ${bg}`}>
      <header className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-white/90 backdrop-blur">
        <h1 className={`text-xl font-bold ${primaryText}`}>我的衣橱</h1>
        <Link
          to="/categories/manage"
          className={`flex items-center gap-1 text-sm font-medium ${primaryText}`}
        >
          <Settings2 size={16} />
          管理分类
        </Link>
      </header>

      <main className="mx-auto max-w-md px-4 pt-4">
        {categories.length === 0 ? (
          <div className="py-20 text-center text-gray-400">暂无分类，请先注册登录</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {categories.map((category) => (
              <Link
                key={category.categoryId}
                to={`/categories/${category.categoryId}`}
                className={`relative flex flex-col justify-between bg-white p-5 shadow-sm transition-transform active:scale-95 ${cardRadius}`}
              >
                <span className="text-xs text-gray-400">
                  {category.isDefault ? '默认' : '自定义'}
                </span>
                <span className={`mt-2 text-lg font-bold ${primaryText}`}>{category.name}</span>
                <span className="mt-4 text-3xl font-black text-gray-100">
                  {counts[category.categoryId] || 0}
                </span>
                <span className="absolute right-4 top-4 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                  {counts[category.categoryId] || 0} 件
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
