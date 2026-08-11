/**
 * `ContentSource` — the I-3 contract.
 *
 * OWNER: Workstream B. `TECHNICAL_ARCHITECTURE.md` §8, §23.4.
 *
 * This interface *is* the swap point §23.4 describes: "Query layer returns real data in the
 * frozen shape; A swaps fixtures for it." Workstream A codes against `ContentSource` and never
 * against a concrete implementation, so the swap is one factory call in one file —
 * `createFixtureContentSource()` → `createSanityContentSource()` — with no component change.
 * It is also the seam R8 prices: a Payload implementation of this interface would leave every
 * page untouched.
 *
 * **Every method is locale-scoped.** §7.1: "Aggregate surfaces are locale-scoped. Archive, Hubs,
 * homepage curation, and Service 'demonstrated by' render only entities published in the active
 * locale. Discovery order and balanced pillar representation must remain valid when the EN set
 * is a proper subset of RO." Scoping therefore happens here, before ordering — never in a
 * component, and never after.
 */

import { createContentClient, type ContentClient } from './client.js';
import { isEnAvailable, type EnGated } from './derive.js';
import {
  QUERY_ALL_EMPLOYERS,
  QUERY_ALL_SERVICES,
  QUERY_ALL_SERVICE_SUMMARIES,
  QUERY_ALL_WORK_ENTRIES,
  QUERY_SERVICE_BY_SLUG,
  QUERY_WORK_ARCHIVE,
  QUERY_WORK_ENTRY_BY_SLUG,
  type RawEmployer,
  type RawService,
  type RawServiceSummary,
  type RawWorkArchiveItem,
  type RawWorkEntry,
} from './groq.js';
import {
  normalizeEmployer,
  normalizeService,
  normalizeServiceSummary,
  normalizeWorkArchiveItem,
  normalizeWorkEntry,
} from './normalize.js';
import { compareCurated, discoveryOrder, type PillarScope } from './order.js';
import type { SanityConfig } from './config.js';
import type {
  Employer,
  HighlightSlot,
  Locale,
  Pillar,
  Service,
  ServiceSummary,
  WorkArchiveItem,
  WorkEntry,
  WorkEntrySummary,
} from './types.js';

/** The two curated routes IA §2.2 commits to as real, indexable URLs. */
export type CuratedView = 'competitions' | 'professionalExperience';

/** IA §5.1: Professional Experience is grouped by Employer — grouping metadata, not its own page. */
export interface EmployerGroup {
  readonly employer: Employer;
  readonly entries: readonly WorkArchiveItem[];
}

