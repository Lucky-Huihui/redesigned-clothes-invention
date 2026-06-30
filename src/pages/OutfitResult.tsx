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
  const tryOnMode = ((location.state as any)?.tryOnMode as string) || 'demo';
  const tryOnMessage = ((location.state as any)?.tryOnMessage as string) || '';
  const [feedback, setFeedback] = useState<string | null>(outfit?.feedback || null);
  const [loading, setLoading] = useState(false);

  if (!outfit) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ fontFamily: "'Inter','Noto Sans SC',sans-serif", background: colors.bgSecondary }}>
        <div className="text-center p-8">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-500 mb-5">未找到搭配数据</p>
          <button onClick={() => navigate('/outfits')}
            className="px-6 py-2.5 rounded-full text-white text-sm font-semibold active:scale-95 transition-transform"
            style={{ background: colors.primary }}>
            返回搭配
          </button>
        </div>
      </div>
    );
  }

  const handleFeedback = async (type: string) => {
    setLoading(true);
    try {
      await setOutfitFeedback(outfit.id, type);
      setFeedback(type);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
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
      </nav>

      {/* Mode Badge */}
      <div className="px-4 pt-3 pb-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
          style={{
            background: tryOnMode === 'ai' ? 'rgba(16,185,129,0.1)' : colors.primaryBg,
            color: tryOnMode === 'ai' ? '#10B981' : colors.primary,
          }}>
          {tryOnMode === 'ai' ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              AI 真人生成
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M12 7v6m0 4h0"/></svg>
              Demo 演示模式
            </>
          )}
        </span>
      </div>

      {/* Main Display */}
      <div className="mx-4 mt-3 rounded-2xl overflow-hidden relative" style={{ aspectRatio: '3/4', background: colors.bgSecondary, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
        {outfit.result_image ? (
          <img src={outfit.result_image} alt="试穿效果" className="w-full h-full object-contain" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <div className="text-5xl animate-pulse">👗</div>
            <p className="text-gray-400 text-sm">正在生成试穿效果...</p>
          </div>
        )}
        {/* Watermark */}
        <div className="absolute bottom-3 left-0 right-0 text-center">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/20 text-white/80 backdrop-blur-sm">
            {tryOnMode === 'ai' ? 'AI 虚拟试穿' : 'Demo 演示效果'}
          </span>
        </div>
      </div>

      {/* Description */}
      {tryOnMessage && (
        <div className="px-4 pt-2 pb-1 text-center">
          <p className="text-xs text-gray-400">{tryOnMessage}</p>
        </div>
      )}

      {/* Feedback Buttons */}
      <div className="flex gap-2.5 px-4 pt-4">
        <button onClick={() => handleFeedback('DISLIKE')} disabled={loading}
          className="flex-1 flex items-center justify-center gap-1.5 h-12 rounded-xl border-none cursor-pointer transition-all active:scale-[0.97] text-sm font-semibold"
          style={{
            background: feedback === 'DISLIKE' ? '#EF4444' : colors.bgTertiary,
            color: feedback === 'DISLIKE' ? '#FFFFFF' : colors.textSecondary,
          }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          不喜欢
        </button>
        <button onClick={() => handleFeedback('FAVORITE')} disabled={loading}
          className="flex-1 flex items-center justify-center gap-1.5 h-12 rounded-xl border-none cursor-pointer transition-all active:scale-[0.97] text-sm font-semibold"
          style={{
            background: feedback === 'FAVORITE' ? '#F59E0B' : colors.primarySubtle,
            color: feedback === 'FAVORITE' ? '#FFFFFF' : colors.primary,
          }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          收藏
        </button>
        <button onClick={() => handleFeedback('LIKE')} disabled={loading}
          className="flex-1 flex items-center justify-center gap-1.5 h-12 rounded-xl border-none cursor-pointer transition-all active:scale-[0.97] text-sm font-semibold"
          style={{
            background: feedback === 'LIKE' ? colors.primary : colors.primarySubtle,
            color: feedback === 'LIKE' ? colors.textOnPrimary : colors.primary,
          }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>
          喜欢
        </button>
      </div>

      {/* Bottom Actions */}
      <div className="px-4 pt-4 pb-10 flex flex-col gap-3">
        <button onClick={() => navigate('/outfits')}
          className="w-full h-12 rounded-xl border-2 flex items-center justify-center gap-2 text-base font-semibold bg-transparent cursor-pointer transition-all active:scale-[0.98]"
          style={{ borderColor: colors.primary, color: colors.primary }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
          </svg>
          重新搭配
        </button>
        {tryOnMode === 'demo' && (
          <div className="px-3 py-2.5 rounded-xl text-center"
            style={{ background: colors.primaryBg }}>
            <p className="text-xs leading-relaxed" style={{ color: colors.primary }}>
              💡 配置 <strong>Replicate API Token</strong> 可启用真人AI试穿效果
              <br />
              在 <code className="px-1 py-0.5 rounded text-[11px]" style={{ background: 'rgba(255,255,255,0.5)' }}>server/.env</code> 中设置 <code className="px-1 py-0.5 rounded text-[11px]" style={{ background: 'rgba(255,255,255,0.5)' }}>REPLICATE_API_TOKEN</code>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
