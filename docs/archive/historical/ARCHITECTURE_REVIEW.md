# Independent Architecture Review — Atelier Portfolio (IA Sign-off)

**Reviewer role:** Principal Information Architect, independent pre-implementation review (not the author of this IA).
**Date:** 2026-07-30.
**Scope reviewed:** `CONTENT_MODEL.md` (v2.1, frozen), `CONTENT_MODEL_VALIDATION.md`, `INFORMATION_ARCHITECTURE.md` (Steps 1–7, locked), `NAV_DECISION_RECORD.md`, `DECISIONS_LOG.md`, `DISCOVERY_REVIEW.md`, `PROJECT_CONTEXT.md`.
**Stance:** Assumes every locked decision was deliberate. Challenges only real structural problems, internal contradictions, or scalability/discoverability gaps — not preferences. Does not redesign the IA.

---

## Verdict first

**Architecture Score: 8.5 / 10. Confidence: High (~90%). Recommendation: YES — WITH MINOR CHANGES.**

Strong, senior-grade IA. The content model's separation of *identity / taxonomy / curation* is the best decision in the system and is what will keep the site from rotting as the portfolio grows. Page responsibilities are unusually disciplined; task-first navigation is correctly reasoned. **No Critical issues; no structural flaw requiring the model to reopen.** Two Major-severity gaps and a few Minor items. Both Majors are **specification gaps closable in the wireframe/UX step** (add edges; reconcile two sentences) — neither changes a page type, object, or route. Severity ≠ size-of-fix: "Major" here means "close before development," not "redesign."

---

## Strengths (stated explicitly)

1. **Three-way separation of concerns (identity / taxonomy / curation)** — re-curate the homepage without re-classifying entries. The load-bearing good decision; most portfolio sites lack it and degrade in 2–3 years.
2. **Single "Work Entry" object** (not Project vs. Engagement) with scoped *Attribution / Role / Authorship* — honest crediting via fields, no over-engineering of a solo practice; validated against 10 real cases including competition-while-employed.
3. **Service as a first-class object with bidirectional "demonstrated-by"** — credibility (portfolio) feeds conversion (services) by reference, not duplication; directly serves the dual goal.
4. **Task-first nav + two-layer model with three explicit validity conditions** — avoids schema-as-menu, reads as one practice, scales flatly, and knows what would invalidate its own choice.
5. **Single-purpose page types with "does NOT" boundaries + anti-cannibalization ladders** — prevents responsibility drift and SEO self-competition.

---

## Findings

### 🟠 F1 — Pillar hubs are declared first-class but their inbound edges are unspecified (sitemap contradicts the model) — Major
**Why it matters.** `NAV_DECISION_RECORD.md` §5 makes "dedicated pillar hubs… reachable and cross-linked" one of the three conditions under which task-first nav is valid at all. Hubs are also the topical-authority SEO pages for the scanning line. A first-class page that is weakly reachable fails both jobs.
**Evidence.** Hubs are (correctly) not in the global nav, so Layer 2 never exposes them; the only every-page navigation. Stated reachability is the homepage fork (Layer 1) + cross-links — but Layer 2 exists for **deep-linkers who never see the homepage**, and the footer (Step 7) holds only EU-funding/privacy/legal, not the hubs. The sitemap routes `/servicii → /servicii/[serviciu]` directly (§2.1), with no edge to the hub, contradicting the implied *Index → Hub → Service* flow; §2.3 says the hub links *to* services/work, not that services link *to* the hub.
**Fix (additive).** Route the Services-index fork *through* the hub (removes the F-overlap), and/or surface both hubs in the footer as a persistent secondary tier. Footer alone is cheap, keeps top nav task-first, and gives deep-linkers + crawlers a persistent path and internal-link equity.
**Impact if ignored.** Hubs ship effectively orphaned — weak internal linking (poor topical authority, the opposite of their purpose) and invisible to the deep-linker segment. Rewiring post-build is materially more expensive than specifying edges now.

