import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { db } from '@/lib/prisma';
import { analyzeDream } from '@/lib/dream-analysis';

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { dreamId } = await req.json();
    if (!dreamId) {
      return new NextResponse('Dream ID is required', { status: 400 });
    }

    // Get the dream
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

    if (dream.userId !== token.sub) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Perform analysis
    const analysis = await analyzeDream(dream, token.sub);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error analyzing dream:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 