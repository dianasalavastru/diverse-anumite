# PROJECT MANIFEST — Atelier "diverse anumite" Portfolio

> **Read this first.** This is the entry point to the entire project. A new developer, designer, or AI assistant should be able to understand the whole project — what it is, what's decided, what's authoritative, what to build from, and what to ignore — by reading this document before opening any other file.

**Status:** PROPOSED entry point · planning phase · 2026-07-30
**Editability:** LIVING (updated whenever the corpus changes)
**Note on paths:** folder reorganisation has **not** happened yet. Documents still live at their current paths (mostly `claude/…`). The *target* path is shown alongside so this manifest already reflects the approved architecture. Until the migration runs (`claude/proposal/MIGRATION_PLAN.md`), read from the current paths; the **statuses and authority below are in effect immediately** as the reading guide.

---

## 1. Project overview

A premium, bilingual (RO root + EN) portfolio and client-acquisition website for an independent architect & designer working under the name **"diverse anumite."** It is not e-commerce and has no user accounts.

The practice has **two co-equal pillars under one brand:**
- **Architecture & Design** — architecture, interior design, competitions, personal projects, visualization.
- **Reality Capture** — 3D laser scanning, point-cloud documentation, drone photogrammetry (a deliberate, EU-funded business expansion).

Two co-equal goals: present a high-quality **portfolio** *and* **generate client inquiries.** The owner must be able to add/edit projects without touching code. Full context: `PROJECT_CONTEXT.md`.

**Where the project is now:** the design-architecture corpus is complete and frozen as *Documentation v1.0*. The visual language has since evolved to *"measured reality"* (`VISUAL_DIRECTION_v2.0`), which is the current visual authority. The next phase is **high-fidelity design → implementation**. The production high-fidelity design has **not yet been created**.

---

## 2. How to read this project (the 12-layer chain)

The corpus is a strict top-down chain — each layer is a stable contract for the one below. Read in this order:

```
Foundation → Content Model → Information Architecture → (Reviews) →
Page IA → Design System → Wireframes → Visual Direction → HiFi → Technical → Implementation
        …all governed by the Decision Log + Release records.
```

If you only have time for the load-bearing spine: `PROJECT_CONTEXT` → `CONTENT_MODEL` → `INFORMATION_ARCHITECTURE` → `NAV_DECISION_RECORD` → the relevant `*_PAGE_IA` → the relevant `*_WIREFRAME` → `VISUAL_DIRECTION_v2.0`.

---

## 3. Authority & status at a glance

**✅ AUTHORITATIVE — build to these (the contract):**

| Document | Owns (source of truth for) | Editability |
|---|---|---|
| `PROJECT_CONTEXT.md` | Product vision, scope, constraints | FROZEN |
| `CONTENT_MODEL.md` | Domain model · taxonomy · curation (v2.1) | FROZEN |
| `INFORMATION_ARCHITECTURE.md` | IA · sitemap · URLs · filters (Steps 1–7) | FROZEN |
| `NAV_DECISION_RECORD.md` | Navigation model (two-layer, task-first) | FROZEN |
| `HOMEPAGE_PAGE_IA.md` | Homepage responsibility & modules | FROZEN |
| `HUB_PAGE_IA.md` | Pillar Hub contract | FROZEN |
| `SERVICE_PAGE_IA.md` | Service page contract | FROZEN |
| `WORK_ARCHIVE_PAGE_IA.md` | Work Archive contract | FROZEN |
| `WORK_ENTRY_PAGE_IA.md` | Work Entry contract | FROZEN |
| `CONTACT_PAGE_IA.md` | Contact contract | FROZEN |
| `WIREFRAME_PRINCIPLES.md` | Architecture→layout rules | FROZEN |
| `COMPONENT_INVENTORY.md` | Component vocabulary & behaviour | FROZEN |
| `WIREFRAMING_GUIDELINES.md` | Wireframing process & conventions | FROZEN ¹ |
| `HOMEPAGE_WIREFRAME.md` … `CONTACT_WIREFRAME.md` (6) | Spatial composition per page | FROZEN ¹ |
| **`VISUAL_DIRECTION_v2.0.md`** | **Visual language (colour, type, motion, imagery, brand)** | AUTHORITATIVE → to be FROZEN (v1.1) |
| `DECISIONS_LOG.md` | Decision ledger (Batches 1–19) | LIVING |
| `DOCUMENTATION_RELEASE_v1.0.md` | Freeze/immutability record | FROZEN (v1.1 addendum pending) |

¹ Carries a pending **correction**: still references the superseded `VISUAL_DIRECTION.md` / "architectural publication." Substance is unaffected (the Central Design Principle it cites survives verbatim in v2.0). Corrected in migration Phase 4.

