import React from 'react';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="flex items-center justify-center w-full h-12">
      <Image src="/haime-logo.png" alt="로고" width={120} height={32} />
    </header>
  );
} 