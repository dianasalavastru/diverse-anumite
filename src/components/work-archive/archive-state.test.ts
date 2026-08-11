/**
 * The archive filter + URL contract, tested against §23.5 clause by clause.
 *
 * OWNER: Workstream A. §16 puts "filter/URL state" in the Vitest unit layer.
 * Each `describe` names the frozen clause it holds.
 */

import { describe, expect, it } from 'vitest';

import {
  ARCHIVE_PARAMS,
  DEFAULT_ARCHIVE_STATE,
  archiveHref,
  archiveQuery,
  clearFilters,
  contextualFacet,
  hasActiveFilters,
  isDefaultArchiveState,
  matchesArchiveState,
  parseArchiveState,
  parseFacetList,
  pillarFromToken,
  withPillar,
  type ArchiveFacetValues,
  type ArchiveItemFacets,
  type ArchiveState,
} from './archive-state.js';

const AVAILABLE: ArchiveFacetValues = {
  types: ['design-project', 'competition-entry', 'survey-documentation'],
  sectors: ['residential', 'heritage', 'industrial'],
  disciplines: ['architecture', 'interior-design', 'reality-capture'],
  services: ['scanare-laser-3d', 'proiectare-arhitectura'],
};

const state = (overrides: Partial<ArchiveState> = {}): ArchiveState => ({
  ...DEFAULT_ARCHIVE_STATE,
  ...overrides,
});

describe('Parameter names — §23.5 fixes exactly six', () => {
  it('spells them as the contract writes them', () => {
    expect(Object.values(ARCHIVE_PARAMS)).toEqual([
      'pillar',
      'sector',
      'type',
      'discipline',
      'service',
      'sort',
    ]);
  });
});

describe('Pillar is a mode, and its URL token is its own namespace', () => {
  it('maps the frozen tokens (WORK_ARCHIVE_IMPLEMENTATION_NOTES.md:134)', () => {
    expect(pillarFromToken('architecture')).toBe('architecture-design');
    expect(pillarFromToken('reality-capture')).toBe('reality-capture');
  });

  it('does not accept the content identifier as a URL token', () => {
    // `types.ts`: content identity, route slug and filter token are three namespaces.
    expect(pillarFromToken('architecture-design')).toBeNull();
  });

  it('defaults to All, and All is absent from the URL', () => {
    expect(parseArchiveState('').pillar).toBe('all');
    expect(archiveQuery(state())).toBe('');
  });

  it('ignores an unknown pillar rather than rendering an empty archive', () => {
    expect(parseArchiveState('pillar=landscape', AVAILABLE).pillar).toBe('all');
  });
});

describe('Contextual refinement — Discipline under A&D, Service under RC, none under All', () => {
  it('names the refinement per scope', () => {
    expect(contextualFacet('architecture-design')).toBe('discipline');
    expect(contextualFacet('reality-capture')).toBe('service');
    expect(contextualFacet('all')).toBeNull();
  });

  it('restores a discipline only under Architecture & Design', () => {
    const parsed = parseArchiveState('pillar=architecture&discipline=interior-design', AVAILABLE);
    expect(parsed.discipline).toBe('interior-design');
  });

  it('drops a discipline under Reality Capture', () => {
    const parsed = parseArchiveState(
      'pillar=reality-capture&discipline=interior-design',
      AVAILABLE,
    );
    expect(parsed.discipline).toBeNull();
  });

  it('drops both refinements under All', () => {
    const parsed = parseArchiveState(
      'discipline=architecture&service=scanare-laser-3d',
      AVAILABLE,
    );
    expect(parsed.discipline).toBeNull();
    expect(parsed.service).toBeNull();
  });

  it('restores a service only under Reality Capture', () => {
    const parsed = parseArchiveState('pillar=reality-capture&service=scanare-laser-3d', AVAILABLE);
    expect(parsed.service).toBe('scanare-laser-3d');
  });
});

describe('Forward-compatible comma-separated encoding (§23.5)', () => {
  it('parses a facet as a list', () => {
    expect(parseFacetList('heritage,industrial')).toEqual(['heritage', 'industrial']);
    expect(parseFacetList(' heritage , , industrial ')).toEqual(['heritage', 'industrial']);
    expect(parseFacetList(null)).toEqual([]);
    expect(parseFacetList('')).toEqual([]);
  });

  it('applies the single-select launch bound — the first available value wins', () => {
    expect(parseArchiveState('sector=heritage,industrial', AVAILABLE).sector).toBe('heritage');
  });

  it('skips leading values the archive does not have, rather than the whole list', () => {
    // An already-shared multi-value URL keeps working when one value disappears.
    expect(parseArchiveState('sector=landscape,heritage', AVAILABLE).sector).toBe('heritage');
  });

  it('serializes single-select as a one-value list — the same string', () => {
    expect(archiveQuery(state({ sector: 'heritage' }))).toBe('sector=heritage');
  });
});

describe('Validation against the rendered set', () => {
  it('ignores a value no entry carries', () => {
    expect(parseArchiveState('type=visualization-commission', AVAILABLE).type).toBeNull();
  });

  it('ignores parameters that are not public filters', () => {
    // Year is a sort; Status and Attribution are never public filters (§23.5, F2).
    const parsed = parseArchiveState('year=2024&status=built-realized&attribution=studio', AVAILABLE);
    expect(parsed).toEqual(DEFAULT_ARCHIVE_STATE);
  });
});

