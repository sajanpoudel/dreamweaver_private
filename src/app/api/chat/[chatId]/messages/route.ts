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

    // Verify user is a participant in the chat
    const participant = await db.chatParticipant.findFirst({
      where: {
        chatId: params.chatId,
        userId: session.user.id,
      },
    });

    if (!participant) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const messages = await db.chatMessage.findMany({
      where: {
        chatId: params.chatId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error in GET /api/chat/[chatId]/messages:', error);
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

    // Verify user is a participant in the chat
    const participant = await db.chatParticipant.findFirst({
      where: {
        chatId: params.chatId,
        userId: session.user.id,
      },
    });

    if (!participant) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const { content } = await req.json();

    const message = await db.chatMessage.create({
      data: {
        content,
        chatId: params.chatId,
        senderId: session.user.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Update chat's updatedAt timestamp
    await db.chat.update({
      where: {
        id: params.chatId,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error in POST /api/chat/[chatId]/messages:', error);
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