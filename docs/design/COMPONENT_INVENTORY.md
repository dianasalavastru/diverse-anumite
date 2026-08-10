# Component Inventory — architectural dictionary of the interface

**The reusable building blocks that realize the completed Page IA.** This document defines *what reusable interface components exist, why they exist, and where they belong* — **not** their visual design, layout, or implementation. It is the canonical vocabulary for every future wireframe and design-system component.

Level: **Design Architecture**. Status: **authoritative**.

**Governing rule:** this document introduces **no new Information Architecture and no Page IA decisions.** Every component exists **because one or more Page IA documents require it.** *If a component cannot be traced back to the architecture, it should not exist.*

Traceability sources: the six Page IA blueprints (`HOMEPAGE`, `HUB`, `SERVICE`, `WORK_ARCHIVE`, `WORK_ENTRY`, `CONTACT`), `PAGE_IA_INDEX.md`, `WIREFRAME_PRINCIPLES.md`, `CONTENT_MODEL.md` (frozen v2.1).

---

## 1. Purpose

Component Inventory sits **between Wireframe Principles and wireframes**:
- **Architecture** defines *responsibilities*.
- **Wireframe Principles** define *how responsibilities are expressed*.
- **Component Inventory** defines the **reusable vocabulary** used to express them.

A designer should be able to wireframe the entire site using only the components defined here — inventing nothing new unless the architecture itself changes.

## 2. Component philosophy

- **Components express responsibilities** (not visuals).
- **Components are architectural, not visual.**
- **Reuse before invention.**
- **One component communicates one responsibility.**
- **Components are independent of styling.**
- **Components are composable.**
- **Similar responsibilities reuse the same component.**

## 3. Component taxonomy (families)

**Navigation** — Global Header · Footer · Breadcrumb · Pillar Toggle · Navigation Group
**Orientation** — Hero · Page Introduction · Section Introduction · Context Summary · Active Context · Metadata Strip
**Discovery** — Highlight Card · Work Preview Card · Service Preview Card · Curated View Card · Results Grid · Filter Group · Empty State
**Evidence** — Gallery · Media Viewer · Project Metadata · Credits Block · Related Work Strip · Demonstrated Service Block
**Conversation** — Contact Form · Contact Methods · Topic Summary · Response Expectations · Confirmation Message
**Shared** — CTA Group · Section Header · Rich Text · Quote · Statistic · Timeline · Accordion · FAQ

## 4. Component specifications

Template per component: **Purpose · Responsibility · Inputs · Outputs · Appears on · Variants · Dependencies · Notes.** (Traceability lives in *Appears on*.)

### Navigation

**Global Header**
- *Purpose:* persistent global wayfinding. *Responsibility:* Layer-2 task-first nav, never shape-shifting. *Inputs:* global nav items (Despre · Servicii · Proiecte · Contact · EN); Servicii pillar-grouped dropdown. *Outputs:* the global destinations. *Appears on:* all pages. *Variants:* — . *Dependencies:* `NAV_DECISION_RECORD`. *Notes:* additive to homepage narrative; pillar hubs are **not** items here.

**Footer**
- *Purpose:* persistent orientation, compliance, social. *Responsibility:* global nav echo + social + EU-funding acknowledgment + language. *Inputs:* nav links, social links, EU-funding element, language. *Outputs:* global destinations, legal/privacy. *Appears on:* all pages (Homepage M-7). *Variants:* — . *Dependencies:* EU-funding assets. *Notes:* EU-funding lives here (Step 7), not as a page.

**Breadcrumb**
- *Purpose:* show the visitor's position in the hierarchy. *Responsibility:* legible wayfinding trail. *Inputs:* current path/scope. *Outputs:* ancestor destinations (e.g. parent Hub). *Appears on:* deep pages where hierarchy aids orientation (Work Archive A-3, Service, Work Entry). *Variants:* — . *Dependencies:* page hierarchy. *Notes:* wayfinding only; distinct from Active Context (state readout).

**Pillar Toggle**
- *Purpose:* the co-equal scope control. *Responsibility:* switch archive scope All · A&D · Reality Capture. *Inputs:* pillar scope. *Outputs:* re-scoped archive. *Appears on:* Work Archive (A-2). *Variants:* — . *Dependencies:* pillar facet. *Notes:* a mode control, not a filter; All is default.

