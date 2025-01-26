'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDate, getImageUrl } from '@/lib/utils';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DreamFeedProps {
  stories: any[];
  currentUserId: string;
}

export function DreamFeed({ stories, currentUserId }: DreamFeedProps) {
  return (
    <div className="max-w-[680px] mx-auto space-y-4">
      {stories.map((story) => {
        const content = typeof story.content === 'string' 
          ? JSON.parse(story.content) 
          : story.content;

        const firstImage = content.sections?.[0]?.imageUrl;

        return (
          <motion.article
            key={story.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative group"
          >
            <div className="backdrop-blur-lg bg-white/5 rounded-xl border border-purple-500/20 overflow-hidden hover:border-purple-500/30 transition-all duration-300">
              {/* Header */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-purple-500/20">
                    <AvatarImage src={getImageUrl(story.user?.image)} />
                    <AvatarFallback>{story.user?.name?.[0] || '?'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Link href={`/profile/${story.user?.id}`} className="text-sm font-medium text-purple-100 hover:text-purple-200 transition-colors">
                      {story.user?.name}
                    </Link>
                    <p className="text-xs text-purple-200/60">
                      {formatDate(new Date(story.publishedAt || story.createdAt))}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-purple-200/60 hover:text-purple-200">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>

              {/* Content */}
              <Link href={`/stories/${story.id}`}>
                <div className="px-4 pb-3">
                  <h2 className="text-xl font-semibold text-purple-100 mb-2 hover:text-purple-200 transition-colors">
                    {content.title}
                  </h2>
                  <p className="text-sm text-purple-200/80 line-clamp-3 mb-3">
                    {content.introduction}
                  </p>
                </div>

                {firstImage && (
                  <div className="relative w-full aspect-[16/9] bg-purple-500/10">
                    <Image
                      src={firstImage}
                      alt={content.title || 'Dream story image'}
                      fill
                      className="object-cover"
                      unoptimized={firstImage.startsWith('data:') || firstImage.includes('blob.core.windows.net')}
                    />
                  </div>
                )}
              </Link>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-purple-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <Button variant="ghost" size="sm" className="text-purple-200/60 hover:text-purple-200 -ml-2">
                      <Heart className="h-4 w-4 mr-2" />
                      {story._count?.likes || 0}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-purple-200/60 hover:text-purple-200 -ml-2">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {story._count?.comments || 0}
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" className="text-purple-200/60 hover:text-purple-200">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </motion.article>
        );
      })}

      {stories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-purple-200/60">No stories to display</p>
        </div>
      )}
    </div>
  );
} 