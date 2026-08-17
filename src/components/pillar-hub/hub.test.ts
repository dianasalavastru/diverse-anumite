/**
 * Unit tests for the hub's pure presentation selection.
 *
 * The two things worth pinning here are the ones a rendered page would hide:
 * the archive continuation must be the *frozen* filtered-archive URL in both
 * locales (a hub that quietly emits `?pillar=architecture-design` looks
 * identical and filters nothing), and the H-2 readouts must be empty whenever
 * the live content is, because their whole purpose is to not fabricate.
 */

import { describe, expect, it } from 'vitest';
import type { Curation, Service, ServiceSummary } from '../../lib/content';
import {
  HUB_HIGHLIGHT_LIMIT,
  contactTopicHref,
  indexServicesById,
  instrumentReadouts,
  pillarArchiveHref,
  pillarHubHref,
  servicesInPillar,
  useCaseSectors,
} from './hub';

const CURATION: Curation = {
  featured: false,
  pinned: false,
  editorialPriority: 0,
  placements: [],
  prominence: 'standard',
};

function service(overrides: Partial<Service> & Pick<Service, '_id'>): Service {
  return {
    _type: 'service',
    key: 'scanare-laser-3d',
    name: { ro: 'Scanare 3D', en: '3D scanning' },
    slug: { ro: 'scanare-3d', en: '3d-scanning' },
    enPublished: true,
    pillar: 'reality-capture',
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

function summary(overrides: Partial<ServiceSummary> & Pick<ServiceSummary, '_id'>): ServiceSummary {
  return {
    key: 'scanare-laser-3d',
    name: { ro: 'Scanare 3D', en: '3D scanning' },
    slug: { ro: 'scanare-3d', en: '3d-scanning' },
    enPublished: true,
    pillar: 'reality-capture',
    shortDescription: null,
    hero: null,
    curation: CURATION,
    ...overrides,
  };
}

describe('destinations', () => {
  it('continues to the whole archive filtered to the pillar, in both locales', () => {
    expect(pillarArchiveHref('reality-capture', 'ro')).toBe('/proiecte?pillar=reality-capture');
    expect(pillarArchiveHref('reality-capture', 'en')).toBe('/en/projects?pillar=reality-capture');
  });

  it('uses the archive token, not the Pillar identifier, for the other pillar', () => {
    // `architecture-design` is content identity; `architecture` is the query token.
    expect(pillarArchiveHref('architecture-design', 'ro')).toBe('/proiecte?pillar=architecture');
  });

  it('links the supporting cross-pillar door at the frozen hub routes', () => {
    expect(pillarHubHref('architecture-design', 'ro')).toBe('/arhitectura-design');
    expect(pillarHubHref('architecture-design', 'en')).toBe('/en/architecture-design');
    expect(pillarHubHref('reality-capture', 'en')).toBe('/en/reality-capture');
  });

  it('prefills Contact with the pillar Topic and no Regarding', () => {
    expect(contactTopicHref('reality-capture', 'ro')).toBe('/contact?topic=reality-capture');
    expect(contactTopicHref('reality-capture', 'en')).toBe('/en/contact?topic=reality-capture');
    expect(contactTopicHref('reality-capture', 'ro')).not.toContain('regarding');
  });
});

describe('display bound', () => {
  it('shows more curated work than the Homepage does — the hub expands', () => {
    expect(HUB_HIGHLIGHT_LIMIT).toBe(6);
  });
});

describe('servicesInPillar', () => {
  it('reads the authored Service pillar and never derives it', () => {
    const services = [
      service({ _id: 'a' }),
      service({ _id: 'b', pillar: 'architecture-design' }),
    ];
    expect(servicesInPillar(services, 'reality-capture').map((s) => s._id)).toEqual(['a']);
  });
});

describe('useCaseSectors', () => {
  it('unions the pillar services’ sectors in frozen-vocabulary order', () => {
    const services = [
      service({ _id: 'a', sectors: ['industrial-logistic', 'cultural-patrimoniu'] }),
      service({ _id: 'b', sectors: ['cultural-patrimoniu', 'birouri-business'] }),
    ];
    // SECTORS order: … birouri-business … industrial-logistic · cultural-patrimoniu …
    expect(useCaseSectors(services)).toEqual([
      'birouri-business',
      'industrial-logistic',
      'cultural-patrimoniu',
    ]);
  });

  /*
   * STAGE 6 replaces the "authored values beyond the known list" case. Sector is closed
   * (v3.1 §11.1), so a value outside the vocabulary cannot exist — `normalize.ts` fails the
   * build before one could reach a hub. What is worth asserting instead is that the union is
   * exactly the vocabulary intersection, with no duplicates.
   */
  it('unions without duplicating a sector two services share', () => {
    const services = [
      service({ _id: 'a', sectors: ['cultural-patrimoniu'] }),
      service({ _id: 'b', sectors: ['cultural-patrimoniu'] }),
    ];
    expect(useCaseSectors(services)).toEqual(['cultural-patrimoniu']);
  });

  it('reads in vocabulary order, never in authored order', () => {
    const reversed = [service({ _id: 'a', sectors: ['mixed-use-dezvoltari', 'rezidential'] })];
    expect(useCaseSectors(reversed)).toEqual(['rezidential', 'mixed-use-dezvoltari']);
  });

  it('is empty when no service declares a sector — the module then disappears', () => {
    expect(useCaseSectors([service({ _id: 'a' })])).toEqual([]);
  });
});

describe('instrumentReadouts', () => {
  it('renders only equipment that is actually authored', () => {
    const services = [
      service({ _id: 'a', equipment: { ro: ['Scaner laser terestru'], en: ['Terrestrial laser scanner'] } }),
      service({ _id: 'b' }),
    ];
    const rows = instrumentReadouts(
      [summary({ _id: 'a' }), summary({ _id: 'b' })],
      indexServicesById(services),
      'ro',
    );

    expect(rows).toEqual([
      { id: 'a', service: 'Scanare 3D', equipment: ['Scaner laser terestru'] },
    ]);
  });

  it('drops a row whose equipment is untranslated rather than falling back to RO', () => {
    const services = [service({ _id: 'a', equipment: { ro: ['Scaner laser terestru'], en: null } })];
    expect(instrumentReadouts([summary({ _id: 'a' })], indexServicesById(services), 'en')).toEqual([]);
  });

  it('follows the order the caller was given, which is B’s curated order', () => {
    const equipment = { ro: ['A'], en: ['A'] };
    const services = [
      service({ _id: 'a', equipment }),
      service({ _id: 'b', equipment, name: { ro: 'Fotogrametrie', en: 'Photogrammetry' } }),
    ];
    const rows = instrumentReadouts(
      [summary({ _id: 'b', name: { ro: 'Fotogrametrie', en: 'Photogrammetry' } }), summary({ _id: 'a' })],
      indexServicesById(services),
      'ro',
    );

    expect(rows.map((row) => row.id)).toEqual(['b', 'a']);
  });

  it('is empty when nothing declares equipment — no invented capability facts', () => {
    expect(
      instrumentReadouts([summary({ _id: 'a' })], indexServicesById([service({ _id: 'a' })]), 'ro'),
    ).toEqual([]);
  });
});
