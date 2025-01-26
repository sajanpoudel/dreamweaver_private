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

    // Get current user's connections
    const existingConnections = await db.friendship.findMany({
      where: {
        OR: [
          { requesterId: session.user.id },
          { addresseeId: session.user.id },
        ],
        status: { not: 'rejected' }
      },
      select: {
        requesterId: true,
        addresseeId: true,
      },
    });

    // Create a set of users to exclude
    const excludeUserIds = new Set([
      session.user.id,
      ...existingConnections.map(c => c.requesterId),
      ...existingConnections.map(c => c.addresseeId),
    ]);

    // Find users who are not connected
    const suggestedUsers = await db.user.findMany({
      where: {
        id: { notIn: Array.from(excludeUserIds) },
      },
      select: {
        id: true,
        name: true,
        image: true,
        dreams: {
          select: {
            themes: true,
          },
          take: 5,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    // Process suggestions with safer theme extraction
    const suggestions = suggestedUsers
      .filter(user => user.dreams.length > 0) // Only include users with dreams
      .map((user) => {
        // Extract dream interests (themes) safely
        const dreamInterests = user.dreams
          .flatMap(dream => {
            if (!dream.themes) return [];
            try {
              const themes = JSON.parse(dream.themes as string);
              return Array.isArray(themes) ? themes : [];
            } catch {
              return [];
            }
          })
          .filter((theme, index, self) => 
            theme && typeof theme === 'string' && self.indexOf(theme) === index
          )
          .slice(0, 3);

        return {
          id: user.id,
          name: user.name,
          image: user.image,
          mutualFriends: 0,
          dreamInterests: dreamInterests.length > 0 ? dreamInterests : ['New User'],
        };
      })
      .slice(0, 5); // Take top 5 suggestions

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Error getting friend suggestions:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 