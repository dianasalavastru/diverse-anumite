# Service Page IA — authoritative blueprint

The Service Page defined as an **information-architecture object** — the conversion-focused child of a Pillar Hub, backed by proof from the Work model. **One blueprint for every service**; all services share this Page IA and differ only in the content they consume.

Authoritative inputs (do not reopen or reinterpret): `HOMEPAGE_PAGE_IA.md`, `HUB_PAGE_IA.md`, `INFORMATION_ARCHITECTURE.md`, `CONTENT_MODEL.md` (frozen v2.1), `NAV_DECISION_RECORD.md`, `ARCHITECTURE_REVIEW_02.md`, `DECISIONS_LOG.md`.

Level: Page IA (not UI). No wireframes, layout, or styling. **Why precedes what.** Status: authoritative (2026-07-30).

**Arrival assumption.** The Service Page is the site's most common **cold deep-link / search landing** (e.g. an institutional client searching a specific service), as well as a **warm** destination from the Hub (H-3) and from a **Work Entry** (Work→Service link). It must self-orient — it cannot assume the homepage or hub was seen.

---

## 1. Service responsibility

**Primary purpose:** help a visitor understand **one specific service** and **whether it is the appropriate solution for their problem**, so they can **confidently decide whether to continue to Contact.** Per IA Step 6: *explain the service, build trust, drive conversion, supported by relevant Work Entries.* It is the pillar's conversion ("money") page for specific-service intent.

**User questions it answers**
- What exactly is this service, and what does it solve?
- Is it the right solution for my situation? (use-cases, fit)
- What do I get, how does it work, and what should I expect?
- Can I trust them to do it well? (proof)
- How do I proceed?
- (cold) Am I in the right place, and whose practice is this?

**What it intentionally does NOT do**
- Does not overview the whole capability or route across services — **it is not a Hub** (it is one service).
- Does not provide comprehensive project browsing — **it is not the Work Archive** (it shows curated proof).
- Does not tell the identity / practice story — **it is not About.**
- Does not host the inbox / full form — **it is not Contact** (it provides the path + service-aware prefill).
- Does not persuade on hype — **it is not a persuasion-only sales landing.** Confidence follows understanding and honest proof.

**Relationship to the rest of the architecture**
- **Hub** — the Service Page's **canonical parent**. Inbound from the Hub (H-3); the F1 **back-path** returns to the parent Pillar Hub.
- **Work Archive** — not directly; proof comes from demonstrating Work Entries, with an optional "see more" to the pillar-filtered archive.
- **Work Entries** — the bidirectional **demonstrates** relationship (Content Model): the page renders the Work Entries that demonstrate this service (referenced, not copied; curated), each linking to its Work Entry.
- **Contact** — the Service Page's **primary forward action**; the CTA hands to Contact with **Topic = this pillar** and **Regarding = this service** prefilled (Step 7).
- **About** — light/none; identity lives on About.

---

## 2. Information flow (sequence of visitor understanding)

Stages of understanding, not visual sections. Cold-arrival-capable. Order is largely fixed (understanding → proof → decide) but the F1 back-path to the Hub is available throughout (a visitor can step back up to the capability at any point).

**Stage A — Orientation.**
- *Understand:* which service this is, and (lightly) whose practice.
- *Why:* orient cold/search arrivals and confirm they're in the right place, without the homepage or hub.
- *Hands next:* into what the service solves.

**Stage B — What the service solves & who it's for.**
- *Understand:* the problem this service addresses and whether it matches their own situation.
- *Why:* shift the focus from *describing the service* to helping visitors **recognize their own problem** — the core "is this my solution?" decision.
- *Hands next:* into what-you-get / how-it-works / what-to-expect.

**Stage C — What you get, how it works & what to expect.**
- *Understand:* deliverables, process, (for reality-capture) specs / accuracy / equipment, and a realistic sense of what the engagement involves.
- *Why:* build confidence through concrete substance **and set realistic expectations**, not hype.
- *Hands next:* into proof.

**Stage D — Proof (demonstrated work).**
- *Understand:* the service has been delivered well, via a curated set of Work Entries that demonstrate **this specific service** — or, if none exist yet, an honest editorial note.
- *Why:* trust through **relevant** evidence (portfolio feeds conversion); the **F5 empty-state** keeps a proof-thin service credible.
- *Hands next:* Work Entries (proof) / relevant work; and toward Contact.

**Stage E — Decide & continue (Contact).**
- *Understand:* how to proceed, and an invitation to reach out with context.
- *Why:* conversion — the acquisition goal, via service-aware Contact.
- *Hands next:* **Contact** (prefilled); the **Hub** remains available via the F1 back-path.

*(Persistent Layer-2 global nav + footer are inherited, not a service-specific stage.)*

---

## 3. Module inventory (derived from the flow)

**S-1 · Service orientation module** *(Stage A)*
- *Why:* identify the service and anchor a cold arrival to the parent pillar / practice.
- *Question:* which service is this / am I in the right place?
- *Consumes:* service name + one-line positioning; parent-pillar reference (F1).
- *Destinations:* parent **Hub** (F1 back-path); About (light).
- *Dependencies:* the Service object.
- *Future:* none essential.

**S-2 · Problem & fit module** *(Stage B)*
- *Why:* help visitors recognize their own problem and whether this service is their solution.
- *Question:* what does this solve, and is it right for me?
- *Consumes:* what the service solves + use-cases (Sector-relevant).
- *Destinations:* leads onward (no external destination of its own).
- *Dependencies:* Service content.
- *Future:* none.

