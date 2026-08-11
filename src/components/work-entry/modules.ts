/**
 * Work Entry module resolution — which modules this entry renders, and in what
 * order they take a station on the coordinate rail.
 *
 * OWNERSHIP: Workstream A (Work Entry). Pure: no Astro, no DOM, no CMS. It is
 * the one place the page's *composition* is decided, so the decision is unit
 * tested rather than spread across nine templates.
 *
 * ── ONE BLUEPRINT, ALL ENTRY TYPES (M3) ───────────────────────────────────
 * `WORK_ENTRY_PAGE_IA.md` §3: a universal base (W-1, W-2, W-3, W-5, W-6, W-7)
 * plus an optional **W-4** layer toggled by Entry Type, and "a cross-pillar /
 * composite entry (P10) may enable more than one module." Entry Types differ in
 * "content and module-toggle differences only — the Page IA … is identical."
 * That is exactly what this file expresses: one ordered list, filtered by what
 * the entry actually carries.
 *
 * ── ORDER FOLLOWS THE WIREFRAME, NOT THE HiFi ─────────────────────────────
 * `WORK_ENTRY_WIREFRAME.md` fixes the reading progression as
 *   W-1 orientation → W-2 the work → W-3 professional context →
 *   W-4 type substance → W-5/W-6/W-7 relationships & continue,
 * and states it twice ("Reading progression", "Validation"). The approved HiFi
 * sequences its own stations differently — it places Credits last, after the
 * capture field — but the wireframe is the *structurally* authoritative document
 * (its own header says so, and README.md's authority model puts wireframes above
 * the HiFi for structure while the HiFi governs look and motion). Credits
 * therefore precede the type module here. Nothing visual changes; only the order
 * of two sections, and it is the order the upstream document specifies.
 *
 * ── ABSENCE ───────────────────────────────────────────────────────────────
 * Only one absence rule exists upstream, and it is explicit: W-5 is "hidden
 * entirely when the entry demonstrates no service … no empty module"
 * (`WORK_ENTRY_WIREFRAME.md` W-5; Page IA W-5). COMPONENT_INVENTORY.md scopes
 * the **Empty State** component to the Work Archive (A-6) and the Service page
 * (S-4/F5) and to nowhere else — so a Work Entry never renders "nothing here"
 * copy. Every optional module follows the W-5 rule: it renders when it has
 * content and is absent when it does not. A field with no value renders no row.
 * Nothing is defaulted, and no placeholder is presented as a fact.
 *
 * W-1, W-3 and W-7 are unconditional. W-3 is unconditional by requirement —
 * Page IA W-3: "always present, regardless of Entry Type" — and it always has
 * content, because Attribution is mandatory in the schema.
 */

import { localize } from '../../lib/content';
import type { Locale, WorkEntry } from '../../lib/content';

/**
 * One key per rendered section. `hero` and `facts` are W-1's two halves: the
 * Page IA leaves "whether W-1 hero + Core Facts are one module or two" open
 * ("Open (carried into wireframing)"), and the wireframe resolves it spatially —
 * "an image-led opening" and then "the Metadata Strip sits quietly as the first
 * relevance signal". Two stations, one responsibility.
 */
export type WorkEntryModuleKey =
  | 'hero'
  | 'facts'
  | 'evidence'
  | 'credits'
  | 'competition'
  | 'capture'
  | 'services'
  | 'related'
  | 'onward';

export interface WorkEntryComposition {
  /** Rendered modules, in reading order. */
  readonly modules: readonly WorkEntryModuleKey[];
  /** 1-based rail station per rendered module. Absent modules have no station. */
  readonly stations: Readonly<Partial<Record<WorkEntryModuleKey, number>>>;
  /** The footer's station — the last one, as on the Homepage. */
  readonly footerStation: number;
}

/* -------------------------------------------------------------------------- */
/* Module predicates                                                           */
/* -------------------------------------------------------------------------- */

/**
 * `CONTENT_MODEL.md`:47 allows a **secondary** Entry Type, and :63 makes a
 * composite entry one canonical entry tagged to both. An entry that is
 * secondarily a competition still carries a competition's evidence, so the
 * module toggles on either position — the same rule the query layer already
 * applies to curated-view membership (`source.ts` `isCompetition`).
 */
export function isCompetitionEntry(entry: WorkEntry): boolean {
  return (
    entry.entryType.primary === 'competition-entry' ||
    entry.entryType.secondary.includes('competition-entry')
  );
}

/**
 * The competition module's evidence, per `WORK_ENTRY_WIREFRAME.md` W-4:
 * "Statistic (award/prize) · Rich Text (jury/team)". A competition entry with
 * neither renders no module rather than an empty heading.
 *
 * Note the locale argument: an EN page shows only EN-authored awards. §11.2
 * forbids serving RO content under an EN URL, and that rule is not limited to
 * the page body — a Romanian award line under `/en/` would breach it just as a
 * Romanian paragraph would.
 */
