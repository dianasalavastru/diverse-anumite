# Content Model Validation — 10 Worked Examples & Stress Test

Status: **validation of the draft in `CONTENT_MODEL.md`.** Goal: populate every taxonomy field for 10 representative projects, then challenge the model. Names are placeholders (`[Architect]`, `[Name]`); scenarios and Romanian locations are illustrative.

> **Superseded terminology note (2026-07-30, F6):** This is a point-in-time validation record. Terminology was later finalized in the frozen `CONTENT_MODEL.md` (v2.1): **"Project Type" → "Entry Type"**, and **"Built" is a *Status*, not an Entry Type**. Where an example below shows `Type:`, read it as `Entry Type:`; the frozen Entry Type list is **Design Project · Concept/Study · Competition Entry · Survey/Documentation · Visualization Commission**. The frozen model is the source of truth; the P2/P4 and R6 wording is corrected/annotated accordingly below. No decision is reopened.

Field set tested per project: **Pillar · Discipline · Service · Entry Type · Attribution · Employer/Studio · Role · Authorship · Commissioning context · Metadata (incl. Status)**.

---

## The 10 examples

### P1 — "House on a Sloped Plot" *(personal architecture)*
Pillar: Architecture & Design · Discipline: Architecture · Service: — · Type: Concept / Study · Attribution: Independent · Employer: — · Role: Author, Lead designer · Authorship: *Design — sole author* · Commissioning: **Self-initiated** · Metadata: 2023; Brașov; Client —; Status Unbuilt; Sector Residential; Software Rhino/Enscape.

### P2 — "Café Interior, Lipscani" *(interior design, client)*
Pillar: Architecture & Design · Discipline: Interior Design (primary), Architecture · Service: Interior Design · Entry Type: Design Project · Attribution: Independent · Employer: — · Role: Lead designer, Site coordination · Authorship: *Interior design — sole author* · Commissioning: **Client-commissioned** · Metadata: 2024; Bucharest; Client private (hospitality); Status Built; 120 m²; Sector Hospitality.

### P3 — "Timișoara Library — Open Competition" *(competition)*
Pillar: Architecture & Design · Discipline: Architecture · Service: — · Type: Competition · Attribution: Independent · Employer: — · Role: Author, Lead designer · Authorship: *Competition entry — sole author* · Commissioning: **Self-initiated** · Metadata: 2023; Timișoara; Status Unbuilt; Award Honourable Mention; Sector Cultural/Public.

