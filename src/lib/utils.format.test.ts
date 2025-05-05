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
});
