/**
 * The frontend ↔ CMS data boundary (`TECHNICAL_ARCHITECTURE.md` §8, Phase-0 frozen contract 8).
 *
 * OWNER: Workstream B. This module is the only surface components may import content shapes
 * from — no GROQ in components. Keeping the boundary here is what makes the Payload fallback
 * real (§8, R8).
 *
 * Components should need `types.ts`, `derive.ts` and `order.ts` only. `source.ts` is for the
 * page/composition layer, which resolves a `ContentSource` once and passes data down.
 *
 * Two modules are deliberately **not** re-exported:
 *   - `./fixtures.js` — Phase-0 placeholders must be imported explicitly so they can never reach
 *     production output by accident (§10.4). They are the I-3 stand-in, not content.
 *   - `./client.js` / `./groq.js` internals beyond the config surface — the transport and the
 *     query strings are implementation detail behind the boundary, and re-exporting them would
 *     invite exactly the `GROQ in components` §8 forbids.
 */

export * from './types.js';
export * from './derive.js';
export * from './order.js';
export * from './validation.js';

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
