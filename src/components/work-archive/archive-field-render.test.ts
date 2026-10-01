/**
 * The Archive Field, actually rendered — the C-refined v3 validation matrix.
 *
 * OWNER: Workstream A. The planner is tested on its own in `field.test.ts`; this renders the real
 * component with real-shaped archive items and asserts what reaches the page: the family and
 * variant for 1–4 images, portrait / landscape / drawing support, `kind` unset and `drawing`,
 * the editor's crop rectangle at the CDN, the hotspot (and its centre fallback) as the photo's
 * position, drawings never positioned or cropped, both facings emitted, and one link per field.
 */

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';

import ArchiveField from './ArchiveField.astro';
import type { GalleryImage, ImageAsset, WorkArchiveItem } from '../../lib/content';

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
});

const asset = (id: string, width: number, height: number, extra: Partial<ImageAsset> = {}): ImageAsset => ({
  assetId: `image-${id}`,
  url: `https://cdn.sanity.io/images/p/d/${id}-${width}x${height}.jpg`,
  width,
  height,
  alt: { ro: `alt ${id}`, en: `alt ${id}` },
  hotspot: null,
  crop: null,
  ...extra,
});
const gallery = (image: ImageAsset, kind: GalleryImage['kind'] = 'photo'): GalleryImage => ({ ...image, kind });

const landscape = (id: string) => asset(id, 2400, 1800);
const portrait = (id: string) => asset(id, 900, 1400);
const board = (id: string) => asset(id, 2400, 1700);

const item = (cover: ImageAsset | null, preview: GalleryImage[], overrides: Partial<WorkArchiveItem> = {}): WorkArchiveItem => ({
  _id: 'p1',
  title: { ro: 'Proiect de test', en: 'Test project' },
  slug: { ro: 'proiect', en: 'project' },
  enPublished: true,
  pillar: 'architecture-design',
  sector: 'rezidential',
  labels: [],
  illustrative: false,
  year: 2024,
  status: 'finalizat',
  cover,
  curation: { featured: false, pinned: false, editorialPriority: 0, placements: [], prominence: 'standard' },
  services: [],
  location: { ro: 'Cluj-Napoca', en: 'Cluj-Napoca' },
  galleryPreview: preview,
  coverKind: 'photo',
  imageCount: preview.length + 1,
  ...overrides,
});

const render = (archiveItem: WorkArchiveItem) =>
  container.renderToString(ArchiveField, {
    props: {
      item: archiveItem,
      locale: 'ro',
      href: '/proiecte/proiect',
      coordinate: 'A·001',
      place: 'Cluj-Napoca',
      tone: '#c9c4ba',
      openLabel: 'deschide proiectul',
    },
  });

const attribute = (html: string, name: string) => html.match(new RegExp(`${name}="([^"]*)"`))?.[1];
/** Every slot as `ref:kind:fit`, in document order. */
const slots = (html: string) =>
  [...html.matchAll(/class="af-s"[^>]*data-ref="([^"]+)"[^>]*data-kind="([^"]+)"[^>]*data-fit="([^"]+)"/g)].map(
    (match) => `${match[1]}:${match[2]}:${match[3]}`,
  );

describe('Variants by image count', () => {
  it('1 image — cover and title block only', async () => {
    const html = await render(item(landscape('a'), []));
    expect(attribute(html, 'data-variant')).toBe('landscape-0');
    expect(slots(html)).toEqual(['cover:photo:cover']);
    expect(html).toContain('1 imagine');
  });

  it('2 images — landscape support', async () => {
    const html = await render(item(landscape('a'), [gallery(landscape('b'))]));
    expect(attribute(html, 'data-variant')).toBe('landscape-1');
    expect(slots(html)).toEqual(['cover:photo:cover', 's1:photo:cover']);
    expect(html).toContain('2 imagini');
  });

  it('3 images — portrait support anchors the column', async () => {
    const html = await render(item(landscape('a'), [gallery(portrait('b')), gallery(landscape('c'))]));
    expect(attribute(html, 'data-variant')).toBe('landscape-anchor');
    expect(slots(html)).toEqual(['cover:photo:cover', 's1:photo:cover', 's2:photo:cover']);
  });

  it('4 images — drawing support, contained on white', async () => {
    const html = await render(
      item(landscape('a'), [gallery(landscape('b')), gallery(board('c'), 'drawing'), gallery(landscape('d'))]),
    );
    expect(attribute(html, 'data-variant')).toBe('landscape-3');
    expect(slots(html)).toEqual(['cover:photo:cover', 's1:photo:cover', 's2:drawing:contain', 's3:photo:cover']);
  });

  it('counts the Project’s own images, not only the ones it shows', async () => {
    const html = await render(item(landscape('a'), [gallery(landscape('b'))], { imageCount: 12 }));
    expect(html).toContain('12 imagini');
  });
});

