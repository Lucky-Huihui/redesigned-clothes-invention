import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, ThumbsDown, ArrowLeft, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { addOutfit, updateOutfitImage } from '@/store/slices/outfitSlice';
import { setReaction } from '@/store/slices/reactionSlice';
import { clearDraft } from '@/store/slices/outfitDraftSlice';
import Toast from '@/components/Toast';
import BottomNav from '@/components/BottomNav';
import type { ReactionType } from '@/types';

async function generateOutfitImage(
  itemUrls: string[],
  gender: string,
  theme: 'PINK' | 'GRAY'
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 800;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  const gradient = ctx.createLinearGradient(0, 0, 0, 800);
  if (theme === 'PINK') {
    gradient.addColorStop(0, '#FFF5F7');
    gradient.addColorStop(1, '#FFE4E9');
  } else {
    gradient.addColorStop(0, '#F8F9FA');
    gradient.addColorStop(1, '#E2E6EA');
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Title
  ctx.fillStyle = theme === 'PINK' ? '#FF6B81' : '#2C3E50';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('AI 试穿效果', 300, 70);
  ctx.font = '24px sans-serif';
  ctx.fillText(`模特性别：${gender === 'MALE' ? '男' : '女'}`, 300, 110);

  // Model silhouette placeholder
  ctx.fillStyle = '#E5E7EB';
  ctx.beginPath();
  ctx.ellipse(300, 280, 50, 55, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(250, 335, 100, 160);
  ctx.fillRect(230, 340, 40, 110);
  ctx.fillRect(330, 340, 40, 110);
  ctx.fillRect(255, 495, 35, 130);
  ctx.fillRect(310, 495, 35, 130);

  // Draw selected items
  const images = await Promise.all(
    itemUrls.map(
      (url) =>
        new Promise<HTMLImageElement>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = () => resolve(img);
          img.src = url;
        })
    )
  );

  const positions = [
    { x: 60, y: 180, w: 160, h: 160 },
    { x: 380, y: 180, w: 160, h: 160 },
    { x: 60, y: 400, w: 160, h: 160 },
    { x: 380, y: 400, w: 160, h: 160 },
  ];

  images.forEach((img, index) => {
    if (!img.complete || !img.naturalWidth) return;
    const pos = positions[index % positions.length];
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(pos.x, pos.y, pos.w, pos.h, 16);
    ctx.clip();
    ctx.drawImage(img, pos.x, pos.y, pos.w, pos.h);
    ctx.restore();

    ctx.strokeStyle = theme === 'PINK' ? '#FF6B81' : '#2C3E50';
    ctx.lineWidth = 3;
    ctx.strokeRect(pos.x, pos.y, pos.w, pos.h);
  });

  ctx.fillStyle = '#9CA3AF';
  ctx.font = '18px sans-serif';
  ctx.fillText('本图为前端模拟生成，仅供演示', 300, 760);

  return canvas.toDataURL('image/png');
}

