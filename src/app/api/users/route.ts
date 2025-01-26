import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';

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

    // Transform friendships into a list of friends
    const users = friendships.map(friendship => {
      const friend = friendship.requesterId === session.user.id
        ? friendship.addressee
        : friendship.requester;
      return friend;
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error in GET /api/users:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 