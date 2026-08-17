/**
 * Service page composition — the generic blueprint, exercised against every
 * service shape the Content Model permits.
 *
 * OWNER: Workstream A.
 *
 * `SERVICE_PAGE_IA.md`'s last pass/fail test is "**All service instances fit
 * this one blueprint**, differing only in consumed content." That is a claim
 * about `serviceComposition`, and it is only checkable if the suite drives the
 * function with more service shapes than the dataset happens to contain. So the
 * fixtures below are built here rather than imported: `fixtures.ts` is
 * Workstream B's file and describes the corpus that exists, while these describe
 * the corpus the contract *allows* — including the two states no development
 * content currently has (an EN-unpublished service, and a service whose EN
 * translation is thinner than its RO).
 */

import { describe, expect, it } from 'vitest';

import {
  captureSubject,
  hasDeliverables,
  hasCapabilities,
  hasProblemContent,
  hasProcess,
  serviceComposition,
  stationLabel,
} from './modules.js';
import { availableIn } from '../../lib/content/source.js';
import type {
  Curation,
  Locale,
  Localized,
  RichText,
  Service,
  WorkEntry,
  WorkEntrySummary,
} from '../../lib/content';

/* -------------------------------------------------------------------------- */
/* Builders                                                                    */
/* -------------------------------------------------------------------------- */

const bi = <T,>(ro: T, en: T | null): Localized<T> => ({ ro, en });

const CURATION: Curation = {
  featured: false,
  pinned: false,
  editorialPriority: 0,
  placements: [],
  prominence: 'standard',
};

/** One paragraph of Portable Text — enough for `localize(...)?.length` to be truthy. */
const prose = (text: string): RichText => [
  { _type: 'block', _key: 'k1', style: 'normal', children: [{ _type: 'span', text }] },
];

function service(overrides: Partial<Service> = {}): Service {
  return {
    _id: 'sv-test',
    _type: 'service',
    key: 'proiectare-arhitectura',
    name: bi('Serviciu', 'Service'),
    slug: bi('serviciu', 'service'),
    enPublished: true,
    pillar: 'architecture-design',
    shortDescription: null,
    description: null,
    problemSolved: null,
    deliverables: null,
    process: null,
    equipment: null,
    sectors: [],
    hero: null,
    demonstratedBy: [],
    curation: CURATION,
    seo: { title: null, description: null },
    ...overrides,
  };
}

function summary(id: string, enPublished = true): WorkEntrySummary {
  return {
    _id: id,
    title: bi(`Lucrare ${id}`, `Work ${id}`),
    slug: bi(`lucrare-${id}`, enPublished ? `work-${id}` : null),
    enPublished,
    pillar: 'reality-capture',
    labels: [],
    sector: 'cultural-patrimoniu',
    year: 2024,
    status: 'finalizat',
    cover: null,
    curation: CURATION,
  };
}

function entry(
  id: string,
  options: { cleared?: boolean; derivative?: boolean } = {},
): WorkEntry {
  const { cleared = true, derivative = true } = options;
  return {
    _id: id,
    _type: 'workEntry',
    title: bi(`Lucrare ${id}`, `Work ${id}`),
    slug: bi(`lucrare-${id}`, `work-${id}`),
    enPublished: true,
    pillar: 'reality-capture',
    labels: [],
    sector: 'cultural-patrimoniu',
    services: [],
    relatedWork: [],
    description: null,
    cover: null,
    gallery: [],
    capture: {
      accuracy: bi('2 mm', '2 mm'),
      software: [],
      pointCount: 8_032_000,
      derivative: derivative
        ? {
            assetUrl: `https://cdn.example/${id}.bin`,
            poster: {
              assetId: `poster-${id}`,
              url: `https://cdn.example/${id}.jpg`,
              width: 1600,
              height: 1000,
              alt: bi('Nor de puncte', 'Point cloud'),
              hotspot: null,
              crop: null,
            },
          }
        : null,
    },
    capturePublicationCleared: cleared,
    metadata: {
      year: 2024,
      location: null,
      client: null,
      collaborators: [],
      status: 'finalizat',
      awards: null,
      area: null,
      team: [],
      deliverables: null,
      equipment: [],
      implementationCompany: null,
    },
    curation: CURATION,
    seo: { title: null, description: null },
  };
}

const index = (...entries: WorkEntry[]) => new Map(entries.map((e) => [e._id, e]));

/* -------------------------------------------------------------------------- */
/* One blueprint, all services                                                 */
/* -------------------------------------------------------------------------- */

