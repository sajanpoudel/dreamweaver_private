import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/prisma';
import { StoryView } from '@/components/stories/StoryView';

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
    const story = await db.dreamStory.findFirst({
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

    if (!story) {
      redirect('/feed');
    }

    // Fetch related stories based on themes and symbols
    const relatedStories = await db.dreamStory.findMany({
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

    return (
      <StoryView 
        story={story} 
        isOwner={story.userId === session.user.id}
        currentUserId={session.user.id}
        relatedStories={relatedStories}
      />
    );
  } catch (error) {
    console.error('Error loading story:', error);
    redirect('/feed');
  }
} 