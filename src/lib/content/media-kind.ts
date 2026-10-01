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
 * The kind of a Project's COVER. The hint is authored on gallery items only (Studio offers it
 * nowhere else), so a cover is a drawing exactly when its own asset appears in the gallery marked
 * `drawing`. One rule for every surface that asks: the Project hero reads it against the full
 * gallery, the archive's GROQ projection computes the same match as `coverKind`, and the
 * fixtures mirror that projection through this function.
 */
export const coverKindOf = (
  coverAssetId: string | null | undefined,
  gallery: readonly { readonly assetId?: string | null; readonly kind?: unknown }[],
): MediaKind =>
  coverAssetId != null &&
  gallery.some((item) => item.assetId === coverAssetId && mediaKindOf(item.kind) === 'drawing')
    ? 'drawing'
    : 'photo';

/**
 * Whether a field inside the shared `imageWithAlt` type belongs to a Project GALLERY item. The
 * type is shared with the Project cover, the capture still and the Service hero; the `kind`
 * field is offered only here. `path` is the field's own path, e.g. `['gallery', {_key}, 'kind']`.
 */
export const isProjectGalleryImage = (
  documentType: string | undefined,
  path: readonly unknown[] | undefined,
): boolean => documentType === 'workEntry' && Array.isArray(path) && path[0] === 'gallery';
