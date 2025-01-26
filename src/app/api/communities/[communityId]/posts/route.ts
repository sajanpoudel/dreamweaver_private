import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';

// Get community posts
export async function GET(
  req: Request,
  { params }: { params: { communityId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { communityId } = params;
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get('cursor');
    const limit = 10;

    // Verify user is a member
    const membership = await db.communityMember.findFirst({
      where: {
        communityId,
        userId: session.user.id,
      },
    });

    if (!membership) {
      return new NextResponse('Not a member', { status: 403 });
    }

    // Get posts with pagination
    const posts = await db.communityPost.findMany({
      where: {
        communityId,
      },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        likes: {
          where: {
            userId: session.user.id,
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const nextCursor = posts.length === limit ? posts[posts.length - 1].id : null;

    return NextResponse.json({
      posts,
      nextCursor,
    });
  } catch (error) {
    console.error('Error fetching community posts:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Create community post
export async function POST(
  req: Request,
  { params }: { params: { communityId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { communityId } = params;
    const { content } = await req.json();

    // Verify user is a member
    const membership = await db.communityMember.findFirst({
      where: {
        communityId,
        userId: session.user.id,
      },
    });

    if (!membership) {
      return new NextResponse('Not a member', { status: 403 });
    }

    // Create post
    const post = await db.communityPost.create({
      data: {
        content,
        authorId: session.user.id,
        communityId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error creating community post:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Update community post
export async function PATCH(
  req: Request,
  { params }: { params: { communityId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { communityId } = params;
    const { postId, content } = await req.json();

    // Verify user is post author or admin
    const [post, membership] = await Promise.all([
      db.communityPost.findUnique({
        where: { id: postId },
      }),
      db.communityMember.findFirst({
        where: {
          communityId,
          userId: session.user.id,
        },
      }),
    ]);

    if (!post || (!membership?.role === 'admin' && post.authorId !== session.user.id)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Update post
    const updatedPost = await db.communityPost.update({
      where: { id: postId },
      data: { content },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Error updating community post:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Delete community post
export async function DELETE(
  req: Request,
  { params }: { params: { communityId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { communityId } = params;
    const { postId } = await req.json();

    // Verify user is post author or admin
    const [post, membership] = await Promise.all([
      db.communityPost.findUnique({
        where: { id: postId },
      }),
      db.communityMember.findFirst({
        where: {
          communityId,
          userId: session.user.id,
        },
      }),
    ]);

    if (!post || (!membership?.role === 'admin' && post.authorId !== session.user.id)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Delete post
    await db.communityPost.delete({
      where: { id: postId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting community post:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 