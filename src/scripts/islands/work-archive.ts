/**
 * Work Archive island — filter, sort, URL state and the masonry engine.
 *
 * OWNERSHIP: Workstream A. §5.1 budgets it as "Archive filter + sort + URL
 * state | Work Archive | vanilla, ~3 KB"; §3 fixes the retrieval model as
 * "Client-side over the prerendered set; **no search index**", justified at
 * 20–150 entries. Nothing here fetches anything.
 *
 * ── IT IS AN ENHANCEMENT, NOT THE PAGE ────────────────────────────────────
 * Without this file the archive is the complete set in discovery order, every
 * card a link — the browse IA Step 4 makes default. This adds refinement on top.
 * §14.0: "No interactive surface may become unreachable when an enhancement API
 * is absent"; the controls are hidden by a `<noscript>` rule rather than left
 * inert, and no content is ever hidden from a crawler (§12).
 *
 * ── THREE RULES IT EXISTS TO KEEP ─────────────────────────────────────────
 *  1. **It never orders anything.** Every ordering was computed at build through
 *     B's `sortArchive` and written onto the cells as `data-rank-*`; the client
 *     picks one and writes it to CSS `order`. There is no comparator here, so
 *     frontend logic cannot redefine editorial priority
 *     (`WORK_ARCHIVE_IMPLEMENTATION_NOTES.md`:113).
 *  2. **It never invents a filter value.** The state module validates against
 *     the values the rendered cells actually carry, and the controls are
 *     server-rendered from the canonical vocabularies.
 *  3. **It never lets state exist only visually.** Every change updates the
 *     controls' ARIA state, the readout, the polite live region and the URL.
 *
 * ── HISTORY (§23.5) ───────────────────────────────────────────────────────
 * "`replaceState` for incremental changes, `pushState` for the pillar switch;
 * full restore on load." A pillar switch is a discrete change of scope and earns
 * a back-step; a facet or sort change is a refinement within one scope and would
 * otherwise fill history with near-identical entries.
 */

import {
  DEFAULT_ARCHIVE_STATE,
  archiveQuery,
  clearFilters,
  contextualFacet,
  hasActiveFilters,
  matchesArchiveState,
  parseArchiveState,
  withPillar,
  type ArchiveFacetValues,
  type ArchiveItemFacets,
  type ArchiveState,
  type PillarMode,
} from '../../components/work-archive/archive-state';
import { countForm } from '../../lib/i18n/work-archive';
import type { Locale } from '../../lib/i18n/routes';

/* A module, not a global script — top-level bindings here must not collide with
   the motion runtime's (see focus-carousel.ts for the same note). */
export {};

const root = document.querySelector<HTMLElement>('[data-archive]');
const grid = document.querySelector<HTMLElement>('[data-archive-grid]');

if (root && grid) start(root, grid);

