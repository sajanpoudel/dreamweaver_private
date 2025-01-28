import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { chatId } = params;

    // Verify user is in chat
    const chat = await db.chat.findFirst({
      where: {
        id: chatId,
        participants: {
          some: {
            userId: session.user.id,
          },
        },
      },
    });

    if (!chat) {
      return new NextResponse('Chat not found or not authorized', { status: 404 });
    }

    // For now, we'll just return success since we can't mark messages as read
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 