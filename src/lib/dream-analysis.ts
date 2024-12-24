import { OpenAI } from 'openai';
import prisma from '@/lib/prisma';

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

export async function analyzeDreamWithContext(
  dreamContent: string,
  userId: string
) {
  try {
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

${dreamContent}

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

    const analysis: AnalysisResult = JSON.parse(
      response.choices[0].message.content || "{}"
    );

    // Create or update symbols
    const symbols = await Promise.all(
      analysis.symbols.map(symbol =>
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
      analysis.themes.map(theme =>
        prisma.theme.upsert({
          where: { name: theme },
          update: {},
          create: { name: theme },
        })
      )
    );

    // Create or update emotions
    const emotions = await Promise.all(
      analysis.emotions.map(emotion =>
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

    // Create or update patterns
    const patterns = await Promise.all(
      analysis.patterns.map(async pattern => {
        const existingPattern = await prisma.dreamPattern.findFirst({
          where: { name: pattern.name, userId },
        });

        return prisma.dreamPattern.upsert({
          where: {
            id: existingPattern?.id || '',
          },
          update: {
            frequency: { increment: 1 },
            confidence: pattern.confidence,
            description: pattern.description,
          },
          create: {
            name: pattern.name,
            description: pattern.description,
            confidence: pattern.confidence,
            userId,
          },
        });
      })
    );

    // Create new insights
    const insights = await Promise.all(
      analysis.insights.map(insight =>
        prisma.userInsight.create({
          data: {
            ...insight,
            userId,
            patterns: {
              connect: patterns.map(pattern => ({ id: pattern.id })),
            },
          },
        })
      )
    );

    return {
      analysis,
      patterns,
      insights,
    };
  } catch (error) {
    console.error('Error in analyzeDreamWithContext:', error);
    throw error;
  }
} 