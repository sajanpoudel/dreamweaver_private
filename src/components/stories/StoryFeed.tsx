'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { formatDate } from '@/lib/utils';
import { Share2, Heart } from 'lucide-react';
import { Button } from '../ui/button';

interface Story {
  id: string;
  title: string;
  content: string;
  publishedAt: Date;
  user: {
    name: string | null;
    image: string | null;
  };
  themes: Array<{ name: string }>;
  symbols: Array<{ name: string }>;
  relevanceScore: number;
}

interface StoryFeedProps {
  stories: Story[];
}

export function StoryFeed({ stories }: StoryFeedProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1c2e] via-[#2d2b55] to-[#3c1f52]">
      <div className="container max-w-6xl mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text mb-4">
            Dream Stories
          </h1>
          <p className="text-purple-200/80 text-lg">
            Explore a collection of beautifully crafted dream narratives
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {stories.map((story, index) => {
            const storyContent = JSON.parse(story.content);
            const firstScene = storyContent.scenes[0];

            return (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <Link href={`/stories/${story.id}`}>
                  <Card className="relative overflow-hidden backdrop-blur-lg bg-white/5 rounded-2xl shadow-[0_0_15px_rgba(168,85,247,0.15)] border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
                    <div className="aspect-video relative">
                      <Image
                        src={firstScene.imageUrl}
                        alt={firstScene.caption}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                    <CardHeader className="relative z-10 -mt-20 pb-0">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-8 w-8 border-2 border-purple-500/20">
                          <AvatarImage src={story.user.image || undefined} />
                          <AvatarFallback>
                            {story.user.name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-purple-100">
                            {story.user.name}
                          </p>
                          <p className="text-xs text-purple-200/70">
                            {formatDate(story.publishedAt)}
                          </p>
                        </div>
                      </div>
                      <CardTitle className="text-xl font-bold text-purple-100 line-clamp-2">
                        {storyContent.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-purple-200/90 line-clamp-2 mb-4">
                        {storyContent.summary}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {story.themes.slice(0, 3).map(theme => (
                          <span
                            key={theme.name}
                            className="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/20"
                          >
                            {theme.name}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-purple-500/20">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-purple-200/80 hover:text-purple-200 hover:bg-purple-500/10"
                          >
                            <Heart className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-purple-200/80 hover:text-purple-200 hover:bg-purple-500/10"
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {story.relevanceScore > 0 && (
                          <span className="text-xs text-purple-200/70 bg-purple-500/10 px-2 py-1 rounded-full">
                            {story.relevanceScore * 10}% Match
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 