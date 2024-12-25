import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const userId = session.user.id;

  try {
    const [
      totalDreams,
      symbolCounts,
      themeCounts,
      emotionCounts,
    ] = await Promise.all([
      // Get total dreams count for the current user only
      prisma.dream.count({
        where: { userId: userId },
      }),

      // Get symbol counts for the current user only
      prisma.symbol.findMany({
        select: {
          name: true,
          _count: {
            select: { dreams: { where: { userId: userId } } },
          },
        },
        where: {
          dreams: {
            some: { userId: userId },
          },
        },
        orderBy: {
          dreams: { _count: 'desc' },
        },
        take: 5,
      }),

      // Get theme counts for the current user only
      prisma.theme.findMany({
        select: {
          name: true,
          _count: {
            select: { dreams: { where: { userId: userId } } },
          },
        },
        where: {
          dreams: {
            some: { userId: userId },
          },
        },
        orderBy: {
          dreams: { _count: 'desc' },
        },
        take: 5,
      }),

      // Get emotion counts for the current user only
      prisma.emotion.findMany({
        select: {
          name: true,
          _count: {
            select: { dreams: { where: { userId: userId } } },
          },
        },
        where: {
          dreams: {
            some: { userId: userId },
          },
        },
        orderBy: {
          dreams: { _count: 'desc' },
        },
        take: 5,
      }),
    ]);

    return NextResponse.json({
      totalDreams,
      topSymbols: symbolCounts.map(s => ({
        name: s.name,
        count: s._count.dreams,
      })),
      topThemes: themeCounts.map(t => ({
        name: t.name,
        count: t._count.dreams,
      })),
      topEmotions: emotionCounts.map(e => ({
        name: e.name,
        count: e._count.dreams,
      })),
    });
  } catch (error) {
    console.error('Error fetching dream stats:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 