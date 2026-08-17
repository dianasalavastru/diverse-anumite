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
 *    `All` default) · shared **Label + Sector** · **one** pillar-contextual
 *    refinement (Service for RC; A&D's Discipline refinement retired at Stage 5) · **Year as
 *    sort** (`curated` · `newest` · `oldest`) · **no Attribution filter**.
 *    Status is not a public filter.
 *
 *    URL: `?pillar=` `&sector=` `&label=` `&service=` `&sort=`.
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
 *   - **`?type=` — RETIRED at Stage 4, with no alias.** Entry Type is gone from
 *     the model (v3.1 §12), so keeping its query token would keep an obsolete
 *     public taxonomy alive in shareable URLs. The Label filter gets its own
 *     token, `?label=`, rather than inheriting one whose values no longer exist.
 *     An old `?type=competition-entry` link is not redirected and not translated:
 *     it falls through the same unknown-parameter path as everything else and
 *     resolves to the unfiltered archive, which is a valid page rather than an
 *     error. `archive-state.test.ts` pins that behaviour.
 */

import {
  PILLARS,
  SERVICE_KEY_TO_PILLAR,
  type ArchiveSort,
  type Pillar,
  type ProjectLabel,
  type Sector,
  type ServiceKey,
} from '../../lib/content';
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
  label: 'label',
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
  /**
   * Shared filter — Project Label. **Global to all three pillar modes** (v3.1 §10): a Label
   * belongs to no Pillar, so it is offered under All, Architecture & Design and Reality
   * Capture alike, exactly as Sector is.
   */
  readonly label: ProjectLabel | null;
  /**
   * Shared filter — Sector, the cross-pillar discovery axis. **Global to all three pillar
   * modes and preserved across a mode switch**, exactly as Label is; reaffirmed 2026-08-17
   * (`DECISIONS_LOG.md` #101) after the archive taxonomy was restated.
   */
  readonly sector: Sector | null;
  /**
   * Contextual refinement — the **immutable `ServiceKey`**, never a slug or a name (v3.1 §14.3).
   *
   * Stage 5 retired Architecture & Design's Discipline refinement and left Service scoped to
   * Reality Capture until the Service contract was complete. It is, so the refinement now exists
   * under all three modes — but it stays *contextual* rather than shared, because a Service
   * belongs to exactly one Pillar and the option list differs per mode. That is the whole
   * difference between this facet and the two above.
   */
  readonly service: ServiceKey | null;
  /** Year as sort, never as filter (IA Step 5). */
  readonly sort: ArchiveSort;
}

export const DEFAULT_ARCHIVE_STATE: ArchiveState = {
  pillar: 'all',
  label: null,
  sector: null,
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
  readonly labels: readonly string[];
  readonly sectors: readonly string[];
  readonly services: readonly string[];
}

export const EMPTY_FACET_VALUES: ArchiveFacetValues = {
  labels: [],
  sectors: [],
  services: [],
};

/**
 * The Services a mode offers, narrowed from the archive's whole demonstrated set.
 *
 * This replaces `contextualFacet()`, which answered "does this mode have a refinement at all?"
 * and returned `'service'` only for Reality Capture. Every mode has one now, so the useful
 * question changed shape: not *whether* but *which*.
 *
 * A `ServiceKey` belongs to exactly one Pillar by construction (`SERVICE_KEY_TO_PILLAR`), and
 * Stage 8 guarantees every project's Services sit inside its own Pillar — so "demonstrated by a
 * project in this scope" and "demonstrated, and owned by this Pillar" are the same set. Reading
 * the static map rather than re-deriving the set from the items keeps this pure, which is what
 * lets the SSR control, the URL validator and the island share one answer.
 */
