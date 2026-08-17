# Information Architecture

Working IA document for the Atelier portfolio website. Built on `CONTENT_MODEL.md` (**CLIENT-VALIDATED v3.0**) and the decisions in `DECISIONS_LOG.md`. Concise nav summary: `NAV_DECISION_RECORD.md`.

> **AMENDED 2026-08-14 (v3.1) — the five open model questions closed.** **Attribution, Employer, Roles and Authorship are retired**; crediting is carried by the optional `Colaboratori` and `Echipă` fields. This changes Step 5 and §5.1 below: **the *Experiență profesională* curated view loses its membership rule** (it was *Attribution = Studio, grouped by Employer*). **Its routes and per-locale reserved slugs are unchanged and stay reserved** — what the view is built from is an editorial decision to take when it is implemented (`PROJECT_MODEL_IMPACT.md` §1.7). Also fixed: **Sector is mandatory and single-select**, and **Status is mandatory, single-select and closed** (În dezvoltare · În desfășurare · Finalizat · Nerealizat).
>
> **AMENDED 2026-08-13 — simplified project model.** `CONTENT_MODEL.md` v3.0 removes **Discipline** and **Entry Type / Project Type**, makes **Pillar authored and single-valued** (no cross-pillar projects), makes **Services multi-select and mandatory**, adds optional **Labels** (CONCURS · PROIECT DE DIPLOMĂ) and one **closed global Sector vocabulary**. The amendments touch §2.3, Step 5, §5.1 and the Open list below; they are marked inline. **No route, sitemap, page responsibility or navigation decision changes.** Impact inventory: `PROJECT_MODEL_IMPACT.md`.

**Progress:** Steps 1–7 — **LOCKED. Information Architecture complete.** Next phase: page-level UX / wireframes / design (out of IA scope). *Review findings F1, F2, F4, F5 integrated 2026-07-30 (additive/clarifying); second-review clarifications M1 (Services forward flow = two convergent journeys) and M2 (cross-pillar contextual navigation = Primary Pillar) integrated 2026-07-30 (clarification only); M3 (aggregate-page empty-state UI) scoped-deferred to Page IA / Wireframing.*

---

## Step 1 — Navigation model & philosophy (LOCKED)

### Two layers
1. **Homepage narrative navigation (Layer 1)** — onboarding for first-time/undecided visitors.
2. **Global IA (Layer 2)** — persistent, consistent wayfinding on every page (incl. deep-linkers).
Global nav must not shape-shift; homepage onboarding is additive.

### Task-first global nav
**Despre · Servicii · Proiecte · Contact** (+ language; logo → Home). *Mapping:* Despre → About · Servicii → Services · Proiecte → Work archive · Contact.

### Conditions (task-first valid only if)
(1) Servicii & Proiecte both expose the two pillars; (2) pillar hubs are first-class landing pages; (3) Reality Capture work fully in the archive as first-class Work Entries.

---

## Step 2 — Sitemap, URLs & page responsibilities (LOCKED)

### 2.1 Sitemap
```
/                                Home — narrative onboarding
├── /despre                      About
├── /servicii                    Services index — opens with the two-pillar fork
│     └── /servicii/[serviciu]   Service page
├── /proiecte                    Work archive — all Work Entries; pillar toggle + filters
│     ├── /proiecte/[proiect]         Work Entry — single canonical URL (incl. cross-pillar)
│     ├── /proiecte/concursuri        Curated route — Competitions
│     └── /proiecte/experienta-profesionala   ⛔ RETIRED 2026-08-14 — 404; slug stays reserved
├── /arhitectura-design          Pillar hub A — standalone landing   [slug open]
├── /reality-capture             Pillar hub B — standalone landing   [slug open]
├── /contact                     Contact — service-aware inquiry
└── supporting                   /confidentialitate · legal/imprint · 404 · sitemap.xml · robots.txt
                                  (EU-funding = footer element + About context, not a page)
```

### 2.2 URL conventions
- Lowercase, hyphenated, localized slugs; ≤2 levels for content; hubs at depth 1.
- One canonical URL per Work Entry (incl. cross-pillar). Flat Service URLs.
- Curated routes only when stable + distinct intent + externally linkable → Competitions, Professional Experience. Other facets = filter states → `/proiecte`.
- **Reserved-slug policy (F4):** curated-view slugs (`concursuri`, `experienta-profesionala`, and any future curated routes) are reserved and cannot be used by Work Entries. The CMS validates every Work Entry slug against the reserved list — **per locale** (so localized slugs stay protected in the multilingual version) — before publication. A build-time validation rule that protects the shared `/proiecte/` namespace; no new route segments, no routing/URL change.
- i18n: RO at root, EN under `/en/`, localized slugs, hreflang + `x-default` (slug detail deferred).

