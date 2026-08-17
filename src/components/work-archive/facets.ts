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
 * so the controls read the same on every build and in both locales. STAGE 6
 * closed Sector too, so every axis here is now a closed vocabulary and none of
 * them needs an "authored values follow, sorted" tail.
 */

import {
  PROJECT_LABELS,
  SECTORS,
  localize,
  type Locale,
  type Pillar,
  type ServiceKey,
  type ServiceSummary,
  type WorkArchiveItem,
} from '../../lib/content';
import type { ArchiveFacetValues, ArchiveItemFacets } from './archive-state';

/**
 * One item's facets, primary + secondary where the axis has both.
 *
 * See `ArchiveItemFacets` for why secondary values count: it is how
 * `inPillarScope` already defines membership upstream, and the visitor-facing
 * filter must not answer that question differently from the curated view built
 * on the same axis. Since Stage 5 that is plain equality on one authored Pillar;
 * Labels are a plain 0..N set read exactly as `isCompetition` reads them.
 */
export function itemFacets(item: WorkArchiveItem, locale: Locale): ArchiveItemFacets {
  return {
    /* One authored Pillar per project since Stage 5 — a single-element list, kept as a list so
       `matchesArchiveState` stays one shape across every facet. */
    pillars: [item.pillar],
    labels: [...item.labels],
    /* One authored Sector per project since Stage 6 — a single-element list, kept as a list so
       every facet in this shape is matched the same way. */
    sectors: [item.sector],
    /*
     * Matched by the **immutable `ServiceKey`** (v3.1 §14.3), never by a slug or a name.
     *
     * It used to be the localized slug, which made the archive's public filter vocabulary a
     * function of two editable, per-locale strings: renaming a Service's Romanian slug silently
     * invalidated every shared `?service=` link, and the RO and EN archives disagreed about what
     * the same filter was called. `key` is the one identifier the model guarantees will not
     * move, which is exactly why Stage 8 made it required, unique and immutable.
     *
     * Locale no longer gates membership here. It still gates the *control*: a Service with no
     * name in this locale produces no option (see `serviceOptions`), and a value no control can
     * express is not restorable — which is the rule the island already applies.
     */
    services: item.services.map((service) => service.key),
  };
}

function present<T extends string>(canonical: readonly T[], found: ReadonlySet<string>): T[] {
  return canonical.filter((value) => found.has(value));
}

/**
 * The option lists the controls render, in frozen-vocabulary order.
 *
 * ── TWO POPULATION RULES, AND THE LINE BETWEEN THEM ────────────────────────
 * **Sector and Service are PRESENCE-scoped**: an option appears only if some item in the archive
 * carries it, so a control never offers a value that matches nothing.
 *
 * **Label is VOCABULARY-scoped**: both canonical Labels are always offered, even at zero
 * matches (2026-08-17 decision, `DECISIONS_LOG.md` #101). `PROJECT_LABELS` is a closed
 * two-value global vocabulary, and *Proiect de diplomă* disappearing from the control until the
 * first such project is published makes the archive's own taxonomy look incomplete — the visitor
 * cannot tell an unused Label from a Label that does not exist. Selecting it is a valid state
 * that renders the existing empty state.
 *
 * The exception is bounded to Labels **on purpose**. Sector is a seven-value vocabulary and
 * Services are a growing catalogue of content objects; offering every one of those regardless of
 * content would put dead ends in front of the visitor at a scale two chips do not.
 */
export function collectFacetValues(
  items: readonly WorkArchiveItem[],
  locale: Locale,
): ArchiveFacetValues {
  const sectors = new Set<string>();
  const services = new Set<string>();

  for (const item of items) {
    const facets = itemFacets(item, locale);
    for (const value of facets.sectors) sectors.add(value);
    for (const value of facets.services) services.add(value);
  }

  return {
    labels: [...PROJECT_LABELS],
    sectors: present(SECTORS, sectors),
    services: [...services],
  };
}

/**
 * The Service options: the *authored name* of every Service the archive demonstrates, carried
 * by its immutable `key` and tagged with its authored `pillar`.
 *
 * Services are content objects, not an enum (`CONTENT_MODEL.md` §2), so their labels can only
 * come from `ContentSource.serviceSummaries()` — never from a label map in `vocabulary.ts`.
 * Order is B's (curation-led); Services no entry demonstrates are dropped, so no control ever
 * offers a value that matches nothing.
 *
 * ── STAGE 5's REALITY-CAPTURE SCOPE IS GONE ────────────────────────────────
 * This used to `continue` past every Service whose pillar was not `reality-capture`, because
 * Service was the one pillar-contextual refinement left after Discipline was retired and
 * widening it depended on the Service contract Stage 8 completed. It has, so the refinement now
 * exists under **all three** archive modes (2026-08-17 decision, `DECISIONS_LOG.md` #101).
 *
 * The list returned here is the whole demonstrated set across both Pillars; narrowing it to a
 * mode is `servicesInScope`'s job, and it is a pure function of the key, so the control and the
 * URL validator cannot disagree about which Services a mode offers.
 *
 * **Presence-scoping is unchanged, and deliberately so.** Labels became vocabulary-driven in the
 * same decision; Services did not. A closed two-value vocabulary can afford to offer a value
 * that matches nothing; a growing content-object catalogue cannot.
 */
export interface ServiceOption {
  readonly key: ServiceKey;
  readonly pillar: Pillar;
  readonly label: string;
}

export function serviceOptions(
  summaries: readonly ServiceSummary[],
  available: readonly string[],
  locale: Locale,
): ServiceOption[] {
  const options: ServiceOption[] = [];

  for (const summary of summaries) {
    const label = localize(summary.name, locale);
    if (!label || !available.includes(summary.key)) continue;
    options.push({ key: summary.key, pillar: summary.pillar, label });
  }

  return options;
}
