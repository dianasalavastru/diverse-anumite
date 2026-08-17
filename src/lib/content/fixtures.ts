/**
 * Fixtures — generated from the real query layer, not maintained beside it.
 *
 * OWNER: Workstream B. A imports these; A never edits them.
 *
 * ⚠ THESE ARE PLACEHOLDERS, NOT CONTENT. Copy is invented scaffolding, media paths point at
 * nothing, and every capture readout is labelled `FIXTURE` — `TECHNICAL_ARCHITECTURE.md` §10.4
 * forbids fabricated capture readouts from reaching production. Nothing here may ship. Real
 * content arrives at I-4 from Workstream C.
 *
 * ── How this satisfies I-3 ──────────────────────────────────────────────────────────────────
 * §23.4: "B publishes the fixture set *from* the real query layer, so fixtures and queries share
 * one origin." That is structural here, not a convention:
 *
 *   - fixtures are authored in the **raw GROQ response shape** (`groq.ts` types), never in the
 *     frontend contract shape;
 *   - they are handed to `createContentSource()` — the *same* factory the Sanity source uses;
 *   - so they pass through the same normalization, the same Pillar derivation, the same capture
 *     gate, the same locale scoping and the same discovery order.
 *
 * A fixture therefore cannot describe a shape, an ordering or a scope the real query layer does
 * not produce. `query-shape.test.ts` asserts the remaining half — that the projections and the
 * raw types cannot drift apart.
 *
 * ── Coverage ────────────────────────────────────────────────────────────────────────────────
 *   wf-1  **Architecture & Design** — demonstrates a Service, homepage placement, LINKED to wf-2.
 *   wf-2  **Reality Capture** — capture metadata **not cleared** (derivative withheld), LINKED to
 *         wf-1. STAGE 5: wf-1 + wf-2 are the linked pair that REPLACED the old cross-pillar
 *         composite. A project belongs to exactly one Pillar (v3.1 §2); work spanning both is
 *         two projects related through `relatedWork`, each surfacing in its own pillar view.
 *   wf-3  **Architecture & Design** — label `diploma-project` alone; **EN untranslated** (§11.2).
 *   wf-4  **Architecture & Design** — labels `competition` + `diploma-project` (the dual case);
 *         no demonstrated Service, so W-5 is hidden.
 *   wf-5  **Reality Capture** — label `competition` (Labels are pillar-independent); capture
 *         metadata **cleared**, derivative + poster + point count.
 *   sv-1  A&D Service with demonstrating work.
 *   sv-2  RC Service with demonstrating work.
 *   sv-3  Service with **zero** demonstrating entries — the F5 empty state.
 *
 * RO strings are written without diacritics per OD-8 (§11.3).
 */

import { createContentSource, type ContentSource, type RawDocuments } from './source.js';
import { normalizeService, normalizeServiceSummary, normalizeWorkEntry } from './normalize.js';
import { toServiceSummary, toWorkEntrySummary } from './derive.js';
import type {
  RawCaptureMetadata,
  RawCuration,
  RawImage,
  RawLocalizedString,
  RawService,
  RawServiceSummary,
  RawWorkArchiveItem,
  RawWorkEntry,
  RawWorkEntrySummary,
} from './groq.js';
import type { Locale, Service, ServiceSummary, WorkEntry, WorkEntrySummary } from './types.js';

/* ────────────────────────────────────────────────────────────────────────────
 * Fixture-local helpers
 * ──────────────────────────────────────────────────────────────────────────── */

const bi = (ro: string, en: string | null = null): RawLocalizedString => ({ ro, en });
/** Portable Text is not a string — Description needs its own localized wrapper. */
const biRich = (ro: string) => ({
  /* The block carries `style`, `markDefs` and per-span `marks` because a real Sanity block
     always does. A thinner literal passes every unit test and then fails the live shape
     comparison, which is exactly the drift the I-3 equivalence check exists to catch. */
  ro: [
    {
      _type: 'block',
      _key: 'k1',
      style: 'normal',
      markDefs: [],
      children: [{ _type: 'span', _key: 's1', text: ro, marks: [] }],
    },
  ],
  en: null,
});

