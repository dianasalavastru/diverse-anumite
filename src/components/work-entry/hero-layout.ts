/**
 * Work Entry hero layout — which composition the cover gets.
 *
 * The hero is a full-bleed 100vh frame with the title over the image. That is the right
 * composition for a landscape cover and the wrong one for everything else: a 2:3 cover drawn
 * into a ~1.6:1 viewport shows about 40% of itself, upscaled and soft, with the breadcrumb and
 * metadata over whatever part survived. So a cover that is not landscape takes the SPLIT
 * composition on tablet and desktop — title and metadata beside the whole image, at its own
 * ratio — and the phone keeps the full-bleed hero, where a portrait cover already fills the
 * screen almost exactly.
 *
 * The threshold is the gallery's landscape boundary, so "landscape" means one thing on the page.
 */

import type { ImageAsset } from '../../lib/content';
import { isRenderableAsset } from '../media/asset';
import { orientationOf, ratioOf } from '../media/gallery-layout';
import { devVisualImage, poolForPillar } from '../../lib/dev/visual-media';

export type HeroLayout = 'bleed' | 'split';

/** DEVELOPMENT ONLY key for the hero's visual-QA substitute — see `lib/dev/visual-media.ts`. */
export const heroDevKey = (entryId: string): string => `${entryId}:entry-hero`;

export const heroLayoutForRatio = (ratio: number | null): HeroLayout =>
  ratio !== null && orientationOf(ratio) !== 'landscape' ? 'split' : 'bleed';

export interface HeroMedia {
  readonly layout: HeroLayout;
  /** width / height of the rendered image, or `null` when the hero shows the authored plate. */
  readonly ratio: number | null;
}

/**
 * The layout for the image the hero will actually render: the cover when it is renderable,
 * otherwise the development visual-QA substitute (always `null`, hence `bleed`, in any build
 * that did not opt in). An entry with no image at all keeps the authored full-bleed plate.
 */
export function heroMediaFor(entry: {
  readonly _id: string;
  readonly pillar: string;
  readonly cover: ImageAsset | null;
}): HeroMedia {
  let ratio: number | null = null;
  if (isRenderableAsset(entry.cover)) {
    ratio = ratioOf(entry.cover.width, entry.cover.height);
  } else {
    const key = heroDevKey(entry._id);
    const dev = devVisualImage(poolForPillar(entry.pillar, key), key);
    ratio = dev ? ratioOf(dev.width, dev.height) : null;
  }
  return { layout: heroLayoutForRatio(ratio), ratio };
}
