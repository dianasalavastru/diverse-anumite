/**
 * Work Entry interface copy — labels, not editorial content.
 *
 * OWNERSHIP: Workstream A commits the STRUCTURE; Workstream C authors the
 * STRINGS (TECHNICAL_ARCHITECTURE.md §23.3, "i18n message files | A (RO/EN
 * strings authored by C) | two-party file"). Replacing a value here is a copy
 * change and touches no component.
 *
 * ── WHY THIS FILE IS SHORT ────────────────────────────────────────────────
 * The Homepage's message file carries paragraphs, because the Homepage *is*
 * editorial copy. The Work Entry is the opposite: **every sentence on the page
 * comes from the Work Entry document** — title, description,
 * metadata, capture specifications. `WORK_ENTRY_WIREFRAME.md` puts it plainly:
 * the work is the protagonist and "the interface frames, never competes."
 *
 * So the only strings here are the *frame*: section markers, metadata field
 * names, credit-row labels, and the accessible names the Media Viewer's controls
 * need. None of them makes a claim about a project. There is deliberately no
 * "abstract", no "thesis line" and no "materials" copy: the approved HiFi
 * authors all three by hand for one fictional project, and no field in
 * `CONTENT_MODEL.md` §3 carries them (see WorkEntryPage.astro).
 *
 * OD-8 (§11.3): Romanian copy is authored WITHOUT diacritics.
 */

import type { Locale } from './routes';

/* -------------------------------------------------------------------------- */
/* Shapes                                                                      */
/* -------------------------------------------------------------------------- */

/** Matches the shared SectionMarker component's `copy` prop. */
export interface MarkerCopy {
  readonly no: string;
  readonly label: string;
  readonly coordinate: string;
}

/**
 * Field names for W-1's flexible metadata component. COMPONENT_INVENTORY.md
 * "Project Metadata": "common metadata always shown; type-specific attributes
 * when relevant… **not a fixed field set**" — so these are the labels for the
 * fields that *may* appear, and a field with no value renders no row at all.
 */
export interface MetadataLabels {
  readonly labels: string;
  readonly sector: string;
  readonly year: string;
  readonly location: string;
  readonly status: string;
  readonly area: string;
  readonly client: string;
  readonly deliverables: string;
  readonly awards: string;
  readonly team: string;
  /** STAGE 8 — Service-activated project facts (v3.1 §5, §7). */
  readonly equipment: string;
  readonly implementationCompany: string;
  /** Unit suffix on Area. A unit, not prose — square metres in both locales. */
  readonly areaUnit: string;
}

/**
 * W-3 row labels.
 *
 * STAGE 3: the three-way split of `CONTENT_MODEL.md`:60 — Attribution, Role, Authorship — is
 * retired (v3.1 §12), and the Professional Experience link went with Stage 2. What is left is
 * the one crediting row the model keeps: Collaborators. Team is also a crediting field in v3.1
 * §13 but already renders in Project Metadata (or the competition module), and moving it would
 * be a placement redesign rather than a retirement.
 */
export interface CreditsLabels {
  readonly collaborators: string;
}

export interface ViewerLabels {
  /** Accessible name of the lightbox dialog. */
  readonly label: string;
  /** Accessible name of a gallery item when the asset carries no authored alt. */
  readonly openItem: string;
  readonly close: string;
  readonly previous: string;
  readonly next: string;
  readonly zoomIn: string;
  readonly zoomOut: string;
  readonly reset: string;
  /** The explicit zoom activation §14.2 requires, as a toggle button. */
  readonly inspect: string;
  /** Keyboard help, rendered as visible text inside the dialog. */
  readonly keys: string;
  /** Live-region prefix for the zoom readout, e.g. "Zoom". */
  readonly zoomLevel: string;
  /** Live-region prefix for the item position, e.g. "Image". */
  readonly position: string;
}

export interface WorkEntryMessages {
  readonly breadcrumb: {
    /** Accessible name of the breadcrumb landmark. */
    readonly label: string;
    /** First crumb — the parent browse surface. */
    readonly archive: string;
  };
  readonly markers: {
    readonly facts: MarkerCopy;
    readonly evidence: MarkerCopy;
    readonly credits: MarkerCopy;
    readonly competition: MarkerCopy;
    readonly capture: MarkerCopy;
    readonly services: MarkerCopy;
    readonly related: MarkerCopy;
    readonly onward: MarkerCopy;
  };
  readonly metadata: MetadataLabels;
  readonly credits: CreditsLabels;
  readonly evidence: {
    /** Accessible name of the gallery list. */
    readonly galleryLabel: string;
    /** Accessible name for the hero image when the asset carries no authored alt. */
    readonly heroFallbackAlt: string;
  };
  readonly capture: {
    /** Label above the point-cloud field — passed straight to PointCloudField. */
    readonly label: string;
    readonly hint: string;
    readonly posterAlt: string;
    readonly unavailable: string;
    readonly equipment: string;
    readonly software: string;
    readonly deliverables: string;
  };
  readonly services: {
    /** One line naming what the link is for. Never a pitch (Page IA W-5). */
    readonly cta: string;
  };
  readonly related: {
    readonly seeMore: string;
    readonly carousel: {
      readonly roleDescription: string;
      readonly label: string;
      readonly previous: string;
      readonly next: string;
      readonly position: string;
    };
  };
  readonly onward: {
    /** F1 back-path to the parent Pillar Hub. `{pillar}` is substituted. */
    readonly hub: string;
    readonly contact: string;
  };
  readonly viewer: ViewerLabels;
}

/* -------------------------------------------------------------------------- */
/* RO — diacritics removed per OD-8                                            */
/* -------------------------------------------------------------------------- */

