'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { formatDate } from '@/lib/utils';
import { Home, Share2, Heart, MessageCircle, Download } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Story {
  id: string;
  title: string;
  content: string;
  publishedAt: Date | null;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  themes: Array<{ name: string }>;
  symbols: Array<{ name: string }>;
  likes: Array<{ id: string }>;
  _count: {
    likes: number;
    comments: number;
  };
}

interface StoryViewProps {
  story: Story;
  isOwner: boolean;
  currentUserId: string;
  relatedStories: Story[];
}

export function StoryView({ story, isOwner, currentUserId, relatedStories }: StoryViewProps) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(story.likes.length > 0);
  const [likeCount, setLikeCount] = useState(story._count.likes);
  const [commentCount, setCommentCount] = useState(story._count.comments);
  const [isLoading, setIsLoading] = useState(false);

  const storyContent = JSON.parse(story.content);

  const handleLike = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/stories/${story.id}/like`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to like story');

      const data = await response.json();
      setIsLiked(data.liked);
      setLikeCount(data.likeCount);
      toast.success(data.liked ? 'Story liked!' : 'Story unliked');
    } catch (error) {
      console.error('Error handling like:', error);
      toast.error('Failed to like story');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async (platform: 'facebook' | 'twitter') => {
    const url = `${window.location.origin}/stories/${story.id}`;
    const text = encodeURIComponent(storyContent.title);
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
        break;
    }
  };

  const handleDownload = () => {
    try {
      const storyText = `${storyContent.title}\n\n${storyContent.introduction}\n\n${
        storyContent.sections.map((section: any) => 
          `${section.title}\n${section.content}\n`
        ).join('\n')
      }\n\n${storyContent.conclusion}`;

      const blob = new Blob([storyText], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${storyContent.title.toLowerCase().replace(/\s+/g, '-')}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Story downloaded successfully!');
    } catch (error) {
      console.error('Error downloading story:', error);
      toast.error('Failed to download story');
    }
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
            onClick={() => router.push('/feed')}
            variant="ghost"
            className="text-purple-200/80 hover:text-purple-200 hover:bg-purple-500/10 flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Back to Feed
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleShare('twitter')}
              className="text-purple-200/80 hover:text-purple-200 hover:bg-purple-500/10"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              className="text-purple-200/80 hover:text-purple-200 hover:bg-purple-500/10"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={isLoading}
              onClick={handleLike}
              className={`${
                isLiked ? 'text-pink-500' : 'text-purple-200/80'
              } hover:text-pink-500 hover:bg-purple-500/10`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Avatar className="h-12 w-12 border-2 border-purple-500/20">
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
              {storyContent.title}
            </h1>
            <p className="text-xl text-purple-200/90 max-w-2xl mx-auto">
              {storyContent.introduction}
            </p>
          </div>

          <div className="space-y-12">
            {storyContent.sections.map((section: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="aspect-video relative rounded-2xl overflow-hidden mb-6">
                  <Image
                    src={section.imageUrl}
                    alt={section.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-purple-100">
                    {section.title}
                  </h2>
                  <div className="prose prose-invert max-w-none">
                    {section.content.split('\n\n').map((paragraph: string, pIndex: number) => (
                      <p key={pIndex} className="text-purple-200/90 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {storyContent.conclusion && (
            <div className="bg-purple-500/10 p-6 rounded-xl border border-purple-500/20">
              <h3 className="text-xl font-semibold text-purple-100 mb-4">
                Conclusion
              </h3>
              <p className="text-purple-200/90">{storyContent.conclusion}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 justify-center pt-8">
            {story.themes.map((theme) => (
              <Badge
                key={theme.name}
                variant="secondary"
                className="bg-purple-500/20 text-purple-200 border-purple-500/20"
              >
                {theme.name}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 pt-4">
            <div className="flex items-center gap-2 text-purple-200/80">
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-pink-500 text-pink-500' : ''}`} />
              <span>{likeCount}</span>
            </div>
            <div className="flex items-center gap-2 text-purple-200/80">
              <MessageCircle className="h-4 w-4" />
              <span>{commentCount}</span>
            </div>
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
              {relatedStories.map((relatedStory) => {
                const content = JSON.parse(relatedStory.content);
                const firstSection = content.sections?.[0];

                return (
                  <Link
                    key={relatedStory.id}
                    href={`/stories/${relatedStory.id}`}
                    className="block"
                  >
                    <Card className="relative overflow-hidden backdrop-blur-lg bg-white/5 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
                      {firstSection?.imageUrl && (
                        <div className="aspect-video relative">
                          <Image
                            src={firstSection.imageUrl}
                            alt={content.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </div>
                      )}
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