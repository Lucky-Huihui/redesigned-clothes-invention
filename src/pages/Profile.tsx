import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { toggleTheme } from '@/store/slices/themeSlice';
import { getCategories } from '@/api/categories';
import { getItems } from '@/api/items';
import { getOutfits, getReactionCounts } from '@/api/outfits';
import BottomNav from '@/components/BottomNav';
import { getThemeColors } from '@/utils/theme';

export default function Profile() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const theme = useAppSelector((s) => s.theme.theme);
  const colors = getThemeColors(theme);

  const [itemCount, setItemCount] = useState(0);
  const [catCount, setCatCount] = useState(0);
  const [outfitCount, setOutfitCount] = useState(0);
  const [counts, setCounts] = useState({ LIKE: 0, FAVORITE: 0, DISLIKE: 0 });

  const loadStats = useCallback(async () => {
    try {
      const [cats, items, outfits, rc] = await Promise.all([
        getCategories(), getItems(), getOutfits(), getReactionCounts(),
      ]);
      setCatCount(cats.length);
      setItemCount(items.length);
      setOutfitCount(outfits.length);
      setCounts(rc);
    } catch (err) { /* ignore */ }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter','Noto Sans SC',sans-serif", maxWidth: '375px', margin: '0 auto', background: colors.bgSecondary }}>
      {/* Profile Card */}
      <section style={{ background: colors.primaryBg, padding: '24px 16px 20px' }}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.accentLight})` }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-semibold text-gray-900 m-0 leading-tight">{user?.nickname || '新用户'}的衣橱</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
                style={{ background: colors.primaryLight, color: colors.primary }}>
                {user?.gender === 'MALE' ? '♂ 男' : '♀ 女'}
              </span>
            </div>
            <div className="mt-2.5">
              <button onClick={() => navigate('/profile/edit')}
                className="inline-flex items-center justify-center px-4 py-1.5 border rounded-full text-[13px] font-medium bg-transparent cursor-pointer transition-all active:scale-[0.98]"
                style={{ borderColor: colors.primary, color: colors.primary }}>
                编辑资料
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="flex bg-white border-b" style={{ borderColor: colors.borderLight }}>
        {[
          { label: '件物品', value: itemCount },
          { label: '个分类', value: catCount },
          { label: '次搭配', value: outfitCount },
        ].map((stat, i) => (
          <div key={stat.label} className="flex-1 flex flex-col items-center py-4"
            style={{ borderRight: i < 2 ? `1px solid ${colors.borderLight}` : 'none' }}>
            <span className="text-[22px] font-bold text-gray-900" style={{ fontVariantNumeric: 'tabular-nums' }}>{stat.value}</span>
            <span className="text-xs text-gray-500 mt-0.5">{stat.label}</span>
          </div>
        ))}
      </section>

      {/* Reactions Menu */}
      <section className="mt-2 bg-white">
        {[
          { type: 'LIKE', label: '喜欢的搭配', icon: '❤️', count: counts.LIKE },
          { type: 'FAVORITE', label: '收藏的搭配', icon: '⭐', count: counts.FAVORITE },
          { type: 'DISLIKE', label: '不喜欢的搭配', icon: '👎', count: counts.DISLIKE },
        ].map((item, i, arr) => (
          <div key={item.type}>
            <div onClick={() => navigate(`/profile/reactions/${item.type}`)}
              className="flex items-center px-4 py-3.5 gap-3 cursor-pointer transition-colors active:bg-gray-50">
              <span className="text-lg">{item.icon}</span>
              <span className="flex-1 text-[15px] text-gray-900">{item.label}</span>
              <span className="min-w-[20px] h-5 flex items-center justify-center rounded-full px-1.5 text-[11px] font-semibold"
                style={{ background: colors.primaryLight, color: colors.primary, fontVariantNumeric: 'tabular-nums' }}>
                {item.count}
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.textTertiary} strokeWidth="1.5"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
            {i < arr.length - 1 && <div className="h-px ml-12" style={{ background: colors.borderLight }} />}
          </div>
        ))}
      </section>

      {/* Settings */}
      <section className="mt-2 bg-white">
        <div onClick={() => dispatch(toggleTheme())}
          className="flex items-center px-4 py-3.5 gap-3 cursor-pointer transition-colors active:bg-gray-50">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth="1.5">
            <circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
          <span className="flex-1 text-[15px] text-gray-900">主题切换</span>
          <span className="text-[13px] text-gray-400 mr-1">{theme === 'PINK' ? '柔光粉黛' : '极简墨灰'}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.textTertiary} strokeWidth="1.5"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
        <div className="h-px ml-12" style={{ background: colors.borderLight }} />
        <div onClick={() => navigate('/profile/edit')}
          className="flex items-center px-4 py-3.5 gap-3 cursor-pointer transition-colors active:bg-gray-50">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth="1.5"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span className="flex-1 text-[15px] text-gray-900">修改密码</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.textTertiary} strokeWidth="1.5"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
        <div className="h-px ml-12" style={{ background: colors.borderLight }} />
        <div onClick={handleLogout}
          className="flex items-center px-4 py-3.5 gap-3 cursor-pointer transition-colors active:bg-gray-50">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          <span className="flex-1 text-[15px] text-red-500">退出登录</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.textTertiary} strokeWidth="1.5"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </section>

      <div className="h-20" />
      <BottomNav current="profile" />
    </div>
  );
}
