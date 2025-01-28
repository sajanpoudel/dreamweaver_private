import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/prisma';
import { StoryFeed } from '@/components/stories/StoryFeed';
import type { Story } from '@/types/view';

export default async function StoriesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  try {
    // Get user's dream themes and symbols for personalized recommendations
    const userPreferences = await db.dream.findMany({
      where: { userId: session.user.id },
      include: {
        themes: true,
        symbols: true,
      },
    });

    const userThemes = new Set(
      userPreferences.flatMap(dream => dream.themes.map(t => t.name))
    );
    const userSymbols = new Set(
      userPreferences.flatMap(dream => dream.symbols.map(s => s.name))
    );

    // Fetch public stories
    const stories = await db.dreamStory.findMany({
      where: {
        isPublic: true,
        publishedAt: { not: null },
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
      },
      orderBy: {
        publishedAt: 'desc',
      },
    });

    // Calculate relevance scores and convert stories
    const sortedStories = stories
      .filter((story): story is typeof story & { publishedAt: Date } => story.publishedAt !== null)
      .map(story => {
        const themeMatches = story.themes.filter(t => userThemes.has(t.name)).length;
        const symbolMatches = story.symbols.filter(s => userSymbols.has(s.name)).length;
        const relevanceScore = (themeMatches * 2 + symbolMatches) / ((story.themes.length * 2 + story.symbols.length) || 1);

        return {
          id: story.id,
          title: story.title,
          content: story.content ? (typeof story.content === 'string' ? story.content : JSON.stringify(story.content)) : '',
          publishedAt: story.publishedAt,
          user: story.user,
          themes: story.themes,
          symbols: story.symbols,
          relevanceScore,
        };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    return <StoryFeed stories={sortedStories} />;
  } catch (error) {
    console.error('Stories page error:', error);
    throw error;
  }
} 