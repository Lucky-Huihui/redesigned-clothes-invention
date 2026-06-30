import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories, createCategory, renameCategory, deleteCategory } from '@/api/categories';
import { cn } from '@/lib/utils';
import { getErrorMessage } from '@/utils/error';
import type { AppCategory } from '@/types';

export default function CategoryManage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<AppCategory[]>([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const cats = await getCategories();
      setCategories(cats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    try {
      const cat = await createCategory(newName.trim());
      setCategories(prev => [...prev, cat]);
      setNewName('');
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const handleRename = async (id: string) => {
    if (!editName.trim()) return;
    try {
      const updated = await renameCategory(id, editName.trim());
      setCategories(prev => prev.map(c => c.id === id ? updated : c));
      setEditingId(null);
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个分类吗？分类下的物品也会被删除。')) return;
    try {
      await deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  return (
    <div className="app-shell min-h-screen flex flex-col bg-bg-secondary">
      <nav className="sticky top-0 z-sticky flex items-center justify-center h-14 px-4 bg-bg border-b border-border-light">
        <button
          onClick={() => navigate('/items')}
          className="absolute left-4 w-9 h-9 flex items-center justify-center rounded-lg text-ink transition-colors duration-150 active:text-ink-2"
          aria-label="返回"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5m7-7-7 7 7 7" />
          </svg>
        </button>
        <h1 className="text-base font-semibold text-ink">分类管理</h1>
      </nav>

      <div className="flex-1 px-4 pt-4 pb-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-ink-3">
            <div className="w-8 h-8 border-2 border-border-light border-t-primary rounded-full animate-spin mb-3" />
            <span className="text-sm">加载中...</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-4xl mb-3">🗂️</div>
            <p className="text-sm text-ink-2 mb-1">还没有分类</p>
            <p className="text-xs text-ink-3">在下方输入框添加新分类</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {categories.map(cat => (
              <div
                key={cat.id}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface border border-border-light"
              >
                <span className="text-xl">{cat.icon}</span>
                <div className="flex-1 min-w-0">
                  {editingId === cat.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className={cn(
                          'flex-1 h-8 px-2 rounded-md bg-bg-secondary border border-border text-sm text-ink',
                          'focus:outline-none focus:border-primary transition-colors duration-150'
                        )}
                        onKeyDown={e => e.key === 'Enter' && handleRename(cat.id)}
                      />
                      <button
                        onClick={() => handleRename(cat.id)}
                        className="px-3 h-8 rounded-md text-xs font-medium text-brand-ink bg-primary transition-transform duration-150 active:scale-95"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 h-8 rounded-md text-xs font-medium text-ink-2 bg-bg-tertiary transition-colors duration-150 active:bg-border-light"
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-ink">{cat.name}</span>
                      {cat.is_default ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-tertiary text-ink-3">默认</span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-bg text-primary">自定义</span>
                      )}
                    </div>
                  )}
                </div>
                {editingId !== cat.id && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-3 transition-colors duration-150 hover:text-ink-2 active:bg-bg-secondary"
                      aria-label="编辑分类"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-error transition-colors duration-150 hover:text-error/80 active:bg-bg-secondary"
                      aria-label="删除分类"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add input */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[375px] px-4 py-3 bg-bg border-t border-border-light z-sticky safe-bottom">
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="输入新分类名称"
            className={cn(
              'flex-1 h-11 px-3 rounded-lg bg-bg-secondary border border-border text-sm text-ink',
              'placeholder:text-ink-3 focus:outline-none focus:border-primary transition-colors duration-150'
            )}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <button
            onClick={handleAdd}
            className={cn(
              'px-5 h-11 rounded-lg text-sm font-semibold text-brand-ink bg-primary',
              'transition-transform duration-150 active:scale-[0.98]'
            )}
          >
            添加
          </button>
        </div>
      </div>
    </div>
  );
}
