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

    // Verify user exists in database
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true }
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const count = await db.friendship.count({
      where: {
        OR: [
          { requesterId: session.user.id, status: 'accepted' },
          { addresseeId: session.user.id, status: 'accepted' },
        ],
      },
    });

    return NextResponse.json({ 
      count,
      pendingCount: await db.friendship.count({
        where: {
          addresseeId: session.user.id,
          status: 'pending'
        }
      })
    });
  } catch (error) {
    console.error('Error getting friend count:', error);
    if (error instanceof Error) {
      return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 