**📖 REFERENCE — read for context, don't build from as truth:**

| Document | What it's for |
|---|---|
| `PAGE_IA_INDEX.md` | Map of the six Page IA blueprints; journeys & responsibility boundaries |
| `CONTENT_MODEL_VALIDATION.md` | 10 worked examples that validated the content model (terminology since corrected) |
| `HOMEPAGE_HIFI_v2.md` | Validation exercise proving `VISUAL_DIRECTION_v2.0` — **not** the production spec |
| `01_ / 02_DRAFT … ATELIER … .pdf` | Original client proposal (source input, pre-architecture) |

**🗄️ ARCHIVED / HISTORICAL — provenance only, conclusions already incorporated:**

| Document | Incorporated into |
|---|---|
| `DISCOVERY_REVIEW.md` | IA · Content Model · Nav (self-marked "superseded in part") |
| `ARCHITECTURE_REVIEW.md` | `DECISIONS_LOG` Batches 13–17 |
| `ARCHITECTURE_REVIEW_02.md` | `DECISIONS_LOG` Batch 18 |

**⛔ SUPERSEDED — do NOT use for implementation:**

| Document | Superseded by | Why |
|---|---|---|
| `VISUAL_DIRECTION.md` | `VISUAL_DIRECTION_v2.0.md` | "Architectural publication" metaphor abandoned in favour of "measured reality" |
| `HOMEPAGE_HIFI_DESIGN.md` (`design/`) | production HiFi (planned) | Realises the superseded visual direction (beige/serif/no-blue) |

**🕳️ PLACEHOLDER:** `README.md` — currently empty; will become a 5-line pointer to this manifest.

---

## 4. Dependency map

```
PROJECT_CONTEXT
   └─ CONTENT_MODEL (v2.1) ── validated by ── CONTENT_MODEL_VALIDATION
        └─ INFORMATION_ARCHITECTURE ── mirrored by ── NAV_DECISION_RECORD
             └─ [reviews: ARCHITECTURE_REVIEW, _02 → folded into DECISIONS_LOG]
                  └─ PAGE IA ×6 ── mapped by ── PAGE_IA_INDEX
                       └─ WIREFRAME_PRINCIPLES → COMPONENT_INVENTORY → WIREFRAMING_GUIDELINES
                            └─ WIREFRAMES ×6
                                 └─ VISUAL_DIRECTION_v2.0   (⟵ supersedes VISUAL_DIRECTION)
                                      └─ HiFi:  HOMEPAGE_HIFI_v2 (reference)
                                                HOMEPAGE_HIFI_DESIGN (superseded)
                                                → PRODUCTION HiFi (planned) → DESIGN_TOKENS (planned)
                                                     └─ TECHNICAL LAYER (planned) → BUILD

  Governs all layers:  DECISIONS_LOG · DOCUMENTATION_RELEASE
```

**Integrity rule:** no authoritative document may depend on a superseded one. (Today the wireframes + `WIREFRAMING_GUIDELINES` point at the old `VISUAL_DIRECTION` — fixed in migration Phase 4.)

---

## 5. What to read for each build task

**Always required (every page):** `CONTENT_MODEL` · `INFORMATION_ARCHITECTURE` · `NAV_DECISION_RECORD` · `WIREFRAME_PRINCIPLES` · `COMPONENT_INVENTORY` · `WIREFRAMING_GUIDELINES` · `VISUAL_DIRECTION_v2.0` · `DECISIONS_LOG` (open items).
**Never build from (every page):** `VISUAL_DIRECTION.md` · `HOMEPAGE_HIFI_DESIGN.md` · `DISCOVERY_REVIEW.md` · `CONTENT_MODEL_VALIDATION.md` (reference only) · source PDFs.

| Build task | Add these page-specific docs |
|---|---|
| Homepage | `HOMEPAGE_PAGE_IA` + `HOMEPAGE_WIREFRAME` (+ production HiFi when it exists; `HOMEPAGE_HIFI_v2` as visual reference) |
| Pillar Hub | `HUB_PAGE_IA` + `PILLAR_HUB_WIREFRAME` |
| Service | `SERVICE_PAGE_IA` + `SERVICE_WIREFRAME` (+ IA Step 6 empty-state) |
| Work Archive | `WORK_ARCHIVE_PAGE_IA` + `WORK_ARCHIVE_WIREFRAME` (+ IA Step 5 filters) |
| Work Entry | `WORK_ENTRY_PAGE_IA` + `WORK_ENTRY_WIREFRAME` (+ CONTENT_MODEL §3 modular layout) |
| Contact | `CONTACT_PAGE_IA` + `CONTACT_WIREFRAME` (+ IA Step 7 prefills) |
| CMS / data | `CONTENT_MODEL` + IA §2.2 (URLs, reserved slugs, i18n) + future `CONTENT_MODEL_IMPLEMENTATION` |
| Global setup / tokens | `VISUAL_DIRECTION_v2.0` + future `TECHNICAL_ARCHITECTURE` / `DESIGN_TOKENS` |

