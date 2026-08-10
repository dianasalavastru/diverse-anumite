# Documentation v1.0 — Release & Freeze Record

**Release tag: `Documentation v1.0`**
**Status: FROZEN — 2026-07-30**

This record formally freezes the design-architecture documentation corpus for the Atelier portfolio website. As of this release, the corpus is **complete and internally coherent**: every layer from foundations to wireframes exists, is traceable to its authoritative upstream, and introduces no unresolved decisions. Further speculative refinement ends here.

From this point, the documentation is the **reference against which design is evaluated** — not an artifact that keeps evolving alongside design. The next phase produces high-fidelity design (Figma), and the frozen corpus is the fixed specification those designs must satisfy.

---

## 1. What v1.0 represents

A single, continuous information- and design-architecture language, built strictly top-down through its abstraction layers:

**Foundations → Content Model → Information Architecture → Reviews → Page IA (+ Index) → Design System → Wireframes.**

Every layer honoured the discipline that made the freeze possible: *no layer introduced decisions that belonged to a layer above it*, and every document is traceable to the authoritative docs it derives from. The corpus reached v1.0 through validated decisions (Decision Log Batches 1–18) and three independent review passes (content-model validation, IA review F1–F6, UI architecture review C1/C2/M1–M5) — **none of which invalidated the finalized IA.**

---

## 2. Immutability policy

**The v1.0 corpus is immutable except through the four amendment channels below.** No other change is permitted — in particular, **no speculative refinement**, no re-opening of frozen decisions for preference, and no evolution of the documentation to match design as design proceeds.

**Permitted amendments:**

1. **Corrections** — factual errors, broken traceability, internal contradictions, or typos. Restores the corpus to what it already intended to say; changes no decision.
2. **Genuine architectural discoveries** — a real structural problem surfaced that the architecture cannot express. Rare, and must be argued as a discovery, not a preference.
3. **Implementation feedback after design** — a constraint that only becomes visible once high-fidelity design or build is underway, and that the architecture must accommodate.
4. **Usability testing** — evidence from real users that a structural assumption does not hold.

**Amendment procedure.** Any amendment is recorded in `DECISIONS_LOG.md` as a new batch, cites which of the four channels justifies it, names every affected document, and increments the release (v1.1, v1.2, …). The four channels are the *only* valid justifications; "on reflection, I'd prefer…" is not one of them.

---

## 3. Frozen corpus manifest

All documents below are frozen at v1.0. Documents already carrying their own freeze (e.g. Content Model v2.1) retain it; this release freezes the corpus as a whole.

**Foundations**
- `PROJECT_CONTEXT.md` — project brief & context
- `README.md` — corpus orientation
- `claude/DISCOVERY_REVIEW.md` — discovery review; facts vs assumptions; confirmed decisions

**Content Model**
- `claude/CONTENT_MODEL.md` — **FROZEN v2.1**; canonical objects, taxonomy, curation layer
- `claude/CONTENT_MODEL_VALIDATION.md` — worked examples + stress test (F6-aligned)

**Information Architecture**
- `claude/INFORMATION_ARCHITECTURE.md` — Steps 1–7 locked; F1/F2/F4/F5/F6 integrated
- `claude/NAV_DECISION_RECORD.md` — navigation ADR (two layers, task-first)

**Architectural reviews**
- `claude/ARCHITECTURE_REVIEW.md` — first architecture review
- `claude/ARCHITECTURE_REVIEW_02.md` — UI architecture review (C1/C2/M1–M5); IA unchanged

**Page IA**
- `claude/HOMEPAGE_PAGE_IA.md`
- `claude/HUB_PAGE_IA.md`
- `claude/SERVICE_PAGE_IA.md`
- `claude/WORK_ARCHIVE_PAGE_IA.md`
- `claude/WORK_ENTRY_PAGE_IA.md`
- `claude/CONTACT_PAGE_IA.md`
- `claude/PAGE_IA_INDEX.md` — architectural index (map, not spec)

**Design system**
- `claude/WIREFRAME_PRINCIPLES.md` — design constitution (IA→wireframe rules)
- `claude/COMPONENT_INVENTORY.md` — ~35 components across 6 families
- `claude/WIREFRAMING_GUIDELINES.md` — operational manual (Narrative Density · Visual Emphasis Hierarchy · Spatial Composition)
- `claude/VISUAL_DIRECTION.md` — design vision (opens with the Central Design Principle)

**Wireframes (all six page types)**
- `claude/HOMEPAGE_WIREFRAME.md`
- `claude/PILLAR_HUB_WIREFRAME.md`
- `claude/SERVICE_WIREFRAME.md`
- `claude/WORK_ARCHIVE_WIREFRAME.md`
- `claude/WORK_ENTRY_WIREFRAME.md`
- `claude/CONTACT_WIREFRAME.md`

**Ledger**
- `claude/DECISIONS_LOG.md` — canonical decision ledger (Batches 1–19)

---

## 4. Load-bearing invariants (what design must not break)

The design phase inherits these as fixed constraints. Any high-fidelity design is evaluated against them:

- **Central Design Principle** — *the work is the protagonist; the interface is its frame.*
- **Understanding before persuasion** — pages enable action; they do not pressure it.
- **Two co-equal pillars, one brand** — Architecture & Design and Reality Capture; neither secondary.
- **Content Model v2.1** — Work Entry as canonical object; Service first-class; Work Entries *demonstrate* Services (referenced, not copied); curation distinct from taxonomy.
- **Two-layer navigation** — homepage narrative (Layer 1) + persistent task-first global nav *Despre · Servicii · Proiecte · Contact · EN* (Layer 2); never shape-shifts.
- **Single responsibility per page** — Homepage invites · Hub explains a capability · Service resolves a decision · Archive enables discovery · Work Entry enables independent evaluation · Contact begins the conversation.
- **Approved component set only** — the Component Inventory is the closed vocabulary; new components require an amendment.
- **Integrity / honest crediting** — attribution is crediting, scoped Authorship prevents over-claiming; the visitor never leaves with a misleading impression.

---

## 5. Next phase — High-Fidelity Design (Figma)

The next artifact is **not** another Markdown document. It is:

**Homepage — High-Fidelity Design (Figma).**

Design order (mirrors the wireframe set):

1. Homepage
2. Hub
3. Service
4. Archive
5. Work Entry
6. Contact

Each design is produced against its frozen wireframe, Page IA, and the shared design-system docs, and is evaluated for fidelity to them. Where design surfaces a genuine constraint, it enters through amendment channel 3 (implementation feedback) — it does not silently reshape the documentation.

---

**Documentation v1.0 is frozen. The reference is set; design begins.**
