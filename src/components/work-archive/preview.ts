/**
 * The archive's project preview — orientation classification and composition.
 *
 * OWNERSHIP: Workstream A. Pure, DOM-free, unit-tested — the same contract
 * `masonry.ts` keeps, and for the same reason: this decides *shape*, never which
 * project leads or in what order projects fall.
 *
 * ── WHAT PROBLEM THIS SOLVES ───────────────────────────────────────────────
 * Every desktop project unit shows a small contact sheet of its own gallery. A
 * single three-equal-columns treatment is right for three portraits — and wrong
 * for three landscapes, which it squeezes into slots they were not shot for.
 *
 * So the rule is: **standardize the outer footprint, not the internal image
 * shapes.** The sheet occupies roughly the same area in every project; how it is
 * divided is derived from the intrinsic proportions of the assets it holds. The
 * derivation is deterministic and lives here, as one exported function, rather
 * than as conditionals spread through a template and a stylesheet.
 *
 * ── WHY IT IS NOT DERIVED FROM CONTENT METADATA ────────────────────────────
 * `CONTENT_MODEL.md` has no media-type axis: an `ImageAsset` carries an id, a
 * URL, dimensions, an authored alt, a hotspot and a crop, and nothing that
 * distinguishes a photograph from an elevation. Adding one purely to lay out an
 * archive sheet would be a content-model change in service of a stylesheet,
 * which §7 of the Inventory forbids. Dimensions are already there, they are
 * already true of the asset, and orientation is a property of the image rather
 * than a claim about its subject — so orientation is what this reads.
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

/**
 * ── THE SQUARE RULE ────────────────────────────────────────────────────────
 * A near-square image does NOT get a fifth composition. It behaves as a
 * landscape, always — not by majority vote of the other two frames, and not by
 * position.
 *
 * One rule rather than a balancing act, because a balancing act does not survive
 * its own examples: `P + P + S` wants the square in the wider region (the brief's
 * own reading) while `L + L + S` wants it beside the landscapes, and "landscape"
 * is the single answer that satisfies both. It is also the non-destructive one —
 * every slot in every composition is either portrait-shaped or landscape-shaped,
 * a square sits comfortably in the wider of the two, and the frame's fitting rule
 * (see `mediaFit`) then contains rather than crops whatever is left over.
 */
const slotOrientation = (asset: Proportioned | null): 'portrait' | 'landscape' =>
  classifyAspectRatio(asset) === 'portrait' ? 'portrait' : 'landscape';

/* -------------------------------------------------------------------------- */
/* Composition                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * The semantic layout token published to CSS as `data-preview-layout`.
 *
 * It is the sheet's orientation signature, portraits first: `ppp`, `ppl`, `pll`,
 * `lll` for the standard three-frame sheet, and `p` · `l` · `pp` · `pl` · `ll`
 * for the degraded sheets an entry with fewer than three gallery images
 * produces. The stylesheet reads the token and nothing else — no count class, no
 * pillar, no entry type, no prominence.
 */
export type PreviewLayout = 'p' | 'l' | 'pp' | 'pl' | 'll' | 'ppp' | 'ppl' | 'pll' | 'lll';

export interface PreviewComposition<T> {
  readonly layout: PreviewLayout;
  /** The same frames, partitioned portraits-first. Never re-ordered within a group. */
  readonly frames: readonly T[];
}

/**
 * Group the frames into a composition.
 *
 * ── SOURCE ORDER VS COMPOSITION ────────────────────────────────────────────
 * Orientation decides the FAMILY; source order decides everything inside it.
 * `P,L,L` · `L,P,L` · `L,L,P` are one composition (`pll`) because they hold the
 * same shapes, and the portrait anchors it in all three — otherwise the sheet's
 * grammar would depend on the order an editor happened to upload in, which is
 * not an editorial decision anyone is making. Within each orientation group the
 * editor's order is preserved exactly, so the first landscape is always the
 * dominant one.
 *
 * Nothing here is random and nothing is per-project: the same three assets always
 * produce the same sheet, in every build.
 */
