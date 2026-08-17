/**
 * Homepage editorial copy.
 *
 * ⚠ PLACEHOLDER COPY — PENDING WORKSTREAM C. NOTHING HERE IS AUTHORED CONTENT.
 *
 * OWNERSHIP: Workstream A commits the STRUCTURE; Workstream C authors the
 * STRINGS (TECHNICAL_ARCHITECTURE.md §23.3, "i18n message files | A (RO/EN
 * strings authored by C) | two-party file"). Replacing a value here is a copy
 * change and touches no component.
 *
 * WHY THE STRINGS ARE SEEDED RATHER THAN LEFT EMPTY. `ui.ts` leaves unauthored
 * chrome copy as `''` and its consumers omit the slot — correct for a footer
 * statement, useless here: the Homepage *is* editorial copy, and an empty page
 * cannot validate the one thing Phase 3 exists to validate, which is motion-port
 * fidelity against the approved HiFi (§23.2). The seed below is transcribed from
 * that approved HiFi so that line lengths, `max-width: Nch` measures and the
 * authored rhythm are exercised at their real sizes.
 *
 * TWO CORRECTIONS APPLIED TO THE TRANSCRIPTION:
 *
 *  1. **Diacritics removed** (OD-8, §11.3). "Romanian site copy is intentionally
 *     authored without diacritics." The HiFi carries them because it is a design
 *     reference, not production copy.
 *
 *  2. **Verifiable claims neutralised or marked.** §10.4 forbids fabricated
 *     technical readouts from reaching production — "these are technical claims
 *     made to institutional clients evaluating a surveying service", and a
 *     fabricated one is a false accuracy claim against `CONTENT_MODEL.md`:101.
 *     The HiFi's "masurata la 2 mm" in the Reality Capture capability line is
 *     dropped; the three credibility readouts keep their numerals (they carry the
 *     composition) but every label is suffixed "(substituent)" so no reader and
 *     no reviewer can mistake them for authored facts. The Homepage's *capture*
 *     readout is not here at all — it renders from `CaptureMetadata` on the real
 *     entry (§10.4), never from copy.
 *
 * Every string below is additionally exposed to review through `data-fixture`
 * attributes on the elements that render placeholder facts.
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
    /** Accessible name for the identity hero image when no authored alt exists. */
    readonly heroFallbackAlt: string;
    /** Decorative measurement annotations on the hero plate (aria-hidden). */
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
    readonly figureCaption: string;
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
    readonly competitions: { readonly title: string; readonly intro: string };
  };

  /** M-6 · Contact invitation (Stage F). */
  readonly invitation: {
    readonly marker: SectionMarkerCopy;
    readonly question: string;
    readonly action: string;
    readonly contact: readonly ContactRowCopy[];
  };
}

/* -------------------------------------------------------------------------- */
/* RO — transcribed from the approved HiFi, diacritics removed (OD-8)          */
/* -------------------------------------------------------------------------- */

const ro: HomepageMessages = {
  meta: {
    title: 'diverse anumite — arhitectura si reality capture',
    description:
      'Un singur atelier care compune arhitectura si documenteaza lumea construita cu precizie.',
  },

  arrival: {
    eyebrow: 'atelier · arhitectura + reality capture',
    heading: { lead: 'Proiectam spatiul.', accent: 'Masuram', tail: 'realitatea.' },
    statement:
      'Un singur atelier care compune arhitectura si documenteaza lumea construita cu precizie — de la prima schita pana la ultimul milimetru scanat.',
    cue: 'derulati — 06 statii',
    heroFallbackAlt: 'Imagine substituent — fotografie de atelier, in asteptare',
    heroIndex: 'PT—001',
    heroCoordinates: '46.77°N 23.59°E',
    heroDimension: 'h — 18.4 m',
    aboutLink: 'Despre atelier',
  },

  capabilities: {
    marker: { no: '02', label: 'Capabilitati', coordinate: 'doua discipline · un atelier' },
    architectureDesign: {
      facets: 'locuinte · interior · concurs',
      context:
        'Arhitectura care porneste de la loc si lumina — locuinte, interioare si proiecte de concurs, desenate cu mana si duse pana la detaliu.',
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
    marker: { no: '03', label: 'Practica, masurata', coordinate: 'ani de practica · substituent' },
    heading: {
      lead: 'Precizia are nevoie de',
      accent: 'maini',
      tail: ', nu doar de instrumente.',
    },
    statement:
      'Suntem un atelier mic, cu mana ferma. Desenam spatii care raman si documentam construitul cu instrumente pe care le stapanim — fiecare milimetru conteaza, de la schita la nor de puncte.',
    figureCaption: 'releveu · mana + instrument',
    readouts: [
      { value: '12', unit: 'ani', label: 'practica continua in arhitectura si relevee (substituent)' },
      { value: '2', unit: 'mm', label: 'acuratete de scanare pe teren (substituent)' },
      { value: 'UE', unit: null, label: 'echipament cofinantat din fonduri europene (substituent)' },
    ],
    aboutLink: 'Despre practica',
  },

  work: {
    marker: {
      no: '04',
      label: 'Lucrari, in focus',
      coordinate: 'a · arhitectura — c · documentare',
    },
    architectureDesign: {
      index: '04·a',
      title: 'Arhitectura & Design',
      intro:
        'Fiecare proiect intra pe rand in focus — restul raman aproape, pentru context. Culoarea revine doar acolo unde privirea se opreste.',
      cta: 'Toate lucrarile — Arhitectura & Design',
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
      label: 'Proiecte — folositi sagetile pentru a naviga',
      previous: 'Proiectul anterior',
      next: 'Proiectul urmator',
      position: 'Proiectul in focus',
    },
  },

  curated: {
    marker: { no: '05', label: 'Selectie', coordinate: 'concursuri' },
    competitions: {
      title: 'Concursuri',
      intro:
        'Proiecte de concurs, ordonate in timp — spatii publice si culturale propuse de atelier.',
    },
  },

  invitation: {
    marker: { no: '06', label: 'Invitatie', coordinate: 'un atelier · un mesaj' },
    question: 'Un proiect prinde contur?',
    action: 'Incepe o conversatie',
    contact: [
      { label: 'Email', value: 'salut@diverseanumite.ro (substituent)' },
      { label: 'Atelier', value: 'Cluj-Napoca · 46.77°N 23.59°E (substituent)' },
      { label: 'Raspuns', value: 'in cel mult 48h (substituent)' },
    ],
  },
};

/* -------------------------------------------------------------------------- */
/* EN — placeholder translation of the above, PENDING (C)                      */
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
