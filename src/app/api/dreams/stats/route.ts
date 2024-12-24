import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [
      totalDreams,
      symbolCounts,
      themeCounts,
      emotionCounts,
    ] = await Promise.all([
      // Get total dreams
      prisma.dream.count({
        where: { userId: session.user.email },
      }),

      // Get symbol counts
      prisma.symbol.findMany({
        select: {
          name: true,
          _count: {
            select: { dreams: true },
          },
        },
        where: {
          dreams: {
            some: { userId: session.user.email },
          },
        },
        orderBy: {
          dreams: { _count: 'desc' },
        },
        take: 5,
      }),

      // Get theme counts
      prisma.theme.findMany({
        select: {
          name: true,
          _count: {
            select: { dreams: true },
          },
        },
        where: {
          dreams: {
            some: { userId: session.user.email },
          },
        },
        orderBy: {
          dreams: { _count: 'desc' },
        },
        take: 5,
      }),

      // Get emotion counts
      prisma.emotion.findMany({
        select: {
          name: true,
          _count: {
            select: { dreams: true },
          },
        },
        where: {
          dreams: {
            some: { userId: session.user.email },
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
      topSymbols: symbolCounts.map((s) => ({
        name: s.name,
        count: s._count.dreams,
      })),
      topThemes: themeCounts.map((t) => ({
        name: t.name,
        count: t._count.dreams,
      })),
      topEmotions: emotionCounts.map((e) => ({
        name: e.name,
        count: e._count.dreams,
      })),
    });
  } catch (error) {
    console.error('Error fetching dream stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dream stats' },
      { status: 500 }
    );
  }
} 