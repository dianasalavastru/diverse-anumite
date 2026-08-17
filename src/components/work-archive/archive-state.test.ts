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
  hasActiveFilters,
  isDefaultArchiveState,
  matchesArchiveState,
  parseArchiveState,
  parseFacetList,
  pillarFromToken,
  servicesInScope,
  withPillar,
  type ArchiveFacetValues,
  type ArchiveItemFacets,
  type ArchiveState,
} from './archive-state.js';
import { SERVICE_KEYS } from '../../lib/content';

const AVAILABLE: ArchiveFacetValues = {
  labels: ['competition', 'diploma-project'],
  sectors: ['rezidential', 'cultural-patrimoniu', 'industrial-logistic'],
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
      'label',
      
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

describe('Contextual refinement — Service under every mode, scoped by Pillar', () => {
  /* The refinement was Reality-Capture-only from Stage 5, while Service was mid-migration. The
     contract completed at Stage 8 and the archive taxonomy was restated on 2026-08-17
     (`DECISIONS_LOG.md` #101): every mode offers Services, narrowed to the ones it owns. */

  it('offers the whole demonstrated set under All', () => {
    expect([...servicesInScope(AVAILABLE.services, 'all')]).toEqual([...AVAILABLE.services]);
  });

  it('offers only its own Pillar\'s Services under a Pillar mode', () => {
    expect([...servicesInScope(AVAILABLE.services, 'architecture-design')]).toEqual([
      'proiectare-arhitectura',
    ]);
    expect([...servicesInScope(AVAILABLE.services, 'reality-capture')]).toEqual([
      'scanare-laser-3d',
    ]);
  });

  it('never leaks a Service across the Pillar boundary', () => {
    expect(servicesInScope(AVAILABLE.services, 'architecture-design')).not.toContain(
      'scanare-laser-3d',
    );
    expect(servicesInScope(AVAILABLE.services, 'reality-capture')).not.toContain(
      'proiectare-arhitectura',
    );
  });

  it('ignores the retired Discipline parameter — no alias, no translation (Stage 5)', () => {
    /* `?discipline=` named an axis the model no longer has. It is not aliased onto Pillar: an
       old link falls through the unknown-parameter path to the unfiltered archive. */
    expect(parseArchiveState('discipline=interior-design', AVAILABLE)).toEqual(
      DEFAULT_ARCHIVE_STATE,
    );
    expect(
      parseArchiveState('pillar=architecture&discipline=interior-design', AVAILABLE),
    ).toEqual({ ...DEFAULT_ARCHIVE_STATE, pillar: 'architecture-design' });
    expect(archiveQuery(parseArchiveState('discipline=architecture', AVAILABLE))).toBe('');
  });

  it('restores a Service under All, from either Pillar', () => {
    expect(parseArchiveState('service=scanare-laser-3d', AVAILABLE).service).toBe(
      'scanare-laser-3d',
    );
    expect(parseArchiveState('service=proiectare-arhitectura', AVAILABLE).service).toBe(
      'proiectare-arhitectura',
    );
  });

  it('restores a Service under the Pillar that owns it', () => {
    expect(
      parseArchiveState('pillar=reality-capture&service=scanare-laser-3d', AVAILABLE).service,
    ).toBe('scanare-laser-3d');
    expect(
      parseArchiveState('pillar=architecture&service=proiectare-arhitectura', AVAILABLE).service,
    ).toBe('proiectare-arhitectura');
  });

  it('drops a Service the active Pillar does not own', () => {
    /* A control the mode does not render cannot express the value, so the state must not hold
       it — otherwise the archive filters on something invisible. */
    expect(
      parseArchiveState('pillar=architecture&service=scanare-laser-3d', AVAILABLE).service,
    ).toBeNull();
    expect(
      parseArchiveState('pillar=reality-capture&service=proiectare-arhitectura', AVAILABLE).service,
    ).toBeNull();
  });
});

describe('Service identity is the immutable key, never a slug (v3.1 §14.3)', () => {
  it('round-trips every canonical key under All', () => {
    for (const key of SERVICE_KEYS) {
      const available: ArchiveFacetValues = { ...AVAILABLE, services: [...SERVICE_KEYS] };
      const parsed = parseArchiveState(`service=${key}`, available);
      expect(parsed.service, key).toBe(key);
      expect(archiveQuery(parsed), key).toBe(`service=${key}`);
    }
  });

  it('ignores a legacy slug-valued ?service= with no alias and no translation', () => {
    /*
     * The archive filtered on the localized Service slug until 2026-08-17. Those links are NOT
     * redirected onto the key they used to mean: the same rule `?discipline=` and `?type=` get.
     * A slug is a per-locale editable string, so translating one back would require a lookup
     * that could disagree with itself across locales and across renames.
     */
    for (const legacy of ['test-scanare-3d', 'scanare-3d', '3d-scanning', 'test-proiectare-arhitectura']) {
      expect(parseArchiveState(`service=${legacy}`, AVAILABLE), legacy).toEqual(
        DEFAULT_ARCHIVE_STATE,
      );
      expect(archiveQuery(parseArchiveState(`service=${legacy}`, AVAILABLE)), legacy).toBe('');
    }
  });

  it('carries no slug or name anywhere in the state', () => {
    /* Asserted structurally: the only Service value the state can hold is typed `ServiceKey`,
       so a slug cannot be assigned to it. This case pins that a canonical key and a slug are
       different strings, which is what makes the rename-safety claim meaningful. */
    const parsed = parseArchiveState('pillar=reality-capture&service=scanare-laser-3d', AVAILABLE);
    expect(parsed.service).toBe('scanare-laser-3d');
    expect(parsed.service).not.toBe('test-scanare-3d');
  });
});

describe('Forward-compatible comma-separated encoding (§23.5)', () => {
  it('parses a facet as a list', () => {
    expect(parseFacetList('cultural-patrimoniu,industrial-logistic')).toEqual([
      'cultural-patrimoniu',
      'industrial-logistic',
    ]);
    expect(parseFacetList(' cultural-patrimoniu , , industrial-logistic ')).toEqual([
      'cultural-patrimoniu',
      'industrial-logistic',
    ]);
    expect(parseFacetList(null)).toEqual([]);
    expect(parseFacetList('')).toEqual([]);
  });

  it('applies the single-select launch bound — the first available value wins', () => {
    expect(
      parseArchiveState('sector=cultural-patrimoniu,industrial-logistic', AVAILABLE).sector,
    ).toBe('cultural-patrimoniu');
  });

  it('skips leading values the archive does not have, rather than the whole list', () => {
    // An already-shared multi-value URL keeps working when one value disappears.
    expect(parseArchiveState('sector=landscape,cultural-patrimoniu', AVAILABLE).sector).toBe(
      'cultural-patrimoniu',
    );
  });

  it('serializes single-select as a one-value list — the same string', () => {
    expect(archiveQuery(state({ sector: 'cultural-patrimoniu' }))).toBe('sector=cultural-patrimoniu');
  });
});

describe('Validation against the rendered set', () => {
  it('ignores a value no entry carries', () => {
    expect(parseArchiveState('label=nonsense', AVAILABLE).label).toBeNull();
  });

  it('ignores the retired Entry Type parameter — no alias, no translation (Stage 4)', () => {
    /* `?type=` was the Entry Type token. Entry Type is retired (v3.1 §12) and the Label filter
       took its own token rather than inheriting one whose values no longer exist, so an old
       shared link resolves to the unfiltered archive instead of an error. */
    expect(parseArchiveState('type=competition-entry', AVAILABLE)).toEqual(DEFAULT_ARCHIVE_STATE);
    expect(parseArchiveState('type=design-project', AVAILABLE)).toEqual(DEFAULT_ARCHIVE_STATE);
    expect(archiveQuery(parseArchiveState('type=competition-entry', AVAILABLE))).toBe('');
  });

  it('ignores parameters that are not public filters', () => {
    /* Year is a sort; Status and Attribution are never public filters (§23.5, F2). The
       `status` value here is deliberately a RETIRED one (Stage 7): an old shared URL must be
       ignored for the parameter's own sake, not because its value happens to be recognised. */
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
      pillar: 'reality-capture',
      sector: 'rezidential',
      label: 'competition',
      service: 'scanare-laser-3d',
      sort: 'newest',
    });
    expect(archiveQuery(full)).toBe(
      'pillar=reality-capture&sector=rezidential&label=competition&service=scanare-laser-3d&sort=newest',
    );
  });

  it('round-trips every state through parse', () => {
    const full = state({
      pillar: 'reality-capture',
      sector: 'cultural-patrimoniu',
      label: 'diploma-project',
      service: 'scanare-laser-3d',
      sort: 'oldest',
    });
    expect(parseArchiveState(archiveQuery(full), AVAILABLE)).toEqual(full);
  });

  it('serializes the Service refinement under every mode', () => {
    /* It used to be gated: under All the parameter was dropped because All had no control.
       Every mode has one now, so the only thing that removes a key is `withPillar` deciding the
       destination cannot express it. */
    expect(archiveQuery(state({ pillar: 'all', service: 'scanare-laser-3d' }))).toBe(
      'service=scanare-laser-3d',
    );
    expect(archiveQuery(state({ pillar: 'architecture-design', service: 'proiectare-arhitectura' }))).toBe(
      'pillar=architecture&service=proiectare-arhitectura',
    );
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
      label: 'competition',
      sector: 'rezidential',
    });
    const after = withPillar(before, 'reality-capture');
    /* Labels are GLOBAL (v3.1 §10) — they belong to no Pillar, so switching scope keeps them
       exactly as it keeps Sector. */
    expect(after.label).toBe('competition');
    expect(after.sector).toBe('rezidential');
  });

  it('drops a Service the destination Pillar does not own', () => {
    const rc = state({ pillar: 'reality-capture', service: 'scanare-laser-3d' });
    const ad = state({ pillar: 'architecture-design', service: 'proiectare-arhitectura' });
    expect(withPillar(rc, 'architecture-design').service).toBeNull();
    expect(withPillar(ad, 'reality-capture').service).toBeNull();
  });

  it('KEEPS a Service that the destination can still express', () => {
    /*
     * The rule that changed on 2026-08-17. While only Reality Capture had a Service control,
     * every switch landed somewhere with no control and clearing was the only coherent answer.
     * Now widening from a Pillar to All means "the same work, plus everything else" — throwing
     * the selection away would answer a question the visitor did not ask.
     */
    const ad = state({ pillar: 'architecture-design', service: 'proiectare-arhitectura' });
    expect(withPillar(ad, 'all').service).toBe('proiectare-arhitectura');

    const rc = state({ pillar: 'reality-capture', service: 'scanare-laser-3d' });
    expect(withPillar(rc, 'all').service).toBe('scanare-laser-3d');

    // All → the Pillar that owns the selection.
    const all = state({ pillar: 'all', service: 'scanare-laser-3d' });
    expect(withPillar(all, 'reality-capture').service).toBe('scanare-laser-3d');
    // All → the other Pillar.
    expect(withPillar(all, 'architecture-design').service).toBeNull();
  });

  it('keeps the global filters through every Service transition', () => {
    /* Sector is global and governed, reaffirmed 2026-08-17 — it survives a switch exactly as
       Label does, whatever happens to the contextual Service. */
    const before = state({
      pillar: 'architecture-design',
      service: 'proiectare-arhitectura',
      label: 'diploma-project',
      sector: 'cultural-patrimoniu',
    });
    for (const destination of ['all', 'reality-capture', 'architecture-design'] as const) {
      const after = withPillar(before, destination);
      expect(after.label, destination).toBe('diploma-project');
      expect(after.sector, destination).toBe('cultural-patrimoniu');
    }
  });

  it('clears filters without clearing the mode or the sort', () => {
    const before = state({
      pillar: 'reality-capture',
      sector: 'cultural-patrimoniu',
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
    expect(isDefaultArchiveState(state({ sector: 'cultural-patrimoniu' }))).toBe(false);
  });
});

