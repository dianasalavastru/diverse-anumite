/**
 * Media kind — the one editorial hint a Project gallery image may carry.
 *
 * Owner decision (2026-10-01): an optional `kind` on gallery images, `photo` or `drawing`, and
 * nothing more. It is a LAYOUT hint, not a taxonomy: a `drawing` (plan, board, section,
 * elevation) is shown on a neutral ground, without the grey grade photographs rest at, and is
 * never cropped; everything else is a `photo`. Unset and unknown values are `photo`, so no
 * existing document needs migrating.
 *
 * Pure and shared: the Studio schema (`studio/schemaTypes/objects.ts`) imports
 * `isProjectGalleryImage` to show the field only where it means something, and the content layer
 * reads values through `mediaKindOf`.
 */

export const MEDIA_KINDS = ['photo', 'drawing'] as const;

export type MediaKind = (typeof MEDIA_KINDS)[number];

/** Anything other than an explicit `drawing` — including absence — is a photograph. */
export const mediaKindOf = (value: unknown): MediaKind => (value === 'drawing' ? 'drawing' : 'photo');

/**
 * Whether a field inside the shared `imageWithAlt` type belongs to a Project GALLERY item. The
 * type is shared with the Project cover, the capture still and the Service hero; the `kind`
 * field is offered only here. `path` is the field's own path, e.g. `['gallery', {_key}, 'kind']`.
 */
export const isProjectGalleryImage = (
  documentType: string | undefined,
  path: readonly unknown[] | undefined,
): boolean => documentType === 'workEntry' && Array.isArray(path) && path[0] === 'gallery';
