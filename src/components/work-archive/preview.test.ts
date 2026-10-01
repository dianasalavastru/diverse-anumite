/**
 * The archive's orientation rule.
 *
 * OWNER: Workstream A. Orientation is derived from the ASSETS — never from
 * pillar, entry type, prominence or position — and the field planner reads it.
 */

import { describe, expect, it } from 'vitest';

import { LANDSCAPE_ABOVE, PORTRAIT_BELOW, classifyAspectRatio } from './preview.js';

/* Proportions taken from the assets the archive actually holds today. */
const board = { width: 2400, height: 1696 }; //  1.415  architectural board
const wideBoard = { width: 2400, height: 1333 }; //  1.800  panorama board
const capture = { width: 996, height: 766 }; //  1.300  screen capture
const interior = { width: 908, height: 1416 }; //  0.641  phone-shot interior
const tallScan = { width: 1698, height: 2400 }; //  0.708  tall board scan
const nearSquare = { width: 1000, height: 960 }; //  1.042  synthetic near-square

describe('Orientation — a property of the image, not a claim about its subject', () => {
  it('classifies the archive‘s real proportions', () => {
    expect(classifyAspectRatio(board)).toBe('landscape');
    expect(classifyAspectRatio(wideBoard)).toBe('landscape');
    expect(classifyAspectRatio(capture)).toBe('landscape');
    expect(classifyAspectRatio(interior)).toBe('portrait');
    expect(classifyAspectRatio(tallScan)).toBe('portrait');
  });

  it('names the undecidable band rather than forcing it', () => {
    expect(classifyAspectRatio(nearSquare)).toBe('square');
    expect(classifyAspectRatio({ width: PORTRAIT_BELOW * 1000, height: 1000 })).toBe('square');
    expect(classifyAspectRatio({ width: LANDSCAPE_ABOVE * 1000, height: 1000 })).toBe('square');
  });

  it('falls back to the wider slot when there is nothing to measure', () => {
    expect(classifyAspectRatio(null)).toBe('landscape');
    expect(classifyAspectRatio({ width: 0, height: 0 })).toBe('landscape');
  });
});
