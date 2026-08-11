/**
 * The **build-time** half of the content boundary.
 *
 * OWNER: Workstream B. `TECHNICAL_ARCHITECTURE.md` §8, §18, §23.4.
 *
 * ── WHY THIS FILE EXISTS (B4) ──────────────────────────────────────────────────────────────
 *
 * §8 requires the query layer to stay "isolated behind a module boundary… No GROQ in
 * components." Until B4 that boundary had **one** door — `index.ts` — and it opened onto both
 * halves of the module: the browser-safe contract (types, derivations, ordering, validation)
 * *and* the build-only machinery (`config.ts`, `client.ts`, `groq.ts`, `normalize.ts`,
 * `source.ts`).
 *
 * That is a rule about intent, and a bundler does not read intent. It reads the import graph.
 * `components/work-archive/archive-state.ts` is imported by *both* the archive's Astro
 * composition and its client island, and it took one value (`PILLARS`) from `index.ts` — so the
 * island's module graph reached `source.ts` → `groq.ts`, and every GROQ projection string was
 * emitted into the browser bundle. Tree-shaking did not remove them: `groq.ts` builds its
 * projections with top-level `projection(...)` calls, which Rollup cannot prove side-effect-free,
 * so the strings survived into `dist/_astro/WorkArchive.*.js`.
 *
 * The correction is to give the two halves **two doors**:
 *
 *   - `index.ts`  — the browser-safe contract. Its transitive graph is `types`, `derive`,
 *                   `order`, `validation` and the locale route map. Nothing in it can reach a
 *                   query string, the transport, or an environment variable name.
 *   - `server.ts` — this file. Everything that runs at build only.
 *
 * A client-reachable module can now import the boundary without dragging the CMS into the
 * browser, and it can no longer reach this half **by accident** — reaching it requires naming
 * this file, which is the point. `boundary.test.ts` asserts the property from the source graph;
 * `scripts/verify-client-bundles.mjs` asserts it again on the emitted bundles.
 *
 * ── WHAT MAY IMPORT THIS ───────────────────────────────────────────────────────────────────
 *
 * `build-source.ts` (which pages consume) and the test suites. Never a component, never an
 * island, never anything a `<script>` block can reach.
 */

export {
  createContentSource,
  createSanityContentSource,
  createSanityDocuments,
  availableIn,
  groupByEmployer,
  hasPlacement,
  isCompetition,
  isProfessionalExperience,
  type ContentSource,
  type CuratedView,
  type EmployerGroup,
  type RawDocuments,
} from './source.js';

export {
  ENV,
  PRODUCTION_PERSPECTIVE,
  SANITY_API_VERSION,
  ContentConfigError,
  assertProductionPerspective,
  resolveSanityConfig,
  type Perspective,
  type SanityConfig,
} from './config.js';

export { ContentFetchError, type ContentClient } from './client.js';
export { ContentShapeError, assertNotDraft } from './normalize.js';
