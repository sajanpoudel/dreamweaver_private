import { describe, expect, it } from 'vitest';
import {
  analyzePatterns,
  calculateDreamFrequency,
  determineEmotionCategory,
  extractCommonElements,
  hasCommonElements,
  overlapRatio,
} from './dream-helpers';

describe('dream-helpers', () => {
  it('is the shared share of the larger list', () => {
    expect(overlapRatio(2, 4, 3)).toBe(0.5);
  });

  it('is zero when both lists are empty', () => {
    expect(overlapRatio(0, 0, 0)).toBe(0);
  });

  it('is one for identical lists', () => {
    expect(overlapRatio(3, 3, 3)).toBe(1);
  });

  it('is zero when nothing is shared', () => {
    expect(overlapRatio(0, 2, 5)).toBe(0);
  });

  it('names the six basic emotions primary', () => {
    for (const emotion of ['joy', 'sadness', 'anger', 'fear', 'disgust', 'surprise']) {
      expect(determineEmotionCategory(emotion)).toBe('primary');
    }
  });

  it('names shame, guilt, pride, anxiety and hope secondary', () => {
    for (const emotion of ['shame', 'guilt', 'pride', 'anxiety', 'hope']) {
      expect(determineEmotionCategory(emotion)).toBe('secondary');
    }
  });

  it('treats other emotions as complex', () => {
    expect(determineEmotionCategory('nostalgia')).toBe('complex');
  });

  it('ignores case', () => {
    expect(determineEmotionCategory('JOY')).toBe('primary');
    expect(determineEmotionCategory('Guilt')).toBe('secondary');
  });

  it('counts how often each name appears', () => {
    const result = extractCommonElements([{ name: 'a' }, { name: 'b' }, { name: 'a' }]);
    expect(result).toEqual([
      { name: 'a', count: 2 },
      { name: 'b', count: 1 },
    ]);
  });

  it('sorts by count and keeps the top five', () => {
    const names = ['a', 'b', 'b', 'c', 'c', 'c', 'd', 'e', 'f', 'f', 'f', 'f'];
    const result = extractCommonElements(names.map((name) => ({ name })));
    expect(result.map((r) => r.name)).toEqual(['f', 'c', 'b', 'a', 'd']);
  });

  it('returns nothing for no items', () => {
    expect(extractCommonElements([])).toEqual([]);
  });

  it('finds a shared element in an array', () => {
    expect(hasCommonElements(['a', 'b'], ['b', 'c'])).toBe(true);
  });

  it('returns false when nothing is shared', () => {
    expect(hasCommonElements(['a'], ['b'])).toBe(false);
  });

  it('reads a JSON string of elements', () => {
    expect(hasCommonElements(['a'], '["a","z"]')).toBe(true);
  });

  it('needs at least two dreams', () => {
    expect(calculateDreamFrequency([])).toEqual({ averageDreamsPerWeek: 0, trend: 'stable' });
    expect(calculateDreamFrequency([{ createdAt: new Date() }])).toEqual({
      averageDreamsPerWeek: 0,
      trend: 'stable',
    });
  });

  it('computes dreams per week over the time span', () => {
    const day = 24 * 60 * 60 * 1000;
    const start = new Date('2025-01-29T00:00:00Z').getTime();
    // newest first, one dream every day for 7 days
    const dreams = [6, 5, 4, 3, 2, 1, 0].map((i) => ({ createdAt: new Date(start + i * day) }));
    const result = calculateDreamFrequency(dreams);
    expect(result.averageDreamsPerWeek).toBeCloseTo((7 / 6) * 7, 5);
  });

  it('creates a pattern for every name', () => {
    const patterns = analyzePatterns([[{ name: 'water' }], [{ name: 'flying' }]]);
    expect(Object.keys(patterns).sort()).toEqual(['flying', 'water']);
  });

  it('counts repeated names as occurrences', () => {
    const patterns = analyzePatterns([[{ name: 'water' }], [{ name: 'water' }], [{ name: 'water' }]]);
    expect(patterns.water.occurrences).toBe(3);
    expect(patterns.water.frequency).toBe(1);
  });
});
