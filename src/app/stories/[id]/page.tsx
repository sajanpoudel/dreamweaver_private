import { getServerSession } from 'next-auth';
import { authOptions } from '../../api/auth/[...nextauth]/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { StoryView } from '@/components/stories/StoryView';

interface StoryPageProps {
  params: {
    id: string;
  };
}

export default async function StoryPage({ params }: StoryPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  try {
    const story = await prisma.dreamStory.findFirst({
      where: {
        id: params.id,
        OR: [
          { isPublic: true },
          { userId: session.user.id }
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
      },
    });

    if (!story) {
      redirect('/stories');
    }

    // Get related stories based on themes and symbols
    const relatedStories = await prisma.dreamStory.findMany({
      where: {
        isPublic: true,
        publishedAt: { not: null },
        id: { not: story.id },
        OR: [
          {
            themes: {
              some: {
                name: {
                  in: story.themes.map(t => t.name),
                },
              },
            },
          },
          {
            symbols: {
              some: {
                name: {
                  in: story.symbols.map(s => s.name),
                },
              },
            },
          },
        ],
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        themes: true,
        symbols: true,
      },
      take: 3,
    });

    return <StoryView story={story} relatedStories={relatedStories} />;
  } catch (error) {
    console.error('Story page error:', error);
    throw error;
  }
} 