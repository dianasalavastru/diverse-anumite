/**
 * The archive field planner — C-refined v3.
 *
 * OWNER: Workstream A. These hold what the locked design depends on: the family is chosen from
 * the media set alone, every variant closes inside the logical 12 × 9 grid without overlaps,
 * drawings are never cropped, photographs are cropped only inside the budget across the whole
 * stretch range, and the families keep comparable heights.
 */

import { describe, expect, it } from 'vitest';

import {
  COLUMN_GAP,
  CROP_BUDGET,
  MAX_STRETCH,
  ROW_GAP,
  fieldFit,
  mirrorBox,
  planField,
  slotRatio,
  type FieldBox,
  type FieldMedia,
  type FieldPlan,
} from './field.js';

/* Proportions taken from the development Projects the design was approved on. */
const photo = (width: number, height: number): FieldMedia => ({ width, height, drawing: false });
const drawing = (width: number, height: number): FieldMedia => ({ width, height, drawing: true });

const roof = photo(2400, 1798); //        1.335  Reality Capture photograph
const furniture = photo(996, 766); //     1.300  workshop photograph
const interior = photo(901, 1413); //     0.638  portrait render
const interior2 = photo(908, 1416); //    0.641  portrait render
const board = drawing(2400, 1696); //     1.415  competition board
const wideBoard = drawing(2400, 1200); // 2.000  panorama board
const tallBoard = drawing(1698, 2400); // 0.708  portrait board
const square = photo(1000, 1000);

const plan = (cover: FieldMedia, supports: readonly FieldMedia[] = []): FieldPlan<FieldMedia> =>
  planField(cover, supports, (media) => media);

const area = ({ columns, rows }: FieldBox) => (columns[1] - columns[0]) * (rows[1] - rows[0]);
const overlaps = (a: FieldBox, b: FieldBox) =>
  a.columns[0] < b.columns[1] &&
  b.columns[0] < a.columns[1] &&
  a.rows[0] < b.rows[1] &&
  b.rows[0] < a.rows[1];

/** Every box the plan places, title included. */
const boxes = (result: FieldPlan<FieldMedia>) => [...result.slots.map((slot) => slot.box), result.title.box];

/* Every variant the planner can produce, by the media sets that produce them. */
const CASES: readonly (readonly [string, FieldMedia, readonly FieldMedia[]])[] = [
  ['landscape-0', roof, []],
  ['landscape-1', roof, [roof]],
  ['landscape-2', roof, [roof, board]],
  ['landscape-3', roof, [roof, board, furniture]],
  ['landscape-anchor', furniture, [interior, roof]],
  ['landscape-anchor', furniture, [interior]],
  ['portrait-0', interior, []],
  ['portrait-detail', interior, [interior2]],
  ['portrait-beside', interior, [furniture]],
  ['portrait-beside', interior, [furniture, roof]],
  ['portrait-beside', interior, [board, interior2]],
  ['drawing-0', board, []],
  ['drawing-1', board, [board]],
  ['drawing-2', board, [board, board]],
  ['drawing-3', board, [board, board, board]],
  ['drawing-anchor', board, [tallBoard, board]],
  ['drawing-wide-0', wideBoard, []],
  ['drawing-wide-2', wideBoard, [board, board, board]],
  ['drawing-sheet-beside', tallBoard, [board]],
  ['drawing-sheet-detail', tallBoard, [tallBoard]],
];

describe('Family — chosen from the media set, and from nothing else', () => {
  it('reads a drawing cover as Drawing-led whatever its shape', () => {
    expect(plan(board).family).toBe('drawing');
    expect(plan(tallBoard).family).toBe('drawing');
    expect(plan(wideBoard).family).toBe('drawing');
  });

  it('reads a portrait photograph as Portrait-led and everything else as Landscape-led', () => {
    expect(plan(interior).family).toBe('portrait');
    expect(plan(roof).family).toBe('landscape');
    expect(plan(square).family).toBe('landscape');
  });

  it('plans an unmeasurable cover as a 3:2 photograph', () => {
    const result = planField('missing', [], () => null);
    expect(result.family).toBe('landscape');
    expect(result.variant).toBe('landscape-0');
  });

  it.each(CASES)('produces %s', (variant, cover, supports) => {
    expect(plan(cover, supports).variant).toBe(variant);
  });

  it('is a pure function — two calls, one answer', () => {
    expect(plan(roof, [roof, board])).toEqual(plan(roof, [roof, board]));
  });

  it('uses at most four images, in authored order', () => {
    const result = plan(roof, [roof, board, furniture, interior]);
    expect(result.slots.map((slot) => slot.ref)).toEqual(['cover', 's1', 's2', 's3']);
    expect(result.slots.map((slot) => slot.item)).toEqual([roof, roof, board, furniture]);
  });
});