const biList = (ro: readonly string[], en: readonly string[] | null = null) => ({ ro, en });

const image = (id: string, altRo: string, altEn: string | null): RawImage => ({
  assetId: `image-fixture-${id}`,
  url: `/fixtures/${id}.jpg`,
  width: 2000,
  height: 1333,
  alt: bi(altRo, altEn),
  hotspot: null,
  crop: null,
});

const curation = (overrides: Partial<RawCuration> = {}): RawCuration => ({
  featured: false,
  pinned: false,
  editorialPriority: 0,
  prominence: 'standard',
  placements: [],
  ...overrides,
});

/**
 * A fixture document in storage form: the flat fields exactly as GROQ returns them, plus the
 * reference ids GROQ would dereference. The resolver below performs those joins, so the fixture
 * "Content Lake" models the same reference graph the real one does — including the reverse
 * `demonstratedBy` join, which is computed from `serviceIds` and never stored.
 */
interface FixtureWorkEntry {
  readonly doc: Omit<RawWorkEntry, 'services' | 'relatedWork'>;
  readonly serviceIds: readonly string[];
  readonly relatedIds: readonly string[];
}

type FixtureService = Omit<RawService, 'demonstratedBy'>;

/* ────────────────────────────────────────────────────────────────────────────
 * The fixture dataset
 * ──────────────────────────────────────────────────────────────────────────── */

const SERVICES: readonly FixtureService[] = [
  {
    _id: 'sv-1',
    key: 'proiectare-arhitectura',
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
    deliverables: biList(
      ['Livrabil substituent A', 'Livrabil substituent B'],
      ['Placeholder deliverable A', 'Placeholder deliverable B'],
    ),
    process: null,
    equipment: null,
    sectors: ['rezidential', 'cultural-patrimoniu'],
    hero: image('service-design', 'Imagine substituent', 'Placeholder image'),
    curation: curation({ featured: true, editorialPriority: 10 }),
    seo: null,
  },
  {
    _id: 'sv-2',
    key: 'scanare-laser-3d',
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
    deliverables: biList(['Nor de puncte (substituent)'], ['Point cloud (placeholder)']),
    process: null,
    equipment: biList(
      ['FIXTURE — echipament real nedeclarat'],
      ['FIXTURE — real equipment not yet declared'],
    ),
    sectors: ['cultural-patrimoniu', 'industrial-logistic'],
    hero: image('service-capture', 'Imagine substituent', 'Placeholder image'),
    curation: curation({ editorialPriority: 8 }),
    seo: null,
  },
  {
    // F5: publishable with zero linked Work Entries — editorial message + Contact CTA + hub
    // back-path, never an empty grid (IA Step 6).
    _id: 'sv-3',
    key: 'scan-to-bim',
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
    sectors: ['public-comunitar'],
    hero: null,
    curation: curation(),
    seo: null,
  },
  /*
   * STAGE 8 — two more Services so the multi-Service collision cases have real references.
   * `sv-4` (Vizualizare 3D) makes Location *optional*; `sv-5` (Design mobilier) makes
   * Implementation Company *mandatory*. Paired with `sv-1` they reproduce v3.1 §8's worked
   * examples A and C against the real validation layer rather than only the pure resolver.
   */
  {
    _id: 'sv-4',
    key: 'vizualizare-3d',
    _type: 'service',
    name: bi('Vizualizare 3D (fixture)', '3D visualization (fixture)'),
    slug: bi('vizualizare-3d-fixture', '3d-visualization-fixture'),
    enPublished: true,
    pillar: 'architecture-design',
    shortDescription: bi('Text substituent.', 'Placeholder line.'),
    description: null,
    problemSolved: null,
    deliverables: null,
    process: null,
    equipment: null,
    sectors: ['rezidential'],
    hero: null,
    curation: curation(),
    seo: null,
  },
  {
    _id: 'sv-5',
    key: 'design-mobilier',
    _type: 'service',
    name: bi('Design mobilier (fixture)', 'Furniture design (fixture)'),
    slug: bi('design-mobilier-fixture', 'furniture-design-fixture'),
    enPublished: true,
    pillar: 'architecture-design',
    shortDescription: bi('Text substituent.', 'Placeholder line.'),
    description: null,
    problemSolved: null,
    deliverables: null,
    process: null,
    equipment: null,
    sectors: ['rezidential'],
    hero: null,
    curation: curation(),
    seo: null,
  },
  {
    /*
     * STAGE 8. `sv-3` used to be the only Reality Capture Service besides `sv-2`, so the
     * multi-Service RC entry (wf-5) had to reference it — which would have destroyed the F5
     * "publishable with zero linked entries" case above. This third RC Service exists so both
     * invariants can hold at once: wf-5 demonstrates `sv-2` + `sv-6`, `sv-3` stays unlinked.
     */
    _id: 'sv-6',
    key: 'fotografie-arhitectura',
    _type: 'service',
    name: bi('Fotografie de arhitectura (fixture)', 'Architectural photography (fixture)'),
    slug: bi('fotografie-arhitectura-fixture', 'architectural-photography-fixture'),
    enPublished: true,
    pillar: 'reality-capture',
    shortDescription: bi('Text substituent.', 'Placeholder line.'),
    description: null,
    problemSolved: null,
    deliverables: null,
    process: null,
    equipment: null,
    sectors: ['industrial-logistic'],
    hero: null,
    curation: curation(),
    seo: null,
  },
];

