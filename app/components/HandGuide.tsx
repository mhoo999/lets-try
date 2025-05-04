import React from 'react';
import Image from 'next/image';

export default function HandGuide({ imageUrl }: { imageUrl?: string }) {
  // 기본 이미지 경로
  const defaultImage = '/hand.png';
  return (
    <div className="flex items-center justify-center w-full h-full aspect-square bg-[#dadada] rounded-[8px] border border-[#dadada] overflow-hidden">
      {imageUrl ? (
        <Image src={imageUrl} alt="손 사진" className="object-cover w-full h-full" fill sizes="100vw" />
      ) : (
        <Image src={defaultImage} alt="기본 손 가이드" className="object-cover w-full h-full" fill sizes="100vw" />
      )}
    </div>
  );
} 