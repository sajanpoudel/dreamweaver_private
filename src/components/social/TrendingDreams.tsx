'use client';

import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { TrendingUp, Heart, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Dream {
  id: string;
  title: string;
  theme: string;
  likes: number;
  comments: number;
}

export function TrendingDreams() {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrendingDreams = async () => {
      try {
        const response = await fetch('/api/dreams/trending');
        if (!response.ok) throw new Error('Failed to fetch trending dreams');
        const data = await response.json();
        setDreams(data);
      } catch (err) {
        console.error('Error fetching trending dreams:', err);
        setError('Failed to load trending dreams');
      }
    };

    fetchTrendingDreams();
  }, []);

  if (error) {
    return (
      <Card className="backdrop-blur-lg bg-white/5 border-purple-500/20">
        <div className="p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card className="backdrop-blur-lg bg-white/5 border-purple-500/20">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-purple-100" />
            <h2 className="text-base font-semibold text-purple-100">Trending Dreams</h2>
          </div>

          <div className="space-y-3">
            {dreams.length === 0 ? (
              <p className="text-sm text-purple-200/60 text-center py-2">No trending dreams yet</p>
            ) : (
              dreams.map((dream) => (
                <Link
                  key={dream.id}
                  href={`/stories/${dream.id}`}
                  className="block group"
                >
                  <div className="p-2 rounded-lg hover:bg-purple-500/10 transition-colors">
                    <h3 className="text-sm font-medium text-purple-100 group-hover:text-purple-200 transition-colors line-clamp-2 mb-2">
                      {dream.title}
                    </h3>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-200">
                        {dream.theme}
                      </span>
                      
                      <div className="flex items-center gap-3 text-purple-200/60">
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          <span className="text-xs">{dream.likes || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          <span className="text-xs">{dream.comments || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
} 