/** Uncleared: `capturePublicationCleared` is false, so the derivative is withheld (§19.4). */
const UNCLEARED_CAPTURE: RawCaptureMetadata = {
  accuracy: bi('FIXTURE — acuratete reala nedeclarata', 'FIXTURE — real accuracy not yet declared'),
  software: ['FIXTURE — software real nedeclarat'],
  pointCount: null,
  derivative: {
    // Present in storage and deliberately so: the fixture proves the gate *drops* it.
    assetUrl: '/fixtures/wf-2-cloud.bin',
    poster: image('wf-2-cloud', 'Imagine substituent', 'Placeholder image'),
  },
};

const CLEARED_CAPTURE: RawCaptureMetadata = {
  accuracy: bi('FIXTURE — acuratete reala nedeclarata', 'FIXTURE — real accuracy not yet declared'),
  software: ['FIXTURE — software real nedeclarat'],
  // A real figure from a real derivative in production (§10.4); a labelled placeholder here.
  pointCount: 1_250_000,
  derivative: {
    assetUrl: '/fixtures/wf-5-cloud.bin',
    poster: image('wf-5-cloud', 'Imagine substituent', 'Placeholder image'),
  },
};

/*
 * STAGE 8 — two more Services so the multi-Service collision cases have real references.
 * `sv-4` (Vizualizare 3D) makes Location optional, `sv-5` (Design mobilier) makes Implementation
 * Company mandatory; paired with `sv-1` they reproduce v3.1 §8's worked examples A and C.
 */
