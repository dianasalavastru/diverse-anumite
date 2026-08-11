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
 * SCOPE. The axes a built page renders. Entry Type and Pillar arrived with the
 * Homepage; Status, Discipline, Sector, Attribution and Commissioning arrived
 * with the **Work Entry**, which is the page that displays them (W-1 Project
 * Metadata and W-3 Credits — `WORK_ENTRY_PAGE_IA.md`). Nothing is added for a
 * page that does not yet exist.
 *
 * OD-8 (§11.3): Romanian copy is authored WITHOUT diacritics.
 */

import type {
  Attribution,
  CommissioningContext,
  Discipline,
  EntryType,
  Pillar,
  Sector,
  Status,
} from '../content';
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

/**
 * Pillar (content identity) → the Work Archive's **query-parameter** token.
 *
 * The third namespace `types.ts` names. It is fixed upstream at
 * `WORK_ARCHIVE_IMPLEMENTATION_NOTES.md`:41 and :134 as `?pillar=architecture` |
 * `?pillar=reality-capture`, and TECHNICAL_ARCHITECTURE.md §23.5 freezes
 * `?pillar=` as part of the archive filter + URL contract. Note the A&D token is
 * `architecture`, NOT the content identifier `architecture-design` — declared
 * once here so no page concatenates a filtered-archive URL from a Pillar value
 * and quietly emits a token the archive will not recognise.
 */
const PILLAR_ARCHIVE_PARAMS: Readonly<Record<Pillar, string>> = {
  'architecture-design': 'architecture',
  'reality-capture': 'reality-capture',
};

export function pillarArchiveParam(value: Pillar): string {
  return PILLAR_ARCHIVE_PARAMS[value];
}

/* -------------------------------------------------------------------------- */
/* Status — CONTENT_MODEL.md:58                                                */
/* -------------------------------------------------------------------------- */

/**
 * A Metadata value, and where "Built" lives. Orthogonal to Entry Type: a Design
 * Project may be Built or Unbuilt. EN labels are the canonical ones; RO labels
 * are working translations, PENDING (C).
 */
const STATUS_LABELS: Readonly<Record<Locale, Readonly<Record<Status, string>>>> = {
  ro: {
    'built-realized': 'Construit / realizat',
    'unbuilt-proposal': 'Neconstruit / propunere',
    'in-progress': 'In lucru',
    delivered: 'Predat',
  },
  en: {
    'built-realized': 'Built / Realized',
    'unbuilt-proposal': 'Unbuilt / Proposal',
    'in-progress': 'In progress',
    delivered: 'Delivered',
  },
};

export function statusLabel(value: Status, locale: Locale): string {
  return STATUS_LABELS[locale][value];
}

/* -------------------------------------------------------------------------- */
/* Discipline — CONTENT_MODEL.md:46                                            */
/* -------------------------------------------------------------------------- */

const DISCIPLINE_LABELS: Readonly<Record<Locale, Readonly<Record<Discipline, string>>>> = {
  ro: {
    architecture: 'Arhitectura',
    'interior-design': 'Design interior',
    'reality-capture': 'Reality Capture',
    visualization: 'Vizualizare',
  },
  en: {
    architecture: 'Architecture',
    'interior-design': 'Interior Design',
    'reality-capture': 'Reality Capture',
    visualization: 'Visualization',
  },
};

export function disciplineLabel(value: Discipline, locale: Locale): string {
  return DISCIPLINE_LABELS[locale][value];
}

/* -------------------------------------------------------------------------- */
/* Attribution — CONTENT_MODEL.md:48, :60                                      */
/* -------------------------------------------------------------------------- */

/**
 * The *filter category* of the three-way split, and only that.
 * `CONTENT_MODEL.md`:60: "Attribution is the *filter category*; Role is the
 * *granular functions*; Authorship is the *scoped credit sentence*." These
 * labels name the category — they never stand in for the Authorship statement,
 * and W-3 renders all three separately.
 */
const ATTRIBUTION_LABELS: Readonly<Record<Locale, Readonly<Record<Attribution, string>>>> = {
  ro: {
    independent: 'Independent',
    collaboration: 'In colaborare',
    studio: 'In cadrul unui birou',
  },
  en: {
    independent: 'Independent',
    collaboration: 'Collaboration',
    studio: 'Studio',
  },
};

export function attributionLabel(value: Attribution, locale: Locale): string {
  return ATTRIBUTION_LABELS[locale][value];
}

/* -------------------------------------------------------------------------- */
/* Commissioning context — CONTENT_MODEL.md:49                                 */
/* -------------------------------------------------------------------------- */

const COMMISSIONING_LABELS: Readonly<
  Record<Locale, Readonly<Record<CommissioningContext, string>>>
> = {
  ro: {
    'self-initiated': 'Initiativa proprie',
    'client-commissioned': 'Comanda de client',
  },
  en: {
    'self-initiated': 'Self-initiated',
    'client-commissioned': 'Client-commissioned',
  },
};

export function commissioningLabel(value: CommissioningContext, locale: Locale): string {
  return COMMISSIONING_LABELS[locale][value];
}

/* -------------------------------------------------------------------------- */
/* Sector — CONTENT_MODEL.md:53 (deliberately OPEN)                            */
/* -------------------------------------------------------------------------- */

/**
 * The one axis with no closed vocabulary. `CONTENT_MODEL.md`:53 ends its list
 * with "…" and :100 makes a new sector "a new *value*, not a new structure";
 * `types.ts` keeps the type open for exactly that reason.
 *
 * So this map is a *translation table for the known values*, not a validation
 * list. An unknown value is not dropped and is not invented copy either — its
 * authored token is de-slugged (`adaptive-reuse` → `adaptive reuse`), which is a
 * formatting rule applied to authored content, never a new string. The label is
 * display-only: IA Step 5 keeps Sector a filter on the Archive, and this is the
 * Work Entry, where facets are display, not filters (`WORK_ENTRY_PAGE_IA.md`
 * W-1).
 */
const SECTOR_LABELS: Readonly<Record<Locale, Readonly<Record<string, string>>>> = {
  ro: {
    residential: 'Rezidential',
    hospitality: 'Ospitalitate',
    office: 'Birouri',
    cultural: 'Cultural',
    heritage: 'Patrimoniu',
    industrial: 'Industrial',
    infrastructure: 'Infrastructura',
    education: 'Educatie',
  },
  en: {
    residential: 'Residential',
    hospitality: 'Hospitality',
    office: 'Office',
    cultural: 'Cultural',
    heritage: 'Heritage',
    industrial: 'Industrial',
    infrastructure: 'Infrastructure',
    education: 'Education',
  },
};

export function sectorLabel(value: Sector, locale: Locale): string {
  return SECTOR_LABELS[locale][value] ?? value.replace(/-/g, ' ');
}
