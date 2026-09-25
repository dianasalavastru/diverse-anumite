/**
 * Competitions LAUNCH WITHHOLDING — data-driven, and therefore self-reversing.
 *
 * Decision: if `/proiecte/concursuri` would contain no genuine, eligible content, the route and
 * every discovery link to it are withheld. No entry is fabricated and no copy is reworded.
 *
 * One gate: `ContentSource.hasCompetitions(locale)`, built on `isEligibleCompetition` (derive.ts)
 * — published (upstream), locale-available (upstream), `competition`-labelled, NOT illustrative.
 *
 *   (a) zero eligible entries → the page is an empty 404 (Astro writes no file) and no surface
 *       (homepage, archive, header, footer) links to `/proiecte/concursuri`;
 *   (b) one eligible real entry → the page renders and the links return;
 *   (c) an illustrative entry never counts, even if (invalidly) labelled `competition`.
 */
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { isEligibleCompetition } from '../../lib/content/derive';
import { FIXTURE_RAW_DOCUMENTS } from '../../lib/content/fixtures';
import { createContentSource, type ContentSource, type RawDocuments } from '../../lib/content/source';
import type { RawWorkArchiveItem, RawWorkEntry } from '../../lib/content/groq';

const state = vi.hoisted(() => ({ source: null as unknown as ContentSource }));
vi.mock('../../lib/content/build-source', () => ({ contentSource: () => state.source }));

import Homepage from '../homepage/Homepage.astro';
import WorkArchive from './WorkArchive.astro';
import CompetitionsPage from '../../pages/proiecte/concursuri.astro';

const ROUTE = '/proiecte/concursuri';
const KEEP = 'wf-5';

type Raw = RawWorkArchiveItem | RawWorkEntry;

/**
 * The fixture corpus with every `competition` Label stripped, except (optionally) on `KEEP`,
 * which may also be flagged illustrative. Everything else about the corpus is untouched.
 */
function sourceWith(keep: 'none' | 'real' | 'illustrative'): ContentSource {
  function rewrite<T extends Raw>(raw: T): T {
    const labels = (raw.labels ?? []).filter((label) => label !== 'competition');
    if (raw._id !== KEEP || keep === 'none') return { ...raw, labels };
    return {
      ...raw,
      labels: [...labels, 'competition'],
      ...(keep === 'illustrative' ? { illustrative: true } : {}),
    };
  }
  const documents: RawDocuments = {
    ...FIXTURE_RAW_DOCUMENTS,
    workArchive: async () => (await FIXTURE_RAW_DOCUMENTS.workArchive()).map(rewrite),
    workEntries: async () => (await FIXTURE_RAW_DOCUMENTS.workEntries()).map(rewrite),
  };
  return createContentSource(documents);
}

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
});

async function surfaces(): Promise<Record<string, string>> {
  return {
    homepage: await container.renderToString(Homepage, { props: { locale: 'ro' } }),
    archive: await container.renderToString(WorkArchive, { props: { locale: 'ro' } }),
  };
}

describe('isEligibleCompetition — the one predicate', () => {
  it('counts real Work carrying the competition Label, alongside other Labels too', () => {
    expect(isEligibleCompetition({ labels: ['competition'], illustrative: false })).toBe(true);
    expect(
      isEligibleCompetition({ labels: ['diploma-project', 'competition'], illustrative: false }),
    ).toBe(true);
  });

  it('ignores unlabelled Work and illustrative Work, labelled or not', () => {
    expect(isEligibleCompetition({ labels: [], illustrative: false })).toBe(false);
    expect(isEligibleCompetition({ labels: ['diploma-project'], illustrative: false })).toBe(false);
    expect(isEligibleCompetition({ labels: ['competition'], illustrative: true })).toBe(false);
  });
});

describe('(a) zero eligible entries — withheld', () => {
  beforeAll(() => {
    state.source = sourceWith('none');
  });

  it('hasCompetitions is false in RO', async () => {
    expect(await state.source.hasCompetitions('ro')).toBe(false);
  });

  it('the page is an empty 404 (no file written)', async () => {
    const response = await container.renderToResponse(CompetitionsPage);
    expect(response.status).toBe(404);
    expect(await response.text()).toBe('');
  });

  it('no surface links to the route; the homepage M-5 station is absent', async () => {
    const html = await surfaces();
    for (const [name, markup] of Object.entries(html)) {
      expect(markup, name).toContain('class="site-header'); // header + footer rendered…
      expect(markup, name).toContain('class="site-footer"');
      expect(markup, name).not.toContain(`href="${ROUTE}`); // …and nothing links to the route
    }
    expect(html.homepage).not.toContain('class="curated"');
    expect(html.homepage).not.toContain('id="curated-heading"');
  });
});

describe('(b) one eligible real entry — the route and its links return', () => {
  beforeAll(() => {
    state.source = sourceWith('real');
  });

  it('hasCompetitions is true in RO', async () => {
    expect(await state.source.hasCompetitions('ro')).toBe(true);
  });

  it('the page renders, with its entry', async () => {
    const response = await container.renderToResponse(CompetitionsPage);
    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain('class="wa-results"');
    expect(html).not.toContain('class="wa-empty-note"');
  });

  it('the homepage M-5 station and the archive A-7 link point at the route again', async () => {
    const html = await surfaces();
    expect(html.homepage).toContain('class="curated"');
    expect(html.homepage).toContain(`href="${ROUTE}"`);
    expect(html.archive).toContain(`href="${ROUTE}"`);
  });
});

describe('(c) an illustrative entry never counts', () => {
  beforeAll(() => {
    state.source = sourceWith('illustrative');
  });

  it('even when (invalidly) labelled competition, it keeps the route withheld', async () => {
    expect(await state.source.hasCompetitions('ro')).toBe(false);
    expect(await state.source.curatedView('competitions', 'ro')).toEqual([]);

    const response = await container.renderToResponse(CompetitionsPage);
    expect(response.status).toBe(404);
    expect(await response.text()).toBe('');

    const html = await surfaces();
    for (const [name, markup] of Object.entries(html)) {
      expect(markup, name).not.toContain(`href="${ROUTE}`);
    }
  });
});
