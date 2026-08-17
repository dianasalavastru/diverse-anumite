/**
 * The content boundary, asserted against the **module graph** rather than against intent.
 *
 * OWNER: Workstream B. `TECHNICAL_ARCHITECTURE.md` §8, §18. Regression guard for B4.
 *
 * ── WHAT THIS EXISTS TO CATCH ──────────────────────────────────────────────────────────────
 *
 * §8 says "No GROQ in components" and §18 says "No secret ever reaches the browser." Both were
 * true as *rules* and false as *fact*: `components/work-archive/archive-state.ts` is imported by
 * the archive's Astro composition and by its client island alike, and it took one value from
 * `lib/content/index.ts`, which re-exported `source.ts`, which imports `groq.ts`. Every GROQ
 * projection string was therefore emitted into `dist/_astro/WorkArchive.*.js`.
 *
 * Nothing failed. The types were right, the tests were green, and the rule was written down in
 * three places. Only the bundle knew. So this file stops reading the rule and starts walking the
 * graph a bundler walks:
 *
 *   1. Every `<script>` block in every `.astro` file is a client entry point — that is what
 *      Astro bundles and ships (§5.1, §5.2).
 *   2. Follow its imports transitively, exactly as Rollup would.
 *   3. Assert that the reachable set never contains a build-only module.
 *
 * It is deliberately independent of tree-shaking. A module that Rollup *might* eliminate today
 * is still a boundary violation, because whether the query strings survive depends on whether
 * the bundler can prove a top-level call pure — and `groq.ts` builds its projections with
 * exactly such calls, which is why they survived. Reachability is the property worth asserting;
 * elimination is a bundler's opinion about it.
 *
 * `scripts/verify-client-bundles.mjs` asserts the same boundary empirically, on the emitted
 * bundles, after `astro build`. This test runs on every `npm test` with no build required. Both
 * are kept: this one localizes the fault to an import line, that one cannot be fooled by a
 * resolution rule this walker gets wrong.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/** Same idiom as `live.test.ts`: anchored to this file, never to the invoking cwd. */
const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const SRC = resolve(ROOT, 'src');

/**
 * Modules that must never be reachable from a browser bundle.
 *
 * `groq.ts` carries the query strings; `client.ts` the transport and the `Authorization` header;
 * `config.ts` the credential variable *names* and the endpoint shape; `source.ts` and
 * `normalize.ts` reach `groq.ts`; `build-source.ts` and `server.ts` reach all of it;
 * `fixtures.ts` is the placeholder corpus §10.4 keeps out of production output.
 */
const BUILD_ONLY = [
  'src/lib/content/groq.ts',
  'src/lib/content/client.ts',
  'src/lib/content/config.ts',
  'src/lib/content/source.ts',
  'src/lib/content/normalize.ts',
  'src/lib/content/fixtures.ts',
  'src/lib/content/build-source.ts',
  'src/lib/content/server.ts',
] as const;

const BUILD_ONLY_SET = new Set<string>(BUILD_ONLY.map((path) => resolve(ROOT, path)));

/* ────────────────────────────────────────────────────────────────────────────
 * A minimal module-graph walker
 *
 * Not a bundler. It resolves the subset of specifier forms this repository uses — relative
 * paths, with or without an extension, `.js` specifiers pointing at `.ts` sources (NodeNext
 * style, which the content layer writes), and directory imports resolving to `index.ts`. A bare
 * specifier is a dependency, not our code, and is ignored.
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * `import type` / `export type` statements are erased before any bundler sees them, so they are
 * not graph edges. Everything else is — including a statement whose named bindings all happen to
 * be types, which is intentionally strict: `import { PILLARS, type Pillar }` is one character
 * away from either form, and the stricter reading is the safe one for a boundary.
 */
