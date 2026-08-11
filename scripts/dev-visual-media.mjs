#!/usr/bin/env node
/**
 * Development-only visual QA media — the build-time preparer.
 *
 * OWNER: Workstream A. **Not production architecture.** Nothing in this file, and nothing that
 * imports it, may run in a deployed build.
 *
 * ── WHAT PROBLEM THIS SOLVES ───────────────────────────────────────────────────────────────
 *
 * The CMS holds no media yet (I-4 stopped before upload: no cleared assets exist). Every media
 * surface therefore renders `Plate.astro`'s authored fallback tone, which is the honest state
 * but makes it impossible to judge crops, aspect ratios, masonry rhythm or hero legibility. The
 * owner placed temporary local imagery under `dev-assets/visual-qa/` purely to stress those
 * layouts.
 *
 * That imagery is **not content**. It is never uploaded to Sanity, never committed (see
 * `.gitignore`), and never present in a build that did not explicitly ask for it.
 *
 * ── WHY DERIVATIVES, AND NOT THE ORIGINALS ─────────────────────────────────────────────────
 *
 * The supplied originals are camera and render masters: 5280×3956 drone frames, 9933×14043
 * scans, and one 16000×8888 PNG weighing 236 MB. Serving those raw would not produce a visual
 * QA pass, it would produce a stalled browser — the thing being reviewed is layout, and layout
 * cannot be reviewed through a loading spinner. So each source is downscaled once into
 * `.dev-visual-media/` (also gitignored) and served from there.
 *
 * This is emphatically **not** the responsive image pipeline. It emits one flat WebP per source
 * at a single size. Real delivery — `srcset`, `sizes`, AVIF, and Sanity's `hotspot`/`crop` — is
 * a separate production-hardening task against real assets on the Sanity CDN, and nothing here
 * should be mistaken for a head start on it.
 *
 * ── THE FLAG IS THE ONLY SWITCH ────────────────────────────────────────────────────────────
 *
 * `DEV_VISUAL_MEDIA=true`, read from the real environment. Deliberately **not** derived from
 * `NODE_ENV`, `import.meta.env.DEV`, or the presence of the asset directory: every one of those
 * is a condition that can become true by accident on someone else's machine or in CI. An
 * explicit opt-in cannot.
 *
 * Anything other than the exact string `true` — absent, empty, `1`, `TRUE`, `yes` — is off. A
 * fail-safe switch does not guess.
 */

import { createHash } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';

/** The environment variable that turns the overlay on. Nothing else does. */
export const DEV_VISUAL_MEDIA_FLAG = 'DEV_VISUAL_MEDIA';

/** Where the owner placed the temporary imagery. Gitignored; never read without the flag. */
export const SOURCE_DIR = 'dev-assets/visual-qa';

/** Generated derivative cache. Gitignored. Safe to delete at any time; it is rebuilt. */
export const CACHE_DIR = '.dev-visual-media';

export const MANIFEST_FILE = 'manifest.json';

/**
 * The URL prefix the derivatives are served under, in dev and in a flagged build alike.
 *
 * A distinct, greppable literal that appears nowhere else in the repository. That is what makes
 * `scripts/verify-no-dev-media.mjs` able to prove a normal build is clean by searching for it.
 */
export const PUBLIC_PREFIX = '/dev-visual-media/';

/**
 * The pools, which are the owner's own folder names. Categorisation is theirs, not inferred:
 * these are visual QA imagery and are **not** asserted to depict any Work Entry.
 */
export const POOLS = ['architecture', 'reality-capture', 'general'];

/**
 * Extensions worth attempting. HEIC is included on purpose — roughly half of the supplied
 * Reality Capture set is HEIC, which no browser renders, but which libvips can often transcode.
 * Attempting and skipping on failure recovers those files when the local sharp supports HEIF and
 * degrades quietly when it does not. `prepare` reports every skip either way.
 */
const CANDIDATE_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.avif',
  '.gif',
  '.tif',
  '.tiff',
  '.heic',
  '.heif',
]);

/**
 * Long-edge ceiling for a derivative.
 *
 * 2400px covers a full-bleed hero on a 2× desktop viewport, which is the largest box any of
 * these surfaces paints. Anything beyond it is weight the QA pass cannot see.
 */
const MAX_EDGE = 2400;
const WEBP_QUALITY = 78;

/**
 * @param {Record<string, string | undefined>} env
 * @returns {boolean}
 */
export function devVisualMediaEnabled(env) {
  return env[DEV_VISUAL_MEDIA_FLAG] === 'true';
}

/**
 * Deployment contexts that must never carry the overlay, whatever the flag says.
 *
 * Each is a variable the platform sets itself, so none can be satisfied by a developer's shell
 * on a laptop. `NODE_ENV=production` is deliberately absent from this list: it is set by plenty
 * of local tooling and is a weak signal, whereas every name below means "a machine is building
 * something it intends to publish".
 */
const DEPLOYMENT_MARKERS = ['CI', 'CF_PAGES', 'VERCEL', 'NETLIFY', 'GITHUB_ACTIONS'];

/**
 * The hard stop required by the brief: a deployment build with the flag on must fail, not
 * silently strip. Silently stripping would mean the artifact is clean but the operator never
 * learns their pipeline is configured to ship QA imagery — and the next change to this file
 * could make it not clean.
 *
 * @param {Record<string, string | undefined>} env
 */
