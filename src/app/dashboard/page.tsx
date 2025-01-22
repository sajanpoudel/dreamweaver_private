import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { analyzeDreams } from '@/lib/dream-analytics';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  try {
    const userId = session.user.id;

    // Get total dreams and log the count
    const totalDreams = await db.dream.count({
      where: { userId },
    });

    // Get all dreams with their relationships
    const dreams = await db.dream.findMany({
      where: { userId },
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

    // Get analytics
    const analytics = await analyzeDreams(userId);

    // Calculate top symbols, themes, and emotions
    const symbolCounts = new Map();
    const themeCounts = new Map();
    const emotionCounts = new Map();

    dreams.forEach(dream => {
      dream.symbols.forEach(symbol => {
        symbolCounts.set(symbol.name, (symbolCounts.get(symbol.name) || 0) + 1);
      });
      dream.themes.forEach(theme => {
        themeCounts.set(theme.name, (themeCounts.get(theme.name) || 0) + 1);
      });
      dream.emotions.forEach(emotion => {
        emotionCounts.set(emotion.name, (emotionCounts.get(emotion.name) || 0) + 1);
      });
    });

    const topSymbols = Array.from(symbolCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topThemes = Array.from(themeCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topEmotions = Array.from(emotionCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return (
      <DashboardContent
        dreams={dreams}
        totalDreams={totalDreams}
        topSymbols={topSymbols}
        topThemes={topThemes}
        topEmotions={topEmotions}
        analytics={analytics}
      />
    );
  } catch (error) {
    console.error('Dashboard error:', error);
    throw error;
  }
} 