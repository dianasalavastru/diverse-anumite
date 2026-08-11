/**
 * Pillar Hub editorial copy — the **Reality Capture** instance.
 *
 * ⚠ PLACEHOLDER COPY — PENDING WORKSTREAM C. NOTHING HERE IS AUTHORED CONTENT.
 *
 * OWNERSHIP: Workstream A commits the STRUCTURE; Workstream C authors the
 * STRINGS (TECHNICAL_ARCHITECTURE.md §23.3, "i18n message files | A (RO/EN
 * strings authored by C) | two-party file"). Replacing a value here is a copy
 * change and touches no component.
 *
 * ── ONE BLUEPRINT, TWO INSTANCES ──────────────────────────────────────────
 * `HUB_PAGE_IA.md` §"One blueprint, two instances" and `PILLAR_HUB_WIREFRAME.md`
 * §"Pillar inheritance" are explicit that the two hubs share the module set, the
 * order and the composition, and differ **only in the content they consume**.
 * `PillarHubMessages` is therefore the shape of *a* hub, and `realityCapture` is
 * the only instance authored — the Architecture & Design hub is not built by this
 * workstream and no A&D strings are invented here.
 *
 * ── WHAT WAS REMOVED FROM THE APPROVED HiFi TRANSCRIPTION ─────────────────
 * The strings below are transcribed from
 * `docs/pages/pillar-hub/reality-capture-hub-measured-reality-hifi-v1.html`
 * (owner-approved 2026-08-10) so that line lengths, `max-width: Nch` measures and
 * the authored rhythm are exercised at their real sizes. Three corrections:
 *
 *  1. **Diacritics removed** (OD-8, §11.3) — the HiFi carries them because it is
 *     a design reference, not production copy.
 *
 *  2. **Every capture claim deleted, not neutralised.** §10.4 is categorical:
 *     fabricated readouts "must not reach production… these are technical claims
 *     made to institutional clients evaluating a surveying service". The HiFi
 *     prints, as page copy, `2 mm · 46.77°N`, `GSD 1.2 cm/px`, `zbor · 78 m /
 *     1.240 imagini`, `± 2 mm`, `acuratete 2 mm · Leica RTC360 + drona`, and a
 *     four-figure "Masurat" row (`2 mm`, `1:1`, `7 tipuri de sit`, `2 metode`).
 *     **None of it is here.** Accuracy, equipment, point counts and capture
 *     metrics are rendered from live Sanity values or not at all — see
 *     `components/pillar-hub/hub.ts` and `media/PointCloudField.astro`.
 *     Marking them "(substituent)" as the Homepage does for its three
 *     credibility readouts would not be enough: those are practice-level facts
 *     with no CMS field behind them, while these have real fields that either
 *     carry a value or do not.
 *
 *  3. **The "1:1" figure kept once, as prose.** "la scara 1:1" in the opening
 *     lead is a statement about what surveying *is*, not a measurement of any
 *     delivered project — it names no instrument, no tolerance and no dataset.
 *
 * OD-8 (§11.3): Romanian site copy is authored WITHOUT diacritics.
 */

import type { Locale } from './routes';

/* -------------------------------------------------------------------------- */
/* Shapes                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * The hairline + station number + running coordinate that opens each section.
 *
 * Declared here rather than imported from `homepage.ts` for the same reason
 * `SectionMarker.astro` declares its own `Props`: no page's copy module owns
 * another page's component or another page's copy.
 */
export interface SectionMarkerCopy {
  readonly no: string;
  readonly label: string;
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

/** One door in the H-5 continuation group (`.door` in the approved HiFi). */
export interface DoorCopy {
  readonly kind: string;
  readonly title: string;
  readonly body: string;
}

export interface PillarHubMessages {
  readonly meta: { readonly title: string; readonly description: string };

  /** H-1 · Capability orientation (Stage A) — station 01. */
  readonly orientation: {
    readonly eyebrow: string;
    /** The capability name, set in the pixel voice over two lines. */
    readonly heading: { readonly lead: string; readonly tail: string };
    readonly thesis: AccentedHeading;
    readonly lead: string;
    /** Accessible name for the opening media when no authored alt exists. */
    readonly heroFallbackAlt: string;
    /** Decorative measurement annotations on the opening plate (aria-hidden). */
    readonly heroIndex: string;
    readonly heroCoordinates: string;
    /** PILLAR_HUB_WIREFRAME H-1: "a light text link to About". */
    readonly aboutLink: string;
  };