export function previewComposition<T>(
  frames: readonly T[],
  /* A frame is rarely just its dimensions — the archive's carries a CMS asset, a dev-overlay key
     and, on the way out, a fitting decision. The accessor keeps this module ignorant of all of
     that: it composes anything it can measure. */
  proportionsOf: (frame: T) => Proportioned | null,
): PreviewComposition<T> | null {
  if (frames.length === 0) return null;

  const isPortrait = (frame: T) => slotOrientation(proportionsOf(frame)) === 'portrait';
  const portraits = frames.filter((frame) => isPortrait(frame));
  const landscapes = frames.filter((frame) => !isPortrait(frame));

  return {
    layout: `${'p'.repeat(portraits.length)}${'l'.repeat(landscapes.length)}` as PreviewLayout,
    frames: [...portraits, ...landscapes],
  };
}

/* -------------------------------------------------------------------------- */
/* Fitting                                                                     */
/* -------------------------------------------------------------------------- */

export type MediaFit = 'cover' | 'contain';

/**
 * How much of a slot's proportions an asset may miss before filling it becomes
 * destructive.
 *
 * At 1.14 the worst permitted `cover` discards ~12% of one dimension — a trim
 * that reads as framing. Beyond it the crop starts removing composition, and the
 * asset is contained on the plate tone instead.
 */
export const FIT_TOLERANCE = 1.14;

/**
 * ── WHY A DEVIATION TEST AND NOT A MEDIA-TYPE FLAG ─────────────────────────
 * This archive holds photography, elevations, plans, exploded diagrams,
 * competition boards and Reality Capture orthophotos, and the layout must not
 * destroy the graphic ones — a board cropped to a slot is a board with its title
 * block missing. The obvious solution is a media-type field, and there isn't one:
 * see this module's header for why one is not being added.
 *
 * What IS available is the asset's own aspect ratio, and it answers the question
 * that actually matters. `cover` is only destructive when the asset and its slot
 * disagree, and they disagree most exactly where it hurts most — a full-bleed
 * board or a portrait scan in a landscape slot. So the rule bounds the crop
 * rather than guessing the subject: fill the slot while the trim stays within
 * `FIT_TOLERANCE`, and contain on the plate tone once it would not.
 *
 * Measured against the current set this puts every board, elevation and portrait
 * scan on `contain` and the site and drone photography on `cover`, which is the
 * intended split arrived at without asserting anything about what the pictures
 * depict.
 *
 * REPORTED LIMITATION: it is a proxy. A photograph shot at 2:1 is contained even
 * though cropping it would be safe. That is the conservative direction, and it is
 * the price of having no media-type signal.
 */
export function mediaFit(asset: Proportioned | null, slotRatio: number): MediaFit {
  if (!asset || asset.width <= 0 || asset.height <= 0 || slotRatio <= 0) return 'contain';

  const ratio = asset.width / asset.height;
  const deviation = ratio > slotRatio ? ratio / slotRatio : slotRatio / ratio;
  return deviation <= FIT_TOLERANCE ? 'cover' : 'contain';
}

/**
 * The slot proportions each composition offers, as the stylesheet builds them.
 *
 * Declared here rather than inferred, because `mediaFit` needs the number at
 * BUILD time and the stylesheet only has it at layout time. The two must agree:
 * these are the ratios A-5a's compositions actually produce, and the test in
 * `preview.test.ts` is the reminder to change both together.
 */
export const PORTRAIT_SLOT = 3 / 4;
export const LANDSCAPE_SLOT = 3 / 2;

/** The register's primary-media box — one ratio for every project (see A-5a). */
export const COVER_SLOT = 3 / 2;

/** The slot a frame lands in, from the same orientation rule the layout token uses. */
export function slotRatioFor(frame: Proportioned | null): number {
  return slotOrientation(frame) === 'portrait' ? PORTRAIT_SLOT : LANDSCAPE_SLOT;
}
