import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { addCategory, removeCategory } from '@/store/slices/categorySlice';

export default function CategoryManage() {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((s) => s.auth.currentUserId);
  const categories = useAppSelector((s) =>
    s.categories.categories.filter((c) => c.userId === userId)
  );
  const theme = useAppSelector((s) => s.theme.theme);
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    if (!userId || !newName.trim()) return;
    dispatch(addCategory({ userId, name: newName.trim() }));
    setNewName('');
  };

  const bg = theme === 'PINK' ? 'bg-[#FFF5F7]' : 'bg-[#F8F9FA]';
  const primaryText = theme === 'PINK' ? 'text-[#FF6B81]' : 'text-[#2C3E50]';
  const radius = theme === 'PINK' ? 'rounded-2xl' : 'rounded-lg';

  return (
    <div className={`flex min-h-screen flex-col ${bg}`}>
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-white/90 px-5 py-4 backdrop-blur">
        <Link to="/items" className={primaryText}>
          <ArrowLeft size={24} />
        </Link>
        <h1 className={`text-lg font-bold ${primaryText}`}>管理分类</h1>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-4 pt-4">
        <div className="space-y-3">
          {categories.map((category) => (
            <div
              key={category.categoryId}
              className={`flex items-center justify-between bg-white px-4 py-3 shadow-sm ${radius}`}
            >
              <div>
                <span className="font-medium text-gray-800">{category.name}</span>
                {category.isDefault && (
                  <span className="ml-2 text-xs text-gray-400">默认</span>
                )}
              </div>
              {!category.isDefault && (
                <button
                  onClick={() => dispatch(removeCategory(category.categoryId))}
                  className="rounded-full p-2 text-red-500 transition-colors hover:bg-red-50"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      </main>

      <div className="sticky bottom-0 border-t border-gray-100 bg-white p-4">
        <div className="mx-auto flex max-w-md gap-3">
          <input
            type="text"
            placeholder="新建分类名称"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className={`flex-1 rounded-xl border px-4 py-3 outline-none ${
              theme === 'PINK'
                ? 'border-[#FF6B81]/20 focus:border-[#FF6B81]'
                : 'border-[#2C3E50]/20 focus:border-[#2C3E50]'
            }`}
          />
          <button
            onClick={handleAdd}
            className={`px-5 font-semibold text-white shadow-md transition-transform active:scale-95 ${
              theme === 'PINK' ? 'bg-[#FF6B81]' : 'bg-[#2C3E50]'
            } ${radius}`}
          >
            添加
          </button>
        </div>
      </div>
    </div>
  );
}
