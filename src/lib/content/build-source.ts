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
 * ── SECRETS: WHY `import.meta.env` IS NOT USED HERE (S1) ───────────────────────────────────
 *
 * This module used to fall back to `import.meta.env` for local development. That put the read
 * token **into a build artifact**, and the reason is worth stating precisely, because the
 * obvious correction does not fix it.
 *
 * Vite replaces `import.meta.env` at transform time. It can rewrite a *static* member access
 * (`import.meta.env.FOO`) to that one value — but when the object is referenced as a whole, as
 * it is the moment you assign it to a variable and index it, Vite has no static member to
 * rewrite and substitutes **the entire environment object** instead. The emitted SSR chunk
 * therefore carried `Object.assign(__vite_import_meta_env__, { …every loaded .env variable… })`
 * — token included — into `dist/chunks/` for the lifetime of the build.
 *
 * The trap: writing `import.meta.env.SANITY_READ_TOKEN` instead does not help. That form inlines
 * the value *even more* directly. There is no spelling of `import.meta.env` that reads a secret
 * without baking it into the bundle, because the whole mechanism is compile-time substitution.
 *
 * So the secret is not routed through the bundler at all. Both sources below are **runtime**
 * reads performed by the build process: a real environment variable, or the `.env` file read
 * from disk. Neither can be inlined, because at transform time there is nothing to inline —
 * `readFileSync` is opaque to Vite. Enforced by `scripts/vite-plugin-credential-guard.mjs`,
 * which inspects every emitted chunk *during* the build, including the transient ones.
 *
 * No value is written here; only the §18 variable *names* in `ENV` are, and they already live
 * in the committed `.env.example`. The token is read into a build-time closure and handed to
 * `client.ts`, which sends it as a request header and asserts it is never running in a browser.
 * Nothing in this module is reachable from a client bundle: it is imported from `.astro`
 * frontmatter only, which Astro executes at build and never ships (§6.1, 100% prerendered) —
 * asserted by `boundary.test.ts`.
 */

import { readFileSync } from 'node:fs';

import {
  ENV,
  ContentConfigError,
  createSanityContentSource,
  resolveSanityConfig,
  type ContentSource,
} from './server.js';

/** The §18 variables this module resolves. Nothing else is read out of either source. */
const WANTED = [ENV.projectId, ENV.dataset, ENV.readToken] as const;

/**
 * `process` is read through `globalThis` rather than as a bare global: the web application's
 * TypeScript program is browser-typed on purpose (see `node-shims.d.ts`), and declaring a Node
 * global here would widen that surface for every file Workstream A owns.
 */
interface NodeProcess {
  readonly env?: Record<string, string | undefined>;
  cwd?(): string;
}

const nodeProcess = (): NodeProcess => (globalThis as { process?: NodeProcess }).process ?? {};

/**
 * A minimal `.env` reader — `KEY=value`, `#` comments, blank lines, optional surrounding quotes.
 *
 * Deliberately not `import.meta.env` (see the header) and deliberately not a dependency:
 * `package.json` is Workstream A's single-owner file (§23.3), and this is a dozen lines. It is
 * the same file Vite would have loaded, read the same way — the difference is *when*. Vite reads
 * it at transform time and bakes the result into the output; this reads it at build time and
 * keeps it in memory.
 *
 * Exported for `build-env.test.ts`, which exercises it on synthetic input only.
 */
export function parseEnvFile(source: string): Record<string, string> {
  const values: Record<string, string> = {};

  for (const raw of source.split('\n')) {
    const line = raw.trim();
    if (line.length === 0 || line.startsWith('#')) continue;

    const separator = line.indexOf('=');
    if (separator <= 0) continue;

    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    const quoted =
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")));

    values[key] = quoted ? value.slice(1, -1) : value;
  }

  return values;
}

/**
 * Precedence, pure and testable: a real environment variable wins over the `.env` file.
 *
 * That ordering matches `live.test.ts`, so the harness and the build can never be pointed at two
 * different datasets by the same shell. It is also what makes the two deployment paths work
 * without a mode flag: Cloudflare Pages supplies encrypted build secrets as real environment
 * variables and ships no `.env`, so the file read finds nothing and `process.env` answers;
 * locally there is usually no exported variable, so the file answers.
 *
 * Only the three §18 names are carried through. A `.env` holding anything else — and a developer
 * shell holding a great deal else — contributes nothing to what this build can see.
 */
export function selectBuildEnv(
  processEnv: Record<string, string | undefined>,
  fileEnv: Record<string, string | undefined>,
): Record<string, string | undefined> {
  const selected: Record<string, string | undefined> = {};
  for (const name of WANTED) selected[name] = processEnv[name] ?? fileEnv[name];
  return selected;
}

/**
 * The `.env` file, if there is one.
 *
 * Resolved from the process working directory — the project root, which is where Astro runs and
 * where Vite would itself look for `.env`. A missing file is the normal Cloudflare case and is
 * not an error: `resolveSanityConfig` is what decides whether the result is sufficient, and it
 * fails loudly by variable name when it is not.
 *
 * The read is deliberately unguarded by any existence check — one `try` covers a missing file, a
 * directory, and a permission error alike, and none of them is distinguishable to a caller that
 * is going to fall through to `process.env` regardless.
 */
function readEnvFile(): Record<string, string> {
  const cwd = nodeProcess().cwd?.() ?? '.';
  try {
    return parseEnvFile(readFileSync(`${cwd}/.env`, 'utf8'));
  } catch {
    return {};
  }
}

function buildEnv(): Record<string, string | undefined> {
  return selectBuildEnv(nodeProcess().env ?? {}, readEnvFile());
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
