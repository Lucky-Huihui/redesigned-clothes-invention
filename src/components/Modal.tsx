import { X } from 'lucide-react';
import { useAppSelector } from '@/store';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function Modal({ open, title, onClose, children, footer }: ModalProps) {
  const theme = useAppSelector((s) => s.theme.theme);
  if (!open) return null;

  const bg = theme === 'PINK' ? 'bg-[#FFF5F7]' : 'bg-[#F8F9FA]';
  const text = theme === 'PINK' ? 'text-[#FF6B81]' : 'text-[#2C3E50]';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={`relative w-full max-w-md rounded-t-3xl p-5 shadow-2xl sm:rounded-3xl ${bg}`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className={`text-lg font-bold ${text}`}>{title}</h3>
          <button onClick={onClose} className={`rounded-full p-1 ${text}`}>
            <X size={22} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto">{children}</div>
        {footer && <div className="mt-4 flex gap-3">{footer}</div>}
      </div>
    </div>
  );
}
