/**
 * The archive's facet projection — `facets.ts`.
 *
 * OWNERSHIP: Workstream A. Added at migration Stage 6, when Sector became a closed vocabulary
 * and `collectFacetValues` lost its "authored values follow, sorted" tail. That tail was the
 * only part of the function anyone had reason to doubt, and nothing covered it; closing the
 * axis is exactly the moment to pin what replaced it.
 *
 * The rule under test, from the file's own header and adopted verbatim at §7.2: option order
 * comes from the **frozen enumerations**, never from the data, so the controls read the same on
 * every build and in both locales.
 */

import { describe, expect, it } from 'vitest';

import {
  PROJECT_LABELS,
  SECTORS,
  SERVICE_KEYS,
  type Pillar,
  type ServiceKey,
  type ServiceSummary,
  type WorkArchiveItem,
} from '../../lib/content';
import { collectFacetValues, itemFacets, serviceOptions } from './facets';

const CURATION = {
  featured: false,
  pinned: false,
  editorialPriority: 0,
  placements: [],
  prominence: 'standard',
} as const;

function item(id: string, overrides: Partial<WorkArchiveItem> = {}): WorkArchiveItem {
  return {
    _id: id,
    title: { ro: id, en: id },
    slug: { ro: id, en: id },
    enPublished: true,
    pillar: 'architecture-design',
    sector: 'rezidential',
    labels: [],
    year: 2024,
    status: 'finalizat',
    cover: null,
    curation: CURATION,
    services: [],
    location: null,
    galleryPreview: [],
    ...overrides,
  };
}

describe('itemFacets — one project, one sector (Stage 6)', () => {
  it('projects the single authored Sector as a one-element list', () => {
    expect(itemFacets(item('a', { sector: 'cultural-patrimoniu' }), 'ro').sectors).toEqual([
      'cultural-patrimoniu',
    ]);
  });

  it('projects the single authored Pillar the same way', () => {
    expect(itemFacets(item('a', { pillar: 'reality-capture' }), 'ro').pillars).toEqual([
      'reality-capture',
    ]);
  });
});

describe('collectFacetValues — vocabulary order, not data order (Stage 6)', () => {
  it('lists Sectors in the frozen vocabulary order however the data is ordered', () => {
    /* Authored last-to-first, so data order and vocabulary order genuinely disagree. */
    const items = [
      item('a', { sector: 'mixed-use-dezvoltari' }),
      item('b', { sector: 'birouri-business' }),
      item('c', { sector: 'rezidential' }),
    ];

    expect(collectFacetValues(items, 'ro').sectors).toEqual([
      'rezidential',
      'birouri-business',
      'mixed-use-dezvoltari',
    ]);
  });

  it('offers only Sectors the archive actually holds — never the whole vocabulary', () => {
    const values = collectFacetValues([item('a', { sector: 'rezidential' })], 'ro');
    expect(values.sectors).toEqual(['rezidential']);
    expect(values.sectors.length).toBeLessThan(SECTORS.length);
  });

  it('deduplicates a Sector two projects share', () => {
    const items = [item('a', { sector: 'rezidential' }), item('b', { sector: 'rezidential' })];
    expect(collectFacetValues(items, 'ro').sectors).toEqual(['rezidential']);
  });

  it('has no tail for values outside the vocabulary — the axis is closed', () => {
    /* Before Stage 6 an authored token would have been appended after the known values. There
       is no such token now: `normalize.ts` fails the build first, so the option list is exactly
       the vocabulary intersection. */
    const items = SECTORS.map((sector, index) => item(`s${index}`, { sector }));
    expect(collectFacetValues(items, 'ro').sectors).toEqual([...SECTORS]);
  });

  it('orders Labels by their frozen vocabulary too', () => {
    const items = [
      item('a', { labels: ['diploma-project'] }),
      item('b', { labels: ['competition'] }),
    ];
    expect(collectFacetValues(items, 'ro').labels).toEqual([...PROJECT_LABELS]);
  });
});

/* ────────────────────────────────────────────────────────────────────────────
 * 2026-08-17 — the archive taxonomy reconciliation (`DECISIONS_LOG.md` #101)
 * ──────────────────────────────────────────────────────────────────────────── */

const ref = (key: ServiceKey, pillar: Pillar, slugRo: string) => ({
  _id: `svc-${key}`,
  key,
  pillar,
  slug: { ro: slugRo, en: `${slugRo}-en` },
});

const summary = (key: ServiceKey, pillar: Pillar, nameRo: string, nameEn: string | null = nameRo) =>
  ({
    _id: `svc-${key}`,
    key,
    name: { ro: nameRo, en: nameEn },
    slug: { ro: `slug-${key}`, en: `slug-${key}-en` },
    enPublished: true,
    pillar,
    shortDescription: null,
    hero: null,
    curation: CURATION,
  }) as ServiceSummary;

