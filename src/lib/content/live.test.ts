/**
 * The live CMS handshake — B3's verification harness.
 *
 * OWNER: Workstream B. `TECHNICAL_ARCHITECTURE.md` §7, §8, §11.2, §18, §19.4, §23.4 (I-3).
 *
 * B2 proved the schema and query layer against fixtures and against Sanity's published HTTP
 * contract. It could not prove them against a Sanity project, because none existed. This file
 * is what closes that gap the moment one does: it is the single command that answers "does the
 * frozen contract hold against a real dataset?".
 *
 * ── HOW IT RUNS ─────────────────────────────────────────────────────────────────────────────
 *
 *   npm test                       # secrets + seed pre-flight run; the live suite skips
 *   SANITY_PROJECT_ID=… SANITY_DATASET=development SANITY_READ_TOKEN=… npm test
 *                                  # everything runs
 *
 * A `.env` at the repository root is read if present (`.gitignore` excludes it — §18). Real
 * environment variables win over it. **Point this at the `development` dataset**, never at
 * `production`: the seeded assertions expect `studio/seed/b3-test-dataset.ndjson` to be
 * imported, and that seed must never reach production (see `studio/seed/README.md`).
 *
 * ── WHY THE SUITE SELF-SKIPS RATHER THAN FAILS ──────────────────────────────────────────────
 *
 * §18 puts the read token in the build environment and nowhere else. A developer checkout has
 * no token, and neither does a CI job that only type-checks. A suite that failed without one
 * would push someone toward committing credentials to make the build green — which is the exact
 * outcome §18 exists to prevent. Skipping is loud enough: the reason is printed.
 *
 * ── WHAT IS *NOT* PROVEN HERE ───────────────────────────────────────────────────────────────
 *
 * Two checks need a human in the Studio and are listed in `studio/README.md` under "Manual
 * verification", not silently omitted:
 *   - the reserved-slug rule *blocking a publish* (this file proves no live document holds a
 *     reserved slug; it cannot prove the editor was stopped);
 *   - the capture gate *dropping an uploaded derivative* (this file proves the invariant on
 *     live data; the drop path needs a real uploaded asset, which NDJSON cannot carry).
 */

import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { beforeAll, describe, expect, it } from 'vitest';

import { createContentClient, type ContentClient } from './client.js';
import { ENV, PRODUCTION_PERSPECTIVE, resolveSanityConfig, type SanityConfig } from './config.js';
import { createFixtureContentSource } from './fixtures.js';
import {
  QUERY_ALL_EMPLOYERS,
  QUERY_ALL_SERVICES,
  QUERY_ALL_SERVICE_SUMMARIES,
  QUERY_ALL_WORK_ENTRIES,
  QUERY_WORK_ARCHIVE,
  QUERY_WORK_ENTRY_BY_SLUG,
  SERVICE_FIELDS,
  SERVICE_SUMMARY_FIELDS,
  WORK_ARCHIVE_ITEM_FIELDS,
  WORK_ENTRY_FIELDS,
  type RawService,
  type RawServiceSummary,
  type RawWorkArchiveItem,
  type RawWorkEntry,
} from './groq.js';
import { createSanityContentSource, type ContentSource } from './source.js';
import {
  validateAssignment,
  validateAuthorship,
  validateCaptureGate,
  validateEmployerScope,
  validateEnAvailability,
  validateVocabulary,
  validateWorkEntrySlug,
  errorsOf,
  type ValidationIssue,
} from './validation.js';
import { DISCIPLINE_TO_PILLAR, type Discipline } from './types.js';
import { RESERVED_SLUGS, type Locale } from '../i18n/routes.js';

const REPO_ROOT = new URL('../../../', import.meta.url);
const SEED_PATH = new URL('studio/seed/b3-test-dataset.ndjson', REPO_ROOT);

/* ════════════════════════════════════════════════════════════════════════════
 * Always on — the checks that need no credentials
 * ════════════════════════════════════════════════════════════════════════════ */

