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

import { isEnAvailable, localize, toWorkEntrySummary } from './derive.js';
import {
  FIXTURE_SERVICES,
  FIXTURE_WORK_ENTRIES,
  FIXTURE_WORK_ENTRY_SUMMARIES,
} from './fixtures.js';
import { PILLARS } from './types.js';

describe('Pillar is authored, exactly one (v3.1 §2, Stage 5)', () => {
  /**
   * STAGE 5 replaces the four Pillar-derivation cases. There is no derivation table left to
   * test, and no composite entry resolving into two pillars — those had no honest v3.1
   * equivalent, so they are replaced by the invariants that took their place.
   */
  it('gives every project exactly one pillar, from the closed vocabulary', () => {
    for (const entry of FIXTURE_WORK_ENTRIES) {
      expect(PILLARS, entry._id).toContain(entry.pillar);
      expect(typeof entry.pillar, entry._id).toBe('string');
    }
  });

  it('exposes no plural pillar shape anywhere on the contract', () => {
    for (const entry of FIXTURE_WORK_ENTRIES) {
      expect(entry, entry._id).not.toHaveProperty('pillars');
      expect(entry, entry._id).not.toHaveProperty('discipline');
    }
    for (const summary of FIXTURE_WORK_ENTRY_SUMMARIES) {
      expect(summary, summary._id).not.toHaveProperty('pillars');
      expect(summary, summary._id).not.toHaveProperty('discipline');
    }
  });

  it('covers both pillars, so neither branch of the archive is untested', () => {
    const pillars = new Set(FIXTURE_WORK_ENTRIES.map((entry) => entry.pillar));
    expect(pillars).toEqual(new Set(['architecture-design', 'reality-capture']));
  });

  it('models work spanning both capabilities as two LINKED projects', () => {
    /* The replacement for the retired cross-pillar composite: wf-1 (A&D) and wf-2 (RC) are one
       real engagement split into two projects that reference each other. */
    const ad = FIXTURE_WORK_ENTRIES.find((entry) => entry._id === 'wf-1');
    const rc = FIXTURE_WORK_ENTRIES.find((entry) => entry._id === 'wf-2');

    expect(ad?.pillar).toBe('architecture-design');
    expect(rc?.pillar).toBe('reality-capture');
    expect(ad?.relatedWork.map((related) => related._id)).toContain('wf-2');
    expect(rc?.relatedWork.map((related) => related._id)).toContain('wf-1');
  });
});

describe('Localization (§7.1, §11.2)', () => {
  it('never substitutes RO under an EN read', () => {
    const untranslated = FIXTURE_WORK_ENTRIES.find((entry) => !entry.enPublished)!;
    expect(localize(untranslated.title, 'en')).toBeNull();
    expect(localize(untranslated.title, 'ro')).toBeTypeOf('string');
  });

  it('excludes an untranslated entity from EN generation', () => {
    // Identified by its EN gate rather than by position, so adding fixture coverage does not
    // rewrite the assertion (wf-5 joined the set at I-3).
    const excluded = FIXTURE_WORK_ENTRIES.filter((entry) => !isEnAvailable(entry));
    expect(excluded.map((entry) => entry._id)).toEqual(['wf-3']);
    expect(FIXTURE_WORK_ENTRIES.filter(isEnAvailable).length).toBeGreaterThan(0);
  });
});

describe('Work ⇄ Service relationship (IA Step 6)', () => {
  it('resolves demonstratedBy by reversing the entry-held reference', () => {
    expect(
      FIXTURE_SERVICES.map((service) => [service._id, service.demonstratedBy.map((work) => work._id)]),
    ).toEqual([
      ['sv-1', ['wf-1', 'wf-4']],
      ['sv-2', ['wf-2', 'wf-5']],
      ['sv-3', []],
      ['sv-4', ['wf-1']],
      ['sv-5', ['wf-3', 'wf-4']],
      ['sv-6', ['wf-5']],
    ]);
  });

  it('keeps a Service with zero linked entries publishable (F5)', () => {
    const empty = FIXTURE_SERVICES.find((service) => service.demonstratedBy.length === 0)!;
    expect(empty.enPublished).toBe(true);
  });

  it('gives every entry at least one demonstrated Service (v3.1 §2, Stage 8)', () => {
    /* The inverse of what this case used to assert. Services are no longer an optional
       relationship an entry may decline — they are the axis that activates the entry's own
       fields, so an entry without one has no resolvable contract at all. */
    expect(FIXTURE_WORK_ENTRIES.every((entry) => entry.services.length > 0)).toBe(true);
  });

  it('keeps every demonstrated Service inside the entry\'s own Pillar (v3.1 §2)', () => {
    for (const entry of FIXTURE_WORK_ENTRIES) {
      for (const service of entry.services) {
        expect(service.pillar).toBe(entry.pillar);
      }
    }
  });
});

describe('Fixture boundary', () => {
  it('covers the shapes I-4 requires', () => {
    /* STAGE 5: "one entry in both pillars" is not a shape any more. I-4's cross-pillar coverage
       becomes the linked pair — one project per pillar, referencing each other. */
    expect(FIXTURE_WORK_ENTRIES.some((entry) => entry.pillar === 'architecture-design')).toBe(true);
    expect(FIXTURE_WORK_ENTRIES.some((entry) => entry.pillar === 'reality-capture')).toBe(true);
    expect(
      FIXTURE_WORK_ENTRIES.some((entry) => entry.relatedWork.length > 0),
      'a linked pair must exist',
    ).toBe(true);
    /* STAGE 2 removed the Employer shape; STAGE 3 removes Attribution itself. Neither is
       replaced (v3.1 §12), so the crediting shape I-4 needs is now simply "an entry that has
       Collaborators and one that does not" — which is what W-3's conditional rendering turns on. */
    expect(FIXTURE_WORK_ENTRIES.some((entry) => entry.metadata.collaborators.length > 0)).toBe(true);
    expect(FIXTURE_WORK_ENTRIES.some((entry) => entry.metadata.collaborators.length === 0)).toBe(true);
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
      expect(toWorkEntrySummary(entry).pillar).toEqual(entry.pillar);
    }
  });
});
