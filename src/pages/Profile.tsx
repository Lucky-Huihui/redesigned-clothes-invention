import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  Star,
  ThumbsDown,
  User,
  Palette,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { toggleTheme } from '@/store/slices/themeSlice';
import BottomNav from '@/components/BottomNav';

export default function Profile() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userId = useAppSelector((s) => s.auth.currentUserId);
  const user = useAppSelector((s) => s.auth.users.find((u) => u.userId === userId));
  const theme = useAppSelector((s) => s.theme.theme);
  const reactions = useAppSelector((s) =>
    s.reactions.reactions.filter((r) => r.userId === userId)
  );

  const counts = {
    LIKE: reactions.filter((r) => r.type === 'LIKE').length,
    FAVORITE: reactions.filter((r) => r.type === 'FAVORITE').length,
    DISLIKE: reactions.filter((r) => r.type === 'DISLIKE').length,
  };

  const bg = theme === 'PINK' ? 'bg-[#FFF5F7]' : 'bg-[#F8F9FA]';
  const primaryText = theme === 'PINK' ? 'text-[#FF6B81]' : 'text-[#2C3E50]';
  const primaryBg = theme === 'PINK' ? 'bg-[#FF6B81]' : 'bg-[#2C3E50]';
  const radius = theme === 'PINK' ? 'rounded-3xl' : 'rounded-xl';

  return (
    <div className={`min-h-screen pb-24 ${bg}`}>
      <header className="sticky top-0 z-10 bg-white/90 px-5 py-4 backdrop-blur">
        <h1 className={`text-xl font-bold ${primaryText}`}>个人中心</h1>
      </header>

      <main className="mx-auto max-w-md px-4 pt-4">
        <section className={`flex items-center gap-4 bg-white p-5 shadow-sm ${radius}`}>
          <div
            className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-full ${
              theme === 'PINK' ? 'bg-[#FF6B81]/10' : 'bg-[#2C3E50]/10'
            }`}
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar" className="h-full w-full object-cover" />
            ) : (
              <User size={32} className={primaryText} />
            )}
          </div>
          <div>
            <p className="text-lg font-bold text-gray-800">{user?.nickname || '未设置昵称'}</p>
            <p className="text-sm text-gray-400">{user?.gender === 'MALE' ? '男' : '女'}</p>
          </div>
        </section>

        <section className={`mt-4 grid grid-cols-3 gap-3`}>
          {[
            { type: 'LIKE', label: '我喜欢的', icon: Heart, count: counts.LIKE },
            { type: 'FAVORITE', label: '我收藏的', icon: Star, count: counts.FAVORITE },
            { type: 'DISLIKE', label: '我不喜欢的', icon: ThumbsDown, count: counts.DISLIKE },
          ].map(({ type, label, icon: Icon, count }) => (
            <Link
              key={type}
              to={`/profile/reactions/${type.toLowerCase()}`}
              className={`flex flex-col items-center bg-white p-4 shadow-sm transition-transform active:scale-95 ${radius}`}
            >
              <Icon size={22} className={primaryText} />
              <span className="mt-2 text-xs text-gray-500">{label}</span>
              <span className={`text-lg font-bold ${primaryText}`}>{count}</span>
            </Link>
          ))}
        </section>

        <section className={`mt-4 space-y-3`}>
          <Link
            to="/profile/edit"
            className={`flex items-center justify-between bg-white p-4 shadow-sm ${radius}`}
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-full p-2 ${theme === 'PINK' ? 'bg-[#FF6B81]/10' : 'bg-[#2C3E50]/10'}`}>
                <User size={20} className={primaryText} />
              </div>
              <span className="font-medium text-gray-800">编辑资料</span>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </Link>

          <button
            onClick={() => dispatch(toggleTheme())}
            className={`flex w-full items-center justify-between bg-white p-4 shadow-sm ${radius}`}
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-full p-2 ${theme === 'PINK' ? 'bg-[#FF6B81]/10' : 'bg-[#2C3E50]/10'}`}>
                <Palette size={20} className={primaryText} />
              </div>
              <span className="font-medium text-gray-800">主题切换</span>
            </div>
            <span className={`text-sm font-medium ${primaryText}`}>
              {theme === 'PINK' ? '柔光·粉黛' : '极简·墨灰'}
            </span>
          </button>

          <button
            onClick={() => {
              dispatch(logout());
              navigate('/login');
            }}
            className={`flex w-full items-center justify-between bg-white p-4 shadow-sm ${radius}`}
          >
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-red-50 p-2">
                <LogOut size={20} className="text-red-500" />
              </div>
              <span className="font-medium text-gray-800">退出登录</span>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </button>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