const ro: WorkEntryMessages = {
  breadcrumb: { label: 'Firul paginii', archive: 'Proiecte' },

  markers: {
    facts: { no: '02', label: 'Fisa tehnica', coordinate: 'date masurate' },
    evidence: { no: '03', label: 'Lucrarea', coordinate: 'descriere · imagini' },
    credits: { no: '04', label: 'Credite', coordinate: 'atribuire onesta' },
    competition: { no: '05', label: 'Concurs', coordinate: 'rezultat · echipa' },
    capture: { no: '06', label: 'Reality capture', coordinate: 'releveul acestui proiect' },
    services: { no: '07', label: 'Servicii demonstrate', coordinate: 'pe acest proiect' },
    related: { no: '08', label: 'Proiecte inrudite', coordinate: 'context' },
    onward: { no: '09', label: 'Mai departe', coordinate: 'capabilitate · contact' },
  },

  metadata: {
    labels: 'Etichete',
    sector: 'Sector',
    year: 'An',
    location: 'Locatie',
    status: 'Status',
    area: 'Suprafata',
    client: 'Client',
    deliverables: 'Livrabile',
    awards: 'Distinctii',
    team: 'Echipa',
    equipment: 'Echipament',
    implementationCompany: 'Firma implementare',
    areaUnit: 'm²',
  },

  credits: {
    collaborators: 'Colaboratori',
  },

  evidence: {
    galleryLabel: 'Imaginile proiectului',
    heroFallbackAlt: 'Imagine substituent — fotografia proiectului, in asteptare',
  },

  capture: {
    label: 'nor de puncte · releveul proiectului',
    hint: 'trageti pentru a inspecta →',
    posterAlt: 'Imagine substituent — nor de puncte, in asteptare',
    unavailable: 'nor de puncte — asset in pregatire',
    equipment: 'Echipament',
    software: 'Software',
    deliverables: 'Livrabile',
  },

  services: { cta: 'Vezi serviciul' },

  related: {
    seeMore: 'Toate proiectele',
    carousel: {
      roleDescription: 'strip de proiecte inrudite',
      label: 'Proiecte inrudite — folositi sagetile pentru a naviga',
      previous: 'Proiectul anterior',
      next: 'Proiectul urmator',
      position: 'Proiectul in focus',
    },
  },

  onward: { hub: 'Vezi {pillar}', contact: 'Scrieti-ne' },

  viewer: {
    label: 'Vizualizator de imagini',
    openItem: 'Deschide imaginea',
    close: 'Inchide',
    previous: 'Imaginea anterioara',
    next: 'Imaginea urmatoare',
    zoomIn: 'Mareste',
    zoomOut: 'Micsoreaza',
    reset: 'Revino la marimea initiala',
    inspect: 'Inspectie — zoom si deplasare',
    keys: '+ / − zoom · 0 reset · sagetile deplaseaza cand este marit · Esc inchide',
    zoomLevel: 'Zoom',
    position: 'Imaginea',
  },
};

/* -------------------------------------------------------------------------- */
/* EN — PENDING (C); no upstream document authors EN interface wording          */
/* -------------------------------------------------------------------------- */

const en: WorkEntryMessages = {
  breadcrumb: { label: 'Breadcrumb', archive: 'Projects' },

  markers: {
    facts: { no: '02', label: 'Technical sheet', coordinate: 'measured data' },
    evidence: { no: '03', label: 'The work', coordinate: 'description · images' },
    credits: { no: '04', label: 'Credits', coordinate: 'colaboratori' },
    competition: { no: '05', label: 'Competition', coordinate: 'outcome · team' },
    capture: { no: '06', label: 'Reality capture', coordinate: "this project's survey" },
    services: { no: '07', label: 'Services demonstrated', coordinate: 'on this project' },
    related: { no: '08', label: 'Related work', coordinate: 'context' },
    onward: { no: '09', label: 'Onward', coordinate: 'capability · contact' },
  },

  metadata: {
    labels: 'Labels',
    sector: 'Sector',
    year: 'Year',
    location: 'Location',
    status: 'Status',
    area: 'Area',
    client: 'Client',
    deliverables: 'Deliverables',
    awards: 'Awards',
    team: 'Team',
    equipment: 'Equipment',
    implementationCompany: 'Implementation company',
    areaUnit: 'm²',
  },

  credits: {
    collaborators: 'Collaborators',
  },

  evidence: {
    galleryLabel: 'Project images',
    heroFallbackAlt: 'Placeholder image — project photography pending',
  },

  capture: {
    label: "point cloud · this project's survey",
    hint: 'drag to inspect →',
    posterAlt: 'Placeholder image — point cloud pending',
    unavailable: 'point cloud — asset in preparation',
    equipment: 'Equipment',
    software: 'Software',
    deliverables: 'Deliverables',
  },

  services: { cta: 'See the service' },

  related: {
    seeMore: 'All projects',
    carousel: {
      roleDescription: 'related work strip',
      label: 'Related work — use the arrow keys to navigate',
      previous: 'Previous project',
      next: 'Next project',
      position: 'Project in focus',
    },
  },

  onward: { hub: 'See {pillar}', contact: 'Get in touch' },

  viewer: {
    label: 'Image viewer',
    openItem: 'Open image',
    close: 'Close',
    previous: 'Previous image',
    next: 'Next image',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    reset: 'Reset zoom',
    inspect: 'Inspect — zoom and pan',
    keys: '+ / − zoom · 0 reset · arrow keys pan when zoomed · Esc closes',
    zoomLevel: 'Zoom',
    position: 'Image',
  },
};

const MESSAGES: Readonly<Record<Locale, WorkEntryMessages>> = { ro, en };

export function workEntryMessages(locale: Locale): WorkEntryMessages {
  return MESSAGES[locale];
}