**S-3 · What-you-get / how-it-works / what-to-expect module** *(Stage C)*
- *Why:* **reduce uncertainty by making the service tangible** — and set realistic expectations.
- *Question:* what do I get, how does it work, and what should I expect?
- *Consumes:* Service deliverables, process, specs (reality-capture: accuracy, equipment), and expectation-setting content.
- *Destinations:* leads onward.
- *Dependencies:* Service content.
- *Future:* an optional FAQ block (may attach here or as its own module).

**S-4 · Proof / demonstrated-work module** *(Stage D)*
- *Why:* **trust through relevant evidence** — proof must demonstrate **this specific service**, never simply show unrelated projects. Demonstrate, don't browse (protects the Work Archive's responsibility).
- *Question:* have they done *this* well?
- *Consumes:* the **Work Entries that demonstrate this Service** (many-to-many, referenced not copied, curated).
- *Destinations:* individual items → **Work Entries**; module "see more" → the **pillar-filtered Work Archive**.
- *Dependencies:* demonstrating Work Entries.
- ***Empty state (F5):*** with **zero** linked entries, the page remains fully publishable — replace the proof set with a concise editorial message (relevant examples being added) + a **Contact CTA** + the **Hub back-path**; never an empty grid/carousel/counter. **The absence of linked Work Entries must never reduce confidence in the service itself.**
- *Future:* none.

**S-5 · Contact / conversion module** *(Stage E)*
- *Why:* the primary forward action, without a persuasion-only pitch.
- *Question:* how do I proceed?
- *Consumes:* none (no inline form).
- *Destinations:* **Contact** — Topic = this pillar, Regarding = this service prefilled (Step 7).
- *Dependencies:* Contact page.
- *Future:* none (the form/inbox belongs to Contact).

*(Persistent global nav + footer are inherited, not listed as service-specific modules.)*

---

## 4. Navigation integration

**Position in the overall journey**
- **Homepage → Hub → Service → Contact**
- **Search → Service → Contact** (the common cold path, especially reality-capture)
- **Work Entry → Service → Contact** (via the Work→Service link)

**Inbound paths**
- The **Hub** (H-3, its canonical parent).
- The **Servicii** global-nav index (pillar-grouped, per M1).
- **Search / deep links** (specific-service intent).
- A **Work Entry** (the Work→Service demonstrates link).

**Outbound paths**
- **→ Contact** (primary; service-aware prefill).
- **→ Work Entries** (proof items) and **→ pillar-filtered Work Archive** ("see more").
- **→ parent Hub** (F1 back-path).
- **→ About** (light).

**F1 back-paths** — the Service Page provides a **contextual back-path to its parent Pillar Hub** (the F1 requirement), available from orientation onward.

**Relationships** — *Hub:* the Service Page is a **child** of the Hub; the Hub routes to it, it routes back (F1). *Contact:* the Service Page is the primary driver of service-aware inquiries. *Relevant Work:* the bidirectional **demonstrates** relationship supplies proof — not archive browsing.

**Canonical-intent split (anti-cannibalization):** Service Page = **specific + conversion**; Hub = category / head term; archive = browse. The Service Page owns specific-service intent and does not compete with the Hub or archive. **Visitors should not need to visit the Hub before understanding or acting on a specific service** (reinforcing the deep-linking principle).

---

## 5. Success criteria (Page-IA, not aesthetic)

- **Clarity:** a visitor — especially a cold/search arrival — quickly understands which service this is and whether it fits, without the homepage or hub.
- **Service understanding:** explains what it solves, who it's for, what you get, how it works, and what to expect — enough to decide — **without becoming** the Hub or the Archive.
- **Confidence:** trust built through concrete substance + relevant proof (or an honest empty-state), **not persuasion alone.**
- **Decision readiness:** a visitor feels they have enough information to either **continue to Contact** or **conclude that another service is more appropriate.** The goal is an **informed decision, not conversion at any cost.**
- **Routing:** clear paths to Contact (prefilled), to proof Work Entries, back to the Hub (F1), and to more work — each reachable.
- **Responsibility boundaries:** not a Hub (one service), not the Archive (curated proof), not About (no identity story), not Contact (path + prefill, not the inbox), not a persuasion-only landing. **One responsibility, no duplication.**
- **Consistency with the finalized IA:** expresses the locked architecture — Service as a first-class object; the demonstrates relationship (referenced, not copied); the F1 back-path; the canonical-intent split; service-aware Contact; the F5 empty-state. **All services share this blueprint with different content; no IA concept missing or added.**

**Concrete pass/fail tests**
- A **cold search arrival** can understand the service and reach Contact **with the service prefilled**, without the homepage or hub.
- The page still **explains and converts with zero linked Work Entries** (F5), with confidence in the service undiminished.
- **No module** overviews the whole capability, lists the whole archive, or tells the identity story.
- **Every reference resolves to a canonical destination** (Contact / Work Entry / filtered archive / Hub / About).
- **All service instances fit this one blueprint**, differing only in consumed content.

---

## One blueprint, all services — content differences (not blueprint differences)
- **Reality Capture services** (3D laser scanning, drone photogrammetry) consume: capture-specific deliverables, **accuracy/specs, equipment**, use-cases (heritage documentation, as-built, survey), and point-cloud/orthophoto proof.
- **Architecture & Design services** (architectural design, interior design, visualization) consume: design deliverables/process, discipline-relevant use-cases, and render/drawing proof.
- These are **content and UI-treatment differences only** — the Page IA (responsibility, flow, modules, routing) is identical.

## Open (carried into wireframing / dependencies)
Optional FAQ module placement; individual-item vs "see more" behaviour in S-4 (module "see more" → filtered archive fixed; items may link to Work Entries — deferred); the Service ⇄ Work demonstrates authoring (curation of which entries appear). The Service Page depends on the parent Hub, Contact (with prefill), and demonstrating Work Entries existing — the Work Entry and Contact Page IA follow.
