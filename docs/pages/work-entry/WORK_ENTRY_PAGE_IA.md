# Work Entry Page IA — authoritative blueprint

The Work Entry defined as an **information-architecture object** — the canonical unit of *evidence* in the Work model. **One modular blueprint for every Entry Type** (Design Project · Concept/Study · Competition Entry · Survey/Documentation · Visualization Commission): a shared universal base plus optional type-specific modules (M3). All entries share this Page IA; they differ only in the content they consume and which optional modules they enable.

Authoritative inputs (do not reopen or reinterpret): `HOMEPAGE_PAGE_IA.md`, `HUB_PAGE_IA.md`, `SERVICE_PAGE_IA.md`, `INFORMATION_ARCHITECTURE.md`, `CONTENT_MODEL.md` (frozen v2.1), `NAV_DECISION_RECORD.md`, `ARCHITECTURE_REVIEW_02.md`, `DECISIONS_LOG.md`.

Level: Page IA (not UI). No wireframes, layout, or styling. **Why precedes what.** Status: authoritative (2026-07-30).

**Arrival assumption.** The Work Entry has the most diverse inbound of any page — from the Work Archive, a Curated View, a Service page (as proof), a Hub, another Work Entry (related / cross-pillar linked pair), or search. It must self-orient (what is this, which pillar, which type) without assuming any particular prior page.

---

## 1. Work Entry responsibility

**Primary purpose:** present **one piece of work as honest, contextualized evidence** — communicating what it is, the context in which it was produced, and the architect's honest contribution — so visitors can **independently assess quality, expertise, and professional credibility**, before continuing to the relevant Service, related work, or Contact. Per IA §2.5: *evidence, honest scoped authorship; not a pitch or a service explainer.* The page does not persuade or claim excellence; it provides sufficient evidence for visitors to reach their own conclusions.

**User questions it answers**
- What is this project, and what kind of work is it? (title, Entry Type, pillar, discipline)
- What are the key facts? (year, location, status, sector)
- In what context was it produced, and what was the architect's contribution? (professional context + honest crediting)
- Can I see it in depth? (media, drawings/planșe, capture media)
- What does it demonstrate — can I hire for this? (Work→Service)
- What else expands my understanding of this work or capability? (related work)
- (studio work) What's the professional-experience context?

**What it intentionally does NOT do**
- Does not pitch or persuade — **it is evidence, not a sales page.**
- Does not explain a service in depth — **it links to the Service page.**
- Does not provide browsing — **it is not the Work Archive** (a related strip, not a filter).
- Does not tell the identity story — **it is not About.**
- Does not overview a capability — **it is not a Hub.**

**Relationship to the rest of the architecture**
- **Work Archive** — the parent browse surface; the entry is reached from it, and the related module routes back into more work.
- **Service(s)** — the bidirectional **demonstrates** relationship: the entry links to the Service(s) it demonstrates (the offering / hire path). Absent on personal/competition work (module hidden).
- **Hub** — a contextual **F1 back-path** to the parent Pillar Hub, where it aids orientation.
- **Curated Views** — a studio entry surfaces its **Professional Experience** context; a competition entry relates to **Competitions**.
- **Contact** — available globally; the entry itself is evidence, so contact is a light, non-pitch onward path (consistent with O2: no-service entries are conversion-quiet by design).
- **About** — light/none; the page is about the *work*, not the identity.

---

## 2. Information flow (sequence of visitor understanding)

Stages of understanding, not visual sections. The Core Facts → work → professional context → type-substance → relationships spine is largely fixed; some module order is the designer's.

**Stage A — Orientation & key facts.**
- *Understand:* what this project is, which pillar and Entry Type, and its key facts.
- *Why:* orient any arrival (including a cold deep-link) and situate the work.
- *Hands next:* into the work itself.

**Stage B — The work itself.**
- *Understand:* the project through its description and media (drawings/planșe; for capture, capture media) — enough to assess it.
- *Why:* the core evidence; let the visitor see and judge.
- *Hands next:* into professional context and type-specific substance.

**Stage C — Professional context & honest crediting.**
- *Understand:* the context in which the work was produced and the architect's exact contribution — Attribution, Employer, Role, scoped Authorship, and (studio) professional experience.
- *Why:* these elements provide **professional context**, not only attribution; honest crediting builds trust and avoids over-claiming (studio / collaboration / visualization).
- *Hands next:* (studio) the Professional Experience context; onward.

**Stage D — Type-specific substance.**
- *Understand:* the characteristics unique to this Work type — a competition's awards/jury/team, or a capture's deliverables/accuracy/equipment/point-cloud.
- *Why:* express what makes this Work type distinct (M3), through optional modules; a cross-pillar entry may show more than one.
- *Hands next:* into relationships.

