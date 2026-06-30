import { useRef } from 'react';
import { Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  value?: string;
  onChange: (imageUrl: string) => void;
  className?: string;
}

export default function ImageUploader({ value, onChange, className = '' }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onChange(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className={cn(
        'relative flex items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed bg-bg-secondary transition-colors',
        value ? 'border-primary/30' : 'border-border hover:border-ink-3',
        className
      )}
      aria-label="点击上传照片"
    >
      {value ? (
        <img src={value} alt="preview" className="h-full w-full object-cover" />
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
            <Camera size={28} className="text-ink-3" />
          </div>
          <span className="text-sm text-ink-3 font-medium">点击上传照片</span>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </button>
  );
}
