/**
 * Work Entry composition — the module toggles, the station sequence, and the
 * field-placement rules.
 *
 * These run against **Workstream B's fixture set**, not against hand-built
 * objects, and that is the point of §23.4's I-3 mitigation: fixtures pass
 * through the same normalizers, the same Pillar derivation, the same §19.4
 * capture gate and the same locale scoping as the real query layer, so a case
 * that passes here cannot be a case the CMS could not produce.
 *
 * The fixture set covers the cases the Work Entry has to get right:
 *   wf-1  normal A&D — independent, demonstrates a Service, related to wf-2
 *   wf-2  cross-pillar composite — RC primary + A&D secondary, capture NOT cleared
 *   wf-3  Studio-attributed — Employer + Role + Authorship; EN untranslated
 *   wf-4  competition — no demonstrated Service (W-5 must hide)
 *   wf-5  pure Reality Capture — capture cleared, derivative + poster + point count
 */

import { describe, expect, it } from 'vitest';

import { FIXTURE_WORK_ENTRIES } from '../../lib/content/fixtures';
import { createFixtureContentSource } from '../../lib/content/fixtures';
import type { WorkEntry } from '../../lib/content';
import {
  awardsAndTeamInCompetition,
  deliverablesInCapture,
  hasCaptureEvidence,
  hasCompetitionEvidence,
  isCompetitionEntry,
  workEntryComposition,
} from './modules';
import { mountableDerivative } from '../homepage/highlights';

function fixture(id: string): WorkEntry {
  const entry = FIXTURE_WORK_ENTRIES.find((candidate) => candidate._id === id);
  if (!entry) throw new Error(`fixture ${id} is missing`);
  return entry;
}

describe('module toggles', () => {
  it('a normal A&D entry renders the base modules and no type module', () => {
    const { modules } = workEntryComposition(fixture('wf-1'), 'ro');

    expect(modules).toContain('hero');
    expect(modules).toContain('facts');
    expect(modules).toContain('credits');
    expect(modules).toContain('onward');
    // W-5 present: wf-1 demonstrates sv-1.
    expect(modules).toContain('services');
    // W-6 present: wf-1 is related to wf-2 (the linked pair).
    expect(modules).toContain('related');
    // No W-4 layer at all — the base is unchanged (Page IA M3).
    expect(modules).not.toContain('competition');
    expect(modules).not.toContain('capture');
  });

  it('a competition entry with no demonstrated Service hides W-5', () => {
    const entry = fixture('wf-4');
    expect(entry.services).toHaveLength(0);

    const { modules } = workEntryComposition(entry, 'ro');
    // The one explicit absence rule in the corpus (wireframe W-5).
    expect(modules).not.toContain('services');
    expect(modules).toContain('competition');
  });

  it('the competition module toggles on Entry Type and on having outcome evidence', () => {
    const competition = fixture('wf-4');
    expect(isCompetitionEntry(competition)).toBe(true);
    expect(hasCompetitionEvidence(competition, 'ro')).toBe(true);

    const design = fixture('wf-1');
    expect(isCompetitionEntry(design)).toBe(false);
    expect(workEntryComposition(design, 'ro').modules).not.toContain('competition');
  });

  it('a pure Reality Capture entry renders the capture module', () => {
    const entry = fixture('wf-5');
    expect(hasCaptureEvidence(entry)).toBe(true);
    expect(workEntryComposition(entry, 'ro').modules).toContain('capture');
  });

  it('a cross-pillar entry keeps one canonical page and enables its type module', () => {
    const entry = fixture('wf-2');

    // CONTENT_MODEL.md:63 — one entry resolving into both pillars, one primary.
    expect(entry.pillars.primary).toBe('reality-capture');
    expect(entry.pillars.secondary).toContain('architecture-design');

    const { modules } = workEntryComposition(entry, 'ro');
    expect(modules).toContain('capture');
    // …and it cross-references its linked pair through W-6 (wireframe §"Cross-pillar").
    expect(modules).toContain('related');
    expect(entry.relatedWork.map((related) => related._id)).toContain('wf-1');
  });

  it('a Studio-attributed entry carries Employer, Role and Authorship as three fields', () => {
    const entry = fixture('wf-3');

    // CONTENT_MODEL.md:60 — the three-way split, none of them derived from
    // another, and all three present on the entry the Credits block renders.
    expect(entry.attribution).toBe('studio');
    expect(entry.employer?.name).toBeTruthy();
    expect(entry.roles?.ro?.length).toBeGreaterThan(0);
    expect(entry.authorship?.ro).toBeTruthy();

    expect(workEntryComposition(entry, 'ro').modules).toContain('credits');
  });

  it('credits and the onward module are unconditional on every fixture', () => {
    for (const entry of FIXTURE_WORK_ENTRIES) {
      const { modules } = workEntryComposition(entry, 'ro');
      // Page IA W-3: "always present, regardless of Entry Type."
      expect(modules).toContain('credits');
      expect(modules).toContain('onward');
      expect(modules).toContain('hero');
      expect(modules).toContain('facts');
    }
  });
});

