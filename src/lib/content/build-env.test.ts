/**
 * Build-time credential resolution — the pure half of `build-source.ts` (B4/S1).
 *
 * OWNER: Workstream B. `TECHNICAL_ARCHITECTURE.md` §18.
 *
 * S1 replaced an `import.meta.env` fallback with a runtime `.env` read, because Vite substitutes
 * `import.meta.env` at transform time and therefore bakes whatever it holds into the emitted
 * bundle. That trade is only sound if the replacement actually resolves the same variables in
 * the same precedence — otherwise the fix reads as "the token is safe now" while the build has
 * quietly stopped finding it, or has started preferring the wrong dataset.
 *
 * These are the two decisions that had to survive the change, tested on synthetic input only.
 * **No test here reads, constructs, or asserts against a real credential.**
 */

import { describe, expect, it } from 'vitest';

import { parseEnvFile, selectBuildEnv } from './build-source.js';
import { ENV } from './config.js';

describe('parseEnvFile', () => {
  it('reads plain assignments and ignores comments and blank lines', () => {
    expect(
      parseEnvFile(
        ['# a comment', '', 'SANITY_PROJECT_ID=abc123', '   ', 'SANITY_DATASET=development'].join('\n'),
      ),
    ).toEqual({ SANITY_PROJECT_ID: 'abc123', SANITY_DATASET: 'development' });
  });

  it('strips surrounding quotes of either kind, and only when they match', () => {
    expect(parseEnvFile(['A="quoted"', "B='quoted'", 'C="unbalanced', 'D=bare'].join('\n'))).toEqual({
      A: 'quoted',
      B: 'quoted',
      C: '"unbalanced',
      D: 'bare',
    });
  });

  it('keeps `=` inside a value — only the first separator splits', () => {
    // Opaque credentials routinely contain `=` padding. Splitting on every `=` would silently
    // truncate one, and a truncated token fails at the API with an auth error rather than here.
    expect(parseEnvFile('SOME_VALUE=aa=bb==cc')).toEqual({ SOME_VALUE: 'aa=bb==cc' });
  });

  it('ignores malformed lines rather than inventing empty variables', () => {
    // An empty string would satisfy a naive presence check; `resolveSanityConfig` trims and
    // rejects, but nothing should get that far.
    expect(parseEnvFile(['no-separator', '=novalue', 'export FOO'].join('\n'))).toEqual({});
  });

  it('tolerates CRLF line endings', () => {
    expect(parseEnvFile('SANITY_DATASET=development\r\nSANITY_PROJECT_ID=abc123\r\n')).toEqual({
      SANITY_DATASET: 'development',
      SANITY_PROJECT_ID: 'abc123',
    });
  });
});

describe('selectBuildEnv', () => {
  const FILE = {
    [ENV.projectId]: 'from-file',
    [ENV.dataset]: 'from-file',
    [ENV.readToken]: 'from-file',
  };

  it('prefers a real environment variable over the .env file', () => {
    // The precedence `live.test.ts` uses, so the harness and the build can never be pointed at
    // two different datasets by the same shell.
    expect(selectBuildEnv({ [ENV.dataset]: 'from-process' }, FILE)).toEqual({
      [ENV.projectId]: 'from-file',
      [ENV.dataset]: 'from-process',
      [ENV.readToken]: 'from-file',
    });
  });

  it('resolves entirely from the .env file when nothing is exported — the local path', () => {
    expect(selectBuildEnv({}, FILE)).toEqual(FILE);
  });

  it('resolves entirely from process.env when there is no .env — the Cloudflare path', () => {
    const process = {
      [ENV.projectId]: 'from-process',
      [ENV.dataset]: 'from-process',
      [ENV.readToken]: 'from-process',
    };
    expect(selectBuildEnv(process, {})).toEqual(process);
  });

  it('leaves a missing variable undefined so the build fails by name', () => {
    // Fail-clear is the §10.4 property: a build that cannot reach the CMS must stop, never fall
    // back to fixtures. `resolveSanityConfig` is what raises; this only has to not paper over it.
    expect(selectBuildEnv({}, {})).toEqual({
      [ENV.projectId]: undefined,
      [ENV.dataset]: undefined,
      [ENV.readToken]: undefined,
    });
  });

  it('carries only the three §18 names, never the rest of the environment', () => {
    const selected = selectBuildEnv({ PATH: '/usr/bin', AWS_SECRET_ACCESS_KEY: 'unrelated' }, FILE);
    expect(Object.keys(selected).sort()).toEqual([ENV.dataset, ENV.projectId, ENV.readToken].sort());
  });
});
