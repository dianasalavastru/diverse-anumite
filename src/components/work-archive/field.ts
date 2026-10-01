/**
 * The archive field — C-refined v3 (DECISIONS_LOG #117).
 *
 * OWNERSHIP: Workstream A. Pure, DOM-free, unit-tested — the contract `masonry.ts` and
 * `preview.ts` keep: this decides SHAPE, never which project leads or in what order projects fall.
 *
 * ── WHAT A FIELD IS ─────────────────────────────────────────────────────────
 * Each Project in the Work Archive is one designed field on a LOGICAL grid of 12 columns and at
 * most 9 rows. The cover, up to three supporting images and a title block are placed on that grid
 * as rectangles, and together they close one composition. Which composition is a FAMILY, chosen
 * from the media set and nothing else:
 *
 *   drawing    the cover is a gallery `drawing`               → boards contained on white
 *   portrait   the cover is portrait (ratio < 0.9)            → a genuinely vertical dominant
 *   landscape  everything else                                → an 8 × 6 dominant
 *
 * Every family has deterministic variants for 1–4 images; the planner below is the whole rule.
 *
 * ── LOGICAL VS PHYSICAL ─────────────────────────────────────────────────────
 * The stylesheet sizes the grid (`work-archive.css` A-5a): rows from the viewport HEIGHT, columns
 * from the content WIDTH, so a physical cell may be up to `MAX_STRETCH` times wider than tall.
 * Slot proportions therefore vary within a known range, and the crop decision is taken against
 * BOTH ends of it — a photograph is cropped only when the crop stays inside `CROP_BUDGET` at every
 * width the field can render at. Drawings are never cropped.
 */

import { classifyAspectRatio, type Proportioned } from './preview';

/* -------------------------------------------------------------------------- */
/* Geometry — must agree with work-archive.css A-5a                             */
/* -------------------------------------------------------------------------- */

/** Row gap as a fraction of the row height. */
export const ROW_GAP = 0.22;
/** Column gap as a fraction of the row height (1.25 × the row gap). */
export const COLUMN_GAP = 0.275;
/** A physical cell is at most this many times wider than it is tall, and never narrower. */
export const MAX_STRETCH = 1.25;
/** The most a photograph's proportions may be changed by a crop (≈ 37% of one dimension). */
export const CROP_BUDGET = 1.6;
/** A board at or beyond this ratio runs the full width of the field. */
export const WIDE_BOARD = 1.75;

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export type FieldFamily = 'landscape' | 'portrait' | 'drawing';
export type FieldFit = 'cover' | 'contain';
export type SlotRef = 'cover' | 's1' | 's2' | 's3';

/** What the planner needs to know about one image: its EFFECTIVE proportions and its kind. */
export interface FieldMedia extends Proportioned {
  readonly drawing: boolean;
}

/** A rectangle on the logical grid, 1-based, ends exclusive — CSS `grid-column` / `grid-row`. */
export interface FieldBox {
  readonly columns: readonly [number, number];
  readonly rows: readonly [number, number];
}

export interface FieldSlot<T> {
  readonly ref: SlotRef;
  readonly item: T;
  readonly box: FieldBox;
  readonly fit: FieldFit;
}

export interface FieldTitle {
  readonly box: FieldBox;
  /** `band` lays title and data side by side; `cell` stacks them. */
  readonly shape: 'band' | 'cell';
  /** A band two rows tall or less sets its data in one line. */
  readonly low: boolean;
}

/** The linear (below 1024px) reading of the same media hierarchy. */
export interface MobileSlot {
  /** width / height of the frame. */
  readonly ratio: number;
  /** Spans both columns of the supporting strip. */
  readonly wide: boolean;
  readonly fit: FieldFit;
}

export interface FieldPlan<T> {
  readonly family: FieldFamily;
  /** e.g. `landscape-2`, `portrait-detail` — a QA handle published as `data-variant`. */
  readonly variant: string;
  /** Logical rows the field occupies. */
  readonly rows: number;
  readonly slots: readonly FieldSlot<T>[];
  readonly title: FieldTitle;
  readonly mobile: { readonly cover: MobileSlot; readonly supports: readonly MobileSlot[] };
}

/* -------------------------------------------------------------------------- */
/* Fitting                                                                     */
/* -------------------------------------------------------------------------- */

const box = (c1: number, c2: number, r1: number, r2: number): FieldBox => ({
  columns: [c1, c2],
  rows: [r1, r2],
});

/** A slot's width / height when each cell is `stretch` times wider than tall. */
export function slotRatio({ columns, rows }: FieldBox, stretch: number): number {
  const cols = columns[1] - columns[0];
  const rowCount = rows[1] - rows[0];
  return (cols * stretch + (cols - 1) * COLUMN_GAP) / (rowCount + (rowCount - 1) * ROW_GAP);
}

const ratioOf = (media: Proportioned): number => media.width / media.height;

