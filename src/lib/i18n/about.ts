/**
 * About (Despre) editorial copy.
 *
 * OWNERSHIP: Workstream A commits the STRUCTURE; Workstream C authors the
 * STRINGS (TECHNICAL_ARCHITECTURE.md §23.3).
 *
 * ══════════════════════════════════════════════════════════════════════════
 *  ⚠ SUBSTITUTE COPY — PENDING WORKSTREAM C + THE PRACTICE OWNER.
 *    NOTHING BELOW IS AUTHORED CONTENT ABOUT A REAL PERSON OR PRACTICE.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * ── WHY THIS FILE CHANGED FROM EMPTY TO SEEDED ────────────────────────────
 *
 * Every string here used to be `''`, and every consumer omitted its slot — the
 * `ui.ts` convention, applied because About is the one page type whose entire
 * substance is authored prose about a real person, and inventing it is the thing
 * this codebase most consistently refuses (§10.4).
 *
 * That refusal has not changed. What changed is which of the two established
 * conventions this file follows. There are two, and they are chosen by what the
 * page is FOR:
 *
 *   `ui.ts`         — chrome copy. Empty is correct: an absent footer statement
 *                     costs nothing and an invented one is a lie.
 *   `homepage.ts`   — editorial copy. "An empty page cannot validate the one
 *                     thing [the phase] exists to validate, which is
 *                     motion-port fidelity against the approved HiFi… The seed
 *                     below is transcribed from that approved HiFi so that line
 *                     lengths, `max-width: Nch` measures and the authored rhythm
 *                     are exercised at their real sizes."
 *
 * About is the second kind, and it now has an owner-approved visual reference
 * for its composition. A page whose every slot is absent cannot be reviewed
 * against that reference — the previous build rendered a name and three links
 * across a full canvas, which is exactly the "placeholder, not a page" state the
 * redesign exists to end. So the strings below are seeded at the length and
 * shape the real copy will take, under `homepage.ts`'s own rules:
 *
 *   1. **Every verifiable claim carries a visible marker.** Biography, counts,
 *      tools and the closing claim are suffixed `(substituent)` / `(placeholder)`
 *      in the rendered string, so no reader and no reviewer can mistake them for
 *      authored fact. This is the discipline §10.4 imposes on capture readouts,
 *      applied to a page where the stakes are higher.
 *   2. **Every element that renders substitute prose is `data-fixture`-marked**,
 *      so a built page can be grepped for it (`AboutPage.astro`).
 *   3. **No brand or model names.** The approved render illustrates §04 with
 *      named software and scanners. Those are claims that the practice owns or
 *      uses specific equipment, and no authoritative source in this repository
 *      supports one. `Service.equipment` is where such a claim belongs — an
 *      authored CMS field whose Studio description reads "Real figures only" —
 *      and it is empty in this dataset. §04 therefore carries tool *categories*,
 *      marked substitute, and the composition it demonstrates accepts real
 *      names verbatim when the owner supplies them.
 *   4. **Nothing is invented that the site does not already say elsewhere.**
 *      The positioning below restates the two-pillar relationship the Homepage
 *      already publishes; it does not add a founding year, a location, an award,
 *      a client, a degree or a headcount, because those exist in no document.
 *
 * `heading` and the onward labels remain the LOCKED global-nav labels
 * (NAV_DECISION_RECORD.md §4) — existing authored decisions, not new copy.
 *
 * ── WHAT IS STILL ABSENT ON PURPOSE ───────────────────────────────────────
 *   · `meta.description` — PENDING (C). No meta description is emitted while
 *     empty (§12). A substitute one would be published to search engines, which
 *     is a different act from rendering marked copy on a page under review.
 *   · `funding` — PENDING (C + governance). IA Step 7 / DECISIONS_LOG #45 assign
 *     the EU-funded expansion narrative to this page, gated on the same open
 *     question as the footer acknowledgment ("Confirm EU programme publicity
 *     rules", Batch 21, open). The slot is rendered only when non-empty.
 *
 * OD-8 (§11.3): Romanian copy is authored WITHOUT diacritics. The approved
 * render carries them because it is a design reference, not production copy.
 * EN is NOT a polished translation of an unsupported RO claim — it is the same
 * substitute content, marked `(placeholder)`, exactly as `homepage.ts` does.
 */

import type { Locale } from './routes';

