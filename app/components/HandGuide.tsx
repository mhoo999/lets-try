import React from 'react';
import Image from 'next/image';

export default function HandGuide({ imageUrl }: { imageUrl?: string }) {
  // 기본 이미지 경로
  const defaultImage = '/hand.png';
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt="손 사진"
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 text-center px-6">
          <Image
            src={defaultImage}
            alt="손 가이드 예시"
            width={200}
            height={200}
            className="object-contain opacity-40"
            priority
          />
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Place your hand like the guide</p>
            <p className="text-xs text-gray-400">Make sure your fingers are clearly visible</p>
          </div>
        </div>
      )}
    </div>
  );
} 