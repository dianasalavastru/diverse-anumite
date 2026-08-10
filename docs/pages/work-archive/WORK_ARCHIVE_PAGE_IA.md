# Work Archive Page IA — authoritative blueprint

The Work Archive defined as an **information-architecture object** — the **canonical browse surface** of the Work model. **One archive**, exposed through a pillar scope, a small filter set, and curated views (editorial slices). Its responsibility is deliberately narrow and protected: help visitors **discover and browse** work — nothing more.

Authoritative inputs (do not reopen or reinterpret): `HOMEPAGE_PAGE_IA.md`, `HUB_PAGE_IA.md`, `SERVICE_PAGE_IA.md`, `WORK_ENTRY_PAGE_IA.md`, `INFORMATION_ARCHITECTURE.md`, `CONTENT_MODEL.md` (frozen v2.1), `NAV_DECISION_RECORD.md`, `ARCHITECTURE_REVIEW_02.md`, `DECISIONS_LOG.md`.

Level: Page IA (not UI). No wireframes, layout, or styling. **Why precedes what.** Status: authoritative (2026-07-30).

**Arrival assumption.** Visitors may arrive from a Hub ("see all work"), a Service ("see more"), a Curated View, search, or a direct link. The page must **always** make legible: which archive they are viewing, which **pillar** scope, whether **filters are active**, and how to **broaden or continue** browsing — never a wall of results without context.

---

## 1. Archive responsibility

**Primary purpose:** help visitors **confidently discover and browse** the body of work — understand what exists, move through it, narrow or broaden, and choose which Work Entry to open next. **Success is measured by exploration, not conversion.**

**User questions it answers**
- What kind of work exists here?
- How can I browse it?
- Can I narrow it down?
- Which project should I open next?

**What it intentionally does NOT do** (these belong elsewhere)
- Does not explain services — **that's the Service page.**
- Does not persuade — **it enables exploration, not conversion.**
- Does not tell the practice story — **that's About.**
- Does not present a project in depth — **that's the Work Entry.**

**Relationship to the rest of the architecture**
- **Homepage** — highlight modules route into curated views / hubs, not the raw archive; the archive is reached via global nav "Proiecte."
- **Hub** — curates a selection and hands off to the archive **filtered to its pillar** ("see all [pillar] work").
- **Service** — "see more" hands off to the archive filtered to the relevant pillar/scope.
- **Curated Views** — **editorial slices of this same archive** (Competitions, Professional Experience), not separate archives; they share the browse family and route onward to Work Entries.
- **Work Entry** — the canonical destination of a browse; result previews route to Work Entries.
- **Contact** — reachable only through global navigation (the archive does not solicit).
- **About** — none.

---

## 2. Information flow (sequence of visitor understanding)

Stages of understanding, not visual layout.

**Stage A — Orientation.**
- *Understand:* where am I, and what archive am I looking at — which pillar scope, and whether filters are active.
- *Why:* many arrivals are cold or pre-filtered (Hub, Service "see more," Curated View); the visitor must know their current context before browsing.
- *Hands next:* into the scope of available work.

**Stage B — Scope.**
- *Understand:* what kind of work exists here — its character and breadth, across both pillars by default (or the pillar/curated slice they arrived in).
- *Why:* convey not only quantity but the character and breadth of the practice, so browsing feels navigable rather than endless.
- *Hands next:* into browse & refine.

**Stage C — Browse & refine.**
- *Understand:* how to narrow or broaden exploration — without being overwhelmed.
- *Why:* browse is the default and is valuable with zero filters; a **small** filter set + pillar toggle + sort support (never replace) browsing.
- *Hands next:* into results.

**Stage D — Results.**
- *Understand:* the matching work, as **previews that are evidence signposts** — never full projects.
- *Why:* the archive routes to Work Entries; it does not present them in depth (that's the Work Entry's job).
- *Hands next:* open a Work Entry — or adjust the browse.

