import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store';
import { getThemeColors } from '@/utils/theme';

interface Props {
  current: 'items' | 'outfits' | 'profile';
}

export default function BottomNav({ current }: Props) {
  const navigate = useNavigate();
  const theme = useAppSelector((s) => s.theme.theme);
  const colors = getThemeColors(theme);

  const tabs = [
    {
      key: 'items' as const,
      label: '物品',
      path: '/items',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={current === 'items' ? colors.primary : 'none'} stroke={current === 'items' ? colors.primary : colors.textTertiary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
        </svg>
      ),
    },
    {
      key: 'outfits' as const,
      label: '搭配',
      path: '/outfits',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={current === 'outfits' ? colors.primary : colors.textTertiary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
    },
    {
      key: 'profile' as const,
      label: '个人中心',
      path: '/profile',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={current === 'profile' ? colors.primary : colors.textTertiary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full z-20 border-t"
      style={{
        maxWidth: '375px',
        background: colors.bg,
        borderColor: colors.borderLight,
        paddingBottom: 'env(safe-area-inset-bottom, 0)',
      }}>
      <div className="flex items-center justify-around h-16">
        {tabs.map(tab => (
          <button key={tab.key}
            onClick={() => navigate(tab.path)}
            className="flex flex-col items-center gap-0.5 py-1 px-3 bg-none border-none cursor-pointer transition-colors"
            style={{ color: current === tab.key ? colors.primary : colors.textTertiary }}>
            {tab.icon}
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