  /** H-2 · Capability framing & use-cases (Stage B) — station 02. */
  readonly framing: {
    readonly marker: SectionMarkerCopy;
    readonly question: AccentedHeading;
    /** Two prose columns; the second recedes (`--ink-60`), as authored. */
    readonly primary: readonly string[];
    readonly secondary: readonly string[];
    /**
     * The use-case set. `label` names it; `note` states where the values come
     * from, because they are live Sector values off the pillar's Services rather
     * than authored copy.
     */
    readonly useCases: { readonly label: string; readonly note: string };
    /** The capability-facts readout — live `Service.equipment`, never a figure. */
    readonly instruments: { readonly label: string; readonly note: string };
  };

  /** H-4 · Curated work (Stage D) — station 03. */
  readonly work: {
    readonly marker: SectionMarkerCopy;
    readonly title: string;
    readonly intro: string;
    /** Module CTA → the pillar-filtered Work Archive (the shared highlight rule). */
    readonly cta: string;
    readonly carousel: {
      readonly roleDescription: string;
      readonly label: string;
      readonly previous: string;
      readonly next: string;
      readonly position: string;
    };
    /**
     * The capture centrepiece, **and the one instance-level presentation option
     * H-4 carries** (reconciled at integration).
     *
     * `PILLAR_HUB_WIREFRAME.md` §"Pillar inheritance" lists H-4 under
     * "intentionally varies by capability (content only) — RC media may be
     * point-cloud/orthophoto; A&D renders/drawings", and
     * TECHNICAL_ARCHITECTURE.md §10.1 tabulates the verified result against the
     * six approved HiFis: Reality Capture Hub **yes**, Architecture & Design Hub
     * **no**.
     *
     * `CuratedWork.astro` therefore renders `PointCloudField` **only when the
     * instance supplies this copy** — the absence is expressed by the message
     * set, not by a pillar name inside the shared component, and not by a second
     * copy of the module. An instance that omits it renders no capture field at
     * all, which is what §10.1 requires: rendering the seam with a `null`
     * subject would put "point cloud — asset in preparation" onto a page that
     * has no point cloud, i.e. advertise a capability the pillar does not offer.
     */
    readonly pointCloud?: {
      readonly label: string;
      readonly hint: string;
      readonly posterAlt: string;
      /** Shown in the readout when nothing is publishable yet. */
      readonly unavailable: string;
    };
  };

  /** H-3 · Services overview (Stage C) — station 04. */
  readonly services: {
    readonly marker: SectionMarkerCopy;
    readonly intro: string;
    /** Per-card continuation label; extended with the Service name for 2.4.4. */
    readonly cta: string;
  };

  /** H-5 · Continue-to-archive (Stage E) — station 05. */
  readonly continue: {
    readonly marker: SectionMarkerCopy;
    readonly frame: AccentedHeading;
    readonly archive: DoorCopy;
    /**
     * Supporting navigation only. `HUB_PAGE_IA.md` §1: "cross-links to the other
     * pillar may exist as supporting navigation, but are never part of the
     * primary information flow."
     */
    readonly crossPillar: DoorCopy;
  };

