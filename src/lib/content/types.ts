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

/* ────────────────────────────────────────────────────────────────────────────
 * Entry Type — REMOVED at migration Stage 4
 *
 * v3.1 §12 retires the axis outright. It is **not renamed to Labels**: four of its five values
 * are simply gone, and nothing takes their place.
 *
 *   design-project · concept-study · survey-documentation · visualization-commission
 *     → retired. Not Labels, not Services, not Sectors, not hidden compatibility metadata.
 *     What a project *is* is now said by its Pillar and its Services.
 *   competition-entry
 *     → the one surviving semantic, as the OPTIONAL Label `competition` (§10).
 *
 * `PROJECT_LABELS` below (added at Stage 1) is the replacement vocabulary, and it is a
 * different kind of thing: 0..N optional editorial flags, not a mandatory single-primary axis.
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * Status — v3.1 §11.2. **Mandatory and single-select in BOTH Pillars**, from this closed list.
 * Not a public filter (§23.5).
 *
 * STAGE 7 replaced the vocabulary outright. The old four — `built-realized`,
 * `unbuilt-proposal`, `in-progress`, `delivered` — are gone and now fail the build loudly.
 * There is deliberately **no alias and no runtime fallback**: the mapping is lossy
 * (`built-realized` and `delivered` both land on `finalizat`, and `in-dezvoltare` has no
 * source at all), so a silent remap would quietly decide content questions. Legacy values are
 * data for the Stage 9/10 migration to review, never something this contract accepts.
 *
 * These four are the whole vocabulary. **No capture-workflow status** — *Scanat*, *Procesare*,
 * *Livrat* or similar — is to be added: a survey's progress is expressed by the same four
 * values as every other project (`DECISIONS_LOG.md` #94).
 */
export const STATUSES = [
  'in-dezvoltare', // În dezvoltare
  'in-desfasurare', // În desfășurare
  'finalizat', // Finalizat
  'nerealizat', // Nerealizat
] as const;
export type Status = (typeof STATUSES)[number];

/* ────────────────────────────────────────────────────────────────────────────
 * Discipline — REMOVED at migration Stage 5
 *
 * v3.1 §12 retires the axis and makes **Pillar an authored field** instead of one derived from
 * it. Architecture, Interior Design, Visualization and Reality Capture are not retained as
 * hidden categories and are not mapped into another taxonomy: where their granularity is still
 * wanted it is carried by **Services**, which Stage 8 wires.
 *
 * Gone with it: `DISCIPLINES`/`Discipline`, `DisciplineAssignment`, `DISCIPLINE_TO_PILLAR`,
 * `derivePillars()`, `isCrossPillar()`, `PillarAssignment`, and the whole notion of a project
 * resolving into two pillars.
 * ──────────────────────────────────────────────────────────────────────────── */

/* ────────────────────────────────────────────────────────────────────────────
 * Sector — CLOSED at migration Stage 6
 *
 * The axis used to be open: `KNOWN_SECTORS` was an autocomplete list and `Sector` was
 * `KnownSector | (string & {})`, so any authored token was legal. v3.1 §11.1 closes it to seven
 * values, and the union now lives with the other v3.1 vocabularies below (`SECTORS`).
 *
 * The old eight tokens — residential · hospitality · office · cultural · heritage · industrial
 * · infrastructure · education — are **not** members and now fail the build loudly at
 * `normalize.ts`. They are remapped by the Stage 9/10 dataset migration, never silently here.
 * ──────────────────────────────────────────────────────────────────────────── */

/* ────────────────────────────────────────────────────────────────────────────
 * Attribution · Commissioning · Roles · Authorship — REMOVED at migration Stage 3
 *
 * v3.1 §12 retires all four as project concepts. They are **not renamed and not replaced**:
 * crediting is carried by `metadata.collaborators` and `metadata.team`, two optional plain
 * lists, and by authored Description prose (v3.1 §13, `DECISIONS_LOG.md` #91).
 *
 * Gone with them: `ATTRIBUTIONS`/`Attribution`, `COMMISSIONING_CONTEXTS`/`CommissioningContext`,
 * `AuthorshipStatement`, and the four `WorkEntry` fields. `Role` never had a closed vocabulary —
 * `roles` was free localized text — so there is no constant to delete for it.
 *
 * None of them becomes a Label, a Service, a Sector, Pillar metadata or a hidden legacy field.
 * A live document may still physically carry the four keys; the projection no longer selects
 * them and the normalizer no longer reads them, which is the whole of the runtime change. The
 * dataset itself is rewritten at Stage 9.
 * ──────────────────────────────────────────────────────────────────────────── */