export default function OutfitResult() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userId = useAppSelector((s) => s.auth.currentUserId);
  const currentUser = useAppSelector((s) =>
    s.auth.users.find((u) => u.userId === s.auth.currentUserId)
  );
  const theme = useAppSelector((s) => s.theme.theme);
  const selections = useAppSelector((s) => s.outfitDraft.selections);
  const items = useAppSelector((s) => s.items.items);
  const outfits = useAppSelector((s) => s.outfits.outfits);
  const reactions = useAppSelector((s) => s.reactions.reactions);

  const [loading, setLoading] = useState(true);
  const [outfitId, setOutfitId] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const generatedRef = useRef(false);

  const selectedItemIds = Object.values(selections);
  const selectedItems = selectedItemIds
    .map((id) => items.find((i) => i.itemId === id))
    .filter(Boolean) as typeof items;

  useEffect(() => {
    if (selectedItemIds.length === 0) {
      navigate('/outfits');
      return;
    }
    if (generatedRef.current || !userId) return;
    generatedRef.current = true;

    const outfit = {
      userId,
      items: selectedItemIds,
    };
    dispatch(addOutfit(outfit));

    // Read newly created outfit id from store
    const newOutfit = outfits[outfits.length - 1];
    const targetId = newOutfit?.outfitId;
    if (!targetId) return;
    setOutfitId(targetId);

    generateOutfitImage(
      selectedItems.map((i) => i.imageUrl),
      currentUser?.gender || 'FEMALE',
      theme
    ).then((url) => {
      dispatch(updateOutfitImage({ outfitId: targetId, resultImageUrl: url }));
      setLoading(false);
    });
  }, [dispatch, navigate, selectedItemIds, selectedItems, currentUser, theme, outfits, userId]);

  const currentReaction = useAppSelector((s) =>
    outfitId
      ? s.reactions.reactions.find(
          (r) => r.userId === userId && r.outfitId === outfitId
        )?.type
      : undefined
  );

  const handleReaction = (type: ReactionType) => {
    if (!userId || !outfitId) return;
    dispatch(setReaction({ userId, outfitId, type }));
    const labels: Record<ReactionType, string> = {
      LIKE: '已标记喜欢',
      FAVORITE: '已收藏',
      DISLIKE: '已标记不喜欢',
    };
    setToast(labels[type]);
  };

  const resultUrl = outfits.find((o) => o.outfitId === outfitId)?.resultImageUrl;

  const bg = theme === 'PINK' ? 'bg-[#FFF5F7]' : 'bg-[#F8F9FA]';
  const primaryText = theme === 'PINK' ? 'text-[#FF6B81]' : 'text-[#2C3E50]';
  const primaryBg = theme === 'PINK' ? 'bg-[#FF6B81]' : 'bg-[#2C3E50]';
  const radius = theme === 'PINK' ? 'rounded-3xl' : 'rounded-xl';

  return (
    <div className={`min-h-screen pb-24 ${bg}`}>
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-white/90 px-5 py-4 backdrop-blur">
        <button onClick={() => navigate('/outfits')} className={primaryText}>
          <ArrowLeft size={24} />
        </button>
        <h1 className={`text-lg font-bold ${primaryText}`}>试穿结果</h1>
      </header>

      <main className="mx-auto flex max-w-md flex-col items-center px-4 pt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className={`animate-spin ${primaryText}`} size={48} />
            <p className={`mt-4 font-medium ${primaryText}`}>AI 正在生成搭配效果...</p>
          </div>
        ) : (
          <>
            <div
              className={`relative w-full overflow-hidden bg-white shadow-xl ${radius}`}
              style={{ aspectRatio: '3/4' }}
            >
              {resultUrl ? (
                <img
                  src={resultUrl}
                  alt="AI 试穿效果"
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  生成失败，请重试
                </div>
              )}
            </div>

            <div className="mt-6 flex w-full justify-around">
              {([
                { type: 'LIKE' as ReactionType, icon: Heart, label: '喜欢' },
                { type: 'FAVORITE' as ReactionType, icon: Star, label: '收藏' },
                { type: 'DISLIKE' as ReactionType, icon: ThumbsDown, label: '不喜欢' },
              ]).map(({ type, icon: Icon, label }) => {
                const active = currentReaction === type;
                return (
                  <button
                    key={type}
                    onClick={() => handleReaction(type)}
                    className={`flex flex-col items-center gap-2 rounded-2xl px-6 py-3 transition-transform active:scale-95 ${
                      active
                        ? `${primaryBg} text-white shadow-md`
                        : 'bg-white text-gray-600 shadow-sm'
                    }`}
                  >
                    <Icon size={24} className={active ? 'fill-current' : ''} />
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                dispatch(clearDraft());
                navigate('/outfits');
              }}
              className={`mt-6 w-full py-3 font-semibold text-white shadow-md transition-transform active:scale-95 ${primaryBg} ${
                theme === 'PINK' ? 'rounded-2xl' : 'rounded-lg'
              }`}
            >
              再试一套
            </button>
          </>
        )}
      </main>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
      <BottomNav />
    </div>
  );
}
