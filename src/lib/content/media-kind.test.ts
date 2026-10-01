import { describe, expect, it } from 'vitest';

import { coverKindOf, isProjectGalleryImage, mediaKindOf } from './media-kind.js';

describe('Media kind', () => {
  it('reads an explicit drawing and treats everything else as a photo', () => {
    expect(mediaKindOf('drawing')).toBe('drawing');
    expect(mediaKindOf('photo')).toBe('photo');
    expect(mediaKindOf(undefined)).toBe('photo');
    expect(mediaKindOf(null)).toBe('photo');
    expect(mediaKindOf('render')).toBe('photo');
  });

  it('reads a cover as a drawing only through its own gallery twin', () => {
    const gallery = [
      { assetId: 'image-a', kind: 'drawing' },
      { assetId: 'image-b', kind: null },
    ];
    expect(coverKindOf('image-a', gallery)).toBe('drawing');
    // The twin is present but unmarked: unset means photo.
    expect(coverKindOf('image-b', gallery)).toBe('photo');
    // A drawing elsewhere in the gallery says nothing about the cover.
    expect(coverKindOf('image-c', gallery)).toBe('photo');
    expect(coverKindOf(null, gallery)).toBe('photo');
    expect(coverKindOf('image-a', [])).toBe('photo');
  });

  it('is offered only on Project gallery items', () => {
    expect(isProjectGalleryImage('workEntry', ['gallery', { _key: 'a' }, 'kind'])).toBe(true);
    // The same shared image type elsewhere: Project cover, capture still, Service hero.
    expect(isProjectGalleryImage('workEntry', ['cover', 'kind'])).toBe(false);
    expect(isProjectGalleryImage('workEntry', ['capture', 'derivative', 'poster', 'kind'])).toBe(false);
    expect(isProjectGalleryImage('service', ['hero', 'kind'])).toBe(false);
    expect(isProjectGalleryImage(undefined, undefined)).toBe(false);
  });
});
