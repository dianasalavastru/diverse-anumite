/**
 * About (Despre) — the locked Stable RO copy (Wave 3) and what its absences render.
 *
 * The page used to be seeded with marked substitute copy (a biography, four counts, tool
 * categories, an invented four-step method). The locked copy removes all of it, so what is
 * pinned here is (1) the exact locked strings and (2) that the removed sections leave no shell:
 * no empty heading, no empty list, no `data-fixture` marker, no stand-in alt.
 */

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';

import AboutPage from './AboutPage.astro';
import { aboutMessages } from '../../lib/i18n/about';

const FORBIDDEN = [/\bTEST\b/, /\bdemo\b/i, /substituent/i, /placeholder/i, /data-fixture/];

describe('About RO — locked Stable RO strings', () => {
  const ro = aboutMessages('ro');

  it('carries the locked masthead', () => {
    expect(ro.meta.title).toBe('Despre · diverse anumite');
    expect(ro.meta.description).toBe(
      'Despre diverse anumite, atelier multidisciplinar din Cluj-Napoca, pentru care procesul creativ este dinamic și adaptabil.',
    );
    expect(ro.eyebrow).toBe('Atelierul');
    expect(ro.heading).toBe('Despre');
    expect(ro.intro).toEqual([
      'La diverse anumite, atelier multidisciplinar din Cluj-Napoca, procesul creativ este dinamic și adaptabil.',
      'Atelierul explorează potențialul fiecărui proiect, folosindu-se de tehnologii contemporane, respectând realitățile profesiei, peisajul cultural și nevoile celor implicați.',
      'Serviciile atelierului se împart în două direcții: Arhitectură & Design (proiectare de arhitectură, design interior, vizualizare 3D, design mobilier) și Reality Capture (scanare laser 3D, Scan-to-BIM).',
    ]);
    expect(ro.heroAlt).toBe('');
  });

  it('carries the working method as the two locked prose paragraphs', () => {
    expect(ro.how.label).toBe('Cum lucrăm');
    expect(ro.how.body).toEqual([
      'Proiectele de arhitectură se dezvoltă în colaborare cu specialiști externi — ingineri de structură și de instalații, consultant nZEB și, după caz, expert tehnic și consultant ISU.',
      'În cazul intervențiilor pe clădiri existente, releveul de arhitectură se realizează prin scanare laser 3D, pentru interior, și prin inspecție aeriană cu dronă, pentru anvelopa clădirii — acoperiș și fațade.',
    ]);
  });

  it('carries the locked closing, with no statement and no funding line', () => {
    expect(ro.closing).toEqual({
      statement: '',
      funding: '',
      work: 'Vezi proiectele',
      services: 'Servicii',
      contact: 'Discutăm despre un proiect',
    });
  });

  it('never uses the brand in any other casing', () => {
    expect(JSON.stringify(ro)).not.toMatch(/Diverse Anumite|\bADA\b/);
  });
});

describe('About RO — absent sections render nothing', () => {
  let html: string;

  beforeAll(async () => {
    const container = await AstroContainer.create();
    html = await container.renderToString(AboutPage, { props: { locale: 'ro' } });
  });

  it('renders the masthead, the one prose section and the closing — nothing else', () => {
    expect(html).toContain('id="ab-title"');
    expect(html).toContain('id="ab-how-h"');
    for (const removed of ['ab-who', 'ab-steps', 'ab-exp', 'ab-facts', 'ab-tools', 'ab-close-say']) {
      expect(html, removed).not.toContain(removed);
    }
  });

  it('offers the three onward paths, Services included, in the IA order', () => {
    const onward = html.slice(html.indexOf('ab-onward'));
    const work = onward.indexOf('Vezi proiectele');
    const services = onward.indexOf('Servicii');
    const contact = onward.indexOf('Discutăm despre un proiect');
    expect(work).toBeGreaterThan(-1);
    expect(services).toBeGreaterThan(work);
    expect(contact).toBeGreaterThan(services);
  });

  it('renders the locked footer statement', () => {
    expect(html).toContain('Atelier multidisciplinar din Cluj-Napoca.');
  });

  it('names no decorative plate and emits no fixture marker', () => {
    expect(html).not.toMatch(/aria-label=""/);
    for (const pattern of FORBIDDEN) expect(html).not.toMatch(pattern);
  });
});
