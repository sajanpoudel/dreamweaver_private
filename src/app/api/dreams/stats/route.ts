import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get user's dream stats
    const stats = await db.dream.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        symbols: true,
        themes: true,
        emotions: true,
      },
    });

    // Calculate top symbols
    const symbolCounts = stats.reduce((acc, dream) => {
      dream.symbols.forEach(symbol => {
        acc[symbol.name] = (acc[symbol.name] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    // Calculate top themes
    const themeCounts = stats.reduce((acc, dream) => {
      dream.themes.forEach(theme => {
        acc[theme.name] = (acc[theme.name] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    // Calculate top emotions
    const emotionCounts = stats.reduce((acc, dream) => {
      dream.emotions.forEach(emotion => {
        acc[emotion.name] = (acc[emotion.name] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    // Update or create dashboard stats
    const dashboardStats = await db.dashboardStats.upsert({
      where: { id: 'singleton' },
      update: {
        topSymbols: symbolCounts,
        topThemes: themeCounts,
        topEmotions: emotionCounts,
      },
      create: {
        id: 'singleton',
        topSymbols: symbolCounts,
        topThemes: themeCounts,
        topEmotions: emotionCounts,
      },
    });

    return NextResponse.json(dashboardStats);
  } catch (error) {
    console.error('Error fetching dream stats:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Failed to fetch dream stats',
      { status: 500 }
    );
  }
} 