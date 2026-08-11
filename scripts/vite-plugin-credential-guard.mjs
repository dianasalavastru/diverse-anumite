/**
 * In-build credential guard — the §18 check that runs *while* the build runs.
 *
 * OWNER: Workstream B. `TECHNICAL_ARCHITECTURE.md` §18 ("No secret ever enters Git. No secret
 * ever reaches the browser"). Added at B4 to close S1.
 *
 * ── WHY A PLUGIN AND NOT ANOTHER `dist/` SCAN ──────────────────────────────────────────────
 *
 * `scripts/verify-client-bundles.mjs` reads `dist/` after the build. That is the right place to
 * assert what gets *published*, and it is blind to S1 by construction: Astro writes its SSR
 * chunks into `dist/chunks/` during a static build and **deletes them before the build exits**.
 * The chunk that carried the inlined read token existed for about a second and left no trace in
 * the final tree. A post-build scan cannot see it; polling for it is a race.
 *
 * A Rollup `generateBundle` hook has neither problem. It is handed every chunk of every output —
 * client build and SSR build alike — in memory, at the moment it is generated, before anything
 * is written or cleaned up. Transient and final artifacts are the same thing to it.
 *
 * ── WHAT IT LOOKS FOR ──────────────────────────────────────────────────────────────────────
 *
 *   1. **The S1 signature.** A credential variable name used as an *object key with a string
 *      literal value* — `SANITY_READ_TOKEN: "…"`. That is what Vite's whole-object
 *      `import.meta.env` substitution emits, and nothing else produces it. `config.ts` carries
 *      the same name as a *value* (`readToken: 'SANITY_READ_TOKEN'`), which is correct and does
 *      not match. This fires whether or not a credential is present in the environment, so the
 *      regression is caught on a machine that has never held a token.
 *   2. **Literal values.** Any credential-shaped variable found in `process.env` or in a local
 *      `.env`, matched exactly against the emitted code. Catches a leak by any route, including
 *      one nobody predicted.
 *   3. **Token shape.** A Sanity token pattern, which catches a hardcoded credential.
 *
 * ── IT NEVER PRINTS A SECRET ───────────────────────────────────────────────────────────────
 *
 * A guard that echoes a credential into a CI log has replaced one leak with a worse one. Values
 * are held in memory for comparison and never formatted into a message: findings name the
 * chunk, the rule, and — for a literal match — the *variable name only*. There is no code path
 * here that writes a value, a slice of one, or a prefix of one to any stream.
 */

import { readFileSync } from 'node:fs';

/** Variables whose *value* is a secret. Names are public; these already sit in `.env.example`. */
const SECRET_NAME = /^(.*_TOKEN|.*_API_KEY|.*_SECRET(_KEY)?)$/;

const RULES = [
  {
    id: 'credential inlined as a literal (the S1 signature)',
    // `SANITY_READ_TOKEN: "…"` — a name used as an object key with a string value. This is what
    // `import.meta.env` whole-object substitution emits.
    pattern: /\b[A-Z][A-Z0-9_]*(_TOKEN|_API_KEY|_SECRET|_SECRET_KEY)\s*:\s*["'`]/,
  },
  {
    id: 'Sanity token shape',
    pattern: /\bsk[A-Za-z0-9._-]{40,}\b/,
  },
];

/** Same minimal reader as `build-source.ts`; see the note there on why this is not a dependency. */
function parseEnvFile(source) {
  const values = {};
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
 * Candidate secrets to match literally: whatever this machine actually holds, from the real
 * environment and from a local `.env`. Collected by name; the values are used for `includes()`
 * and nothing else.
 */
function candidateSecrets() {
  let fileEnv = {};
  try {
    fileEnv = parseEnvFile(readFileSync(`${process.cwd()}/.env`, 'utf8'));
  } catch {
    /* no local .env — the normal CI case */
  }

  const merged = { ...fileEnv, ...process.env };
  return Object.entries(merged)
    .filter(([name, value]) => SECRET_NAME.test(name) && typeof value === 'string' && value.length >= 12)
    .map(([name, value]) => ({ name, value }));
}

/** @returns {import('vite').Plugin} */
export function credentialGuard() {
  const secrets = candidateSecrets();

  return {
    name: 'diverse-anumite:credential-guard',
    // Build only: `generateBundle` has no dev-server counterpart, and nothing is emitted in dev.
    apply: 'build',
    // `post` so the code inspected is what Rollup will actually write, after every other
    // transform — including Vite's own `import.meta.env` substitution, which is the thing being
    // guarded against.
    enforce: 'post',

    generateBundle(_options, bundle) {
      const findings = [];

      for (const [fileName, output] of Object.entries(bundle)) {
        const code = output.type === 'chunk' ? output.code : String(output.source ?? '');
        if (code.length === 0) continue;

        for (const rule of RULES) {
          if (rule.pattern.test(code)) findings.push(`${fileName} — ${rule.id}`);
        }

        for (const secret of secrets) {
          // The value is compared, never rendered. Only its variable name reaches the message.
          if (code.includes(secret.value)) {
            findings.push(`${fileName} — the literal value of ${secret.name}`);
          }
        }
      }

      if (findings.length > 0) {
        this.error(
          `credential-guard: a secret reached a build artifact (TECHNICAL_ARCHITECTURE.md §18).\n\n` +
            findings.map((finding) => `  ✗ ${finding}`).join('\n') +
            `\n\nThis fires on chunks that are generated and then deleted, so "it is not in dist/"\n` +
            `is not a defence. The usual cause is reading a credential through import.meta.env:\n` +
            `Vite substitutes it at transform time, so the value is baked into the output. Read it\n` +
            `at runtime instead — see the header of src/lib/content/build-source.ts.\n`,
        );
      }
    },
  };
}
