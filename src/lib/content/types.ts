/**
 * Content shape contract — the projection of the CMS schema.
 *
 * OWNER: Workstream B (CMS / backend). Single-owner file per
 * `docs/implementation/TECHNICAL_ARCHITECTURE.md` §23.3. Workstream A consumes these
 * types and never edits them; cross-boundary changes go through B.
 *
 * AUTHORITY. Every vocabulary and axis below is transcribed from upstream documents and
 * may not be redefined here:
 *   - `docs/product/CONTENT_MODEL.md` (FROZEN v2.1) — object identity, axes, vocabularies,
 *     curation layer.
 *   - `docs/product/INFORMATION_ARCHITECTURE.md` (LOCKED) — relationships, filters, i18n.
 *   - `docs/implementation/TECHNICAL_ARCHITECTURE.md` §7.1–§7.7, §8 (Phase-0 FROZEN
 *     contracts 2–6, 8) — localization model, vocabulary contract, field contract,
 *     Pillar derivation, curation, reserved slugs, data boundary.
 *
 * SCOPE (Phase 0 / integration point I-1). This file describes the *shapes the query layer
 * returns*. It is not the Sanity schema and does not implement queries; the Studio and GROQ
 * layer land in Phase 4 (`TECHNICAL_ARCHITECTURE.md` §23.2). Fields marked DERIVED are
 * computed at build time and never stored (§8).
 */

/* ────────────────────────────────────────────────────────────────────────────
 * Locale and localized fields — §7.1 locale-neutral identity
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * RO at root, EN under `/en/` (`INFORMATION_ARCHITECTURE.md` §2.2; `DECISIONS_LOG.md` #21).
 *
 * RESOLVED AT I-1. The locale union previously existed twice — here and in the frozen locale
 * route map. It now has exactly one declaration: `src/lib/i18n/routes.ts` (Workstream A,
 * single-owner, values frozen by OD-1/OD-2), re-exported here so the content contract stays a
 * complete import surface for consumers.
 *
 * This is the direction §7.7 already establishes — "The reserved list is generated from the
 * locale route map (§11.1) — one source, read by both the router and the validator." The CMS
 * reserved-slug validator reads the route map, so the content layer depending on it adds no
 * new coupling. Two declarations of one union is exactly the drift §7.1 exists to prevent.
 *
 * The values and the route contract are unchanged; only the declaration site moved.
 */
export { LOCALES, DEFAULT_LOCALE, type Locale } from '../i18n/routes.js';

/**
 * A localized *field* on a locale-neutral document (§7.1). Document-level i18n is rejected:
 * one document per Work Entry and per Service carries `{ ro, en }` on text fields only.
 *
 * `en` is `null` while untranslated. An entity with an untranslated field is excluded from
 * EN generation entirely (§11.2) — RO content is never served under an EN URL.
 */
export interface Localized<T> {
  readonly ro: T;
  readonly en: T | null;
}

/**
 * Portable Text, serialized through controlled components with an explicit block/mark
 * allowlist (§19.2). The block shape is CMS-defined; the allowlist is *not* declared here
 * because the serializer is Phase-6 work. Never rendered as raw HTML.
 */
export interface PortableTextBlock {
  readonly _type: string;
  readonly _key: string;
  readonly [field: string]: unknown;
}

export type RichText = readonly PortableTextBlock[];

/* ────────────────────────────────────────────────────────────────────────────
 * Controlled vocabularies — §7.2, sourced from CONTENT_MODEL.md §3 only
 *
 * These are the CMS contract. The enumeration in
 * `WORK_ARCHIVE_IMPLEMENTATION_NOTES.md`:88 is prohibited (§7.2) because it mixes three
 * axes. Machine values below are 1:1 with the canonical labels; display labels are RO/EN
 * copy owned by Workstream C and deliberately absent from this file.
 * ──────────────────────────────────────────────────────────────────────────── */

