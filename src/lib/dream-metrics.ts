import { db } from './prisma';  
import type { Dream, User, Prisma } from '@prisma/client';

interface MetricsAnalysis {
  correlations: {
    sleepQuality: number;
    stressLevel: number;
    physicalHealth: number;
    dailyActivities: Array<{ activity: string; correlation: number }>;
  };
  patterns: {
    timeOfDay: Array<{ hour: number; frequency: number }>;
    dayOfWeek: Array<{ day: string; frequency: number }>;
    seasonality: Array<{ month: string; frequency: number }>;
  };
  trends: {
    recallQuality: 'improving' | 'declining' | 'stable';
    emotionalIntensity: 'increasing' | 'decreasing' | 'stable';
    lucidity: 'increasing' | 'decreasing' | 'stable';
  };
}

export async function analyzeDreamMetrics(userId: string, timeRange: string = 'last_month'): Promise<MetricsAnalysis> {
  // Get user's dream and status data
  const [dreams, statusHistory, sleepData] = await Promise.all([
    getDreamData(userId, timeRange),
    getStatusHistory(userId, timeRange),
    getSleepData(userId, timeRange)
  ]);

  // Calculate correlations
  const correlations = await calculateCorrelations(userId, dreams, statusHistory, sleepData);
  
  // Analyze patterns
  const patterns = analyzePatterns(dreams);
  
  // Calculate trends
  const trends = calculateTrends(dreams);

  // Store correlations for future reference
  await storeCorrelations(userId, correlations, dreams.length);

  return {
    correlations,
    patterns,
    trends
  };
}

async function getDreamData(userId: string, timeRange: string) {
  const startDate = getTimeRangeDate(timeRange);
  return prisma.dream.findMany({
    where: {
      userId,
      createdAt: { gte: startDate }
    },
    include: {
      metrics: true
    } as Prisma.DreamInclude,
    orderBy: { createdAt: 'desc' }
  });
}

async function getStatusHistory(userId: string, timeRange: string) {
  const startDate = getTimeRangeDate(timeRange);
  return prisma.userStatus.findMany({
    where: {
      userId,
      timestamp: { gte: startDate }
    },
    orderBy: { timestamp: 'desc' }
  });
}

async function getSleepData(userId: string, timeRange: string) {
  const startDate = getTimeRangeDate(timeRange);
  return prisma.sleepData.findMany({
    where: {
      userId,
      date: { gte: startDate }
    },
    orderBy: { date: 'desc' }
  });
}

function getTimeRangeDate(timeRange: string): Date {
  const now = new Date();
  switch (timeRange) {
    case 'last_week':
      return new Date(now.setDate(now.getDate() - 7));
    case 'last_month':
      return new Date(now.setMonth(now.getMonth() - 1));
    case 'last_year':
      return new Date(now.setFullYear(now.getFullYear() - 1));
    default:
      return new Date(now.setMonth(now.getMonth() - 1));
  }
}

async function calculateCorrelations(
  userId: string,
  dreams: (Dream & { metrics: { recallQuality: number; emotionalIntensity: number; vividness: number; } | null })[],
  statusHistory: { stressLevel: number; physicalHealth: number; dailyActivities: string[]; timestamp: Date; }[],
  sleepData: { quality: number; date: Date; }[]
) {
  // Calculate sleep quality correlation
  const sleepQuality = calculateCorrelation(
    dreams.map(d => d.metrics?.recallQuality || 0),
    sleepData.map(s => s.quality)
  );

  // Calculate stress level correlation
  const stressLevel = calculateCorrelation(
    dreams.map(d => d.metrics?.emotionalIntensity || 0),
    statusHistory.map(s => s.stressLevel)
  );

  // Calculate physical health correlation
  const physicalHealth = calculateCorrelation(
    dreams.map(d => d.metrics?.vividness || 0),
    statusHistory.map(s => s.physicalHealth)
  );

  // Analyze daily activities correlation
  const dailyActivities = analyzeDailyActivities(statusHistory, dreams);

  return {
    sleepQuality,
    stressLevel,
    physicalHealth,
    dailyActivities
  };
}

function calculateCorrelation(array1: number[], array2: number[]): number {
  // Pearson correlation coefficient calculation
  const n = Math.min(array1.length, array2.length);
  if (n === 0) return 0;

  const array1Slice = array1.slice(0, n);
  const array2Slice = array2.slice(0, n);

  const sum1 = array1Slice.reduce((a, b) => a + b, 0);
  const sum2 = array2Slice.reduce((a, b) => a + b, 0);

  const mean1 = sum1 / n;
  const mean2 = sum2 / n;

  const variance1 = array1Slice.reduce((a, b) => a + Math.pow(b - mean1, 2), 0);
  const variance2 = array2Slice.reduce((a, b) => a + Math.pow(b - mean2, 2), 0);

  const covariance = array1Slice.reduce((a, b, i) => a + (b - mean1) * (array2Slice[i] - mean2), 0);

  if (variance1 === 0 || variance2 === 0) return 0;
  return covariance / Math.sqrt(variance1 * variance2);
}

