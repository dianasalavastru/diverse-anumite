/**
 * Projecting `WorkArchiveItem`s onto the archive's facet controls and cells.
 *
 * OWNERSHIP: Workstream A. Build-time only — it imports `localize` and the
 * frozen vocabularies, and is never pulled into the island bundle (which needs
 * `archive-state.ts` alone).
 *
 * ── ONE RULE GOVERNS THIS WHOLE FILE ───────────────────────────────────────
 * `WORK_ARCHIVE_IMPLEMENTATION_NOTES.md`:84, adopted verbatim at §7.2: expose
 * the canonical fields "as independent dimensions. Do not merge them." So each
 * axis is projected on its own, and the option list for each control is built
 * from what the archive actually contains — the archive never offers a filter
 * value no entry carries, and never invents one the Content Model does not have.
 *
 * Vocabulary ORDER comes from the frozen enumerations rather than from the data,
 * so the controls read the same on every build and in both locales. Sector is the
 * one open axis (`CONTENT_MODEL.md`:53 ends in "…"), so its known values keep
 * their canonical order and any authored value beyond them follows, sorted.
 */

import {
  DISCIPLINES,
  DISCIPLINE_TO_PILLAR,
  ENTRY_TYPES,
  KNOWN_SECTORS,
  localize,
  type Locale,
  type ServiceSummary,
  type WorkArchiveItem,
} from '../../lib/content';
import type { ArchiveFacetValues, ArchiveItemFacets } from './archive-state';

/**
 * One item's facets, primary + secondary where the axis has both.
 *
 * See `ArchiveItemFacets` for why secondary values count: it is how
 * `inPillarScope` and `isCompetition` already define membership upstream, and
 * the visitor-facing filter must not answer that question differently from the
 * curated view built on the same axis.
 */
export function itemFacets(item: WorkArchiveItem, locale: Locale): ArchiveItemFacets {
  return {
    pillars: [item.pillars.primary, ...item.pillars.secondary],
    types: [item.entryType.primary, ...item.entryType.secondary],
    sectors: [...item.sectors],
    disciplines: [item.discipline.primary, ...item.discipline.secondary],
    /* Matched by localized slug (`types.ts`, `WorkArchiveItem.services`); an
       untranslated Service simply contributes nothing in that locale, which is
       the same gate §11.2 applies to its page. */
    services: item.services
      .map((service) => localize(service.slug, locale))
      .filter((slug): slug is string => slug !== null),
  };
}

function present<T extends string>(canonical: readonly T[], found: ReadonlySet<string>): T[] {
  return canonical.filter((value) => found.has(value));
}

/** The option lists the controls render, in frozen-vocabulary order. */
export function collectFacetValues(
  items: readonly WorkArchiveItem[],
  locale: Locale,
): ArchiveFacetValues {
  const types = new Set<string>();
  const sectors = new Set<string>();
  const disciplines = new Set<string>();
  const services = new Set<string>();

  for (const item of items) {
    const facets = itemFacets(item, locale);
    for (const value of facets.types) types.add(value);
    for (const value of facets.sectors) sectors.add(value);
    for (const value of facets.disciplines) disciplines.add(value);
    for (const value of facets.services) services.add(value);
  }

  const knownSectors = present(KNOWN_SECTORS, sectors);
  const authoredSectors = [...sectors]
    .filter((value) => !(KNOWN_SECTORS as readonly string[]).includes(value))
    .sort();

  return {
    types: present(ENTRY_TYPES, types),
    sectors: [...knownSectors, ...authoredSectors],
    /**
     * Scoped to the pillar whose refinement this is.
     *
     * Discipline is the Architecture & Design refinement, and
     * `WORK_ARCHIVE_IMPLEMENTATION_NOTES.md`:90 names the axis "the
     * Architecture-pillar craft". A cross-pillar entry
     * (`CONTENT_MODEL.md`:63) is visible in BOTH pillar views and carries its
     * Reality Capture discipline with it, so an unscoped list offers "Reality
     * Capture" as a *discipline* refinement inside Architecture & Design —
     * a control that exposes the taxonomy's plumbing rather than reducing
     * complexity (`WORK_ARCHIVE_PAGE_IA.md` A-4). The derivation table §7.4
     * decides membership; nothing new is defined here.
     *
     * Matching is unaffected: an item is still matched on its full Discipline
     * assignment, so a cross-pillar entry remains reachable by its A&D
     * discipline inside A&D and by Service inside Reality Capture.
     */
    disciplines: present(DISCIPLINES, disciplines).filter(
      (value) => DISCIPLINE_TO_PILLAR[value] === 'architecture-design',
    ),
    services: [...services],
  };
}

/**
 * The Service options: the *authored name* of every Service the archive
 * demonstrates, keyed by its localized slug.
 *
 * Services are content objects, not an enum (`CONTENT_MODEL.md` §2), so their
 * labels can only come from `ContentSource.serviceSummaries()` — never from a
 * label map in `vocabulary.ts`. Order is B's (curation-led); Services no entry
 * demonstrates are dropped, so the Reality Capture refinement never offers a
 * value that matches nothing.
 *
 * Scoped to Reality Capture for the same reason the Discipline list is scoped to
 * Architecture & Design: this is *that pillar's* refinement. A Service carries an
 * authored `pillar` (IA §2.3, "Service → Pillar"), so the scope is read, never
 * derived — and an Architecture & Design service demonstrated by a cross-pillar
 * entry does not leak into the Reality Capture control.
 */
export interface ServiceOption {
  readonly slug: string;
  readonly label: string;
}

export function serviceOptions(
  summaries: readonly ServiceSummary[],
  available: readonly string[],
  locale: Locale,
): ServiceOption[] {
  const options: ServiceOption[] = [];

  for (const summary of summaries) {
    if (summary.pillar !== 'reality-capture') continue;
    const slug = localize(summary.slug, locale);
    const label = localize(summary.name, locale);
    if (!slug || !label || !available.includes(slug)) continue;
    options.push({ slug, label });
  }

  return options;
}
