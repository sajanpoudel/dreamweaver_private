import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';

// Get friends list and friend requests
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get accepted friendships
    const friendships = await db.friendship.findMany({
      where: {
        OR: [
          { requesterId: session.user.id, status: 'accepted' },
          { addresseeId: session.user.id, status: 'accepted' }
        ],
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        addressee: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Get pending friend requests
    const pendingRequests = await db.friendship.findMany({
      where: {
        addresseeId: session.user.id,
        status: 'pending',
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Transform friendships into a list of friends
    const friends = friendships.map(friendship => {
      const friend = friendship.requesterId === session.user.id
        ? friendship.addressee
        : friendship.requester;
      return {
        ...friend,
        friendshipId: friendship.id,
      };
    });

    return NextResponse.json({
      friends,
      pendingRequests,
    });
  } catch (error) {
    console.error('Error fetching friends:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Send friend request
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { addresseeId } = await req.json();

    // Check if friendship already exists
    const existingFriendship = await db.friendship.findFirst({
      where: {
        OR: [
          { requesterId: session.user.id, addresseeId },
          { requesterId: addresseeId, addresseeId: session.user.id },
        ],
      },
    });

    if (existingFriendship) {
      return new NextResponse('Friendship already exists', { status: 400 });
    }

    // Create friend request
    const friendship = await db.friendship.create({
      data: {
        requesterId: session.user.id,
        addresseeId,
      },
      include: {
        addressee: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(friendship);
  } catch (error) {
    console.error('Error sending friend request:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Update friend request status
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { friendshipId, status } = await req.json();

    // Verify the user is the addressee of the friend request
    const friendship = await db.friendship.findFirst({
      where: {
        id: friendshipId,
        addresseeId: session.user.id,
        status: 'pending',
      },
    });

    if (!friendship) {
      return new NextResponse('Friend request not found', { status: 404 });
    }

    // Update friendship status
    const updatedFriendship = await db.friendship.update({
      where: { id: friendshipId },
      data: { status },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(updatedFriendship);
  } catch (error) {
    console.error('Error updating friend request:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Remove friend
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { friendshipId } = await req.json();

    // Verify the user is part of the friendship
    const friendship = await db.friendship.findFirst({
      where: {
        id: friendshipId,
        OR: [
          { requesterId: session.user.id },
          { addresseeId: session.user.id },
        ],
      },
    });

    if (!friendship) {
      return new NextResponse('Friendship not found', { status: 404 });
    }

    // Delete friendship
    await db.friendship.delete({
      where: { id: friendshipId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error removing friend:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 