  /** H-6 · Contact / next step (Stage E) — station 06. */
  readonly conversation: {
    readonly marker: SectionMarkerCopy;
    readonly invitation: AccentedHeading;
    readonly action: string;
    readonly note: string;
  };
}

/* -------------------------------------------------------------------------- */
/* RO — transcribed from the approved RC Hub HiFi, per the header notes         */
/* -------------------------------------------------------------------------- */

const ro: PillarHubMessages = {
  meta: {
    title: 'Reality Capture — pilon · diverse anumite',
    description:
      'Scanare 3D, fotogrametrie si relevee — realitatea construita, masurata pe teren si livrata ca nor de puncte, ortofoto sau desen.',
  },

  orientation: {
    eyebrow: 'pilon · capabilitate',
    heading: { lead: 'Reality', tail: 'Capture' },
    thesis: {
      lead: 'Nu desenam ce credem ca e acolo.',
      accent: 'Masuram',
      tail: 'ce este.',
    },
    lead:
      'Scanare 3D, fotogrametrie si relevee. Transformam cladiri, situri si peisaje reale in masuratori precise — nori de puncte, ortofotografii si desene pe care se poate lua o decizie. Nu o interpretare a locului, ci locul insusi, la scara 1:1.',
    heroFallbackAlt: 'Imagine substituent — documentare de sit, in asteptare',
    heroIndex: 'RC—001',
    heroCoordinates: '46.77°N 23.59°E',
    aboutLink: 'Despre atelier',
  },

  framing: {
    marker: { no: '02', label: 'Intrebarea', coordinate: 'observatie · masurare' },
    question: {
      lead: 'Ce ne lasa masurarea reala sa intelegem, ce un releveu obisnuit nu',
      accent: 'poate',
      tail: '?',
    },
    primary: [
      'Un releveu clasic noteaza ce a decis cineva sa masoare. O scanare noteaza tot — fiecare tasare de zid, fiecare perete care nu e drept, fiecare centimetru pe care ochiul l-ar rotunji. Realitatea nu se rotunjeste.',
      'De aici pornesc decizii mai bune: unde se poate interveni, cat material lipseste, daca o structura s-a miscat, cum arata ceva inainte sa dispara.',
    ],
    secondary: [
      'Masurarea nu e un scop. Este primul strat al proiectului — cel pe care arhitectura se poate sprijini fara sa ghiceasca.',
      'Reality capture nu inlocuieste privirea profesionistului. O inarmeaza cu o realitate pe care nimeni nu o poate contesta: coordonate, nu impresii.',
    ],
    useCases: {
      label: 'Unde se aplica',
      note: 'sectoare declarate pe serviciile pilonului',
    },
    instruments: {
      label: 'Cu ce masuram',
      note: 'echipament declarat pe serviciile pilonului',
    },
  },

  work: {
    marker: {
      no: '03',
      label: 'Documentari in focus',
      coordinate: 'selectie curatoriata · nu arhiva',
    },
    title: 'Situri masurate, unul cate unul.',
    intro:
      'Fiecare documentare intra pe rand in focus. Trageti lateral sau folositi sagetile. Selectia este curatoriata — arhiva completa este mai jos.',
    cta: 'Toate proiectele — Reality Capture',
    carousel: {
      roleDescription: 'carusel de documentari',
      label: 'Documentari — folositi sagetile pentru a naviga',
      previous: 'Documentarea anterioara',
      next: 'Documentarea urmatoare',
      position: 'Documentarea in focus',
    },
    pointCloud: {
      label: '03·b — geaman digital · nor de puncte',
      hint: 'trageti pentru a inspecta →',
      posterAlt: 'Imagine substituent — nor de puncte, in asteptare',
      unavailable: 'nor de puncte — asset in pregatire',
    },
  },

  services: {
    marker: {
      no: '04',
      label: 'Ce puteti comanda',
      coordinate: 'servicii · pilonul reality capture',
    },
    intro:
      'Fiecare serviciu are pagina lui, cu livrabile, proces si echipament. Aici doar recunoasteti care vi se potriveste.',
    cta: 'Vezi serviciul',
  },

  continue: {
    marker: { no: '05', label: 'Continuare', coordinate: 'de la masuratoare la decizie' },
    frame: { lead: 'Am masurat realitatea.', accent: 'Continuati', tail: 'cum vreti.' },
    archive: {
      kind: 'Documentari',
      title: 'Vezi toate proiectele',
      body: 'Situri si cladiri documentate, releveu cu releveu, in arhiva completa.',
    },
    crossPillar: {
      kind: 'Arhitectura & Design',
      title: 'Cum se leaga',
      body: 'Felul in care masurarea hraneste proiectul de arhitectura.',
    },
  },

  conversation: {
    marker: { no: '06', label: 'Conversatie', coordinate: 'un sit · un mesaj' },
    invitation: {
      lead: 'Aveti un sit sau o cladire de',
      accent: 'masurat',
      tail: '?',
    },
    action: 'Incepe o conversatie',
    note: 'Mesajul porneste cu subiectul deja setat pe Reality Capture.',
  },
};

/* -------------------------------------------------------------------------- */
/* EN — placeholder translation of the above, PENDING (C)                      */
/* -------------------------------------------------------------------------- */

const en: PillarHubMessages = {
  meta: {
    title: 'Reality Capture — capability · diverse anumite',
    description:
      '3D scanning, photogrammetry and measured surveys — the built world measured on site and delivered as a point cloud, orthophoto or drawing.',
  },

  orientation: {
    eyebrow: 'capability · one of two',
    heading: { lead: 'Reality', tail: 'Capture' },
    thesis: {
      lead: 'We do not draw what we think is there.',
      accent: 'We measure',
      tail: 'what is.',
    },
    lead:
      '3D scanning, photogrammetry and measured surveys. We turn real buildings, sites and landscapes into precise measurements — point clouds, orthophotos and drawings you can make a decision on. Not an interpretation of the place, but the place itself, at 1:1.',
    heroFallbackAlt: 'Placeholder image — site documentation pending',
    heroIndex: 'RC—001',
    heroCoordinates: '46.77°N 23.59°E',
    aboutLink: 'About the studio',
  },

  framing: {
    marker: { no: '02', label: 'The question', coordinate: 'observation · measurement' },
    question: {
      lead: 'What does measuring reality let us understand that an ordinary survey',
      accent: 'cannot',
      tail: '?',
    },
    primary: [
      'A conventional survey records what someone decided to measure. A scan records everything — every settled wall, every plane that is not straight, every centimetre the eye would round off. Reality does not round off.',
      'Better decisions start there: where you can intervene, how much material is missing, whether a structure has moved, what something looked like before it disappeared.',
    ],
    secondary: [
      'Measurement is not the goal. It is the first layer of the project — the one architecture can lean on without guessing.',
      'Reality capture does not replace a professional eye. It arms it with a reality nobody can dispute: coordinates, not impressions.',
    ],
    useCases: {
      label: 'Where it applies',
      note: 'sectors declared on this capability’s services',
    },
    instruments: {
      label: 'What we measure with',
      note: 'equipment declared on this capability’s services',
    },
  },

  work: {
    marker: {
      no: '03',
      label: 'Documentation in focus',
      coordinate: 'a curated selection · not the archive',
    },
    title: 'Measured sites, one at a time.',
    intro:
      'Each documentation comes into focus in turn. Drag sideways or use the arrows. The selection is curated — the full archive is below.',
    cta: 'All projects — Reality Capture',
    carousel: {
      roleDescription: 'documentation carousel',
      label: 'Documentation — use the arrow keys to navigate',
      previous: 'Previous documentation',
      next: 'Next documentation',
      position: 'Documentation in focus',
    },
    pointCloud: {
      label: '03·b — digital twin · point cloud',
      hint: 'drag to inspect →',
      posterAlt: 'Placeholder image — point cloud pending',
      unavailable: 'point cloud — asset in preparation',
    },
  },

  services: {
    marker: {
      no: '04',
      label: 'What you can commission',
      coordinate: 'services · reality capture',
    },
    intro:
      'Each service has its own page, with deliverables, process and equipment. Here you only recognise which one fits.',
    cta: 'See the service',
  },

  continue: {
    marker: { no: '05', label: 'Continue', coordinate: 'from measurement to decision' },
    frame: { lead: 'We have measured reality.', accent: 'Continue', tail: 'however you like.' },
    archive: {
      kind: 'Documentation',
      title: 'See all projects',
      body: 'Sites and buildings documented, survey by survey, in the full archive.',
    },
    crossPillar: {
      kind: 'Architecture & Design',
      title: 'How it connects',
      body: 'The way measurement feeds the architectural project.',
    },
  },

  conversation: {
    marker: { no: '06', label: 'Conversation', coordinate: 'one site · one message' },
    invitation: {
      lead: 'Do you have a site or a building to',
      accent: 'measure',
      tail: '?',
    },
    action: 'Start a conversation',
    note: 'The message starts with the topic already set to Reality Capture.',
  },
};

const REALITY_CAPTURE: Readonly<Record<Locale, PillarHubMessages>> = { ro, en };

/**
 * The Reality Capture hub's copy.
 *
 * There is deliberately no `pillarHubMessages(pillar, locale)`: the Architecture
 * & Design instance has no authored strings, and a lookup that could return
 * `undefined` for it would invite a component to render an empty hub rather than
 * fail to compile.
 */
export function realityCaptureHubMessages(locale: Locale): PillarHubMessages {
  return REALITY_CAPTURE[locale];
}
