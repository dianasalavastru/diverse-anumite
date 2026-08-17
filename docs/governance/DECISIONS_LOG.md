# Decision Log

Running ledger of client-validated decisions for the Atelier portfolio website. Canonical record of *what has been decided*; deeper analysis lives in `DISCOVERY_REVIEW.md`, `CONTENT_MODEL.md`, `INFORMATION_ARCHITECTURE.md`, `NAV_DECISION_RECORD.md`, and `ARCHITECTURE_REVIEW_02.md`.

*Communication preference: concise, spec-style outputs — Mental model / Key principles / Decisions / Trade-offs, 3–6 bullets; conclusions first.*

**Status: Documentation v1.0 FROZEN (2026-07-30); project model reissued CLIENT-VALIDATED v3.1 (2026-08-14, Batches 22–24) — no open model questions remain; v3.1 migration Stage 1 implemented. Full design-architecture corpus complete — Foundations → Content Model → IA → Reviews → Page IA → Design System → Wireframes (all six page types). Corpus immutable except via the four amendment channels (see `DOCUMENTATION_RELEASE_v1.0.md`). Next phase = High-Fidelity Design (Figma), Homepage first.**

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

## Batch 20 — Visual pivot recorded; v2.0 frozen; implementation layer opened (amendment: correction + implementation feedback) — 2026-08-10
69. **`VISUAL_DIRECTION_v2.0.md` ("measured reality") is recorded as the current, authoritative visual direction and frozen.** It supersedes `VISUAL_DIRECTION.md` (v1, "architectural publication"), retained as historical/superseded. Closes the gap where v2.0 was authoritative in practice but never formally recorded (C1/C2). The visual line of `DOCUMENTATION_RELEASE_v1.0.md` §3 is superseded by this entry.
70. **`HOMEPAGE_HIFI_DESIGN.md` superseded** by later v2.0-aligned work and the current interactive HiFi (retained as historical). `HOMEPAGE_HIFI_v2.md` is reference-only (v2.0 validation, not production) (C4).
71. **Interactive HTML HiFis + `MOTION_NOTES.md` acknowledged as the governed design-reference layer.** Owner-approved current references (2026-08-10): Homepage `homepage-measured-reality-animated-v3`; Pillar Hub `pillar-hub-…-hifi-v1_1`; Reality Capture `reality-capture-hub-…-hifi-v1`; Work Archive `work-archive-…-hifi-v1`; Work Entry `work-entry-…-hifi-v1`; Service `service-page-…-hifi-v1`. Earlier prototypes superseded; the experimental homepage photography-preview excluded. `MOTION_NOTES.md` is the homepage motion companion (C6).
72. **Wireframes + `WIREFRAMING_GUIDELINES.md` annotated** to point visual authority at `VISUAL_DIRECTION_v2.0.md` while remaining structurally authoritative (C3). No structural / IA / Content Model changes.
73. **Implementation layer opened.** `WORK_ARCHIVE_IMPLEMENTATION_NOTES.md` recovered and adopted as authoritative production-behaviour notes for the Work Archive (companion to its HiFi); its taxonomy/filter details reconcile to — and never override — the frozen Content Model + locked IA. `IMPLEMENTATION_DOCUMENT_STANDARD.md` is a known but currently unavailable cross-page standard; its slot is reserved for post-migration recovery/recreation (not reconstructed here).
74. **Documentation migrated to a Git SSOT** (shallow, page-colocated); `README.md` is the single developer entry point, distilled from `START_HERE.md` (now archived). Amendment channels: correction + implementation feedback. **Next phase = production implementation (tech stack not yet selected).**

## Batch 21 — Production technical architecture adopted; route, i18n and non-functional decisions (amendment: implementation feedback) — 2026-08-11

75. **`docs/implementation/TECHNICAL_ARCHITECTURE.md` adopted as the authoritative production technical architecture.** Closes the "tech stack not yet selected" gate recorded at #74. It is explicitly **downstream** of the Content Model, IA, Page IA, wireframes, and `VISUAL_DIRECTION_v2.0` + approved HiFis, and may not redefine any of them. Stack: Astro 5 (static + islands) · Sanity (Payload as priced fallback) · vanilla CSS + token layer · no motion library (upholds `MOTION_NOTES.md`:9) · Cloudflare Pages + one Function · client-side archive filtering. Produced by reconciling the original architecture proposal against an independent Architecture Review and a Security & Privacy Review.

