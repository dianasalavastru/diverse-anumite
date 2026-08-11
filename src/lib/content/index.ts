/**
 * The frontend ↔ CMS data boundary (`TECHNICAL_ARCHITECTURE.md` §8, Phase-0 frozen contract 8).
 *
 * OWNER: Workstream B. This module is the only surface components may import content shapes
 * from — no GROQ in components. Keeping the boundary here is what makes the Payload fallback
 * real (§8, R8).
 *
 * `./fixtures.js` is intentionally **not** re-exported: Phase-0 fixtures must be imported
 * explicitly so they never reach production output by accident. They are replaced by the
 * real query layer at I-3 (§23.4).
 */

export * from './types.js';
export * from './derive.js';