/** Entry Type — the *nature* of the entry, never its status (`CONTENT_MODEL.md`:56). */
export const ENTRY_TYPES = [
  'design-project', // Design Project
  'concept-study', // Concept / Study
  'competition-entry', // Competition Entry
  'survey-documentation', // Survey / Documentation
  'visualization-commission', // Visualization Commission
] as const;
export type EntryType = (typeof ENTRY_TYPES)[number];

/** Status — a Metadata value; where "Built" lives (`CONTENT_MODEL.md`:58). Not a public filter (§23.5). */
export const STATUSES = [
  'built-realized', // Built / Realized
  'unbuilt-proposal', // Unbuilt / Proposal
  'in-progress', // In progress
  'delivered', // Delivered
] as const;
export type Status = (typeof STATUSES)[number];

/**
 * Attribution — authorship/relationship (`CONTENT_MODEL.md`:48).
 * Display/crediting only; never a visitor-facing archive filter (IA Step 5, F2).
 */
export const ATTRIBUTIONS = [
  'independent', // Independent
  'collaboration', // Collaboration
  'studio', // Studio
] as const;
export type Attribution = (typeof ATTRIBUTIONS)[number];

/** Discipline — professional field (`CONTENT_MODEL.md`:46). Mandatory, multiple, one primary. */
export const DISCIPLINES = [
  'architecture', // Architecture
  'interior-design', // Interior Design
  'reality-capture', // Reality Capture
  'visualization', // Visualization
] as const;
export type Discipline = (typeof DISCIPLINES)[number];

/**
 * Sector / use-case (`CONTENT_MODEL.md`:53). The canonical list is **open-ended** ("…") and
 * `CONTENT_MODEL.md`:100 states a new sector is a new *value*, not a new structure. The known
 * values are enumerated for authoring and autocomplete; the type stays open so adding a value
 * is a content decision, not a type change.
 */
export const KNOWN_SECTORS = [
  'residential',
  'hospitality',
  'office',
  'cultural',
  'heritage',
  'industrial',
  'infrastructure',
  'education',
] as const;
export type KnownSector = (typeof KNOWN_SECTORS)[number];
/** `string & {}` keeps literal autocomplete for known values while leaving the axis open. */
export type Sector = KnownSector | (string & {});

/** Commissioning context (`CONTENT_MODEL.md`:49) — acquisition signal; derivable from Client. */
export const COMMISSIONING_CONTEXTS = ['self-initiated', 'client-commissioned'] as const;
export type CommissioningContext = (typeof COMMISSIONING_CONTEXTS)[number];

/**
 * Pillar — capability family (`CONTENT_MODEL.md`:44). **Derived from Discipline, never an
 * editable field** (§7.4).
 *
 * These identifiers are content identity, *not* URL tokens. Route slugs live in the locale
 * route map (§11.1, `src/lib/i18n/routes.ts`), and the archive filter token is fixed
 * separately at `WORK_ARCHIVE_IMPLEMENTATION_NOTES.md`:134 as `?pillar=architecture` |
 * `reality-capture`. Consumers map between the three; nobody renames any of them.
 */
export const PILLARS = [
  'architecture-design', // Architecture & Design
  'reality-capture', // Reality Capture
] as const;
export type Pillar = (typeof PILLARS)[number];

/**
 * Pillar derivation table (§7.4) — frozen. Primary Pillar = the pillar of the primary
 * Discipline; it determines the default contextual back-path and archive scoping (IA §2.3, M2).
 * OD-7 (whether a composite entry may override the derived Primary Pillar) is open and
 * additive; no override field exists yet.
 */
export const DISCIPLINE_TO_PILLAR: Readonly<Record<Discipline, Pillar>> = {
  architecture: 'architecture-design',
  'interior-design': 'architecture-design',
  visualization: 'architecture-design',
  'reality-capture': 'reality-capture',
};