### P4 — "Office Building, Calea Victoriei" *(work at MAAI)*
Pillar: Architecture & Design · Discipline: Architecture · Service: — · Entry Type: Design Project · Attribution: **Studio (employed)** · Employer: **MAAI Arhitectura** · Role: Design-team member, Technical drawings · Authorship: *Design-team contribution at MAAI Arhitectura; project lead [Name]. Not sole author.* · Commissioning: Client (employer's) · Metadata: 2021; Bucharest; Status Built; 6,500 m²; Sector Office.

### P5 — "Modular School Prototype" *(collaboration, two independent architects)*
Pillar: Architecture & Design · Discipline: Architecture · Service: Architectural Design · Type: Concept / Study · Attribution: **Collaboration** · Employer: — · Collaborators: **[Architect B] (independent peer)** · Role: Co-author, Concept design · Authorship: *Co-authored with [Architect B], equal contribution* · Commissioning: Client-commissioned · Metadata: 2024; Cluj; Client NGO; Status Unbuilt (grant); Sector Education.

### P6 — "As-Built Scan, Industrial Hall" *(3D scanning)*
Pillar: Reality Capture · Discipline: Reality Capture · Service: **3D Laser Scanning** · Type: Survey / Documentation · Attribution: Independent · Employer: — · Role: Scan operator, Point-cloud processor · Authorship: *Survey & point-cloud documentation — [Architect], own practice* · Commissioning: Client-commissioned · Metadata: 2025; Ploiești; Client manufacturer; Deliverables registered point cloud + 2D as-builts; Accuracy ±3 mm; Sector Industrial.

### P7 — "Quarry Volume Survey" *(drone photogrammetry)*
Pillar: Reality Capture · Discipline: Reality Capture · Service: **Drone Photogrammetry** · Type: Survey / Documentation · Attribution: Independent · Employer: — · Role: Drone pilot, Photogrammetry processing · Authorship: *Aerial survey & photogrammetric model — [Architect], own practice* · Commissioning: Client-commissioned · Metadata: 2025; Alba; Client quarry operator; Deliverables orthophoto + DEM + volume report; Accuracy GSD 2 cm; Sector Infrastructure.

### P8 — "Residential Tower Renders" *(visualization only, for a developer)*
Pillar: Architecture & Design · Discipline: **Visualization** · Service: Visualization / Rendering · Type: Visualization commission · Attribution: Independent · Employer: — · Role: Visualizer · Authorship: ***Visualization by [Architect]; architectural design by [Other firm] — [Architect] is not the author of the building design.*** · Commissioning: Client-commissioned · Metadata: 2024; Iași; Client developer/architect; Status images delivered (unbuilt); Sector Residential.

### P9 — "Fortified Church Heritage Documentation" *(heritage documentation)*
Pillar: Reality Capture · Discipline: Reality Capture · Service: **3D Laser Scanning + Drone Photogrammetry** · Type: Survey / Documentation · Attribution: Independent · Employer: — · Role: Scan operator, Drone pilot, Point-cloud processor · Authorship: *Documentation & survey — [Architect], own practice* · Commissioning: Client-commissioned (institutional) · Metadata: 2025; Sibiu county; Client heritage institution/parish; Deliverables point cloud + façade orthophotos + inscription documentation + degradation mapping; Accuracy ±5 mm; **Sector Heritage / Cultural**.

### P10 — "Village House Renovation from Scan" *(mixed architecture + scanning)*
Pillar: **Reality Capture AND Architecture & Design** · Discipline: Reality Capture + Architecture · Service: 3D Laser Scanning + Architectural Design · Type: **Survey/Documentation AND Concept/Study** · Attribution: Independent · Employer: — · Role: Scan operator, Point-cloud processor, Lead designer · Authorship: *Survey and renovation design — [Architect], own practice* · Commissioning: Client-commissioned · Metadata: 2025; Maramureș; Client homeowner; Deliverables point cloud + as-built + renovation proposal; Accuracy ±4 mm; Sector Residential/Heritage.

---

## What the model got right (validation successes)

- **Orthogonality holds.** The axes never forced a false choice on the common cases. Critically, a *competition done while employed* is representable as Entry Type = Competition Entry + Attribution = Studio + Employer = X — the exact combination the round-1 wireframe (competitions vs. "MAAI" as rival categories) could not express.
- **Employer ≠ Collaborator.** P4 (hierarchical: employed at MAAI) and P5 (peer: co-authored with an independent) stay cleanly distinct fields. A partner *studio* in a collaboration is a Collaborator, not an Employer.
- **Service is correctly optional.** P1 and P3 (self-initiated / competition) have no sold Service, confirming Service must be separate from Discipline and 0..n.
- **Capture metadata fits.** Deliverables and accuracy/specs (P6, P7, P9) sit naturally in Metadata without new axes.

## What cracked (findings) and how I'd refine

**F1 — Cross-pillar projects break single-value Pillar *and* Entry Type.** (P10) A scan-plus-renovation is legitimately both pillars and both types.
→ **R1.** Pillar is **derived from Discipline**, not hand-entered, and a project may derive into **both** pillars (surfaced in both pillar views, with one *primary* for default placement). Add an authoring **decision rule:** if the two halves have independent value/audience (a survey a client might buy alone + a design), model as **two linked projects** cross-referenced as "related"; if inseparable, **one project tagged to both pillars**. Entry Type likewise allows a primary with a secondary for genuinely composite work.

**F2 — "Personal/Independent" conflates *self-initiated* with *paid own-practice work*.** (P2, P6, P7, P8, P9 are all "Independent" yet most are real paid client jobs.) For a client-acquisition site, "did a client pay for this" is important and currently invisible.
→ **R2.** Drop the loaded word "Personal." Attribution values become **Independent · Collaboration · Studio**. Add a lightweight **Commissioning context** flag — *Self-initiated* vs *Client-commissioned* — derivable from whether a Client exists. This separates *authorship context* (whose practice) from *business context* (self-driven vs. paid), which the examples proved are different questions.

**F3 — Discipline and Service look redundant,** especially in Reality Capture (Discipline = Reality Capture, Service = Scanning/Photogrammetry) and design (Architecture ≈ Architectural Design). Authors may feel they're entering the same thing twice.
→ **R3 (clarify, don't remove).** Keep both — they serve *portfolio* vs *offer* and Service is absent on non-commercial work — but make the rule explicit: **Discipline is mandatory, coarse, single-primary; Service is optional, granular, and can be auto-suggested from Discipline + commissioning context** to avoid double entry. Discipline stays coarse ("Reality Capture"); Service carries the granularity ("3D Laser Scanning," "Drone Photogrammetry").

**F4 — There's no home for "Heritage."** (P9) Sector/use-case surfaced repeatedly across the set (Residential, Hospitality, Office, Cultural, Industrial, Infrastructure, Education, Heritage) with nowhere to live, and it's high-value for the institutional audience and for search ("heritage 3D scanning").
→ **R4.** Add **Sector / Use-case** as an optional **multi-value metadata tag** that can also act as a *secondary filter and SEO facet* — not navigation-level.

**F5 — Authorship needs to be scoped to *what* was authored.** (P8: authored the images, not the building; P10: authored both survey and design.) A flat authorship line can over-claim.
→ **R5.** Model Authorship as a short **scoped credit**: author-of-what (design / visualization / survey) + degree (sole / co / team) + any required external credit. Still display-only and single-block, just structured enough to stay honest.

**F6 — The word "Visualization" lands on three axes** (Discipline, Service, and Entry Type), risking author confusion.
→ **R6.** Rename the Type to **"Visualization commission"** and finalize the Entry Type list as: Built · Concept / Study · Competition · Survey / Documentation · Visualization commission — one distinct meaning per axis. *[Superseded (F6, 2026-07-30): the frozen model's Entry Type list is **Design Project · Concept/Study · Competition Entry · Survey/Documentation · Visualization Commission**; **"Built" was moved to Status**, not kept as an Entry Type. See `CONTENT_MODEL.md` v2.1 §3.]*

## Verdict

The model **scales**: no axis had to be removed, and every scenario is representable. The stress test produced **four substantive refinements** (R1 cross-pillar handling, R2 attribution rename + commissioning flag, R4 Sector facet, R5 scoped authorship) and **two naming cleanups** (R3 Discipline/Service rule, R6 Type rename). The only structural change is relaxing Pillar/Entry Type from strictly-single to *primary-with-optional-second* for the rare cross-pillar project — plus one new optional axis (Sector). With these folded in, the taxonomy is ready to underpin IA, filtering, and SEO.
