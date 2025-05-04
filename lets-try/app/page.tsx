'use client';

import React, { useState } from 'react';
import Header from './components/Header';
import CameraButton from './components/CameraButton';
import HandGuide from './components/HandGuide';
import FingerPills from './components/FingerPills';

export default function Home() {
  const [selectedFinger, setSelectedFinger] = useState<string | undefined>(undefined);

  return (
    <main className="max-w-[375px] mx-auto flex flex-col items-center relative bg-transparent" style={{ minHeight: 812 }}>
      {/* 상태바 여백 */}
      <div className="h-[44px] w-full" />
      <Header />
      <div className="mt-6" />
      <CameraButton />
      <div className="mt-8" />
      <HandGuide />
      <div className="mt-4" />
      <FingerPills selected={selectedFinger} onSelect={setSelectedFinger} />
      <div className="mt-4" />
      <div className="flex flex-col gap-3 items-center my-6">
        <button
          className="w-[180px] h-8 rounded-full bg-[#d97a7c] hover:bg-[#c96a6c] text-white font-semibold text-base mb-1"
          type="button"
        >
          Select a rings
        </button>
        <button
          className="w-[180px] h-8 rounded-full bg-[#dadada] text-white font-semibold text-base flex items-center justify-center"
          type="button"
          disabled
        >
          -
        </button>
        <button
          className="w-[180px] h-8 rounded-full bg-[#1a1f26] hover:bg-[#11141a] text-white font-semibold text-base"
          type="button"
        >
          Share
        </button>
      </div>
      <div className="flex-1" />
    </main>
  );
}
