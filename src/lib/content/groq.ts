/**
 * GROQ projections — the single declaration of the query shape.
 *
 * OWNER: Workstream B. `TECHNICAL_ARCHITECTURE.md` §8, §23.4 (I-3).
 *
 * §23.4 names I-3 "the highest-risk integration": if the fixtures A builds against diverge
 * from what GROQ actually returns, every component silently breaks at once. The mitigation is
 * one origin for both. This module is that origin.
 *
 * Each projection is declared as a **map from returned key to GROQ expression**, constrained
 * by `satisfies Record<keyof Raw…, string>`. TypeScript therefore rejects a projection that
 * omits a field the normalizer reads, or that returns a field the normalizer does not know
 * about. The GROQ string is generated from the map — it is never hand-written, so it cannot
 * drift from the raw types. `query-shape.test.ts` asserts the same property at runtime.
 *
 * Nothing here selects `pillar`: Pillar is derived from Discipline at build time and never
 * stored (§7.4, §8). A projection that could select it would mean the schema had grown an
 * editable Pillar field, which §7.4 forbids.
 */

import type { PortableTextBlock } from './types.js';

/* ────────────────────────────────────────────────────────────────────────────
 * Raw shapes — exactly what the Content Lake returns, before normalization
 *
 * Optional/nullable throughout: GROQ omits an unset field rather than returning null, and an
 * untranslated `en` is simply absent (§7.1). Coercion to the frozen contract happens in
 * `normalize.ts`, in one place.
 * ──────────────────────────────────────────────────────────────────────────── */

export interface RawLocalized<T> {
  readonly ro?: T | null;
  readonly en?: T | null;
}

export type RawLocalizedString = RawLocalized<string>;
export type RawLocalizedStringList = RawLocalized<readonly string[]>;
export type RawLocalizedRichText = RawLocalized<readonly PortableTextBlock[]>;

export interface RawImage {
  readonly assetId?: string | null;
  readonly url?: string | null;
  readonly width?: number | null;
  readonly height?: number | null;
  readonly alt?: RawLocalizedString | null;
  readonly hotspot?: { x: number; y: number; width: number; height: number } | null;
  readonly crop?: { top: number; bottom: number; left: number; right: number } | null;
}

export interface RawAssignment<T> {
  readonly primary?: T | null;
  readonly secondary?: readonly T[] | null;
}

export interface RawCuration {
  readonly featured?: boolean | null;
  readonly pinned?: boolean | null;
  readonly editorialPriority?: number | null;
  readonly prominence?: string | null;
  readonly placements?: readonly { slot?: string | null; pillar?: string | null }[] | null;
}

export interface RawSeo {
  readonly title?: RawLocalizedString | null;
  readonly description?: RawLocalizedString | null;
}

export interface RawEmployer {
  readonly _id?: string | null;
  readonly _type?: string | null;
  readonly name?: string | null;
}

export interface RawWorkEntryMetadata {
  readonly year?: number | null;
  readonly location?: RawLocalizedString | null;
  readonly client?: string | null;
  readonly collaborators?: readonly string[] | null;
  readonly status?: string | null;
  readonly awards?: RawLocalizedStringList | null;
  readonly area?: number | null;
  readonly team?: readonly string[] | null;
  readonly deliverables?: RawLocalizedStringList | null;
}

export interface RawPointCloudDerivative {
  readonly assetUrl?: string | null;
  readonly poster?: RawImage | null;
}

export interface RawCaptureMetadata {
  readonly accuracy?: RawLocalizedString | null;
  readonly equipment?: readonly string[] | null;
  readonly software?: readonly string[] | null;
  readonly pointCount?: number | null;
  readonly derivative?: RawPointCloudDerivative | null;
}

/** Recognition-level Service projection — the target of `WorkEntry.services` (W-5, H-3). */
export interface RawServiceSummary {
  readonly _id?: string | null;
  readonly name?: RawLocalizedString | null;
  readonly slug?: RawLocalizedString | null;
  readonly enPublished?: boolean | null;
  readonly pillar?: string | null;
  readonly shortDescription?: RawLocalizedString | null;
  readonly hero?: RawImage | null;
  readonly curation?: RawCuration | null;
}

/**
 * Preview projection. Carries `discipline` — which the frozen `WorkEntrySummary` does *not*
 * expose — because Pillar is derived, and a summary cannot honestly report `pillars` without
 * the axis it derives from (§7.4).
 */
export interface RawWorkEntrySummary {
  readonly _id?: string | null;
  readonly title?: RawLocalizedString | null;
  readonly slug?: RawLocalizedString | null;
  readonly enPublished?: boolean | null;
  readonly discipline?: RawAssignment<string> | null;
  readonly entryType?: RawAssignment<string> | null;
  readonly sectors?: readonly string[] | null;
  readonly year?: number | null;
  readonly status?: string | null;
  readonly cover?: RawImage | null;
  readonly curation?: RawCuration | null;
}

