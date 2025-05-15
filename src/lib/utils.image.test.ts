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

  it('keeps http and data urls', () => {
    expect(getImageUrl('https://example.com/a.png')).toBe('https://example.com/a.png');
    expect(getImageUrl('data:image/png;base64,AAAA')).toBe('data:image/png;base64,AAAA');
  });

  it('looks up bare file names in uploads', () => {
    expect(getImageUrl('abc.png')).toBe('/uploads/abc.png');
  });

  it('reads the base url from the environment', () => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://dreams.example';
    expect(getBaseUrl()).toBe('https://dreams.example');
  });
});
