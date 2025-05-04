import React from 'react';

export default function ActionButtons({ onSelectRing, onShare }: { onSelectRing?: () => void; onShare?: () => void }) {
  return (
    <div className="flex flex-col gap-1 items-center">
      <button
        className="w-[48vw] max-w-[180px] h-[5vh] min-h-[28px] rounded-full bg-[#d97a7c] hover:bg-[#c96a6c] text-white font-semibold text-base mb-0"
        onClick={onSelectRing}
        type="button"
      >
        Select a rings
      </button>
      <button
        className="w-[48vw] max-w-[180px] h-[5vh] min-h-[28px] rounded-full bg-[#1a1f26] hover:bg-[#11141a] text-white font-semibold text-base mb-0"
        onClick={onShare}
        type="button"
      >
        Share
      </button>
    </div>
  );
} 