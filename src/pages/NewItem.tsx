import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createItem } from '@/api/items';
import { getCategories } from '@/api/categories';
import ImageUploader from '@/components/ImageUploader';
import { getErrorMessage } from '@/utils/error';
import { cn } from '@/lib/utils';
import type { AppCategory } from '@/types';

export default function NewItem() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<AppCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(categoryId || '');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getCategories()
      .then((cats) => {
        setCategories(cats);
        setSelectedCategoryId((prev) => {
          if (categoryId && !prev) return categoryId;
          if (cats.length > 0 && !prev) return cats[0].id;
          return prev;
        });
      })
      .catch(() => {
        setError('分类加载失败');
      });
  }, [categoryId]);

  const handleImageChange = (dataUrl: string) => {
    setImagePreview(dataUrl);
    fetch(dataUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], 'upload.jpg', { type: blob.type || 'image/jpeg' });
        setImageFile(file);
      });
  };

  const handleSave = async () => {
    setError('');
    if (!name.trim()) {
      setError('请输入物品名称');
      return;
    }
    if (!imageFile) {
      setError('请上传物品照片');
      return;
    }
    if (!selectedCategoryId) {
      setError('请选择所属分类');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('category_id', selectedCategoryId);
      formData.append('image', imageFile);
      if (price) formData.append('price', price);

      await createItem(formData);
      navigate(`/categories/${selectedCategoryId}`);
    } catch (err) {
      setError(getErrorMessage(err, '创建失败'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell flex flex-col">
      {/* Top Navigation Bar */}
      <header className="relative flex items-center justify-center px-4 h-14 border-b border-border-light shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 w-9 h-9 flex items-center justify-center rounded-full hover:bg-bg-secondary transition-colors duration-150"
          aria-label="返回"
        >
          <ArrowLeft size={20} className="text-ink" />
        </button>
        <h1 className="text-base font-semibold text-ink tracking-tight">新建物品</h1>
      </header>

      <main className="flex-1 flex flex-col px-4 pt-5 pb-6 gap-5">
        {/* Image Upload Area */}
        <ImageUploader
          value={imagePreview}
          onChange={handleImageChange}
          className="h-[40vh] min-h-[200px] w-full"
        />

        {/* Form Fields */}
        <div className="flex flex-col gap-4">
          {/* Item Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="item-name" className="text-sm font-medium text-ink-2">
              物品名称<span className="text-error ml-0.5">*</span>
            </label>
            <input
              id="item-name"
              type="text"
              placeholder="请输入物品名称"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-3 rounded-lg bg-bg-secondary border border-border text-sm text-ink placeholder:text-ink-3 transition-all duration-150 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Price */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="item-price" className="text-sm font-medium text-ink-2">
              价格（选填）
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-3 font-medium select-none">
                ¥
              </span>
              <input
                id="item-price"
                type="number"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full h-11 pl-7 pr-3 rounded-lg bg-bg-secondary border border-border text-sm text-ink placeholder:text-ink-3 transition-all duration-150 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="item-category" className="text-sm font-medium text-ink-2">
              所属分类
            </label>
            <div className="relative">
              <select
                id="item-category"
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
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

        {/* Spacer */}
        <div className="flex-1" />

        {/* Save Button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className={cn(
            'w-full h-12 rounded-full bg-primary text-brand-ink text-base font-semibold hover:opacity-90 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed'
          )}
        >
          {loading ? '保存中...' : '保存'}
        </button>
      </main>
    </div>
  );
}
