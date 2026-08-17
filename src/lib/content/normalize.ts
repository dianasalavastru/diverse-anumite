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
 *   2. **Pillar is authored and required** (v3.1 §2, Stage 5). It is read straight from the
 *      document and validated against the closed vocabulary. There is no derivation and no
 *      fallback: a document without one fails the build here, by design, so an un-migrated
 *      dataset is loud rather than silently mis-classified.
 *   3. **Capture publication is gated** (§19.4). A point-cloud derivative is dropped unless
 *      `capturePublicationCleared` is true — in the query layer, not only in the CMS, because a
 *      publication gate that lives solely in the editing tool is a convention, not a control.
 *
 * Controlled vocabularies are validated on the way through (§7.2). The Studio blocks bad values
 * at authoring time; a value that reaches here anyway (imported content, a migration, a hand
 * mutation) fails the build rather than silently entering a filter set as an unknown token.
 */

import type {
  RawCaptureMetadata,
  RawCuration,
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
  PILLARS,
  PROJECT_LABELS,
  SECTORS,
  SERVICE_KEYS,
  HIGHLIGHT_SLOTS,
  PROMINENCES,
  STATUSES,
  type CaptureMetadata,
  type Curation,
  type ProjectLabel,
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
  type ServiceKey,
  type Status,
  type WorkArchiveItem,
  type WorkEntry,
  type WorkEntryMetadata,
  type WorkEntrySummary,
} from './types.js';
import {
  errorsOf,
  validateFieldRequirements,
  validateServicePillarConsistency,
  validateServicesPresent,
  type FieldPresence,
} from './validation.js';

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

/**
 * A **Service's** typical sectors (v3.1 §11.1) — optional, plural, closed vocabulary.
 *
 * STAGE 6: this used to accept any authored token, because the axis was open. It is now
 * vocabulary-checked like every other controlled value, so an old token such as `heritage`
 * fails the build rather than reaching a filter or a label lookup as an unknown string.
 *
 * It stays an ARRAY. A Service names the sectors it is typically relevant in; a project names
 * the one it is in. Same vocabulary, different cardinality — decided 2026-08-14, and the reason
 * this function survives beside `normalizeSector` below rather than being replaced by it.
 */
function normalizeServiceSectors(
  raw: readonly string[] | null | undefined,
  docId: string,
): readonly Sector[] {
  return (raw ?? []).map((sector) => oneOf(sector, SECTORS, 'sectors[]', docId) as Sector);
}

/**
 * A **project's** Sector (v3.1 §11.1) — mandatory, exactly one, closed vocabulary.
 *
 * STAGE 6: the field was `sectors: string[]` and unvalidated. A document carrying two sectors,
 * or an old token, now fails the build **loudly**. Nothing here picks a winner from a legacy
 * array: collapsing two authored sectors into one is a content decision, and Stage 10's
 * preflight flags those documents for a human rather than guessing.
 */
function normalizeSector(raw: string | null | undefined, docId: string): Sector {
  return oneOf(raw, SECTORS, 'sector', docId) as Sector;
}

/**
 * Project Labels (v3.1 §10) — 0..N, optional, closed vocabulary.
 *
 * Absent is the common case and normalizes to `[]`, never to a default value: a Label is an
 * editorial flag, so "none" is a real state, not a missing one. An unrecognised value **fails
 * the build** through `oneOf`, the same way every other controlled vocabulary does — a Label is
 * closed precisely so a typo cannot invent a third flag.
 *
 * Duplicates are collapsed. The Studio's `Rule.unique()` blocks them at authoring time; this is
 * the read-time counterpart, so a legacy document carrying a repeated value yields one entry
 * rather than two. **Authored order is preserved** — it carries no meaning, and neither the
 * membership tests nor the filters read it, but stable order keeps the build reproducible.
 */
