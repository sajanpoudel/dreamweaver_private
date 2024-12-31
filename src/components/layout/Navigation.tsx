'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Plus, BookOpen, Compass } from 'lucide-react';

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-purple-500/20 backdrop-blur-lg bg-black/20">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold text-purple-200">
              DreamWeaver
            </Link>
            <div className="flex items-center gap-1">
              <Link
                href="/dashboard"
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  pathname === '/dashboard'
                    ? 'bg-purple-500/10 text-purple-200'
                    : 'text-purple-200/60 hover:text-purple-200 hover:bg-purple-500/10'
                )}
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/feed"
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  pathname === '/feed'
                    ? 'bg-purple-500/10 text-purple-200'
                    : 'text-purple-200/60 hover:text-purple-200 hover:bg-purple-500/10'
                )}
              >
                <Compass className="h-4 w-4" />
                Dream Feed
              </Link>
              <Link
                href="/dreams/new"
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  pathname === '/dreams/new'
                    ? 'bg-purple-500/10 text-purple-200'
                    : 'text-purple-200/60 hover:text-purple-200 hover:bg-purple-500/10'
                )}
              >
                <Plus className="h-4 w-4" />
                New Dream
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 