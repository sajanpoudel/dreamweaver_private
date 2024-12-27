'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { formatDate } from '@/lib/utils';
import { Home, Share2, Heart, Download } from 'lucide-react';

interface Story {
  id: string;
  title: string;
  content: string;
  publishedAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  themes: Array<{ name: string }>;
  symbols: Array<{ name: string }>;
}

interface StoryViewProps {
  story: Story;
  relatedStories: Story[];
}

export function StoryView({ story, relatedStories }: StoryViewProps) {
  const router = useRouter();
  const storyContent = JSON.parse(story.content);

  const handleShare = async (platform: string) => {
    const url = `${window.location.origin}/stories/${story.id}`;
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${encodeURIComponent(storyContent.title)}`, '_blank');
        break;
      case 'medium':
        // Implement Medium sharing
        break;
    }
  };

  const handleDownload = async () => {
    // Implement story download logic
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1c2e] via-[#2d2b55] to-[#3c1f52]">
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <Button
            onClick={() => router.push('/stories')}
            variant="ghost"
            className="text-purple-200/80 hover:text-purple-200 hover:bg-purple-500/10 flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Back to Stories
          </Button>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleShare('facebook')}
              variant="ghost"
              className="text-purple-200/80 hover:text-purple-200 hover:bg-purple-500/10"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleDownload}
              variant="ghost"
              className="text-purple-200/80 hover:text-purple-200 hover:bg-purple-500/10"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              className="text-purple-200/80 hover:text-purple-200 hover:bg-purple-500/10"
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
              {storyContent.title}
            </h1>
            <div className="flex items-center justify-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-purple-500/20">
                <AvatarImage src={story.user.image || undefined} />
                <AvatarFallback>
                  {story.user.name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-purple-100 font-medium">{story.user.name}</p>
                <p className="text-sm text-purple-200/70">
                  {formatDate(story.publishedAt)}
                </p>
              </div>
            </div>
            <p className="text-xl text-purple-200/90 max-w-2xl mx-auto italic">
              {storyContent.summary}
            </p>
          </div>

          <div className="space-y-16">
            {storyContent.scenes.map((scene: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <div className="aspect-video relative rounded-2xl overflow-hidden mb-6">
                  <Image
                    src={scene.imageUrl}
                    alt={scene.caption}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="max-w-3xl mx-auto space-y-4">
                  <p className="text-lg text-purple-100 leading-relaxed">
                    {scene.text}
                  </p>
                  <p className="text-purple-200/70 italic text-center">
                    {scene.caption}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 justify-center pt-8">
            {story.themes.map(theme => (
              <span
                key={theme.name}
                className="px-3 py-1.5 text-sm rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/20"
              >
                {theme.name}
              </span>
            ))}
          </div>
        </motion.div>

        {relatedStories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16"
          >
            <h2 className="text-2xl font-bold text-purple-100 mb-8">
              Related Stories
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              {relatedStories.map((relatedStory, index) => {
                const content = JSON.parse(relatedStory.content);
                const firstScene = content.scenes[0];

                return (
                  <Link
                    key={relatedStory.id}
                    href={`/stories/${relatedStory.id}`}
                    className="block"
                  >
                    <Card className="relative overflow-hidden backdrop-blur-lg bg-white/5 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
                      <div className="aspect-video relative">
                        <Image
                          src={firstScene.imageUrl}
                          alt={firstScene.caption}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>
                      <CardContent className="relative -mt-16 z-10">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="h-6 w-6 border border-purple-500/20">
                            <AvatarImage src={relatedStory.user.image || undefined} />
                            <AvatarFallback>
                              {relatedStory.user.name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <p className="text-sm text-purple-200/90">
                            {relatedStory.user.name}
                          </p>
                        </div>
                        <h3 className="text-lg font-semibold text-purple-100 line-clamp-2">
                          {content.title}
                        </h3>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 