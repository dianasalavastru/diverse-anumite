# Pillar Hub Page IA — authoritative blueprint

The Pillar Hub defined as an **information-architecture object**, sitting between the Homepage and the downstream Service pages, Work Archive and Work Entries. **One blueprint, two instances** — the **Architecture & Design Hub** and the **Reality Capture Hub** — sharing this Page IA and differing only in the content they consume.

Authoritative inputs (do not reopen or reinterpret): `HOMEPAGE_PAGE_IA.md`, `INFORMATION_ARCHITECTURE.md`, `CONTENT_MODEL.md` (frozen v2.1), `NAV_DECISION_RECORD.md`, `ARCHITECTURE_REVIEW_02.md`, `DECISIONS_LOG.md`.

Level: Page IA (not UI). No wireframes, layout, or styling. **Why precedes what.** Status: authoritative (2026-07-30).

**Arrival assumption — three visitor types.** The hub must serve:
- a **warm** visitor (arrived from the homepage branch or a pillar section);
- a **cold** visitor (arrived from search on a head term, or via an F1 back-path from a Service page / Work Entry);
- a **returning** visitor who already understands the capability and comes directly to access services or work.

It must self-orient (it cannot assume the homepage was seen) **and** route efficiently — which is why the hub must **balance orientation with efficient routing** rather than optimising for either alone.

---

## 1. Hub responsibility

**Primary purpose:** be the **canonical topical gateway to one capability** — deepen understanding of that single capability and route the visitor confidently to its Services, its Work, and Contact. It is the pillar's landing/orientation page (and its SEO head-term page).

**User questions it answers**
- What is this capability, concretely?
- What can they do for me within it? (its services)
- Is the work any good, and what's the range? (curated proof)
- Where do I go for a specific service / all the work / to get in touch?
- (Cold arrival) Am I in the right place, and whose practice is this?

**What it intentionally does NOT do**
- Does not re-introduce the whole practice or both pillars — **it is not a second homepage.** It maintains a **single-capability focus**: cross-links to the other pillar may exist as supporting navigation, but are never part of the primary information flow.
- Does not sell or detail a single service — **it is not a Service page** (it overviews and routes).
- Does not list all work or provide the full archive filter — **it is not the Work Archive** (it curates and links).
- Does not tell the identity / practice story — **it does not duplicate About.**
- Does not deep-dive one project — that's the Work Entry.

**Relationship to the rest of the architecture**
- **Homepage** — the hub's primary inbound edge (branch + pillar-section continuation). Homepage introduces *both*; the hub deepens *one*.
- **Services** — the hub **frames the pillar's services and routes to each Service page**; it is the canonical **parent** of its Service pages (the F1 back-path target).
- **Work Archive** — the hub curates a selection and links to the archive **filtered to this pillar** ("see all [pillar] work").
- **Work Entries** — reached via the curated work module (module CTA → the filtered archive; individual items per the shared highlight rule) or via the archive.
- **About** — the hub is capability-focused; identity/person lives on About. A **light** link only.
- **Contact** — the hub offers a pillar-relevant path to Contact (Topic prefilled to this pillar, per Step 7); conversion depth lives on Service pages / Contact.

---

## 2. Hub information flow (sequence of user understanding)

Stages of understanding, not visual sections. Order note (per Step 3 principle): jobs are fixed, order is the designer's — services-before-work or work-before-services are both valid. Canonical progression below; flex marked.

**Stage A — Capability orientation.**
- *Understand:* which capability this is, and (lightly) that it's one facet of one practice.
- *Why:* orient both warm and cold arrivals; a deep-linker must know where they are without the homepage.
- *Hands next:* into the capability framing (and offers About for the identity story).

**Stage B — Capability framing & use-cases.**
- *Understand:* what this capability is *for* and where it applies (its use-cases).
- *Why:* deepen understanding beyond the homepage teaser; serve the searcher who arrived on a head term. "Framing" (not a formal definition) reflects the hub's gateway role.
- *Hands next:* into the services (how to engage) or the work (proof).

