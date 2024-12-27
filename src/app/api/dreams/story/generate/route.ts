import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import OpenAI from 'openai';
import prisma from '@/lib/prisma';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { dreamId } = await req.json();
    if (!dreamId) {
      return new NextResponse('Dream ID is required', { status: 400 });
    }

    // Get the dream content first
    const dream = await prisma.dream.findUnique({
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

    // Check if a story already exists for this dream
    const existingStory = await prisma.dreamStory.findFirst({
      where: {
        dreamId: dreamId,
        userId: session.user.id,
      },
    });

    if (existingStory) {
      try {
        const parsedContent = JSON.parse(existingStory.content);
        return NextResponse.json(parsedContent);
      } catch (error) {
        console.error('Error parsing existing story:', error);
        // If we can't parse the existing story, we'll generate a new one
      }
    }

    // Generate story structure with GPT-4
    const storyPrompt = `Create an engaging story based on this dream:
Content: ${dream.content}
Symbols: ${dream.symbols.map(s => s.name).join(', ')}
Themes: ${dream.themes.map(t => t.name).join(', ')}
Emotions: ${dream.emotions.map(e => e.name).join(', ')}

Create a story with the following structure:
1. A captivating title
2. A brief summary
3. 3-5 scenes, each with:
   - Descriptive text
   - A detailed image prompt for DALL-E
   - A caption for the image

You must respond with a valid JSON object using this exact structure:
{
  "title": "string",
  "summary": "string",
  "scenes": [
    {
      "text": "string",
      "imagePrompt": "string",
      "caption": "string"
    }
  ]
}

Do not include any text before or after the JSON object. The response must be a valid JSON object that can be parsed.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: storyPrompt }],
      temperature: 0.9
    });

    if (!completion.choices[0].message.content) {
      throw new Error('Failed to generate story structure');
    }

    let storyStructure;
    try {
      storyStructure = JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('Failed to parse story structure:', error);
      throw new Error('Invalid story structure received from OpenAI');
    }

    // Validate the story structure
    if (!storyStructure.title || !storyStructure.summary || !storyStructure.scenes || !Array.isArray(storyStructure.scenes)) {
      throw new Error('Invalid story structure generated');
    }

    // Generate images for each scene using DALL-E
    const scenes = await Promise.all(
      storyStructure.scenes.map(async (scene: any) => {
        try {
          const image = await openai.images.generate({
            model: "dall-e-3",
            prompt: scene.imagePrompt + " Style: Dreamlike, cinematic, highly detailed, professional quality.",
            size: "1792x1024",
            quality: "hd",
            n: 1,
          });

          if (!image.data[0]?.url) {
            throw new Error('Failed to generate image');
          }

          return {
            text: scene.text,
            imageUrl: image.data[0].url,
            caption: scene.caption,
          };
        } catch (error) {
          console.error('Error generating image:', error);
          throw new Error('Failed to generate scene image');
        }
      })
    );

    const story = {
      title: storyStructure.title,
      summary: storyStructure.summary,
      scenes,
    };

    // Save the generated story
    try {
      const savedStory = await prisma.$transaction(async (tx) => {
        // Create the story
        const newStory = await tx.dreamStory.create({
          data: {
            dreamId,
            userId: session.user.id,
            title: story.title,
            content: JSON.stringify(story),
            isPublic: false,
          },
        });

        // Create themes
        if (dream.themes.length > 0) {
          await Promise.all(
            dream.themes.map(async (theme) => {
              await tx.storyTheme.create({
                data: {
                  name: theme.name,
                  storyId: newStory.id,
                },
              });
            })
          );
        }

        // Create symbols
        if (dream.symbols.length > 0) {
          await Promise.all(
            dream.symbols.map(async (symbol) => {
              await tx.storySymbol.create({
                data: {
                  name: symbol.name,
                  storyId: newStory.id,
                },
              });
            })
          );
        }

        return newStory;
      });

      console.log('Story saved successfully:', savedStory.id);
    } catch (error) {
      console.error('Error saving story:', error);
      // Continue even if saving fails - user can still see the generated story
    }

    return NextResponse.json(story);
  } catch (error) {
    console.error('Story generation error:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Failed to generate story',
      { status: 500 }
    );
  }
} 