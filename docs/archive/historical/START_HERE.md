# START HERE

**The entry point to this project's documentation.** Read this once (5–10 min) and you'll know what the project is, where it stands, which documents are authoritative, what to read, and where any piece of information lives. This page *navigates* — it does not re-explain. When a topic has its own document, this page points to it.

> **For AI agents:** build only from documents marked **AUTHORITATIVE**. Never build from **SUPERSEDED** or **HISTORICAL** documents. When two documents disagree, the authoritative source wins over any derived document.

> **Repository layout:** the documentation currently lives in a **flat structure**, and that is intentional for now — **START_HERE.md is the repository entry point.** A folder architecture (`foundation/`, `architecture/`, `pages/`, `design/`, `wireframes/`, `visual/`, `implementation/`, `governance/`, `archive/`, …) is **approved but deferred**: it will be applied when the real Git repository is created, using the migration table in `proposal/REPOSITORY_STRUCTURE.md`. Until then, navigate by this page — document names are unique and stable, so nothing depends on folders.

---

## 1. Project overview

A premium, bilingual (Romanian root + English) **portfolio and client-acquisition website** for an independent architect & designer working as *"diverse anumite."* No accounts, no e-commerce. The practice has **two co-equal pillars under one brand**: **Architecture & Design** and **Reality Capture** (3D laser scanning, drone photogrammetry — an EU-funded expansion). A hard requirement: the owner must edit projects without touching code.

**Maturity:** the design-and-architecture documentation is complete and frozen. Content model, information architecture, navigation, all six page contracts, the design system, all six wireframes, and the visual direction are done.

**Implementation status:** **not started.** No code, no technical stack decision, no CMS mapping, no design tokens yet. The production high-fidelity design has not been created. The next real artifact is a running Homepage, not another document.

---

## 2. Documentation status

| | Layer | State |
|---|---|---|
| ✅ | Product context & brief | Complete · frozen |
| ✅ | Content model (taxonomy, curation) | Complete · frozen (v2.1) |
| ✅ | Information architecture (sitemap, URLs) | Complete · frozen |
| ✅ | Navigation | Complete · frozen |
| ✅ | Page architecture (6 page contracts) | Complete · frozen |
| ✅ | Design system (principles · components · wireframing) | Complete · frozen |
| ✅ | Wireframes (6 pages) | Complete · frozen |
| ✅ | Visual direction — *measured reality* (v2.0) | **Authoritative** |
| 🟡 | Homepage HiFi | Reference validation only — **production version pending** |
| ⏳ | Technical architecture (stack, rendering, hosting) | Not started |
| ⏳ | CMS / content implementation (fields, slugs, i18n) | Not started |
| ⏳ | Design tokens | Not started |
| ⏳ | Implementation / build | Not started |

> **One caveat worth knowing on day one:** the visual direction changed after the original freeze. **`VISUAL_DIRECTION_v2.0.md` is the current visual authority**; the older `VISUAL_DIRECTION.md` is superseded. Some older documents (the freeze record and a few wireframes) still point at the old one — governance records are being brought up to date. Trust v2.0.

---

## 3. Reading order

You do **not** need to read everything. There is a ~45-minute core path that makes you productive; the rest is reference you open when a task needs it.

**Core path (read in this order):**

| # | Document | Why it exists | Read if | Time |
|---|---|---|---|---|
| 1 | `PROJECT_CONTEXT.md` | Understand the product, audience, constraints | You're new | 5 min |
| 2 | `PAGE_IA_INDEX.md` | The map of the whole page system + user journeys | You want the big picture fast | 5 min |
| 3 | `CONTENT_MODEL.md` | What content *is* (Work Entry, Service, taxonomy) | You touch data, CMS, or any page | 10 min |
| 4 | `INFORMATION_ARCHITECTURE.md` | Sitemap, URLs, page responsibilities | You build routing or any page | 15 min |
| 5 | `NAV_DECISION_RECORD.md` | How navigation works and why | You touch nav | 5 min |
| 6 | `VISUAL_DIRECTION_v2.0.md` | How it should look, feel, behave | You write any UI or styling | 15 min |

**Then, per page you build** (add ~20 min each):

| Document | Why | Time |
|---|---|---|
| `<PAGE>_PAGE_IA.md` | The page's single responsibility + modules | 10 min |
| `<PAGE>_WIREFRAME.md` | The page's spatial composition | 10 min |

