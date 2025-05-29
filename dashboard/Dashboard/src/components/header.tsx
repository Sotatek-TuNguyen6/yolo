'use client';
import React from 'react';
import { UserMenu } from '@/components/user-menu';

export default function Header() {
  return (
    <header className="flex flex-row-reverse items-center justify-between px-8 py-4 border-b">
      <UserMenu />
    </header>
  );
}
