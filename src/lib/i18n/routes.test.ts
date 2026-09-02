import { describe, expect, it } from 'vitest';

import {
  DEFAULT_LOCALE,
  LOCALES,
  RESERVED_SLUGS,
  ROUTES,
  counterpartPath,
  hreflangAlternates,
  isLocale,
  isReservedSlug,
  localePrefix,
  otherLocale,
  routePath,
  type RouteKey,
} from './routes';
import { PILLARS } from '../content';
import { pillarArchiveParam, pillarTopicParam } from './vocabulary';

/**
 * The frozen route contract, restated here independently of the implementation.
 * Copied from TECHNICAL_ARCHITECTURE.md §11.1 (owner-approved 2026-08-11,
 * OD-1/OD-2, DECISIONS_LOG.md #76-#77).
 *
 * This duplication is the point: if anyone edits the route map, this table has
 * to be edited too — which is the amendment §23.1 requires, not a silent change.
 * `[…]` marks a dynamic segment and is substituted with a fixture slug.
 */
const FROZEN_TABLE: ReadonlyArray<{
  key: RouteKey;
  slug?: string;
  ro: string;
  en: string;
}> = [
  { key: 'home', ro: '/', en: '/en/' },
  { key: 'about', ro: '/despre', en: '/en/about' },
  { key: 'services', ro: '/servicii', en: '/en/services' },
  {
    key: 'service',
    slug: 'scanare-3d',
    ro: '/servicii/scanare-3d',
    en: '/en/services/scanare-3d',
  },
  { key: 'workArchive', ro: '/proiecte', en: '/en/projects' },
  {
    key: 'workEntry',
    slug: 'casa-in-panta',
    ro: '/proiecte/casa-in-panta',
    en: '/en/projects/casa-in-panta',
  },
  { key: 'competitions', ro: '/proiecte/concursuri', en: '/en/projects/competitions' },
  {
    key: 'professionalExperience',
    ro: '/proiecte/experienta-profesionala',
    en: '/en/projects/professional-experience',
  },
  {
    key: 'pillarHubArchitectureDesign',
    ro: '/arhitectura-design',
    en: '/en/architecture-design',
  },
  { key: 'pillarHubRealityCapture', ro: '/reality-capture', en: '/en/reality-capture' },
  { key: 'contact', ro: '/contact', en: '/en/contact' },
];

describe('locale model (IA §2.2, DECISIONS_LOG #21)', () => {
  it('has exactly two locales, RO default', () => {
    expect([...LOCALES]).toEqual(['ro', 'en']);
    expect(DEFAULT_LOCALE).toBe('ro');
  });

  it('does not prefix the default locale and prefixes EN', () => {
    expect(localePrefix('ro')).toBe('');
    expect(localePrefix('en')).toBe('/en');
  });

  it('narrows unknown locale strings', () => {
    expect(isLocale('ro')).toBe(true);
    expect(isLocale('de')).toBe(false);
  });

  it('resolves the other locale', () => {
    expect(otherLocale('ro')).toBe('en');
    expect(otherLocale('en')).toBe('ro');
  });
});

