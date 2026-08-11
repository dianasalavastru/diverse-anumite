/**
 * The Work Archive filter + URL contract, as one pure module.
 *
 * OWNERSHIP: Workstream A. Page-local pure logic beside its components, exactly
 * as `components/homepage/highlights.ts` is — it is imported by the archive's
 * Astro composition *and* by its island, so both ends of the same contract
 * cannot drift apart, and it is unit-tested without a DOM.
 *
 * ── THE FROZEN CONTRACT (TECHNICAL_ARCHITECTURE.md §23.5) ──────────────────
 * Transcribed, not restated:
 *
 *   "Pillar toggle (a **mode**, not a filter — `COMPONENT_INVENTORY.md`:57;
 *    `All` default) · shared **Entry Type + Sector** · **one** pillar-contextual
 *    refinement (Discipline for A&D, Service for RC, none for All) · **Year as
 *    sort** (`curated` · `newest` · `oldest`) · **no Attribution filter**.
 *    Status is not a public filter.
 *
 *    URL: `?pillar=` `&sector=` `&type=` `&discipline=` `&service=` `&sort=`.
 *    `replaceState` for incremental changes, `pushState` for the pillar switch;
 *    full restore on load."
 *
 * The same set is agreed by IA Step 5, `WORK_ARCHIVE_PAGE_IA.md`:99 and
 * `COMPONENT_INVENTORY.md`:100, and §22 records it as "governed, not open".
 *
 * ── FORWARD-COMPATIBLE ENCODING (§23.5) ────────────────────────────────────
 * "Facet values are serialized as a **comma-separated list and parsed as a
 * list**, even though the launch behaviour permits exactly one value per facet.
 * This is a serialization choice, not a product decision… Single-select remains
 * the launch behaviour until that decision is made." So `parseFacet` reads a
 * list and the launch bound — take the first value that the archive actually
 * has — is applied in exactly one place, `firstAvailable`. Resolving the open
 * multi-select question (IA:167) changes that bound and the UI; already-shared
 * URLs keep working.
 *
 * ── WHAT IS DELIBERATELY ABSENT ────────────────────────────────────────────
 *   - **`?q=` / search.** Its retrieval behaviour, and "whether it ships at
 *     launch or as a fast-follow", are explicitly unresolved
 *     (`WORK_ARCHIVE_IMPLEMENTATION_NOTES.md`:119–124), and §22 keeps "search at
 *     launch vs fast-follow, and `?q=` persistence" in "Safely open". It is not
 *     in the §23.5 URL contract, so implementing it here would close an owner
 *     decision from the implementation layer. Flagged, not invented.
 *   - **`?year=`, `?status=`, `?attribution=`.** Year is a sort; Status and
 *     Attribution are not public filters. A URL carrying one is ignored like any
 *     other unknown parameter.
 */

import { PILLARS, type ArchiveSort, type Discipline, type EntryType, type Pillar, type Sector } from '../../lib/content';
import { pillarArchiveParam } from '../../lib/i18n/vocabulary';

/* -------------------------------------------------------------------------- */
/* Names                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * The six parameter names, in the order §23.5 writes them. Declared once so the
 * island, the composition and the tests all spell them identically.
 */
export const ARCHIVE_PARAMS = {
  pillar: 'pillar',
  sector: 'sector',
  type: 'type',
  discipline: 'discipline',
  service: 'service',
  sort: 'sort',
} as const;

/** `all` is the default scope (IA Step 5; `COMPONENT_INVENTORY.md`:57). */
export type PillarMode = Pillar | 'all';

export const ARCHIVE_SORTS = ['curated', 'newest', 'oldest'] as const satisfies readonly ArchiveSort[];

/**
 * URL token → Pillar, derived from the forward map rather than re-declared.
 *
 * `types.ts` warns that Pillar identifiers, route slugs and the archive's query
 * token are three different namespaces — the A&D token is `architecture`, not
 * the content identifier `architecture-design`. `pillarArchiveParam()` is the
 * single declaration of that mapping; this inverts it, so a second table can
 * never disagree with the first.
 */
const PILLAR_BY_TOKEN: ReadonlyMap<string, Pillar> = new Map(
  PILLARS.map((pillar) => [pillarArchiveParam(pillar), pillar]),
);

export function pillarFromToken(token: string): Pillar | null {
  return PILLAR_BY_TOKEN.get(token) ?? null;
}

/* -------------------------------------------------------------------------- */
/* State                                                                       */
/* -------------------------------------------------------------------------- */

