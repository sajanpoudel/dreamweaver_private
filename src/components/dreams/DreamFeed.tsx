'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { Heart, MessageCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DreamFeedProps {
  stories: any[];
}

export function DreamFeed({ stories }: DreamFeedProps) {
  return (
    <div className="space-y-8">
      {stories.map((story) => {
        // Parse the content if it's a string
        const content = typeof story.content === 'string' 
          ? JSON.parse(story.content) 
          : story.content;

        // Get the first section's image if available
        const firstImage = content.sections?.[0]?.imageUrl;

        return (
          <div
            key={story.id}
            className="relative backdrop-blur-lg bg-white/5 rounded-2xl shadow-[0_0_15px_rgba(168,85,247,0.15)] border border-purple-500/20 overflow-hidden"
          >
            {firstImage && (
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src={firstImage}
                  alt={content.title || 'Dream story image'}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  priority
                />
              </div>
            )}
            
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                {story.user?.image && (
                  <Image
                    src={story.user.image}
                    alt={story.user.name || 'User'}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                )}
                <div>
                  <p className="text-purple-100 font-medium">{story.user?.name}</p>
                  <p className="text-purple-200/60 text-sm">
                    {new Date(story.publishedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-purple-100 mb-3">
                {content.title}
              </h2>
              
              <p className="text-purple-200/80 mb-4 line-clamp-2">
                {content.introduction}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {content.themes?.slice(0, 3).map((theme: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-500/20 text-purple-200 rounded-full text-sm"
                  >
                    {theme}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-purple-200/60 text-sm">
                    {story._count?.likes || 0} likes
                  </span>
                  <span className="text-purple-200/60 text-sm">
                    {story._count?.comments || 0} comments
                  </span>
                </div>
                <Link
                  href={`/stories/${story.id}`}
                  className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                >
                  Read full story →
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
} 