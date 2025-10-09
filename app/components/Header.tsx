import React from 'react';
import Image from 'next/image';

export default function Header() {
  return (
    <div className="flex items-center gap-2">
      <Image src="/haime-logo.png" alt="haime logo" width={80} height={22} className="object-contain" />
    </div>
  );
} 