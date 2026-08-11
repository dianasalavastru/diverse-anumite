/**
 * Service page module resolution — which modules a Service renders, and in what
 * order they take a station on the coordinate rail.
 *
 * OWNERSHIP: Workstream A (Service page). Pure: no Astro, no DOM, no CMS. It is
 * the one place the page's *composition* is decided, so the decision is unit
 * tested rather than spread across six templates — the same shape
 * `work-entry/modules.ts` established.
 *
 * ══════════════════════════════════════════════════════════════════════════
 *  ONE BLUEPRINT, ALL SERVICES
 * ══════════════════════════════════════════════════════════════════════════
 *
 * `SERVICE_PAGE_IA.md` opens with it — "**One blueprint for every service**; all
 * services share this Page IA and differ only in the content they consume" — and
 * closes with it: Reality Capture and Architecture & Design services differ in
 * "**content and UI-treatment differences only** — the Page IA (responsibility,
 * flow, modules, routing) is identical."
 *
 * So nothing below branches on `pillar`. A module renders when the Service
 * carries the content it consumes, and is absent when it does not. The approved
 * HiFi prototypes "Scanare 3D & documentare"; this file is what makes that a
 * *content* instance rather than the implementation.
 *
 * The single pillar-shaped behaviour on the page is not a module toggle at all:
 * the point-cloud field inside S-4 attaches to a demonstrating Work Entry whose
 * survey is published and cleared, which is a property of that *entry*, not of
 * the Service (see `captureSubject` below).
 *
 * ── ORDER FOLLOWS THE WIREFRAME, NOT THE HiFi ─────────────────────────────
 * `SERVICE_WIREFRAME.md` fixes the reading progression twice — under "Reading
 * progression" and again under "Decision principle":
 *
 *   S-1 orientation → S-2 problem recognition → S-3 solution understanding →
 *   S-4 representative evidence → S-5 conversation
 *
 * and composes S-3 as "what you get, **how it works**, what to expect" — its
 * Page IA module name, its reading-intent sentence and its component list all
 * put deliverables before process. The approved HiFi sequences its own stations
 * the other way (III process, IV deliverables). The wireframe is the
 * structurally authoritative document (its own header says so; README.md's
 * authority model puts wireframes above the HiFi for structure while the HiFi
 * governs look and motion), so deliverables precede process here. Nothing
 * visual changes — only the order of two sections, and it is the order the
 * upstream document specifies. The same call `work-entry/modules.ts` made for
 * Credits.
 *
 * ── S-3 IS ONE RESPONSIBILITY ACROSS TWO STATIONS ─────────────────────────
 * The wireframe's S-3 is one module; the approved HiFi gives deliverables and
 * process a station each. Both are true at once, and the Work Entry already set
 * the precedent: W-1 is one responsibility rendered as two stations (`hero` +
 * `facts`) because the wireframe resolved it spatially. Same here. The rail
 * indexes *sections*, not Page-IA modules, and no responsibility moved.
 *
 * ── ABSENCE, AND THE ONE MODULE THAT NEVER GOES ABSENT ────────────────────
 * Optional modules follow the Work Entry's rule: content or nothing, never an
 * empty heading and never a defaulted value.
 *
 * **S-4 is the exception, and it is an exception on purpose.** F5
 * (`SERVICE_PAGE_IA.md` S-4, `SERVICE_WIREFRAME.md` §"Empty state") requires
 * that with zero linked Work Entries the page "remains fully publishable" and
 * that the proof set is *replaced* by an editorial message + Contact CTA + Hub
 * back-path — "never an empty grid/carousel/counter", and "the absence of linked
 * Work Entries must never reduce confidence in the service itself". Hiding S-4
 * would satisfy "no empty grid" and violate everything else, so S-4 always
 * renders and switches surface. `COMPONENT_INVENTORY.md` scopes the Empty State
 * component to exactly two places, one of which is this one.
 *
 * S-1 and S-5 are unconditional too: S-1 is the page's identity (a Service
 * always has a name), and S-5 is the page's single reason to exist.
 *
 * ── WHAT IS DELIBERATELY NOT HERE ─────────────────────────────────────────
 * **No FAQ module.** `SERVICE_PAGE_IA.md` S-3 files it under "*Future:* an
 * optional FAQ block"; `SERVICE_WIREFRAME.md` lists the Accordion as *optional
 * secondary detail*; `CONTENT_MODEL.md` §2's Service field list has no
 * question/answer pairs and neither does `Service` in `types.ts`. The approved
 * HiFi hand-authors four Q&A pairs for one service — prototype content, not a
 * field. Building the disclosure would mean either inventing a CMS field
 * (forbidden) or hard-coding copy about one service into a generic page (the
 * thing this workstream must not do). Reported as a content-model gap instead.
 */

