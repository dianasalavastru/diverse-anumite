/**
 * Illustrative Work, actually rendered — absence renders nothing.
 *
 * OWNER: Workstream B (the illustrative mode). An illustrative project carries no Year, no
 * Status and may carry no Sector (`ILLUSTRATIVE_FIELD_RULES`). Every surface that renders those
 * facts must then render NOTHING for them: no "null", no "0", no empty row, no stray separator.
 * The same components rendered with a real project prove the real output did not change shape.
 *
 * No visible "illustrative" label is asserted or added — that is a later human decision.
 */

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';

import Hero from './Hero.astro';
import ProjectMetadata from './ProjectMetadata.astro';
import WorkPreviewCard from '../WorkPreviewCard.astro';
import CuratedViews from '../homepage/CuratedViews.astro';
import { toWorkEntrySummary } from '../../lib/content';
import type { Curation, ImageAsset, Localized, WorkArchiveItem, WorkEntry } from '../../lib/content';
import { workEntryMessages } from '../../lib/i18n/work-entry';
import { homepageMessages } from '../../lib/i18n/homepage';

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
});

const bi = <T,>(ro: T, en: T | null): Localized<T> => ({ ro, en });

const CURATION: Curation = {
  featured: false,
  pinned: false,
  editorialPriority: 0,
  placements: [],
  prominence: 'standard',
};

const image = (id: string): ImageAsset => ({
  assetId: `image-${id}`,
  url: `https://cdn.sanity.io/images/x/y/${id}.jpg`,
  width: 1600,
  height: 1000,
  alt: bi('Imagine', 'Image'),
  hotspot: null,
  crop: null,
});

const real: WorkEntry = {
  _id: 'real',
  _type: 'workEntry',
  title: bi('Casa reala', 'Real house'),
  slug: bi('casa-reala', 'real-house'),
  enPublished: true,
  pillar: 'architecture-design',
  sector: 'rezidential',
  labels: [],
  illustrative: false,
  services: [],
  relatedWork: [],
  description: null,
  cover: image('real'),
  gallery: [image('real-a')],
  capture: null,
  capturePublicationCleared: false,
  metadata: {
    year: 2023,
    location: bi('Cluj', 'Cluj'),
    client: 'Client real',
    collaborators: [],
    status: 'finalizat',
    awards: null,
    area: 180,
    team: [],
    deliverables: null,
    equipment: [],
    implementationCompany: null,
  },
  curation: CURATION,
  seo: { title: null, description: null },
};

/** What `normalizeWorkEntry` produces for an illustrative example with no Sector. */
const example: WorkEntry = {
  ...real,
  _id: 'example',
  title: bi('Exemplu', 'Example'),
  slug: bi('exemplu', 'example'),
  sector: null,
  illustrative: true,
  metadata: {
    year: null,
    location: null,
    client: null,
    collaborators: [],
    status: null,
    awards: null,
    area: null,
    team: [],
    deliverables: null,
    equipment: [],
    implementationCompany: null,
  },
};

const archiveItem = (entry: WorkEntry): WorkArchiveItem => ({
  ...toWorkEntrySummary(entry),
  services: [],
  location: entry.metadata.location,
  galleryPreview: [],
});

/** A Project Metadata row key, whatever scoped attributes Astro adds to the `<dt>`. */
const rowKey = (key: string) => new RegExp(`<dt class="k"[^>]*>${key}</dt>`);

/** Visible text only — tags and attributes stripped, whitespace collapsed. */
const text = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

for (const locale of ['ro', 'en'] as const) {
  const copy = workEntryMessages(locale);

  describe(`ProjectMetadata (${locale})`, () => {
    it('renders no Year, Status or Sector row for an illustrative project', async () => {
      const html = await container.renderToString(ProjectMetadata, { props: { entry: example, locale, copy } });
      for (const key of [copy.metadata.year, copy.metadata.status, copy.metadata.sector, copy.metadata.client]) {
        expect(html, key).not.toMatch(rowKey(key));
      }
      expect(text(html)).not.toMatch(/\bnull\b|\bundefined\b|\bNaN\b/);
    });

    it('still renders them for a real project', async () => {
      const html = await container.renderToString(ProjectMetadata, { props: { entry: real, locale, copy } });
      for (const key of [copy.metadata.year, copy.metadata.status, copy.metadata.sector]) {
        expect(html, key).toMatch(rowKey(key));
      }
      expect(html).toContain('2023');
    });
  });

  describe(`Hero (${locale})`, () => {
    it('renders a kicker with no year and no stray value for an illustrative project', async () => {
      const html = await container.renderToString(Hero, { props: { entry: example, locale, copy, station: 1 } });
      expect(text(html)).not.toMatch(/\bnull\b|\bundefined\b|\bNaN\b/);
      expect(html).toContain(locale === 'ro' ? 'Exemplu' : 'Example');
    });

    it('still carries the year for a real project', async () => {
      const html = await container.renderToString(Hero, { props: { entry: real, locale, copy, station: 1 } });
      expect(html).toContain('2023');
    });
  });

  describe(`WorkPreviewCard (${locale})`, () => {
    for (const variant of [undefined, 'archive', 'focus'] as const) {
      it(`${variant ?? 'default'}: renders no year, sector or empty reading for an illustrative project`, async () => {
        const html = await container.renderToString(WorkPreviewCard, {
          props: { entry: archiveItem(example), locale, href: '/proiecte/exemplu', variant },
        });
        expect(text(html)).not.toMatch(/\bnull\b|\bundefined\b|\bNaN\b/);
        expect(html).not.toMatch(/<span class="d"[^>]*>\s*<\/span>/);
        expect(html).not.toMatch(/<span class="sc"[^>]*>\s*<\/span>/);
      });

      it(`${variant ?? 'default'}: still renders the year for a real project`, async () => {
        const html = await container.renderToString(WorkPreviewCard, {
          props: { entry: archiveItem(real), locale, href: '/proiecte/casa-reala', variant },
        });
        expect(html).toContain('2023');
      });
    }
  });

  describe(`CuratedViews (${locale})`, () => {
    it('renders no year cell for an undated row, and keeps it for a dated one', async () => {
      const html = await container.renderToString(CuratedViews, {
        props: {
          locale,
          copy: homepageMessages(locale).curated,
          competitions: [archiveItem(example), archiveItem(real)],
          station: 5,
        },
      });
      expect(text(html)).not.toMatch(/\bnull\b|\bundefined\b|\bNaN\b/);
      expect((html.match(/<span class="y"[^>]*>/g) ?? []).length).toBe(1);
      expect(html).toMatch(/<span class="y"[^>]*>2023<\/span>/);
    });
  });
}
