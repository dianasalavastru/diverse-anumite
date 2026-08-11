/**
 * The Service page, actually rendered — every service shape the blueprint must
 * serve, including the two the live dataset cannot currently supply.
 *
 * OWNER: Workstream A.
 *
 * ── WHY THIS SUITE EXISTS ─────────────────────────────────────────────────
 * `modules.test.ts` proves the *composition decisions*; the build proves the
 * *live* pages. Between them sits a gap this suite closes: at the time of
 * writing, the Sanity dataset contains exactly two Service documents — one
 * Architecture & Design service with demonstrating work, and one Reality Capture
 * service with none. It has **no** RC service that both demonstrates work and
 * carries a cleared point-cloud derivative, and **no** EN-unpublished service.
 * Those two states are contract requirements (§10.4/§19.4 for the first, §11.2
 * rule 7 for the second) that no build output can exercise until the owner
 * authors such content, and a report claiming they work needs evidence.
 *
 * Astro's container API renders the real components — the same
 * `ServicePage.astro`, `Proof.astro` and `PointCloudField.astro` the routes
 * compose — against constructed Service and Work Entry documents. Nothing about
 * the page is mocked; only the content is, and it is content in the shapes
 * `types.ts` declares.
 *
 * The route layer itself is asserted separately (`routes.test.ts` for the paths,
 * `modules.test.ts` for the EN gate the route's `getStaticPaths` applies).
 */

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';

import ServicePage from './ServicePage.astro';
import type {
  Curation,
  ImageAsset,
  Localized,
  RichText,
  Service,
  WorkEntry,
  WorkEntrySummary,
} from '../../lib/content';

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
});

const render = (service: Service, locale: 'ro' | 'en', entries: WorkEntry[] = []) =>
  container.renderToString(ServicePage, {
    props: { service, locale, entries: new Map(entries.map((e) => [e._id, e])) },
  });

/* -------------------------------------------------------------------------- */
/* Builders — the same shapes modules.test.ts uses                             */
/* -------------------------------------------------------------------------- */

const bi = <T,>(ro: T, en: T | null): Localized<T> => ({ ro, en });

const CURATION: Curation = {
  featured: false,
  pinned: false,
  editorialPriority: 0,
  placements: [],
  prominence: 'standard',
};

const prose = (text: string): RichText => [
  { _type: 'block', _key: 'k1', style: 'normal', children: [{ _type: 'span', text }] },
];

const image = (id: string): ImageAsset => ({
  assetId: id,
  url: `https://cdn.sanity.io/images/x/y/${id}.jpg`,
  width: 1600,
  height: 1000,
  alt: bi('Alt romanesc', 'English alt'),
  hotspot: null,
  crop: null,
});

function service(overrides: Partial<Service> = {}): Service {
  return {
    _id: 'sv',
    _type: 'service',
    name: bi('Scanare 3D', '3D scanning'),
    slug: bi('scanare-3d', '3d-scanning'),
    enPublished: true,
    pillar: 'reality-capture',
    shortDescription: bi('O linie de pozitionare.', 'A positioning line.'),
    description: null,
    problemSolved: null,
    deliverables: null,
    process: null,
    equipment: null,
    sectors: [],
    hero: null,
    demonstratedBy: [],
    curation: CURATION,
    seo: { title: null, description: null },
    ...overrides,
  };
}

function summary(id: string): WorkEntrySummary {
  return {
    _id: id,
    title: bi(`Biserica ${id}`, `Church ${id}`),
    slug: bi(`biserica-${id}`, `church-${id}`),
    enPublished: true,
    pillars: { primary: 'reality-capture', secondary: [] },
    entryType: { primary: 'survey-documentation', secondary: [] },
    sectors: ['heritage'],
    year: 2024,
    status: 'delivered',
    cover: image(`cover-${id}`),
    curation: CURATION,
  };
}

function surveyedEntry(id: string, cleared: boolean): WorkEntry {
  return {
    _id: id,
    _type: 'workEntry',
    title: bi(`Biserica ${id}`, `Church ${id}`),
    slug: bi(`biserica-${id}`, `church-${id}`),
    enPublished: true,
    discipline: { primary: 'reality-capture', secondary: [] },
    pillars: { primary: 'reality-capture', secondary: [] },
    entryType: { primary: 'survey-documentation', secondary: [] },
    attribution: 'independent',
    commissioning: 'client-commissioned',
    employer: null,
    sectors: ['heritage'],
    roles: null,
    services: [],
    relatedWork: [],
    description: null,
    authorship: null,
    cover: image(`cover-${id}`),
    gallery: [],
    capture: {
      accuracy: bi('2 mm', '2 mm'),
      equipment: ['Leica RTC360'],
      software: [],
      pointCount: 8_032_000,
      derivative: {
        assetUrl: `https://cdn.sanity.io/files/x/y/${id}.laz`,
        poster: image(`poster-${id}`),
      },
    },
    capturePublicationCleared: cleared,
    metadata: {
      year: 2024,
      location: null,
      client: null,
      collaborators: [],
      status: 'delivered',
      awards: null,
      area: null,
      team: [],
      deliverables: null,
    },
    curation: CURATION,
    seo: { title: null, description: null },
  };
}

