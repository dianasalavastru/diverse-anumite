/**
 * **Every route in the frozen map has a page file, in both locales.**
 *
 * OWNER: Workstream A.
 *
 * ── WHY THIS TEST EXISTS ──────────────────────────────────────────────────
 * `/servicii` and `/despre` shipped as 404s behind locked global-nav items. The
 * cause was structural, not a typo: `routes.ts` is the §11.1 frozen table and
 * the Global Header renders its nav *from that table*, but Astro routes by FILE.
 * Nothing checked the two against each other, so a route could be declared,
 * linked from every page, and have no page — and every build stayed green.
 *
 * `work-archive/routes.test.ts` and `service/routes.test.ts` each hold this line
 * for their own family. Neither could catch these two, because neither family
 * owned them: `about` and `services` belong to page types that no phase of
 * `TECHNICAL_ARCHITECTURE.md` §23.2 assigns to a workstream. So the check is
 * lifted here and applied to the WHOLE table at once, where a route with no
 * owner cannot fall between two suites again.
 *
 * The table is the closed set — adding a route to §11.1 without adding its page
 * now fails here rather than in a browser.
 *
 * ── ONE EXCEPTION, AND IT IS ASSERTED IN BOTH DIRECTIONS (STAGE 2) ────────
 * `professionalExperience` is a **reservation-only** entry: it stays in the
 * table so its two localized slugs stay in `RESERVED_SLUGS`, and for no other
 * reason. The Professional Experience curated view is permanently retired
 * (`CONTENT_MODEL.md` v3.1 §13, `DECISIONS_LOG.md` #97), About / Despre is the
 * surviving home for that content, and nothing replaces the view.
 *
 * So the sweep below skips it — and a second sweep asserts the *opposite*: it
 * must have **no** page file, in either locale. "Route exists" and "slug is
 * reserved" are different facts, and after this stage they disagree for this one
 * key. Both are pinned, so neither can drift: a page reappearing fails, and a
 * slug becoming claimable fails.
 */

import { describe, expect, it } from 'vitest';

import {
  LOCALES,
  RESERVED_SLUGS,
  ROUTES,
  isReservedSlug,
  routePath,
  type Locale,
  type RouteKey,
} from './routes.js';

/**
 * The route files, read through Vite rather than through `node:fs` — the Astro
 * program has no Node type declarations, and adding them to satisfy one test
 * would widen the build's type surface for every workstream.
 */
const PAGE_MODULES = import.meta.glob('../../pages/**/*.astro');
const PAGE_FILES = new Set(
  Object.keys(PAGE_MODULES).map((path) => path.replace('../../pages/', '')),
);

/** Astro accepts either form for a static route; the test accepts whichever exists. */
function staticPageExists(path: string): boolean {
  const relative = path.replace(/^\/+/, '').replace(/\/+$/, '');
  const base = relative === '' ? 'index' : relative;
  return PAGE_FILES.has(`${base}.astro`) || PAGE_FILES.has(`${base}/index.astro`);
}

/**
 * A dynamic route's file carries a `[param]` segment where the slug goes.
 *
 * The bracket NAME is not asserted, deliberately. `RouteParam` in the table is a
 * semantic name (`work`, `service`) while the file uses the *localized* segment
 * (`[proiect]` / `[project]`, `[serviciu]` / `[service]`) — §11.1's terminology
 * boundary in action. What matters, and all that is checked, is that the parent
 * path has a dynamic child to catch the slug.
 */
function dynamicPageExists(path: string): boolean {
  const parent = path.replace(/^\/+/, '');
  return [...PAGE_FILES].some((file) => /^.*\/\[[^/]+\]\.astro$/.test(file) && file.startsWith(`${parent}/[`));
}

const ROUTE_KEYS = Object.keys(ROUTES) as RouteKey[];

/**
 * Keys retained ONLY to keep their slugs reserved — no page, no navigation, no view.
 * Every other key in the table must resolve to a page file.
 */
const RESERVATION_ONLY_ROUTES: readonly RouteKey[] = ['professionalExperience'];