### 2.3 Content-object relationships *(amended 2026-08-13)*
Project ⇄ Service (many-to-many, **1..N and mandatory**, constrained to the project's Pillar). Project → facets (**Pillar ×1 authored**, Sector, Labels 0..N, Status, Year; Attribution and Employer 0–1 as display-only credit). Project ⇄ Project (related — **now also how work spanning both pillars is modelled**). Service → Pillar. Pillar hub = aggregation view. Curated view = saved filter + order. Professional Experience = Attribution=Studio grouped by Employer.
**Inbound to hub (F1):** Service page → its parent Pillar hub (contextual back-path); relevant projects → **their Pillar** hub where it aids orientation. **M2 is simplified, not withdrawn:** default contextual navigation follows the project's Pillar — which is now simply *its* Pillar, since a project belongs to exactly one. There is no primary/secondary pillar pair and no cross-pillar entry. Contextual in-page links only — no routing change; hubs stay out of the global nav.

*Superseded wording: "Pillar 1+opt.2nd, Discipline, Entry Type … cross-pillar pair … Primary Pillar."*

### 2.4 Navigation flows
1. Undecided/social: Home → self-segmentation → hub → work/service → Contact.
2. Architecture client: Home / `/proiecte` / hub → Work Entry → related → Contact.
3. Institutional scanning (deep link): `/servicii/scanare-3d` → proof entries → hub → Contact.
4. Agnostic: Home → `/proiecte` → browse → Work Entry → Professional Experience → Despre.
5. Cross-pillar: Work Entry (both pillars) → linked entries.
6. Lateral: persistent global nav.

### 2.5 Page-type responsibilities (single purpose; "does not" protects it)
- **Homepage** — one identity, both capabilities, route. *Not:* sell/archive.
- **About** — trust in architect/practice. *Not:* deep portfolio/service pitch.
- **Services Index** — orient & route (forked by pillar); **task-oriented entry point** — forks directly to grouped Service pages (the Pillar Hub is not a required stop). *Not:* detail/sell; never a flat list.
- **Pillar Hub** — introduce a capability; topical gateway; **editorial entry point** into a whole practice area (reached from the Homepage and via contextual links), *not* a mandatory step in the Services task flow. *Not:* convert on a service / list the full archive.
- **Service Page** — explain one service & convert; provides a contextual path back to its parent Pillar hub. *Not:* general overview/full browse.
- **Work Archive** — browse/discover; canonical index. *Not:* editorial curation/conversion.
- **Curated View** — a focused editorial slice. *Not:* replace the exhaustive filter/convert.
- **Work Entry** — evidence, honest scoped authorship; may surface its **Primary Pillar** hub where it aids orientation (default contextual navigation follows the Primary Pillar — M2). *Not:* pitch/explain a service.
- **Contact** — qualified, service-aware inquiry. *Not:* explain services/nurture.
- **Supporting** — legal/compliance/system; 404 recovers.

**Anti-cannibalization (canonical-intent layering — escalating specificity, not a mandatory click path):** Services — Index → Hub → Service page. Work — Archive → Curated view → Work Entry. *The Services ladder orders page types by intent (breadth → capability → offer) for canonical/SEO separation; it does not force the Pillar Hub into the Services task flow — see Step 6 "Two convergent journeys".*

---

## Step 3 — Homepage IA & designer-concept reconciliation (LOCKED)

### 3.1 Jobs (fixed) — order is not
J1 one practice · J2 both capabilities + self-segmentation · J3 credibility · J4 breadth · J5 services · J6 contact. Credibility splits: practice-level trust (may precede fork) + per-pillar proof (after branching).

### 3.2 Structural responsibilities (function-level; visual is designer's)
- **Early self-segmentation** after the identity moment; both pillars as co-equal entry points.
- **No structural primacy** of either pillar. Editorial order of pillar sections is a design decision, not IA.

### 3.3 Reconciliation & six minimum changes
Designer concept preserved. Changes: (1) early self-segmentation; (2) no structural primacy (no reordering mandated); (3) MAAI → Professional Experience (keep Competitions); (4) RC works as Work Entries; (5) pillar-group the Servicii dropdown; (6) real practice-level credibility copy. Designer's freedom includes the editorial order of the two pillar sections.

---

## Step 4 — Work Section: Discovery Model (LOCKED)

**Mental model** — Archive is a **library**; two co-equal wings; one canonical entry at escalating zoom (highlight → hub → curated view → archive → entry); explore, not be sold to.
**Key principles** — Browse is default; pillar is a prominent co-equal toggle; curated views absorb complex taxonomy; deep richness on entry pages; surfaces differ by job.
**Decisions** — `/proiecte` opens both pillars, either viewable cleanly; small visitor-friendly filters; ordering supports discovery + balanced representation; RC entries structurally identical Work Entries; complex/rare lookups → curated views.
**Trade-offs** — Browse-both-default; small filter set; balanced-representation upkeep — accepted.

---

## Step 5 — Work Archive: Filters, Ordering & Curated Views (LOCKED)

**Key principles** — Consistent filter structure across pillars; filters refine, never gate; Service stays on entry pages and drives Services/hubs. ~~**Attribution, Employer, Role and Authorship are display/crediting information only — not visitor filters or browse axes.**~~ *(v3.1: those fields are **retired**. The principle they protected — that crediting is never a browse axis — is preserved and now trivially so: `Colaboratori` and `Echipă` are display-only and are not filters.)*
**Decisions** *(amended 2026-08-13)*
- **Pillar toggle:** All · Architecture & Design · Reality Capture (All default). Unchanged.
- **Shared filters (both pillars): Sector + Label.** *(was: Entry Type + Sector — Entry Type no longer exists)*
- **Service is the contextual refinement, and it is now available in BOTH pillars.** *(was: Discipline for A&D, Service for RC)*
- **Year = sort, not filter;** default sort = discovery order (curated + balanced pillars), alternate = Year. Unchanged.
- Curated views reachable from the archive, linking back to the full archive. Unchanged.
**Rationale** *(amended)* — The original rationale was that neither Discipline (coarse in RC) nor Service (absent on non-commissioned A&D) worked as a shared sub-axis. **Both halves of that objection are gone:** Discipline no longer exists, and Service is now mandatory on every project, in both pillars. Service is therefore the correct shared refinement.
**Trade-offs** — Consistent set + one contextual refinement; Year as sort; discovery-order upkeep — accepted.

### 5.1 Professional Experience (Curated View — subsection)
> **⛔ THIS CURATED VIEW IS PERMANENTLY RETIRED — product decision 2026-08-14 (`DECISIONS_LOG.md` #97).** Attribution and Employer are gone, and **no replacement membership rule is to be designed.** The **About / Despre** page (Step 7) is the surviving home for professional-background content. `/proiecte/experienta-profesionala` and `/en/projects/professional-experience` will 404; **both slugs remain reserved** (§2.2 F4) so no project can claim a historical URL. The subsection below is retained as a record of what the view was, not as a specification.

- **Scope:** ~~Studio-attributed entries only.~~ **Retired — no scope.** **Collaboration is discoverable through normal archive browsing and through the crediting shown on each project — there is no attribution filter** (F2; v3.1: no Attribution field either).
- ~~**Grouping & order:** by Employer (grouping metadata, not its own page); employers by recency, entries by editorial priority.~~ *(v3.1: Employer is retired; the grouping key is gone with it.)*
- **Value:** narrative of professional experience + transparent crediting, beyond a filtered list.
- ~~**Credit-display rule:** belongs to Studio-attributed Work Entries (foreground Employer + Role + scoped Authorship), not the view.~~ *(v3.1: crediting is `Colaboratori` + `Echipă` on the project, still a property of the project rather than of the view.)*
- **Route:** ~~`/proiecte/experienta-profesionala`; reachable from archive and homepage (MAAI gallery).~~ **Retired 2026-08-14 — the route 404s and is linked from nowhere; the slug stays reserved in both locales.**

---

## Step 6 — Services Architecture (LOCKED)

**Mental model** — Services = the offering, Work = the proof; two faces of one practice; a Service page is a conversion destination backed by evidence pulled from Work; one canonical Service object, referenced not copied.
**Key principles** — Service owns the offering, Work Entry owns the evidence; cross-reference by link not duplication; Service = conversion, Work Entry = credibility; curated proof widens to the archive.
**Decisions**
- Service page responsibility: **explain the service, build trust, drive conversion, supported by relevant Work Entries**.
- Cross-reference: Work Entry ⇄ Service many-to-many; the entry stores the reference; the Service page renders demonstrating entries dynamically (curation picks which/order).
- Movement: proof ⇄ offering loop.
- Not every entry demonstrates a Service.
- **Empty "Demonstrated by" state (F5):** Service pages are fully publishable with **zero** linked Work Entries. With ≥1 linked entry → show the normal "Demonstrated by" section. With none → **do not** render an empty grid/carousel/counter or the "Demonstrated by" heading; instead show a concise editorial message (relevant examples being added) + a clear **Contact CTA**, and keep the contextual back-path to the parent Pillar hub. The rest of the page (description, benefits, process, deliverables, FAQs) stays fully available. The CMS surfaces the zero-linked state to editors as a **non-blocking** warning/info state. *(Scope note: this rule is in IA because a Service being publishable with zero links touches the Service–Work relationship and publication safety. The empty-state UI of the **aggregate pages** — Pillar Hubs, Curated Views — is a pure presentation concern and is deferred to Page IA / Wireframing — M3.)*
- **Arrival = intent mapping:** Understand a service → Service Page; Evaluate the work → Work Entry.
- Placement: Services index (forks by pillar) → Service pages; pillar hub frames the capability + links to services/work. **Hub discoverability (F1):** each Service page provides a contextual back-path to its parent Pillar hub, and relevant Work Entries may surface theirs — keeping hubs discoverable throughout the journey (incl. deep-linkers) without adding them to the global nav or changing routing.
- **Two convergent journeys (M1):** the Services forward flow serves two equally valid, intentionally-coexisting **user intents** that converge on the same Service pages — *not* two architectures. **(a) Exploratory / editorial:** the Homepage naturally leads users into the appropriate **Pillar Hub** (an editorial entry point that introduces a whole practice area) before they continue to individual Service pages. **(b) Task-oriented:** the **Services index** lets visitors who already know what they need browse grouped Service pages directly, without first passing through the Pillar Hub. The Pillar Hub stays discoverable via contextual navigation and internal links (incl. the Service→hub back-path) but is **not a mandatory step** in the Services task flow. This distinguishes *user intent*, not Information Architecture: routing, page types, and the nav philosophy are unchanged.
**Trade-offs** — Curated proof widens to archive; many-to-many linking (no duplication); no-service entries carry no cross-link — accepted.

---

## Step 7 — Supporting Pages (LOCKED)

**EU-funding acknowledgment**
- **Default: footer acknowledgment (logo + short statement, site-wide) + a sentence of About context. No dedicated page** unless the applicable programme rules explicitly require more extensive disclosure.

**Contact — service-aware by context, not more fields**
- One simple form (name, email, message) + one **optional broad topic selector** (Architecture & Design / Reality Capture / Not sure).
- **Two contextual prefills, not extra fields:** a broad `Topic` (e.g. Reality Capture) **and** the exact originating `Regarding` service (e.g. 3D Scanning), passed from the Service page / pillar the visitor came from.
- One inbox; detailed scanning requirements qualified in follow-up, not upfront.

**Per-page summary**

| Page | Responsibility | Entered from | Primary action | Type |
|---|---|---|---|---|
| **Contact** | Convert intent into a qualified, service-aware inquiry | Global nav, Service/hub CTAs, homepage | Submit inquiry | Standalone |
| **About (Despre)** | Trust in architect/practice; carries EU-funded expansion narrative | Global nav, homepage credibility | **No dominant CTA**; clear onward paths to Work, Services, Contact | Standalone |
| **Privacy / GDPR** | Data & cookie disclosure | Footer, cookie banner | None | Utility/footer |
| **EU-funding** | Mandatory funding visibility | Footer (+ About) | None | Footer element (not a page) |
| **Legal / imprint** | Legal identity / terms | Footer | None | Utility/footer |
| **404** | Recover a lost visitor | Broken/expired URLs | Route back (Home/Work) | System |

*(sitemap.xml, robots.txt = technical, not pages.)*

**Trade-off** — Simple Contact means a scanning quote isn't fully qualified upfront (object/location/deliverable) — accepted; captured in follow-up to protect form simplicity.

---

## Open (non-blocking, carried into design/build)
*(2026-08-13: "Visualization as its own discipline vs service/role" is **closed** — Discipline no longer exists, and visualization is a Service in each pillar. 2026-08-14 (v3.1): "possible future 'Academic' Attribution" is **closed as moot** — there is no Attribution axis. Newly open, all UI/editorial rather than model questions: whether Labels get their own filter control or only the existing curated view; whether the Service refinement is offered under the "All" pillar mode; ~~what the *Experiență profesională* view is built from~~ — **closed 2026-08-14: the view is permanently retired**.)*

Multi-select within a facet; inline vs expander rendering of the contextual refinement (design-step); **empty-state UI for aggregate pages (Pillar Hubs, Curated Views) — deferred to Page IA / Wireframing (M3): the IA defines these pages' existence and relationships, not their empty-state presentation**; pillar-hub public names; i18n slug-localization detail + fallback; confirm the EU programme's exact publicity rules; point-cloud showcase fidelity (UX/tech); credibility copy authoring; possible future "Collection" object.
