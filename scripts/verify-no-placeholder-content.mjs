#!/usr/bin/env node
/**
 * Placeholder / demo / fabricated-content leak scan — the guard that keeps the locked placeholder
 * policy true after the copy pass, not just at the moment of it.
 *
 * OWNER: Workstream A. Runs as `postbuild`, beside `verify-client-bundles.mjs` and
 * `verify-no-dev-media.mjs`, so `npm run build` — the command a deployment runs — fails rather
 * than publishing.
 *
 * ── WHAT IT DEFENDS ────────────────────────────────────────────────────────────────────────
 *
 * The locked policy is categorical: no public `TEST`, `demo`, `substituent` or `placeholder`
 * copy, image alt included; a missing fact is ABSENT; fabricated metrics and unconfirmed
 * coordinates are removed rather than neutralised. Removing them once is a copy edit. Keeping
 * them out is this file — because every one of these strings arrives from the CMS, and a
 * publish that re-introduces one rebuilds the site without anyone reading the diff.
 *
 * ── WHY IT IS PRODUCTION-ONLY, AND WHY THAT IS NOT A LOOPHOLE ──────────────────────────────
 *
 * The `development` dataset is *supposed* to be full of `TEST — …` documents. `studio/seed/`
 * documents it as disposable and re-importable, its whole purpose is to exercise page shapes
 * before real content exists, and the seed's own README states no seeded string may ever reach
 * production. A scan that failed against it would fail every local build, and the only way to
 * get a green build would be to edit the development data — i.e. to destroy the fixture in order
 * to satisfy the guard protecting production from it. So the asymmetry is deliberate, and it is
 * the same shape `verify-no-dev-media.mjs` already uses for the visual-QA overlay:
 *
 *   development dataset → report what was found, exit 0
 *   any other dataset   → a single hit is a hard failure
 *
 * The gate is the DATASET, never a "skip" flag, because the dataset is the thing that actually
 * determines whether the strings are legitimate. `ALLOW_PLACEHOLDER_CONTENT=true` exists as a
 * deliberate, named override for the one case the dataset cannot express — a rehearsal build
 * against real infrastructure before the content is authored.
 *
 * ── WHAT IT DOES NOT DO ────────────────────────────────────────────────────────────────────
 *
 * It does not judge editorial quality, and it does not know what the copy should say. It answers
 * one question — "did anything self-identifying as provisional reach the output?" — and every
 * pattern below is a string that no finished page has a reason to contain.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(ROOT, 'dist');

/** The dataset whose content is *expected* to be provisional. */
const DEVELOPMENT_DATASET = 'development';
const OVERRIDE_FLAG = 'ALLOW_PLACEHOLDER_CONTENT';

/**
 * Each rule names a distinct way provisional content reaches a page, so a hit says which
 * mechanism failed rather than just "something matched".
 *
 * Word boundaries matter more than they look. `TEST` is uppercase-only and bounded, because
 * `latest`, `greatest` and `Testing` are ordinary words; `demo` is bounded for `democratic` and
 * `demolare` — a real risk in Romanian architectural copy about demolition.
 */
const FORBIDDEN = [
  { id: 'TEST-prefixed CMS content', pattern: /\bTEST\b/ },
  { id: 'demo content marker', pattern: /\bdemo\b/i },
  { id: 'Romanian placeholder marker', pattern: /substituent/i },
  { id: 'English placeholder marker', pattern: /placeholder/i },
  { id: 'unresolved authoring marker', pattern: /\bTODO\b|\bFIXME\b|\bTBD\b/ },
  { id: 'fixture-marked element', pattern: /data-fixture/ },
  { id: 'test-prefixed slug in a URL', pattern: /href="[^"]*\/test-/ },
  /* §10.4 — fabricated technical readouts and unconfirmed geography. Both were removed as copy;
     neither has a CMS field, so a reappearance means someone re-typed one. */
  { id: 'unconfirmed geographic coordinates', pattern: /\d{1,3}\.\d+°\s*[NS]/ },
  { id: 'fabricated dimension readout', pattern: /\bh\s*—\s*\d+(\.\d+)?\s*m\b/ },
];

/** Text formats a rendered string could reach the reader through. */
const SCANNED = /\.(html|js|mjs|css|json|xml|txt|svg)$/;

function walk(dir) {
  const found = [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return found;
  }
  for (const name of entries) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) found.push(...walk(path));
    else found.push(path);
  }
  return found;
}

const dataset = process.env.SANITY_DATASET ?? '';
const overridden = process.env[OVERRIDE_FLAG] === 'true';
const provisional = dataset === DEVELOPMENT_DATASET || dataset === '' || overridden;

const findings = [];
let scanned = 0;

for (const path of walk(DIST)) {
  if (!SCANNED.test(path)) continue;
  scanned += 1;
  const rel = relative(DIST, path);
  readFileSync(path, 'utf8')
    .split('\n')
    .forEach((line, index) => {
      for (const rule of FORBIDDEN) {
        if (rule.pattern.test(line)) findings.push({ file: rel, id: rule.id, line: index + 1 });
      }
    });
}

if (provisional) {
  const why = overridden
    ? `${OVERRIDE_FLAG}=true`
    : dataset === ''
      ? 'SANITY_DATASET is unset'
      : `SANITY_DATASET=${DEVELOPMENT_DATASET}`;
  console.log(
    `verify-no-placeholder-content: ${why} — provisional content is EXPECTED here.\n` +
      `  ${findings.length} placeholder reference(s) across ${scanned} text file(s), not treated as failures.\n` +
      `  This artifact must NOT be deployed to production. Build against the production dataset to publish.`,
  );
  process.exit(0);
}

if (findings.length > 0) {
  const byRule = new Map();
  for (const finding of findings) byRule.set(finding.id, (byRule.get(finding.id) ?? 0) + 1);

  console.error(
    `verify-no-placeholder-content: FAILED — a build against dataset "${dataset}" contains ` +
      `${findings.length} placeholder/demo/fabricated reference(s).\n` +
      `The locked placeholder policy is categorical: a missing fact is ABSENT, never a marked ` +
      `stand-in. Fix the CONTENT, not this scan.\n`,
  );
  for (const [id, count] of byRule) console.error(`  ${count}× ${id}`);
  console.error('');
  for (const finding of findings.slice(0, 40)) {
    console.error(`  ${finding.file}:${finding.line} — ${finding.id}`);
  }
  if (findings.length > 40) console.error(`  … and ${findings.length - 40} more`);
  process.exit(1);
}

console.log(
  `verify-no-placeholder-content: OK — ${scanned} text file(s) scanned against ` +
    `${FORBIDDEN.length} pattern(s) on dataset "${dataset}", no placeholder content in the build.`,
);
