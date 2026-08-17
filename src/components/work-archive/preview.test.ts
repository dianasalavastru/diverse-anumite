/**
 * The project preview sheet's build-time decisions.
 *
 * OWNER: Workstream A. These hold the two properties the composition rule is
 * only useful if it has: it is DETERMINISTIC (the same assets always produce the
 * same sheet) and it is derived from the ASSETS (never from pillar, entry type,
 * prominence or position).
 */

import { describe, expect, it } from 'vitest';

import {
  COVER_SLOT,
  FIT_TOLERANCE,
  LANDSCAPE_ABOVE,
  LANDSCAPE_SLOT,
  PORTRAIT_BELOW,
  PORTRAIT_SLOT,
  classifyAspectRatio,
  mediaFit,
  previewComposition,
  slotRatioFor,
  type Proportioned,
} from './preview.js';

/* `previewComposition` takes an accessor because the archive's frames are not bare dimensions —
   they carry a CMS asset and a fitting decision too. These tests measure the rule itself, so the
   frame IS its proportions and the accessor is identity. */
const sheet = (frames: readonly Proportioned[]) => previewComposition(frames, (frame) => frame);

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

describe('Composition — orientation picks the family, source order fills it', () => {
  it('produces the four standard three-frame families', () => {
    expect(sheet([interior, tallScan, interior])?.layout).toBe('ppp');
    expect(sheet([interior, interior, board])?.layout).toBe('ppl');
    expect(sheet([interior, board, capture])?.layout).toBe('pll');
    expect(sheet([board, wideBoard, capture])?.layout).toBe('lll');
  });

  it('is blind to source order — the same shapes are the same family', () => {
    const of = (frames: readonly Proportioned[]) => sheet(frames)?.layout;

    expect(of([interior, board, capture])).toBe('pll');
    expect(of([board, interior, capture])).toBe('pll');
    expect(of([board, capture, interior])).toBe('pll');

    expect(of([interior, interior, board])).toBe('ppl');
    expect(of([interior, board, interior])).toBe('ppl');
    expect(of([board, interior, interior])).toBe('ppl');
  });

  it('anchors the family while preserving order INSIDE each orientation group', () => {
    const composition = sheet([board, interior, capture, tallScan]);
    /* portraits first, each group still in the editor's order */
    expect(composition?.frames).toEqual([interior, tallScan, board, capture]);
  });

  it('treats a near-square as a landscape, in every family', () => {
    /* The two readings the rule has to satisfy at once: a square joins the
       landscapes when they are the majority, AND takes the wider region when the
       portraits are. One answer does both. */
    expect(sheet([board, capture, nearSquare])?.layout).toBe('lll');
    expect(sheet([interior, tallScan, nearSquare])?.layout).toBe('ppl');
    expect(sheet([interior, board, nearSquare])?.layout).toBe('pll');
  });

  it('composes the degraded sheets an incomplete gallery produces', () => {
    expect(sheet([interior])?.layout).toBe('p');
    expect(sheet([board])?.layout).toBe('l');
    expect(sheet([interior, tallScan])?.layout).toBe('pp');
    expect(sheet([interior, board])?.layout).toBe('pl');
    expect(sheet([board, capture])?.layout).toBe('ll');
  });

  it('has no sheet at all for an entry with no gallery — never a substitute', () => {
    expect(sheet([])).toBeNull();
  });

  it('is a pure function — two calls, one answer', () => {
    const frames = [board, interior, capture];
    expect(sheet(frames)).toEqual(sheet(frames));
  });
});

describe('Fitting — bound the crop, because there is no media-type signal to read', () => {
  it('fills a slot the asset nearly matches', () => {
    expect(mediaFit(board, LANDSCAPE_SLOT)).toBe('cover');
    expect(mediaFit(board, COVER_SLOT)).toBe('cover');
    /* 0.708 against a 0.75 slot — a 5.6% trim, which is framing rather than
       composition. The rule bounds the crop; it does not forbid it. */
    expect(mediaFit(tallScan, PORTRAIT_SLOT)).toBe('cover');
  });

  it('contains a graphic asset the slot would cut into', () => {
    expect(mediaFit(wideBoard, LANDSCAPE_SLOT)).toBe('contain');
    expect(mediaFit(capture, LANDSCAPE_SLOT)).toBe('contain');
    expect(mediaFit(interior, PORTRAIT_SLOT)).toBe('contain');
  });

  it('never crops a portrait into a landscape box', () => {
    expect(mediaFit(interior, COVER_SLOT)).toBe('contain');
    expect(mediaFit(tallScan, COVER_SLOT)).toBe('contain');
  });

  it('is symmetric around the slot, to exactly the declared tolerance', () => {
    const wider = { width: LANDSCAPE_SLOT * FIT_TOLERANCE * 1000, height: 1000 };
    const taller = { width: (LANDSCAPE_SLOT / FIT_TOLERANCE) * 1000, height: 1000 };
    expect(mediaFit(wider, LANDSCAPE_SLOT)).toBe('cover');
    expect(mediaFit(taller, LANDSCAPE_SLOT)).toBe('cover');
    expect(mediaFit({ width: 1.15 * LANDSCAPE_SLOT * 1000, height: 1000 }, LANDSCAPE_SLOT)).toBe(
      'contain',
    );
  });

  it('contains what it cannot measure', () => {
    expect(mediaFit(null, LANDSCAPE_SLOT)).toBe('contain');
    expect(mediaFit({ width: 0, height: 100 }, LANDSCAPE_SLOT)).toBe('contain');
  });

  it('routes a frame to the slot its own orientation earns it', () => {
    expect(slotRatioFor(interior)).toBe(PORTRAIT_SLOT);
    expect(slotRatioFor(board)).toBe(LANDSCAPE_SLOT);
    expect(slotRatioFor(nearSquare)).toBe(LANDSCAPE_SLOT);
    expect(slotRatioFor(null)).toBe(LANDSCAPE_SLOT);
  });
});
