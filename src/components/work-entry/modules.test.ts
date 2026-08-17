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
 *   wf-3  Team but no Collaborators; EN untranslated
 *   wf-4  competition + diploma project — two demonstrated A&D Services
 *   wf-5  pure Reality Capture — capture cleared, derivative + poster + point count
 */

import { describe, expect, it } from 'vitest';

import { FIXTURE_WORK_ENTRIES } from '../../lib/content/fixtures';
import { createFixtureContentSource } from '../../lib/content/fixtures';
import { isCompetition } from '../../lib/content';
import type { WorkEntry } from '../../lib/content';
import {
  awardsAndTeamInCompetition,
  deliverablesInCapture,
  hasCaptureEvidence,
  hasCompetitionEvidence,
  hasCredits,
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
    expect(modules).toContain('onward');
    /* STAGE 3: Credits is conditional now — wf-1 has no Collaborators, so W-3 is absent.
       The presence case is `renders Credits when the entry has Collaborators` below. */
    expect(modules).not.toContain('credits');
    // W-5 present: wf-1 demonstrates sv-1.
    expect(modules).toContain('services');
    // W-6 present: wf-1 is related to wf-2 (the linked pair).
    expect(modules).toContain('related');
    // No W-4 layer at all — the base is unchanged (Page IA M3).
    expect(modules).not.toContain('competition');
    expect(modules).not.toContain('capture');
  });

  it('still hides W-5 for an entry with no demonstrated Service', () => {
    /* STAGE 8. Under v3.1 a Project must carry at least one Service (§2), so no
       fixture can exercise this any more — the first assertion below states that
       new contract. The W-5 absence rule is nevertheless kept in `modules.ts`:
       it is the presentation layer's own defence, and weakening it because the
       content contract now makes the case unreachable would leave the renderer
       trusting an invariant it does not itself enforce. It is exercised here
       against a hand-built entry, which is the only way to reach it. */
    expect(FIXTURE_WORK_ENTRIES.every((candidate) => candidate.services.length > 0)).toBe(true);

    const entry: WorkEntry = { ...fixture('wf-4'), services: [] };
    const { modules } = workEntryComposition(entry, 'ro');
    // The one explicit absence rule in the corpus (wireframe W-5).
    expect(modules).not.toContain('services');
    expect(modules).toContain('competition');
  });

  it('answers "is this a competition" from ONE rule, shared with the curated view', () => {
    /* `isCompetitionEntry` must not restate the predicate — the curated view, the Studio pane
       and this module have to agree, and the only way to guarantee that is one implementation.
       Asserted behaviourally: the two functions agree on every fixture, including the
       dual-labelled one. */
    for (const entry of FIXTURE_WORK_ENTRIES) {
      expect(isCompetitionEntry(entry), entry._id).toBe(isCompetition(entry));
      expect(isCompetitionEntry(entry), entry._id).toBe(entry.labels.includes('competition'));
    }
  });

  it('toggles for a dual-labelled project exactly as for a competition-only one', () => {
    const dual = FIXTURE_WORK_ENTRIES.find((entry) => entry.labels.length === 2);
    const only = FIXTURE_WORK_ENTRIES.find(
      (entry) => entry.labels.length === 1 && entry.labels.includes('competition'),
    );
    expect(dual, 'a fixture must carry both labels').toBeDefined();
    expect(only, 'a fixture must carry competition alone').toBeDefined();

    expect(isCompetitionEntry(dual as WorkEntry)).toBe(true);
    expect(isCompetitionEntry(only as WorkEntry)).toBe(true);
  });

  it('does not treat `diploma-project` alone as a competition', () => {
    const diplomaOnly = FIXTURE_WORK_ENTRIES.find(
      (entry) => entry.labels.length === 1 && entry.labels.includes('diploma-project'),
    );
    expect(diplomaOnly, 'a fixture must carry diploma-project alone').toBeDefined();
    expect(isCompetitionEntry(diplomaOnly as WorkEntry)).toBe(false);
  });

  it('the competition module toggles on the competition Label and on having outcome evidence', () => {
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

  it('a linked Reality Capture entry keeps one canonical page and enables its type module', () => {
    const entry = fixture('wf-2');

    /* STAGE 5: wf-2 is Reality Capture and nothing else. The composite it used to be is now the
       wf-1 ⇄ wf-2 linked pair, asserted in `content.test.ts`. */
    expect(entry.pillar).toBe('reality-capture');
    expect(entry).not.toHaveProperty('pillars');

    const { modules } = workEntryComposition(entry, 'ro');
    expect(modules).toContain('capture');
    // …and it cross-references its linked pair through W-6 (wireframe §"Cross-pillar").
    expect(modules).toContain('related');
    expect(entry.relatedWork.map((related) => related._id)).toContain('wf-1');
  });

  /**
   * STAGE 3 replaces the old "Attribution + Role + Authorship are three separate fields" case.
   *
   * All four credit axes are retired (`CONTENT_MODEL.md` v3.1 §12) and **nothing replaces
   * them** — so what is asserted now is the absence contract on the normalized entry, plus the
   * one crediting field the model keeps.
   */
  it('exposes no retired credit axis on a normalized entry', () => {
    for (const entry of FIXTURE_WORK_ENTRIES) {
      expect(entry, `${entry._id}`).not.toHaveProperty('attribution');
      expect(entry, `${entry._id}`).not.toHaveProperty('commissioning');
      expect(entry, `${entry._id}`).not.toHaveProperty('roles');
      expect(entry, `${entry._id}`).not.toHaveProperty('authorship');
      // Stage 2's retirement must stay retired.
      expect(entry, `${entry._id}`).not.toHaveProperty('employer');
    }
  });

  it('renders Credits when the entry has Collaborators, and omits it when it does not', () => {
    const withCollaborators = FIXTURE_WORK_ENTRIES.filter(
      (entry) => entry.metadata.collaborators.length > 0,
    );
    const without = FIXTURE_WORK_ENTRIES.filter(
      (entry) => entry.metadata.collaborators.length === 0,
    );

    expect(withCollaborators.length, 'a fixture must exercise the present case').toBeGreaterThan(0);
    expect(without.length, 'a fixture must exercise the absent case').toBeGreaterThan(0);

    for (const entry of withCollaborators) {
      expect(hasCredits(entry)).toBe(true);
      expect(workEntryComposition(entry, 'ro').modules, entry._id).toContain('credits');
    }
    /* The W-5 rule applied to W-3: no empty module, no placeholder heading. */
    for (const entry of without) {
      expect(hasCredits(entry)).toBe(false);
      expect(workEntryComposition(entry, 'ro').modules, entry._id).not.toContain('credits');
    }
  });

  it('does not count Team as Credits content — Team renders elsewhere', () => {
    /* wf-3 has a Team and no Collaborators. Counting Team here would render an empty Credits
       block, because Team is claimed by Project Metadata or the competition module. */
    const entry = fixture('wf-3');
    expect(entry.metadata.team.length).toBeGreaterThan(0);
    expect(entry.metadata.collaborators).toHaveLength(0);
    expect(hasCredits(entry)).toBe(false);
  });

  it('the unconditional modules stay unconditional on every fixture', () => {
    for (const entry of FIXTURE_WORK_ENTRIES) {
      const { modules } = workEntryComposition(entry, 'ro');
      /* STAGE 3: `credits` left this list. Page IA W-3's "always present" held while
         Attribution was mandatory and guaranteed a row; with all four credit axes retired the
         block can genuinely have nothing to say, and W-5's no-empty-module rule governs. */
      expect(modules).toContain('onward');
      expect(modules).toContain('hero');
      expect(modules).toContain('facts');
    }
  });

  it('numbers stations contiguously even when Credits is absent', () => {
    /* The regression this suite exists to catch: a conditional module must not leave a hole in
       the coordinate rail. */
    for (const entry of FIXTURE_WORK_ENTRIES) {
      const { modules, stations, footerStation } = workEntryComposition(entry, 'ro');
      expect(modules.map((key) => stations[key])).toEqual(
        modules.map((_key, index) => index + 1),
      );
      expect(footerStation).toBe(modules.length + 1);
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
    /* wf-4 is the fixture that carries Collaborators *and* a type module, so it is the one
       entry where the relative order of W-3 and W-4 is still observable after Stage 3 made
       Credits conditional. */
    const { modules } = workEntryComposition(fixture('wf-4'), 'ro');
    expect(modules).toContain('credits');
    expect(modules.indexOf('credits')).toBeLessThan(modules.indexOf('competition'));
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
    /* Re-keyed at Stage 3: `authorship` is retired, so the untranslated-field assertion uses
       another localized field authored RO-only on the same fixture. The rule is unchanged —
       an absent EN value stays null and is never filled from RO. */
    expect(entry.metadata.location?.ro).toBeTruthy();
    expect(entry.metadata.location?.en).toBeNull();
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
    // wf-1 and wf-4 share the Architecture & Design pillar and would be
    // "related" under any taxonomy heuristic. Only the authored link is used.
    expect(entry.relatedWork.map((related) => related._id)).toEqual(['wf-2']);
  });

  it('hides the module entirely when nothing is linked', () => {
    const entry = fixture('wf-3');
    expect(entry.relatedWork).toHaveLength(0);
    expect(workEntryComposition(entry, 'ro').modules).not.toContain('related');
  });
});
