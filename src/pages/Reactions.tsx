import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getReactions } from '@/api/outfits';
import type { ReactionWithOutfit } from '@/api/outfits';
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils/theme';

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  LIKE: { label: '喜欢的搭配', color: 'var(--color-primary)' },
  FAVORITE: { label: '收藏的搭配', color: 'var(--state-warning)' },
  DISLIKE: { label: '不喜欢的搭配', color: 'var(--color-text-secondary)' },
};

export default function Reactions() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const info = TYPE_CONFIG[type || ''] || { label: '搭配记录', color: 'var(--color-primary)' };

  const [reactions, setReactions] = useState<ReactionWithOutfit[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getReactions(type!);
      setReactions(data);
    } catch (err) {
      console.error('Failed to load reactions:', err);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div className="app-shell">
      <nav className="sticky top-0 z-sticky flex items-center justify-center h-14 px-4 bg-surface border-b border-border-light safe-top">
        <button onClick={() => navigate('/profile')} className="absolute left-4 w-9 h-9 flex items-center justify-center rounded-lg text-ink">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5m7-7-7 7 7 7"/>
          </svg>
        </button>
        <h1 className="text-base font-semibold text-ink">{info.label}</h1>
      </nav>

      {/* Tab bar */}
      <div className="flex bg-surface border-b border-border-light">
        {Object.entries(TYPE_CONFIG).map(([key, val]) => (
          <button
            key={key}
            onClick={() => navigate(`/profile/reactions/${key}`)}
            className={cn(
              'flex-1 py-3 text-sm font-medium border-b-2 transition-colors',
              type === key ? 'border-current' : 'border-transparent text-ink-3'
            )}
            style={{ color: type === key ? val.color : undefined }}
          >
            {val.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="px-3 pt-4 pb-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-ink-3">加载中...</p>
          </div>
        ) : reactions.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-sm text-ink-3">暂无{info.label}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {reactions.map(r => (
              <div key={r.id} className="rounded-xl overflow-hidden bg-surface shadow-card">
                {r.outfit.result_image ? (
                  <img
                    src={r.outfit.result_image}
                    alt="搭配"
                    className="w-full object-cover bg-primary-bg"
                    style={{ aspectRatio: '3/4' }}
                  />
                ) : (
                  <div
                    className="w-full flex items-center justify-center text-3xl bg-primary-bg"
                    style={{ aspectRatio: '3/4' }}
                  >
                    👗
                  </div>
                )}
                <div className="px-3 py-2">
                  <p className="text-xs text-ink-3">{formatDate(r.outfit.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
