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
  stories: Array<{
    id: string;
    content: string;
    publishedAt: Date;
    user: {
      name: string | null;
      image: string | null;
    };
    themes: Array<{ name: string }>;
    symbols: Array<{ name: string }>;
    relevanceScore: number;
    likesCount: number;
    commentsCount: number;
    hasLiked: boolean;
  }>;
}

export function DreamFeed({ stories }: DreamFeedProps) {
  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-6 px-2 mb-12"
      >
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-purple-500/20 border border-fuchsia-500/20">
          <Sparkles className="w-7 h-7 text-fuchsia-300" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-fuchsia-300 to-indigo-300 text-transparent bg-clip-text">
            Dream Stories
          </h2>
          <p className="text-fuchsia-200/70 text-base">
            Explore dream narratives from the community
          </p>
        </div>
      </motion.div>

      <div className="space-y-6">
        {stories.map((story, index) => {
          let storyContent;
          try {
            storyContent = typeof story.content === 'string' 
              ? JSON.parse(story.content)
              : story.content;
          } catch (error) {
            console.error('Error parsing story content:', error);
            return null;
          }

          if (!storyContent) return null;

          const firstSection = storyContent.sections?.[0];

          return (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl blur-sm group-hover:blur-md transition-all duration-300" />
              <div className="relative block p-6 backdrop-blur-sm border border-purple-500/20 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-8 w-8 border border-purple-500/20">
                    <AvatarImage src={story.user.image || undefined} />
                    <AvatarFallback>
                      {story.user.name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-purple-100">
                      {story.user.name || 'Anonymous'}
                    </p>
                    <p className="text-xs text-purple-200/60">
                      {formatDate(story.publishedAt)}
                    </p>
                  </div>
                </div>

                <Link href={`/stories/${story.id}`} className="block">
                  <h2 className="text-xl font-semibold text-purple-100 mb-2">
                    {storyContent.title || 'Untitled Dream Story'}
                  </h2>

                  <p className="text-sm text-purple-200/80 line-clamp-2 mb-4">
                    {storyContent.introduction || firstSection?.content?.split('\n')[0] || 'No description available'}
                  </p>

                  {firstSection?.imageUrl && (
                    <div className="relative h-[300px] rounded-lg overflow-hidden mb-4">
                      <Image
                        src={firstSection.imageUrl}
                        alt={firstSection.title || 'Dream story image'}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 768px"
                        priority={index < 2}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mb-4">
                    {story.themes.slice(0, 3).map((theme, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-purple-500/20 text-purple-200 border-purple-500/20"
                      >
                        {theme.name}
                      </Badge>
                    ))}
                  </div>

                  <p className="text-sm text-purple-200/60 hover:text-purple-200">
                    Read full story →
                  </p>
                </Link>

                <div className="flex items-center justify-between pt-4 border-t border-purple-500/20">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-purple-200/60">
                      <Heart className={`h-4 w-4 ${story.hasLiked ? 'fill-current text-pink-500' : ''}`} />
                      <span className="text-sm">{story.likesCount}</span>
                    </div>
                    <div className="flex items-center gap-1 text-purple-200/60">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm">{story.commentsCount}</span>
                    </div>
                  </div>
                  {story.relevanceScore > 0 && (
                    <Badge variant="secondary" className="bg-purple-500/20 text-purple-200 border-purple-500/20">
                      {Math.round(story.relevanceScore * 100)}% Match
                    </Badge>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
} 