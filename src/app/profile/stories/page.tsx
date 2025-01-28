import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import { Heart, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Story, parseStoryContent } from '@/types/story';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function StoriesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  try {
    // Fetch user's stories
    const dbStories = await db.dreamStory.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        themes: {
          select: {
            id: true,
            name: true,
          },
        },
        symbols: {
          select: {
            id: true,
            name: true,
          },
        },
        dream: {
          select: {
            title: true,
            themes: {
              select: {
                name: true,
              },
            },
            symbols: {
              select: {
                name: true,
              },
            },
          },
        },
        likes: {
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
    });

    // Convert database stories to our Story type
    const stories = dbStories.map(dbStory => ({
      id: dbStory.id,
      title: dbStory.title,
      content: typeof dbStory.content === 'string' ? dbStory.content : JSON.stringify(dbStory.content),
      publishedAt: dbStory.publishedAt,
      userId: dbStory.userId,
      dreamId: dbStory.dreamId,
      user: {
        id: dbStory.user.id,
        name: dbStory.user.name,
        image: dbStory.user.image,
      },
      dream: dbStory.dream ? {
        title: dbStory.dream.title || '',
        themes: dbStory.dream.themes || [],
        symbols: dbStory.dream.symbols || [],
      } : undefined,
      themes: dbStory.themes.map(t => ({ id: t.id, name: t.name })),
      symbols: dbStory.symbols.map(s => ({ id: s.id, name: s.name })),
      likes: dbStory.likes.map(l => ({ id: l.id })),
      _count: dbStory._count,
    }));

    return (
      <div className="min-h-screen bg-[#0f0f1a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
        <DashboardHeader />
        <div className="container max-w-6xl mx-auto py-12 px-4">
          <div className="mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text mb-4">
              Your Stories
            </h1>
            <p className="text-purple-200/80">
              Manage and share your dream stories
            </p>
          </div>

          {stories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-purple-200/80 mb-4">
                You haven't created any stories yet.
              </p>
              <Link
                href="/dashboard"
                className="text-purple-400 hover:text-purple-300 underline"
              >
                Go to Dashboard to create your first story
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {stories.map((story) => {
                const storyContent = parseStoryContent(story);
                const firstSection = storyContent.sections[0];

                return (
                  <Link
                    key={story.id}
                    href={`/stories/${story.id}`}
                    className="block transform transition-all duration-300 hover:-translate-y-1"
                  >
                    <Card className="relative overflow-hidden backdrop-blur-lg bg-gradient-to-br from-gray-900/90 to-gray-800/90 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-purple-500/20">
                      <CardContent className="relative p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="relative w-full md:w-[300px] aspect-[16/9] md:aspect-[4/3] rounded-lg overflow-hidden border border-purple-500/20 bg-gray-900/50">
                            {firstSection?.imageUrl ? (
                              <>
                                <Image
                                  src={firstSection.imageUrl}
                                  alt={firstSection.title}
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
                            )}
                          </div>
                          <div className="flex-grow min-w-0 md:max-w-[calc(100%-340px)]">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1 min-w-0 flex-grow">
                                  <h2 className="text-lg font-semibold text-white group-hover:text-purple-200 transition-colors duration-300 line-clamp-1">
                                    {storyContent.title}
                                  </h2>
                                  {storyContent.subtitle && (
                                    <p className="text-sm text-gray-400 line-clamp-1">
                                      {storyContent.subtitle}
                                    </p>
                                  )}
                                </div>
                                <span className="text-xs text-gray-400 bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-md whitespace-nowrap flex-shrink-0">
                                  {story.publishedAt ? formatDate(story.publishedAt) : 'Draft'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-300 line-clamp-2 group-hover:text-gray-200 transition-colors duration-300">
                                {storyContent.introduction}
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
                                  {story._count?.likes || 0}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 group-hover:text-purple-400 transition-colors duration-300">
                                <MessageCircle className="w-4 h-4" />
                                <span className="text-xs font-medium bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                                  {story._count?.comments || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading stories:', error);
    return (
      <div className="min-h-screen bg-[#0f0f1a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
        <DashboardHeader />
        <div className="container max-w-6xl mx-auto py-12 px-4">
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">
              Failed to load stories. Please try again later.
            </p>
            <Link
              href="/dashboard"
              className="text-purple-400 hover:text-purple-300 underline"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }
} 