describe('Matching', () => {
  const facets: ArchiveItemFacets = {
    pillars: ['reality-capture', 'architecture-design'],
    /* A project carrying BOTH labels — the case that proves membership is `includes`, not
       equality against the array (v3.1 §10). */
    labels: ['competition', 'diploma-project'],
    sectors: ['cultural-patrimoniu'],
    services: ['scanare-laser-3d'],
  };

  it('matches everything under the default view', () => {
    expect(matchesArchiveState(facets, DEFAULT_ARCHIVE_STATE)).toBe(true);
  });

  it('surfaces a cross-pillar entry in both pillar views (CONTENT_MODEL.md:63)', () => {
    expect(matchesArchiveState(facets, state({ pillar: 'reality-capture' }))).toBe(true);
    expect(matchesArchiveState(facets, state({ pillar: 'architecture-design' }))).toBe(true);
  });

  it('matches a dual-labelled project on EITHER label, exactly once each', () => {
    /* One project, both filters — and neither filter can be satisfied by the other's label. */
    expect(matchesArchiveState(facets, state({ label: 'competition' }))).toBe(true);
    expect(matchesArchiveState(facets, state({ label: 'diploma-project' }))).toBe(true);

    const singleLabel: ArchiveItemFacets = { ...facets, labels: ['diploma-project'] };
    expect(matchesArchiveState(singleLabel, state({ label: 'competition' }))).toBe(false);
    expect(matchesArchiveState(singleLabel, state({ label: 'diploma-project' }))).toBe(true);
  });

  it('is unaffected by the order the labels were authored in', () => {
    const reversed: ArchiveItemFacets = { ...facets, labels: ['diploma-project', 'competition'] };
    for (const label of ['competition', 'diploma-project'] as const) {
      expect(matchesArchiveState(facets, state({ label }))).toBe(
        matchesArchiveState(reversed, state({ label })),
      );
    }
  });

  it('matches no label filter when the project carries none', () => {
    const unlabelled: ArchiveItemFacets = { ...facets, labels: [] };
    expect(matchesArchiveState(unlabelled, state({ label: 'competition' }))).toBe(false);
    expect(matchesArchiveState(unlabelled, DEFAULT_ARCHIVE_STATE)).toBe(true);
  });

  it('intersects the facets — every active one must match', () => {
    const matching = state({ pillar: 'reality-capture', sector: 'cultural-patrimoniu', label: 'diploma-project' });
    expect(matchesArchiveState(facets, matching)).toBe(true);
    expect(matchesArchiveState(facets, { ...matching, sector: 'rezidential' })).toBe(false);
  });

  it('applies the contextual refinements', () => {
    expect(
      matchesArchiveState(facets, state({ pillar: 'reality-capture', service: 'scanare-laser-3d' })),
    ).toBe(true);
    expect(
      matchesArchiveState(facets, state({ pillar: 'reality-capture', service: 'scan-to-bim' })),
    ).toBe(false);
    /* The same Service matches under All, because matching reads the item's own keys and never
       consults the mode beyond the Pillar check. */
    expect(matchesArchiveState(facets, state({ pillar: 'all', service: 'scanare-laser-3d' }))).toBe(
      true,
    );
  });
});
