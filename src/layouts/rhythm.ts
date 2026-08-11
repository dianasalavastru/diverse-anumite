/**
 * The authored page rhythms.
 *
 * One entry per rhythm set in src/styles/tokens.css, each transcribed verbatim
 * from the approved HiFi for that page type. VISUAL_DIRECTION_v2.0 §8 makes
 * pacing deliberate and non-metronomic, and the HiFis implement that per page
 * type — so this is a closed set of authored decisions, not a scale.
 *
 * There is deliberately NO default. `rhythm` is a required prop on BaseLayout:
 * a page type with no approved HiFi (Contact, About — README.md §"Open
 * questions") has no rhythm here and will fail to compile rather than silently
 * inherit invented values.
 */
export type PageRhythm =
  | 'homepage'
  | 'pillar-hub'
  | 'service'
  | 'work-entry'
  | 'work-archive';

export const PAGE_RHYTHMS = [
  'homepage',
  'pillar-hub',
  'service',
  'work-entry',
  'work-archive',
] as const satisfies readonly PageRhythm[];
