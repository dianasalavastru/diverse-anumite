/**
 * Phase-0 fixtures — the type boundary Workstream A builds against until I-3.
 *
 * OWNER: Workstream B. A imports these; A never edits them.
 *
 * ⚠ THESE ARE PLACEHOLDERS, NOT CONTENT. Copy is invented scaffolding, media paths point at
 * nothing, and capture readouts are explicitly labelled as fixtures — `TECHNICAL_ARCHITECTURE.md`
 * §10.4 forbids fabricated capture readouts from reaching production. Nothing here may ship.
 *
 * At integration point I-3 (§23.4) this set is **regenerated from the real query layer**, so
 * fixtures and GROQ share one origin — the stated mitigation for the highest-risk integration.
 * Real content arrives at I-4 from Workstream C.
 *
 * Coverage is chosen to exercise the frozen contracts, per I-4's shape:
 *   1. `wf-1` A&D design project — independent, client-commissioned, demonstrates a Service.
 *   2. `wf-2` cross-pillar composite — RC primary + A&D secondary, capture metadata, related pair.
 *   3. `wf-3` Studio-attributed — Employer + Role + scoped Authorship; EN untranslated (§11.2).
 *   4. `wf-4` competition entry — no demonstrated Service, so W-5 is hidden.
 *   5. `sv-3` Service with zero demonstrating entries — the F5 empty state.
 *
 * RO strings are written without diacritics per OD-8 (§11.3).
 */

import { derivePillars, toServiceSummary, toWorkEntrySummary } from './derive.js';
import type {
  Curation,
  Employer,
  ImageAsset,
  Localized,
  Service,
  WorkEntry,
} from './types.js';

/* ── helpers (fixture-local) ─────────────────────────────────────────────── */

const bi = <T>(ro: T, en: T | null = null): Localized<T> => ({ ro, en });

const image = (id: string, altRo: string, altEn: string | null): ImageAsset => ({
  assetId: `fixture-${id}`,
  url: `/fixtures/${id}.jpg`,
  width: 2000,
  height: 1333,
  alt: bi(altRo, altEn),
  hotspot: null,
  crop: null,
});

const curation = (overrides: Partial<Curation> = {}): Curation => ({
  featured: false,
  pinned: false,
  editorialPriority: 0,
  placements: [],
  prominence: 'standard',
  ...overrides,
});

/* ── reference list ──────────────────────────────────────────────────────── */

export const FIXTURE_EMPLOYERS: readonly Employer[] = [
  { _id: 'emp-1', _type: 'employer', name: 'Fixture Studio SRL' },
];

/* ── services (drafted without their derived `demonstratedBy`) ───────────── */

const SERVICE_DRAFTS: readonly Service[] = [
  {
    _id: 'sv-1',
    _type: 'service',
    name: bi('Proiectare de arhitectura (fixture)', 'Architectural design (fixture)'),
    slug: bi('proiectare-arhitectura-fixture', 'architectural-design-fixture'),
    enPublished: true,
    pillar: 'architecture-design',
    shortDescription: bi(
      'Text substituent pentru pozitionarea serviciului.',
      'Placeholder positioning line for this service.',
    ),
    description: null,
    problemSolved: null,
    deliverables: bi(['Livrabil substituent A', 'Livrabil substituent B'], ['Placeholder deliverable A', 'Placeholder deliverable B']),
    process: null,
    equipment: null,
    sectors: ['residential', 'cultural'],
    hero: image('service-design', 'Imagine substituent', 'Placeholder image'),
    demonstratedBy: [],
    curation: curation({ featured: true, editorialPriority: 10 }),
    seo: { title: null, description: null },
  },
  {
    _id: 'sv-2',
    _type: 'service',
    name: bi('Scanare laser 3D (fixture)', '3D laser scanning (fixture)'),
    slug: bi('scanare-laser-3d-fixture', '3d-laser-scanning-fixture'),
    enPublished: true,
    pillar: 'reality-capture',
    shortDescription: bi(
      'Text substituent pentru pozitionarea serviciului.',
      'Placeholder positioning line for this service.',
    ),
    description: null,
    problemSolved: null,
    deliverables: bi(['Nor de puncte (substituent)'], ['Point cloud (placeholder)']),
    process: null,
    equipment: bi(['FIXTURE — echipament real nedeclarat'], ['FIXTURE — real equipment not yet declared']),
    sectors: ['heritage', 'industrial'],
    hero: image('service-capture', 'Imagine substituent', 'Placeholder image'),
    demonstratedBy: [],
    curation: curation({ editorialPriority: 8 }),
    seo: { title: null, description: null },
  },
  {
    // F5: publishable with zero linked Work Entries — editorial message + Contact CTA + hub
    // back-path, never an empty grid (IA Step 6).
    _id: 'sv-3',
    _type: 'service',
    name: bi('Fotogrametrie cu drona (fixture)', 'Drone photogrammetry (fixture)'),
    slug: bi('fotogrametrie-drona-fixture', 'drone-photogrammetry-fixture'),
    enPublished: true,
    pillar: 'reality-capture',
    shortDescription: bi(
      'Serviciu fara lucrari asociate — starea F5.',
      'Service with no linked work — the F5 state.',
    ),
    description: null,
    problemSolved: null,
    deliverables: null,
    process: null,
    equipment: null,
    sectors: ['infrastructure'],
    hero: null,
    demonstratedBy: [],
    curation: curation(),
    seo: { title: null, description: null },
  },
];

