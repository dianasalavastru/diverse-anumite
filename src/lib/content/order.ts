/**
 * Discovery order — `TECHNICAL_ARCHITECTURE.md` §7.6, a shared contract.
 *
 * OWNER: Workstream B. Derived at build, never stored (§8).
 *
 * IA Step 5 requires "curated + balanced pillars" but defines no algorithm; §7.6 specifies one
 * and calls it a shared contract, which is why it lives beside the query layer rather than
 * inside the archive island. The homepage, the hubs, the curated views and the archive all
 * order the same way, from one implementation.
 *
 * §7.6, transcribed:
 *   1. Sort by Editorial Priority (descending) within each pillar.
 *   2. When scope = All, interleave pillars to maintain balanced representation.
 *   3. Ties break by Year descending.
 *   4. Under a pillar filter, balancing is inert (single pillar).
 *   5. When the EN set is a subset, balancing operates over the EN-published set only.
 *
 * Rule 5 is satisfied by construction: every query is locale-scoped before ordering
 * (`source.ts`), so this module only ever sees the set that exists in the active locale.
 */

import type { Curation, Pillar, PillarAssignment } from './types.js';

/** The minimum an item needs to be ordered. Satisfied by `WorkEntrySummary` and `WorkArchiveItem`. */
export interface Orderable {
  readonly _id: string;
  readonly pillars: PillarAssignment;
  readonly curation: Curation;
  readonly year: number;
}

/** `all` is the archive default and the homepage's cross-pillar scope (IA Step 5). */
export type PillarScope = Pillar | 'all';

/**
 * Rank within one pillar queue.
 *
 * `pinned` precedes Editorial Priority: `CONTENT_MODEL.md`:79 defines Pinned as "hold at top",
 * which is a stronger statement than a weight. Ties finally break on `_id` so that two entries
 * with identical curation and year produce a **stable, reproducible build** rather than
 * whatever order the Content Lake happened to return.
 */
export function compareCurated(a: Orderable, b: Orderable): number {
  if (a.curation.pinned !== b.curation.pinned) return a.curation.pinned ? -1 : 1;
  if (a.curation.editorialPriority !== b.curation.editorialPriority) {
    return b.curation.editorialPriority - a.curation.editorialPriority;
  }
  if (a.year !== b.year) return b.year - a.year;
  return a._id < b._id ? -1 : a._id > b._id ? 1 : 0;
}

/** §23.5's alternate archive sorts. Year is a sort, never a filter (IA Step 5). */
export function compareYearDescending(a: Orderable, b: Orderable): number {
  if (a.year !== b.year) return b.year - a.year;
  return a._id < b._id ? -1 : a._id > b._id ? 1 : 0;
}

export function compareYearAscending(a: Orderable, b: Orderable): number {
  if (a.year !== b.year) return a.year - b.year;
  return a._id < b._id ? -1 : a._id > b._id ? 1 : 0;
}

/**
 * Whether an entry appears under a pillar scope. A cross-pillar entry surfaces in **both**
 * pillar views as one canonical entry (`CONTENT_MODEL.md`:63, IA §2.2), so secondary pillars
 * count for membership — while `pillars.primary` alone decides the default back-path (M2) and
 * which queue the entry balances from below.
 */
export function inPillarScope(item: Orderable, scope: PillarScope): boolean {
  if (scope === 'all') return true;
  return item.pillars.primary === scope || item.pillars.secondary.includes(scope);
}

/**
 * Round-robin interleave of the two pillar queues (rule 2).
 *
 * Which pillar starts is decided by comparing the two queue heads with the same curated
 * comparator — not by a fixed order. IA §3.2 forbids structural primacy of either pillar, and
 * hardcoding "architecture first" would encode exactly that into every cross-pillar surface on
 * the site. When one queue empties, the remainder of the other follows in order, so balancing
 * degrades to plain curated order rather than truncating anything.
 */
function interleave<T extends Orderable>(queues: readonly (readonly T[])[]): T[] {
  const active = queues.filter((queue) => queue.length > 0);
  if (active.length <= 1) return [...(active[0] ?? [])];

  const ordered = [...active].sort((a, b) => compareCurated(a[0] as T, b[0] as T));
  const cursors = ordered.map(() => 0);
  const result: T[] = [];
  let remaining = ordered.reduce((total, queue) => total + queue.length, 0);

  while (remaining > 0) {
    for (let index = 0; index < ordered.length; index += 1) {
      const queue = ordered[index] as readonly T[];
      const cursor = cursors[index] as number;
      if (cursor < queue.length) {
        result.push(queue[cursor] as T);
        cursors[index] = cursor + 1;
        remaining -= 1;
      }
    }
  }

  return result;
}

/**
 * The default archive/hub/homepage ordering (§7.6).
 *
 * Under a pillar scope, balancing is inert (rule 4) — a single queue, curated order. Under
 * `all`, entries are queued by their **primary** pillar so a cross-pillar entry balances once
 * rather than appearing twice.
 */
export function discoveryOrder<T extends Orderable>(items: readonly T[], scope: PillarScope = 'all'): T[] {
  const scoped = items.filter((item) => inPillarScope(item, scope));

  if (scope !== 'all') return scoped.sort(compareCurated);

  const queues = new Map<Pillar, T[]>();
  for (const item of scoped) {
    const queue = queues.get(item.pillars.primary);
    if (queue) queue.push(item);
    else queues.set(item.pillars.primary, [item]);
  }

  return interleave([...queues.values()].map((queue) => queue.sort(compareCurated)));
}

/** §23.5: `sort=curated · newest · oldest`. `curated` is the default (IA Step 5). */
export type ArchiveSort = 'curated' | 'newest' | 'oldest';

export function sortArchive<T extends Orderable>(
  items: readonly T[],
  sort: ArchiveSort,
  scope: PillarScope = 'all',
): T[] {
  if (sort === 'curated') return discoveryOrder(items, scope);
  const scoped = items.filter((item) => inPillarScope(item, scope));
  return scoped.sort(sort === 'newest' ? compareYearDescending : compareYearAscending);
}
