/**
 * Homepage presentation selection.
 *
 * OWNERSHIP: Workstream A. Reconciled at integration point I-3 (§23.4).
 *
 * ── WHAT THIS FILE IS NOT ─────────────────────────────────────────────────
 * It holds no ordering, no locale filtering, no pillar scoping and no placement
 * filtering. Every one of those is a **shared contract** owned by Workstream B
 * and reached only through `ContentSource`:
 *
 *   locale scoping           `availableIn`, applied inside every ContentSource
 *                            method before ordering (§7.1)
 *   discovery order          `discoveryOrder` / `compareCurated` (§7.6)
 *   pillar membership        `inPillarScope`, incl. cross-pillar (§7.4, :63)
 *   homepage placements      `source.highlights('homepage', pillar, locale)`
 *                            — taxonomy ∩ curation, ordered (§7.5)
 *   curated-view membership  `source.curatedView`, `source.professionalExperience`
 *   employer grouping        `groupByEmployer` (IA §5.1)
 *
 * At I-3 this file lost `pillarHighlights`, `heroItem`, `resolveEntries` and a
 * re-export of `compareCurated`. Three were thin wrappers that had begun to look
 * like selection rules, and one — the uncurated fallback — was a second
 * implementation of §7.6 that `CONTENT_MODEL.md` §4 forbids outright. See the
 * I-3 report.
 *
 * What remains is the one selection the frozen contract genuinely does not make:
 * which Reality Capture entry the point-cloud field is about, and whether its
 * derivative may be published.
 */

import { inPillarScope } from '../../lib/content';
import type { PointCloudDerivative, WorkArchiveItem, WorkEntry } from '../../lib/content';

/**
 * How many cards a homepage focus carousel shows.
 *
 * Transcribed from the approved HiFi's composition (traverse 04·a carries four
 * projects, 04·c carries three), not chosen. It is a *display bound* on an
 * already-selected, already-ordered set — `CONTENT_MODEL.md` §4 defines a
 * highlight strip as "taxonomy filter ∩ curation flag, ordered by Editorial
 * Priority", and how many of that sequence a given slot shows is the slot's
 * business. It changes no membership and no order.
 */
export const HIGHLIGHT_LIMIT = 4;

/* -------------------------------------------------------------------------- */
/* The point-cloud field                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Walk B's already-ordered archive and return the first Reality Capture entry
 * satisfying `predicate`.
 *
 * Ordering is never recomputed: the caller passes `source.workArchive(locale)`,
 * which is discovery-ordered (§7.6) and locale-scoped (§7.1) before it arrives.
 * `inPillarScope` is B's own membership rule, imported rather than restated.
 *
 * The full `WorkEntry` is looked up by id because capture metadata and
 * `capturePublicationCleared` live on the entry, not on `WorkArchiveItem` — and
 * they deliberately stay there. Broadcasting a publication-clearance flag into
 * the archive projection would widen a §19.4-gated field across every
 * signposting surface to serve one element on one page.
 */
function firstRealityCaptureEntry(
  ordered: readonly WorkArchiveItem[],
  byId: ReadonlyMap<string, WorkEntry>,
  predicate: (entry: WorkEntry) => boolean,
): WorkEntry | null {
  for (const item of ordered) {
    if (!inPillarScope(item, 'reality-capture')) continue;
    const entry = byId.get(item._id);
    if (entry && predicate(entry)) return entry;
  }
  return null;
}

/**
 * The single entry the point-cloud field is about.
 *
 * ONE ENTRY DRIVES THE WHOLE FIELD — the mounted derivative *and* the readout
 * beside it. §10.4 requires point count, accuracy and equipment to be "rendered
 * from the real derived asset", so a readout describing entry A next to a cloud
 * of entry B would be precisely the false technical claim that section forbids,
 * only assembled from two true halves.
 *
 * This is a **capability** selection, not an editorial one: the candidate set is
 * "Reality Capture entries that have a publishable cloud", and among those, B's
 * curation-led order decides. Nothing here derives emphasis from taxonomy.
 *
 * Preference order:
 *   1. an entry whose derivative is **cleared for publication** — §19.4 is a
 *      hard gate, not a preference: a point cloud is *measurable*, publishing
 *      one differs materially from publishing a photograph of the same building,
 *      and heritage/institutional clients may hold contractual restrictions;
 *   2. failing that, the leading Reality Capture entry that has capture metadata
 *      at all. The field then shows its poster state and its real
 *      specifications, and mounts nothing.
 */
export function pointCloudSubject(
  ordered: readonly WorkArchiveItem[],
  byId: ReadonlyMap<string, WorkEntry>,
): WorkEntry | null {
  return (
    firstRealityCaptureEntry(ordered, byId, (entry) => mountableDerivative(entry) !== null) ??
    firstRealityCaptureEntry(ordered, byId, (entry) => entry.capture != null)
  );
}

/**
 * The §19.4 publication gate, as one function.
 *
 * Selecting the field's subject and deciding whether its derivative may be
 * published are two different questions, and only this one is a security
 * boundary — so it is a single named function used by both the selector above
 * and the seam component, rather than an `&&` repeated in two places where one
 * copy could later drift.
 *
 * Returns the asset only when the entry is cleared AND actually has one.
 */
export function mountableDerivative(entry: WorkEntry | null): PointCloudDerivative | null {
  if (!entry || !entry.capturePublicationCleared) return null;
  return entry.capture?.derivative ?? null;
}

/** Index the full entries the page loads once, for the lookup above. */
export function indexById(entries: readonly WorkEntry[]): ReadonlyMap<string, WorkEntry> {
  return new Map(entries.map((entry) => [entry._id, entry]));
}
