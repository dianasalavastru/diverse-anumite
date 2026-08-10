# Decision Log

Running ledger of client-validated decisions for the Atelier portfolio website. Canonical record of *what has been decided*; deeper analysis lives in `DISCOVERY_REVIEW.md`, `CONTENT_MODEL.md`, `INFORMATION_ARCHITECTURE.md`, `NAV_DECISION_RECORD.md`, and `ARCHITECTURE_REVIEW_02.md`.

*Communication preference: concise, spec-style outputs — Mental model / Key principles / Decisions / Trade-offs, 3–6 bullets; conclusions first.*

**Status: Documentation v1.0 FROZEN (2026-07-30). Full design-architecture corpus complete — Foundations → Content Model → IA → Reviews → Page IA → Design System → Wireframes (all six page types). Corpus immutable except via the four amendment channels (see `DOCUMENTATION_RELEASE_v1.0.md`). Next phase = High-Fidelity Design (Figma), Homepage first.**

## Batch 1 — audience, goals, positioning
1. Broad audience; do not optimize for a single group.
2. Two equally important goals: portfolio + client acquisition.
3. Two co-equal pillars under one brand: Architecture/interior design and 3D scanning / drone photogrammetry.
4. Reality-capture is a deliberate EU-funded expansion.
5. Owner wants work from both pillars.
6. Other-studio work (e.g. MAAI) gets a dedicated, clearly attributed section.
7. Site is both acquisition tool and portfolio.

## Batch 2 — prominence & brand
8. "Equal prominence" = neither secondary (not 50/50); introduce both then let users choose; frictionless separation.
9. Reality-capture fully integrated into the same brand.

## Batch 3 — content object & taxonomy v2
10. Canonical object = **Work Entry**; single object; public section = Work / Proiecte.
11. **Entry Type** = nature not status; "Built" → Status.
12. Six refinements (Pillar derived; Attribution + commissioning flag; Discipline vs Service; Sector; scoped Authorship; modular layout).

## Batch 4 — structure & FREEZE
13. Service = first-class content object; Work Entries demonstrate Services (bidirectional).
14. Curation layer (Featured · Homepage Highlight · Editorial Priority) distinct from taxonomy.
15. **CONTENT_MODEL.md FROZEN (v2.1).**

## Batch 5 — navigation (IA Step 1)
16. Two layers: homepage narrative + persistent global IA; no shape-shift.
17. Global nav task-first: **Despre · Servicii · Proiecte · Contact** (+ language).
18. Three conditions: (a) Servicii & Proiecte expose both pillars; (b) pillar hubs first-class; (c) RC work fully in archive.

## Batch 6 — sitemap & URLs (IA Step 2)
19. Shallow sitemap (≤2 levels); two standalone pillar hubs.
20. Pillar hubs = standalone depth-1 routes, not nested, not in top nav.
21. One canonical URL per Work Entry; flat Service URLs; curated routes = Competitions + Professional Experience; i18n RO root + /en/ + localized slugs.
22. Canonical-intent split via one purpose per page type.

