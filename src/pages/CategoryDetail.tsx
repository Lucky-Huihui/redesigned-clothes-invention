import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCategories } from '@/api/categories';
import { getItems, deleteItem } from '@/api/items';
import { formatDate } from '@/utils/theme';
import { getErrorMessage } from '@/utils/error';
import { cn } from '@/lib/utils';
import type { AppCategory, AppItem } from '@/types';

export default function CategoryDetail() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();

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
    } catch (err) {
      alert(getErrorMessage(err, '删除失败'));
    }
  };

  return (
    <div className="app-shell min-h-screen bg-bg-secondary">
      {/* Top Nav */}
      <nav className="sticky top-0 z-sticky flex items-center justify-between px-4 h-14 bg-bg shadow-sm border-b border-border-light">
        <button
          onClick={() => navigate('/items')}
          className="flex items-center justify-center w-9 h-9 -ml-1 rounded-lg text-ink transition-colors duration-150 active:text-ink-2"
          aria-label="返回"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5m7-7-7 7 7 7" />
          </svg>
        </button>
        <h1 className="text-base font-semibold text-ink">{category?.name || '加载中...'}</h1>
        <button
          onClick={() => navigate('/categories/manage')}
          className="text-sm font-medium px-2 py-1 rounded-lg text-primary transition-colors duration-150 active:text-primary-hover"
          aria-label="管理"
        >
          管理
        </button>
      </nav>

      {/* Item Waterfall Grid */}
      <div className="px-3 pt-3 pb-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-ink-3">
            <div className="w-8 h-8 border-2 border-border-light border-t-primary rounded-full animate-spin mb-3" />
            <span className="text-sm">加载中...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-sm text-ink-2 mb-1">还没有物品</p>
            <p className="text-xs text-ink-3">点击下方按钮添加</p>
          </div>
        ) : (
          <div className="columns-2 gap-3 space-y-3">
            {items.map(item => (
              <div
                key={item.id}
                onClick={() => navigate(`/items/${item.id}`)}
                className={cn(
                  'break-inside-avoid rounded-xl overflow-hidden bg-surface shadow-card',
                  'cursor-pointer transition-transform duration-200 ease-app-fast active:scale-[0.97]'
                )}
              >
                <div className="relative">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full object-cover"
                      style={{ aspectRatio: '3/4', background: 'var(--color-primary-bg)' }}
                    />
                  ) : (
                    <div
                      className="w-full flex items-center justify-center text-4xl"
                      style={{ aspectRatio: '3/4', background: 'var(--color-primary-bg)' }}
                    >
                      {category?.icon || '👗'}
                    </div>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                    className={cn(
                      'absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center',
                      'bg-bg text-ink-3 opacity-60 hover:opacity-100 transition-opacity duration-150'
                    )}
                    aria-label="删除物品"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="px-3 pt-2 pb-3">
                  <p className="text-sm font-medium leading-tight text-ink">{item.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-ink-3">{formatDate(item.created_at)}</span>
                    {item.price !== null && item.price !== undefined && (
                      <span className="text-xs font-medium text-primary">¥{item.price}</span>
                    )}
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
        className={cn(
          'fixed bottom-6 right-6 z-modal w-14 h-14 rounded-full',
          'flex items-center justify-center bg-primary text-brand-ink',
          'shadow-fab border-none transition-transform duration-200 ease-app-fast active:scale-95'
        )}
        aria-label="添加物品"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  );
}
