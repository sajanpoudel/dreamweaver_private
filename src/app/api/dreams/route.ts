import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    console.log('User ID:', session?.user?.id);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { title, content, symbols = [], themes = [], emotions = [] } = await req.json();

    if (!content) {
      return new NextResponse('Dream content is required', { status: 400 });
    }

    // Verify user exists before creating dream
    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Create the dream and its relationships in a transaction
    const dream = await db.$transaction(async (tx) => {
      // Create the dream
      const newDream = await tx.dream.create({
        data: {
          title,
          content,
          userId: user.id, // Use verified user ID
        },
      });

      // Create or connect symbols
      if (symbols.length > 0) {
        await Promise.all(
          symbols.map(async (symbol: { name: string; description: string }) => {
            await tx.symbol.upsert({
              where: { name: symbol.name },
              update: {},
              create: {
                name: symbol.name,
                description: symbol.description || '',
                dreams: {
                  connect: { id: newDream.id },
                },
              },
            });
          })
        );
      }

      // Create or connect themes
      if (themes.length > 0) {
        await Promise.all(
          themes.map(async (theme: { name: string; description?: string }) => {
            await tx.theme.upsert({
              where: { name: theme.name },
              update: {},
              create: {
                name: theme.name,
                description: theme.description || null,
                dreams: {
                  connect: { id: newDream.id },
                },
              },
            });
          })
        );
      }

      // Create or connect emotions
      if (emotions.length > 0) {
        await Promise.all(
          emotions.map(async (emotion: { name: string; intensity: number }) => {
            await tx.emotion.upsert({
              where: { name: emotion.name },
              update: {},
              create: {
                name: emotion.name,
                valence: emotion.intensity > 0 ? 1 : -1,
                arousal: Math.abs(emotion.intensity),
                dreams: {
                  connect: { id: newDream.id },
                },
              },
            });
          })
        );
      }

      // Return the dream with its relationships
      return tx.dream.findUnique({
        where: { id: newDream.id },
        include: {
          symbols: true,
          themes: true,
          emotions: true,
        },
      });
    });

    return NextResponse.json(dream);
  } catch (error) {
    console.error('Error creating dream:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Failed to create dream',
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const dreams = await db.dream.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        symbols: {
          select: {
            id: true,
            name: true,
          },
        },
        themes: {
          select: {
            id: true,
            name: true,
          },
        },
        emotions: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(dreams);
  } catch (error) {
    console.error('Error fetching dreams:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 