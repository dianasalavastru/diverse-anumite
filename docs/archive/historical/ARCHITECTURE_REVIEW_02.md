# Architectural UI Review — Homepage & Project Page vs. finalized IA

Date 2026-07-30. Scope: evaluate how well the current UI proposal expresses the frozen IA (`INFORMATION_ARCHITECTURE.md`, Steps 1–7 + F1/F2/F4/F5/F6). Not a redesign. Visual language preserved. Screens reviewed: homepage (desktop + mobile), project (Work Entry) page, nav dropdowns.

**Finding-resolution pass complete (2026-07-30):** every Critical and Major was validated one-by-one and confirmed as a representation / Navigation / Page-IA matter. **No finding required an IA change.** The finalized IA remained the source of truth throughout; the work is aligning the UI representation with the already-locked architecture.

## Layer model (used throughout this review)
- **IA** — objects, relationships, and navigation *rules*.
- **Navigation** — expresses those rules through the site's navigation structure (Layer 1 homepage narrative + Layer 2 global). Governed by `NAV_DECISION_RECORD.md`.
- **Page IA** — the internal structure of individual pages.
- **UI** — the visual expression of navigation and pages.

## Verdict first
- **Architecture → UI alignment: 5 / 10** (as-drawn). Confidence: **Medium-High (~80%)** — pillar hubs, Services index, Service page, and Contact are **not in the set**.
- The alignment gap is entirely **representation**, not architecture: closing the findings below raises expression without touching the IA.
- Visual direction is strong and fully preservable; every finding is structural, not aesthetic.

## What already aligns
- Global nav labels match the locked set: Despre · Servicii · Proiecte · Contact · EN.
- Homepage presents **both pillars as roughly co-equal content sections**.
- Galleries link to individual project pages (Work Entry hand-off).
- Work Entry page has general-data + zoomable planșe + related-entries — three correct modules.

---

## 1. Architectural alignment
- **Pillar hubs: absent** — first-class page type + task-first validity condition; F1 back-paths depend on them. *(Homepage entry point resolved — C1.)*
- **Reality Capture work absent from "Proiecte"** — appears only as service illustration → conflicts with condition 3. *(Representation issue — C2.)*
- **Nav reflects an earlier IA** — Proiecte → Concursuri/Colaborari; Servicii flat. *(Navigation-layer update — M1.)*
- **Two pillars:** homepage sections but **not navigable destinations** (no hubs); early co-equal branch not yet expressed *(M4)*.
- **Curated views mislabeled on the homepage** *(M5)*.
- **Missing:** EU-funding footer element; service-aware Contact (page not shown).

## 2. User journeys
- **Homepage → Pillar → Service:** homepage → hub transition agreed (Page-IA phase); Service step needs hub + Service pages.
- **Homepage → Work Archive:** only Concursuri/Colaborari; no path to the full archive; RC unreachable.
- **Service → Related Work:** Service page not shown — unassessable.
- **Work → Related Service:** no link to the demonstrated Service. Missing relationship.
- **Google → Service → Contact:** not shown — unassessable.
- **Google → Work → Related Service:** breaks at the Work Entry.
- **Google → Work → Professional Experience:** studio entries need a credits block + link; competition template has neither.

## 3. Page readiness
**Homepage** — missing: the early co-equal branch *(M4)*, hub entry points *(transition agreed; Page-IA phase)*, pillar-grouped Servicii *(Navigation)*, EU-funding footer, real credibility copy. Highlight galleries mislabeled *(M5)*. *(RC editorial examples = representation clarification — C2/O1.)*
**Work Entry (project) page** — see M3: currently one competition template; missing universal base additions + type modules.
**Pillar hub / Services index / Service page / Contact** — not represented; cannot assess.

## 4. Page-IA readiness (clarify before documenting internal Page IA)
- **Work Entry = shared base template + optional modules** (M3). Define module boundaries first.
- **Define reusable modules:** Work card, credits block, demonstrated-by module, pillar-entry card, related-items strip, Homepage-Highlight module.
- Homepage highlight sections = **Homepage-Highlight modules bound to canonical curated views** (M5).

## 5. Findings

**Critical**
- **C1 — Pillar hubs unrepresented.** *Fix:* represent the two hub pages + entry points.
  - **Status:** homepage → Pillar Hub interaction **conceptually resolved** (documented later in Homepage Page IA / Interaction Design, not the IA). Fully closes once Hub pages + remaining F1 paths (Hub ↔ Service ↔ Work) are represented.
- **C2 — Reality Capture work absent from Work/Proiecte.**
  - **Status:** **Representation issue, no IA change.** C2 establishes RC belongs in the shared Work model; an RC entry can already exist on the generic base template. Homepage structure unchanged — RC editorial examples reinterpreted as previews of RC Work Entries.

**Major**
- **M1 — Navigation reflects the old concept** (Proiecte → Concursuri/Colaborari; Servicii flat).
  - **Status:** **Representation issue, no IA change.** Incompatible: flat Servicii list (condition 1) and "Colaborari" as a browse item (F2). Minimum: pillar-group Servicii; point Proiecte at the Work archive (drop Colaborari; any light dropdown exposes pillar scopes and/or curated views). **Layer: Navigation** — implements `NAV_DECISION_RECORD.md`.
