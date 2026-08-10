# Wireframing Guidelines — operational manual

**The methodology for translating the completed architecture into low-fidelity wireframes.** This document introduces **no new architecture, no new Page IA decisions, and no new components.** It defines how wireframes are **produced, reviewed, and validated** against the architectural contracts, and it holds the **system-wide wireframing conventions** every page inherits.

Level: **Design Process**. Status: **authoritative**.

> **Governance note (Decision Log Batch 20, 2026-08-10):** Visual language is now governed by `VISUAL_DIRECTION_v2.0.md` (“measured reality”). Any reference to `VISUAL_DIRECTION.md` below is the **superseded** v1 direction (“architectural publication”); this document remains **structurally authoritative**.

**Governing rule:** every wireframe is a **realization** of the architecture, not an **exploration** of it. Wireframes may solve *layout* problems; they may not solve *architecture* problems. **If a wireframe suggests changing responsibilities, journeys, modules, or content ownership, the architecture — not the wireframe — must be revisited.**

---

## 1. Purpose

The architecture is complete. Wireframing is the process of **expressing it spatially.** The goal is **clarity, not aesthetics.** A wireframe succeeds when another person can read the page's responsibility and reading flow directly from its structure.

## 2. Inputs

Every wireframe is derived **only** from:
- `INFORMATION_ARCHITECTURE.md`
- the six Page IA blueprints + `PAGE_IA_INDEX.md`
- `WIREFRAME_PRINCIPLES.md`
- `COMPONENT_INVENTORY.md`
- `VISUAL_DIRECTION.md`
- `CONTENT_MODEL.md` (frozen v2.1)

**No other source may introduce architectural decisions.**

## 3. Outputs

Each completed wireframe defines **only**:
- module order · grouping · **spatial composition** · spacing hierarchy · layout hierarchy · responsive intent.

Nothing more — no visual styling, color, typography, or final copy.

## 4. Wireframing workflow

For every page, in sequence:

**Step 1 — Read the Page IA.** Understand the page's single responsibility before anything else.
**Step 2 — List the modules.** Preserve the Page IA module set and order.
**Step 3 — Assign components.** Use **only** Component Inventory components. **Do not invent components.**
**Step 4 — Group into spatial composition.** Only now think spatially.
**Step 5 — Check reading flow:** Orientation → Understanding → Evidence → Decision → Action.
**Step 6 — Validate against Wireframe Principles and the conventions below.** Only after passing validation may visual design begin.

## 5. Wireframe validation checklist

Every wireframe must answer **YES** to all:
- Is the page responsibility immediately clear?
- Does orientation come first?
- Is information hierarchy preserved?
- Does every module still own exactly one responsibility?
- **Does each module communicate one idea before the next (narrative density)?**
- **Are visual concentration points intentional, with supporting modules reinforcing them (visual emphasis hierarchy)?**
- Are only approved (Component Inventory) components used?
- Is there one primary action?
- Does navigation reinforce the architecture (and never duplicate content)?
- Is unnecessary duplication avoided (reference, don't repeat)?
- Is the reading flow uninterrupted?
- **Could another designer reconstruct the same Page IA from this wireframe?**

A "NO" to any item is an architectural or process failure, not a styling note — fix the wireframe (or escalate to the architecture) before proceeding.

## 6. Responsive thinking

Wireframes define **intent, not exact breakpoints.** The hierarchy must survive at any screen size:
- **Modules may stack.**
- **Responsibilities may not move.**
- **Information hierarchy must remain unchanged.**

## 7. Narrative density *(system-wide convention)*

Every module should communicate **one idea well before introducing the next.** Modules should **never accumulate multiple responsibilities.** If content becomes too dense, **split the module rather than compress it.** Pages should feel like a **carefully paced editorial narrative rather than a long landing page** — reinforcing the "architectural publication" character of the Visual Direction.

## 8. Visual emphasis hierarchy *(system-wide convention)*

**Reading order defines sequence; visual emphasis defines attention.** Every wireframe should intentionally establish a **small number of visual concentration points** — the moments where attention should naturally gather. **Supporting modules reinforce these moments rather than compete with them.** Each page wireframe declares its own concentration points; the *convention* is that they are few, intentional, and unopposed.

## 9. Spatial composition *(terminology)*

Wireframes describe **spatial composition** — the *layout relationships* between components (grouping, order, relative emphasis) — never *visual composition* (styling, color, typography). Use the term **"spatial composition"** consistently, so the distinction stays clear once visual design begins.

## 10. Common mistakes (avoid)

- Combining unrelated modules.
- Inventing new responsibilities.
- Introducing new navigation.
- Duplicating content.
- Moving CTAs before understanding.
- Designing visually before validating hierarchy.
- Creating components outside the Component Inventory.
- Letting a module accumulate multiple ideas instead of splitting it.

## 11. Definition of Done

A wireframe is complete when:
- every Page IA module is represented;
- every module uses approved components;
- reading flow matches the architecture;
- **spatial composition is consistent;**
- narrative density and visual emphasis hierarchy are respected;
- responsive intent is clear;
- **no architectural decisions have been introduced.**

## 12. Transition to visual design

Visual design **may change:** appearance · typography · spacing · imagery · color · interaction polish.

Visual design **may NOT change:** responsibilities · journeys · modules · hierarchy · component ownership · navigation · canonical destinations.

Anything in the second list is an architecture change, and the architecture is complete.

## 13. Completion statement

Wireframing is the **translation of architecture into spatial structure.** A successful wireframe does not invent solutions; it **faithfully expresses the architectural contracts already established.** Every layout decision should make the underlying architecture **more legible, never less** — so that design reviews stay objective, repeatable, and directly traceable back to the completed architectural corpus.