### 🟠 F2 — "Collaboration discoverable via attribution filters," but the finalized filter set has no attribution filter — Major
**Why it matters.** Direct contradiction between locked docs, affecting a required category. `PROJECT_CONTEXT.md` requires communicating *collaboration*; `DISCOVERY_REVIEW.md` calls attribution "a first-class navigation axis." Implementers cannot build the archive against disagreeing specs.
**Evidence.** Step 5.1 / `DECISIONS_LOG.md` Batch 11: "Collaboration stays discoverable via archive + attribution filters." But the locked visitor filter set (Step 5; `CONTENT_MODEL.md` §5) is Pillar toggle · Entry Type · Sector · one contextual refinement (Discipline/Service) · Year-as-sort — **no Attribution filter**; Attribution-adjacent fields are display-only. Studio work has a route (Professional Experience), Independent is default, but **Collaboration has no visitor-navigable path**.
**Fix.** Resolve explicitly: (a) accept Attribution as a display/credit axis (not browse) and correct Step 5.1 to say collaboration surfaces on entry pages / via browse, not a filter; or (b) if browse-by-authorship is a real need, add Attribution as a filter (relaxing the small-filter-set trade-off). Lean (a); don't ship the contradiction.
**Impact if ignored.** A promised required category is silently un-discoverable, or the filter component is built against two conflicting specs — rework at QA.

