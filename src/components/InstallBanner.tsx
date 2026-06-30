import { useState } from 'react';

interface InstallBannerProps {
  canInstall: boolean;
  onInstall: () => void;
  onDismiss: () => void;
}

export default function InstallBanner({ canInstall, onInstall, onDismiss }: InstallBannerProps) {
  const [visible, setVisible] = useState(true);

  if (!canInstall || !visible) return null;

  return (
    <div
      className="fixed top-0 left-1/2 -translate-x-1/2 z-toast px-4 py-3 flex items-center gap-3 animate-slide-down text-white"
      style={{
        maxWidth: '430px',
        width: '100%',
        background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent-light))',
      }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">安装到手机桌面</p>
        <p className="text-xs opacity-90 mt-0.5">像原生 App 一样使用，支持离线</p>
      </div>
      <button
        onClick={onInstall}
        className="px-4 py-1.5 rounded-full bg-white text-sm font-semibold border-none cursor-pointer active:scale-95 transition-transform"
        style={{ color: 'var(--color-primary)' }}
      >
        安装
      </button>
      <button
        onClick={() => { setVisible(false); onDismiss(); }}
        className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 border-none cursor-pointer text-white"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    </div>
  );
}
