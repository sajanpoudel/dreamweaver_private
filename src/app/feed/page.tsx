import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';
import { DreamFeed } from '@/components/dreams/DreamFeed';

export default async function FeedPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  // Fetch all published stories
  const stories = await db.dreamStory.findMany({
    where: {
      isPublic: true,
      publishedAt: {
        not: null
      }
    },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
      symbols: true,
      themes: true,
      likes: true,
      comments: true,
    },
    orderBy: {
      publishedAt: 'desc',
    },
  });

  // Get user's themes and symbols for relevance scoring
  const userDreams = await db.dream.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      themes: true,
      symbols: true,
    },
  });

  const userThemes = new Set(userDreams.flatMap(d => d.themes.map(t => t.name)));
  const userSymbols = new Set(userDreams.flatMap(d => d.symbols.map(s => s.name)));

  // Calculate relevance scores and prepare stories data
  const storiesWithRelevance = stories.map(story => {
    // Calculate relevance score based on matching themes and symbols
    const themeMatches = story.themes.filter(t => userThemes.has(t.name)).length;
    const symbolMatches = story.symbols.filter(s => userSymbols.has(s.name)).length;
    const relevanceScore = (themeMatches + symbolMatches) / (story.themes.length + story.symbols.length || 1);

    return {
      id: story.id,
      content: story.content,
      publishedAt: story.publishedAt!,
      user: {
        name: story.user.name,
        image: story.user.image,
      },
      themes: story.themes.map(t => ({ name: t.name })),
      symbols: story.symbols.map(s => ({ name: s.name })),
      relevanceScore,
    };
  });

  // Sort by relevance score
  const sortedStories = storiesWithRelevance.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return (
    <main className="container mx-auto px-4 py-8">
      <DreamFeed stories={sortedStories} />
    </main>
  );
} 