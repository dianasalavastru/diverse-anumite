/**
 * The build-time `ContentSource` — **I-3, resolved**.
 *
 * OWNER: Workstream B. `TECHNICAL_ARCHITECTURE.md` §8, §18, §23.4.
 *
 * `source.ts` describes the swap this module completes: "the swap is one factory call in one
 * file — `createFixtureContentSource()` → `createSanityContentSource()` — with no component
 * change." Every page-level composition now calls `contentSource()` here instead, so the
 * connection is resolved in exactly one place and the pages keep the single-call shape the
 * contract promised.
 *
 * ── WHY THIS IS NOT IN `config.ts` OR `source.ts` ───────────────────────────────────────────
 *
 * `resolveSanityConfig` takes an environment bag "so this stays pure and testable, and so no
 * module-load side effect can make a component accidentally depend on CMS credentials"
 * (`config.ts`). That property is worth keeping. This module is the one place allowed to read
 * the ambient build environment, it is imported only from page/composition frontmatter, and it
 * does its reading lazily inside `contentSource()` — importing it still has no side effect.
 *
 * ── NO FALLBACK. THAT IS THE FEATURE ───────────────────────────────────────────────────────
 *
 * A missing variable throws. It does **not** fall back to `fixtures.ts`.
 *
 * §10.4 forbids fabricated content in production output, and the fixtures are explicitly "the
 * I-3 stand-in, not content" (`index.ts`). A silent fallback would mean a build with a typo in
 * a secret name emits a complete, plausible, entirely fictional site — and emits it *green*.
 * The failure mode of throwing is a red build with the missing variable named; the failure mode
 * of falling back is invented projects on a real domain. Only one of those is recoverable.
 *
 * `live.test.ts` self-skips without credentials for the opposite and equally deliberate reason:
 * a test suite that fails without a token pushes a developer toward committing one (§18). A
 * *build* has no such excuse — it cannot produce output without real content, so it must stop.
 *
 * ── SECRETS ────────────────────────────────────────────────────────────────────────────────
 *
 * No value is written here; only the §18 variable *names* in `ENV` are, and they already live
 * in the committed `.env.example`. The token is read into a build-time closure and handed to
 * `client.ts`, which sends it as a request header and asserts it is never running in a browser.
 * Nothing in this module is reachable from a client bundle: it is imported from `.astro`
 * frontmatter only, which Astro executes at build and never ships (§6.1, 100% prerendered).
 */

import { ENV, ContentConfigError, resolveSanityConfig } from './config.js';
import { createSanityContentSource, type ContentSource } from './source.js';

/**
 * Read the build environment.
 *
 * Two sources, in this precedence:
 *
 *   1. `process.env` — a real environment variable, which is how CI and the Cloudflare Pages
 *      build environment supply them (§18: encrypted build secrets, never a repository value).
 *   2. `import.meta.env` — Vite loads the root `.env` into it, and a variable without the
 *      `PUBLIC_` prefix is exposed to server-side build code *only*, never to a client bundle.
 *      This is the local-development path; `.gitignore` keeps that file out of Git.
 *
 * A real environment variable wins, matching `live.test.ts` so the harness and the build can
 * never be pointed at two different datasets by the same shell.
 *
 * `process` is read through `globalThis` rather than as a bare global: the web application's
 * TypeScript program is browser-typed on purpose (see `node-shims.d.ts`), and declaring a Node
 * global here would widen that surface for every file Workstream A owns.
 *
 * The `import.meta.env` reads are literal member accesses, not `vite[ENV.projectId]`. Vite's
 * transform only rewrites the literal form, so the dynamic one would silently read `undefined`
 * in a bundled context — the exact kind of quiet miss this module exists to make loud.
 */
function buildEnv(): Record<string, string | undefined> {
  const node =
    (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
  const vite = import.meta.env as unknown as Record<string, string | undefined>;

  return {
    [ENV.projectId]: node[ENV.projectId] ?? vite['SANITY_PROJECT_ID'],
    [ENV.dataset]: node[ENV.dataset] ?? vite['SANITY_DATASET'],
    [ENV.readToken]: node[ENV.readToken] ?? vite['SANITY_READ_TOKEN'],
  };
}

/**
 * Resolved once per build.
 *
 * Every page frontmatter that needs content calls this, and a static build renders many pages
 * per module graph. Memoizing keeps that to a single config resolution and a single client, so
 * "the page/composition layer resolves a `ContentSource` once" (`index.ts`) stays true even
 * though several files ask for it.
 */
let resolved: ContentSource | null = null;

export function contentSource(): ContentSource {
  if (resolved) return resolved;

  try {
    resolved = createSanityContentSource(resolveSanityConfig(buildEnv()));
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : String(cause);
    throw new ContentConfigError(
      `Cannot build: the CMS connection is unavailable. ${detail}\n` +
        `The build reads live content from Sanity (I-3) and deliberately does not fall back to ` +
        `fixtures — placeholder data must never be emitted as if it were real work ` +
        `(TECHNICAL_ARCHITECTURE.md §10.4). Set ${ENV.projectId}, ${ENV.dataset} and ` +
        `${ENV.readToken} in the environment or in a root .env (names in .env.example, §18).`,
    );
  }

  return resolved;
}
