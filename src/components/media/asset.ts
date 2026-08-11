/**
 * Whether a content image asset can actually be fetched.
 *
 * OWNERSHIP: Workstream A.
 *
 * §9 puts production media on the **Sanity image CDN**, so a real asset always
 * carries an absolute origin. B's Phase-0 fixtures carry root-relative paths
 * (`/fixtures/…`) into a directory that does not exist in the build, and
 * rendering them would 404 on every page load.
 *
 * Testing the origin rather than an id prefix keeps this independent of B's
 * fixture naming — which has already changed once — and makes I-3 a no-op:
 * every CDN URL is absolute, so every asset becomes renderable with no edit
 * here. Introducing genuinely self-hosted local media later is a deliberate
 * change to this one predicate.
 *
 * EXTRACTED AT THE WORK ENTRY BUILD. The predicate was private to `Plate.astro`
 * until a second surface needed it: the Gallery must decide whether a media item
 * is *inspectable* — a figure with no fetchable photograph has nothing to open
 * in the Media Viewer, and offering a zoom affordance over an authored plate
 * tone would be an empty promise. Two copies of one predicate is exactly the
 * drift the codebase avoids elsewhere, so there is one declaration and both
 * surfaces import it.
 */
import type { ImageAsset } from '../../lib/content';

export function isRenderableAsset(asset: ImageAsset | null | undefined): asset is ImageAsset {
  return asset != null && /^https?:\/\//.test(asset.url);
}