describe('Secrets model (§18) — no credential is in Git', () => {
  const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: REPO_ROOT })
    .toString('utf8')
    .split('\0')
    .filter(Boolean);

  it('tracks no .env file, only the two .env.example templates', () => {
    const envFiles = tracked.filter((path) => /(^|\/)\.env($|\.)/.test(path));
    expect(envFiles.sort()).toEqual(['.env.example', 'studio/.env.example']);
  });

  it('tracks no .dev.vars (the Wrangler secret file, §18)', () => {
    expect(tracked.filter((path) => path.endsWith('.dev.vars'))).toEqual([]);
  });

  /**
   * A committed template must stay a template. `NAME=` is a declaration; `NAME=<something>` is
   * a value, and §18's rule is "variable names only, no values".
   */
  it('leaves every variable in the committed .env.example templates empty', () => {
    for (const template of ['.env.example', 'studio/.env.example']) {
      const lines = readFileSync(new URL(template, REPO_ROOT), 'utf8').split('\n');
      const assigned = lines
        .map((line) => line.trim())
        .filter((line) => line !== '' && !line.startsWith('#'))
        .filter((line) => line.split('=').slice(1).join('=').trim() !== '');
      expect(assigned, `${template} must declare names, never values`).toEqual([]);
    }
  });

  /** §18's read token is a build-environment value; the client refuses to run where a visitor could observe it. */
  it('refuses to fetch from a browser context', async () => {
    const client = createContentClient({
      projectId: 'test',
      dataset: 'test',
      apiVersion: '2025-02-19',
      perspective: PRODUCTION_PERSPECTIVE,
      token: 'not-a-real-token',
    });

    const globals = globalThis as { window?: unknown };
    globals.window = {};
    try {
      await expect(client.fetch('*[_type == "workEntry"]')).rejects.toThrow(/may not run in a browser/);
    } finally {
      delete globals.window;
    }
  });

  /** The config error names the missing variables, so it must never echo a value it did find. */
  it('never echoes a token value in the missing-configuration error', () => {
    const attempt = () =>
      resolveSanityConfig({ [ENV.readToken]: 'sk-secret-value-that-must-not-leak' });
    expect(attempt).toThrow(/SANITY_PROJECT_ID/);
    expect(attempt).not.toThrow(/sk-secret-value/);
  });
});

/* ────────────────────────────────────────────────────────────────────────────
 * Seed pre-flight — the seed satisfies the frozen contract before it is imported
 *
 * `studio/seed/b3-test-dataset.ndjson` is imported into a dataset by hand, so nothing else
 * would catch a value that the Studio would reject or the build would refuse. These are the
 * *same* predicates `studio/schemaTypes/**` attaches to the fields (§7.7's "one source, read by
 * both the router and the validator", generalised), applied to the seed documents.
 * ──────────────────────────────────────────────────────────────────────────── */

interface SeedDocument {
  readonly _id: string;
  readonly _type: string;
  readonly [key: string]: unknown;
}

function readSeed(): readonly SeedDocument[] {
  return readFileSync(SEED_PATH, 'utf8')
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line) as SeedDocument);
}

/** Mirrors the document-level rules in `studio/schemaTypes/workEntry.ts`. */
function validateSeedWorkEntry(document: SeedDocument): ValidationIssue[] {
  const title = document.title as { ro?: string; en?: string } | undefined;
  const slug = document.slug as { ro?: { current?: string }; en?: { current?: string } } | undefined;
  const discipline = document.discipline as { primary?: string; secondary?: string[] } | undefined;
  const entryType = document.entryType as { primary?: string; secondary?: string[] } | undefined;
  const metadata = document.metadata as { year?: number; status?: string } | undefined;
  const attribution = document.attribution as string | undefined;

  return [
    ...(slug?.ro?.current ? validateWorkEntrySlug(slug.ro.current, 'ro', 'slug.ro') : []),
    ...(slug?.en?.current ? validateWorkEntrySlug(slug.en.current, 'en', 'slug.en') : []),
    ...validateAssignment(discipline?.primary, discipline?.secondary, 'discipline', 'discipline'),
    ...validateAssignment(entryType?.primary, entryType?.secondary, 'entryType', 'entryType'),
    ...validateVocabulary(attribution, 'attribution', 'attribution'),
    ...validateVocabulary(document.commissioning as string, 'commissioning', 'commissioning'),
    ...validateVocabulary(metadata?.status, 'status', 'metadata.status'),
    ...validateEmployerScope(attribution, Boolean(document.employer)),
    ...validateAuthorship(
      entryType?.primary,
      attribution,
      Boolean((document.authorship as { ro?: string } | undefined)?.ro?.trim()),
    ),
    ...validateEnAvailability({
      enPublished: Boolean(document.enPublished),
      titleEn: Boolean(title?.en?.trim()),
      slugEn: Boolean(slug?.en?.current),
      bodyEn: ((document.description as { en?: unknown[] } | undefined)?.en ?? []).length > 0,
    }),
    ...validateCaptureGate({
      hasDerivative: Boolean(
        (document.capture as { derivative?: unknown } | undefined)?.derivative,
      ),
      hasPoster: Boolean(
        (document.capture as { derivative?: { poster?: unknown } } | undefined)?.derivative?.poster,
      ),
      cleared: Boolean(document.capturePublicationCleared),
      pointCount: (document.capture as { pointCount?: number } | undefined)?.pointCount ?? null,
    }),
  ];
}

