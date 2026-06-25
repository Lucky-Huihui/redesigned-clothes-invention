import { Link, useLocation } from 'react-router-dom';
import { Shirt, Sparkles, User } from 'lucide-react';
import { useAppSelector } from '@/store';

export default function BottomNav() {
  const location = useLocation();
  const theme = useAppSelector((s) => s.theme.theme);
  const active = location.pathname;

  const isActive = (path: string) => active.startsWith(path);

  const navItems = [
    { path: '/items', label: '物品', icon: Shirt },
    { path: '/outfits', label: '搭配', icon: Sparkles },
    { path: '/profile', label: '我的', icon: User },
  ];

  const primary = theme === 'PINK' ? 'bg-[#FF6B81] text-white' : 'bg-[#2C3E50] text-white';
  const inactive = theme === 'PINK' ? 'text-[#FF6B81]/60' : 'text-[#2C3E50]/60';

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 border-t ${
        theme === 'PINK'
          ? 'border-[#FF6B81]/10 bg-white/90 backdrop-blur'
          : 'border-[#2C3E50]/10 bg-white/90 backdrop-blur'
      }`}
    >
      <div className="mx-auto flex max-w-md items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const activeClass = isActive(item.path) ? primary : inactive;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 rounded-2xl px-6 py-2 transition-transform active:scale-95 ${activeClass}`}
            >
              <Icon size={22} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
