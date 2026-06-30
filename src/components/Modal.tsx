import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export default function Modal({ open, title, onClose, children, footer, className }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-modal flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={cn(
          'relative w-full max-w-md rounded-t-3xl p-5 shadow-2xl sm:rounded-3xl bg-bg animate-slide-up',
          className
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-primary">{title}</h3>
          <button onClick={onClose} className="rounded-full p-1 text-ink-2 hover:text-ink transition-colors">
            <X size={22} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto no-scrollbar">{children}</div>
        {footer && <div className="mt-4 flex gap-3">{footer}</div>}
      </div>
    </div>
  );
}
