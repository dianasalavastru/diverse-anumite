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
import { isCompetition } from './derive.js';
import { SECTORS, STATUSES } from './types.js';
import { createContentSource } from './source.js';
import {
  FIXTURE_RAW_DOCUMENTS,
  FIXTURE_SERVICES,
  FIXTURE_WORK_ENTRIES,
  createFixtureContentSource,
} from './fixtures.js';
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
    expect(byId['sv-1']?.slice().sort()).toEqual(['wf-1', 'wf-4']);
    expect(byId['sv-2']?.slice().sort()).toEqual(['wf-2', 'wf-5']);
    expect(byId['sv-3']).toEqual([]);
    // Stage 8: an entry may demonstrate several Services, and the reversal must
    // list it under each of them.
    expect(byId['sv-5']?.slice().sort()).toEqual(['wf-3', 'wf-4']);
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
  it('Competitions is a Label slice — every project carrying `competition`', async () => {
    const view = await source.curatedView('competitions', 'ro');
    /* wf-4 carries BOTH labels and wf-5 carries `competition` alone: membership is `includes`,
       so both belong, each exactly once, and the Reality Capture entry proves Labels are not
       scoped to a Pillar (v3.1 §10). */
    expect(view.map((item) => item._id).sort()).toEqual(['wf-4', 'wf-5']);
    expect(new Set(view.map((item) => item._id)).size).toBe(view.length);
  });

  it('excludes a project labelled only `diploma-project`', async () => {
    const view = await source.curatedView('competitions', 'ro');
    expect(view.map((item) => item._id)).not.toContain('wf-3');
  });

  /**
   * STAGE 2 — the two Professional Experience cases are replaced, not deleted.
   *
   * The view is permanently retired (`CONTENT_MODEL.md` v3.1 §13, `DECISIONS_LOG.md` #97), so
   * there is no membership or grouping left to assert. What replaces the coverage is the
   * assertion that the surface is genuinely gone from `ContentSource` and that **nothing was
   * substituted for it** — no second curated view, no Label-driven slice.
   */
  it('exposes no Professional Experience surface — retired, not replaced (Stage 2)', () => {
    const methods = Object.keys(source);
    expect(methods).not.toContain('professionalExperience');
    expect(methods).not.toContain('employers');
    expect(methods.filter((name) => /employer|professional/i.test(name))).toEqual([]);
  });

  it('leaves Competitions as the one curated view', async () => {
    /* `curatedView` still takes a literal union; Competitions is now its only member. */
    expect((await source.curatedView('competitions', 'ro')).length).toBeGreaterThan(0);
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
 * Vocabulary enforcement at read time — §7.2
 *
 * STAGE 3: the attribution half of this section is gone with the axis. What remains is the
 * controlled-vocabulary check itself, plus the tolerance assertions for legacy keys.
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
      normalizeWorkEntry({ ...raw, labels: ['built project'] } as never),
    ).toThrow(/controlled vocabulary/);
  });

  /*
   * STAGE 2: the Employer↔Attribution consistency case is gone with the field. An undeclared
   * `employer` on a raw document is now simply ignored by the projection and the normalizer —
   * which is the documented data implication, not a regression (plan Stage 2, "Data
   * implications"). Asserted below so the tolerance is deliberate rather than accidental.
   */
  it('ignores every retired Stage 3 key rather than failing on it', async () => {
    const raw = await firstRaw();
    /* Exactly what an un-migrated `development` document looks like until Stage 9 rewrites the
       dataset. None of these may be fatal, and none may reappear on the normalized entry. */
    const entry = normalizeWorkEntry({
      ...raw,
      attribution: 'studio',
      commissioning: 'client-commissioned',
      roles: { ro: ['Rol vechi'], en: null },
      authorship: { ro: 'Declaratie veche.', en: null },
    } as never);

    for (const key of ['attribution', 'commissioning', 'roles', 'authorship']) {
      expect(entry, `${key} must not survive normalization`).not.toHaveProperty(key);
    }
    expect(entry._id).toBe(raw._id);
  });

  it('ignores a legacy employer field rather than failing on it (Stage 2 data implication)', async () => {
    const raw = await firstRaw();
    const entry = normalizeWorkEntry({
      ...raw,
      // A document written before Stage 2 still carries this. It must not break the build.
      employer: { _id: 'emp-1', _type: 'employer', name: 'Legacy Studio SRL' },
    } as never);
    expect(entry).not.toHaveProperty('employer');
    expect(entry._id).toBe(raw._id);
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

describe('Label normalization (v3.1 §10)', () => {
  /** A raw fixture document, straight from the fixture "Content Lake". */
  async function rawEntry(): Promise<RawWorkEntry> {
    const [first] = await FIXTURE_RAW_DOCUMENTS.workEntries();
    if (!first) throw new Error('the fixture set is empty');
    return first;
  }

  it('treats an absent field as no labels, never as a default value', async () => {
    expect(normalizeWorkEntry({ ...(await rawEntry()), labels: undefined } as never).labels).toEqual([]);
    expect(normalizeWorkEntry({ ...(await rawEntry()), labels: null } as never).labels).toEqual([]);
    expect(normalizeWorkEntry({ ...(await rawEntry()), labels: [] } as never).labels).toEqual([]);
  });

  it('accepts one label, and both together', async () => {
    expect(normalizeWorkEntry({ ...(await rawEntry()), labels: ['competition'] } as never).labels).toEqual([
      'competition',
    ]);
    expect(
      normalizeWorkEntry({ ...(await rawEntry()), labels: ['competition', 'diploma-project'] } as never).labels,
    ).toEqual(['competition', 'diploma-project']);
  });

  it('preserves authored order without letting it change meaning', async () => {
    const raw = await rawEntry();
    const forward = normalizeWorkEntry({ ...raw, labels: ['competition', 'diploma-project'] } as never);
    const reversed = normalizeWorkEntry({ ...raw, labels: ['diploma-project', 'competition'] } as never);

    expect(forward.labels).toEqual(['competition', 'diploma-project']);
    expect(reversed.labels).toEqual(['diploma-project', 'competition']);
    /* Order is preserved but carries no semantics — both are competitions. */
    expect(isCompetition(forward)).toBe(true);
    expect(isCompetition(reversed)).toBe(true);
  });

  it('collapses a duplicate rather than counting it twice', async () => {
    expect(
      normalizeWorkEntry({ ...(await rawEntry()), labels: ['competition', 'competition'] } as never).labels,
    ).toEqual(['competition']);
  });

  it('fails the build on an unknown label', async () => {
    const raw = await rawEntry();
    expect(() => normalizeWorkEntry({ ...raw, labels: ['concurs'] } as never)).toThrow(
      /controlled vocabulary/,
    );
    /* A retired Entry Type value is just as invalid as an invented one — the axis is gone, so
       `competition-entry` is not a Label and never becomes one. */
    expect(() => normalizeWorkEntry({ ...raw, labels: ['competition-entry'] } as never)).toThrow(
      /controlled vocabulary/,
    );
  });
});

describe('Status is the v3.1 vocabulary, and only that (v3.1 §11.2, Stage 7)', () => {
  async function rawWorkEntry(): Promise<RawWorkEntry> {
    const [first] = await FIXTURE_RAW_DOCUMENTS.workEntries();
    if (!first) throw new Error('the fixture set is empty');
    return first;
  }

  it('accepts all four new values', async () => {
    const raw = await rawWorkEntry();
    for (const status of STATUSES) {
      expect(
        normalizeWorkEntry({ ...raw, metadata: { ...raw.metadata, status } } as never).metadata
          .status,
      ).toBe(status);
    }
    expect([...STATUSES]).toEqual(['in-dezvoltare', 'in-desfasurare', 'finalizat', 'nerealizat']);
  });

  it('rejects every RETIRED value — no alias, no silent remap', async () => {
    const raw = await rawWorkEntry();
    /*
     * The mapping is lossy: `built-realized` and `delivered` would both land on `finalizat`,
     * and `in-dezvoltare` has no source at all. A runtime fallback would decide that content
     * question invisibly, so every old token fails the build and becomes data for the Stage
     * 9/10 migration to review.
     */
    for (const retired of ['built-realized', 'unbuilt-proposal', 'in-progress', 'delivered']) {
      expect(
        () => normalizeWorkEntry({ ...raw, metadata: { ...raw.metadata, status: retired } } as never),
        retired,
      ).toThrow(/controlled vocabulary/);
    }
  });

  it('rejects an invented capture-workflow status (DECISIONS_LOG #94)', async () => {
    const raw = await rawWorkEntry();
    for (const invented of ['scanat', 'procesare', 'livrat']) {
      expect(
        () => normalizeWorkEntry({ ...raw, metadata: { ...raw.metadata, status: invented } } as never),
        invented,
      ).toThrow(/controlled vocabulary/);
    }
  });

  it('rejects a missing status rather than defaulting one', async () => {
    const raw = await rawWorkEntry();
    expect(() =>
      normalizeWorkEntry({ ...raw, metadata: { ...raw.metadata, status: undefined } } as never),
    ).toThrow(/controlled vocabulary/);
  });

  it('uses one vocabulary for both Pillars', async () => {
    /*
     * Nothing scopes Status by capability — the same four values are valid either side.
     *
     * STAGE 8. This used to overwrite `pillar` on one raw document and leave its Services
     * alone. That now fails, correctly: a Service belongs to exactly one Pillar, so the
     * rewritten document referenced Services from the other capability. The test reaches each
     * Pillar through a document that genuinely has it instead — which is what it always meant.
     */
    const raws = await FIXTURE_RAW_DOCUMENTS.workEntries();
    for (const pillar of ['architecture-design', 'reality-capture'] as const) {
      const raw = raws.find((candidate) => candidate.pillar === pillar);
      expect(raw, pillar).toBeDefined();
      for (const status of STATUSES) {
        expect(
          normalizeWorkEntry({ ...raw!, metadata: { ...raw!.metadata, status } } as never)
            .metadata.status,
          `${pillar}/${status}`,
        ).toBe(status);
      }
    }
  });

  it('covers all four values across the fixture set', async () => {
    const used = new Set(FIXTURE_WORK_ENTRIES.map((entry) => entry.metadata.status));
    expect([...used].sort()).toEqual([...STATUSES].sort());
  });
});

describe('Sector is closed and single-valued (v3.1 §11.1, Stage 6)', () => {
  async function rawWorkEntry(): Promise<RawWorkEntry> {
    const [first] = await FIXTURE_RAW_DOCUMENTS.workEntries();
    if (!first) throw new Error('the fixture set is empty');
    return first;
  }

  it('accepts every value of the closed vocabulary', async () => {
    const raw = await rawWorkEntry();
    for (const sector of SECTORS) {
      expect(normalizeWorkEntry({ ...raw, sector } as never).sector).toBe(sector);
    }
  });

  it('fails the build on an OLD sector token — the vocabulary really closed', async () => {
    const raw = await rawWorkEntry();
    /* Every one of the eight retired tokens must be rejected, not silently remapped. */
    for (const retired of [
      'residential',
      'hospitality',
      'office',
      'cultural',
      'heritage',
      'industrial',
      'infrastructure',
      'education',
    ]) {
      expect(
        () => normalizeWorkEntry({ ...raw, sector: retired } as never),
        retired,
      ).toThrow(/controlled vocabulary/);
    }
  });

  it('fails the build on a missing sector rather than defaulting one', async () => {
    const raw = await rawWorkEntry();
    expect(() => normalizeWorkEntry({ ...raw, sector: undefined } as never)).toThrow(
      /controlled vocabulary/,
    );
  });

  it('never accepts an array — the project axis is single-valued', async () => {
    const raw = await rawWorkEntry();
    expect(() =>
      normalizeWorkEntry({ ...raw, sector: ['rezidential', 'birouri-business'] } as never),
    ).toThrow(/controlled vocabulary/);
  });

  it('keeps Service.sectors PLURAL, on the same closed vocabulary', async () => {
    /* The decision this stage recorded: a Service names the sectors it is typically relevant
       in — many and optional — while a project names the one it is in. */
    for (const service of FIXTURE_SERVICES) {
      expect(Array.isArray(service.sectors), service._id).toBe(true);
      for (const sector of service.sectors) {
        expect(SECTORS, `${service._id}: ${sector}`).toContain(sector);
      }
    }
    expect(
      FIXTURE_SERVICES.some((service) => service.sectors.length > 1),
      'a fixture Service must carry more than one sector, or plurality is untested',
    ).toBe(true);
  });
});

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
        'highlights',
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
