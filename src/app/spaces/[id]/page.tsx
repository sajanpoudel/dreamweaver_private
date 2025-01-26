import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/prisma';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card } from '@/components/ui/card';
import { Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { DreamCard } from '@/components/dreams/DreamCard';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function SpacePage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Get all public dreams with the specified symbol
  const dreams = await db.dreamStory.findMany({
    where: {
      isPublic: true,
      publishedAt: { not: null },
      symbols: {
        some: {
          name: {
            equals: params.id.replace(/-/g, ' '),
            mode: 'insensitive'
          }
        }
      }
    },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        }
      },
      symbols: true,
      themes: true,
      dream: {
        select: {
          title: true,
          content: true,
        }
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        }
      }
    },
    orderBy: {
      publishedAt: 'desc'
    }
  });

  // Get related dreams based on common symbols
  const relatedDreams = await db.dreamStory.findMany({
    where: {
      isPublic: true,
      publishedAt: { not: null },
      id: {
        notIn: dreams.map(d => d.id)
      },
      symbols: {
        some: {
          name: {
            in: dreams.flatMap(d => d.symbols.map(s => s.name))
          }
        }
      }
    },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        }
      },
      symbols: true,
      themes: true,
      dream: {
        select: {
          title: true,
          content: true,
        }
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        }
      }
    },
    orderBy: {
      publishedAt: 'desc'
    },
    take: 5
  });

  // Combine all symbols and themes to create space info
  const allSymbols = new Set(dreams.flatMap(d => d.symbols.map(s => s.name)));
  const allThemes = new Set(dreams.flatMap(d => d.themes.map(t => t.name)));

  const spaceName = params.id.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1c2e] via-[#2d2b55] to-[#3c1f52]">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/spaces"
            className="inline-flex items-center gap-2 text-purple-200/60 hover:text-purple-200 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Spaces
          </Link>

          <Card className="backdrop-blur-lg bg-white/5 border-purple-500/20 p-6">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-8 h-8 text-purple-200" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-purple-100 mb-2">
                  {spaceName} Dreams
                </h1>
                <p className="text-purple-200/60 mb-4">
                  {dreams.length} dreams · {allSymbols.size} symbols · {allThemes.size} themes
                </p>
                <div className="flex flex-wrap gap-2">
                  {Array.from(allSymbols).map((symbol, index) => (
                    <span
                      key={index}
                      className="text-sm px-3 py-1 rounded-full bg-purple-500/10 text-purple-200"
                    >
                      {symbol}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {dreams.length === 0 ? (
            <Card className="backdrop-blur-lg bg-white/5 border-purple-500/20 p-6 text-center">
              <p className="text-purple-200/60">
                No dreams found in this space yet.
              </p>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6">
                {dreams.map((dreamStory) => (
                  <DreamCard
                    key={dreamStory.id}
                    dream={{
                      id: dreamStory.id,
                      title: dreamStory.dream?.title || 'Untitled Dream',
                      content: dreamStory.dream?.content || '',
                      publishedAt: dreamStory.publishedAt || dreamStory.createdAt,
                      user: dreamStory.user,
                      symbols: dreamStory.symbols,
                      themes: dreamStory.themes,
                      likes: dreamStory._count.likes,
                      comments: dreamStory._count.comments
                    }}
                  />
                ))}
              </div>

              {relatedDreams.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-xl font-semibold text-purple-100 mb-6">
                    Related Dreams
                  </h2>
                  <div className="grid grid-cols-1 gap-6">
                    {relatedDreams.map((dreamStory) => (
                      <DreamCard
                        key={dreamStory.id}
                        dream={{
                          id: dreamStory.id,
                          title: dreamStory.dream?.title || 'Untitled Dream',
                          content: dreamStory.dream?.content || '',
                          publishedAt: dreamStory.publishedAt || dreamStory.createdAt,
                          user: dreamStory.user,
                          symbols: dreamStory.symbols,
                          themes: dreamStory.themes,
                          likes: dreamStory._count.likes,
                          comments: dreamStory._count.comments
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
} 