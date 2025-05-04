import React from 'react';

const fingers = ['엄지', '검지', '중지', '약지', '소지'];

interface FingerPillsProps {
  selected?: string;
  onSelect?: (finger: string) => void;
  disabled?: boolean;
}

export default function FingerPills({ selected, onSelect, disabled }: FingerPillsProps) {
  return (
    <div className="flex justify-center gap-2">
      {fingers.map((finger) => (
        <button
          key={finger}
          className={`w-[60px] h-[30px] min-w-[40px] min-h-[20px] rounded-full text-base font-medium transition-colors flex items-center justify-center
            ${selected === finger ? 'bg-[#d97a7c] text-white' : 'bg-[#faeaea] text-black'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => !disabled && onSelect?.(finger)}
          type="button"
          disabled={disabled}
        >
          {finger}
        </button>
      ))}
    </div>
  );
} 