**Stage E — Relationships & continue.**
- *Understand:* what this work demonstrates (a service you could hire for), what else expands understanding, and how to go deeper or get in touch.
- *Why:* route onward — to the offering, to more work, back to the capability, or to contact.
- *Hands next:* **Service page**, **related Work Entries**, **parent Hub** (F1), **Contact**.

*(Persistent Layer-2 global nav + footer are inherited, not an entry-specific stage.)*

---

## 3. Module inventory (derived from the flow — M3 base + optional type modules)

### Universal base (every Work Entry)

**W-1 · Orientation & Core Facts module** *(Stage A)*
- *Why:* identify the work and situate it via a **flexible metadata component** (common metadata always shown; Entry-Type-specific attributes when relevant — not a fixed field set).
- *Question:* what is this, what kind, and what are the key facts?
- *Consumes:* title; Pillar, Entry Type, Discipline, Sector, Year, Status.
- *Destinations:* contextual (parent Hub via F1; facets are display, not filters).
- *Dependencies:* Work Entry facets.
- *Future:* none essential.

**W-2 · Description & media module** *(Stage B)*
- *Why:* present the work as evidence to see and assess.
- *Question:* what is it — let me see it.
- *Consumes:* description + media gallery with zoom (drawings/planșe; capture media where relevant).
- *Destinations:* zoomable media.
- *Dependencies:* media assets.
- *Future:* Reality-Capture media treatment (e.g. point-cloud viewer) — UI-phase, not IA.

**W-3 · Professional context & credits module (universal)** *(Stage C)*
- *Why:* **establish credibility through transparency rather than ownership claims** — always present, regardless of Entry Type.
- *Question:* in what context was this produced, whose work is it, and how is the contribution credited?
- *Consumes:* Attribution, Employer, Role, scoped Authorship, Collaborators.
- *Destinations:* (studio entries) the **Professional Experience** curated view.
- *Dependencies:* attribution/crediting fields.
- *Future:* none.

**W-5 · Demonstrated-service module (Work→Service)** *(Stage E)*
- *Why:* connect the evidence to the offering — the hire path (M2).
- *Question:* what service does this demonstrate / can I hire for this?
- *Consumes:* the demonstrated **Service** reference(s).
- *Destinations:* the **Service page(s)**.
- *Dependencies:* a demonstrates link — **absent on personal/competition entries → module hidden** (no broken/empty module).
- *Future:* none.

**W-6 · Related work module ("alte proiecte sugerate")** *(Stage E)*
- *Why:* route to work that broadens understanding — not always the *most similar* work, often the most *contextualizing*.
- *Question:* what else expands my understanding of this work or capability?
- *Consumes:* related Work Entries (related/next; **cross-pillar-aware**, incl. the linked pair for composite work).
- *Destinations:* Work Entries (module "see more" → filtered archive; items per the shared highlight rule).
- *Dependencies:* related links / curation.
- *Future:* none.

**W-7 · Onward module — Hub back-path + light contact** *(Stage E)*
- *Why:* provide the F1 back-path and a **light, non-pitch** contact affordance.
- *Question:* where do I go from here?
- *Consumes:* parent-pillar reference (F1).
- *Destinations:* parent **Hub** (F1); **Contact** (light).
- *Dependencies:* Hub; Contact.
- *Future:* the lightweight non-pitch contact affordance (O2).

### Optional type modules (toggled by Entry Type) — **W-4**

**W-4 · Type-specific module** *(Stage D)* — one or more of:
- **Competition module** — awards, jury, competition **Team** (contextual — distinct from the universal Credits).
- **Reality Capture module** — capture specifications, accuracy, equipment, deliverables, point cloud / orthophotos / before–after.
- **Design specifics** — largely carried by W-2 (drawings/plans); a minimal design module only if needed.
- *Why:* express the Work type's unique characteristics.
- *Consumes:* Entry-Type-specific fields.
- *Dependencies:* Entry Type. **A cross-pillar / composite entry (P10) may enable more than one module.**
- *Future:* additional Entry-Type modules as new types are introduced.

**Evolution rule (M3):** future Entry Types should normally **extend the optional W-4 layer rather than changing the universal base.** This keeps the base stable and the system extensible.

*(Persistent global nav + footer are inherited, not listed as entry-specific modules. W-4 is numbered after the base to signal it is the optional, type-driven layer.)*

---

## 4. Navigation integration

**The Work Entry's unique role:** it acts as the **primary convergence point between discovery journeys and service journeys.** Unlike every other page, it can be reached from almost anywhere and can continue visitors toward either further exploration or conversion.

