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
 * Two strings are unavoidably editorial and are marked PENDING (C):
 *
 *   · `proof.empty.note` — F5 requires "a concise editorial message (relevant
 *     examples being added)" (`SERVICE_PAGE_IA.md` S-4; `SERVICE_WIREFRAME.md`
 *     §"Empty state (F5)"). Leaving it empty, the ui.ts convention for
 *     unauthored copy, would produce the empty module F5 exists to forbid — so
 *     a factual working sentence stands in until C authors one. It states only
 *     that examples are being added; it makes no claim about the service.
 *   · `conversion.invitation` — S-5 is "one calm invitation, one primary
 *     action". Same reasoning, same constraint: nothing here asserts a
 *     capability, a timeline or a result.
 *
 * There is deliberately **no FAQ copy**. `SERVICE_WIREFRAME.md` S-3 lists an
 * Accordion / FAQ as *optional secondary detail* and `SERVICE_PAGE_IA.md` S-3
 * files it under "*Future:*"; no field in `CONTENT_MODEL.md` §2 and no field on
 * `Service` carries question/answer pairs. The approved HiFi hand-authors four
 * of them for one service. A HiFi does not create a CMS field — see
 * `components/service/modules.ts`.
 *
 * OD-8 (§11.3): Romanian copy is authored WITHOUT diacritics.
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
      readonly posterAlt: string;
      readonly unavailable: string;
      /** Link naming the entry the cloud and its readout come from. */
      readonly source: string;
    };
    /** F5 — zero demonstrating entries is a valid published state. */
    readonly empty: {
      /** PENDING (C). Never an empty grid, carousel or counter. */
      readonly note: string;
      /** F5's Contact CTA. */
      readonly contact: string;
      /** F5's Hub back-path. `{pillar}` is substituted. */
      readonly hub: string;
    };
  };

  readonly conversion: {
    /** PENDING (C) — the quiet invitation above the single action. */
    readonly invitation: string;
    /** The one primary action on the page (S-5). */
    readonly contact: string;
    /** The F1 back-path, kept distinct from the conversion action. */
    readonly hub: string;
  };
}

/* -------------------------------------------------------------------------- */
/* RO — diacritics removed per OD-8                                            */
/* -------------------------------------------------------------------------- */

const ro: ServiceMessages = {
  breadcrumb: { label: 'Firul paginii', services: 'Servicii' },
  kicker: 'S·{code}',
  kickerPlain: 'Serviciu',
  about: 'Despre atelier',

  markers: {
    deliverables: { label: 'Ce primiti', coordinate: 'livrabile, nu functii' },
    process: { label: 'Cum lucram', coordinate: 'metoda, pas cu pas' },
    capabilities: { label: 'Capabilitati si echipamente', coordinate: 'cifre reale, nimic calculat' },
    proof: {
      label: 'Proiecte in care am folosit serviciul',
      coordinate: 'exemple, nu arhiva',
    },
    conversion: { label: 'Continuare', coordinate: 'de la intrebare la conversatie' },
  },

  identity: { solves: 'Ce rezolva', useCases: 'Util pentru' },
  deliverables: {
    listLabel: 'Livrabilele serviciului',
    mediaCaption: 'imagine de referinta a serviciului',
  },
  capabilities: { listLabel: 'Echipament si specificatii' },

  proof: {
    seeMore: 'Toate proiectele — {pillar}',
    listLabel: 'Proiecte care demonstreaza acest serviciu',
    cloud: {
      label: 'nor de puncte · releveu din {work}',
      hint: 'trageti pentru a inspecta →',
      posterAlt: 'Imagine substituent — nor de puncte, in asteptare',
      unavailable: 'nor de puncte — asset in pregatire',
      source: 'Vezi proiectul',
    },
    empty: {
      note: 'Exemplele publice pentru acest serviciu sunt in pregatire. Pana atunci, va putem arata lucrari relevante la cerere.',
      contact: 'Scrieti-ne',
      hub: 'Vezi {pillar}',
    },
  },

  conversion: {
    invitation: 'Aveti un proiect pentru care acest serviciu ar fi potrivit?',
    contact: 'Incepeti o conversatie',
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
      posterAlt: 'Placeholder image — point cloud pending',
      unavailable: 'point cloud — asset in preparation',
      source: 'See the project',
    },
    empty: {
      note: 'Public examples for this service are being prepared. Until then, we can show relevant work on request.',
      contact: 'Get in touch',
      hub: 'See {pillar}',
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
