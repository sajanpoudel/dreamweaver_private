'use client';

import { Card } from '@/components/ui/card';
import { Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

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

interface PopularSpacesProps {
  spaces: DreamSpace[];
  isLoading: boolean;
}

export function PopularSpaces({ spaces, isLoading }: PopularSpacesProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-48 backdrop-blur-lg bg-white/5 border-purple-500/20 animate-pulse" />
          </motion.div>
        ))}
      </div>
    );
  }

  if (!spaces.length) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-purple-100">Popular Dream Spaces</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {spaces.map((space, index) => (
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
                      <h3 className="text-lg font-semibold text-purple-100 group-hover:text-purple-200 transition-colors">
                        {space.name}
                      </h3>
                      <p className="text-sm text-purple-200/60">
                        {space.dreamCount} dreams · {space.dreamerCount} dreamers
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-purple-200/80 mb-4 line-clamp-2">
                    {space.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {space.primarySymbols.slice(0, 3).map((symbol, index) => (
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
        ))}
      </div>
    </div>
  );
} 