function normalizeLabels(
  raw: readonly string[] | null | undefined,
  docId: string,
): readonly ProjectLabel[] {
  const seen = new Set<string>();
  const labels: ProjectLabel[] = [];

  for (const value of raw ?? []) {
    const label = oneOf(value, PROJECT_LABELS, 'labels[]', docId) as ProjectLabel;
    if (seen.has(label)) continue;
    seen.add(label);
    labels.push(label);
  }

  return labels;
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
    equipment: raw.equipment ?? [],
    implementationCompany: raw.implementationCompany ?? null,
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
    // Authored and required since Stage 5 — read from the document, never derived.
    pillar: oneOf(raw.pillar, PILLARS, 'pillar', _id) as Pillar,
    labels: normalizeLabels(raw.labels, _id),
    sector: normalizeSector(raw.sector, _id),
    year: raw.year ?? 0,
    status: oneOf(raw.status, STATUSES, 'metadata.status', _id) as Status,
    cover: normalizeImage(raw.cover),
    curation: normalizeCuration(raw.curation, _id),
  };
}

export function normalizeServiceRef(
  raw: {
    _id?: string | null;
    key?: string | null;
    pillar?: string | null;
    slug?: RawLocalized<string> | null;
  },
  docId: string,
): ServiceRef | null {
  if (!raw._id) return null;
  const slug = localized(raw.slug);
  if (!slug) return null;
  return {
    _id: assertNotDraft(raw._id),
    key: oneOf(raw.key, SERVICE_KEYS, 'services[].key', docId) as ServiceKey,
    pillar: oneOf(raw.pillar, PILLARS, 'services[].pillar', docId) as Pillar,
    slug,
  };
}

export function normalizeWorkArchiveItem(raw: RawWorkArchiveItem): WorkArchiveItem {
  const summary = normalizeWorkEntrySummary(raw);
  return {
    ...summary,
    services: (raw.services ?? [])
      .map((service) => normalizeServiceRef(service, summary._id))
      .filter((service): service is ServiceRef => service !== null),
    // Optional display metadata (I-3): absent stays absent, never a placeholder string.
    location: localized(raw.location),
    /* The archive's preview sheet — three DISTINCT readings of the project, taken off the head
       of the gallery the projection already bounded (see `WORK_ARCHIVE_ITEM_FIELDS`).

       Two filters, in this order, and no third:
         · an unrenderable or malformed asset is dropped by `normalizeImages` rather than
           counted, so the length a component reads is the number of frames it can actually show;
         · a frame carrying the COVER'S own asset id is dropped, because the sheet sits beside
           the cover and repeating it there is a frame spent saying nothing. Compared by
           `assetId` — the same photograph re-uploaded is a different asset and is honestly a
           different frame, which is the editor's call to make, not this function's.

       Then the first three. Nothing is substituted for what is missing: an entry whose gallery
       cannot supply three renders the sheet it can, and an entry with no gallery renders none. */
    galleryPreview: normalizeImages(raw.galleryPreview)
      .filter((image) => image.assetId !== summary.cover?.assetId)
      .slice(0, 3),
  };
}

export function normalizeServiceSummary(raw: RawServiceSummary): ServiceSummary {
  const _id = requireId(raw, 'Service summary');
  return {
    _id,
    key: oneOf(raw.key, SERVICE_KEYS, 'key', _id) as ServiceKey,
    name: requiredLocalized(raw.name, 'name', _id),
    slug: requiredLocalized(raw.slug, 'slug', _id),
    enPublished: raw.enPublished ?? false,
    // A Service has always carried an authored Pillar (IA §2.3, "Service → Pillar"). Since
    // Stage 5 the project does too, which is what lets Stage 8 constrain the picker.
    pillar: oneOf(raw.pillar, PILLARS, 'pillar', _id) as Pillar,
    shortDescription: localized(raw.shortDescription),
    hero: normalizeImage(raw.hero),
    curation: normalizeCuration(raw.curation, _id),
  };
}

