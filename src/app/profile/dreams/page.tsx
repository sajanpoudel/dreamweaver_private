'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';
import { FallingStars } from '@/components/FallingStars';

interface Dream {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  symbols: Array<{ id: string; name: string }>;
  themes: Array<{ id: string; name: string }>;
  emotions: Array<{ id: string; name: string }>;
}

export default function DreamsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) {
      router.push('/auth/signin');
      return;
    }

    const fetchDreams = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/dreams');
        if (response.ok) {
          const data = await response.json();
          setDreams(data);
        }
      } catch (error) {
        console.error('Error fetching dreams:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDreams();
  }, [session, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1c2e] via-[#2d2b55] to-[#3c1f52]">
        <FallingStars />
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-white text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-400 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              <p className="mt-4">Loading your dreams...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1c2e] via-[#2d2b55] to-[#3c1f52]">
      <FallingStars />
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text mb-2">
            My Dream Collection
          </h1>
          <p className="text-gray-300">Your personal journey through {dreams.length} dreams</p>
        </motion.div>

        {dreams.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-64 text-center"
          >
            <p className="text-white mb-4">You haven't recorded any dreams yet.</p>
            <Link 
              href="/dashboard"
              className="text-purple-200 hover:text-purple-100 underline"
            >
              Go to Dashboard to record your first dream
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dreams.map((dream, index) => (
              <motion.div
                key={dream.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Link href={`/dreams/${dream.id}`} className="block transform transition-all duration-300 hover:-translate-y-1">
                  <Card className="relative overflow-hidden backdrop-blur-lg bg-white/5 border border-purple-500/20 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-purple-500/20">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardContent className="relative p-6 space-y-4">
                      <div className="flex flex-col">
                        <div className="flex justify-end mb-2">
                          <span className="text-xs text-gray-400 bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-md">
                            {formatDate(new Date(dream.createdAt))}
                          </span>
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-white group-hover:text-purple-200 transition-colors duration-300 line-clamp-1">
                            {dream.title}
                          </h2>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm line-clamp-2 group-hover:text-gray-200 transition-colors duration-300">
                        {dream.content}
                      </p>
                      <div className="pt-4 border-t border-purple-500/10 space-y-3">
                        {dream.symbols.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {dream.symbols.map((symbol) => (
                              <Badge
                                key={symbol.id}
                                variant="secondary"
                                className="bg-purple-500/20 text-purple-200 border-purple-500/20 group-hover:bg-purple-500/30 group-hover:border-purple-500/30 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                              >
                                {symbol.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {dream.themes.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {dream.themes.map((theme) => (
                              <Badge
                                key={theme.id}
                                variant="secondary"
                                className="bg-pink-500/20 text-pink-200 border-pink-500/20 group-hover:bg-pink-500/30 group-hover:border-pink-500/30 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                              >
                                {theme.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 