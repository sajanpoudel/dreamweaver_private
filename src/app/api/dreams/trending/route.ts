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

    // Get dreams from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dreams = await db.dreamStory.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
        isPublic: true,
      },
      select: {
        id: true,
        title: true,
        themes: {
          select: {
            name: true,
          },
          take: 1,
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 4,
    });

    // Transform the data to match the expected format
    const transformedDreams = dreams.map(dream => ({
      id: dream.id,
      title: dream.title,
      theme: dream.themes[0]?.name || 'General',
      likes: dream._count.likes,
      comments: dream._count.comments,
    }));

    return NextResponse.json(transformedDreams);
  } catch (error) {
    console.error('Error getting trending dreams:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 