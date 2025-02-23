/** Pure helpers used by the dream analysis. */

export function extractCommonElements<T extends { name: string }>(items: T[]) {
  const frequency = items.reduce(
    (acc, item) => {
      acc[item.name] = (acc[item.name] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));
}

export function determineEmotionCategory(emotion: string): 'primary' | 'secondary' | 'complex' {
  const primaryEmotions = ['joy', 'sadness', 'anger', 'fear', 'disgust', 'surprise'];
  const secondaryEmotions = ['shame', 'guilt', 'pride', 'anxiety', 'hope'];

  if (primaryEmotions.includes(emotion.toLowerCase())) return 'primary';
  if (secondaryEmotions.includes(emotion.toLowerCase())) return 'secondary';
  return 'complex';
}

export function hasCommonElements(arr1: string[], arr2: string[] | unknown): boolean {
  const arr2Strings = Array.isArray(arr2) ? arr2 : (JSON.parse(String(arr2)) as string[]);
  return arr1.some((el) => arr2Strings.includes(el));
}

export function calculateDreamFrequency(dreams: { createdAt: Date }[]): {
  averageDreamsPerWeek: number;
  trend: 'increasing' | 'decreasing' | 'stable';
} {
  if (dreams.length < 2) {
    return { averageDreamsPerWeek: 0, trend: 'stable' };
  }

  const timeSpanDays =
    (dreams[0].createdAt.getTime() - dreams[dreams.length - 1].createdAt.getTime()) /
    (1000 * 60 * 60 * 24);
  const averageDreamsPerWeek = (dreams.length / timeSpanDays) * 7;

  // Calculate trend by comparing recent frequency to overall average
  const halfwayPoint = Math.floor(dreams.length / 2);
  const recentDreams = dreams.slice(0, halfwayPoint);
  const olderDreams = dreams.slice(halfwayPoint);

  const recentTimeSpan =
    (recentDreams[0].createdAt.getTime() -
      recentDreams[recentDreams.length - 1].createdAt.getTime()) /
    (1000 * 60 * 60 * 24);
  const olderTimeSpan =
    (olderDreams[0].createdAt.getTime() - olderDreams[olderDreams.length - 1].createdAt.getTime()) /
    (1000 * 60 * 60 * 24);

  const recentFrequency = (recentDreams.length / recentTimeSpan) * 7;
  const olderFrequency = (olderDreams.length / olderTimeSpan) * 7;

  let trend: 'increasing' | 'decreasing' | 'stable';
  const difference = recentFrequency - olderFrequency;
  if (difference > 0.5) trend = 'increasing';
  else if (difference < -0.5) trend = 'decreasing';
  else trend = 'stable';

  return { averageDreamsPerWeek, trend };
}

export function analyzePatterns<T extends { name: string }>(items: T[][]) {
  const patterns: Record<
    string,
    {
      frequency: number;
      firstSeen: Date;
      lastSeen: Date;
      occurrences: number;
      trend: 'increasing' | 'decreasing' | 'stable';
    }
  > = {};

  items.forEach((itemGroup, index) => {
    itemGroup.forEach((item) => {
      if (!patterns[item.name]) {
        patterns[item.name] = {
          frequency: 1,
          firstSeen: new Date(),
          lastSeen: new Date(),
          occurrences: 1,
          trend: 'stable',
        };
      } else {
        patterns[item.name].occurrences++;
        patterns[item.name].frequency = patterns[item.name].occurrences / items.length;
        patterns[item.name].lastSeen = new Date();

        // Calculate trend based on recent occurrences
        const recentOccurrences = items
          .slice(Math.max(0, index - 3), index + 1)
          .filter((group) => group.some((i) => i.name === item.name)).length;
        const trend = recentOccurrences / 4; // Last 4 dreams
        patterns[item.name].trend =
          trend > 0.5 ? 'increasing' : trend < 0.25 ? 'decreasing' : 'stable';
      }
    });
  });

  return patterns;
}

/** Share of the larger list that two lists have in common. Two empty lists share nothing. */
export function overlapRatio(common: number, a: number, b: number): number {
  const largest = Math.max(a, b);
  return largest === 0 ? 0 : common / largest;
}