describe('Families', () => {
  it('Portrait-led with a portrait-only set renders the 4-column detail', async () => {
    const html = await render(item(portrait('a'), [gallery(portrait('b'))]));
    expect(attribute(html, 'data-family')).toBe('portrait');
    expect(attribute(html, 'data-variant')).toBe('portrait-detail');
    expect(html).toContain('--af-ca:9 / 13;--af-cb:1 / 5;--af-rr:4 / 9;');
  });

  it('kind=drawing on the cover selects Drawing-led and contains every board', async () => {
    const html = await render(
      item(board('a'), [gallery(board('b'), 'drawing'), gallery(board('c'), 'drawing')], { coverKind: 'drawing' }),
    );
    expect(attribute(html, 'data-family')).toBe('drawing');
    expect(slots(html)).toEqual(['cover:drawing:contain', 's1:drawing:contain', 's2:drawing:contain']);
  });

  it('unset kind treats a board as a photograph', async () => {
    const html = await render(item(board('a'), [gallery(board('b'))]));
    expect(attribute(html, 'data-family')).toBe('landscape');
    expect(slots(html)).toEqual(['cover:photo:cover', 's1:photo:cover']);
  });
});

describe('Crop and hotspot', () => {
  it('centres a photograph with no hotspot', async () => {
    const html = await render(item(landscape('a'), []));
    expect(html).toContain('object-position:50% 50%');
  });

  it('positions a photograph on its authored hotspot', async () => {
    const withHotspot = asset('a', 2400, 1800, { hotspot: { x: 0.8, y: 0.25, width: 0.1, height: 0.1 } });
    const html = await render(item(withHotspot, []));
    expect(html).toContain('object-position:80% 25%');
  });

  it('sends the editor’s crop rectangle to the CDN and plans against it', async () => {
    const cropped = asset('a', 2400, 1800, { crop: { top: 0, bottom: 0, left: 0.1, right: 0.1 } });
    const html = await render(item(cropped, []));
    expect(html).toContain('rect=240%2C0%2C1920%2C1800');
    expect(html).toMatch(/width="1920"[^>]*height="1800"/);
  });

  it('never positions or grades a drawing as a photograph', async () => {
    const html = await render(item(board('a'), [], { coverKind: 'drawing' }));
    expect(html).not.toContain('object-position');
  });

  it('falls back to contain rather than crop beyond the budget', async () => {
    // An editor's crop that leaves a near-square cover cannot fill the 8 × 6 slot within budget.
    const square = asset('a', 2400, 1800, { crop: { top: 0, bottom: 0, left: 0.3, right: 0 } });
    const html = await render(item(square, []));
    expect(slots(html)).toEqual(['cover:photo:contain']);
  });
});

describe('Markup', () => {
  it('is one link, named by the title, with both facings emitted', async () => {
    const html = await render(item(landscape('a'), [gallery(landscape('b'))]));
    expect(html.match(/<a /g)).toHaveLength(1);
    expect(html).toContain('href="/proiecte/proiect"');
    expect(html).toContain('Proiect de test');
    expect(html).toContain('--af-ca:1 / 9;--af-cb:5 / 13;');
  });

  it('labels the data cells and renders no empty reading', async () => {
    const html = await render(item(landscape('a'), [], { year: null, location: null }));
    expect(html).toContain('Sector');
    expect(html).not.toMatch(/\bnull\b|\bundefined\b|\bNaN\b/);
  });

  it('keeps an absent cover as a slot on the plate tone', async () => {
    const html = await render(item(null, []));
    expect(slots(html)).toEqual(['cover:photo:cover']);
    expect(html).toContain('plate-fixture');
  });
});
