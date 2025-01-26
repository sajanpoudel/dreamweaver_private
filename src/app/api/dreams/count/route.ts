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

    const count = await db.dream.count({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error getting dream count:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 