**Stage C — Services overview.** *(Flex: may precede or follow Stage D.)*
- *Understand:* the specific services available within this capability, and which one fits.
- *Why:* the hub is the gateway to the pillar's Services; conversion happens on the Service page, not here.
- *Hands next:* the relevant **Service page**.

**Stage D — Curated work / proof.** *(Flex: may precede or follow Stage C.)*
- *Understand:* the quality and range of the work, through a curated selection, with a way to go deeper.
- *Why:* credibility for this capability; the hub **curates, it does not list**.
- *Hands next:* the **pillar-filtered Work Archive** (and Work Entries).

**Stage E — Continue / contact.**
- *Understand:* the ways forward — see all the work, or start a conversation.
- *Why:* route to the archive for breadth and Contact for intent.
- *Hands next:* **Work Archive (filtered)**, **Contact**.

*(The persistent Layer-2 global nav + footer are present as on every page — inherited, not a hub-specific stage.)*

---

## 3. Module inventory (derived from the flow)

**Shared highlight-navigation rule** (inherited from Homepage Page IA §3): a curated module's **CTA always continues to its canonical destination** (here, the pillar-filtered Work Archive); **individual content items are a wireframe-phase decision** (may continue to the canonical destination or link directly to the Work Entry) without weakening the architecture.

**H-1 · Capability orientation module** *(Stage A)*
- *Why:* identify the capability and anchor a cold arrival to the one practice.
- *Question:* which capability is this / am I in the right place?
- *Consumes:* pillar framing (name, one-line positioning); light identity reference.
- *Destinations:* About (light).
- *Dependencies:* pillar copy.
- *Future:* none essential.

**H-2 · Capability framing & use-cases module** *(Stage B)*
- *Why:* frame what the capability is for and where it applies.
- *Question:* what is this for, and where does it apply?
- *Consumes:* capability framing + use-cases (Sector/use-case-relevant, e.g. heritage documentation for RC; residential/interior for A&D).
- *Destinations:* leads into services / work (no external destination of its own).
- *Dependencies:* capability copy.
- *Future:* none.

**H-3 · Services overview module** *(Stage C)*
- *Why:* present the pillar's services and route to each; the hub is the gateway, not the seller. **The purpose is to help visitors recognize the appropriate service, not to compare or explain services in depth** (this protects the Service pages' responsibility).
- *Question:* what can I hire for within this capability?
- *Consumes:* the pillar's **Service objects** (name + short descriptor).
- *Destinations:* the pillar's **Service pages**.
- *Dependencies:* Service objects for the pillar.
- *Future:* none.