const WORK_ENTRIES: readonly FixtureWorkEntry[] = [
  {
    doc: {
      _id: 'wf-1',
      _type: 'workEntry',
      title: bi('Locuinta substituent (fixture)', 'Placeholder house (fixture)'),
      slug: bi('locuinta-substituent-fixture', 'placeholder-house-fixture'),
      enPublished: true,
      pillar: 'architecture-design',
      labels: [],
      sector: 'rezidential',
      description: biRich('Text substituent.'),
      cover: image('wf-1', 'Imagine substituent', 'Placeholder image'),
      gallery: [image('wf-1-a', 'Imagine substituent', 'Placeholder image')],
      capture: null,
      capturePublicationCleared: false,
      metadata: {
        year: 2024,
        location: bi('Oras substituent', 'Placeholder city'),
        client: 'Client substituent',
        collaborators: [],
        status: 'finalizat',
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
      seo: null,
    },
    serviceIds: ['sv-1', 'sv-4'],
    relatedIds: ['wf-2'],
  },

  /** Cross-pillar composite: one canonical entry surfacing in both pillar views (`CONTENT_MODEL.md`:63). */
  {
    doc: {
      _id: 'wf-2',
      _type: 'workEntry',
      title: bi('Releveu patrimoniu (fixture)', 'Heritage survey (fixture)'),
      slug: bi('releveu-patrimoniu-fixture', 'heritage-survey-fixture'),
      enPublished: true,
      pillar: 'reality-capture',
      labels: [],
      sector: 'cultural-patrimoniu',
      description: null,
      cover: image('wf-2', 'Imagine substituent', 'Placeholder image'),
      gallery: [image('wf-2-a', 'Imagine substituent', 'Placeholder image')],
      capture: UNCLEARED_CAPTURE,
      capturePublicationCleared: false,
      metadata: {
        year: 2025,
        location: bi('Oras substituent', 'Placeholder city'),
        client: 'Institutie substituent',
        collaborators: ['Colaborator substituent'],
        status: 'in-desfasurare',
        awards: null,
        area: 620,
        team: [],
        equipment: ['FIXTURE — scaner'],
        deliverables: biList(['Nor de puncte (substituent)'], ['Point cloud (placeholder)']),
      },
      curation: curation({
        editorialPriority: 18,
        prominence: 'large',
        placements: [{ slot: 'pillar-hub', pillar: 'reality-capture' }],
      }),
      seo: null,
    },
    serviceIds: ['sv-2'],
    relatedIds: ['wf-1'],
  },

  /** Studio-attributed, EN untranslated — exercises the Credits Block and §11.2. */
  {
    doc: {
      _id: 'wf-3',
      _type: 'workEntry',
      title: bi('Proiect de birou (fixture)'),
      slug: bi('proiect-de-birou-fixture'),
      enPublished: false,
      pillar: 'architecture-design',
      // Single-label case: PROIECT DE DIPLOMA without CONCURS.
      labels: ['diploma-project'],
      sector: 'birouri-business',
      description: biRich('Text substituent.'),
      cover: image('wf-3', 'Imagine substituent', null),
      gallery: [image('wf-3-a', 'Imagine substituent', 'Placeholder image')],
      capture: null,
      capturePublicationCleared: false,
      metadata: {
        year: 2022,
        location: bi('Oras substituent'),
        client: 'Client substituent',
        collaborators: [],
        status: 'in-dezvoltare',
        awards: null,
        area: null,
        team: ['Membru substituent'],
        implementationCompany: 'Atelier substituent',
        deliverables: null,
      },
      curation: curation({ editorialPriority: 6, prominence: 'small' }),
      seo: null,
    },
    serviceIds: ['sv-5'],
    relatedIds: [],
  },

  /** Competition entry with no demonstrated Service — W-5 hidden, no broken module. */
  {
    doc: {
      _id: 'wf-4',
      _type: 'workEntry',
      title: bi('Concurs substituent (fixture)', 'Placeholder competition (fixture)'),
      slug: bi('concurs-substituent-fixture', 'placeholder-competition-fixture'),
      enPublished: true,
      pillar: 'architecture-design',
      // The dual-label case: one project carrying BOTH labels (v3.1 §10).
      labels: ['competition', 'diploma-project'],
      sector: 'cultural-patrimoniu',
      description: biRich('Text substituent.'),
      cover: image('wf-4', 'Imagine substituent', 'Placeholder image'),
      gallery: [image('wf-4-a', 'Imagine substituent', 'Placeholder image')],
      capture: null,
      capturePublicationCleared: false,
      metadata: {
        year: 2023,
        location: bi('Oras substituent', 'Placeholder city'),
        client: 'Client substituent',
        collaborators: ['Colaborator substituent'],
        status: 'nerealizat',
        awards: biList(['Mentiune substituent'], ['Placeholder mention']),
        area: 95,
        team: ['Membru substituent'],
        implementationCompany: 'Atelier substituent',
        deliverables: null,
      },
      curation: curation({ editorialPriority: 12 }),
      seo: null,
    },
    serviceIds: ['sv-1', 'sv-5'],
    relatedIds: [],
  },

  /** Single-pillar Reality Capture entry with a **cleared** derivative — the published RC case. */
  {
    doc: {
      _id: 'wf-5',
      _type: 'workEntry',
      title: bi('Scanare hala industriala (fixture)', 'Industrial hall scan (fixture)'),
      slug: bi('scanare-hala-industriala-fixture', 'industrial-hall-scan-fixture'),
      enPublished: true,
      pillar: 'reality-capture',
      // A Reality Capture project carrying CONCURS — Labels are global, never scoped to a
      // Pillar (v3.1 §10), and this fixture is what proves it against real data.
      labels: ['competition'],
      sector: 'industrial-logistic',
      description: null,
      cover: image('wf-5', 'Imagine substituent', 'Placeholder image'),
      gallery: [image('wf-5-a', 'Imagine substituent', 'Placeholder image')],
      capture: CLEARED_CAPTURE,
      capturePublicationCleared: true,
      metadata: {
        year: 2025,
        location: bi('Oras substituent', 'Placeholder city'),
        client: 'Client substituent',
        collaborators: [],
        status: 'finalizat',
        awards: null,
        area: 4200,
        team: [],
        equipment: ['FIXTURE — scaner'],
        deliverables: biList(['Nor de puncte (substituent)'], ['Point cloud (placeholder)']),
      },
      curation: curation({
        editorialPriority: 14,
        prominence: 'large',
        placements: [{ slot: 'homepage', pillar: 'reality-capture' }],
      }),
      seo: null,
    },
    serviceIds: ['sv-2', 'sv-6'],
    relatedIds: ['wf-2'],
  },
];

/* ────────────────────────────────────────────────────────────────────────────
 * The fixture Content Lake — reference resolution mirroring the GROQ projections
 * ──────────────────────────────────────────────────────────────────────────── */

const byId = new Map(WORK_ENTRIES.map((entry) => [entry.doc._id as string, entry]));

/** Mirrors `WORK_ENTRY_SUMMARY_PROJECTION` — including `year`/`status` lifted out of `metadata`. */
function toRawSummary(entry: FixtureWorkEntry): RawWorkEntrySummary {
  const { doc } = entry;
  return {
    _id: doc._id,
    title: doc.title,
    slug: doc.slug,
    enPublished: doc.enPublished,
    pillar: doc.pillar,
    labels: doc.labels,
    sector: doc.sector,
    year: doc.metadata?.year,
    status: doc.metadata?.status,
    cover: doc.cover,
    curation: doc.curation,
  };
}

/** Mirrors `WORK_ARCHIVE_ITEM_PROJECTION`. */
function toRawArchiveItem(entry: FixtureWorkEntry): RawWorkArchiveItem {
  return {
    ...toRawSummary(entry),
    services: entry.serviceIds.map((id) => {
      const service = SERVICES.find((candidate) => candidate._id === id);
      return {
        _id: id,
        key: service?.key ?? null,
        pillar: service?.pillar ?? null,
        slug: service?.slug ?? null,
      };
    }),
    location: entry.doc.metadata?.location ?? null,
    /* Mirrors the projection's `gallery[0...4]`, including the bound — a fixture that returned
       the whole array would let a component pass here and overflow against Sanity. The
       cover-duplicate filter and the final slice to three are `normalize`'s, on both paths. */
    galleryPreview: (entry.doc.gallery ?? []).slice(0, 4),
  };
}

function toRawServiceSummary(service: FixtureService): RawServiceSummary {
  return {
    _id: service._id,
    key: service.key,
    name: service.name,
    slug: service.slug,
    enPublished: service.enPublished,
    pillar: service.pillar,
    shortDescription: service.shortDescription,
    hero: service.hero,
    curation: service.curation,
  };
}

/** Mirrors `WORK_ENTRY_PROJECTION`, dereferencing `services[]->` and `relatedWork[]->`. */
function toRawWorkEntry(entry: FixtureWorkEntry): RawWorkEntry {
  return {
    ...entry.doc,
    services: entry.serviceIds
      .map((id) => SERVICES.find((service) => service._id === id))
      .filter((service): service is FixtureService => service !== undefined)
      .map(toRawServiceSummary),
    relatedWork: entry.relatedIds
      .map((id) => byId.get(id))
      .filter((related): related is FixtureWorkEntry => related !== undefined)
      .map(toRawSummary),
  };
}

/**
 * Mirrors `SERVICE_PROJECTION`'s reverse join. The relationship is read from
 * `WorkEntry.services` in one direction only (IA Step 6, `DECISIONS_LOG.md` #38) — the Service
 * never holds a copy that could disagree with it.
 */
function toRawService(service: FixtureService): RawService {
  return {
    ...service,
    demonstratedBy: WORK_ENTRIES.filter((entry) =>
      entry.serviceIds.includes(service._id as string),
    ).map(toRawSummary),
  };
}

function slugOf(value: RawLocalizedString | null | undefined, locale: Locale): string | null {
  return (locale === 'ro' ? value?.ro : value?.en) ?? null;
}

export const FIXTURE_RAW_DOCUMENTS: RawDocuments = {
  workEntries: async () => WORK_ENTRIES.map(toRawWorkEntry),
  workEntryBySlug: async (slug, locale) => {
    const entry = WORK_ENTRIES.find((candidate) => slugOf(candidate.doc.slug, locale) === slug);
    return entry ? toRawWorkEntry(entry) : null;
  },
  workArchive: async () => WORK_ENTRIES.map(toRawArchiveItem),
  services: async () => SERVICES.map(toRawService),
  serviceBySlug: async (slug, locale) => {
    const service = SERVICES.find((candidate) => slugOf(candidate.slug, locale) === slug);
    return service ? toRawService(service) : null;
  },
  serviceSummaries: async () => SERVICES.map(toRawServiceSummary),
};

/**
 * The fixture half of the I-3 swap. `createFixtureContentSource()` and
 * `createSanityContentSource(config)` satisfy the same `ContentSource` interface, so replacing
 * one with the other is a single edit at the composition point — no component changes.
 */
export function createFixtureContentSource(): ContentSource {
  return createContentSource(FIXTURE_RAW_DOCUMENTS);
}

/* ────────────────────────────────────────────────────────────────────────────
 * Materialized snapshots
 *
 * Convenience for synchronous contexts and tests. They are produced by the same normalizers the
 * query layer uses — never authored in the contract shape by hand.
 * ──────────────────────────────────────────────────────────────────────────── */

export const FIXTURE_WORK_ENTRIES: readonly WorkEntry[] = WORK_ENTRIES.map(toRawWorkEntry).map(
  normalizeWorkEntry,
);

export const FIXTURE_WORK_ENTRY_SUMMARIES: readonly WorkEntrySummary[] =
  FIXTURE_WORK_ENTRIES.map(toWorkEntrySummary);

export const FIXTURE_SERVICES: readonly Service[] = SERVICES.map(toRawService).map(normalizeService);

export const FIXTURE_SERVICE_SUMMARIES: readonly ServiceSummary[] = SERVICES.map(
  toRawServiceSummary,
).map(normalizeServiceSummary);

/** Exposed so tests can assert what `toServiceSummary` and the query projection agree on. */
export const FIXTURE_SERVICE_SUMMARIES_VIA_DERIVE: readonly ServiceSummary[] =
  FIXTURE_SERVICES.map(toServiceSummary);