function start(root: HTMLElement, grid: HTMLElement): void {
  const locale: Locale = document.documentElement.lang === 'en' ? 'en' : 'ro';
  const basePath = root.dataset.archiveBase || location.pathname;

  const cells = [...grid.querySelectorAll<HTMLElement>('[data-work]')];
  const region = root.querySelector<HTMLElement>('[data-archive-region]');
  const emptyState = root.querySelector<HTMLElement>('[data-archive-empty]');
  const countValue = root.querySelector<HTMLElement>('[data-archive-count]');
  const countNounEl = root.querySelector<HTMLElement>('[data-archive-count-noun]');
  const status = root.querySelector<HTMLElement>('[data-archive-status]');
  const summary = root.querySelector<HTMLElement>('[data-active-summary]');
  const clearButton = root.querySelector<HTMLElement>('[data-archive-clear]');
  const groups = [...root.querySelectorAll<HTMLElement>('[role="radiogroup"][data-facet]')];
  const selects = [...root.querySelectorAll<HTMLSelectElement>('select[data-facet]')];

  /**
   * The three noun forms, authored in `work-archive.ts` and carried on the
   * readout. Only the RULE is imported (`countForm`) — Romanian needs three
   * forms and English two — so no message table reaches the client bundle.
   */
  const countNouns: Record<'one' | 'few' | 'many', string> = {
    one: summary?.dataset.countOne ?? '',
    few: summary?.dataset.countFew ?? '',
    many: summary?.dataset.countMany ?? '',
  };

  /* ---------------------------------------------------------------------- */
  /* Reading the rendered set                                               */
  /* ---------------------------------------------------------------------- */

  const list = (value: string | undefined): string[] =>
    (value ?? '').split(' ').filter((entry) => entry.length > 0);

  const facets = new WeakMap<HTMLElement, ArchiveItemFacets>();
  for (const cell of cells) {
    facets.set(cell, {
      pillars: list(cell.dataset.facetPillars),
      types: list(cell.dataset.facetTypes),
      sectors: list(cell.dataset.facetSectors),
      disciplines: list(cell.dataset.facetDisciplines),
      services: list(cell.dataset.facetServices),
    });
  }

  /**
   * The restorable values — read from the CONTROLS, not from the cells.
   *
   * The two sets are deliberately not the same. The controls are the projection
   * the build already scoped: Entry Type and Sector to what the archive holds,
   * and each contextual refinement to its own pillar (see facets.ts). A cell can
   * carry a value that is not a valid refinement here — a cross-pillar entry
   * carries its Reality Capture discipline into the Architecture & Design view —
   * and validating against the cells would let a URL set a state with no control
   * to show it, which is a filter existing only in the address bar.
   *
   * So the rule is: **a value is restorable exactly when a control can express
   * it.** Anything else is ignored, per §23.1's "an unrecognised value is ignored
   * rather than echoed".
   */
  const optionValues = (facet: string): string[] => {
    const group = groups.find((candidate) => candidate.dataset.facet === facet);
    if (group) {
      return [...group.querySelectorAll<HTMLElement>('[role="radio"]')]
        .map((radio) => radio.dataset.value ?? '')
        .filter((value) => value.length > 0);
    }
    const select = selects.find((candidate) => candidate.dataset.facet === facet);
    return select
      ? [...select.options].map((option) => option.value).filter((value) => value.length > 0)
      : [];
  };

  const available: ArchiveFacetValues = {
    types: optionValues('type'),
    sectors: optionValues('sector'),
    disciplines: optionValues('discipline'),
    services: optionValues('service'),
  };

  /* ---------------------------------------------------------------------- */
  /* The masonry engine                                                     */
  /* ---------------------------------------------------------------------- */

  /**
   * Row spans measured from the rendered card, exactly as the approved HiFi
   * computes them ("row-span from measured height; aspect-ratios make it
   * deterministic"). The engine measures HEIGHT and nothing else — which card
   * sits where is the order the build already decided.
   *
   * Below the single-column breakpoint the spans are cleared, because there is
   * no masonry to compute (the HiFi does the same).
   */
  const ROW_HEIGHT = 8;
  const SINGLE_COLUMN = 640;

  function layout(): void {
    const single = window.innerWidth <= SINGLE_COLUMN;
    const rowGap = Number.parseFloat(getComputedStyle(grid).rowGap) || 24;

    for (const cell of cells) {
      if (single || cell.hidden) {
        cell.style.gridRowEnd = '';
        continue;
      }
      const card = cell.firstElementChild;
      if (!(card instanceof HTMLElement)) continue;
      const height = card.getBoundingClientRect().height;
      cell.style.gridRowEnd = `span ${Math.max(1, Math.ceil((height + rowGap) / (ROW_HEIGHT + rowGap)))}`;
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Controls                                                               */
  /* ---------------------------------------------------------------------- */

  function groupFor(facet: string): HTMLElement | undefined {
    return groups.find((group) => group.dataset.facet === facet);
  }

  function radiosOf(group: HTMLElement): HTMLElement[] {
    return [...group.querySelectorAll<HTMLElement>('[role="radio"]')];
  }

  /** Reflect a value onto a radiogroup, including its roving tabindex. */
  function setGroupValue(facet: string, value: string): void {
    const group = groupFor(facet);
    if (!group) return;

    const radios = radiosOf(group);
    const known = radios.some((radio) => (radio.dataset.value ?? '') === value);
    const target = known ? value : '';

    for (const radio of radios) {
      const on = (radio.dataset.value ?? '') === target;
      radio.classList.toggle('on', on);
      radio.setAttribute('aria-checked', on ? 'true' : 'false');
      radio.tabIndex = on ? 0 : -1;
    }
  }

  /** The visible label of the selected option — the words the readout reuses. */
  function groupLabel(facet: string): string {
    const group = groupFor(facet);
    const radio = group?.querySelector<HTMLElement>('[aria-checked="true"]');
    return radio?.textContent?.trim() ?? '';
  }

  function selectFor(facet: string): HTMLSelectElement | undefined {
    return selects.find((select) => select.dataset.facet === facet);
  }

  function selectLabel(facet: string): string {
    const select = selectFor(facet);
    return select?.selectedOptions[0]?.textContent?.trim() ?? '';
  }

  /* ---------------------------------------------------------------------- */
  /* Applying a state                                                       */
  /* ---------------------------------------------------------------------- */

  let state: ArchiveState = DEFAULT_ARCHIVE_STATE;

  interface ApplyOptions {
    /** `push` for a mode change, `replace` for a refinement, `none` on popstate. */
    history?: 'push' | 'replace' | 'none';
    /** Suppressed on first load: the page has not changed under anyone yet. */
    announce?: boolean;
    /**
     * Resolve every visible cell's reveal immediately. True after any
     * interaction — a cell the visitor just asked for must not wait to be
     * scrolled past. False on first load, where the authored scroll reveal is
     * the composition (MOTION_NOTES.md §"Reveal family").
     */
    resolveReveals?: boolean;
  }

  function apply(
    next: ArchiveState,
    { history: mode = 'replace', announce = true, resolveReveals = true }: ApplyOptions = {},
  ): void {
    state = next;

    /* -- controls ------------------------------------------------------- */
    setGroupValue('pillar', state.pillar);
    setGroupValue('type', state.type ?? '');
    setGroupValue('discipline', state.discipline ?? '');
    setGroupValue('service', state.service ?? '');

    const sector = selectFor('sector');
    if (sector) sector.value = state.sector ?? '';
    const sort = selectFor('sort');
    if (sort) sort.value = state.sort;

    /* -- the ONE contextual refinement (§23.5: none under All) ---------- */
    const refinement = contextualFacet(state.pillar);
    for (const row of root.querySelectorAll<HTMLElement>('[data-contextual]')) {
      row.hidden = row.dataset.contextual !== state.pillar;
    }
    if (!refinement) {
      setGroupValue('discipline', '');
      setGroupValue('service', '');
    }

    /* -- results -------------------------------------------------------- */
    const rankAttribute =
      state.sort === 'curated' ? `data-rank-curated-${state.pillar}` : `data-rank-${state.sort}`;

    let visible = 0;
    for (const cell of cells) {
      const cellFacets = facets.get(cell);
      const shown = cellFacets !== undefined && matchesArchiveState(cellFacets, state);
      cell.hidden = !shown;
      if (!shown) continue;
      visible += 1;
      cell.style.order = cell.getAttribute(rankAttribute) ?? '0';
      /* A cell revealed by a filter change may never intersect again, so it is
         resolved here rather than left to the reveal observer. Motion is never
         load-bearing (VISUAL_DIRECTION_v2.0 §12) and content must never be
         reachable only by scrolling past it. */
      if (resolveReveals) cell.classList.add('in');
    }

    grid.hidden = visible === 0;
    if (emptyState) emptyState.hidden = visible > 0;

    /* -- readouts ------------------------------------------------------- */
    const noun = countNouns[countForm(visible, locale)];
    if (countValue) countValue.textContent = String(visible);
    if (countNounEl) countNounEl.textContent = noun;

    if (summary) {
      const parts = [
        state.pillar !== 'all' ? groupLabel('pillar') : '',
        state.type ? groupLabel('type') : '',
        state.sector ? selectLabel('sector') : '',
        state.discipline ? groupLabel('discipline') : '',
        state.service ? groupLabel('service') : '',
      ].filter((part) => part.length > 0);
      summary.textContent = parts.length > 0 ? parts.join(' · ') : (summary.dataset.none ?? '');
    }

    if (clearButton) clearButton.hidden = !hasActiveFilters(state);

    /* F1 back-path: offered only while a pillar scope is active (A-3). */
    for (const hub of root.querySelectorAll<HTMLElement>('[data-hub-link]')) {
      hub.hidden = hub.dataset.hubLink !== state.pillar;
    }

    /* -- focus (WCAG 2.2 AA — never lose it) ---------------------------- */
    const active = document.activeElement;
    if (active instanceof HTMLElement && active.closest('[data-work][hidden]')) {
      region?.focus();
    }

    /* -- URL ------------------------------------------------------------ */
    if (mode !== 'none') {
      const query = archiveQuery(state);
      const url = query ? `${basePath}?${query}` : basePath;
      if (mode === 'push') history.pushState(null, '', url);
      else history.replaceState(null, '', url);
    }

    /* -- announcement --------------------------------------------------- */
    if (announce && status) {
      status.textContent = visible > 0 ? `${visible} ${noun}` : (emptyState?.querySelector('h2')?.textContent ?? '');
    }

    requestAnimationFrame(layout);
  }

  /* ---------------------------------------------------------------------- */
  /* Events                                                                 */
  /* ---------------------------------------------------------------------- */

  /** A pillar change is a mode change: it pushes, and it re-scopes refinements. */
  function selectFacet(facet: string, value: string): void {
    if (facet === 'pillar') {
      apply(withPillar(state, (value || 'all') as PillarMode), { history: 'push' });
      return;
    }
    apply({ ...state, [facet]: value || null } as ArchiveState, { history: 'replace' });
  }

  for (const group of groups) {
    const facet = group.dataset.facet ?? '';

    group.addEventListener('click', (event) => {
      const radio = (event.target as HTMLElement | null)?.closest<HTMLElement>('[role="radio"]');
      if (!radio || !group.contains(radio)) return;
      selectFacet(facet, radio.dataset.value ?? '');
    });

    /* Radiogroup keyboard contract: arrows move AND select, Home/End jump.
       Selection follows focus, which is what a radio group promises. */
    group.addEventListener('keydown', (event) => {
      const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
      if (!keys.includes(event.key)) return;

      const radios = radiosOf(group);
      const current = radios.findIndex((radio) => radio === document.activeElement);
      if (current === -1) return;

      event.preventDefault();
      const last = radios.length - 1;
      const next =
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? last
            : event.key === 'ArrowRight' || event.key === 'ArrowDown'
              ? (current + 1) % radios.length
              : (current - 1 + radios.length) % radios.length;

      const target = radios[next];
      if (!target) return;
      selectFacet(facet, target.dataset.value ?? '');
      target.focus();
    });
  }

  for (const select of selects) {
    select.addEventListener('change', () => {
      selectFacet(select.dataset.facet ?? '', select.value);
    });
  }

  for (const button of root.querySelectorAll<HTMLElement>('[data-archive-clear], [data-archive-reset]')) {
    button.addEventListener('click', () => apply(clearFilters(state), { history: 'replace' }));
  }

  /**
   * Empty-state suggestions are real links carrying real URLs. Intercepting them
   * keeps the change in-page; a modified click (new tab, new window) is left to
   * the browser, which is the behaviour the HiFi's `preventDefault()`-everything
   * exit script destroyed.
   */
  for (const suggestion of root.querySelectorAll<HTMLAnchorElement>('[data-archive-suggest]')) {
    suggestion.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      const query = suggestion.search.replace(/^\?/, '');
      apply(parseArchiveState(query, available), { history: 'push' });
      region?.focus();
    });
  }

  addEventListener('popstate', () => {
    apply(parseArchiveState(location.search, available), { history: 'none' });
  });

  let resizeTimer: ReturnType<typeof setTimeout> | undefined;
  addEventListener(
    'resize',
    () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(layout, 120);
    },
    { passive: true },
  );

  /* ---------------------------------------------------------------------- */
  /* Restore (§23.5, "full restore on load")                                */
  /* ---------------------------------------------------------------------- */

  const restored = parseArchiveState(location.search, available);
  /* Normalise the address bar when the incoming URL carried anything the
     contract does not recognise, so a shared link and the state it produced
     never disagree. An already-clean URL is left untouched. */
  const normalised = archiveQuery(restored);
  const incoming = location.search.replace(/^\?/, '');
  apply(restored, {
    history: normalised === incoming ? 'none' : 'replace',
    announce: false,
    resolveReveals: false,
  });

  addEventListener('load', layout);
  if (document.fonts) void document.fonts.ready.then(layout);
}
