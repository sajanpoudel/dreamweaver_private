'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

export function DashboardHeader() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-[#1a1c2e]/80 to-transparent backdrop-blur-sm border-b border-purple-500/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/dashboard">
            <h1 className="text-2xl font-bold text-purple-100">
              DreamWeaver
            </h1>
          </Link>

          <nav className="flex items-center gap-6">
            <Link 
              href="/dashboard" 
              className={`text-sm font-medium transition-colors hover:text-purple-100 ${
                pathname === '/dashboard' ? 'text-purple-100' : 'text-purple-300/70'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              href="/feed" 
              className={`text-sm font-medium transition-colors hover:text-purple-100 ${
                pathname === '/feed' ? 'text-purple-100' : 'text-purple-300/70'
              }`}
            >
              Feed
            </Link>
            <button
              onClick={() => signOut()}
              className="text-sm font-medium text-purple-300/70 transition-colors hover:text-purple-100"
            >
              Sign Out
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
} 