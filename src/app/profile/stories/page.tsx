'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import { Heart, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

interface StorySection {
  title: string;
  content: string;
  imageUrl: string;
  imagePrompt: string;
}

interface StoryContent {
  title: string;
  subtitle: string;
  introduction: string;
  sections: StorySection[];
  conclusion: string;
  themes: string[];
  interpretation: string;
}

interface Story {
  id: string;
  title: string;
  subtitle?: string;
  content: string | StoryContent;
  publishedAt: Date | null;
  dream: {
    title: string;
  };
  _count: {
    likes: number;
    comments: number;
  };
  readTime?: string;
}

export default function StoriesPage() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin');
    },
  });
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    const fetchStories = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/stories/user', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          const parsedStories = data.map((story: Story) => {
            let parsedContent: string | StoryContent;
            if (typeof story.content === 'string') {
              try {
                parsedContent = JSON.parse(story.content) as StoryContent;
              } catch (e) {
                console.error('Error parsing story content:', e);
                parsedContent = story.content;
              }
            } else {
              parsedContent = story.content;
            }
            return {
              ...story,
              content: parsedContent
            };
          });
          setStories(parsedStories);
        }
      } catch (error) {
        console.error('Error fetching stories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStories();
  }, [status]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f1a]">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-white text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-400 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              <p className="mt-4">Loading your stories...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text mb-2">
            My Stories
          </h1>
          <p className="text-gray-300">Your published dream stories ({stories.length})</p>
        </motion.div>

        {stories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-64 text-center"
          >
            <p className="text-white mb-4">You haven't published any stories yet.</p>
            <Link 
              href="/dashboard"
              className="text-purple-200 hover:text-purple-100 underline"
            >
              Go to Dashboard to create your first story
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {stories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group w-full"
              >
                <Link href={`/stories/${story.id}`} className="block transform transition-all duration-300 hover:-translate-y-1">
                  <Card 
                    className="relative overflow-hidden backdrop-blur-lg bg-gradient-to-br from-gray-900/90 to-gray-800/90 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-purple-500/20"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardContent className="relative p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="relative w-full md:w-[300px] aspect-[16/9] md:aspect-[4/3] rounded-lg overflow-hidden border border-purple-500/20 bg-gray-900/50">
                          {(() => {
                            const content = typeof story.content === 'string' 
                              ? JSON.parse(story.content) 
                              : story.content;
                            
                            const firstImage = content.sections?.[0]?.imageUrl;

                            return firstImage ? (
                              <>
                                <Image
                                  src={firstImage}
                                  alt={content.title || 'Story image'}
                                  fill
                                  sizes="(max-width: 768px) 100vw, 300px"
                                  className="object-cover"
                                  priority
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                              </>
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-3xl text-gray-600">✨</span>
                              </div>
                            );
                          })()}
                        </div>
                        <div className="flex-grow min-w-0 md:max-w-[calc(100%-340px)]">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-1 min-w-0 flex-grow">
                                <h2 className="text-lg font-semibold text-white group-hover:text-purple-200 transition-colors duration-300 line-clamp-1">
                                  {(() => {
                                    const content = typeof story.content === 'string' 
                                      ? JSON.parse(story.content) 
                                      : story.content;
                                    return content.title || story.title;
                                  })()}
                                </h2>
                                {(() => {
                                  const content = typeof story.content === 'string' 
                                    ? JSON.parse(story.content) 
                                    : story.content;
                                  return content.subtitle && (
                                    <p className="text-sm text-gray-400 line-clamp-1">
                                      {content.subtitle}
                                    </p>
                                  );
                                })()}
                              </div>
                              <span className="text-xs text-gray-400 bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-md whitespace-nowrap flex-shrink-0">
                                {story.publishedAt ? formatDate(new Date(story.publishedAt)) : 'Draft'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400 line-clamp-1">
                              Based on dream: {story.dream.title}
                            </p>
                            <p className="text-sm text-gray-300 line-clamp-2 group-hover:text-gray-200 transition-colors duration-300">
                              {(() => {
                                const content = typeof story.content === 'string' 
                                  ? JSON.parse(story.content) 
                                  : story.content;
                                return content.introduction || '';
                              })()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-purple-500/10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-gray-400">
                            <div className="flex items-center gap-1.5 group-hover:text-pink-400 transition-colors duration-300">
                              <Heart className="w-4 h-4" />
                              <span className="text-xs font-medium bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                                {story._count.likes}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 group-hover:text-purple-400 transition-colors duration-300">
                              <MessageCircle className="w-4 h-4" />
                              <span className="text-xs font-medium bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                                {story._count.comments}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-400">
                            {story.readTime || '5 min read'}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 