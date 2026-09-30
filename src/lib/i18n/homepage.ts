/**
 * Homepage editorial copy.
 *
 * STATUS (Wave 3): the RO strings are the locked Stable RO copy. The keys that carry Reality
 * Capture positioning — `arrival.heading`, `capabilities.realityCapture`, `work.realityCapture`
 * and `work.marker.coordinate` — are the Reality Capture editorial LOCK (approved 2026-09-25,
 * DECISIONS_LOG.md #106); `rc-copy-firewall.test.ts` pins them literally.
 *
 * OWNERSHIP: Workstream A commits the STRUCTURE; Workstream C authors the
 * STRINGS (TECHNICAL_ARCHITECTURE.md §23.3, "i18n message files | A (RO/EN
 * strings authored by C) | two-party file"). Replacing a value here is a copy
 * change and touches no component.
 *
 * DIACRITICS: RO human-facing copy carries ă â î ș ț (DECISIONS_LOG.md #103, amending
 * OD-8). Identifiers stay ASCII.
 *
 * ABSENT SLOTS. A fact the practice has not confirmed is ABSENT, never a marked stand-in
 * (§10.4; `scripts/verify-no-placeholder-content.mjs`). Absent is `''` for a string and `[]`
 * for a list — the `ui.ts` convention — and every consumer renders the slot only when it is
 * non-empty, so an absent value emits no element and no `data-fixture` marker. Absent in RO:
 * the hero fallback alt, the hero coordinate and dimension annotations (X3), the credibility
 * figure caption and readouts, the competitions intro, and the Email and reply-time contact
 * rows (the Email row returns when the client supplies the address).
 *
 * EN is a faithful translation of the locked RO (2026-09-30) and mirrors every RO absence.
 * EN routes remain WITHHELD (`publication.ts`); translation and publication are separate decisions.
 */

import type { Locale } from './routes';

/* -------------------------------------------------------------------------- */
/* Shapes                                                                      */
/* -------------------------------------------------------------------------- */

/** The hairline + station number + running coordinate that opens each section. */
export interface SectionMarkerCopy {
  /** Station number, pixel voice. */
  readonly no: string;
  /** Section name, mono label voice. */
  readonly label: string;
  /** The right-side running coordinate, mono. */
  readonly coordinate: string;
}

/**
 * A heading split around its one blue-marked word. VISUAL_DIRECTION_v2.0 §2.1:
 * blue marks "the moment a value or detail is revealed", never decoration — so
 * the accent is a copy decision, authored here, not a rendering rule.
 */
export interface AccentedHeading {
  readonly lead: string;
  readonly accent: string;
  readonly tail: string;
}

export interface StatisticCopy {
  readonly value: string;
  readonly unit: string | null;
  readonly label: string;
}

export interface ContactRowCopy {
  readonly label: string;
  readonly value: string;
}

export interface HomepageMessages {
  readonly meta: { readonly title: string; readonly description: string };

  /** M-1 · Identity (Stage A). */
  readonly arrival: {
    readonly eyebrow: string;
    readonly heading: AccentedHeading;
    readonly statement: string;
    readonly cue: string;
    /**
     * Accessible name for the identity hero image when no authored alt exists. `''` = none:
     * the plate is then decorative, never named by a stand-in.
     */
    readonly heroFallbackAlt: string;
    /** Decorative measurement annotations on the hero plate (aria-hidden). `''` = absent. */
    readonly heroIndex: string;
    readonly heroCoordinates: string;
    readonly heroDimension: string;
    /** HOMEPAGE_WIREFRAME M-1: "a light text link to About". */
    readonly aboutLink: string;
  };

  /** M-2 · Pillar branch (Stage B). */
  readonly capabilities: {
    readonly marker: SectionMarkerCopy;
    readonly architectureDesign: { readonly facets: string; readonly context: string };
    readonly realityCapture: { readonly facets: string; readonly context: string };
  };

  /** M-3 · Practice credibility (Stage C). */
  readonly credibility: {
    readonly marker: SectionMarkerCopy;
    readonly heading: AccentedHeading;
    readonly statement: string;
    /** `''` = absent — the figure renders its plate with no caption. */
    readonly figureCaption: string;
    /** `[]` = absent — no readout list is rendered at all. */
    readonly readouts: readonly StatisticCopy[];
    readonly aboutLink: string;
  };