**Navigation Group**
- *Purpose:* a reusable set of grouped links. *Responsibility:* group related destinations. *Inputs:* a labelled set of links. *Outputs:* those destinations. *Appears on:* Global Header, Footer, Services dropdown. *Variants:* horizontal / stacked. *Dependencies:* — . *Notes:* structural grouping only.

### Orientation

**Hero**
- *Purpose:* open a page with identity/media. *Responsibility:* establish *what this is* at first glance. *Inputs:* primary media + title/identity. *Outputs:* — (sets up the page). *Appears on:* Homepage (M-1), Work Entry (W-1). *Variants:* identity hero / work hero. *Dependencies:* media. *Notes:* orientation, not decoration.

**Page Introduction**
- *Purpose:* orient a cold arrival to a page. *Responsibility:* answer "am I in the right place?" *Inputs:* page/capability name + one-line positioning. *Outputs:* light onward (e.g. About). *Appears on:* Hub (H-1), Service (S-1), Contact (C-1). *Variants:* — . *Dependencies:* — . *Notes:* must self-orient; deep-linkers may not have seen upstream pages.

**Section Introduction**
- *Purpose:* frame an in-page section. *Responsibility:* set up one section's understanding. *Inputs:* section framing text. *Outputs:* — . *Appears on:* Hub (H-2 framing), Homepage sections. *Variants:* — . *Dependencies:* — . *Notes:* framing, not a formal definition.

**Context Summary**
- *Purpose:* show the visitor their carried-over context. *Responsibility:* reassure that the site knows why they're here. *Inputs:* Topic (pillar) + Regarding (service) prefills. *Outputs:* frames the enquiry. *Appears on:* Contact (C-2) — where it is the **Topic Summary** (see Conversation). *Variants:* Contact instance = Topic Summary. *Dependencies:* prefill contract. *Notes:* first-class prefill concept; reduces repetition.

**Active Context**
- *Purpose:* make the current browse state legible. *Responsibility:* show pillar + active filters + "broaden/clear." *Inputs:* active pillar/filters/sort. *Outputs:* clear/broaden actions. *Appears on:* Work Archive (A-3). *Variants:* — . *Dependencies:* filter state. *Notes:* state readout; distinct from Breadcrumb (hierarchy).

**Metadata Strip**
- *Purpose:* compact key-facts readout. *Responsibility:* situate a work at a glance. *Inputs:* compact facets (Pillar, Entry Type, Year, Status…). *Outputs:* — . *Appears on:* Work Entry (W-1). *Variants:* compact form of **Project Metadata**. *Dependencies:* Work Entry facets. *Notes:* the compact variant of the flexible metadata component (see Project Metadata).

### Discovery

**Highlight Card**
- *Purpose:* a single curated highlight item. *Responsibility:* preview one curated item within a highlight module. *Inputs:* a curated item (work/service reference + media). *Outputs:* per the highlight rule (module CTA → canonical destination; item behaviour deferred). *Appears on:* Homepage (M-4/M-5), Hub (H-4). *Variants:* work / service / view. *Dependencies:* curation layer. *Notes:* item within a curated module, not the module itself.

**Work Preview Card**
- *Purpose:* the canonical preview of one Work Entry. *Responsibility:* signpost a work so the visitor can decide to open it. *Inputs:* Work Entry preview (title, key facets, media). *Outputs:* → its Work Entry (in results/related contexts). *Appears on:* Work Archive (A-5 results), Related Work Strip (W-6), Hub curated work (H-4), Service proof (S-4). *Variants:* pillar/type media treatment (UI). *Dependencies:* Work Entry. *Notes:* the single reusable "Work card" everywhere; identical concept, identical structure.

**Service Preview Card**
- *Purpose:* preview one Service. *Responsibility:* help recognize a service and route to it. *Inputs:* Service name + short descriptor. *Outputs:* → the Service page. *Appears on:* Hub services overview (H-3), Services index. *Variants:* — . *Dependencies:* Service object. *Notes:* recognition, not comparison/explanation.

**Curated View Card**
- *Purpose:* represent a curated view as a destination. *Responsibility:* expose Competitions / Professional Experience as real destinations. *Inputs:* curated-view identity + representative media. *Outputs:* → the Curated View (then Work Entry). *Appears on:* Homepage (M-5). *Variants:* Competitions / Professional Experience. *Dependencies:* curated-view routes. *Notes:* module CTA → the curated view (no shortcut straight to entries).

**Results Grid**
- *Purpose:* present matching work. *Responsibility:* signposting previews, ordered for discovery + balanced pillars. *Inputs:* a set of Work Preview Cards. *Outputs:* → Work Entries. *Appears on:* Work Archive (A-5). *Variants:* — . *Dependencies:* Work Preview Card. *Notes:* signposting surface, never in-depth projects.

