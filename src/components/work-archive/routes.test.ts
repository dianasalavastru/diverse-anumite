/**
 * The archive family's routes exist where the frozen route map says they do.
 *
 * OWNER: Workstream A.
 *
 * Astro routes by FILE PATH; the contract is a TABLE (§11.1, frozen by OD-1 and
 * OD-2, and "the single source read by the router, the CMS reserved-slug
 * validator, the hreflang emitter, and the sitemap"). Nothing in the framework
 * checks the two against each other — a page file could be moved or a segment
 * mistyped and the build would still succeed, silently emitting a URL the route
 * map does not know and the reserved-slug validator does not protect.
 *
 * This closes that gap for the four archive-family routes. It also holds the
 * reserved-slug guarantee from the other side: `RESERVED_SLUGS` is generated
 * from the same table, so a curated route whose page file does not exist would
 * reserve a slug for a 404, and one whose file exists off-table would occupy a
 * slug nothing reserves.
 */

import { describe, expect, it } from 'vitest';

import { LOCALES, RESERVED_SLUGS, routePath, type Locale, type RouteKey } from '../../lib/i18n/routes.js';

/**
 * The route files, read through Vite rather than through `node:fs` — the Astro
 * program has no Node type declarations (its `lib` is the browser's), and adding
 * them to satisfy one test would widen the build's type surface for every
 * workstream. `import.meta.glob` is resolved at transform time and needs neither.
 */
const PAGE_MODULES = import.meta.glob('../../pages/**/*.astro');
const PAGE_FILES = new Set(
  Object.keys(PAGE_MODULES).map((path) => path.replace('../../pages/', '')),
);

/** Astro accepts either form for a route; the test accepts whichever exists. */
function pageFileExists(path: string): boolean {
  const relative = path.replace(/^\/+/, '').replace(/\/+$/, '');
  const base = relative === '' ? 'index' : relative;
  return PAGE_FILES.has(`${base}.astro`) || PAGE_FILES.has(`${base}/index.astro`);
}

const ARCHIVE_ROUTES: RouteKey[] = ['workArchive', 'competitions', 'professionalExperience'];

describe('Work Archive routes match the frozen locale route map (§11.1)', () => {
  for (const key of ARCHIVE_ROUTES) {
    for (const locale of LOCALES) {
      it(`${key} · ${locale} → ${routePath(key as never, locale as Locale, undefined as never)}`, () => {
        const path = routePath(key as never, locale as Locale, undefined as never);
        expect(pageFileExists(path), `no page file for ${path}`).toBe(true);
      });
    }
  }

  it('emits the exact RO paths the table locks', () => {
    expect(routePath('workArchive', 'ro')).toBe('/proiecte');
    expect(routePath('competitions', 'ro')).toBe('/proiecte/concursuri');
    expect(routePath('professionalExperience', 'ro')).toBe('/proiecte/experienta-profesionala');
  });

  it('emits the exact EN paths OD-2 approved', () => {
    expect(routePath('workArchive', 'en')).toBe('/en/projects');
    expect(routePath('competitions', 'en')).toBe('/en/projects/competitions');
    expect(routePath('professionalExperience', 'en')).toBe(
      '/en/projects/professional-experience',
    );
  });

  it('reserves a slug for every curated route that now exists (IA §2.2, F4)', () => {
    expect(RESERVED_SLUGS.ro).toEqual(['concursuri', 'experienta-profesionala']);
    expect(RESERVED_SLUGS.en).toEqual(['competitions', 'professional-experience']);
  });
});
