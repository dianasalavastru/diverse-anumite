#!/usr/bin/env node
/**
 * Client-bundle leak scan — the empirical half of the §8/§18 boundary guard.
 *
 * OWNER: Workstream B. `TECHNICAL_ARCHITECTURE.md` §8 ("query layer isolated behind a module
 * boundary… No GROQ in components") and §18 ("No secret ever enters Git. No secret ever reaches
 * the browser"). Added at B4, after `dist/_astro/WorkArchive.*.js` was found carrying every GROQ
 * projection string the site queries with.
 *
 * Runs as `postbuild`, so `npm run build` — the same command Cloudflare Pages runs — fails
 * rather than publishing a leak. Also runnable alone: `npm run verify:bundles`.
 *
 * ── WHY THIS EXISTS ALONGSIDE `boundary.test.ts` ───────────────────────────────────────────
 *
 * That test walks the *source* import graph and fails on an import line, which is where a
 * developer can act on it. This reads what was actually emitted. They can disagree — a
 * specifier form the walker resolves differently from Vite, a future integration that inlines
 * data into markup, a dependency that reaches the CMS on its own — and when they do, this one is
 * the authority, because it inspects the artifact the visitor downloads.
 *
 * ── WHAT IS AND IS NOT A LEAK ──────────────────────────────────────────────────────────────
 *
 * `cdn.sanity.io` is the image CDN and is expected in markup and CSS (§9). `api.sanity.io` is
 * the query endpoint and is not. That distinction is the reason the host patterns are written
 * out rather than matched loosely on "sanity".
 *
 * Nothing here ever prints a matched secret — a guard that echoes a credential into CI logs has
 * replaced one leak with another. Findings name the file, the pattern and a line number only.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(ROOT, 'dist');

/**
 * Every pattern is a fact about a specific module that must stay build-side, so a hit names the
 * module that leaked rather than just "something looks wrong".
 */
const FORBIDDEN = [
  // ── src/lib/content/groq.ts — the query shape (§8) ──
  { id: 'GROQ document filter', source: 'groq.ts', pattern: /\*\[_type\s*==/ },
  { id: 'GROQ type predicate', source: 'groq.ts', pattern: /_type\s*==\s*["'](workEntry|service|employer)["']/ },
  { id: 'GROQ draft-exclusion clause', source: 'groq.ts', pattern: /drafts\.\*\*/ },
  { id: 'GROQ reverse reference', source: 'groq.ts', pattern: /references\(\^\._id\)/ },
  { id: 'GROQ dereference operator', source: 'groq.ts', pattern: /asset->(url|_id)/ },
  { id: 'GROQ coalesce projection', source: 'groq.ts', pattern: /coalesce\(secondary,/ },

  // ── src/lib/content/client.ts + config.ts — the transport (§8, §18) ──
  { id: 'Sanity query endpoint host', source: 'client.ts/config.ts', pattern: /\bapi\.sanity\.io\b/ },
  { id: 'Sanity CDN query host', source: 'client.ts/config.ts', pattern: /\bapicdn\.sanity\.io\b/ },
  { id: 'Sanity query path', source: 'client.ts/config.ts', pattern: /\/data\/query\// },
  { id: 'query perspective parameter', source: 'client.ts', pattern: /perspective['"]?\s*[,:=]\s*['"](published|drafts|raw)['"]/ },

  // ── §18 — credentials ──
  { id: 'credential variable name', source: '§18', pattern: /SANITY_(READ|PREVIEW|WRITE)_TOKEN/ },
  { id: 'bearer authorization header', source: 'client.ts', pattern: /Authorization["'\s:]+.{0,12}Bearer/i },
  // Sanity tokens are `sk` followed by a long opaque string. Matching the *shape* means this
  // catches a token the scanner was never told the value of.
  { id: 'Sanity token shape', source: '§18', pattern: /\bsk[A-Za-z0-9]{40,}\b/ },
];

/**
 * If the build environment holds the real credentials, check the emitted output for their literal
 * values too. Presence is reported; the value never is.
 */
const SECRET_VALUES = ['SANITY_READ_TOKEN', 'SANITY_PREVIEW_TOKEN']
  .map((name) => ({ name, value: (process.env[name] ?? '').trim() }))
  .filter((entry) => entry.value.length >= 8);

/** `.js` and `.html` only: the two things a browser executes or parses. CSS carries no logic. */
const SCANNED = /\.(js|mjs|html)$/;

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function lineOf(source, index) {
  return source.slice(0, index).split('\n').length;
}

function main() {
  try {
    if (!statSync(DIST).isDirectory()) throw new Error('not a directory');
  } catch {
    console.error(
      `verify-client-bundles: no build output at ${relative(ROOT, DIST)}/. Run \`npm run build\` first.`,
    );
    process.exit(1);
  }

  const files = walk(DIST).filter((file) => SCANNED.test(file));
  const findings = [];

  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    const name = relative(ROOT, file);

    for (const rule of FORBIDDEN) {
      const match = rule.pattern.exec(source);
      if (match) {
        findings.push(`${name}:${lineOf(source, match.index)} — ${rule.id} (from ${rule.source})`);
      }
    }

    for (const secret of SECRET_VALUES) {
      const index = source.indexOf(secret.value);
      if (index !== -1) {
        // The value itself is never written to the log.
        findings.push(`${name}:${lineOf(source, index)} — the literal value of ${secret.name}`);
      }
    }
  }

  if (findings.length > 0) {
    console.error(
      `\nverify-client-bundles: FAILED — the CMS boundary leaked into browser-reachable output.\n` +
        `TECHNICAL_ARCHITECTURE.md §8 keeps the query layer behind src/lib/content/;\n` +
        `§18 keeps credentials out of the browser entirely.\n\n` +
        findings.map((finding) => `  ✗ ${finding}`).join('\n') +
        `\n\nFix the import, not this scanner: a module reachable from an .astro <script> block\n` +
        `may import src/lib/content/index.ts (the browser-safe contract) and never\n` +
        `src/lib/content/server.ts or anything behind it. See src/lib/content/boundary.test.ts,\n` +
        `which names the offending import chain.\n`,
    );
    process.exit(1);
  }

  console.log(
    `verify-client-bundles: OK — ${files.length} browser-reachable file(s) scanned, ` +
      `${FORBIDDEN.length + SECRET_VALUES.length} pattern(s) each, no GROQ, transport or credential leakage.`,
  );
}

main();