**Filter Group**
- *Purpose:* let a directed visitor narrow. *Responsibility:* refine within scope; reduce complexity, don't expose taxonomy. *Inputs:* shared filters (Entry Type + Sector) + one pillar-contextual refinement (Discipline/Service) + Year-as-sort. *Outputs:* re-scoped results. *Appears on:* Work Archive (A-4). *Variants:* per-pillar contextual refinement. *Dependencies:* locked filter set (Step 5). *Notes:* no Attribution filter (F2); never duplicates curated views.

**Empty State**
- *Purpose:* handle "nothing here" with confidence. *Responsibility:* preserve context, explain why, offer a next step. *Inputs:* current scope/filters (or absence). *Outputs:* adjust/clear/broaden; contextual CTA. *Appears on:* Work Archive (A-6), Service proof (S-4 / F5). *Variants:* archive / service. *Dependencies:* context. *Notes:* never a bare grid or dead end.

### Evidence

**Gallery**
- *Purpose:* present a work's images. *Responsibility:* show the work as evidence. *Inputs:* media set (drawings/planșe; capture media). *Outputs:* → Media Viewer. *Appears on:* Work Entry (W-2). *Variants:* design / capture media. *Dependencies:* media. *Notes:* content differs by type; structure identical.

**Media Viewer**
- *Purpose:* view media in depth. *Responsibility:* zoomable/close inspection. *Inputs:* a media item. *Outputs:* — . *Appears on:* Work Entry (W-2 zoom). *Variants:* image zoom / point-cloud viewer (RC). *Dependencies:* media. *Notes:* the RC viewer is a variant, not a new component.

**Project Metadata**
- *Purpose:* the flexible key-facts component. *Responsibility:* common metadata always shown; type-specific attributes when relevant. *Inputs:* Pillar, Entry Type, Discipline, Sector, Year, Status (+ type-specific). *Outputs:* facets are display (not filters). *Appears on:* Work Entry (W-1). *Variants:* **Metadata Strip** = its compact form. *Dependencies:* Work Entry facets. *Notes:* one flexible metadata component; not a fixed field set.

**Credits Block**
- *Purpose:* professional context + honest crediting. *Responsibility:* establish credibility through transparency, always present. *Inputs:* Attribution, Employer, Role, scoped Authorship, Collaborators. *Outputs:* (studio) → Professional Experience. *Appears on:* Work Entry (W-3). *Variants:* independent / collaboration / studio. *Dependencies:* attribution fields. *Notes:* never over-claims; distinct from a Competition Team.

**Related Work Strip**
- *Purpose:* route to work that broadens understanding. *Responsibility:* surface related entries. *Inputs:* related Work Entries (cross-pillar-aware). *Outputs:* → Work Entries; "see more" → filtered archive. *Appears on:* Work Entry (W-6). *Variants:* — . *Dependencies:* Work Preview Card; related links. *Notes:* composes Work Preview Cards; not the archive.

**Demonstrated Service Block**
- *Purpose:* connect evidence to the offering. *Responsibility:* link a work to the Service(s) it demonstrates. *Inputs:* demonstrated Service reference(s). *Outputs:* → Service page(s). *Appears on:* Work Entry (W-5). *Variants:* — . *Dependencies:* demonstrates link. *Notes:* hidden when absent (no empty module).

### Conversation

**Contact Form**
- *Purpose:* frictionless enquiry initiation. *Responsibility:* the single simple form. *Inputs:* name, email, message + optional Topic selector (with prefills). *Outputs:* submission → one context-tagged inbox. *Appears on:* Contact (C-4). *Variants:* — . *Dependencies:* one inbox; prefill values. *Notes:* no per-service field expansion; details deferred to follow-up.

**Contact Methods**
- *Purpose:* offer ways to reach the practice. *Responsibility:* present channels. *Inputs:* contact channels. *Outputs:* the chosen channel. *Appears on:* Contact (C-3). *Variants:* — . *Dependencies:* contact details. *Notes:* — .

**Topic Summary**
- *Purpose:* show carried-over Topic/Regarding on Contact. *Responsibility:* reassure context transferred. *Inputs:* Topic + Regarding prefills. *Outputs:* frames the enquiry. *Appears on:* Contact (C-2). *Variants:* Contact instance of **Context Summary**. *Dependencies:* prefill contract. *Notes:* same component as Context Summary; Contact usage.

