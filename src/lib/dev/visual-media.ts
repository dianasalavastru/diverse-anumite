/**
 * Development-only visual QA media — the render-layer lookup.
 *
 * OWNER: Workstream A. **Not production architecture, and not content.**
 *
 * ── THE ONE RULE ───────────────────────────────────────────────────────────────────────────
 *
 *     real Sanity image  →  use it
 *     no real image + DEV_VISUAL_MEDIA=true  →  temporary local visual-QA image
 *     otherwise  →  the existing Plate fallback
 *
 * Real media always wins. This module is only ever consulted *after* `isRenderableAsset` has
 * already said no, and it is the sole caller-visible surface of the overlay: `Plate.astro` asks
 * it a question and gets an image or `null`.
 *
 * ── WHY THIS IS NOT IN THE CONTENT LAYER ───────────────────────────────────────────────────
 *
 * It would have been less code to synthesise an `ImageAsset` inside `fixtures.ts` or to have
 * `ContentSource` fill an absent `cover`. Both were rejected, and the reason is the same one
 * `build-source.ts` gives for refusing to fall back to fixtures: the moment invented media has
 * a `ContentSource` shape, every consumer downstream — `derive.ts`, the archive's masonry
 * sizing, `Gallery`'s inspectability test, the Media Viewer — is entitled to believe it is
 * content. `WorkEntry.cover` would stop meaning "the cover the CMS holds".
 *
 * So the substitution lives in the *rendering* layer and nowhere else. The domain model is
 * untouched: `entry.cover` is still `null`, `entry.gallery` is still `[]`, and every predicate
 * over them still tells the truth. Only the pixels painted into an already-empty box change.
 *
 * ── WHY `process.env` AND NOT `import.meta.env` ────────────────────────────────────────────
 *
 * The same reason `build-source.ts` gives at length: `import.meta.env` is compile-time
 * substitution, and referencing the object as a whole makes Vite inline *the entire
 * environment* into the emitted chunk. That is how a read token once reached `dist/chunks/`.
 * This flag is not a secret, but the mechanism is indiscriminate — reading it through
 * `import.meta.env` would put a live switch into the bundle and hand the credential guard a
 * fresh way to be surprised. A runtime `process.env` read is opaque to the bundler, which is
 * precisely what is wanted: nothing about this module can survive into a client bundle.
 *
 * `nodeProcess()` is the same narrow accessor `build-source.ts` uses, and for the same reason —
 * the web app's TypeScript program is browser-typed on purpose, and declaring a Node global
 * here would widen that surface for every file in `src/`.
 */

import { readFileSync } from 'node:fs';

/** Mirrors `scripts/dev-visual-media.mjs`. Two files, one literal each; asserted equal by test. */
const FLAG = 'DEV_VISUAL_MEDIA';
const CACHE_DIR = '.dev-visual-media';
const MANIFEST_FILE = 'manifest.json';
const PUBLIC_PREFIX = '/dev-visual-media/';

/** The owner's own folder names. Not a taxonomy, and never asserted to depict a Work Entry. */
export type DevMediaPool = 'architecture' | 'reality-capture' | 'general';

export interface DevVisualImage {
  readonly src: string;
  readonly width: number;
  readonly height: number;
}

interface ManifestEntry {
  readonly file: string;
  readonly width: number;
  readonly height: number;
  readonly source: string;
}

interface Manifest {
  readonly pools: Record<string, readonly ManifestEntry[] | undefined>;
}

interface NodeProcess {
  readonly env?: Record<string, string | undefined>;
  cwd?(): string;
}

const nodeProcess = (): NodeProcess => (globalThis as { process?: NodeProcess }).process ?? {};

/**
 * Exactly the string `true`, and nothing else.
 *
 * Not `Boolean(value)`, not a truthiness test, not a case-insensitive match. `DEV_VISUAL_MEDIA=0`
 * and `DEV_VISUAL_MEDIA=false` are both *off* under this rule and would both be *on* under a
 * truthiness test — and the failure direction of this switch is publishing someone's private
 * photographs. Exported for the fail-safe test.
 */
export function devVisualMediaEnabled(env: Record<string, string | undefined>): boolean {
  return env[FLAG] === 'true';
}