**Stage E — Continue.**
- *Understand:* the ways forward — open a Work Entry, change filters, switch pillar, or return to the Hub.
- *Why:* keep exploration fluid and reversible.
- *Hands next:* **Work Entry**, refined **Archive**, **pillar switch**, **Hub**.

*(Persistent Layer-2 global nav + footer are inherited, not an archive-specific stage.)*

---

## 3. Module inventory (each owns exactly one responsibility)

**A-1 · Archive orientation module** *(Stage A)*
- *Why:* tell the visitor which archive/browse surface they're on.
- *Question:* where am I / what am I browsing?
- *Consumes:* the archive/curated-view identity + current pillar scope.
- *Destinations:* none (orientation).
- *Dependencies:* pillar scope / curated-view context.

**A-2 · Pillar toggle module** *(Stage C, control)*
- *Why:* the primary, co-equal scope control — All · Architecture & Design · Reality Capture (**All** default).
- *Question:* which capability's work do I want (or both)?
- *Consumes:* Pillar scope.
- *Destinations:* re-scopes the archive (stays within the archive).
- *Dependencies:* pillar facet.

**A-3 · Active context / breadcrumb module** *(Stage A/C, readout)*
- *Why:* make the *current state* legible — pillar + any active filters — and offer to broaden/clear. (Distinct from A-2: A-2 is the control; A-3 is the readout + "clear/broaden.")
- *Question:* why do these results appear, and how do I broaden?
- *Consumes:* active pillar + filters + sort.
- *Destinations:* clear/broaden (re-scopes within the archive); Hub back-path where a pillar scope is active.
- *Dependencies:* filter/sort state.

**A-4 · Filters module** *(Stage C)*
- *Why:* let a directed visitor narrow — kept **small and visitor-friendly**; filters *refine*, never gate. **Filters should progressively reduce complexity rather than expose the underlying taxonomy** — the internal information structure stays largely invisible to visitors.
- *Question:* can I narrow this down?
- *Consumes:* **shared filters (Entry Type + Sector)**; **one pillar-contextual refinement** (Discipline for A&D, Service for RC); **Year = sort, not filter**. No Attribution filter (F2).
- *Destinations:* re-scopes results (within the archive).
- *Dependencies:* the locked filter set (Step 5). **Filters never duplicate curated views** (mechanical facets vs. editorial slices).

**A-5 · Results module** *(Stage D)*
- *Why:* present matching work as **evidence-signposting previews**, ordered to support discovery with balanced pillar representation. **Results should help visitors decide which Work Entry deserves deeper attention, rather than presenting projects in depth** — the archive is a signposting surface, not an evidence page.
- *Question:* which project should I open next?
- *Consumes:* Work Entry previews (curation-informed ordering; balanced across pillars when scope = All).
- *Destinations:* **individual result → its Work Entry** (the fixed behaviour here — the archive *is* the canonical browse surface, so results route to Work Entries).
- *Dependencies:* Work Entries; ordering strategy (Step 5).

