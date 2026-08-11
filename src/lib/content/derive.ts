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
  DISCIPLINE_TO_PILLAR,
  type DisciplineAssignment,
  type Localized,
  type Locale,
  type Pillar,
  type PillarAssignment,
  type Service,
  type ServiceSummary,
  type WorkEntry,
  type WorkEntrySummary,
} from './types.js';

/**
 * Pillar derivation (§7.4). **Primary Pillar = the pillar of the primary Discipline** — it
 * determines the default contextual back-path and archive scoping (IA §2.3, M2). Secondary
 * pillars come from secondary Disciplines, deduplicated and excluding the primary; an entry
 * may resolve into both pillars with one primary (`CONTENT_MODEL.md`:63).
 *
 * Pillar is never an editable field. OD-7 (composite-entry override) is open and additive.
 */
export function derivePillars(discipline: DisciplineAssignment): PillarAssignment {
  const primary = DISCIPLINE_TO_PILLAR[discipline.primary];
  const secondary: Pillar[] = [];

  for (const value of discipline.secondary) {
    const pillar = DISCIPLINE_TO_PILLAR[value];
    if (pillar !== primary && !secondary.includes(pillar)) secondary.push(pillar);
  }

  return { primary, secondary };
}

/** A cross-pillar / composite entry surfaces in both pillar views (`CONTENT_MODEL.md`:63). */
export function isCrossPillar(pillars: PillarAssignment): boolean {
  return pillars.secondary.length > 0;
}

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
    pillars: entry.pillars,
    entryType: entry.entryType,
    sectors: entry.sectors,
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
    name: service.name,
    slug: service.slug,
    enPublished: service.enPublished,
    pillar: service.pillar,
    shortDescription: service.shortDescription,
    hero: service.hero,
    curation: service.curation,
  };
}
