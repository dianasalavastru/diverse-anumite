/**
 * Work Archive editorial copy.
 *
 * ⚠ PLACEHOLDER COPY — PENDING WORKSTREAM C. NOTHING HERE IS AUTHORED CONTENT.
 *
 * OWNERSHIP: Workstream A commits the STRUCTURE; Workstream C authors the
 * STRINGS (TECHNICAL_ARCHITECTURE.md §23.3, "i18n message files | A (RO/EN
 * strings authored by C) | two-party file"). Replacing a value here is a copy
 * change and touches no component.
 *
 * The seed is transcribed from the approved HiFi
 * (`docs/pages/work-archive/work-archive-measured-reality-hifi-v1.html`) so the
 * authored measures and rhythm are exercised at their real sizes, with three
 * corrections applied to the transcription:
 *
 *  1. **Diacritics removed** (OD-8, §11.3) — the HiFi carries them because it is
 *     a design reference, not production copy.
 *
 *  2. **The page name is "Proiecte", not the HiFi's "Lucrări".**
 *     TECHNICAL_ARCHITECTURE.md §22 "Settled — not open": "Public RO label and
 *     route = **Proiecte** / `/proiecte`; internal canonical object = **Work
 *     Entry**", resolving `CONTENT_MODEL.md`:112 through IA §2.1,
 *     `NAV_DECISION_RECORD.md`:24 and `DECISIONS_LOG.md` #10/#17/#21. A HiFi
 *     heading does not reopen a settled naming decision, and the global nav
 *     already says "Proiecte" — the archive's own H1 disagreeing with the nav
 *     item that reaches it would fail the Page IA's own orientation test
 *     ("a visitor always knows which archive they are on").
 *
 *  3. **"Alegeti un pilon, un tip sau un an" → "…sau un sector".** Year is a
 *     sort, not a filter (IA Step 5; `WORK_ARCHIVE_IMPLEMENTATION_NOTES.md`:64),
 *     so the invitation cannot offer a year filter that no longer exists.
 *
 * Romanian pluralisation is a copy concern, so it lives here beside the strings
 * (`countNoun`), not in a component.
 */

import type { Locale } from './routes';

/* -------------------------------------------------------------------------- */
/* Shapes                                                                      */
/* -------------------------------------------------------------------------- */

/** A facet control's legend plus the label of its "no refinement" option. */
export interface FacetCopy {
  readonly legend: string;
  readonly any: string;
}

export interface WorkArchiveMessages {
  readonly meta: { readonly title: string; readonly description: string };

  /** A-1 · Archive orientation (Stage A). */
  readonly orientation: {
    readonly eyebrow: string;
    readonly heading: string;
    readonly statement: string;
    /** Suffix after the archive total, e.g. "12 proiecte **in arhiva**". */
    readonly total: string;
  };

  /** A-2 · Pillar toggle (Stage C, control). A mode, not a filter. */
  readonly pillar: {
    readonly legend: string;
    /** The default scope — `COMPONENT_INVENTORY.md`:57, "All is default". */
    readonly all: string;
  };

  /** A-4 · Filters (Stage C). The locked small set, and nothing else. */
  readonly filters: {
    readonly legend: string;
    readonly entryType: FacetCopy;
    readonly sector: FacetCopy;
    readonly discipline: FacetCopy;
    readonly service: FacetCopy;
    readonly sort: {
      readonly legend: string;
      readonly curated: string;
      readonly newest: string;
      readonly oldest: string;
    };
  };

  /** A-3 · Active context (Stage A/C, readout). */
  readonly activeContext: {
    readonly label: string;
    readonly none: string;
    readonly clear: string;
    /** F1 back-path, offered only while a pillar scope is active. */
    readonly hub: string;
  };

  /** A-5 · Results (Stage D). */
  readonly results: {
    readonly label: string;
    /** The per-card continuation cue. */
    readonly open: string;
  };

  /** A-6 · Empty state (Stage D, no matches). Never a bare grid. */
  readonly empty: {
    readonly heading: string;
    readonly body: string;
    readonly suggestLabel: string;
    readonly reset: string;
  };

  /** A-7 · Continue / back-path (Stage E). */
  readonly continue: {
    readonly label: string;
    readonly competitions: string;
    readonly professionalExperience: string;
    readonly fullArchive: string;
  };

  /** The two committed curated routes (IA §2.2). */
  readonly curated: {
    readonly competitions: {
      readonly eyebrow: string;
      readonly heading: string;
      readonly statement: string;
      readonly empty: string;
    };
    readonly professionalExperience: {
      readonly eyebrow: string;
      readonly heading: string;
      readonly statement: string;
      readonly empty: string;
      /** Prefix for a group heading, e.g. "Lucrari la **{employer}**". */
      readonly groupLabel: string;
    };
  };

  /**
   * Singular / plural / "de"-plural of the counted noun. Romanian needs three
   * forms; English needs two, and its third is the same as its plural.
   */
  readonly count: {
    readonly one: string;
    readonly few: string;
    readonly many: string;
  };
}

/* -------------------------------------------------------------------------- */
/* RO — the root locale                                                        */
/* -------------------------------------------------------------------------- */