describe('Year as sort (IA Step 5)', () => {
  it('defaults to curated and omits the default from the URL', () => {
    expect(parseArchiveState('').sort).toBe('curated');
    expect(archiveQuery(state({ sort: 'curated' }))).toBe('');
  });

  it('restores the two alternates', () => {
    expect(parseArchiveState('sort=newest').sort).toBe('newest');
    expect(parseArchiveState('sort=oldest').sort).toBe('oldest');
  });

  it('falls back to curated for an unknown sort', () => {
    expect(parseArchiveState('sort=random').sort).toBe('curated');
  });
});

describe('Serialization is stable and round-trips', () => {
  it('writes the parameters in the contract order', () => {
    const full = state({
      pillar: 'architecture-design',
      sector: 'residential',
      type: 'design-project',
      discipline: 'interior-design',
      sort: 'newest',
    });
    expect(archiveQuery(full)).toBe(
      'pillar=architecture&sector=residential&type=design-project&discipline=interior-design&sort=newest',
    );
  });

  it('round-trips every state through parse', () => {
    const full = state({
      pillar: 'reality-capture',
      sector: 'heritage',
      type: 'survey-documentation',
      service: 'scanare-laser-3d',
      sort: 'oldest',
    });
    expect(parseArchiveState(archiveQuery(full), AVAILABLE)).toEqual(full);
  });

  it('never serializes a refinement its scope does not expose', () => {
    const impossible = state({ pillar: 'all', discipline: 'architecture', service: 'x' });
    expect(archiveQuery(impossible)).toBe('');
  });

  it('keeps the default archive on a clean path (§12 — filter states are not canonicalized)', () => {
    expect(archiveHref('/proiecte', DEFAULT_ARCHIVE_STATE)).toBe('/proiecte');
    expect(archiveHref('/proiecte', state({ pillar: 'reality-capture' }))).toBe(
      '/proiecte?pillar=reality-capture',
    );
  });
});

describe('Transitions', () => {
  it('keeps the shared filters across a pillar switch (IA Step 5 — "shared")', () => {
    const before = state({
      pillar: 'architecture-design',
      type: 'design-project',
      sector: 'residential',
      discipline: 'interior-design',
    });
    const after = withPillar(before, 'reality-capture');
    expect(after.type).toBe('design-project');
    expect(after.sector).toBe('residential');
  });

  it('drops the refinement that does not exist in the new scope', () => {
    const before = state({ pillar: 'architecture-design', discipline: 'interior-design' });
    expect(withPillar(before, 'reality-capture').discipline).toBeNull();
    expect(withPillar(before, 'all').discipline).toBeNull();
  });

  it('clears filters without clearing the mode or the sort', () => {
    const before = state({
      pillar: 'reality-capture',
      sector: 'heritage',
      service: 'scanare-laser-3d',
      sort: 'newest',
    });
    const after = clearFilters(before);
    expect(after).toEqual(state({ pillar: 'reality-capture', sort: 'newest' }));
    expect(hasActiveFilters(after)).toBe(false);
  });

  it('recognises the untouched default view', () => {
    expect(isDefaultArchiveState(DEFAULT_ARCHIVE_STATE)).toBe(true);
    expect(isDefaultArchiveState(state({ pillar: 'reality-capture' }))).toBe(false);
    expect(isDefaultArchiveState(state({ sort: 'newest' }))).toBe(false);
    expect(isDefaultArchiveState(state({ sector: 'heritage' }))).toBe(false);
  });
});

describe('Matching', () => {
  const facets: ArchiveItemFacets = {
    pillars: ['reality-capture', 'architecture-design'],
    types: ['survey-documentation', 'design-project'],
    sectors: ['heritage'],
    disciplines: ['reality-capture', 'architecture'],
    services: ['scanare-laser-3d'],
  };

  it('matches everything under the default view', () => {
    expect(matchesArchiveState(facets, DEFAULT_ARCHIVE_STATE)).toBe(true);
  });

  it('surfaces a cross-pillar entry in both pillar views (CONTENT_MODEL.md:63)', () => {
    expect(matchesArchiveState(facets, state({ pillar: 'reality-capture' }))).toBe(true);
    expect(matchesArchiveState(facets, state({ pillar: 'architecture-design' }))).toBe(true);
  });

  it('counts a secondary Entry Type, as the Competitions view does', () => {
    expect(matchesArchiveState(facets, state({ type: 'design-project' }))).toBe(true);
  });

  it('intersects the facets — every active one must match', () => {
    const matching = state({ pillar: 'reality-capture', sector: 'heritage', type: 'survey-documentation' });
    expect(matchesArchiveState(facets, matching)).toBe(true);
    expect(matchesArchiveState(facets, { ...matching, sector: 'residential' })).toBe(false);
  });

  it('applies the contextual refinements', () => {
    expect(
      matchesArchiveState(facets, state({ pillar: 'reality-capture', service: 'scanare-laser-3d' })),
    ).toBe(true);
    expect(
      matchesArchiveState(facets, state({ pillar: 'reality-capture', service: 'fotogrametrie' })),
    ).toBe(false);
    expect(
      matchesArchiveState(facets, state({ pillar: 'architecture-design', discipline: 'architecture' })),
    ).toBe(true);
    expect(
      matchesArchiveState(facets, state({ pillar: 'architecture-design', discipline: 'visualization' })),
    ).toBe(false);
  });
});
