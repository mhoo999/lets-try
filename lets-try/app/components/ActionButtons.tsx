import React from 'react';

export default function ActionButtons({ onSelectRing, onShare }: { onSelectRing?: () => void; onShare?: () => void }) {
  return (
    <div className="flex flex-col gap-3 items-center my-6">
      <button
        className="w-[180px] h-8 rounded-full bg-[#d97a7c] hover:bg-[#c96a6c] text-white font-semibold text-base mb-1"
        onClick={onSelectRing}
        type="button"
      >
        Select a rings
      </button>
      <button
        className="w-[180px] h-8 rounded-full bg-[#1a1f26] hover:bg-[#11141a] text-white font-semibold text-base"
        onClick={onShare}
        type="button"
      >
        Share
      </button>
    </div>
  );
} 