/**
 * Pillar Hub editorial copy — the **Reality Capture** instance.
 *
 * STATUS: the RO strings are the Reality Capture editorial LOCK (approved 2026-09-25,
 * DECISIONS_LOG.md #106), with correct diacritics (#103). `rc-copy-firewall.test.ts` pins every
 * RO value literally. EN is WITHHELD for the initial launch: it is not a translation of the RO
 * copy, its surviving strings are frozen byte-identical, and it carries only the structural
 * omissions that mirror RO (so the two locales keep one shape).
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
 * `PillarHubMessages` is therefore the shape of *a* hub; this file is the Reality
 * Capture instance and `architecture-design-hub.ts` is the other.
 *
 * ── ABSENT SLOTS ──────────────────────────────────────────────────────────
 * A slot the lock does not author is an OMITTED key, never `''` and never a stand-in, and the
 * shared module renders no element for it. Absent for Reality Capture (RO and EN): the hero
 * thesis, the hero fallback alt, the hero coordinates, the H-2 use-case block, the H-4 heading,
 * the H-4 point-cloud field, the H-5 frame, the H-5 archive door's body, and the H-6 invitation.
 *
 * No capture claim is page copy (§10.4): accuracy, equipment, point counts and capture metrics
 * are rendered from live Sanity values or not at all — see `components/pillar-hub/hub.ts`.
 *
 * DIACRITICS: RO human-facing copy carries ă â î ș ț (DECISIONS_LOG.md #103, amending
 * OD-8). Identifiers stay ASCII.
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
  /** OPTIONAL since Wave 3 — the locked A&D Hub's archive door has no body line. */
  readonly body?: string;
}

export interface PillarHubMessages {
  readonly meta: { readonly title: string; readonly description: string };

