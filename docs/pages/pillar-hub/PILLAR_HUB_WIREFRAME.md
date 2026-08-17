# Pillar Hub Wireframe — low-fidelity structural specification (canonical template)

**The canonical structural wireframe for a Pillar Hub** — the shared layout and reading flow from which **both** concrete hubs (Architecture & Design; Reality Capture) are realized. It expresses the Hub Page IA **spatially** and nothing more. It introduces **no new IA, no new Page IA, no new components, and no new visual direction.**

Level: **Low-Fidelity Wireframe**. Status: **authoritative** (template for both pillar hubs).

> **Governance note (Decision Log Batch 20, 2026-08-10):** Visual language is now governed by `VISUAL_DIRECTION_v2.0.md` (“measured reality”). Any reference to `VISUAL_DIRECTION.md` below is the **superseded** v1 direction (“architectural publication”); this document remains **structurally authoritative**.

Derived exclusively from: `HUB_PAGE_IA.md`, `PAGE_IA_INDEX.md`, `COMPONENT_INVENTORY.md`, `WIREFRAMING_GUIDELINES.md`, `VISUAL_DIRECTION.md`, `CONTENT_MODEL.md`.

**Inherits** the system-wide conventions (narrative density, visual emphasis hierarchy, spatial-composition terminology — `WIREFRAMING_GUIDELINES.md` §7–§9) and the **Central Design Principle** (`VISUAL_DIRECTION.md`); it applies them, it does not redefine them.

**Module reading order.** Per Hub Page IA, the Services (H-3) and Curated work (H-4) order is a design choice. This template orders **representative work before the services offering** — *evidence before offering*, consistent with understanding before persuasion, evidence over claims, and editorial over marketing. This is a permitted Page-IA flex and a deliberate, retained decision — not an architecture change.

**Notation.** "Above / below / beside" describe reading order and relative emphasis, never pixel positions.

---

## Persistent frame (inherited)

- **Global Header** — persistent Layer-2 nav, unchanged (never shape-shifts). The hub is **not** a nav item; it is reached via the homepage branch/section, deep links, or F1 back-paths.
- **Footer** — the global footer (nav echo, social, EU-funding acknowledgment, language).

---

## H-1 · Capability orientation *(Hub Page IA Stage A) — Orientation*

**Responsibility realized:** identify which capability this is and anchor a cold/deep-link arrival to the one practice.

**Components (Inventory):** Page Introduction (capability name + one-line positioning) · Hero (*capability variant* — optional opening media) · a light text link to About.

**Spatial composition:** a calm opening that names the capability first; any opening media is image-led with a quiet interface around it (the work frames the capability, not interface ornament). The About link is a quiet secondary affordance.

**Reading intent:** the visitor leaves knowing *which capability this is, and that it's one facet of one practice* — even without the homepage.

**Transition:** oriented, the visitor is ready to understand what the capability is for → framing.

**Responsive intent:** the introduction and any hero stack into one opening unit; capability identity remains first.

---

## H-2 · Capability framing & use-cases *(Hub Page IA Stage B) — Capability understanding*

**Responsibility realized:** frame what the capability is *for* and where it applies (use-cases) — framing, not a formal definition.

