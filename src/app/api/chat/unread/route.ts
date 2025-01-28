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

    // Get count of all messages in user's chats from other participants
    const unreadCount = await db.chatMessage.count({
      where: {
        chat: {
          participants: {
            some: {
              userId: session.user.id,
            },
          },
        },
        senderId: {
          not: session.user.id,
        },
      },
    });

    return NextResponse.json({ count: unreadCount });
  } catch (error) {
    console.error('Error in GET /api/chat/unread:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 