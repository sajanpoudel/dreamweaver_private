import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';

// Get user's chats
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const chats = await db.chat.findMany({
      where: {
        participants: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Transform data to include unread count and last message
    const transformedChats = await Promise.all(
      chats.map(async (chat) => {
        const userParticipant = chat.participants.find(
          (p) => p.userId === session.user.id
        );

        const unreadCount = await db.chatMessage.count({
          where: {
            chatId: chat.id,
            createdAt: {
              gt: userParticipant?.lastRead,
            },
            NOT: {
              senderId: session.user.id,
            },
          },
        });

        const otherParticipants = chat.participants
          .filter((p) => p.userId !== session.user.id)
          .map((p) => p.user);

        return {
          id: chat.id,
          name: chat.name || otherParticipants.map((p) => p.name).join(', '),
          participants: otherParticipants,
          lastMessage: chat.messages[0],
          unreadCount,
          updatedAt: chat.updatedAt,
        };
      })
    );

    return NextResponse.json(transformedChats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Create new chat
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { participantIds, isGroup, name } = await req.json();

    // For direct messages, check if chat already exists
    if (!isGroup && participantIds.length === 1) {
      const existingChat = await db.chat.findFirst({
        where: {
          isGroup: false,
          participants: {
            every: {
              userId: {
                in: [session.user.id, participantIds[0]],
              },
            },
          },
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      });

      if (existingChat) {
        return NextResponse.json(existingChat);
      }
    }

    // Create new chat
    const chat = await db.chat.create({
      data: {
        isGroup,
        name,
        participants: {
          create: [
            { userId: session.user.id },
            ...participantIds.map((id: string) => ({ userId: id })),
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(chat);
  } catch (error) {
    console.error('Error creating chat:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Update chat (group name, add/remove participants)
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { chatId, name, addParticipantIds, removeParticipantIds } = await req.json();

    // Verify user is in chat and it's a group chat
    const chat = await db.chat.findFirst({
      where: {
        id: chatId,
        isGroup: true,
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

    // Update chat
    const updatedChat = await db.chat.update({
      where: { id: chatId },
      data: {
        name,
        participants: {
          createMany: addParticipantIds
            ? {
                data: addParticipantIds.map((id: string) => ({ userId: id })),
                skipDuplicates: true,
              }
            : undefined,
          deleteMany: removeParticipantIds
            ? {
                userId: {
                  in: removeParticipantIds,
                },
              }
            : undefined,
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedChat);
  } catch (error) {
    console.error('Error updating chat:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Leave or delete chat
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { chatId } = await req.json();

    // Remove user from chat
    await db.chatParticipant.delete({
      where: {
        userId_chatId: {
          userId: session.user.id,
          chatId,
        },
      },
    });

    // If no participants left, delete the chat
    const remainingParticipants = await db.chatParticipant.count({
      where: { chatId },
    });

    if (remainingParticipants === 0) {
      await db.chat.delete({
        where: { id: chatId },
      });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error leaving chat:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 