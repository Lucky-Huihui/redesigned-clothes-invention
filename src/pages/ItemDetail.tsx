import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Camera } from 'lucide-react';
import { getItem, updateItem, deleteItem } from '@/api/items';
import { getCategories } from '@/api/categories';
import { formatDate } from '@/utils/theme';
import { getErrorMessage } from '@/utils/error';
import { cn } from '@/lib/utils';
import type { AppItem, AppCategory } from '@/types';

export default function ItemDetail() {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();

  const [item, setItem] = useState<AppItem | null>(null);
  const [categories, setCategories] = useState<AppCategory[]>([]);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [it, cats] = await Promise.all([getItem(itemId!), getCategories()]);
      setItem(it);
      setCategories(cats);
      setEditName(it.name);
      setEditPrice(it.price?.toString() || '');
      setEditCategoryId(it.category_id);
    } catch (err) {
      setError(getErrorMessage(err, '加载失败'));
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
    } catch (err) {
      setError(getErrorMessage(err, '更新失败'));
    }
  };

  const handleDelete = async () => {
    if (!item || !confirm('确定要删除这个物品吗？')) return;
    try {
      await deleteItem(item.id);
      navigate(`/categories/${item.category_id}`);
    } catch (err) {
      setError(getErrorMessage(err, '删除失败'));
    }
  };

  const catName = categories.find((c) => c.id === item?.category_id)?.name || item?.category_name || '';

  return (
    <div className="app-shell flex flex-col">
      {/* Top Navigation Bar */}
      <header className="relative flex items-center justify-center px-4 h-14 border-b border-border-light shrink-0 z-sticky">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 w-9 h-9 flex items-center justify-center rounded-full hover:bg-bg-secondary transition-colors duration-150"
          aria-label="返回"
        >
          <ArrowLeft size={20} className="text-ink" />
        </button>
        <h1 className="text-base font-semibold text-ink tracking-tight">物品详情</h1>
        {!loading && item && (
          <button
            onClick={() => setShowEdit(!showEdit)}
            className="absolute right-4 text-sm font-medium px-3 py-1.5 rounded-full text-primary hover:bg-primary-bg transition-colors duration-150"
          >
            {showEdit ? '取消' : '编辑'}
          </button>
        )}
      </header>

      {/* Loading State */}
      {loading && (
        <main className="flex-1 flex flex-col items-center justify-center px-4 gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <p className="text-sm text-ink-2">加载中...</p>
        </main>
      )}

      {/* Error / Empty State */}
      {!loading && error && !item && (
        <main className="flex-1 flex flex-col items-center justify-center px-4 gap-4">
          <p className="text-sm text-ink-2 text-center">{error}</p>
          <button
            onClick={loadData}
            className="px-5 h-10 rounded-full bg-primary text-brand-ink text-sm font-semibold"
          >
            重试
          </button>
        </main>
      )}

      {/* Content */}
      {!loading && item && (
        <main className="flex-1 flex flex-col px-4 pt-5 pb-6 gap-5">
          {showEdit ? (
            <>
              {/* Edit Form */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="edit-name" className="text-sm font-medium text-ink-2">
                    物品名称
                  </label>
                  <input
                    id="edit-name"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg bg-bg-secondary border border-border text-sm text-ink transition-all duration-150 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="edit-price" className="text-sm font-medium text-ink-2">
                    价格
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-3 font-medium select-none">
                      ¥
                    </span>
                    <input
                      id="edit-price"
                      type="number"
                      placeholder="0.00"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-full h-11 pl-7 pr-3 rounded-lg bg-bg-secondary border border-border text-sm text-ink placeholder:text-ink-3 transition-all duration-150 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="edit-category" className="text-sm font-medium text-ink-2">
                    分类
                  </label>
                  <div className="relative">
                    <select
                      id="edit-category"
                      value={editCategoryId}
                      onChange={(e) => setEditCategoryId(e.target.value)}
                      className="w-full h-11 px-3 pr-9 rounded-lg bg-bg-secondary border border-border text-sm text-ink appearance-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-150"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                      }}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-error/10 text-error text-sm">{error}</div>
              )}

              <div className="flex-1" />

              <button
                onClick={handleUpdate}
                className="w-full h-12 rounded-full bg-primary text-brand-ink text-base font-semibold hover:opacity-90 active:scale-[0.98] transition-all duration-150"
              >
                保存修改
              </button>

              <button
                onClick={handleDelete}
                className="w-full h-12 rounded-full border-2 border-error text-error text-base font-semibold hover:bg-error/5 active:scale-[0.98] transition-all duration-150"
              >
                删除物品
              </button>
            </>
          ) : (
            <>
              {/* Image */}
              <div className="w-full rounded-2xl overflow-hidden bg-bg-secondary" style={{ aspectRatio: '3/4' }}>
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                      <Camera size={32} className="text-ink-3" />
                    </div>
                    <span className="text-sm text-ink-3">暂无照片</span>
                  </div>
                )}
              </div>

              {/* Info Cards */}
              <div className="flex flex-col gap-3">
                <InfoCard label="物品名称" value={item.name} valueClass="text-lg font-semibold" />
                {item.price !== null && item.price !== undefined && (
                  <InfoCard
                    label="价格"
                    value={`¥${item.price}`}
                    valueClass="text-lg font-semibold text-primary"
                  />
                )}
                {catName && <InfoCard label="所属分类" value={catName} />}
                <InfoCard label="创建时间" value={formatDate(item.created_at)} />
              </div>

              <div className="flex-1" />

              <button
                onClick={handleDelete}
                className="w-full h-12 rounded-full border-2 border-error text-error text-base font-semibold hover:bg-error/5 active:scale-[0.98] transition-all duration-150"
              >
                删除物品
              </button>
            </>
          )}
        </main>
      )}
    </div>
  );
}

function InfoCard({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex flex-col gap-1 p-4 rounded-xl bg-bg-secondary border border-border-light">
      <span className="text-xs text-ink-3">{label}</span>
      <span className={cn('text-sm text-ink', valueClass)}>{value}</span>
    </div>
  );
}