Full matrix: `DOCUMENTATION_ARCHITECTURE.md` §9.

---

## 6. Load-bearing invariants (design & build must not break these)

From `DOCUMENTATION_RELEASE_v1.0.md` §4, still in force:
- **The work is the protagonist; the interface is its frame.** (Central Design Principle — survives into v2.0.)
- **Understanding before persuasion** — pages enable action, never pressure it.
- **Two co-equal pillars, one brand** — neither secondary; no structural primacy.
- **Content Model v2.1** — Work Entry canonical; Service first-class; entries *demonstrate* services by reference; curation ≠ taxonomy.
- **Two-layer, task-first navigation** — *Despre · Servicii · Proiecte · Contact · EN*; never shape-shifts; pillars are expressed by structure, not the menu.
- **Single responsibility per page**; **approved component set only** (Component Inventory is closed).
- **Honest attribution** — scoped Authorship; the visitor never leaves misled.

Added by the visual pivot (v2.0 — pending formal freeze as v1.1):
- **Measured reality, warm never cold** — an instrument for exploring space; technology reveals the architecture, never replaces it.
- **Blue as semantic activation** (never decoration) · **focus as the hierarchy mechanism** · **motion as a deliberate, instrument-grade material** · **the designer's identity is preserved** (electric blue, pixel type, mascot, white ground, floating compositions).

---

## 7. Implementation roadmap

1. **Adopt the documentation architecture** (this proposal set) — approve `DOCUMENTATION_ARCHITECTURE.md`.
2. **Governance catch-up** — record the visual pivot as a `DECISIONS_LOG` batch; issue `DOCUMENTATION_RELEASE_v1.1`; formally freeze `VISUAL_DIRECTION_v2.0`.
3. **Migrate the docs** — metadata headers, folder structure, reference-correction sweep (see `MIGRATION_PLAN.md`).
4. **Create the production HiFi** — Homepage first, then Hub → Service → Archive → Work Entry → Contact, built on `VISUAL_DIRECTION_v2.0` + each frozen wireframe/Page IA, using `HOMEPAGE_HIFI_v2` as a validated reference.
5. **Derive `DESIGN_TOKENS`** from the production HiFi.
6. **Write the technical layer** — `TECHNICAL_ARCHITECTURE`, `CONTENT_MODEL_IMPLEMENTATION` (CMS schema, reserved slugs, i18n), `MOTION_GUIDELINES`, `ACCESSIBILITY_GUIDELINES` (WCAG 2.2 AA), `SEO_I18N_PLAN`, `PERFORMANCE_BUDGET`.
7. **Build** — page by page, freezing each HiFi before its page is implemented.

---

## 8. Open decisions carried forward

From `DECISIONS_LOG` Batch 19 "Open" list and the reviews — none blocking, all to be resolved in design/build:
- Pillar-hub public names/slugs (working: `/arhitectura-design`, `/reality-capture`); i18n slug-localisation detail + missing-translation fallback.
- Multi-select within a filter facet; inline vs expander rendering (design step).
- Confirm the exact EU-funding publicity obligations (logos, statement, duration, placement).
- Point-cloud showcase fidelity (WebGL vs video vs images) + mobile fallback; performance implications.
- Whether to add committed long-tail SEO routes (e.g. heritage × scanning) beyond the two curated routes (review F3).
- Whether to add a dedicated "Pillar Entry" component (currently expressed via Highlight Card) — deferred to design; would enter via amendment channel 3.
- Real credibility copy; content/asset readiness; whether "Visualization" is its own discipline.

Newly surfaced by this documentation review (planning phase):
- **The visual pivot must be recorded through governance** before implementation (roadmap step 2).
- **The whole technical/implementation documentation layer does not yet exist** (roadmap step 6).

---

## 9. Full document index

Current path → target folder. Statuses per §3.

