'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDate, getImageUrl } from '@/lib/utils';
import { Heart, MessageCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DreamFeedProps {
  stories: any[];
  currentUserId: string;
}

export function DreamFeed({ stories, currentUserId }: DreamFeedProps) {
  // Preload all story images
  const storyImages = stories.map(story => {
    const content = typeof story.content === 'string' 
      ? JSON.parse(story.content) 
      : story.content;
    return content.sections?.[0]?.imageUrl;
  }).filter(Boolean);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text mb-8">
        Dream Stories Feed
      </h1>
      <div className="space-y-6">
        {/* Preload images */}
        {storyImages.map((imageUrl, index) => (
          <link
            key={`preload-${index}`}
            rel="preload"
            as="image"
            href={imageUrl}
          />
        ))}

        {stories.map((story) => {
          // Parse the content if it's a string
          const content = typeof story.content === 'string' 
            ? JSON.parse(story.content) 
            : story.content;

          // Get the first section's image if available
          const firstImage = content.sections?.[0]?.imageUrl;

          return (
            <motion.article
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative group w-full"
            >
              <Link href={`/stories/${story.id}`} className="block w-full">
                <div className="relative backdrop-blur-lg bg-white/5 rounded-2xl shadow-[0_0_15px_rgba(168,85,247,0.15)] border border-purple-500/20 overflow-hidden hover:border-purple-500/40 transition-all duration-300">
                  <div className="p-6">
                    {/* Author and Date */}
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="h-10 w-10 border border-purple-500/20">
                        <AvatarImage src={getImageUrl(story.user?.image)} />
                        <AvatarFallback>
                          {story.user?.name?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-purple-100">{story.user?.name}</p>
                        <div className="flex items-center gap-2 text-xs text-purple-200/60">
                          <Clock className="w-3 h-3" />
                          {formatDate(new Date(story.publishedAt || story.createdAt))}
                        </div>
                      </div>
                    </div>

                    {/* Content Layout */}
                    <div className="flex flex-col md:flex-row gap-6 items-start w-full">
                      <div className="flex-1 min-w-0 order-2 md:order-1">
                        {/* Title and Introduction */}
                        <h2 className="text-xl font-bold text-purple-100 mb-3 hover:text-purple-300 transition-colors">
                          {content.title}
                        </h2>
                        
                        <p className="text-base text-purple-200/80 mb-4 line-clamp-3">
                          {content.introduction}
                        </p>

                        {/* Themes */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {content.themes?.slice(0, 3).map((theme: string, index: number) => (
                            <span
                              key={index}
                              className="px-2.5 py-1 text-xs bg-purple-500/20 text-purple-200 rounded-full"
                            >
                              {theme}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Image */}
                      {firstImage && (
                        <div className="relative w-full md:w-[240px] overflow-hidden rounded-xl order-1 md:order-2">
                          <div className="relative w-full aspect-[16/9]">
                            <Image
                              src={firstImage}
                              alt={content.title || 'Dream story image'}
                              fill
                              sizes="100vw, 240px"
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              priority={true}
                              loading="eager"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Engagement Stats */}
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-purple-500/20">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <Heart className="w-4 h-4 text-purple-200/60" />
                          <span className="text-sm text-purple-200/60">
                            {story._count?.likes || 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MessageCircle className="w-4 h-4 text-purple-200/60" />
                          <span className="text-sm text-purple-200/60">
                            {story._count?.comments || 0}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm text-purple-200/60 hover:text-purple-200 transition-colors flex items-center gap-1">
                        Read story
                        <span className="text-lg leading-none relative top-[1px]">→</span>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
} 