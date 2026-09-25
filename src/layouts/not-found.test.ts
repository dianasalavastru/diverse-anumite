/**
 * The production 404 page: exactly the three approved strings, noindex, no
 * hreflang / language toggle, and nothing the placeholder scan would flag.
 */
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';

import NotFound from '../pages/404.astro';
import { notFoundMessages } from '../lib/i18n/not-found';

/* The patterns of scripts/verify-no-placeholder-content.mjs, restated. */
const FORBIDDEN = [
  /\bTEST\b/,
  /\bdemo\b/i,
  /substituent/i,
  /placeholder/i,
  /\bTODO\b|\bFIXME\b|\bTBD\b/,
  /data-fixture/,
  /href="[^"]*\/test-/,
  /\d{1,3}\.\d+°\s*[NS]/,
  /\bh\s*—\s*\d+(\.\d+)?\s*m\b/,
];

let html: string;

beforeAll(async () => {
  const container = await AstroContainer.create();
  html = await container.renderToString(NotFound);
});

describe('404 page', () => {
  it('carries the approved copy verbatim', () => {
    expect(notFoundMessages()).toMatchObject({
      heading: 'Pagina nu a fost găsită.',
      body: 'Pagina pe care o cauți nu există sau a fost mutată.',
      home: 'Înapoi la pagina principală',
    });
  });

  it('renders the heading, body and a link home', () => {
    expect(html).toMatch(/<h1[^>]*>Pagina nu a fost găsită\.<\/h1>/);
    expect(html).toContain('Pagina pe care o cauți nu există sau a fost mutată.');
    expect(html).toMatch(/<a href="\/"[^>]*>\s*Înapoi la pagina principală/);
  });

  it('is RO, noindex, with no hreflang and no language toggle', () => {
    expect(html).toContain('<html lang="ro"');
    expect(html).toContain('<meta name="robots" content="noindex"');
    expect(html).not.toContain('hreflang=');
    expect(html).not.toContain('href="/en');
    expect(html).not.toContain('class="en"');
  });

  it('marks no header nav item as current', () => {
    expect(html).not.toContain('aria-current="page"');
  });

  it('trips none of the placeholder-scan patterns', () => {
    for (const pattern of FORBIDDEN) expect(html).not.toMatch(pattern);
  });
});
