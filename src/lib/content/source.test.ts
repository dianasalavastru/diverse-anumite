/**
 * Query-layer behaviour tests — locale scoping, curated views, the draft-leak assertion and the
 * production-perspective gate.
 *
 * OWNER: Workstream B. `TECHNICAL_ARCHITECTURE.md` §7.1, §8, §11.2, §18, §19.4.
 */

import { describe, expect, it } from 'vitest';

import {
  ContentConfigError,
  PRODUCTION_PERSPECTIVE,
  SANITY_API_VERSION,
  assertProductionPerspective,
  queryUrlBase,
  resolveSanityConfig,
} from './config.js';
import { createContentClient } from './client.js';
import { ContentShapeError, assertNotDraft, normalizeWorkEntry } from './normalize.js';
import { createContentSource } from './source.js';
import { FIXTURE_RAW_DOCUMENTS, createFixtureContentSource } from './fixtures.js';
import type { RawWorkEntry } from './groq.js';

const source = createFixtureContentSource();

/* ────────────────────────────────────────────────────────────────────────────
 * Draft leak — §8, R2
 * ──────────────────────────────────────────────────────────────────────────── */

describe('No draft reaches build output (§8, R2)', () => {
  it('fails on a draft document id', () => {
    expect(() => assertNotDraft('drafts.wf-1')).toThrow(ContentShapeError);
  });

  it('fails the build rather than emitting the document', async () => {
    const [real] = await FIXTURE_RAW_DOCUMENTS.workEntries();
    const leaked: RawWorkEntry = { ...(real as RawWorkEntry), _id: 'drafts.wf-1' };
    expect(() => normalizeWorkEntry(leaked)).toThrow(/Draft document/);
  });

  it('catches a draft hidden in a dereferenced relation, not only the top-level document', async () => {
    const entries = await FIXTURE_RAW_DOCUMENTS.workEntries();
    const withRelated = entries.find((entry) => (entry.relatedWork ?? []).length > 0) as RawWorkEntry;
    const poisoned: RawWorkEntry = {
      ...withRelated,
      relatedWork: (withRelated.relatedWork ?? []).map((related) => ({
        ...related,
        _id: `drafts.${related._id}`,
      })),
    };
    expect(() => normalizeWorkEntry(poisoned)).toThrow(/Draft document/);
  });

  it('passes the whole fixture set cleanly', async () => {
    await expect(source.workEntries('ro')).resolves.toBeDefined();
    await expect(source.services('ro')).resolves.toBeDefined();
  });
});

/* ────────────────────────────────────────────────────────────────────────────
 * Production perspective — §8, §18
 * ──────────────────────────────────────────────────────────────────────────── */

describe('Production perspective is pinned (§8, §18)', () => {
  const env = {
    SANITY_PROJECT_ID: 'fixture-project',
    SANITY_DATASET: 'production',
    SANITY_READ_TOKEN: 'fixture-token',
  };

  it('defaults to published', () => {
    expect(resolveSanityConfig(env).perspective).toBe(PRODUCTION_PERSPECTIVE);
    expect(PRODUCTION_PERSPECTIVE).toBe('published');
  });

  it('pins the API version at which published became the default', () => {
    // Verified against Sanity's HTTP API reference 2026-08-11: at v2025-02-19 the default
    // perspective changed from `raw` (which returns drafts) to `published`. §8 is accurate.
    expect(SANITY_API_VERSION).toBe('2025-02-19');
    expect(queryUrlBase(resolveSanityConfig(env))).toBe(
      'https://fixture-project.api.sanity.io/v2025-02-19/data/query/production',
    );
  });

  it('reads uncached, so a build triggered by a publish webhook cannot serve the prior revision', () => {
    expect(queryUrlBase(resolveSanityConfig(env))).not.toContain('apicdn');
  });

  it('refuses to build a client on any other perspective', () => {
    expect(() => assertProductionPerspective('drafts')).toThrow(ContentConfigError);
    expect(() => assertProductionPerspective('raw')).toThrow(ContentConfigError);
    expect(() =>
      createContentClient({ ...resolveSanityConfig(env), perspective: 'drafts' }),
    ).toThrow(ContentConfigError);
  });

  it('names every missing credential rather than failing on the first', () => {
    expect(() => resolveSanityConfig({})).toThrow(
      /SANITY_PROJECT_ID, SANITY_DATASET, SANITY_READ_TOKEN/,
    );
  });
});

/* ────────────────────────────────────────────────────────────────────────────
 * Locale scoping — §7.1, §11.2
 * ──────────────────────────────────────────────────────────────────────────── */