## Batch 7 — homepage (IA Step 3)
23. Homepage jobs J1–J6; IA fixes jobs not order; credibility splits.
24. Two structural responsibilities (function only; visual is designer's): early self-segmentation after identity; no structural primacy.
25. Designer concept preserved; six minimum changes.

## Batch 8 — Work discovery model (IA Step 4)
26. Archive = **library**; two co-equal wings; one canonical entry at escalating zoom.
27. Browse is default; pillar is a prominent co-equal toggle.
28. `/proiecte` opens both pillars; either viewable cleanly.
29. Filter set small & visitor-friendly; ordering supports discovery + balanced representation.
30. RC entries structurally identical Work Entries; complex/rare lookups → curated views.

## Batch 9 — Work archive filters & ordering (IA Step 5)
31. Pillar toggle: All · A&D · Reality Capture (All default).
32. Shared filters (both pillars): **Entry Type + Sector**.
33. **Each pillar provides one additional contextual refinement alongside the shared filters** — Discipline (A&D), Service (RC).
34. Year = sort, not filter; default sort = discovery order (curated + balanced pillars).
35. Curated views reachable from the archive; Discipline/Service stay on entry pages.

## Batch 10 — Services architecture (IA Step 6)
36. Services = offering, Work = proof; one canonical Service object referenced (not copied) by Work Entries.
37. Service page responsibility: explain the service, build trust, drive conversion, supported by relevant Work Entries.
38. Cross-reference by link, not duplication: Work Entry ⇄ Service many-to-many; entry stores the reference; Service page renders demonstrating entries dynamically.
39. Arrival = intent mapping: Understand a service → Service Page; Evaluate the work → Work Entry.
40. Placement: Services index (forks by pillar) → Service pages; pillar hub frames capability + links to services/work.

## Batch 11 — Professional Experience (subsection under Step 5)
41. Curated View, not a new step; scope = **Studio-attributed entries only**.
42. Grouped by Employer (grouping metadata, not its own page); employers by recency, entries by editorial priority.
43. Value = narrative of professional experience + transparent crediting, beyond a filtered list.
44. Credit-display rule belongs to Studio-attributed Work Entries (foreground Employer + Role + scoped Authorship), not the view.

## Batch 12 — Supporting pages (IA Step 7) — IA COMPLETE
45. **EU-funding:** default = footer acknowledgment + About context; **no dedicated page** unless programme rules require more.
46. **Contact:** one simple form + optional broad topic selector; **two contextual prefills** — broad `Topic` and exact originating `Regarding` service; one inbox.
47. **About:** no dominant conversion CTA; clear onward paths to Work, Services, Contact.
48. Privacy/GDPR, Legal/imprint = utility/footer; 404 = system.

## Batch 13 — Review finding F1 adopted (pillar-hub discoverability) — 2026-07-30
49–51. Hubs stay out of global nav, remain parent destinations; Service pages (and relevant Work Entries) provide a contextual back-path to the parent hub; closes NAV §5(2) reachability gap. Additive. Affected: IA §2.3, §2.5, Step 6; NAV §5(2).

## Batch 14 — Review finding F2 adopted (attribution = crediting, not browsing) — 2026-07-30
52–54. Archive filter set preserved; no Attribution filter. Attribution/Employer/Role/Authorship are display/crediting, not browse axes. Collaboration discoverable via browsing + entry-page attribution. Affected: IA Step 5, §5.1.

## Batch 15 — Review finding F4 adopted (reserved-slug policy) — 2026-07-30
55–57. Shared `/proiecte/` namespace kept; curated slugs reserved; CMS validates Work Entry slugs against the reserved list per locale. CMS rule only. Affected: IA §2.2.

## Batch 16 — Review finding F5 adopted (Service empty-state) — 2026-07-30
58–60. Service pages publishable with zero linked Work Entries; empty "Demonstrated by" → editorial message + Contact CTA + hub back-path (no empty grid); CMS non-blocking warning. Affected: IA Step 6.

## Batch 17 — Review finding F6 adopted (validation-doc hygiene) — 2026-07-30
61–62. `CONTENT_MODEL_VALIDATION.md` aligned to frozen model: "Built" removed as Entry Type (→ Status); "Project Type" → "Entry Type"; superseded banner + P2/P4/R6 annotations. Docs hygiene only.

## Batch 18 — Architectural UI review complete — 2026-07-30
63. **The UI architecture review did not invalidate the finalized IA.** `ARCHITECTURE_REVIEW_02.md` (C1, C2, M1–M5 + Minors) validated one-by-one: **no IA changes, no Content Model changes, no Sitemap changes.** All Critical and Major findings resolved through representation, Navigation, Homepage Page IA, Page IA, or UI.
64. Layer model confirmed: **IA → Navigation → Page IA → UI.** The finalized IA remains the **authoritative source of truth** for the next phases.
65. **Project is ready to transition into Homepage Page IA, detailed Page IA, and wireframing.** Non-blocking items carried forward: hub pages + F1 paths representation; the M1/M2/M3/M4/M5 representation work; EU-funding footer; credibility copy; undrawn Service/Contact/index pages.

## Batch 19 — Documentation v1.0 FROZEN — 2026-07-30
66. **The full design-architecture corpus is complete and frozen as `Documentation v1.0`.** Six Page IA blueprints + Index, the design system (Wireframe Principles · Component Inventory · Wireframing Guidelines · Visual Direction), and all six page wireframes (Homepage · Pillar Hub · Service · Work Archive · Work Entry · Contact) exist and are internally coherent. See `DOCUMENTATION_RELEASE_v1.0.md`.
67. **The corpus is immutable except via four amendment channels:** corrections · genuine architectural discoveries · implementation feedback after design · usability testing. **No further speculative refinement.** Amendments are logged as new batches, cite their channel, name affected docs, and increment the release (v1.1+).
68. **The documentation now serves as the reference against which designs are evaluated**, not something that evolves alongside them. **Next phase = High-Fidelity Design (Figma):** Homepage → Hub → Service → Archive → Work Entry → Contact.

### Open (non-blocking, carried into design/build)
- Multi-select within a facet; inline vs expander rendering (design-step).
- Pillar-hub public names; i18n slug detail; confirm EU programme publicity rules.
- Point-cloud fidelity; credibility copy authoring.
- Visualization as its own discipline vs service/role; possible future "Academic" Attribution; possible "Collection" object.
- **"Pillar Entry" component** — homepage M-2 currently expressed via Highlight Card; whether to add a dedicated component is deferred to the design phase (would enter via amendment channel 3 if design confirms the need).
