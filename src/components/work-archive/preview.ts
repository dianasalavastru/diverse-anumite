/**
 * The archive's media orientation — one classification every archive composition reads.
 *
 * OWNERSHIP: Workstream A. Pure, DOM-free, unit-tested — the same contract
 * `masonry.ts` keeps, and for the same reason: this decides *shape*, never which
 * project leads or in what order projects fall.
 *
 * The archive field (`field.ts`) chooses its family and its slots from the
 * orientation of each image. Orientation is a property of the image rather than
 * a claim about its subject, so it is read from the asset's own dimensions; the
 * one editorial signal layered on top of it is the optional `kind` hint
 * (`media-kind.ts`), which marks a drawing.
 */

/* -------------------------------------------------------------------------- */
/* Orientation                                                                 */
/* -------------------------------------------------------------------------- */

/** Anything with intrinsic proportions — a CMS `ImageAsset` or a dev-overlay stand-in. */
export interface Proportioned {
  readonly width: number;
  readonly height: number;
}

export type Orientation = 'portrait' | 'landscape' | 'square';

/**
 * The two thresholds, measured against the assets this archive actually holds.
 *
 * The dataset's real proportions cluster hard: the architectural boards and
 * elevations sit at 1.41–1.80, the drone and site photography at 1.33–1.50, the
 * phone-shot interiors at 0.63–0.64, the tall board scans at 0.71, and one
 * screen capture at 1.30. Nothing in the set falls between 0.72 and 1.29, so any
 * pair of thresholds inside that gap classifies today's assets identically; 0.9
 * and 1.15 are chosen because they are the conventional near-square band and
 * because they leave the widest margin on both sides of the observed gap. An
 * asset landing inside the band is genuinely undecidable from its proportions
 * alone, which is exactly what `square` means here.
 */
export const PORTRAIT_BELOW = 0.9;
export const LANDSCAPE_ABOVE = 1.15;

export function classifyAspectRatio(asset: Proportioned | null): Orientation {
  /* An asset with no usable dimensions cannot be measured, and the sheet still
     has to compose. Landscape is the safe default: it is the wider slot, so a
     portrait placed in it is letterboxed rather than cropped. */
  if (!asset || asset.width <= 0 || asset.height <= 0) return 'landscape';

  const ratio = asset.width / asset.height;
  if (ratio < PORTRAIT_BELOW) return 'portrait';
  if (ratio > LANDSCAPE_ABOVE) return 'landscape';
  return 'square';
}
