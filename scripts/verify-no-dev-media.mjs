#!/usr/bin/env node
/**
 * Development-media leak scan — proof that a normal build cannot ship the visual-QA imagery.
 *
 * OWNER: Workstream A. Runs as `postbuild`, beside `verify-client-bundles.mjs`, so
 * `npm run build` — the command a deployment runs — fails rather than publishing.
 *
 * ── WHY A SEPARATE SCRIPT ──────────────────────────────────────────────────────────────────
 *
 * `verify-client-bundles.mjs` is Workstream B's, it asserts the §8/§18 content boundary, and it
 * scans `.js`/`.html` only, because those are "the two things a browser executes or parses".
 * That scope is correct for a credential leak and wrong for this one: temporary imagery leaks as
 * *files* and as CSS references, not only as markup. Widening B's guard would have meant editing
 * a single-owner file to weaken its stated scope. A second scan with its own reason costs one
 * postbuild step and leaves that guard exactly as it was.
 *
 * ── THE ASYMMETRY THIS ENCODES ─────────────────────────────────────────────────────────────
 *
 * With the flag ON, this is a local QA artifact and the imagery is *expected* — the scan reports
 * what it found and exits 0. With the flag OFF, a single hit is a hard failure. There is no
 * middle setting, because there is no legitimate way for one of these files to reach a build
 * that did not ask for it.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  devVisualMediaEnabled,
  DEV_VISUAL_MEDIA_FLAG,
  POOLS,
  PUBLIC_PREFIX,
  SOURCE_DIR,
} from './dev-visual-media.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(ROOT, 'dist');

/**
 * Every pattern names a distinct way the overlay could reach the output, so a hit says which
 * mechanism failed rather than just "something matched".
 */
const FORBIDDEN = [
  // Built from the constant rather than written out, so the scan cannot drift from the prefix
  // the integration actually serves under.
  { id: 'served derivative path', pattern: new RegExp(PUBLIC_PREFIX.replace(/\//g, '\\/')) },
  { id: 'visual-QA source directory', pattern: /dev-assets/ },
  { id: 'temporary-media marker attribute', pattern: /data-dev-visual-media/ },
  { id: 'the enabling flag', pattern: /DEV_VISUAL_MEDIA/ },
];

/** Text formats a reference could hide in. Binary image files are caught by extension instead. */
const SCANNED = /\.(js|mjs|css|html|json|xml|txt|svg)$/;

/** Raster extensions that have no business in this build at all — nothing in `src/` emits one. */
const RASTER = new Set(['.webp', '.jpg', '.jpeg', '.png', '.avif', '.gif', '.heic', '.heif']);

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

/** The exact filenames the owner supplied, so a copied original is caught under any new name. */
function sourceFilenames() {
  const names = new Set();
  for (const pool of POOLS) {
    let entries;
    try {
      entries = readdirSync(join(ROOT, SOURCE_DIR, pool));
    } catch {
      continue;
    }
    for (const name of entries) if (!name.startsWith('.')) names.add(name);
  }
  return [...names];
}

const enabled = devVisualMediaEnabled(process.env);
const files = walk(DIST);
const originals = sourceFilenames();
const findings = [];
let scanned = 0;

for (const path of files) {
  const rel = relative(DIST, path);
  const extension = extname(path).toLowerCase();

  if (RASTER.has(extension)) {
    findings.push({ file: rel, id: 'raster image in build output', line: 0 });
    continue;
  }

  if (!SCANNED.test(path)) continue;
  scanned += 1;

  const lines = readFileSync(path, 'utf8').split('\n');
  lines.forEach((line, index) => {
    for (const rule of FORBIDDEN) {
      if (rule.pattern.test(line)) findings.push({ file: rel, id: rule.id, line: index + 1 });
    }
    // Never prints the filename it matched: these are the owner's private files and this output
    // may end up in a log.
    for (const name of originals) {
      if (line.includes(name)) {
        findings.push({ file: rel, id: 'original visual-QA filename', line: index + 1 });
      }
    }
  });
}

if (enabled) {
  console.log(
    `verify-no-dev-media: ${DEV_VISUAL_MEDIA_FLAG}=true — this is a LOCAL VISUAL QA build.\n` +
      `  ${findings.length} expected temporary-media reference(s) across ${scanned} text file(s).\n` +
      `  This artifact must NOT be deployed. Rebuild without the flag to publish.`,
  );
  process.exit(0);
}

if (findings.length > 0) {
  console.error(
    `verify-no-dev-media: FAILED — a build without ${DEV_VISUAL_MEDIA_FLAG} contains ` +
      `${findings.length} reference(s) to development visual-QA media.\n` +
      `This imagery is not content, is not cleared for publication, and is not in Git.\n`,
  );
  for (const finding of findings.slice(0, 40)) {
    console.error(`  ${finding.file}${finding.line > 0 ? `:${finding.line}` : ''} — ${finding.id}`);
  }
  if (findings.length > 40) console.error(`  … and ${findings.length - 40} more`);
  process.exit(1);
}

console.log(
  `verify-no-dev-media: OK — ${scanned} text file(s) and ${files.length} total file(s) scanned, ` +
    `${FORBIDDEN.length} pattern(s) plus ${originals.length} source filename(s), ` +
    `no development media in the build.`,
);
