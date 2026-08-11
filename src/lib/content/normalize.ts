/**
 * Raw GROQ result → the frozen content contract.
 *
 * OWNER: Workstream B. `TECHNICAL_ARCHITECTURE.md` §7.1, §7.4, §8, §19.4.
 *
 * This is the second half of the I-3 mitigation (§23.4). `groq.ts` declares one query shape;
 * this module is the one place that shape becomes `types.ts`. Fixtures run through these exact
 * functions (`fixtures.ts`), so a fixture cannot describe a shape the query does not produce.
 *
 * Three contracts are *enforced* here rather than merely assumed:
 *
 *   1. **No draft may reach output** (§8, R2). Every document id is asserted. This is the third
 *      independent defence, after `perspective: 'published'` and the GROQ filter.
 *   2. **Pillar is derived, never read** (§7.4). `derivePillars()` is called on the Discipline
 *      assignment; no raw pillar field is consulted even if one existed.
 *   3. **Capture publication is gated** (§19.4). A point-cloud derivative is dropped unless
 *      `capturePublicationCleared` is true — in the query layer, not only in the CMS, because a
 *      publication gate that lives solely in the editing tool is a convention, not a control.
 *
 * Controlled vocabularies are validated on the way through (§7.2). The Studio blocks bad values
 * at authoring time; a value that reaches here anyway (imported content, a migration, a hand
 * mutation) fails the build rather than silently entering a filter set as an unknown token.
 */

import { derivePillars } from './derive.js';
import type {
  RawCaptureMetadata,
  RawCuration,
  RawEmployer,
  RawImage,
  RawLocalized,
  RawService,
  RawServiceSummary,
  RawSeo,
  RawWorkArchiveItem,
  RawWorkEntry,
  RawWorkEntryMetadata,
  RawWorkEntrySummary,
} from './groq.js';
import {
  ATTRIBUTIONS,
  COMMISSIONING_CONTEXTS,
  DISCIPLINES,
  ENTRY_TYPES,
  HIGHLIGHT_SLOTS,
  PILLARS,
  PROMINENCES,
  STATUSES,
  type Attribution,
  type CaptureMetadata,
  type CommissioningContext,
  type Curation,
  type Discipline,
  type DisciplineAssignment,
  type Employer,
  type EntryType,
  type EntryTypeAssignment,
  type HighlightPlacement,
  type ImageAsset,
  type Localized,
  type Pillar,
  type PortableTextBlock,
  type Prominence,
  type Sector,
  type Service,
  type ServiceRef,
  type ServiceSummary,
  type Seo,
  type Status,
  type WorkArchiveItem,
  type WorkEntry,
  type WorkEntryMetadata,
  type WorkEntrySummary,
} from './types.js';

export class ContentShapeError extends Error {
  override readonly name = 'ContentShapeError';
}

/* ────────────────────────────────────────────────────────────────────────────
 * Guards
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * §8: "no document ID containing `drafts.` may appear in build output. A draft leak fails the
 * build." Asserted per document as it is normalized, so the failure names the offender.
 */
export function assertNotDraft(id: string): string {
  if (id.startsWith('drafts.') || id.includes('drafts.')) {
    throw new ContentShapeError(
      `Draft document '${id}' reached build output. Production reads must be published-only (TECHNICAL_ARCHITECTURE.md §8, R2).`,
    );
  }
  return id;
}

function requireId(raw: { _id?: string | null }, kind: string): string {
  if (!raw._id) throw new ContentShapeError(`${kind} is missing '_id'.`);
  return assertNotDraft(raw._id);
}

