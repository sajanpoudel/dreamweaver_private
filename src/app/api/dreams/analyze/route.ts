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

    // Get the dream content
    const dream = await prisma.dream.findFirst({
      where: {
        AND: [
          { id: dreamId },
          { userId: session.user.id }
        ]
      },
      include: {
        symbols: true,
        themes: true,
        emotions: true,
      },
    });

    if (!dream) {
      return new NextResponse('Dream not found', { status: 404 });
    }

    // Generate analysis with GPT-4
    const analysisPrompt = `Analyze this dream and provide insights:
Content: ${dream.content}
Symbols: ${dream.symbols.map(s => s.name).join(', ')}
Themes: ${dream.themes.map(t => t.name).join(', ')}
Emotions: ${dream.emotions.map(e => e.name).join(', ')}

Provide a detailed analysis including:
1. Symbolic meanings
2. Thematic elements
3. Emotional patterns
4. Potential insights
5. Actionable recommendations

You must respond with a valid JSON object using this exact structure:
{
  "symbols": [
    {"name": "string", "meaning": "string"}
  ],
  "themes": ["string"],
  "emotions": [
    {"name": "string", "intensity": number}
  ],
  "patterns": [
    {"name": "string", "description": "string", "confidence": number}
  ],
  "insights": [
    {
      "title": "string",
      "description": "string",
      "confidence": number,
      "category": "string",
      "actionable": boolean,
      "recommendation": "string"
    }
  ]
}

Do not include any text before or after the JSON object. The response must be a valid JSON object that can be parsed.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: analysisPrompt }],
      temperature: 0.7
    });

    if (!completion.choices[0].message.content) {
      throw new Error('Failed to generate analysis');
    }

    let analysis;
    try {
      analysis = JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('Failed to parse analysis:', error);
      throw new Error('Invalid analysis format received from OpenAI');
    }

    // Validate the analysis structure
    if (!analysis.symbols || !Array.isArray(analysis.symbols) ||
        !analysis.themes || !Array.isArray(analysis.themes) ||
        !analysis.emotions || !Array.isArray(analysis.emotions) ||
        !analysis.patterns || !Array.isArray(analysis.patterns) ||
        !analysis.insights || !Array.isArray(analysis.insights)) {
      throw new Error('Invalid analysis structure received from OpenAI');
    }

    console.log('Analysis completed successfully');

    // Save the analysis and create patterns/insights in a transaction
    await prisma.$transaction(async (tx) => {
      // Update the dream with the analysis
      await tx.dream.update({
        where: { id: dreamId },
        data: {
          analysis: JSON.stringify(analysis),
        },
      });

      // Create patterns
      if (analysis.patterns) {
        await Promise.all(
          analysis.patterns.map(async (pattern) => {
            await tx.dreamPattern.create({
              data: {
                name: pattern.name,
                description: pattern.description,
                confidence: pattern.confidence,
                userId: session.user.id,
                dreams: {
                  connect: { id: dreamId }
                },
              },
            });
          })
        );
      }

      // Create insights
      if (analysis.insights) {
        await Promise.all(
          analysis.insights.map(async (insight) => {
            await tx.userInsight.create({
              data: {
                title: insight.title,
                description: insight.description,
                confidence: insight.confidence,
                category: insight.category,
                actionable: insight.actionable,
                recommendation: insight.recommendation || null,
                userId: session.user.id,
              },
            });
          })
        );
      }
    });

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error in analyze route:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Failed to analyze dream',
      { status: 500 }
    );
  }
} 