/**
 * Build-time derivations over the content contract.
 *
 * OWNER: Workstream B. Consumed by the query layer and by A's components; A never edits it.
 *
 * Only derivations frozen upstream live here. Pillar derivation is
 * `TECHNICAL_ARCHITECTURE.md` §7.4 (Phase-0 frozen contract 5) and is "derived at build,
 * never stored" (§8). Discovery order (§7.6) is deliberately **not** implemented yet — it
 * belongs to the archive query in Phase 5 and is not needed for the I-1 type boundary.
 */

import {
  type Localized,
  type Locale,
  type ProjectLabel,
  type Service,
  type ServiceSummary,
  type WorkEntry,
  type WorkEntrySummary,
} from './types.js';

/*
 * STAGE 5 — `derivePillars()` and `isCrossPillar()` are deleted.
 *
 * Pillar is **authored** now (v3.1 §2): one stored value per project, chosen by the editor. The
 * derivation table it read is gone, and so is the idea it existed to express — a project
 * resolving into two pillars at once. Work genuinely spanning both is **two linked projects**,
 * related through `WorkEntry.relatedWork`.
 *
 * There is deliberately **no fallback**: nothing here quietly re-derives a pillar from a legacy
 * `discipline` field. A document without an authored `pillar` fails the build loudly at
 * `normalize.ts`, which is what surfaces the un-migrated dataset instead of hiding it.
 */

/**
 * Read one locale off a localized field. Returns `null` when the EN counterpart is
 * untranslated — RO content is never substituted under an EN URL (§11.2).
 */
export function localize<T>(value: Localized<T> | null | undefined, locale: Locale): T | null {
  if (!value) return null;
  return locale === 'ro' ? value.ro : value.en;
}

/**
 * The minimum an entity needs for the EN gate to be decidable. Satisfied by `WorkEntry`,
 * `Service`, `WorkEntrySummary`, `ServiceSummary` and `WorkArchiveItem` alike.
 *
 * WIDENED AT I-3 (structural, not a redefinition). `isEnAvailable` previously named the four
 * concrete types; the query layer's locale scoping (`source.ts`) needs the same rule over the
 * archive projection too, and restating `enPublished && slug.en !== null` in a second place is
 * precisely the drift §7.1 exists to prevent. Every prior call site still type-checks.
 */
export interface EnGated {
  readonly enPublished: boolean;
  readonly slug: { readonly en: string | null };
}

/**
 * Whether an entity may generate an EN page: it must be EN-published *and* carry the
 * localized identity fields the route needs (§11.1, §11.2).
 */
export function isEnAvailable(entity: EnGated): boolean {
  return entity.enPublished && entity.slug.en !== null;
}

/** Projection used by every signposting surface (archive results, related strip, hub, service proof). */
export function toWorkEntrySummary(entry: WorkEntry): WorkEntrySummary {
  return {
    _id: entry._id,
    title: entry.title,
    slug: entry.slug,
    enPublished: entry.enPublished,
    pillar: entry.pillar,
    labels: entry.labels,
    sector: entry.sector,
    year: entry.metadata.year,
    status: entry.metadata.status,
    cover: entry.cover,
    curation: entry.curation,
  };
}

/** Recognition-level projection for the hub services overview (H-3), W-5, and the Services index. */
export function toServiceSummary(service: Service): ServiceSummary {
  return {
    _id: service._id,
    key: service.key,
    name: service.name,
    slug: service.slug,
    enPublished: service.enPublished,
    pillar: service.pillar,
    shortDescription: service.shortDescription,
    hero: service.hero,
    curation: service.curation,
  };
}

/* ────────────────────────────────────────────────────────────────────────────
 * Project Labels — CONTENT_MODEL.md v3.1 §10 (ADDED AT MIGRATION STAGE 4)
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * The minimum an object needs for a Label test. Satisfied by `WorkEntry`, `WorkEntrySummary`
 * and `WorkArchiveItem` alike, so the archive, the curated view and the Work Entry page share
 * one predicate instead of each shape growing its own.
 */
export interface LabelledItem {
  readonly labels: readonly ProjectLabel[];
}

/**
 * Does this project carry a given Label? — **the one canonical membership test**.
 *
 * Membership is `includes`, never equality against the whole array: Labels are 0..N and not
 * mutually exclusive (v3.1 §10), so a project carrying both `competition` and `diploma-project`
 * matches both tests, contributes exactly one row to either filtered set, and is unaffected by
 * the order the editor ticked them in.
 *
 * It lives in this file rather than in `source.ts` because both halves of the §8 boundary need
 * it: the curated view and the archive read it from the build-time side, and W-4's module
 * toggle reads it from a browser-reachable component. One rule, two callers, no drift.
 */
export function hasLabel(item: LabelledItem, label: ProjectLabel): boolean {
  return item.labels.includes(label);
}

/**
 * IA §5: a curated view's membership is a **taxonomy filter**; selection and order come from
 * the curation layer.
 *
 * STAGE 4: Competitions membership moved from `entryType` (primary or secondary) to the
 * `competition` Label. Entry Type is retired outright (v3.1 §12); `competition-entry` is the
 * single piece of its semantics that survives, now an optional flag rather than a mandatory
 * axis value. The view, its routes, its ordering and its page are unchanged — only what decides
 * membership moved.
 */
export function isCompetition(item: LabelledItem): boolean {
  return hasLabel(item, 'competition');
}
