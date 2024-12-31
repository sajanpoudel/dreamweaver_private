import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/prisma';
import { StoryFeed } from '@/components/stories/StoryFeed';

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

    // Fetch public stories with their themes and symbols
    const stories = await db.dreamStory.findMany({
      where: {
        isPublic: true,
        publishedAt: { not: null },
      },
      include: {
        themes: true,
        symbols: true,
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: [
        { publishedAt: 'desc' },
      ],
    });

    // Calculate relevance scores based on theme and symbol matches
    const storiesWithRelevance = stories.map(story => {
      const themeMatches = story.themes.filter(t => userThemes.has(t.name)).length;
      const symbolMatches = story.symbols.filter(s => userSymbols.has(s.name)).length;
      const relevanceScore = (themeMatches * 2) + symbolMatches; // Themes weighted more heavily

      return {
        ...story,
        relevanceScore,
      };
    });

    // Sort by relevance score and then by publish date
    const sortedStories = storiesWithRelevance
      .filter((story): story is typeof story & { publishedAt: Date } => 
        story.publishedAt !== null
      )
      .sort((a, b) => {
        if (b.relevanceScore !== a.relevanceScore) {
          return b.relevanceScore - a.relevanceScore;
        }
        return b.publishedAt.getTime() - a.publishedAt.getTime();
      });

    return <StoryFeed stories={sortedStories} />;
  } catch (error) {
    console.error('Stories page error:', error);
    throw error;
  }
} 