**H-4 · Curated work module** *(Stage D)*
- *Why:* show curated proof for this capability. **The purpose is to demonstrate the breadth and quality of the capability, not to provide comprehensive project browsing** (this protects the Work Archive's responsibility).
- *Question:* is the work good / what's the range?
- *Consumes:* pillar-scoped curated **Work Entries** (curation layer).
- *Destinations:* **Module CTA → the pillar-filtered Work Archive** (individual items per the shared rule).
- *Dependencies:* Work Entries in the pillar; curation selections.
- *Future:* Reality-Capture-specific media treatment (e.g. point-cloud) — UI-phase, not IA.

**H-5 · Continue-to-archive module** *(Stage E)* — *(may be authored as H-4's CTA)*
- *Why:* route to full breadth for the visitor who wants everything.
- *Question:* where's all the [pillar] work?
- *Consumes:* none (link).
- *Destinations:* **Work Archive filtered to this pillar.**
- *Dependencies:* archive.
- *Future:* none.

**H-6 · Contact / next-step module** *(Stage E)*
- *Why:* a pillar-relevant path to start a conversation, without hard-selling.
- *Question:* how do I engage?
- *Consumes:* none (no inline form).
- *Destinations:* **Contact** (Topic prefilled to this pillar).
- *Dependencies:* Contact page.
- *Future:* none.

*(H-1 and H-2 may be authored as one orientation+framing block or two modules — a wireframe-phase choice; kept distinct because they answer different questions. The persistent global nav + footer are inherited, not listed as hub-specific modules.)*

---

## 4. Navigation integration (the Hub as canonical bridge)

**Position in the overall user journey.** The hub's architectural role is a bridge:
- **Homepage → Hub → Service → Contact**
- **Homepage → Hub → Work Archive → Work Entry → Contact**
- (cold) **Search → Hub → …**; (F1) **Service / Work Entry → Hub**

The hub is the **canonical topical destination** for its pillar and the **canonical parent** of its Service pages. Consistent with `NAV_DECISION_RECORD.md`: the persistent Layer-2 global nav (Despre · Servicii · Proiecte · Contact · EN) is present and unchanged (no shape-shift); the hub is **not** a top-nav item.

**Inbound to the Hub**
- Homepage branch (M-2) and pillar-section continuation (M-4).
- Search / deep links (head-term landing).
- **F1 back-paths** from the pillar's Service pages and relevant Work Entries.

**Outbound from the Hub**
- **→ Services:** H-3 → each Service page (the hub is their parent).
- **→ Work Archive:** H-4/H-5 → the archive filtered to this pillar.
- **→ Work Entries:** via curated items (H-4) or via the archive.
- **→ Contact:** H-6 → Contact (pillar Topic prefilled).
- **→ About:** H-1 → About (light).

**Canonical-intent split (anti-cannibalization):** hub = broad category / head term; Service page = specific + conversion; archive = browse. The hub routes to each without competing for their intent.

---

## 5. Success criteria (Page-IA, not aesthetic)

- **Clarity:** a visitor — warm, cold/deep-linked, or returning — quickly understands which capability this is and what it's for, without needing the homepage.
- **Capability understanding:** deepens beyond the homepage teaser (framing, use-cases, services, proof) **without becoming** the archive or a Service page.
- **Routing:** clear, complete paths to Services, the pillar-filtered Work Archive, Work Entries, and Contact.
- **Responsibility boundaries:** not a second homepage (single-capability focus), not a Service page (overviews, doesn't sell/detail), not the archive (curates + links), not About (capability, not identity). **One responsibility, no duplication.**
- **Focus:** a visitor never wonders whether they should still be on the Homepage, a Service page or the Work Archive.
- **Consistency with the finalized IA:** expresses the locked architecture — hub as first-class topical gateway (condition 2), canonical parent of its Service pages (F1), canonical-intent split, curated-module CTA → canonical destination. **RC and A&D use the same blueprint with different content; no IA concept missing or added.**

**Concrete pass/fail tests**
- A deep-linker landing **cold** on the hub is oriented and can route — no homepage required.
- The hub keeps a **single-capability primary flow** (any cross-link to the other pillar is supporting navigation only, never part of the primary flow).
- **No hub module** sells a specific service, lists the whole archive, or tells the identity story.
- **Every downstream object resolves to its canonical destination** (Service page / filtered archive / Work Entry / Contact).
- **Both instances (A&D, RC) fit this one blueprint**, differing only in consumed content.

---

## One blueprint, two instances — content differences (not blueprint differences)
- **Architecture & Design Hub** consumes: A&D Services (architectural design, interior design, visualization), A&D use-cases (residential, interior, competitions), A&D curated Work Entries.
- **Reality Capture Hub** consumes: RC Services *(v3.1: Scanare laser 3D · Scan-to-BIM · Fotografie de arhitectura · Vizualizare de arhitectura — **drone photogrammetry is not a Service**)*, RC use-cases (heritage documentation, as-built, survey), RC curated Work Entries; capability framing may reference deliverables/accuracy, and curated media may be point-cloud/orthophoto.
- These are **content and UI-treatment differences only** — the Page IA (responsibility, flow, modules, routing) is identical.

## Open (carried into wireframing / dependencies)
Individual content-item link behaviour in H-4 (module CTA fixed → filtered archive; items deferred); whether H-1+H-2 and H-4+H-5 are one module or two each; RC media treatment (UI); pillar-hub public names (Decisions Log open item); capability + use-case copy. The hub depends on Service pages and the pillar-filtered archive existing downstream — their Page IA follows.