function importSpecifiers(source: string): readonly string[] {
  const specifiers: string[] = [];

  // `import … from '…'` / `export … from '…'`, skipping the type-only forms.
  for (const match of source.matchAll(/\b(import|export)\b([^'"`;]*?)\bfrom\s*['"]([^'"]+)['"]/g)) {
    const clause = (match[2] ?? '').trim();
    if (clause.startsWith('type ') || clause === 'type') continue;
    specifiers.push(match[3] as string);
  }

  // Side-effect imports: `import '…'` (how every island is mounted).
  for (const match of source.matchAll(/\bimport\s*['"]([^'"]+)['"]/g)) {
    specifiers.push(match[1] as string);
  }

  // Dynamic imports.
  for (const match of source.matchAll(/\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g)) {
    specifiers.push(match[1] as string);
  }

  return specifiers;
}

function resolveSpecifier(importer: string, specifier: string): string | null {
  if (!specifier.startsWith('.')) return null; // bare — a dependency, not our source

  const base = resolve(dirname(importer), specifier);
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.astro`,
    base.replace(/\.js$/, '.ts'),
    join(base, 'index.ts'),
  ];

  for (const candidate of candidates) {
    try {
      if (statSync(candidate).isFile()) return candidate;
    } catch {
      /* not this one */
    }
  }
  return null;
}

/** Only the `<script>` blocks of an `.astro` file are client code; frontmatter runs at build. */
function clientSourceOf(file: string): string {
  const source = readFileSync(file, 'utf8');
  if (!file.endsWith('.astro')) return source;

  return [...source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)]
    .filter((match) => !/\bis:inline\b/.test(match[1] ?? '')) // not processed, not bundled
    .map((match) => match[2] ?? '')
    .join('\n');
}

/** Reachable module set, with the shortest import chain to each — so a failure names the edge. */
function reachableFrom(entry: string): Map<string, readonly string[]> {
  const chains = new Map<string, readonly string[]>([[entry, [entry]]]);
  const queue = [entry];

  while (queue.length > 0) {
    const current = queue.shift() as string;
    const chain = chains.get(current) as readonly string[];

    for (const specifier of importSpecifiers(clientSourceOf(current))) {
      const resolved = resolveSpecifier(current, specifier);
      if (!resolved || chains.has(resolved)) continue;
      chains.set(resolved, [...chain, resolved]);
      queue.push(resolved);
    }
  }

  return chains;
}

function walk(dir: string): readonly string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

const rel = (path: string) => relative(ROOT, path);

/* ────────────────────────────────────────────────────────────────────────────
 * The assertions
 * ──────────────────────────────────────────────────────────────────────────── */

const astroFiles = walk(SRC).filter((file) => file.endsWith('.astro'));

/**
 * The client entry points, discovered rather than listed: every specifier imported inside a
 * bundled `<script>` block. A new island is covered the day it is mounted, without anyone
 * remembering to add it here.
 */
const clientEntries = [
  ...new Set(
    astroFiles.flatMap((file) =>
      importSpecifiers(clientSourceOf(file))
        .map((specifier) => resolveSpecifier(file, specifier))
        .filter((resolved): resolved is string => resolved !== null),
    ),
  ),
].sort();

describe('client bundles cannot reach the query layer (§8, §18)', () => {
  /**
   * Anti-vacuity. Every other assertion below is a `for each entry` — so a walker that silently
   * found nothing would report a clean pass on a leaking build. This pins the entry points that
   * exist today as a *lower bound*: a new island is picked up automatically by discovery and
   * gets its own case, but the ones already shipping can never quietly drop out of coverage.
   */
  it('finds the islands, so a silent zero-entry pass is impossible', () => {
    // §5.1 budgets four islands; three are built (the point-cloud viewer is spike-gated, §10.3)
    // and §5.2 adds the page-global motion runtime.
    expect(clientEntries.map(rel)).toEqual(
      expect.arrayContaining([
        'src/scripts/islands/focus-carousel.ts',
        'src/scripts/islands/media-viewer.ts',
        'src/scripts/islands/work-archive.ts',
        'src/scripts/motion-runtime.ts',
      ]),
    );
  });

  it.each(clientEntries.map((entry) => [rel(entry), entry] as const))(
    '%s reaches no build-only module',
    (_name, entry) => {
      const chains = reachableFrom(entry);
      const violations = [...chains]
        .filter(([module]) => BUILD_ONLY_SET.has(module))
        .map(([, chain]) => chain.map(rel).join('\n    → '));

      expect(
        violations,
        violations.length === 0
          ? ''
          : `A client bundle can reach the query layer. Import chain(s):\n\n    ${violations.join(
              '\n\n    ',
            )}\n\nImport the browser-safe boundary (src/lib/content/index.ts) instead; the ` +
              `build-time half lives behind src/lib/content/server.ts (TECHNICAL_ARCHITECTURE.md §8, §18).`,
      ).toEqual([]);
    },
  );

  /**
   * The invariant that makes the fix hold for code that does not exist yet. Any module imported
   * by both a composition and an island will import this barrel — so the barrel, not the caller,
   * is where the property has to be true.
   */
  it('the boundary barrel itself stays free of the query layer', () => {
    const chains = reachableFrom(resolve(ROOT, 'src/lib/content/index.ts'));
    const reached = [...chains.keys()].filter((module) => BUILD_ONLY_SET.has(module)).map(rel);

    expect(reached).toEqual([]);
    /*
     * Positive statement of the same fact: this is the whole graph, and all of it is pure.
     *
     * `requirements.ts` joined it at migration Stage 1. It is admitted here deliberately, not
     * waved through: it is data plus one fold, its only import is `types.ts` — already in this
     * list — and it holds no `sanity`, Astro, filesystem or environment dependency. It adds no
     * edge toward the query layer, which is what the first assertion above proves independently
     * of this list. A future addition that cannot make the same claim belongs behind
     * `server.ts`, not here.
     */
    expect([...chains.keys()].map(rel).sort()).toEqual([
      'src/lib/content/derive.ts',
      'src/lib/content/index.ts',
      'src/lib/content/order.ts',
      'src/lib/content/requirements.ts',
      'src/lib/content/types.ts',
      'src/lib/content/validation.ts',
      'src/lib/i18n/routes.ts',
    ]);
  });

  /** `server.ts` is only useful if it is the *only* other door. */
  it('build-only modules are imported only from build-time callers', () => {
    const offenders = walk(SRC)
      .filter((file) => /\.(ts|astro)$/.test(file) && !file.endsWith('.test.ts'))
      .filter((file) => file.startsWith(join(SRC, 'scripts')))
      .flatMap((file) =>
        importSpecifiers(readFileSync(file, 'utf8'))
          .map((specifier) => resolveSpecifier(file, specifier))
          .filter((resolved): resolved is string => resolved !== null && BUILD_ONLY_SET.has(resolved))
          .map((resolved) => `${rel(file)} → ${rel(resolved)}`),
      );

    expect(offenders).toEqual([]);
  });
});
