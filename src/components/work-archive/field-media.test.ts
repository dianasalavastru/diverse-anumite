/**
 * The archive field's image requests: the editor's crop rectangle reaches the CDN, the hotspot
 * positions the CSS crop inside it, and a missing hotspot centres.
 */

import { describe, expect, it } from 'vitest';

import { cropRect, effectiveSize, fieldImageUrl, fieldSrcset, hotspotPosition } from './field-media.js';

const URL_BASE = 'https://cdn.sanity.io/images/p/d/abc-2400x1600.jpg';
const asset = {
  url: URL_BASE,
  width: 2400,
  height: 1600,
  crop: null,
  hotspot: null,
};
const cropped = { ...asset, crop: { top: 0.1, bottom: 0.1, left: 0.25, right: 0 } };

describe('Crop rectangle', () => {
  it('is absent for an uncropped image, including Sanity’s stored zeros', () => {
    expect(cropRect(asset)).toBeNull();
    expect(cropRect({ ...asset, crop: { top: 0, bottom: 0, left: 0, right: 0 } })).toBeNull();
    expect(effectiveSize(asset)).toEqual({ width: 2400, height: 1600 });
  });

  it('is converted to source pixels and drives the planned proportions', () => {
    expect(cropRect(cropped)).toEqual({ x: 600, y: 160, width: 1800, height: 1280 });
    expect(effectiveSize(cropped)).toEqual({ width: 1800, height: 1280 });
  });

  it('is applied by the CDN before the width', () => {
    const url = new URL(fieldImageUrl(cropped, 960));
    expect(url.searchParams.get('rect')).toBe('600,160,1800,1280');
    expect(url.searchParams.get('w')).toBe('960');
    expect(url.searchParams.get('fit')).toBe('max');
    expect(url.searchParams.get('auto')).toBe('format');
    expect(new URL(fieldImageUrl(asset, 960)).searchParams.has('rect')).toBe(false);
  });
});

describe('Width variants', () => {
  it('never asks for more pixels than the crop holds', () => {
    const widths = fieldSrcset({ ...asset, width: 1000, height: 800 })
      .split(', ')
      .map((candidate) => Number(candidate.split(' ')[1]?.replace('w', '')));
    expect(widths).toEqual([480, 720, 960, 1000]);
  });
});

describe('Hotspot', () => {
  it('centres when the editor set none', () => {
    expect(hotspotPosition(asset)).toBe('50% 50%');
  });

  it('positions the crop on the authored hotspot', () => {
    expect(hotspotPosition({ ...asset, hotspot: { x: 0.2, y: 0.7, width: 0.1, height: 0.1 } })).toBe('20% 70%');
  });

  it('is re-expressed inside the editor’s crop rectangle', () => {
    // x: (0.625 − 0.25) / 0.75 = 50%; y: (0.5 − 0.1) / 0.8 = 50%.
    expect(hotspotPosition({ ...cropped, hotspot: { x: 0.625, y: 0.5, width: 0.1, height: 0.1 } })).toBe('50% 50%');
    // A hotspot outside the kept rectangle is clamped to its edge rather than lost.
    expect(hotspotPosition({ ...cropped, hotspot: { x: 0.1, y: 0.5, width: 0.1, height: 0.1 } })).toBe('0% 50%');
  });
});
