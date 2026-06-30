import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { setOutfitFeedback } from '@/api/outfits';
import { getErrorMessage } from '@/utils/error';
import { cn } from '@/lib/utils';
import type { AppOutfit } from '@/types';

interface SelectedItem {
  id: string;
  name: string;
  image: string;
  catName: string;
}

interface LocationState {
  outfit?: AppOutfit;
  selectedItems?: SelectedItem[];
  tryOnMode?: 'ai' | 'demo';
  tryOnMessage?: string;
}

const BackIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5" />
    <path d="M12 19l-7-7 7-7" />
  </svg>
);

const ShareIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const DislikeIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 14V2" />
    <path d="M9 18.12 10 14H4.17a2 2 0 01-1.92-2.56l2.33-8A2 2 0 016.5 2H20a2 2 0 012 2v8a2 2 0 01-2 2h-2.76a2 2 0 00-1.79 1.11L12 22h0a3.13 3.13 0 01-3-3.88z" />
  </svg>
);

const HeartIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);

const LikeIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
  </svg>
);

const RefreshIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 00-9-9 9.75 9.75 0 00-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 009 9 9.75 9.75 0 006.74-2.74L21 16" />
    <path d="M16 21h5v-5" />
  </svg>
);

const CAT_ICONS: Record<string, string> = {
  上装: '👕',
  下装: '👖',
  连衣裙: '👗',
  袜子: '🧦',
  鞋子: '👟',
  发饰: '🎀',
  耳饰: '💎',
  外套: '🧥',
  背包: '👜',
};

function CategoryThumb({ catName }: { catName: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center text-primary">
      {catName === '上装' || catName === '外套' ? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.38 3.46 16 2a4 4 0 0 0-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
        </svg>
      ) : catName === '下装' || catName === '连衣裙' ? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
      ) : catName === '鞋子' || catName === '袜子' ? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 17l-2 2-2-2" />
          <path d="M15 17V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v12" />
          <path d="M5 17l2 2 2-2" />
          <path d="M9 17V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12" />
        </svg>
      ) : (
        <span className="text-xl">{CAT_ICONS[catName] || '✨'}</span>
      )}
    </div>
  );
}

export default function OutfitResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) || {};
  const outfit = state.outfit;
  const selectedItems = state.selectedItems || [];
  const tryOnMode = state.tryOnMode;

  const [feedback, setFeedback] = useState<string | null>(outfit?.feedback || null);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  if (!outfit) {
    return (
      <div className="app-shell flex flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <p className="text-ink-2 mb-5">未找到搭配数据</p>
        <button onClick={() => navigate('/outfits')} className="btn-primary px-6">
          返回搭配
        </button>
      </div>
    );
  }

  const handleFeedback = async (type: string) => {
    setLoading(true);
    try {
      await setOutfitFeedback(outfit.id, type);
      setFeedback(type);
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell min-h-screen bg-bg">
      {/* Top Nav */}
      <nav className="sticky top-0 z-sticky flex items-center justify-center h-14 px-5 bg-bg border-b border-border-light">
        <button
          onClick={() => navigate('/outfits')}
          className="absolute left-4 w-9 h-9 flex items-center justify-center rounded-lg text-ink transition-colors active:text-ink-2"
          aria-label="返回"
        >
          <BackIcon />
        </button>
        <h1 className="text-base font-semibold text-ink">试穿效果</h1>
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: 'AI 试穿效果', url: window.location.href }).catch(() => {});
            }
          }}
          className="absolute right-4 w-9 h-9 flex items-center justify-center rounded-lg text-ink transition-colors active:text-ink-2"
          aria-label="分享"
        >
          <ShareIcon />
        </button>
      </nav>

      {/* Main Display Area */}
      <main className="relative w-full h-[60vh] min-h-[400px] bg-bg-secondary overflow-hidden">
        {outfit.result_image ? (
          <>
            <img
              src={outfit.result_image}
              alt="AI试穿效果展示"
              className="w-full h-full object-cover"
              onLoad={() => setImageLoading(false)}
            />
            {imageLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-bg-secondary text-ink-3">
                <div className="text-5xl animate-pulse">👗</div>
                <p className="text-sm">正在生成试穿效果...</p>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-ink-3">
            <div className="text-5xl animate-pulse">👗</div>
            <p className="text-sm">正在生成试穿效果...</p>
          </div>
        )}
        {tryOnMode === 'ai' && (
          <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-md bg-primary/85 text-white text-[11px] font-medium tracking-wide">
            AI 试穿
          </span>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
      </main>

      {/* Outfit Summary Strip */}
      <section className="px-4 py-4 bg-bg border-b border-border-light">
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {selectedItems.map((it) => (
            <div key={it.id} className="flex-shrink-0 flex flex-col items-center gap-1.5">
              <div className="w-14 h-14 rounded-xl bg-bg-secondary border border-border-light flex items-center justify-center overflow-hidden text-primary">
                {it.image ? (
                  <img src={it.image} alt={it.name} className="w-full h-full object-cover" />
                ) : (
                  <CategoryThumb catName={it.catName} />
                )}
              </div>
              <span className="text-xs text-ink-2 text-center max-w-[70px] truncate">{it.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Feedback Buttons */}
      <section className="px-4 py-4 bg-bg">
        <div className="flex gap-3">
          <button
            onClick={() => handleFeedback('DISLIKE')}
            disabled={loading}
            className={cn(
              'flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-none transition-transform active:scale-[0.98] text-sm font-medium',
              feedback === 'DISLIKE'
                ? 'bg-error text-white ring-2 ring-error/30'
                : 'bg-bg-tertiary text-ink-2'
            )}
            aria-label="不喜欢"
          >
            <DislikeIcon className={cn('w-5 h-5', feedback === 'DISLIKE' ? 'text-white' : 'text-ink-2')} />
            <span>不喜欢</span>
          </button>
          <button
            onClick={() => handleFeedback('FAVORITE')}
            disabled={loading}
            className={cn(
              'flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-none transition-transform active:scale-[0.98] text-sm font-medium',
              feedback === 'FAVORITE'
                ? 'bg-warning text-white ring-2 ring-warning/30'
                : 'bg-primary-subtle text-primary'
            )}
            aria-label="收藏"
          >
            <HeartIcon className={cn('w-5 h-5', feedback === 'FAVORITE' ? 'text-white' : 'text-primary')} />
            <span>收藏</span>
          </button>
          <button
            onClick={() => handleFeedback('LIKE')}
            disabled={loading}
            className={cn(
              'flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-none transition-transform active:scale-[0.98] text-sm font-medium',
              feedback === 'LIKE'
                ? 'bg-primary-hover text-white ring-2 ring-primary/30'
                : 'bg-primary text-brand-ink'
            )}
            aria-label="喜欢"
          >
            <LikeIcon className={cn('w-5 h-5', feedback === 'LIKE' ? 'text-white' : 'text-brand-ink')} />
            <span>喜欢</span>
          </button>
        </div>
      </section>

      {/* Bottom Action */}
      <section className="px-4 pb-8 bg-bg">
        <button
          onClick={() => navigate('/outfits')}
          className="btn-outline"
          aria-label="重新搭配"
        >
          <RefreshIcon />
          重新搭配
        </button>
      </section>
    </div>
  );
}
