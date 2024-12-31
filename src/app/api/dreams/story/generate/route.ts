import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import type { Session } from 'next-auth';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as Session & {
      user: {
        id: string;
        email: string;
        name: string;
      };
    };

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { dreamId } = await request.json();
    
    if (!dreamId) {
      return new NextResponse('Dream ID is required', { status: 400 });
    }

    // Get the dream content
    const dream = await db.dream.findUnique({
      where: { id: dreamId },
      include: {
        symbols: true,
        themes: true,
        emotions: true,
      },
    });

    if (!dream) {
      return new NextResponse('Dream not found', { status: 404 });
    }

    if (dream.userId !== session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Generate story using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a creative storyteller who transforms dreams into engaging narratives in a Medium article style. Create well-structured stories with clear sections, vivid descriptions, and meaningful insights."
        },
        {
          role: "user",
          content: `Transform this dream into a captivating story article. Structure it like a professional Medium post with sections and visual elements. Your response must be a valid JSON object with this structure:
{
  "title": "An engaging title that captures the essence of the dream",
  "subtitle": "A compelling subtitle that hints at the story's meaning",
  "introduction": "An engaging opening paragraph that sets the scene",
  "sections": [
    {
      "title": "Section title",
      "content": "Section content with rich narrative and insights",
      "imagePrompt": "Detailed prompt for an image that captures this section's essence"
    }
  ],
  "conclusion": "A thoughtful conclusion that ties everything together",
  "themes": ["Key theme 1", "Key theme 2"],
  "interpretation": "Brief interpretation of the dream's significance"
}

Dream content: ${dream.content}
Symbols to include: ${dream.symbols.map(s => s.name).join(', ')}
Themes to incorporate: ${dream.themes.map(t => t.name).join(', ')}
Emotions to convey: ${dream.emotions.map(e => e.name).join(', ')}`
        }
      ],
      temperature: 0.7
    });

    let storyData;
    try {
      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error('No content received from OpenAI');
      }
      
      // Remove any potential markdown code block markers
      const jsonString = content.replace(/```json\n?|\n?```/g, '').trim();
      storyData = JSON.parse(jsonString);
      
      // Validate the response structure
      if (!storyData.title || !storyData.sections || !Array.isArray(storyData.sections)) {
        throw new Error('Invalid story data structure');
      }
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      console.log('Raw response:', completion.choices[0].message.content);
      return new NextResponse('Failed to parse story data', { status: 500 });
    }

    // Generate images for each scene
    const scenes = await Promise.all(
      storyData.sections.map(async (section: { title: string, content: string, imagePrompt: string }) => {
        try {
          const image = await openai.images.generate({
            model: "dall-e-3",
            prompt: section.imagePrompt,
            n: 1,
            size: "1024x1024",
          });

          return {
            ...section,
            imageUrl: image.data[0].url,
          };
        } catch (error) {
          console.error('Error generating image:', error);
          return {
            ...section,
            imageUrl: null,
          };
        }
      })
    );

    // Prepare the complete story content
    const completeStory = {
      ...storyData,
      sections: scenes
    };

    // Create the story in the database
    const story = await db.dreamStory.create({
      data: {
        title: storyData.title,
        content: JSON.stringify(completeStory), // Serialize the complete story data
        userId: session.user.id,
        dreamId: dreamId,
        symbols: {
          connect: dream.symbols.map(symbol => ({ id: symbol.id }))
        },
        themes: {
          connect: dream.themes.map(theme => ({ id: theme.id }))
        }
      },
      include: {
        symbols: true,
        themes: true,
      },
    });

    return NextResponse.json({
      story: {
        ...story,
        ...completeStory // Include the complete story data in the response
      }
    });
  } catch (error) {
    console.error('Error saving story:', error);
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 500 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 