/* ────────────────────────────────────────────────────────────────────────────
 * Axis assignments — primary + optional secondary (CONTENT_MODEL.md §3, §7.3)
 * ──────────────────────────────────────────────────────────────────────────── */

/** Discipline: mandatory, multiple, one primary (`CONTENT_MODEL.md`:46). */
export interface DisciplineAssignment {
  readonly primary: Discipline;
  readonly secondary: readonly Discipline[];
}

/** Entry Type: single primary + optional secondary (`CONTENT_MODEL.md`:47, :63). */
export interface EntryTypeAssignment {
  readonly primary: EntryType;
  readonly secondary: readonly EntryType[];
}

/**
 * Pillar: primary + optional secondary (`CONTENT_MODEL.md`:44, :63). DERIVED from
 * `DisciplineAssignment` (§7.4) — present on returned shapes, absent from authored input.
 */
export interface PillarAssignment {
  readonly primary: Pillar;
  readonly secondary: readonly Pillar[];
}

/* ────────────────────────────────────────────────────────────────────────────
 * Media — §9
 * ──────────────────────────────────────────────────────────────────────────── */

/** Sanity hotspot/crop, carried once on the locale-neutral object (§7.1, §9). */
export interface ImageHotspot {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface ImageCrop {
  readonly top: number;
  readonly bottom: number;
  readonly left: number;
  readonly right: number;
}

export interface ImageAsset {
  readonly assetId: string;
  /** Sanity image CDN base URL; `srcset`/format transforms are applied at render (§9). */
  readonly url: string;
  readonly width: number;
  readonly height: number;
  /** Authored, never derived (§12 "Image SEO"). */
  readonly alt: Localized<string>;
  readonly hotspot: ImageHotspot | null;
  readonly crop: ImageCrop | null;
}

/**
 * A bounded web derivative of a real scan (§10.2). Raw E57/LAS/LAZ never enters the CMS
 * (§19.4). Publication is gated by `WorkEntry.capturePublicationCleared`.
 *
 * Field names are provisional pending integration point I-2 with Workstream D (§23.4).
 */
export interface PointCloudDerivative {
  readonly assetUrl: string;
  /** Static fallback for reduced motion / unsupported renderers (§10.2, §14.0). */
  readonly poster: ImageAsset;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Curation — presentation layer (CONTENT_MODEL.md §4, §7.5)
 *
 * Attached to *both* Work Entries and Services. Never a classification axis, never a
 * visitor-facing filter. Taxonomy decides eligibility; curation decides emphasis and order.
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * Where an explicit highlight placement applies. Placements are pillar-aware
 * (`CONTENT_MODEL.md`:77); an object may hold 0..n.
 *
 * Slots are the curated surfaces named upstream: the homepage pillar sections
 * (`HOMEPAGE_PAGE_IA.md` M-4) and the pillar hub curated-work module (`HUB_PAGE_IA.md` H-4).
 */
export const HIGHLIGHT_SLOTS = ['homepage', 'pillar-hub'] as const;
export type HighlightSlot = (typeof HIGHLIGHT_SLOTS)[number];

export interface HighlightPlacement {
  readonly slot: HighlightSlot;
  /** `null` = pillar-neutral placement. */
  readonly pillar: Pillar | null;
}

/**
 * Masonry prominence (§7.5, `WORK_ARCHIVE_IMPLEMENTATION_NOTES.md`:109). Editors curate
 * rhythm from the CMS; the engine maps prominence onto the frozen five-size layout
 * vocabulary (:40). Developers never re-order markup.
 */
export const PROMINENCES = ['feature', 'large', 'standard', 'small'] as const;
export type Prominence = (typeof PROMINENCES)[number];

export interface Curation {
  /** Elevates an object for prominence (`CONTENT_MODEL.md`:76). */
  readonly featured: boolean;
  /** Hold at top (`CONTENT_MODEL.md`:79; §7.5). */
  readonly pinned: boolean;
  /** Manual weight; display order only (`CONTENT_MODEL.md`:78). Higher sorts first (§7.6). */
  readonly editorialPriority: number;
  /** Explicit inclusion in a homepage/landing slot (`CONTENT_MODEL.md`:77). 0..n. */
  readonly placements: readonly HighlightPlacement[];
  /** Masonry prominence (§7.5). */
  readonly prominence: Prominence;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Reference list — Employer / Studio (CONTENT_MODEL.md §0, :50)
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * Grouping metadata for Professional Experience, not its own page (IA §5.1).
 * Present only when `attribution === 'studio'` (`CONTENT_MODEL.md`:50).
 */
export interface Employer {
  readonly _id: string;
  readonly _type: 'employer';
  readonly name: string;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Work Entry — content object A (CONTENT_MODEL.md §1)
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * Metadata (`CONTENT_MODEL.md`:54; §7.3). Mostly display; Year also sorts (IA Step 5).
 *
 * Localization split: proper nouns (client, collaborators, team, year, area) are
 * locale-neutral; prose-bearing values (location, awards, deliverables) are localized.
 * `TECHNICAL_ARCHITECTURE.md` §7.1 does not enumerate metadata in either column — this is a
 * B-side schema reading, revisitable at I-4 against real content.
 */
export interface WorkEntryMetadata {
  readonly year: number;
  readonly location: Localized<string> | null;
  readonly client: string | null;
  readonly collaborators: readonly string[];
  readonly status: Status;
  readonly awards: Localized<readonly string[]> | null;
  /** Square metres. */
  readonly area: number | null;
  readonly team: readonly string[];
  readonly deliverables: Localized<readonly string[]> | null;
}

/**
 * Capture metadata (`CONTENT_MODEL.md`:54; §7.3). **Real data, never computed** (§10.4) —
 * these are technical claims made to institutional clients. Field names provisional
 * pending I-2 with Workstream D.
 */
export interface CaptureMetadata {
  /** Accuracy / specification statement, as authored (§10.4). */
  readonly accuracy: Localized<string> | null;
  readonly equipment: readonly string[];
  readonly software: readonly string[];
  /** Point count of the published derivative, from the real asset (§10.4). */
  readonly pointCount: number | null;
  readonly derivative: PointCloudDerivative | null;
}

/**
 * Scoped, reader-facing credit statement (`CONTENT_MODEL.md`:52, :60). Distinct from
 * Attribution (the filter category) and Role (the granular functions) — the three-way split
 * is explicit upstream and must not be collapsed. Localized (§7.1).
 */
export type AuthorshipStatement = Localized<string>;

/**
 * The canonical portfolio object (`CONTENT_MODEL.md` §1). One locale-neutral document with
 * localized fields (§7.1). Public routes say "Proiecte" / "projects"; the internal canonical
 * object remains the Work Entry (§11.1 terminology boundary).
 */
export interface WorkEntry {
  readonly _id: string;
  readonly _type: 'workEntry';

