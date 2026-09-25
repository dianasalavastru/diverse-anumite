/**
 * Locale publication — EN is WITHHELD for the initial launch (RO-only).
 *
 * The first assertion PINS the launch decision: publishing EN again is a deliberate edit to
 * `publication.ts` and to this line, never a side effect. Everything else proves the functions
 * behave correctly for BOTH states, so the reversal is known to work before it is made.
 */
import { describe, expect, it } from 'vitest';

import {
  PUBLISHED_LOCALES,
  isLocalePublished,
  publishedHreflangAlternates,
  withheldLocaleResponse,
} from './publication';
import { DEFAULT_LOCALE, LOCALES, hreflangAlternates, type Locale } from './routes';

const BOTH: readonly Locale[] = ['ro', 'en'];

describe('launch state: RO only, EN withheld', () => {
  it('publishes exactly RO', () => {
    expect([...PUBLISHED_LOCALES]).toEqual(['ro']);
  });

  it('always publishes the default locale', () => {
    expect(PUBLISHED_LOCALES).toContain(DEFAULT_LOCALE);
  });

  it('keeps EN as a SUPPORTED locale — withheld, not removed', () => {
    expect([...LOCALES]).toEqual(['ro', 'en']);
  });
});

describe('isLocalePublished', () => {
  it('reads the launch flag by default', () => {
    expect(isLocalePublished('ro')).toBe(true);
    expect(isLocalePublished('en')).toBe(false);
  });

  it('publishes both once the flag includes EN', () => {
    expect(isLocalePublished('ro', BOTH)).toBe(true);
    expect(isLocalePublished('en', BOTH)).toBe(true);
  });
});

describe('withheldLocaleResponse', () => {
  it('is an empty 404 for a withheld locale — Astro writes no file for it', () => {
    const response = withheldLocaleResponse('en');
    expect(response).not.toBeNull();
    expect(response?.status).toBe(404);
    expect(response?.body).toBeNull();
  });

  it('is null (render normally) for a published locale', () => {
    expect(withheldLocaleResponse('ro')).toBeNull();
    expect(withheldLocaleResponse('en', BOTH)).toBeNull();
  });
});

describe('publishedHreflangAlternates', () => {
  it('emits nothing while EN is withheld, even for a static route', () => {
    expect(publishedHreflangAlternates('workArchive')).toEqual([]);
    expect(publishedHreflangAlternates('workEntry', { ro: 'a', en: 'b' })).toEqual([]);
  });

  it('restores the full reciprocal set once EN is published', () => {
    expect(publishedHreflangAlternates('workArchive', undefined, BOTH)).toEqual(
      hreflangAlternates('workArchive'),
    );
    expect(publishedHreflangAlternates('workArchive', undefined, BOTH)).toHaveLength(3);
  });

  it('keeps the per-entity rule once EN is published: no EN slug, no pair', () => {
    expect(publishedHreflangAlternates('workEntry', { ro: 'a' }, BOTH)).toEqual([]);
  });
});
