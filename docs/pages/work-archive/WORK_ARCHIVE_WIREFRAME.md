# Work Archive Wireframe — low-fidelity structural specification (canonical template)

**The canonical structural wireframe for the Work Archive** — the surface where visitors **discover** individual projects. It expresses the Work Archive Page IA **spatially** and nothing more. It introduces **no new IA, no new Page IA, no new components, and no new visual direction.**

**The Archive is a discovery tool, expressed through browsing rather than storytelling.** Unlike the Homepage, Hub, and Service pages (which are linear stories), the Archive is a **navigable library**: a quiet, persistent control region framing a results region. Its goal is **confident discovery, not conversion.**

Level: **Low-Fidelity Wireframe**. Status: **authoritative**.

Derived exclusively from: `WORK_ARCHIVE_PAGE_IA.md`, `PAGE_IA_INDEX.md`, `COMPONENT_INVENTORY.md`, `WIREFRAMING_GUIDELINES.md`, `VISUAL_DIRECTION.md`, `CONTENT_MODEL.md`.

**Inherits (applies, does not restate):** Central Design Principle · Narrative Density · Visual Emphasis Hierarchy · Spatial-Composition terminology · editorial pacing · responsive principles.

**Notation.** "Above / around / below" describe reading order and relative emphasis, never pixel positions.

---

## Persistent frame (inherited)

- **Global Header** — persistent Layer-2 nav, unchanged. The Archive is reached via "Proiecte," a Hub's "see all work," a Service's "see more," a Curated View, search, or a direct link.
- **Footer** — the global footer.

---

## Spatial regions (how the discovery tool is organized)

The Archive resolves into two persistent regions rather than a top-to-bottom story:
- a **control region** — orientation + scope + active context + filters (A-1…A-4), quiet and consistent;
- a **results region** — the work itself (A-5), or the empty-state (A-6) when nothing matches;
- with **continue affordances** (A-7) available throughout.

The control region **frames** the results; the results are the protagonist.

---

## A-1 · Archive orientation *(Page IA Stage A) — "which archive am I on?"*

**Responsibility realized:** tell the visitor which browse surface they're on.

**Components (Inventory):** Page Introduction (archive/curated-view identity + current pillar scope).

**Spatial composition:** a quiet orientation at the top of the control region; names the archive/scope without competing with the work.

**Reading intent:** the visitor knows *what they are browsing.*

**Transition:** oriented, the visitor sees the scope control.

**Responsive intent:** remains visible/legible at any width; never hidden.

---

## A-2 · Pillar toggle *(Page IA Stage C, control) — the co-equal scope control*

**Responsibility realized:** switch scope — All · Architecture & Design · Reality Capture (All default).

**Components (Inventory):** Pillar Toggle.

**Spatial composition:** the primary, always-visible scope control, presented with the two pillars at **equal weight** (no primacy). It is a mode control, distinct from the filters below it.

**Reading intent:** the visitor understands *they can view both pillars or either one cleanly.*

**Transition:** with scope chosen, the visitor sees the active state and refinements.

**Responsive intent:** the toggle stays prominent and reachable when the control region compresses.

---

## A-3 · Active context / breadcrumb *(Page IA Stage A/C) — "why do these results appear?"*

**Responsibility realized:** make the current state legible — pillar + active filters — and offer to broaden/clear.

**Components (Inventory):** Active Context · Breadcrumb (where arriving from a Hub/Service scope).

**Spatial composition:** a quiet readout of the current scope/filters with a "clear/broaden" affordance; sits with the controls, never louder than the work.

**Reading intent:** the visitor understands *why the current results appear and how to broaden.*

**Transition:** state legible, the visitor may refine.

**Responsive intent:** the readout persists; "clear/broaden" remains reachable.

---

## A-4 · Filters *(Page IA Stage C) — narrow without overwhelm*

**Responsibility realized:** let a directed visitor narrow — small, visitor-friendly; filters refine, never gate.

**Components (Inventory):** Filter Group (shared: Entry Type + Sector; one pillar-contextual refinement — Discipline for A&D, Service for RC; Year-as-sort).

**Spatial composition:** a compact, quiet control — **progressively reduces complexity, never exposes the underlying taxonomy** (inherited principle). No Attribution filter (F2); never duplicates curated views.

**Reading intent:** the visitor understands *they can narrow, without being overwhelmed.*

**Transition:** refined (or not — browse works with zero filters), the visitor reads the results.

**Responsive intent:** the Filter Group may collapse into a compact control on narrow screens; the shared+contextual set and Year-as-sort are unchanged.

---

## A-5 · Results *(Page IA Stage D) — the work*

**Responsibility realized:** present matching work as **signposting previews**, ordered for discovery with balanced pillar representation.

**Components (Inventory):** Results Grid (composed of Work Preview Card ×n).

**Spatial composition:** **the results region is the emotional and visual center of the Archive** — the work is the protagonist, generous whitespace, a calm legible grid, never a dense wall. Each result routes to its Work Entry (the fixed archive behaviour). When scope = All, the ordering keeps both pillars fairly represented.

**Reading intent:** the visitor understands *which project to open next.*

**Transition:** the visitor opens a Work Entry, or adjusts the browse.

