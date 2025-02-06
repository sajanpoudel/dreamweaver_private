import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { generateStoryFromDream, generateDreamImage } from '@/lib/ai-service';
import { categorizeDreamIntoSpaces } from '@/lib/dream-spaces';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function generateImageWithRetry(prompt: string, retries = 2): Promise<{ url: string; provider: string }> {
  try {
    return await generateDreamImage(prompt);
  } catch (error) {
    if (retries > 0) {
      await delay(1000);
      return generateImageWithRetry(prompt, retries - 1);
    }
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { dreamId } = await request.json();
    if (!dreamId) {
      return new NextResponse('Dream ID is required', { status: 400 });
    }

    // Get the dream with its analysis
    const dream = await db.dream.findUnique({
      where: { id: dreamId },
      include: {
        themes: true,
        symbols: true,
      },
    });

    if (!dream) {
      return new NextResponse('Dream not found', { status: 404 });
    }

    if (dream.userId !== session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Generate the story
    const storyResponse = await generateStoryFromDream(dream);
    const storyContent = JSON.parse(storyResponse.text);

    // Create the story
    const story = await db.dreamStory.create({
      data: {
        title: storyContent.title,
        content: storyContent,
        userId: session.user.id,
        dreamId: dream.id,
        themes: {
          connect: dream.themes.map(theme => ({ id: theme.id }))
        },
        symbols: {
          connect: dream.symbols.map(symbol => ({ id: symbol.id }))
        }
      }
    });

    // Generate images for each section
    const sections = storyContent.sections || [];
    for (const section of sections) {
      if (section.imagePrompt) {
        try {
          const { url } = await generateImageWithRetry(section.imagePrompt);
          section.imageUrl = url;
        } catch (error) {
          console.error('Failed to generate image:', error);
          section.imageUrl = null;
        }
      }
    }

    // Update the story with the generated images
    await db.dreamStory.update({
      where: { id: story.id },
      data: {
        content: storyContent
      }
    });

    // Categorize the dream into spaces
    await categorizeDreamIntoSpaces(dreamId);

    return NextResponse.json({
      message: 'Story generated successfully',
      story: {
        ...story,
        content: storyContent
      }
    });

  } catch (error) {
    console.error('Error generating story:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Failed to generate story',
      { status: 500 }
    );
  }
} 