'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { LogOut, Home } from 'lucide-react';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg border-b border-purple-500/20">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <button
            onClick={() => router.push('/dashboard')}
            className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text hover:from-purple-500 hover:to-pink-500 transition-all duration-200"
          >
            DreamWeaver
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          {!isHomePage && (
            <Button
              onClick={() => router.push('/dashboard')}
              variant="ghost"
              className="text-purple-200/80 hover:text-purple-200 hover:bg-purple-500/10 flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Button>
          )}
          
          <Button
            onClick={handleSignOut}
            variant="ghost"
            className="text-purple-200/80 hover:text-purple-200 hover:bg-purple-500/10 flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </motion.div>
      </div>
    </header>
  );
} 