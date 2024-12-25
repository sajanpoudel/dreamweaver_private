import { OpenAI } from 'openai';
import { prisma } from './prisma';

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

export async function analyzeDreamWithContext(dream: any, userId: string) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  try {
    console.log('Analyzing dream:', { dreamId: dream.id, content: dream.content });
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert dream analyst and psychological advisor. Analyze dreams in the context of psychological principles and provide detailed insights. When providing confidence values, use decimal numbers between 0 and 1 (e.g., 0.8 for 80% confidence)."
        },
        {
          role: "user",
          content: `Analyze this dream and provide insights about its potential meaning, symbols, themes, and psychological implications:

${dream.content}

Return the analysis in the following JSON format exactly:
{
  "symbols": [{"name": "symbol name", "meaning": "contextual meaning"}],
  "themes": ["theme1", "theme2"],
  "emotions": [{"name": "emotion name", "intensity": number from 1-10}],
  "patterns": [{"name": "pattern name", "description": "pattern description", "confidence": number between 0 and 1}],
  "insights": [{
    "title": "insight title",
    "description": "detailed insight",
    "confidence": number between 0 and 1,
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

    console.log('OpenAI response:', response.choices[0].message.content);

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

    // Update the dream with the analysis results
    await prisma.dream.update({
      where: { id: dream.id },
      data: {
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

    return JSON.stringify(analysis);
  } catch (error) {
    console.error('Error in analyzeDreamWithContext:', error);
    if (error instanceof Error) {
      throw new Error(`Dream analysis failed: ${error.message}`);
    }
    throw error;
  }
} 