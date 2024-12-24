import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

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
    const dream = await prisma.dream.findUnique({
      where: { id: dreamId },
      select: { content: true },
    });

    if (!dream) {
      return NextResponse.json({ error: 'Dream not found' }, { status: 404 });
    }

    const prompt = `Analyze the following dream and extract:
1. Symbols: Key objects, people, or elements that might have symbolic meaning
2. Themes: Main themes or concepts present in the dream
3. Emotions: Emotions experienced or conveyed in the dream (with intensity from 1-10)

Return the analysis in the following JSON format exactly:
{
  "symbols": [{"name": "symbol name", "meaning": "potential meaning"}],
  "themes": ["theme1", "theme2"],
  "emotions": [{"name": "emotion name", "intensity": number}]
}

Dream content: "${dream.content}"`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const analysis = JSON.parse(response.choices[0].message.content || "{}");

    // Create or update symbols
    const symbols = await Promise.all(
      analysis.symbols.map((symbol: { name: string; meaning: string }) =>
        prisma.symbol.upsert({
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
        prisma.theme.upsert({
          where: { name: theme },
          update: {},
          create: { name: theme },
        })
      )
    );

    // Create or update emotions
    const emotions = await Promise.all(
      analysis.emotions.map((emotion: { name: string; intensity: number }) =>
        prisma.emotion.upsert({
          where: { name: emotion.name },
          update: { intensity: emotion.intensity },
          create: {
            name: emotion.name,
            intensity: emotion.intensity,
          },
        })
      )
    );

    // Update dream with relationships
    await prisma.dream.update({
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