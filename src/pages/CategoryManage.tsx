import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories, createCategory, renameCategory, deleteCategory } from '@/api/categories';
import { useAppSelector } from '@/store';
import { getThemeColors } from '@/utils/theme';
import type { AppCategory } from '@/types';

export default function CategoryManage() {
  const navigate = useNavigate();
  const theme = useAppSelector((s) => s.theme.theme);
  const colors = getThemeColors(theme);

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
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRename = async (id: string) => {
    if (!editName.trim()) return;
    try {
      const updated = await renameCategory(id, editName.trim());
      setCategories(prev => prev.map(c => c.id === id ? updated : c));
      setEditingId(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个分类吗？分类下的物品也会被删除。')) return;
    try {
      await deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Inter','Noto Sans SC',sans-serif", maxWidth: '375px', margin: '0 auto', background: colors.bgSecondary }}>
      <nav className="sticky top-0 z-20 flex items-center justify-center h-14 px-4 bg-white border-b" style={{ borderColor: colors.borderLight }}>
        <button onClick={() => navigate('/items')} className="absolute left-4 w-9 h-9 flex items-center justify-center rounded-lg">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5m7-7-7 7 7 7"/></svg>
        </button>
        <h1 className="text-base font-semibold text-gray-900">分类管理</h1>
      </nav>

      <div className="flex-1 px-4 pt-4 pb-24">
        {loading ? (
          <div className="text-center py-12 text-gray-400">加载中...</div>
        ) : (
          <div className="flex flex-col gap-2">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white" style={{ border: `1px solid ${colors.borderLight}` }}>
                <span className="text-xl">{cat.icon}</span>
                <div className="flex-1 min-w-0">
                  {editingId === cat.id ? (
                    <div className="flex gap-2">
                      <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                        className="flex-1 h-8 px-2 rounded bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-[#E8A0BF]" />
                      <button onClick={() => handleRename(cat.id)}
                        className="px-3 h-8 rounded text-xs font-medium text-white" style={{ background: colors.primary }}>保存</button>
                      <button onClick={() => setEditingId(null)}
                        className="px-3 h-8 rounded text-xs font-medium text-gray-500 bg-gray-100">取消</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                      {cat.is_default ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-400">默认</span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: colors.primaryBg, color: colors.primary }}>自定义</span>
                      )}
                    </div>
                  )}
                </div>
                {editingId !== cat.id && (
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button onClick={() => handleDelete(cat.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add input */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[375px] px-4 py-3 bg-white border-t z-20" style={{ borderColor: colors.borderLight }}>
        <div className="flex gap-2">
          <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="输入新分类名称"
            className="flex-1 h-11 px-3 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-[#E8A0BF]"
            onKeyDown={e => e.key === 'Enter' && handleAdd()} />
          <button onClick={handleAdd}
            className="px-5 h-11 rounded-lg text-sm font-semibold text-white transition-transform active:scale-[0.98]"
            style={{ background: colors.primary }}>添加</button>
        </div>
      </div>
    </div>
  );
}
