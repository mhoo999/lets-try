import React from 'react';

export default function CameraButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      className="flex items-center justify-center gap-2 px-6 py-0 rounded-full bg-[#d97a7c] hover:bg-[#c96a6c] text-white font-semibold text-base"
      style={{ minWidth: 180, height: 32 }}
      onClick={onClick}
      type="button"
    >
      {/* 카메라 아이콘 (흰색 SVG) */}
      <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
        <rect x="3" y="6" width="14" height="10" rx="2" fill="#fff" fillOpacity="0.2"/>
        <circle cx="10" cy="11" r="3" fill="#fff"/>
        <rect x="7" y="4" width="6" height="2" rx="1" fill="#fff"/>
      </svg>
      Take a PIC
    </button>
  );
} 