/* -------------------------------------------------------------------------- */
/* Shapes                                                                      */
/* -------------------------------------------------------------------------- */

/** A numbered section of the composition: `01 · Cine`, `02 · Cum lucram`, … */
export interface AboutSectionCopy {
  /** Station number, mono, blue. Rendered `aria-hidden` — it is a coordinate. */
  readonly no: string;
  /** The section's `<h2>`. */
  readonly label: string;
}

/** One movement of §02. The name is a verb; the line under it is one sentence. */
export interface AboutStepCopy {
  readonly no: string;
  readonly name: string;
  readonly text: string;
}

/** One fact of §03. `value` carries the composition; `label` carries the claim. */
export interface AboutFactCopy {
  readonly value: string;
  readonly label: string;
}

export interface AboutMessages {
  readonly meta: {
    readonly title: string;
    /** PENDING (C) — no meta description is emitted while empty (§12). */
    readonly description: string;
  };

  /** The masthead. Eyebrow + the locked page name + the positioning statement. */
  readonly eyebrow: string;
  readonly heading: string;
  /**
   * SUBSTITUTE — the practice statement that is this page's reason to exist
   * (IA §2.5, "trust in architect/practice"). Two short paragraphs.
   */
  readonly intro: readonly string[];
  /** Accessible name for the masthead photograph while no CMS media exists. */
  readonly heroAlt: string;

  /** §01 — the person behind the practice. SUBSTITUTE, visibly marked. */
  readonly who: AboutSectionCopy & {
    readonly body: readonly string[];
    readonly imageAlt: string;
  };

  /** §02 — how the practice works. Four movements. */
  readonly how: AboutSectionCopy & { readonly steps: readonly AboutStepCopy[] };

  /** §03 — relevant experience. SUBSTITUTE VALUES, visibly marked. */
  readonly experience: AboutSectionCopy & { readonly facts: readonly AboutFactCopy[] };

  /** §04 — tools and capabilities. Categories, never brand names. */
  readonly tools: AboutSectionCopy & {
    readonly groups: readonly (readonly string[])[];
    /** IA Step 7's third onward path, kept quiet so it does not compete (§9). */
    readonly services: string;
  };

  /** The closing band. */
  readonly closing: {
    /** SUBSTITUTE — one short statement about the practice. */
    readonly statement: string;
    /**
     * PENDING (C + governance) — the EU-funded expansion narrative
     * (IA Step 7; DECISIONS_LOG #45). Absent while empty.
     */
    readonly funding: string;
    /**
     * Two onward paths. IA Step 7 asks for Work, Services and Contact with "no
     * dominant CTA"; the owner-approved composition promotes Work and Contact to
     * the closing band and keeps Services as the quiet link that closes §04, so
     * all three remain present without a dominant action. See AboutPage.astro.
     */
    readonly work: string;
    readonly contact: string;
  };
}

/* -------------------------------------------------------------------------- */
/* RO — substitute, diacritic-free (OD-8)                                      */
/* -------------------------------------------------------------------------- */

