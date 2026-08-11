/**
 * Minimal Node typings for the build-time-only modules in this directory.
 *
 * OWNER: Workstream B.
 *
 * WHY THIS EXISTS. The web application's TypeScript program is deliberately browser-typed:
 * `tsconfig.json` excludes `studio/` with the note that pulling "Sanity's React/Node surface"
 * into the Astro program "reported `process` as undefined against the browser lib." That
 * decision is Workstream A's, and `package.json` is A's single-owner file (§23.3) — so B may
 * not add `@types/node` to the web app to make `live.test.ts` type-check.
 *
 * These declarations are the smallest thing that keeps `npm run check` green without a
 * dependency change or a cross-boundary edit. They cover exactly the calls `live.test.ts` and
 * `boundary.test.ts` make and nothing else, and they are inert for every other file: nothing in
 * `src/` outside this directory imports a Node module, because nothing outside the build-time
 * query layer is allowed to.
 *
 * `studio/tsconfig.json` excludes this file — the Studio has real `@types/node`, and two
 * declarations of the same module would collide.
 *
 * HANDOFF. The correct long-term fix is `@types/node` in the web app's devDependencies, which
 * is an explicit integration handoff to A (§23.3). Until then, this file is the seam.
 */

declare module 'node:fs' {
  export function readFileSync(path: string | URL, encoding: 'utf8'): string;

  /* `boundary.test.ts` walks `src/` to discover every client entry point rather than listing
     them, so a new island is covered the day it is mounted. */
  interface Dirent {
    readonly name: string;
    isDirectory(): boolean;
  }
  interface Stats {
    isFile(): boolean;
  }
  export function readdirSync(path: string, options: { withFileTypes: true }): Dirent[];
  export function statSync(path: string): Stats;
}

declare module 'node:path' {
  export function dirname(path: string): string;
  export function join(...paths: string[]): string;
  export function relative(from: string, to: string): string;
  export function resolve(...paths: string[]): string;
}

declare module 'node:url' {
  export function fileURLToPath(url: string | URL): string;
}

declare module 'node:child_process' {
  interface ExecFileSyncOptions {
    readonly cwd?: string | URL;
  }
  export function execFileSync(
    file: string,
    args: readonly string[],
    options?: ExecFileSyncOptions,
  ): { toString(encoding: 'utf8'): string };
}