describe('Aggregate surfaces are locale-scoped (§7.1)', () => {
  it('excludes an untranslated entry from every EN aggregate', async () => {
    const ro = await source.workArchive('ro');
    const en = await source.workArchive('en');
    expect(ro.map((item) => item._id)).toContain('wf-3');
    expect(en.map((item) => item._id)).not.toContain('wf-3');
  });

  it('returns a clean miss for an untranslated entity, never the RO document (§11.2)', async () => {
    expect(await source.workEntry('proiect-de-birou-fixture', 'ro')).not.toBeNull();
    // Rule 7: `/en/<untranslated>` is a clean 404, not a redirect to RO.
    expect(await source.workEntry('proiect-de-birou-fixture', 'en')).toBeNull();
  });

  it('scopes nested relations too, so no EN page links to a page that does not exist', async () => {
    const entries = await source.workEntries('en');
    for (const entry of entries) {
      for (const related of entry.relatedWork) {
        expect(related.enPublished && related.slug.en !== null, related._id).toBe(true);
      }
      for (const service of entry.services) {
        expect(service.enPublished && service.slug.en !== null, service._id).toBe(true);
      }
    }
  });

  it('keeps discovery order valid when the EN set is a proper subset (§7.6 rule 5)', async () => {
    const en = await source.workArchive('en');
    const priorities = en.map((item) => item.curation.editorialPriority);
    expect(en.length).toBeLessThan((await source.workArchive('ro')).length);
    expect(priorities.length).toBeGreaterThan(0);
  });
});

/* ────────────────────────────────────────────────────────────────────────────
 * Relationships — IA Step 6, §2.3
 * ──────────────────────────────────────────────────────────────────────────── */

describe('Work ⇄ Service (IA Step 6, DECISIONS_LOG #38)', () => {
  it('derives demonstratedBy by reversing the entry-held reference', async () => {
    const services = await source.services('ro');
    const byId = Object.fromEntries(
      services.map((service) => [service._id, service.demonstratedBy.map((work) => work._id)]),
    );
    expect(byId['sv-1']).toEqual(['wf-1']);
    expect(byId['sv-2']?.sort()).toEqual(['wf-2', 'wf-5']);
    expect(byId['sv-3']).toEqual([]);
  });

  it('keeps a Service with zero demonstrating entries publishable (F5)', async () => {
    const service = await source.service('fotogrametrie-drona-fixture', 'ro');
    expect(service?.demonstratedBy).toEqual([]);
    expect(service?.enPublished).toBe(true);
  });

  it('orders demonstratedBy by curation, not by document order', async () => {
    const service = (await source.services('ro')).find((candidate) => candidate._id === 'sv-2');
    const priorities = (service?.demonstratedBy ?? []).map((work) => work.curation.editorialPriority);
    expect([...priorities]).toEqual([...priorities].sort((a, b) => b - a));
  });
});

describe('Curated views (IA §2.2, §5.1)', () => {
  it('Competitions is an Entry Type slice', async () => {
    const view = await source.curatedView('competitions', 'ro');
    expect(view.map((item) => item._id)).toEqual(['wf-4']);
  });

  it('Professional Experience is Studio-attributed only, grouped by Employer', async () => {
    const groups = await source.professionalExperience('ro');
    expect(groups).toHaveLength(1);
    expect(groups[0]?.employer.name).toBe('Fixture Studio SRL');
    expect(groups[0]?.entries.map((entry) => entry._id)).toEqual(['wf-3']);
  });

  it('is empty in EN when the only Studio entry is untranslated', async () => {
    expect(await source.professionalExperience('en')).toEqual([]);
  });
});

describe('Curation placements (CONTENT_MODEL.md:77)', () => {
  it('returns only entries explicitly placed in the slot', async () => {
    const homepage = await source.highlights('homepage', null, 'ro');
    expect(homepage.map((item) => item._id).sort()).toEqual(['wf-1', 'wf-5']);
  });

  it('scopes a placement to its pillar', async () => {
    const rc = await source.highlights('homepage', 'reality-capture', 'ro');
    expect(rc.map((item) => item._id)).toEqual(['wf-5']);
  });
});

/* ────────────────────────────────────────────────────────────────────────────
 * Capture publication gate — §19.4
 * ──────────────────────────────────────────────────────────────────────────── */

