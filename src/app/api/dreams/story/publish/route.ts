import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import prisma from '@/lib/prisma';

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
    const story = await prisma.dreamStory.findFirst({
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

    // Update the story to be public in a transaction
    const updatedStory = await prisma.$transaction(async (tx) => {
      // Update the story to be public
      const publishedStory = await tx.dreamStory.update({
        where: { id: story.id },
        data: {
          isPublic: true,
        },
      });

      // Create theme connections if they don't exist
      if (story.dream.themes.length > 0) {
        await Promise.all(
          story.dream.themes.map(async (theme) => {
            await tx.storyTheme.upsert({
              where: {
                name_storyId: {
                  name: theme.name,
                  storyId: story.id,
                },
              },
              update: {},
              create: {
                name: theme.name,
                storyId: story.id,
              },
            });
          })
        );
      }

      // Create symbol connections if they don't exist
      if (story.dream.symbols.length > 0) {
        await Promise.all(
          story.dream.symbols.map(async (symbol) => {
            await tx.storySymbol.upsert({
              where: {
                name_storyId: {
                  name: symbol.name,
                  storyId: story.id,
                },
              },
              update: {},
              create: {
                name: symbol.name,
                storyId: story.id,
              },
            });
          })
        );
      }

      return publishedStory;
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