**Response Expectations**
- *Purpose:* remove post-submission uncertainty. *Responsibility:* state what happens next. *Inputs:* response process. *Outputs:* — . *Appears on:* Contact (C-5). *Variants:* — . *Dependencies:* stated expectation. *Notes:* — .

**Confirmation Message**
- *Purpose:* close the loop cleanly. *Responsibility:* confirm receipt + context reached. *Inputs:* submission confirmation (echoes Topic/Regarding). *Outputs:* optional Hub/Homepage. *Appears on:* Contact (C-6). *Variants:* — . *Dependencies:* submission handling. *Notes:* avoid unnecessary onward navigation.

### Shared

**CTA Group**
- *Purpose:* present actions. *Responsibility:* one primary action; optional secondary. *Inputs:* action label(s) + destination(s). *Outputs:* the destination(s). *Appears on:* Service (S-5), Hub (H-6), Homepage (M-6), Work Entry (W-7), curated modules. *Variants:* primary / primary+secondary. *Dependencies:* — . *Notes:* conversion and navigation remain distinct; actions emerge from understanding.

**Section Header**
- *Purpose:* label a section. *Responsibility:* one section's heading. *Inputs:* heading text. *Outputs:* — . *Appears on:* all pages. *Variants:* — . *Dependencies:* — . *Notes:* structural.

**Rich Text**
- *Purpose:* prose content. *Responsibility:* present descriptive/framing copy. *Inputs:* text. *Outputs:* — . *Appears on:* Hub, Service, Work Entry, About. *Variants:* — . *Dependencies:* — . *Notes:* surface only what the current responsibility requires (progressive disclosure).

**Quote**
- *Purpose:* a credible testimonial/quote. *Responsibility:* third-party voice. *Inputs:* quote + attribution. *Outputs:* — . *Appears on:* future (credibility). *Variants:* — . *Dependencies:* content. *Notes:* future enhancement (testimonials).

**Statistic**
- *Purpose:* a single quantified fact. *Responsibility:* convey one measurable point. *Inputs:* value + label. *Outputs:* — . *Appears on:* credibility contexts (equipment/experience; capture accuracy). *Variants:* — . *Dependencies:* content. *Notes:* evidence over claims.

**Timeline**
- *Purpose:* an ordered sequence. *Responsibility:* show progression (experience/process). *Inputs:* ordered items. *Outputs:* — . *Appears on:* future (Professional Experience / process). *Variants:* — . *Dependencies:* content. *Notes:* future enhancement.

**Accordion**
- *Purpose:* collapsible disclosure. *Responsibility:* progressive disclosure of secondary detail. *Inputs:* labelled sections. *Outputs:* — . *Appears on:* Service specs / FAQ. *Variants:* — . *Dependencies:* — . *Notes:* supports progressive disclosure.

**FAQ**
- *Purpose:* answer common questions. *Responsibility:* address recurring uncertainty. *Inputs:* Q/A pairs. *Outputs:* — . *Appears on:* Service (S-3 optional). *Variants:* — . *Dependencies:* Accordion (composition). *Notes:* optional module.

---

## 5. Reuse principles

- **Components never change responsibility** (they may change presentation).
- **Components do not duplicate one another.**
- **New components require architectural justification.**
- **Prefer extending an existing component over creating a new one** (variants, not new components).
- **Similar responsibilities reuse the same component** (one Work Preview Card everywhere).

## 6. Component relationships

**Page → Modules → Components → Content**

- **Page IA** defines the page and its **modules**.
- **Modules** are realized through **reusable components** (a module may compose several; a component may appear in several modules).
- **Components consume Content Model objects** (Work Entry, Service, facets, curated views, prefills).

## 7. Evolution rules

A new component should emerge **only** when:
- no existing component can express the responsibility;
- the Page IA introduces a genuinely new responsibility;
- reuse would reduce clarity.

**Visual variation alone is never sufficient reason to create a new component** — that is a variant, not a component.

## 8. Completion statement

The Component Inventory defines the **architectural vocabulary** used to realize the Page IA layer. Components are **reusable expressions of architectural responsibilities rather than visual artifacts.** Together with the Information Architecture, Page IA, and Wireframe Principles, this inventory provides a stable foundation for wireframing, visual design, design systems, and implementation — implementation-independent, styling-independent, and durable. A designer should be able to wireframe the entire website using only these components, inventing nothing new unless the architecture itself changes.
