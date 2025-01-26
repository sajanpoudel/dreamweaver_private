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
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(chats);
  } catch (error) {
    console.error('Error in GET /api/chat:', error);
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

    const { participantIds } = await req.json();
    
    // Check if a chat already exists with these participants
    const existingChat = await db.chat.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: {
                userId: session.user.id
              }
            }
          },
          {
            participants: {
              some: {
                userId: participantIds[0]
              }
            }
          }
        ]
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
                image: true,
              },
            },
          },
        },
      },
    });

    if (existingChat) {
      // Get the other participant's user data
      const otherParticipant = existingChat.participants.find(
        p => p.user.id !== session.user.id
      );
      
      return NextResponse.json({
        ...existingChat,
        user: otherParticipant?.user
      });
    }

    // Create a new chat
    const chat = await db.chat.create({
      data: {
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
                image: true,
              },
            },
          },
        },
      },
    });

    // Get the other participant's user data
    const otherParticipant = chat.participants.find(
      p => p.user.id !== session.user.id
    );

    return NextResponse.json({
      ...chat,
      user: otherParticipant?.user
    });
  } catch (error) {
    console.error('Error in POST /api/chat:', error);
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 500 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Update chat (add/remove participants)
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { chatId, addParticipantIds, removeParticipantIds } = await req.json();

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

    // Update chat
    const updatedChat = await db.chat.update({
      where: { id: chatId },
      data: {
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