/* ────────────────────────────────────────────────────────────────────────────
 * v3.1 vocabularies — ADDED AT MIGRATION STAGE 1, ADDITIVE ONLY
 *
 * `CONTENT_MODEL.md` is now **CLIENT-VALIDATED v3.1** and is the normative source for every
 * value below. The vocabularies it replaces — Discipline, Entry Type, the open Sector list and
 * the old Status list — have all been migrated in their own stages. Each is removed by its own stage of
 * `docs/implementation/V31_MIGRATION_PLAN.md`:
 *
 *   Stage 4  Entry Type   → `PROJECT_LABELS`
 *   Stage 5  Discipline   → authored Pillar (no replacement vocabulary)
 *   Stage 6  `KNOWN_SECTORS` / open `Sector` → `SECTORS`, DONE — the union below is closed
 *   Stage 7  `STATUSES`    → v3.1 values, DONE — renamed into place
 *   Stage 8  the Service keys below become the authority for field activation
 *
 * NOTHING IN THIS BLOCK IS CONSUMED YET. It exists so the merge rule in `requirements.ts` can
 * be written and proven against the locked model before any consumer depends on it. Adding a
 * value here changes no document, no query and no page.
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * Service machine keys — the **stable, immutable identity of a Service** (v3.1 §14.3).
 *
 * Field activation and validation key off these and off nothing else. A Service's title and its
 * localized slugs are editor-owned and may be changed from the Studio at any time; keying a
 * requirement rule to either of them would mean a rename silently changed what a project is
 * required to carry. That is the single reason this vocabulary exists.
 *
 * Exactly eight, four per Pillar (v3.1 §2). The list is closed: drone photogrammetry is a
 * capability of the practice, deliberately **not** a Service (v3.1 §2, `DECISIONS_LOG.md` #92),
 * and *Vizualizare 3D* / *Vizualizare de arhitectură* are two intentionally distinct Services,
 * one per Pillar, not a duplication to be merged (#93).
 *
 * The key ↔ Pillar relationship is declared once, in `SERVICE_KEY_TO_PILLAR` below.
 */
export const SERVICE_KEYS = [
  // Arhitectura & Design
  'proiectare-arhitectura', // Proiectare de arhitectură
  'design-interior', // Design interior
  'vizualizare-3d', // Vizualizare 3D
  'design-mobilier', // Design mobilier
  // Reality Capture
  'scanare-laser-3d', // Scanare laser 3D
  'scan-to-bim', // Scan-to-BIM
  'fotografie-arhitectura', // Fotografie de arhitectură
  'vizualizare-arhitectura', // Vizualizare de arhitectură
] as const;
export type ServiceKey = (typeof SERVICE_KEYS)[number];

/**
 * Which Pillar each Service belongs to (v3.1 §2: "SERVICE belongs to one PILLAR").
 *
 * Declared here rather than derived from the Service document, because the requirement tables
 * in `requirements.ts` are static and must be checkable without a CMS round-trip. At Stage 8
 * the authored `Service.pillar` field remains the runtime authority for the picker constraint;
 * this table is what lets the static contract be tested against it.
 */
export const SERVICE_KEY_TO_PILLAR: Readonly<Record<ServiceKey, Pillar>> = {
  'proiectare-arhitectura': 'architecture-design',
  'design-interior': 'architecture-design',
  'vizualizare-3d': 'architecture-design',
  'design-mobilier': 'architecture-design',
  'scanare-laser-3d': 'reality-capture',
  'scan-to-bim': 'reality-capture',
  'fotografie-arhitectura': 'reality-capture',
  'vizualizare-arhitectura': 'reality-capture',
};

/**
 * Project Labels (v3.1 §10) — optional editorial flags, 0..N, **not mutually exclusive**.
 *
 * A Label is not a type and not a taxonomy layer: a project carrying `competition` still
 * declares its real Services. Labels never change which fields a project requires — they are
 * deliberately absent from every table in `requirements.ts`.
 */
export const PROJECT_LABELS = [
  'competition', // CONCURS
  'diploma-project', // PROIECT DE DIPLOMĂ
] as const;
export type ProjectLabel = (typeof PROJECT_LABELS)[number];

/**
 * Sector — v3.1 §11.1. **One global, closed vocabulary shared by both Pillars.**
 *
 * Two fields read it, with deliberately different cardinality (decided 2026-08-14):
 *   - **Project** `sector: Sector` — mandatory, exactly one. Where this piece of work *is*.
 *   - **Service** `sectors: readonly Sector[]` — optional, many. The sectors a Service is
 *     *typically relevant in*. It is NOT collapsed to a scalar; the two answer different
 *     questions and only share the vocabulary.
 *
 * Machine values are lowercase ASCII, hyphenated — the repository's slug convention
 * (`validation.ts` `SLUG_PATTERN`) applied to a vocabulary, and consistent with OD-8's rule
 * that Romanian is authored without diacritics. Authored RO labels are given as trailing
 * comments so the machine ↔ label relationship is readable here; the display strings themselves
 * are Workstream C's and live in `src/lib/i18n/vocabulary.ts`, not in this file.
 *
 * Sector classifies and filters. It never activates a project field — which is why it appears
 * in `PILLAR_BASE_REQUIREMENTS` as a mandatory base field and in no Service's table.
 */
