import { useState, useEffect } from 'react';
import { useAppSelector } from '@/store';
import { getThemeColors } from '@/utils/theme';

let deferredPrompt: any = null;

export function usePWAInstall() {
  const [canInstall, setCanInstall] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setCanInstall(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) {
      // Fallback: show manual install instructions
      alert('安装方法：\n1. 点击浏览器右上角菜单 ⋮\n2. 选择"添加到主屏幕"\n3. 点击"添加"即可');
      return;
    }

    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setInstalled(true);
    }
    deferredPrompt = null;
    setCanInstall(false);
  };

  return { canInstall, installed, install };
}

interface InstallBannerProps {
  canInstall: boolean;
  onInstall: () => void;
  onDismiss: () => void;
}

export function InstallBanner({ canInstall, onInstall, onDismiss }: InstallBannerProps) {
  const [visible, setVisible] = useState(true);
  const theme = useAppSelector((s) => s.theme.theme);
  const colors = getThemeColors(theme);

  if (!canInstall || !visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center gap-3 animate-slide-down"
      style={{
        background: `linear-gradient(135deg, ${colors.primary}, ${colors.accentLight})`,
        color: colors.textOnPrimary,
        fontFamily: "'Inter','Noto Sans SC',sans-serif",
        maxWidth: '375px',
        margin: '0 auto',
        right: 'auto',
      }}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">安装到手机桌面</p>
        <p className="text-xs opacity-90 mt-0.5">像原生App一样使用，支持离线</p>
      </div>
      <button
        onClick={onInstall}
        className="px-4 py-1.5 rounded-full bg-white text-sm font-semibold border-none cursor-pointer active:scale-95 transition-transform"
        style={{ color: colors.primary }}>
        安装
      </button>
      <button
        onClick={() => { setVisible(false); onDismiss(); }}
        className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 border-none cursor-pointer text-white">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    </div>
  );
}
