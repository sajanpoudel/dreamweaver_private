'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Wand2, Share2, Download, Eye, BookOpen, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface DreamStoryProps {
  dream: {
    id: string;
    title: string | null;
    content: string;
    symbols: Array<{ name: string }>;
    themes: Array<{ name: string }>;
    emotions: Array<{ name: string }>;
    isPublic: boolean;
  };
}

interface StoryScene {
  text: string;
  imageUrl: string;
  caption: string;
}

export function DreamStory({ dream }: DreamStoryProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [story, setStory] = useState<{ scenes: StoryScene[]; title: string; summary: string } | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const generateStory = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/dreams/story/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dreamId: dream.id,
          content: dream.content,
          symbols: dream.symbols,
          themes: dream.themes,
          emotions: dream.emotions,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to generate story');
      }

      const storyData = await response.json();
      setStory(storyData);
      toast.success('Story generated successfully!');
    } catch (error) {
      console.error('Error generating story:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate story');
    } finally {
      setIsGenerating(false);
    }
  };

  const shareStory = async (platform: 'facebook' | 'twitter' | 'medium') => {
    if (!story) return;

    const url = `${window.location.origin}/stories/${dream.id}`;
    try {
      switch (platform) {
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
          break;
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?url=${url}&text=${encodeURIComponent(story.title)}`, '_blank');
          break;
        case 'medium':
          // Implement Medium sharing
          toast.info('Medium sharing coming soon!');
          break;
      }
    } catch (error) {
      console.error('Error sharing story:', error);
      toast.error('Failed to share story');
    }
  };

  const downloadStory = async () => {
    if (!story) return;

    try {
      // Create a formatted text version of the story
      const storyText = `${story.title}\n\n${story.summary}\n\n${story.scenes
        .map((scene, index) => `Scene ${index + 1}:\n${scene.text}\n${scene.caption}\n`)
        .join('\n')}`;

      // Create a blob and download it
      const blob = new Blob([storyText], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${story.title.toLowerCase().replace(/\s+/g, '-')}.txt`;
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

  const publishStory = async () => {
    if (!story) return;

    setIsPublishing(true);
    try {
      const response = await fetch('/api/dreams/story/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dreamId: dream.id,
          story,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to publish story');
      }

      toast.success('Story published successfully!');
    } catch (error) {
      console.error('Error publishing story:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to publish story');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-3xl"></div>
      <Card className="relative backdrop-blur-lg bg-white/5 rounded-2xl shadow-[0_0_15px_rgba(168,85,247,0.15)] border border-purple-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                Dream Story
              </h2>
              <p className="text-purple-200/80 text-sm">
                Transform your dream into a captivating visual story
              </p>
            </div>
            {!story && (
              <Button
                onClick={generateStory}
                disabled={isGenerating}
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-0 flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Crafting Story...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    Craft Story
                  </>
                )}
              </Button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {story ? (
              <motion.div
                key="story"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-purple-100">
                    {story.title}
                  </h3>
                  <p className="text-purple-200/90 italic">
                    {story.summary}
                  </p>
                </div>

                <div className="space-y-12">
                  {story.scenes.map((scene, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative group"
                    >
                      <div className="aspect-video relative rounded-xl overflow-hidden mb-4">
                        <Image
                          src={scene.imageUrl}
                          alt={scene.caption}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <p className="text-purple-100 mb-2">{scene.text}</p>
                      <p className="text-sm text-purple-200/70 italic">
                        {scene.caption}
                      </p>
                    </motion.div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-purple-500/20">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => shareStory('facebook')}
                      variant="ghost"
                      className="text-purple-200/80 hover:text-purple-200 hover:bg-purple-500/10"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={downloadStory}
                      variant="ghost"
                      className="text-purple-200/80 hover:text-purple-200 hover:bg-purple-500/10"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => window.open('/stories/' + dream.id, '_blank')}
                      variant="ghost"
                      className="text-purple-200/80 hover:text-purple-200 hover:bg-purple-500/10"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={publishStory}
                    disabled={isPublishing}
                    className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-0 flex items-center gap-2"
                  >
                    {isPublishing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <BookOpen className="h-4 w-4" />
                        Publish Story
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[1px]">
                  <div className="w-full h-full rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-purple-200" />
                  </div>
                </div>
                <p className="text-lg text-purple-200 mb-2">
                  Ready to transform your dream?
                </p>
                <p className="text-sm text-purple-200/70">
                  Click the craft button to create a beautiful visual story
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
} 