import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { StoryContent, parseStoryContent } from '@/types/story';

const extractStoryPreview = (content: any): string => {
  try {
    let storyContent: StoryContent;
    
    if (typeof content === 'string') {
      try {
        storyContent = JSON.parse(content);
      } catch {
        return content;
      }
    } else {
      storyContent = content;
    }

    // Build preview from available fields
    if (storyContent.introduction) {
      return storyContent.introduction;
    }
    
    const parts: string[] = [];
    
    if (storyContent.subtitle) {
      parts.push(storyContent.subtitle);
    }
    
    if (storyContent.sections && storyContent.sections.length > 0) {
      parts.push(storyContent.sections[0].content);
    }
    
    return parts.join(' ').trim();
  } catch (error) {
    console.error('Error extracting story preview:', error);
    return '';
  }
};

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if session exists
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get user ID from session
    const userId = session.user.id;
    if (!userId) {
      console.error('Session data:', JSON.stringify(session, null, 2));
      return new NextResponse('User ID not found', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json([]);
    }

    // Search for both dreams and stories
    const [dreams, stories] = await Promise.all([
      // Search private dreams (only user's own dreams)
      prisma.dream.findMany({
        where: {
          userId: userId,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          title: true,
          content: true,
          userId: true,
        },
        take: 5,
      }),
      // Search public stories (all users)
      prisma.dreamStory.findMany({
        where: {
          isPublic: true,
          title: {
            contains: query,
            mode: 'insensitive'
          }
        },
        select: {
          id: true,
          title: true,
          content: true,
          userId: true,
        },
        take: 5,
      }),
    ]);

    // Filter stories by content after fetching
    const filteredStories = stories.filter(story => {
      const preview = extractStoryPreview(story.content);
      return preview.toLowerCase().includes(query.toLowerCase());
    });

    // Format results
    const formattedResults = [
      ...dreams.map(dream => ({
        id: dream.id,
        type: 'dream' as const,
        title: dream.title || 'Untitled Dream',
        preview: typeof dream.content === 'string' 
          ? dream.content.slice(0, 150) 
          : dream.content || '',
        userId: dream.userId,
      })),
      ...filteredStories.map(story => {
        let storyContent: StoryContent;
        try {
          storyContent = typeof story.content === 'string' 
            ? JSON.parse(story.content) 
            : story.content;
        } catch {
          storyContent = {};
        }

        return {
          id: story.id,
          type: 'story' as const,
          title: storyContent.title || story.title || 'Untitled Story',
          preview: extractStoryPreview(story.content),
          userId: story.userId,
        };
      }),
    ];

    return NextResponse.json(formattedResults);
  } catch (error) {
    console.error('Search error:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal Server Error', 
      { status: 500 }
    );
  }
} 