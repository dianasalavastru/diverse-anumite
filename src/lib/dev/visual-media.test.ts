/**
 * Fail-safe proof for the development-only visual media overlay.
 *
 * OWNER: Workstream A.
 *
 * The overlay serves imagery that is not content, is not cleared for publication, and is not in
 * Git. Its failure direction is therefore asymmetric: a QA session that stays on the Plate
 * fallback is a mild inconvenience, and a build that ships the owner's private photographs is
 * not recoverable. So the switch is tested for what it does when it is *off* and when it is
 * malformed, not only for what it does when it is on.
 *
 * `scripts/verify-no-dev-media.mjs` asserts the same property empirically against `dist/`, the
 * way `verify-client-bundles.mjs` does for the credential boundary. This file localizes a
 * failure to a function; that one cannot be fooled by a mistake in this file's assumptions.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
  devServiceKey,
  devServicePool,
  devVisualImage,
  devVisualMediaEnabled,
  poolForPillar,
  stableHash,
} from './visual-media';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const PREPARER = readFileSync(`${ROOT}scripts/dev-visual-media.mjs`, 'utf8');
const HELPER = readFileSync(`${ROOT}src/lib/dev/visual-media.ts`, 'utf8');

describe('the flag', () => {
  it('is on for exactly the string "true"', () => {
    expect(devVisualMediaEnabled({ DEV_VISUAL_MEDIA: 'true' })).toBe(true);
  });

  /**
   * Every one of these is truthy under `Boolean(value)`, and every one of them must be off. This
   * is the test that would have caught a `!!env[FLAG]` implementation.
   */
  it.each(['TRUE', 'True', '1', 'yes', 'on', 'enabled', ' true', 'true '])(
    'is off for the truthy-looking value %j',
    (value) => {
      expect(devVisualMediaEnabled({ DEV_VISUAL_MEDIA: value })).toBe(false);
    },
  );

  it.each([undefined, ''])('is off for %j', (value) => {
    expect(devVisualMediaEnabled({ DEV_VISUAL_MEDIA: value })).toBe(false);
  });

  it('is off for an empty environment', () => {
    expect(devVisualMediaEnabled({})).toBe(false);
  });

  it('is off for the explicit negatives', () => {
    expect(devVisualMediaEnabled({ DEV_VISUAL_MEDIA: 'false' })).toBe(false);
    expect(devVisualMediaEnabled({ DEV_VISUAL_MEDIA: '0' })).toBe(false);
  });
});

describe('lookup without the flag', () => {
  /**
   * The suite runs without `DEV_VISUAL_MEDIA`, so this exercises the real default path: no
   * manifest is read, no filesystem is touched, and every surface keeps its Plate.
   */
  it('returns nothing for any pool', () => {
    expect(devVisualImage('architecture', 'anything')).toBeNull();
    expect(devVisualImage('reality-capture', 'anything')).toBeNull();
    expect(devVisualImage('general', 'anything')).toBeNull();
  });

  it('returns nothing however many times it is asked', () => {
    for (let index = 0; index < 50; index += 1) {
      expect(devVisualImage('architecture', `key-${index}`)).toBeNull();
    }
  });
});

describe('deterministic selection', () => {
  it('is stable for the same key', () => {
    expect(stableHash('da-test-i4-work-ad-1:card')).toBe(stableHash('da-test-i4-work-ad-1:card'));
  });

  it('separates surfaces of the same entry', () => {
    expect(stableHash('entry:card')).not.toBe(stableHash('entry:entry-hero'));
  });

  it('is the algorithm the preparer uses', () => {
    // Both files carry their own copy — one is ESM run by Node at build time, the other is in
    // the browser-typed program. A divergence would not fail anything visibly; it would just
    // silently break the "same picture across builds" property this exists to guarantee.
    expect(PREPARER).toContain('0x811c9dc5');
    expect(PREPARER).toContain('0x01000193');
    expect(HELPER).toContain('0x811c9dc5');
    expect(HELPER).toContain('0x01000193');
  });

  it('distributes across a pool rather than collapsing onto one index', () => {
    const picks = new Set(
      Array.from({ length: 40 }, (_, index) => stableHash(`work-${index}:card`) % 7),
    );
    expect(picks.size).toBeGreaterThan(3);
  });
});

describe('pool routing', () => {
  it('sends each pillar to its own pool', () => {
    expect(poolForPillar('architecture-design')).toBe('architecture');
    expect(poolForPillar('reality-capture')).toBe('reality-capture');
  });

  /*
   * STAGE 5 replaces the cross-pillar routing case. A project has one authored Pillar, so the
   * "belongs to both, pick deterministically" branch is unreachable and the parameter it needed
   * is gone. What remains worth asserting is that routing is total and stable.
   */
  it('routes every pillar to a real pool, stably', () => {
    for (const pillar of ['architecture-design', 'reality-capture'] as const) {
      const pool = poolForPillar(pillar, 'da-test:card');
      expect(['architecture', 'reality-capture']).toContain(pool);
      expect(poolForPillar(pillar, 'da-test:card')).toBe(pool);
    }
  });

  it('never routes a project surface to the general pool', () => {
    // `general/` is for surfaces that claim nothing about a pillar — the homepage credibility
    // figure. A Work Entry must never draw from it, or a Reality Capture card could show an
    // interior photograph.
    expect(poolForPillar('architecture-design', 'a')).not.toBe('general');
    expect(poolForPillar('reality-capture', 'a')).not.toBe('general');
    expect(devServicePool('architecture-design')).not.toBe('general');
  });

  it('gives a Service one stable key', () => {
    expect(devServiceKey('service-1')).toBe(devServiceKey('service-1'));
    expect(devServiceKey('service-1')).not.toBe(devServiceKey('service-2'));
  });
});

describe('the two implementations agree on the wire format', () => {
  /**
   * The literals are duplicated on purpose: the preparer is plain ESM invoked by Node before
   * Astro starts, and importing the TypeScript module from it would mean compiling it first.
   * Duplication is the right trade — but only if a test notices when the copies drift, because
   * a mismatched prefix would mean every image 404s with no error anywhere.
   */
  it.each(['DEV_VISUAL_MEDIA', '.dev-visual-media', 'manifest.json', '/dev-visual-media/'])(
    'shares the literal %j',
    (literal) => {
      expect(PREPARER).toContain(literal);
      expect(HELPER).toContain(literal);
    },
  );
});

describe('the source directory is never referenced at render time', () => {
  /**
   * The helper resolves derivatives from the cache, never the originals. If `dev-assets/` ever
   * appeared in a rendered `src`, the emitted HTML would point at a path that exists on one
   * laptop and nowhere else — and would name the owner's private files in the markup.
   */
  it('does not mention the gitignored source directory', () => {
    expect(HELPER).not.toContain('dev-assets');
  });
});
