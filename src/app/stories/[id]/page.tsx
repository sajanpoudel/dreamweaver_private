import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/prisma';
import { StoryView } from '@/components/stories/StoryView';
import type { Story } from '@/types/view';
import { Prisma } from '@prisma/client';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function StoryPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  try {
    // Fetch the story with all related data
    const dbStory = await db.dreamStory.findFirst({
      where: {
        id: params.id,
        OR: [
          { userId: session.user.id },
          { isPublic: true }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        themes: true,
        symbols: true,
        likes: {
          where: {
            userId: session.user.id,
          },
          take: 1,
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!dbStory) {
      redirect('/feed');
    }

    // Convert database story to our Story type
    const story: Story = {
      id: dbStory.id,
      title: dbStory.title,
      content: typeof dbStory.content === 'string' ? dbStory.content : JSON.stringify(dbStory.content),
      publishedAt: dbStory.publishedAt,
      user: dbStory.user,
      themes: dbStory.themes.map(t => ({ id: t.id, name: t.name })),
      symbols: dbStory.symbols.map(s => ({ id: s.id, name: s.name })),
      likes: dbStory.likes,
      _count: dbStory._count,
    };

    // Fetch related stories based on themes and symbols
    const dbRelatedStories = await db.dreamStory.findMany({
      where: {
        id: { not: story.id },
        isPublic: true,
        OR: [
          {
            themes: {
              some: {
                id: {
                  in: story.themes.map(theme => theme.id),
                },
              },
            },
          },
          {
            symbols: {
              some: {
                id: {
                  in: story.symbols.map(symbol => symbol.id),
                },
              },
            },
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        themes: true,
        symbols: true,
        likes: {
          where: {
            userId: session.user.id,
          },
          take: 1,
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      take: 3,
      orderBy: {
        publishedAt: 'desc',
      },
    });

    // Convert related stories to Story type
    const relatedStories: Story[] = dbRelatedStories.map(dbStory => ({
      id: dbStory.id,
      title: dbStory.title,
      content: dbStory.content ? (typeof dbStory.content === 'string' ? dbStory.content : JSON.stringify(dbStory.content)) : '',
      publishedAt: dbStory.publishedAt,
      user: dbStory.user,
      themes: dbStory.themes.map(t => ({ id: t.id, name: t.name })),
      symbols: dbStory.symbols.map(s => ({ id: s.id, name: s.name })),
      likes: dbStory.likes,
      _count: dbStory._count,
    }));

    return (
      <StoryView 
        story={story} 
        isOwner={story.user.id === session.user.id}
        currentUserId={session.user.id}
        relatedStories={relatedStories}
      />
    );
  } catch (error) {
    console.error('Error loading story:', error);
    redirect('/feed');
  }
} 