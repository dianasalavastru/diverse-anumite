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

import { SERVICE_KEYS, type Curation, type Pillar, type ServiceKey } from './types.js';

/** The minimum an item needs to be ordered. Satisfied by `WorkEntrySummary` and `WorkArchiveItem`. */
export interface Orderable {
  readonly _id: string;
  /** Authored, exactly one (v3.1 §2, Stage 5). */
  readonly pillar: Pillar;
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
 * Whether an entry appears under a pillar scope.
 *
 * STAGE 5: plain equality. A project belongs to exactly one Pillar (v3.1 §2), so the
 * primary/secondary membership test — which existed so a cross-pillar entry could surface in
 * both views — collapses. Work spanning both capabilities is two linked projects, and each
 * appears in its own scope only.
 */
export function inPillarScope(item: Orderable, scope: PillarScope): boolean {
  return scope === 'all' || item.pillar === scope;
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
 * `all`, entries are queued by their authored pillar. Rule 2's balancing is unchanged; only its
 * input is simpler, because each project now falls into exactly one queue by construction
 * rather than by picking a primary out of a pair.
 */
export function discoveryOrder<T extends Orderable>(items: readonly T[], scope: PillarScope = 'all'): T[] {
  const scoped = items.filter((item) => inPillarScope(item, scope));

  if (scope !== 'all') return scoped.sort(compareCurated);

  const queues = new Map<Pillar, T[]>();
  for (const item of scoped) {
    const queue = queues.get(item.pillar);
    if (queue) queue.push(item);
    else queues.set(item.pillar, [item]);
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

/* ────────────────────────────────────────────────────────────────────────────
 * Service order — C5 (Wave 2 client decision), NOT §7.6
 * ──────────────────────────────────────────────────────────────────────────── */

/** The minimum a Service needs to be ordered. Satisfied by `Service`, `ServiceSummary`, `ServiceRef`. */
export interface ServiceOrderable {
  readonly _id: string;
  readonly key: ServiceKey;
}

/**
 * A Service's canonical 0-based rank: its index in `SERVICE_KEYS`.
 *
 * C5 fixes one site-wide order — Proiectare de arhitectură, Design interior, Vizualizare 3D,
 * Design mobilier, Scanare laser 3D, Scan-to-BIM — and that is exactly the declaration order of
 * `SERVICE_KEYS`, so the vocabulary is the single source for it and no second list exists to
 * drift. `normalize.ts` refuses any key outside `SERVICE_KEYS`, so `-1` cannot reach here from
 * the query layer; it is ranked last rather than first so a hand-built value cannot jump the
 * queue.
 */
export function serviceRank(key: ServiceKey): number {
  const rank = (SERVICE_KEYS as readonly string[]).indexOf(key);
  return rank === -1 ? SERVICE_KEYS.length : rank;
}

/**
 * Canonical Service comparator (C5). **Curation does not participate.**
 *
 * Services used to sort by `pinned`, then Editorial Priority, then `_id` (the old
 * `compareCurated0` in `source.ts`), which let an authored weight — or, with equal weights, the
 * random document id — decide that *Design mobilier* preceded *Vizualizare 3D*. C5 makes the
 * order deterministic in code: the stable key decides, and nothing an editor can change in the
 * Studio (name, slug, pinned, Editorial Priority, document id) moves a Service. `Service.curation`
 * stays in the contract, unread for ordering. The `_id` tie-break is only reachable if two
 * documents share a key, which validation forbids; it keeps the sort total regardless.
 */
export function compareServiceKeys(a: ServiceOrderable, b: ServiceOrderable): number {
  const rank = serviceRank(a.key) - serviceRank(b.key);
  if (rank !== 0) return rank;
  return a._id < b._id ? -1 : a._id > b._id ? 1 : 0;
}

/** A sorted copy in canonical Service order. Never mutates its input. */
export function byCanonicalServiceOrder<T extends ServiceOrderable>(services: readonly T[]): T[] {
  return [...services].sort(compareServiceKeys);
}

/**
 * The Service page's `S·NN` sheet reference: the canonical 1-based position, two digits.
 *
 * Derived from the KEY, not from a list position, so it is an identity rather than a row
 * number: it does not change when another Service is published or withheld, it is the same in
 * every locale, and it matches C5's own numbering (01 Proiectare de arhitectură … 06 Scan-to-BIM).
 * It is deliberately not the Services index's row number, which counts within one Pillar column.
 */
export function serviceSheetCode(key: ServiceKey): string {
  return String(serviceRank(key) + 1).padStart(2, '0');
}