const svc = (id: string) => toServiceSummary(SERVICE_DRAFTS.find((s) => s._id === id)!);

/* ── work entries ────────────────────────────────────────────────────────── */

const WF_1: WorkEntry = {
  _id: 'wf-1',
  _type: 'workEntry',
  title: bi('Locuinta substituent (fixture)', 'Placeholder house (fixture)'),
  slug: bi('locuinta-substituent-fixture', 'placeholder-house-fixture'),
  enPublished: true,
  discipline: { primary: 'architecture', secondary: ['interior-design'] },
  pillars: derivePillars({ primary: 'architecture', secondary: ['interior-design'] }),
  entryType: { primary: 'design-project', secondary: [] },
  attribution: 'independent',
  commissioning: 'client-commissioned',
  employer: null,
  sectors: ['residential'],
  roles: bi(['Rol substituent'], ['Placeholder role']),
  services: [svc('sv-1')],
  relatedWork: [],
  description: null,
  authorship: bi(
    'Proiect si imagini de arhitect (text substituent).',
    'Design and images by the architect (placeholder text).',
  ),
  cover: image('wf-1', 'Imagine substituent', 'Placeholder image'),
  gallery: [image('wf-1-a', 'Imagine substituent', 'Placeholder image')],
  capture: null,
  capturePublicationCleared: false,
  metadata: {
    year: 2024,
    location: bi('Oras substituent', 'Placeholder city'),
    client: 'Client substituent',
    collaborators: [],
    status: 'built-realized',
    awards: null,
    area: 180,
    team: [],
    deliverables: null,
  },
  curation: curation({
    featured: true,
    editorialPriority: 20,
    prominence: 'feature',
    placements: [{ slot: 'homepage', pillar: 'architecture-design' }],
  }),
  seo: { title: null, description: null },
};

/** Cross-pillar composite: one canonical entry surfacing in both pillar views (IA §2.2, `CONTENT_MODEL.md`:63). */
const WF_2: WorkEntry = {
  _id: 'wf-2',
  _type: 'workEntry',
  title: bi('Releveu patrimoniu (fixture)', 'Heritage survey (fixture)'),
  slug: bi('releveu-patrimoniu-fixture', 'heritage-survey-fixture'),
  enPublished: true,
  discipline: { primary: 'reality-capture', secondary: ['architecture'] },
  pillars: derivePillars({ primary: 'reality-capture', secondary: ['architecture'] }),
  entryType: { primary: 'survey-documentation', secondary: ['design-project'] },
  attribution: 'independent',
  commissioning: 'client-commissioned',
  employer: null,
  sectors: ['heritage'],
  roles: bi(['Rol substituent'], ['Placeholder role']),
  services: [svc('sv-2')],
  relatedWork: [toWorkEntrySummary(WF_1)],
  description: null,
  authorship: bi('Documentare de arhitect (text substituent).', 'Documentation by the architect (placeholder text).'),
  cover: image('wf-2', 'Imagine substituent', 'Placeholder image'),
  gallery: [image('wf-2-a', 'Imagine substituent', 'Placeholder image')],
  capture: {
    accuracy: bi('FIXTURE — acuratete reala nedeclarata', 'FIXTURE — real accuracy not yet declared'),
    equipment: ['FIXTURE — echipament real nedeclarat'],
    software: ['FIXTURE — software real nedeclarat'],
    pointCount: null,
    derivative: null,
  },
  capturePublicationCleared: false,
  metadata: {
    year: 2025,
    location: bi('Oras substituent', 'Placeholder city'),
    client: 'Institutie substituent',
    collaborators: ['Colaborator substituent'],
    status: 'delivered',
    awards: null,
    area: null,
    team: [],
    deliverables: bi(['Nor de puncte (substituent)'], ['Point cloud (placeholder)']),
  },
  curation: curation({ editorialPriority: 18, prominence: 'large', placements: [{ slot: 'pillar-hub', pillar: 'reality-capture' }] }),
  seo: { title: null, description: null },
};

