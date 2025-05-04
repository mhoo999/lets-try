import React from 'react';

export default function HandGuide({ imageUrl }: { imageUrl?: string }) {
  // 기본 이미지 경로
  const defaultImage = '/hand.png';
  return (
    <div className="flex items-center justify-center w-[344px] h-[344px] bg-[#dadada] rounded-[8px] border border-[#dadada] mx-auto my-6 overflow-hidden">
      {imageUrl ? (
        <img src={imageUrl} alt="손 사진" className="object-cover w-full h-full" />
      ) : (
        <img src={defaultImage} alt="기본 손 가이드" className="object-cover w-full h-full" />
      )}
    </div>
  );
} 