export const SECTORS = [
  'rezidential', // Rezidențial
  'comercial-ospitalitate', // Comercial & ospitalitate
  'birouri-business', // Birouri & business
  'public-comunitar', // Public & comunitar
  'industrial-logistic', // Industrial & logistic
  'cultural-patrimoniu', // Cultural & patrimoniu
  'mixed-use-dezvoltari', // Mixed-use & dezvoltări
] as const;
export type Sector = (typeof SECTORS)[number];

/*
 * STAGE 7: `STATUSES_V31` / `StatusV31` are deleted. They were the Stage 1 placeholder that
 * held the v3.1 values while the old vocabulary was still in use; the values have now been
 * promoted into the canonical `STATUSES` above, so a second symbol would be a second source.
 */

/**
 * Pillar — capability family (v3.1 §2). **Authored, stored, mandatory, exactly one per
 * project** since Stage 5. It was derived from Discipline and never editable until then.
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

/* ────────────────────────────────────────────────────────────────────────────
 * Axis assignments — primary + optional secondary (CONTENT_MODEL.md §3, §7.3)
 * ──────────────────────────────────────────────────────────────────────────── */

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
 * Employer / Studio — REMOVED at migration Stage 2
 *
 * The `Employer` reference list and `EmployerGroup` existed for exactly one surface: the
 * Professional Experience curated view, defined as *Attribution = Studio, grouped by Employer*
 * (IA §5.1). That view is **permanently retired** by product decision — `CONTENT_MODEL.md`
 * v3.1 §13, `DECISIONS_LOG.md` #97 — and About / Despre is the surviving home for
 * professional-background content. There is no replacement grouping key and none is to be
 * designed, so the types are deleted rather than kept for a successor.
 *
 * Crediting itself is not affected: it is carried by `metadata.collaborators` and
 * `metadata.team` (v3.1 §13). `attribution`, `roles` and `authorship` were retired alongside
 * it at Stage 3.
 * ──────────────────────────────────────────────────────────────────────────── */

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
  /**
   * Instruments used on the project (v3.1 §7). **Project-level since Stage 8**, moved out of
   * `CaptureMetadata`: *Fotografie de arhitectură* requires Equipment and has no capture asset,
   * so tying the field to the survey group made a mandatory field unreachable.
   */
  readonly equipment: readonly string[];
  /** The firm that executed the furniture (v3.1 §5) — mandatory under *Design mobilier*. */
  readonly implementationCompany: string | null;
}

/**
 * Capture metadata (`CONTENT_MODEL.md`:54; §7.3). **Real data, never computed** (§10.4) —
 * these are technical claims made to institutional clients. Field names provisional
 * pending I-2 with Workstream D.
 */