  /** M-4 · Pillar sections ×2 (Stage D). */
  readonly work: {
    readonly marker: SectionMarkerCopy;
    readonly architectureDesign: {
      readonly index: string;
      readonly title: string;
      readonly intro: string;
      readonly cta: string;
    };
    /**
     * No `pointCloud` here, deliberately. The HiFi's 04·b capture centrepiece is
     * not part of the approved Homepage composition; the seam it fed
     * (`media/PointCloudField.astro`) is still driven by `PillarHubMessages`,
     * `WorkEntryMessages` and `ServiceMessages`, which keep their own copy.
     */
    readonly realityCapture: {
      readonly index: string;
      readonly title: string;
      readonly intro: string;
      readonly cta: string;
    };
    readonly carousel: {
      readonly roleDescription: string;
      readonly label: string;
      readonly previous: string;
      readonly next: string;
      readonly position: string;
    };
  };

  /** M-5 · Curated views (Stage E). */
  readonly curated: {
    readonly marker: SectionMarkerCopy;
    /** `intro: ''` = absent — the title and the rows render without an intro line. */
    readonly competitions: { readonly title: string; readonly intro: string };
  };

  /** M-6 · Contact invitation (Stage F). */
  readonly invitation: {
    readonly marker: SectionMarkerCopy;
    readonly question: string;
    readonly action: string;
    /** Confirmed facts only; `[]` renders no contact list. */
    readonly contact: readonly ContactRowCopy[];
  };
}

/* -------------------------------------------------------------------------- */
/* RO — locked Stable RO copy (#103); RC keys locked by #106                    */
/* -------------------------------------------------------------------------- */

const ro: HomepageMessages = {
  meta: {
    title: 'diverse anumite — atelier multidisciplinar din Cluj-Napoca',
    description:
      'Atelier multidisciplinar din Cluj-Napoca: proiectare de arhitectură, design interior, vizualizare 3D, design mobilier, scanare laser 3D și Scan-to-BIM.',
  },

  arrival: {
    eyebrow: 'atelier multidisciplinar · Cluj-Napoca',
    heading: { lead: 'Proiectăm spațiul.', accent: 'Măsurăm', tail: 'realitatea.' },
    statement:
      'Explorăm potențialul fiecărui proiect, folosind tehnologii contemporane și respectând realitățile profesiei, peisajul cultural și nevoile celor implicați.',
    cue: '06 stații',
    heroFallbackAlt: '',
    heroIndex: 'PT—001',
    heroCoordinates: '',
    heroDimension: '',
    aboutLink: 'Despre atelier',
  },

  capabilities: {
    marker: { no: '02', label: 'Capabilități', coordinate: 'două direcții' },
    architectureDesign: {
      /*
       * Locked (Stable RO, X1). One word per Architecture & Design Service, in the canonical
       * order of `SERVICE_KEYS` (`lib/content/types.ts`): proiectare-arhitectura → arhitectură,
       * design-interior → interior, vizualizare-3d → vizualizare, design-mobilier → mobilier.
       * Not a descriptive triple — the previous line mixed a housing type, a room class and a
       * Label (`concurs` is the CONCURS Label, never a Service).
       */
      facets: 'arhitectură · interior · vizualizare · mobilier',
      context: 'Proiectăm pornind de la loc și ducem lucrul până la detaliu.',
    },
    realityCapture: {
      facets: 'scanare laser 3D · Scan-to-BIM',
      context:
        'Scanăm clădiri, spații interioare, fațade și teren, iar din norul de puncte realizăm modelul BIM.',
    },
  },

  credibility: {
    marker: { no: '03', label: 'Atelierul', coordinate: 'Cluj-Napoca' },
    /* `tail` opens with a space: `Credibility.astro` sets the accent and the tail flush
       (`</span>{tail}`), so the space belongs to the copy. */
    heading: {
      lead: 'Un proces creativ',
      accent: 'dinamic',
      tail: ' și adaptabil.',
    },
    statement:
      'Proiectele de arhitectură se dezvoltă în colaborare cu specialiști externi — ingineri de structură și de instalații, consultant nZEB și, după caz, expert tehnic și consultant ISU.',
    figureCaption: '',
    readouts: [],
    aboutLink: 'Despre atelier',
  },

  work: {
    marker: {
      no: '04',
      label: 'Lucrări, în focus',
      coordinate: 'a · arhitectură & design — c · reality capture',
    },
    architectureDesign: {
      index: '04·a',
      title: 'Arhitectură & Design',
      intro:
        'Fiecare proiect intră pe rând în focus — restul rămân aproape, pentru context. Culoarea revine doar acolo unde privirea se oprește.',
      cta: 'Toate proiectele — Arhitectură & Design',
    },
    realityCapture: {
      index: '04·c',
      title: 'Reality Capture',
      intro: 'Proiecte de scanare laser 3D și Scan-to-BIM.',
      cta: 'Toate proiectele — Reality Capture',
    },
    carousel: {
      roleDescription: 'carusel de proiecte',
      label: 'Proiecte — folosiți săgețile pentru a naviga',
      previous: 'Proiectul anterior',
      next: 'Proiectul următor',
      position: 'Proiectul în focus',
    },
  },

  curated: {
    marker: { no: '05', label: 'Selecție', coordinate: 'concursuri' },
    competitions: {
      title: 'Concursuri',
      intro: '',
    },
  },

  invitation: {
    marker: { no: '06', label: 'Invitație', coordinate: 'un atelier · un mesaj' },
    question: 'Un proiect prinde contur?',
    action: 'Începe o conversație',
    contact: [{ label: 'Atelier', value: 'Cluj-Napoca' }],
  },
};