  // ── Identity (localized text, locale-neutral document) ──
  readonly title: Localized<string>;
  /** Per-locale slug; validated against the per-locale reserved list before publication (§7.7, IA §2.2 F4). */
  readonly slug: Localized<string>;
  /** Gates EN page generation (§7.1). When false, no EN page, sitemap entry, or hreflang pair (§11.2). */
  readonly enPublished: boolean;

  // ── Classification (locale-neutral axes — CONTENT_MODEL.md §3) ──
  readonly discipline: DisciplineAssignment;
  /** DERIVED from `discipline` (§7.4, §8). Never authored, never stored. */
  readonly pillars: PillarAssignment;
  readonly entryType: EntryTypeAssignment;
  readonly attribution: Attribution;
  readonly commissioning: CommissioningContext;
  /** Only when `attribution === 'studio'` (`CONTENT_MODEL.md`:50). */
  readonly employer: Employer | null;
  readonly sectors: readonly Sector[];
  /** Functions personally performed (`CONTENT_MODEL.md`:51). Display; free vocabulary. */
  readonly roles: Localized<readonly string[]> | null;

  // ── Relationships ──
  /**
   * The Service objects this entry *demonstrates* (`CONTENT_MODEL.md`:33, :46). Many-to-many,
   * referenced not copied; the entry stores the reference (IA Step 6). 0..n — an entry with
   * none simply hides W-5 (`WORK_ENTRY_PAGE_IA.md` W-5).
   */
  readonly services: readonly ServiceSummary[];
  /** Work ⇄ Work, cross-pillar aware (IA §2.3; `WORK_ENTRY_PAGE_IA.md` W-6). */
  readonly relatedWork: readonly WorkEntrySummary[];

