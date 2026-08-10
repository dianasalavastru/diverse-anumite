# Repository Structure — Production Layout Proposal

**Status:** PROPOSAL · planning only · no files moved or edited · 2026-07-30 · **rev 2**
**Purpose:** define the folder structure the repository should have before implementation begins, and map every existing document to it.
**Scope:** reorganization only. No document is merged, split, removed, rewritten, or re-owned. Only *location* changes.
**Relationship to prior work:** this **supersedes the folder scheme in `proposal/DOCUMENTATION_ARCHITECTURE.md` §6** (numbered `docs/NN-…/` folders) — flatter, de-numbered, fewer folders. Execution mechanics (atomic migration window, reference repair, stable IDs, migration lock) remain as defined in `proposal/MIGRATION_PLAN.md`.

**rev 2 — owner feedback incorporated:**
1. **`design-system/` → `design/`.** There is no design system yet (no tokens, typography/spacing scales, primitives, accessibility, interaction specs) — only design *methodology & vocabulary* (component inventory, wireframing, principles). `design/` names what actually exists; "design system" over-promised.
2. **HiFi is a *design* artifact, not an implementation artifact.** Production HiFi lives in `docs/visual/` beside the visual direction. `implementation/` is reserved for build docs. Rationale: *HiFi is what you implement, not the output of implementation.* Side effect: the `implementation/homepage/` sub-level is removed, flattening the tree further.

---

## 1. Proposed repository tree

