import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import type { Session } from 'next-auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as Session & {
      user: {
        id: string;
        email: string;
        name: string;
      };
    };

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get the story for the dream
    const story = await db.dreamStory.findFirst({
      where: {
        dreamId: params.id,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        themes: true,
        symbols: true,
      },
    });

    if (!story) {
      return new NextResponse('Story not found', { status: 404 });
    }

    return NextResponse.json({ story });
  } catch (error) {
    console.error('Error fetching story:', error);
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 500 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 