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
 * independent dimensions. Do not merge them." Each axis keeps its own slot.
 *
 * SCOPE. The axes a built page renders. Pillar arrived with the Homepage (and
 * Entry Type with it, until Stage 4 retired the axis and Project Labels took
 * its slot); Status, Discipline and Sector arrived with the **Work Entry**, which
 * is the page that displays them (W-1 Project Metadata — `WORK_ENTRY_PAGE_IA.md`).
 * Attribution and Commissioning were here too until Stage 3 retired them. Nothing
 * is added for a page that does not yet exist.
 *
 * OD-8 (§11.3): Romanian copy is authored WITHOUT diacritics.
 */

import type {
  ProjectLabel,
  Pillar,
  Sector,
  Status,
} from '../content';
import { ROUTES, type Locale, type RouteKey } from './routes';

/* -------------------------------------------------------------------------- */
/* Project Labels — CONTENT_MODEL.md v3.1 §10                                  */
/* -------------------------------------------------------------------------- */

/**
 * The two optional editorial flags that replaced the Entry Type axis at Stage 4.
 *
 * Only `competition-entry`'s meaning survived the retirement, as `competition`; the other four
 * Entry Types are gone with no successor. `diploma-project` is new, client-validated.
 *
 * RO is authored WITHOUT diacritics (OD-8, §11.3) — the model document writes "PROIECT DE
 * DIPLOMĂ" for readability, site copy does not. Casing follows the surrounding metadata voice
 * rather than the document's display convention: these render inside caption and readout rows
 * that are sentence-cased, and the CSS applies whatever transform the design calls for.
 */
const PROJECT_LABEL_LABELS: Readonly<Record<Locale, Readonly<Record<ProjectLabel, string>>>> = {
  ro: {
    competition: 'Concurs',
    'diploma-project': 'Proiect de diploma',
  },
  en: {
    competition: 'Competition',
    'diploma-project': 'Diploma project',
  },
};

export function projectLabelLabel(value: ProjectLabel, locale: Locale): string {
  return PROJECT_LABEL_LABELS[locale][value];
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

/**
 * Pillar (content identity) → the **Contact prefill** `?topic=` token.
 *
 * A fourth namespace, and the one place it is declared. TECHNICAL_ARCHITECTURE.md
 * §23.1 freezes the contract: "Query parameters are `?topic=` (broad
 * pillar-level) and `?regarding=` (the originating Service slug), per IA Step
 * 7's two-prefill model. **Emitted by Service pages and Pillar Hubs**; consumed
 * by Contact (C-2 Topic Summary). Values are **validated against the route map**
 * and known Service slugs; an unrecognised value is ignored rather than echoed."
 *
 * "Validated against the route map" is what fixes the token: it is the parent
 * Pillar Hub's **localized final path segment** from the frozen table in
 * `routes.ts` — `arhitectura-design` / `reality-capture` in RO,
 * `architecture-design` / `reality-capture` in EN. Derived from the table rather
 * than re-listed, so a token can never disagree with the route it names.
 *
 * It is localized because its companion is: `?regarding=` is "the originating
 * Service slug", and slugs are localized per entity (§7.1). A Contact page
 * reached from `/en/services/…` receives two EN tokens, one from `/servicii/…`
 * two RO ones.
 *
 * Deliberately NOT the archive token (`architecture`) and NOT the content
 * identifier (`architecture-design` in both locales): those are the two
 * namespaces `types.ts` already warns are distinct, and neither is "the route
 * map". Contact is Workstream-owned and unbuilt; this emits the frozen contract
 * and invents nothing beyond it.
 */
export function pillarTopicParam(value: Pillar, locale: Locale): string {
  const path = ROUTES[PILLAR_ROUTE_KEYS[value]].path[locale];
  return path.slice(path.lastIndexOf('/') + 1);
}

/* -------------------------------------------------------------------------- */
/* Status — CONTENT_MODEL.md:58                                                */
/* -------------------------------------------------------------------------- */

/**
 * Where a project stands (v3.1 §11.2) — one closed vocabulary for both Pillars.
 *
 * STAGE 7 replaced the whole set. The old labels ("Construit / realizat", "Neconstruit /
 * propunere", "In lucru", "Predat") are gone with their values; nothing here maps an old token
 * to a new label, because the vocabulary change is lossy and a label map is the wrong place to
 * hide a content decision.
 *
 * RO is authored WITHOUT diacritics (OD-8, §11.3) — the model document writes "În dezvoltare"
 * for readability; site copy does not. EN labels are working translations, PENDING (C).
 */
const STATUS_LABELS: Readonly<Record<Locale, Readonly<Record<Status, string>>>> = {
  ro: {
    'in-dezvoltare': 'In dezvoltare',
    'in-desfasurare': 'In desfasurare',
    finalizat: 'Finalizat',
    nerealizat: 'Nerealizat',
  },
  en: {
    'in-dezvoltare': 'In development',
    'in-desfasurare': 'In progress',
    finalizat: 'Completed',
    nerealizat: 'Not realised',
  },
};

export function statusLabel(value: Status, locale: Locale): string {
  return STATUS_LABELS[locale][value];
}

/* -------------------------------------------------------------------------- */
/* Discipline — REMOVED at migration Stage 5                                   */
/* -------------------------------------------------------------------------- */

/*
 * `DISCIPLINE_LABELS`/`disciplineLabel()` are deleted with the axis (v3.1 §12). Nothing takes
 * their place: Pillar already has `PILLAR_LABELS`/`pillarLabel()` above — the single canonical
 * localized name for a capability — and Architecture / Interior Design / Visualization survive
 * only as Service names, which are authored content, never a label map.
 */

/* -------------------------------------------------------------------------- */
/* Sector — CONTENT_MODEL.md v3.1 §11.1 (CLOSED at Stage 6)                    */
/* -------------------------------------------------------------------------- */

/**
 * The seven-value global vocabulary, shared by the project's single `sector` and the Service's
 * plural `sectors`.
 *
 * STAGE 6 closed the axis. It was open — `CONTENT_MODEL.md`:53 ended in "…" and any authored
 * token was legal — so this map needed a de-slugging fallback for values it did not know
 * (`adaptive-reuse` → "adaptive reuse"). **That fallback is deleted.** With a closed vocabulary
 * an unknown token cannot reach here: `normalize.ts` fails the build first. A fallback would
 * now only hide that.
 *
 * OD-8 (§11.3): Romanian copy is authored WITHOUT diacritics.
 */
const SECTOR_LABELS: Readonly<Record<Locale, Readonly<Record<Sector, string>>>> = {
  ro: {
    rezidential: 'Rezidential',
    'comercial-ospitalitate': 'Comercial & ospitalitate',
    'birouri-business': 'Birouri & business',
    'public-comunitar': 'Public & comunitar',
    'industrial-logistic': 'Industrial & logistic',
    'cultural-patrimoniu': 'Cultural & patrimoniu',
    'mixed-use-dezvoltari': 'Mixed-use & dezvoltari',
  },
  en: {
    rezidential: 'Residential',
    'comercial-ospitalitate': 'Commercial & hospitality',
    'birouri-business': 'Offices & business',
    'public-comunitar': 'Public & community',
    'industrial-logistic': 'Industrial & logistics',
    'cultural-patrimoniu': 'Cultural & heritage',
    'mixed-use-dezvoltari': 'Mixed-use & development',
  },
};

export function sectorLabel(value: Sector, locale: Locale): string {
  return SECTOR_LABELS[locale][value];
}