**Components (Inventory):** Section Introduction (framing) · Rich Text (what it's for + use-cases) · Statistic ×n (optional — capability facts, e.g. equipment/accuracy for Reality Capture).

**Spatial composition:** prose-led framing with use-cases presented as a calm, evenly-weighted set; any statistics support rather than dominate (evidence over claims). One idea — "what this capability is for" — communicated before moving on.

**Reading intent:** the visitor leaves understanding *what this capability is for and where it applies.*

**Transition:** understanding established, the visitor is ready for proof → representative work.

**Responsive intent:** framing prose and use-cases stack; the framing reads before the work.

---

## H-4 · Curated work *(Hub Page IA Stage D) — Representative work*

**Responsibility realized:** demonstrate the **breadth and quality** of the capability through a curated selection — *demonstrate, not browse* (protects the Archive).

**Components (Inventory):** Section Header · Work Preview Card ×n (curated pillar work) · CTA Group (module CTA → the pillar-filtered Work Archive).

**Spatial composition:** the work is the protagonist — a curated set of Work Preview Cards with generous whitespace, presented as evidence, not a dense grid. The module's canonical continuation is the pillar-filtered archive; individual cards may link to Work Entries (item behaviour per the shared highlight rule). **This module is the emotional and visual center of the Hub** — where the page should breathe, and the clearest expression of the Central Design Principle (the work is the protagonist; the interface is its frame).

**Reading intent:** the visitor leaves with *confidence in the capability's quality and range* — enough to consider engaging.

**Transition:** convinced by the work, the visitor is ready to recognize what they can actually commission → services.

**Responsive intent:** cards reflow/stack; framing-then-work-then-continue order preserved.

---

## H-3 · Services overview *(Hub Page IA Stage C) — Service recognition (the offering)*

**Responsibility realized:** present the pillar's services and route to each — help the visitor **recognize the appropriate service**, not compare or explain in depth (protects the Service pages).

**Components (Inventory):** Section Header · Service Preview Card ×n (→ the pillar's Service pages).

**Spatial composition:** a clear, calm set of service entries of comparable weight — recognition, not a feature comparison. Each routes to its Service page; the hub does not sell here.

**Reading intent:** the visitor leaves able to *recognize which service fits and where to go for it.*

**Transition:** knowing the offering, the visitor may want the full body of work → further exploration.

**Responsive intent:** service entries stack; each remains a distinct route.

---

## H-5 · Continue-to-archive *(Hub Page IA Stage E) — Further exploration* *(may be authored as H-4's CTA)*

**Responsibility realized:** route to full breadth for the visitor who wants everything.

**Components (Inventory):** CTA Group (→ the pillar-filtered Work Archive).

**Spatial composition:** a single quiet continuation to breadth; navigational, not a conversion prompt.

**Reading intent:** the visitor understands *where all the [pillar] work lives.*

**Transition:** exploration offered, the hub extends the single path to a conversation.

**Responsive intent:** a single continuation; unchanged when stacked.

---

## H-6 · Contact / next step *(Hub Page IA Stage E) — Conversation*

**Responsibility realized:** a pillar-relevant path to start a conversation, without hard-selling. Carries the hub's **single primary (conversion) action.**

**Components (Inventory):** Section Introduction / Rich Text (a quiet invitation) · CTA Group (primary → Contact, with **Topic = this pillar** prefilled).

**Spatial composition:** one calm invitation, one primary action, no competing conversion prompts; appears at the end, after understanding has accumulated. The services and archive continuations above are navigation, kept distinct from this conversion action.

**Reading intent:** the visitor leaves knowing *how to engage this capability.*

**Transition:** into the persistent footer.

**Responsive intent:** invitation + single action stack; remains the last, only primary conversion action.

---

## Pillar inheritance

**Identical across both hubs (the template — never varies):** module set and order · component composition · spatial hierarchy · reading flow · editorial pacing · visual emphasis hierarchy · responsive intent. The structural language is one.

**Intentionally varies by capability (content only):**
- **H-1** — pillar name + positioning + optional capability hero media.
- **H-2** — framing + use-cases (Reality Capture: heritage documentation, as-built, survey; Architecture & Design: residential, interior, competitions) + optional capability facts (RC: accuracy/equipment).
- **H-3** — the pillar's Services *(v3.1: RC = Scanare laser 3D · Scan-to-BIM · Fotografie de arhitectura · Vizualizare de arhitectura; A&D = Proiectare de arhitectura · Design interior · Vizualizare 3D · Design mobilier. **Drone photogrammetry is not a Service** — it describes the capability, not the offer.)*
- **H-4** — pillar-scoped curated Work Entries (RC media may be point-cloud/orthophoto; A&D renders/drawings).
- **H-6** — Contact Topic prefill = this pillar.

**The structural hierarchy remains identical; only the content differs.**

---

## Editorial rhythm — how the Hub differs from the Homepage

**The Homepage introduces; the Hub expands.** Where the homepage moves quickly across identity → capabilities → highlights, the hub **slows down** on a single capability. It should feel: **slower, deeper, more evidence-rich, still highly curated — and never archive-like.** It curates and links to the archive for breadth; it never becomes the browse surface. The extra pacing is spent on framing and representative work, not on more interface.

## Depth principle

**Every Hub module expands understanding rather than increasing breadth.** The visitor should leave with a **deeper understanding of a single capability**, not exposure to more topics. Whenever additional breadth is required, the **canonical continuation is the Work Archive** (H-5), never an extension of the Hub itself. This protects the Hub's responsibility as the portfolio grows: hubs deepen; the archive broadens.

---

## Reading progression

The hub expresses:

**Orientation → Capability understanding → Representative work → Service recognition → Further exploration → Conversation**
*(equivalently: Orientation → Understanding → Evidence → Offering → Exploration → Conversation)*

- **Orientation** (H-1) → gives the visitor their footing → enables
- **Capability understanding** (H-2) → makes the work legible → sets up
- **Representative work / evidence** (H-4) → earns confidence → which the
- **Service recognition / offering** (H-3) → converts into a recognizable service → after which
- **Further exploration** (H-5) → offers breadth to the still-curious → and finally
- **Conversation** (H-6) → converts accumulated understanding into action.

Each transition supplies exactly what the next stage needs: orientation before understanding, understanding before evidence, **evidence before offering**, offering before breadth, and understanding before the single conversion action.

## Visual emphasis hierarchy (hub-specific application)

Per the system-wide convention (`WIREFRAMING_GUIDELINES.md` §8), the Hub's concentration points are:

1. **Capability identity** (H-1)
2. **Representative work** (H-4) — *the emotional and visual center*
3. **Services** (H-3)
4. **Contact** (H-6)

Everything else (H-2 framing, H-5 continue, Global Header, Footer, supporting components) reinforces these moments rather than competing with them.

## Narrative density
Follows the system-wide convention (`WIREFRAMING_GUIDELINES.md` §7) — one idea per module; split rather than compress. No hub-specific exception.

---

## Validation

- **Responsibilities preserved:** H-1…H-6 each realize exactly their Hub Page IA responsibility; none moved ✔.
- **Approved components only:** Page Introduction · Hero · Rich Text · Section Introduction · Section Header · Statistic · Work Preview Card · Service Preview Card · CTA Group · Global Header · Footer ✔ (no components invented).
- **One responsibility per module** ✔.
- **Narrative density** (inherited convention) respected ✔.
- **Depth principle** respected — modules deepen; breadth defers to the Archive ✔.
- **Visual emphasis hierarchy** declared for this page (H-4 the center) ✔.
- **Spatial composition** terminology used consistently ✔.
- **Central Design Principle** — the work is the protagonist across H-1 and (especially) H-4; the interface frames it and stays quiet ✔.
- **One primary action:** single primary conversion action (Contact, H-6); services/archive continuations are navigation, kept distinct ✔.
- **Canonical destinations intact:** H-3 → Service pages; H-4/H-5 → pillar-filtered Archive; H-6 → Contact; F1 back-path inbound preserved ✔.
- **Evidence-before-offering (work → services) retained** as a deliberate design decision ✔.
- **Responsive intent preserved** (modules stack; responsibilities and hierarchy unchanged) ✔.
- **Both pillars fit one template**, differing only in content ✔.
- **No architectural decisions introduced** ✔.

**Result:** the canonical template for both pillar hubs — one structural language, each capability's content and identity emerging naturally.
