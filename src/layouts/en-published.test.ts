/**
 * REVERSIBILITY — flipping `PUBLISHED_LOCALES` to include EN restores the EN surface.
 *
 * The publication module is mocked to `['ro', 'en']`. All four exports are overridden because
 * the functions' default parameter captures the module-internal flag, not the mocked export.
 * Nothing else is mocked: the layout, header, route map and EN page are the real ones.
 */
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('../lib/i18n/publication', async (importOriginal) => {
  const real = await importOriginal<typeof import('../lib/i18n/publication')>();
  const BOTH = ['ro', 'en'] as const;
  return {
    ...real,
    PUBLISHED_LOCALES: BOTH,
    isLocalePublished: (locale: 'ro' | 'en') => real.isLocalePublished(locale, BOTH),
    withheldLocaleResponse: (locale: 'ro' | 'en') => real.withheldLocaleResponse(locale, BOTH),
    publishedHreflangAlternates: (
      key: Parameters<typeof real.publishedHreflangAlternates>[0],
      slugs?: Parameters<typeof real.publishedHreflangAlternates>[1],
    ) => real.publishedHreflangAlternates(key, slugs, BOTH),
  };
});

import BaseLayout from './BaseLayout.astro';
import EnAbout from '../pages/en/about.astro';

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
});

describe('EN published again (flag flipped)', () => {
  it('restores the reciprocal hreflang set and the language toggle on an RO page', async () => {
    const html = await container.renderToString(BaseLayout, {
      props: { locale: 'ro', rhythm: 'homepage', title: 't', routeKey: 'contact' },
    });

    expect(html).toContain('hreflang="ro"');
    expect(html).toContain('hreflang="en" href="/en/contact"');
    expect(html).toContain('hreflang="x-default"');
    expect(html).toMatch(/<a class="en" href="\/en\/contact"/);
  });

  it('keeps the per-entity rule: an entity with no EN slug gets no pair and a disabled toggle', async () => {
    const html = await container.renderToString(BaseLayout, {
      props: { locale: 'ro', rhythm: 'service', title: 't', routeKey: 'service', slugs: { ro: 'a' } },
    });

    expect(html).not.toContain('hreflang=');
    expect(html).toContain('aria-disabled="true"');
    expect(html).not.toMatch(/<a class="en"/);
  });

  it('renders an EN page again instead of withholding it', async () => {
    const response = await container.renderToResponse(EnAbout);
    expect(response.status).toBe(200);
    expect(await response.text()).toContain('<html lang="en"');
  });
});
