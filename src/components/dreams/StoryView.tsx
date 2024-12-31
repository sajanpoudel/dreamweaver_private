'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Share2, Download, Heart, MessageCircle, Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';

interface StoryViewProps {
  story: {
    id: string;
    title: string;
    content: string;
    user: {
      name: string | null;
      image: string | null;
    };
    dream: {
      themes: Array<{ name: string }>;
      symbols: Array<{ name: string }>;
    };
    isPublic: boolean;
  };
  isOwner: boolean;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    name: string | null;
    image: string | null;
  };
}

export function StoryView({ story, isOwner }: StoryViewProps) {
  const storyContent = JSON.parse(story.content);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (story.id) {
      fetchLikeStatus();
      fetchComments();
    }
  }, [story.id]);

  const fetchLikeStatus = async () => {
    try {
      const response = await fetch(`/api/stories/${story.id}/like`);
      if (response.ok) {
        const data = await response.json();
        setLiked(data.liked);
        setLikeCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching like status:', error);
      toast.error('Failed to fetch like status');
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
      toast.error('Failed to fetch comments');
    }
  };

  const handleLike = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/stories/${story.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setLiked(data.liked);
        setLikeCount(prev => data.liked ? prev + 1 : prev - 1);
        toast.success(data.liked ? 'Story liked!' : 'Story unliked');
      }
    } catch (error) {
      console.error('Error handling like:', error);
      toast.error('Failed to like story');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/stories/${story.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        const comment = await response.json();
        setComments(prev => [comment, ...prev]);
        setNewComment('');
        toast.success('Comment added successfully!');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleComment();
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(
        `/api/stories/${story.id}/comments?commentId=${commentId}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        setComments(prev => prev.filter(comment => comment.id !== commentId));
        toast.success('Comment deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const shareStory = async (platform: 'facebook' | 'twitter' | 'medium') => {
    const url = `${window.location.origin}/stories/${story.id}`;
    try {
      switch (platform) {
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
          break;
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?url=${url}&text=${encodeURIComponent(storyContent.title)}`, '_blank');
          break;
        case 'medium':
          toast.info('Medium sharing coming soon!');
          break;
      }
    } catch (error) {
      console.error('Error sharing story:', error);
      toast.error('Failed to share story');
    }
  };

  const downloadStory = async () => {
    try {
      const storyText = `${storyContent.title}\n\n${storyContent.summary}\n\n${storyContent.scenes
        .map((scene: any, index: number) => `Scene ${index + 1}:\n${scene.text}\n${scene.caption}\n`)
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

      toast.success('Story downloaded successfully!');
    } catch (error) {
      console.error('Error downloading story:', error);
      toast.error('Failed to download story');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-3xl"></div>
        <Card className="relative backdrop-blur-lg bg-white/5 rounded-2xl shadow-[0_0_15px_rgba(168,85,247,0.15)] border border-purple-500/20">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={story.user.image || undefined} />
                  <AvatarFallback>
                    {story.user.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                    {storyContent.title}
                  </h1>
                  <p className="text-sm text-purple-200/60">
                    by {story.user.name || 'Anonymous'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => shareStory('twitter')}
                  className="text-purple-200/60 hover:text-purple-200 hover:bg-purple-500/10"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={downloadStory}
                  className="text-purple-200/60 hover:text-purple-200 hover:bg-purple-500/10"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <p className="text-lg text-purple-200/80">{storyContent.summary}</p>

            <div className="flex flex-wrap gap-2">
              {story.dream.themes.map((theme) => (
                <Badge
                  key={theme.name}
                  variant="secondary"
                  className="bg-purple-500/20 text-purple-200 border-purple-500/20"
                >
                  {theme.name}
                </Badge>
              ))}
            </div>

            <div className="space-y-8">
              {storyContent?.scenes?.map((scene: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-purple-500/5 rounded-xl blur-sm"></div>
                  <div className="relative space-y-4">
                    <div className="aspect-[16/9] relative overflow-hidden rounded-xl">
                      <Image
                        src={scene.imageUrl}
                        alt={scene.caption}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-purple-200 mb-2">{scene.text}</p>
                      <p className="text-sm text-purple-200/60 italic">
                        {scene.caption}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-purple-500/20">
              <Button
                variant="ghost"
                size="sm"
                disabled={isLoading}
                onClick={handleLike}
                className={`gap-2 ${
                  liked ? 'text-pink-500' : 'text-purple-200/60'
                } hover:text-pink-500 hover:bg-purple-500/10`}
              >
                <Heart 
                  className={`h-4 w-4 ${liked ? 'fill-current' : ''} transition-colors`} 
                />
                <span>{likeCount}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className="gap-2 text-purple-200/60 hover:text-purple-200 hover:bg-purple-500/10"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{comments.length}</span>
              </Button>
            </div>

            {showComments && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newComment}
                    onKeyPress={handleKeyPress}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={isLoading}
                    placeholder="Add a comment..."
                    className="flex-1 bg-purple-500/5 border-purple-500/20 text-purple-200 placeholder:text-purple-200/40"
                  />
                  <Button
                    disabled={isLoading || !newComment.trim()}
                    onClick={handleComment}
                    size="icon"
                    className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {comments.map((comment) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3 items-start"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.user.image || undefined} />
                        <AvatarFallback>
                          {comment.user.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-purple-200">
                            {comment.user.name || 'Anonymous'}
                          </p>
                          <p className="text-xs text-purple-200/40">
                            {formatDistanceToNow(new Date(comment.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                        <p className="text-sm text-purple-200/80 mt-1">
                          {comment.content}
                        </p>
                      </div>
                      {isOwner && (
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isLoading}
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-purple-200/40 hover:text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
} 