/* -------------------------------------------------------------------------- */
/* An Architecture & Design service                                            */
/* -------------------------------------------------------------------------- */

describe('an A&D service with demonstrating work', () => {
  const design = service({
    _id: 'sv-ad',
    name: bi('Proiectare de arhitectura', 'Architectural design'),
    slug: bi('proiectare-arhitectura', 'architectural-design'),
    pillar: 'architecture-design',
    description: bi(prose('Ce este serviciul.'), prose('What the service is.')),
    problemSolved: bi(prose('Ce rezolva.'), prose('What it solves.')),
    deliverables: bi(['Plan', 'Sectiune'], ['Plan', 'Section']),
    process: bi(prose('Cum lucram.'), prose('How we work.')),
    sectors: ['residential', 'cultural'],
    demonstratedBy: [summary('a'), summary('b')],
  });

  it('renders all six sections, the proof cards and the pillar-filtered see-more', async () => {
    const html = await render(design, 'ro');

    expect(html).toContain('Proiectare de arhitectura');
    expect(html).toContain('Ce rezolva.');
    expect(html).toContain('Sectiune');
    expect(html).toContain('Cum lucram.');
    expect(html).toContain('href="/proiecte/biserica-a"');
    expect(html).toContain('href="/proiecte/biserica-b"');
    // §23.5: pillar filter, and NOT `?service=` — Service is not the A&D refinement.
    expect(html).toContain('/proiecte?pillar=architecture');
    expect(html).not.toContain('service=proiectare-arhitectura');
    expect(html).toContain('<div class="rail"');
  });

  it('emits the frozen Contact prefill and no other query contract', async () => {
    const html = await render(design, 'ro');
    expect(html).toContain('/contact?topic=arhitectura-design&#38;regarding=proiectare-arhitectura');
  });

  it('shows no point-cloud field: an A&D service has no survey behind it', async () => {
    const html = await render(design, 'ro');
    expect(html).not.toContain('data-media-viewer="point-cloud"');
  });
});

/* -------------------------------------------------------------------------- */
/* A Reality Capture service — the state the live dataset lacks                */
/* -------------------------------------------------------------------------- */

describe('a Reality Capture service with demonstrating, cleared survey work', () => {
  const capture = service({
    _id: 'sv-rc',
    problemSolved: bi(prose('Nu poti proiecta peste o necunoscuta.'), prose('You cannot design over an unknown.')),
    deliverables: bi(['Nor de puncte', 'Ortofoto'], ['Point cloud', 'Orthophoto']),
    process: bi(prose('Planificare, captare, inregistrare.'), prose('Plan, capture, register.')),
    equipment: bi(['Leica RTC360', 'Acuratete 2 mm'], ['Leica RTC360', 'Accuracy 2 mm']),
    sectors: ['heritage'],
    hero: image('hero-rc'),
    demonstratedBy: [summary('a')],
  });

  it('mounts the point-cloud seam against the demonstrating entry, and credits it', async () => {
    const html = await render(capture, 'ro', [surveyedEntry('a', true)]);

    expect(html).toContain('data-media-viewer="point-cloud"');
    expect(html).toContain('data-viewer-status="poster"');
    expect(html).toContain('data-asset-url="https://cdn.sanity.io/files/x/y/a.laz"');
    // §10.4: the readout describes the cloud beside it, and names its project.
    expect(html).toContain('releveu din Biserica a');
    expect(html).toContain('8.032.000 pt · 2 mm · Leica RTC360');
    expect(html).toContain('href="/proiecte/biserica-a"');
  });

  it('renders no renderer and no fabricated figure', async () => {
    const html = await render(capture, 'ro', [surveyedEntry('a', true)]);
    // The HiFi's decorative multiplier and hardcoded spec line, both forbidden.
    expect(html).not.toContain('N*1600');
    expect(html).not.toMatch(/acuratețe 2 mm · Leica RTC360/);
    expect(html).not.toContain('<canvas');
  });

  it('honours the §19.4 publication gate — uncleared means no asset and no field', async () => {
    const html = await render(capture, 'ro', [surveyedEntry('a', false)]);
    expect(html).not.toContain('data-media-viewer="point-cloud"');
    expect(html).not.toContain('cdn.sanity.io/files');
    // The proof set itself is unaffected: the work is still shown.
    expect(html).toContain('href="/proiecte/biserica-a"');
  });

  it('narrows see-more with the frozen RC refinement (§23.5)', async () => {
    const html = await render(capture, 'ro', [surveyedEntry('a', true)]);
    expect(html).toContain('/proiecte?pillar=reality-capture&#38;service=scanare-3d');
  });

  it('states equipment as authored, and nothing else', async () => {
    const html = await render(capture, 'ro', [surveyedEntry('a', true)]);
    expect(html).toContain('Leica RTC360');
    expect(html).toContain('Acuratete 2 mm');
  });

  it('opens image-led when a hero exists', async () => {
    const html = await render(capture, 'ro', [surveyedEntry('a', true)]);
    expect(html).toContain('sv-orientation--media');
    expect(html).toContain('hero-rc.jpg');
  });
});

