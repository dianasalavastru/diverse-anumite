# Conceptual Domain Model — FROZEN (reference for the IA phase)

**Status:** **FROZEN 2026-07-28.** This is the agreed conceptual domain model for the product and the reference for Information Architecture. Validation worksheet: `CONTENT_MODEL_VALIDATION.md`. Decisions: `DECISIONS_LOG.md`. Conceptual only — no CMS/implementation.

## 0. The domain in one view — three separated concerns

The model deliberately keeps three concerns apart, because collapsing them is what breaks portfolio sites over time:

1. **Content objects (identity)** — the things that exist and are authored. There are **two first-class objects**: the **Work Entry** and the **Service**.
2. **Classification (taxonomy)** — objective, stable facets that answer *"what is this?"* (Pillar, Discipline, Entry Type, Attribution, Sector, …).
3. **Curation (presentation)** — subjective, editorial signals that answer *"what deserves emphasis, where, and in what order?"* (Featured, Homepage Highlight, Editorial Priority).

Supporting the objects are **controlled vocabularies** (Discipline, Entry Type, Attribution, Sector, Status) and a small **reference list** (Employer/Studio). Taxonomy decides *eligibility*; curation decides *emphasis*; the two never derive from each other.

---

## 1. Content object A — **Work Entry**

The canonical portfolio object is a **Work Entry**, not a "Project."

"Project" implies a client, a bounded commission, and the architect's authorship — but ~half the real cases violate at least one (a personal study has no client; a competition is a submission; a visualization showcases *someone else's* design; an employed item is a *contribution* to the studio's project). A Work Entry is **a curated unit of presentation** that *usually but not always* maps to one real-world engagement — and entry↔engagement isn't 1:1 (one engagement may split into two entries; viz/employed entries point at engagements owned by others).

