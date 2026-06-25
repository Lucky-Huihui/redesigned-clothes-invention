import { useRef } from 'react';
import { Camera } from 'lucide-react';
import { useAppSelector } from '@/store';

interface ImageUploaderProps {
  value?: string;
  onChange: (imageUrl: string) => void;
  className?: string;
}

export default function ImageUploader({ value, onChange, className = '' }: ImageUploaderProps) {
  const theme = useAppSelector((s) => s.theme.theme);
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

  const borderClass =
    theme === 'PINK'
      ? 'border-[#FF6B81]/30 bg-[#FFF5F7] text-[#FF6B81]'
      : 'border-[#2C3E50]/30 bg-[#F8F9FA] text-[#2C3E50]';

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className={`relative flex items-center justify-center overflow-hidden border-2 border-dashed ${borderClass} ${className}`}
      style={{ aspectRatio: '1/1' }}
    >
      {value ? (
        <img src={value} alt="preview" className="h-full w-full object-cover" />
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Camera size={32} />
          <span className="text-sm">点击上传</span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </button>
  );
}
