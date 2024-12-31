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
    const { content } = await req.json();

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

    if (!content) {
      return new NextResponse('Comment content is required', { status: 400 });
    }

    // Check if story exists
    const story = await db.dreamStory.findUnique({
      where: { id: params.id },
    });

    if (!story) {
      return new NextResponse('Story not found', { status: 404 });
    }

    // Create the comment
    const comment = await db.comment.create({
      data: {
        content,
        userId: session.user.id,
        storyId: params.id,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Failed to create comment',
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  context: z.infer<typeof routeContextSchema>
) {
  try {
    const { params } = routeContextSchema.parse(context);

    const comments = await db.comment.findMany({
      where: {
        storyId: params.id,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Failed to fetch comments',
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: z.infer<typeof routeContextSchema>) {
  try {
    const { params } = routeContextSchema.parse(context);
    const storyId: string = params.id;

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

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');

    if (!commentId) {
      return new NextResponse('Comment ID is required', { status: 400 });
    }

    const comment = await db.comment.findUnique({
      where: { id: commentId },
      include: {
        story: true,
      },
    });

    if (!comment) {
      return new NextResponse('Comment not found', { status: 404 });
    }

    // Only allow comment owner or story owner to delete
    if (comment.userId !== session.user.id && comment.story.userId !== session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await db.comment.delete({
      where: { id: commentId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 