/**
 * Service page interface copy — labels and framing, not editorial content.
 *
 * OWNERSHIP: Workstream A commits the STRUCTURE; Workstream C authors the
 * STRINGS (TECHNICAL_ARCHITECTURE.md §23.3, "i18n message files | A (RO/EN
 * strings authored by C) | two-party file"). Replacing a value here is a copy
 * change and touches no component.
 *
 * ── WHY THIS FILE IS SHORT, AND WHERE IT IS NOT ───────────────────────────
 * Every *claim* on a Service page comes from the Service document — name,
 * positioning, what it solves, deliverables, process, equipment. The strings
 * here are the frame around those claims: section markers, the labels over a
 * list, the accessible names of the two navigational paths, and the invitation
 * that carries the single conversion action.
 *
 * Two editorial slots are resolved by owner decision rather than by copy:
 *
 *   · `proof.empty.*` — RETIRED (`DECISIONS_LOG.md` #104). A Service with no
 *     demonstrating work renders no S-4, so no "examples in preparation" note
 *     exists to label.
 *   · `conversion.invitation` — OPTIONAL (#105), authored `''` (absent) in RO.
 *
 * There is deliberately **no FAQ copy**. `SERVICE_WIREFRAME.md` S-3 lists an
 * Accordion / FAQ as *optional secondary detail* and `SERVICE_PAGE_IA.md` S-3
 * files it under "*Future:*"; no field in `CONTENT_MODEL.md` §2 and no field on
 * `Service` carries question/answer pairs. The approved HiFi hand-authors four
 * of them for one service. A HiFi does not create a CMS field — see
 * `components/service/modules.ts`.
 *
 * RO carries correct Romanian diacritics (`DECISIONS_LOG.md` #103, amending
 * OD-8 §11.3). Identifiers, slugs and query tokens never live here.
 */

import type { Locale } from './routes';

/* -------------------------------------------------------------------------- */
/* Shapes                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * A section marker minus its station number.
 *
 * The shared `SectionMarker` component takes `no` as well, and the Work Entry's
 * message file hard-codes it per marker. A Service page cannot: which modules
 * render depends on what the Service document carries (`modules.ts`), so a fixed
 * "04" would disagree with the coordinate rail the moment a service omits a
 * field. The number is therefore composed from the resolved station and this
 * shape carries only the two authored strings.
 */
export interface ServiceMarkerCopy {
  /** Section name, mono label voice. */
  readonly label: string;
  /** The right-side running coordinate, mono. */
  readonly coordinate: string;
}

export interface ServiceMessages {
  readonly breadcrumb: {
    /** Accessible name of the breadcrumb landmark. */
    readonly label: string;
    /** First crumb — the Services index (IA §2.1 `/servicii`). */
    readonly services: string;
  };
  /**
   * The identity block's title-block line, opposite the pillar name. The
   * service's catalogue position is substituted into `{code}` when the route
   * could derive one — see `ServicePage.astro`.
   */
  readonly kicker: string;
  /** Fallback title-block word when no catalogue position is available. */
  readonly kickerPlain: string;
  /** S-1's light link to About (`SERVICE_WIREFRAME.md` S-1; Page IA S-1). */
  readonly about: string;

  readonly markers: {
    readonly deliverables: ServiceMarkerCopy;
    readonly process: ServiceMarkerCopy;
    readonly capabilities: ServiceMarkerCopy;
    readonly proof: ServiceMarkerCopy;
    readonly conversion: ServiceMarkerCopy;
  };

  /** The identity block's evaluation rail (S-2, read inside the opening). */
  readonly identity: {
    /** Label over `problemSolved`. */
    readonly solves: string;
    /** Label over the Sector-relevant use-case set. */
    readonly useCases: string;
  };

  readonly deliverables: {
    /** Accessible name of the deliverables list. */
    readonly listLabel: string;
    /** Mono caption under the one supporting image, when the service has one. */
    readonly mediaCaption: string;
  };

  readonly capabilities: {
    /** Accessible name of the equipment / specification list. */
    readonly listLabel: string;
  };

