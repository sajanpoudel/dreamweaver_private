"use client";

import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface Dream {
  id: string;
  title: string | null;
  content: string;
  createdAt: Date;
  symbols: Array<{ name: string }>;
  themes: Array<{ name: string }>;
  emotions: Array<{ name: string }>;
}

interface DreamListProps {
  dreams: Dream[];
}

export function DreamList({ dreams }: DreamListProps) {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {dreams.map((dream, index) => (
        <motion.div
          key={dream.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -5, scale: 1.02 }}
          className="relative group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
          <Link href={`/dreams/${dream.id}`}>
            <Card className="relative h-full bg-black/40 backdrop-blur-sm border-white/10 hover:border-white/20 transition duration-300">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white line-clamp-1">
                  {dream.title || 'Untitled Dream'}
                </CardTitle>
                <p className="text-sm text-purple-200">
                  {formatDate(dream.createdAt)}
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-purple-100 line-clamp-3 mb-4">
                  {dream.content}
                </p>
                <div className="space-y-2">
                  {dream.symbols.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {dream.symbols.slice(0, 3).map((symbol) => (
                        <span
                          key={symbol.name}
                          className="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/20"
                        >
                          {symbol.name}
                        </span>
                      ))}
                    </div>
                  )}
                  {dream.emotions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {dream.emotions.slice(0, 2).map((emotion) => (
                        <span
                          key={emotion.name}
                          className="px-2 py-1 text-xs rounded-full bg-pink-500/20 text-pink-200 border border-pink-500/20"
                        >
                          {emotion.name}
                        </span>
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
  );
} 