const withinBudget = (media: Proportioned, frame: number): boolean => {
  if (media.width <= 0 || media.height <= 0) return false;
  const ratio = ratioOf(media);
  return Math.max(ratio / frame, frame / ratio) <= CROP_BUDGET;
};

/**
 * Drawings are always contained. A photograph is cropped only if the crop stays inside the budget
 * at BOTH ends of the stretch range — otherwise it is shown whole on the plate tone, the archive's
 * safe fallback, rather than cropped excessively at some widths.
 */
export function fieldFit(media: FieldMedia, slot: FieldBox): FieldFit {
  if (media.drawing) return 'contain';
  return withinBudget(media, slotRatio(slot, 1)) && withinBudget(media, slotRatio(slot, MAX_STRETCH))
    ? 'cover'
    : 'contain';
}

const isPortrait = (media: FieldMedia): boolean => classifyAspectRatio(media) === 'portrait';

/* -------------------------------------------------------------------------- */
/* Families                                                                    */
/* -------------------------------------------------------------------------- */

interface Draft<T> {
  readonly variant: string;
  readonly slots: readonly { readonly ref: SlotRef; readonly item: T; readonly box: FieldBox }[];
  readonly title: FieldBox;
}

type Measured<T> = { readonly item: T; readonly media: FieldMedia };

const supportRef = (index: number): SlotRef => (['s1', 's2', 's3'] as const)[index] ?? 's3';

/**
 * Landscape-led — and the geometry a standard landscape board shares. The dominant is 8 × 6; the
 * right column is two 4 × 3 cells, or one 4 × 6 portrait anchor; anything more, and the title
 * block, go to a lower band.
 */
function landscapeLed<T>(prefix: string, cover: Measured<T>, supports: readonly Measured<T>[]): Draft<T> {
  const coverSlot = { ref: 'cover' as const, item: cover.item, box: box(1, 9, 1, 7) };
  const anchor = supports.find((support) => isPortrait(support.media));

  if (anchor) {
    const rest = supports.filter((support) => support !== anchor).slice(0, 1);
    const slots = [coverSlot, { ref: 's1' as const, item: anchor.item, box: box(9, 13, 1, 7) }];
    if (rest[0]) {
      return {
        variant: `${prefix}-anchor`,
        slots: [...slots, { ref: 's2', item: rest[0].item, box: box(1, 5, 7, 10) }],
        title: box(5, 13, 7, 10),
      };
    }
    return { variant: `${prefix}-anchor`, slots, title: box(1, 13, 7, 9) };
  }

  const [first, second, third] = supports;
  if (!first) return { variant: `${prefix}-0`, slots: [coverSlot], title: box(9, 13, 1, 7) };
  if (!second) {
    return {
      variant: `${prefix}-1`,
      slots: [coverSlot, { ref: 's1', item: first.item, box: box(9, 13, 4, 7) }],
      title: box(9, 13, 1, 4),
    };
  }
  const column = [
    coverSlot,
    { ref: 's1' as const, item: first.item, box: box(9, 13, 1, 4) },
    { ref: 's2' as const, item: second.item, box: box(9, 13, 4, 7) },
  ];
  if (!third) return { variant: `${prefix}-2`, slots: column, title: box(1, 13, 7, 9) };
  return {
    variant: `${prefix}-3`,
    slots: [...column, { ref: 's3', item: third.item, box: box(1, 5, 7, 10) }],
    title: box(5, 13, 7, 10),
  };
}

/**
 * Portrait-led — the dominant is a genuinely vertical 5 × 8. A landscape or drawing support goes
 * beside it; a portrait-only set turns its support into a 4-column detail, flush right, so two
 * narrow portraits are never set side by side. The columns between detail and cover are the
 * family's authored negative space and are deliberately left open.
 */
function portraitLed<T>(prefix: string, cover: Measured<T>, supports: readonly Measured<T>[]): Draft<T> {
  const coverSlot = { ref: 'cover' as const, item: cover.item, box: box(1, 6, 1, 9) };
  const landscape = supports.filter((support) => !isPortrait(support.media));
  const portrait = supports.filter((support) => isPortrait(support.media));

  if (landscape[0]) {
    const beside = { ref: 's1' as const, item: landscape[0].item, box: box(6, 13, 1, 6) };
    const next = landscape[1] ?? portrait[0];
    if (next) {
      return {
        variant: `${prefix}-beside`,
        slots: [coverSlot, beside, { ref: 's2', item: next.item, box: box(6, 10, 6, 9) }],
        title: box(10, 13, 6, 9),
      };
    }
    return { variant: `${prefix}-beside`, slots: [coverSlot, beside], title: box(6, 13, 6, 9) };
  }
  if (portrait[0]) {
    return {
      variant: `${prefix}-detail`,
      slots: [coverSlot, { ref: 's1', item: portrait[0].item, box: box(9, 13, 4, 9) }],
      title: box(6, 13, 1, 4),
    };
  }
  return { variant: `${prefix}-0`, slots: [coverSlot], title: box(6, 13, 1, 4) };
}

