import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { toggleTheme } from '@/store/slices/themeSlice';
import { getCategories } from '@/api/categories';
import { getItems } from '@/api/items';
import { getOutfits, getReactionCounts } from '@/api/outfits';
import BottomNav from '@/components/BottomNav';
import { cn } from '@/lib/utils';

export default function Profile() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const theme = useAppSelector((s) => s.theme.theme);

  const [itemCount, setItemCount] = useState(0);
  const [catCount, setCatCount] = useState(0);
  const [outfitCount, setOutfitCount] = useState(0);
  const [counts, setCounts] = useState({ LIKE: 0, FAVORITE: 0, DISLIKE: 0 });
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, items, outfits, rc] = await Promise.all([
        getCategories(), getItems(), getOutfits(), getReactionCounts(),
      ]);
      setCatCount(cats.length);
      setItemCount(items.length);
      setOutfitCount(outfits.length);
      setCounts(rc);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const themeLabel = theme === 'PINK' ? '女性主题' : '男性主题';

  const reactions = [
    { type: 'LIKE' as const, label: '喜欢的搭配', count: counts.LIKE },
    { type: 'FAVORITE' as const, label: '收藏的搭配', count: counts.FAVORITE },
    { type: 'DISLIKE' as const, label: '不喜欢的搭配', count: counts.DISLIKE },
  ];

  return (
    <div className="app-shell">
      <div className="safe-top" />

      {/* Profile Card */}
      <section className="bg-primary-bg px-4 pt-6 pb-5">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent-light))' }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[20px] font-semibold text-ink leading-tight m-0">
                {user?.nickname || '新用户'}的衣橱
              </h1>
              <span className="gender-pill">
                {user?.gender === 'MALE' ? '♂ 男' : '♀ 女'}
              </span>
            </div>
            <div className="mt-2.5">
              <button onClick={() => navigate('/profile/edit')} className="edit-btn">
                编辑资料
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="flex bg-surface border-b border-border-light">
        {[
          { label: '件物品', value: itemCount },
          { label: '个分类', value: catCount },
          { label: '次搭配', value: outfitCount },
        ].map((stat, i, arr) => (
          <div
            key={stat.label}
            className={cn(
              'flex-1 flex flex-col items-center py-4',
              i < arr.length - 1 && 'border-r border-border-light'
            )}
          >
            <span className="text-[22px] font-bold text-ink tabular-nums">
              {loading ? '-' : stat.value}
            </span>
            <span className="text-xs text-ink-2 mt-0.5">{stat.label}</span>
          </div>
        ))}
      </section>

      {/* Reactions Menu */}
      <section className="mt-2 bg-surface">
        {reactions.map((item, i, arr) => (
          <div key={item.type}>
            <div
              onClick={() => navigate(`/profile/reactions/${item.type}`)}
              className="menu-row"
            >
              {item.type === 'LIKE' && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              )}
              {item.type === 'FAVORITE' && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
                </svg>
              )}
              {item.type === 'DISLIKE' && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              )}
              <span className="flex-1 text-[15px] font-normal text-ink">{item.label}</span>
              <span
                className="min-w-[20px] h-5 flex items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums"
                style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
              >
                {item.count}
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
            {i < arr.length - 1 && <div className="h-px ml-12 bg-border-light" />}
          </div>
        ))}
      </section>

      {/* Settings */}
      <section className="mt-2 bg-surface">
        <div onClick={() => dispatch(toggleTheme())} className="menu-row">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="13.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="15.5" r="2.5"/><circle cx="8.5" cy="15.5" r="2.5"/>
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
          </svg>
          <span className="flex-1 text-[15px] font-normal text-ink">主题切换</span>
          <span className="text-[13px] text-ink-3 mr-1">{themeLabel}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
        <div className="h-px ml-12 bg-border-light" />
        <div onClick={() => navigate('/profile/edit')} className="menu-row">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span className="flex-1 text-[15px] font-normal text-ink">修改密码</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
        <div className="h-px ml-12 bg-border-light" />
        <div onClick={handleLogout} className="menu-row">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--state-error)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span className="flex-1 text-[15px] font-normal text-error">退出登录</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      </section>

      <div className="h-20" />
      <BottomNav current="profile" />
    </div>
  );
}
