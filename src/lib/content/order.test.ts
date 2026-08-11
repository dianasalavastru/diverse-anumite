/**
 * Discovery-order tests — `TECHNICAL_ARCHITECTURE.md` §7.6, §16 (Vitest unit layer).
 *
 * OWNER: Workstream B. Each test names the numbered rule it holds.
 */

import { describe, expect, it } from 'vitest';

import {
  compareYearAscending,
  compareYearDescending,
  discoveryOrder,
  inPillarScope,
  sortArchive,
  type Orderable,
} from './order.js';
import type { Curation, Pillar } from './types.js';

const curation = (overrides: Partial<Curation> = {}): Curation => ({
  featured: false,
  pinned: false,
  editorialPriority: 0,
  placements: [],
  prominence: 'standard',
  ...overrides,
});

interface ItemSpec {
  readonly id: string;
  readonly primary: Pillar;
  readonly secondary?: readonly Pillar[];
  readonly priority?: number;
  readonly year?: number;
  readonly pinned?: boolean;
}

const item = ({ id, primary, secondary = [], priority = 0, year = 2020, pinned = false }: ItemSpec): Orderable => ({
  _id: id,
  pillars: { primary, secondary },
  curation: curation({ editorialPriority: priority, pinned }),
  year,
});

const ids = (items: readonly Orderable[]) => items.map((entry) => entry._id);

const AD: Pillar = 'architecture-design';
const RC: Pillar = 'reality-capture';

describe('Rule 1 — Editorial Priority descending within a pillar', () => {
  it('orders a single-pillar scope by priority', () => {
    const items = [
      item({ id: 'a', primary: AD, priority: 1 }),
      item({ id: 'b', primary: AD, priority: 9 }),
      item({ id: 'c', primary: AD, priority: 5 }),
    ];
    expect(ids(discoveryOrder(items, AD))).toEqual(['b', 'c', 'a']);
  });
});

describe('Rule 2 — interleave pillars when scope = All', () => {
  it('alternates between the two pillar queues', () => {
    const items = [
      item({ id: 'ad1', primary: AD, priority: 10 }),
      item({ id: 'ad2', primary: AD, priority: 8 }),
      item({ id: 'ad3', primary: AD, priority: 6 }),
      item({ id: 'rc1', primary: RC, priority: 9 }),
      item({ id: 'rc2', primary: RC, priority: 7 }),
    ];
    expect(ids(discoveryOrder(items, 'all'))).toEqual(['ad1', 'rc1', 'ad2', 'rc2', 'ad3']);
  });

  it('does not encode structural primacy — the higher-ranked pillar head leads', () => {
    // IA §3.2 forbids structural primacy of either pillar. Swapping which pillar holds the top
    // entry must swap which pillar leads.
    const rcLeads = [
      item({ id: 'ad1', primary: AD, priority: 5 }),
      item({ id: 'rc1', primary: RC, priority: 10 }),
    ];
    expect(ids(discoveryOrder(rcLeads, 'all'))).toEqual(['rc1', 'ad1']);

    const adLeads = [
      item({ id: 'ad1', primary: AD, priority: 10 }),
      item({ id: 'rc1', primary: RC, priority: 5 }),
    ];
    expect(ids(discoveryOrder(adLeads, 'all'))).toEqual(['ad1', 'rc1']);
  });

  it('appends the remainder when one pillar queue empties — nothing is truncated', () => {
    const items = [
      item({ id: 'ad1', primary: AD, priority: 10 }),
      item({ id: 'ad2', primary: AD, priority: 9 }),
      item({ id: 'ad3', primary: AD, priority: 8 }),
      item({ id: 'rc1', primary: RC, priority: 7 }),
    ];
    const ordered = discoveryOrder(items, 'all');
    expect(ordered).toHaveLength(4);
    expect(ids(ordered)).toEqual(['ad1', 'rc1', 'ad2', 'ad3']);
  });

  it('queues a cross-pillar entry once, by its primary pillar', () => {
    const items = [
      item({ id: 'cross', primary: RC, secondary: [AD], priority: 10 }),
      item({ id: 'ad1', primary: AD, priority: 9 }),
    ];
    const ordered = discoveryOrder(items, 'all');
    expect(ordered).toHaveLength(2);
    expect(ids(ordered)).toEqual(['cross', 'ad1']);
  });
});

describe('Rule 3 — ties break by Year descending', () => {
  it('prefers the newer entry at equal priority', () => {
    const items = [
      item({ id: 'old', primary: AD, priority: 5, year: 2019 }),
      item({ id: 'new', primary: AD, priority: 5, year: 2025 }),
    ];
    expect(ids(discoveryOrder(items, AD))).toEqual(['new', 'old']);
  });

  it('is deterministic when priority and year are identical', () => {
    const items = [
      item({ id: 'zzz', primary: AD, priority: 5, year: 2020 }),
      item({ id: 'aaa', primary: AD, priority: 5, year: 2020 }),
    ];
    // A reproducible build must not depend on the order the Content Lake happened to return.
    expect(ids(discoveryOrder(items, AD))).toEqual(['aaa', 'zzz']);
    expect(ids(discoveryOrder([...items].reverse(), AD))).toEqual(['aaa', 'zzz']);
  });
});

describe('Rule 4 — balancing is inert under a pillar filter', () => {
  it('excludes the other pillar entirely and applies plain curated order', () => {
    const items = [
      item({ id: 'ad1', primary: AD, priority: 1 }),
      item({ id: 'rc1', primary: RC, priority: 10 }),
      item({ id: 'ad2', primary: AD, priority: 5 }),
    ];
    expect(ids(discoveryOrder(items, AD))).toEqual(['ad2', 'ad1']);
  });

  it('includes a cross-pillar entry in both pillar scopes (CONTENT_MODEL.md:63)', () => {
    const cross = item({ id: 'cross', primary: RC, secondary: [AD] });
    expect(inPillarScope(cross, RC)).toBe(true);
    expect(inPillarScope(cross, AD)).toBe(true);
    expect(inPillarScope(cross, 'all')).toBe(true);
  });
});

describe('Curation layer — pinned holds at top (§7.5, CONTENT_MODEL.md:79)', () => {
  it('outranks a higher Editorial Priority', () => {
    const items = [
      item({ id: 'loud', primary: AD, priority: 100 }),
      item({ id: 'pinned', primary: AD, priority: 1, pinned: true }),
    ];
    expect(ids(discoveryOrder(items, AD))).toEqual(['pinned', 'loud']);
  });
});

describe('Archive sorts (§23.5)', () => {
  const items = [
    item({ id: 'a', primary: AD, priority: 1, year: 2024 }),
    item({ id: 'b', primary: AD, priority: 9, year: 2019 }),
  ];

  it('curated is the discovery order', () => {
    expect(ids(sortArchive(items, 'curated', AD))).toEqual(['b', 'a']);
  });

  it('newest ignores curation', () => {
    expect(ids(sortArchive(items, 'newest', AD))).toEqual(['a', 'b']);
  });

  it('oldest reverses it', () => {
    expect(ids(sortArchive(items, 'oldest', AD))).toEqual(['b', 'a']);
  });

  it('year comparators are deterministic within a year', () => {
    const same = [item({ id: 'y', primary: AD, year: 2020 }), item({ id: 'x', primary: AD, year: 2020 })];
    expect(ids([...same].sort(compareYearDescending))).toEqual(['x', 'y']);
    expect(ids([...same].sort(compareYearAscending))).toEqual(['x', 'y']);
  });
});