describe('Seed pre-flight — studio/seed/b3-test-dataset.ndjson', () => {
  const seed = readSeed();

  it('holds unique ids and resolvable references', () => {
    const ids = new Set(seed.map((document) => document._id.replace(/^drafts\./, '')));
    expect(ids.size).toBe(seed.length);

    const dangling: string[] = [];
    const walk = (value: unknown): void => {
      if (Array.isArray(value)) return value.forEach(walk);
      if (value && typeof value === 'object') {
        const reference = (value as { _ref?: string })._ref;
        if (reference && !ids.has(reference)) dangling.push(reference);
        Object.values(value).forEach(walk);
      }
    };
    seed.forEach(walk);
    expect(dangling).toEqual([]);
  });

  it('is unmistakably non-production — every document is id-prefixed and TEST-labelled', () => {
    for (const document of seed) {
      expect(document._id.replace(/^drafts\./, ''), 'seed ids are namespaced').toMatch(/^da-test-/);
      const label = JSON.stringify(document.title ?? document.name ?? '');
      expect(label, `${document._id} must carry a visible TEST label`).toMatch(/TEST/);
    }
  });

  it('passes every blocking validation rule the Studio attaches (§7.2, §7.7, §11.2, §19.4)', () => {
    for (const document of seed.filter((candidate) => candidate._type === 'workEntry')) {
      const blocking = errorsOf(validateSeedWorkEntry(document));
      expect(blocking.map((issue) => `${document._id} ${issue.path}: ${issue.message}`)).toEqual([]);
    }
  });

  /** The coverage the live suite below depends on. A seed that lost one of these would pass vacuously. */
  it('covers the states the live suite asserts against', () => {
    const workEntries = seed.filter((document) => document._type === 'workEntry');
    const services = seed.filter((document) => document._type === 'service');

    expect(seed.some((document) => document._id.startsWith('drafts.')), 'a draft, to prove exclusion').toBe(true);
    expect(workEntries.some((entry) => entry.enPublished === false), 'an RO-only entry, to prove the EN gate').toBe(true);
    expect(
      workEntries.some((entry) => (entry.services as unknown[] | undefined)?.length),
      'an entry referencing a Service, to prove the reverse join',
    ).toBe(true);
    expect(workEntries.some((entry) => entry.capture), 'capture metadata, to prove the §19.4 gate').toBe(true);
    /**
     * §7.4 needs *both* shapes to be exercised, and they look identical if you only count
     * secondary disciplines: `architecture + [interior-design]` is multi-discipline but
     * single-pillar, while `reality-capture + [architecture]` is genuinely cross-pillar.
     * Counting disciplines instead of pillars is what made the live derivation test wrong.
     */
    const pillarSets = workEntries.map((entry) => {
      const discipline = entry.discipline as { primary?: Discipline; secondary?: Discipline[] };
      return new Set(
        [discipline.primary, ...(discipline.secondary ?? [])]
          .filter((value): value is Discipline => Boolean(value))
          .map((value) => DISCIPLINE_TO_PILLAR[value]),
      );
    });

    expect(
      pillarSets.some((pillars) => pillars.size > 1),
      'an entry whose disciplines span two pillars, to prove cross-pillar derivation',
    ).toBe(true);
    expect(
      workEntries.some(
        (entry, index) =>
          ((entry.discipline as { secondary?: string[] })?.secondary ?? []).length > 0 &&
          (pillarSets[index] as Set<string>).size === 1,
      ),
      'an entry with a second discipline inside one pillar, to prove the exclusion rule',
    ).toBe(true);
    expect(services.length, 'a linked and an unlinked Service, to prove F5').toBeGreaterThanOrEqual(2);
  });
});

/* ════════════════════════════════════════════════════════════════════════════
 * The live suite
 * ════════════════════════════════════════════════════════════════════════════ */

