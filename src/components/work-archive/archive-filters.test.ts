/**
 * The archive filter set — one set of controls for every layout (DECISIONS_LOG #119).
 *
 * The narrow disclosure, the 1024–1247px technical sheet and the ≥1248px rail are
 * CSS placements of the SAME markup, so the island binds one control per facet
 * and there is one filter state and one URL contract. These tests pin that: no
 * facet is rendered twice, Service is the scoped select the island narrows by
 * its options, and every select carries a visible key and a sizing mirror.
 */
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';

import ArchiveFilters from './ArchiveFilters.astro';
import { workArchiveMessages } from '../../lib/i18n/work-archive';
import type { ServiceOption } from './facets';

const copy = workArchiveMessages('ro').filters;

const services: ServiceOption[] = [
  { key: 'proiectare-arhitectura', pillar: 'architecture-design', label: 'Proiectare de arhitectură' },
  { key: 'scanare-laser-3d', pillar: 'reality-capture', label: 'Scanare laser 3D' },
];

let html: string;

beforeAll(async () => {
  const container = await AstroContainer.create();
  const raw = await container.renderToString(ArchiveFilters, {
    props: {
      locale: 'ro',
      copy,
      values: { labels: ['competition', 'diploma-project'], sectors: ['rezidential'], services: [] },
      services,
    },
  });
  /* The dev container annotates every element with its source location; the served markup
     carries none of it. */
  html = raw.replace(/ data-astro-source-[a-z]+="[^"]*"/g, '');
});

const count = (pattern: RegExp) => (html.match(pattern) ?? []).length;

describe('ArchiveFilters — one control per facet', () => {
  it('renders each facet exactly once', () => {
    expect(count(/role="radiogroup"[^>]*data-facet="label"/g)).toBe(1);
    expect(count(/<select[^>]*data-facet="sector"/g)).toBe(1);
    expect(count(/<select[^>]*data-facet="sort"/g)).toBe(1);
    expect(count(/<select[^>]*data-facet="service"/g)).toBe(1);
    expect(count(/data-facet=/g)).toBe(4);
  });

  it('renders Service as a select, never as chips', () => {
    expect(html).not.toMatch(/role="radiogroup"[^>]*data-facet="service"/);
    expect(html).toMatch(/<option value="">orice serviciu<\/option>/);
  });

  it('scopes every Service option to its Pillar for the island to narrow', () => {
    expect(html).toMatch(/<option value="proiectare-arhitectura" data-pillar="architecture-design">/);
    expect(html).toMatch(/<option value="scanare-laser-3d" data-pillar="reality-capture">/);
    expect(html).toMatch(/class="wa-f wa-f--service" data-contextual="service"/);
  });

  it('names every select with a visible key', () => {
    for (const [facet, legend] of [
      ['sector', copy.sector.legend],
      ['sort', copy.sort.legend],
      ['service', copy.service.legend],
    ]) {
      expect(html).toContain(`<label class="wa-fk" for="wa-f-${facet}">${legend}</label>`);
      expect(html).toMatch(new RegExp(`<select id="wa-f-${facet}" data-facet="${facet}">`));
    }
  });

  it('gives every select a decorative sizing mirror starting on its served option', () => {
    expect(count(/<span class="sel-v" aria-hidden="true" data-sel-mirror>/g)).toBe(3);
    expect(html).toContain(`data-sel-mirror>${copy.sector.any}</span>`);
    expect(html).toContain(`data-sel-mirror>${copy.sort.curated}</span>`);
    expect(html).toContain(`data-sel-mirror>${copy.service.any}</span>`);
  });

  it('keeps the Label key out of the accessible tree — the radiogroup carries the name', () => {
    expect(html).toContain(`<span class="wa-fk" aria-hidden="true">${copy.label.legend}</span>`);
    expect(html).toMatch(new RegExp(`role="radiogroup" aria-label="${copy.label.legend}" data-facet="label"`));
  });
});
