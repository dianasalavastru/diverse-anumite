/**
 * Query-shape contract tests — the runtime half of the I-3 mitigation.
 *
 * OWNER: Workstream B. `TECHNICAL_ARCHITECTURE.md` §23.4.
 *
 * §23.4: "A builds against fixtures shaped by `types.ts`; if those fixtures diverge from what
 * GROQ actually returns, every component silently breaks at once." `satisfies Record<keyof
 * Raw…, string>` in `groq.ts` catches that at compile time. These tests catch the two things
 * a type cannot:
 *
 *   - that the *generated GROQ string* actually returns the keys the map declares, and
 *   - that the fixture dataset exercises the same key set the real query returns.
 */

import { describe, expect, it } from 'vitest';

import {
  CAPTURE_FIELDS,
  CURATION_FIELDS,
  EMPLOYER_FIELDS,
  IMAGE_FIELDS,
  METADATA_FIELDS,
  QUERY_ALL_EMPLOYERS,
  QUERY_ALL_SERVICES,
  QUERY_ALL_SERVICE_SUMMARIES,
  QUERY_ALL_WORK_ENTRIES,
  QUERY_SERVICE_BY_SLUG,
  QUERY_WORK_ARCHIVE,
  QUERY_WORK_ENTRY_BY_SLUG,
  SEO_FIELDS,
  SERVICE_FIELDS,
  SERVICE_SUMMARY_FIELDS,
  SERVICE_SUMMARY_PROJECTION,
  WORK_ARCHIVE_ITEM_FIELDS,
  WORK_ARCHIVE_ITEM_PROJECTION,
  WORK_ENTRY_FIELDS,
  WORK_ENTRY_PROJECTION,
  WORK_ENTRY_SUMMARY_FIELDS,
  WORK_ENTRY_SUMMARY_PROJECTION,
  projection,
  type ProjectionMap,
} from './groq.js';
import { FIXTURE_RAW_DOCUMENTS } from './fixtures.js';

/**
 * Extract the keys a GROQ projection actually returns, by parsing the generated string rather
 * than trusting the map it came from. Depth- and quote-aware, so a nested projection or an
 * inline sub-query never leaks a key into the top level.
 */
function topLevelKeys(groq: string): string[] {
  const body = groq.trim().replace(/^\{/, '').replace(/\}$/, '');
  const parts: string[] = [];
  let depth = 0;
  let quoted = false;
  let current = '';

  for (const character of body) {
    if (character === '"') quoted = !quoted;
    if (!quoted) {
      if ('{[('.includes(character)) depth += 1;
      if ('}])'.includes(character)) depth -= 1;
      if (character === ',' && depth === 0) {
        parts.push(current);
        current = '';
        continue;
      }
    }
    current += character;
  }
  parts.push(current);

  return parts
    .map((part) => part.trim())
    .filter((part) => part !== '')
    .map((part) => {
      const aliased = /^"([^"]+)"\s*:/.exec(part);
      return aliased ? (aliased[1] as string) : part;
    });
}

const PROJECTIONS: readonly (readonly [string, ProjectionMap, string])[] = [
  ['image', IMAGE_FIELDS, projection(IMAGE_FIELDS)],
  ['curation', CURATION_FIELDS, projection(CURATION_FIELDS)],
  ['seo', SEO_FIELDS, projection(SEO_FIELDS)],
  ['employer', EMPLOYER_FIELDS, projection(EMPLOYER_FIELDS)],
  ['metadata', METADATA_FIELDS, projection(METADATA_FIELDS)],
  ['capture', CAPTURE_FIELDS, projection(CAPTURE_FIELDS)],
  ['serviceSummary', SERVICE_SUMMARY_FIELDS, SERVICE_SUMMARY_PROJECTION],
  ['workEntrySummary', WORK_ENTRY_SUMMARY_FIELDS, WORK_ENTRY_SUMMARY_PROJECTION],
  ['workArchiveItem', WORK_ARCHIVE_ITEM_FIELDS, WORK_ARCHIVE_ITEM_PROJECTION],
  ['workEntry', WORK_ENTRY_FIELDS, WORK_ENTRY_PROJECTION],
  ['service', SERVICE_FIELDS, projection(SERVICE_FIELDS)],
];

const ALL_QUERIES: readonly (readonly [string, string])[] = [
  ['allWorkEntries', QUERY_ALL_WORK_ENTRIES],
  ['workArchive', QUERY_WORK_ARCHIVE],
  ['allServices', QUERY_ALL_SERVICES],
  ['allServiceSummaries', QUERY_ALL_SERVICE_SUMMARIES],
  ['allEmployers', QUERY_ALL_EMPLOYERS],
  ['workEntryBySlug.ro', QUERY_WORK_ENTRY_BY_SLUG.ro],
  ['workEntryBySlug.en', QUERY_WORK_ENTRY_BY_SLUG.en],
  ['serviceBySlug.ro', QUERY_SERVICE_BY_SLUG.ro],
  ['serviceBySlug.en', QUERY_SERVICE_BY_SLUG.en],
];

