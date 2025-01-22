import { db } from '@/lib/prisma';
import OpenAI from 'openai';
import { Dream, Symbol, Theme, Emotion } from '@prisma/client';

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
  frequency: number;
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

interface CachedAnalytics extends DreamAnalytics {
  userId: string;
  lastUpdated: Date;
  dreamCount: number;
}

interface DreamWithRelations extends Dream {
  symbols: Symbol[];
  themes: Theme[];
  emotions: Emotion[];
}

export async function analyzeDreams(userId: string): Promise<DreamAnalytics> {
  // Check for cached analytics
  const cachedAnalytics = await db.dreamAnalytics.findUnique({
    where: { userId }
  });

  const totalDreams = await db.dream.count({
    where: { userId }
  });

  // If we have cached analytics and no new dreams since last update, return cached
  if (cachedAnalytics && cachedAnalytics.dreamCount === totalDreams) {
    const {
      userId: _,
      lastUpdated: __,
      dreamCount: ___,
      ...analytics
    } = cachedAnalytics;
    
    return {
      ...analytics,
      patterns: JSON.parse(analytics.patterns as string),
      emotions: JSON.parse(analytics.emotions as string),
      timeAnalysis: JSON.parse(analytics.timeAnalysis as string),
      recommendedActions: JSON.parse(analytics.recommendedActions as string)
    };
  }

  // Fetch all dreams with their relationships
  const dreams = await db.dream.findMany({
    where: { userId },
    include: {
      symbols: true,
      themes: true,
      emotions: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  // Calculate time-based analytics
  const timeAnalysis = calculateTimeAnalysis(dreams);

  // Extract patterns and emotions
  const { patterns, emotions } = await extractPatternsAndEmotions(dreams);

  // Generate personal insights using OpenAI
  const insights = await generatePersonalInsights(dreams);

  const analytics: DreamAnalytics = {
    patterns,
    emotions,
    timeAnalysis,
    personalInsights: JSON.stringify(insights.personalInsights),
    mentalStateAnalysis: JSON.stringify(insights.mentalStateAnalysis),
    recommendedActions: insights.recommendedActions,
    overallWellbeingScore: calculateWellbeingScore(patterns, emotions, timeAnalysis)
  };

  // Cache the analytics
  await db.dreamAnalytics.upsert({
    where: { userId },
    create: {
      userId,
      patterns: JSON.stringify(patterns),
      emotions: JSON.stringify(emotions),
      timeAnalysis: JSON.stringify(timeAnalysis),
      personalInsights: JSON.stringify(insights.personalInsights),
      mentalStateAnalysis: JSON.stringify(insights.mentalStateAnalysis),
      recommendedActions: JSON.stringify(insights.recommendedActions),
      lastUpdated: new Date(),
      dreamCount: totalDreams,
      overallWellbeingScore: calculateWellbeingScore(patterns, emotions, timeAnalysis)
    },
    update: {
      patterns: JSON.stringify(patterns),
      emotions: JSON.stringify(emotions),
      timeAnalysis: JSON.stringify(timeAnalysis),
      personalInsights: JSON.stringify(insights.personalInsights),
      mentalStateAnalysis: JSON.stringify(insights.mentalStateAnalysis),
      recommendedActions: JSON.stringify(insights.recommendedActions),
      lastUpdated: new Date(),
      dreamCount: totalDreams,
      overallWellbeingScore: calculateWellbeingScore(patterns, emotions, timeAnalysis)
    }
  });

  return analytics;
}

function calculateTimeAnalysis(dreams: DreamWithRelations[]): TimeAnalysis {
  const dates = dreams.map(dream => new Date(dream.createdAt));
  const timeMap = new Map<string, number>();
  let longestStreak = 0;
  let currentStreak = 0;
  let lastStreakDate: Date | null = null;

  // Calculate streaks and most active time
  dates.forEach(date => {
    const hour = date.getHours();
    const timeSlot = getTimeSlot(hour);
    timeMap.set(timeSlot, (timeMap.get(timeSlot) || 0) + 1);

    if (lastStreakDate) {
      const dayDiff = Math.floor((lastStreakDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (dayDiff === 1) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    lastStreakDate = date;
  });

  const mostActiveTime = Array.from(timeMap.entries())
    .sort((a, b) => b[1] - a[1])[0][0];

  const earliestDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const latestDate = new Date(Math.max(...dates.map(d => d.getTime())));
  const totalDays = Math.floor((latestDate.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24));
  const monthlyAverage = (dreams.length / totalDays) * 30;

  return {
    mostActiveTime,
    dreamFrequency: dreams.length / totalDays,
    longestStreak,
    totalDreamingDays: new Set(dates.map(d => d.toDateString())).size,
    monthlyAverage
  };
}

async function extractPatternsAndEmotions(dreams: DreamWithRelations[]): Promise<{
  patterns: DreamPattern[];
  emotions: EmotionalInsight[];
}> {
  const symbolCounts = new Map<string, number>();
  const emotionCounts = new Map<string, number>();

  dreams.forEach(dream => {
    dream.symbols.forEach(symbol => {
      symbolCounts.set(symbol.name, (symbolCounts.get(symbol.name) || 0) + 1);
    });
    dream.emotions.forEach(emotion => {
      emotionCounts.set(emotion.name, (emotionCounts.get(emotion.name) || 0) + 1);
    });
  });

  // Use OpenAI to analyze patterns
  const patterns = await analyzePatterns(dreams, symbolCounts);
  const emotions = await analyzeEmotions(dreams, emotionCounts);

  return { patterns, emotions };
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

Based on this data, identify the top 5 most significant emotional patterns. For each emotion:
1. Analyze its frequency and impact
2. Determine if it's increasing, decreasing, or stable
3. Explain its psychological significance
4. Provide suggestions for emotional well-being

Format as JSON array of objects with properties: emotion, frequency, trend, impact, suggestions`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  return JSON.parse(completion.choices[0].message.content!).emotions;
}

async function generatePersonalInsights(dreams: DreamWithRelations[]) {
  const recentDreams = dreams.slice(0, 5).map(dream => ({
    content: dream.content,
    analysis: dream.analysis,
    symbols: dream.symbols.map(s => s.name),
    emotions: dream.emotions.map(e => e.name)
  }));

  const prompt = `Based on these recent dreams and their analyses:
${JSON.stringify(recentDreams, null, 2)}

Provide:
1. A comprehensive analysis of the current mental state
2. Personal growth insights
3. Specific recommended actions for well-being

Format as JSON object with properties: mentalStateAnalysis, personalInsights, recommendedActions`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  return JSON.parse(completion.choices[0].message.content!);
}

function calculateWellbeingScore(
  patterns: DreamPattern[] | undefined,
  emotions: EmotionalInsight[] | undefined,
  timeAnalysis: TimeAnalysis | undefined
): number {
  if (!patterns?.length || !emotions?.length || !timeAnalysis) {
    return 50; // Default score when data is insufficient
  }

  // Calculate pattern score (30% of total)
  const patternScore = patterns.reduce((score, pattern) => {
    return score + (pattern.frequency / patterns.length);
  }, 0) * 30;

  // Calculate emotion score (40% of total)
  const emotionScore = emotions.reduce((score, emotion) => {
    const trendMultiplier = emotion.trend === 'increasing' ? 1.2 : 
                           emotion.trend === 'decreasing' ? 0.8 : 1;
    return score + ((emotion.frequency / emotions.length) * trendMultiplier);
  }, 0) * 40;

  // Calculate consistency score (30% of total)
  const consistencyScore = Math.min(
    (timeAnalysis.monthlyAverage / 30) * 100,
    (timeAnalysis.longestStreak / 30) * 100
  ) * 0.3;

  return Math.round(patternScore + emotionScore + consistencyScore);
}

function getTimeSlot(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Morning (5 AM - 12 PM)';
  if (hour >= 12 && hour < 17) return 'Afternoon (12 PM - 5 PM)';
  if (hour >= 17 && hour < 22) return 'Evening (5 PM - 10 PM)';
  return 'Night (10 PM - 5 AM)';
} 