export function hasCompetitionEvidence(entry: WorkEntry, locale: Locale): boolean {
  const awards = localize(entry.metadata.awards, locale);
  return (awards?.length ?? 0) > 0 || entry.metadata.team.length > 0;
}

/**
 * The Reality Capture module (`WORK_ENTRY_WIREFRAME.md` W-4). It toggles on the
 * presence of **capture metadata**, not on Discipline: `CONTENT_MODEL.md`:66
 * describes the capture module as carrying "use-case, method, deliverables,
 * accuracy, point-cloud", all of which live on `capture`. A Reality Capture
 * entry with no survey specifications has nothing type-specific to show, and an
 * Architecture entry that *was* surveyed does.
 *
 * The publication gate is not consulted here. §19.4 gates the point-cloud
 * *asset*, not the specifications: the query layer already drops an uncleared
 * derivative (`normalize.ts`), so an uncleared entry still states its accuracy
 * and equipment and simply shows the poster state — which is `TECHNICAL_
 * ARCHITECTURE.md` §10.2's documented end state, not a degraded one.
 */
export function hasCaptureEvidence(entry: WorkEntry): boolean {
  return entry.capture !== null;
}

/**
 * W-2 renders when there is something to see or read. The cover photograph is
 * already the hero, so an entry with neither description nor gallery has no
 * second evidence surface — and the wireframe's W-2 is "Rich Text (description)
 * · Gallery · Media Viewer", all three of which would be empty.
 */
export function hasEvidence(entry: WorkEntry, locale: Locale): boolean {
  const description = localize(entry.description, locale);
  return (description?.length ?? 0) > 0 || entry.gallery.length > 0;
}

/* -------------------------------------------------------------------------- */
/* Field placement — where a Metadata-axis field renders                       */
/* -------------------------------------------------------------------------- */

/**
 * Awards and Team belong to the **competition module** when that module renders,
 * and to Project Metadata otherwise.
 *
 * Two upstream documents assign them differently. `WORK_ENTRY_WIREFRAME.md` W-4
 * composes the competition module from "Statistic (award/prize) · Rich Text
 * (jury/team)"; `TECHNICAL_ARCHITECTURE.md` §7.3's field table routes the whole
 * Metadata axis — "Year, Location, Client, Awards, Area, Team" — to Project
 * Metadata. The wireframe is upstream of the technical architecture (§1.1: "If
 * this document appears to conflict with any document above it, the upstream
 * document wins"), so the wireframe governs the competition case and §7.3
 * governs every other entry.
 *
 * The result renders each field exactly once, in the module whose responsibility
 * it is, and never drops one.
 */
export function awardsAndTeamInCompetition(entry: WorkEntry, locale: Locale): boolean {
  return isCompetitionEntry(entry) && hasCompetitionEvidence(entry, locale);
}

/**
 * Deliverables follow the same rule against the same pair of documents:
 * `WORK_ENTRY_WIREFRAME.md` W-4 gives the capture module "Rich Text
 * (equipment/deliverables)", §7.3 routes Deliverables to Project Metadata.
 * Capture module present → capture module; otherwise → Project Metadata.
 */
export function deliverablesInCapture(entry: WorkEntry): boolean {
  return hasCaptureEvidence(entry);
}

/* -------------------------------------------------------------------------- */
/* Composition                                                                 */
/* -------------------------------------------------------------------------- */

/** Reading order, fixed by `WORK_ENTRY_WIREFRAME.md` §"Reading progression". */
const ORDER: readonly WorkEntryModuleKey[] = [
  'hero', // W-1 · orientation
  'facts', // W-1 · core facts
  'evidence', // W-2 · the work
  'credits', // W-3 · professional context
  'competition', // W-4 · type-specific
  'capture', // W-4 · type-specific
  'services', // W-5 · demonstrated service
  'related', // W-6 · related work
  'onward', // W-7 · hub back-path + light contact
];

export function workEntryComposition(entry: WorkEntry, locale: Locale): WorkEntryComposition {
  const renders: Readonly<Record<WorkEntryModuleKey, boolean>> = {
    hero: true,
    facts: true,
    evidence: hasEvidence(entry, locale),
    credits: true,
    competition: awardsAndTeamInCompetition(entry, locale),
    capture: hasCaptureEvidence(entry),
    // W-5: hidden entirely when the entry demonstrates no service. The query
    // layer has already scoped `services` to the active locale, so an entry
    // whose only Service is untranslated hides the module under /en/ rather
    // than linking to a page §11.2 guarantees does not exist.
    services: entry.services.length > 0,
    // W-6: canonical related references only. IA §2.3 makes Work ⇄ Work an
    // authored relationship; nothing here infers one from shared taxonomy.
    related: entry.relatedWork.length > 0,
    onward: true,
  };

  const modules = ORDER.filter((key) => renders[key]);

  const stations: Partial<Record<WorkEntryModuleKey, number>> = {};
  modules.forEach((key, index) => {
    stations[key] = index + 1;
  });

  return { modules, stations, footerStation: modules.length + 1 };
}
