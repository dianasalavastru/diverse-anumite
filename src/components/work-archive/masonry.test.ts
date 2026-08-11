/**
 * The masonry engine's two build-time decisions.
 *
 * OWNER: Workstream A. Both tests exist to hold one line of
 * `WORK_ARCHIVE_IMPLEMENTATION_NOTES.md`:113 — "Content editors curate rhythm
 * and emphasis from the CMS; developers do not re-order markup."
 */

import { describe, expect, it } from 'vitest';

import { createFixtureContentSource } from '../../lib/content/fixtures.js';
import { sortArchive } from '../../lib/content';
import { ARCHIVE_SCOPES, archiveSize, computeArchiveRanks } from './masonry.js';

const landscape = { width: 2000, height: 1333 };
const portrait = { width: 1200, height: 1600 };

describe('Prominence → the frozen five-size vocabulary', () => {
  it('maps the three unambiguous prominences', () => {
    expect(archiveSize('feature', landscape)).toBe('feature');
    expect(archiveSize('standard', landscape)).toBe('std');
    expect(archiveSize('small', landscape)).toBe('small');
  });

  it('splits `large` by the cover proportions, never by position', () => {
    expect(archiveSize('large', landscape)).toBe('wide');
    expect(archiveSize('large', portrait)).toBe('tall');
  });

  it('falls back to `wide` when there is no cover to read', () => {
    expect(archiveSize('large', null)).toBe('wide');
  });

  it('is a pure function of the metadata — the same entry always renders the same size', () => {
    expect(archiveSize('feature', portrait)).toBe(archiveSize('feature', landscape));
  });
});

describe('Precomputed order — the client selects a rank, it never sorts', () => {
  it('ranks every item in every ordering', async () => {
    const items = await createFixtureContentSource().workArchive('ro');
    const ranks = computeArchiveRanks(items);

    expect(ranks.size).toBe(items.length);
    for (const item of items) {
      const entry = ranks.get(item._id);
      expect(entry).toBeDefined();
      expect(entry?.curated.all).toBeTypeOf('number');
    }
  });

  it('reproduces B’s sortArchive exactly, per sort and per scope', async () => {
    const source = await createFixtureContentSource().workArchive('ro');
    const ranks = computeArchiveRanks(source);

    for (const scope of ARCHIVE_SCOPES) {
      const expected = sortArchive(source, 'curated', scope).map((item) => item._id);
      const actual = source
        .filter((item) => ranks.get(item._id)?.curated[scope] !== undefined)
        .sort((a, b) => (ranks.get(a._id)!.curated[scope]! - ranks.get(b._id)!.curated[scope]!))
        .map((item) => item._id);
      expect(actual).toEqual(expected);
    }

    for (const sort of ['newest', 'oldest'] as const) {
      const expected = sortArchive(source, sort).map((item) => item._id);
      const actual = [...source]
        .sort((a, b) => ranks.get(a._id)![sort] - ranks.get(b._id)![sort])
        .map((item) => item._id);
      expect(actual).toEqual(expected);
    }
  });

  it('omits a curated rank for a scope the item is not in — nothing is ordered into a view it does not belong to', async () => {
    const source = await createFixtureContentSource().workArchive('ro');
    const ranks = computeArchiveRanks(source);

    for (const item of source) {
      const pillars = [item.pillars.primary, ...item.pillars.secondary];
      for (const scope of ['architecture-design', 'reality-capture'] as const) {
        expect(ranks.get(item._id)?.curated[scope] !== undefined).toBe(pillars.includes(scope));
      }
    }
  });
});