**Reference (open when needed, don't read cover-to-cover):**
`COMPONENT_INVENTORY.md` (look up a component) · `WIREFRAME_PRINCIPLES.md` + `WIREFRAMING_GUIDELINES.md` (rules for translating architecture into layout) · `DECISIONS_LOG.md` (why a decision was made).

---

## 4. Documentation map

Each document appears once. Names are as they exist in the corpus today.

**Vision & foundation**
- `PROJECT_CONTEXT.md` — the brief.

**Content & structure** *(the authoritative backbone)*
- `CONTENT_MODEL.md` — objects, taxonomy, curation.
- `INFORMATION_ARCHITECTURE.md` — sitemap, URLs, page responsibilities.
- `NAV_DECISION_RECORD.md` — navigation model.

**Page contracts** *(one per page + a map)*
- `PAGE_IA_INDEX.md` — the map.
- `HOMEPAGE_PAGE_IA.md` · `HUB_PAGE_IA.md` · `SERVICE_PAGE_IA.md` · `WORK_ARCHIVE_PAGE_IA.md` · `WORK_ENTRY_PAGE_IA.md` · `CONTACT_PAGE_IA.md`

**Design system**
- `WIREFRAME_PRINCIPLES.md` — the rules for expressing architecture as layout.
- `COMPONENT_INVENTORY.md` — the closed set of ~35 components.
- `WIREFRAMING_GUIDELINES.md` — the wireframing process.

**Wireframes** *(spatial composition, one per page)*
- `HOMEPAGE_WIREFRAME.md` · `PILLAR_HUB_WIREFRAME.md` · `SERVICE_WIREFRAME.md` · `WORK_ARCHIVE_WIREFRAME.md` · `WORK_ENTRY_WIREFRAME.md` · `CONTACT_WIREFRAME.md`

**Visual**
- `VISUAL_DIRECTION_v2.0.md` — **authoritative** visual language.

**High-fidelity** *(design phase)*
- `design/HOMEPAGE_HIFI_v2.md` — **reference** validation of v2.0 (not the production spec).

**Reference** *(context, not build-from-truth)*
- `CONTENT_MODEL_VALIDATION.md` — 10 worked content examples (useful when modelling the CMS).

**Historical** *(provenance only — do not build from)*
- `DISCOVERY_REVIEW.md` · `ARCHITECTURE_REVIEW.md` · `ARCHITECTURE_REVIEW_02.md`

**Superseded** *(⛔ never build from)*
- `VISUAL_DIRECTION.md` → replaced by `VISUAL_DIRECTION_v2.0.md`
- `design/HOMEPAGE_HIFI_DESIGN.md` → replaced by the pending production HiFi

**Governance & planning** *(how the docs are run; read only if you're changing the docs themselves)*
- `DECISIONS_LOG.md` — the decision ledger.
- `DOCUMENTATION_RELEASE_v1.0.md` — the freeze record.
- `proposal/` — documentation architecture, project manifest, migration plan, repository structure, and the readiness/writing reviews.

**Source inputs**
- `01_/02_DRAFT … ATELIER … .pdf` — the original client proposal.

---

## 5. "Where do I…"

| I want to… | Go to |
|---|---|
| Understand the product | `PROJECT_CONTEXT.md` |
| Change the **homepage** layout | `HOMEPAGE_PAGE_IA.md` → `HOMEPAGE_WIREFRAME.md` |
| Change a **pillar hub / service / archive / work / contact** page | that page's `*_PAGE_IA.md` → `*_WIREFRAME.md` |
| Add or change a **component** | `COMPONENT_INVENTORY.md` |
| Change **navigation** | `NAV_DECISION_RECORD.md` |
| Change **URLs / sitemap / page responsibilities** | `INFORMATION_ARCHITECTURE.md` |
| Change the **visual language** (colour, type, motion, brand) | `VISUAL_DIRECTION_v2.0.md` |
| Understand the **content model / taxonomy** | `CONTENT_MODEL.md` |
| Model the **CMS / fields / slugs / i18n** | ⏳ *to be created* — start from `CONTENT_MODEL.md` + `INFORMATION_ARCHITECTURE.md` §2.2 |
| See **worked content examples** | `CONTENT_MODEL_VALIDATION.md` |
| Understand **user journeys** across pages | `PAGE_IA_INDEX.md` §4 |
| Know **why** a decision was made | `DECISIONS_LOG.md` |
| Understand **wireframing rules** | `WIREFRAME_PRINCIPLES.md` + `WIREFRAMING_GUIDELINES.md` |
| Choose the **tech stack / rendering / hosting** | ⏳ *to be created* (`TECHNICAL_ARCHITECTURE`) |
| Find **design tokens** | ⏳ *to be created* — derived from the production Homepage HiFi |

---

## 6. Current project state (30-second read)

- **Completed:** the full design architecture — content model, IA, navigation, six page contracts, design system, six wireframes, and the visual direction (v2.0).
- **In progress:** documentation cleanup (recording the visual pivot; onboarding — this page).
- **Next:** (1) technical architecture + CMS mapping; (2) production Homepage HiFi; (3) design tokens; (4) build the Homepage as a vertical slice.
- **Future:** roll out the remaining five pages (HiFi → build), then content, SEO/i18n, accessibility, and performance hardening.

---

## 7. Working principles

- **Authoritative overrides derived.** If a wireframe or HiFi disagrees with the content model or IA, the upstream authoritative document wins.
- **One decision, one home.** Change a decision where it lives (see §5), not in a downstream copy.
- **Never introduce architecture in implementation docs.** Wireframes, HiFi, and code express the architecture; they don't change it. A change to responsibilities, journeys, modules, or navigation belongs upstream.
- **Frozen documents don't change casually.** The frozen corpus changes only with a logged reason (see `DECISIONS_LOG.md`).
- **Don't build from Superseded or Historical documents.** Use the authoritative successor named in §4.
- **Reference, don't duplicate.** Link to the owning document instead of restating it.

---

## 8. Repository mental model

Everything flows top-down. Each layer is a stable contract for the one below; nothing points back up. Governance runs alongside every layer.

```
          PROJECT_CONTEXT            ← what & why (the brief)
                 │
           CONTENT_MODEL             ← what the content IS
                 │
     INFORMATION_ARCHITECTURE ── NAV_DECISION_RECORD   ← how the site is structured
                 │
       PAGE CONTRACTS (×6) ── PAGE_IA_INDEX            ← what each page is responsible for
                 │
   WIREFRAME_PRINCIPLES → COMPONENT_INVENTORY → WIREFRAMING_GUIDELINES   ← the design system
                 │
            WIREFRAMES (×6)          ← spatial composition per page
                 │
        VISUAL_DIRECTION_v2.0        ← how it looks & feels   (⟵ supersedes VISUAL_DIRECTION)
                 │
      PRODUCTION HiFi  →  DESIGN TOKENS        ← ⏳ pending
                 │
   TECHNICAL ARCHITECTURE · CMS MAPPING        ← ⏳ pending
                 │
              BUILD

   Alongside everything:  DECISIONS_LOG  ·  DOCUMENTATION_RELEASE  (governance)
```

Read it as: *the brief defines the content; the content defines the structure; the structure defines each page; the design system and wireframes shape the pages; the visual direction dresses them; tokens and the tech layer turn them into code.*

---

## 9. Quick start — building the Homepage tomorrow

**Open, in order:**
1. `PROJECT_CONTEXT.md` — the product in 5 minutes.
2. `HOMEPAGE_PAGE_IA.md` — the Homepage's responsibility and its modules (M-1…M-7).
3. `HOMEPAGE_WIREFRAME.md` — how those modules are arranged.
4. `COMPONENT_INVENTORY.md` — the components each module uses (look up as needed).
5. `VISUAL_DIRECTION_v2.0.md` — how it should look and behave.
6. `CONTENT_MODEL.md` — the data the Homepage surfaces (curated highlights, pillars).

**Ignore for now:** `VISUAL_DIRECTION.md` and `design/HOMEPAGE_HIFI_DESIGN.md` (superseded), the historical reviews, and the other pages' documents.

**Expect two gaps you must resolve first:** there is **no production Homepage HiFi** and **no tech stack / design tokens** yet. Use `design/HOMEPAGE_HIFI_v2.md` only as a *reference* for the intended v2.0 look. The Homepage is best built as a **vertical slice** that also stands up the stack, CMS, and tokens for everything after it.

---

## 10. Appendix — glossary

Short definitions only; each concept's full treatment lives in its own document.

| Term | Meaning |
|---|---|
| **IA** | Information Architecture — the site's structure: sitemap, URLs, page responsibilities. |
| **Page IA** | The single-responsibility contract for one page (what it does, its modules, where it routes). |
| **Module** | A section of a page that owns one responsibility (e.g. `M-2` = the Homepage pillar branch). |
| **Component** | A reusable interface building block from the closed `COMPONENT_INVENTORY.md` (e.g. Work Preview Card). |
| **Pillar** | One of the two co-equal capabilities: **Architecture & Design** or **Reality Capture**. |
| **Hub / Pillar Hub** | The landing page that introduces one pillar and routes into its services and work. |
| **Work Entry** | The canonical portfolio object — one piece of work (project, competition, scan, etc.). |
| **Service** | A first-class offering (e.g. 3D Laser Scanning) that Work Entries *demonstrate*. |
| **Curated view** | An editorial slice of the archive (Competitions, Professional Experience). |
| **Reality Capture (RC)** | The scanning / photogrammetry pillar. |
| **Attribution / Authorship** | Honest crediting fields (independent / collaboration / studio; who authored what). |
| **Authoritative / Superseded / Historical** | Build from *authoritative*; never from *superseded* or *historical* (§4). |
| **HiFi** | High-fidelity design — the pixel-level spec. Production HiFi is pending. |
| **v2.0 / measured reality** | The current visual direction (`VISUAL_DIRECTION_v2.0.md`). |

---

*This is the front page of the documentation. If you read only one file, read this one — then follow §3 or §9. For the full document architecture and governance, see `proposal/DOCUMENTATION_ARCHITECTURE.md` and `proposal/PROJECT_MANIFEST.md`.*
