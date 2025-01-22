import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { analyzeDreams } from '@/lib/dream-analytics';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const analytics = await analyzeDreams(session.user.id);
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching dream analytics:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Failed to fetch dream analytics',
      { status: 500 }
    );
  }
} 