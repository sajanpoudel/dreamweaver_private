'use client';

import { Card } from '@/components/ui/card';
import { Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

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
}

export function FeedSpaces() {
  const [spaces, setSpaces] = useState<DreamSpace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPopularSpaces();
  }, []);

  const fetchPopularSpaces = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/spaces');
      const data: ApiResponse = await response.json();

      if (!response.ok) return;

      // Sort by popularity and take top 3
      const popularSpaces = [...data.spaces]
        .sort((a, b) => {
          const scoreA = a.dreamerCount * 2 + a.dreamCount;
          const scoreB = b.dreamerCount * 2 + b.dreamCount;
          return scoreB - scoreA;
        })
        .slice(0, 3);

      setSpaces(popularSpaces);
    } catch (error) {
      console.error('Error fetching popular spaces:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="backdrop-blur-lg bg-white/5 border-purple-500/20 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-200" />
            </div>
            <h2 className="text-lg font-semibold text-purple-100">Dream Spaces</h2>
          </div>
          <Link
            href="/spaces"
            className="text-sm text-purple-200/60 hover:text-purple-200 transition-colors flex items-center gap-1.5"
          >
            Explore All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-16 bg-purple-500/10 rounded-lg animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  if (!spaces.length) {
    return null;
  }

  return (
    <Card className="backdrop-blur-lg bg-white/5 border-purple-500/20 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-purple-200" />
          </div>
          <h2 className="text-lg font-semibold text-purple-100">Dream Spaces</h2>
        </div>
        <Link
          href="/spaces"
          className="text-sm text-purple-200/60 hover:text-purple-200 transition-colors flex items-center gap-1.5"
        >
          Explore All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {spaces.map((space) => (
          <Link key={space.id} href={`/spaces/${space.id}`}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="group p-3 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-purple-100 group-hover:text-purple-50 transition-colors">
                    {space.name}
                  </h3>
                  <p className="text-sm text-purple-200/60">
                    {space.dreamCount} dreams · {space.dreamerCount} dreamers
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-purple-200/40 group-hover:text-purple-200/60 transition-colors" />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {space.primarySymbols.slice(0, 2).map((symbol, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200"
                  >
                    {symbol}
                  </span>
                ))}
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </Card>
  );
} 