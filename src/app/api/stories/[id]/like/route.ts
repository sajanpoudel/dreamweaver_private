import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { Session } from 'next-auth';

const routeContextSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export async function POST(
  req: Request,
  context: z.infer<typeof routeContextSchema>
) {
  try {
    const { params } = routeContextSchema.parse(context);

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

    // Check if story exists
    const story = await db.dreamStory.findUnique({
      where: { id: params.id },
    });

    if (!story) {
      return new NextResponse('Story not found', { status: 404 });
    }

    // Check if user has already liked the story
    const existingLike = await db.like.findFirst({
      where: {
        storyId: params.id,
        userId: session.user.id,
      },
    });

    if (existingLike) {
      // Unlike the story
      await db.like.delete({
        where: {
          id: existingLike.id,
        },
      });
    } else {
      // Like the story
      await db.like.create({
        data: {
          userId: session.user.id,
          storyId: params.id,
        },
      });
    }

    // Get updated like count
    const likeCount = await db.like.count({
      where: {
        storyId: params.id,
      },
    });

    return NextResponse.json({
      liked: !existingLike,
      count: likeCount,
    });
  } catch (error) {
    console.error('Error handling like:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Failed to handle like',
      { status: 500 }
    );
  }
}

export async function GET(request: Request, context: z.infer<typeof routeContextSchema>) {
  try {
    const { params } = routeContextSchema.parse(context);
    const storyId: string = params.id;

    console.log('Fetching like status for story:', storyId);

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

    // Verify story exists and is accessible
    const story = await db.dreamStory.findFirst({
      where: {
        id: storyId,
        OR: [
          { userId: session.user.id },
          { isPublic: true }
        ]
      },
    });

    if (!story) {
      return new NextResponse('Story not found or not accessible', { status: 404 });
    }

    // Get like count and user's like status
    const [likeCount, userLike] = await Promise.all([
      db.like.count({
        where: { storyId },
      }),
      db.like.findFirst({
        where: {
          storyId,
          userId: session.user.id,
        },
      }),
    ]);

    console.log(`Found ${likeCount} likes, user like status:`, !!userLike);

    return NextResponse.json({
      liked: !!userLike,
      count: likeCount,
    });
  } catch (error) {
    console.error('Error fetching like status:', error);
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 500 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 