function oneOf<T extends string>(
  value: string | null | undefined,
  allowed: readonly T[],
  field: string,
  docId: string,
): T {
  if (value && (allowed as readonly string[]).includes(value)) return value as T;
  throw new ContentShapeError(
    `${docId}: '${field}' is '${value ?? 'undefined'}', which is not in the controlled vocabulary [${allowed.join(', ')}] (TECHNICAL_ARCHITECTURE.md §7.2).`,
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Localized fields — §7.1, §11.2
 * ──────────────────────────────────────────────────────────────────────────── */

function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

/**
 * An absent or blank `en` becomes `null`, never the RO value: §11.2 forbids serving RO content
 * under an EN URL, and a silent fallback here would defeat every downstream rule at once.
 */
function localized<T>(raw: RawLocalized<T> | null | undefined): Localized<T> | null {
  if (!raw || isEmpty(raw.ro)) return null;
  return { ro: raw.ro as T, en: isEmpty(raw.en) ? null : (raw.en as T) };
}

function requiredLocalized<T>(
  raw: RawLocalized<T> | null | undefined,
  field: string,
  docId: string,
): Localized<T> {
  const value = localized(raw);
  if (!value) {
    throw new ContentShapeError(`${docId}: required localized field '${field}' has no RO value.`);
  }
  return value;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Shared fragments
 * ──────────────────────────────────────────────────────────────────────────── */

function normalizeImage(raw: RawImage | null | undefined): ImageAsset | null {
  if (!raw || !raw.assetId || !raw.url) return null;
  return {
    assetId: raw.assetId,
    url: raw.url,
    width: raw.width ?? 0,
    height: raw.height ?? 0,
    // §12 "Image SEO": alt is authored, never derived. An unauthored alt stays empty rather
    // than being invented from a filename or a title.
    alt: localized(raw.alt) ?? { ro: '', en: null },
    hotspot: raw.hotspot ?? null,
    crop: raw.crop ?? null,
  };
}

function normalizeImages(raw: readonly RawImage[] | null | undefined): readonly ImageAsset[] {
  return (raw ?? [])
    .map((image) => normalizeImage(image))
    .filter((image): image is ImageAsset => image !== null);
}

function normalizePlacement(
  raw: { slot?: string | null; pillar?: string | null },
  docId: string,
): HighlightPlacement {
  return {
    slot: oneOf(raw.slot, HIGHLIGHT_SLOTS, 'curation.placements[].slot', docId),
    // A pillar-neutral placement is legitimate (`types.ts`: `null` = pillar-neutral).
    pillar: raw.pillar ? oneOf(raw.pillar, PILLARS, 'curation.placements[].pillar', docId) : null,
  };
}

/**
 * Curation is optional on an authored document; its absence means "no editorial emphasis",
 * which is a real state, not an error (`CONTENT_MODEL.md` §4).
 */
function normalizeCuration(raw: RawCuration | null | undefined, docId: string): Curation {
  return {
    featured: raw?.featured ?? false,
    pinned: raw?.pinned ?? false,
    editorialPriority: raw?.editorialPriority ?? 0,
    placements: (raw?.placements ?? []).map((placement) => normalizePlacement(placement, docId)),
    prominence: (raw?.prominence
      ? oneOf(raw.prominence, PROMINENCES, 'curation.prominence', docId)
      : 'standard') as Prominence,
  };
}

function normalizeSeo(raw: RawSeo | null | undefined): Seo {
  return {
    title: localized(raw?.title),
    description: localized(raw?.description),
  };
}

export function normalizeEmployer(raw: RawEmployer | null | undefined): Employer | null {
  if (!raw || !raw._id || !raw.name) return null;
  return { _id: assertNotDraft(raw._id), _type: 'employer', name: raw.name };
}

function normalizeSectors(raw: readonly string[] | null | undefined): readonly Sector[] {
  // Deliberately not validated against `KNOWN_SECTORS`: `CONTENT_MODEL.md`:53 leaves the axis
  // open-ended and :100 makes a new sector "a new *value*, not a new structure". Only shape is
  // checked — a blank value would produce a filter token nobody can select.
  return (raw ?? []).filter((sector) => typeof sector === 'string' && sector.trim() !== '');
}

function normalizeDiscipline(
  raw: RawWorkEntry['discipline'],
  docId: string,
): DisciplineAssignment {
  const primary = oneOf(raw?.primary, DISCIPLINES, 'discipline.primary', docId);
  const secondary = (raw?.secondary ?? [])
    .map((value) => oneOf(value, DISCIPLINES, 'discipline.secondary[]', docId))
    .filter((value): value is Discipline => value !== primary);
  return { primary, secondary };
}

function normalizeEntryType(raw: RawWorkEntry['entryType'], docId: string): EntryTypeAssignment {
  const primary = oneOf(raw?.primary, ENTRY_TYPES, 'entryType.primary', docId);
  const secondary = (raw?.secondary ?? [])
    .map((value) => oneOf(value, ENTRY_TYPES, 'entryType.secondary[]', docId))
    .filter((value): value is EntryType => value !== primary);
  return { primary, secondary };
}

function normalizeMetadata(
  raw: RawWorkEntryMetadata | null | undefined,
  docId: string,
): WorkEntryMetadata {
  if (raw?.year === null || raw?.year === undefined) {
    throw new ContentShapeError(`${docId}: 'metadata.year' is required (it sorts the archive — IA Step 5).`);
  }
  return {
    year: raw.year,
    location: localized(raw.location),
    client: raw.client ?? null,
    collaborators: raw.collaborators ?? [],
    status: oneOf(raw.status, STATUSES, 'metadata.status', docId) as Status,
    awards: localized(raw.awards),
    area: raw.area ?? null,
    team: raw.team ?? [],
    deliverables: localized(raw.deliverables),
  };
}

/**
 * §19.4 publication gate. A point cloud is *measurable*; publishing one is materially different
 * from publishing a photograph of the same building, and heritage/institutional clients may
 * hold contractual restrictions. Without an explicit clearance the derivative is dropped from
 * the build output entirely — the rest of the capture metadata (accuracy, equipment, point
 * count) still renders, because those are claims about the survey, not the survey itself.
 */
function normalizeCapture(
  raw: RawCaptureMetadata | null | undefined,
  cleared: boolean,
  docId: string,
): CaptureMetadata | null {
  if (!raw) return null;

  const derivative =
    cleared && raw.derivative?.assetUrl
      ? {
          assetUrl: raw.derivative.assetUrl,
          poster: normalizeImage(raw.derivative.poster),
        }
      : null;

  if (derivative && !derivative.poster) {
    // §10.2/§14.0: the viewer degrades to a static poster. A derivative without one has no
    // baseline to degrade to, which progressive enhancement makes mandatory.
    throw new ContentShapeError(
      `${docId}: a published point-cloud derivative requires a poster fallback (TECHNICAL_ARCHITECTURE.md §10.2, §14.0).`,
    );
  }

  return {
    accuracy: localized(raw.accuracy),
    equipment: raw.equipment ?? [],
    software: raw.software ?? [],
    // §10.4: real data, never computed. Absent means "not declared", never a fabricated figure.
    pointCount: raw.pointCount ?? null,
    derivative: derivative as CaptureMetadata['derivative'],
  };
}

/* ────────────────────────────────────────────────────────────────────────────
 * Documents
 * ──────────────────────────────────────────────────────────────────────────── */

export function normalizeWorkEntrySummary(raw: RawWorkEntrySummary): WorkEntrySummary {
  const _id = requireId(raw, 'Work Entry summary');
  return {
    _id,
    title: requiredLocalized(raw.title, 'title', _id),
    slug: requiredLocalized(raw.slug, 'slug', _id),
    enPublished: raw.enPublished ?? false,
    // §7.4: derived from Discipline, never read from the document.
    pillars: derivePillars(normalizeDiscipline(raw.discipline, _id)),
    entryType: normalizeEntryType(raw.entryType, _id),
    sectors: normalizeSectors(raw.sectors),
    year: raw.year ?? 0,
    status: oneOf(raw.status, STATUSES, 'metadata.status', _id) as Status,
    cover: normalizeImage(raw.cover),
    curation: normalizeCuration(raw.curation, _id),
  };
}

export function normalizeServiceRef(
  raw: { _id?: string | null; slug?: RawLocalized<string> | null },
): ServiceRef | null {
  if (!raw._id) return null;
  const slug = localized(raw.slug);
  if (!slug) return null;
  return { _id: assertNotDraft(raw._id), slug };
}

export function normalizeWorkArchiveItem(raw: RawWorkArchiveItem): WorkArchiveItem {
  const summary = normalizeWorkEntrySummary(raw);
  return {
    ...summary,
    discipline: normalizeDiscipline(raw.discipline, summary._id),
    services: (raw.services ?? [])
      .map((service) => normalizeServiceRef(service))
      .filter((service): service is ServiceRef => service !== null),
    attribution: oneOf(raw.attribution, ATTRIBUTIONS, 'attribution', summary._id) as Attribution,
    employer: normalizeEmployer(raw.employer),
    // Optional display metadata (I-3): absent stays absent, never a placeholder string.
    location: localized(raw.location),
  };
}

export function normalizeServiceSummary(raw: RawServiceSummary): ServiceSummary {
  const _id = requireId(raw, 'Service summary');
  return {
    _id,
    name: requiredLocalized(raw.name, 'name', _id),
    slug: requiredLocalized(raw.slug, 'slug', _id),
    enPublished: raw.enPublished ?? false,
    // Services are classified by an authored Pillar, not by Discipline — the §7.4 derivation
    // does not apply to them (IA §2.3: "Service → Pillar").
    pillar: oneOf(raw.pillar, PILLARS, 'pillar', _id) as Pillar,
    shortDescription: localized(raw.shortDescription),
    hero: normalizeImage(raw.hero),
    curation: normalizeCuration(raw.curation, _id),
  };
}

export function normalizeWorkEntry(raw: RawWorkEntry): WorkEntry {
  const _id = requireId(raw, 'Work Entry');
  const discipline = normalizeDiscipline(raw.discipline, _id);
  const attribution = oneOf(raw.attribution, ATTRIBUTIONS, 'attribution', _id) as Attribution;
  const capturePublicationCleared = raw.capturePublicationCleared ?? false;

  const employer = normalizeEmployer(raw.employer);
  if (employer && attribution !== 'studio') {
    // `CONTENT_MODEL.md`:50 scopes Employer to Attribution = Studio. Carrying one on an
    // independent entry would misattribute the work — the exact failure §1's honest-crediting
    // requirement exists to prevent.
    throw new ContentShapeError(
      `${_id}: 'employer' is set but attribution is '${attribution}'. Employer applies only when Attribution = Studio (CONTENT_MODEL.md:50).`,
    );
  }

  return {
    _id,
    _type: 'workEntry',
    title: requiredLocalized(raw.title, 'title', _id),
    slug: requiredLocalized(raw.slug, 'slug', _id),
    enPublished: raw.enPublished ?? false,

    discipline,
    pillars: derivePillars(discipline),
    entryType: normalizeEntryType(raw.entryType, _id),
    attribution,
    commissioning: oneOf(
      raw.commissioning,
      COMMISSIONING_CONTEXTS,
      'commissioning',
      _id,
    ) as CommissioningContext,
    employer,
    sectors: normalizeSectors(raw.sectors),
    roles: localized(raw.roles),

    services: (raw.services ?? []).map(normalizeServiceSummary),
    relatedWork: (raw.relatedWork ?? []).map(normalizeWorkEntrySummary),

    description: localized<readonly PortableTextBlock[]>(raw.description),
    authorship: localized(raw.authorship),
    cover: normalizeImage(raw.cover),
    gallery: normalizeImages(raw.gallery),
    capture: normalizeCapture(raw.capture, capturePublicationCleared, _id),
    capturePublicationCleared,

    metadata: normalizeMetadata(raw.metadata, _id),
    curation: normalizeCuration(raw.curation, _id),
    seo: normalizeSeo(raw.seo),
  };
}

export function normalizeService(raw: RawService): Service {
  const _id = requireId(raw, 'Service');
  return {
    _id,
    _type: 'service',
    name: requiredLocalized(raw.name, 'name', _id),
    slug: requiredLocalized(raw.slug, 'slug', _id),
    enPublished: raw.enPublished ?? false,
    pillar: oneOf(raw.pillar, PILLARS, 'pillar', _id) as Pillar,
    shortDescription: localized(raw.shortDescription),
    description: localized<readonly PortableTextBlock[]>(raw.description),
    problemSolved: localized<readonly PortableTextBlock[]>(raw.problemSolved),
    deliverables: localized(raw.deliverables),
    process: localized<readonly PortableTextBlock[]>(raw.process),
    equipment: localized(raw.equipment),
    sectors: normalizeSectors(raw.sectors),
    hero: normalizeImage(raw.hero),
    // Zero demonstrating entries is a valid published state (IA Step 6, F5) — never an error.
    demonstratedBy: (raw.demonstratedBy ?? []).map(normalizeWorkEntrySummary),
    curation: normalizeCuration(raw.curation, _id),
    seo: normalizeSeo(raw.seo),
  };
}