import { localize } from '../../lib/content';
import { mountableDerivative } from '../homepage/highlights';
import type { Locale, Service, WorkEntry } from '../../lib/content';

/**
 * One key per rendered section.
 *
 *   orientation   S-1
 *   problem       S-2
 *   deliverables  S-3 · what you get
 *   process       S-3 · how it works, and with what
 *   proof         S-4
 *   conversion    S-5
 */
export type ServiceModuleKey =
  | 'orientation'
  | 'problem'
  | 'deliverables'
  | 'process'
  | 'proof'
  | 'conversion';

export interface ServiceComposition {
  /** Rendered modules, in reading order. */
  readonly modules: readonly ServiceModuleKey[];
  /** 1-based rail station per rendered module. Absent modules have no station. */
  readonly stations: Readonly<Partial<Record<ServiceModuleKey, number>>>;
  /** The footer's station — the last one, as on every railed page. */
  readonly footerStation: number;
}

/* -------------------------------------------------------------------------- */
/* Module predicates                                                           */
/* -------------------------------------------------------------------------- */

/**
 * S-2 · Problem & fit. Consumes "what the service solves + use-cases
 * (Sector-relevant)" (Page IA S-2).
 *
 * `description` is read here too. `types.ts` marks it "long-form explanation
 * (S-2/S-3)" without resolving which, and the wireframe does resolve it: S-2 is
 * the *prose-led* module ("Rich Text — what the service solves + who it's for +
 * use-cases"), while S-3 is the concrete substance — a deliverables list, a
 * process, specs. The service's own explanation of what it *is* belongs with the
 * prose, and answers the Page IA's first listed visitor question ("What exactly
 * is this service, and what does it solve?").
 *
 * The locale argument is not incidental: §11.2 forbids serving RO content under
 * an EN URL, and that applies to a module toggle as much as to a paragraph — an
 * EN page must not render a section header for prose that exists only in RO.
 */
export function hasProblemContent(service: Service, locale: Locale): boolean {
  return (
    (localize(service.description, locale)?.length ?? 0) > 0 ||
    (localize(service.problemSolved, locale)?.length ?? 0) > 0 ||
    service.sectors.length > 0
  );
}

/** S-3 · "What you get" — the deliverables list, per locale. */
export function hasDeliverables(service: Service, locale: Locale): boolean {
  return (localize(service.deliverables, locale)?.length ?? 0) > 0;
}

/**
 * S-3 · "How it works" — the process, plus the equipment/specification list the
 * wireframe carries as "Statistic ×n (optional — reality-capture
 * accuracy/specs)".
 *
 * Equipment toggles the section on its own: a survey service that states its
 * instruments but has no authored process still has something concrete to say,
 * and `CONTENT_MODEL.md` §2 lists "equipment & specs (capture services)" as a
 * Service field in its own right. It is **not** gated on pillar — one blueprint,
 * and an A&D service that declares software or equipment is not a special case.
 */