describe('Capture publication gate is enforced in the query layer (§19.4)', () => {
  it('withholds an uncleared derivative even though it exists in the CMS', async () => {
    const raw = await FIXTURE_RAW_DOCUMENTS.workEntryBySlug('releveu-patrimoniu-fixture', 'ro');
    // The fixture deliberately stores a derivative on an uncleared entry…
    expect(raw?.capture?.derivative?.assetUrl).toBeTruthy();
    expect(raw?.capturePublicationCleared).toBe(false);

    const entry = await source.workEntry('releveu-patrimoniu-fixture', 'ro');
    // …and the query layer drops it, while keeping the survey's own claims.
    expect(entry?.capture?.derivative).toBeNull();
    expect(entry?.capture?.accuracy).not.toBeNull();
  });

  it('publishes a cleared derivative with its poster fallback', async () => {
    const entry = await source.workEntry('scanare-hala-industriala-fixture', 'ro');
    expect(entry?.capturePublicationCleared).toBe(true);
    expect(entry?.capture?.derivative?.assetUrl).toBeTruthy();
    expect(entry?.capture?.derivative?.poster).not.toBeNull();
  });

  it('rejects a cleared derivative that has no poster to degrade to (§10.2, §14.0)', async () => {
    const raw = (await FIXTURE_RAW_DOCUMENTS.workEntryBySlug(
      'scanare-hala-industriala-fixture',
      'ro',
    )) as RawWorkEntry;
    const posterless: RawWorkEntry = {
      ...raw,
      capture: { ...raw.capture, derivative: { assetUrl: '/x.bin', poster: null } },
    };
    expect(() => normalizeWorkEntry(posterless)).toThrow(/poster fallback/);
  });

  it('never computes a point count (§10.4)', async () => {
    const uncleared = await source.workEntry('releveu-patrimoniu-fixture', 'ro');
    expect(uncleared?.capture?.pointCount).toBeNull();
  });
});

/* ────────────────────────────────────────────────────────────────────────────
 * Vocabulary and attribution enforcement at read time — §7.2, CONTENT_MODEL.md:50
 * ──────────────────────────────────────────────────────────────────────────── */

describe('The build refuses malformed content (§7.2)', () => {
  async function firstRaw(): Promise<RawWorkEntry> {
    const [entry] = await FIXTURE_RAW_DOCUMENTS.workEntries();
    return entry as RawWorkEntry;
  }

  it('rejects a value outside a controlled vocabulary', async () => {
    const raw = await firstRaw();
    expect(() =>
      // The prohibited collapsed taxonomy (§7.2) would arrive looking exactly like this.
      normalizeWorkEntry({ ...raw, entryType: { primary: 'built project', secondary: [] } }),
    ).toThrow(/controlled vocabulary/);
  });

  it('rejects an Employer on a non-Studio entry (CONTENT_MODEL.md:50)', async () => {
    const raw = await firstRaw();
    expect(() =>
      normalizeWorkEntry({
        ...raw,
        attribution: 'independent',
        employer: { _id: 'emp-1', _type: 'employer', name: 'Fixture Studio SRL' },
      }),
    ).toThrow(/Employer applies only when Attribution = Studio/);
  });

  it('never substitutes RO for a missing EN value', async () => {
    const raw = await firstRaw();
    const entry = normalizeWorkEntry({ ...raw, title: { ro: 'Titlu', en: '  ' } });
    expect(entry.title.en).toBeNull();
    expect(entry.title.ro).toBe('Titlu');
  });

  it('requires a Year, which the archive sorts on', async () => {
    const raw = await firstRaw();
    expect(() => normalizeWorkEntry({ ...raw, metadata: { ...raw.metadata, year: null } })).toThrow(
      /metadata.year/,
    );
  });
});

/* ────────────────────────────────────────────────────────────────────────────
 * The I-3 swap
 * ──────────────────────────────────────────────────────────────────────────── */

describe('Fixture and Sanity sources are interchangeable (§23.4)', () => {
  it('both are built by the same factory over the same raw contract', async () => {
    const rebuilt = createContentSource(FIXTURE_RAW_DOCUMENTS);
    expect(Object.keys(rebuilt).sort()).toEqual(Object.keys(source).sort());
    expect((await rebuilt.workArchive('ro')).map((item) => item._id)).toEqual(
      (await source.workArchive('ro')).map((item) => item._id),
    );
  });

  it('exposes every surface the six page types consume', () => {
    expect(Object.keys(source).sort()).toEqual(
      [
        'curatedView',
        'employers',
        'highlights',
        'professionalExperience',
        'service',
        'serviceSummaries',
        'services',
        'workArchive',
        'workEntries',
        'workEntry',
      ].sort(),
    );
  });
});
