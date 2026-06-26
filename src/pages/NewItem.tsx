import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createItem } from '@/api/items';
import { useAppSelector } from '@/store';
import { getThemeColors } from '@/utils/theme';

export default function NewItem() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const theme = useAppSelector((s) => s.theme.theme);
  const colors = getThemeColors(theme);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setError('');
    if (!name.trim()) { setError('请输入物品名称'); return; }
    if (!imageFile) { setError('请上传物品照片'); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('category_id', categoryId!);
      formData.append('image', imageFile);
      if (price) formData.append('price', price);

      await createItem(formData);
      navigate(`/categories/${categoryId}`);
    } catch (err: any) {
      setError(err.message || '创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white" style={{ fontFamily: "'Inter','Noto Sans SC',sans-serif", maxWidth: '375px', margin: '0 auto' }}>
      {/* Top Nav */}
      <header className="flex items-center justify-center px-4 h-14 border-b border-gray-100 shrink-0">
        <button onClick={() => navigate(-1)} className="absolute left-4 w-9 h-9 flex items-center justify-center rounded-full">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 12H5m7-7-7 7 7 7"/></svg>
        </button>
        <h1 className="text-base font-semibold text-gray-900">新建物品</h1>
      </header>

      <main className="flex-1 flex flex-col px-4 pt-5 pb-6 gap-5">
        {/* Image Upload */}
        <label className="w-full rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center bg-gray-50 cursor-pointer transition-colors hover:border-gray-300"
          style={{ height: '40vh', minHeight: '200px' }}>
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-2xl" />
          ) : (
            <>
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mb-3">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              </div>
              <span className="text-sm text-gray-400 font-medium">点击上传照片</span>
            </>
          )}
          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        </label>

        {/* Form */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-500">物品名称 <span className="text-red-500">*</span></label>
            <input type="text" placeholder="请输入物品名称" value={name} onChange={e => setName(e.target.value)}
              className="w-full h-11 px-3 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-[#E8A0BF] focus:ring-2 focus:ring-[#E8A0BF]/20 transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-500">价格（选填）</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">¥</span>
              <input type="number" placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)}
                className="w-full h-11 pl-7 pr-3 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-[#E8A0BF] focus:ring-2 focus:ring-[#E8A0BF]/20 transition-all" />
            </div>
          </div>
        </div>

        {error && <div className="p-3 rounded-lg bg-red-50 text-red-500 text-sm">{error}</div>}

        <div className="flex-1" />
        <button onClick={handleSave} disabled={loading}
          className="w-full h-12 rounded-full text-white text-base font-semibold active:scale-[0.98] transition-transform disabled:opacity-50"
          style={{ background: colors.primary }}>
          {loading ? '保存中...' : '保存'}
        </button>
      </main>
    </div>
  );
}
