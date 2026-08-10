# Wireframe Principles — design constitution

**The bridge between architecture and design.** These are the constitutional rules every future wireframe must follow so that each screen remains faithful to the completed architecture. This document defines pages and layouts **not at all** — it defines *how* the architecture should be expressed. It introduces **no new information architecture**; it translates the existing Page IA contracts into design principles.

Level: **Design Architecture** (between Page IA and Wireframes). Status: **authoritative**.

**It answers one question:** *how should the architecture be translated into wireframes without changing the architecture?* It exists so that visual design **expresses architectural intent rather than inventing it.**

**Out of scope (by rule):** no new IA decisions · no visual styling · no colors · no typography · no component design · no pixel measurements · no tool-specific (e.g. Figma) guidance. Everything here is implementation-independent.

Authoritative sources it translates: `PAGE_IA_INDEX.md` and the six Page IA blueprints (`HOMEPAGE`, `HUB`, `SERVICE`, `WORK_ARCHIVE`, `WORK_ENTRY`, `CONTACT`), built on `INFORMATION_ARCHITECTURE.md`, `CONTENT_MODEL.md` (frozen v2.1), `NAV_DECISION_RECORD.md`, `DECISIONS_LOG.md`.

---

## 1. Purpose

Wireframe Principles sit **between Page IA and wireframes**. Page IA defines *what exists and what each page is responsible for*; these principles define *how that is expressed in a layout*. **Architecture determines what exists; Wireframe Principles determine how it is expressed.** Every wireframe is a realization of the Page IA contracts, never a reinterpretation of them.

## 2. Design philosophy (inherited, not new)

The philosophy carried down from the architecture — not invented here:

- **Understanding before persuasion.**
- **Why precedes what.**
- **Evidence over claims.**
- **Context before action.**
- **Editorial over marketing.**
- **Simplicity through responsibility** (a page is simple because it does one thing).

## 3. Information hierarchy

Every page reads in the same architectural order, because understanding must accumulate before action:

- **Orientation first** — every page communicates where the visitor is before anything else.
- **Context precedes detail.**
- **Detail precedes action.**
- **Supporting information follows primary understanding.**
- **Primary actions appear only after sufficient understanding.**

*Why:* the architecture is built on *understanding before persuasion*; a layout that surfaces action or detail before orientation contradicts the page's own responsibility.

## 4. Module principles

Page IA modules become wireframe modules **one-to-one**:

- **One module = one responsibility** (mirrors "one page, one responsibility").
- **Modules never merge unrelated responsibilities.**
- **Each module is independently understandable.**
- **Each module communicates one architectural idea.**
- **Modules remain reusable across pages** (e.g. the Work card, credits block, related strip, highlight module).

## 5. Reading flow

Layouts reinforce a single reading rhythm rather than interrupt it:

**Orientation → Understanding → Evidence → Decision → Action**

*Why:* this is the responsibility progression of the whole system (Practice → Capability → Solution → Evidence → Assessment → Conversation) expressed at the level of a single page. A layout should carry the reader forward through this progression; it should never force action before evidence, or detail before orientation.

## 6. Navigation principles

- **Every page clearly communicates where the visitor is.**
- **Canonical destinations stay obvious** (a module's CTA leads to its one canonical page).
- **Navigation reduces uncertainty.**
- **Navigation never duplicates page content.**
- **Navigation supports the architecture rather than replacing it** (the persistent global nav is additive and never shape-shifts).

## 7. Content principles

- **Avoid duplication;** prefer **references over repetition** (the architecture references, it does not copy).
- **Progressive disclosure** — surface only the information the current responsibility requires.
- **Rich detail belongs deeper in the journey** (a preview signposts; the depth lives on the canonical page).
- **Every piece of content has one canonical home;** other pages reference it.

## 8. CTA principles

- **One primary action per page.**
- **Actions emerge naturally from understanding** — never before it.
- **CTAs never interrupt explanation.**
- **Navigation and conversion remain distinct** (wayfinding is not a sales prompt).
- **Secondary actions support exploration** rather than compete with the primary one.

## 9. Empty states

Every empty state maintains confidence (the F5 philosophy, generalized):

- **Preserve context** (show the current scope/filters/intent).
- **Explain why** there is nothing.
- **Suggest a next step.**
- **Never present a dead end** — and never a bare empty grid.

## 10. Consistency principles (architectural, not visual)

Consistency here means **architectural** consistency, not a shared visual style:

- **Similar responsibilities produce similar layouts.**
- **Similar modules appear consistently** across pages.
- **Identical concepts are always structurally identical** (a Work card is a Work card everywhere).
- **Layout hierarchy follows information hierarchy** (§3).
- **Visual structure communicates responsibility** — the shape of a page should reveal what it is for.

## 11. Transition to wireframes

The next phase gains freedom in *how*, not *what*.

**Wireframes MAY define:** grouping · spacing · positioning · layout · responsive behaviour.

**Wireframes MAY NOT redefine:** responsibilities · journeys · information hierarchy · navigation · content ownership.

Any wireframe that would change something in the second list is out of bounds — that is an architecture change, and the architecture is complete.

## 12. Completion statement

These principles ensure that **every future wireframe expresses the architecture already defined by the Information Architecture and Page IA layers.** Design should **realize architectural intent rather than reinterpret it.** Every layout decision should reinforce **responsibility, understanding, and clarity before aesthetics** — so that each screen is a faithful realization of the architectural contracts, not a reinterpretation of them.
