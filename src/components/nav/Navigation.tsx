"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link 
            href="/" 
            className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text hover:from-purple-500 hover:to-pink-500 transition-all"
          >
            DreamWeaver
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {session ? (
            <>
              <Link
                href="/dashboard"
                className={cn(
                  'text-sm text-purple-200/80 hover:text-purple-200 transition-colors',
                  pathname === '/dashboard' && 'text-purple-200'
                )}
              >
                Dashboard
              </Link>
              <Button
                variant="ghost"
                className="text-purple-200/80 hover:text-purple-200 hover:bg-purple-500/10"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className={cn(
                  'text-sm text-purple-200/80 hover:text-purple-200 transition-colors',
                  pathname === '/auth/signin' && 'text-purple-200'
                )}
              >
                Sign In
              </Link>
              <Link href="/auth/signup">
                <Button
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600"
                >
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
} 