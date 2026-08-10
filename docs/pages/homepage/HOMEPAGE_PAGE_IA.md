# Homepage Page IA — authoritative blueprint

The homepage defined as an **information-architecture object** — the bridge between the finalized IA and future wireframes. It **expresses** the locked architecture; it does not redesign or reinterpret it. Authoritative inputs (do not reopen): `CONTENT_MODEL.md` (frozen v2.1), `INFORMATION_ARCHITECTURE.md`, `NAV_DECISION_RECORD.md`, `ARCHITECTURE_REVIEW_02.md`, `DECISIONS_LOG.md`.

Level: Page IA (not UI). No wireframes, no layout, no styling. **Why precedes what** throughout. Status: **authoritative** (2026-07-30) — the blueprint from which Homepage wireframes are produced.

---

## 1. Homepage responsibility

**Primary purpose** (from IA Step 3 / page-type responsibilities): introduce the practice as **one identity**, present **both capabilities**, and **route each visitor** to the path most relevant to them.

**Success = helping visitors quickly understand the practice, choose the relevant direction, and continue with confidence.** Routing remains the primary outcome, but **understanding precedes routing**.

**User questions it answers**
- Is this one practice, and whose? (identity)
- What can they actually do? (two co-equal capabilities)
- Which direction is relevant to me? (self-segmentation)
- Is this credible? (practice-level trust)
- Where do I go next? (routing)

**What it intentionally does NOT do**
- Does not sell a specific service — that's the Service page.
- Does not act as the Work archive — that's Proiecte.
- Does not deep-dive a capability — that's the Pillar Hub.
- Does not convert / hard-sell — that's Contact + Service pages.
- Does not list everything — it presents curated highlights only.

**Relationship to the rest of the architecture**
- **Pillar Hubs** — the homepage's primary hand-off; the early branch and each pillar section continue *into* the hub (M4 = when; C1 = how). Homepage = entry; hub = destination.
- **Services** — introduced only at capability level; the homepage routes to services *through the hub*, never dumping individual services.
- **Work Archive** — shows curated highlights that hand off to canonical destinations; does not replace or expose the raw archive directly (archive reached via global nav or a hub).
- **Curated Views** — Homepage Highlight modules that *represent* the Competitions and Professional Experience curated views as real destinations (M5).
- **About** — the homepage carries an identity + a pillar-neutral trust beat, then hands to About for depth.
- **Contact** — the homepage provides a clear *path* to Contact (not a form); Contact converts.

---

## 2. Homepage information flow (sequence of user understanding)

Stages of *understanding*, not visual sections. Order note: the IA fixes the jobs, not their order (Step 3); the editorial order of the two pillar sections and the exact position of the trust beat are the designer's, as long as (a) identity precedes the branch and (b) the trust beat stays pillar-neutral. The canonical progression below is the blueprint; flex points are marked.

**Stage A — Identity.**
- *Understand:* this is one architect / one coherent practice.
- *Why:* establish the single brand before any split (D9); prevents a "two businesses" reading.
- *Hands next:* into the capability signal / branch (and offers About for depth).

**Stage B — Dual capability + early self-segmentation (the branch).**
- *Understand:* there are two co-equal capabilities — Architecture & Design and Reality Capture — and I can choose a direction now.
- *Why:* enable frictionless self-segmentation (D8, M4) without forcing one pillar before the other; establish co-equal standing (D3, no structural primacy).
- *Hands next:* to either **Pillar Hub** — or continue scrolling the unified narrative.

**Stage C — Practice-level credibility (pillar-neutral trust beat).** *(Flex: may sit just before or just after Stage B, as long as it stays pillar-neutral.)*
- *Understand:* why this practice is credible — experience, the EU-funded professional equipment.
- *Why:* serve credibility (J3) early without forcing pillar-specific content on the scroller (the credibility-splitting insight; per-pillar proof comes later).
- *Hands next:* into per-pillar exploration, or About for the full story.

