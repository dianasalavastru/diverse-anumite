/**
 * Gallery layout — orientation drives composition, never position.
 *
 * The Work Entry gallery used to cycle a fixed span pattern (one 16:10 lead frame, then 4:5
 * frames) by index and fill every frame with `object-fit: cover`. That cropped plans at their
 * legends, cut very tall images to a fragment and let a portrait that happened to be first
 * become a 16:10 strip. Detail pages must not crop, so every frame now takes the image's own
 * ratio and the composition is decided by what the image *is*:
 *
 *   - landscape (ratio ≥ 1.12) — its own full-measure row;
 *   - square / portrait        — paired with the next non-landscape image at equal height,
 *                                otherwise a single narrower frame;
 *   - very tall (ratio < 0.55) — never paired, always a single constrained frame.
 *
 * Singles alternate start/end so a run of them reads as placed rather than stacked. The rule
 * is greedy and local — one look-ahead, in editor order — so reordering images changes the
 * composition predictably: moving an image only ever affects its own row and the next one.
 *
 * Pure and dimension-only, so it runs at build time from the `width`/`height` every
 * `ImageAsset` already carries; nothing is measured in the browser.
 */

export type Orientation = 'landscape' | 'square' | 'portrait' | 'tall';

export type Placement = 'full' | 'pair' | 'single-start' | 'single-end';

export interface GalleryCell {
  /** Position in the editor's order — also the Media Viewer index. */
  readonly index: number;
  readonly orientation: Orientation;
  /** width / height; a missing dimension falls back to the 16:10 plate. */
  readonly ratio: number;
  readonly placement: Placement;
  /** Share of the pair's width (pairs only): widths ∝ ratio ⇒ equal heights, nothing cropped. */
  readonly pairShare: number | null;
  /** Combined ratio of the pair (pairs only), used to cap the row's height. */
  readonly pairRatio: number | null;
  /** The row ends after this cell (the second of a pair). */
  readonly endsPair: boolean;
}

/** The authored plate ratio used when an asset reports no usable dimensions. */
export const FALLBACK_RATIO = 16 / 10;

const LANDSCAPE_MIN = 1.12;
const SQUARE_MIN = 0.9;
const TALL_MAX = 0.55;

export const ratioOf = (width: number | null | undefined, height: number | null | undefined): number =>
  typeof width === 'number' && typeof height === 'number' && width > 0 && height > 0
    ? width / height
    : FALLBACK_RATIO;

export const orientationOf = (ratio: number): Orientation => {
  if (ratio >= LANDSCAPE_MIN) return 'landscape';
  if (ratio >= SQUARE_MIN) return 'square';
  if (ratio >= TALL_MAX) return 'portrait';
  return 'tall';
};

/** Square and portrait images may share a row; landscape and very tall images never do. */
const pairable = (orientation: Orientation): boolean =>
  orientation === 'square' || orientation === 'portrait';

export const layoutGallery = (
  images: readonly { readonly width?: number | null; readonly height?: number | null }[],
): GalleryCell[] => {
  const ratios = images.map((image) => ratioOf(image.width, image.height));
  const orientations = ratios.map(orientationOf);
  const cells: GalleryCell[] = [];
  let singles = 0;

  for (let index = 0; index < images.length; index += 1) {
    const orientation = orientations[index];
    const ratio = ratios[index];

    if (orientation === 'landscape') {
      cells.push({ index, orientation, ratio, placement: 'full', pairShare: null, pairRatio: null, endsPair: false });
      continue;
    }

    const next = index + 1;
    if (pairable(orientation) && next < images.length && pairable(orientations[next])) {
      const pairRatio = ratio + ratios[next];
      for (const member of [index, next]) {
        cells.push({
          index: member,
          orientation: orientations[member],
          ratio: ratios[member],
          placement: 'pair',
          pairShare: ratios[member] / pairRatio,
          pairRatio,
          endsPair: member === next,
        });
      }
      index = next;
      continue;
    }

    cells.push({
      index,
      orientation,
      ratio,
      placement: singles % 2 === 0 ? 'single-start' : 'single-end',
      pairShare: null,
      pairRatio: null,
      endsPair: false,
    });
    singles += 1;
  }

  return cells;
};