Three tiers a reader can hold in their head: **Architecture** (the *what*), **Design** (the *how it looks / lays out*), **Implementation** (the *how it's built*). Everything else is meta. Single-level folders; the only nesting is `archive/`.

```
repo-root/
├── README.md                         ← 3-line pointer → START_HERE.md
├── START_HERE.md                     ← the front page (read this first)
│
└── docs/
    │  ── ARCHITECTURE (authoritative — the "what & where") ──
    ├── foundation/
    │   └── PROJECT_CONTEXT.md
    ├── architecture/
    │   ├── CONTENT_MODEL.md
    │   ├── CONTENT_MODEL_VALIDATION.md      (reference — beside the model it validates)
    │   ├── INFORMATION_ARCHITECTURE.md
    │   └── NAV_DECISION_RECORD.md
    ├── pages/                                (per-page contracts — Page IA)
    │   ├── PAGE_IA_INDEX.md
    │   ├── HOMEPAGE_PAGE_IA.md
    │   ├── HUB_PAGE_IA.md
    │   ├── SERVICE_PAGE_IA.md
    │   ├── WORK_ARCHIVE_PAGE_IA.md
    │   ├── WORK_ENTRY_PAGE_IA.md
    │   └── CONTACT_PAGE_IA.md
    │
    │  ── DESIGN (methodology, layout & look) ──
    ├── design/                               (design methodology & vocabulary — NOT a design system yet)
    │   ├── WIREFRAME_PRINCIPLES.md
    │   ├── COMPONENT_INVENTORY.md
    │   └── WIREFRAMING_GUIDELINES.md
    ├── wireframes/                           (spatial composition — per page)
    │   ├── HOMEPAGE_WIREFRAME.md
    │   ├── PILLAR_HUB_WIREFRAME.md
    │   ├── SERVICE_WIREFRAME.md
    │   ├── WORK_ARCHIVE_WIREFRAME.md
    │   ├── WORK_ENTRY_WIREFRAME.md
    │   └── CONTACT_WIREFRAME.md
    ├── visual/                               (visual language + high-fidelity design)
    │   ├── VISUAL_DIRECTION_v2.0.md          (authoritative visual language)
    │   ├── HOMEPAGE_HIFI_v2.md               (reference — validation of v2.0)
    │   │   (planned — production HiFi, design artifacts, one per page:)
    │   ├── HOMEPAGE_HIFI.md
    │   ├── HUB_HIFI.md
    │   ├── SERVICE_HIFI.md
    │   └── …
    │
    │  ── IMPLEMENTATION (the build — created during implementation) ──
    ├── implementation/                       ⏳ empty today; the home for all build docs
    │   │   (planned, not created by this migration:)
    │   ├── TECHNICAL_ARCHITECTURE.md
    │   ├── CMS_MAPPING.md
    │   ├── COMPONENT_MAPPING.md              (component → code)
    │   ├── DESIGN_TOKENS.md                  (code-facing extraction of the visual language)
    │   ├── IMPLEMENTATION_NOTES.md
    │   ├── TESTING.md
    │   └── DEPLOYMENT.md
    │
    │  ── META (how the docs are run; provenance) ──
    ├── governance/
    │   ├── DECISIONS_LOG.md
    │   └── DOCUMENTATION_RELEASE_v1.0.md
    ├── proposal/                             (planning & reviews)
    │   ├── DOCUMENTATION_ARCHITECTURE.md
    │   ├── PROJECT_MANIFEST.md
    │   ├── MIGRATION_PLAN.md
    │   ├── REPOSITORY_STRUCTURE.md           (this document)
    │   ├── DOCUMENTATION_READINESS_REVIEW.md
    │   └── WRITING_QUALITY_REVIEW.md
    ├── archive/                              ⛔ never build from
    │   ├── historical/
    │   │   ├── DISCOVERY_REVIEW.md
    │   │   ├── ARCHITECTURE_REVIEW.md
    │   │   └── ARCHITECTURE_REVIEW_02.md
    │   └── superseded/
    │       ├── VISUAL_DIRECTION.md
    │       └── HOMEPAGE_HIFI_DESIGN.md
    └── sources/
        ├── 01_DRAFT…ATELIER….pdf
        └── 02_DRAFT…ATELIER….pdf
```

**Why these folders and no more.** Eleven purpose-named folders, one level deep. `reference/` was folded into `architecture/` (one file didn't justify a folder). `foundation/` is kept as a standard, will-grow home for the brief. **`design/`** holds design methodology and vocabulary — deliberately *not* named "design-system," because no system (tokens, scales, primitives, a11y, interaction specs) exists yet; when those arrive, the code-facing ones live in `implementation/` (tokens) and the folder can be reconsidered honestly. **`visual/`** holds the visual language and every HiFi — HiFi is a *design* artifact (what you implement), so it sits in the design tier, not in `implementation/`. **`implementation/`** exists empty *on purpose* — an empty, obviously-named folder is the clearest possible signal of where build docs go and that they don't exist yet.

**Boundary that keeps the two tiers honest:** `visual/` owns *design intent* (visual language + HiFi); `implementation/` owns *code-facing translation* — `DESIGN_TOKENS.md` (the tokens extracted from the HiFi) and `COMPONENT_MAPPING.md` (inventory components → framework code). The HiFi says what to build; tokens and mapping say how it is built.

---

## 2. Migration table

Every existing document, exactly once. "Read directly?" = should a builder open it as a source of truth (vs. look-up reference vs. don't-open). "In START_HERE?" = does the front page point to it.

| Document (current path) | → New location | Status | Read directly? | In START_HERE? | Reason for placement |
|---|---|---|---|---|---|
| `PROJECT_CONTEXT.md` | `docs/foundation/` | Authoritative | Yes | Yes | The brief; the foundation everything derives from. |
| `README.md` | `repo-root/` (rewritten as pointer) | Front-matter | No | — | Convention: root README points into the docs. |
| `claude/START_HERE.md` | `repo-root/START_HERE.md` | Front page | **First** | (is itself) | Maximum visibility; the single entry point. |
| `claude/CONTENT_MODEL.md` | `docs/architecture/` | Authoritative | Yes | Yes | Core content/taxonomy contract. |
| `claude/CONTENT_MODEL_VALIDATION.md` | `docs/architecture/` | Reference | Look-up | Yes (ref) | Validates the model; belongs beside it, marked reference. |
| `claude/INFORMATION_ARCHITECTURE.md` | `docs/architecture/` | Authoritative | Yes | Yes | Sitemap, URLs, page responsibilities. |
| `claude/NAV_DECISION_RECORD.md` | `docs/architecture/` | Authoritative | Yes | Yes | Navigation model. |
| `claude/PAGE_IA_INDEX.md` | `docs/pages/` | Reference (index) | Yes | Yes | The map of the six page contracts. |
| `claude/HOMEPAGE_PAGE_IA.md` | `docs/pages/` | Authoritative | Yes | Yes | Homepage contract. |
| `claude/HUB_PAGE_IA.md` | `docs/pages/` | Authoritative | Yes | Yes | Pillar Hub contract. |
| `claude/SERVICE_PAGE_IA.md` | `docs/pages/` | Authoritative | Yes | Yes | Service contract. |
| `claude/WORK_ARCHIVE_PAGE_IA.md` | `docs/pages/` | Authoritative | Yes | Yes | Work Archive contract. |
| `claude/WORK_ENTRY_PAGE_IA.md` | `docs/pages/` | Authoritative | Yes | Yes | Work Entry contract. |
| `claude/CONTACT_PAGE_IA.md` | `docs/pages/` | Authoritative | Yes | Yes | Contact contract. |
| `claude/WIREFRAME_PRINCIPLES.md` | **`docs/design/`** | Authoritative | Yes | Yes | Rules for turning architecture into layout (design methodology). |
| `claude/COMPONENT_INVENTORY.md` | **`docs/design/`** | Authoritative | Look-up | Yes | The closed component vocabulary (design vocabulary). |
| `claude/WIREFRAMING_GUIDELINES.md` | **`docs/design/`** | Authoritative | Yes | Yes | Wireframing process (design methodology). |
| `claude/HOMEPAGE_WIREFRAME.md` | `docs/wireframes/` | Authoritative | Yes | Yes | Homepage spatial composition. |
| `claude/PILLAR_HUB_WIREFRAME.md` | `docs/wireframes/` | Authoritative | Yes | Yes | Hub spatial composition. |
| `claude/SERVICE_WIREFRAME.md` | `docs/wireframes/` | Authoritative | Yes | Yes | Service spatial composition. |
| `claude/WORK_ARCHIVE_WIREFRAME.md` | `docs/wireframes/` | Authoritative | Yes | Yes | Archive spatial composition. |
| `claude/WORK_ENTRY_WIREFRAME.md` | `docs/wireframes/` | Authoritative | Yes | Yes | Work Entry spatial composition. |
| `claude/CONTACT_WIREFRAME.md` | `docs/wireframes/` | Authoritative | Yes | Yes | Contact spatial composition. |
| `claude/VISUAL_DIRECTION_v2.0.md` | `docs/visual/` | Authoritative | Yes | Yes | The current visual language. |
| `claude/design/HOMEPAGE_HIFI_v2.md` | `docs/visual/` | Reference | Look-up | Yes (ref) | Validation of v2.0; a design artifact, not the production spec. |
| `claude/DECISIONS_LOG.md` | `docs/governance/` | Authoritative (living) | Look-up | Yes | The decision ledger. |
| `claude/DOCUMENTATION_RELEASE_v1.0.md` | `docs/governance/` | Governance | Look-up | Yes (gov) | The freeze record. |
| `claude/DISCOVERY_REVIEW.md` | `docs/archive/historical/` | Historical | No | Yes (as archive) | Discovery-era; conclusions already incorporated. |
| `claude/ARCHITECTURE_REVIEW.md` | `docs/archive/historical/` | Historical | No | Yes (as archive) | Findings incorporated into the decision log. |
| `claude/ARCHITECTURE_REVIEW_02.md` | `docs/archive/historical/` | Historical | No | Yes (as archive) | Findings incorporated into the decision log. |
| `claude/VISUAL_DIRECTION.md` | `docs/archive/superseded/` | ⛔ Superseded | No | Yes (as "don't use") | Replaced by `VISUAL_DIRECTION_v2.0.md`. |
| `claude/design/HOMEPAGE_HIFI_DESIGN.md` | `docs/archive/superseded/` | ⛔ Superseded | No | Yes (as "don't use") | Realises the superseded visual direction. |
| `01_DRAFT…ATELIER….pdf` | `docs/sources/` | Source | No | Optional | Original client proposal. |
| `02_DRAFT…ATELIER….pdf` | `docs/sources/` | Source | No | Optional | Original client proposal. |
| `claude/proposal/DOCUMENTATION_ARCHITECTURE.md` | `docs/proposal/` | Planning | Look-up | Yes (footer) | Doc-system design. |
| `claude/proposal/PROJECT_MANIFEST.md` | `docs/proposal/` | Planning | Look-up | Yes (footer) | Machine-oriented corpus index. |
| `claude/proposal/MIGRATION_PLAN.md` | `docs/proposal/` | Planning | Look-up | Yes (footer) | Migration execution mechanics. |
| `claude/proposal/DOCUMENTATION_READINESS_REVIEW.md` | `docs/proposal/` | Planning | No | Optional | Independent review. |
| `claude/proposal/WRITING_QUALITY_REVIEW.md` | `docs/proposal/` | Planning | No | Optional | Independent review. |
| `claude/proposal/REPOSITORY_STRUCTURE.md` (this) | `docs/proposal/` | Planning | Look-up | Optional | This proposal. |

**Future documents — pre-assigned homes (no folder needs inventing later):**
- **Design tier → `docs/visual/`:** production HiFi per page (`HOMEPAGE_HIFI.md`, `HUB_HIFI.md`, …).
- **Implementation tier → `docs/implementation/`:** `TECHNICAL_ARCHITECTURE.md`, `CMS_MAPPING.md`, `COMPONENT_MAPPING.md`, `DESIGN_TOKENS.md`, `IMPLEMENTATION_NOTES.md`, `TESTING.md`, `DEPLOYMENT.md`.

---

## 3. Files that require path updates

Cross-references in this corpus are almost all **bare filenames** (e.g. `CONTENT_MODEL.md`, "Derived from: `VISUAL_DIRECTION.md`") rather than relative links. As plain text they don't hard-break when files move, but they become ambiguous, and any conversion to clickable links would break. All of the following must be swept during the reference-repair step (see `MIGRATION_PLAN.md`):

**A · Documents that enumerate other documents (highest reference density):**
- `START_HERE.md` — references nearly every document; its map, reading order, and "where do I" tables all assume flat paths. **Largest single update.**
- `DOCUMENTATION_RELEASE_v1.0.md` — its "frozen corpus manifest" lists paths like `claude/HOMEPAGE_PAGE_IA.md`; all become `docs/…`.
- `PAGE_IA_INDEX.md` — lists all six Page IA docs by name.
- `proposal/PROJECT_MANIFEST.md` and `proposal/DOCUMENTATION_ARCHITECTURE.md` — both contain full current-path indexes.

**B · Each Page IA** — the "Authoritative inputs" list names `CONTENT_MODEL.md`, `INFORMATION_ARCHITECTURE.md`, `NAV_DECISION_RECORD.md`, sibling Page IA docs, and the reviews (now under `archive/historical/`).

**C · Each wireframe (all six)** — the "Derived from" list names its Page IA, `COMPONENT_INVENTORY.md` (now `docs/design/`), `WIREFRAMING_GUIDELINES.md` (now `docs/design/`), `CONTENT_MODEL.md`, and — the pre-existing defect — `VISUAL_DIRECTION.md` (now `archive/superseded/`).

**D · `WIREFRAMING_GUIDELINES.md` §2** — input list names `VISUAL_DIRECTION.md` (superseded + moving) and sibling design docs.

**E · `DECISIONS_LOG.md`** — references many docs by name across its batches.

**Two categories of update, kept distinct:**
1. **Pure path updates** (documentation-governance): every reference above repointed to its new folder path. Mechanical.
2. **Superseded-target references** (a *separate*, pre-existing correction, already tracked): the wireframes + guidelines pointing at `VISUAL_DIRECTION.md` should point at `VISUAL_DIRECTION_v2.0.md`. **This migration does not fix that** — it only moves the file; the pointer correction is the governed semantic fix in `MIGRATION_PLAN.md` Phase 4. Moving `VISUAL_DIRECTION.md` into `archive/superseded/` makes the staleness *more* visible, which is desirable, not a regression.

---

## 4. START_HERE changes required

`START_HERE.md` moves to the repo root and needs these edits (content unchanged, paths and labels updated):

- **Path in every reference** — §3 reading order, §4 documentation map, §5 "where do I," §9 quick start: update bare filenames to folder paths (`HOMEPAGE_PAGE_IA.md` → `docs/pages/HOMEPAGE_PAGE_IA.md`, etc.).
- **§4 map groups** — re-label to match the folders exactly: **Design system → "Design" (`docs/design/`)**; keep Wireframes (`docs/wireframes/`) and Visual (`docs/visual/`) as their own groups; put HiFi under **Visual**, not a separate High-fidelity/Implementation group.
- **§8 mental-model diagram** — annotate each layer with its folder; place HiFi on the visual layer, and `DESIGN_TOKENS` on the implementation layer.
- **§9 quick start** — point future **HiFi → `docs/visual/`** and **tokens → `docs/implementation/`**; point the "ignore" items at `docs/archive/superseded/`.
- **Add one line** near the top: "Repository layout: `docs/` — Architecture (`foundation`, `architecture`, `pages`), Design (`design`, `wireframes`, `visual`), Implementation (`implementation/`, currently empty)."
- **Footer** — update the `proposal/…` references to `docs/proposal/…`.

The status board (§2), principles (§7), and glossary (§10) are path-independent (the glossary's "HiFi" entry can add "a design artifact — lives in `docs/visual/`").

---

## 5. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Cross-references go stale** (bare filenames become ambiguous; any links break) | Certain | Medium | Reference sweep in one pass (`MIGRATION_PLAN.md`); stable `document_id`s so future moves don't re-break. |
| **The four "map" docs mislead** (START_HERE, manifest, release record, index describe old paths) | Certain if unupdated | High | These are the *first* files updated in the sweep; a map that lies is worse than no map. |
| **Partial move state** (in a Project, move = write-new + delete-old) | Medium | High | Atomic migration window: copy → validate → cut over → delete; never delete before validation (`MIGRATION_PLAN.md`). |
| **Superseded files moved but still cited** by wireframes/guidelines | Certain | Low-Medium | Expected and *desirable* (staleness becomes visible); pointer fix is the separate governed correction, already scheduled. |
| **`design/` vs `visual/` boundary blurs** as HiFi + tokens arrive | Low | Low | Rule of thumb: *design intent* (visual language, HiFi) → `visual/`; *code-facing translation* (tokens, component mapping) → `implementation/`. |
| **Over-nesting creep** | Low | Low | Rule: max two levels under `docs/` (only `archive/` nests). The rev-2 change removed the `implementation/homepage/` level. |
| **`implementation/` sits empty and looks "broken"** | Low | Low | A one-line `implementation/README.md`: "build docs land here; none yet." |

Nothing here risks an architectural decision — every risk is about references and move mechanics, not content.

---

## 6. Final recommendation

Adopt this structure. It is superior to today's layout for four concrete, five-year reasons:

**It names things honestly.** `design/` (not "design-system") reflects what exists — methodology and vocabulary — and avoids implying tokens/primitives that don't. And HiFi sits in `visual/`, with the design work, because it *is* design: it's what you implement, not the output of implementation. `implementation/` is reserved for the code-facing docs (technical architecture, CMS and component mapping, tokens, notes, testing, deployment), so the Design ↔ Implementation boundary is real rather than cosmetic.

**It makes the three phases obvious.** Today ~30 files sit in one flat `claude/` folder with historical reviews, superseded drafts, and frozen contracts intermixed. The proposed tree separates **Architecture** (`foundation`, `architecture`, `pages`), **Design** (`design`, `wireframes`, `visual`), and **Implementation** (`implementation/`) at a glance, and quarantines `archive/` so nobody builds from a superseded file by accident.

**It answers the 30-second test.** "Homepage documentation?" → `docs/pages/HOMEPAGE_PAGE_IA.md`, `docs/wireframes/HOMEPAGE_WIREFRAME.md`, and (when built) `docs/visual/HOMEPAGE_HIFI.md`. "Where do build docs go?" → `docs/implementation/`, which exists and is empty *precisely so the answer is unambiguous*.

**It is built for the documents that come next, and it stays shallow.** Every named future doc has a pre-existing home — production HiFi → `visual/`; `TECHNICAL_ARCHITECTURE`, `CMS_MAPPING`, `COMPONENT_MAPPING`, `DESIGN_TOKENS`, `IMPLEMENTATION_NOTES`, `TESTING`, `DEPLOYMENT` → `implementation/`. One level of purpose-named folders, no numeric prefixes, no per-page nesting, one file per home. It reads like a normal engineering repo, so developers, designers, and AI agents navigate it by convention — which is exactly what a repository maintained for five years needs.

The migration is mechanical, reversible, and changes no decision — only where each already-correct document lives. Execution follows the atomic, governed process in `proposal/MIGRATION_PLAN.md`; this document is the map it moves toward.
