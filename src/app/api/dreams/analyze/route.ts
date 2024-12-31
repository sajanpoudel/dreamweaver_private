import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';
import { analyzeDreamWithContext } from '@/lib/dream-analysis';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { dreamId } = await req.json();
    if (!dreamId) {
      return new NextResponse('Dream ID is required', { status: 400 });
    }

    // Fetch the dream with its current relationships
    const dream = await db.dream.findUnique({
      where: { id: dreamId },
      include: {
        symbols: true,
        themes: true,
        emotions: true,
      },
    });

    if (!dream) {
      return new NextResponse('Dream not found', { status: 404 });
    }

    if (dream.userId !== session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Analyze the dream
    console.log('Analyzing dream:', dreamId);
    const analysis = await analyzeDreamWithContext(dream, session.user.id);
    console.log('Analysis complete:', analysis);

    // Update the dream with the analysis
    const updatedDream = await db.dream.update({
      where: { id: dreamId },
      data: {
        analysis: analysis,
      },
      include: {
        symbols: true,
        themes: true,
        emotions: true,
      },
    });

    console.log('Updated dream:', {
      id: updatedDream.id,
      symbolCount: updatedDream.symbols.length,
      themeCount: updatedDream.themes.length,
      emotionCount: updatedDream.emotions.length,
    });

    return NextResponse.json(JSON.parse(analysis));
  } catch (error) {
    console.error('Error in analyze route:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal Server Error',
      { status: 500 }
    );
  }
} 