export function normalizeWorkEntry(raw: RawWorkEntry): WorkEntry {
  const _id = requireId(raw, 'Work Entry');
  const capturePublicationCleared = raw.capturePublicationCleared ?? false;

  const metadata = normalizeMetadata(raw.metadata, _id);

  const entry: WorkEntry = {
    _id,
    _type: 'workEntry',
    title: requiredLocalized(raw.title, 'title', _id),
    slug: requiredLocalized(raw.slug, 'slug', _id),
    enPublished: raw.enPublished ?? false,

    pillar: oneOf(raw.pillar, PILLARS, 'pillar', _id) as Pillar,
    labels: normalizeLabels(raw.labels, _id),
    sector: normalizeSector(raw.sector, _id),

    services: (raw.services ?? []).map(normalizeServiceSummary),
    relatedWork: (raw.relatedWork ?? []).map(normalizeWorkEntrySummary),

    description: localized<readonly PortableTextBlock[]>(raw.description),
    cover: normalizeImage(raw.cover),
    gallery: normalizeImages(raw.gallery),
    capture: normalizeCapture(raw.capture, capturePublicationCleared, _id),
    capturePublicationCleared,

    metadata,
    curation: normalizeCuration(raw.curation, _id),
    seo: normalizeSeo(raw.seo),
  };

  assertFieldContract(entry);
  return entry;
}

/**
 * The v3.1 field contract, enforced at read time (§2, §4–§8).
 *
 * The Studio blocks the same things at authoring time from the same rules; this is the build's
 * independent refusal, in the spirit of the draft-id assertion above — a contract that lives
 * only in the editing tool is a convention, not a control. Imported content, a migration or a
 * hand mutation all arrive here.
 *
 * Every issue is collected before throwing, so one build reports every missing field rather
 * than one per run.
 */
function assertFieldContract(entry: WorkEntry): void {
  const services = entry.services;
  const issues = [
    ...validateServicesPresent(services.length),
    ...validateServicePillarConsistency(
      entry.pillar,
      services.map((service) => ({ key: service.key, pillar: service.pillar, name: service.name.ro })),
    ),
    ...validateFieldRequirements(
      entry.pillar,
      services.map((service) => service.key),
      fieldPresence(entry),
    ),
  ];

  const blocking = errorsOf(issues);
  if (blocking.length > 0) {
    throw new ContentShapeError(
      `${entry._id}: ${blocking.map((issue) => issue.message).join(' ')}`,
    );
  }
}

/** What the project actually carries, as the requirement rule expects it. */
function fieldPresence(entry: WorkEntry): FieldPresence {
  const metadata = entry.metadata;
  return {
    services: entry.services.length > 0,
    sector: Boolean(entry.sector),
    title: Boolean(entry.title.ro?.trim()),
    year: Number.isFinite(metadata.year),
    status: Boolean(metadata.status),
    client: Boolean(metadata.client?.trim()),
    description: (entry.description?.ro?.length ?? 0) > 0,
    cover: entry.cover !== null,
    gallery: entry.gallery.length > 0,
    location: Boolean(metadata.location?.ro?.trim()),
    area: metadata.area !== null,
    awards: (metadata.awards?.ro?.length ?? 0) > 0,
    equipment: metadata.equipment.length > 0,
    collaborators: metadata.collaborators.length > 0,
    team: metadata.team.length > 0,
    implementationCompany: Boolean(metadata.implementationCompany?.trim()),
  };
}

export function normalizeService(raw: RawService): Service {
  const _id = requireId(raw, 'Service');
  return {
    _id,
    key: oneOf(raw.key, SERVICE_KEYS, 'key', _id) as ServiceKey,
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
    sectors: normalizeServiceSectors(raw.sectors, _id),
    hero: normalizeImage(raw.hero),
    // Zero demonstrating entries is a valid published state (IA Step 6, F5) — never an error.
    demonstratedBy: (raw.demonstratedBy ?? []).map(normalizeWorkEntrySummary),
    curation: normalizeCuration(raw.curation, _id),
    seo: normalizeSeo(raw.seo),
  };
}
