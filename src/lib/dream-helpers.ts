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
