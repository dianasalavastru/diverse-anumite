import { describe, expect, it } from 'vitest';

import { heroLayoutForRatio, heroMediaFor } from './hero-layout.js';

const cover = (width: number, height: number) => ({
  assetId: 'image-x',
  url: 'https://cdn.sanity.io/images/p/d/x.jpg',
  width,
  height,
  alt: { ro: 'x', en: null },
  hotspot: null,
  crop: null,
});

describe('Work Entry hero layout', () => {
  it('keeps a landscape cover full-bleed', () => {
    expect(heroLayoutForRatio(1.5)).toBe('bleed');
    expect(heroMediaFor({ _id: 'a', pillar: 'architecture-design', cover: cover(2400, 1600) }).layout).toBe('bleed');
  });

  it('splits square, portrait and very tall covers', () => {
    expect(heroMediaFor({ _id: 'a', pillar: 'architecture-design', cover: cover(1400, 1400) }).layout).toBe('split');
    expect(heroMediaFor({ _id: 'a', pillar: 'architecture-design', cover: cover(900, 1400) }).layout).toBe('split');
    expect(heroMediaFor({ _id: 'a', pillar: 'architecture-design', cover: cover(700, 1700) }).layout).toBe('split');
  });

  it('keeps the authored full-bleed plate when there is no image', () => {
    expect(heroLayoutForRatio(null)).toBe('bleed');
    expect(heroMediaFor({ _id: 'a', pillar: 'architecture-design', cover: null }).layout).toBe('bleed');
  });

  it('splits a drawing cover whatever its ratio, recognised through its gallery twin', () => {
    const board = cover(2400, 1700);
    const asDrawing = heroMediaFor({
      _id: 'a',
      pillar: 'architecture-design',
      cover: board,
      gallery: [{ assetId: board.assetId, kind: 'drawing' }],
    });
    expect(asDrawing).toMatchObject({ layout: 'split', drawing: true });

    const asPhoto = heroMediaFor({
      _id: 'a',
      pillar: 'architecture-design',
      cover: board,
      gallery: [{ assetId: board.assetId, kind: 'photo' }, { assetId: 'other', kind: 'drawing' }],
    });
    expect(asPhoto).toMatchObject({ layout: 'bleed', drawing: false });
  });
});