/**
 * Drawing-led — the dominant span follows the board: a very wide board runs the full width with
 * at most two sheets in a lower band (a third would need two more rows, and the family's height
 * premium over Landscape/Portrait is held to one row), a portrait board takes the vertical
 * module, and a standard landscape board shares the Landscape-led slot map. Every board is
 * contained on white.
 */
function drawingLed<T>(cover: Measured<T>, supports: readonly Measured<T>[]): Draft<T> {
  const ratio = ratioOf(cover.media);
  if (ratio >= WIDE_BOARD) {
    const sheets = supports.slice(0, 2);
    const band = sheets.map((support, index) => ({
      ref: supportRef(index),
      item: support.item,
      box: box(1 + 4 * index, 5 + 4 * index, 7, 10),
    }));
    return {
      variant: `drawing-wide-${sheets.length}`,
      slots: [{ ref: 'cover', item: cover.item, box: box(1, 13, 1, 7) }, ...band],
      title: box(1 + 4 * sheets.length, 13, 7, 10),
    };
  }
  if (isPortrait(cover.media)) {
    const draft = portraitLed('drawing', cover, supports);
    return { ...draft, variant: draft.variant.replace('drawing-', 'drawing-sheet-') };
  }
  return landscapeLed('drawing', cover, supports);
}

/* -------------------------------------------------------------------------- */
/* Mobile — the same hierarchy, linear                                         */
/* -------------------------------------------------------------------------- */

/** A frame of a given ratio, filled only within the same budget the desktop field honours. */
const mobileSlot = (media: FieldMedia, frame: number, wide: boolean): MobileSlot => {
  if (media.drawing) return { ratio: ratioOf(media), wide, fit: 'contain' };
  return { ratio: frame, wide, fit: withinBudget(media, frame) ? 'cover' : 'contain' };
};

function mobilePlan(cover: FieldMedia, supports: readonly FieldMedia[]) {
  const coverRatio = isPortrait(cover) ? 4 / 5 : Math.min(Math.max(ratioOf(cover), 4 / 3), 3 / 2);
  const odd = supports.length % 2 === 1;
  return {
    cover: mobileSlot(cover, coverRatio, true),
    supports: supports.map((support, index) => {
      const wide = odd && index === 0;
      const frame = wide ? (isPortrait(support) ? 4 / 5 : 4 / 3) : 1;
      return mobileSlot(support, frame, wide);
    }),
  };
}

/* -------------------------------------------------------------------------- */
/* The planner                                                                 */
/* -------------------------------------------------------------------------- */

/** An image whose proportions cannot be read is planned as a 3:2 photograph. */
const FALLBACK_MEDIA: FieldMedia = { width: 3, height: 2, drawing: false };

/**
 * Plan one Project's field.
 *
 * `cover` is the Project's primary image; `supports` are its gallery images in authored order,
 * already without the cover's twin. At most three supports are used. `measure` reads an item's
 * effective proportions and kind — the planner knows nothing else about it.
 */
export function planField<T>(
  cover: T,
  supports: readonly T[],
  measure: (item: T) => FieldMedia | null,
): FieldPlan<T> {
  const measured = (item: T): Measured<T> => {
    const media = measure(item);
    return { item, media: media && media.width > 0 && media.height > 0 ? media : FALLBACK_MEDIA };
  };
  const head = measured(cover);
  const rest = supports.slice(0, 3).map(measured);

  const family: FieldFamily = head.media.drawing
    ? 'drawing'
    : isPortrait(head.media)
      ? 'portrait'
      : 'landscape';
  const draft =
    family === 'drawing'
      ? drawingLed(head, rest)
      : family === 'portrait'
        ? portraitLed('portrait', head, rest)
        : landscapeLed('landscape', head, rest);

  const mediaOf = new Map<T, FieldMedia>([[head.item, head.media], ...rest.map((m) => [m.item, m.media] as const)]);
  const slots = draft.slots.map((slot) => ({
    ...slot,
    fit: fieldFit(mediaOf.get(slot.item) ?? FALLBACK_MEDIA, slot.box),
  }));

  const titleColumns = draft.title.columns[1] - draft.title.columns[0];
  const titleRows = draft.title.rows[1] - draft.title.rows[0];
  const shape = titleColumns >= 2 * titleRows ? 'band' : 'cell';
  const rows = Math.max(draft.title.rows[1], ...slots.map((slot) => slot.box.rows[1])) - 1;

  return {
    family,
    variant: draft.variant,
    rows,
    slots,
    title: { box: draft.title, shape, low: shape === 'band' && titleRows <= 2 },
    mobile: mobilePlan(
      head.media,
      draft.slots.filter((slot) => slot.ref !== 'cover').map((slot) => mediaOf.get(slot.item) ?? FALLBACK_MEDIA),
    ),
  };
}

/** The same box for a mirrored (`data-row="b"`) field: columns reflected, rows unchanged. */
export function mirrorBox({ columns, rows }: FieldBox): FieldBox {
  return { columns: [14 - columns[1], 14 - columns[0]], rows };
}
