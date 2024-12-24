import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { OpenAI } from 'openai';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface AnalysisResult {
  symbols: Array<{ name: string; meaning: string }>;
  themes: string[];
  emotions: Array<{ name: string; intensity: number }>;
  patterns: Array<{ name: string; description: string; confidence: number }>;
  insights: Array<{
    title: string;
    description: string;
    confidence: number;
    category: string;
    actionable: boolean;
    recommendation?: string;
  }>;
}

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

    // First, verify the dream exists and belongs to the user
    const dream = await prisma.dream.findFirst({
      where: { 
        AND: [
          { id: dreamId },
          { userId: session.user.id }
        ]
      },
      select: { 
        id: true,
        content: true 
      },
    });

    if (!dream) {
      return NextResponse.json({ error: 'Dream not found' }, { status: 404 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert dream analyst and psychological advisor. Analyze dreams in the context of psychological principles and provide detailed insights."
        },
        {
          role: "user",
          content: `Analyze this dream and provide insights about its potential meaning, symbols, themes, and psychological implications:

${dream.content}

Return the analysis in the following JSON format exactly:
{
  "symbols": [{"name": "symbol name", "meaning": "contextual meaning"}],
  "themes": ["theme1", "theme2"],
  "emotions": [{"name": "emotion name", "intensity": number}],
  "patterns": [{"name": "pattern name", "description": "pattern description", "confidence": number}],
  "insights": [{
    "title": "insight title",
    "description": "detailed insight",
    "confidence": number,
    "category": "psychological/emotional/behavioral",
    "actionable": boolean,
    "recommendation": "action item if applicable"
  }]
}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    if (!response.choices[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }

    const analysis: AnalysisResult = JSON.parse(response.choices[0].message.content);

    // Create or update symbols
    const symbols = await Promise.all(
      analysis.symbols.map(async symbol => {
        try {
          return await prisma.symbol.upsert({
            where: { name: symbol.name },
            update: { description: symbol.meaning },
            create: {
              name: symbol.name,
              description: symbol.meaning,
            },
          });
        } catch (error) {
          console.error('Error upserting symbol:', error);
          return null;
        }
      })
    ).then(results => results.filter(Boolean));

    // Create or update themes
    const themes = await Promise.all(
      analysis.themes.map(async theme => {
        try {
          return await prisma.theme.upsert({
            where: { name: theme },
            update: {},
            create: {
              name: theme,
              description: null,
            },
          });
        } catch (error) {
          console.error('Error upserting theme:', error);
          return null;
        }
      })
    ).then(results => results.filter(Boolean));

    // Create or update emotions
    const emotions = await Promise.all(
      analysis.emotions.map(async emotion => {
        try {
          return await prisma.emotion.upsert({
            where: { name: emotion.name },
            update: { intensity: emotion.intensity },
            create: {
              name: emotion.name,
              intensity: emotion.intensity,
            },
          });
        } catch (error) {
          console.error('Error upserting emotion:', error);
          return null;
        }
      })
    ).then(results => results.filter(Boolean));

    // Create patterns one by one to ensure proper creation
    const patterns = [];
    for (const pattern of analysis.patterns) {
      try {
        const createdPattern = await prisma.dreamPattern.create({
          data: {
            name: pattern.name,
            description: pattern.description,
            confidence: pattern.confidence,
            frequency: 1,
            userId: session.user.id,
            dreams: {
              connect: { id: dream.id }
            },
            symbols: {
              connect: symbols.map(symbol => ({ id: symbol.id }))
            },
            themes: {
              connect: themes.map(theme => ({ id: theme.id }))
            },
            emotions: {
              connect: emotions.map(emotion => ({ id: emotion.id }))
            }
          },
        });
        patterns.push(createdPattern);
      } catch (error) {
        console.error('Error creating pattern:', error);
      }
    }

    // Create insights one by one to ensure proper creation
    const insights = [];
    for (const insight of analysis.insights) {
      try {
        const createdInsight = await prisma.userInsight.create({
          data: {
            title: insight.title,
            description: insight.description,
            confidence: insight.confidence,
            category: insight.category,
            actionable: insight.actionable,
            recommendation: insight.recommendation,
            userId: session.user.id,
            patterns: {
              connect: patterns.map(pattern => ({ id: pattern.id }))
            }
          },
        });
        insights.push(createdInsight);
      } catch (error) {
        console.error('Error creating insight:', error);
      }
    }

    // Update the dream with the analysis results
    try {
      await prisma.dream.update({
        where: { id: dream.id },
        data: {
          analysis: JSON.stringify(analysis),
          symbols: {
            connect: symbols.map(symbol => ({ id: symbol.id }))
          },
          themes: {
            connect: themes.map(theme => ({ id: theme.id }))
          },
          emotions: {
            connect: emotions.map(emotion => ({ id: emotion.id }))
          }
        },
      });
    } catch (error) {
      console.error('Error updating dream with analysis:', error);
    }

    return NextResponse.json({
      success: true,
      analysis,
      patterns,
      insights,
    });
  } catch (error) {
    console.error('Error analyzing dream:', error);
    return NextResponse.json(
      { error: 'Failed to analyze dream' },
      { status: 500 }
    );
  }
} 