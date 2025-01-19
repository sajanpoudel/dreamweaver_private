import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';

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

    // Find the story and verify ownership
    const story = await db.dreamStory.findFirst({
      where: {
        dreamId,
        userId: session.user.id,
      },
      include: {
        dream: {
          include: {
            themes: true,
            symbols: true,
          },
        },
      },
    });

    if (!story) {
      return new NextResponse('Story not found', { status: 404 });
    }

    // Update the story to be public
    const updatedStory = await db.dreamStory.update({
      where: { id: story.id },
      data: {
        isPublic: true,
        publishedAt: new Date(),
      },
      include: {
        themes: true,
        symbols: true,
      },
    });

    return NextResponse.json({
      message: 'Story published successfully',
      story: updatedStory,
    });
  } catch (error) {
    console.error('Story publishing error:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Failed to publish story',
      { status: 500 }
    );
  }
} 