export function hasProcess(service: Service, locale: Locale): boolean {
  return (
    (localize(service.process, locale)?.length ?? 0) > 0 ||
    (localize(service.equipment, locale)?.length ?? 0) > 0
  );
}

/* -------------------------------------------------------------------------- */
/* S-4's point-cloud subject                                                   */
/* -------------------------------------------------------------------------- */

/**
 * The demonstrating Work Entry whose survey may be shown inside S-4, or `null`.
 *
 * ══════════════════════════════════════════════════════════════════════════
 *  A SERVICE HAS NO POINT CLOUD. A PROJECT DOES.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * `Service` carries no capture metadata and no derivative — `CaptureMetadata`
 * and `PointCloudDerivative` hang off the **Work Entry** (`types.ts`), because a
 * point cloud is the measured record of one building, not a property of an
 * offering. The approved HiFi shows a cloud on the service page and captions it
 * "acuratețe 2 mm · Leica RTC360"; §10.4 names that exact line as a prototype
 * artifact that "must not reach production", because it is a technical claim
 * made to institutional clients evaluating a surveying service.
 *
 * So the field renders only when a *real, cleared* survey stands behind it: one
 * demonstrating Work Entry, whose readout describes the cloud beside it and
 * whose title is credited and linked. §10.4's rule is "one entry, not two — a
 * readout describing a different survey than the cloud on screen would be a
 * false technical claim assembled from two true halves", and passing a single
 * subject to the existing seam is how that rule is kept.
 *
 * §19.4's publication gate is not re-implemented here: `mountableDerivative` is
 * the same single function the seam and the homepage selector use, so an
 * uncleared entry yields no subject and no fourth path exists around the gate.
 *
 * Selection order is `demonstratedBy`'s own — already locale-scoped and
 * curation-ordered by the query layer (`source.ts` `scopeService`). The first
 * demonstrating entry with a mountable derivative wins, which makes the choice
 * an editorial one the owner already controls, not an implicit ranking invented
 * here.
 *
 * `entries` is the full-entry index the route resolves; `demonstratedBy` is a
 * summary projection with no capture metadata, so the join is unavoidable.
 * A Service whose demonstrating entries carry no cleared survey — every A&D
 * service, and every RC service before clearance — simply gets no field, and
 * S-4 renders its Work Preview Cards exactly as before.
 */
export function captureSubject(
  service: Service,
  entries: ReadonlyMap<string, WorkEntry>,
): WorkEntry | null {
  for (const summary of service.demonstratedBy) {
    const entry = entries.get(summary._id);
    if (entry && mountableDerivative(entry)) return entry;
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/* Composition                                                                 */
/* -------------------------------------------------------------------------- */

/** Reading order, fixed by `SERVICE_WIREFRAME.md` §"Reading progression". */
const ORDER: readonly ServiceModuleKey[] = [
  'orientation', // S-1 · orientation
  'problem', // S-2 · problem recognition
  'deliverables', // S-3 · what you get
  'process', // S-3 · how it works
  'proof', // S-4 · representative evidence
  'conversion', // S-5 · conversation
];

export function serviceComposition(service: Service, locale: Locale): ServiceComposition {
  const renders: Readonly<Record<ServiceModuleKey, boolean>> = {
    orientation: true,
    problem: hasProblemContent(service, locale),
    deliverables: hasDeliverables(service, locale),
    process: hasProcess(service, locale),
    // F5: always. Zero demonstrating entries switches the surface, never the
    // presence of the module — see the file header.
    proof: true,
    conversion: true,
  };

  const modules = ORDER.filter((key) => renders[key]);

  const stations: Partial<Record<ServiceModuleKey, number>> = {};
  modules.forEach((key, index) => {
    stations[key] = index + 1;
  });

  return { modules, stations, footerStation: modules.length + 1 };
}

/** The station number as the section marker prints it (`01`, `02`, …). */
export function stationLabel(station: number): string {
  return String(station).padStart(2, '0');
}
