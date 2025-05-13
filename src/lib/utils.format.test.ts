import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { formatDate, getBaseUrl, getImageUrl } from './utils';

const NOW = new Date('2025-06-15T12:00:00Z');
const ago = (seconds: number) => new Date(NOW.getTime() - seconds * 1000);

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('formatDate', () => {
  it('says just now for the last minute', () => {
    expect(formatDate(ago(5))).toBe('just now');
    expect(formatDate(ago(59))).toBe('just now');
  });

  it('counts minutes up to an hour', () => {
    expect(formatDate(ago(60))).toBe('1m ago');
    expect(formatDate(ago(59 * 60))).toBe('59m ago');
  });

  it('counts hours up to a day', () => {
    expect(formatDate(ago(3600))).toBe('1h ago');
    expect(formatDate(ago(23 * 3600))).toBe('23h ago');
  });

  it('counts days up to thirty', () => {
    expect(formatDate(ago(86400))).toBe('1d ago');
    expect(formatDate(ago(29 * 86400))).toBe('29d ago');
  });

  it('shows month and day for older dates in the same year', () => {
    expect(formatDate(new Date('2025-03-05T12:00:00Z'))).toMatch(/^Mar 5$/);
  });

  it('adds the year for dates in other years', () => {
    expect(formatDate(new Date('2024-03-05T12:00:00Z'))).toBe('Mar 5, 2024');
  });
});