/* -------------------------------------------------------------------------- */
/* EN — faithful translation of the locked RO above; routes still WITHHELD      */
/* (`publication.ts`). Mirrors every RO absence: '' and [] stay absent.         */
/* -------------------------------------------------------------------------- */

const en: HomepageMessages = {
  meta: {
    title: 'diverse anumite — multidisciplinary studio in Cluj-Napoca',
    description:
      'Multidisciplinary studio in Cluj-Napoca: architectural design, interior design, 3D visualisation, furniture design, 3D laser scanning and Scan-to-BIM.',
  },

  arrival: {
    eyebrow: 'multidisciplinary studio · Cluj-Napoca',
    heading: { lead: 'We design space.', accent: 'We measure', tail: 'reality.' },
    statement:
      'We explore the potential of every project, using contemporary technologies while respecting the realities of the profession, the cultural landscape and the needs of those involved.',
    cue: '06 stations',
    heroFallbackAlt: '',
    heroIndex: 'PT—001',
    heroCoordinates: '',
    heroDimension: '',
    aboutLink: 'About the studio',
  },

  capabilities: {
    marker: { no: '02', label: 'Capabilities', coordinate: 'two areas' },
    architectureDesign: {
      facets: 'architecture · interiors · visualisation · furniture',
      context: 'We design from the place and take the work through to the detail.',
    },
    realityCapture: {
      facets: '3D laser scanning · Scan-to-BIM',
      context:
        'We scan buildings, interiors, façades and terrain, and turn the point cloud into a BIM model.',
    },
  },

  credibility: {
    marker: { no: '03', label: 'The studio', coordinate: 'Cluj-Napoca' },
    heading: {
      lead: 'A creative process that is',
      accent: 'dynamic',
      tail: ' and adaptable.',
    },
    statement:
      'Architectural projects are developed in collaboration with external specialists — structural and building services engineers, an nZEB consultant and, where required, a technical expert and a fire safety (ISU) consultant.',
    figureCaption: '',
    readouts: [],
    aboutLink: 'About the studio',
  },

  work: {
    marker: {
      no: '04',
      label: 'Work, in focus',
      coordinate: 'a · architecture & design — c · reality capture',
    },
    architectureDesign: {
      index: '04·a',
      title: 'Architecture & Design',
      intro:
        'Each project comes into focus in turn — the rest stay close, for context. Colour returns only where the eye comes to rest.',
      cta: 'All projects — Architecture & Design',
    },
    realityCapture: {
      index: '04·c',
      title: 'Reality Capture',
      intro: '3D laser scanning and Scan-to-BIM projects.',
      cta: 'All projects — Reality Capture',
    },
    carousel: {
      roleDescription: 'project carousel',
      label: 'Projects — use the arrow keys to navigate',
      previous: 'Previous project',
      next: 'Next project',
      position: 'Project in focus',
    },
  },

  curated: {
    marker: { no: '05', label: 'Selection', coordinate: 'competitions' },
    competitions: {
      title: 'Competitions',
      intro: '',
    },
  },

  invitation: {
    marker: { no: '06', label: 'Invitation', coordinate: 'one studio · one message' },
    question: 'Is a project taking shape?',
    action: 'Start a conversation',
    contact: [{ label: 'Studio', value: 'Cluj-Napoca' }],
  },
};

const MESSAGES: Readonly<Record<Locale, HomepageMessages>> = { ro, en };

export function homepageMessages(locale: Locale): HomepageMessages {
  return MESSAGES[locale];
}