describe('Generated GROQ returns exactly the declared keys (§23.4)', () => {
  it.each(PROJECTIONS.map(([name, map, groq]) => ({ name, map, groq })))(
    '$name',
    ({ map, groq }) => {
      expect(topLevelKeys(groq).sort()).toEqual(Object.keys(map).sort());
    },
  );

  it('produces balanced projections', () => {
    for (const [name, , groq] of PROJECTIONS) {
      const opens = (groq.match(/\{/g) ?? []).length;
      const closes = (groq.match(/\}/g) ?? []).length;
      expect(opens, name).toBe(closes);
    }
  });
});

describe('Pillar is derived, never queried (§7.4, §8)', () => {
  it('no Work Entry projection selects a pillar field', () => {
    for (const name of ['workEntry', 'workEntrySummary', 'workArchiveItem'] as const) {
      const entry = PROJECTIONS.find(([projectionName]) => projectionName === name);
      expect(topLevelKeys(entry?.[2] as string), name).not.toContain('pillar');
      expect(topLevelKeys(entry?.[2] as string), name).not.toContain('pillars');
    }
  });

  it('the Service projection *does* select pillar — Services are classified, not derived', () => {
    // IA §2.3 "Service → Pillar". §7.4's derivation applies to Work Entries only, because it
    // derives from Discipline and Services carry none.
    expect(topLevelKeys(SERVICE_SUMMARY_PROJECTION)).toContain('pillar');
  });

  it('every Work Entry projection selects Discipline, since Pillar derives from it', () => {
    for (const name of ['workEntry', 'workEntrySummary', 'workArchiveItem'] as const) {
      const entry = PROJECTIONS.find(([projectionName]) => projectionName === name);
      expect(topLevelKeys(entry?.[2] as string), name).toContain('discipline');
    }
  });
});

describe('Every query is published-only (§8, R2)', () => {
  it.each(ALL_QUERIES.map(([name, groq]) => ({ name, groq })))('$name excludes drafts', ({ groq }) => {
    expect(groq).toContain('!(_id in path("drafts.**"))');
  });

  it('the reverse demonstratedBy join is published-only too', () => {
    // The nested sub-query is the easiest place for a draft to slip in, because it is not the
    // document the outer filter constrains.
    expect(QUERY_ALL_SERVICES).toContain('references(^._id)');
    const reverse = QUERY_ALL_SERVICES.slice(QUERY_ALL_SERVICES.indexOf('demonstratedBy'));
    expect(reverse).toContain('!(_id in path("drafts.**"))');
  });
});

describe('Ordering is derived at build, not queried (§7.6, §8)', () => {
  it('no query carries an order() clause', () => {
    for (const [name, groq] of ALL_QUERIES) {
      expect(groq, name).not.toContain('order(');
    }
  });
});

describe('Fixtures exercise the real query shape (§23.4)', () => {
  it('fixture Work Entries carry exactly the keys the query returns', async () => {
    const entries = await FIXTURE_RAW_DOCUMENTS.workEntries();
    const expected = Object.keys(WORK_ENTRY_FIELDS).sort();
    for (const entry of entries) {
      expect(Object.keys(entry).sort(), entry._id as string).toEqual(expected);
    }
  });

  it('fixture archive items carry exactly the keys the archive query returns', async () => {
    const items = await FIXTURE_RAW_DOCUMENTS.workArchive();
    const expected = Object.keys(WORK_ARCHIVE_ITEM_FIELDS).sort();
    for (const item of items) {
      expect(Object.keys(item).sort(), item._id as string).toEqual(expected);
    }
  });

  it('fixture Services carry exactly the keys the service query returns', async () => {
    const services = await FIXTURE_RAW_DOCUMENTS.services();
    const expected = Object.keys(SERVICE_FIELDS).sort();
    for (const service of services) {
      expect(Object.keys(service).sort(), service._id as string).toEqual(expected);
    }
  });

  it('dereferenced nested projections match their own field maps', async () => {
    const entries = await FIXTURE_RAW_DOCUMENTS.workEntries();
    const withRelations = entries.find((entry) => (entry.services ?? []).length > 0 && (entry.relatedWork ?? []).length > 0);
    expect(withRelations, 'a fixture must exercise both dereferenced relations').toBeDefined();

    expect(Object.keys((withRelations?.services ?? [])[0] ?? {}).sort()).toEqual(
      Object.keys(SERVICE_SUMMARY_FIELDS).sort(),
    );
    expect(Object.keys((withRelations?.relatedWork ?? [])[0] ?? {}).sort()).toEqual(
      Object.keys(WORK_ENTRY_SUMMARY_FIELDS).sort(),
    );
  });
});