**A-6 · Empty-state module** *(Stage D, no matches)*
- *Why:* an empty result must never feel like an error (parallel to the Service page's F5 philosophy).
- *Question:* why nothing, and what now?
- *Consumes:* the active scope/filters (to explain the "why").
- *Destinations:* **adjust/clear filters**, **switch pillar**, or **return to broader browsing / Hub** — always with guidance; **never a bare empty grid.**
- *Dependencies:* filter state.

**A-7 · Continue / Hub back-path module** *(Stage E)*
- *Why:* keep exploration fluid and reversible.
- *Question:* where do I go from here?
- *Consumes:* pillar/Hub context.
- *Destinations:* refined **Archive**, **pillar switch**, parent **Hub** (F1-style back-path where a pillar scope is active).
- *Dependencies:* Hub.

*(Persistent global nav + footer are inherited, not archive-specific modules.)*

---

## 4. Navigation integration

**Position in the overall journey**
- **Homepage → Hub → Archive → Work Entry**
- **Service → "see more" → filtered Archive → Work Entry**
- **Curated View (editorial slice) → Work Entry** (a curated view is an archive-family browse surface; discovery converges on a browse surface before an individual entry)

**Inbound paths** — Homepage (via global-nav "Proiecte"); Hub ("see all work" → pillar-filtered); Curated Views (Competitions, Professional Experience); Service ("see more"); search; direct links.

**Outbound paths**
- **→ Work Entry** (results).
- **→ filtered Archive** (refine — stays within the archive).
- **→ Hub** (back-path where a pillar scope is active).
- **→ pillar switch** (within the archive).
- **→ Contact** (only via global navigation — the archive does not solicit).

**Canonical-intent split (anti-cannibalization):** Archive = **browse**; Hub = category/head term; Service page = specific/conversion; Work Entry = evidence for one project. The archive owns browse intent and does not compete with the others.

### Important architectural principles (reinforced)
- **Browse is the primary responsibility;** search and filtering **support** it, never replace it.
- **Curated Views are editorial slices, not separate archives.**
- **Results are previews that route to canonical Work Entries.**
- **Filters never duplicate the role of Curated Views** (mechanical facets vs. editorial framing; and per F2, attribution is crediting, not a filter).
- **The Archive never becomes a Service page** and **never becomes a Work Entry.**

---

## 5. Success criteria (Page-IA, not aesthetic)

The Archive succeeds when visitors can:
- **understand what they're browsing** (which archive, which pillar);
- **understand why the current results appear** (active pillar/filters are legible);
- **confidently refine or broaden** exploration without being overwhelmed;
- **reach the right Work Entry;**
- **never confuse the Archive with a Service page or a Hub.**

Plus:
- **Empty-state integrity:** a no-match result explains why, preserves context, and offers a way forward — never a bare empty grid.
- **Consistency with the finalized IA:** expresses the locked discovery model (library; browse default; pillar as a prominent co-equal toggle; small visitor-friendly filters + one pillar-contextual refinement; Year as sort; curated views absorb complex taxonomy; attribution is not a filter, F2; canonical-intent split). **No IA concept missing or added.**

**Its goal is confident exploration, not persuasion.**

**Concrete pass/fail tests**
- A visitor **always knows** which pillar/scope they're in and whether filters are active.
- Browsing is **valuable with zero filters** (browse default).
- The filter set is exactly the locked small set (Entry Type + Sector + one pillar-contextual refinement; Year as sort); **no Attribution filter** (F2).
- An **empty result** gives guidance and preserves context — never a bare empty grid.
- **Result previews route to Work Entries;** the archive never presents a full project.
- **Curated views behave as editorial slices** of the same archive, not separate archives, and filters do not duplicate them.

---

## Evolution rule
New **filters, facets, or curated views** should **extend the browsing system without changing the Archive's primary responsibility** (discover & browse). Specifically: new facets stay **small and visitor-friendly** (Step 4); **complex or rare lookups become curated views, not permanent filters** (Step 5); **attribution stays crediting, never a browse axis** (F2). **Future archive growth should primarily happen through richer content rather than a larger browsing interface.** This keeps the Archive a stable architectural contract, not a description of today's implementation.

## System coherence (why the Archive completes the set)
- The **Homepage** helps visitors understand the practice.
- The **Hub** helps visitors understand a capability.
- The **Service** helps visitors understand a solution.
- The **Work Entry** helps visitors independently assess evidence.
- The **Work Archive** completes the system by helping visitors **confidently explore evidence** — without duplicating any responsibility above.

Together, these Page IA documents define a **complete information-architecture language for the website** — every page has a single responsibility, every transition is intentional, and every visitor journey is built around understanding before persuasion.

## Open (carried into wireframing / dependencies)
Whether A-2 (toggle) and A-3 (context readout) are authored as one control or two; result ordering strategy detail (Step 5 open item); multi-select within a facet (Step 5 open item). The Archive depends on Work Entries and the curated-view routes existing. Remaining core Page IA: **Contact**.