- **M2 — Work Entry lacks Work→Service link + credits block.** *Fix:* add both. *(Part of the M3 universal base.)*
- **M3 — Work Entry template is competition-only; must become a shared modular template.**
  - **Status:** Representation issue, **no IA change.** Competition page **evolves into** the modular template (shared base + optional modules).
  - **Universal base:** Hero · **Core Facts** (flexible metadata component — common metadata always shown; Entry-Type-specific attributes when relevant; not a fixed field set) · Description · Media gallery (zoom) · Related Work · Nav/footer · **Credits** (Employer, Role, Authorship, Collaborators — always present) · **Work→Service** link · **F1** hub back-path.
  - **Competition module (optional):** Awards, Jury, competition **Team** (contextual — distinct from universal Credits).
  - **Reality Capture modules (optional):** Capture specifications · Accuracy · Equipment · Deliverables · Point Cloud / Orthophotos / Before–After.
  - **C2 vs M3:** M3 does *not* enable C2. C2 (IA) makes RC a first-class Work Entry; M3 (Page IA) evolves the shared base so different Work types express their characteristics through optional modules.
- **M4 — No early self-segmentation (fork).**
  - **Status:** No longer an open **IA** issue (Step 3 locks the responsibility). Now **representation**. The branch is between the two **Pillars** (Architecture & Design / Reality Capture); the scan/render imagery is only the current editorial *expression* of the dual-capability teaser. Minimum: elevate the existing dual-capability teaser into an **early co-equal branch towards the two Pillar Hubs**, reusing the C1 transition pattern at equal weight (also neutralizes the scanning-forward hero). **M4 vs C1:** M4 = *when* the visitor chooses a direction (early); C1 = *how* each direction continues (its Pillar Hub). **Layers — IA:** rule (locked) · **Navigation (Layer 1):** homepage narrative includes the early branch · **Page IA:** its position/contents · **UI:** expression. Documented in Homepage Page IA.
- **M5 — Homepage highlight galleries labelled "1/ Concursuri" + "2/ MAAI Arhitectura".**
  - **Status (2026-07-30):** **Representation issue, no IA change.** The IA already defines **Competitions** and **Professional Experience** as the canonical curated views (Professional Experience = Attribution=Studio grouped by Employer; employer is grouping metadata, not a category).
    - **Cause:** "Concursuri" already maps to the Competitions curated view; **"MAAI Arhitectura" exposes a single employer as a category** and should become the **Professional Experience** curated view (MAAI as one employer group within it); the "1/ … 2/ …" numbering implies these are *the* project categories.
    - **Minimum evolution:** treat the two sections as **Homepage-Highlight modules that represent the canonical curated views as real IA destinations** — not galleries with reworded labels. The substantive change is that they now point to real destinations. **Professional Experience replaces the old employer-based taxonomy** while allowing employer groupings within the view. Composition, horizontal scroll, imagery and editorial curation preserved.
    - **Navigation stays consistent with the rest of the architecture:** **Homepage Highlight → Curated View → Work Entry** — the curated view is the canonical destination; no component-specific shortcut straight to Work Entries.
    - **Layers — IA:** curated views canonical (locked, no change) · **Navigation:** Homepage Highlight → Curated View → Work Entry · **Homepage Page IA:** the two sections are Homepage-Highlight modules bound to the Competitions and Professional Experience curated views (MAAI = employer group within Professional Experience) · **UI:** module labeling + curation imagery; visual composition unchanged.

**Minor**
- **m1 — EU-funding acknowledgment missing from footer** (Step 7).
- **m2 — Contact / Service / hub / index pages not in the set** — likely undrawn.
- **m3 — Lorem credibility copy** — J3 depends on real practice-level credibility (content).

**Observation**
- **O1 — Reality Capture editorial section is a representation clarification** — its works are previews of RC Work Entries. Homepage structure unchanged.
- **O2 — Promote recurring elements to reusable modules** (Work card, credits block, demonstrated-by, related strip, Homepage-Highlight module).
- **O3 — "alte proiecte sugerate"** = correct related-entries module; ensure Work-Entry-driven and cross-pillar aware.

## Overall
Strong, preservable visual direction on a structure still mostly expressing the pre-IA concept. **All Criticals and Majors (C1, C2, M1–M5) are validated as representation / Navigation / Page-IA matters — none requires an IA change.** The finalized IA stands as the source of truth; the required work is aligning the homepage, navigation, and Work Entry template with the already-locked architecture. Suggested sequencing: **M1 (Navigation)** and **M2/M3 (Work Entry template)** first; the homepage set (**M4, M5**, and the C1 homepage→hub interaction) and the remaining C1 work (hub pages + F1 paths) alongside Homepage/Hub Page IA; the Minors (EU-funding footer, credibility copy, and the undrawn Service/Contact pages) folded into their respective Page-IA work. The design is ready to move into detailed Page IA on this basis.
