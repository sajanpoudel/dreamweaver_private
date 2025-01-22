import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { dreamId } = await req.json();
    if (!dreamId) {
      return NextResponse.json({ error: 'Dream ID is required' }, { status: 400 });
    }

    // Get the dream content
    const dream = await db.dream.findFirst({
      where: {
        AND: [
          { id: dreamId },
          { userId: session.user.id }
        ]
      }
    });

    if (!dream) {
      return NextResponse.json({ error: 'Dream not found' }, { status: 404 });
    }

    // Extract metadata using OpenAI
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a dream analysis expert. Extract symbols, themes, and emotions from the dream content."
        },
        {
          role: "user",
          content: dream.content
        }
      ],
      model: "gpt-4o-mini",
    });

    const analysis = JSON.parse(completion.choices[0].message.content || '{}');

    // Create or update symbols
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

    // Create or update themes
    const themes = await Promise.all(
      analysis.themes.map((theme: string) =>
        db.theme.upsert({
          where: { name: theme },
          update: {},
          create: { name: theme },
        })
      )
    );

    // Create or update emotions
    const emotions = await Promise.all(
      analysis.emotions.map((emotion: { name: string; intensity: number }) =>
        db.emotion.upsert({
          where: { name: emotion.name },
          update: {
            valence: emotion.intensity > 0 ? 1 : -1,
            arousal: Math.abs(emotion.intensity)
          },
          create: {
            name: emotion.name,
            valence: emotion.intensity > 0 ? 1 : -1,
            arousal: Math.abs(emotion.intensity)
          },
        })
      )
    );

    // Update dream with relationships
    await db.dream.update({
      where: { id: dreamId },
      data: {
        symbols: {
          connect: symbols.map((symbol) => ({ id: symbol.id })),
        },
        themes: {
          connect: themes.map((theme) => ({ id: theme.id })),
        },
        emotions: {
          connect: emotions.map((emotion) => ({ id: emotion.id })),
        },
      },
    });

    return NextResponse.json({
      symbols,
      themes,
      emotions,
    });
  } catch (error) {
    console.error('Error extracting dream metadata:', error);
    return NextResponse.json(
      { error: 'Failed to extract dream metadata' },
      { status: 500 }
    );
  }
} 