function analyzeDailyActivities(
  statusHistory: { dailyActivities: string[]; timestamp: Date }[],
  dreams: { createdAt: Date }[]
) {
  const activities: Record<string, { total: number; dreamDays: number }> = {};

  statusHistory.forEach(status => {
    const dailyActivities = status.dailyActivities;
    const hadDream = dreams.some(dream => 
      isSameDay(new Date(dream.createdAt), new Date(status.timestamp))
    );

    dailyActivities.forEach(activity => {
      if (!activities[activity]) {
        activities[activity] = { total: 0, dreamDays: 0 };
      }
      activities[activity].total++;
      if (hadDream) activities[activity].dreamDays++;
    });
  });

  return Object.entries(activities)
    .map(([activity, stats]) => ({
      activity,
      correlation: stats.dreamDays / stats.total
    }))
    .sort((a, b) => b.correlation - a.correlation);
}

function analyzePatterns(dreams: { createdAt: Date }[]) {
  return {
    timeOfDay: analyzeTimeOfDay(dreams),
    dayOfWeek: analyzeDayOfWeek(dreams),
    seasonality: analyzeSeasonality(dreams)
  };
}

function calculateTrends(
  dreams: (Dream & { metrics: { recallQuality: number; emotionalIntensity: number; lucidity: number } | null })[]
): MetricsAnalysis['trends'] {
  return {
    recallQuality: calculateMetricTrend(dreams.map(d => d.metrics?.recallQuality || 0)),
    emotionalIntensity: calculateMetricTrend(dreams.map(d => d.metrics?.emotionalIntensity || 0)) as 'increasing' | 'decreasing' | 'stable',
    lucidity: calculateMetricTrend(dreams.map(d => d.metrics?.lucidity || 0)) as 'increasing' | 'decreasing' | 'stable'
  };
}

function calculateMetricTrend(values: number[]): 'improving' | 'declining' | 'stable' {
  if (values.length < 2) return 'stable';
  
  const trend = calculateCorrelation(values, values.map((_, i) => i));
  if (trend > 0.3) return 'improving';
  if (trend < -0.3) return 'declining';
  return 'stable';
}

async function storeCorrelations(userId: string, correlations: Partial<MetricsAnalysis['correlations']>, sampleSize: number) {
  const correlationEntries = Object.entries(correlations).filter(([key]) => 
    key !== 'dailyActivities' && typeof correlations[key as keyof typeof correlations] === 'number'
  ) as [string, number][];
  
  await Promise.all(
    correlationEntries.map(([factor, correlation]) =>
      prisma.dreamCorrelation.upsert({
        where: {
          userId_factor: {
            userId,
            factor
          }
        },
        update: {
          correlation,
          sampleSize,
          lastUpdated: new Date()
        },
        create: {
          userId,
          factor,
          correlation,
          sampleSize,
          confidence: calculateConfidence(sampleSize),
          timeRange: 'last_month'
        }
      })
    )
  );
}

function calculateConfidence(sampleSize: number): number {
  // Simple confidence calculation based on sample size
  return Math.min(sampleSize / 30, 1); // Max confidence at 30 samples
}

function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
}

function analyzeTimeOfDay(dreams: { createdAt: Date }[]) {
  const hourCounts: Record<number, number> = {};
  dreams.forEach(dream => {
    const hour = new Date(dream.createdAt).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });

  return Object.entries(hourCounts)
    .map(([hour, count]) => ({
      hour: parseInt(hour),
      frequency: count / dreams.length
    }))
    .sort((a, b) => a.hour - b.hour);
}

function analyzeDayOfWeek(dreams: { createdAt: Date }[]) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayCounts: Record<string, number> = {};
  
  dreams.forEach(dream => {
    const day = days[new Date(dream.createdAt).getDay()];
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  });

  return days.map(day => ({
    day,
    frequency: (dayCounts[day] || 0) / dreams.length
  }));
}

function analyzeSeasonality(dreams: { createdAt: Date }[]) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthCounts: Record<string, number> = {};
  
  dreams.forEach(dream => {
    const month = months[new Date(dream.createdAt).getMonth()];
    monthCounts[month] = (monthCounts[month] || 0) + 1;
  });

  return months.map(month => ({
    month,
    frequency: (monthCounts[month] || 0) / dreams.length
  }));
} 