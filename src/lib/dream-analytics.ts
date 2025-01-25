import { db } from './prisma';
import OpenAI from 'openai';
import type { Dream, User, Prisma, Symbol, Theme, Emotion } from '@prisma/client';
import { analyzeDream, parseAnalysis, type DreamAnalysis } from './dream-analysis';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface DreamPattern {
  pattern: string;
  frequency: number;
  description: string;
  significance: string;
  recommendations: string[];
}

interface EmotionalInsight {
  emotion: string;
  name?: string;
  frequency: number;
  intensity?: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  impact: string;
  suggestions: string[];
}

interface TimeAnalysis {
  mostActiveTime: string;
  dreamFrequency: number;
  longestStreak: number;
  totalDreamingDays: number;
  monthlyAverage: number;
}

interface DreamAnalytics {
  patterns: DreamPattern[];
  emotions: EmotionalInsight[];
  timeAnalysis: TimeAnalysis;
  personalInsights: string;
  mentalStateAnalysis: string;
  recommendedActions: string[];
  overallWellbeingScore: number;
}

type DreamWithRelations = Dream & {
  symbols: Symbol[];
  themes: Theme[];
  emotions: Emotion[];
  metrics: {
    id: string;
    dreamId: string;
    clarity: number;
    vividness: number;
    lucidity: number;
    recall: number;
    impact: number;
  } | null;
};

export async function analyzeDreams(userId: string): Promise<DreamAnalytics> {
  // Get all dreams with their relationships
  const dreams = await db.dream.findMany({
    where: { userId },
    include: {
      symbols: true,
      themes: true,
      emotions: true,
      metrics: true
    },
    orderBy: { createdAt: 'desc' }
  }) as DreamWithRelations[];

  // Get the latest dream analysis
  const latestDream = dreams[0];
  const analysis = latestDream ? parseAnalysis(latestDream.analysis as string) : null;

  // Convert patterns from analysis to DreamPattern format
  const patterns: DreamPattern[] = analysis?.patterns.map(pattern => ({
    pattern: pattern.type,
    frequency: pattern.confidence * 100,
    description: pattern.description,
    significance: `This pattern involves ${pattern.elements.join(', ')}`,
    recommendations: pattern.elements.map(element => `Pay attention to ${element} in future dreams`)
  })) || [];

  // Convert emotions from analysis to EmotionalInsight format
  const emotions: EmotionalInsight[] = analysis?.emotions.map(emotion => ({
    emotion: emotion.name,
    frequency: emotion.intensity * 100,
    intensity: emotion.intensity * 100,
    trend: emotion.valence > 0 ? 'increasing' : emotion.valence < 0 ? 'decreasing' : 'stable',
    impact: `Triggered by: ${emotion.triggers.join(', ')}`,
    suggestions: emotion.triggers.map(trigger => `Be mindful of situations involving ${trigger}`)
  })) || [];

  // Calculate time analysis
  const timeAnalysis = calculateTimeAnalysis(dreams);

  // Generate personal insights based on analysis
  const personalInsights = analysis?.psychologicalInsights
    .map(insight => `${insight.title}: ${insight.description}`)
    .join(' ') || '';

  // Analyze mental state
  const mentalStateAnalysis = analysis?.mentalState ? JSON.stringify({
    overallMood: analysis.mentalState.moodScore > 7 ? 'Positive' : 
                 analysis.mentalState.moodScore > 4 ? 'Neutral' : 'Challenging',
    stressAndAnxietyLevels: `Stress: ${analysis.mentalState.stressLevel}/10, Anxiety: ${analysis.mentalState.anxietyLevel}/10`,
    dominantEmotions: analysis.mentalState.dominantEmotions,
    emotionalInsights: analysis.mentalState.notes
  }) : '';

  // Generate recommended actions
  const recommendedActions = analysis?.psychologicalInsights
    .filter(insight => insight.actionable)
    .map(insight => insight.recommendation || '')
    .filter(Boolean) || [];

  // Calculate overall wellbeing score
  const overallWellbeingScore = analysis ? calculateWellbeingScore(analysis) : 50;

  return {
    patterns,
    emotions,
    timeAnalysis,
    personalInsights,
    mentalStateAnalysis,
    recommendedActions,
    overallWellbeingScore
  };
}

