'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { formatDate, getImageUrl } from '@/lib/utils';
import { Home, Share2, Heart, MessageCircle, Download, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Input } from '../ui/input';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    name: string | null;
    image: string | null;
  };
}

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

// Helper function to clean HTML content
const cleanHtmlContent = (html: string) => {
  // If the content is wrapped in <p> tags, extract the inner content
  if (html?.startsWith('<p>') && html?.endsWith('</p>')) {
    return html.slice(3, -4); // Remove <p> and </p>
  }
  return html || '';
};

export function StoryView({ story, isOwner, currentUserId, relatedStories }: StoryViewProps) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(story._count.likes);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const storyContent = (() => {
    // If content is already an object, return as is
    if (typeof story.content !== 'string') {
      return story.content;
    }

    try {
      // If content is a string but already JSON, parse it
      if (story.content.startsWith('{')) {
        return JSON.parse(story.content);
      }
    } catch (e) {
      console.error('Error parsing story content:', e);
    }

    // If content is a plain string or parsing failed, create a default structure
    return {
      title: story.title,
      subtitle: '',
      introduction: story.content,
      sections: [],
      conclusion: '',
      themes: [],
      interpretation: ''
    };
  })();

  useEffect(() => {
    fetchLikeStatus();
    fetchComments();
  }, [story.id]);

  const fetchLikeStatus = async () => {
    try {
      const response = await fetch(`/api/stories/${story.id}/like`);
      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
        setLikeCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching like status:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/stories/${story.id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleLike = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch(`/api/stories/${story.id}/like`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
        setLikeCount(data.count);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch(`/api/stories/${story.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        await fetchComments();
        setNewComment('');
        toast.success('Comment added successfully');
      } else {
        throw new Error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const text = `Check out this dream story: ${storyContent.title}`;

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        break;
      default:
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
    }
  };

  const handleDownload = async () => {
    try {
      const storyText = `${storyContent.title}\n\n${storyContent.introduction}\n\n${storyContent.sections
        .map((section: any) => `${section.text}\n${section.caption}\n`)
        .join('\n')}`;

      const blob = new Blob([storyText], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${storyContent.title.toLowerCase().replace(/\s+/g, '-')}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Story downloaded successfully');
    } catch (error) {
      console.error('Error downloading story:', error);
      toast.error('Failed to download story');
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
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
              <AvatarImage src={getImageUrl(story.user.image)} />
              <AvatarFallback>
                {story.user.name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-purple-100 font-medium">{story.user.name}</p>
              <p className="text-sm text-purple-200/70">
                {formatDate(story.publishedAt || new Date())}
              </p>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
            {storyContent.title}
          </h1>
          {storyContent.subtitle && (
            <p className="text-xl text-purple-200/80 italic">
              {storyContent.subtitle}
            </p>
          )}
        </div>

        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xl text-purple-200/90">
            {cleanHtmlContent(storyContent.introduction)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
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

        <div className="space-y-16">
          {storyContent.sections?.map((section: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-purple-500/5 rounded-xl blur-sm"></div>
              <div className="relative space-y-6">
                <h2 className="text-2xl font-semibold text-purple-100">
                  {section.title}
                </h2>

                {section.imageUrl && (
                  <div className="aspect-[16/9] relative overflow-hidden rounded-xl">
                    <Image
                      src={section.imageUrl}
                      alt={section.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="prose prose-invert max-w-none">
                  <p className="text-purple-200/90">
                    {cleanHtmlContent(section.content)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {storyContent.conclusion && (
          <div className="mt-16 space-y-4">
            <h2 className="text-2xl font-semibold text-purple-100">
              Conclusion
            </h2>
            <p className="text-purple-200/90 leading-relaxed">
              {cleanHtmlContent(storyContent.conclusion)}
            </p>
          </div>
        )}

        {storyContent.interpretation && (
          <div className="mt-8 p-6 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <h2 className="text-xl font-semibold text-purple-100 mb-4">
              Dream Interpretation
            </h2>
            <p className="text-purple-200/90">
              {cleanHtmlContent(storyContent.interpretation)}
            </p>
          </div>
        )}

        <div className="mt-16 space-y-6">
          <h2 className="text-2xl font-semibold text-purple-100">
            Comments ({comments.length})
          </h2>
          
          <div className="flex gap-4 mb-8">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-purple-500/10 border-purple-500/20 text-purple-100"
            />
            <Button
              onClick={handleSubmitComment}
              disabled={isLoading || !newComment.trim()}
              className="bg-purple-500/20 text-purple-100 hover:bg-purple-500/30"
            >
              <Send className="h-4 w-4 mr-2" />
              Comment
            </Button>
          </div>

          <div className="space-y-6">
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-4 p-4 rounded-lg bg-purple-500/5 border border-purple-500/10"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.user.image || undefined} />
                  <AvatarFallback>
                    {comment.user.name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-purple-100">
                      {comment.user.name || 'Anonymous'}
                    </p>
                    <span className="text-xs text-purple-200/60">
                      {formatDate(new Date(comment.createdAt))}
                    </span>
                  </div>
                  <p className="text-purple-200/80">{comment.content}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {relatedStories.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-semibold text-purple-100 mb-6">
              Related Stories
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
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
          </div>
        )}
      </motion.div>
    </div>
  );
} 