**Responsive intent:** the grid reflows/stacks; the work remains primary; ordering intent preserved.

---

## A-6 · Empty-state *(Page IA Stage D, no matches) — no dead end*

**Responsibility realized:** an empty result must never feel like an error.

**Components (Inventory):** Empty State (archive variant).

**Spatial composition:** replaces the results region (never a bare grid) with: the current scope/filters (preserved), a short "why nothing," and a way forward — adjust/clear filters, switch pillar, or return to broader browsing / Hub.

**Reading intent:** the visitor understands *why nothing matched and what to do next.*

**Transition:** the visitor broadens and returns to results.

**Responsive intent:** guidance and controls remain reachable; never a dead end at any width.

---

## A-7 · Continue / Hub back-path *(Page IA Stage E) — fluid, reversible exploration*

**Responsibility realized:** keep exploration fluid and reversible.

**Components (Inventory):** CTA Group (Hub back-path where a pillar scope is active) · Pillar Toggle (pillar switch, = A-2).

**Spatial composition:** quiet, navigational affordances — refine, switch pillar, or return to the Hub; never a conversion prompt.

**Reading intent:** the visitor understands *how to keep exploring or step back to the capability.*

**Transition:** back into results, or up to the Hub.

**Responsive intent:** continue affordances remain available; unchanged when stacked.

---

## Editorial rhythm — how the Archive differs

The Homepage introduces; the Hub expands; the Service resolves; **the Archive lets the visitor discover.** It should feel: **calm · legible · browsable · confidently navigable — never overwhelming, never archive-*dumping*.** It is the one page that is a *tool* rather than a *story*: quiet controls, the work as protagonist, and the reassurance that the visitor always knows their context.

## Browse principles (applied, inherited from Page IA)

- **Browse before filtering** — valuable with zero filters; filters support, never gate.
- **Filters reduce complexity, not expose taxonomy.**
- **Curated views are editorial slices, not separate archives.**
- **Results are previews that route to canonical Work Entries.**
- **Filters never duplicate curated views.**
- **The Archive never becomes a Service page or a Work Entry.**

## Discovery principle

**The Archive should reward both exploratory and goal-oriented behaviour.** Visitors who arrive **without** a specific project in mind should be able to discover meaningful work through browsing. Visitors who arrive **with** a specific objective should be able to reach relevant projects with minimal refinement. **The same interface should support both behaviours without favouring either** — which is exactly why browse is the default and filters are a small, optional accelerant (this is the *why* behind "browse before filtering").

## Reading progression

Not a linear story but a **discovery cycle**:

**Orientation → Scope → Browse & refine → Results → Continue**
- **Orientation** (A-1) — which archive → then
- **Scope** (A-2/A-3) — which pillar, and the legible current state → enabling
- **Browse & refine** (A-4) — narrow or broaden without overwhelm → producing
- **Results** (A-5) — the work, ready to open (or A-6 empty-state, with a way forward) → and
- **Continue** (A-7) — open a Work Entry, switch scope, or return to the Hub — reversibly.

Every step keeps the visitor's **context legible** so discovery stays confident.

## Visual emphasis hierarchy (archive-specific application)

Unlike the narrative pages, the Archive has **one dominant idea: the work.** Concentration points:

1. **The results / the work** (A-5) — the clear visual center
2. **Scope legibility** (A-1/A-2/A-3) — always knowing *what* and *why*

Everything else (filters, continue affordances, header, footer) stays **quiet and supportive.** The controls must never out-emphasize the work (Central Design Principle).

## Primary action

The Archive has **no conversion CTA.** Its primary action is **opening a Work Entry** (discovery); Contact is reachable only through global navigation (per Page IA). Navigation and conversion remain distinct.

## Narrative density
Follows the system-wide convention — each module owns one responsibility; the control region never accumulates unrelated controls. No archive-specific exception.

---

## Validation

- **Responsibilities preserved:** A-1…A-7 each realize exactly their Work Archive Page IA responsibility; none moved ✔.
- **Approved components only:** Page Introduction · Pillar Toggle · Active Context · Breadcrumb · Filter Group · Results Grid · Work Preview Card · Empty State · CTA Group · Global Header · Footer ✔ (no components invented).
- **One responsibility per module** ✔.
- **Browse before filtering** — valuable with zero filters ✔.
- **Discovery principle** — supports both exploratory and goal-oriented visitors without favouring either ✔.
- **Filter set is the locked small set** (Entry Type + Sector + one contextual refinement; Year-as-sort); no Attribution filter ✔.
- **Results route to Work Entries** ✔.
- **Curated views not duplicated by filters; not separate archives** ✔.
- **Empty-state preserves context; never a bare grid** ✔.
- **Context always legible** (pillar/scope/filters) ✔.
- **Visual emphasis hierarchy** declared (the work is the center; controls quiet) ✔.
- **No conversion CTA;** primary action = open a Work Entry; Contact via global nav only ✔.
- **Central Design Principle** — the work is the protagonist; controls are the frame ✔.
- **Responsive intent preserved** (controls compress; work stays primary; hierarchy unchanged) ✔.
- **No architectural decisions introduced** ✔.

**Result:** the canonical Work Archive template — a calm, legible discovery tool where visitors find individual projects with full context and confidence, and every result leads to its canonical Work Entry.
