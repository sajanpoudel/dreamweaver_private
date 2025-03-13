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
});
