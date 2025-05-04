import React from 'react';

const fingers = ['엄지', '검지', '중지', '약지', '소지'];

export default function FingerPills({ selected, onSelect }: { selected?: string; onSelect?: (finger: string) => void }) {
  return (
    <div className="flex justify-center gap-2">
      {fingers.map((finger) => (
        <button
          key={finger}
          className={`w-[60px] h-[30px] min-w-[40px] min-h-[20px] rounded-full text-base font-medium transition-colors flex items-center justify-center
            ${selected === finger ? 'bg-[#d97a7c] text-white' : 'bg-[#faeaea] text-black'}`}
          onClick={() => onSelect?.(finger)}
          type="button"
        >
          {finger}
        </button>
      ))}
    </div>
  );
} 