**Position in the overall journey**
- **Archive → Work Entry → (Service / Related Work / Contact)**
- **Service → Work Entry (proof) → back to Service / Related / Contact**
- **Hub → Work Entry**, **Curated View → Work Entry**, **Search → Work Entry**
- **Work Entry → Work Entry** (related; cross-pillar linked pair)

**Inbound paths** — Work Archive; Curated Views (Competitions, Professional Experience); a Service page (demonstrated-by); a Hub (curated work); another Work Entry (related); search.

**Outbound paths**
- **→ Service(s)** it demonstrates (W-5).
- **→ Related Work Entries** (W-6) and, via "see more," the filtered archive.
- **→ parent Hub** (F1 back-path, W-7).
- **→ Professional Experience** curated view (studio entries, W-3).
- **→ Contact** (light, W-7).

**F1 back-paths** — a **relevant** Work Entry provides a contextual back-path to its parent Pillar Hub where it aids orientation (per F1; not mandatory on every entry).

**Cross-pillar handling** — a cross-pillar entry (P10) has a **single canonical URL**, surfaces in **both** pillars, may enable more than one W-4 module, and cross-references its linked pair (e.g. survey + renovation) as related work.

**Canonical-intent split (anti-cannibalization):** Work Entry = **long-tail evidence for one project**; it does not compete with the Archive (browse) or the Service page (conversion).

---

## 5. Success criteria (Page-IA, not aesthetic)

- **Clarity:** any arrival quickly understands what the project is and what kind of work it is, without the archive or homepage.
- **Evidence quality:** the work is presented as **honest, contextualized evidence** to see and assess — not a pitch.
- **Independent assessment:** the page gives enough for a visitor to **reach their own conclusion** about quality, expertise, and professional credibility — it does not persuade or claim excellence.
- **Professional context & honest crediting:** Attribution, Employer, Role, and scoped Authorship are **always present and accurate** — establishing credibility through transparency, never over-claiming.
- **Integrity:** visitors **never leave with a misleading impression** regarding authorship, responsibility, collaboration, or project scope.
- **Type expression:** the Work type's unique characteristics are expressed through the right optional modules; a cross-pillar entry can enable more than one.
- **Routing:** clear paths to the demonstrated Service, related work, the parent Hub (F1), Professional Experience (studio), and contact.
- **Responsibility boundaries:** not a pitch, not a service explainer, not the archive, not About, not a hub. **One responsibility, no duplication.**
- **Consistency with the finalized IA:** expresses the locked architecture — a single **modular** Work Entry (universal base + optional type modules); universal Credits; Work→Service referenced (not copied); the F1 back-path; a single canonical URL including cross-pillar; curation-driven related work. **All Entry Types share this one blueprint; no IA concept missing or added.**

**Concrete pass/fail tests**
- A **cold arrival** understands the project and can route, without the archive or homepage.
- A visitor can **understand the project without first understanding the firm's services** (the entry stands as independent evidence, not a subordinate service section).
- **Credits are present and accurate** for studio / collaboration / visualization entries (no over-claim).
- A **competition** entry shows the competition module; a **survey/documentation** entry shows the capture modules — **both on this one blueprint**.
- A **personal/competition** entry with no demonstrated Service simply **hides W-5** (no broken/empty module).
- A **cross-pillar** entry appears in both pillars as **one canonical entry**, with linked related entries.
- **No module** sells, explains a service in depth, or lists the archive.

---

## One blueprint, all Entry Types — content/module differences (not blueprint differences)
- **Design Project / Concept / Study** — description + drawings/plans/renders in W-2; Credits (often sole/independent); may demonstrate a design Service.
- **Competition Entry** — enables the Competition module (awards/jury/team); often no demonstrated Service (W-5 hidden).
- **Survey / Documentation (Reality Capture)** — enables the Reality Capture module (specs/accuracy/equipment/deliverables/point-cloud); demonstrates a capture Service.
- **Visualization Commission** — scoped Authorship prominent (images by the architect; building design by others); demonstrates the visualization Service.
- **Studio-attributed (any type)** — Credits foreground Employer + Role + scoped Authorship; links to Professional Experience.
- These are **content and module-toggle differences only** — the Page IA (responsibility, flow, base modules, routing) is identical.

## Open (carried into wireframing / dependencies)
Whether W-1 hero + Core Facts are one module or two; individual-item vs "see more" behaviour in W-6 (module "see more" → filtered archive fixed; items deferred); Reality-Capture media treatment (UI); the lightweight non-pitch contact affordance (O2). The Work Entry depends on the Work Archive (filtered), Service pages, the Hub (F1), and the Professional Experience curated view existing — the Work Archive and Contact Page IA remain.