describe('station sequence', () => {
  it('numbers rendered modules contiguously from 1, with the footer last', () => {
    for (const entry of FIXTURE_WORK_ENTRIES) {
      const { modules, stations, footerStation } = workEntryComposition(entry, 'ro');

      const numbers = modules.map((key) => stations[key]);
      expect(numbers).toEqual(modules.map((_, index) => index + 1));
      expect(footerStation).toBe(modules.length + 1);
    }
  });

  it('gives an absent module no station, so the rail cannot point at nothing', () => {
    const { stations } = workEntryComposition(fixture('wf-1'), 'ro');
    expect(stations.capture).toBeUndefined();
    expect(stations.competition).toBeUndefined();
  });

  it('places Credits before the type module, per the wireframe reading order', () => {
    const { modules } = workEntryComposition(fixture('wf-5'), 'ro');
    expect(modules.indexOf('credits')).toBeLessThan(modules.indexOf('capture'));
    // …and the evidence before the credits.
    expect(modules.indexOf('evidence')).toBeLessThan(modules.indexOf('credits'));
  });
});

describe('field placement — each field renders exactly once', () => {
  it('routes Awards and Team to the competition module when it renders', () => {
    expect(awardsAndTeamInCompetition(fixture('wf-4'), 'ro')).toBe(true);
    // wf-3 has a Team but is not a competition, so Project Metadata carries it.
    expect(fixture('wf-3').metadata.team.length).toBeGreaterThan(0);
    expect(awardsAndTeamInCompetition(fixture('wf-3'), 'ro')).toBe(false);
  });

  it('routes Deliverables to the capture module when it renders', () => {
    // wf-5 has both capture metadata and deliverables.
    expect(deliverablesInCapture(fixture('wf-5'))).toBe(true);
    // wf-1 has no capture metadata, so Project Metadata carries any deliverables.
    expect(deliverablesInCapture(fixture('wf-1'))).toBe(false);
  });
});

describe('capture publication gate (§19.4)', () => {
  it('withholds an uncleared derivative while still showing the specifications', () => {
    const entry = fixture('wf-2');

    expect(entry.capturePublicationCleared).toBe(false);
    // The query layer already dropped the derivative; nothing on the page can
    // reach around it.
    expect(entry.capture?.derivative).toBeNull();
    expect(mountableDerivative(entry)).toBeNull();

    // …and the module still renders, because accuracy and equipment are claims
    // about the survey, not the survey itself.
    expect(workEntryComposition(entry, 'ro').modules).toContain('capture');
  });

  it('publishes a cleared derivative with its poster fallback', () => {
    const entry = fixture('wf-5');

    expect(entry.capturePublicationCleared).toBe(true);
    const derivative = mountableDerivative(entry);
    expect(derivative).not.toBeNull();
    expect(derivative?.assetUrl).toBeTruthy();
    // §10.2 / §14.0 — the viewer degrades to a static poster.
    expect(derivative?.poster).toBeTruthy();
  });

  it('never computes a point count (§10.4)', () => {
    // Declared on the cleared entry, absent on the uncleared one — and absent
    // means absent, never an estimate derived from the asset.
    expect(fixture('wf-5').capture?.pointCount).toBe(1_250_000);
    expect(fixture('wf-2').capture?.pointCount).toBeNull();
  });
});

describe('locale scoping (§11.2)', () => {
  it('generates no EN page for an untranslated entry', async () => {
    const source = createFixtureContentSource();

    const ro = await source.workEntries('ro');
    const en = await source.workEntries('en');

    expect(ro.map((entry) => entry._id)).toContain('wf-3');
    // wf-3 is `enPublished: false` — no EN page, so /en/<slug> is a clean 404.
    expect(en.map((entry) => entry._id)).not.toContain('wf-3');
  });

  it('never resolves an EN slug for an untranslated entry', async () => {
    const source = createFixtureContentSource();
    // Rule 2: RO content is never served under an EN URL. Looking the RO slug up
    // in the EN locale must not find it.
    expect(await source.workEntry('proiect-de-birou-fixture', 'en')).toBeNull();
    expect(await source.workEntry('proiect-de-birou-fixture', 'ro')).not.toBeNull();
  });

  it('omits an EN-untranslated field rather than falling back to Romanian', () => {
    const entry = fixture('wf-3');
    // The gate is decidable from the slug alone, which is what BaseLayout reads
    // to disable the switcher and emit no hreflang pair (rules 4 and 5).
    expect(entry.slug.en).toBeNull();
    expect(entry.title.en).toBeNull();
    expect(entry.authorship?.en).toBeNull();
  });

  it('hides W-4 competition evidence that exists only in Romanian', () => {
    const entry = fixture('wf-4');
    // wf-4 authors awards in both locales, so both render. The rule under test
    // is that the toggle is locale-aware at all.
    expect(hasCompetitionEvidence(entry, 'ro')).toBe(true);
    expect(hasCompetitionEvidence(entry, 'en')).toBe(true);

    const roOnly: WorkEntry = {
      ...entry,
      metadata: { ...entry.metadata, awards: { ro: ['Mentiune'], en: null }, team: [] },
    };
    expect(hasCompetitionEvidence(roOnly, 'ro')).toBe(true);
    expect(hasCompetitionEvidence(roOnly, 'en')).toBe(false);
    expect(workEntryComposition(roOnly, 'en').modules).not.toContain('competition');
  });
});

describe('related work is authored, never inferred', () => {
  it('renders only canonical references', () => {
    const entry = fixture('wf-1');
    // wf-1 and wf-4 share the `architecture` primary Discipline and would be
    // "related" under any taxonomy heuristic. Only the authored link is used.
    expect(entry.relatedWork.map((related) => related._id)).toEqual(['wf-2']);
  });

  it('hides the module entirely when nothing is linked', () => {
    const entry = fixture('wf-3');
    expect(entry.relatedWork).toHaveLength(0);
    expect(workEntryComposition(entry, 'ro').modules).not.toContain('related');
  });
});