  /** H-1 · Capability orientation (Stage A) — station 01. */
  readonly orientation: {
    readonly eyebrow: string;
    /** The capability name, set in the pixel voice over two lines. */
    readonly heading: { readonly lead: string; readonly tail: string };
    /**
     * OPTIONAL since the Stable RO pass. Neither locked hub has a hero thesis, and an instance
     * that omits this field renders none — the same mechanism `work.pointCloud` uses to express
     * a per-instance absence on this shared shape.
     */
    readonly thesis?: AccentedHeading;
    /**
     * `''` when the instance authors no opening lead — the `ui.ts` convention for an absent
     * slot, so no type change is needed and `Orientation.astro` renders no empty paragraph.
     */
    readonly lead: string;
    /**
     * Accessible name for the opening media when no authored alt exists. OPTIONAL since Wave 3:
     * neither locked hub has one (a stand-in alt is placeholder copy), and an instance that omits
     * it renders a decorative plate.
     */
    readonly heroFallbackAlt?: string;
    /** Decorative measurement annotations on the opening plate (aria-hidden). */
    readonly heroIndex: string;
    /**
     * OPTIONAL since Wave 3 (X3): unconfirmed geography is removed, never neutralised. An
     * instance that omits it renders no coordinate annotation (neither locked hub has one).
     */
    readonly heroCoordinates?: string;
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
     *
     * OPTIONAL since the Reality Capture lock (#106): an instance that omits it renders no
     * use-case block at all, whatever Sectors its Services declare. Reality Capture omits it;
     * Architecture & Design supplies it.
     */
    readonly useCases?: { readonly label: string; readonly note: string };
    /** The capability-facts readout — live `Service.equipment`, never a figure. */
    readonly instruments: { readonly label: string; readonly note: string };
  };

  /** H-4 · Curated work (Stage D) — station 03. */
  readonly work: {
    readonly marker: SectionMarkerCopy;
    /** OPTIONAL since Wave 3 — the locked A&D Hub's H-4 has no heading under its marker. */
    readonly title?: string;
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
     *
     * Since the Reality Capture lock (#106) the RC instance omits it too, so neither hub
     * currently renders the field; the seam stays for an instance that authors it.
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
    /** `''` when the instance authors no intro — absent slot, not an empty paragraph. */
    readonly intro: string;
    /** Per-card continuation label; extended with the Service name for 2.4.4. */
    readonly cta: string;
  };

  /** H-5 · Continue-to-archive (Stage E) — station 05. */
  readonly continue: {
    readonly marker: SectionMarkerCopy;
    /**
     * OPTIONAL since the Stable RO pass — the locked A&D Hub's `continue.frame` is ABSENT.
     * An instance that omits it renders the doors with no framing line above them.
     */
    readonly frame?: AccentedHeading;
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
    /**
     * OPTIONAL since the Stable RO pass — the locked A&D Hub's `conversation.invitation` is
     * ABSENT, leaving the marker, the single `Contact` action and the note. `DECISIONS_LOG.md`
     * #105 records the equivalent position for the Service page's S-5.
     */
    readonly invitation?: AccentedHeading;
    readonly action: string;
    readonly note: string;
  };
}

/* -------------------------------------------------------------------------- */
/* RO — Reality Capture editorial LOCK (#106)                                  */
/* -------------------------------------------------------------------------- */

const ro: PillarHubMessages = {
  meta: {
    title: 'Reality Capture · diverse anumite',
    description:
      'Scanare laser 3D și Scan-to-BIM — serviciile de Reality Capture ale atelierului diverse anumite.',
  },

  orientation: {
    eyebrow: 'pilon · capabilitate',
    heading: { lead: 'Reality', tail: 'Capture' },
    lead: 'Scanare laser 3D și Scan-to-BIM: nor de puncte, model BIM, planuri, secțiuni și fațade.',
    heroIndex: 'RC—001',
    aboutLink: 'Despre atelier',
  },

  framing: {
    marker: { no: '02', label: 'Întrebarea', coordinate: 'utilizări frecvente' },
    question: {
      lead: 'Pentru ce este folosit cel mai des',
      accent: 'rezultatul',
      tail: '?',
    },
    primary: [
      'Scanăm locuințe, clădiri comerciale și industriale, clădiri de patrimoniu, spații interioare, fațade, exterior și teren, precum și parcuri industriale.',
      'Scanarea laser 3D este folosită cel mai des pentru releveu, documentarea situației existente, renovare / intervenție pe existent, bază pentru proiectare, patrimoniu, BIM / Scan-to-BIM și As-Built.',
    ],
    secondary: [
      'Scan-to-BIM poate porni de la o scanare realizată de noi sau de la un nor de puncte furnizat de client.',
      'Rezultatul Scan-to-BIM este folosit cel mai des pentru proiectare pe clădiri existente, renovare / reabilitare, documentație, patrimoniu și facility management.',
    ],
    instruments: {
      label: 'Cu ce măsurăm',
      note: 'echipament declarat pe serviciile pilonului',
    },
  },

  work: {
    marker: {
      no: '03',
      label: 'Proiecte în focus',
      coordinate: 'selecție curatoriată · nu arhiva',
    },
    intro:
      'Fiecare proiect intră pe rând în focus. Trageți lateral sau folosiți săgețile. Selecția este curatoriată — arhiva completă este mai jos.',
    cta: 'Toate proiectele — Reality Capture',
    carousel: {
      roleDescription: 'carusel de proiecte',
      label: 'Proiecte — folosiți săgețile pentru a naviga',
      previous: 'Proiectul anterior',
      next: 'Proiectul următor',
      position: 'Proiectul în focus',
    },
  },

  services: {
    marker: {
      no: '04',
      label: 'Ce puteți comanda',
      coordinate: 'servicii · pilonul reality capture',
    },
    intro: 'Fiecare serviciu are pagina lui, cu livrabilele sale. Alegeți serviciul care vi se potrivește.',
    cta: 'Vezi serviciul',
  },

  continue: {
    marker: { no: '05', label: 'Continuare', coordinate: 'arhivă · cealaltă direcție' },
    archive: {
      kind: 'Proiecte',
      title: 'Vezi toate proiectele',
    },
    crossPillar: {
      kind: 'Cealaltă direcție',
      title: 'Arhitectură & Design',
      body: 'Proiectare de arhitectură, design interior, vizualizare 3D și design mobilier.',
    },
  },

  conversation: {
    marker: { no: '06', label: 'Conversație', coordinate: 'un proiect · un mesaj' },
    action: 'Începe o conversație',
    note: 'Mesajul pornește cu subiectul deja setat pe Reality Capture.',
  },
};

/* -------------------------------------------------------------------------- */
/* EN — WITHHELD at launch; not a translation. Absences mirror RO (parity).     */
/* -------------------------------------------------------------------------- */

const en: PillarHubMessages = {
  meta: {
    title: 'Reality Capture — capability · diverse anumite',
    description:
      '3D scanning, photogrammetry and measured surveys — the built world measured on site and delivered as a point cloud or drawing.',
  },

  orientation: {
    eyebrow: 'capability · one of two',
    heading: { lead: 'Reality', tail: 'Capture' },
    lead:
      '3D scanning, photogrammetry and measured surveys. We turn real buildings, sites and landscapes into precise measurements — point clouds and drawings you can make a decision on. Not an interpretation of the place, but the place itself, at 1:1.',
    heroIndex: 'RC—001',
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
    archive: {
      kind: 'Documentation',
      title: 'See all projects',
    },
    crossPillar: {
      kind: 'Architecture & Design',
      title: 'How it connects',
      body: 'The way measurement feeds the architectural project.',
    },
  },

  conversation: {
    marker: { no: '06', label: 'Conversation', coordinate: 'one site · one message' },
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
