/**
 * Homepage editorial copy.
 *
 * STATUS (Wave 3): the RO strings are the locked Stable RO copy, EXCEPT three keys that
 * carry Reality Capture positioning and are under the RC editorial hold — `arrival.heading`,
 * `capabilities.realityCapture` and `work.realityCapture`. Those stay byte-identical, ASCII
 * spelling included, until the RC pass (`rc-copy-firewall.test.ts` snapshots the RC
 * capability plate). Converting their diacritics would be an RC copy change.
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
 * EN is WITHHELD for the initial launch. It is not a translation of the RO copy, still
 * carries the superseded HiFi transcription, and must not be published as it stands.
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
/* RO — locked Stable RO copy (#103); the three RC-HELD keys are marked         */
/* -------------------------------------------------------------------------- */

const ro: HomepageMessages = {
  meta: {
    title: 'diverse anumite — atelier multidisciplinar din Cluj-Napoca',
    description:
      'Atelier multidisciplinar din Cluj-Napoca: proiectare de arhitectură, design interior, vizualizare 3D, design mobilier, scanare laser 3D și Scan-to-BIM.',
  },

  arrival: {
    eyebrow: 'atelier multidisciplinar · Cluj-Napoca',
    // HELD (RC editorial hold) — do not edit before the RC pass.
    heading: { lead: 'Proiectam spatiul.', accent: 'Masuram', tail: 'realitatea.' },
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
      facets: 'scanare 3d · fotogrametrie · patrimoniu',
      // "masurata la 2 mm" removed: an accuracy claim belongs to capture
      // metadata on a real entry, never to page copy (§10.4).
      context:
        'Realitatea construita, masurata pe teren — relevee, scanare 3D si fotogrametrie pentru patrimoniu si sit.',
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
      coordinate: 'a · arhitectura — c · documentare',
    },
    architectureDesign: {
      index: '04·a',
      title: 'Arhitectură & Design',
      intro:
        'Fiecare proiect intră pe rând în focus — restul rămân aproape, pentru context. Culoarea revine doar acolo unde privirea se oprește.',
      cta: 'Toate lucrările — Arhitectură & Design',
    },
    realityCapture: {
      index: '04·c',
      title: 'Documentare',
      intro:
        'Cladiri reale, masurate pe teren: relevee, drone si scanare 3D — cadre din arhiva de documentare.',
      cta: 'Toate lucrarile — Reality Capture',
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
/* EN — WITHHELD at launch; superseded transcription, NOT publishable as is    */
/* -------------------------------------------------------------------------- */

const en: HomepageMessages = {
  meta: {
    title: 'diverse anumite — architecture and reality capture',
    description:
      'One studio that composes architecture and documents the built world with precision.',
  },

  arrival: {
    eyebrow: 'studio · architecture + reality capture',
    heading: { lead: 'We design space.', accent: 'We measure', tail: 'reality.' },
    statement:
      'One studio that composes architecture and documents the built world with precision — from the first sketch to the last scanned millimetre.',
    cue: 'scroll — 06 stations',
    heroFallbackAlt: 'Placeholder image — studio photography pending',
    heroIndex: 'PT—001',
    heroCoordinates: '46.77°N 23.59°E',
    heroDimension: 'h — 18.4 m',
    aboutLink: 'About the studio',
  },

  capabilities: {
    marker: { no: '02', label: 'Capabilities', coordinate: 'two disciplines · one studio' },
    architectureDesign: {
      facets: 'housing · interiors · competitions',
      context:
        'Architecture that starts from place and light — houses, interiors and competition entries, drawn by hand and taken through to detail.',
    },
    realityCapture: {
      facets: '3d scanning · photogrammetry · heritage',
      context:
        'The built world, measured on site — surveys, 3D scanning and photogrammetry for heritage and terrain.',
    },
  },

  credibility: {
    marker: { no: '03', label: 'The practice, measured', coordinate: 'years of practice · placeholder' },
    heading: {
      lead: 'Precision needs',
      accent: 'hands',
      tail: ', not only instruments.',
    },
    statement:
      'We are a small studio with a steady hand. We draw spaces that last and document what is built with instruments we know — every millimetre counts, from the sketch to the point cloud.',
    figureCaption: 'survey · hand + instrument',
    readouts: [
      { value: '12', unit: 'yrs', label: 'continuous practice in architecture and survey (placeholder)' },
      { value: '2', unit: 'mm', label: 'on-site scanning accuracy (placeholder)' },
      { value: 'EU', unit: null, label: 'equipment co-financed by European funds (placeholder)' },
    ],
    aboutLink: 'About the practice',
  },

  work: {
    marker: {
      no: '04',
      label: 'Work, in focus',
      coordinate: 'a · architecture — c · documentation',
    },
    architectureDesign: {
      index: '04·a',
      title: 'Architecture & Design',
      intro:
        'Each project comes into focus in turn — the rest stay close, for context. Colour returns only where the eye stops.',
      cta: 'All work — Architecture & Design',
    },
    realityCapture: {
      index: '04·c',
      title: 'Documentation',
      intro:
        'Real buildings, measured on site: surveys, drone flights and 3D scanning — frames from the documentation archive.',
      cta: 'All work — Reality Capture',
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
      intro:
        'Competition entries, ordered in time — public and cultural spaces proposed by the studio.',
    },
  },

  invitation: {
    marker: { no: '06', label: 'Invitation', coordinate: 'one studio · one message' },
    question: 'Is a project taking shape?',
    action: 'Start a conversation',
    contact: [
      { label: 'Email', value: 'salut@diverseanumite.ro (placeholder)' },
      { label: 'Studio', value: 'Cluj-Napoca · 46.77°N 23.59°E (placeholder)' },
      { label: 'Reply', value: 'within 48h (placeholder)' },
    ],
  },
};

const MESSAGES: Readonly<Record<Locale, HomepageMessages>> = { ro, en };

export function homepageMessages(locale: Locale): HomepageMessages {
  return MESSAGES[locale];
}