const ro: AboutMessages = {
  meta: { title: 'Despre · diverse anumite', description: '' },

  eyebrow: 'Atelierul',
  heading: 'Despre',
  intro: [
    'Diverse Anumite este un atelier care lucreaza pe doua planuri deodata: deseneaza spatii noi si masoara spatii care exista deja.',
    'Cele doua nu sunt servicii separate. Un desen are nevoie de o baza masurata corect, iar o masuratoare devine utila abia cand cineva stie ce se construieste peste ea.',
  ],
  heroAlt: 'Imagine substituent — fotografie de atelier, in asteptare',

  who: {
    no: '01',
    label: 'Cine',
    body: [
      'Un singur arhitect duce proiectul pe tot parcursul lui — de la prima vizita pe teren pana la desenul predat. (substituent)',
      'Formarea, experienta profesionala si motivul pentru care atelierul exista se scriu impreuna cu proprietarul; textul de aici tine masura si ritmul versiunii finale. (substituent)',
    ],
    imageAlt: 'Imagine substituent — portret de lucru, in asteptare',
  },

  how: {
    no: '02',
    label: 'Cum lucram',
    steps: [
      { no: '01', name: 'Observam', text: 'Intelegem locul, constrangerile lui si ce se asteapta de la proiect.' },
      { no: '02', name: 'Masuram', text: 'Ridicam ce exista deja, prin releveu, scanare 3D si fotogrametrie.' },
      { no: '03', name: 'Interpretam', text: 'Transformam datele brute in informatie pe care se poate desena.' },
      { no: '04', name: 'Proiectam', text: 'Propunem solutii clare, fezabile si legate de context.' },
    ],
  },

  experience: {
    no: '03',
    label: 'Experienta',
    /* SUBSTITUTE VALUES. The "12" matches the homepage's existing substitute
       readout deliberately — two different unverified year counts on one site
       would be worse than one. Every label is suffixed, and the block carries
       `data-fixture="statistics"`, exactly as the homepage's readouts do. */
    facts: [
      { value: '12+', label: 'ani de practica (substituent)' },
      { value: '50+', label: 'proiecte de arhitectura (substituent)' },
      { value: '200+', label: 'scanari si ridicari (substituent)' },
      { value: '15+', label: 'concursuri si colaborari (substituent)' },
    ],
  },

  tools: {
    no: '04',
    label: 'Instrumente',
    /* CATEGORIES, NOT BRANDS — see the file header, rule 3. The trailing marker
       is a list item so it reads inside the `·` sequence rather than beside it. */
    groups: [
      ['proiectare CAD', 'modelare 3D', 'randare', 'documentatie tehnica', '(substituent)'],
      ['scanare laser terestra', 'fotogrametrie aeriana', 'procesare nor de puncte', '(substituent)'],
    ],
    services: 'Servicii',
  },

  closing: {
    statement:
      'Atelierul lucreaza cu putine proiecte odata, ca fiecare sa primeasca aceeasi atentie la detaliu. (substituent)',
    funding: '',
    work: 'Vezi proiectele',
    contact: 'Discutam despre un proiect',
  },
};

/* -------------------------------------------------------------------------- */
/* EN — the same substitute content, marked `(placeholder)`                     */
/* -------------------------------------------------------------------------- */

const en: AboutMessages = {
  meta: { title: 'About · diverse anumite', description: '' },

  eyebrow: 'The studio',
  heading: 'About',
  intro: [
    'Diverse Anumite is a studio working on two planes at once: it draws new space and it measures space that already exists.',
    'The two are not separate services. A drawing needs a correctly measured base, and a measurement becomes useful only once someone knows what will be built on top of it.',
  ],
  heroAlt: 'Placeholder image — studio photography pending',

  who: {
    no: '01',
    label: 'Who',
    body: [
      'One architect carries a project the whole way — from the first site visit to the drawing that is handed over. (placeholder)',
      'The background, the professional experience and the reason the studio exists are to be written with the owner; the text here holds the measure and rhythm of the final version. (placeholder)',
    ],
    imageAlt: 'Placeholder image — working portrait pending',
  },

  how: {
    no: '02',
    label: 'How we work',
    steps: [
      { no: '01', name: 'Observe', text: 'We read the place, its constraints and what the project is asked to do.' },
      { no: '02', name: 'Measure', text: 'We survey what is already there, by hand, 3D scanning and photogrammetry.' },
      { no: '03', name: 'Interpret', text: 'We turn raw data into information that can actually be drawn on.' },
      { no: '04', name: 'Design', text: 'We propose solutions that are clear, buildable and tied to their context.' },
    ],
  },

  experience: {
    no: '03',
    label: 'Experience',
    facts: [
      { value: '12+', label: 'years in practice (placeholder)' },
      { value: '50+', label: 'architecture projects (placeholder)' },
      { value: '200+', label: 'scans and surveys (placeholder)' },
      { value: '15+', label: 'competitions and collaborations (placeholder)' },
    ],
  },

  tools: {
    no: '04',
    label: 'Tools',
    groups: [
      ['CAD drafting', '3D modelling', 'rendering', 'technical documentation', '(placeholder)'],
      ['terrestrial laser scanning', 'aerial photogrammetry', 'point-cloud processing', '(placeholder)'],
    ],
    services: 'Services',
  },

  closing: {
    statement:
      'The studio takes on few projects at a time, so each one gets the same attention to detail. (placeholder)',
    funding: '',
    work: 'See the projects',
    contact: 'Let us talk about a project',
  },
};

const MESSAGES: Readonly<Record<Locale, AboutMessages>> = { ro, en };

export function aboutMessages(locale: Locale): AboutMessages {
  return MESSAGES[locale];
}
