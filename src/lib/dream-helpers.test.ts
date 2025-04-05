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
});
