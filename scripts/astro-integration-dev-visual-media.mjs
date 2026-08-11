/**
 * Development-only visual QA media — the Astro integration.
 *
 * OWNER: Workstream A. **Not production architecture.**
 *
 * Three jobs, all of them inert unless `DEV_VISUAL_MEDIA=true`:
 *
 *   1. `astro:config:setup` — refuse a deployment build outright if the flag is set, then build
 *      the derivative cache before any page renders, so `src/lib/dev/visual-media.ts` finds a
 *      manifest when the first `Plate` asks for one.
 *   2. `astro:server:setup` — serve those derivatives in `astro dev`.
 *   3. `astro:build:done` — copy them into `dist/` for a *local* flagged build, which is what
 *      makes `DEV_VISUAL_MEDIA=true npm run build && npm run preview` a usable screenshot pass.
 *
 * ── WHY AN INTEGRATION AND NOT A VITE PLUGIN ───────────────────────────────────────────────
 *
 * The credential guard next door is a Vite plugin because it inspects emitted chunks, which is
 * a bundler concern. This is not: it needs a hook that runs *before any page renders* and one
 * that runs *after `dist/` is final*. `astro:config:setup` and `astro:build:done` are exactly
 * those two points; a Vite plugin has no reliable equivalent of the second, because Astro's
 * static build writes and prunes `dist/` around the bundler's own lifecycle.
 *
 * ── WHY THE FILES ARE NOT IN `public/` ─────────────────────────────────────────────────────
 *
 * `public/` is copied into every build unconditionally. Putting temporary imagery there would
 * make shipping it the default and *not* shipping it the thing requiring configuration — the
 * exact inversion of what this mechanism is for. Serving from a gitignored cache means the
 * assets have no path into a build that did not opt in.
 */

import { cpSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  assertNotDeploymentContext,
  CACHE_DIR,
  devVisualMediaEnabled,
  DEV_VISUAL_MEDIA_FLAG,
  MANIFEST_FILE,
  prepareDevVisualMedia,
  PUBLIC_PREFIX,
} from './dev-visual-media.mjs';

const CONTENT_TYPES = { '.webp': 'image/webp' };

export function devVisualMedia() {
  let root = process.cwd();

  return {
    name: 'dev-visual-media',
    hooks: {
      'astro:config:setup': async ({ config, logger }) => {
        root = fileURLToPath(config.root);

        // Runs unconditionally and returns immediately when the flag is off, so the refusal
        // cannot be skipped by the same condition it is guarding.
        assertNotDeploymentContext(process.env);

        if (!devVisualMediaEnabled(process.env)) return;

        logger.warn(
          `${DEV_VISUAL_MEDIA_FLAG}=true — temporary local visual-QA imagery is ENABLED. ` +
            `This output is for local review only and must never be published.`,
        );
        await prepareDevVisualMedia({ root, log: (message) => logger.info(message) });
      },

      'astro:server:setup': ({ server, logger }) => {
        if (!devVisualMediaEnabled(process.env)) return;

        server.middlewares.use((req, res, next) => {
          const url = (req.url ?? '').split('?')[0];
          if (!url.startsWith(PUBLIC_PREFIX)) return next();

          // Only ever a flat filename inside the cache. `normalize` collapses any `..` and the
          // separator test rejects what is left, so a crafted URL cannot escape the directory.
          const name = decodeURIComponent(url.slice(PUBLIC_PREFIX.length));
          const safe = normalize(name);
          if (safe !== name || safe.includes('/') || safe.includes('\\') || safe.length === 0) {
            res.statusCode = 400;
            return res.end('bad request');
          }

          const type = CONTENT_TYPES[extname(safe).toLowerCase()];
          if (type === undefined && safe !== MANIFEST_FILE) {
            res.statusCode = 404;
            return res.end('not found');
          }

          try {
            const body = readFileSync(join(root, CACHE_DIR, safe));
            res.setHeader('Content-Type', type ?? 'application/json');
            res.setHeader('Cache-Control', 'no-store');
            res.statusCode = 200;
            return res.end(body);
          } catch {
            logger.warn(`dev-visual-media: no derivative for ${safe}`);
            res.statusCode = 404;
            return res.end('not found');
          }
        });
      },

      'astro:build:done': ({ dir, logger }) => {
        if (!devVisualMediaEnabled(process.env)) return;

        const from = join(root, CACHE_DIR);
        const to = join(fileURLToPath(dir), PUBLIC_PREFIX.replace(/^\/|\/$/g, ''));
        mkdirSync(to, { recursive: true });

        let copied = 0;
        for (const name of readdirSync(from)) {
          if (extname(name).toLowerCase() !== '.webp') continue;
          cpSync(join(from, name), join(to, name));
          copied += 1;
        }
        logger.warn(
          `dev-visual-media: copied ${copied} temporary image(s) into the build. ` +
            `This artifact is NOT publishable.`,
        );
      },
    },
  };
}
