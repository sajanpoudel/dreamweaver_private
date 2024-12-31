import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';
import { DashboardContent } from '@/components/dashboard/DashboardContent';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  try {
    const userId = session.user.id;

    // Debug: Log the user ID
    console.log('Fetching stats for user:', userId);

    // Get total dreams and log the count
    const totalDreams = await db.dream.count({
      where: { userId },
    });
    console.log('Total dreams:', totalDreams);

    // First, let's get all dreams with their relationships
    const allDreams = await db.dream.findMany({
      where: { 
        userId,
      },
      include: {
        symbols: {
          select: {
            id: true,
            name: true,
            description: true,
          }
        },
        themes: {
          select: {
            id: true,
            name: true,
          }
        },
        emotions: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('Found dreams:', allDreams.length);
    // Debug: Log the first dream with more details
    if (allDreams.length > 0) {
      console.log('Sample dream details:', JSON.stringify({
        id: allDreams[0].id,
        title: allDreams[0].title,
        symbolCount: allDreams[0].symbols.length,
        themeCount: allDreams[0].themes.length,
        emotionCount: allDreams[0].emotions.length,
        symbols: allDreams[0].symbols.map(s => s.name),
        themes: allDreams[0].themes.map(t => t.name),
        emotions: allDreams[0].emotions.map(e => e.name),
      }, null, 2));
    }

    // Count occurrences of symbols, themes, and emotions
    const symbolCounts = allDreams.reduce((acc, dream) => {
      dream.symbols.forEach(symbol => {
        acc[symbol.name] = (acc[symbol.name] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const themeCounts = allDreams.reduce((acc, dream) => {
      dream.themes.forEach(theme => {
        acc[theme.name] = (acc[theme.name] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const emotionCounts = allDreams.reduce((acc, dream) => {
      dream.emotions.forEach(emotion => {
        acc[emotion.name] = (acc[emotion.name] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    // Convert to arrays and sort by frequency, with default empty arrays
    const topSymbols = Object.entries(symbolCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count })) || [];

    const topThemes = Object.entries(themeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count })) || [];

    const topEmotions = Object.entries(emotionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count })) || [];

    // Debug: Log the final stats
    console.log('Final Stats:', {
      totalDreams,
      topSymbolsCount: topSymbols.length,
      topThemesCount: topThemes.length,
      topEmotionsCount: topEmotions.length,
      sampleCounts: {
        symbols: Object.keys(symbolCounts).length,
        themes: Object.keys(themeCounts).length,
        emotions: Object.keys(emotionCounts).length,
      }
    });

    return (
      <DashboardContent
        dreams={allDreams}
        totalDreams={totalDreams}
        topSymbols={topSymbols}
        topThemes={topThemes}
        topEmotions={topEmotions}
      />
    );
  } catch (error) {
    console.error('Dashboard error:', error);
    throw error;
  }
} 