describe('one blueprint for every service (SERVICE_PAGE_IA.md:3, :170)', () => {
  it('renders S-1, S-4 and S-5 for a service that carries nothing but a name', () => {
    const composition = serviceComposition(service(), 'ro');
    expect(composition.modules).toEqual(['orientation', 'proof', 'conversion']);
    expect(composition.footerStation).toBe(4);
  });

  it('renders every module for a fully authored service, in the wireframe order', () => {
    const full = service({
      description: bi(prose('Ce este'), prose('What it is')),
      problemSolved: bi(prose('Ce rezolva'), prose('What it solves')),
      deliverables: bi(['Nor de puncte'], ['Point cloud']),
      process: bi(prose('Cum lucram'), prose('How we work')),
      equipment: bi(['Leica RTC360'], ['Leica RTC360']),
      sectors: ['cultural-patrimoniu'],
    });

    /* S-2 no longer takes a station: its content reads inside the opening as
       the identity block's evaluation rail, so `orientation` carries both
       responsibilities. Equipment is its own station rather than a footnote to
       the process. Neither is an IA change — see `ServiceModuleKey`. */
    expect(serviceComposition(full, 'ro').modules).toEqual([
      'orientation',
      'deliverables',
      'process',
      'capabilities',
      'proof',
      'conversion',
    ]);
  });

  it('gives equipment its own station, independent of the process', () => {
    const instrumentsOnly = service({ equipment: bi(['Leica RTC360'], ['Leica RTC360']) });
    expect(serviceComposition(instrumentsOnly, 'ro').modules).toEqual([
      'orientation',
      'capabilities',
      'proof',
      'conversion',
    ]);

    const methodOnly = service({ process: bi(prose('Cum'), prose('How')) });
    expect(serviceComposition(methodOnly, 'ro').modules).toEqual([
      'orientation',
      'process',
      'proof',
      'conversion',
    ]);
  });

  it('reflows the station numbers when a service has no equipment to declare', () => {
    const fields = {
      deliverables: bi(['a'], ['a']),
      process: bi(prose('y'), prose('y')),
    };
    const withEquipment = serviceComposition(
      service({ ...fields, equipment: bi(['Leica RTC360'], ['Leica RTC360']) }),
      'ro',
    );
    const without = serviceComposition(service(fields), 'ro');

    /* The A&D case: no empty capabilities heading, no placeholder, and every
       later station simply moves up one. */
    expect(withEquipment.stations).toMatchObject({ capabilities: 4, proof: 5, conversion: 6 });
    expect(without.stations.capabilities).toBeUndefined();
    expect(without.stations).toMatchObject({ proof: 4, conversion: 5 });
    expect(without.footerStation).toBe(withEquipment.footerStation - 1);
  });

  it('composes identically for an A&D and a Reality Capture service with the same fields', () => {
    const fields = {
      problemSolved: bi(prose('x'), prose('x')),
      deliverables: bi(['a'], ['a']),
      process: bi(prose('y'), prose('y')),
    };
    const design = serviceComposition(
      service({ ...fields, pillar: 'architecture-design' }),
      'ro',
    );
    const capture = serviceComposition(service({ ...fields, pillar: 'reality-capture' }), 'ro');

    // "content and UI-treatment differences only — the Page IA is identical."
    expect(capture.modules).toEqual(design.modules);
    expect(capture.stations).toEqual(design.stations);
  });

  it('numbers stations contiguously, so the rail and the section markers agree', () => {
    const partial = service({ deliverables: bi(['a'], ['a']) });
    const { modules, stations, footerStation } = serviceComposition(partial, 'ro');

    expect(modules.map((key) => stations[key])).toEqual([1, 2, 3, 4]);
    expect(footerStation).toBe(modules.length + 1);
    expect(stationLabel(stations.proof as number)).toBe('03');
  });
});

/* -------------------------------------------------------------------------- */
/* F5                                                                          */
/* -------------------------------------------------------------------------- */

describe('F5 — zero demonstrating entries is a valid published state', () => {
  it('keeps S-4 in the composition when the proof set is empty', () => {
    const composition = serviceComposition(service({ demonstratedBy: [] }), 'ro');
    expect(composition.modules).toContain('proof');
  });

  it('keeps S-4 in the same station whether or not there is proof', () => {
    const withProof = serviceComposition(
      service({ demonstratedBy: [summary('w1')] }),
      'ro',
    );
    const withoutProof = serviceComposition(service({ demonstratedBy: [] }), 'ro');
    expect(withProof.stations.proof).toBe(withoutProof.stations.proof);
  });

  it('never loses S-5: a proof-thin service still converts', () => {
    expect(serviceComposition(service(), 'ro').modules).toContain('conversion');
  });
});