  // ── Evidence ──
  readonly description: Localized<RichText> | null;
  readonly authorship: AuthorshipStatement | null;
  readonly cover: ImageAsset | null;
  readonly gallery: readonly ImageAsset[];
  readonly capture: CaptureMetadata | null;
  /** Gates point-cloud asset publication (§19.4). Policy is OD-6. */
  readonly capturePublicationCleared: boolean;

  // ── Metadata, curation, SEO ──
  readonly metadata: WorkEntryMetadata;
  readonly curation: Curation;
  readonly seo: Seo;
}

/**
 * The preview projection consumed by every signposting surface: archive results
 * (`WORK_ARCHIVE_PAGE_IA.md` A-5), Related Work Strip (W-6), hub curated work (H-4),
 * Service proof (S-4), homepage highlights (M-4). One Work Preview Card everywhere
 * (`COMPONENT_INVENTORY.md` "Work Preview Card").
 */
export interface WorkEntrySummary {
  readonly _id: string;
  readonly title: Localized<string>;
  readonly slug: Localized<string>;
  readonly enPublished: boolean;
  /** DERIVED (§7.4). */
  readonly pillars: PillarAssignment;
  readonly entryType: EntryTypeAssignment;
  readonly sectors: readonly Sector[];
  readonly year: number;
  readonly status: Status;
  readonly cover: ImageAsset | null;
  readonly curation: Curation;
}

/**
 * ADDED AT I-3 — additive, no existing member changed.
 *
 * The archive/curated-view projection. `WorkEntrySummary` alone cannot serve the frozen
 * archive filter contract: §23.5 fixes the URL as
 * `?pillar=&sector=&type=&discipline=&service=&sort=`, and the summary carries neither
 * Discipline (the A&D contextual refinement) nor Service references (the RC one). The curated
 * views need two more: Professional Experience is *Attribution = Studio grouped by Employer*
 * (IA §5.1), and neither field exists on the summary.
 *
 * Rather than widen `WorkEntrySummary` — which every signposting surface consumes, and which
 * would then carry facets those surfaces have no use for — this composes it. The Work Preview
 * Card contract is untouched; the archive gets exactly the axes it filters and groups by.
 *
 * `attribution` and `employer` here are **not** browse axes. IA Step 5 / F2 is explicit that
 * Attribution, Employer, Role and Authorship are display and crediting only, never visitor
 * filters. They appear because a curated view is a *saved editorial filter* (IA §2.3) built at
 * build time, not a control exposed to visitors.
 */
export interface WorkArchiveItem extends WorkEntrySummary {
  /** The A&D contextual refinement (§23.5). */
  readonly discipline: DisciplineAssignment;
  /** The RC contextual refinement (§23.5) — matched by localized Service slug. */
  readonly services: readonly ServiceRef[];
  /** Curated-view membership only (IA §5.1). Never an exposed archive filter (F2). */
  readonly attribution: Attribution;
  /** Professional Experience grouping metadata, not its own page (IA §5.1). */
  readonly employer: Employer | null;
  /**
   * Display metadata, added at integration point I-3.
   *
   * `CONTENT_MODEL.md` §3 puts Location on the Metadata axis, "mostly display",
   * alongside Year and Status — both of which this projection already carries from
   * `metadata.*`. It is here for the same reason they are: a signposting surface renders it,
   * and the alternative was Workstream A resolving a full `WorkEntry` per row purely to read
   * one string.
   *
   * Consumed by the Homepage's Competitions index (`HOMEPAGE_PAGE_IA.md` M-5), whose approved
   * row carries a place line beneath the title. It is **not** a filter: the archive filter set
   * is frozen at §23.5 and Location is not in it.
   */
  readonly location: Localized<string> | null;
}

/**
 * IA §5.1: Professional Experience is grouped by Employer — grouping metadata, not its own page.
 *
 * The grouping is *computed* by `source.ts`/`groupByEmployer`, but the shape is content contract,
 * so it is declared here with everything else a component may render. Declaring it beside the
 * function that builds it put a rendered shape behind the build-time half of the boundary, and
 * `CuratedViews.astro` then had to reach through `index.ts` into `source.ts` to name it — which
 * is precisely the import edge that carried the query layer into the browser (B4, §8).
 */
export interface EmployerGroup {
  readonly employer: Employer;
  readonly entries: readonly WorkArchiveItem[];
}

/** The minimum a Work Entry needs to point at a Service in a filter or link (ADDED AT I-3). */
export interface ServiceRef {
  readonly _id: string;
  readonly slug: Localized<string>;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Service — content object B, first-class peer of Work Entry (CONTENT_MODEL.md §2)
 * ──────────────────────────────────────────────────────────────────────────── */

export interface Seo {
  readonly title: Localized<string> | null;
  readonly description: Localized<string> | null;
}

/**
 * A first-class content object with its own page and SEO target (`CONTENT_MODEL.md` §2).
 * Its pillar is authored (Service → Pillar, IA §2.3) — Services are not classified by
 * Discipline, so the §7.4 derivation does not apply to them.
 */
export interface Service {
  readonly _id: string;
  readonly _type: 'service';

