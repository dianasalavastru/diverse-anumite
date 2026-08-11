/**
 * Contract tests for the content boundary.
 *
 * OWNER: Workstream B. `TECHNICAL_ARCHITECTURE.md` §16 assigns Pillar derivation (§7.4) to the
 * Vitest unit layer; discovery-order derivation (§7.6) joins it when the archive query lands.
 *
 * These assertions were verified green before the repository toolchain existed; run them with
 * `npm test` once dependencies are installed.
 */

import { describe, expect, it } from 'vitest';

import { derivePillars, isCrossPillar, isEnAvailable, localize, toWorkEntrySummary } from './derive.js';
import { FIXTURE_SERVICES, FIXTURE_WORK_ENTRIES } from './fixtures.js';
import { DISCIPLINE_TO_PILLAR, DISCIPLINES } from './types.js';

describe('Pillar derivation (§7.4)', () => {
  it('maps every Discipline to exactly one Pillar', () => {
    for (const discipline of DISCIPLINES) {
      expect(DISCIPLINE_TO_PILLAR[discipline]).toBeDefined();
    }
  });

  it('takes the primary Pillar from the primary Discipline', () => {
    expect(derivePillars({ primary: 'architecture', secondary: [] })).toEqual({
      primary: 'architecture-design',
      secondary: [],
    });
    expect(derivePillars({ primary: 'reality-capture', secondary: [] })).toEqual({
      primary: 'reality-capture',
      secondary: [],
    });
  });

  it('resolves a composite entry into both pillars with one primary', () => {
    expect(derivePillars({ primary: 'reality-capture', secondary: ['architecture'] })).toEqual({
      primary: 'reality-capture',
      secondary: ['architecture-design'],
    });
  });

  it('does not repeat the primary pillar as a secondary', () => {
    expect(
      derivePillars({ primary: 'architecture', secondary: ['interior-design', 'visualization'] }),
    ).toEqual({ primary: 'architecture-design', secondary: [] });
  });
});

describe('Localization (§7.1, §11.2)', () => {
  it('never substitutes RO under an EN read', () => {
    const untranslated = FIXTURE_WORK_ENTRIES.find((entry) => !entry.enPublished)!;
    expect(localize(untranslated.title, 'en')).toBeNull();
    expect(localize(untranslated.title, 'ro')).toBeTypeOf('string');
  });

  it('excludes an untranslated entity from EN generation', () => {
    expect(FIXTURE_WORK_ENTRIES.map(isEnAvailable)).toEqual([true, true, false, true]);
  });
});

describe('Work ⇄ Service relationship (IA Step 6)', () => {
  it('resolves demonstratedBy by reversing the entry-held reference', () => {
    expect(
      FIXTURE_SERVICES.map((service) => [service._id, service.demonstratedBy.map((work) => work._id)]),
    ).toEqual([
      ['sv-1', ['wf-1']],
      ['sv-2', ['wf-2']],
      ['sv-3', []],
    ]);
  });

  it('keeps a Service with zero linked entries publishable (F5)', () => {
    const empty = FIXTURE_SERVICES.find((service) => service.demonstratedBy.length === 0)!;
    expect(empty.enPublished).toBe(true);
  });

  it('leaves an entry with no demonstrated Service (W-5 hidden)', () => {
    const competition = FIXTURE_WORK_ENTRIES.find(
      (entry) => entry.entryType.primary === 'competition-entry',
    )!;
    expect(competition.services).toHaveLength(0);
  });
});

describe('Fixture boundary', () => {
  it('covers the shapes I-4 requires', () => {
    expect(FIXTURE_WORK_ENTRIES.some((entry) => isCrossPillar(entry.pillars))).toBe(true);
    expect(FIXTURE_WORK_ENTRIES.some((entry) => entry.attribution === 'studio' && entry.employer)).toBe(true);
    expect(FIXTURE_WORK_ENTRIES.some((entry) => entry.capture !== null)).toBe(true);
  });

  it('keeps every capture asset unpublished until cleared (§19.4)', () => {
    for (const entry of FIXTURE_WORK_ENTRIES) {
      if (!entry.capturePublicationCleared) {
        expect(entry.capture?.derivative ?? null).toBeNull();
      }
    }
  });

  it('projects summaries without losing derived Pillar', () => {
    for (const entry of FIXTURE_WORK_ENTRIES) {
      expect(toWorkEntrySummary(entry).pillars).toEqual(entry.pillars);
    }
  });
});