/** Dependency-free `.env` reader. `package.json` is Workstream A's file (§23.3) — B adds no dependency to it. */
function readDotEnv(): Record<string, string> {
  try {
    const parsed: Record<string, string> = {};
    for (const line of readFileSync(new URL('.env', REPO_ROOT), 'utf8').split('\n')) {
      const match = /^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
      if (!match) continue;
      const value = (match[2] as string).trim().replace(/^(['"])(.*)\1$/, '$2');
      if (value !== '') parsed[match[1] as string] = value;
    }
    return parsed;
  } catch {
    return {};
  }
}

/**
 * Read through `globalThis` rather than the `process` global: declaring `process` in this
 * program would put a Node global into a browser-typed surface for every file A owns, and
 * `node-shims.d.ts` exists precisely to keep that blast radius at zero.
 */
const processEnv =
  (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};

const env = { ...readDotEnv(), ...processEnv };
const missing = [ENV.projectId, ENV.dataset, ENV.readToken].filter((name) => !env[name]?.trim());

if (missing.length > 0) {
  // eslint-disable-next-line no-console
  console.info(
    `\n  [live CMS handshake] skipped — no Sanity credentials. Missing: ${missing.join(', ')}.` +
      `\n  Set them (or write a root .env) and re-run to verify the contract against a real dataset.` +
      `\n  See studio/README.md → "Verifying the live dataset".\n`,
  );
}

/**
 * Shape equivalence, pruned at `null` on either side.
 *
 * §23.4's I-3 risk is a *shape* divergence, not a content one: a fixture entry has a cover and a
 * seeded one may not, and that difference is content. Descending stops wherever either side is
 * null, so what remains compared is exactly the public shape both sources claim to produce.
 */
function shapeDiff(fixture: unknown, live: unknown, path = '', diff: string[] = []): string[] {
  if (fixture === null || fixture === undefined || live === null || live === undefined) return diff;

  if (Array.isArray(fixture) && Array.isArray(live)) {
    if (fixture.length > 0 && live.length > 0) shapeDiff(fixture[0], live[0], `${path}[]`, diff);
    return diff;
  }

  if (typeof fixture === 'object' && typeof live === 'object') {
    const fixtureKeys = Object.keys(fixture as object);
    const liveKeys = Object.keys(live as object);
    for (const key of fixtureKeys) {
      if (!liveKeys.includes(key)) diff.push(`missing from live: ${path}.${key}`);
    }
    for (const key of liveKeys) {
      if (!fixtureKeys.includes(key)) diff.push(`extra in live: ${path}.${key}`);
    }
    for (const key of fixtureKeys.filter((candidate) => liveKeys.includes(candidate))) {
      shapeDiff(
        (fixture as Record<string, unknown>)[key],
        (live as Record<string, unknown>)[key],
        `${path}.${key}`,
        diff,
      );
    }
    return diff;
  }

  if (typeof fixture !== typeof live) {
    diff.push(`type mismatch at ${path}: fixture ${typeof fixture}, live ${typeof live}`);
  }
  return diff;
}

/** Ids reachable through a normalized document, so a draft leak anywhere in the graph is caught. */
function collectIds(value: unknown, found: string[] = []): string[] {
  if (Array.isArray(value)) {
    value.forEach((item) => collectIds(item, found));
    return found;
  }
  if (value && typeof value === 'object') {
    const id = (value as { _id?: unknown })._id;
    if (typeof id === 'string') found.push(id);
    Object.values(value).forEach((item) => collectIds(item, found));
  }
  return found;
}

describe.skipIf(missing.length > 0)('Live Sanity handshake', () => {
  /**
   * Resolved in `beforeAll`, not at describe-body evaluation: Vitest walks the body of a skipped
   * suite to collect its tests, so a top-level `resolveSanityConfig` would throw on the very
   * checkouts this suite is meant to skip on.
   */
  let config: SanityConfig;
  let client: ContentClient;
  let live: ContentSource;
  const fixture = createFixtureContentSource();

  beforeAll(() => {
    config = resolveSanityConfig(env);
    client = createContentClient(config);
    live = createSanityContentSource(config);
  });

  /* ── 1. The connection itself ──────────────────────────────────────────── */

  describe('handshake', () => {
    it('reaches the configured project and dataset', async () => {
      const total = await client.fetch<number>('count(*)');
      expect(typeof total).toBe('number');
    });

    it('is pointed at a non-production dataset', () => {
      // The seeded assertions below expect test documents. Running them against `production`
      // would either fail loudly or, worse, pass because someone imported the seed there.
      expect(
        config.dataset,
        'point the harness at the development dataset — see studio/seed/README.md',
      ).not.toBe('production');
    });

    it('sends the published perspective on every request (§8)', () => {
      expect(config.perspective).toBe(PRODUCTION_PERSPECTIVE);
    });
  });

  /* ── 2. Every projection is valid GROQ and returns the declared keys ────── */

  describe('projections against the live Content Lake (§23.4)', () => {
    const cases = [
      ['work entries', QUERY_ALL_WORK_ENTRIES, WORK_ENTRY_FIELDS],
      ['work archive', QUERY_WORK_ARCHIVE, WORK_ARCHIVE_ITEM_FIELDS],
      ['services', QUERY_ALL_SERVICES, SERVICE_FIELDS],
      ['service summaries', QUERY_ALL_SERVICE_SUMMARIES, SERVICE_SUMMARY_FIELDS],
    ] as const;

    for (const [name, query, fields] of cases) {
      it(`${name}: the live response carries exactly the declared key set`, async () => {
        const results = await client.fetch<readonly Record<string, unknown>[]>(query);
        expect(results.length, `${name}: the dataset is empty — import the seed first`).toBeGreaterThan(0);
        for (const document of results) {
          expect(Object.keys(document).sort()).toEqual(Object.keys(fields).sort());
        }
      });
    }

    it('employers resolve', async () => {
      const employers = await client.fetch<readonly Record<string, unknown>[]>(QUERY_ALL_EMPLOYERS);
      expect(employers.length).toBeGreaterThan(0);
    });

    it('a by-slug lookup returns a single document, not an array', async () => {
      const entries = await client.fetch<readonly RawWorkEntry[]>(QUERY_ALL_WORK_ENTRIES);
      const slug = entries.find((entry) => entry.slug?.ro)?.slug?.ro as string;
      const found = await client.fetch<RawWorkEntry | null>(QUERY_WORK_ENTRY_BY_SLUG.ro, { slug });
      expect(found?.slug?.ro).toBe(slug);
    });
  });

  /* ── 3. No draft reaches output (§8, R2) ───────────────────────────────── */

  describe('published perspective (§8, R2)', () => {
    it('excludes drafts that the same token can otherwise see', async () => {
      /**
       * §18 records the consequence to respect: "a Viewer token *can* read drafts, because
       * narrower read roles are Enterprise-only." That is asserted rather than assumed here —
       * the drafts perspective is requested through a bare `fetch`, deliberately outside
       * `createContentClient`, whose `assertProductionPerspective` guard refuses it. This is the
       * only place in the repository that reads a draft, and it reads ids only.
       */
      const url = new URL(
        `https://${config.projectId}.api.sanity.io/v${config.apiVersion}/data/query/${config.dataset}`,
      );
      url.searchParams.set('query', '*[_id in path("drafts.**")]._id');
      url.searchParams.set('perspective', 'raw');
      const response = await globalThis.fetch(url, {
        headers: { Authorization: `Bearer ${config.token}`, Accept: 'application/json' },
      });
      const draftIds = ((await response.json()) as { result: string[] }).result ?? [];

      expect(draftIds.length, 'the seeded draft is missing — re-import the seed').toBeGreaterThan(0);

      const published = await client.fetch<readonly RawWorkEntry[]>(QUERY_ALL_WORK_ENTRIES);
      const publishedIds = published.map((entry) => entry._id);
      for (const draftId of draftIds) {
        expect(publishedIds).not.toContain(draftId);
        expect(publishedIds).not.toContain(draftId.replace(/^drafts\./, ''));
      }
    });

    it('emits no drafts. id anywhere in the normalized graph', async () => {
      const [entries, archive, services] = await Promise.all([
        live.workEntries('ro'),
        live.workArchive('ro'),
        live.services('ro'),
      ]);
      for (const id of collectIds([entries, archive, services])) {
        expect(id).not.toContain('drafts.');
      }
    });
  });

  /* ── 4. Localization, the EN gate, and §11.2 ───────────────────────────── */

  describe('localization (§7.1) and the EN publication gate (§11.2)', () => {
    it('returns localized fields as { ro, en }, with an untranslated en as null', async () => {
      const entries = await live.workEntries('ro');
      expect(entries.length).toBeGreaterThan(0);

      for (const entry of entries) {
        expect(Object.keys(entry.title).sort()).toEqual(['en', 'ro']);
        expect(typeof entry.title.ro).toBe('string');
        expect(entry.title.en === null || typeof entry.title.en === 'string').toBe(true);
      }

      const bilingual = entries.find((entry) => entry.title.en !== null);
      expect(bilingual, 'the seed must contain a bilingual entry').toBeDefined();
      const untranslated = entries.find((entry) => !entry.enPublished);
      expect(untranslated, 'the seed must contain an RO-only entry').toBeDefined();
      expect(untranslated?.slug.en).toBeNull();
    });

    it('omits every entity that is not EN-published from the EN locale', async () => {
      const [ro, en] = await Promise.all([live.workEntries('ro'), live.workEntries('en')]);

      expect(en.length).toBeLessThan(ro.length);
      for (const entry of en) {
        expect(entry.enPublished).toBe(true);
        expect(entry.slug.en).not.toBeNull();
      }

      const roOnly = ro.filter((entry) => !entry.enPublished).map((entry) => entry._id);
      expect(roOnly.length).toBeGreaterThan(0);
      for (const id of roOnly) {
        expect(en.map((entry) => entry._id)).not.toContain(id);
      }
    });

    it('404s an EN request for an untranslated entry rather than serving RO (§11.2 rule 7)', async () => {
      const ro = await live.workEntries('ro');
      const untranslated = ro.find((entry) => !entry.enPublished);
      expect(await live.workEntry(untranslated?.slug.ro as string, 'en')).toBeNull();
      expect(await live.workEntry(untranslated?.slug.ro as string, 'ro')).not.toBeNull();
    });

    it('lets no EN aggregate link to a page the EN build does not generate', async () => {
      const enIds = new Set((await live.workEntries('en')).map((entry) => entry._id));
      for (const entry of await live.workEntries('en')) {
        for (const related of entry.relatedWork) {
          expect(related.enPublished).toBe(true);
          expect(enIds.has(related._id) || related.slug.en !== null).toBe(true);
        }
        for (const service of entry.services) {
          expect(service.enPublished).toBe(true);
          expect(service.slug.en).not.toBeNull();
        }
      }
    });
  });

  /* ── 5. The reference graph ────────────────────────────────────────────── */

  describe('Work ⇄ Service (IA Step 6, DECISIONS_LOG #38)', () => {
    it('resolves Work → Service references', async () => {
      const entries = await live.workEntries('ro');
      const linked = entries.find((entry) => entry.services.length > 0);
      expect(linked, 'the seed must link an entry to a Service').toBeDefined();
      for (const service of linked?.services ?? []) {
        expect(service._id).toBeTruthy();
        expect(typeof service.slug.ro).toBe('string');
        expect(service.pillar).toBeTruthy();
      }
    });

    it('resolves demonstratedBy by reversing the reference, never by a stored copy', async () => {
      const entries = await live.workEntries('ro');
      const linked = entries.find((entry) => entry.services.length > 0);
      const target = linked?.services[0];

      const service = await live.service(target?.slug.ro as string, 'ro');
      expect(service?.demonstratedBy.map((entry) => entry._id)).toContain(linked?._id);
    });

    it('keeps a Service with zero demonstrating entries publishable (F5)', async () => {
      const services = await live.services('ro');
      const empty = services.find((service) => service.demonstratedBy.length === 0);
      expect(empty, 'the seed must contain an unlinked Service').toBeDefined();
      expect(empty?.name.ro).toBeTruthy();
    });

    it('scopes an Employer to Studio attribution (CONTENT_MODEL.md:50)', async () => {
      for (const entry of await live.workEntries('ro')) {
        if (entry.employer) expect(entry.attribution).toBe('studio');
      }
      const grouped = await live.professionalExperience('ro');
      expect(grouped.length, 'the seed must contain a Studio-attributed entry').toBeGreaterThan(0);
    });
  });

  /* ── 6. Derivation and order ───────────────────────────────────────────── */

  describe('derivation (§7.4) and discovery order (§7.6)', () => {
    it('derives Pillar from Discipline and never queries a stored pillar', async () => {
      const raw = await client.fetch<readonly RawWorkEntry[]>(QUERY_ALL_WORK_ENTRIES);
      for (const document of raw) {
        expect(Object.keys(document)).not.toContain('pillar');
        expect(Object.keys(document)).not.toContain('pillars');
      }

      const entries = await live.workEntries('ro');

      /**
       * §7.4 derives secondary pillars "deduplicated and excluding the primary", so a *second
       * discipline* is not the same thing as a *second pillar*. Both directions are asserted,
       * because getting only the first one right is how the rule silently degrades into
       * "any multi-discipline entry appears in both pillar views."
       */
      const crossPillar = entries.filter((entry) => entry.pillars.secondary.length > 0);
      const samePillar = entries.filter(
        (entry) => entry.discipline.secondary.length > 0 && entry.pillars.secondary.length === 0,
      );

      // Different pillars → the entry surfaces in both views (`CONTENT_MODEL.md`:63).
      expect(crossPillar.length, 'the seed must contain a genuinely cross-pillar entry').toBeGreaterThan(0);
      for (const entry of crossPillar) {
        const disciplinePillars = new Set(
          [entry.discipline.primary, ...entry.discipline.secondary].map(
            (discipline) => DISCIPLINE_TO_PILLAR[discipline],
          ),
        );
        expect(disciplinePillars.size, `${entry._id}: secondary pillar without a second pillar`).toBeGreaterThan(1);
        expect(entry.pillars.secondary).not.toContain(entry.pillars.primary);
      }

      // Same pillar → a second discipline, and deliberately no second pillar.
      expect(
        samePillar.length,
        'the seed must contain a multi-discipline entry whose disciplines share one pillar',
      ).toBeGreaterThan(0);
      for (const entry of samePillar) {
        const disciplinePillars = new Set(
          [entry.discipline.primary, ...entry.discipline.secondary].map(
            (discipline) => DISCIPLINE_TO_PILLAR[discipline],
          ),
        );
        expect(disciplinePillars.size, `${entry._id}: disciplines do not in fact share a pillar`).toBe(1);
      }
    });

    it('applies discovery order to the live archive', async () => {
      const archive = await live.workArchive('ro');
      expect(archive.length).toBeGreaterThan(1);
      const pinnedFirst = [...archive].every(
        (item, index, all) => index === 0 || !item.curation.pinned || all[index - 1]?.curation.pinned,
      );
      expect(pinnedFirst).toBe(true);
    });
  });

  /* ── 7. Reserved slugs and the capture gate ────────────────────────────── */

  describe('validation invariants on live data', () => {
    it('holds no document claiming a reserved curated-view slug (§7.7, IA §2.2 F4)', async () => {
      const entries = await live.workEntries('ro');
      for (const entry of entries) {
        for (const locale of ['ro', 'en'] as Locale[]) {
          const slug = entry.slug[locale];
          if (!slug) continue;
          expect(
            RESERVED_SLUGS[locale],
            `${entry._id} claims the reserved ${locale.toUpperCase()} route '${slug}'`,
          ).not.toContain(slug);
        }
      }
    });

    it('withholds a capture derivative that is not cleared for publication (§19.4)', async () => {
      const entries = await live.workEntries('ro');
      const withCapture = entries.filter((entry) => entry.capture !== null);
      expect(withCapture.length, 'the seed must contain capture metadata').toBeGreaterThan(0);

      for (const entry of entries) {
        if (!entry.capturePublicationCleared) {
          expect(
            entry.capture?.derivative ?? null,
            `${entry._id}: an uncleared derivative reached build output`,
          ).toBeNull();
        }
        // §10.2/§14.0: whatever survives the gate must have a poster to degrade to.
        if (entry.capture?.derivative) expect(entry.capture.derivative.poster).not.toBeNull();
      }

      /**
       * The other half of the gate, and the one a passing test can hide.
       *
       * B3 found `assetUrl` projecting `null` because the file dereference was one level too
       * shallow. That made this suite green while withholding *every* derivative, cleared or
       * not — and the obvious guard ("for each entry whose derivative surfaced, assert a URL")
       * is useless against it, because the bug is precisely that nothing surfaces.
       *
       * So ground truth comes from the Content Lake, through a **different path expression**
       * than the projection under test: a projection bug therefore cannot suppress its own
       * evidence. Only exercised once an asset is attached, because NDJSON cannot carry one —
       * `studio/scripts/verify-capture-gate.ts` attaches one.
       */
      const attached = await client.fetch<readonly { _id: string; cleared: boolean }[]>(
        '*[_type == "workEntry" && !(_id in path("drafts.**")) && defined(capture.derivative.asset.asset)]' +
          '{ _id, "cleared": capturePublicationCleared == true }',
      );

      const byId = new Map(entries.map((entry) => [entry._id, entry]));
      for (const { _id, cleared } of attached) {
        const entry = byId.get(_id);
        if (!entry) continue;
        if (cleared) {
          expect(
            entry.capture?.derivative?.assetUrl,
            `${_id}: an attached, publication-cleared derivative did not reach build output — check the file dereference in POINT_CLOUD_DERIVATIVE_FIELDS`,
          ).toMatch(/^https:\/\//);
          expect(entry.capture?.derivative?.poster, `${_id}: cleared derivative without a poster`).not.toBeNull();
        } else {
          expect(entry.capture?.derivative ?? null, `${_id}: uncleared derivative reached build output`).toBeNull();
        }
      }
    });

    it('reports the accuracy and equipment of an uncleared survey, but not the survey', async () => {
      const entries = await live.workEntries('ro');
      const uncleared = entries.find((entry) => entry.capture && !entry.capturePublicationCleared);
      expect(uncleared?.capture?.accuracy?.ro).toBeTruthy();
      expect(uncleared?.capture?.derivative).toBeNull();
    });
  });

  /* ── 8. Fixture ⇄ live equivalence — the I-3 contract ───────────────────── */

  describe('fixture ⇄ live ContentSource equivalence (§23.4, I-3)', () => {
    it('returns the same public Work Entry shape from both sources', async () => {
      const [fixtures, entries] = await Promise.all([fixture.workEntries('ro'), live.workEntries('ro')]);
      expect(entries.length).toBeGreaterThan(0);
      for (const entry of entries) {
        expect(shapeDiff(fixtures[0], entry, entry._id)).toEqual([]);
      }
    });

    it('returns the same public archive-item shape from both sources', async () => {
      const [fixtures, archive] = await Promise.all([fixture.workArchive('ro'), live.workArchive('ro')]);
      for (const item of archive) {
        expect(shapeDiff(fixtures[0], item, item._id)).toEqual([]);
      }
    });

    it('returns the same public Service shape from both sources', async () => {
      const [fixtures, services] = await Promise.all([fixture.services('ro'), live.services('ro')]);
      for (const service of services) {
        expect(shapeDiff(fixtures[0], service, service._id)).toEqual([]);
      }
    });

    it('returns the same top-level key set for every ContentSource method', async () => {
      const methods = [
        ['workEntries', () => fixture.workEntries('ro'), () => live.workEntries('ro')],
        ['workArchive', () => fixture.workArchive('ro'), () => live.workArchive('ro')],
        ['services', () => fixture.services('ro'), () => live.services('ro')],
        ['serviceSummaries', () => fixture.serviceSummaries('ro'), () => live.serviceSummaries('ro')],
        ['employers', () => fixture.employers(), () => live.employers()],
      ] as const;

      for (const [name, fromFixture, fromLive] of methods) {
        const [fixtures, results] = await Promise.all([fromFixture(), fromLive()]);
        expect(results.length, `${name}: live returned nothing`).toBeGreaterThan(0);
        expect(Object.keys(results[0] as object).sort(), name).toEqual(
          Object.keys(fixtures[0] as object).sort(),
        );
      }
    });

    it('carries no raw-shape leakage — the live source returns the contract, not the projection', async () => {
      const [rawEntry] = await client.fetch<readonly RawWorkEntry[]>(QUERY_ALL_WORK_ENTRIES);
      const [normalized] = await live.workEntries('ro');
      // The raw projection has no `pillars`; the contract does. If these ever matched, the
      // normalizer had been bypassed.
      expect(Object.keys(rawEntry as object)).not.toContain('pillars');
      expect(Object.keys(normalized as object)).toContain('pillars');
    });
  });

  /* ── 9. Nothing the site would render carries the credential ───────────── */

  describe('no secret reaches rendered output (§18)', () => {
    it('returns no serialized result containing the read token', async () => {
      const payload = JSON.stringify(
        await Promise.all([
          live.workEntries('ro'),
          live.workEntries('en'),
          live.workArchive('ro'),
          live.services('ro'),
          live.serviceSummaries('ro'),
          live.employers(),
        ]),
      );
      expect(payload).not.toContain(config.token);
      expect(payload).not.toMatch(/\bsk[A-Za-z0-9_-]{10,}/);
    });

    it('keeps the token out of the error surface on a failed query', async () => {
      const badClient = createContentClient({ ...config, projectId: 'nonexistent-project-b3' });
      await badClient
        .fetch('*[_type == "workEntry"]')
        .then(() => expect.unreachable('the query should have failed'))
        .catch((thrown: Error) => {
          expect(`${thrown.name} ${thrown.message}`).not.toContain(config.token);
        });
    });
  });

  /* ── 10. Raw shapes the projections claim ──────────────────────────────── */

  describe('raw response conforms to the declared raw types', () => {
    it('never returns a nested projection with unexpected keys', async () => {
      const [services, archive, summaries] = await Promise.all([
        client.fetch<readonly RawService[]>(QUERY_ALL_SERVICES),
        client.fetch<readonly RawWorkArchiveItem[]>(QUERY_WORK_ARCHIVE),
        client.fetch<readonly RawServiceSummary[]>(QUERY_ALL_SERVICE_SUMMARIES),
      ]);

      for (const service of services) {
        for (const entry of service.demonstratedBy ?? []) {
          expect(Object.keys(entry).sort()).toEqual(
            ['_id', 'title', 'slug', 'enPublished', 'discipline', 'entryType', 'sectors', 'year', 'status', 'cover', 'curation'].sort(),
          );
        }
      }

      for (const item of archive) {
        for (const service of item.services ?? []) {
          expect(Object.keys(service).sort()).toEqual(['_id', 'slug']);
        }
      }

      for (const summary of summaries) {
        expect(Object.keys(summary).sort()).toEqual(Object.keys(SERVICE_SUMMARY_FIELDS).sort());
      }
    });
  });
});
