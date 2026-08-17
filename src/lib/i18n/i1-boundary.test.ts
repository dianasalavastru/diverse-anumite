import { describe, expect, it } from 'vitest';

/**
 * Integration point I-1 — the A/B boundary guard.
 *
 * TECHNICAL_ARCHITECTURE.md §23.4: "I-1 | End of Phase 0 | A + B | Route map,
 * token file, and `types.ts` stub are on `main`. A can build components against
 * types that compile; B can implement behind them."
 *
 * This file is Workstream A's, and it asserts only the boundary — never B's
 * content model, which has its own tests. It exists so the two things I-1
 * actually promises cannot silently regress:
 *
 *   1. A can import B's content contract and it compiles;
 *   2. the locale union has ONE declaration, in A's frozen route map, which
 *      B's contract re-exports (§7.1 drift prevention; the direction §7.7
 *      already establishes for the reserved-slug validator).
 */

// A importing B's contract: if this module or these names stop resolving,
// every component A builds in Phase 2+ breaks at once. That is the I-1 promise.
import {
  DEFAULT_LOCALE as CONTENT_DEFAULT_LOCALE,
  LOCALES as CONTENT_LOCALES,
  isCompetition,
  type Locale as ContentLocale,
  type Service,
  type WorkEntry,
  type WorkEntrySummary,
} from '../content';

import {
  DEFAULT_LOCALE as ROUTE_DEFAULT_LOCALE,
  LOCALES as ROUTE_LOCALES,
  routePath,
  type Locale as RouteLocale,
} from './routes';

describe('I-1 — A can consume B content contract', () => {
  it('resolves the content module import surface', () => {
    /* STAGE 5: `derivePillars` was the probe here and is deleted with the derivation. Any
       browser-safe export off the boundary barrel proves the same thing — that A can reach B's
       contract — so the probe moves to `isCompetition`, which A's W-4 toggle actually calls. */
    expect(typeof isCompetition).toBe('function');
  });

  it('exposes the shapes A builds components against', () => {
    // Structural assertions: a component reads `_id` off each of these. If B
    // renames or removes one, this stops compiling at `astro check`.
    const entryId = (entry: WorkEntry) => entry._id;
    const summaryId = (summary: WorkEntrySummary) => summary._id;
    const serviceId = (service: Service) => service._id;

    expect([entryId, summaryId, serviceId].every((fn) => typeof fn === 'function')).toBe(true);
  });
});

describe('I-1 — single locale authority', () => {
  it('re-exports the route map locale rather than re-declaring it', () => {
    // Identity, not equality: a second `as const` array would be structurally
    // equal but a different object, which is exactly the drift being prevented.
    expect(CONTENT_LOCALES).toBe(ROUTE_LOCALES);
  });

  it('shares one DEFAULT_LOCALE', () => {
    expect(CONTENT_DEFAULT_LOCALE).toBe(ROUTE_DEFAULT_LOCALE);
    expect(CONTENT_DEFAULT_LOCALE).toBe('ro');
  });

  it('shares one Locale type', () => {
    // Assignable in both directions => the same union, not two lookalikes.
    const fromRoute: RouteLocale = 'en';
    const fromContent: ContentLocale = fromRoute;
    const backAgain: RouteLocale = fromContent;
    expect(backAgain).toBe('en');
  });

  it('still honours the frozen route contract after reconciliation', () => {
    for (const locale of CONTENT_LOCALES) {
      expect(routePath('workArchive', locale)).toBe(
        locale === 'ro' ? '/proiecte' : '/en/projects',
      );
    }
  });
});