76. **OD-1 — Pillar hub public names and routes APPROVED** (owner, 2026-08-11). Architecture & Design → `/arhitectura-design`; Reality Capture → `/reality-capture`. Confirms the working slugs at `NAV_DECISION_RECORD.md`:42 as final and resolves the "pillar-hub public names" open item. **No Content Model semantics change**; hubs remain first-class landing pages and stay out of the global nav (#19–20).

77. **OD-2 — English route segments APPROVED** (owner, 2026-08-11). RO remains at root, EN under `/en/` (per #21):

    `/` → `/en/` · `/despre` → `/en/about` · `/servicii` → `/en/services` · `/servicii/[serviciu]` → `/en/services/[service]` · `/proiecte` → `/en/projects` · `/proiecte/[proiect]` → `/en/projects/[project]` · `/proiecte/concursuri` → `/en/projects/competitions` · `/proiecte/experienta-profesionala` → `/en/projects/professional-experience` · `/arhitectura-design` → `/en/architecture-design` · `/reality-capture` → `/en/reality-capture` · `/contact` → `/en/contact`

    Resolves the "i18n slug detail" open item **for route segments**; per-entity localized slugs remain authored content. **The public URL/navigation terminology does not rename the canonical content object — the internal canonical object remains the Work Entry** (`CONTENT_MODEL.md` §1), exactly as "Proiecte" never renamed it (#24 of `NAV_DECISION_RECORD.md`). Per-locale reserved-slug list (IA §2.2, F4) now includes EN `competitions` and `professional-experience`.

78. **OD-5 — Accessibility, performance and browser targets APPROVED** (owner, 2026-08-11). Accessibility target **WCAG 2.2 AA**. Performance budgets as defined in `TECHNICAL_ARCHITECTURE.md` §15, treated as **engineering budgets/targets, not guarantees for every synthetic test or device**; point-cloud numeric budgets remain **provisional until measured by the production spike**. Browser baseline: latest 2 major versions of Chrome, Safari, Firefox and Edge, with **current iOS Safari explicitly included**. **Progressive enhancement is mandatory; unsupported enhancement APIs must degrade to functional baseline behaviour — cross-document View Transitions must never be required for navigation to work.**

## Batch 22 — Project model simplified; Discipline and Entry Type removed (amendment: **client validation**) — 2026-08-13

79. **The project taxonomy was validated directly with the client and is simplified.** `CONTENT_MODEL.md` is reissued as **v3.0 (CLIENT-VALIDATED)** and is the single source of truth for project classification and field requirements. The model is now: **PROJECT = PILLAR BASE FIELDS + FIELDS ACTIVATED BY SELECTED SERVICES + OPTIONAL PROJECT LABELS.**

80. **Discipline is REMOVED.** It no longer exists as an axis, a vocabulary, a filter, or a derivation input. **Pillar is now an authored, required, single-value field** — the Discipline→Pillar derivation table (`TECHNICAL_ARCHITECTURE.md` §7.4), `PillarAssignment`, and the primary/secondary pillar pair are all withdrawn. Supersedes #12's "Pillar derived".

81. **Entry Type / Project Type is REMOVED.** Supersedes **#11** ("Entry Type = nature not status") in full. Nothing replaces it as an axis. "Built" remains a **Status**, which #11 got right and which survives.

82. **Services are the multi-select axis and the driver of field requirements.** A project belongs to one Pillar and references **one or more** Services *of that Pillar*. Eight Services: A&D — Proiectare de arhitectură · Design interior · Vizualizare 3D · Design mobilier; RC — Scanare laser 3D · Scan-to-BIM · Fotografie de arhitectură · Vizualizare de arhitectură. Requirements from multiple Services are **additive**, merged by **MANDATORY > OPTIONAL > NOT APPLICABLE**, over **one canonical field** per concept (never duplicated per Service).

83. **CONCURS and PROIECT DE DIPLOMĂ become optional Labels**, 0..N and not mutually exclusive. CONCURS was previously an Entry Type value; PROIECT DE DIPLOMĂ is new. The *Concursuri* curated view keeps its routes (`/proiecte/concursuri`, `/en/projects/competitions`) and only its membership predicate changes. **No Entry Type is created to support Labels.**

84. **Description is mandatory for Architecture & Design and deliberately NOT mandatory for Reality Capture.** Client-validated. **Location is a base field of neither Pillar** — its requirement is set by the selected Services.

85. **One global Sector vocabulary across both Pillars** (Rezidențial · Comercial & ospitalitate · Birouri & business · Public & comunitar · Industrial & logistic · Cultural & patrimoniu · Mixed-use & dezvoltări), closed rather than open-ended. No separate Architecture and Reality Capture sectors. Sector classifies and filters; it never activates a field. Amends #12's Sector refinement.

86. **Cross-pillar projects are withdrawn.** A project belongs to exactly one Pillar; work spanning both is modelled as **two linked projects** via the existing related-projects relationship. Closes **OD-7** as moot.

87. **The archive filter contract is re-governed.** `?type=` and `?discipline=` are withdrawn; Sector + Label become the shared filters and **Service becomes the contextual refinement in both pillars**. Amends `IA` Step 5, `TECHNICAL_ARCHITECTURE.md` §23.5, `WORK_ARCHIVE_PAGE_IA.md`:99/:173 and `COMPONENT_INVENTORY.md`:100. Old shared URLs degrade to the unfiltered archive; **no route or redirect change**.

88. **Unchanged by this batch:** Service as a first-class content object (#13) · the curation layer (#14) · all routes, the sitemap and navigation (#17–#21, #76, #77) · localization and reserved slugs · point-cloud handling and the publication gate · discovery order.

89. **Documentation-only pass.** `CONTENT_MODEL.md` v3.0 and `PROJECT_MODEL_IMPACT.md` written; `TECHNICAL_ARCHITECTURE.md` (v1.3), `INFORMATION_ARCHITECTURE.md`, `CONTENT_INTAKE.md`, the affected Page IA / Component Inventory documents annotated; `CONTENT_MODEL_VALIDATION.md` marked superseded in full. **No Sanity schema, application code, filter, UI or dataset was changed.** Implementation is sequenced in `PROJECT_MODEL_IMPACT.md` §2 and awaits review.

90. ~~**Open, pending client confirmation** (`CONTENT_MODEL.md` §15): Q1 … Q5.~~ **CLOSED by Batch 23 (#91–#96), 2026-08-14.** Retained here as the record of what was asked; the answers are #91–#95.

## Batch 23 — the five v3.0 open questions closed; `CONTENT_MODEL.md` reissued as v3.1 (amendment: **client validation**) — 2026-08-14

91. **Q1 CLOSED — Attribution, Employer, Roles and Authorship are RETIRED**, not retained. They are removed as project concepts and take no part in taxonomy, filtering, field activation or validation. **Crediting is carried by the two existing project fields — `Colaboratori` and `Echipă`, both optional** — which the client confirms are sufficient. `Commissioning context` goes with them, since `Client` is now mandatory in both Pillars. Supersedes **#52–#54** (Batch 14), which established Attribution/Employer/Role/Authorship as display/crediting information: the *principle* that they were never browse axes stands and was never violated; the *fields themselves* no longer exist. Supersedes the v3.0 §13 statement that "credit fields stay".

    **Implementation implication, recorded not executed:** `validateAuthorship()` — currently triggered by `entryType === 'visualization-commission'` plus Studio/Collaboration attribution — **must be removed, not re-keyed onto a Service.** The authorship-validation concept retires with the model that required it. During implementation, audit the rule and its consumers and delete the obsolete behaviour, preserving something only if the code audit reveals an unrelated invariant that still needs it. No code change was made in this pass.

    **Consequence requiring an editorial decision at build time:** the *Experiență profesională* curated view was defined as *Attribution = Studio, grouped by Employer* (**#39-era IA §5.1**) and now has no membership rule. **Its routes and per-locale reserved slugs are unchanged and stay reserved** (#21, #77). What the view is built from — a curated placement, a Label, or retiring the view — is decided when the view is implemented; it is not a content-model question and blocks nothing upstream of it.

92. **Q2 CLOSED — drone photogrammetry is NOT a Service.** The Reality Capture Service list stays exactly four: Scanare laser 3D · Scan-to-BIM · Fotografie de arhitectură · Vizualizare de arhitectură. **No ninth Service is created.** Older briefs and documentation describing the practice's *capability* as including drone photogrammetry (#3, #4, `PROJECT_CONTEXT.md`, `README.md`) remain accurate as capability statements and are **not** contradicted — but nothing may present drone photogrammetry as an active Service. It may be added later only if explicitly validated.

93. **Q3 CLOSED — `Vizualizare 3D` (A&D) and `Vizualizare de arhitectură` (Reality Capture) are two intentionally distinct Services.** Both names are kept unchanged. They are **not** to be merged or renamed on the grounds that the labels look similar; the distinction is deliberate and is now documented as such so it is not reopened as an ambiguity.

94. **Q4 CLOSED — Status vocabulary fixed and closed:** `În dezvoltare` · `În desfășurare` · `Finalizat` · `Nerealizat`. **Status remains mandatory and single-select in both Pillars.** This **replaces** the v2.1 set (Built/Realized · Unbuilt/Proposal · In progress · Delivered) recorded at #11, whose "Built is a Status, not a type" principle stands while its values do not. **No capture-workflow statuses** (Scanat, Procesare, Livrat or similar) are to be invented. Revisitable after real Reality Capture content exists; **not an implementation blocker or an open question.**

95. **Q5 CLOSED — Sector is mandatory and single-select.** Exactly one Sector per project, from the unchanged global vocabulary (Rezidențial · Comercial & ospitalitate · Birouri & business · Public & comunitar · Industrial & logistic · Cultural & patrimoniu · Mixed-use & dezvoltări). **Sector is not multi-select**; `Mixed-use & dezvoltări` is the intended classification for genuinely mixed projects. This is a **shape** change as well as a vocabulary change — the current field is an array. Revisitable later against real content; closed for v3.1.

96. **Documentation-only pass, again.** `CONTENT_MODEL.md` reissued as **v3.1** with the five decisions written into its normative sections and §15 converted from open questions to a closure record; `PROJECT_MODEL_IMPACT.md`, `TECHNICAL_ARCHITECTURE.md`, `INFORMATION_ARCHITECTURE.md` and `studio/CONTENT_INTAKE.md` updated. **No Sanity schema, application code, TypeScript contract, validation rule, query, filter, component, fixture, seed dataset, migration or test was changed.** **Nothing in Batch 22 (#79–#89) is reopened:** authored single Pillar, mandatory 1..N pillar-constrained Services, the stable immutable Service key, retired Discipline / Entry Type / derived Pillar / cross-pillar projects, Labels, one global Sector vocabulary, Location not a base field, optional Reality Capture Description, project-level `Echipament`, the MANDATORY > OPTIONAL > NOT APPLICABLE merge rule, and unchanged routes, localization, reserved slugs, curation, capture-asset handling and discovery order all stand.

## Batch 24 — Professional Experience permanently retired; Stage 1 of the v3.1 migration implemented (amendment: **client validation** + implementation) — 2026-08-14

97. **The Professional Experience / *Experiență profesională* curated view is PERMANENTLY RETIRED.** It is not deferred, not awaiting an editorial decision, and **no replacement membership rule is to be designed**. Supersedes **#39-era IA §5.1** and closes the last open consequence of #91 (the retirement of Attribution and Employer). Rationale: **the About / Despre page covers the content need** — professional background belongs in the practice's own narrative, not in a filtered slice of the archive. Concretely, when Stage 2 is implemented: delete `CuratedProfessionalExperience.astro`, `/proiecte/experienta-profesionala` and `/en/projects/professional-experience`; remove all Employer-based membership, grouping and query logic; remove the homepage, archive and navigation surfaces whose only purpose was this view. **Do not invent a Label, taxonomy axis or membership rule to replace it, and do not plan to restore it.**

98. **Both historical slugs stay reserved.** `experienta-profesionala` (RO) and `professional-experience` (EN) remain in the per-locale reserved list (#55–#57, IA §2.2 F4) even though the routes will 404. A Work Entry must never be able to claim a URL the site once published. Mechanically this means `ROUTES.professionalExperience` and `CURATED_WORK_ROUTES` in `src/lib/i18n/routes.ts` are **retained for slug protection only** — not as a placeholder for a future view.

99. **Stage 1 of `V31_MIGRATION_PLAN.md` is implemented.** Purely additive: the eight canonical `SERVICE_KEYS`, `PROJECT_LABELS`, the v3.1 Sector and Status vocabularies (introduced alongside the current ones, which Stages 6 and 7 replace), and a new pure module `src/lib/content/requirements.ts` carrying the Pillar base requirements, the Service → activated-field table and the `MANDATORY > OPTIONAL > NOT APPLICABLE` resolver. **No existing symbol, document shape, Sanity schema, query, filter, component, fixture or dataset changed; no production code consumes the resolver yet** (Stage 8 wires it). The full test suite, including the live Sanity handshake, remains green.

## Batch 25 — Stages 2–9 of the v3.1 migration implemented; the archive taxonomy reconciled (amendment: **client validation** + implementation) — 2026-08-17

100. **Stages 2–9 of `V31_MIGRATION_PLAN.md` are implemented and accepted.** Employer / Professional Experience, Attribution / Commissioning / Roles / Authorship, Entry Type and Discipline are retired from the contract, the Studio, the query layer and every rendered surface; Labels, the closed Sector vocabulary, the v3.1 Status vocabulary and mandatory Pillar-constrained Services with key-driven field activation are in place; the `development` dataset and all three NDJSON seeds satisfy the model. Three legacy documents took **per-document** Pillar decisions (`da-test-work-rc` → Reality Capture, `da-test-i4-work-cross` → Architecture & Design) and three took retirement decisions (the anonymous b3 QA Services, the drone-photogrammetry Service under **#92**, and `da-test-qa-work-rc-08`, whose identity was that retired concept). **No Discipline→Pillar rule exists anywhere in the code**, and none is to be introduced: those were decisions about named documents, not a mapping.

101. **The Projects Archive secondary taxonomy is settled.** A post-migration UI audit found the archive still running on the Stage-5 hold, and the following is now the governed contract — recorded in `TECHNICAL_ARCHITECTURE.md` §23.5, which the code now matches:

     1. **Sector STAYS** — a global, governed secondary filter, offered under *Toate*, *Arhitectură & Design* and *Reality Capture* alike, and **preserved across a Pillar switch** exactly as Label is. This closes the ambiguity the audit reported between §23.5 / `IA` Step 5 / `WORK_ARCHIVE_PAGE_IA.md`:99 / `COMPONENT_INVENTORY.md`:100 (which all specify a shared Sector filter) and a later restatement of the archive model that listed only Services and Labels. **The four documents stand; Sector is not withdrawn.**
     2. **Services are contextual, but exist under all three modes.** *Supersedes the Stage 5 hold* recorded in `archive-state.ts` — "A&D deliberately shows no contextual refinement until Stage 8 widens Service to both pillars." Stage 8 completed; the widening is done. Under *Toate* the options are the union across both Pillars; under a Pillar, only that Pillar's.
     3. **Service filter identity is the immutable `ServiceKey`** — never a localized slug, a display name, an array position or a document `_id` (v3.1 §14.3). **Slug-valued `?service=` URLs are not aliased**, matching how `?type=` and `?discipline=` were retired.
     4. **Label options are vocabulary-driven.** Both canonical Labels are always offered, including at **zero** matches; selecting one with no matches is a valid state that renders the existing empty state. No synthetic Diploma Project content was created to make the option appear.
     5. **Services and Sector remain presence-scoped.** #4 is a bounded exception justified by `PROJECT_LABELS` being a closed two-value global vocabulary, and is **not** to be generalized.

     Also in this pass: the archive's orientation sentence stopped offering "un tip" / "a type", the last user-facing survival of Entry Type vocabulary. **Nothing else changed** — Project Detail, Service Detail, the Services index, both hubs, the homepage and both Work Preview Card variants were audited as already correct and were not touched.

### Open (non-blocking, carried into design/build)
- Multi-select within a facet; inline vs expander rendering (design-step).
- Confirm EU programme publicity rules.
- Missing-translation counterpart UX; capture-asset publication-rights and contact-data retention policy; ~~whether composite entries may override derived Primary Pillar~~ — **OD-7 closed as moot by #86**. *(OD-3, OD-6 remain, tracked in `TECHNICAL_ARCHITECTURE.md` §22.)*
- Point-cloud fidelity; credibility copy authoring.
- ~~Visualization as its own discipline vs service/role~~ — **closed by #80/#82** (no Discipline; visualization is a Service in each pillar). Possible future "Academic" Attribution; possible "Collection" object.
- **"Pillar Entry" component** — homepage M-2 currently expressed via Highlight Card; whether to add a dedicated component is deferred to the design phase (would enter via amendment channel 3 if design confirms the need).