export interface ContentSource {
  /** Full Work Entries available in `locale`. Used for static path generation. */
  workEntries(locale: Locale): Promise<readonly WorkEntry[]>;
  /** `null` when the slug does not exist *in that locale* — §11.2's clean 404, never a redirect. */
  workEntry(slug: string, locale: Locale): Promise<WorkEntry | null>;
  /** The archive set, in discovery order (§7.6), carrying the §23.5 filter facets. */
  workArchive(locale: Locale, scope?: PillarScope): Promise<readonly WorkArchiveItem[]>;
  curatedView(view: 'competitions', locale: Locale): Promise<readonly WorkArchiveItem[]>;
  professionalExperience(locale: Locale): Promise<readonly EmployerGroup[]>;
  services(locale: Locale): Promise<readonly Service[]>;
  service(slug: string, locale: Locale): Promise<Service | null>;
  serviceSummaries(locale: Locale, pillar?: Pillar): Promise<readonly ServiceSummary[]>;
  /** Curated placements for the homepage (M-4) and pillar hubs (H-4), in discovery order. */
  highlights(slot: HighlightSlot, pillar: Pillar | null, locale: Locale): Promise<readonly WorkArchiveItem[]>;
  employers(): Promise<readonly Employer[]>;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Locale scoping — §7.1, §11.2
 * ──────────────────────────────────────────────────────────────────────────── */

/** RO is the root locale and is never gated; EN requires the §7.1 gate *and* a usable slug. */
export function availableIn<T extends EnGated>(items: readonly T[], locale: Locale): readonly T[] {
  if (locale === 'ro') return items;
  return items.filter(isEnAvailable);
}

/**
 * Scope a full Work Entry's nested collections to the active locale.
 *
 * Without this, an EN Work Entry could link to an untranslated Service or related entry, and
 * the link would resolve to a page §11.2 guarantees does not exist. Rule 5 of §7.6 depends on
 * it too: balancing must operate over the EN-published set only.
 */
function scopeWorkEntry(entry: WorkEntry, locale: Locale): WorkEntry {
  return {
    ...entry,
    services: availableIn(entry.services, locale),
    relatedWork: availableIn(entry.relatedWork, locale),
  };
}

function scopeService(service: Service, locale: Locale): Service {
  return {
    ...service,
    // F5 stays intact: scoping may empty this set, and an empty set is a valid published state.
    demonstratedBy: [...availableIn(service.demonstratedBy, locale)].sort(compareCurated),
  };
}

/* ────────────────────────────────────────────────────────────────────────────
 * Curated views — IA §2.2, §5.1
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * IA §5: a curated view's membership is a **taxonomy filter**; selection and order come from the
 * curation layer. Competitions is Entry Type — primary or secondary, because
 * `CONTENT_MODEL.md`:47 allows a secondary Entry Type and an entry that is secondarily a
 * competition still belongs in the view.
 */
export function isCompetition(item: WorkArchiveItem): boolean {
  return (
    item.entryType.primary === 'competition-entry' ||
    item.entryType.secondary.includes('competition-entry')
  );
}

/** IA §5.1: "Scope: Studio-attributed entries only." */
export function isProfessionalExperience(item: WorkArchiveItem): boolean {
  return item.attribution === 'studio';
}

/**
 * IA §5.1: "employers by recency, entries by editorial priority." Recency of an employer is the
 * most recent year among its entries — the only definition the corpus supports, since Employer
 * is a reference list with no dates of its own.
 */
export function groupByEmployer(items: readonly WorkArchiveItem[]): readonly EmployerGroup[] {
  const groups = new Map<string, { employer: Employer; entries: WorkArchiveItem[] }>();

  for (const item of items) {
    if (!item.employer) continue;
    const group = groups.get(item.employer._id);
    if (group) group.entries.push(item);
    else groups.set(item.employer._id, { employer: item.employer, entries: [item] });
  }

  return [...groups.values()]
    .map((group) => ({ employer: group.employer, entries: group.entries.sort(compareCurated) }))
    .sort((a, b) => {
      const recency = (group: EmployerGroup) => Math.max(...group.entries.map((entry) => entry.year));
      const difference = recency(b) - recency(a);
      return difference !== 0 ? difference : a.employer.name.localeCompare(b.employer.name);
    });
}

/** `CONTENT_MODEL.md`:77 — placements are pillar-aware; a `null` pillar is a neutral placement. */
export function hasPlacement(item: WorkArchiveItem, slot: HighlightSlot, pillar: Pillar | null): boolean {
  return item.curation.placements.some(
    (placement) => placement.slot === slot && (pillar === null || placement.pillar === pillar || placement.pillar === null),
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * The shared implementation
 *
 * Both the Sanity source and the fixture source are built from these functions over a raw
 * document set. That is the I-3 mitigation made structural: fixtures cannot describe a shape,
 * an ordering, or a locale scope that the real query layer does not produce, because they run
 * the identical code path (§23.4).
 * ──────────────────────────────────────────────────────────────────────────── */

export interface RawDocuments {
  workEntries(): Promise<readonly RawWorkEntry[]>;
  workEntryBySlug(slug: string, locale: Locale): Promise<RawWorkEntry | null>;
  workArchive(): Promise<readonly RawWorkArchiveItem[]>;
  services(): Promise<readonly RawService[]>;
  serviceBySlug(slug: string, locale: Locale): Promise<RawService | null>;
  serviceSummaries(): Promise<readonly RawServiceSummary[]>;
  employers(): Promise<readonly RawEmployer[]>;
}

export function createContentSource(documents: RawDocuments): ContentSource {
  async function archiveItems(locale: Locale): Promise<readonly WorkArchiveItem[]> {
    const raw = await documents.workArchive();
    return availableIn(raw.map(normalizeWorkArchiveItem), locale);
  }

  return {
    async workEntries(locale) {
      const raw = await documents.workEntries();
      const entries = raw.map(normalizeWorkEntry).map((entry) => scopeWorkEntry(entry, locale));
      return availableIn(entries, locale);
    },

    async workEntry(slug, locale) {
      const raw = await documents.workEntryBySlug(slug, locale);
      if (!raw) return null;
      const entry = normalizeWorkEntry(raw);
      // §11.2 rule 7: `/en/<untranslated>` is a clean 404. Returning the RO document here would
      // make the route render, which is exactly what rule 2 forbids.
      if (!availableIn([entry], locale).length) return null;
      return scopeWorkEntry(entry, locale);
    },

    async workArchive(locale, scope = 'all') {
      return discoveryOrder(await archiveItems(locale), scope);
    },

    async curatedView(_view, locale) {
      return discoveryOrder((await archiveItems(locale)).filter(isCompetition));
    },

    async professionalExperience(locale) {
      return groupByEmployer((await archiveItems(locale)).filter(isProfessionalExperience));
    },

    async services(locale) {
      const raw = await documents.services();
      const services = raw.map(normalizeService).map((service) => scopeService(service, locale));
      return availableIn(services, locale);
    },

    async service(slug, locale) {
      const raw = await documents.serviceBySlug(slug, locale);
      if (!raw) return null;
      const service = normalizeService(raw);
      if (!availableIn([service], locale).length) return null;
      return scopeService(service, locale);
    },

    async serviceSummaries(locale, pillar) {
      const raw = await documents.serviceSummaries();
      const summaries = availableIn(raw.map(normalizeServiceSummary), locale);
      const scoped = pillar ? summaries.filter((service) => service.pillar === pillar) : summaries;
      return [...scoped].sort(compareCurated0);
    },

    async highlights(slot, pillar, locale) {
      const items = (await archiveItems(locale)).filter((item) => hasPlacement(item, slot, pillar));
      return discoveryOrder(items, pillar ?? 'all');
    },

    async employers() {
      const raw = await documents.employers();
      return raw
        .map(normalizeEmployer)
        .filter((employer): employer is Employer => employer !== null)
        .sort((a, b) => a.name.localeCompare(b.name));
    },
  };
}

/**
 * Services carry curation but no Year (`CONTENT_MODEL.md` §4 attaches curation to both objects;
 * §3's Metadata axis belongs to the Work Entry). `compareCurated` needs a year, so Service
 * ordering uses the same precedence minus that tie-break.
 */
function compareCurated0(a: ServiceSummary, b: ServiceSummary): number {
  if (a.curation.pinned !== b.curation.pinned) return a.curation.pinned ? -1 : 1;
  if (a.curation.editorialPriority !== b.curation.editorialPriority) {
    return b.curation.editorialPriority - a.curation.editorialPriority;
  }
  return a._id < b._id ? -1 : a._id > b._id ? 1 : 0;
}

/* ────────────────────────────────────────────────────────────────────────────
 * The Sanity-backed source
 * ──────────────────────────────────────────────────────────────────────────── */

export function createSanityDocuments(client: ContentClient): RawDocuments {
  return {
    workEntries: () => client.fetch<readonly RawWorkEntry[]>(QUERY_ALL_WORK_ENTRIES),
    workEntryBySlug: (slug, locale) =>
      client.fetch<RawWorkEntry | null>(QUERY_WORK_ENTRY_BY_SLUG[locale], { slug }),
    workArchive: () => client.fetch<readonly RawWorkArchiveItem[]>(QUERY_WORK_ARCHIVE),
    services: () => client.fetch<readonly RawService[]>(QUERY_ALL_SERVICES),
    serviceBySlug: (slug, locale) =>
      client.fetch<RawService | null>(QUERY_SERVICE_BY_SLUG[locale], { slug }),
    serviceSummaries: () => client.fetch<readonly RawServiceSummary[]>(QUERY_ALL_SERVICE_SUMMARIES),
    employers: () => client.fetch<readonly RawEmployer[]>(QUERY_ALL_EMPLOYERS),
  };
}

/** The production entry point. `config` comes from `resolveSanityConfig(process.env)` at build. */
export function createSanityContentSource(config: SanityConfig): ContentSource {
  return createContentSource(createSanityDocuments(createContentClient(config)));
}