/**
 * Deterministic index selection — FNV-1a, byte-for-byte the algorithm in
 * `scripts/dev-visual-media.mjs`.
 *
 * `Math.random()` is what this exists to avoid. A screenshot pass is only useful if two runs of
 * the same page produce the same page, and a static build renders some surfaces more than once
 * (a Work Entry appears on the homepage, its hub, the archive and its own page). Hashing the key
 * means all four agree, across reloads and across builds.
 */
export function stableHash(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

/**
 * Resolved once. A miss is cached as a miss: without the flag this must cost one property read
 * per call and never touch the filesystem, because it is called from every media box on the site.
 */
let resolved: Manifest | null | undefined;

function manifest(): Manifest | null {
  if (resolved !== undefined) return resolved;

  if (!devVisualMediaEnabled(nodeProcess().env ?? {})) {
    resolved = null;
    return resolved;
  }

  const cwd = nodeProcess().cwd?.() ?? '.';
  try {
    const parsed: unknown = JSON.parse(
      readFileSync(`${cwd}/${CACHE_DIR}/${MANIFEST_FILE}`, 'utf8'),
    );
    const pools = (parsed as { pools?: unknown }).pools;
    resolved = pools !== null && typeof pools === 'object' ? ({ pools } as Manifest) : null;
  } catch {
    // The flag is on but nothing was prepared. The integration builds the cache before any page
    // renders, so this means the cache was deleted mid-session — fall back to the Plate rather
    // than failing a dev server the developer is actively looking at.
    resolved = null;
  }
  return resolved;
}

/**
 * A temporary image for a media box the CMS cannot fill, or `null`.
 *
 * `key` is what makes the choice stable and should identify the *surface*, not just the entry —
 * `${entry._id}:hero` and `${entry._id}:card` are deliberately different questions, so a Work
 * Entry's own hero and its archive card can differ while each stays fixed across builds.
 *
 * The returned image is **not** claimed to depict anything. Nothing here reads or writes content;
 * the association exists in the rendering layer, for this local review, and ends there.
 */
export function devVisualImage(pool: DevMediaPool, key: string): DevVisualImage | null {
  const current = manifest();
  if (current === null) return null;

  const entries = current.pools[pool];
  if (entries === undefined || entries.length === 0) return null;

  const chosen = entries[stableHash(key) % entries.length];
  if (chosen === undefined) return null;

  return {
    src: `${PUBLIC_PREFIX}${chosen.file}`,
    width: chosen.width,
    height: chosen.height,
  };
}

/** DEVELOPMENT ONLY — the pool a Service draws from, from its single pillar. */
export function devServicePool(pillar: string): DevMediaPool {
  return pillar === 'reality-capture' ? 'reality-capture' : 'architecture';
}

/** DEVELOPMENT ONLY — the key a Service's lead image is chosen by. */
export function devServiceKey(serviceId: string): string {
  return `${serviceId}:service-hero`;
}

/**
 * DEVELOPMENT ONLY — the temporary lead image for a Service that has none.
 *
 * Exists because two components must reach the *same* answer: `Orientation.astro` decides
 * whether to render the image-led block, and `ServicePage.astro` decides whether the global
 * header sits `on-hero` over it. Those two agreeing is not optional — a light-on-dark header
 * over a page with no hero behind it is unreadable — so the decision is made once, here, rather
 * than duplicated as two expressions that can drift apart.
 */
export function devServiceHero(serviceId: string, pillar: string): DevVisualImage | null {
  return devVisualImage(devServicePool(pillar), devServiceKey(serviceId));
}

/**
 * Pool for a pillar. Cross-pillar entries carry a `secondary` pillar too, and which pool they
 * draw from is decided by the same hash as the image itself — deterministic, and different
 * entries land in different pools rather than the whole cross-pillar set skewing one way.
 */
export function poolForPillar(
  primary: string,
  secondary: readonly string[] = [],
  key = '',
): DevMediaPool {
  const pillars = [primary, ...secondary];
  const architecture = pillars.includes('architecture-design');
  const capture = pillars.includes('reality-capture');

  if (architecture && capture) {
    return stableHash(`${key}:pillar`) % 2 === 0 ? 'architecture' : 'reality-capture';
  }
  if (capture) return 'reality-capture';
  return 'architecture';
}