const ro: WorkArchiveMessages = {
  meta: {
    title: 'Proiecte — arhiva · diverse anumite',
    description:
      'Arhiva completa de lucrari — arhitectura, design si reality capture, intr-un singur loc.',
  },

  orientation: {
    eyebrow: 'Arhiva · toate proiectele',
    heading: 'Proiecte',
    statement:
      'Tot ce a trecut prin atelier — arhitectura si realitate masurata, la un loc. Alegeti un pilon, un tip sau un sector; sau derulati pur si simplu.',
    total: 'in arhiva',
  },

  pillar: {
    legend: 'Pilon',
    all: 'Toate',
  },

  filters: {
    legend: 'Filtre',
    entryType: { legend: 'Tip', any: 'toate tipurile' },
    sector: { legend: 'Sector', any: 'orice sector' },
    discipline: { legend: 'Disciplina', any: 'orice disciplina' },
    service: { legend: 'Serviciu', any: 'orice serviciu' },
    sort: {
      legend: 'Ordonare',
      curated: 'selectie',
      newest: 'cele mai noi',
      oldest: 'cele mai vechi',
    },
  },

  activeContext: {
    label: 'Vizualizati',
    none: 'toata arhiva',
    clear: 'Resetati filtrele',
    hub: 'Pagina pilonului',
  },

  results: {
    label: 'Rezultate',
    open: 'deschide proiectul',
  },

  empty: {
    heading: 'Niciun proiect nu corespunde acestor filtre.',
    body: 'Am restrans prea mult cautarea. Reveniti la tot ce e in arhiva sau porniti de la un pilon.',
    suggestLabel: 'Incercati',
    reset: 'Resetati filtrele',
  },

  continue: {
    label: 'Continuati',
    competitions: 'Concursuri',
    professionalExperience: 'Experienta profesionala',
    fullArchive: 'Toata arhiva',
  },

  curated: {
    competitions: {
      eyebrow: 'Arhiva · selectie editoriala',
      heading: 'Concursuri',
      statement: 'Propunerile de concurs din arhiva, in ordinea selectiei editoriale.',
      empty: 'Nu exista inca proiecte de concurs publicate. Arhiva completa ramane deschisa.',
    },
    professionalExperience: {
      eyebrow: 'Arhiva · selectie editoriala',
      heading: 'Experienta profesionala',
      statement:
        'Lucrari realizate in cadrul unui birou, grupate pe angajator si creditate transparent.',
      empty:
        'Nu exista inca lucrari de birou publicate. Arhiva completa ramane deschisa.',
      groupLabel: 'Lucrari la',
    },
  },

  count: { one: 'proiect', few: 'proiecte', many: 'de proiecte' },
};

/* -------------------------------------------------------------------------- */
/* EN                                                                          */
/* -------------------------------------------------------------------------- */

const en: WorkArchiveMessages = {
  meta: {
    title: 'Projects — archive · diverse anumite',
    description:
      'The complete archive of work — architecture, design and reality capture in one place.',
  },

  orientation: {
    eyebrow: 'Archive · all projects',
    heading: 'Projects',
    statement:
      'Everything that has passed through the studio — architecture and measured reality, together. Pick a pillar, a type or a sector; or simply scroll.',
    total: 'in the archive',
  },

  pillar: {
    legend: 'Pillar',
    all: 'All',
  },

  filters: {
    legend: 'Filters',
    entryType: { legend: 'Type', any: 'all types' },
    sector: { legend: 'Sector', any: 'any sector' },
    discipline: { legend: 'Discipline', any: 'any discipline' },
    service: { legend: 'Service', any: 'any service' },
    sort: {
      legend: 'Sort',
      curated: 'curated',
      newest: 'newest',
      oldest: 'oldest',
    },
  },

  activeContext: {
    label: 'Viewing',
    none: 'the whole archive',
    clear: 'Clear filters',
    hub: 'Pillar page',
  },

  results: {
    label: 'Results',
    open: 'open the project',
  },

  empty: {
    heading: 'No project matches these filters.',
    body: 'The search narrowed too far. Return to everything in the archive, or start from a pillar.',
    suggestLabel: 'Try',
    reset: 'Clear filters',
  },

  continue: {
    label: 'Continue',
    competitions: 'Competitions',
    professionalExperience: 'Professional experience',
    fullArchive: 'The full archive',
  },

  curated: {
    competitions: {
      eyebrow: 'Archive · editorial slice',
      heading: 'Competitions',
      statement: 'The competition entries in the archive, in curated order.',
      empty: 'No competition entries are published yet. The full archive stays open.',
    },
    professionalExperience: {
      eyebrow: 'Archive · editorial slice',
      heading: 'Professional experience',
      statement: 'Work made within a studio, grouped by employer and credited transparently.',
      empty: 'No studio work is published yet. The full archive stays open.',
      groupLabel: 'Work at',
    },
  },

  count: { one: 'project', few: 'projects', many: 'projects' },
};

const MESSAGES: Readonly<Record<Locale, WorkArchiveMessages>> = { ro, en };

export function workArchiveMessages(locale: Locale): WorkArchiveMessages {
  return MESSAGES[locale];
}

/* -------------------------------------------------------------------------- */
/* Counting                                                                    */
/* -------------------------------------------------------------------------- */

export type CountForm = 'one' | 'few' | 'many';

/**
 * Which noun form `n` takes.
 *
 * Romanian has three: `1 proiect`, `2…19 proiecte`, `20+ de proiecte` — the
 * "de" form returns whenever the last two digits fall outside 1–19. English
 * collapses `few` and `many`.
 *
 * The RULE is separated from the STRINGS because both sides of the archive need
 * it: the page renders the total at build, and the island rewrites the count
 * after every filter change. The island imports this function alone and reads
 * the three forms from the DOM, so no message table — and no second locale's
 * copy — is ever bundled into the client.
 */
export function countForm(n: number, locale: Locale): CountForm {
  if (n === 1) return 'one';
  if (locale === 'en') return 'few';
  const lastTwo = Math.abs(n) % 100;
  return lastTwo === 0 || lastTwo > 19 ? 'many' : 'few';
}

/** The noun form for `n` counted items, in `locale`. */
export function countNoun(n: number, locale: Locale): string {
  return MESSAGES[locale].count[countForm(n, locale)];
}