### 🟡 F3 — Named long-tail SEO intersections have no committed indexable route — Minor
**Why it matters.** Acquisition is co-equal-critical; docs name "heritage 3D scanning [city]" as a target. The intersection has no committed landing.
**Evidence.** Only two curated routes are locked (Competitions, Professional Experience). Sector×Service intersections are filter states, and §6 rightly says not to index arbitrary combinations. "Selected Heritage Work" is named as a *possible* view, not a route.
**Fix.** No new mechanism — promote SEO-critical intersections (start with heritage×scanning) to committed, canonicalized curated routes; write the keyword→page canonical map (`DECISIONS_LOG.md` #22's "one purpose per page type" reduces but doesn't alone prevent hub/archive/service overlap on a shared query).
**Impact if ignored.** Under-serves the site's own stated commercial targets; recoverable post-launch.

### 🟡 F4 — Curated-view and Work-Entry slugs share one namespace under `/proiecte/` — Minor (technical)
**Why it matters.** Routing correctness. `/proiecte/concursuri` (curated) and `/proiecte/[proiect]` sit at the same level; a Work Entry slugged `concursuri`/`experienta-profesionala` collides — and with localized RO/EN slugs the reserved set multiplies per locale.
**Evidence.** §2.1 places curated routes as siblings of `[proiect]`; §2.2 commits to localized slugs but defines no reserved-slug policy.
**Fix.** Reserve curated slugs per locale (CMS-validated at entry time) or namespace them (e.g. `/proiecte/colectii/…`). Trivial now, a live bug later.
**Impact if ignored.** A published entry silently shadows (or is shadowed by) a curated route — intermittent wrong-page/404 once real content lands.

### 🟡 F5 — Empty "demonstrated-by" Service-page state is undefined — Minor (edge case: future services)
**Why it matters.** Services are authored independently of Work; a Service with **zero** linked entries is common at launch, for new offerings, or when proof is NDA'd — directly the mandated "future services" case.
**Evidence.** Step 6 renders demonstrating entries dynamically; no doc defines the empty state.
**Fix.** Specify: Service page still explains/converts on its own copy; proof module hidden or replaced by a pillar-level fallback, never an empty strip.
**Impact if ignored.** The newest, EU-funded RC services — most likely to launch proof-thin — render with an empty credibility section exactly where the practice is growing.

### 🟡 F6 — `CONTENT_MODEL_VALIDATION.md` still lists "Built" as an Entry Type, contradicting the frozen model — Minor (doc hygiene)
**Why it matters.** Every doc is source of truth; modeling Entry Type from the validation examples yields the wrong enum.
**Evidence.** Frozen `CONTENT_MODEL.md` §3 moves "Built" to *Status* (`DECISIONS_LOG.md` #11); the validation doc uses `Type: Built` (P2/P4) and its R6 "finalizes" the Type list including "Built." The freeze superseded it without annotation.
**Fix.** Add a one-line superseded-note atop the validation doc. No model change.
**Impact if ignored.** Mis-modeled Entry Type enum, caught late.

---

## Observations (notes only)

- **🔵 O1 — "Third pillar without restructuring" holds for the data model and top nav, not the UX.** The binary fork, All·A&D·RC toggle, and "two co-equal wings" are hard-coded to two; a third pillar would need UX rework (acceptable, remote — just note the claim is optimistic about the presentation layer).
- **🔵 O2 — No-service Work Entries are conversion-quiet by design.** "Evidence, not pitch" means their only conversion paths are related-works + global-nav Contact. Consistent with the page-responsibility split; sits in mild tension with "CTAs woven throughout." Consider a lightweight non-pitch contact affordance on entry pages.
- **🔵 O3 — Single 3-field Contact is a conscious trade-off with a known cost.** Fine for simplicity, but institutional RC leads often expect object/location/deliverable/accuracy. Monitor post-launch; progressive (optional) disclosure is the model-consistent next step if lead quality suffers.
- **🔵 O4 — Cold-start balance vs. co-equal-prominence.** RC (new, EU-funded) will likely be entry-thin at launch. The structure is right to keep co-equal slots; flag for design so the RC side degrades gracefully rather than looking empty.

---

## Per-perspective assessment
- **Information Architecture — Strong.** Clean ownership/hierarchy/integrity; gaps are hub discoverability (F1) and the attribution axis (F2).
- **Content Model — Very strong.** References-not-copies, explicit many-to-many relationships, genuinely extensible; only empty-relationship rendering is under-defined (F5).
- **User Experience — Strong with one gap.** Well-formed entry/exit points, no true dead ends; weak spots are the deep-linker→hub path (F1) and collaboration browse (F2); conversion-quiet entries are a deliberate, monitorable choice (O2).
- **Technical Readiness — Good, CMS-friendly.** Values-not-sections and references-not-copies make a clean build; pre-build must-fixes are localized — slug namespace (F4), indexation/canonical policy (F3), empty states (F5).
- **Edge Cases — Well-handled.** Projects without services, cross-pillar/composite, competition-while-employed, viz-only crediting all representable and stress-tested; under-covered are services without proof (F5) and collaboration discoverability (F2).

---

## Sign-off summary

**Architecture Score: 8.5 / 10. Confidence: High (~90%)** — all eight source docs available, detailed, cross-referenced; residual uncertainty is only intent-vs-written-down on a couple of gaps.

**Top 5 strengths:** (1) identity/taxonomy/curation separation; (2) single Work Entry with scoped crediting, stress-tested; (3) Service first-class with bidirectional demonstrated-by; (4) task-first two-layer nav with explicit validity conditions; (5) single-purpose page types with "does NOT" boundaries.

**Top 5 weaknesses:** (1) pillar-hub inbound edges unspecified / sitemap contradiction (F1, Major); (2) attribution-filter promise vs. locked filter set (F2, Major); (3) no committed route for named long-tail SEO (F3); (4) curated/entry slug namespace collision (F4); (5) undefined empty demonstrated-by state (F5).

**Implementation Risk: Low-to-Moderate.** CMS-friendly model; risks localized and identified pre-build. Larger execution risks (scroll-pinned motion, point-cloud performance, LCP/CLS) are real but belong to the UX/tech phase, out of IA scope.

**Would I approve this IA for production? YES — WITH MINOR CHANGES.** Sign off as fundamentally sound and ready for wireframes/UX, conditional on closing two pre-build items: (F1) define hub inbound edges — at minimum a persistent footer path, ideally routing the Services fork through the hubs; and (F2) reconcile the collaboration/attribution-filter contradiction in one direction. Both are additive clarifications for the wireframe step — no page type, object, or route needs redesign. F3–F6 should be scheduled but are not blocking. F1/F2 are labeled "Major" because they should close before development, not because the model must reopen — hence *minor changes*, not major. A team preferring strict gating may treat F1/F2 as blocking; the underlying architecture stands either way.
