import { describe, expect, it } from 'vitest';

/**
 * Homepage presentation selection, after the I-3 reconciliation.
 *
 * SCOPE DISCIPLINE. These tests assert only what Workstream A still decides.
 * Locale scoping, discovery order, pillar membership, placement filtering,
 * curated-view membership and employer grouping are Workstream B's shared
 * contracts, covered by B's own suites — asserting them again here would fork
 * one contract into two places, which is the drift §7.1 exists to prevent.
 *
 * The integration block at the foot runs against the real fixture
 * `ContentSource`, so a change in B's shapes, scoping or ordering fails here
 * rather than silently at build.
 */

import { createFixtureContentSource } from '../../lib/content/fixtures';
import { derivePillars } from '../../lib/content';
import type { Curation, WorkArchiveItem, WorkEntry } from '../../lib/content';

import { HIGHLIGHT_LIMIT, indexById, mountableDerivative, pointCloudSubject } from './highlights';

/* -------------------------------------------------------------------------- */
/* Builders — minimal, so each test states only what it is about               */
/* -------------------------------------------------------------------------- */

const curation = (overrides: Partial<Curation> = {}): Curation => ({
  featured: false,
  pinned: false,
  editorialPriority: 0,
  placements: [],
  prominence: 'standard',
  ...overrides,
});

function item(
  id: string,
  pillar: 'architecture' | 'reality-capture' = 'architecture',
): WorkArchiveItem {
  const discipline = { primary: pillar, secondary: [] } as const;
  return {
    _id: id,
    title: { ro: id, en: id },
    slug: { ro: id, en: id },
    enPublished: true,
    pillars: derivePillars(discipline),
    entryType: { primary: 'design-project', secondary: [] },
    sectors: [],
    year: 2024,
    status: 'built-realized',
    cover: null,
    curation: curation(),
    discipline,
    services: [],
    attribution: 'independent',
    employer: null,
    location: { ro: 'Oras', en: 'City' },
  };
}

function entry(id: string, capture: WorkEntry['capture'], cleared: boolean): WorkEntry {
  const discipline = { primary: 'reality-capture', secondary: [] } as const;
  return {
    _id: id,
    _type: 'workEntry',
    title: { ro: id, en: id },
    slug: { ro: id, en: id },
    enPublished: true,
    discipline,
    pillars: derivePillars(discipline),
    entryType: { primary: 'survey-documentation', secondary: [] },
    attribution: 'independent',
    commissioning: 'client-commissioned',
    employer: null,
    sectors: [],
    roles: null,
    services: [],
    relatedWork: [],
    description: null,
    authorship: null,
    cover: null,
    gallery: [],
    capture,
    capturePublicationCleared: cleared,
    metadata: {
      year: 2024,
      location: null,
      client: null,
      collaborators: [],
      status: 'delivered',
      awards: null,
      area: null,
      team: [],
      deliverables: null,
    },
    curation: curation(),
    seo: { title: null, description: null },
  };
}

const withDerivative: WorkEntry['capture'] = {
  accuracy: null,
  equipment: [],
  software: [],
  pointCount: 1000,
  derivative: {
    assetUrl: 'https://cdn.example/cloud.bin',
    poster: {
      assetId: 'poster',
      url: 'https://cdn.example/poster.jpg',
      width: 1600,
      height: 1000,
      alt: { ro: 'p', en: 'p' },
      hotspot: null,
      crop: null,
    },
  },
};

const withoutDerivative: WorkEntry['capture'] = {
  accuracy: null,
  equipment: [],
  software: [],
  pointCount: null,
  derivative: null,
};

/* -------------------------------------------------------------------------- */
/* The §19.4 publication gate                                                  */
/* -------------------------------------------------------------------------- */

describe('mountableDerivative — the publication gate', () => {
  const cleared = entry('cleared', withDerivative, true);
  const uncleared = entry('uncleared', withDerivative, false);
  const noAsset = entry('no-asset', withoutDerivative, true);

  it('withholds the asset of an entry that is not cleared for publication', () => {
    expect(mountableDerivative(uncleared)).toBeNull();
  });

  it('releases the asset of a cleared entry', () => {
    expect(mountableDerivative(cleared)?.assetUrl).toBe('https://cdn.example/cloud.bin');
  });

  it('releases nothing when a cleared entry simply has no derivative', () => {
    expect(mountableDerivative(noAsset)).toBeNull();
  });

  it('releases nothing for no entry at all', () => {
    expect(mountableDerivative(null)).toBeNull();
  });
});