  readonly name: Localized<string>;
  readonly slug: Localized<string>;
  readonly enPublished: boolean;

  /** Parent pillar; target of the F1 back-path (IA §2.3; `SERVICE_PAGE_IA.md` S-1). */
  readonly pillar: Pillar;

  /** One-line positioning (S-1) and long-form explanation (S-2/S-3). */
  readonly shortDescription: Localized<string> | null;
  readonly description: Localized<RichText> | null;
  /** What the service solves + use-cases (S-2). */
  readonly problemSolved: Localized<RichText> | null;
  /** What you get (S-3). */
  readonly deliverables: Localized<readonly string[]> | null;
  /** How it works (S-3). */
  readonly process: Localized<RichText> | null;
  /** Equipment & specs — capture services (`CONTENT_MODEL.md`:31; S-3). */
  readonly equipment: Localized<readonly string[]> | null;
  /** Sector-relevant use-cases (S-2). */
  readonly sectors: readonly Sector[];

  readonly hero: ImageAsset | null;

  /**
   * DERIVED at query time by reversing `WorkEntry.services` (IA Step 6: the entry stores the
   * reference; the Service page renders demonstrating entries dynamically). Locale-scoped
   * (§7.1) and curation-ordered (§7.6).
   *
   * **Zero entries is a valid published state** (IA Step 6, F5): render the editorial
   * empty state + Contact CTA + hub back-path, never an empty grid. The CMS surfaces the
   * zero-linked state to editors as a non-blocking warning.
   */
  readonly demonstratedBy: readonly WorkEntrySummary[];

  readonly curation: Curation;
  readonly seo: Seo;
}

/** Recognition-level projection for H-3 (hub services overview), W-5, and the Services index. */
export interface ServiceSummary {
  readonly _id: string;
  readonly name: Localized<string>;
  readonly slug: Localized<string>;
  readonly enPublished: boolean;
  readonly pillar: Pillar;
  readonly shortDescription: Localized<string> | null;
  readonly hero: ImageAsset | null;
  readonly curation: Curation;
}
