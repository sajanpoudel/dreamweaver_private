import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { generateStoryFromDream, generateDreamImage } from '@/lib/ai-service';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function generateImageWithRetry(prompt: string, retries = 2): Promise<{ url: string; provider: string }> {
  try {
    return await generateDreamImage(prompt);
  } catch (error) {
    if (retries > 0) {
      await delay(1000); // Wait 1 second before retrying
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

    // Get the dream
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

    // Generate story content using AI
    const { text: storyContent, model } = await generateStoryFromDream(dream);

    // Parse the story content
    const storyData = JSON.parse(storyContent);

    // Generate images sequentially with delays
    const sectionsWithImages = [];
    for (const section of storyData.sections) {
      try {
        const { url: imageUrl, provider } = await generateImageWithRetry(section.imagePrompt);
        sectionsWithImages.push({
          ...section,
          imageUrl,
          imageProvider: provider
        });
        // Add a delay between image generations
        await delay(1000);
      } catch (error) {
        console.error('Error generating image for section:', section.title, error);
        // Continue with the section but without an image
        sectionsWithImages.push({
          ...section,
          imageUrl: null,
          imageProvider: null,
          imageError: 'Failed to generate image'
        });
      }
    }

    // Update the story data with images
    const finalStoryData = {
      ...storyData,
      sections: sectionsWithImages,
      model,
    };

    // Create or update the story in the database
    const story = await db.dreamStory.upsert({
      where: {
        dreamId: dream.id,
        userId: session.user.id,
      },
      update: {
        content: JSON.stringify(finalStoryData),
        title: storyData.title,
      },
      create: {
        dreamId: dream.id,
        userId: session.user.id,
        content: JSON.stringify(finalStoryData),
        title: storyData.title,
        isPublic: false,
      },
    });

    return NextResponse.json({ 
      story,
      aiModel: model
    });

  } catch (error) {
    console.error('Error generating story:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Failed to generate story',
      { status: 500 }
    );
  }
} 