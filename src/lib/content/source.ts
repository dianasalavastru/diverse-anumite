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
 * That swap has happened. `build-source.ts` resolves `createSanityContentSource` from the build
 * environment and is what every page calls; `createFixtureContentSource` now serves the test
 * suites only. The claim above is therefore a measured result rather than a design intention —
 * the six composition sites changed one import and one call each, and nothing else moved.
 *
 * **Every method is locale-scoped.** §7.1: "Aggregate surfaces are locale-scoped. Archive, Hubs,
 * homepage curation, and Service 'demonstrated by' render only entities published in the active
 * locale. Discovery order and balanced pillar representation must remain valid when the EN set
 * is a proper subset of RO." Scoping therefore happens here, before ordering — never in a
 * component, and never after.
 */

import { createContentClient, type ContentClient } from './client.js';
import { isCompetition, isEnAvailable, type EnGated } from './derive.js';
import {
  QUERY_ALL_SERVICES,
  QUERY_ALL_SERVICE_SUMMARIES,
  QUERY_ALL_WORK_ENTRIES,
  QUERY_SERVICE_BY_SLUG,
  QUERY_WORK_ARCHIVE,
  QUERY_WORK_ENTRY_BY_SLUG,
  type RawService,
  type RawServiceSummary,
  type RawWorkArchiveItem,
  type RawWorkEntry,
} from './groq.js';
import {
  normalizeService,
  normalizeServiceSummary,
  normalizeWorkArchiveItem,
  normalizeWorkEntry,
} from './normalize.js';
import { compareCurated, discoveryOrder, type PillarScope } from './order.js';
import type { SanityConfig } from './config.js';
import type {
  HighlightSlot,
  Locale,
  Pillar,
  Service,
  ServiceSummary,
  WorkArchiveItem,
  WorkEntry,
} from './types.js';

/**
 * The curated routes IA §2.2 commits to as real, indexable URLs.
 *
 * STAGE 2: `'professionalExperience'` is gone. That view is **permanently retired**
 * (`CONTENT_MODEL.md` v3.1 §13, `DECISIONS_LOG.md` #97) — it was defined as *Attribution =
 * Studio grouped by Employer* and both of those are being retired. **No replacement membership
 * rule exists or is to be designed**; About / Despre is the surviving home for
 * professional-background content. Its two localized slugs stay reserved (`i18n/routes.ts`) so
 * no Work Entry can claim a historical URL, but there is no route and no view.
 */
export type CuratedView = 'competitions';

export interface ContentSource {
  /** Full Work Entries available in `locale`. Used for static path generation. */
  workEntries(locale: Locale): Promise<readonly WorkEntry[]>;
  /** `null` when the slug does not exist *in that locale* — §11.2's clean 404, never a redirect. */
  workEntry(slug: string, locale: Locale): Promise<WorkEntry | null>;
  /** The archive set, in discovery order (§7.6), carrying the §23.5 filter facets. */
  workArchive(locale: Locale, scope?: PillarScope): Promise<readonly WorkArchiveItem[]>;
  curatedView(view: 'competitions', locale: Locale): Promise<readonly WorkArchiveItem[]>;
  services(locale: Locale): Promise<readonly Service[]>;
  service(slug: string, locale: Locale): Promise<Service | null>;
  serviceSummaries(locale: Locale, pillar?: Pillar): Promise<readonly ServiceSummary[]>;
  /** Curated placements for the homepage (M-4) and pillar hubs (H-4), in discovery order. */
  highlights(slot: HighlightSlot, pillar: Pillar | null, locale: Locale): Promise<readonly WorkArchiveItem[]>;
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

/*
 * The Label predicates — `hasLabel` and `isCompetition` — live in `derive.ts`, not here.
 *
 * `components/work-entry/modules.ts` needs the same "is this a competition" answer for the W-4
 * toggle, and it is browser-reachable: it may only import the boundary barrel (§8, B4), which
 * cannot reach this file. Putting the predicate in `derive.ts` gives both halves ONE rule
 * instead of two implementations that could disagree — which is exactly the drift the curated
 * view / archive filter split caused before I-3. They are re-exported through `server.ts` so
 * the build-time surface still reads as one piece.
 */

/*
 * STAGE 2 — `isProfessionalExperience()` and `groupByEmployer()` are deleted.
 *
 * They implemented one retired view and nothing else: membership was `attribution === 'studio'`
 * and grouping was by the Employer reference. Both inputs are gone or going, and the view is
 * permanently retired (`DECISIONS_LOG.md` #97), so there is no successor to keep them for.
 * `compareCurated` — the only general-purpose thing they used — is untouched in `order.ts`.
 */

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
  };
}

/** The production entry point. `config` comes from `resolveSanityConfig(process.env)` at build. */
export function createSanityContentSource(config: SanityConfig): ContentSource {
  return createContentSource(createSanityDocuments(createContentClient(config)));
}