describe('Service facet identity is the immutable key (v3.1 §14.3)', () => {
  it('projects the ServiceKey, never the localized slug', () => {
    const facets = itemFacets(
      item('a', { services: [ref('proiectare-arhitectura', 'architecture-design', 'proiectare')] }),
      'ro',
    );
    expect(facets.services).toEqual(['proiectare-arhitectura']);
    expect(facets.services).not.toContain('proiectare');
  });

  it('is unchanged when the Service slug is renamed, in either locale', () => {
    /* The whole point of keying on `key`: a slug is an editable, per-locale string, and the
       archive's public filter vocabulary must not move when an editor retitles a route. */
    const before = item('a', {
      services: [ref('scanare-laser-3d', 'reality-capture', 'scanare-3d')],
    });
    const after = item('a', {
      services: [ref('scanare-laser-3d', 'reality-capture', 'releveu-prin-scanare')],
    });
    expect(itemFacets(after, 'ro').services).toEqual(itemFacets(before, 'ro').services);
    expect(itemFacets(after, 'en').services).toEqual(itemFacets(before, 'ro').services);
  });

  it('carries one key per demonstrated Service, so a multi-Service project matches each', () => {
    const facets = itemFacets(
      item('a', {
        services: [
          ref('proiectare-arhitectura', 'architecture-design', 'proiectare'),
          ref('design-interior', 'architecture-design', 'interior'),
        ],
      }),
      'ro',
    );
    expect([...facets.services].sort()).toEqual(['design-interior', 'proiectare-arhitectura']);
  });
});

describe('Label options are vocabulary-driven, Services and Sectors are presence-scoped', () => {
  it('offers BOTH canonical Labels even when no project carries either', () => {
    /* The deliberate exception (#101). `PROJECT_LABELS` is a closed two-value global
       vocabulary, and a Label vanishing from the control until the first such project exists
       makes the archive's own taxonomy look incomplete. */
    const values = collectFacetValues([item('a'), item('b')], 'ro');
    expect(values.labels).toEqual([...PROJECT_LABELS]);
  });

  it('offers `diploma-project` at zero matches', () => {
    const values = collectFacetValues([item('a', { labels: ['competition'] })], 'ro');
    expect(values.labels).toContain('diploma-project');
  });

  it('does NOT generalize that rule to Sector', () => {
    const values = collectFacetValues([item('a', { sector: 'rezidential' })], 'ro');
    expect(values.sectors).toEqual(['rezidential']);
    expect(values.sectors.length).toBeLessThan(SECTORS.length);
  });

  it('does NOT generalize that rule to Services', () => {
    const values = collectFacetValues(
      [item('a', { services: [ref('design-mobilier', 'architecture-design', 'mobilier')] })],
      'ro',
    );
    expect(values.services).toEqual(['design-mobilier']);
    expect(values.services.length).toBeLessThan(SERVICE_KEYS.length);
  });
});

describe('serviceOptions — every Pillar, keyed and labelled', () => {
  const summaries = [
    summary('proiectare-arhitectura', 'architecture-design', 'Proiectare de arhitectura'),
    summary('scanare-laser-3d', 'reality-capture', 'Scanare laser 3D'),
    summary('design-interior', 'architecture-design', 'Design interior', null),
  ];
  const available = ['proiectare-arhitectura', 'scanare-laser-3d', 'design-interior'];

  it('no longer drops Architecture & Design Services (the Stage 5 scope is gone)', () => {
    const options = serviceOptions(summaries, available, 'ro');
    expect(options.map((option) => option.key)).toEqual([
      'proiectare-arhitectura',
      'scanare-laser-3d',
      'design-interior',
    ]);
  });

  it('carries the key as identity and the authored name as display text', () => {
    const [first] = serviceOptions(summaries, available, 'ro');
    expect(first?.key).toBe('proiectare-arhitectura');
    expect(first?.label).toBe('Proiectare de arhitectura');
    expect(first?.pillar).toBe('architecture-design');
  });

  it('tags each option with its Pillar, which is what scopes the control', () => {
    const byPillar = serviceOptions(summaries, available, 'ro').reduce<Record<string, string[]>>(
      (acc, option) => ({ ...acc, [option.pillar]: [...(acc[option.pillar] ?? []), option.key] }),
      {},
    );
    expect(byPillar['architecture-design']).toEqual(['proiectare-arhitectura', 'design-interior']);
    expect(byPillar['reality-capture']).toEqual(['scanare-laser-3d']);
  });

  it('drops a Service nothing demonstrates — presence-scoping survives the widening', () => {
    const options = serviceOptions(summaries, ['scanare-laser-3d'], 'ro');
    expect(options.map((option) => option.key)).toEqual(['scanare-laser-3d']);
  });

  it('drops a Service with no name in this locale, so no control shows an empty chip', () => {
    /* `design-interior` is RO-only here. Its key stays a valid facet value on the cells; it
       simply has no EN control, and a value no control can express is not restorable. */
    const options = serviceOptions(summaries, available, 'en');
    expect(options.map((option) => option.key)).toEqual([
      'proiectare-arhitectura',
      'scanare-laser-3d',
    ]);
  });
});