describe('route map matches the frozen §11.1 table', () => {
  it.each(FROZEN_TABLE)('$key -> RO $ro / EN $en', ({ key, slug, ro, en }) => {
    // The cast keeps the table literal readable; runtime behaviour is what's under test.
    expect(routePath(key as never, 'ro', slug as never)).toBe(ro);
    expect(routePath(key as never, 'en', slug as never)).toBe(en);
  });

  it('covers every route key exactly once', () => {
    const keys = FROZEN_TABLE.map((row) => row.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toHaveLength(11);
  });

  it('keeps every path lowercase and hyphenated (IA §2.2)', () => {
    for (const row of FROZEN_TABLE) {
      expect(row.ro).toMatch(/^\/[a-z0-9\-/]*$/);
      expect(row.en).toMatch(/^\/[a-z0-9\-/]*$/);
    }
  });

  it('keeps content routes at two levels or fewer (IA §2.2)', () => {
    for (const row of FROZEN_TABLE) {
      const depth = row.ro.split('/').filter(Boolean).length;
      expect(depth).toBeLessThanOrEqual(2);
    }
  });

  it('keeps both pillar hubs at depth 1 (IA §2.1; DECISIONS_LOG #19-20, #76)', () => {
    for (const key of ['pillarHubArchitectureDesign', 'pillarHubRealityCapture'] as const) {
      expect(routePath(key, 'ro').split('/').filter(Boolean)).toHaveLength(1);
    }
  });

  it('throws rather than emitting a route with a missing slug', () => {
    expect(() => routePath('workEntry' as never, 'ro', undefined as never)).toThrow();
  });
});

describe('reserved slugs (IA §2.2 F4, §7.7, §11.1)', () => {
  it('reserves the curated-view slugs per locale', () => {
    expect([...RESERVED_SLUGS.ro]).toEqual(['concursuri', 'experienta-profesionala']);
    expect([...RESERVED_SLUGS.en]).toEqual(['competitions', 'professional-experience']);
  });

  it('is derived from the route map, not hand-maintained', () => {
    for (const locale of LOCALES) {
      for (const slug of RESERVED_SLUGS[locale]) {
        const curated = [
          routePath('competitions', locale),
          routePath('professionalExperience', locale),
        ];
        expect(curated.some((path) => path.endsWith(`/${slug}`))).toBe(true);
      }
    }
  });

  it('rejects a Work Entry slug that collides in either locale', () => {
    expect(isReservedSlug('concursuri', 'ro')).toBe(true);
    expect(isReservedSlug('competitions', 'en')).toBe(true);
    expect(isReservedSlug('casa-in-panta', 'ro')).toBe(false);
  });
});

describe('counterparts and hreflang (§11.2, §12)', () => {
  it('resolves a static route counterpart', () => {
    expect(counterpartPath('contact', 'en')).toBe('/en/contact');
    expect(counterpartPath('contact', 'ro')).toBe('/contact');
  });

  it('uses the counterpart locale own slug, never the RO slug (§7.1)', () => {
    expect(counterpartPath('workEntry', 'en', 'house-on-a-slope')).toBe(
      '/en/projects/house-on-a-slope',
    );
  });

  it('returns null for an untranslated entity rather than falling back to RO', () => {
    // §11.2 rule 2: RO content is never served under an EN URL.
    expect(counterpartPath('workEntry', 'en')).toBeNull();
  });

  it('emits reciprocal ro/en plus x-default -> RO when both exist', () => {
    expect(hreflangAlternates('workArchive')).toEqual([
      { hreflang: 'ro', path: '/proiecte' },
      { hreflang: 'en', path: '/en/projects' },
      { hreflang: 'x-default', path: '/proiecte' },
    ]);
  });

  it('emits nothing when the counterpart is missing (§11.2 rule 4)', () => {
    expect(hreflangAlternates('workEntry', { ro: 'casa-in-panta' })).toEqual([]);
  });

  it('emits a full set when both localized slugs exist', () => {
    expect(
      hreflangAlternates('workEntry', { ro: 'casa-in-panta', en: 'house-on-a-slope' }),
    ).toEqual([
      { hreflang: 'ro', path: '/proiecte/casa-in-panta' },
      { hreflang: 'en', path: '/en/projects/house-on-a-slope' },
      { hreflang: 'x-default', path: '/proiecte/casa-in-panta' },
    ]);
  });
});

/* -------------------------------------------------------------------------- */
/* The ASCII half of DECISIONS_LOG #103                                        */
/* -------------------------------------------------------------------------- */

/**
 * #103 amends OD-8: Romanian **editorial copy** carries diacritics, and Romanian **identifiers**
 * do not. The copy half needs no assertion — it is authored, and a wrong one is visible. The
 * identifier half does, and this is where it lives, because a URL that gains a `ș` is not a
 * cosmetic regression: `/arhitectura-design` is frozen by OD-1 (#76) and OD-2 (#77), and every
 * published link, every hreflang pair and every sitemap entry is built from this table.
 *
 * These assertions replace the single diacritics test that used to sit in
 * `components/pillar-hub/architecture-design-hub.test.ts` and enforced the rule on the wrong
 * side of the boundary — on one page's copy rather than on the identifiers. They landed in the
 * same change that removed it, so the ASCII rule was never unenforced.
 *
 * The Service-key and closed-vocabulary halves are asserted in `lib/content/requirements.test.ts`,
 * beside the vocabularies themselves; slug format is enforced at authoring time by
 * `validation.ts` and covered by `validation.test.ts`.
 */
describe('Identifiers stay ASCII (#103, amending OD-8)', () => {
  /** Lowercase, hyphenated, ASCII — IA §2.2, applied to every segment of every route. */
  const ROUTE_SEGMENT = /^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*)?$/;

  it('emits no diacritic in any route path, in either locale', () => {
    for (const key of Object.keys(ROUTES) as RouteKey[]) {
      for (const locale of LOCALES) {
        const path = ROUTES[key].path[locale];
        expect(path, `${key}.${locale}`).not.toMatch(/[^\u0000-\u007F]/);
        expect(path, `${key}.${locale}`).toMatch(ROUTE_SEGMENT);
      }
    }
  });

  /**
   * The reserved-slug list is generated from the route table, so it inherits the rule — asserted
   * anyway, because it is what the CMS validator compares authored slugs against (§7.7).
   */
  it('reserves only ASCII slugs', () => {
    for (const locale of LOCALES) {
      for (const slug of RESERVED_SLUGS[locale]) {
        expect(slug, `${locale}/${slug}`).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      }
    }
  });

  /**
   * The two derived query tokens. `pillarTopicParam` reads the route table and `pillarArchiveParam`
   * reads its own declaration; both are public URL surface, and neither may pick up a diacritic
   * from a Pillar's display label.
   */
  it('derives ASCII query tokens for every Pillar', () => {
    for (const pillar of PILLARS) {
      expect(pillarArchiveParam(pillar), pillar).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      for (const locale of LOCALES) {
        expect(pillarTopicParam(pillar, locale), `${pillar}.${locale}`).toMatch(
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        );
      }
    }
  });
});
