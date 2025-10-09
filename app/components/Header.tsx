import React from 'react';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="flex items-center justify-center w-full py-3">
      <div className="flex items-center gap-2">
        <Image src="/haime-logo.png" alt="haime logo" width={100} height={28} className="object-contain" />
        <span className="text-xs text-gray-400 font-light">Ring Try-On</span>
      </div>
    </header>
  );
} 