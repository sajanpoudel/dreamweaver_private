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

    console.log('Finding suggestions for user:', session.user.id);

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

    console.log('Excluding users:', Array.from(excludeUserIds));

    // Find users who are not connected
    const suggestedUsers = await db.user.findMany({
      where: {
        id: { notIn: Array.from(excludeUserIds) },
      },
      select: {
        id: true,
        name: true,
        image: true,
        dreamstories: {
          where: {
            publishedAt: { not: null }
          },
          select: {
            symbols: true,
            themes: true,
          },
          take: 5,
        },
      },
      orderBy: [
        {
          dreamstories: {
            _count: 'desc'
          }
        },
        {
          createdAt: 'desc'
        }
      ],
      take: 15,
    });

    console.log('Found potential users:', suggestedUsers.length);

    // Process suggestions
    const suggestions = suggestedUsers
      .map((user) => {
        // Extract dream interests (symbols and themes)
        const dreamInterests = user.dreamstories
          .flatMap(story => {
            const interests = [];
            if (story.symbols) {
              try {
                const symbols = JSON.parse(story.symbols as string);
                interests.push(...(Array.isArray(symbols) ? symbols : []));
              } catch {}
            }
            if (story.themes) {
              try {
                const themes = JSON.parse(story.themes as string);
                interests.push(...(Array.isArray(themes) ? themes : []));
              } catch {}
            }
            return interests;
          })
          .filter((interest, index, self) => 
            interest && typeof interest === 'string' && self.indexOf(interest) === index
          )
          .slice(0, 3);

        return {
          id: user.id,
          name: user.name,
          image: user.image,
          mutualFriends: 0,
          dreamInterests: dreamInterests.length > 0 
            ? dreamInterests 
            : ['New Dreamer'],
          storyCount: user.dreamstories.length
        };
      })
      .sort((a, b) => b.storyCount - a.storyCount)
      .slice(0, 5);

    console.log('Processed suggestions:', suggestions.length);

    if (suggestions.length === 0) {
      console.log('No suggestions with dreams found, fetching new users');
      // If no suggestions with dreams, get new users
      const newUsers = await db.user.findMany({
        where: {
          id: { notIn: Array.from(excludeUserIds) },
        },
        select: {
          id: true,
          name: true,
          image: true,
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5,
      });

      const fallbackSuggestions = newUsers.map(user => ({
        id: user.id,
        name: user.name,
        image: user.image,
        mutualFriends: 0,
        dreamInterests: ['New Dreamer'],
        storyCount: 0
      }));

      console.log('Returning fallback suggestions:', fallbackSuggestions.length);
      return NextResponse.json(fallbackSuggestions);
    }

    console.log('Returning suggestions:', suggestions.length);
    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Error getting friend suggestions:', error);
    if (error instanceof Error) {
      return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 