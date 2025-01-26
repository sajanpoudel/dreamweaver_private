'use client';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import Link from 'next/link';
import { PopularSpaces } from './PopularSpaces';

interface DreamSpace {
  id: string;
  name: string;
  description: string;
  symbolCount: number;
  dreamCount: number;
  primarySymbols: string[];
  dominantTheme: string;
  dreamerCount: number;
}

interface ApiResponse {
  spaces: DreamSpace[];
  message: string | null;
  debug?: {
    totalDreams: number;
    dreamsWithSymbols: number;
    dreamsWithThemes: number;
    totalSpaces?: number;
    filteredSpaces?: number;
    searchQuery?: string | null;
  };
  error?: string;
}

export function SpacesList() {
  const [spaces, setSpaces] = useState<DreamSpace[]>([]);
  const [popularSpaces, setPopularSpaces] = useState<DreamSpace[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    fetchDreamSpaces();
  }, [debouncedSearch]);

  const fetchDreamSpaces = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/spaces?search=${encodeURIComponent(debouncedSearch)}`);
      const data: ApiResponse = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch dream spaces');
        return;
      }

      // If we're not searching, set popular spaces
      if (!debouncedSearch) {
        // Sort by dreamer count and dream count to determine popularity
        const sorted = [...data.spaces].sort((a, b) => {
          const scoreA = a.dreamerCount * 2 + a.dreamCount;
          const scoreB = b.dreamerCount * 2 + b.dreamCount;
          return scoreB - scoreA;
        });
        setPopularSpaces(sorted.slice(0, 3));
      }

      setSpaces(data.spaces);
      setMessage(data.message);

      // Log debug info if available
      if (data.debug) {
        console.log('Dream Spaces Debug Info:', data.debug);
      }
    } catch (error) {
      console.error('Error fetching dream spaces:', error);
      setError('Error loading dream spaces. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="col-span-full flex flex-col items-center justify-center h-64 text-center"
      >
        <p className="text-red-400 mb-4">
          {error}
        </p>
        {error.includes('signed in') && (
          <Link
            href="/auth/signin"
            className="text-purple-200 hover:text-purple-100 underline"
          >
            Sign in to view dream spaces
          </Link>
        )}
      </motion.div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Show popular spaces only when not searching */}
      {!debouncedSearch && (
        <PopularSpaces spaces={popularSpaces} isLoading={isLoading} />
      )}

      {/* Search section */}
      <div className="space-y-8">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-3 h-5 w-5 text-purple-200/60" />
          <Input
            placeholder="Search dream spaces..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 py-6 bg-purple-500/10 border-purple-500/20 text-purple-100 placeholder:text-purple-200/60 text-lg"
          />
        </div>

        {/* Search results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading && debouncedSearch ? (
            Array.from({ length: 6 }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-48 backdrop-blur-lg bg-white/5 border-purple-500/20 animate-pulse" />
              </motion.div>
            ))
          ) : spaces.length > 0 ? (
            spaces.map((space, index) => (
              <motion.div
                key={space.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Link href={`/spaces/${space.id}`} className="block">
                  <Card className="relative overflow-hidden backdrop-blur-lg bg-gradient-to-br from-gray-900/90 to-gray-800/90 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-purple-500/20">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-purple-200" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-purple-100 group-hover:text-purple-200 transition-colors">
                            {space.name}
                          </h2>
                          <p className="text-sm text-purple-200/60">
                            {space.dreamCount} dreams · {space.symbolCount} symbols · {space.dreamerCount} dreamers
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-purple-200/80 mb-4 line-clamp-2">
                        {space.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {space.primarySymbols.map((symbol, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-200"
                          >
                            {symbol}
                          </span>
                        ))}
                      </div>
                      <div className="absolute bottom-6 right-6">
                        <ArrowRight className="w-5 h-5 text-purple-200/40 group-hover:text-purple-200/60 transition-colors" />
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full flex flex-col items-center justify-center h-64 text-center"
            >
              <p className="text-purple-200/60 mb-4">
                {message || 'No dream spaces found'}
              </p>
              {!search && (
                <Link
                  href="/dreams/new"
                  className="text-purple-200 hover:text-purple-100 underline"
                >
                  Create your first dream
                </Link>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
} 