/* -------------------------------------------------------------------------- */
/* Localization (§11.2)                                                        */
/* -------------------------------------------------------------------------- */

describe('module toggles are locale-aware (§11.2 — no RO content under an EN URL)', () => {
  const roOnly = service({
    problemSolved: bi(prose('Doar in romana'), null),
    deliverables: bi(['Doar in romana'], null),
    process: bi(prose('Doar in romana'), null),
    equipment: bi(['Doar in romana'], null),
  });

  it('renders the prose modules in RO', () => {
    expect(serviceComposition(roOnly, 'ro').modules).toEqual([
      'orientation',
      'deliverables',
      'process',
      'capabilities',
      'proof',
      'conversion',
    ]);
  });

  it('drops them in EN rather than emitting a heading over Romanian prose', () => {
    expect(serviceComposition(roOnly, 'en').modules).toEqual([
      'orientation',
      'proof',
      'conversion',
    ]);
    expect(hasProblemContent(roOnly, 'en')).toBe(false);
    expect(hasDeliverables(roOnly, 'en')).toBe(false);
    expect(hasProcess(roOnly, 'en')).toBe(false);
    expect(hasCapabilities(roOnly, 'en')).toBe(false);
  });

  it('still shows the identity rail in EN when only the Sector use-cases are locale-neutral', () => {
    const sectorsOnly = service({ problemSolved: bi(prose('ro'), null), sectors: ['cultural-patrimoniu'] });
    expect(hasProblemContent(sectorsOnly, 'en')).toBe(true);
  });
});

describe('an EN-unpublished service generates no EN page (§11.2 rule 7)', () => {
  /* The route files gate on `source.services(locale)`, which applies exactly
     this filter (`availableIn` → `isEnAvailable`). Asserting it here keeps the
     guarantee covered while the dataset has no such service to build. */
  const unpublished = service({ _id: 'sv-ro-only', enPublished: false, slug: bi('doar-ro', null) });
  const published = service({ _id: 'sv-both' });

  it('is present in RO and absent in EN', () => {
    const all = [unpublished, published];
    expect(availableIn(all, 'ro' as Locale).map((s) => s._id)).toEqual(['sv-ro-only', 'sv-both']);
    expect(availableIn(all, 'en' as Locale).map((s) => s._id)).toEqual(['sv-both']);
  });

  it('is also excluded when the flag is set but the EN slug is missing', () => {
    const slugless = service({ _id: 'sv-no-slug', enPublished: true, slug: bi('ro', null) });
    expect(availableIn([slugless], 'en' as Locale)).toEqual([]);
  });
});

/* -------------------------------------------------------------------------- */
/* The point-cloud subject (§10.4, §19.4)                                      */
/* -------------------------------------------------------------------------- */

describe('the S-4 point-cloud subject is real, cleared, demonstrating work', () => {
  it('is null when the service demonstrates nothing', () => {
    expect(captureSubject(service(), index(entry('w1')))).toBeNull();
  });

  it('is null when the demonstrating entries carry no survey — every A&D service', () => {
    const plain = { ...entry('w1'), capture: null, capturePublicationCleared: true };
    const svc = service({ demonstratedBy: [summary('w1')] });
    expect(captureSubject(svc, index(plain))).toBeNull();
  });

  it('is null when publication is not cleared (§19.4 gate, applied once)', () => {
    const svc = service({ demonstratedBy: [summary('w1')] });
    expect(captureSubject(svc, index(entry('w1', { cleared: false })))).toBeNull();
  });

  it('is null when the entry is cleared but has no derivative', () => {
    const svc = service({ demonstratedBy: [summary('w1')] });
    expect(captureSubject(svc, index(entry('w1', { derivative: false })))).toBeNull();
  });

  it('resolves the first demonstrating entry that has one — curation order, not ours', () => {
    const svc = service({ demonstratedBy: [summary('w1'), summary('w2')] });
    const entries = index(entry('w1', { cleared: false }), entry('w2'));
    expect(captureSubject(svc, entries)?._id).toBe('w2');
  });

  it('is null when the entry is outside the locale-scoped index', () => {
    // `workEntries('en')` omits untranslated entries, so the join simply misses.
    const svc = service({ demonstratedBy: [summary('w9')] });
    expect(captureSubject(svc, index(entry('w1')))).toBeNull();
  });
});
