# Documentation Architecture — Proposal

**Status of this document:** PROPOSAL · planning phase · not yet adopted · 2026-07-30
**Author role:** Documentation Architect
**Scope:** Design the documentation *system* for the Atelier "diverse anumite" portfolio corpus ahead of implementation. This is an architectural planning exercise. **No existing document is modified by this proposal.** All changes described here are executed later, as a separate, governed migration (see `MIGRATION_PLAN.md`), recorded as amendment batches in `DECISIONS_LOG.md`.

Companion documents in this proposal set:
- `PROJECT_MANIFEST.md` — the proposed single entry point for every future chat/developer.
- `MIGRATION_PLAN.md` — the staged, governance-compliant execution plan.

---

## 1. Purpose & principles

The corpus grew organically and did so well: it is unusually disciplined about *reference-not-duplicate*, top-down layering, and single-responsibility documents. The job now is not to fix the content but to give the collection a **system** — lifecycle states, a metadata standard, one authoritative home per decision, a navigable folder structure, an explicit dependency graph, and a clear rule for which documents feed which implementation task.

Design principles for the system itself:

1. **One decision, one home.** Every cross-cutting decision (taxonomy, IA, navigation, visual language, component behaviour…) has exactly one authoritative document. Everything else references it.
2. **State is explicit.** Every document declares whether it is authoritative, reference, superseded, archived, draft, or a stub — so a reader never has to guess whether they are looking at the current truth.
3. **Governance is honoured.** The corpus already has an immutability policy (`DOCUMENTATION_RELEASE_v1.0.md`). The system extends it rather than bypassing it: changes are amendments, not silent rewrites.
4. **Provenance is preserved.** Superseded and historical documents are retained (never deleted) with a pointer to their successor. The "why" is as valuable as the "what."
5. **Optimised for implementation.** The structure exists to answer one operational question fast: *"I am about to build page X — exactly which documents do I read, and which must I ignore?"*

---

## 2. Executive findings

The five findings that most shape the architecture:

**F-A · The visual layer pivoted after the freeze, and nothing records it.** `VISUAL_DIRECTION_v2.0.md` ("measured reality" — preserves the designer's electric-blue / pixel-type / mascot / white-ground identity) explicitly *rejects* the "architectural publication" metaphor of `VISUAL_DIRECTION.md` and is written as the current authority. But (a) no `DECISIONS_LOG` batch records the change; (b) `DOCUMENTATION_RELEASE_v1.0.md` still lists the *old* `VISUAL_DIRECTION.md` as frozen; (c) `WIREFRAMING_GUIDELINES.md` and all six wireframes still cite the old visual direction and its "architectural publication" language. **Resolution (per owner decision): `VISUAL_DIRECTION_v2.0.md` is authoritative; `VISUAL_DIRECTION.md` is SUPERSEDED.**

**F-B · Two Homepage HiFi specs describe mutually-exclusive visual systems.** `HOMEPAGE_HIFI_DESIGN.md` (warm-beige, serif, clay accent, *no blue*) realises the superseded visual direction; `HOMEPAGE_HIFI_v2.md` (white ground, pixel type, electric blue, focus-traverse) realises v2.0 and self-labels as a "validation exercise, not a production implementation." **Resolution (per owner decision): `HOMEPAGE_HIFI_DESIGN.md` is SUPERSEDED; `HOMEPAGE_HIFI_v2.md` is a REFERENCE validation artifact; the production Homepage HiFi does not yet exist and is a planned deliverable.**

**F-C · The governance ledger stopped at the freeze.** `DECISIONS_LOG.md` ends at Batch 19 (the v1.0 freeze). Three documents were created *after* it (`VISUAL_DIRECTION_v2.0`, both HiFi docs) with no corresponding batch. The release record (`DOCUMENTATION_RELEASE_v1.0.md`) therefore no longer describes the true state of the corpus. The migration's first act is a governance catch-up (see `MIGRATION_PLAN.md`, Phase 1).

**F-D · The corpus is design-complete but implementation-empty.** There is not a single technical document: no stack/rendering decision, no design tokens, no CMS field mapping, no motion spec, no accessibility target committed as a doc, no SEO/i18n plan, no performance budget. The knowledge to write them is largely already scattered across `DISCOVERY_REVIEW.md` §5/§8, the HiFi accessibility sections, and `VISUAL_DIRECTION_v2.0.md` — but it has no authoritative home. This is the largest gap (see §11).

**F-E · The structure is flat; lifecycle is invisible.** 29 of 31 markdown docs sit in one `claude/` folder with no separation between foundations, frozen specs, incorporated reviews, and superseded artifacts. A newcomer cannot tell the load-bearing spec from the historical review by looking at the file list.

---

## 3. Document lifecycle states

Six states. Every document carries exactly one **Status**; frozen/living is a separate **Editability** attribute so we don't overload the word.

| State | Meaning | May a builder rely on it? | Editability |
|---|---|---|---|
| **AUTHORITATIVE** | The current source of truth for its domain. Implementation must conform to it. | **Yes — this is the contract.** | `FROZEN` (changes only via an amendment channel) **or** `LIVING` (designed to append, e.g. the decision log) |
| **REFERENCE** | Not itself a source of truth, but retained as useful context, an index, or a validation record. Read to understand; derive decisions only from the authoritative docs it points to. | For orientation only. | Usually LOCKED (point-in-time) |
| **SUPERSEDED** | Replaced by a newer authoritative document. Kept for history with a forward pointer. **Must not be used for implementation.** | **No.** | Frozen (historical) |
| **ARCHIVED / HISTORICAL** | A discovery-era or point-in-time artifact whose conclusions have been incorporated elsewhere. Retained for provenance. | **No** (its live conclusions live in the authoritative docs). | Frozen (historical) |
| **WORKING DRAFT** | In progress; not yet authoritative. Will become AUTHORITATIVE when reviewed/frozen. | Not yet — track it, don't build to it. | LIVING |
| **PLACEHOLDER / STUB** | An empty or skeletal file awaiting content. | No. | LIVING |

**Editability sub-states for AUTHORITATIVE docs:**
- `FROZEN` — immutable except via the four amendment channels defined in `DOCUMENTATION_RELEASE_v1.0.md` (corrections · genuine architectural discoveries · implementation feedback after design · usability testing).
- `LIVING` — expected to grow by append (the decision log, the manifest, future technical docs during their drafting).
- `LOCKED-PENDING-MIGRATION` — a transient marker used only during the migration window (a doc is authoritative and should not change *except* for the metadata-header and reference-path edits the migration itself performs).

---

## 4. Metadata standard (document header)

Every document begins with a metadata block. Proposed format (YAML front-matter, renders harmlessly as a fenced block in Markdown viewers that don't parse it):

```yaml
---
title:            Homepage Page IA
status:           AUTHORITATIVE          # AUTHORITATIVE | REFERENCE | SUPERSEDED | ARCHIVED | WORKING DRAFT | PLACEHOLDER
editability:      FROZEN                 # FROZEN | LIVING | LOCKED-PENDING-MIGRATION  (only when status = AUTHORITATIVE)
layer:            Page IA                # Foundation | Content Model | IA | Navigation | Review | Page IA | Design System | Wireframe | Visual | HiFi | Governance | Technical
owner:            <name / role>
purpose:          One sentence: what this document is the source of truth for (or, if not authoritative, what it is for).
depends_on:       [CONTENT_MODEL.md, INFORMATION_ARCHITECTURE.md, NAV_DECISION_RECORD.md]
consumed_by:      [HOMEPAGE_WIREFRAME.md, "Homepage implementation", Designer, Engineer]
supersedes:       —                      # doc this replaces, or —
superseded_by:    —                      # doc that replaces this, or —
last_major_revision: 2026-07-30
amendment_channel: [corrections, implementation-feedback]   # which of the 4 channels may change it (frozen docs only)
audience:         [Architect, Designer, Engineer]           # who consumes it: Architect | Designer | Engineer | Content | SEO | Owner
phase:            Design                 # Design | Implementation | Both
release:          Documentation v1.0     # the release this doc's frozen state belongs to
---
```

Field notes:
- **purpose** must name the *one thing* the document owns (its SSOT claim) or, for non-authoritative docs, why it is kept.
- **depends_on / consumed_by** are the machine-checkable edges of the dependency graph (§8). A migration lint can later verify no doc `depends_on` a `SUPERSEDED` document.
- **amendment_channel** makes the governance policy operational per-document rather than only corpus-wide.
- Keep the block short; it is a routing header, not a summary.

A one-page `METADATA_STANDARD.md` (created during migration Phase 2) will hold this template and the controlled vocabularies so authors don't reinvent them.

---

## 5. Full document classification

All 31 markdown documents plus the 2 source PDFs. "Target folder" refers to the structure proposed in §6. Status reflects the owner-approved resolution of F-A/F-B.

### Foundation & product

| Document | Purpose | Status | Editability | Audience | Target folder |
|---|---|---|---|---|---|
| `PROJECT_CONTEXT.md` | The project brief: what the site is, who it's for, constraints. | AUTHORITATIVE | FROZEN | All | `00-foundation/` |
| `README.md` | *Empty.* Intended orientation file. | PLACEHOLDER | LIVING | All | root → becomes short pointer to `PROJECT_MANIFEST.md` |
| `DISCOVERY_REVIEW.md` | Discovery-era questions, assumptions, and the round-2 confirmed decisions. Already self-marked "superseded in part." | ARCHIVED / HISTORICAL | Frozen | Architect | `00-foundation/` |
| `01_DRAFT…propunere…ATELIER….pdf` | Original client website proposal (RO), draft 1. Source input. | REFERENCE (source) | Locked | Owner, Architect | `sources/` |
| `02_DRAFT…propunere…ATELIER….pdf` | Original client website proposal (RO), draft 2. Source input. | REFERENCE (source) | Locked | Owner, Architect | `sources/` |

### Content model

| Document | Purpose | Status | Editability | Audience | Target folder |
|---|---|---|---|---|---|
| `CONTENT_MODEL.md` | **SSOT — domain model:** Work Entry & Service objects, taxonomy, curation layer. | AUTHORITATIVE | FROZEN (v2.1) | Architect, Engineer, Content | `02-content-model/` |
| `CONTENT_MODEL_VALIDATION.md` | 10 worked examples + stress test that validated the model. Terminology since corrected (F6). | REFERENCE | Locked | Architect, Content | `02-content-model/` |

### Information architecture & navigation

| Document | Purpose | Status | Editability | Audience | Target folder |
|---|---|---|---|---|---|
| `INFORMATION_ARCHITECTURE.md` | **SSOT — IA:** sitemap, URLs, page-type responsibilities, filters, services architecture (Steps 1–7 locked). | AUTHORITATIVE | FROZEN | Architect, Engineer, SEO | `03-information-architecture/` |
| `NAV_DECISION_RECORD.md` | **SSOT — navigation:** two-layer, task-first ADR. | AUTHORITATIVE | FROZEN | Architect, Designer, Engineer | `03-information-architecture/` |

### Reviews

| Document | Purpose | Status | Editability | Audience | Target folder |
|---|---|---|---|---|---|
| `ARCHITECTURE_REVIEW.md` | Independent IA sign-off; findings F1–F6. **All incorporated** (Batches 13–17). | ARCHIVED / HISTORICAL | Frozen | Architect | `reviews/` |
| `ARCHITECTURE_REVIEW_02.md` | UI-vs-IA review; findings C1/C2/M1–M5. **All incorporated** (Batch 18). | ARCHIVED / HISTORICAL | Frozen | Architect | `reviews/` |

### Page IA

| Document | Purpose | Status | Editability | Audience | Target folder |
|---|---|---|---|---|---|
| `PAGE_IA_INDEX.md` | Map tying the six Page IA blueprints together; journeys & responsibility boundaries. | REFERENCE (index) | Locked | All | `04-page-ia/` |
| `HOMEPAGE_PAGE_IA.md` | **SSOT — Homepage contract.** | AUTHORITATIVE | FROZEN | Designer, Engineer | `04-page-ia/` |
| `HUB_PAGE_IA.md` | **SSOT — Pillar Hub contract.** | AUTHORITATIVE | FROZEN | Designer, Engineer | `04-page-ia/` |
| `SERVICE_PAGE_IA.md` | **SSOT — Service page contract.** | AUTHORITATIVE | FROZEN | Designer, Engineer | `04-page-ia/` |
| `WORK_ARCHIVE_PAGE_IA.md` | **SSOT — Work Archive contract.** | AUTHORITATIVE | FROZEN | Designer, Engineer | `04-page-ia/` |
| `WORK_ENTRY_PAGE_IA.md` | **SSOT — Work Entry contract.** | AUTHORITATIVE | FROZEN | Designer, Engineer | `04-page-ia/` |
| `CONTACT_PAGE_IA.md` | **SSOT — Contact contract.** | AUTHORITATIVE | FROZEN | Designer, Engineer | `04-page-ia/` |

### Design system

| Document | Purpose | Status | Editability | Audience | Target folder |
|---|---|---|---|---|---|
| `WIREFRAME_PRINCIPLES.md` | **SSOT — design constitution:** rules translating architecture → layout. | AUTHORITATIVE | FROZEN | Designer | `05-design-system/` |
| `COMPONENT_INVENTORY.md` | **SSOT — component vocabulary:** ~35 components, responsibilities, where they appear. | AUTHORITATIVE | FROZEN | Designer, Engineer | `05-design-system/` |
| `WIREFRAMING_GUIDELINES.md` | **SSOT — wireframing process:** workflow, validation, narrative-density & visual-emphasis conventions. ⚠ contains stale references to the superseded visual direction ("architectural publication") — correction scheduled. | AUTHORITATIVE | FROZEN (correction pending) | Designer | `05-design-system/` |
| `VISUAL_DIRECTION.md` | Original visual vision ("architectural publication"). | **SUPERSEDED** by `VISUAL_DIRECTION_v2.0.md` | Frozen (historical) | Architect | `archive/_superseded/` |

### Wireframes

| Document | Purpose | Status | Editability | Audience | Target folder |
|---|---|---|---|---|---|
| `HOMEPAGE_WIREFRAME.md` | **SSOT — Homepage spatial composition.** ⚠ cites old `VISUAL_DIRECTION.md` — pointer correction pending. | AUTHORITATIVE | FROZEN (correction pending) | Designer, Engineer | `06-wireframes/` |
| `PILLAR_HUB_WIREFRAME.md` | **SSOT — Pillar Hub spatial composition.** ⚠ same pointer note. | AUTHORITATIVE | FROZEN (correction pending) | Designer, Engineer | `06-wireframes/` |
| `SERVICE_WIREFRAME.md` | **SSOT — Service spatial composition.** ⚠ same. | AUTHORITATIVE | FROZEN (correction pending) | Designer, Engineer | `06-wireframes/` |
| `WORK_ARCHIVE_WIREFRAME.md` | **SSOT — Work Archive spatial composition.** ⚠ same. | AUTHORITATIVE | FROZEN (correction pending) | Designer, Engineer | `06-wireframes/` |
| `WORK_ENTRY_WIREFRAME.md` | **SSOT — Work Entry spatial composition.** ⚠ same. | AUTHORITATIVE | FROZEN (correction pending) | Designer, Engineer | `06-wireframes/` |
| `CONTACT_WIREFRAME.md` | **SSOT — Contact spatial composition.** ⚠ same. | AUTHORITATIVE | FROZEN (correction pending) | Designer, Engineer | `06-wireframes/` |

### Visual & high-fidelity

| Document | Purpose | Status | Editability | Audience | Target folder |
|---|---|---|---|---|---|
| `VISUAL_DIRECTION_v2.0.md` | **SSOT — visual language:** "measured reality," blue-as-activation, focus hierarchy, motion, brand-preservation charter. | AUTHORITATIVE | FROZEN (to be formally frozen in Phase 1) | Designer, Engineer | `07-visual/` |
| `design/HOMEPAGE_HIFI_DESIGN.md` | Homepage HiFi built on the *old* visual direction (beige/serif/no-blue). | **SUPERSEDED** by the coming production HiFi; realises a superseded visual direction | Frozen (historical) | Architect | `archive/_superseded/` |
| `design/HOMEPAGE_HIFI_v2.md` | Homepage HiFi built on v2.0 as a *validation exercise* ("not a production implementation"). | REFERENCE (validation artifact) | Locked | Designer | `08-hifi/` |

### Governance & release

| Document | Purpose | Status | Editability | Audience | Target folder |
|---|---|---|---|---|---|
| `DECISIONS_LOG.md` | **SSOT — decision ledger** (Batches 1–19; append-only). | AUTHORITATIVE | LIVING | All | `governance/` |
| `DOCUMENTATION_RELEASE_v1.0.md` | Freeze & immutability record for the v1.0 corpus. Now needs a v1.1 addendum for the visual pivot. | AUTHORITATIVE (release record) | FROZEN (superseded-in-part by a coming v1.1) | Architect | `governance/` |

**Counts:** 15 AUTHORITATIVE (13 FROZEN + `DECISIONS_LOG` LIVING + `VISUAL_DIRECTION_v2.0`) · 4 REFERENCE · 2 SUPERSEDED · 3 ARCHIVED · 1 PLACEHOLDER · 2 REFERENCE(source PDFs). (Page IA index counted as REFERENCE; the six Page IA and six wireframes and three design-system docs make up the bulk of the FROZEN set.)

---

## 6. Proposed folder architecture

Path prefixes are ordered to mirror the abstraction chain top-to-bottom, so the folder list *is* the reading order. Numbers keep them sorted; names map onto the categories the brief suggested (Foundation · Product · UX · Design · Pages · Technical · Reviews · Archive).

```
/  (project root)
├── PROJECT_MANIFEST.md              ← entry point (AUTHORITATIVE · LIVING)
├── README.md                        ← 5-line orientation → "start at PROJECT_MANIFEST.md"
│
└── docs/
    ├── 00-foundation/               Why the project exists
    │   ├── PROJECT_CONTEXT.md
    │   └── DISCOVERY_REVIEW.md                 (ARCHIVED)
    │
    ├── 02-content-model/            What the content is
    │   ├── CONTENT_MODEL.md                    (FROZEN · SSOT)
    │   └── CONTENT_MODEL_VALIDATION.md         (REFERENCE)
    │
    ├── 03-information-architecture/ How the site is structured
    │   ├── INFORMATION_ARCHITECTURE.md         (FROZEN · SSOT)
    │   └── NAV_DECISION_RECORD.md              (FROZEN · SSOT)
    │
    ├── 04-page-ia/                  What each page is responsible for
    │   ├── PAGE_IA_INDEX.md                    (REFERENCE · index)
    │   ├── HOMEPAGE_PAGE_IA.md                 (FROZEN · SSOT)
    │   ├── HUB_PAGE_IA.md                      (FROZEN · SSOT)
    │   ├── SERVICE_PAGE_IA.md                  (FROZEN · SSOT)
    │   ├── WORK_ARCHIVE_PAGE_IA.md             (FROZEN · SSOT)
    │   ├── WORK_ENTRY_PAGE_IA.md               (FROZEN · SSOT)
    │   └── CONTACT_PAGE_IA.md                  (FROZEN · SSOT)
    │
    ├── 05-design-system/            How architecture becomes design
    │   ├── WIREFRAME_PRINCIPLES.md             (FROZEN · SSOT)
    │   ├── COMPONENT_INVENTORY.md              (FROZEN · SSOT)
    │   └── WIREFRAMING_GUIDELINES.md           (FROZEN · SSOT · correction pending)
    │
    ├── 06-wireframes/               Spatial composition per page
    │   ├── HOMEPAGE_WIREFRAME.md               (FROZEN · SSOT)
    │   ├── PILLAR_HUB_WIREFRAME.md             (FROZEN · SSOT)
    │   ├── SERVICE_WIREFRAME.md                (FROZEN · SSOT)
    │   ├── WORK_ARCHIVE_WIREFRAME.md           (FROZEN · SSOT)
    │   ├── WORK_ENTRY_WIREFRAME.md             (FROZEN · SSOT)
    │   └── CONTACT_WIREFRAME.md                (FROZEN · SSOT)
    │
    ├── 07-visual/                   How it looks & feels
    │   └── VISUAL_DIRECTION_v2.0.md            (AUTHORITATIVE · SSOT)
    │
    ├── 08-hifi/                     Pixel-level realisation
    │   ├── HOMEPAGE_HIFI_v2.md                 (REFERENCE · validation)
    │   └── (planned) HOMEPAGE_HIFI.md          (WORKING DRAFT → production)
    │       + HUB / SERVICE / ARCHIVE / WORK_ENTRY / CONTACT HiFi (planned)
    │
    ├── 09-technical/                How it gets built   ← NEW LAYER (all gaps)
    │   └── (planned) TECHNICAL_ARCHITECTURE.md, DESIGN_TOKENS.md,
    │       CONTENT_MODEL_IMPLEMENTATION.md, MOTION_GUIDELINES.md,
    │       ACCESSIBILITY_GUIDELINES.md, SEO_I18N_PLAN.md, PERFORMANCE_BUDGET.md
    │
    ├── reviews/                     Independent review records (provenance)
    │   ├── ARCHITECTURE_REVIEW.md              (ARCHIVED)
    │   └── ARCHITECTURE_REVIEW_02.md           (ARCHIVED)
    │
    ├── governance/                  Decisions, releases, doc standards
    │   ├── DECISIONS_LOG.md                    (LIVING · SSOT)
    │   ├── DOCUMENTATION_RELEASE_v1.0.md       (release record)
    │   ├── DOCUMENTATION_RELEASE_v1.1.md       (planned — records the visual pivot)
    │   ├── DOCUMENTATION_ARCHITECTURE.md       (this doc, once adopted)
    │   └── METADATA_STANDARD.md                (planned)
    │
    ├── archive/
    │   └── _superseded/             Replaced, kept for history
    │       ├── VISUAL_DIRECTION.md             (SUPERSEDED → v2.0)
    │       └── HOMEPAGE_HIFI_DESIGN.md         (SUPERSEDED)
    │
    └── sources/                     Original client inputs
        ├── 01_DRAFT…ATELIER….pdf
        └── 02_DRAFT…ATELIER….pdf
```

Notes:
- There is no `01-product/` folder: goals & positioning currently live in `PROJECT_CONTEXT.md` + `DECISIONS_LOG` Batches 1–2 and that is adequate; a dedicated `PRODUCT_BRIEF.md` is optional (see §11, low priority). The numbering leaves the slot open.
- `09-technical/` is created empty now as the home for the implementation-layer gap documents (§11), so they have a destination the moment they are drafted.
- In a Claude Project, "folders" are path prefixes. Moving a file = write-to-new-path + delete-old-path, which **breaks internal cross-references**; the migration handles this deliberately (see `MIGRATION_PLAN.md`, Phase 3–4). Filenames stay unchanged; only the prefix changes — this keeps the reference-update sweep mechanical.

---

## 7. Single Source of Truth map

Each decision domain resolves to exactly one authoritative document. Every other doc must *reference*, not restate.

| Decision domain | Authoritative home (SSOT) | Notes |
|---|---|---|
| Product vision, scope, constraints | `PROJECT_CONTEXT.md` | The brief. |
| Goals, audience, positioning | `DECISIONS_LOG.md` Batches 1–2 (+ `PROJECT_CONTEXT`) | No standalone doc; adequate. Optional future `PRODUCT_BRIEF.md`. |
| Domain / content model · taxonomy · curation | `CONTENT_MODEL.md` (v2.1) | Frozen. Validation is reference-only. |
| Information architecture · sitemap · URLs · filters | `INFORMATION_ARCHITECTURE.md` | Frozen (Steps 1–7). |
| Navigation model | `NAV_DECISION_RECORD.md` | Frozen ADR; concise mirror of IA Step 1. |
| Per-page responsibility & modules | the six `*_PAGE_IA.md` | `PAGE_IA_INDEX.md` maps them; owns nothing itself. |
| Component vocabulary & component behaviour | `COMPONENT_INVENTORY.md` | Closed set; new components need an amendment. |
| Architecture→layout translation rules | `WIREFRAME_PRINCIPLES.md` | Design constitution. |
| Wireframing process & conventions (narrative density, visual emphasis) | `WIREFRAMING_GUIDELINES.md` | Correction pending (visual-direction reference). |
| Spatial composition per page | the six `*_WIREFRAME.md` | Frozen. |
| **Visual language** (colour, type, motion, imagery, brand, hierarchy mechanism) | **`VISUAL_DIRECTION_v2.0.md`** | **Replaces `VISUAL_DIRECTION.md`.** |
| Homepage pixel realisation | **(GAP — production HiFi not yet created)** | `HOMEPAGE_HIFI_v2.md` is a reference validation artifact, not the SSOT. |
| Motion / animation spec | (GAP → `MOTION_GUIDELINES.md`) | Seeds: `VISUAL_DIRECTION_v2.0` §2.3, HiFi motion sections. |
| Design tokens | (GAP → `DESIGN_TOKENS.md`) | Derived from `VISUAL_DIRECTION_v2.0` + production HiFi. |
| CMS schema / field mapping · reserved slugs · i18n slugs | (GAP → `CONTENT_MODEL_IMPLEMENTATION.md`) | Maps the conceptual `CONTENT_MODEL` to a real CMS. |
| Tech stack · rendering · hosting | (GAP → `TECHNICAL_ARCHITECTURE.md`) | None exists. |
| Accessibility target & rules | (GAP → `ACCESSIBILITY_GUIDELINES.md`) | Seeds: `DISCOVERY_REVIEW` §8, HiFi a11y sections (WCAG 2.2 AA). |
| SEO & i18n plan | (GAP → `SEO_I18N_PLAN.md`) | Seeds: `DISCOVERY_REVIEW` §8, review F3. |
| Performance budget | (GAP → `PERFORMANCE_BUDGET.md`) | Seeds: `DISCOVERY_REVIEW` §8 (LCP/CLS/INP, point-cloud). |
| Decisions ledger | `DECISIONS_LOG.md` | Living, append-only, canonical. |
| Release / freeze state | `DOCUMENTATION_RELEASE_v1.x.md` | v1.0 exists; v1.1 needed for the visual pivot. |
| Documentation-system rules | `DOCUMENTATION_ARCHITECTURE.md` + `METADATA_STANDARD.md` | This proposal, once adopted. |

---

## 8. Dependency graph

The spine is a strict top-down chain; the visual and technical layers hang off it. An arrow means "derives from / must conform to."

```
                         PROJECT_CONTEXT  (brief)
                                │
                         DISCOVERY_REVIEW  (archived; facts extracted)
                                │
                         CONTENT_MODEL  (v2.1, frozen) ──── CONTENT_MODEL_VALIDATION (ref)
                                │
                     INFORMATION_ARCHITECTURE  ──── NAV_DECISION_RECORD
                                │
              ┌── ARCHITECTURE_REVIEW ──┐   (findings F1–F6 → DECISIONS_LOG 13–17)
              └── ARCHITECTURE_REVIEW_02 ┘  (findings C1/C2/M1–M5 → DECISIONS_LOG 18)
                                │
                   PAGE IA (6 blueprints) ──── PAGE_IA_INDEX (map)
                                │
     ┌──────────────── DESIGN SYSTEM ────────────────┐
     │  WIREFRAME_PRINCIPLES → COMPONENT_INVENTORY    │
     │            → WIREFRAMING_GUIDELINES            │
     └───────────────────────┬───────────────────────┘
                                │
                   WIREFRAMES (6, per page)
                                │
                   VISUAL_DIRECTION_v2.0   ⟵ SUPERSEDES ⟵ VISUAL_DIRECTION (archived)
                                │
        ┌───────────────────────┴───────────────────────┐
        │  HOMEPAGE_HIFI_v2 (reference validation)        │
        │  HOMEPAGE_HIFI_DESIGN (superseded — old visual) │
        └───────────────────────┬───────────────────────┘
                                │
                   PRODUCTION HiFi (planned) ──► DESIGN_TOKENS (planned)
                                │
                   TECHNICAL LAYER (planned):
                   TECHNICAL_ARCHITECTURE · CONTENT_MODEL_IMPLEMENTATION ·
                   MOTION · ACCESSIBILITY · SEO_I18N · PERFORMANCE
                                │
                          IMPLEMENTATION

   Cross-cutting, governs every layer:  DECISIONS_LOG  ·  DOCUMENTATION_RELEASE
```

Two integrity rules fall out of this graph and should be enforced during migration:
1. **No authoritative document may `depend_on` a SUPERSEDED document.** Today `WIREFRAMING_GUIDELINES` and the six wireframes violate this (they point at `VISUAL_DIRECTION.md`). The correction sweep (migration Phase 4) redirects them to `VISUAL_DIRECTION_v2.0.md`.
2. **A doc's `depends_on` must all be equal or higher in the chain.** No upward dependencies; this is what has kept the corpus non-circular and must be preserved.

---

## 9. Implementation inputs per build task

For each future build task: the documents to read (**Required**), to consult for rationale (**Optional**), and to **never** build from. This is the operational core of the whole system.

**Shared baseline — Required for *every* page** (the "always-on" set):
`CONTENT_MODEL.md` · `INFORMATION_ARCHITECTURE.md` · `NAV_DECISION_RECORD.md` · `WIREFRAME_PRINCIPLES.md` · `COMPONENT_INVENTORY.md` · `WIREFRAMING_GUIDELINES.md` · `VISUAL_DIRECTION_v2.0.md` · `DECISIONS_LOG.md` (open items) · plus, once created, `DESIGN_TOKENS.md`, `MOTION_GUIDELINES.md`, `ACCESSIBILITY_GUIDELINES.md`, `TECHNICAL_ARCHITECTURE.md`.

**Never build from (all pages):** `VISUAL_DIRECTION.md` (superseded) · `HOMEPAGE_HIFI_DESIGN.md` (superseded) · `DISCOVERY_REVIEW.md` (historical) · `CONTENT_MODEL_VALIDATION.md` (superseded terminology; reference only) · the two source PDFs (original proposal, pre-architecture).

| Build task | Page-specific Required | Optional (rationale) | Never |
|---|---|---|---|
| **Homepage** | `HOMEPAGE_PAGE_IA.md` · `HOMEPAGE_WIREFRAME.md` · *(production `HOMEPAGE_HIFI.md` once it exists)* | `HOMEPAGE_HIFI_v2.md` (visual-language reference for v2.0 intent) · `PAGE_IA_INDEX.md` · `ARCHITECTURE_REVIEW_02.md` (M4/M5 rationale) | baseline "never" set |
| **Pillar Hub** | `HUB_PAGE_IA.md` · `PILLAR_HUB_WIREFRAME.md` | `PAGE_IA_INDEX.md` · `INFORMATION_ARCHITECTURE.md` §2.3 F1 back-paths | baseline "never" set |
| **Service** | `SERVICE_PAGE_IA.md` · `SERVICE_WIREFRAME.md` | `INFORMATION_ARCHITECTURE.md` Step 6 (empty-state F5) · `CONTENT_MODEL.md` §2 (Service object) | baseline "never" set |
| **Work Archive** | `WORK_ARCHIVE_PAGE_IA.md` · `WORK_ARCHIVE_WIREFRAME.md` | `INFORMATION_ARCHITECTURE.md` Step 5 (filters) · `CONTENT_MODEL.md` §5 | baseline "never" set |
| **Work Entry** | `WORK_ENTRY_PAGE_IA.md` · `WORK_ENTRY_WIREFRAME.md` | `CONTENT_MODEL.md` §3 (axes, modular layout) · `CONTENT_MODEL_VALIDATION.md` (worked examples, *reference only*) · `ARCHITECTURE_REVIEW_02.md` M3 (modular template) | baseline "never" set |
| **Contact** | `CONTACT_PAGE_IA.md` · `CONTACT_WIREFRAME.md` | `INFORMATION_ARCHITECTURE.md` Step 7 (prefills) | baseline "never" set |
| **Shared components** | `COMPONENT_INVENTORY.md` · `WIREFRAME_PRINCIPLES.md` · *(`DESIGN_TOKENS.md`, `MOTION_GUIDELINES.md` once created)* | each `*_WIREFRAME.md` for usage context · `PAGE_IA_INDEX.md` | `VISUAL_DIRECTION.md`, `HOMEPAGE_HIFI_DESIGN.md` |
| **CMS / data layer** | `CONTENT_MODEL.md` · `INFORMATION_ARCHITECTURE.md` (§2.2 URLs, reserved slugs, i18n) · *(`CONTENT_MODEL_IMPLEMENTATION.md` once created)* | `CONTENT_MODEL_VALIDATION.md` (field coverage examples) | design-system & visual docs |
| **Global setup / tokens / tooling** | *(`TECHNICAL_ARCHITECTURE.md`, `DESIGN_TOKENS.md` once created)* · `VISUAL_DIRECTION_v2.0.md` | `DISCOVERY_REVIEW.md` §8 (perf/a11y/SEO seeds) | superseded visual docs |

---

## 10. Duplication, contradiction & obsolescence

**Contradictions to resolve (all trace to the unrecorded visual pivot):**

| # | Conflict | Resolution | Mechanism |
|---|---|---|---|
| C-1 | `VISUAL_DIRECTION.md` ("architectural publication") vs `VISUAL_DIRECTION_v2.0.md` ("measured reality") — opposite metaphors, palettes, type. | v2.0 authoritative; v1 SUPERSEDED. | Record supersession (amendment batch, channel 2/3); move v1 to `archive/_superseded/`. |
| C-2 | `HOMEPAGE_HIFI_DESIGN.md` (beige/serif/no-blue) vs `HOMEPAGE_HIFI_v2.md` (white/pixel/blue). | `HIFI_DESIGN` SUPERSEDED; `HIFI_v2` = REFERENCE validation; production HiFi = planned. | Same batch; move `HIFI_DESIGN` to superseded. |
| C-3 | `WIREFRAMING_GUIDELINES.md` §2 lists `VISUAL_DIRECTION.md` as an input and §7 invokes "architectural publication." | Redirect the reference to v2.0; neutralise the "publication" phrasing. | Correction (channel 1). |
| C-4 | All six wireframes list `VISUAL_DIRECTION.md` under "derived from." | Redirect pointers to `VISUAL_DIRECTION_v2.0.md`. The *Central Design Principle* they cite survives verbatim in v2.0, so no substantive change. | Correction (channel 1). |
| C-5 | `DOCUMENTATION_RELEASE_v1.0.md` freezes `VISUAL_DIRECTION.md` and omits v2.0 + HiFi docs. | Issue `DOCUMENTATION_RELEASE_v1.1.md` recording the pivot and the true corpus state. | New release record. |

**Duplication that is healthy (leave as-is):** recurring principles — Central Design Principle, co-equal pillars, understanding-before-persuasion, reference-not-duplicate — appear across many docs but always as *inheritance/citation*, never as re-decision. This is the corpus's strength, not a defect. No merges recommended.

**Obsolescence / already-incorporated (archive, don't delete):**

| Document | Its conclusions now live in | Recommendation |
|---|---|---|
| `ARCHITECTURE_REVIEW.md` (F1–F6) | `DECISIONS_LOG` Batches 13–17; IA §2.2/§2.3/Step 5/Step 6; `CONTENT_MODEL_VALIDATION` note | ARCHIVE (provenance). Do not convert — the decision log already is the converted form. |
| `ARCHITECTURE_REVIEW_02.md` (C1/C2/M1–M5) | `DECISIONS_LOG` Batch 18; Homepage Page IA; Work Entry modular template | ARCHIVE (provenance). |
| `CONTENT_MODEL_VALIDATION.md` | Frozen `CONTENT_MODEL` v2.1 (terminology corrected via F6) | Keep as REFERENCE (the 10 worked examples remain useful for CMS field coverage). |
| `DISCOVERY_REVIEW.md` | IA, Content Model, Nav (self-marked "superseded in part") | ARCHIVE. Mine §5/§8 for the technical-layer gap docs before/while archiving. |

**No documents recommended for deletion.** Everything is either authoritative, a live reference, or worth keeping for provenance.

---

## 11. Gap analysis — documents to create

Only gaps with long-term value are listed; each names the existing doc that already seeds it, so we *extend*, never duplicate. Grouped by priority for the implementation phase.

**Priority 1 — blocks implementation start:**
- **`TECHNICAL_ARCHITECTURE.md`** (`09-technical/`) — stack, rendering strategy (SSR/SSG — `DISCOVERY_REVIEW` §8 already argues SSR/SSG for SEO), hosting/CDN, build tooling, repo layout. *No seed doc; entirely new.*
- **`CONTENT_MODEL_IMPLEMENTATION.md`** (`09-technical/`) — maps the conceptual `CONTENT_MODEL` to concrete CMS collections/fields; encodes the reserved-slug rule (F4) and i18n slug strategy (IA §2.2). *Seed: `CONTENT_MODEL.md`, `CONTENT_MODEL_VALIDATION.md`, IA §2.2.*
- **Production `HOMEPAGE_HIFI.md`** (`08-hifi/`) — the real homepage design built from `VISUAL_DIRECTION_v2.0` + `HOMEPAGE_WIREFRAME` + `HOMEPAGE_PAGE_IA`, using `HOMEPAGE_HIFI_v2` as a validated reference. Then the same for Hub, Service, Archive, Work Entry, Contact. *This is the corpus's own declared "next phase," now correctly anchored to v2.0.*
- **`DESIGN_TOKENS.md`** (`09-technical/`) — colour/type/space/motion tokens derived once the production HiFi exists. *Seed: `VISUAL_DIRECTION_v2.0` operating system (§2), production HiFi.*

**Priority 2 — needed during implementation:**
- **`ACCESSIBILITY_GUIDELINES.md`** — commit WCAG 2.2 AA, reduced-motion, focus, contrast, keyboard operability as a single authoritative doc. *Seed: `DISCOVERY_REVIEW` §8, both HiFi accessibility sections.*
- **`MOTION_GUIDELINES.md`** — consolidate the motion rules (instrument-grade, reduced-motion, none load-bearing). *Seed: `VISUAL_DIRECTION_v2.0` §2.3, HiFi motion sections.*
- **`SEO_I18N_PLAN.md`** — hreflang/x-default, canonical policy, structured data, bilingual scanning keywords, and the F3 long-tail routes decision. *Seed: `DISCOVERY_REVIEW` §8, `ARCHITECTURE_REVIEW` F3, IA §2.2.*
- **`PERFORMANCE_BUDGET.md`** — LCP/CLS/INP targets, image pipeline (AVIF/WebP), point-cloud fidelity decision. *Seed: `DISCOVERY_REVIEW` §8.*

**Priority 3 — supporting / optional:**
- **`METADATA_STANDARD.md`** (`governance/`) — the header template + controlled vocabularies (created in migration Phase 2 regardless).
- **`COMPONENT_API.md`** — per-component props/states once tokens exist (extends `COMPONENT_INVENTORY`, does not replace it).
- **`PRODUCT_BRIEF.md`** (`01-product/`) — optional consolidation of goals/positioning; low priority (currently adequate via context + decision log).
- **`CONTENT_INVENTORY.md`** — real copy/asset readiness tracker (`DISCOVERY_REVIEW` §5 already lists the content dependencies).

**Deliberately *not* recommended:** per-doc changelogs (the decision log covers this), a glossary (the docs define terms inline), or duplicating IA/nav content into a "developer summary" (the manifest serves that role). Avoid documentation for its own sake.

---

## 12. Implementation freeze set

What must be frozen — and stay frozen — before a line of production code is written. Implementation adapts to these; they change only through the four amendment channels.

**Already frozen (Documentation v1.0):** `PROJECT_CONTEXT` · `CONTENT_MODEL` · `INFORMATION_ARCHITECTURE` · `NAV_DECISION_RECORD` · the six `*_PAGE_IA` + `PAGE_IA_INDEX` · `WIREFRAME_PRINCIPLES` · `COMPONENT_INVENTORY` · `WIREFRAMING_GUIDELINES` · the six `*_WIREFRAME`.

**To be frozen in Phase 1 (currently authoritative but never formally frozen):**
- **`VISUAL_DIRECTION_v2.0.md`** — freeze as the visual SSOT under a new `Documentation v1.1` release. This is the single most important addition to the freeze set; today it is load-bearing but ungoverned.

**Frozen per-page, just-in-time, as each is produced:**
- Each **production HiFi** page — frozen before that page is built; its wireframe + Page IA are already frozen upstream.
- **`DESIGN_TOKENS.md`** — frozen once the production HiFi set stabilises.

**Never frozen (intentionally living):** `DECISIONS_LOG.md`, `PROJECT_MANIFEST.md`, and the technical-layer docs while they are being drafted (they freeze per release as they mature).

**Explicitly *not* in the freeze set (must not gate build):** the superseded and archived docs, `HOMEPAGE_HIFI_v2` (reference only), and the source PDFs.

---

## 13. What happens next

This document is a proposal. Nothing in the corpus has changed. On approval, `MIGRATION_PLAN.md` executes the structure above in reviewable phases, each recorded as a `DECISIONS_LOG` amendment batch, and `PROJECT_MANIFEST.md` becomes the corpus's entry point. Until then, the two most consequential live facts a reader needs are already captured here: **`VISUAL_DIRECTION_v2.0` is the visual authority**, and **the production HiFi does not yet exist.**
