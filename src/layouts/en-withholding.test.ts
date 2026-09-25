/**
 * EN WITHHELD for the initial launch — proven at the layout and at every EN page file.
 *
 *   1. BaseLayout on an RO page emits no hreflang, no link into /en/ and no language toggle.
 *   2. Every file under src/pages/en/ emits nothing: static pages return an empty 404 (Astro's
 *      static build writes no file for it) and dynamic pages return no paths.
 *
 * The reversal is proven in `en-published.test.ts`; the flag is `lib/i18n/publication.ts`.
 */
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';

import BaseLayout from './BaseLayout.astro';

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
});

type EnPageModule = {
  default: Parameters<AstroContainer['renderToResponse']>[0];
  getStaticPaths?: () => Promise<unknown[]>;
};

const EN_PAGES = import.meta.glob<EnPageModule>('../pages/en/**/*.astro', { eager: true });

describe('BaseLayout on RO pages while EN is withheld', () => {
  const cases = [
    { name: 'static route', props: { routeKey: 'contact' } },
    { name: 'entity with both slugs', props: { routeKey: 'workEntry', slugs: { ro: 'a', en: 'b' } } },
  ] as const;

  for (const { name, props } of cases) {
    it(`${name}: no hreflang, no /en/ link, no language toggle`, async () => {
      const html = await container.renderToString(BaseLayout, {
        props: { locale: 'ro', rhythm: 'homepage', title: 't', ...props },
      });

      expect(html).toContain('<html lang="ro"');
      expect(html).not.toContain('hreflang=');
      expect(html).not.toContain('href="/en');
      expect(html).not.toContain('class="en"');
      expect(html).not.toContain('lang="en"');
      expect(html).not.toContain('aria-disabled="true"');
    });
  }
});

describe('no EN page is emitted', () => {
  it('covers all ten EN page files', () => {
    expect(Object.keys(EN_PAGES)).toHaveLength(10);
  });

  for (const [path, mod] of Object.entries(EN_PAGES)) {
    if (mod.getStaticPaths) {
      it(`${path}: getStaticPaths returns no paths`, async () => {
        expect(await mod.getStaticPaths!()).toEqual([]);
      });
    } else {
      it(`${path}: renders an empty 404 (no file written)`, async () => {
        const response = await container.renderToResponse(mod.default);
        expect(response.status).toBe(404);
        expect(await response.text()).toBe('');
      });
    }
  }
});