/* -------------------------------------------------------------------------- */
/* F5                                                                          */
/* -------------------------------------------------------------------------- */

describe('F5 — a service with zero demonstrating work stays publishable', () => {
  const thin = service({
    _id: 'sv-f5',
    problemSolved: bi(prose('Ce rezolva.'), prose('What it solves.')),
    deliverables: bi(['Nor de puncte'], ['Point cloud']),
    demonstratedBy: [],
  });

  it('renders the editorial note, a Contact CTA and the Hub back-path', async () => {
    const html = await render(thin, 'ro');

    expect(html).toContain('data-empty-state="service-proof"');
    expect(html).toContain('Exemplele publice pentru acest serviciu sunt in pregatire');
    expect(html).toContain('href="/contact"');
    expect(html).toContain('href="/reality-capture"');
  });

  it('renders no grid, no carousel, no counter and no see-more', async () => {
    const html = await render(thin, 'ro');

    expect(html).not.toContain('sv-proof-grid');
    expect(html).not.toContain('sv-see-more');
    expect(html).not.toContain('data-media-viewer');
    expect(html).not.toMatch(/\b0\s+(proiecte|lucrari|projects)\b/i);
  });

  it('leaves S-1…S-3 and S-5 fully intact — confidence undiminished', async () => {
    const html = await render(thin, 'ro');

    expect(html).toContain('Scanare 3D');
    expect(html).toContain('Ce rezolva.');
    expect(html).toContain('Nor de puncte');
    expect(html).toContain('/contact?topic=reality-capture&#38;regarding=scanare-3d');
  });
});

/* -------------------------------------------------------------------------- */
/* Localization                                                                */
/* -------------------------------------------------------------------------- */

describe('localization (§11.2)', () => {
  const partial = service({
    _id: 'sv-partial',
    problemSolved: bi(prose('Doar romana'), null),
    deliverables: bi(['Doar romana'], null),
    demonstratedBy: [summary('a')],
  });

  it('never serves RO prose under an EN URL', async () => {
    const html = await render(partial, 'en');
    expect(html).not.toContain('Doar romana');
    expect(html).toContain('lang="en"');
  });

  it('emits the reciprocal hreflang pair only when both counterparts exist', async () => {
    const both = await render(service({ _id: 'sv-both' }), 'ro');
    expect(both).toContain('hreflang="en"');
    expect(both).toContain('hreflang="x-default"');

    const roOnly = await render(
      service({ _id: 'sv-ro', slug: bi('doar-ro', null), enPublished: false }),
      'ro',
    );
    expect(roOnly).not.toContain('hreflang=');
  });

  it('localizes both prefill parameters together', async () => {
    const html = await render(service({ _id: 'sv-en' }), 'en');
    expect(html).toContain('/en/contact?topic=reality-capture&#38;regarding=3d-scanning');
  });
});

/* -------------------------------------------------------------------------- */
/* Accessibility invariants (WCAG 2.2 AA — DECISIONS_LOG #78)                  */
/* -------------------------------------------------------------------------- */

describe('accessibility invariants', () => {
  const full = service({
    _id: 'sv-a11y',
    description: bi(prose('Ce este.'), prose('What it is.')),
    deliverables: bi(['Nor de puncte'], ['Point cloud']),
    process: bi(prose('Cum.'), prose('How.')),
    equipment: bi(['Leica RTC360'], ['Leica RTC360']),
    sectors: ['heritage'],
    demonstratedBy: [summary('a')],
  });

  it('has exactly one h1, and it is the service name', async () => {
    const html = await render(full, 'ro');
    const h1s = html.match(/<h1[^>]*>/g) ?? [];
    expect(h1s).toHaveLength(1);
    expect(html).toMatch(/<h1[^>]*>\s*Scanare 3D\s*<\/h1>/);
  });

  it('labels every section by its own heading', async () => {
    const html = await render(full, 'ro');
    for (const id of ['sv-problem-h', 'sv-deliverables-h', 'sv-proof-h', 'sv-conversion-h']) {
      expect(html).toContain(`aria-labelledby="${id}"`);
      expect(html).toContain(`id="${id}"`);
    }
  });

  it('names the breadcrumb landmark and marks the current page', async () => {
    const html = await render(full, 'ro');
    expect(html).toContain('aria-label="Firul paginii"');
    expect(html).toContain('aria-current="page"');
  });

  it('carries the skip link and hides the decorative rail from assistive tech', async () => {
    const html = await render(full, 'ro');
    expect(html).toContain('class="skip-link"');
    /* Matched as an attribute pair rather than a whole tag: the container
       renders in dev mode and injects `data-astro-source-*` attributes the
       production build does not emit. */
    expect(html).toMatch(/class="rail" aria-hidden="true"/);
  });

  it('conveys the process without motion — prose, not a hover-only diagram', async () => {
    const html = await render(full, 'ro');
    expect(html).toContain('Cum.');
    expect(html).not.toContain('focus-within');
    expect(html).not.toContain('treceti cursorul');
  });
});