export interface ArchiveState {
  /** The mode. Never a filter — it re-scopes the archive (`COMPONENT_INVENTORY.md`:57). */
  readonly pillar: PillarMode;
  /** Shared filter — Entry Type (primary or secondary). */
  readonly type: EntryType | null;
  /** Shared filter — Sector, the cross-pillar discovery axis. */
  readonly sector: Sector | null;
  /** Contextual refinement, Architecture & Design only. */
  readonly discipline: Discipline | null;
  /** Contextual refinement, Reality Capture only — the localized Service slug. */
  readonly service: string | null;
  /** Year as sort, never as filter (IA Step 5). */
  readonly sort: ArchiveSort;
}

export const DEFAULT_ARCHIVE_STATE: ArchiveState = {
  pillar: 'all',
  type: null,
  sector: null,
  discipline: null,
  service: null,
  sort: 'curated',
};

/**
 * The facet values this locale's archive actually contains.
 *
 * Validation is against *the rendered set*, not against the full vocabulary:
 * "Do not expose filter values not supported by the canonical content model" is
 * satisfied because the set is projected from `WorkArchiveItem`s, and a URL
 * naming a value nothing carries would otherwise render an empty archive with a
 * control that looks inactive — a filter state existing only in the URL.
 */
export interface ArchiveFacetValues {
  readonly types: readonly string[];
  readonly sectors: readonly string[];
  readonly disciplines: readonly string[];
  readonly services: readonly string[];
}

export const EMPTY_FACET_VALUES: ArchiveFacetValues = {
  types: [],
  sectors: [],
  disciplines: [],
  services: [],
};

/**
 * Which refinement a scope exposes — Discipline under A&D, Service under RC,
 * **none** under All (IA Step 5: "Each pillar provides one additional contextual
 * refinement"; §23.5: "none for All").
 */
export function contextualFacet(pillar: PillarMode): 'discipline' | 'service' | null {
  if (pillar === 'architecture-design') return 'discipline';
  if (pillar === 'reality-capture') return 'service';
  return null;
}

/* -------------------------------------------------------------------------- */
/* Parsing                                                                     */
/* -------------------------------------------------------------------------- */

/** §23.5's list encoding. Empty entries are dropped; whitespace is tolerated. */
export function parseFacetList(raw: string | null): readonly string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

/**
 * The launch bound, in one place: the first value the archive actually has.
 * Everything else in this module already treats a facet as a list.
 */
function firstAvailable(raw: string | null, available: readonly string[]): string | null {
  for (const value of parseFacetList(raw)) {
    if (available.includes(value)) return value;
  }
  return null;
}

/**
 * Restore state from a URL (§23.5, "full restore on load").
 *
 * Unrecognised values are ignored rather than echoed — the same rule §23.1
 * applies to the Contact prefills ("an unrecognised value is ignored rather than
 * echoed"). A contextual refinement is dropped unless its pillar mode is active,
 * so `?discipline=architecture` alone, or under `?pillar=reality-capture`,
 * resolves to the unrefined view instead of a filter with no visible control.
 */
export function parseArchiveState(
  input: string | URLSearchParams,
  available: ArchiveFacetValues = EMPTY_FACET_VALUES,
): ArchiveState {
  const params = typeof input === 'string' ? new URLSearchParams(input) : input;

  const pillarToken = parseFacetList(params.get(ARCHIVE_PARAMS.pillar))[0] ?? null;
  const pillar: PillarMode = (pillarToken && pillarFromToken(pillarToken)) || 'all';

  const sortRaw = parseFacetList(params.get(ARCHIVE_PARAMS.sort))[0] ?? null;
  const sort: ArchiveSort = (ARCHIVE_SORTS as readonly string[]).includes(sortRaw ?? '')
    ? (sortRaw as ArchiveSort)
    : DEFAULT_ARCHIVE_STATE.sort;

  const refinement = contextualFacet(pillar);

  return {
    pillar,
    type: firstAvailable(params.get(ARCHIVE_PARAMS.type), available.types) as EntryType | null,
    sector: firstAvailable(params.get(ARCHIVE_PARAMS.sector), available.sectors),
    discipline:
      refinement === 'discipline'
        ? (firstAvailable(params.get(ARCHIVE_PARAMS.discipline), available.disciplines) as Discipline | null)
        : null,
    service:
      refinement === 'service'
        ? firstAvailable(params.get(ARCHIVE_PARAMS.service), available.services)
        : null,
    sort,
  };
}

