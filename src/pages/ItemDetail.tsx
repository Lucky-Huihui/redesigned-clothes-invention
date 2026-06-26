import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getItem, updateItem, deleteItem } from '@/api/items';
import { getCategories } from '@/api/categories';
import { useAppSelector } from '@/store';
import { getThemeColors, formatDate } from '@/utils/theme';
import type { AppItem, AppCategory } from '@/types';

export default function ItemDetail() {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const theme = useAppSelector((s) => s.theme.theme);
  const colors = getThemeColors(theme);

  const [item, setItem] = useState<AppItem | null>(null);
  const [categories, setCategories] = useState<AppCategory[]>([]);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [showEdit, setShowEdit] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [it, cats] = await Promise.all([getItem(itemId!), getCategories()]);
      setItem(it);
      setCategories(cats);
      setEditName(it.name);
      setEditPrice(it.price?.toString() || '');
      setEditCategoryId(it.category_id);
    } catch (err) {
      navigate(-1);
    }
  }, [itemId, navigate]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleUpdate = async () => {
    if (!item) return;
    try {
      const formData = new FormData();
      formData.append('name', editName);
      formData.append('price', editPrice);
      formData.append('category_id', editCategoryId);
      const updated = await updateItem(item.id, formData);
      setItem(updated);
      setShowEdit(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (!item || !confirm('确定要删除这个物品吗？')) return;
    try {
      await deleteItem(item.id);
      navigate(`/categories/${item.category_id}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!item) return null;

  const catName = categories.find(c => c.id === item.category_id)?.name || '';

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter','Noto Sans SC',sans-serif", maxWidth: '375px', margin: '0 auto' }}>
      <nav className="sticky top-0 z-20 flex items-center justify-between px-4 h-14 border-b border-gray-100 bg-white">
        <button onClick={() => navigate(-1)} className="flex items-center justify-center w-9 h-9 -ml-1 rounded-lg">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5m7-7-7 7 7 7"/></svg>
        </button>
        <h1 className="text-base font-semibold text-gray-900">物品详情</h1>
        <button onClick={() => setShowEdit(!showEdit)} className="text-sm font-medium px-2 py-1 rounded-lg"
          style={{ color: colors.primary }}>{showEdit ? '取消' : '编辑'}</button>
      </nav>

      {showEdit ? (
        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-500">物品名称</label>
            <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
              className="w-full h-11 px-3 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-[#E8A0BF]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-500">价格</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">¥</span>
              <input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)}
                className="w-full h-11 pl-7 pr-3 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-[#E8A0BF]" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-500">分类</label>
            <select value={editCategoryId} onChange={e => setEditCategoryId(e.target.value)}
              className="w-full h-11 px-3 rounded-lg bg-gray-50 border border-gray-200 text-sm">
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <button onClick={handleUpdate} className="w-full h-12 rounded-full text-white text-base font-semibold"
            style={{ background: colors.primary }}>保存修改</button>
        </div>
      ) : (
        <>
          <div className="p-4">
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-full rounded-xl object-cover" style={{ aspectRatio: '3/4', background: colors.primaryBg }} />
            ) : (
              <div className="w-full rounded-xl flex items-center justify-center text-6xl" style={{ aspectRatio: '3/4', background: colors.primaryBg }}>👗</div>
            )}
          </div>

          <div className="px-4 space-y-3">
            <div>
              <p className="text-xs text-gray-400 mb-1">物品名称</p>
              <p className="text-lg font-semibold text-gray-900">{item.name}</p>
            </div>
            {item.price && (
              <div>
                <p className="text-xs text-gray-400 mb-1">价格</p>
                <p className="text-lg font-semibold" style={{ color: colors.primary }}>¥{item.price}</p>
              </div>
            )}
            {catName && (
              <div>
                <p className="text-xs text-gray-400 mb-1">所属分类</p>
                <p className="text-sm text-gray-600">{catName}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-400 mb-1">创建时间</p>
              <p className="text-sm text-gray-600">{formatDate(item.created_at)}</p>
            </div>
          </div>

          <div className="px-4 pt-8">
            <button onClick={handleDelete}
              className="w-full h-12 rounded-full border-2 border-red-300 text-red-400 text-base font-semibold active:bg-red-50 transition-colors">
              删除物品
            </button>
          </div>
        </>
      )}
    </div>
  );
}