export interface CaptureMetadata {
  /** Accuracy / specification statement, as authored (§10.4). */
  readonly accuracy: Localized<string> | null;
  /* STAGE 8: `equipment` moved to `WorkEntryMetadata`. It is a project fact, not a survey one —
     a photography project declares instruments and has no point cloud. */
  readonly software: readonly string[];
  /** Point count of the published derivative, from the real asset (§10.4). */
  readonly pointCount: number | null;
  readonly derivative: PointCloudDerivative | null;
}

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

  // ── Classification (locale-neutral axes — CONTENT_MODEL.md §2) ──
  /**
   * The capability this project belongs to — **authored, stored, mandatory, exactly one**
   * (v3.1 §2, Stage 5).
   *
   * It was derived from Discipline until Stage 5, could resolve into two pillars at once, and
   * carried a primary/secondary pair. None of that survives: a project belongs to one Pillar,
   * and work genuinely spanning both is modelled as **two linked projects** through
   * `relatedWork`. There is no `pillars`, no primary, no secondary and no fallback derivation.
   */
  readonly pillar: Pillar;
  /** Exactly one, mandatory (v3.1 §11.1). Single-valued since Stage 6. */
  readonly sector: Sector;
  /**
   * Optional editorial flags (v3.1 §10). **0..N and not mutually exclusive** — a project may
   * carry none, `competition`, `diploma-project`, or both. Labels never change which fields a
   * project requires, and they are global: they belong to no Pillar, Service or Sector.
   *
   * `competition` is the one piece of the retired Entry Type axis whose semantics survive: it
   * is what the Competitions curated view and the W-4 competition module key off, and the only
   * canonical source for "is this a competition".
   */
  readonly labels: readonly ProjectLabel[];

  // ── Relationships ──
  /**
   * The Service objects this entry *demonstrates* (`CONTENT_MODEL.md`:33, :46). Many-to-many,
   * referenced not copied; the entry stores the reference (IA Step 6). 0..n — an entry with
   * none simply hides W-5 (`WORK_ENTRY_PAGE_IA.md` W-5).
   */
  /**
   * The Services this project demonstrates (v3.1 §2). **Mandatory, 1..N, and every one must
   * belong to the project's own Pillar** since Stage 8 — the selection is what activates the
   * project's conditional fields (§5, §7), so an empty list is not a valid project.
   */
  readonly services: readonly ServiceSummary[];
  /** Work ⇄ Work, cross-pillar aware (IA §2.3; `WORK_ENTRY_PAGE_IA.md` W-6). */
  readonly relatedWork: readonly WorkEntrySummary[];

  // ── Evidence ──
  readonly description: Localized<RichText> | null;
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
  /** Authored, exactly one (v3.1 §2). */
  readonly pillar: Pillar;
  /** Exactly one, mandatory (v3.1 §11.1). */
  readonly sector: Sector;
  /** Optional editorial flags, 0..N (v3.1 §10). Carried so a card can mark a competition. */
  readonly labels: readonly ProjectLabel[];
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
 * `?pillar=&sector=&label=&service=&sort=`, and the summary carries no Service references.
 * *(It once carried Discipline for the A&D refinement and two more fields for the Professional
 * Experience curated view; both are retired — Stages 5 and 2.)*
 *
 * Rather than widen `WorkEntrySummary` — which every signposting surface consumes, and which
 * would then carry facets those surfaces have no use for — this composes it. The Work Preview
 * Card contract is untouched; the archive gets exactly the axes it filters and groups by.
 *
 * STAGE 2: `employer` is gone with the Professional Experience view it grouped.
 * STAGE 3: `attribution` is gone with the rest of the retired credit axes. Nothing replaced it —
 * IA Step 5 / F2 already forbade it as a visitor filter, and the one build-time consumer
 * (Professional Experience membership) was retired at Stage 2.
 */
export interface WorkArchiveItem extends WorkEntrySummary {
  /** The contextual refinement (§23.5) — matched by localized Service slug. */
  readonly services: readonly ServiceRef[];
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
  /**
   * A BOUNDED head of `WorkEntry.gallery` — at most three images, in the editor's authored
   * order. Added for the archive's repeated project unit, which shows a small contact sheet of
   * the entry's own media beside its cover.
   *
   * NOT a content-model change. `CONTENT_MODEL.md` §1 already gives every Work Entry a `cover`
   * and a `gallery`; the Studio schema, the field semantics and `WorkEntry.gallery` itself are
   * untouched. What changed is which of those existing fields the *archive projection* carries,
   * for the same reason `location` is here: a signposting surface renders it, and the
   * alternative was resolving a full `WorkEntry` per row to read three assets.
   *
   * Bounded at the query (see `WORK_ARCHIVE_ITEM_FIELDS.galleryPreview`), so an entry with forty
   * gallery images costs the archive three. Empty is a real and common state — an entry with no
   * gallery renders cover and information only, and nothing is substituted for the absence.
   */
  readonly galleryPreview: readonly ImageAsset[];
}

/**
 * The minimum a project needs to point at a Service in a filter or link (ADDED AT I-3).
 *
 * STAGE 8 adds `key` and `pillar`: the archive projection is what runtime validation reads to
 * resolve field requirements and to check Pillar consistency, and both must key off the stable
 * identity rather than the localized slug the filter matches on.
 */
export interface ServiceRef {
  readonly _id: string;
  readonly key: ServiceKey;
  readonly pillar: Pillar;
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
 * Its pillar is authored (Service → Pillar, IA §2.3), exactly as the project's is since
 * Stage 5 — which is what lets Stage 8 constrain the Services picker by the project's Pillar.
 */
export interface Service {
  readonly _id: string;
  readonly _type: 'service';

  /**
   * The stable, immutable machine identity (v3.1 §14.3) — **the only thing field activation
   * and validation may key off**. Name and slug are editor-owned and changeable; keying a
   * requirement to either would let a rename silently change what a project must carry.
   */
  readonly key: ServiceKey;

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
  /**
   * The sectors this Service is **typically relevant in** (S-2) — optional and genuinely
   * plural, and deliberately NOT the project's single `sector` (v3.1 §11.1, decided
   * 2026-08-14). Same closed vocabulary, different cardinality, different question.
   */
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
  /** Stable machine identity (v3.1 §14.3). Never derived from name or slug. */
  readonly key: ServiceKey;
  readonly name: Localized<string>;
  readonly slug: Localized<string>;
  readonly enPublished: boolean;
  readonly pillar: Pillar;
  readonly shortDescription: Localized<string> | null;
  readonly hero: ImageAsset | null;
  readonly curation: Curation;
}
