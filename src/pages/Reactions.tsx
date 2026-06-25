import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import { useAppSelector } from '@/store';
import type { ReactionType } from '@/types';

export default function Reactions() {
  const { type } = useParams<{ type: string }>();
  const userId = useAppSelector((s) => s.auth.currentUserId);
  const theme = useAppSelector((s) => s.theme.theme);
  const outfits = useAppSelector((s) => s.outfits.outfits);
  const reactions = useAppSelector((s) =>
    s.reactions.reactions.filter(
      (r) => r.userId === userId && r.type === (type?.toUpperCase() as ReactionType)
    )
  );

  const [preview, setPreview] = useState<string | null>(null);

  const data = useMemo(() => {
    return reactions
      .map((r) => {
        const outfit = outfits.find((o) => o.outfitId === r.outfitId);
        return outfit ? { ...r, outfit } : null;
      })
      .filter(Boolean) as (typeof reactions[number] & { outfit: typeof outfits[number] })[];
  }, [reactions, outfits]);

  const bg = theme === 'PINK' ? 'bg-[#FFF5F7]' : 'bg-[#F8F9FA]';
  const primaryText = theme === 'PINK' ? 'text-[#FF6B81]' : 'text-[#2C3E50]';
  const labels: Record<string, string> = {
    like: '我喜欢的',
    favorite: '我收藏的',
    dislike: '我不喜欢的',
  };

  return (
    <div className={`min-h-screen ${bg}`}>
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-white/90 px-5 py-4 backdrop-blur">
        <Link to="/profile" className={primaryText}>
          <ArrowLeft size={24} />
        </Link>
        <h1 className={`text-lg font-bold ${primaryText}`}>{labels[type || 'like']}</h1>
      </header>

      <main className="mx-auto max-w-md px-4 pt-4">
        {data.length === 0 ? (
          <div className="py-20 text-center text-gray-400">暂无记录</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {data.map(({ outfit }) => (
              <button
                key={outfit.outfitId}
                onClick={() => outfit.resultImageUrl && setPreview(outfit.resultImageUrl)}
                className="overflow-hidden rounded-2xl bg-white shadow-sm"
              >
                {outfit.resultImageUrl ? (
                  <img
                    src={outfit.resultImageUrl}
                    alt="outfit"
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center text-gray-400">
                    无效果图
                  </div>
                )}
                <p className="p-2 text-xs text-gray-500">
                  {new Date(outfit.createTime).toLocaleString()}
                </p>
              </button>
            ))}
          </div>
        )}
      </main>

      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreview(null)}
        >
          <button className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white">
            <X size={24} />
          </button>
          <img src={preview} alt="preview" className="max-h-full max-w-full rounded-xl" />
        </div>
      )}
    </div>
  );
}
