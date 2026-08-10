# Service Wireframe — low-fidelity structural specification (canonical template)

**The canonical structural wireframe for a Service page** — the template from which every concrete Service page is realized. It expresses the Service Page IA **spatially** and nothing more. It introduces **no new IA, no new Page IA, no new components, and no new visual direction.**

**The Service page is the project's decision page** — where the visitor transitions from *understanding a capability* to *recognizing a concrete solution for their own project.*

Level: **Low-Fidelity Wireframe**. Status: **authoritative** (template for every service).

> **Governance note (Decision Log Batch 20, 2026-08-10):** Visual language is now governed by `VISUAL_DIRECTION_v2.0.md` (“measured reality”). Any reference to `VISUAL_DIRECTION.md` below is the **superseded** v1 direction (“architectural publication”); this document remains **structurally authoritative**.

Derived exclusively from: `SERVICE_PAGE_IA.md`, `PAGE_IA_INDEX.md`, `COMPONENT_INVENTORY.md`, `WIREFRAMING_GUIDELINES.md`, `VISUAL_DIRECTION.md`, `CONTENT_MODEL.md`.

**Inherits (applies, does not restate):** Central Design Principle · Narrative Density · Visual Emphasis Hierarchy · Spatial-Composition terminology · editorial pacing · responsive principles.

**Notation.** "Above / below / beside" describe reading order and relative emphasis, never pixel positions.

---

## Persistent frame (inherited)

- **Global Header** — persistent Layer-2 nav, unchanged. The Service page is reached via the Hub (H-3), the Servicii index, search, or a Work Entry.
- **Footer** — the global footer.

---

## S-1 · Service orientation *(Service Page IA Stage A) — Orientation*

**Responsibility realized:** identify which service this is and anchor a cold/search arrival to the parent pillar / practice.

**Components (Inventory):** Page Introduction (service name + one-line positioning) · Breadcrumb (parent Pillar Hub — the F1 back-path) · a light text link to About.

**Spatial composition:** a calm opening that names the service first; the Breadcrumb sits quietly as orientation and back-path, never an emphasized action. Image-led if media is present, interface quiet around it.

**Reading intent:** the visitor leaves knowing *which service this is, and that they're in the right place* — even arriving cold from search.

**Transition:** oriented, the visitor is ready to test whether this is their problem → problem recognition.

**Responsive intent:** introduction and breadcrumb stack into one opening unit; the service identity remains first.

---

## S-2 · Problem & fit *(Service Page IA Stage B) — Problem recognition*

