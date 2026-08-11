/**
 * Display labels for the frozen controlled vocabularies, plus the Pillar → route
 * adapter.
 *
 * OWNERSHIP: Workstream A commits the STRUCTURE; Workstream C authors the
 * STRINGS — the same two-party rule as `ui.ts` (TECHNICAL_ARCHITECTURE.md §23.3,
 * "i18n message files | A (RO/EN strings authored by C)").
 *
 * WHY THIS FILE EXISTS. `src/lib/content/types.ts` carries machine values only,
 * and says so explicitly: "display labels are RO/EN copy owned by Workstream C
 * and deliberately absent from this file." Every surface that shows a facet
 * therefore needs one shared label map, or each page invents its own — which is
 * how the collapsed `data-type` attributes in the HiFis happened
 * (TECHNICAL_ARCHITECTURE.md §5.3, R6).
 *
 * AXIS DISCIPLINE. One label per axis value, and axes are never merged. The
 * approved Homepage HiFi prints "2024 · locuință" in a Work Preview Card's
 * metadata slot — Year plus a *Sector* on one card and an *Entry Type* on the
 * next. That is prototype debt: `WORK_ARCHIVE_IMPLEMENTATION_NOTES.md`:84,
 * adopted verbatim at §7.2, requires canonical fields to be exposed "as
 * independent dimensions. Do not merge them." Production renders Year + Entry
 * Type — one axis, from the frozen vocabulary.
 *
 * SCOPE. Only the axes the Homepage renders: Entry Type and Pillar. The
 * remaining axes (Status, Discipline, Sector, Attribution) get their labels when
 * the page that displays them is built — adding them now would be inventing
 * copy no page consumes.
 *
 * OD-8 (§11.3): Romanian copy is authored WITHOUT diacritics.
 */

import type { EntryType, Pillar } from '../content';
import type { Locale, RouteKey } from './routes';

/* -------------------------------------------------------------------------- */
/* Entry Type                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * EN labels are the canonical ones, transcribed from `CONTENT_MODEL.md`:56 and
 * restated at TECHNICAL_ARCHITECTURE.md §7.2:
 *   Design Project · Concept / Study · Competition Entry ·
 *   Survey / Documentation · Visualization Commission
 *
 * RO labels are PENDING (C): no upstream document authors them. The values below
 * are working translations, marked so they can be replaced without touching any
 * component.
 */
const ENTRY_TYPE_LABELS: Readonly<Record<Locale, Readonly<Record<EntryType, string>>>> = {
  ro: {
    'design-project': 'Proiect de design',
    'concept-study': 'Concept / studiu',
    'competition-entry': 'Concurs',
    'survey-documentation': 'Releveu / documentare',
    'visualization-commission': 'Vizualizare',
  },
  en: {
    'design-project': 'Design Project',
    'concept-study': 'Concept / Study',
    'competition-entry': 'Competition Entry',
    'survey-documentation': 'Survey / Documentation',
    'visualization-commission': 'Visualization Commission',
  },
};

export function entryTypeLabel(value: EntryType, locale: Locale): string {
  return ENTRY_TYPE_LABELS[locale][value];
}

/* -------------------------------------------------------------------------- */
/* Pillar                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * `CONTENT_MODEL.md`:44 — "Architecture & Design" and "Reality Capture". Both
 * names read identically in RO in the approved HiFis ("Arhitectura & Design",
 * "Reality Capture" — the second is used untranslated as a term of art).
 */
const PILLAR_LABELS: Readonly<Record<Locale, Readonly<Record<Pillar, string>>>> = {
  ro: {
    'architecture-design': 'Arhitectura & Design',
    'reality-capture': 'Reality Capture',
  },
  en: {
    'architecture-design': 'Architecture & Design',
    'reality-capture': 'Reality Capture',
  },
};

export function pillarLabel(value: Pillar, locale: Locale): string {
  return PILLAR_LABELS[locale][value];
}

/**
 * Pillar (content identity) → route key (URL identity).
 *
 * `types.ts` is explicit that these are three different namespaces: "These
 * identifiers are content identity, *not* URL tokens… Consumers map between the
 * three; nobody renames any of them." This is that map, declared once, so no
 * component ever concatenates a hub URL.
 *
 * Route values themselves stay frozen in `routes.ts` (OD-1, DECISIONS_LOG #76).
 */
const PILLAR_ROUTE_KEYS: Readonly<Record<Pillar, RouteKey>> = {
  'architecture-design': 'pillarHubArchitectureDesign',
  'reality-capture': 'pillarHubRealityCapture',
};

export function pillarRouteKey(value: Pillar): RouteKey {
  return PILLAR_ROUTE_KEYS[value];
}
