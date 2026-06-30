import { useEffect } from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, onClose, duration = 2000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed left-1/2 top-20 z-toast -translate-x-1/2 rounded-full px-5 py-2.5 text-sm font-medium text-white shadow-lg animate-fade-slide-up bg-primary">
      {message}
    </div>
  );
}
