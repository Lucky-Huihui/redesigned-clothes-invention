import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { setOutfitFeedback } from '@/api/outfits';
import { useAppSelector } from '@/store';
import { getThemeColors } from '@/utils/theme';
import type { AppOutfit } from '@/types';

export default function OutfitResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useAppSelector((s) => s.theme.theme);
  const colors = getThemeColors(theme);
  const outfit = (location.state as any)?.outfit as AppOutfit;
  const [feedback, setFeedback] = useState<string | null>(outfit?.feedback || null);

  if (!outfit) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ fontFamily: "'Inter','Noto Sans SC',sans-serif" }}>
        <div className="text-center">
          <p className="text-gray-400 mb-4">未找到搭配数据</p>
          <button onClick={() => navigate('/outfits')} className="px-6 py-2 rounded-full text-white" style={{ background: colors.primary }}>
            返回搭配
          </button>
        </div>
      </div>
    );
  }

  const handleFeedback = async (type: string) => {
    try {
      await setOutfitFeedback(outfit.id, type);
      setFeedback(type);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter','Noto Sans SC',sans-serif", maxWidth: '375px', margin: '0 auto', background: colors.bg }}>
      {/* Top Nav */}
      <nav className="sticky top-0 z-20 flex items-center justify-center h-14 px-4 border-b bg-white"
        style={{ borderColor: colors.borderLight }}>
        <button onClick={() => navigate('/outfits')} className="absolute left-4 bg-none border-none cursor-pointer p-2 text-gray-900">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 19l-7-7 7-7"/></svg>
        </button>
        <span className="text-lg font-semibold text-gray-900 tracking-tight">试穿效果</span>
        <button className="absolute right-4 bg-none border-none cursor-pointer p-2 text-gray-900">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>
          </svg>
        </button>
      </nav>

      {/* Main Display */}
      <div className="mx-4 mt-4 rounded-xl overflow-hidden relative" style={{ aspectRatio: '3/4', background: colors.bgSecondary }}>
        {outfit.result_image ? (
          <img src={outfit.result_image} alt="试穿效果" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">加载失败</div>
        )}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-white text-[11px] font-medium"
          style={{ background: theme === 'GRAY' ? 'rgba(59,89,152,0.85)' : 'rgba(232,160,191,0.85)' }}>
          AI 试穿
        </div>
      </div>

      {/* Feedback Buttons */}
      <div className="flex gap-2.5 px-4 pt-5">
        <button onClick={() => handleFeedback('DISLIKE')}
          className="flex-1 flex items-center justify-center gap-1.5 h-12 rounded-xl border-none cursor-pointer transition-transform active:scale-[0.97] text-sm font-semibold"
          style={{
            background: feedback === 'DISLIKE' ? '#EF4444' : colors.bgTertiary,
            color: feedback === 'DISLIKE' ? '#FFFFFF' : colors.textSecondary,
          }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          不喜欢
        </button>
        <button onClick={() => handleFeedback('FAVORITE')}
          className="flex-1 flex items-center justify-center gap-1.5 h-12 rounded-xl border-none cursor-pointer transition-transform active:scale-[0.97] text-sm font-semibold"
          style={{
            background: feedback === 'FAVORITE' ? '#F59E0B' : colors.primarySubtle,
            color: feedback === 'FAVORITE' ? '#FFFFFF' : colors.primary,
          }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          收藏
        </button>
        <button onClick={() => handleFeedback('LIKE')}
          className="flex-1 flex items-center justify-center gap-1.5 h-12 rounded-xl border-none cursor-pointer transition-transform active:scale-[0.97] text-sm font-semibold"
          style={{
            background: feedback === 'LIKE' ? colors.primary : colors.primarySubtle,
            color: feedback === 'LIKE' ? colors.textOnPrimary : colors.primary,
          }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>
          喜欢
        </button>
      </div>

      {/* Bottom Action */}
      <div className="px-4 pt-5 pb-10">
        <button onClick={() => navigate('/outfits')}
          className="w-full h-12 rounded-xl border-2 flex items-center justify-center gap-2 text-base font-semibold bg-transparent cursor-pointer transition-all active:scale-[0.98]"
          style={{ borderColor: colors.primary, color: colors.primary }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
          </svg>
          重新搭配
        </button>
      </div>
    </div>
  );
}
