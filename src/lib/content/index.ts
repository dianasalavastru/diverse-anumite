/**
 * The frontend ↔ CMS data boundary — **the browser-safe half** (`TECHNICAL_ARCHITECTURE.md` §8,
 * Phase-0 frozen contract 8).
 *
 * OWNER: Workstream B. This module is the only surface components may import content *shapes*
 * from — no GROQ in components. Keeping the boundary here is what makes the Payload fallback
 * real (§8, R8).
 *
 * ── THE ONE RULE THIS FILE MUST KEEP ───────────────────────────────────────────────────────
 *
 * **Its transitive import graph must stay free of the query layer.** Today that graph is exactly
 * `types.ts`, `derive.ts`, `order.ts`, `validation.ts` and `../i18n/routes.ts` — all pure, all
 * safe in a browser.
 *
 * This is not a style preference. Some modules are imported by an Astro composition *and* by a
 * client island — `components/work-archive/archive-state.ts` is the live example — so anything
 * this file can reach, a browser bundle can reach. Before B4 this file also re-exported
 * `source.ts`, `config.ts`, `client.ts` and `normalize.ts`; through them the Work Archive island
 * reached `groq.ts`, and every projection string shipped to the browser. The build-time half now
 * lives behind its own door, `./server.js`, which no client-reachable module may name.
 *
 * Adding an export here that pulls in `groq.ts`, `client.ts`, `config.ts`, `source.ts`,
 * `normalize.ts`, `fixtures.ts` or `build-source.ts` re-opens that leak. `boundary.test.ts`
 * fails if it happens; `scripts/verify-client-bundles.mjs` fails again on the built output.
 *
 * ── WHAT LIVES ELSEWHERE, AND WHY ──────────────────────────────────────────────────────────
 *
 *   - `./server.js`    — the build-time surface: the `ContentSource` factories, the connection
 *                        config, the transport error type, the draft assertion. Imported by
 *                        `build-source.ts` and the tests; never by a component.
 *   - `./build-source.js` — the resolved live `ContentSource` pages call. Not re-exported, so the
 *                        two content origins are never one autocomplete apart.
 *   - `./fixtures.js`  — Phase-0 placeholders. Imported explicitly so they can never reach
 *                        production output by accident (§10.4). Tests only.
 *   - `./groq.js`      — the query strings. Implementation detail behind the boundary; exporting
 *                        it from here would invite exactly the `GROQ in components` §8 forbids,
 *                        and would put it back in the browser.
 */

export * from './types.js';
export * from './derive.js';
export * from './order.js';
export * from './validation.js';