**Responsibility realized:** help visitors recognize their own problem and whether this service is their solution (what it solves, who it's for).

**Components (Inventory):** Section Introduction (framing) · Rich Text (what the service solves + who it's for + use-cases).

**Spatial composition:** prose-led, focused on the *visitor's* situation rather than the service's description; use-cases presented as a calm, evenly-weighted set. One idea — "is this my problem?" — resolved before moving on.

**Reading intent:** the visitor leaves recognizing *whether this service addresses their situation.*

**Transition:** recognizing the fit, the visitor wants to know what the solution actually is → solution understanding.

**Responsive intent:** framing and use-cases stack; problem recognition reads before the solution detail.

---

## S-3 · What you get, how it works & what to expect *(Service Page IA Stage C) — Solution understanding*

**Responsibility realized:** reduce uncertainty by making the service **tangible** — deliverables, process, and realistic expectations.

**Components (Inventory):** Section Header · Rich Text (deliverables · process · what to expect) · Statistic ×n (optional — reality-capture accuracy/specs) · Accordion / FAQ (optional secondary detail).

**Spatial composition:** the concrete substance of the service, presented plainly and specifically — practical over promotional. Any statistics/specs support; secondary detail may defer into an Accordion (progressive disclosure). This module and S-2 together form the page's strongest visual idea — the solution itself.

**Reading intent:** the visitor leaves understanding *what they get, how it works, and what to expect.*

**Transition:** understanding the solution, the visitor asks "have they done this well?" → representative evidence.

**Responsive intent:** substance stacks; deliverables/process/expectations retain their order.

---

## S-4 · Proof / demonstrated work *(Service Page IA Stage D) — Representative evidence*

**Responsibility realized:** trust through **relevant** evidence — Work Entries that demonstrate *this specific service* (demonstrate, don't browse).

**Components (Inventory):** Section Header · Work Preview Card ×n (the demonstrating Work Entries) · CTA Group ("see more" → pillar-filtered Work Archive).

**Spatial composition:** the work is the protagonist — a curated set of relevant Work Preview Cards, generous whitespace, presented as proof of *this* service, not a general gallery. Items may link to Work Entries; the module's "see more" continues to the filtered archive. **This module is the decisive proof moment of the page.** If S-2 and S-3 create intellectual confidence, S-4 transforms that confidence into **trust** through demonstrated evidence — the page's emotional arc being **S-2/S-3 → understanding · S-4 → belief · S-5 → action.**

**Reading intent:** the visitor leaves confident that *this practice delivers this service well.*

**Transition:** confidence earned, the visitor is ready to act → conversation.

**Responsive intent:** cards reflow/stack; proof reads as relevant to the service.

**Empty state (F5) — see the F5 section below.**

---

## S-5 · Contact / conversion *(Service Page IA Stage E) — Conversation*

**Responsibility realized:** the single forward action, without a persuasion-only pitch. Carries the page's **primary (conversion) action.**

**Components (Inventory):** Section Introduction / Rich Text (a quiet invitation) · CTA Group (primary → Contact, with **Topic = pillar** and **Regarding = this service** prefilled).

**Spatial composition:** one calm invitation, one primary action, no competing prompts; appears at the end, after understanding and proof have accumulated. The "see more" and hub back-path above are navigation, kept distinct from this conversion action.

**Reading intent:** the visitor leaves knowing *how to proceed.*

**Transition:** into the persistent footer (or Contact, prefilled).

**Responsive intent:** invitation + single action stack; remains the last, only primary conversion action.

---

## Question–Answer Principle

Every Service module should **answer exactly one remaining visitor question.** The Service page should feel like a **progressively completed conversation rather than a presentation.** Every section should **reduce ambiguity before introducing the next question.** By the end of the page, **no fundamental decision question should remain unanswered.** (Reusable rule for every service.)

## Decision principle

Unlike the Homepage (which introduces) and the Hub (which expands), **the Service page reduces decision uncertainty.** Every module answers one of the visitor's remaining questions; by the end of the page the visitor understands:
- whether this service solves their problem (S-2),
- when it should be chosen (S-2 use-cases),
- what kind of outcomes it produces (S-3),
- why this practice is qualified to deliver it (S-4),
- how to begin the conversation (S-5).

**The page eliminates uncertainty rather than creating desire.**

## Editorial rhythm

**The Homepage introduces. The Hub expands. The Service page resolves.** It should feel: **focused · specific · practical · evidence-driven · reassuring · highly curated — and never promotional.** Depth is spent on making one solution tangible and proven, not on breadth or persuasion.

## Reading progression

The page expresses:

**Orientation → Problem recognition → Solution understanding → Representative evidence → Decision confidence → Conversation**

- **Orientation** (S-1) removes "am I in the right place?" →
- **Problem recognition** (S-2) removes "is this my problem?" →
- **Solution understanding** (S-3) removes "what exactly do I get?" →
- **Representative evidence** (S-4) removes "can they actually do it?" →
- **Decision confidence** is the cumulative state reached once S-1–S-4 have each removed a question — **not a separate module** (no "why choose us?" block), but the emergent readiness S-5 acts on →
- **Conversation** (S-5) removes "how do I proceed?"

**Every transition removes one more source of uncertainty**, so that by S-5 nothing stands between understanding and action.

## Empty state (F5)

If a service currently has little or no demonstrating work, the **S-4 proof module** applies the locked **F5** behaviour (no architectural change): the empty proof set is replaced by the **Empty State** component (service variant) — a concise editorial note that relevant examples are being added, a **Contact CTA**, and the **Hub back-path**; **never** an empty grid/carousel/counter. The rest of the page (S-1–S-3, S-5) remains fully intact, so the page still explains and converts, and **confidence in the service itself is undiminished.**

## Contact continuity

The S-5 continuation preserves context using the agreed prefill behaviour: **Topic = this pillar** and **Regarding = this service** are carried into Contact, so the visitor never re-enters the context the journey already established.

## Visual emphasis hierarchy (service-specific application)

Unlike the Homepage and Hub, the Service page makes **the solution itself the strongest visual idea.** Concentration points:

1. **The solution** (S-2 problem→fit + S-3 what-you-get) — strongest
2. **Representative evidence** (S-4)
3. **Contact** (S-5)

Everything else (S-1 orientation, breadcrumb, header, footer, supporting components) supports the visitor's decision rather than competing with it.

## Narrative density
Follows the system-wide convention — one idea per module; split rather than compress. No service-specific exception.

---

## Validation

- **Responsibilities preserved:** S-1…S-5 each realize exactly their Service Page IA responsibility; none moved ✔.
- **Approved components only:** Page Introduction · Breadcrumb · Rich Text · Section Introduction · Section Header · Statistic · Accordion · FAQ · Work Preview Card · CTA Group · Empty State · Global Header · Footer ✔ (no components invented).
- **One responsibility per module** ✔.
- **Question–Answer Principle** — each module answers one remaining question ✔.
- **Narrative density** respected ✔.
- **Visual emphasis hierarchy** declared (the solution is the strongest idea) ✔.
- **Depth appropriate for a Service page** — resolves one solution; defers breadth to the Archive, identity to About ✔.
- **Uncertainty reduced progressively** — each transition removes one question ✔.
- **Representative evidence supports the solution** — proof is service-relevant, not a general gallery ✔.
- **F5 behaviour preserved** — proof-thin services stay credible; no empty grid ✔.
- **Topic/Regarding continuity preserved** into Contact ✔.
- **One primary action:** single primary conversion action (Contact, S-5); "see more" and hub back-path are navigation, kept distinct ✔.
- **Central Design Principle** — work is the protagonist in S-4; interface stays quiet ✔.
- **Responsive intent preserved** ✔.
- **No architectural decisions introduced** ✔.

**Result:** the canonical Service page template — the moment where understanding becomes confidence and confidence becomes conversation, fully aligned with the project's architecture, editorial language, and evidence-first approach.
