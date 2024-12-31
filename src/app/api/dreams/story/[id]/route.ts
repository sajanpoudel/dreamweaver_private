import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import type { Session } from 'next-auth';

export async function PUT(
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

    const { content } = await request.json();
    
    if (!content) {
      return new NextResponse('Content is required', { status: 400 });
    }

    // Get the story and verify ownership
    const story = await db.dreamStory.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!story) {
      return new NextResponse('Story not found', { status: 404 });
    }

    if (story.userId !== session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Update the story
    const updatedStory = await db.dreamStory.update({
      where: { id: params.id },
      data: {
        content: JSON.stringify(content),
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

    return NextResponse.json(updatedStory);
  } catch (error) {
    console.error('Error updating story:', error);
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 500 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 