function calculateTimeAnalysis(dreams: DreamWithRelations[]): TimeAnalysis {
  if (dreams.length === 0) {
    return {
      mostActiveTime: 'N/A',
      dreamFrequency: 0,
      longestStreak: 0,
      totalDreamingDays: 0,
      monthlyAverage: 0
    };
  }

  // Create a map to track dreams per hour
  const hourCounts = new Map<number, number>();
  // Create a map to track dreams per day for streak calculation
  const dreamsByDate = new Map<string, number>();
  
  dreams.forEach(dream => {
    const date = new Date(dream.createdAt);
    const hour = date.getHours();
    const dateStr = date.toISOString().split('T')[0];
    
    // Count dreams per hour
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    // Count dreams per day
    dreamsByDate.set(dateStr, (dreamsByDate.get(dateStr) || 0) + 1);
  });

  // Find most active hour
  let maxHour = 0;
  let maxCount = 0;
  hourCounts.forEach((count, hour) => {
    if (count > maxCount) {
      maxCount = count;
      maxHour = hour;
    }
  });

  // Calculate longest streak
  const dates = Array.from(dreamsByDate.keys()).sort();
  let longestStreak = 0;
  let currentStreak = 0;
  let lastDate: Date | null = null;

  dates.forEach(dateStr => {
    const currentDate = new Date(dateStr);
    if (!lastDate) {
      currentStreak = 1;
    } else {
      const dayDiff = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (dayDiff === 1) {
        currentStreak++;
      } else {
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreak = 1;
      }
    }
    lastDate = currentDate;
  });
  longestStreak = Math.max(longestStreak, currentStreak);

  // Calculate monthly average
  const firstDream = new Date(dates[0]);
  const lastDream = new Date(dates[dates.length - 1]);
  const monthsDiff = (lastDream.getTime() - firstDream.getTime()) / (1000 * 60 * 60 * 24 * 30.44); // Average month length
  const monthlyAverage = monthsDiff > 0 ? dreams.length / monthsDiff : dreams.length;

  // Format most active time
  const hour = maxHour;
  const mostActiveTime = hour === 0 ? '12 AM' : 
                        hour < 12 ? `${hour} AM` : 
                        hour === 12 ? '12 PM' : 
                        `${hour - 12} PM`;

  return {
    mostActiveTime,
    dreamFrequency: dreams.length / Math.max(monthsDiff, 1),
    longestStreak,
    totalDreamingDays: dreamsByDate.size,
    monthlyAverage: Number(monthlyAverage.toFixed(1))
  };
}

function calculateWellbeingScore(analysis: DreamAnalysis): number {
  let score = 50; // Base score

  // Adjust based on mental state
  score += (10 - analysis.mentalState.stressLevel) * 2; // Lower stress is better
  score += (10 - analysis.mentalState.anxietyLevel) * 2; // Lower anxiety is better
  score += analysis.mentalState.moodScore * 2; // Higher mood is better

  // Adjust based on emotional balance
  const positiveEmotions = analysis.emotions.filter(e => e.valence > 0).length;
  const totalEmotions = analysis.emotions.length;
  if (totalEmotions > 0) {
    score += (positiveEmotions / totalEmotions) * 20;
  }

  // Adjust based on insights
  const actionableInsights = analysis.psychologicalInsights.filter(i => i.actionable).length;
  score += actionableInsights * 2;

  return Math.min(100, Math.max(0, Math.round(score)));
}

async function analyzePatterns(
  dreams: DreamWithRelations[],
  symbolCounts: Map<string, number>
): Promise<DreamPattern[]> {
  const prompt = `Analyze these dream symbols and their frequencies:
${Array.from(symbolCounts.entries())
  .map(([symbol, count]) => `${symbol}: ${count} times`)
  .join('\n')}

Based on this data, identify the top 5 most significant dream patterns. For each pattern:
1. Name the pattern
2. Describe its significance
3. Explain its psychological meaning
4. Suggest recommendations for personal growth

Format as JSON array of objects with properties: pattern, frequency, description, significance, recommendations`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  return JSON.parse(completion.choices[0].message.content!).patterns;
}

async function analyzeEmotions(
  dreams: DreamWithRelations[],
  emotionCounts: Map<string, number>
): Promise<EmotionalInsight[]> {
  const prompt = `Analyze these emotions and their frequencies in dreams:
${Array.from(emotionCounts.entries())
  .map(([emotion, count]) => `${emotion}: ${count} times`)
  .join('\n')}

Based on this data, identify the most significant emotional patterns. For each emotion:
1. Determine its trend (increasing/decreasing/stable)
2. Assess its impact on wellbeing
3. Suggest ways to work with this emotion

Format as JSON array of objects with properties: emotion, frequency, trend, impact, suggestions`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  return JSON.parse(completion.choices[0].message.content!).emotions;
} 