- **One object, not two.** No separate "Engagement" model — that over-engineers a solo practice and taxes "edit without code." The distinction is carried by fields (Attribution, Employer, Commissioning context, scoped Authorship).
- **Internal name ≠ public label.** Internally/CMS: *Work Entry*. Publicly the section stays **Work** (EN) / **Lucrări** (RO — more accurate than the wireframe's *Proiecte*). "Project" survives only in prose and as the *Entry Type value* "Design Project."

## 2. Content object B — **Service** (first-class architectural principle)

**Service is a first-class content object, a peer of Work Entry — not a facet or tag.** It is the primary vehicle for the site's **acquisition** goal, and it is authored and maintained as its own content with its own page and its own SEO target.

- **Purpose:** answer *"what can I hire this architect for,"* convert inquiries, and rank for commercial search.
- **Typical fields:** name; short + long description; problem solved / use-cases; deliverables; process/method; equipment & specs (capture services); representative media/hero; inquiry CTA (feeds the conversion path); RO/EN copy.
- **Examples:** Architectural Design, Interior Design, Architectural Visualization, 3D Laser Scanning, Drone Photogrammetry (Heritage Documentation may be packaged as a distinct offering if desired).
- **Core relationship — "demonstrated by":** a Service is *demonstrated by* 0..n Work Entries; a Work Entry *demonstrates* 0..n Services. This bidirectional link is a load-bearing principle of the model: **portfolio (credibility) feeds Services (conversion).** Services pages pull live proof from the archive; a Work Entry points visitors to the offering it exemplifies.
- Consequently the **"Service" facet on a Work Entry is a *reference* to Service objects**, not free text. Not every entry demonstrates a Service (personal, competition, employed work may not); a Service is proven by many entries — which is exactly why the two must be separate objects.

---

## 3. Classification — the Work Entry axes

One Work Entry is described by several **independent axes**, each answering one question. Views like "Competitions" or "Work at MAAI" are *filtered lenses*, never separate taxonomies.

| Axis | What it represents | Use | Cardinality |
|---|---|---|---|
| **Pillar** | Capability family: *Architecture & Design* or *Reality Capture* | navigation + grouping (homepage fork) | **derived** from Discipline; primary + optional secondary |
| **Discipline** | Professional field: Architecture, Interior Design, Reality Capture, Visualization | grouping + filter | mandatory; multiple, one primary |
| **Service** | *Reference to the Service object(s) this entry demonstrates* (see §2) | Service⇄Work links + filter | optional (0..n); auto-suggestable from Discipline + commissioning |
| **Entry Type** | The **nature** of the entry (not its status) | filter + badge + drives detail layout | single primary + optional secondary |
| **Attribution** | Authorship/relationship: Independent, Collaboration, Studio | filter + grouping (Professional Experience) + display | single primary |
| **Commissioning context** | *Self-initiated* vs *Client-commissioned* | filter/badge (acquisition signal) | single (derivable from Client) |
| **Employer / Studio** | Specific organization (e.g. MAAI) — only when Attribution = Studio | display credit + grouping within Professional Experience | single (0–1) |
| **Role** | Functions the architect personally performed | display + optional filter | multiple |
| **Authorship** | Scoped, reader-facing credit statement | display only | single composed block |
| **Sector / Use-case** | Domain: Residential, Hospitality, Office, Cultural, Heritage, Industrial, Infrastructure, Education… | secondary filter + SEO facet | multiple, optional |
| **Metadata** | Year, Location, Client, Collaborators, **Status**, Awards, Area, Team, Equipment/Software, Deliverables, Accuracy/Specs | mostly display; Year/Location/Status also sort/filter; structured data | per field |

**Entry Type values (nature, not status):** Design Project · Concept / Study · Competition Entry · Survey / Documentation · Visualization Commission.

**Status (a Metadata value — where "Built" lives):** Built / Realized · Unbuilt / Proposal · In progress · Delivered. Orthogonal to Entry Type (a Design Project may be Built or Unbuilt).

**The three-way split — Attribution vs. Role vs. Authorship:** Attribution is the *filter category*; Role is the *granular functions*; Authorship is the *scoped credit sentence* (author-of-what + degree + external credit, e.g. "Visualization by [Architect]; building design by [Firm]").

### Cross-pillar / composite entries
Pillar is **derived from Discipline**; an entry may resolve into **both** pillars (shown in both views) with one **primary**. Entry Type likewise allows primary + secondary. **Authoring rule:** if the two halves have independent value/audience, model as **two linked Work Entries** (related); if inseparable, **one entry** tagged to both.

### Modular detail layout
A base layout plus optional modules toggled by Entry Type / Disciplines / Services, sharing one prominent credit block: *Design module* (hero, gallery, drawings, plans, zoomable), *Capture module* (use-case, method, deliverables, accuracy, point-cloud/before-after), *Competition module* (brief, jury, prize, boards). A composite entry enables more than one.

---

## 4. Curation — the Presentation layer

**Principle: classification ≠ curation.** Taxonomy answers *"what is this?"* (objective, stable). Curation answers *"what deserves emphasis, where, and in what order?"* (subjective, editorial, changes often). The homepage and curated landing pages **must not** derive editorial choices from taxonomy alone.

This is **lightweight editorial metadata** attached to content objects (**both** Work Entries and Services), never a classification axis and never a visitor-facing filter:

- **Featured** — elevates an object for prominence (boolean or small tier); feeds general "featured" strips.
- **Homepage Highlight (placement)** — explicit inclusion in a homepage/landing slot. Because the homepage forks by pillar, placements are pillar-aware (an Architecture highlight vs. a Reality Capture highlight; a featured Service). An object may hold 0..n placements.
- **Editorial Priority (order)** — a manual weight controlling sequence within highlight strips and curated views, so "most representative first" beats "newest first." Display-order only.
- *(Optional, lightweight)* **Pinned** (hold at top) and **Cover selection** (which image represents the object in cards/strips).

**Division of labour with taxonomy:**
- **Taxonomy = eligibility/membership** — a curated view's candidate set is a taxonomy filter (e.g. Pillar = Reality Capture).
- **Curation = selection + emphasis + order** — which candidates actually appear in a limited slot, and in what sequence.

So a homepage highlight strip = *taxonomy filter ∩ curation flag, ordered by Editorial Priority*. **The owner can re-curate the homepage at any time without re-classifying a single entry** — which is the entire point of separating the layers.

---

## 5. How the Work section organizes and exposes entries

**One archive, many lenses.** A single canonical Work archive of all Work Entries; everything else is a view of it.

- **Top-level entry mirrors the two Pillars** (matching the homepage fork): *Architecture & Design* and *Reality Capture*. A single-pillar visitor reaches that work without passing through the other.
- **Curated views:** membership comes from a **taxonomy filter** (e.g. *Competitions* = Entry Type; *Professional Experience* = Attribution = Studio, grouped by Employer; *Selected Heritage Work* = Sector); selection and order come from the **curation layer**.
- **Visitor-facing filters (shallow):** Pillar/Discipline, Entry Type, Service, Sector, Year. **Display-only:** Role, Authorship, Employer.
- **Curation vs. completeness:** homepage shows *curated highlights* per pillar (from the curation layer); the Work index is the *complete filterable archive* (from taxonomy). Resolves the round-1 grid-plus-two-carousels redundancy.

## 6. Why this scales and is SEO-ready

- **Scalable:** a new discipline, service, employer, sector, or entry type is a new *value* or a new *Service object*, not a new hard-coded section; a third pillar could be added without restructuring.
- **Honest & legally safe:** Attribution, Role, and scoped Authorship are first-class, so studio/internship and visualization work is always correctly credited.
- **SEO-ready:** Work facet views and Service pages become clean, indexable landing pages serving portfolio-intent *and* commercial-intent queries (e.g. "heritage 3D scanning [city]") in RO and EN; Metadata feeds structured data. (Implementation caveat: canonicalize meaningful facet pages; don't index arbitrary filter combinations.)

## 7. Change log

- **v2.1 (FROZEN):** (a) **Service elevated to a first-class content object** (peer of Work Entry) with an explicit *demonstrated-by* relationship; the Work Entry "Service" facet is now a reference. (b) **Presentation / Curation layer added** as a distinct concern (Featured, Homepage Highlight/placement, Editorial Priority/order), decoupled from taxonomy.
- v2: canonical object Work Entry; Entry Type = nature not status (Built → Status); Attribution relabelled + Commissioning flag; Pillar derived + cross-pillar rule; Discipline/Service clarified; Sector facet; scoped Authorship; modular detail layout.
- v1: initial one-object, multi-axis proposal replacing the wireframe's mixed-axis categories.

## 8. Left open for the IA phase (non-blocking)

Public nav wording (Work / Proiecte / Lucrări) and which curated views become nav items; Visualization as its own discipline vs. only a service/role (leaning: available as a discipline); a possible future "Academic/teaching" Attribution value; a possible future "Collection" object grouping several works. All deferred; none blocks IA.
