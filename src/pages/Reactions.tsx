import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getReactions } from '@/api/outfits';
import { useAppSelector } from '@/store';
import { getThemeColors, formatDate } from '@/utils/theme';
import type { ReactionWithOutfit } from '@/api/outfits';

const TYPE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  LIKE: { label: '喜欢的搭配', icon: '❤️', color: '#E8A0BF' },
  FAVORITE: { label: '收藏的搭配', icon: '⭐', color: '#F59E0B' },
  DISLIKE: { label: '不喜欢的搭配', icon: '👎', color: '#9CA3AF' },
};

export default function Reactions() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const theme = useAppSelector((s) => s.theme.theme);
  const colors = getThemeColors(theme);
  const info = TYPE_LABELS[type || ''] || { label: '搭配记录', icon: '📋', color: colors.primary };

  const [reactions, setReactions] = useState<ReactionWithOutfit[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
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
    <div className="min-h-screen" style={{ fontFamily: "'Inter','Noto Sans SC',sans-serif", maxWidth: '375px', margin: '0 auto', background: colors.bgSecondary }}>
      <nav className="sticky top-0 z-20 flex items-center justify-center h-14 px-4 bg-white border-b" style={{ borderColor: colors.borderLight }}>
        <button onClick={() => navigate('/profile')} className="absolute left-4 w-9 h-9 flex items-center justify-center rounded-lg">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5m7-7-7 7 7 7"/></svg>
        </button>
        <h1 className="text-base font-semibold text-gray-900">{info.icon} {info.label}</h1>
      </nav>

      {/* Tab bar */}
      <div className="flex bg-white border-b" style={{ borderColor: colors.borderLight }}>
        {Object.entries(TYPE_LABELS).map(([key, val]) => (
          <button key={key} onClick={() => navigate(`/profile/reactions/${key}`)}
            className="flex-1 py-3 text-sm font-medium border-b-2 transition-colors"
            style={{
              color: type === key ? val.color : colors.textTertiary,
              borderBottomColor: type === key ? val.color : 'transparent',
            }}>
            {val.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="px-3 pt-4 pb-8">
        {loading ? (
          <div className="text-center py-12 text-gray-400">加载中...</div>
        ) : reactions.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-sm text-gray-400">暂无{info.label}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {reactions.map(r => (
              <div key={r.id} className="rounded-xl overflow-hidden" style={{ background: colors.bg, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                {r.outfit.result_image ? (
                  <img src={r.outfit.result_image} alt="搭配" className="w-full object-cover" style={{ aspectRatio: '3/4', background: colors.primaryBg }} />
                ) : (
                  <div className="w-full flex items-center justify-center text-3xl" style={{ aspectRatio: '3/4', background: colors.primaryBg }}>
                    👗
                  </div>
                )}
                <div className="px-3 py-2">
                  <p className="text-xs text-gray-400">{formatDate(r.outfit.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
