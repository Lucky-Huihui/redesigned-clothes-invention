import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, MoreVertical, Edit3, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { addItem, updateItem, removeItem } from '@/store/slices/itemSlice';
import ImageUploader from '@/components/ImageUploader';
import Modal from '@/components/Modal';
import BottomNav from '@/components/BottomNav';

interface ItemFormData {
  name: string;
  price: string;
  imageUrl: string;
}

export default function CategoryDetail() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const dispatch = useAppDispatch();
  const userId = useAppSelector((s) => s.auth.currentUserId);
  const theme = useAppSelector((s) => s.theme.theme);
  const category = useAppSelector((s) =>
    s.categories.categories.find((c) => c.categoryId === categoryId)
  );
  const items = useAppSelector((s) =>
    s.items.items.filter((i) => i.categoryId === categoryId && i.userId === userId)
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [form, setForm] = useState<ItemFormData>({ name: '', price: '', imageUrl: '' });
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const bg = theme === 'PINK' ? 'bg-[#FFF5F7]' : 'bg-[#F8F9FA]';
  const primaryText = theme === 'PINK' ? 'text-[#FF6B81]' : 'text-[#2C3E50]';
  const primaryBg = theme === 'PINK' ? 'bg-[#FF6B81]' : 'bg-[#2C3E50]';
  const radius = theme === 'PINK' ? 'rounded-2xl' : 'rounded-lg';

  const openAdd = () => {
    setEditingItem(null);
    setForm({ name: '', price: '', imageUrl: '' });
    setModalOpen(true);
  };

  const openEdit = (item: typeof items[number]) => {
    setEditingItem(item.itemId);
    setForm({ name: item.name, price: item.price ? String(item.price) : '', imageUrl: item.imageUrl });
    setModalOpen(true);
    setActiveMenu(null);
  };

  const handleSubmit = () => {
    if (!categoryId || !userId || !form.name.trim() || !form.imageUrl) return;
    const price = form.price ? parseFloat(form.price) : undefined;
    if (editingItem) {
      dispatch(updateItem({ itemId: editingItem, name: form.name.trim(), price, imageUrl: form.imageUrl }));
    } else {
      dispatch(addItem({ userId, categoryId, name: form.name.trim(), imageUrl: form.imageUrl, price }));
    }
    setModalOpen(false);
  };

  const handleDelete = (itemId: string) => {
    dispatch(removeItem(itemId));
    setActiveMenu(null);
  };

  if (!category) return <div className="p-10 text-center">分类不存在</div>;

  return (
    <div className={`min-h-screen pb-24 ${bg}`}>
      <header className="sticky top-0 z-10 flex items-center justify-between bg-white/90 px-5 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link to="/items" className={primaryText}>
            <ArrowLeft size={24} />
          </Link>
          <h1 className={`text-lg font-bold ${primaryText}`}>{category.name}</h1>
        </div>
        <button onClick={openAdd} className={`rounded-full p-2 text-white ${primaryBg}`}>
          <Plus size={20} />
        </button>
      </header>

      <main className="mx-auto max-w-md px-4 pt-4">
        {items.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            该分类下还没有物品
            <br />
            <button onClick={openAdd} className={`mt-3 text-sm font-medium ${primaryText}`}>
              添加第一件物品
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {items.map((item) => (
              <div
                key={item.itemId}
                className={`relative bg-white p-3 shadow-sm ${radius}`}
              >
                <div className="relative overflow-hidden" style={{ aspectRatio: '1/1' }}>
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full rounded-lg object-cover"
                  />
                  <button
                    onClick={() => setActiveMenu(activeMenu === item.itemId ? null : item.itemId)}
                    className="absolute right-2 top-2 rounded-full bg-black/30 p-1 text-white"
                  >
                    <MoreVertical size={16} />
                  </button>
                  {activeMenu === item.itemId && (
                    <div className="absolute right-2 top-10 flex flex-col gap-1 rounded-lg bg-white p-1 shadow-lg">
                      <button
                        onClick={() => openEdit(item)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700"
                      >
                        <Edit3 size={14} /> 编辑
                      </button>
                      <button
                        onClick={() => handleDelete(item.itemId)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-500"
                      >
                        <Trash2 size={14} /> 删除
                      </button>
                    </div>
                  )}
                </div>
                <p className="mt-2 truncate font-medium text-gray-800">{item.name}</p>
                <p className="text-xs text-gray-400">
                  {new Date(item.createTime).toLocaleDateString()}
                </p>
                {item.price !== undefined && (
                  <p className={`text-sm font-bold ${primaryText}`}>¥{item.price}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <Modal
        open={modalOpen}
        title={editingItem ? '编辑物品' : '新建物品'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button
              onClick={() => setModalOpen(false)}
              className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-600"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={!form.name.trim() || !form.imageUrl}
              className={`flex-1 py-3 text-sm font-semibold text-white disabled:opacity-50 ${primaryBg} ${radius}`}
            >
              确认
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <ImageUploader
            value={form.imageUrl}
            onChange={(url) => setForm({ ...form, imageUrl: url })}
            className="mx-auto h-32 w-32 rounded-2xl"
          />
          <input
            type="text"
            placeholder="物品名称（必填）"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-gray-400"
          />
          <input
            type="number"
            placeholder="价格（选填）"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-gray-400"
          />
        </div>
      </Modal>

      <BottomNav />
    </div>
  );
}
