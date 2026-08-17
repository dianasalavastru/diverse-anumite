# Diverse Anumite

Production website for an independent architect & designer working as **_diverse anumite_** — a
premium, bilingual (Romanian root + English) **portfolio and client-acquisition site**. No accounts,
no e-commerce. The practice has **two co-equal pillars under one brand**: **Architecture & Design** and
**Reality Capture** (3D laser scanning, drone photogrammetry, point-cloud documentation). A hard
requirement: the owner must be able to add and edit projects **without touching code**.

> **This repository is the canonical source of truth (SSOT) for the project's product, design, and
> documentation.** Read this file first, then follow the paths below. When two documents disagree, the
> **upstream authoritative** document wins over any downstream one — never the reverse.

---

## Current phase

**Design & architecture: complete and frozen. Technical architecture: decided and authoritative
([`docs/implementation/TECHNICAL_ARCHITECTURE.md`](docs/implementation/TECHNICAL_ARCHITECTURE.md),
2026-08-11). Implementation: Phase 0 complete — integration checkpoint I-1 landed 2026-08-11**
(design tokens extracted verbatim from the approved HiFis; the frozen locale route map, the global
`@layer` architecture, the base layout with Global Header/Footer and motion runtime, and the
frontend ↔ CMS content contract are all in the repository). Page implementation has not started.
The full design architecture — content model,
information architecture, navigation, six page contracts, the design system, six wireframes, and the
visual direction (**v2.0, "measured reality"**) — is done and authoritative. Interactive HiFi
references exist for six page types. The next real artifact is a running Homepage, not another document.

---

## Read first (the ~45-minute core path)

You do **not** need to read everything. This makes you productive:

1. [`docs/foundation/PROJECT_CONTEXT.md`](docs/foundation/PROJECT_CONTEXT.md) — the product, audience, constraints.
2. [`docs/pages/PAGE_IA_INDEX.md`](docs/pages/PAGE_IA_INDEX.md) — the whole page system + user journeys, fast.
3. [`docs/product/CONTENT_MODEL.md`](docs/product/CONTENT_MODEL.md) — what a project *is* (Pillar, Services, Sector, Labels, field requirements). **CLIENT-VALIDATED v3.1 — read this before any schema or filter work. No open model questions remain.** Its migration companion is [`docs/product/PROJECT_MODEL_IMPACT.md`](docs/product/PROJECT_MODEL_IMPACT.md).
4. [`docs/product/INFORMATION_ARCHITECTURE.md`](docs/product/INFORMATION_ARCHITECTURE.md) — sitemap, URLs, page responsibilities. **Locked.**
5. [`docs/product/NAV_DECISION_RECORD.md`](docs/product/NAV_DECISION_RECORD.md) — how navigation works and why.
6. [`docs/design/VISUAL_DIRECTION_v2.0.md`](docs/design/VISUAL_DIRECTION_v2.0.md) — how it looks, feels, behaves. **Authoritative visual language.**

**Then, per page you build,** open that page's folder (everything for one page lives together):
`docs/pages/<page>/` → its `*_PAGE_IA.md` (responsibility + modules) → `*_WIREFRAME.md` (spatial
composition) → the current HiFi `.html` (visual/interaction reference).

---

## Where everything lives

```
docs/
├── foundation/     PROJECT_CONTEXT.md
├── product/        CONTENT_MODEL.md (v3.1) · PROJECT_MODEL_IMPACT.md · INFORMATION_ARCHITECTURE.md · NAV_DECISION_RECORD.md   (product/IA authority)
├── design/         VISUAL_DIRECTION_v2.0.md · COMPONENT_INVENTORY.md · WIREFRAME_PRINCIPLES.md · WIREFRAMING_GUIDELINES.md
├── pages/          PAGE_IA_INDEX.md, then one folder per page type (colocated Page IA + wireframe + HiFi + notes):
│   ├── homepage/   HOMEPAGE_PAGE_IA · HOMEPAGE_WIREFRAME · MOTION_NOTES · HOMEPAGE_HIFI_v2 (ref) · homepage-measured-reality-animated-v3.html
│   ├── pillar-hub/ HUB_PAGE_IA · PILLAR_HUB_WIREFRAME · pillar-hub-…-hifi-v1_1.html · reality-capture-hub-…-hifi-v1.html
│   ├── work-archive/  WORK_ARCHIVE_PAGE_IA · WORK_ARCHIVE_WIREFRAME · work-archive-…-hifi-v1.html · WORK_ARCHIVE_IMPLEMENTATION_NOTES.md
│   ├── work-entry/  WORK_ENTRY_PAGE_IA · WORK_ENTRY_WIREFRAME · work-entry-…-hifi-v1.html
│   ├── service/    SERVICE_PAGE_IA · SERVICE_WIREFRAME · service-page-…-hifi-v1.html
│   └── contact/    CONTACT_PAGE_IA · CONTACT_WIREFRAME            (no HiFi yet — see Open questions)
├── governance/     DECISIONS_LOG.md (living ledger) · DOCUMENTATION_RELEASE_v1.0.md (freeze record)
├── implementation/ TECHNICAL_ARCHITECTURE.md (authoritative production architecture)
├── references/     source proposal PDFs + cover JPG · INSPIRATION.md · CONTENT_MODEL_VALIDATION.md   (non-authoritative)
└── archive/        superseded/ · historical/ · proposal/   (⛔ provenance only — never build from)
```

Since I-1, application code lives beside it. **A file has exactly one owning workstream**
(`TECHNICAL_ARCHITECTURE.md` §23.3) — the owner is noted in brackets:

```
src/
├── styles/         global token + @layer stylesheet, typography & layout primitives   [A]
├── layouts/        base layout (motion runtime + Global Header/Footer)                [A]
├── components/     Global Header · Footer                                             [A]
├── pages/          routes (currently one foundation placeholder, not the Homepage)    [A]
├── scripts/        motion runtime — no library, per MOTION_NOTES.md                   [A]
├── lib/i18n/       the frozen locale route map (§11.1) + UI message structure         [A]
└── lib/content/    the frontend ↔ CMS data boundary — types, derivations, fixtures    [B]
```

---

## Authority model (who wins when documents disagree)

Top-down; each layer is a stable contract for the one below. **Nothing downstream may redefine anything
upstream** — flag conflicts, don't reconcile them silently.

```
PROJECT_CONTEXT (brief)  →  CONTENT_MODEL (what content is)  →  INFORMATION_ARCHITECTURE + NAV (structure)
  →  PAGE IA ×6 (each page's job)  →  WIREFRAMES + design system (structure/components)
  →  VISUAL_DIRECTION_v2.0 + approved HiFi + MOTION_NOTES (look/feel/motion)
  →  IMPLEMENTATION notes (production behaviour beneath the HiFi)
```

If a HiFi contradicts the IA or Content Model, **the IA / Content Model win.** Visual/motion conflicts
resolve to `VISUAL_DIRECTION_v2.0.md` + the approved HiFi. Governance (`DECISIONS_LOG.md`) runs alongside.

---

## Approved HiFi references (owner-approved 2026-08-10)

Design/UX references — **not production source code.** One current reference per page type, colocated in
its `docs/pages/<page>/` folder:

| Page | Current HiFi |
|---|---|
| Homepage | `homepage-measured-reality-animated-v3.html` |
| Architecture & Design pillar hub | `pillar-hub-measured-reality-hifi-v1_1.html` |
| Reality Capture pillar hub | `reality-capture-hub-measured-reality-hifi-v1.html` |
| Work Archive | `work-archive-measured-reality-hifi-v1.html` |
| Work Entry | `work-entry-measured-reality-hifi-v1.html` |
| Service | `service-page-measured-reality-hifi-v1.html` |

Earlier prototypes are in `docs/archive/superseded/`. Motion is documented in
[`docs/pages/homepage/MOTION_NOTES.md`](docs/pages/homepage/MOTION_NOTES.md).

---

## Implementation guidance

- **Work Archive** has authoritative production-behaviour notes:
  [`docs/pages/work-archive/WORK_ARCHIVE_IMPLEMENTATION_NOTES.md`](docs/pages/work-archive/WORK_ARCHIVE_IMPLEMENTATION_NOTES.md)
  — read alongside its HiFi. Where it touches taxonomy/filters it **reconciles to** the Content Model + IA
  (it does not change them). It also carries the reusable template for future `*_IMPLEMENTATION_NOTES.md`.
- **Cross-page implementation standard** — `docs/implementation/IMPLEMENTATION_DOCUMENT_STANDARD.md` is a
  **known but currently unavailable** artifact. Its slot is **reserved**; recovering/recreating it is a
  post-migration task. It is **not** reconstructed here. (The `docs/implementation/` folder now exists,
  created by `TECHNICAL_ARCHITECTURE.md`; the Standard remains a separate, still-missing artifact.)

---

## Superseded / historical — ⛔ do not build from

Kept for provenance under `docs/archive/`, never for implementation:

- `archive/superseded/VISUAL_DIRECTION.md` → replaced by `design/VISUAL_DIRECTION_v2.0.md`.
- `archive/superseded/HOMEPAGE_HIFI_DESIGN.md` → replaced by v2.0-aligned work / current HiFi.
- `archive/superseded/*.html` → earlier homepage/hub/work-entry prototypes.
- `archive/historical/` → discovery + architecture reviews, and the old `START_HERE.md` (this README distills it).
- `archive/proposal/` → the documentation-architecture / migration / manifest / review proposals (inputs to this migration, not live process).

Note: `governance/DOCUMENTATION_RELEASE_v1.0.md` is the original freeze record, kept **stale-by-design**
(it predates the v2.0 pivot); Decision Log **Batch 20** records the correction.

---

## Open questions (unresolved — do not invent)

- ~~No production tech stack / CMS mapping~~ — **resolved 2026-08-11** by
  [`docs/implementation/TECHNICAL_ARCHITECTURE.md`](docs/implementation/TECHNICAL_ARCHITECTURE.md)
  (Decision Log Batch 21). Pillar-hub slugs and EN route segments are also decided there (#76–77).
- ~~Design tokens unextracted~~ — **resolved 2026-08-11 at I-1.** Extracted verbatim from the approved
  HiFis into `src/styles/tokens.css`, which records the provenance and the reconciled divergences.
  No display type scale was derived: the HiFis size display type per composition, so a global scale
  would be a redesign, not an extraction.
- **`IMPLEMENTATION_DOCUMENT_STANDARD.md`** — recover or recreate into the reserved `docs/implementation/`.
- **Work Archive taxonomy reconciliation** — align the implementation notes' filter/metadata model to the
  frozen Content Model + locked IA before building Work Archive.
- **Contact** has a Page IA + wireframe but **no HiFi**.
- **About** is a defined page type with **no Page IA, wireframe, or HiFi** (no `docs/pages/about/` yet).
- **Motion pointer** — confirm the homepage `animated-v3` HiFi inherits the motion layer described in `MOTION_NOTES.md`.

---

*Full decision history: [`docs/governance/DECISIONS_LOG.md`](docs/governance/DECISIONS_LOG.md). This
README is the single entry point — detailed documentation lives behind it, not duplicated here.*