describe('pointCloudSubject — which entry the field is about', () => {
  const cleared = entry('cleared', withDerivative, true);
  const uncleared = entry('uncleared', withDerivative, false);

  it('prefers an entry whose derivative may actually be published', () => {
    const byId = indexById([uncleared, cleared]);
    const ordered = [item('uncleared', 'reality-capture'), item('cleared', 'reality-capture')];
    expect(pointCloudSubject(ordered, byId)?._id).toBe('cleared');
  });

  it('falls back to an uncleared entry so the readout still describes real work — and mounts nothing', () => {
    const byId = indexById([uncleared]);
    const subject = pointCloudSubject([item('uncleared', 'reality-capture')], byId);
    expect(subject?._id).toBe('uncleared');
    expect(mountableDerivative(subject)).toBeNull();
  });

  it('never reads capture data off an Architecture & Design entry', () => {
    expect(pointCloudSubject([item('cleared', 'architecture')], indexById([cleared]))).toBeNull();
  });

  it('is null when no Reality Capture entry carries capture metadata', () => {
    const byId = indexById([entry('plain', null, false)]);
    expect(pointCloudSubject([item('plain', 'reality-capture')], byId)).toBeNull();
  });

  it('consumes the order it is given and never re-sorts', () => {
    const byId = indexById([
      entry('second', withDerivative, true),
      entry('first', withDerivative, true),
    ]);
    const ordered = [item('first', 'reality-capture'), item('second', 'reality-capture')];
    expect(pointCloudSubject(ordered, byId)?._id).toBe('first');
    expect(pointCloudSubject([...ordered].reverse(), byId)?._id).toBe('second');
  });
});

/* -------------------------------------------------------------------------- */
/* Integration with the real fixture ContentSource — the I-3 swap point        */
/* -------------------------------------------------------------------------- */

describe('integration with the fixture ContentSource (I-3)', () => {
  const source = createFixtureContentSource();

  it('sources the M-4 modules from homepage placements alone (CONTENT_MODEL §4)', async () => {
    for (const pillar of ['architecture-design', 'reality-capture'] as const) {
      const placed = await source.highlights('homepage', pillar, 'ro');
      const selection = placed.slice(0, HIGHLIGHT_LIMIT);

      // Every card shown is one the owner explicitly placed for this pillar —
      // the intersection §4 specifies, never a taxonomy top-up.
      expect(selection.length).toBeGreaterThan(0);
      expect(selection.length).toBeLessThanOrEqual(HIGHLIGHT_LIMIT);
      for (const card of selection) {
        expect(
          card.curation.placements.some(
            (placement) =>
              placement.slot === 'homepage' &&
              (placement.pillar === pillar || placement.pillar === null),
          ),
        ).toBe(true);
      }
    }
  });

  it('shows strictly fewer entries than the pillar archive holds — curation, not completeness', async () => {
    const placed = await source.highlights('homepage', 'architecture-design', 'ro');
    const archive = await source.workArchive('ro', 'architecture-design');
    expect(placed.length).toBeLessThan(archive.length);
  });

  it('carries Location on the archive projection, so M-5 needs no full-entry lookup', async () => {
    const competitions = await source.curatedView('competitions', 'ro');
    expect(competitions.length).toBeGreaterThan(0);
    for (const card of competitions) {
      expect(card).toHaveProperty('location');
    }
    expect(competitions.some((card) => card.location?.ro)).toBe(true);
  });

  it('only ever mounts a derivative that is cleared for publication (§19.4)', async () => {
    const entries = await source.workEntries('ro');
    const archive = await source.workArchive('ro');
    const subject = pointCloudSubject(archive, indexById(entries));

    // The fixture set deliberately carries an uncleared entry with capture
    // metadata; B's normalizer already withholds its derivative, so the gate is
    // enforced at the boundary and again here. Both must hold.
    const uncleared = entries.filter(
      (candidate) => !candidate.capturePublicationCleared && candidate.capture != null,
    );
    expect(uncleared.length).toBeGreaterThan(0);
    expect(uncleared.every((candidate) => candidate.capture?.derivative === null)).toBe(true);

    expect(subject?.capturePublicationCleared).toBe(true);
    expect(mountableDerivative(subject)).not.toBeNull();
    expect(uncleared.map((candidate) => candidate._id)).not.toContain(subject?._id);
  });

  it('states the readout and the asset from the SAME entry (§10.4)', async () => {
    const entries = await source.workEntries('ro');
    const archive = await source.workArchive('ro');
    const subject = pointCloudSubject(archive, indexById(entries));

    expect(subject?.capture).not.toBeNull();
    expect(mountableDerivative(subject)).toBe(subject?.capture?.derivative);
  });

  it('scopes the EN homepage to EN-published entries only (§7.1)', async () => {
    const ro = await source.workArchive('ro');
    const en = await source.workArchive('en');
    expect(en.length).toBeLessThan(ro.length);
    expect(en.every((card) => card.enPublished)).toBe(true);
  });
});
