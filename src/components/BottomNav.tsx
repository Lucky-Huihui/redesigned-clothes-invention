import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Props {
  current: 'items' | 'outfits' | 'profile';
}

const tabs = [
  {
    key: 'items' as const,
    label: '物品',
    path: '/items',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
      </svg>
    ),
  },
  {
    key: 'outfits' as const,
    label: '搭配',
    path: '/outfits',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/>
        <path d="M12 12l8-4.5"/>
        <path d="M12 12v9"/>
        <path d="M12 12L4 7.5"/>
      </svg>
    ),
  },
  {
    key: 'profile' as const,
    label: '个人中心',
    path: '/profile',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

export default function BottomNav({ current }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full z-sticky border-t bg-bg safe-bottom"
      style={{ maxWidth: '375px', borderColor: 'var(--color-border-light)' }}
      aria-label="底部导航"
    >
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const active = current === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                if (location.pathname !== tab.path) navigate(tab.path);
              }}
              className={cn(
                'flex flex-col items-center gap-0.5 py-1 px-3 bg-transparent border-none transition-colors duration-150',
                active ? 'text-primary' : 'text-ink-3'
              )}
              aria-current={active ? 'page' : undefined}
            >
              {tab.icon(active)}
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