/* -------------------------------------------------------------------------- */
/* Serializing                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * The query string for a state — `''` when nothing is active, so the default
 * archive keeps a clean `/proiecte` and the canonical URL is never a filter
 * state (§12: "Filter states are **not** separately canonicalized").
 *
 * Parameter order follows §23.5's own order, which makes two equal states
 * produce one byte-identical URL — a shared link is stable, and the history
 * entries a visitor walks back through are comparable.
 */
export function archiveQuery(state: ArchiveState): string {
  const params = new URLSearchParams();

  if (state.pillar !== 'all') params.set(ARCHIVE_PARAMS.pillar, pillarArchiveParam(state.pillar));
  if (state.sector) params.set(ARCHIVE_PARAMS.sector, state.sector);
  if (state.type) params.set(ARCHIVE_PARAMS.type, state.type);
  if (state.discipline && contextualFacet(state.pillar) === 'discipline') {
    params.set(ARCHIVE_PARAMS.discipline, state.discipline);
  }
  if (state.service && contextualFacet(state.pillar) === 'service') {
    params.set(ARCHIVE_PARAMS.service, state.service);
  }
  if (state.sort !== DEFAULT_ARCHIVE_STATE.sort) params.set(ARCHIVE_PARAMS.sort, state.sort);

  return params.toString();
}

/** An absolute path for a state — used by the empty-state suggestions and A-7. */
export function archiveHref(basePath: string, state: ArchiveState): string {
  const query = archiveQuery(state);
  return query ? `${basePath}?${query}` : basePath;
}

/* -------------------------------------------------------------------------- */
/* Transitions                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Switch the mode.
 *
 * The shared filters **survive** a pillar switch and the contextual refinement
 * does not. IA Step 5 defines Entry Type and Sector as "Shared filters (both
 * pillars)", so dropping them would contradict the word that makes them shared;
 * the refinement is dropped because it does not exist in the new scope. The
 * approved HiFi resets everything on a pillar switch (`setPillar` clears type,
 * year, status and the query), which is a prototype simplification of a control
 * set that had no shared/contextual distinction to preserve.
 */
export function withPillar(state: ArchiveState, pillar: PillarMode): ArchiveState {
  return {
    ...state,
    pillar,
    discipline: contextualFacet(pillar) === 'discipline' ? state.discipline : null,
    service: contextualFacet(pillar) === 'service' ? state.service : null,
  };
}

/**
 * A-3's "clear/broaden": clears the filters and keeps the mode and the sort.
 *
 * Pillar is a mode, not a filter (`COMPONENT_INVENTORY.md`:57) and sort is not a
 * filter either (IA Step 5), so neither is a thing "clear filters" clears. A
 * visitor who wants the whole archive back has the Pillar Toggle and the
 * empty-state suggestions, which carry explicit whole-archive targets.
 */
export function clearFilters(state: ArchiveState): ArchiveState {
  return { ...state, type: null, sector: null, discipline: null, service: null };
}

/** Whether any *filter* is active — the readout and the clear affordance gate on it. */
export function hasActiveFilters(state: ArchiveState): boolean {
  return Boolean(state.type || state.sector || state.discipline || state.service);
}

/** Whether the view is the untouched default (mode, filters and sort). */
export function isDefaultArchiveState(state: ArchiveState): boolean {
  return (
    state.pillar === 'all' && state.sort === DEFAULT_ARCHIVE_STATE.sort && !hasActiveFilters(state)
  );
}

/* -------------------------------------------------------------------------- */
/* Matching                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * One item's facets, as the archive projects them onto the rendered cell.
 *
 * Every list is **primary + secondary** where the axis has both, because that is
 * how membership is defined upstream and how B already reads it: a cross-pillar
 * entry "surfaces in **both** pillar views as one canonical entry"
 * (`order.ts`/`inPillarScope`, `CONTENT_MODEL.md`:63), and an entry that is
 * *secondarily* a competition still belongs to the Competitions view
 * (`source.ts`/`isCompetition`, `CONTENT_MODEL.md`:47). The archive filter
 * cannot answer the same question differently from the curated view.
 */
export interface ArchiveItemFacets {
  readonly pillars: readonly string[];
  readonly types: readonly string[];
  readonly sectors: readonly string[];
  readonly disciplines: readonly string[];
  readonly services: readonly string[];
}

export function matchesArchiveState(facets: ArchiveItemFacets, state: ArchiveState): boolean {
  if (state.pillar !== 'all' && !facets.pillars.includes(state.pillar)) return false;
  if (state.type && !facets.types.includes(state.type)) return false;
  if (state.sector && !facets.sectors.includes(state.sector)) return false;
  if (state.discipline && !facets.disciplines.includes(state.discipline)) return false;
  if (state.service && !facets.services.includes(state.service)) return false;
  return true;
}
