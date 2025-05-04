import React from 'react';
import Image from 'next/image';

export default function HandGuide({ imageUrl }: { imageUrl?: string }) {
  // 기본 이미지 경로
  const defaultImage = '/hand.png';
  return (
    <div className="relative w-full max-w-[300px] aspect-square bg-[#dadada] rounded-[8px] border border-[#dadada] overflow-hidden flex items-center justify-center">
      <Image
        src={imageUrl || defaultImage}
        alt={imageUrl ? '손 사진' : '기본 손 가이드'}
        fill
        className="object-contain"
        sizes="100vw"
        priority
      />
    </div>
  );
} 