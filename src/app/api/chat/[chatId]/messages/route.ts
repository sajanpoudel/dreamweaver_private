import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';

// Get chat messages
export async function GET(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { chatId } = params;
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get('cursor');
    const limit = 50;

    // Verify user is in chat
    const participant = await db.chatParticipant.findUnique({
      where: {
        userId_chatId: {
          userId: session.user.id,
          chatId,
        },
      },
    });

    if (!participant) {
      return new NextResponse('Not a chat participant', { status: 403 });
    }

    // Get messages with pagination
    const messages = await db.chatMessage.findMany({
      where: {
        chatId,
      },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        readBy: {
          select: {
            userId: true,
            lastRead: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Update last read
    await db.chatParticipant.update({
      where: {
        userId_chatId: {
          userId: session.user.id,
          chatId,
        },
      },
      data: {
        lastRead: new Date(),
      },
    });

    const nextCursor = messages.length === limit ? messages[messages.length - 1].id : null;

    return NextResponse.json({
      messages: messages.reverse(), // Return in chronological order
      nextCursor,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Send message
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
    const { content } = await req.json();

    // Verify user is in chat
    const participant = await db.chatParticipant.findUnique({
      where: {
        userId_chatId: {
          userId: session.user.id,
          chatId,
        },
      },
    });

    if (!participant) {
      return new NextResponse('Not a chat participant', { status: 403 });
    }

    // Create message
    const message = await db.chatMessage.create({
      data: {
        content,
        senderId: session.user.id,
        chatId,
        readBy: {
          connect: {
            userId_chatId: {
              userId: session.user.id,
              chatId,
            },
          },
        },
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        readBy: {
          select: {
            userId: true,
            lastRead: true,
          },
        },
      },
    });

    // Update chat's updatedAt
    await db.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Update message
export async function PATCH(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { chatId } = params;
    const { messageId, content } = await req.json();

    // Verify user is message sender
    const message = await db.chatMessage.findFirst({
      where: {
        id: messageId,
        chatId,
        senderId: session.user.id,
      },
    });

    if (!message) {
      return new NextResponse('Message not found or not authorized', { status: 404 });
    }

    // Update message
    const updatedMessage = await db.chatMessage.update({
      where: { id: messageId },
      data: { content },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        readBy: {
          select: {
            userId: true,
            lastRead: true,
          },
        },
      },
    });

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error('Error updating message:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Delete message
export async function DELETE(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { chatId } = params;
    const { messageId } = await req.json();

    // Verify user is message sender
    const message = await db.chatMessage.findFirst({
      where: {
        id: messageId,
        chatId,
        senderId: session.user.id,
      },
    });

    if (!message) {
      return new NextResponse('Message not found or not authorized', { status: 404 });
    }

    // Delete message
    await db.chatMessage.delete({
      where: { id: messageId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting message:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 