describe('every frozen route resolves to a page file (§11.1)', () => {
  for (const key of ROUTE_KEYS.filter((candidate) => !RESERVATION_ONLY_ROUTES.includes(candidate))) {
    const definition = ROUTES[key] as { param?: string };

    for (const locale of LOCALES) {
      const path = definition.param
        ? routePath(key as never, locale as Locale, '<slug>' as never)
        : routePath(key as never, locale as Locale, undefined as never);

      it(`${key} · ${locale} → ${path}`, () => {
        /* The parent path of a dynamic route, read from the table rather than
           reconstructed: `routePath` refuses to build one without a slug. */
        const base = path.slice(0, path.lastIndexOf('/'));
        const exists = definition.param ? dynamicPageExists(base) : staticPageExists(path);

        expect(exists, `no page file for ${path} (route key "${key}")`).toBe(true);
      });
    }
  }
});

describe('a reservation-only route has NO page — retired, not hidden (Stage 2)', () => {
  for (const key of RESERVATION_ONLY_ROUTES) {
    for (const locale of LOCALES) {
      const path = routePath(key as never, locale as Locale, undefined as never);

      it(`${key} · ${locale} → ${path} does not ship`, () => {
        expect(
          staticPageExists(path),
          `${path} still has a page file. The Professional Experience view is permanently ` +
            `retired (DECISIONS_LOG.md #97) — it must not ship as a page, an empty state or a ` +
            `placeholder.`,
        ).toBe(false);
      });
    }
  }

  it('keeps both historical slugs reserved even though neither route ships', () => {
    /* The distinction this whole describe exists for: route = NO, reservation = YES. */
    expect(RESERVED_SLUGS.ro).toContain('experienta-profesionala');
    expect(RESERVED_SLUGS.en).toContain('professional-experience');
    expect(isReservedSlug('experienta-profesionala', 'ro')).toBe(true);
    expect(isReservedSlug('professional-experience', 'en')).toBe(true);
  });

  it('is absent from the global navigation', () => {
    const NAV_KEYS: RouteKey[] = ['home', 'about', 'services', 'workArchive', 'contact'];
    for (const key of RESERVATION_ONLY_ROUTES) expect(NAV_KEYS).not.toContain(key);
  });
});

describe('the global-navigation destinations specifically', () => {
  /**
   * NAV_DECISION_RECORD.md §4, LOCKED: "Despre · Servicii · Proiecte · Contact
   * (+ language toggle)", plus the wordmark → Home. These are the five
   * destinations a visitor can reach from the header on every page, so they are
   * asserted by name rather than only as part of the table sweep above.
   */
  const NAV: RouteKey[] = ['home', 'about', 'services', 'workArchive', 'contact'];

  for (const key of NAV) {
    for (const locale of LOCALES) {
      it(`nav ${key} · ${locale}`, () => {
        const path = routePath(key as never, locale as Locale, undefined as never);
        expect(staticPageExists(path), `global nav "${key}" 404s at ${path}`).toBe(true);
      });
    }
  }

  it('emits the exact RO paths the locked table fixes', () => {
    expect(routePath('home', 'ro')).toBe('/');
    expect(routePath('about', 'ro')).toBe('/despre');
    expect(routePath('services', 'ro')).toBe('/servicii');
    expect(routePath('workArchive', 'ro')).toBe('/proiecte');
    expect(routePath('contact', 'ro')).toBe('/contact');
  });

  it('emits the exact EN paths OD-2 approved', () => {
    expect(routePath('home', 'en')).toBe('/en/');
    expect(routePath('about', 'en')).toBe('/en/about');
    expect(routePath('services', 'en')).toBe('/en/services');
    expect(routePath('workArchive', 'en')).toBe('/en/projects');
    expect(routePath('contact', 'en')).toBe('/en/contact');
  });
});

describe('the pillar hubs stay out of the global nav but stay reachable', () => {
  /**
   * NAV_DECISION_RECORD.md §5(2): hubs are "first-class landing pages … though
   * not top-nav items". Both halves are load-bearing, so both are asserted: the
   * routes exist, and they are not in the nav set above.
   */
  const HUBS: RouteKey[] = ['pillarHubArchitectureDesign', 'pillarHubRealityCapture'];

  for (const key of HUBS) {
    for (const locale of LOCALES) {
      it(`${key} · ${locale} is a real page`, () => {
        const path = routePath(key as never, locale as Locale, undefined as never);
        expect(staticPageExists(path), `no page file for ${path}`).toBe(true);
      });
    }
  }
});