**Stage D — Per-pillar editorial preview & proof.** *(Flex: editorial order of the two pillars is the designer's.)*
- *Understand:* enough of what each capability's work is like, through curated examples, to decide whether to continue.
- *Why:* the homepage is intentionally **not** summarizing the Hub — it provides enough context, examples and confidence for the visitor to *choose to continue* into the Pillar Hub, and gives the in-flow entry to it (C1).
- *Hands next:* each pillar section continues into its **Pillar Hub**.

**Stage E — Curated highlights (canonical views).**
- *Understand:* there are notable, nameable bodies of work — **Competitions** and **Professional Experience**.
- *Why:* surface the canonical curated views as real destinations (M5) and demonstrate breadth + honest professional history.
- *Hands next:* **Curated View → Work Entry**.

**Stage F — Contact invitation.**
- *Understand:* how to start a conversation.
- *Why:* satisfy the acquisition goal's *path* (J6) without hard-selling.
- *Hands next:* **Contact**.

**Stage G — Persistent orientation (footer).**
- *Understand:* how to navigate anywhere, who they are, that it's legitimate.
- *Why:* lateral movement + compliance (global nav, social, EU-funding acknowledgment, language).
- *Hands next:* any global-nav destination.

---

## 3. Module inventory (derived from the flow)

**Navigation-consistency rule for all highlight modules — two levels:**
- **Module CTA → always continues to the canonical destination** (a Pillar Hub, or a Curated View). This is the primary, fixed behaviour (M5 consistency, applied uniformly).
- **Individual content items → left as a wireframe-phase decision.** They may either continue to the canonical destination or link directly to the corresponding Work Entry, if that proves a better experience without weakening the overall architecture.

**M-1 · Identity module** *(Stage A)*
- *Why:* establish one practice before the split.
- *Question:* who is this / is it one practice?
- *Consumes:* practice identity + positioning (About-level).
- *Destinations:* About.
- *Dependencies:* brand/identity copy.
- *Future:* none essential.

**M-2 · Pillar branch module — early self-segmentation** *(Stage B)*
- *Why:* let the visitor choose a co-equal direction early (M4).
- *Question:* which direction is relevant to me?
- *Consumes:* the two Pillars (as concepts) + representative media.
- *Destinations:* the two **Pillar Hubs**.
- *Dependencies:* Pillar Hubs must exist (C1 pending representation).
- *Future:* none.

**M-3 · Practice-credibility module** *(Stage C)*
- *Why:* pillar-neutral trust early (J3) without forcing pillar content.
- *Question:* is this credible?
- *Consumes:* credibility content — experience, EU-funded equipment.
- *Destinations:* About.
- *Dependencies:* real practice-level credibility copy (Minor m3).
- *Future:* testimonials / client list if later added.

**M-4 · Pillar section module (×2 — one per pillar)** *(Stage D)*
- *Why:* per-pillar editorial preview + proof + in-flow hub entry (C1). **The purpose is not to summarize the Pillar Hub, but to create sufficient understanding and curiosity for the visitor to continue into it** — this protects the homepage from gradually accumulating hub-level content over time.
- *Question:* what is their [architecture / reality-capture] work like, and where's the rest?
- *Consumes:* pillar-scoped **curated Work Entries** (Homepage Highlight via curation layer) + the pillar's capability framing.
- *Destinations:* **Module CTA →** the **Pillar Hub**. (Individual item behaviour per the rule above.)
- *Dependencies:* Pillar Hubs (C1); curation-layer Homepage-Highlight selections per pillar.
- *Future:* a Reality-Capture-specific preview treatment (e.g. point-cloud) — UI-phase, not IA.

**M-5 · Curated-view highlight module (Competitions; Professional Experience)** *(Stage E)*
- *Why:* represent the canonical curated views as real destinations (M5). **These modules exist to expose important editorial narratives that cut across the Work Archive, rather than to replace archive browsing** — which is why the curated views deserve to exist architecturally.
- *Question:* what are the notable competitions / where is the professional-experience work?
- *Consumes:* the **Competitions** and **Professional Experience** curated views (Professional Experience grouped by Employer; employer is grouping metadata, not a category).
- *Destinations:* **Module CTA →** the respective **Curated View** (→ then Work Entry). (Individual item behaviour per the rule above.)
- *Dependencies:* curated-view routes (`/proiecte/concursuri`, `/proiecte/experienta-profesionala`); curation-layer selections.
- *Future:* additional curated views only if promoted per the locked promotion test.

**M-6 · Contact-invitation module** *(Stage F)*
- *Why:* provide a clear path to start a conversation without hard-selling.
- *Question:* how do I get in touch / start a project?
- *Consumes:* none (no inline form).
- *Destinations:* **Contact** (which carries the service-aware form + prefills).
- *Dependencies:* Contact page.
- *Future:* none (inline forms belong to Contact).

**M-7 · Footer module** *(Stage G)*
- *Why:* persistent orientation, compliance, social.
- *Question:* how do I navigate / who are they / is this legitimate?
- *Consumes:* global nav (Layer 2), social links, **EU-funding acknowledgment** (Step 7), language toggle.
- *Destinations:* all global-nav destinations + Contact + legal/privacy.
- *Dependencies:* EU-funding assets (Minor m1); legal/privacy pages.
- *Future:* none.

*(M-1 and M-3 may be authored as one identity+trust beat or two modules — a wireframe-phase choice; kept distinct here because they answer different questions.)*

---

## 4. Navigation integration (consistent with NAV_DECISION_RECORD)

The homepage's Layer-1 wayfinding is **additive** to the persistent Layer-2 global nav (Despre · Servicii · Proiecte · Contact · EN), which is present and unchanged on the homepage (no shape-shift).

- **→ Pillar Hubs:** via the early branch (M-2) and each pillar section's continuation (M-4) — Layer-1 editorial hand-offs (the agreed C1 pattern). Hubs are deliberately **not** in Layer 2 (task-first); the homepage is a primary inbound edge to them.
- **→ Services:** the homepage does **not** hand directly to individual services; it routes **through the Pillar Hub** (hub frames its services). Direct service access is the job of Layer-2 "Servicii" (pillar-grouped, per M1).
- **→ Work Archive:** reached via Layer-2 "Proiecte" and via a hub's "see all work"; the homepage highlight modules route to curated views / hubs, not the raw archive.
- **→ Curated Views:** via M-5 (Homepage Highlight → Curated View → Work Entry) and via the archive.
- **→ Contact:** via M-6, Layer-2 "Contact," and the footer.

Every homepage highlight module's **CTA** uses one consistent hand-off (→ canonical destination); individual item behaviour is deferred to wireframing (see §3).

---

## 5. Success criteria (Page-IA, not aesthetic)

- **Clarity:** within moments the visitor understands it is **one practice with two co-equal capabilities.**
- **Progression:** identity → capability/branch → (trust) → per-pillar → curated highlights → contact reads as a coherent sequence of understanding, each stage handing off clearly.
- **Information hierarchy:** two pillars co-equal (no structural primacy, D3); the homepage **routes rather than sells**; content is **curated, not exhaustive**.
- **Navigation hand-offs:** every stage has a clear next destination; the early branch + pillar continuations both reach the **Hubs**; highlights reach **Curated Views**; Contact is reachable; the global nav is persistent for deep-linkers.
- **Single responsibility:** **every homepage module has one clear architectural responsibility and does not duplicate the responsibility of another page.**
- **Consistency with the finalized IA:** expresses — never reinterprets — the locked architecture: task-first nav, pillars via structure (not the menu), Homepage Highlight → Curated View → Work Entry, RC and A&D co-equal, single Work model. **No IA concept is missing, and none is added.**

**Concrete pass/fail tests**
- A single-interest visitor can branch to their pillar early **without consuming the other** (D8).
- **Neither pillar** reads as primary (D3).
- **No homepage module duplicates a downstream page's job** (it routes; it does not sell, list, or detail).
- **Every content object referenced resolves to a canonical destination.**
- A deep-linker on an interior page still sees the **same global nav** (no shape-shift).

---

## Open (carried into wireframing, non-blocking)
Individual content-item link behaviour within highlight modules (module CTA is fixed → canonical destination; items deferred); whether identity + trust are one module or two; Reality-Capture preview treatment (UI); real credibility copy (m3); EU-funding assets (m1). Hub pages + F1 paths are represented in **Hub Page IA** (separate), which the branch (M-2) and pillar sections (M-4) depend on.