export function servicesInScope(
  available: readonly string[],
  pillar: PillarMode,
): readonly string[] {
  if (pillar === 'all') return available;
  return available.filter((key) => SERVICE_KEY_TO_PILLAR[key as ServiceKey] === pillar);
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
 * so `?service=…` under `?pillar=all` resolves to the unrefined view instead of a filter with
 * no visible control. **`?discipline=` is retired at Stage 5 with no alias**: the axis is gone
 * from the model, so an old link falls through the unknown-parameter path to the unfiltered
 * archive rather than being translated into a Pillar it never meant.
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

  return {
    pillar,
    label: firstAvailable(params.get(ARCHIVE_PARAMS.label), available.labels) as ProjectLabel | null,
    /* STAGE 6: Sector is a closed union now, so the cast is the same narrowing every other
       facet already does — the value is validated against the rendered set first. */
    sector: firstAvailable(params.get(ARCHIVE_PARAMS.sector), available.sectors) as Sector | null,
    /*
     * Validated against the set THIS MODE offers, so `?pillar=architecture&service=scan-to-bim`
     * resolves to the unrefined A&D archive rather than to a filter with no control.
     *
     * A slug-valued `?service=test-scanare-3d` from before the identity change is not aliased
     * and not translated: it is simply not in the available set, so it falls through the same
     * unknown-value path as `?discipline=` and `?type=` and lands on a valid page.
     */
    service: firstAvailable(
      params.get(ARCHIVE_PARAMS.service),
      servicesInScope(available.services, pillar),
    ) as ServiceKey | null,
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
  if (state.label) params.set(ARCHIVE_PARAMS.label, state.label);
  /* No mode gate any more — every mode exposes a Service refinement, and `withPillar` has
     already dropped a key the current mode cannot express. */
  if (state.service) params.set(ARCHIVE_PARAMS.service, state.service);
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
 * The shared filters — Label and Sector — **survive** every switch. IA Step 5 defines them as
 * shared across both pillars, so dropping them would contradict the word that makes them shared.
 * The approved HiFi resets everything on a pillar switch (`setPillar` clears type, year, status
 * and the query), which is a prototype simplification of a control set that had no
 * shared/contextual distinction to preserve.
 *
 * ── THE SERVICE RULE IS NO LONGER "ALWAYS DROP" ────────────────────────────
 * While Service existed under Reality Capture alone, any switch left a scope with no Service
 * control, so clearing it was the only coherent answer. Now that every mode offers one, clearing
 * unconditionally would throw away a selection that is still perfectly expressible — a visitor
 * who filters A&D by *Design interior* and then widens to *Toate* means "the same work, plus
 * everything else", not "start over".
 *
 * So the key is kept **exactly when the destination mode can still express it**, which is a pure
 * question about the key's own Pillar:
 *
 *   A&D → RC          cleared — an A&D key is not in Reality Capture's set
 *   RC  → A&D         cleared — likewise
 *   Pillar → All      kept — All's set is the union, so a valid key stays valid
 *   All → owning      kept — the key's Pillar is the destination
 *   All → other       cleared — the key belongs to the Pillar being left behind
 *
 * No availability list is needed: a selected key was already validated against a set that is a
 * subset of All's, so membership in the destination follows from the key alone.
 */
export function withPillar(state: ArchiveState, pillar: PillarMode): ArchiveState {
  const survives =
    state.service !== null &&
    (pillar === 'all' || SERVICE_KEY_TO_PILLAR[state.service] === pillar);

  return { ...state, pillar, service: survives ? state.service : null };
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
  return { ...state, label: null, sector: null, service: null };
}

/** Whether any *filter* is active — the readout and the clear affordance gate on it. */
export function hasActiveFilters(state: ArchiveState): boolean {
  return Boolean(state.label || state.sector || state.service);
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
  readonly labels: readonly string[];
  readonly sectors: readonly string[];
  readonly services: readonly string[];
}

export function matchesArchiveState(facets: ArchiveItemFacets, state: ArchiveState): boolean {
  if (state.pillar !== 'all' && !facets.pillars.includes(state.pillar)) return false;
  /* `includes`, never equality against the whole array: Labels are 0..N, so a project carrying
     both matches both filters and contributes exactly one row to either. */
  if (state.label && !facets.labels.includes(state.label)) return false;
  if (state.sector && !facets.sectors.includes(state.sector)) return false;
  if (state.service && !facets.services.includes(state.service)) return false;
  return true;
}