  readonly proof: {
    /** "see more" → the pillar-filtered Work Archive. `{pillar}` substituted. */
    readonly seeMore: string;
    /** Accessible name of the proof set. */
    readonly listLabel: string;
    /** The point-cloud field, when a demonstrating survey supports one. */
    readonly cloud: {
      /** Label above the field. `{work}` = the entry the cloud belongs to. */
      readonly label: string;
      readonly hint: string;
      /** Link naming the entry the cloud and its readout come from. */
      readonly source: string;
    };
    /* `empty` (F5 note + Contact + Hub) is retired by #104. `cloud.posterAlt` and
       `cloud.unavailable` are retired too: the Service page passes neither
       (Capabilities.astro), so no placeholder alt or in-preparation note renders. */
  };

  readonly conversion: {
    /**
     * `''` when the instance authors no invitation — the absent-slot convention.
     * `DECISIONS_LOG.md` #105 makes S-5's invitation optional, so a station consisting of its
     * marker, the single `Contact` action and the back-path is complete, not unfinished.
     */
    readonly invitation: string;
    /** The one primary action on the page (S-5). */
    readonly contact: string;
    /** The F1 back-path, kept distinct from the conversion action. */
    readonly hub: string;
  };
}

/* -------------------------------------------------------------------------- */
/* RO — with diacritics (DECISIONS_LOG.md #103)                                */
/* -------------------------------------------------------------------------- */

const ro: ServiceMessages = {
  breadcrumb: { label: 'Firul paginii', services: 'Servicii' },
  kicker: 'S·{code}',
  kickerPlain: 'Serviciu',
  about: 'Despre atelier',

  markers: {
    deliverables: { label: 'Ce primiți', coordinate: 'livrabile, nu funcții' },
    process: { label: 'Cum lucrăm', coordinate: 'metoda, pas cu pas' },
    capabilities: { label: 'Capabilități și echipamente', coordinate: 'cifre reale, nimic calculat' },
    proof: {
      label: 'Proiecte în care am folosit serviciul',
      coordinate: 'exemple, nu arhiva',
    },
    conversion: { label: 'Continuare', coordinate: 'de la întrebare la conversație' },
  },

  identity: { solves: 'Ce rezolvă', useCases: 'Util pentru' },
  deliverables: {
    listLabel: 'Livrabilele serviciului',
    mediaCaption: 'imagine de referință a serviciului',
  },
  capabilities: { listLabel: 'Echipament și specificații' },

  proof: {
    seeMore: 'Toate proiectele — {pillar}',
    listLabel: 'Proiecte care demonstrează acest serviciu',
    cloud: {
      label: 'nor de puncte · releveu din {work}',
      hint: 'trageți pentru a inspecta →',
      source: 'Vezi proiectul',
    },
  },

  conversion: {
    /* ABSENT (locked, Stable RO) — #105. No filler invitation is authored to satisfy the
       wireframe's "one calm invitation" phrasing; `Conversion.astro` renders none. */
    invitation: '',
    contact: 'Începeți o conversație',
    hub: 'Vezi {pillar}',
  },
};

/* -------------------------------------------------------------------------- */
/* EN — PENDING (C); no upstream document authors EN interface wording          */
/* -------------------------------------------------------------------------- */

const en: ServiceMessages = {
  breadcrumb: { label: 'Breadcrumb', services: 'Services' },
  kicker: 'S·{code}',
  kickerPlain: 'Service',
  about: 'About the studio',

  markers: {
    deliverables: { label: 'What you get', coordinate: 'deliverables, not features' },
    process: { label: 'How we work', coordinate: 'the method, step by step' },
    capabilities: {
      label: 'Capabilities and equipment',
      coordinate: 'real figures, nothing computed',
    },
    proof: {
      label: 'Projects where we used this service',
      coordinate: 'examples, not the archive',
    },
    conversion: { label: 'Onward', coordinate: 'from question to conversation' },
  },

  identity: { solves: 'What it solves', useCases: 'Suited to' },
  deliverables: {
    listLabel: 'What this service delivers',
    mediaCaption: 'reference image for this service',
  },
  capabilities: { listLabel: 'Equipment and specifications' },

  proof: {
    seeMore: 'All projects — {pillar}',
    listLabel: 'Projects demonstrating this service',
    cloud: {
      label: 'point cloud · survey from {work}',
      hint: 'drag to inspect →',
      source: 'See the project',
    },
  },

  conversion: {
    invitation: 'Do you have a project this service would fit?',
    contact: 'Start a conversation',
    hub: 'See {pillar}',
  },
};

const MESSAGES: Readonly<Record<Locale, ServiceMessages>> = { ro, en };

export function serviceMessages(locale: Locale): ServiceMessages {
  return MESSAGES[locale];
}
