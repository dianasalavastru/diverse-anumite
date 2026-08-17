# Technical Architecture

**The authoritative specification for the production technical architecture of the *diverse anumite* website.**

| Field | Value |
| --- | --- |
| **Status** | AUTHORITATIVE (implementation layer) |
| **Phase** | Implementation — pre-build |
| **Supersedes** | nothing (first document in `docs/implementation/`) |
| **Audience** | Engineering (build) · Owner (decisions) · Content strategy (schema/authoring) |
| **Created** | 2026-08-11 |

---

## 1. Purpose and authority boundary

This document decides **how the frozen product, information, and visual architecture is built** — framework, CMS, rendering, media, motion, i18n, SEO, testing, deployment, security. It decides nothing about *what* the content is, *where* it lives in the site, *what a page is for*, or *how it looks*.

### 1.1 This document is downstream

Per the authority model in [`README.md`](../../README.md) §"Authority model", each layer is a stable contract for the one below, and **nothing downstream may redefine anything upstream**:

```
PROJECT_CONTEXT (brief)
  → CONTENT_MODEL (what content is)                        CLIENT-VALIDATED v3.1
  → INFORMATION_ARCHITECTURE + NAV_DECISION_RECORD          LOCKED
  → PAGE IA ×6 (each page's job)                            authoritative
  → WIREFRAMES + COMPONENT_INVENTORY                        authoritative
  → VISUAL_DIRECTION_v2.0 + approved HiFi + MOTION_NOTES    authoritative
  → THIS DOCUMENT (production behaviour beneath the above)
```

**If this document appears to conflict with any document above it, the upstream document wins and this document is wrong.** Flag the conflict; do not reconcile it silently, and do not treat an implementation convenience as grounds to reopen a locked decision.

### 1.2 What this document may not do

- It may not add, remove, rename, or merge content axes (that is `CONTENT_MODEL.md`).
- It may not change routes, page responsibilities, or navigation (that is `INFORMATION_ARCHITECTURE.md`).
- It may not simplify an approved HiFi's visual or interaction result. Where implementation differs from HiFi *markup*, it differs only in how the same result is produced — never in what the visitor sees or can do.
- It may not resolve an owner/product decision. Those are recorded unresolved in §22.

### 1.3 Relationship to implementation notes

[`WORK_ARCHIVE_IMPLEMENTATION_NOTES.md`](../pages/work-archive/WORK_ARCHIVE_IMPLEMENTATION_NOTES.md) is authoritative for Work Archive *production behaviour* and is a peer of this document, not a parent. Its own migration banner (line 3) subordinates it to the frozen Content Model and locked IA, and its line 18 discloses it was written without access to the canonical Content Model. Where it and the Content Model differ, **the Content Model governs** — see §7.3.

---

## 2. Inputs

Read in full during authoring. Line references below were verified against the working tree at commit `f6dc3c5`.

| Document | Status | What it contributed |
| --- | --- | --- |
| [`README.md`](../../README.md) | canonical entry point | authority model; approved HiFi register; open questions |
| [`foundation/PROJECT_CONTEXT.md`](../foundation/PROJECT_CONTEXT.md) | brief | performance constraint (:166); edit-without-code (:167); mobile criticality (:136) |
| [`product/CONTENT_MODEL.md`](../product/CONTENT_MODEL.md) | **CLIENT-VALIDATED v3.1** (2026-08-14) | object identity; Pillar/Services/Sector/Labels; Pillar-level + Service-driven field requirements; curation layer |
| [`product/PROJECT_MODEL_IMPACT.md`](../product/PROJECT_MODEL_IMPACT.md) | companion | v3.0/v3.1 audit, migration sequencing, data implications |
| [`product/INFORMATION_ARCHITECTURE.md`](../product/INFORMATION_ARCHITECTURE.md) | **LOCKED** | sitemap; URL conventions; filter set (Step 5); i18n strategy (§2.2) |
| [`product/NAV_DECISION_RECORD.md`](../product/NAV_DECISION_RECORD.md) | locked | nav philosophy; i18n resolution (:36); open pillar-hub naming (:42) |
| [`pages/PAGE_IA_INDEX.md`](../pages/PAGE_IA_INDEX.md) | reference | page system map; journeys |
| [`pages/work-archive/WORK_ARCHIVE_PAGE_IA.md`](../pages/work-archive/WORK_ARCHIVE_PAGE_IA.md) | authoritative | filter contract (:99) |
| [`design/VISUAL_DIRECTION_v2.0.md`](../design/VISUAL_DIRECTION_v2.0.md) | authoritative | motion as primary material (§2.3); acceptance checklist; prototype candidates (:205) |
| [`design/COMPONENT_INVENTORY.md`](../design/COMPONENT_INVENTORY.md) | authoritative | component vocabulary; Media Viewer variants (:111); Filter Group (:100) |
| [`pages/homepage/MOTION_NOTES.md`](../pages/homepage/MOTION_NOTES.md) | authoritative | timing/easing tokens; no-library decision (:9); reduced-motion parity (:62) |
| [`pages/work-archive/WORK_ARCHIVE_IMPLEMENTATION_NOTES.md`](../pages/work-archive/WORK_ARCHIVE_IMPLEMENTATION_NOTES.md) | authoritative (behaviour) | curation-as-metadata; URL state; search posture |
| [`governance/DECISIONS_LOG.md`](../governance/DECISIONS_LOG.md) | living ledger | #70 (HIFI_v2 reference-only); #71 (HiFis = governed design-reference layer) |
| six approved HiFi `.html` files | design reference | tokens, CSS, motion layer, interaction results |

