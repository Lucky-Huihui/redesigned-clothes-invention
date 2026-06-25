import { useEffect } from 'react';
import { useAppSelector } from '@/store';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, onClose, duration = 2000 }: ToastProps) {
  const theme = useAppSelector((s) => s.theme.theme);

  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`fixed left-1/2 top-20 z-[60] -translate-x-1/2 rounded-full px-5 py-2.5 text-sm font-medium text-white shadow-lg ${
        theme === 'PINK' ? 'bg-[#FF6B81]' : 'bg-[#2C3E50]'
      }`}
    >
      {message}
    </div>
  );
}
