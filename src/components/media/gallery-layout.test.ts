/**
 * The gallery's composition is a function of image orientation, in editor order — never of
 * position, and never a crop. See gallery-layout.ts.
 */

import { describe, expect, it } from 'vitest';

import { FALLBACK_RATIO, layoutGallery, orientationOf, ratioOf } from './gallery-layout.js';

const landscape = { width: 2400, height: 1600 };
const square = { width: 1400, height: 1400 };
const portrait45 = { width: 1120, height: 1400 };
const portrait23 = { width: 900, height: 1400 };
const tall = { width: 700, height: 1680 };

const shape = (images: Parameters<typeof layoutGallery>[0]) =>
  layoutGallery(images).map((cell) => cell.placement);

describe('Orientation', () => {
  it('classifies by ratio', () => {
    expect(orientationOf(ratioOf(2400, 1600))).toBe('landscape');
    expect(orientationOf(ratioOf(1400, 1400))).toBe('square');
    expect(orientationOf(ratioOf(1120, 1400))).toBe('portrait');
    expect(orientationOf(ratioOf(900, 1400))).toBe('portrait');
    expect(orientationOf(ratioOf(700, 1680))).toBe('tall');
  });

  it('falls back to the plate ratio when an asset has no dimensions', () => {
    expect(ratioOf(0, 0)).toBe(FALLBACK_RATIO);
    expect(ratioOf(undefined, 1200)).toBe(FALLBACK_RATIO);
    expect(orientationOf(FALLBACK_RATIO)).toBe('landscape');
  });
});

describe('Composition', () => {
  it('gives a landscape image its own full row', () => {
    expect(shape([landscape])).toEqual(['full']);
    expect(shape([landscape, landscape])).toEqual(['full', 'full']);
  });

  it('pairs consecutive portraits and squares at equal height', () => {
    const cells = layoutGallery([portrait23, portrait45]);
    expect(cells.map((cell) => cell.placement)).toEqual(['pair', 'pair']);
    expect(cells.map((cell) => cell.endsPair)).toEqual([false, true]);
    // Widths proportional to ratio ⇒ identical heights for any container width.
    const [a, b] = cells;
    expect((a.pairShare ?? 0) + (b.pairShare ?? 0)).toBeCloseTo(1);
    expect((a.pairShare ?? 0) / a.ratio).toBeCloseTo((b.pairShare ?? 0) / b.ratio);
    expect(shape([square, portrait45])).toEqual(['pair', 'pair']);
  });

  it('never pairs a very tall image', () => {
    expect(shape([tall, portrait45])).toEqual(['single-start', 'single-end']);
    expect(shape([portrait45, tall])).toEqual(['single-start', 'single-end']);
  });

  it('alternates singles start/end and does not let a landscape break the alternation', () => {
    expect(shape([portrait45, landscape, portrait23, landscape, square])).toEqual([
      'single-start',
      'full',
      'single-end',
      'full',
      'single-start',
    ]);
  });

  it('pairs greedily in editor order, one look-ahead', () => {
    expect(shape([portrait45, portrait23, square])).toEqual(['pair', 'pair', 'single-start']);
    expect(shape([landscape, portrait45, portrait23, tall, square])).toEqual([
      'full',
      'pair',
      'pair',
      'single-start',
      'single-end',
    ]);
  });

  it('keeps every index exactly once, in order', () => {
    const images = [landscape, portrait45, square, tall, portrait23, landscape, square, square];
    expect(layoutGallery(images).map((cell) => cell.index)).toEqual(images.map((_, index) => index));
  });

  it('handles an empty gallery', () => {
    expect(layoutGallery([])).toEqual([]);
  });
});
