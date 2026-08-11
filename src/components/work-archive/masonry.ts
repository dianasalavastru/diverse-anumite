/**
 * The editorial masonry — size vocabulary and precomputed order.
 *
 * OWNERSHIP: Workstream A. Pure, DOM-free, unit-tested.
 *
 * ── THE DIVISION OF LABOUR THIS FILE EXISTS TO PROTECT ─────────────────────
 * `WORK_ARCHIVE_IMPLEMENTATION_NOTES.md`:104–113, frozen:
 *
 *   "Engineering builds the rendering engine — once… Developers do not decide
 *    which projects lead or in what order they appear. Editors curate the
 *    experience — continuously… Prominence, ordering and visual hierarchy are
 *    therefore expressed as **editorial metadata**, never as code."
 *
 * So this module reads `curation.prominence` and B's ordering, and decides
 * nothing editorial. Both halves are precomputed here at **build time** rather
 * than in the island, which is what keeps the client from ever recomputing an
 * order: the browser selects a rank, it does not derive one.
 */

import { sortArchive, type Pillar, type Prominence, type WorkArchiveItem } from '../../lib/content';

/* -------------------------------------------------------------------------- */
/* The five-size vocabulary                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Frozen at `WORK_ARCHIVE_IMPLEMENTATION_NOTES.md`:40 — "five-size vocabulary
 * (feature / wide / tall / std / small), asymmetric composition, measured gaps.
 * Not a uniform card grid." The class names are the approved HiFi's own
 * (`.s-feature`, `.s-wide`, `.s-tall`, `.s-std`, `.s-small`).
 */
export const ARCHIVE_SIZES = ['feature', 'wide', 'tall', 'std', 'small'] as const;
export type ArchiveSize = (typeof ARCHIVE_SIZES)[number];

/**
 * ⚠ CONTRACT OBSERVATION — four prominences, five sizes.
 *
 * §7.5 maps `prominence` (feature · large · standard · small) onto "the five-size
 * vocabulary", and the two sets are not the same size: nothing in the CMS
 * distinguishes `wide` from `tall`, which in the HiFi differ by column span AND
 * aspect ratio (3/2 across six columns vs 3/4 across four).
 *
 * Rather than drop `tall` — which would delete a fifth of an explicitly frozen
 * vocabulary — or alternate by position — which would be frontend layout logic
 * inventing editorial rhythm, exactly what :113 forbids — the split is resolved
 * from the **cover asset's own proportions**: a `large` entry whose cover is
 * portrait renders `tall`, and everything else renders `wide`.
 *
 * That is not a new editorial decision. VISUAL_DIRECTION_v2.0 §9 makes cropping
 * authorship and forbids cropping "merely to fit a slot"; putting a portrait
 * photograph into a 3/2 slot is that crop. The choice follows the authored
 * asset, which is content, and an editor changes it by changing the cover.
 *
 * Reported as a contract gap: if the owner wants `tall` to be an editorial
 * choice rather than a consequence of the cover, `prominence` needs a fifth
 * value and this function loses its second argument.
 */
export function archiveSize(
  prominence: Prominence,
  cover: { readonly width: number; readonly height: number } | null,
): ArchiveSize {
  switch (prominence) {
    case 'feature':
      return 'feature';
    case 'large':
      return cover && cover.height > cover.width ? 'tall' : 'wide';
    case 'standard':
      return 'std';
    case 'small':
      return 'small';
  }
}

/* -------------------------------------------------------------------------- */
/* Precomputed order                                                           */
/* -------------------------------------------------------------------------- */

/**
 * The scopes an order can be computed for. `curated` order is scope-dependent
 * because §7.6 rule 2 interleaves the two pillar queues, and interleaving a
 * subset is not the subset of an interleaving — so a pillar view needs its own
 * curated sequence. The year sorts are scope-independent: removing items never
 * changes the relative order of those that remain.
 */
export const ARCHIVE_SCOPES = ['all', 'architecture-design', 'reality-capture'] as const;
export type ArchiveScope = (typeof ARCHIVE_SCOPES)[number];

export interface ArchiveRanks {
  /** Rank per scope under `sort=curated`; absent where the item is out of scope. */
  readonly curated: Readonly<Partial<Record<ArchiveScope, number>>>;
  readonly newest: number;
  readonly oldest: number;
}

/**
 * Every ordering the archive can display, computed once at build through B's own
 * `sortArchive` (§23.5) over B's own discovery order (§7.6).
 *
 * The island applies a rank as a CSS `order`; it never sorts. This is what makes
 * "Do not let frontend layout logic redefine editorial priority" structural
 * rather than a convention — there is no comparator in the browser to redefine
 * anything with, and `curated` in the client is byte-for-byte the sequence the
 * server rendered.
 */
export function computeArchiveRanks(
  items: readonly WorkArchiveItem[],
): ReadonlyMap<string, ArchiveRanks> {
  const ranks = new Map<string, { curated: Partial<Record<ArchiveScope, number>>; newest: number; oldest: number }>();

  for (const item of items) {
    ranks.set(item._id, { curated: {}, newest: 0, oldest: 0 });
  }

  for (const scope of ARCHIVE_SCOPES) {
    sortArchive(items, 'curated', scope as 'all' | Pillar).forEach((item, index) => {
      const entry = ranks.get(item._id);
      if (entry) entry.curated[scope] = index;
    });
  }

  sortArchive(items, 'newest').forEach((item, index) => {
    const entry = ranks.get(item._id);
    if (entry) entry.newest = index;
  });

  sortArchive(items, 'oldest').forEach((item, index) => {
    const entry = ranks.get(item._id);
    if (entry) entry.oldest = index;
  });

  return ranks;
}
