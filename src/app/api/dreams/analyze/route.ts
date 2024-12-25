import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/auth';
import { prisma } from '../../../../lib/prisma';
import { NextResponse } from 'next/server';
import { analyzeDreamWithContext } from '@/lib/dream-analysis';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dreamId = searchParams.get('dreamId');

    if (!dreamId) {
      return NextResponse.json({ error: 'Dream ID is required' }, { status: 400 });
    }

    console.log('Received analysis request for dream:', dreamId);

    const dream = await prisma.dream.findFirst({
      where: {
        id: dreamId,
        userId: session.user.id,
      },
      include: {
        symbols: true,
        themes: true,
        emotions: true,
      },
    });

    if (!dream) {
      return NextResponse.json({ error: 'Dream not found' }, { status: 404 });
    }

    console.log('Found dream:', { id: dream.id, userId: dream.userId });

    const analysis = await analyzeDreamWithContext(dream, session.user.id);
    console.log('Analysis completed successfully');

    await prisma.dreamAnalysis.create({
      data: {
        dreamId,
        analysis: JSON.stringify(analysis)
      }
    });

    await updateDashboardStats(analysis);

    const updatedDream = await prisma.dream.update({
      where: { id: dreamId },
      data: { analysis },
      include: {
        symbols: true,
        themes: true,
        emotions: true,
      },
    });

    return NextResponse.json(updatedDream);
  } catch (error) {
    console.error('Error in analyze route:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Analysis failed: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

async function updateDashboardStats(analysis: any) {
  const stats = await prisma.dashboardStats.findFirst() || { topSymbols: [], topThemes: [], topEmotions: [] };

  const updatedSymbols = updateTopItems(stats.topSymbols, analysis.symbols.map((s: Symbol) => s.name));

  const updatedThemes = updateTopItems(stats.topThemes, analysis.themes);

  const updatedEmotions = updateTopItems(stats.topEmotions, analysis.emotions.map((e: Emotion) => e.name));

  await prisma.dashboardStats.upsert({
    where: { id: stats.id || 'singleton' },
    create: {
      id: 'singleton',
      topSymbols: updatedSymbols,
      topThemes: updatedThemes,
      topEmotions: updatedEmotions
    },
    update: {
      topSymbols: updatedSymbols,
      topThemes: updatedThemes,
      topEmotions: updatedEmotions
    }
  });
}

function updateTopItems(existing: TopItem[], newItems: string[]): TopItem[] {
  const counts = new Map<string, number>();
  
  existing.forEach(item => counts.set(item.name, item.count));
  
  newItems.forEach(name => {
    counts.set(name, (counts.get(name) || 0) + 1);
  });
  
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
} 