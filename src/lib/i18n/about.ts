/**
 * About (Despre) editorial copy.
 *
 * OWNERSHIP: Workstream A commits the STRUCTURE; Workstream C authors the
 * STRINGS (TECHNICAL_ARCHITECTURE.md §23.3).
 *
 * STATUS (Wave 3): the RO strings are the locked Stable RO copy, with correct
 * diacritics (DECISIONS_LOG.md #103). The substitute seed that used to live here —
 * a biography, four practice counts, tool categories, an invented four-step method
 * and a closing claim, each marked `(substituent)` — is gone, and so is the
 * structure that only existed to carry it. What the practice has not stated is
 * ABSENT, never a marked stand-in (§10.4; `scripts/verify-no-placeholder-content.mjs`).
 *
 * ── WHAT THE PAGE CARRIES ─────────────────────────────────────────────────
 *   masthead   eyebrow · the locked page name · three intro paragraphs
 *   one band   how the practice works, as prose (the collaboration sentence and
 *              the existing-building survey sentence)
 *   closing    the three onward paths IA Step 7 names — Work, Services, Contact
 *
 * `heading` and the onward labels remain the LOCKED global-nav labels
 * (NAV_DECISION_RECORD.md §4) — existing authored decisions, not new copy.
 *
 * ── ABSENT ON PURPOSE ─────────────────────────────────────────────────────
 *   · `heroAlt` — `''`: no hero photograph exists, so the masthead plate is
 *     decorative (its authored tone) and is never named by a stand-in.
 *   · `closing.statement` — `''`: no closing claim is confirmed.
 *   · `closing.funding` — `''`, PENDING (C + governance). IA Step 7 /
 *     DECISIONS_LOG #45 assign the EU-funded expansion narrative to this page,
 *     gated on the EU programme publicity rules. Rendered only when non-empty.
 *
 * EN is WITHHELD for the initial launch. It is not a translation of the RO copy;
 * it keeps its previous strings where the shape still has a slot for them, and
 * mirrors RO's absences where the shape changed.
 */

import type { Locale } from './routes';

/* -------------------------------------------------------------------------- */
/* Shapes                                                                      */
/* -------------------------------------------------------------------------- */

/** A numbered section of the composition. */
export interface AboutSectionCopy {
  /** Station number, mono, blue. Rendered `aria-hidden` — it is a coordinate. */
  readonly no: string;
  /** The section's `<h2>`. */
  readonly label: string;
}

export interface AboutMessages {
  readonly meta: {
    readonly title: string;
    /** No meta description is emitted while empty (§12). */
    readonly description: string;
  };

  /** The masthead. Eyebrow + the locked page name + the positioning statement. */
  readonly eyebrow: string;
  readonly heading: string;
  /** The practice statement that is this page's reason to exist (IA §2.5). */
  readonly intro: readonly string[];
  /** Accessible name for the masthead plate. `''` = no photograph: the plate is decorative. */
  readonly heroAlt: string;

  /** How the practice works, as prose. An empty `body` renders no section at all. */
  readonly how: AboutSectionCopy & { readonly body: readonly string[] };

  /** The closing band. */
  readonly closing: {
    /** `''` = absent — no statement element renders. */
    readonly statement: string;
    /**
     * PENDING (C + governance) — the EU-funded expansion narrative
     * (IA Step 7; DECISIONS_LOG #45). Absent while empty.
     */
    readonly funding: string;
    /**
     * The three onward paths IA Step 7 names, with "no dominant CTA": Work,
     * Services and Contact, identical in treatment. See AboutPage.astro.
     */
    readonly work: string;
    readonly services: string;
    readonly contact: string;
  };
}

/* -------------------------------------------------------------------------- */
/* RO — locked Stable RO copy (#103)                                           */
/* -------------------------------------------------------------------------- */

const ro: AboutMessages = {
  meta: {
    title: 'Despre · diverse anumite',
    description:
      'Despre diverse anumite, atelier multidisciplinar din Cluj-Napoca, pentru care procesul creativ este dinamic și adaptabil.',
  },

  eyebrow: 'Atelierul',
  heading: 'Despre',
  intro: [
    'La diverse anumite, atelier multidisciplinar din Cluj-Napoca, procesul creativ este dinamic și adaptabil.',
    'Atelierul explorează potențialul fiecărui proiect, folosindu-se de tehnologii contemporane, respectând realitățile profesiei, peisajul cultural și nevoile celor implicați.',
    'Serviciile atelierului se împart în două direcții: Arhitectură & Design (proiectare de arhitectură, design interior, vizualizare 3D, design mobilier) și Reality Capture (scanare laser 3D, Scan-to-BIM).',
  ],
  heroAlt: '',

  how: {
    no: '01',
    label: 'Cum lucrăm',
    body: [
      'Proiectele de arhitectură se dezvoltă în colaborare cu specialiști externi — ingineri de structură și de instalații, consultant nZEB și, după caz, expert tehnic și consultant ISU.',
      'În cazul intervențiilor pe clădiri existente, releveul de arhitectură se realizează prin scanare laser 3D, pentru interior, și prin inspecție aeriană cu dronă, pentru anvelopa clădirii — acoperiș și fațade.',
    ],
  },

  closing: {
    statement: '',
    funding: '',
    work: 'Vezi proiectele',
    services: 'Servicii',
    contact: 'Discutăm despre un proiect',
  },
};

/* -------------------------------------------------------------------------- */
/* EN — WITHHELD at launch; not a translation                                  */
/* -------------------------------------------------------------------------- */

const en: AboutMessages = {
  meta: { title: 'About · diverse anumite', description: '' },

  eyebrow: 'The studio',
  heading: 'About',
  intro: [
    'Diverse Anumite is a studio working on two planes at once: it draws new space and it measures space that already exists.',
    'The two are not separate services. A drawing needs a correctly measured base, and a measurement becomes useful only once someone knows what will be built on top of it.',
  ],
  heroAlt: '',

  how: {
    no: '01',
    label: 'How we work',
    body: [],
  },

  closing: {
    statement: '',
    funding: '',
    work: 'See the projects',
    services: 'Services',
    contact: 'Let us talk about a project',
  },
};

const MESSAGES: Readonly<Record<Locale, AboutMessages>> = { ro, en };

export function aboutMessages(locale: Locale): AboutMessages {
  return MESSAGES[locale];
}