/** Studio-attributed, EN untranslated — exercises the Credits Block and §11.2. */
const WF_3: WorkEntry = {
  _id: 'wf-3',
  _type: 'workEntry',
  title: bi('Proiect de birou (fixture)'),
  slug: bi('proiect-de-birou-fixture'),
  enPublished: false,
  discipline: { primary: 'architecture', secondary: [] },
  pillars: derivePillars({ primary: 'architecture', secondary: [] }),
  entryType: { primary: 'design-project', secondary: [] },
  attribution: 'studio',
  commissioning: 'client-commissioned',
  employer: FIXTURE_EMPLOYERS[0]!,
  sectors: ['office'],
  roles: bi(['Rol substituent in echipa']),
  services: [],
  relatedWork: [],
  description: null,
  authorship: bi('Proiect al biroului; contributie de proiectare a arhitectului (text substituent).'),
  cover: image('wf-3', 'Imagine substituent', null),
  gallery: [],
  capture: null,
  capturePublicationCleared: false,
  metadata: {
    year: 2022,
    location: bi('Oras substituent'),
    client: null,
    collaborators: [],
    status: 'built-realized',
    awards: null,
    area: null,
    team: ['Membru substituent'],
    deliverables: null,
  },
  curation: curation({ editorialPriority: 6, prominence: 'small' }),
  seo: { title: null, description: null },
};

/** Competition entry with no demonstrated Service — W-5 hidden, no broken module. */
const WF_4: WorkEntry = {
  _id: 'wf-4',
  _type: 'workEntry',
  title: bi('Concurs substituent (fixture)', 'Placeholder competition (fixture)'),
  slug: bi('concurs-substituent-fixture', 'placeholder-competition-fixture'),
  enPublished: true,
  discipline: { primary: 'architecture', secondary: [] },
  pillars: derivePillars({ primary: 'architecture', secondary: [] }),
  entryType: { primary: 'competition-entry', secondary: [] },
  attribution: 'collaboration',
  commissioning: 'self-initiated',
  employer: null,
  sectors: ['cultural'],
  roles: bi(['Rol substituent'], ['Placeholder role']),
  services: [],
  relatedWork: [],
  description: null,
  authorship: bi(
    'Proiect in colaborare (text substituent).',
    'Collaborative entry (placeholder text).',
  ),
  cover: image('wf-4', 'Imagine substituent', 'Placeholder image'),
  gallery: [],
  capture: null,
  capturePublicationCleared: false,
  metadata: {
    year: 2023,
    location: bi('Oras substituent', 'Placeholder city'),
    client: null,
    collaborators: ['Colaborator substituent'],
    status: 'unbuilt-proposal',
    awards: bi(['Mentiune substituent'], ['Placeholder mention']),
    area: null,
    team: ['Membru substituent'],
    deliverables: null,
  },
  curation: curation({ editorialPriority: 12 }),
  seo: { title: null, description: null },
};

export const FIXTURE_WORK_ENTRIES: readonly WorkEntry[] = [WF_1, WF_2, WF_3, WF_4];

export const FIXTURE_WORK_ENTRY_SUMMARIES: readonly ReturnType<typeof toWorkEntrySummary>[] =
  FIXTURE_WORK_ENTRIES.map(toWorkEntrySummary);

/**
 * Services with `demonstratedBy` resolved by reversing `WorkEntry.services` — the same
 * direction the real query uses (IA Step 6: the entry stores the reference).
 */
export const FIXTURE_SERVICES: readonly Service[] = SERVICE_DRAFTS.map((service) => ({
  ...service,
  demonstratedBy: FIXTURE_WORK_ENTRIES.filter((entry) =>
    entry.services.some((linked) => linked._id === service._id),
  ).map(toWorkEntrySummary),
}));

export const FIXTURE_SERVICE_SUMMARIES: readonly ReturnType<typeof toServiceSummary>[] =
  FIXTURE_SERVICES.map(toServiceSummary);