/** The archive/curated-view projection (§23.5, IA §5.1). Adds the facets those surfaces filter and group by. */
export interface RawWorkArchiveItem extends RawWorkEntrySummary {
  readonly attribution?: string | null;
  readonly employer?: RawEmployer | null;
  readonly services?: readonly { _id?: string | null; slug?: RawLocalizedString | null }[] | null;
  /** Display metadata (I-3). See `WorkArchiveItem.location`. */
  readonly location?: RawLocalizedString | null;
}

export interface RawWorkEntry {
  readonly _id?: string | null;
  readonly _type?: string | null;
  readonly title?: RawLocalizedString | null;
  readonly slug?: RawLocalizedString | null;
  readonly enPublished?: boolean | null;
  readonly discipline?: RawAssignment<string> | null;
  readonly entryType?: RawAssignment<string> | null;
  readonly attribution?: string | null;
  readonly commissioning?: string | null;
  readonly employer?: RawEmployer | null;
  readonly sectors?: readonly string[] | null;
  readonly roles?: RawLocalizedStringList | null;
  readonly services?: readonly RawServiceSummary[] | null;
  readonly relatedWork?: readonly RawWorkEntrySummary[] | null;
  readonly description?: RawLocalizedRichText | null;
  readonly authorship?: RawLocalizedString | null;
  readonly cover?: RawImage | null;
  readonly gallery?: readonly RawImage[] | null;
  readonly capture?: RawCaptureMetadata | null;
  readonly capturePublicationCleared?: boolean | null;
  readonly metadata?: RawWorkEntryMetadata | null;
  readonly curation?: RawCuration | null;
  readonly seo?: RawSeo | null;
}

