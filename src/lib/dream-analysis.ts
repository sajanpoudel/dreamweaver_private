import { Dream } from '@prisma/client';
import { db } from './prisma';

export interface DreamAnalysis {
  symbols: Array<{ name: string; meaning: string }>;
  themes: string[];
  emotions: Array<{ name: string; intensity: number }>;
  insights: Array<{
    title: string;
    description: string;
    confidence: number;
    category: string;
    actionable: boolean;
    recommendation: string;
  }>;
}

export function parseAnalysis(analysisString: string | null): DreamAnalysis | null {
  if (!analysisString) return null;
  try {
    return JSON.parse(analysisString) as DreamAnalysis;
  } catch (error) {
    console.error('Error parsing dream analysis:', error);
    return null;
  }
}

export async function getDreamWithAnalysis(dreamId: string) {
  const dream = await db.dream.findUnique({
    where: { id: dreamId },
    include: {
      symbols: true,
      themes: true,
      emotions: true,
    },
  });

  if (!dream) return null;

  const analysis = parseAnalysis(dream.analysis);
  return { ...dream, parsedAnalysis: analysis };
} 