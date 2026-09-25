/**
 * The Homepage's locked Stable RO copy (Wave 3) and the absences it declares.
 *
 * Two layers, both needed. The message assertions pin the exact locked strings, so a reword
 * fails by name. The render assertions pin what an ABSENT slot produces — nothing: no empty
 * `<dl>`, no empty caption, no `data-fixture` marker — because an absence that still renders its
 * shell is the failure `scripts/verify-no-placeholder-content.mjs` would only catch at deploy.
 *
 * RC-held keys (`arrival.heading`, `capabilities.realityCapture`, `work.realityCapture`) are
 * deliberately NOT asserted here: `lib/i18n/rc-copy-firewall.test.ts` owns them.
 */

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';

import Arrival from './Arrival.astro';
import Credibility from './Credibility.astro';
import CuratedViews from './CuratedViews.astro';
import Invitation from './Invitation.astro';
import { homepageMessages } from '../../lib/i18n/homepage';
import { SERVICE_KEYS } from '../../lib/content/types';

const COLLABORATION =
  'Proiectele de arhitectură se dezvoltă în colaborare cu specialiști externi — ingineri de structură și de instalații, consultant nZEB și, după caz, expert tehnic și consultant ISU.';

/** The production leak patterns, verbatim from `scripts/verify-no-placeholder-content.mjs`. */
const FORBIDDEN = [
  /\bTEST\b/,
  /\bdemo\b/i,
  /substituent/i,
  /placeholder/i,
  /data-fixture/,
  /\d{1,3}\.\d+°\s*[NS]/,
  /\bh\s*—\s*\d+(\.\d+)?\s*m\b/,
];

describe('Homepage RO — locked Stable RO strings', () => {
  const ro = homepageMessages('ro');

  it('carries the locked meta, arrival and marker copy', () => {
    expect(ro.meta.title).toBe('diverse anumite — atelier multidisciplinar din Cluj-Napoca');
    expect(ro.meta.description).toBe(
      'Atelier multidisciplinar din Cluj-Napoca: proiectare de arhitectură, design interior, vizualizare 3D, design mobilier, scanare laser 3D și Scan-to-BIM.',
    );
    expect(ro.arrival.eyebrow).toBe('atelier multidisciplinar · Cluj-Napoca');
    expect(ro.arrival.statement).toBe(
      'Explorăm potențialul fiecărui proiect, folosind tehnologii contemporane și respectând realitățile profesiei, peisajul cultural și nevoile celor implicați.',
    );
    expect(ro.arrival.cue).toBe('06 stații');
    expect(ro.arrival.heroIndex).toBe('PT—001');
    expect(ro.arrival.aboutLink).toBe('Despre atelier');
    expect(ro.capabilities.marker.label).toBe('Capabilități');
    expect(ro.capabilities.marker.coordinate).toBe('două direcții');
  });

  /** X1 — one word per A&D Service, in `SERVICE_KEYS` order. */
  it('orders the A&D facets as SERVICE_KEYS does', () => {
    expect(ro.capabilities.architectureDesign.facets).toBe(
      'arhitectură · interior · vizualizare · mobilier',
    );
    expect(SERVICE_KEYS.slice(0, 4)).toEqual([
      'proiectare-arhitectura',
      'design-interior',
      'vizualizare-3d',
      'design-mobilier',
    ]);
    expect(ro.capabilities.architectureDesign.context).toBe(
      'Proiectăm pornind de la loc și ducem lucrul până la detaliu.',
    );
  });

  it('carries the locked credibility block', () => {
    expect(ro.credibility.marker.label).toBe('Atelierul');
    expect(ro.credibility.marker.coordinate).toBe('Cluj-Napoca');
    expect(ro.credibility.heading).toEqual({
      lead: 'Un proces creativ',
      accent: 'dinamic',
      tail: ' și adaptabil.',
    });
    expect(ro.credibility.statement).toBe(COLLABORATION);
    expect(ro.credibility.aboutLink).toBe('Despre atelier');
  });

  it('declares every locked absence as an empty slot', () => {
    expect(ro.arrival.heroFallbackAlt).toBe('');
    expect(ro.arrival.heroCoordinates).toBe('');
    expect(ro.arrival.heroDimension).toBe('');
    expect(ro.credibility.figureCaption).toBe('');
    expect(ro.credibility.readouts).toEqual([]);
    expect(ro.curated.competitions.intro).toBe('');
    expect(ro.invitation.contact).toEqual([{ label: 'Atelier', value: 'Cluj-Napoca' }]);
  });

  /* The RC-held keys are excluded: they are frozen, not Stable RO, and the firewall owns them. */
  it('publishes no leak pattern outside the RC-held keys', () => {
    const { arrival, capabilities, work, ...rest } = ro;
    const { heading: _heldHeading, ...arrivalRest } = arrival;
    const { realityCapture: _heldPlate, ...capabilitiesRest } = capabilities;
    const { realityCapture: _heldModule, ...workRest } = work;
    const serialized = JSON.stringify({ rest, arrivalRest, capabilitiesRest, workRest });
    for (const pattern of FORBIDDEN) expect(serialized).not.toMatch(pattern);
  });
});

describe('Homepage RO — absent slots render nothing', () => {
  let container: AstroContainer;
  const ro = homepageMessages('ro');

  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it('M-1 renders no coordinate, no dimension and no fixture marker', async () => {
    const html = await container.renderToString(Arrival, {
      props: { locale: 'ro', copy: ro.arrival, hero: null, station: 1 },
    });
    expect(html).not.toContain('hero-dim');
    expect(html).not.toMatch(/class="measure"[^>]*>\s*<\/span>/);
    expect(html).toContain('PT—001');
    for (const pattern of FORBIDDEN) expect(html).not.toMatch(pattern);
  });

  it('M-3 renders no readout list, no caption, and the heading with its space', async () => {
    const html = await container.renderToString(Credibility, {
      props: { locale: 'ro', copy: ro.credibility, station: 3 },
    });
    expect(html).not.toContain('class="readouts');
    expect(html).not.toContain('class="tag"');
    expect(html).toMatch(/dinamic<\/span> și adaptabil\./);
    for (const pattern of FORBIDDEN) expect(html).not.toMatch(pattern);
  });

  it('M-5 renders no intro line', async () => {
    const html = await container.renderToString(CuratedViews, {
      props: { locale: 'ro', copy: ro.curated, competitions: [], station: 5 },
    });
    expect(html).not.toContain('class="cintro"');
    for (const pattern of FORBIDDEN) expect(html).not.toMatch(pattern);
  });

  it('M-6 renders only the confirmed contact row, unmarked', async () => {
    const html = await container.renderToString(Invitation, {
      props: { locale: 'ro', copy: ro.invitation, station: 6 },
    });
    expect(html.match(/class="row"/g)?.length).toBe(1);
    expect(html).toContain('Cluj-Napoca');
    for (const pattern of FORBIDDEN) expect(html).not.toMatch(pattern);
  });

  it('M-6 renders no contact list at all when no row is confirmed', async () => {
    const html = await container.renderToString(Invitation, {
      props: { locale: 'ro', copy: { ...ro.invitation, contact: [] }, station: 6 },
    });
    expect(html).not.toContain('<dl');
  });
});