export function assertNotDeploymentContext(env) {
  if (!devVisualMediaEnabled(env)) return;

  const marker = DEPLOYMENT_MARKERS.find((name) => (env[name] ?? '').length > 0);
  if (marker === undefined) return;

  throw new Error(
    `${DEV_VISUAL_MEDIA_FLAG}=true is set in a deployment context (${marker} is present).\n` +
      `Development visual-QA imagery from ${SOURCE_DIR}/ must never reach a published build:\n` +
      `it is not portfolio content, it is not cleared for publication, and it is not in Git.\n` +
      `Unset ${DEV_VISUAL_MEDIA_FLAG} in this environment. It is for local review only.`,
  );
}

/** FNV-1a. Small, stable across runs and platforms, and dependency-free. */
export function stableHash(value) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

function listSources(root, pool) {
  const dir = join(root, SOURCE_DIR, pool);
  let names;
  try {
    names = readdirSync(dir);
  } catch {
    return [];
  }

  return names
    .filter((name) => !name.startsWith('.'))
    .filter((name) => CANDIDATE_EXTENSIONS.has(extname(name).toLowerCase()))
    .filter((name) => {
      try {
        return statSync(join(dir, name)).isFile();
      } catch {
        return false;
      }
    })
    .sort(); // Sorted so the pool order — and therefore every assignment — is reproducible.
}

/**
 * Derivative filenames are content-addressed by `pool + source name`, not by the source name
 * alone: `general/` intentionally re-uses several architecture filenames, and two pools writing
 * the same output name would silently collapse into one image.
 */
function derivativeName(pool, sourceName) {
  const digest = createHash('sha1').update(`${pool}/${sourceName}`).digest('hex').slice(0, 12);
  return `${pool}-${digest}.webp`;
}

/**
 * Build (or refresh) the derivative cache and its manifest.
 *
 * Incremental: a derivative newer than its source is left alone, so a dev server restart costs
 * nothing after the first run. `sharp` is imported lazily and only here — it is already present
 * as one of Astro's own dependencies, so this adds nothing to `package.json`, which is a
 * single-owner file (§23.3).
 *
 * @param {{ root: string, log?: (message: string) => void }} options
 */
export async function prepareDevVisualMedia({ root, log = () => {} }) {
  const cacheDir = join(root, CACHE_DIR);
  mkdirSync(cacheDir, { recursive: true });

  /** @type {{ sharp?: unknown }} */
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    throw new Error(
      `${DEV_VISUAL_MEDIA_FLAG}=true requires 'sharp' to downscale ${SOURCE_DIR}/ into web-sized\n` +
        `derivatives, and it could not be imported. It normally ships with Astro. Reinstall\n` +
        `dependencies, or unset ${DEV_VISUAL_MEDIA_FLAG} to build without the visual-QA overlay.`,
    );
  }

  /** @type {Record<string, Array<{ file: string, width: number, height: number, source: string }>>} */
  const pools = {};
  /** @type {Array<{ source: string, reason: string }>} */
  const skipped = [];
  let built = 0;
  let reused = 0;

  for (const pool of POOLS) {
    pools[pool] = [];

    for (const sourceName of listSources(root, pool)) {
      const sourcePath = join(root, SOURCE_DIR, pool, sourceName);
      const file = derivativeName(pool, sourceName);
      const outputPath = join(cacheDir, file);

      try {
        const sourceStat = statSync(sourcePath);
        let outputStat = null;
        try {
          outputStat = statSync(outputPath);
        } catch {
          /* not built yet */
        }

        if (outputStat !== null && outputStat.mtimeMs >= sourceStat.mtimeMs) {
          const meta = await sharp(outputPath).metadata();
          pools[pool].push({
            file,
            width: meta.width ?? 0,
            height: meta.height ?? 0,
            source: sourceName,
          });
          reused += 1;
          continue;
        }

        const info = await sharp(sourcePath, { limitInputPixels: false })
          .rotate() // Honour EXIF orientation; the phone-shot sources carry it.
          .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: WEBP_QUALITY })
          .toFile(outputPath);

        pools[pool].push({ file, width: info.width, height: info.height, source: sourceName });
        built += 1;
      } catch (error) {
        // A source that cannot be decoded (an unsupported HEIF build is the usual cause) is
        // reported and dropped. It is QA imagery: losing one is a smaller cost than failing the
        // dev server, and a silent drop is what the report exists to prevent.
        try {
          rmSync(outputPath, { force: true });
        } catch {
          /* nothing to clean */
        }
        skipped.push({ source: `${pool}/${sourceName}`, reason: String(error?.message ?? error) });
      }
    }
  }

  const manifest = { pools, skipped, prefix: PUBLIC_PREFIX };
  writeFileSync(join(cacheDir, MANIFEST_FILE), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  const total = POOLS.reduce((sum, pool) => sum + pools[pool].length, 0);
  log(
    `dev-visual-media: ${total} image(s) ready ` +
      `(${built} built, ${reused} cached, ${skipped.length} skipped) — ` +
      POOLS.map((pool) => `${pool}:${pools[pool].length}`).join(' '),
  );
  for (const entry of skipped) log(`dev-visual-media: skipped ${entry.source} — ${entry.reason}`);

  return manifest;
}

/** Read a previously prepared manifest, or `null` if there is none. */
export function readManifest(root) {
  try {
    return JSON.parse(readFileSync(join(root, CACHE_DIR, MANIFEST_FILE), 'utf8'));
  } catch {
    return null;
  }
}
