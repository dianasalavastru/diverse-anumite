/**
 * The gallery's `kind` hint reaches the markup: a `drawing` item carries the class its neutral,
 * ungraded, uncropped treatment hangs on; an unset item renders exactly as a photograph.
 */

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';

import Gallery from './Gallery.astro';

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
});

const image = (id: string, width: number, height: number) => ({
  assetId: `image-${id}`,
  url: `https://cdn.sanity.io/images/p/d/${id}.jpg`,
  width,
  height,
  alt: { ro: id, en: null },
  hotspot: null,
  crop: null,
});

const render = (images: readonly unknown[]) =>
  container.renderToString(Gallery, {
    props: { images, locale: 'ro', label: 'Imagini', openItem: 'Deschide imaginea' },
  });

const items = (html: string) => [...html.matchAll(/<li class="gitem ([^"]*)"/g)].map((m) => m[1]);

describe('Gallery media kind', () => {
  it('marks drawings and leaves unset items as photographs', async () => {
    const html = await render([
      { ...image('board', 2400, 1700), kind: 'drawing' },
      { ...image('photo', 2400, 1600), kind: 'photo' },
      image('unset', 2400, 1600),
    ]);
    const classes = items(html);
    expect(classes).toHaveLength(3);
    expect(classes[0]?.split(' ')).toContain('drawing');
    expect(classes[1]?.split(' ')).not.toContain('drawing');
    expect(classes[2]?.split(' ')).not.toContain('drawing');
  });

  it('gives every frame its image ratio, so nothing is cropped', async () => {
    const html = await render([{ ...image('board', 2400, 1700), kind: 'drawing' }]);
    expect(html).toContain('--r:1.4118');
  });
});
