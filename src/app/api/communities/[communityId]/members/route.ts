import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';

// Get community members
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

    const members = await db.communityMember.findMany({
      where: {
        communityId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error('Error fetching community members:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Join community
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

    // Check if already a member
    const existingMembership = await db.communityMember.findFirst({
      where: {
        communityId,
        userId: session.user.id,
      },
    });

    if (existingMembership) {
      return new NextResponse('Already a member', { status: 400 });
    }

    // Join community
    const membership = await db.communityMember.create({
      data: {
        communityId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(membership);
  } catch (error) {
    console.error('Error joining community:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Update member role
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
    const { userId, role } = await req.json();

    // Verify user is admin
    const adminMembership = await db.communityMember.findFirst({
      where: {
        communityId,
        userId: session.user.id,
        role: 'admin',
      },
    });

    if (!adminMembership) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Update member role
    const membership = await db.communityMember.update({
      where: {
        userId_communityId: {
          userId,
          communityId,
        },
      },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(membership);
  } catch (error) {
    console.error('Error updating member role:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Leave or remove member from community
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
    const { userId } = await req.json();

    // If removing another user, verify current user is admin
    if (userId !== session.user.id) {
      const adminMembership = await db.communityMember.findFirst({
        where: {
          communityId,
          userId: session.user.id,
          role: 'admin',
        },
      });

      if (!adminMembership) {
        return new NextResponse('Unauthorized', { status: 401 });
      }
    }

    // Remove membership
    await db.communityMember.delete({
      where: {
        userId_communityId: {
          userId: userId || session.user.id,
          communityId,
        },
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error removing community member:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 