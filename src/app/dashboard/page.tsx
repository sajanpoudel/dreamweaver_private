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
            description: true,
          }
        },
        emotions: {
          select: {
            id: true,
            name: true,
            intensity: true,
            description: true,
          }
        },
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

    // Process symbols
    const symbolCounts: Record<string, number> = {};
    allDreams.forEach(dream => {
      dream.symbols.forEach(symbol => {
        symbolCounts[symbol.name] = (symbolCounts[symbol.name] || 0) + 1;
      });
    });

    const topSymbols = Object.entries(symbolCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Process themes
    const themeCounts: Record<string, number> = {};
    allDreams.forEach(dream => {
      dream.themes.forEach(theme => {
        themeCounts[theme.name] = (themeCounts[theme.name] || 0) + 1;
      });
    });

    const topThemes = Object.entries(themeCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Process emotions
    const emotionCounts: Record<string, number> = {};
    allDreams.forEach(dream => {
      dream.emotions.forEach(emotion => {
        emotionCounts[emotion.name] = (emotionCounts[emotion.name] || 0) + 1;
      });
    });

    const topEmotions = Object.entries(emotionCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Get recent dreams for display
    const recentDreams = allDreams
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5)
      .map(dream => ({
        id: dream.id,
        title: dream.title,
        content: dream.content,
        createdAt: dream.createdAt,
        symbols: dream.symbols.map(s => ({ id: s.id, name: s.name })),
        themes: dream.themes.map(t => ({ id: t.id, name: t.name })),
        emotions: dream.emotions.map(e => ({ 
          id: e.id, 
          name: e.name, 
          intensity: e.intensity 
        }))
      }));

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
        dreams={recentDreams}
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