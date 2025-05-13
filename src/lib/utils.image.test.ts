import { afterEach, describe, expect, it } from 'vitest';
import { getBaseUrl, getImageUrl } from './utils';

describe('getImageUrl and getBaseUrl', () => {
  it('uses the default avatar without a url', () => {
    expect(getImageUrl(null)).toBe('/images/default-avatar.png');
    expect(getImageUrl(undefined)).toBe('/images/default-avatar.png');
    expect(getImageUrl('')).toBe('/images/default-avatar.png');
  });

  it('keeps absolute paths', () => {
    expect(getImageUrl('/images/me.png')).toBe('/images/me.png');
  });
});