**Non-inputs.** `docs/archive/**` (provenance only). `docs/references/CONTENT_MODEL_VALIDATION.md` (non-authoritative). `HOMEPAGE_HIFI_v2.md` is **reference-only, not production** (`DECISIONS_LOG.md` #70) and is cited here only as supporting evidence, never as a requirement source.

### 2.1 Verified corrections to prior drafts

Two justifications in the original proposal quoted phrases that **do not exist in the corpus**. Verified 2026-08-11: `grep -ril "javascript" docs` → **0** matches in any `.md`; `"render fully server-side" | "without upstream context"` → **0** matches. Both conclusions survive on real evidence and have been re-sourced:

- **JS weight** → `PROJECT_CONTEXT.md:166` "The site must remain performant despite image-heavy content."
- **Rendering** → the Page IAs' *self-orientation* requirement (a content requirement for cold arrivals, which static rendering satisfies incidentally) — not a rendering mandate.

Note the corpus is **not** minimal-JS-dogmatic: `VISUAL_DIRECTION_v2.0.md` §2.3 makes motion "a primary material… not rationed as a rare exception," and its revision record (:23) removed the anti-motion stance.

---

## 3. Stack decision

| Layer | Decision | Rationale (grounded) |
| --- | --- | --- |
| **Framework** | **Astro 5, `output: 'static'`, islands** | Ships no framework runtime; the HiFis' CSS + vanilla-JS motion layer ports directly with no JSX rewrite; per-route opt-out enables the one preview exception (§6). |
| **CMS** | **Sanity** (primary) · **Payload** (fallback) | Many-to-many references (Work⇄Service) are first-class; portable schema-as-code; hosted, so no DB/backup burden for a solo practice. Payload is a real exit path, honestly priced (Postgres + storage + backups + image pipeline). |
| **Styling** | **Vanilla CSS + global token layer, `@layer`, container queries** | 44 `clip-path` uses, bespoke `clamp()` rhythm tokens, and a five-size masonry vocabulary are not utility-class-shaped. Tailwind rejected. |
| **Motion** | **No library.** CSS transitions/keyframes, `IntersectionObserver`, one `rAF` loop, CSS `@view-transition` | Upholds `MOTION_NOTES.md:9`, an existing *reasoned* rejection already proven across six working HiFis. Reversing it would be downstream overriding upstream. |
| **Hosting** | **Cloudflare Pages** + one Pages Function | Static edge delivery; verified preview access-control and automatic preview `noindex` (§17). |
| **Email** | Resend, via the Function | Verified: does not store message bodies (§19). |
| **Archive filtering** | Client-side over the prerendered set; **no search index** | 20–40 entries at launch, 60–150 at maturity. External search infrastructure is unjustified at this scale. |
| **Testing** | Vitest · Playwright · `@axe-core/playwright` · Lighthouse CI | §16. |

### 3.1 Rejected, with reasons

- **Next.js** — its advantages (SSR, ISR, middleware, RSC) address problems this site does not have; it would impose a React runtime on a design system that is CSS-and-platform-native.
- **Tailwind** — see above; the design system is bespoke-composition-led, not utility-led.
- **GSAP / Motion / Lenis** — rejected upstream at `MOTION_NOTES.md:9`; not reopened.
- **External search (Algolia/Pagefind)** — unjustified below ~150 entries. Revisit only past that, or if search must span full body text.
- **Eleventy** — viable, but no island model for the four genuinely interactive surfaces.

---

## 4. Architecture / data-flow overview

```
  EDITOR                         BUILD                         VISITOR
  ──────                         ─────                         ───────

  Sanity Studio                                                 
  (hosted, private dataset)                                     
        │                                                       
        │ publish ──► webhook ──► Cloudflare Pages build        
        │                              │                        
        │                              ├─ GROQ reads (build-time only,
        │                              │   read-only Viewer token,
        │                              │   perspective: 'published')
        │                              │                        
        │                              ├─ derive: Pillar, discovery order,
        │                              │   route map, hreflang pairs,
        │                              │   sitemap, JSON-LD
        │                              │                        
        │                              └─ emit ~120–330 static pages
        │                                        │              
        │                                        ▼              
        │                              Cloudflare edge (static) ──► browser
        │                                        │                    │
        │                                        │              islands hydrate:
        │                                        │              archive filter,
        │                                        │              carousel, drawing
        │                                        │              viewer, point cloud
        │                                        │                    │
        │                                        │              media ◄── Sanity
        │                                        │                        image CDN
        │                                        │                    │
        │                                        └── POST /api/contact │
        │                                                  │ (Pages Function)
        │                                                  ▼
        │                                          Turnstile verify
        │                                                  ▼
        │                                          Resend ──► one inbox
        │
        └─ preview ──► SEPARATE preview deployment (on-demand rendering,
                       draft token server-side only, Cloudflare Access,
                       automatic X-Robots-Tag: noindex)
```

**One dataset. One build. Two exceptions to "everything is static":** the contact POST, and the access-controlled preview environment (§6.2).

---

## 5. Frontend architecture

### 5.1 Islands (the complete interactive inventory)

| Island | Pages | Approach |
| --- | --- | --- |
| Archive filter + sort + URL state | Work Archive | vanilla, ~3 KB |
| Focus carousel | Homepage, Hubs | vanilla; scroll-snap + drag; from HiFi |
| Drawing / media viewer (pan-zoom) | Work Entry | vanilla; **Media Viewer** component |
| Point-cloud viewer | Homepage, RC Hub, RC Service, RC Work Entries | **renderer spike-gated** (§10) |

Per `COMPONENT_INVENTORY.md:111`, the point-cloud viewer is a **variant of Media Viewer**, not a new component.

### 5.2 Page-global scripts

Honest statement: Astro is right here because it avoids a *framework runtime* — **not** because pages ship zero JS. Every page carries the HiFi motion layer: load sequence, `.rv` reveal system, header settle, coordinate rail. This is accepted and budgeted (§15).

### 5.3 Component mapping

Components are built from `COMPONENT_INVENTORY.md` vocabulary, **not** from HiFi markup. Per `DECISIONS_LOG.md` #71 the HiFis are the *governed design-reference layer*; per `README.md`:83 they are "not production source code."

**Verbatim absorption applies to:** design tokens, CSS, and the motion layer.
**Rebuilt from the Content Model:** all markup, data attributes, and taxonomy. The HiFis' collapsed `data-type`/`data-status` attributes are prototype debt and must not survive (`WORK_ARCHIVE_IMPLEMENTATION_NOTES.md`:82).

### 5.4 Ownership (merge-conflict hot spots)

Single-owner files: the global token/`@layer` stylesheet · the base layout (motion runtime + Global Header/Footer) · the locale route map · i18n message files · Work Preview Card.

---

## 6. Rendering strategy

### 6.1 Production: static

**100% static prerendering.** No SSR, no ISR, no edge rendering. ~120 pages at 40 entries (80 entry pages + ~40 others × 2 locales); ~330 at 150 entries. Builds are trivial at this scale.

### 6.2 The named exception: preview

A **separate preview environment** renders on demand (`export const prerender = false` on preview routes) so the Sanity Presentation tool can show live drafts. This is a deliberate, bounded exception — static production and live draft preview are otherwise mutually exclusive.

Its security model is **mandatory, not optional** (§18, §19):
- draft-reading token exists **only** in the preview environment, server-side, never client-side;
- the preview deployment is behind **Cloudflare Access** (verified: Pages → Settings → General → *Enable access policy*);
- Cloudflare Pages already sets `X-Robots-Tag: noindex` on every preview deployment automatically (verified).

**Verified caveat:** the access policy protects *preview* deployments only — it does **not** protect the main `*.pages.dev` domain or custom domains. Those need separate configuration (§17.2).

### 6.3 Escape hatch

If the Archive ever outgrows client-side filtering, `/proiecte` alone may move to on-demand rendering. Nothing else changes. Not needed at launch.

---

## 7. CMS architecture

### 7.1 Localization model — locale-neutral identity

**Decision: one document per Work Entry and per Service, locale-neutral, with localized *fields*.** Document-level localization (`@sanity/document-internationalization`) is **rejected**.

Rationale, from the frozen model:
- `CONTENT_MODEL.md:74` — curation is "attached to content objects," not to language versions.
- `CONTENT_MODEL.md:85` — "The owner can re-curate the homepage at any time without re-classifying a single entry." Under document-level i18n this becomes *re-curate twice*, and RO/EN order can silently diverge.
- `DECISIONS_LOG.md` #36 — "one canonical Service object referenced (not copied)." Document-level i18n would copy the reference graph itself.

| Lives once on the object | Localized `{ro, en}` |
| --- | --- |
| all taxonomy axes; curation (Featured, Homepage Highlight, Editorial Priority); Work⇄Service references; related-work links; media + hotspot/crop; capture metadata | title; description/rich text; **slug**; SEO title/description; Authorship statement |

- **Independent slugs** are satisfied by a localized slug field.
- **Independent publish state** — the only genuine argument for document-level i18n — is satisfied by an explicit `enPublished` boolean gating EN page generation.

**Aggregate surfaces are locale-scoped.** Archive, Hubs, homepage curation, and Service "demonstrated by" render only entities published in the active locale. Discovery order and balanced pillar representation must remain valid when the EN set is a proper subset of RO.

### 7.2 Controlled vocabularies — sourced from `CONTENT_MODEL.md` only

**These are the CMS contract. They come from the client-validated Content Model, never from a downstream document.**

> **AMENDED 2026-08-13 (v3.0) and 2026-08-14 (v3.1).** `CONTENT_MODEL.md` removes **Discipline** and **Entry Type / Project Type** entirely (v3.0), and **Attribution, Employer, Roles, Authorship and Commissioning context** entirely (v3.1). Their rows are struck below and must not be reintroduced under any name. Pillar is now **authored**, not derived (§7.4). Sector and Status are closed, mandatory, **single-select** vocabularies. Migration inventory and sequencing: `docs/product/PROJECT_MODEL_IMPACT.md`.

| Axis | Values | Source |
| --- | --- | --- |
| **Pillar** (authored, exactly one) | Architecture & Design · Reality Capture | `CONTENT_MODEL.md` §2 |
| **Services** (references to Service objects, **1..N**, constrained to the project's Pillar) | A&D: Proiectare de arhitectură · Design interior · Vizualizare 3D · Design mobilier — RC: Scanare laser 3D · Scan-to-BIM · Fotografie de arhitectură · Vizualizare de arhitectură | §2 |
| **Sector** (closed, global, **[M] exactly one — not multi-select**) | Rezidențial · Comercial & ospitalitate · Birouri & business · Public & comunitar · Industrial & logistic · Cultural & patrimoniu · Mixed-use & dezvoltări | §11.1 |
| **Labels** (0..N, not mutually exclusive) | `competition` (CONCURS) · `diploma-project` (PROIECT DE DIPLOMĂ) | §10 |
| **Status** (closed, **[M] exactly one**, same in both Pillars) | În dezvoltare · În desfășurare · Finalizat · Nerealizat | §11.2 |
| ~~**Attribution**~~ | ~~Independent · Collaboration · Studio~~ | **REMOVED — v3.1 §12** |
| ~~**Commissioning context**~~ | ~~self-initiated · client-commissioned~~ | **REMOVED — v3.1 §12** |
| ~~**Entry Type**~~ | ~~Design Project · Concept/Study · Competition Entry · Survey/Documentation · Visualization Commission~~ | **REMOVED — v3.0 §12** |
| ~~**Discipline**~~ | ~~Architecture · Interior Design · Reality Capture · Visualization~~ | **REMOVED — v3.0 §12** |

~~Plus: **Role** · **Employer/Studio**.~~ **Both REMOVED (v3.1 §12), together with the `employer` document type.** Crediting is carried by two optional project fields, **Colaboratori** and **Echipă**.

> **Prohibition (still in force, and now broader).** The enumeration in `WORK_ARCHIVE_IMPLEMENTATION_NOTES.md`:88 (`built project · competition · concept · professional experience · visualization · documentation service`) **must not be used**: it mixes several axes. Under v3.0 it is doubly prohibited, because the axis it enumerates no longer exists.
>
> That document's *principle* at line 84 remains correct and is adopted verbatim: expose canonical fields "as independent dimensions. Do not merge them."

### 7.3 Complete field contract

The schema is a **complete realization of `CONTENT_MODEL.md`.** Field *requirements* are no longer uniform: they are set by the project's **Pillar** (base fields, v3.0 §4 and §6) and by its **selected Services** (v3.0 §5 and §7), merged by **MANDATORY > OPTIONAL > NOT APPLICABLE** (§8). Beyond the axes above, the project carries:

| Field | Requirement | Consumer |
| --- | --- | --- |
| **Title · Year · Status · Client · Cover · Gallery** | [M] in both Pillars | identity, W-1, cards |
| **Description** | **[M] for A&D · [O] for Reality Capture** | W-2 |
| **Location** | [conditional] on Services | W-1 Project Metadata |
| **Area** | [conditional] on Services | W-1 |
| **Awards** | [conditional] [O] (A&D design services) | W-4 competition module / W-1 |
| **Equipment** | [conditional] [M] (Scanare laser 3D · Fotografie de arhitectură) — **project-level, no longer inside capture metadata** | W-1 / W-4 |
| **Implementation Company** | [conditional] [M] (Design mobilier) — **new field** | W-1 |
| **Collaborators · Team** | [O] base for A&D; [conditional] [O] for RC — **the only crediting fields (v3.1)** | W-3 Credits Block |
| ~~**Authorship** (scoped credit block)~~ | — | **REMOVED (v3.1).** `validateAuthorship()` is **deleted, not re-keyed** — see `PROJECT_MODEL_IMPACT.md` §1.6 |
| **Related work** (project ⇄ project) | [O] | W-6 Related Work Strip |
| **Capture metadata** (accuracy/specs, software, point count, derivative) | [O], asset-gated | W-4 RC module |
| **`capturePublicationCleared`** (boolean) | §19.4 | gates point-cloud publication |
| ~~**Commissioning context** · **Attribution** · **Employer** · **Roles**~~ | — | **REMOVED (v3.1).** No replacement field, no re-keying, no filter, no validation |
| ~~**primary + secondary** on Pillar / Entry Type; **primary** Discipline~~ | — | **REMOVED — single-value Pillar, no Entry Type, no Discipline** |

**On `PROJECT_CONTEXT.md:30`** (correct credit where the building design is someone else's): under v3.1 that is carried by **Colaboratori / Echipă** and by authored Description prose, not by an enforced Authorship field. This is a recorded client decision (`DECISIONS_LOG.md` #91), not an oversight, and this document does not reopen it.

### 7.4 Pillar is authored

> **AMENDED 2026-08-13.** Pillar derivation is **withdrawn.** `CONTENT_MODEL.md` v3.0 §12 makes Pillar an **authored, required, single-value field** on the project. The Discipline→Pillar derivation table, the primary/secondary `PillarAssignment`, the cross-pillar "shown in both views" rule, and the editor-visible read-only readout are all removed. `derivePillars()` and `isCrossPillar()` are deleted.

**One project belongs to exactly one Pillar.** It determines the contextual back-path, archive scoping, Studio desk grouping, and which Services may be selected: every selected Service must carry the same `pillar` as the project. Work genuinely spanning both pillars is modelled as **two linked projects**, using the existing related-projects relationship.

**OD-7 is closed as moot** (§22): there is no derived Primary Pillar left to override.

### 7.5 Curation and editorial rhythm

Per `WORK_ARCHIVE_IMPLEMENTATION_NOTES.md`:100–113, editors curate rhythm from the CMS; engineers build the masonry engine once. Fields: `prominence` (feature/large/standard/small → the five-size vocabulary), `featured`/`pinned`, `editorialPriority`. **Developers never re-order markup.**

### 7.6 Discovery order

`IA` Step 5 requires "curated + balanced pillars" but defines no algorithm. Specified here as a shared contract:

1. Sort by **Editorial Priority** (descending) within each pillar.
2. When scope = **All**, interleave pillars to maintain balanced representation.
3. Ties break by **Year descending**.
4. Under a pillar filter, balancing is **inert** (single pillar).
5. When the EN set is a subset, balancing operates over the EN-published set only.

### 7.7 Reserved slugs

Per `IA` §2.2 (F4), curated-view slugs are reserved **per locale** and validated in the CMS before publication. The reserved list is generated from the locale route map (§11.1) — one source, read by both the router and the validator.

---

## 8. Content / query contracts

- **Query layer isolated behind a module boundary** (`src/lib/content/`). No GROQ in components. This is the hedge that makes the Payload fallback real.
- All queries pin `apiVersion` and `perspective: 'published'` (verified: `published` became the default at API `v2025-02-19`; older versions defaulted to `raw`, which returns drafts).
- **Build-time assertion:** no document ID containing `drafts.` may appear in build output. A draft leak fails the build.
- Derived at build, never stored: Pillar, discovery order, hreflang pairs, sitemap entries, JSON-LD.

---

## 9. Media architecture

- **Sanity image CDN** with hotspot/crop; `<picture>` + `srcset`; AVIF/WebP with fallback; explicit dimensions; `loading="lazy"` except LCP; `fetchpriority="high"` on hero.
- **Art direction is a hard requirement, not a nicety.** `VISUAL_DIRECTION_v2.0.md`:199 forbids both cropping "to fit a slot" and letting responsive views "collapse into one monotonous stack." Per-breakpoint crop overrides available on hero/feature images.
- **Container queries** for the Work Preview Card, which renders at five sizes across differing contexts (`COMPONENT_INVENTORY.md:88`).
- **Fonts self-hosted**, `woff2`, `font-display: swap`, preloaded. Self-hosting is *also* a GDPR fix: all six HiFis load from the Google Fonts CDN, which discloses visitor IPs to a third party.
- **Video:** poster-first, no autoplay with sound, `preload="metadata"`.

---

## 10. Point-cloud architecture

### 10.1 Page scope (corrected)

Verified against the approved HiFis — `<canvas id="cloud">` appears in **4 of 6**:

| Page | Point cloud |
| --- | --- |
| Homepage | **yes** |
| Reality Capture Hub | **yes** |
| Service | **yes** |
| Work Entry | **yes** |
| Architecture & Design Hub | no |
| Work Archive | no |

The Homepage instance is **not incidental** — `PROJECT_CONTEXT.md:64` places a point-cloud showcase at position 4 of the homepage structure. The Homepage is also the LCP-critical social-referral landing surface (`PROJECT_CONTEXT.md:136`). Its budget must include the viewer (§15).

### 10.2 Pipeline

```
real scan (E57/LAS/LAZ)  ──►  offline preprocessing (PDAL / CloudCompare)
   NEVER published              decimate · strip georeferencing, provenance,
                                client identifiers · clear for publication
                                        │
                                        ▼
                        bounded web derivative  ──►  renderer
                                        │
                                        ▼
                              static poster fallback
```

### 10.3 The renderer is an output of the spike, not an input

**three.js is a hypothesis, not a decision.** The Phase-2 spike measures the real budget and *then* selects:

| Measured budget | Renderer |
| --- | --- |
| ≲20–30k points | **2D canvas** — proven in the HiFis, zero dependency |
| middle band | minimal custom WebGL point renderer |
| needs orbit controls / LOD / shaders | three.js (~150 KB) — must earn its weight |

Numeric point budgets (100–150k desktop) are **hypotheses until measured**. `IA`:167 and `VISUAL_DIRECTION_v2.0.md`:206 both designate point-cloud fidelity an open prototype item; this document does not close it.

### 10.4 Capture metadata is real data, never computed

The HiFis display fabricated readouts — the homepage renders 5,020 points and prints `N*1600` as "≈ 8,032,000 puncte"; the service page hardcodes "acuratețe 2 mm · Leica RTC360". **These are prototype artifacts and must not reach production.**

Point count, accuracy, and equipment are **CMS capture-metadata fields rendered from the real derived asset**. These are technical claims made to institutional clients evaluating a surveying service; a decorative multiplier surviving into production is a false accuracy claim, against `CONTENT_MODEL.md:101` ("Honest & legally safe").

---

## 11. Internationalisation

**The locked model is unchanged:** RO at root, EN under `/en/`, localized slugs, `hreflang` + `x-default` → RO (`IA` §2.2; `DECISIONS_LOG.md` #21).

### 11.1 The locale route map

Astro's i18n provides locale *prefixing* (`defaultLocale: 'ro'`, `prefixDefaultLocale: false` — verified). It does **not** translate path segments; its "custom locale paths" feature maps a locale to a single prefix, which is a different thing. Localized segments require an explicit **locale route map**, which is the single source read by the router, the CMS reserved-slug validator, the hreflang emitter, and the sitemap.

**Owner-approved 2026-08-11** (OD-1, OD-2 — `DECISIONS_LOG.md` #76, #77). This table is **frozen** and is the single source read by the router, the CMS reserved-slug validator, the hreflang emitter, and the sitemap generator.

| Route | RO (locked, `IA` §2.1) | EN (approved) |
| --- | --- | --- |
| Home | `/` | `/en/` |
| About | `/despre` | `/en/about` |
| Services index | `/servicii` | `/en/services` |
| Service | `/servicii/[serviciu]` | `/en/services/[service]` |
| Work archive | `/proiecte` | `/en/projects` |
| Work Entry | `/proiecte/[proiect]` | `/en/projects/[project]` |
| Competitions | `/proiecte/concursuri` | `/en/projects/competitions` |
| Professional Experience | `/proiecte/experienta-profesionala` | `/en/projects/professional-experience` |
| Pillar hub A | `/arhitectura-design` | `/en/architecture-design` |
| Pillar hub B | `/reality-capture` | `/en/reality-capture` |
| Contact | `/contact` | `/en/contact` |

**Terminology boundary.** The public URL and navigation terminology does **not** rename the canonical content object. `/proiecte` and `/en/projects` are public labels; the internal canonical object remains the **Work Entry** (`CONTENT_MODEL.md` §1) — exactly as "Proiecte" never renamed it (`NAV_DECISION_RECORD.md`:24).

**Reserved slugs, per locale** (`IA` §2.2, F4): RO `concursuri`, `experienta-profesionala` · EN `competitions`, `professional-experience`. Generated from this table; no Work Entry may claim them in either locale.

### 11.2 Missing-translation behaviour

Preserved exactly as specified; RO content is **never** served under an EN URL:

1. No EN page is generated for an untranslated entity.
2. RO content is never served under `/en/`.
3. The entity is excluded from the EN sitemap.
4. No `hreflang` pair is emitted.
5. The language switcher is disabled for that entity, with an accessible explanation.
6. RO is never blocked or degraded by a missing EN counterpart.
7. `/en/<untranslated>` returns a clean **404**, not a redirect to RO.

The **UX of the disabled switcher state** (inline disabled control vs. interstitial) remains open — `NAV_DECISION_RECORD.md`:36 flags it; this document does not invent it (**OD-3**).

### 11.3 Romanian diacritics — owner decision

**Romanian site copy is intentionally authored without diacritics** (owner decision, 2026-08-11, **OD-8**). Comma-below glyph coverage (U+0219 `ș`, U+021B `ț`) is therefore **not a launch requirement, not a risk, and not a font-selection criterion.**

Recorded for provenance: the approved HiFis contain 391 `ș`/`ț` characters, and all three candidate faces do carry correct comma-below forms (the glyphs live in the `latin-ext` subset). HiFi copy is a design reference; production RO copy follows the owner decision. If RO copy ever reintroduces diacritics, the font subset must be revisited — a configuration change, not an architectural one.

---

## 12. SEO

- **Rendering:** static HTML; every Work Entry is in the initial payload (client-side filtering never hides content from crawlers).
- **Canonical URLs:** self-referencing on every page. One canonical URL per Work Entry including cross-pillar entries (`IA` §2.2). Filter states are **not** separately canonicalized — only the committed curated routes (Competitions, Professional Experience) are indexable routes.
- **Language alternates:** reciprocal `hreflang` `ro`/`en` + `x-default` → RO, emitted only where both counterparts exist (§11.2).
- **Structured data:** JSON-LD from Content Model metadata — `Organization`, `WebSite`, `CreativeWork` per Work Entry, `Service` per Service page, `BreadcrumbList`.
- **Sitemap:** one per locale, excluding untranslated entities.
- **Robots:** production allows crawl; previews are `noindex` automatically (§6.2).
- **Image SEO:** meaningful `alt` from CMS (authored, not derived), descriptive filenames.

### 12.1 Duplicate-host control

`*.pages.dev` production aliases must **not** create an indexable duplicate of the custom domain. Preview deployments get `X-Robots-Tag: noindex` automatically, but the **main `*.pages.dev` alias does not.** Mitigation: `_headers` rule emitting `X-Robots-Tag: noindex` for the `*.pages.dev` host, plus canonical tags always pointing at the custom domain.

---

## 13. Motion

- **No library** — `MOTION_NOTES.md:9`, upheld.
- **Tokens absorbed verbatim** from `MOTION_NOTES.md`: `--t-micro .18s` · `--t-state .36s` · `--t-rev .66s` · `--t-major 1s` · `--ease cubic-bezier(.2,0,0,1)` (no overshoot).
- **Archive → Work Entry dissolve:** CSS **`@view-transition { navigation: auto }`** — a *cross-document* transition requiring no router.

  Astro's `ClientRouter` is **not** the mechanism: it is a client-side router doing same-document DOM swaps, which adds JS to every page and takes over focus management, scroll restoration, and `aria-live` re-initialisation — a class of a11y regression that `MOTION_NOTES.md:54,62` makes expensive. The CSS form ships zero JS and degrades to plain navigation where unsupported (verified: cross-document view transitions are *Limited availability*, not Baseline — unsupporting browsers ignore the at-rule cleanly). This matches the frozen requirement at `WORK_ARCHIVE_IMPLEMENTATION_NOTES.md:45`: "Reduced-motion falls back to native navigation." `ClientRouter` remains a documented fallback only if a same-document transition proves necessary.
- **Ambient motion:** the point cloud only, `IntersectionObserver`-gated, static under reduced motion.
- **Reduced motion:** **layout parity**, not merely disabled transitions — `MOTION_NOTES.md:62` requires "Content and layout are identical with motion removed." Verified in tests (§16).

---

## 14. Accessibility

Target **WCAG 2.2 AA** — owner-ratified 2026-08-11 (`DECISIONS_LOG.md` #78).

### 14.0 Browser baseline and progressive enhancement

**Baseline (ratified):** latest 2 major versions of Chrome, Safari, Firefox and Edge, plus **current iOS Safari** explicitly.

**Progressive enhancement is mandatory.** Every enhancement API must degrade to functional baseline behaviour. Binding consequences:

- **Cross-document View Transitions must never be required for navigation to work** (§13). Where unsupported, navigation is a plain document load.
- Container queries, `@layer`, and scroll-snap are enhancements over a working static layout.
- The point-cloud viewer degrades to its static poster (§10.2).
- No interactive surface may become unreachable when an enhancement API is absent.

- Reduced-motion parity as above.
- Focus-visible parity: keyboard indication at least as clear as pointer hover (`MOTION_NOTES.md:54`).
- Movement is never the only signal of interactivity.

### 14.1 Inspection surfaces — keyboard operability

**Every inspection surface ships a keyboard equivalent plus an accessible name and role:** drawing pan/zoom, point-cloud rotate, lightbox, carousel focus.

This is a corpus requirement (`VISUAL_DIRECTION_v2.0.md` §7 makes inspection a core value; `MOTION_NOTES.md:54`), and in the HiFis these surfaces are **pointer-only** — the drawing viewer pans via `pointerdown`/`pointermove` and zooms via `wheel`. **Automated tooling cannot detect a missing keyboard equivalent for a canvas gesture**, so these are verified by explicit Playwright keyboard journeys, never by axe alone.

### 14.2 Scroll trap

The HiFi drawing viewer calls `preventDefault()` with `{passive:false}` across the whole viewer — a scroll trap on touch and trackpad. Zoom must be bound to an explicit activation (click-to-focus or modifier key).

---

## 15. Performance budgets

**Owner-ratified 2026-08-11** (`DECISIONS_LOG.md` #78). These are **engineering budgets and targets, not guarantees for every synthetic test or device.** They are enforced as CI gates against a fixed reference profile, not as per-device promises.

| Page type | JS (compressed) | Notes |
| --- | --- | --- |
| Homepage | ≤ 120 KB **including** the point-cloud viewer | LCP-critical; social-referral landing |
| Work Archive | ≤ 60 KB | filter island + motion layer |
| Work Entry (A&D) | ≤ 60 KB | viewer + motion layer |
| Work Entry / Service / Hub (RC) | ≤ 120 KB including viewer | as Homepage |
| Other | ≤ 40 KB | motion layer only |

Targets: LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms on mid-tier mobile. Enforced by Lighthouse CI.

**Point-cloud numeric budgets remain provisional** until §10.3's spike measures them (ratified as such — they are the one figure in this table that is a hypothesis, not a target).

---

## 16. Testing

| Layer | Tool | Scope |
| --- | --- | --- |
| Unit | Vitest | discovery-order derivation (§7.6), Pillar derivation (§7.4), filter/URL state, i18n resolution |
| Component | Vitest + Astro container | Work Preview Card variants, Metadata Strip, Empty States |
| E2E | Playwright | the four journeys in `PAGE_IA_INDEX.md` §4; filter→URL→restore; contact submit (mocked) |
| Keyboard | Playwright | **explicit journeys** for every inspection surface (§14.1) |
| A11y | `@axe-core/playwright` | 6 page types × 2 locales + reduced-motion pass |
| Perf | Lighthouse CI | budgets in §15 |

**Explicitly not doing:** paid visual-regression services, E2E against live CMS, cross-browser matrices beyond current stable Chrome/Safari/Firefox. Reduced-motion parity is asserted as a **layout** assertion, not merely absence of animation.

---

## 17. Deployment and environments

| Environment | Purpose | Rendering | Access | Indexable |
| --- | --- | --- | --- | --- |
| **Production** | live site | static | public, custom domain | yes |
| **Preview** | editor draft review | on-demand | **Cloudflare Access** | no (automatic) |
| **Branch/PR** | engineering review | static | Access policy | no (automatic) |

- CMS publish → webhook → build → deploy. Rebuild time is **an estimate to be measured in Phase 3**, and excludes Cloudflare build-queue time.
- CI permissions least-privilege; dependencies pinned with automated update PRs reviewed before merge.

### 17.1 Platform watch item

Signals suggest Cloudflare now steers **new** projects toward **Workers Static Assets** rather than Pages. **I could not verify this against Cloudflare's own documentation**, so it is recorded as a watch item, not a decision. Cloudflare Pages demonstrably provides everything this architecture needs today (verified: preview access policy, automatic preview `noindex`, `_headers`, Functions with environment secrets). Re-evaluate before Phase 8; migration cost is low because the app is static plus one Function.

### 17.2 Alternate hostnames

See §12.1 — the access policy does not cover `*.pages.dev` or custom domains, so host-level `noindex` and canonical discipline are required.

---

## 18. Secrets and credentials model

**No secret ever enters Git. No secret ever reaches the browser.**

| Credential | Where it lives | Where it must never appear |
| --- | --- | --- |
| Sanity **read-only Viewer** token | CI/build environment (production build) | frontend bundle, Git, Functions, preview client |
| Sanity **draft/preview** token | **Preview environment only**, server-side | production, CI, Git, any client |
| Sanity **Editor/write** token | **nowhere in this system** | CI, frontend, Functions, build — absolutely |
| Resend API key | Pages Function secret | Git, client |
| Turnstile secret | Pages Function secret | Git, client |

- `.gitignore` extended **before any application code exists**: `.env`, `.env.*` (except `.env.example`), `.dev.vars`, build output, `node_modules`.
- `.env.example` committed with **variable names only, no values**.
- Cloudflare Pages supports encrypted secrets distinct from plaintext vars, with separate production/preview values — use encrypted secrets for all of the above.

### 18.1 Why a private dataset with a build-time token

Verified: a **public** Sanity dataset serves published documents with **no token at all** (drafts still require one). That would satisfy "tokenless production reads" literally.

**This architecture nonetheless chooses a private dataset read by a build-time Viewer token**, because published Work Entries carry fields that are *published* but not *intended for arbitrary public query* — `Client` (`CONTENT_MODEL.md:54`), curation metadata, and `capturePublicationCleared`. A public dataset exposes every field of every published document to arbitrary GROQ, including fields the site never renders.

Because the build is static, **the token never reaches the browser** — so this is strictly more private than the public-dataset option at no client-exposure cost. It satisfies the security requirement's fallback clause ("otherwise read-only Viewer access only").

**Consequence to respect:** a Viewer token *can* read drafts (custom roles are Enterprise-only, so a narrower read role cannot be created). Mitigations are mandatory: pin `perspective: 'published'`, pin `apiVersion`, and fail the build on any `drafts.` ID in output (§8).

---

## 19. Security and privacy

### 19.1 Headers

Defined in `_headers`: `Content-Security-Policy` (default-src 'self'; explicit allowances for the Sanity image CDN; no `unsafe-inline` in `script-src`), `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (deny geolocation/camera/microphone).

**Placeholder origins from the HiFis must not ship** — fonts are self-hosted (§9) and no HiFi placeholder image host may remain in production CSP or markup.

### 19.2 Content rendering

- **No `innerHTML` from CMS content. No unsafe raw HTML rendering.**
- Portable Text is serialized through **controlled components** with an explicit allowlist of block/mark types. An unknown type renders nothing, never raw markup.

### 19.3 Contact pipeline

- Server-side validation and constraint in the Function: length caps, type checks, email format, required fields. Client-side validation is UX only and is never trusted.
- Turnstile verified **server-side** before send.
- **Submissions are not persisted in any application database.** The Function validates, sends, and forgets.
- No message content in logs. Logs record outcome and coarse rate-limit signals only.
- **Verified:** Resend does not store message bodies; it retains metadata (sender, recipient, subject, cc/bcc, reply-to, timestamp) and keeps backups ~30 days. **Consequence: no personal data in the subject line** — the subject carries Topic/Regarding routing values only, never visitor-supplied text.
- Retention: the inbox is the system of record; retention is the owner's mailbox policy (**OD-6**).

### 19.4 Reality Capture assets

- **Raw E57/LAS/LAZ source surveys never enter the CMS or the frontend pipeline.**
- Web derivatives are stripped of georeferencing, provenance, and client identifiers unless publication is explicitly intended.
- **Publication gate:** `capturePublicationCleared` on the Work Entry gates point-cloud asset publication. A point cloud is *measurable* — publishing one is materially different from publishing a photograph of the same building, and heritage/institutional clients may hold contractual restrictions. The **policy** behind the flag is an owner/governance item (**OD-6**); the technical gate is specified here.

### 19.5 Subprocessors

| Processor | Purpose | Data | Region |
| --- | --- | --- | --- |
| Cloudflare | hosting, Function execution, Turnstile | request metadata, IP | global edge |
| Sanity | CMS + image CDN | content, media; visitor IP on image requests | vendor-managed |
| Resend | email delivery | name, email, message (transit); metadata retained | US; EU-US DPF certified, GDPR DPA available |

The practice is EU-based with EU-funded expansion (`DECISIONS_LOG.md` #4) — **GDPR applies squarely.** This table is the required input to the Privacy page (`DECISIONS_LOG.md` #48), which cannot be written without it.

### 19.6 Consent

Analytics are cookieless (Plausible or Umami — interchangeable; only the cookieless property is architectural). **Qualified claim:** no consent banner is required *if* analytics remain cookieless *and* Turnstile qualifies as strictly necessary. This is a legal determination, not an engineering one.

`IA` Step 7 lists the Privacy page as "Entered from: Footer, cookie banner" — naming a cookie banner as an entry point. **Removing it changes an IA-specified navigation path.** Recorded explicitly here rather than assumed; if the determination goes the other way, the banner returns and this section is amended.

---

## 20. Backups and recovery

- **Scheduled `sanity dataset export`** to owner-controlled storage, independent of the vendor.
- **Recovery is tested, not assumed:** at least once before launch, restore an export into a scratch dataset and build against it. An untested backup is not a backup.
- Media assets are included in the export.
- Git holds all schema, code, and configuration; the CMS holds content. Together they fully reconstitute the site.

---

## 21. Risks

| # | Risk | Severity | Mitigation |
| --- | --- | --- | --- |
| R1 | **Localization drift** — RO/EN structural divergence | Low *(was High)* | Locale-neutral identity (§7.1) makes structural drift impossible by construction; only text can drift |
| R2 | **Draft leak via preview** | High | Access-controlled preview, server-side token, automatic `noindex`, build-time draft assertion (§6.2, §8, §18) |
| R3 | **Point-cloud performance on mid-tier mobile** | High | Spike-gated renderer + measured budget + static fallback (§10.3) |
| R4 | Motion-port fidelity loss | Medium | Phase 2 attacks it first; HiFis are the acceptance reference |
| R5 | **Capture-asset publication without clearance** | High | `capturePublicationCleared` gate (§19.4); policy is OD-6 |
| R6 | HiFi prototype debt (collapsed taxonomy, fake readouts) reaching production | Medium | Build from Content Model, never HiFi markup (§5.3, §10.4) |
| R7 | "Without a deploy" expectation mismatch | **Low** *(downgraded)* | See §22 OD-4 — upstream says "without changing code," which this satisfies |
| R8 | Sanity vendor lock-in | Low | Query layer isolated (§8); Payload fallback priced |
| R9 | Cloudflare Pages feature-freeze | Low | Watch item (§17.1); low migration cost |
| R10 | Archive outgrows client-side filtering | Low | Escape hatch (§6.3); revisit past ~150 entries |

---

## 22. Open decisions

**Genuine owner/product decisions. This document does not answer them.**

| # | Decision | Blocks | Source |
| --- | --- | --- | --- |
| **OD-3** | Missing-translation counterpart UX (disabled control vs. interstitial) | Phase 6 | `NAV_DECISION_RECORD.md`:36 |
| **OD-6** | Capture-asset publication-rights policy; contact-data retention policy | RC asset **publication** (not build) | §19.3, §19.4 |
| ~~**OD-7**~~ | ~~Whether composite entries may override derived Primary Pillar~~ — **CLOSED AS MOOT 2026-08-13:** Pillar is authored and single-valued; there is no derivation to override (§7.4) | — | §7.4 |

### Decided

| # | Decision | Recorded |
| --- | --- | --- |
| **OD-1** | ✅ Pillar hub routes `/arhitectura-design`, `/reality-capture` | `DECISIONS_LOG.md` #76 |
| **OD-2** | ✅ EN route segments — full map in §11.1 | `DECISIONS_LOG.md` #77 |
| **OD-4** | ✅ "Changeable without a deploy" interpretation — see below | this document |
| **OD-5** | ✅ WCAG 2.2 AA; budgets as engineering targets; browser baseline | `DECISIONS_LOG.md` #78 |
| **OD-8** | ✅ RO copy authored without diacritics; glyph coverage not a requirement | §11.3 |

### OD-4 — recorded interpretation

The upstream authority is `PROJECT_CONTEXT.md:167`: "The owner must eventually be able to add and edit projects **without changing code**," echoed by `README.md`:7 ("without touching code") and `CONTENT_MODEL.md:85`. The stricter phrase "without a deploy" appears **once** in the corpus, at `WORK_ARCHIVE_IMPLEMENTATION_NOTES.md:105` — a downstream document, in a paragraph whose subject is the engineer/editor division of labour.

Under the authority model, a downstream document cannot impose a stricter constraint than its upstream. **The webhook→rebuild flow plus editor preview satisfies the upstream requirement.** This is recorded as an interpretation for transparency; it is not an architectural conflict and does not gate formalization.

### Safely open (not blocking)

Point-cloud numeric budget and final renderer (outputs of the spike, given §10's interface contract) · search at launch vs. fast-follow, and `?q=` persistence · the dark "capture environment" (`VISUAL_DIRECTION_v2.0.md`:205 — keep tokens theme-capable) · inline vs. expander rendering of the contextual refinement · multi-select within a facet (affects URL array encoding — decide before Phase 4) · About Page IA/wireframe/HiFi and Contact HiFi · analytics vendor · `IMPLEMENTATION_DOCUMENT_STANDARD.md` recovery.

### Settled — not open

- **Archive filter set** — governed, not open, but **re-governed 2026-08-13**. The v2.1 set (Entry Type + Sector shared, one pillar-contextual refinement — Discipline for A&D, Service for RC) named two axes the model no longer has. The current governed set is **Sector + Label shared, Service refinement in both pillars, Year as sort, no Attribution filter (F2)** — §23.5. `IA` Step 5, `WORK_ARCHIVE_PAGE_IA.md:99` and `COMPONENT_INVENTORY.md:100` are amended to match; `WORK_ARCHIVE_IMPLEMENTATION_NOTES.md`:88–96 is superseded outright.
- **"Proiecte" vs "Lucrări"** — resolved. `CONTENT_MODEL.md:112` explicitly delegated nav wording to the IA phase, which decided it: `IA` §2.1, `NAV_DECISION_RECORD.md`:24, `DECISIONS_LOG.md` #10/#17/#21. Public RO label and route = **Proiecte** / `/proiecte`; internal canonical object = **Work Entry**.

---

## 23. Implementation sequencing

### 23.1 Phase 0 — the frozen contract set

Every contract below is **frozen**. Changing one after Phase 1 begins requires an amendment, because more than one workstream builds against it.

| # | Contract | Where specified | Status |
| --- | --- | --- | --- |
| 1 | Canonical route contract | §11.1 | **FROZEN** (OD-1, OD-2) |
| 2 | Locale / localized-slug contract | §11.1, §11.2, §7.7 | **FROZEN** |
| 3 | CMS vocabulary contract | §7.2 | **AMENDED 2026-08-13** (v3.0 project model) |
| 4 | Work ⇄ Service relationship | §7.3, §8 | **FROZEN** |
| 5 | ~~Pillar derivation rule~~ → **Pillar is authored** | §7.4 | **WITHDRAWN & REPLACED 2026-08-13** |
| 6 | Editorial curation contract | §7.5, §7.6 | **FROZEN** |
| 7 | Media ownership / derivative contract | §9, §10.2, §19.4 | **FROZEN** (publication *policy* = OD-6) |
| 8 | Frontend ↔ CMS data boundary | §8 | **FROZEN** |
| 9 | Preview boundary | §6.2 | **FROZEN** |
| 10 | Environment / secrets boundary | §18 | **FROZEN** |
| 11 | Point-cloud source → derivative boundary | §10.2, §10.3, §23.4 | **FROZEN** (budgets provisional by design) |
| 12–15 | Type ownership, file ownership, integration points, merge boundaries | §23.3, §23.4 | **FROZEN** |
| + | Archive filter + URL contract | §23.5 | **AMENDED 2026-08-13** (encoding forward-compatible) |

**Also required before Phase 1:** design tokens extracted verbatim from the approved HiFis (engineering work, not a decision).

**Contact prefill contract.** Query parameters are `?topic=` (broad pillar-level) and `?regarding=` (the originating Service slug), per `IA` Step 7's two-prefill model. Emitted by Service pages and Pillar Hubs; consumed by Contact (C-2 Topic Summary). Values are validated against the route map and known Service slugs; an unrecognised value is ignored rather than echoed — it must never reach the email subject (§19.3).

### 23.2 Phase 1–9

1. **Point-cloud spike (start first — independent and slowest).** Real scan → pipeline → device measurement → **renderer decision**.
2. **Frontend foundation (start immediately, in parallel).** Tokens, `@layer` architecture, typography scale, layout primitives, Global Header/Footer. Depends only on frozen documents.
3. **Homepage** — motion-port fidelity against the approved HiFi.
4. **CMS schema + Studio** — *held until §7.1 and §7.2 are locked.*
5. **Work Archive** — filter contract, URL state, masonry engine.
6. **Work Entry + Service + Hubs.**
7. **Contact** — Function, Turnstile, Resend, prefills.
8. **i18n pass** — EN routes, hreflang, sitemap, switcher.
9. **Hardening** — headers/CSP, a11y audit incl. keyboard journeys, LHCI, backup restore test.

### 23.3 Workstream boundaries and ownership

Four workstreams. **A file has exactly one owning workstream.** Cross-boundary changes go through the owner, not around them.

| Workstream | Owns | Must not modify |
| --- | --- | --- |
| **A · Frontend foundation** | `src/styles/**` (tokens, `@layer`), `src/layouts/**`, `src/components/**`, `src/pages/**`, `src/lib/i18n/**`, motion runtime, islands, **the application root scaffold and shared build configuration** (see below) | CMS schema, `src/lib/content/` query implementations |
| **B · CMS / backend** | `studio/**` (schema, desk, validation), `src/lib/content/**` (queries + returned shapes), Pages Function, webhook config | components, styles, layouts, **the root scaffold / shared build configuration** |
| **C · Content / data** | CMS content, media, hotspots, taxonomy tagging, RO/EN copy, per-entity slugs | code of any kind |
| **D · Point-cloud spike** | `tools/pointcloud/**` (preprocessing), the viewer island implementation, derived assets | everything outside its island + pipeline |

**Shared types are owned by B.** The TypeScript types describing content shapes (`WorkEntry`, `Service`, vocabulary unions, `Pillar`, curation fields) live with the query layer at `src/lib/content/types.ts` and are **B's single-owner file**. A consumes them; A never edits them. This is deliberate: the types are the projection of the CMS schema, and letting two workstreams edit them re-creates the drift §7.1 exists to prevent.

**Single-owner files — the merge-conflict hot spots:**

| File / area | Owner | Why |
| --- | --- | --- |
| global token + `@layer` stylesheet | A | every component touches it; highest conflict surface |
| base layout (motion runtime, Global Header/Footer) | A | every page composes it |
| `src/lib/content/types.ts` | **B** | projection of the schema; A is a consumer only |
| locale route map module (`src/lib/i18n/routes.ts`) | A (values frozen by OD-2) | read by router, validator, hreflang, sitemap — **and it is the single declaration of `Locale` / `LOCALES` / `DEFAULT_LOCALE`; `src/lib/content/types.ts` re-exports it rather than re-declaring it** (I-1) |
| root scaffold + shared build config — `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `.gitignore` | **A** | one build governs every workstream's output; B must not modify these without an explicit integration handoff |
| i18n message files | A (RO/EN strings authored by C) | two-party file — C supplies strings, A commits structure |
| Work Preview Card | A | touched by rendering *and* the field contract simultaneously |
| CMS schema files | B | — |

**Branch boundaries.** One branch per workstream, rebased on `main` daily. A and B must not both edit `src/lib/content/`. The route map and token file land in `main` **before** any workstream branches, so nobody rebases onto a changing foundation.

### 23.4 Integration points

| # | When | Who | What must be true |
| --- | --- | --- | --- |
| **I-1** | End of Phase 0 | A + B | Route map, token file, and `types.ts` stub are on `main`. A can build components against types that compile; B can implement behind them. |
| **I-2** | End of the spike | D → A | Renderer decided (§10.3); viewer island honours the agreed component boundary and poster fallback; capture-metadata field names confirmed with B. |
| **I-3** | First real query | B → A | Query layer returns real data in the frozen shape; A swaps fixtures for it. **This is the first point where A and B can genuinely diverge** — schedule it early. |
| **I-4** | First content load | C → B | ~5 real Work Entries incl. one cross-pillar and one Studio-attributed, exercising Pillar derivation, discovery order, and the Credits Block. |
| **I-5** | i18n pass | A + C | EN routes generate; missing-translation rules (§11.2) verified against genuinely partial content. |
| **I-6** | Hardening | all | CSP, a11y incl. keyboard journeys (§14.1), LHCI budgets, backup restore test (§20). |

**I-3 is the highest-risk integration.** A builds against fixtures shaped by `types.ts`; if those fixtures diverge from what GROQ actually returns, every component silently breaks at once. Mitigation: B publishes the fixture set *from* the real query layer, so fixtures and queries share one origin.

### 23.5 The archive filter + URL contract

> **AMENDED 2026-08-13 (v3.0) and 2026-08-14 (v3.1).** Entry Type and Discipline no longer exist, so `&type=` and `&discipline=` are withdrawn. Service is promoted from the Reality-Capture-only refinement to the refinement available in **both** pillars, because every project now carries at least one Service. A `&label=` facet is added for CONCURS / PROIECT DE DIPLOMĂ. **Filters are not to be changed until the schema lands** — see `docs/product/PROJECT_MODEL_IMPACT.md` Stage 5.

**Current contract (v3.0):** Pillar toggle (a **mode**, not a filter — `COMPONENT_INVENTORY.md:57`; `All` default) · shared **Sector + Label** · **Service** refinement (both pillars) · **Year as sort** (`curated` · `newest` · `oldest`) · **no Attribution filter** — Attribution no longer exists at all (v3.1), so the rule is now vacuously satisfied. Status is not a public filter.

URL: `?pillar=` `&sector=` `&service=` `&label=` `&sort=`. `replaceState` for incremental changes, `pushState` for the pillar switch; full restore on load.

**Superseded (v2.1):** `?pillar=` `&sector=` `&type=` `&discipline=` `&service=` `&sort=`, with the refinement scoped to one pillar. Already-shared URLs carrying `&type=` or `&discipline=` degrade to the unfiltered archive — `parseArchiveState()` ignores unrecognised parameters — so no redirect is required.

> **IMPLEMENTED 2026-08-17.** The contract above was written at v3.0 and the archive ran behind it until now: `contextualFacet()` still returned `service` for Reality Capture alone, and the Service facet was keyed by the localized slug. Both are corrected, and three rules the contract did not previously state are settled below (`DECISIONS_LOG.md` #101).

**Service facet identity — the immutable `key`, never a slug or a name.** `?service=` carries a canonical `ServiceKey` (`proiectare-arhitectura`, `scanare-laser-3d`, …). A slug is an editable, per-locale string; keying the public filter vocabulary on one made the RO and EN archives disagree about the same filter and let a rename silently invalidate every shared link. `key` is required, unique and immutable on the Service schema precisely so it can carry this. **Slug-valued `?service=` URLs from before this date are not aliased and not translated** — they follow the same unknown-value path as `&type=` and `&discipline=` and resolve to a valid, unfiltered page.

**Sector is global and governed.** It is offered under all three modes and **survives a Pillar switch**, exactly as Label does. Reaffirmed 2026-08-17 against the reading that the archive's secondary controls are Services and Labels only.

**Two population rules, and the line between them.**
- **Sector and Service are presence-scoped** — an option appears only if some project in scope carries it, so no control offers a value that matches nothing. Under `All` the Service options are the union across both pillars; under a Pillar, only that Pillar's.
- **Label is vocabulary-scoped** — both canonical Labels are always offered, even at **zero** matches, because `PROJECT_LABELS` is a closed two-value global vocabulary and a Label that disappears until the first such project exists makes the taxonomy look incomplete. Selecting one with no matches is a valid state that renders the existing empty state. **This exception is bounded to Labels** and is not to be generalized to Sector (seven values) or Service (a growing catalogue of content objects).

**Pillar switching.** Label and Sector always survive. The Service key survives exactly when the destination mode can still express it — kept when widening a Pillar to `All`, or narrowing `All` to the Pillar that owns the key; cleared when crossing between the two Pillars, or narrowing `All` to the Pillar that does not own it.

**Forward-compatible encoding.** Facet values are serialized as a **comma-separated list and parsed as a list**, even though the launch behaviour permits exactly one value per facet. This is a serialization choice, not a product decision: it means resolving the open multi-select question (`IA`:167) later changes the *UI* and the validation bound, and does **not** break already-shared URLs. Single-select remains the launch behaviour until that decision is made.

---

## 24. Change log

- **v1.4 (2026-08-14)** — **Amendment: the five open questions in `CONTENT_MODEL.md` §15 closed by the client.** Downstream reconciliation only.

  **Withdrawn:** Attribution, Employer/Studio, Roles, Authorship and Commissioning context as CMS fields and vocabularies (§7.2, §7.3), together with the `employer` document type · the old Status vocabulary (Built/Realized · Unbuilt/Proposal · In progress · Delivered) · Sector as a multi-valued open axis.

  **Added:** Status as a closed, mandatory, single-select vocabulary — În dezvoltare · În desfășurare · Finalizat · Nerealizat · Sector as closed, mandatory, **single-select** · Colaboratori and Echipă named as the only crediting fields · the record that **`validateAuthorship()` is deleted, not re-keyed onto a Service**.

  **Unchanged and not reopened:** the eight-Service list (no drone-photogrammetry Service) · the intentional distinction between *Vizualizare 3D* and *Vizualizare de arhitectură* · everything in v1.3.

  **Source:** `docs/product/CONTENT_MODEL.md` v3.1, `DECISIONS_LOG.md` #91–#96. **No schema, application, filter or UI change has been made.**

- **v1.3 (2026-08-13)** — **Amendment: client-validated simplification of the project model.** Downstream reconciliation only; no independent architectural decision.

  **Withdrawn:** Discipline and Entry Type / Project Type as CMS vocabularies (§7.2) · Pillar derivation, `PillarAssignment`, cross-pillar entries and the editor-visible pillar readout (§7.4) · `&type=` and `&discipline=` from the archive contract (§23.5) · OD-7 (closed as moot).

  **Added:** authored single-value Pillar · multi-select Services constrained to the project's Pillar, with a stable machine key per Service · Pillar-level and Service-driven conditional field requirements merged by MANDATORY > OPTIONAL > NOT APPLICABLE (§7.3) · Labels (`competition`, `diploma-project`) · a closed global Sector vocabulary · project-level Equipment · Implementation Company · `&label=` and a both-pillar Service refinement (§23.5).

  **Source:** `docs/product/CONTENT_MODEL.md` v3.0 (CLIENT-VALIDATED). Implementation inventory, sequencing and data implications: `docs/product/PROJECT_MODEL_IMPACT.md`. **No schema, application, filter or UI change has been made** — this release amends the specification only.

- **v1.0 (2026-08-11)** — Initial authoritative technical architecture. Reconciles the original production architecture proposal against an Independent Architecture Review and a Security & Privacy Review, plus vendor/platform verification performed 2026-08-11.

  **Resolved from review:** locale-neutral localization identity replacing document-level i18n; preview named as an explicit access-controlled exception to static rendering; controlled vocabularies re-sourced to `CONTENT_MODEL.md` §3; point-cloud scope corrected to four page types with a spike-gated renderer; two fabricated quotations removed and re-sourced; `@view-transition` replacing `ClientRouter`; six missing Content Model fields restored; Pillar derivation and discovery order specified; complete archive filter contract stated; keyboard journeys added for inspection surfaces; capture metadata made CMS-sourced; publication gate added; subprocessor table added.

  **Resolved from security review:** secrets model; `.gitignore`/`.env.example`; no write token anywhere; private dataset + build-time read-only token with draft-leak assertion; preview credential isolation and access control; duplicate-host `noindex`; server-side contact validation; no CMS `innerHTML`; controlled Portable Text serialization; no placeholder origins; CSP and security headers; raw survey exclusion; derivative stripping; publication clearance; no submission persistence; retention and logging policy; tested backup recovery; least-privilege CI.

  **Owner decisions recorded:** OD-8 (diacritics, decided); OD-4 ("without a deploy" interpretation, recorded).

  **Deliberately unresolved:** OD-1 … OD-7.

- **v1.1 (2026-08-11)** — Owner decisions recorded; Phase 0 contract layer added.

  **Decisions closed:** OD-1 (pillar hub routes) and OD-2 (EN route segments) — §11.1 route map filled and frozen, with the terminology boundary and per-locale reserved-slug list stated. OD-5 (WCAG 2.2 AA; budgets as engineering targets not per-device guarantees; browser baseline latest-2 Chrome/Safari/Firefox/Edge + current iOS Safari; mandatory progressive enhancement) — §14, §14.0, §15. Governance record: `DECISIONS_LOG.md` Batch 21, #75–78.

  **Added:** §14.0 browser baseline and progressive-enhancement rules, binding View Transitions to never be required for navigation · §23.1 the frozen contract set (15 contracts) · §23.3 workstream ownership, single-owner files, and branch boundaries · §23.4 integration points I-1…I-6 · §23.5 forward-compatible facet encoding · contact prefill parameter names (`?topic=`, `?regarding=`).

  **Still open:** OD-3, OD-6, OD-7 (none blocks Phase 0 or Phase 1).

- **v1.2 (2026-08-11)** — §23.3 amendment only, recorded at integration point **I-1**. No architectural decision changed.

  **Ownership clarified:** the application root scaffold and shared build configuration (`package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`) are **Workstream A's single-owner files** — §23.3 previously assigned no owner, and one build governs every workstream's output. B must not modify them without an explicit integration handoff. `src/lib/i18n/**` added to A's `Owns` column, matching the route map's existing single-owner status.

  **Duplicate locale authority removed:** `Locale` / `LOCALES` / `DEFAULT_LOCALE` had two independent declarations (`src/lib/i18n/routes.ts` and `src/lib/content/types.ts`). The route map is now the single declaration and the content contract re-exports it — the direction §7.7 already establishes. Values and the §11.1 route contract are unchanged.
