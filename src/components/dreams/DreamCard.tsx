'use client';

import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface DreamCardProps {
  dream: {
    id: string;
    title: string;
    content: string;
    publishedAt: Date;
    user: {
      name: string | null;
      image: string | null;
    };
    symbols: Array<{ name: string }>;
    themes: Array<{ name: string }>;
    _count?: {
      likes: number;
      comments: number;
    };
    likes?: number;
    comments?: number;
  };
}

export function DreamCard({ dream }: DreamCardProps) {
  // Use either _count or direct properties for likes/comments
  const likesCount = dream._count?.likes ?? dream.likes ?? 0;
  const commentsCount = dream._count?.comments ?? dream.comments ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-3xl"></div>
      <Link href={`/stories/${dream.id}`}>
        <Card className="relative backdrop-blur-lg bg-white/5 hover:bg-white/10 rounded-2xl shadow-[0_0_15px_rgba(168,85,247,0.15)] border border-purple-500/20 transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.25)]">
          <div className="p-6 space-y-4">
            {/* Header with user info */}
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={dream.user.image || undefined} />
                <AvatarFallback>{dream.user.name?.[0] || '?'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-purple-100">{dream.user.name}</p>
                <p className="text-sm text-purple-200/60">
                  {formatDistanceToNow(new Date(dream.publishedAt), { addSuffix: true })}
                </p>
              </div>
            </div>

            {/* Dream content */}
            <div>
              <h3 className="text-xl font-semibold text-purple-100 mb-2">
                {dream.title || 'Untitled Dream'}
              </h3>
              <p className="text-purple-200/80 line-clamp-3">{dream.content}</p>
            </div>

            {/* Symbols and themes */}
            <div className="flex flex-wrap gap-2">
              {dream.symbols.slice(0, 3).map((symbol) => (
                <Badge
                  key={symbol.name}
                  variant="secondary"
                  className="bg-purple-500/20 text-purple-200 border-purple-500/20"
                >
                  {symbol.name}
                </Badge>
              ))}
              {dream.symbols.length > 3 && (
                <Badge
                  variant="secondary"
                  className="bg-purple-500/20 text-purple-200 border-purple-500/20"
                >
                  +{dream.symbols.length - 3} more
                </Badge>
              )}
            </div>

            {/* Engagement stats */}
            <div className="flex items-center gap-4 text-purple-200/60">
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span className="text-sm">{likesCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">{commentsCount}</span>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
} 