/**
 * The archive field's image requests — Sanity crop, hotspot and width variants.
 *
 * OWNERSHIP: Workstream A. Pure; no DOM, no Astro.
 *
 * ── WHERE EACH PART OF A CROP HAPPENS ──────────────────────────────────────
 *   · the editor's CROP RECTANGLE is applied by the image CDN (`rect=`), so the field only ever
 *     receives the part of the image the editor kept, and plans against those proportions;
 *   · the slot's own crop is CSS `object-fit: cover`, because the field's slot proportions vary
 *     with the viewport (`field.ts`, "LOGICAL VS PHYSICAL") and one CDN crop cannot be right at
 *     every width;
 *   · the HOTSPOT positions that CSS crop (`object-position`), re-expressed inside the cropped
 *     rectangle. With no hotspot the crop is centred.
 *
 * Drawings use the same request without any of the cover-specific positioning: they are
 * contained, so there is nothing to position.
 *
 * Only the archive field reads this. The Project detail page renders its media uncropped and is
 * untouched (#116, "Project detail media is never cropped").
 */

import type { ImageAsset, ImageCrop, ImageHotspot } from '../../lib/content';

/** The widths the CDN is asked for. The browser picks one per slot from `sizes`. */
export const FIELD_WIDTHS = [480, 720, 960, 1280, 1600, 2000] as const;

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

/** A crop is only real when it removes something; Sanity stores zeros for "uncropped". */
const activeCrop = (crop: ImageCrop | null): ImageCrop | null =>
  crop && crop.top + crop.bottom + crop.left + crop.right > 0 ? crop : null;

/** The editor's crop rectangle in source pixels, or `null` for the whole image. */
export function cropRect(
  asset: Pick<ImageAsset, 'width' | 'height' | 'crop'>,
): { x: number; y: number; width: number; height: number } | null {
  const crop = activeCrop(asset.crop);
  if (!crop) return null;
  const x = Math.round(asset.width * clamp01(crop.left));
  const y = Math.round(asset.height * clamp01(crop.top));
  const width = Math.max(1, Math.round(asset.width * clamp01(1 - crop.left - crop.right)));
  const height = Math.max(1, Math.round(asset.height * clamp01(1 - crop.top - crop.bottom)));
  return { x, y, width, height };
}

/** The proportions the field plans against: the editor's crop, when there is one. */
export function effectiveSize(asset: Pick<ImageAsset, 'width' | 'height' | 'crop'>): {
  width: number;
  height: number;
} {
  const rect = cropRect(asset);
  return rect ? { width: rect.width, height: rect.height } : { width: asset.width, height: asset.height };
}

/** One CDN request: crop rectangle first, then a width, in a modern format where supported. */
export function fieldImageUrl(asset: Pick<ImageAsset, 'url' | 'width' | 'height' | 'crop'>, width: number): string {
  const rect = cropRect(asset);
  const params = new URLSearchParams();
  if (rect) params.set('rect', `${rect.x},${rect.y},${rect.width},${rect.height}`);
  params.set('w', String(Math.round(width)));
  params.set('fit', 'max');
  params.set('auto', 'format');
  params.set('q', '75');
  return `${asset.url}?${params.toString()}`;
}

/** `srcset` over the widths the asset can actually supply — never an upscale. */
export function fieldSrcset(asset: Pick<ImageAsset, 'url' | 'width' | 'height' | 'crop'>): string {
  const available = effectiveSize(asset).width;
  const widths = FIELD_WIDTHS.filter((width) => width < available);
  return [...widths, Math.min(available, FIELD_WIDTHS[FIELD_WIDTHS.length - 1])]
    .map((width) => `${fieldImageUrl(asset, width)} ${width}w`)
    .join(', ');
}

/**
 * The hotspot as an `object-position`, inside the cropped rectangle. A percentage position puts
 * the hotspot's point at the same relative place in the slot, so the hotspot is always visible
 * whatever the slot's proportions. Centre when the editor set none.
 */
export function hotspotPosition(asset: { readonly hotspot: ImageHotspot | null; readonly crop: ImageCrop | null }): string {
  const hotspot = asset.hotspot;
  if (!hotspot) return '50% 50%';
  const crop = activeCrop(asset.crop) ?? { top: 0, bottom: 0, left: 0, right: 0 };
  const spanX = 1 - crop.left - crop.right;
  const spanY = 1 - crop.top - crop.bottom;
  const x = spanX > 0 ? clamp01((hotspot.x - crop.left) / spanX) : 0.5;
  const y = spanY > 0 ? clamp01((hotspot.y - crop.top) / spanY) : 0.5;
  const percent = (value: number) => `${Math.round(value * 1000) / 10}%`;
  return `${percent(x)} ${percent(y)}`;
}
