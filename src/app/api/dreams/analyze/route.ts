import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { dreamId } = await request.json();
    if (!dreamId) {
      return new NextResponse('Dream ID is required', { status: 400 });
    }

    // Fetch the dream
    const dream = await db.dream.findUnique({
      where: { id: dreamId },
    });

    if (!dream) {
      return new NextResponse('Dream not found', { status: 404 });
    }

    if (dream.userId !== session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Generate analysis using OpenAI
    const prompt = `Analyze this dream and provide insights:
    Title: ${dream.title}
    Content: ${dream.content}
    
    Please provide a detailed analysis including:
    1. Key symbols and their meanings
    2. Main themes
    3. Emotional undertones
    4. Possible interpretations
    5. Actionable insights
    
    Format your response as a JSON object with these fields:
    {
      "symbols": [{"name": string, "meaning": string}],
      "themes": string[],
      "emotions": [{"name": string, "intensity": number}],
      "insights": [{
        "title": string,
        "description": string,
        "confidence": number,
        "category": string,
        "actionable": boolean,
        "recommendation": string
      }]
    }
    
    IMPORTANT: Ensure your response is a valid JSON object and nothing else.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a dream analysis expert with deep knowledge of psychology, symbolism, and dream interpretation. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    const analysis = JSON.parse(completion.choices[0].message.content || "{}");

    // First disconnect existing relationships
    await db.dream.update({
      where: { id: dreamId },
      data: {
        symbols: { set: [] },
        themes: { set: [] },
        emotions: { set: [] },
      },
    });

    // Create or update symbols and connect them to the dream
    const symbols = await Promise.all(
      analysis.symbols.map((symbol: { name: string; meaning: string }) =>
        db.symbol.upsert({
          where: { name: symbol.name },
          update: { description: symbol.meaning },
          create: {
            name: symbol.name,
            description: symbol.meaning,
          },
        })
      )
    );

    // Create or update themes and connect them to the dream
    const themes = await Promise.all(
      analysis.themes.map(async (theme: string) => {
        // First try to find an existing theme
        let existingTheme = await db.theme.findFirst({
          where: { name: theme }
        });

        // If it doesn't exist, create it
        if (!existingTheme) {
          existingTheme = await db.theme.create({
            data: { name: theme }
          });
        }

        return existingTheme;
      })
    );

    // Create or update emotions and connect them to the dream
    const emotions = await Promise.all(
      analysis.emotions.map(async (emotion: { name: string; intensity: number }) => {
        // First try to find an existing emotion
        let existingEmotion = await db.emotion.findFirst({
          where: { name: emotion.name }
        });

        // If it doesn't exist, create it
        if (!existingEmotion) {
          existingEmotion = await db.emotion.create({
            data: { name: emotion.name }
          });
        }

        return existingEmotion;
      })
    );

    // Update the dream with the analysis and connect relationships
    const updatedDream = await db.dream.update({
      where: { id: dreamId },
      data: {
        analysis: completion.choices[0].message.content,
        symbols: {
          connect: symbols.map(symbol => ({ id: symbol.id })),
        },
        themes: {
          connect: themes.map(theme => ({ id: theme.id })),
        },
        emotions: {
          connect: emotions.map(emotion => ({ id: emotion.id })),
        },
      },
      include: {
        symbols: true,
        themes: true,
        emotions: true,
      },
    });

    return NextResponse.json(updatedDream);
  } catch (error) {
    console.error('Error analyzing dream:', error);
    return new NextResponse('Failed to analyze dream', { status: 500 });
  }
} 