| # | Document (current path) | Status | Target folder |
|---|---|---|---|
| 1 | `PROJECT_CONTEXT.md` | AUTHORITATIVE · FROZEN | `docs/00-foundation/` |
| 2 | `README.md` | PLACEHOLDER | root (→ pointer) |
| 3 | `claude/DISCOVERY_REVIEW.md` | ARCHIVED | `docs/00-foundation/` |
| 4 | `claude/CONTENT_MODEL.md` | AUTHORITATIVE · FROZEN | `docs/02-content-model/` |
| 5 | `claude/CONTENT_MODEL_VALIDATION.md` | REFERENCE | `docs/02-content-model/` |
| 6 | `claude/INFORMATION_ARCHITECTURE.md` | AUTHORITATIVE · FROZEN | `docs/03-information-architecture/` |
| 7 | `claude/NAV_DECISION_RECORD.md` | AUTHORITATIVE · FROZEN | `docs/03-information-architecture/` |
| 8 | `claude/ARCHITECTURE_REVIEW.md` | ARCHIVED | `docs/reviews/` |
| 9 | `claude/ARCHITECTURE_REVIEW_02.md` | ARCHIVED | `docs/reviews/` |
| 10 | `claude/PAGE_IA_INDEX.md` | REFERENCE | `docs/04-page-ia/` |
| 11 | `claude/HOMEPAGE_PAGE_IA.md` | AUTHORITATIVE · FROZEN | `docs/04-page-ia/` |
| 12 | `claude/HUB_PAGE_IA.md` | AUTHORITATIVE · FROZEN | `docs/04-page-ia/` |
| 13 | `claude/SERVICE_PAGE_IA.md` | AUTHORITATIVE · FROZEN | `docs/04-page-ia/` |
| 14 | `claude/WORK_ARCHIVE_PAGE_IA.md` | AUTHORITATIVE · FROZEN | `docs/04-page-ia/` |
| 15 | `claude/WORK_ENTRY_PAGE_IA.md` | AUTHORITATIVE · FROZEN | `docs/04-page-ia/` |
| 16 | `claude/CONTACT_PAGE_IA.md` | AUTHORITATIVE · FROZEN | `docs/04-page-ia/` |
| 17 | `claude/WIREFRAME_PRINCIPLES.md` | AUTHORITATIVE · FROZEN | `docs/05-design-system/` |
| 18 | `claude/COMPONENT_INVENTORY.md` | AUTHORITATIVE · FROZEN | `docs/05-design-system/` |
| 19 | `claude/WIREFRAMING_GUIDELINES.md` | AUTHORITATIVE · FROZEN (correction pending) | `docs/05-design-system/` |
| 20 | `claude/VISUAL_DIRECTION.md` | ⛔ SUPERSEDED | `docs/archive/_superseded/` |
| 21 | `claude/HOMEPAGE_WIREFRAME.md` | AUTHORITATIVE · FROZEN (correction pending) | `docs/06-wireframes/` |
| 22 | `claude/PILLAR_HUB_WIREFRAME.md` | AUTHORITATIVE · FROZEN (correction pending) | `docs/06-wireframes/` |
| 23 | `claude/SERVICE_WIREFRAME.md` | AUTHORITATIVE · FROZEN (correction pending) | `docs/06-wireframes/` |
| 24 | `claude/WORK_ARCHIVE_WIREFRAME.md` | AUTHORITATIVE · FROZEN (correction pending) | `docs/06-wireframes/` |
| 25 | `claude/WORK_ENTRY_WIREFRAME.md` | AUTHORITATIVE · FROZEN (correction pending) | `docs/06-wireframes/` |
| 26 | `claude/CONTACT_WIREFRAME.md` | AUTHORITATIVE · FROZEN (correction pending) | `docs/06-wireframes/` |
| 27 | `claude/VISUAL_DIRECTION_v2.0.md` | AUTHORITATIVE (→ freeze v1.1) | `docs/07-visual/` |
| 28 | `claude/design/HOMEPAGE_HIFI_DESIGN.md` | ⛔ SUPERSEDED | `docs/archive/_superseded/` |
| 29 | `claude/design/HOMEPAGE_HIFI_v2.md` | REFERENCE (validation) | `docs/08-hifi/` |
| 30 | `claude/DECISIONS_LOG.md` | AUTHORITATIVE · LIVING | `docs/governance/` |
| 31 | `claude/DOCUMENTATION_RELEASE_v1.0.md` | AUTHORITATIVE (release) | `docs/governance/` |
| — | `01_/02_DRAFT … ATELIER … .pdf` | REFERENCE (source) | `docs/sources/` |
| + | *(planned)* production HiFi ×6 · `DESIGN_TOKENS` · `TECHNICAL_ARCHITECTURE` · `CONTENT_MODEL_IMPLEMENTATION` · `MOTION_GUIDELINES` · `ACCESSIBILITY_GUIDELINES` · `SEO_I18N_PLAN` · `PERFORMANCE_BUDGET` · `METADATA_STANDARD` | WORKING DRAFT / planned | `08-hifi/`, `09-technical/`, `governance/` |

---

*This manifest supersedes the empty `README.md` as the project's entry point once adopted. Governance & doc-system rules: `DOCUMENTATION_ARCHITECTURE.md`. Execution: `MIGRATION_PLAN.md`.*