describe('Geometry — every variant closes inside the logical 12 × 9 grid', () => {
  it.each(CASES)('%s stays in bounds with no overlaps', (_variant, cover, supports) => {
    const result = plan(cover, supports);
    const placed = boxes(result);
    for (const box of placed) {
      expect(box.columns[0]).toBeGreaterThanOrEqual(1);
      expect(box.columns[1]).toBeLessThanOrEqual(13);
      expect(box.rows[0]).toBeGreaterThanOrEqual(1);
      expect(box.rows[1]).toBeLessThanOrEqual(10);
      expect(area(box)).toBeGreaterThan(0);
    }
    placed.forEach((a, i) => placed.slice(i + 1).forEach((b) => expect(overlaps(a, b)).toBe(false)));
    expect(result.rows).toBeLessThanOrEqual(9);
  });

  it('gives Landscape and Portrait the same height and Drawing one row more', () => {
    expect(plan(roof, [roof, board]).rows).toBe(8);
    expect(plan(interior, [interior2]).rows).toBe(8);
    expect(plan(board, [board, board, board]).rows).toBe(9);
  });

  it('holds the Drawing premium to the approved 10–15% of physical height', () => {
    const height = (rows: number) => rows + (rows - 1) * ROW_GAP;
    const premium = height(9) / height(8);
    expect(premium).toBeGreaterThan(1.1);
    expect(premium).toBeLessThan(1.15);
  });

  it('keeps the Portrait detail to four columns, flush right', () => {
    const detail = plan(interior, [interior2]).slots.find((slot) => slot.ref === 's1');
    expect(detail?.box).toEqual({ columns: [9, 13], rows: [4, 9] });
  });

  it('mirrors columns and leaves rows alone', () => {
    expect(mirrorBox({ columns: [1, 9], rows: [1, 7] })).toEqual({ columns: [5, 13], rows: [1, 7] });
    expect(mirrorBox({ columns: [9, 13], rows: [4, 9] })).toEqual({ columns: [1, 5], rows: [4, 9] });
  });

  it('shapes the title block by its slot', () => {
    expect(plan(roof, [roof, board]).title).toMatchObject({ shape: 'band', low: true });
    expect(plan(board, [board, board, board]).title).toMatchObject({ shape: 'band', low: false });
    expect(plan(roof, [roof]).title).toMatchObject({ shape: 'cell', low: false });
  });
});

describe('Fitting — drawings are never cropped, photographs only within budget', () => {
  it.each(CASES)('%s contains every drawing', (_variant, cover, supports) => {
    for (const slot of plan(cover, supports).slots) {
      if ((slot.item as FieldMedia).drawing) expect(slot.fit).toBe('contain');
    }
  });

  it.each(CASES)('%s crops a photograph only inside the budget at both stretch limits', (_v, cover, supports) => {
    for (const slot of plan(cover, supports).slots) {
      if (slot.fit !== 'cover') continue;
      const media = slot.item as FieldMedia;
      const ratio = media.width / media.height;
      for (const stretch of [1, MAX_STRETCH]) {
        const frame = slotRatio(slot.box, stretch);
        expect(Math.max(ratio / frame, frame / ratio)).toBeLessThanOrEqual(CROP_BUDGET);
      }
    }
  });

  it('crops every photograph of the approved development Projects', () => {
    const fits = (result: FieldPlan<FieldMedia>) => result.slots.map((slot) => slot.fit);
    expect(fits(plan(roof, [roof, board]))).toEqual(['cover', 'cover', 'contain']);
    expect(fits(plan(interior, [interior2]))).toEqual(['cover', 'cover']);
    expect(fits(plan(furniture, [interior, roof]))).toEqual(['cover', 'cover', 'cover']);
  });

  it('falls back to contain rather than crop excessively', () => {
    // A 5-column detail would need a 1.95× crop at full stretch — the reason it is 4 columns.
    const fiveColumns: FieldBox = { columns: [8, 13], rows: [4, 9] };
    expect(fieldFit(interior2, fiveColumns)).toBe('contain');
    expect(fieldFit(interior2, { columns: [9, 13], rows: [4, 9] })).toBe('cover');
  });

  it('measures slots with the stylesheet’s gaps', () => {
    // 8 × 6 with square cells: (8 + 7 × 0.275) / (6 + 5 × 0.22).
    expect(slotRatio({ columns: [1, 9], rows: [1, 7] }, 1)).toBeCloseTo((8 + 7 * COLUMN_GAP) / (6 + 5 * ROW_GAP));
  });
});

describe('Mobile — the same hierarchy, linear', () => {
  it('frames a portrait cover at 4:5 and a landscape cover between 4:3 and 3:2', () => {
    expect(plan(interior).mobile.cover.ratio).toBeCloseTo(4 / 5);
    expect(plan(roof).mobile.cover.ratio).toBeCloseTo(roof.width / roof.height);
    expect(plan(photo(2400, 1000)).mobile.cover.ratio).toBeCloseTo(3 / 2);
  });

  it('keeps drawings at their own ratio, contained', () => {
    const { cover, supports } = plan(board, [board, board]).mobile;
    expect(cover).toMatchObject({ ratio: board.width / board.height, fit: 'contain' });
    supports.forEach((support) => expect(support.fit).toBe('contain'));
  });

  it('lets an odd first support span the strip and pairs the rest', () => {
    expect(plan(roof, [roof]).mobile.supports.map((s) => s.wide)).toEqual([true]);
    expect(plan(roof, [roof, board]).mobile.supports.map((s) => s.wide)).toEqual([false, false]);
    expect(plan(roof, [roof, board, furniture]).mobile.supports.map((s) => s.wide)).toEqual([true, false, false]);
  });

  it('shows on mobile exactly the supports the desktop field shows', () => {
    const result = plan(interior, [interior2, interior]);
    expect(result.slots.length - 1).toBe(result.mobile.supports.length);
  });
});