export interface RawService {
  readonly _id?: string | null;
  readonly _type?: string | null;
  readonly name?: RawLocalizedString | null;
  readonly slug?: RawLocalizedString | null;
  readonly enPublished?: boolean | null;
  readonly pillar?: string | null;
  readonly shortDescription?: RawLocalizedString | null;
  readonly description?: RawLocalizedRichText | null;
  readonly problemSolved?: RawLocalizedRichText | null;
  readonly deliverables?: RawLocalizedStringList | null;
  readonly process?: RawLocalizedRichText | null;
  readonly equipment?: RawLocalizedStringList | null;
  readonly sectors?: readonly string[] | null;
  readonly hero?: RawImage | null;
  readonly demonstratedBy?: readonly RawWorkEntrySummary[] | null;
  readonly curation?: RawCuration | null;
  readonly seo?: RawSeo | null;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Projection construction
 * ──────────────────────────────────────────────────────────────────────────── */

export type ProjectionMap = Readonly<Record<string, string>>;

/** `{ _id, "title": title{ro, en}, … }` — a field whose expression is its own name is emitted bare. */
export function projection(map: ProjectionMap): string {
  const fields = Object.entries(map).map(([key, expr]) => (expr === key ? key : `"${key}": ${expr}`));
  return `{ ${fields.join(', ')} }`;
}

const LOCALIZED = '{ ro, en }';

/** A localized slug is two `slug` objects; the query flattens both `.current` values. */
const LOCALIZED_SLUG = '{ "ro": ro.current, "en": en.current }';

export const IMAGE_FIELDS = {
  assetId: 'asset->_id',
  url: 'asset->url',
  width: 'asset->metadata.dimensions.width',
  height: 'asset->metadata.dimensions.height',
  alt: `alt${LOCALIZED}`,
  hotspot: 'hotspot',
  crop: 'crop',
} as const satisfies Record<keyof RawImage, string>;

const IMAGE = projection(IMAGE_FIELDS);

export const CURATION_FIELDS = {
  featured: 'featured',
  pinned: 'pinned',
  editorialPriority: 'editorialPriority',
  prominence: 'prominence',
  placements: 'placements[]{ slot, pillar }',
} as const satisfies Record<keyof RawCuration, string>;

const CURATION = projection(CURATION_FIELDS);

export const SEO_FIELDS = {
  title: `title${LOCALIZED}`,
  description: `description${LOCALIZED}`,
} as const satisfies Record<keyof RawSeo, string>;

const SEO = projection(SEO_FIELDS);

export const EMPLOYER_FIELDS = {
  _id: '_id',
  _type: '_type',
  name: 'name',
} as const satisfies Record<keyof RawEmployer, string>;

const EMPLOYER = projection(EMPLOYER_FIELDS);

const DISCIPLINE_ASSIGNMENT = '{ primary, "secondary": coalesce(secondary, []) }';
const ENTRY_TYPE_ASSIGNMENT = '{ primary, "secondary": coalesce(secondary, []) }';

export const METADATA_FIELDS = {
  year: 'year',
  location: `location${LOCALIZED}`,
  client: 'client',
  collaborators: 'collaborators',
  status: 'status',
  awards: `awards${LOCALIZED}`,
  area: 'area',
  team: 'team',
  deliverables: `deliverables${LOCALIZED}`,
} as const satisfies Record<keyof RawWorkEntryMetadata, string>;

const METADATA = projection(METADATA_FIELDS);

/**
 * `derivative.asset` is a **file field**, not a reference — Sanity stores it as
 * `{ _type: 'file', asset: { _ref } }`, so the dereference is `asset.asset->url`, one level
 * deeper than an image's `asset->url`.
 *
 * FIXED AT B3, against a live dataset. `asset->url` returned `null` for a real uploaded
 * derivative, and because `normalizeCapture` gates on `raw.derivative?.assetUrl` being truthy,
 * the §19.4 capture gate appeared to pass while actually withholding *every* derivative,
 * cleared or not. No fixture could catch it: `fixtures.ts` authors `assetUrl` directly in the
 * raw shape and never exercises the dereference. It took an uploaded asset in a real dataset —
 * which is exactly what the B3 capture-gate verification script does
 * (`studio/scripts/verify-capture-gate.ts`).
 */
export const POINT_CLOUD_DERIVATIVE_FIELDS = {
  assetUrl: 'asset.asset->url',
  poster: `poster${IMAGE}`,
} as const satisfies Record<keyof RawPointCloudDerivative, string>;

const POINT_CLOUD_DERIVATIVE = projection(POINT_CLOUD_DERIVATIVE_FIELDS);

export const CAPTURE_FIELDS = {
  accuracy: `accuracy${LOCALIZED}`,
  equipment: 'equipment',
  software: 'software',
  pointCount: 'pointCount',
  derivative: `derivative${POINT_CLOUD_DERIVATIVE}`,
} as const satisfies Record<keyof RawCaptureMetadata, string>;

const CAPTURE = projection(CAPTURE_FIELDS);

export const SERVICE_SUMMARY_FIELDS = {
  _id: '_id',
  name: `name${LOCALIZED}`,
  slug: `slug${LOCALIZED_SLUG}`,
  enPublished: 'enPublished',
  pillar: 'pillar',
  shortDescription: `shortDescription${LOCALIZED}`,
  hero: `hero${IMAGE}`,
  curation: `curation${CURATION}`,
} as const satisfies Record<keyof RawServiceSummary, string>;

export const SERVICE_SUMMARY_PROJECTION = projection(SERVICE_SUMMARY_FIELDS);

export const WORK_ENTRY_SUMMARY_FIELDS = {
  _id: '_id',
  title: `title${LOCALIZED}`,
  slug: `slug${LOCALIZED_SLUG}`,
  enPublished: 'enPublished',
  discipline: `discipline${DISCIPLINE_ASSIGNMENT}`,
  entryType: `entryType${ENTRY_TYPE_ASSIGNMENT}`,
  sectors: 'sectors',
  year: 'metadata.year',
  status: 'metadata.status',
  cover: `cover${IMAGE}`,
  curation: `curation${CURATION}`,
} as const satisfies Record<keyof RawWorkEntrySummary, string>;

export const WORK_ENTRY_SUMMARY_PROJECTION = projection(WORK_ENTRY_SUMMARY_FIELDS);

export const WORK_ARCHIVE_ITEM_FIELDS = {
  _id: '_id',
  title: `title${LOCALIZED}`,
  slug: `slug${LOCALIZED_SLUG}`,
  enPublished: 'enPublished',
  discipline: `discipline${DISCIPLINE_ASSIGNMENT}`,
  entryType: `entryType${ENTRY_TYPE_ASSIGNMENT}`,
  sectors: 'sectors',
  year: 'metadata.year',
  status: 'metadata.status',
  cover: `cover${IMAGE}`,
  curation: `curation${CURATION}`,
  attribution: 'attribution',
  employer: `employer->${EMPLOYER}`,
  services: `services[]->{ _id, "slug": slug${LOCALIZED_SLUG} }`,
  // Reached out of `metadata` exactly as `year` and `status` above are (I-3).
  location: `metadata.location${LOCALIZED}`,
} as const satisfies Record<keyof RawWorkArchiveItem, string>;

export const WORK_ARCHIVE_ITEM_PROJECTION = projection(WORK_ARCHIVE_ITEM_FIELDS);

export const WORK_ENTRY_FIELDS = {
  _id: '_id',
  _type: '_type',
  title: `title${LOCALIZED}`,
  slug: `slug${LOCALIZED_SLUG}`,
  enPublished: 'enPublished',
  discipline: `discipline${DISCIPLINE_ASSIGNMENT}`,
  entryType: `entryType${ENTRY_TYPE_ASSIGNMENT}`,
  attribution: 'attribution',
  commissioning: 'commissioning',
  employer: `employer->${EMPLOYER}`,
  sectors: 'sectors',
  roles: `roles${LOCALIZED}`,
  services: `services[]->${SERVICE_SUMMARY_PROJECTION}`,
  relatedWork: `relatedWork[]->${WORK_ENTRY_SUMMARY_PROJECTION}`,
  description: `description${LOCALIZED}`,
  authorship: `authorship${LOCALIZED}`,
  cover: `cover${IMAGE}`,
  gallery: `gallery[]${IMAGE}`,
  capture: `capture${CAPTURE}`,
  capturePublicationCleared: 'capturePublicationCleared',
  metadata: `metadata${METADATA}`,
  curation: `curation${CURATION}`,
  seo: `seo${SEO}`,
} as const satisfies Record<keyof RawWorkEntry, string>;

export const WORK_ENTRY_PROJECTION = projection(WORK_ENTRY_FIELDS);

/**
 * `demonstratedBy` is resolved by **reversing** `WorkEntry.services` — the entry stores the
 * reference (IA Step 6, `DECISIONS_LOG.md` #38). The Service never stores its own copy of the
 * relationship, so the two directions cannot disagree.
 */
export const SERVICE_FIELDS = {
  _id: '_id',
  _type: '_type',
  name: `name${LOCALIZED}`,
  slug: `slug${LOCALIZED_SLUG}`,
  enPublished: 'enPublished',
  pillar: 'pillar',
  shortDescription: `shortDescription${LOCALIZED}`,
  description: `description${LOCALIZED}`,
  problemSolved: `problemSolved${LOCALIZED}`,
  deliverables: `deliverables${LOCALIZED}`,
  process: `process${LOCALIZED}`,
  equipment: `equipment${LOCALIZED}`,
  sectors: 'sectors',
  hero: `hero${IMAGE}`,
  demonstratedBy: `*[_type == "workEntry" && !(_id in path("drafts.**")) && references(^._id)]${WORK_ENTRY_SUMMARY_PROJECTION}`,
  curation: `curation${CURATION}`,
  seo: `seo${SEO}`,
} as const satisfies Record<keyof RawService, string>;

export const SERVICE_PROJECTION = projection(SERVICE_FIELDS);

/* ────────────────────────────────────────────────────────────────────────────
 * Queries
 *
 * The `!(_id in path("drafts.**"))` clause is redundant with `perspective: 'published'` and is
 * kept deliberately: §18 records that a Viewer token *can* read drafts, and R2 rates a draft
 * leak High. Perspective, filter, and the build-time assertion in `normalize.ts` are three
 * independent defences, and none of them costs anything.
 *
 * No query carries an `order()` clause. Discovery order is derived at build (§7.6, §8) so that
 * one implementation serves the archive, the hubs and the homepage alike.
 * ──────────────────────────────────────────────────────────────────────────── */

const PUBLISHED_WORK = '*[_type == "workEntry" && !(_id in path("drafts.**"))]';
const PUBLISHED_SERVICE = '*[_type == "service" && !(_id in path("drafts.**"))]';

export const QUERY_ALL_WORK_ENTRIES = `${PUBLISHED_WORK}${WORK_ENTRY_PROJECTION}`;
export const QUERY_WORK_ARCHIVE = `${PUBLISHED_WORK}${WORK_ARCHIVE_ITEM_PROJECTION}`;
export const QUERY_ALL_SERVICES = `${PUBLISHED_SERVICE}${SERVICE_PROJECTION}`;
export const QUERY_ALL_SERVICE_SUMMARIES = `${PUBLISHED_SERVICE}${SERVICE_SUMMARY_PROJECTION}`;

/** Slugs are localized, so a lookup names the locale field it matches on (§7.1). */
export const QUERY_WORK_ENTRY_BY_SLUG = {
  ro: `*[_type == "workEntry" && !(_id in path("drafts.**")) && slug.ro.current == $slug][0]${WORK_ENTRY_PROJECTION}`,
  en: `*[_type == "workEntry" && !(_id in path("drafts.**")) && slug.en.current == $slug][0]${WORK_ENTRY_PROJECTION}`,
} as const;

export const QUERY_SERVICE_BY_SLUG = {
  ro: `*[_type == "service" && !(_id in path("drafts.**")) && slug.ro.current == $slug][0]${SERVICE_PROJECTION}`,
  en: `*[_type == "service" && !(_id in path("drafts.**")) && slug.en.current == $slug][0]${SERVICE_PROJECTION}`,
} as const;

export const QUERY_ALL_EMPLOYERS = `*[_type == "employer" && !(_id in path("drafts.**"))]${EMPLOYER}`;
