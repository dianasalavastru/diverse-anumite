# Discovery Review — Atelier Portfolio Website

> **Status: Historical discovery artifact — superseded in part.**
>
> This document records the questions, assumptions and proposals explored during discovery. It is preserved for historical context and should not be used as the source of truth for the current architecture. For finalized decisions, refer to `INFORMATION_ARCHITECTURE.md`, `CONTENT_MODEL.md`, `NAV_DECISION_RECORD.md` and `DECISIONS_LOG.md`.
>
> *Notice added 2026-07-30 (review finding M5). The original discovery reasoning below — including alternatives that were later rejected — is retained unchanged; only this notice and a few clearly-marked inline "superseded" pointers were added.*

**Project:** Portfolio + client-acquisition website for an independent architect & designer (working name in wireframes: *Atelier "Diverse Anumite"*).
**Stage:** Pre-implementation discovery. No stack, no code.
**Status:** Round 2 — updated with client-validated decisions (see §0) and their implications (see §0b). Original findings retained below.

---

## 0. Confirmed decisions (validated with client)

These were assumptions in round 1 and are now **facts**:

- **Audience is broad and not to be optimized for any single group** — private clients, businesses, developers, institutions, public organizations, and collaborators are all potential clients.
- **Two equally important goals:** (a) present a high-quality professional portfolio, and (b) generate new client inquiries.
- **Two co-equal service pillars, one brand:** Architecture/interior design **and** 3D scanning / drone photogrammetry are equally important. Scanning is a **core** offering with **equal prominence** site-wide — not a secondary capability.
- **Reality-capture is a deliberate business expansion:** the owner acquired professional scanning + drone equipment through an **EU-funded program** specifically to grow these services.
- **Desired work spans both pillars:** architecture & interior projects *and* scanning/photogrammetry projects.
- **Other-studio work (e.g. MAAI) gets a dedicated section** with clear attribution of employer, role, and authorship.
- **The site is simultaneously a client-acquisition tool and a professional portfolio.**

## 0b. Implications of these decisions

### Information architecture

- **Two co-equal pillars, not a portfolio with a scanning appendix.** The round-1 wireframe buries scanning as one mid-scroll block. Equal prominence means the IA must express two peer offerings — most likely a "Services" structure that resolves into two clearly-weighted lines (Architecture & Design; Reality Capture / 3D scanning & drone photogrammetry), each with its own landing, plus a Work/Projects index filterable across both.
- **Attribution becomes a first-class navigation axis.** The dedicated other-studio section means projects live on (at least) two independent axes: *discipline/service* (architecture, interior, rendering, 3D scanning, photogrammetry) and *context/attribution* (personal, competition, collaboration, employed-at-studio, service job, visualization-only). Employer is structured metadata **and** a browsable "Professional experience" view. This resolves the round-1 taxonomy inconsistency: **MAAI is not a sibling of "competitions" — it's an attribution filter/section.** *[Superseded in part (M5): the finalized IA does **not** make attribution a visitor-facing navigation/browse axis. Attribution, Employer, Role and Authorship are **display/crediting information only**; there is no attribution filter in the Work archive. The "Professional experience" view was realized as the **Professional Experience curated view** (Attribution = Studio, grouped by Employer), and MAAI work sits there and in the archive as normal Work Entries. The underlying insight — MAAI is an attribution view, not a category sibling — still holds. See `DECISIONS_LOG.md` #52–54 and `INFORMATION_ARCHITECTURE.md` Step 5 / §5.1.]*
- **The site is a hybrid: portfolio + service business.** Architecture behaves like a portfolio (project-led). Scanning/photogrammetry behaves like a service (use-case-led, deliverable-led, searched-for). IA must host both cleanly — portfolio project pages **and** service pages with use cases, process, and deliverables. Different templates, different fields.
- **A broad, un-prioritized audience forces self-segmentation.** Because we must not optimize for one group, the IA has to let visitors route themselves quickly — clear wayfinding near the top and per-pillar entry points, rather than one linear narrative that assumes a single reader.
- **Two conversion destinations, woven throughout.** "Generate inquiries" as a co-equal goal means contact is not a single footer endpoint. Each pillar likely needs its own inquiry path (an architecture consultation vs. a scanning quote capture different fields), and CTAs must recur through the page. *[Superseded in part (M5): the finalized IA uses **one** simple Contact form (name, email, message) with an optional broad topic selector and two contextual prefills (broad `Topic` + exact originating `Regarding` service), feeding **one inbox**; detailed scanning requirements are qualified in follow-up, not via a separate per-pillar form. The "CTAs recur throughout" intent is preserved. See `DECISIONS_LOG.md` #46 and `INFORMATION_ARCHITECTURE.md` Step 7.]*

### Content strategy

- **Two content genres coexist.** Portfolio content (image-led, mood, authorship, curation) alongside service content (what it is, use cases, deliverables, accuracy/turnaround, process). Scanning's discoverability and conversion depend on use-case content: heritage/inscription documentation, degradation/condition survey, as-built/BIM, surveying, inspection.
- **Layered depth for a mixed audience.** Private clients want outcomes and taste; institutions, public orgs, and developers want proof — credentials, equipment, process, references, compliance. Use progressive disclosure: emotionally strong at the surface, technically deep on demand.
- **Proof/credibility content is now mandatory.** Acquisition for institutions and public tenders needs equipment/capabilities, method/accuracy, past clients/testimonials, and the professional-experience section. The EU-funded equipment is both a credibility asset and a likely compliance obligation.
- **EU-funding publicity compliance.** EU-funded programs typically carry mandatory acknowledgment/visibility rules (program logos, a statement, sometimes for a set period). Confirm and place this deliberately rather than retrofitting.
- **Explicit attribution model.** Every project record carries employer, role, and authorship as structured fields — delivering the crediting the client wants and mitigating the rights risk on other-studio work (publication permission still required).
- **Bilingual technical vocabulary is an SEO task, not just UI translation.** Scanning/photogrammetry are searched services; correct, deliberate RO/EN technical terms matter for findability.

### Homepage narrative

- **From a single story to a balanced dual narrative.** The homepage can no longer read as "an architect who also scans." It must establish one identity with two core capabilities of equal standing, then give each a showcase of comparable visual weight before merging into curated work and inquiry.
- **Sequence still exists even with equal importance.** On one scrolling page something is first; "equal prominence" needs an operating rule (e.g. a shared hero naming both, then a deliberate fork) rather than an implicit ranking.
- **The editorial/calm aesthetic must also do lead-gen.** Two co-equal goals mean the minimal look has to carry clear, recurring CTAs without turning corporate — the core homepage tension for design to solve.
- **Two visual languages to reconcile.** Renders/photography vs. point-cloud/scan/drone imagery look very different; both must read as equally intentional and premium so scanning doesn't feel utilitarian beside polished architecture visuals.
- **A credibility band earns its place** (experience, equipment/EU investment, studios, clients) — absent as such from the round-1 wireframe.

---

## 1. Understanding of the product

Real production website for one independent architect/designer — personal portfolio + client-acquisition tool, no accounts, not ecommerce. **Two co-equal practices under one brand:** a creative/design practice (architecture, interior design, competitions, personal projects, rendering, internship/office work) and a reality-capture practice (3D laser scanning, point-cloud documentation, drone photogrammetry), the latter a deliberate EU-funded expansion. Must communicate role/authorship per project across attribution types. Hard requirement: owner edits projects **without touching code**. Romania-based, RO primary + EN toggle.

## 2. Intended visual & interaction language

**Facts.** Editorial architecture-portfolio feel, not corporate landing: visual, calm, premium, minimal, image-led, typography-led, highly curated. Long continuous scroll. Intro gallery moves through ~three visual states with floating, repositioning images. Borrowed language (from an external, not-to-copy reference): editorial feeling, image layering, oversized typography, smooth floating movement, generous whitespace, restrained color. Motion supports content, never reduces usability. Mark = "formă principală"; nav fixed.

**Assumptions.** Near-monochrome + single restrained accent; oversized display type as a compositional element; scroll-linked motion, likely a pinned section driving three keyframed arrangements; photography carries the palette, so image grading/consistency is part of the system.

**Challenge.** "Floating through three states" vs. "calm/minimal" are in tension; scroll-pinning is the top source of scroll-jacking complaints. Keep the ambition, add guardrails (§7/§8). New tension (from §0): the calm editorial look must now also carry lead-gen and reconcile two very different visual languages.

## 3. User groups — CONFIRMED broad

Per client: optimize for none exclusively. All are potential clients: private clients (aesthetics/outcomes, Instagram, mobile-heavy), businesses & developers (capability, reliability, ROI), institutions & public organizations (heritage/restoration/survey — proof, accuracy, process, compliance, references, tenders), and collaborators/peers (quality, authorship, via LinkedIn). Implication carried into §0b: the homepage must enable self-segmentation because no single group is prioritized.

## 4. Information architecture implied by the wireframes

**Facts — homepage (`01_…`):** fixed nav → intro three-state floating gallery (with "scroll" cue) → short studio/architect description (placeholder) → 3D-scanning / point-cloud showcase → drone + scanning services block with documentation use cases ("documentare inscripții", "fotografiere degradări") → project grid → carousel **"1/ concursuri"** → carousel **"2/ MAAI Arhitectura"** → social + contact → footer with logo. Nav: **DESPRE / SERVICII / PROIECTE / CONTACT / EN**; some items scroll, others open pages; Projects/Services may use dropdowns.

**Facts — project detail (`02_…`, competition):** nav → **NUME CONCURS** → **DATA + PREMIU** → **ECHIPA** → **DESCRIERE** → related strip ("alte proiecte sugerate") → footer. Context doc adds: title, category, year, location, authorship/role, collaborators, description, hero, gallery, drawings, plans, diagrams, zoomable images, related/next.

**Findings / challenges (updated).**
- Taxonomy inconsistency **now resolved** by §0: discipline and attribution are separate axes; MAAI = attribution view, not a category sibling.
- Scanning's mid-scroll single block **conflicts with confirmed equal prominence** — must be elevated to a peer pillar.
- Three overlapping browse surfaces (grid + two carousels) still risk redundancy; carousels remain a weak primary browse pattern.
- Nav mapping (scroll vs. page) still undefined; now must also account for two service landings and a professional-experience section.
- One detail template shown (competition); confirmed need for multiple templates — portfolio project vs. service/scanning job vs. professional-experience entry.

## 5. Missing requirements

- **CMS / content model** — required ("edit without code"), still undefined. Must now model two content genres (projects + services) and explicit attribution fields.
- **i18n scope** — RO+EN; full-bilingual policy, translation ownership, URL strategy, hreflang, missing-translation fallback. Now also: correct bilingual technical vocabulary for scanning SEO.
- **Content readiness** — all lorem ipsum; real copy + curated projects/images + service/use-case content + proof assets are the actual product.
- **Asset pipeline** — source sizes/formats/count/owner undefined; responsive AVIF/WebP + CDN plan needed. Now also point-cloud/scan asset formats.
- **Point-cloud/3D fidelity** — interactive WebGL vs. video vs. images; big performance/cost/mobile swing.
- **Zoomable drawings** — pan-zoom vs. deep-zoom tiling.
- **Conversion mechanics** — per-pillar inquiry paths; a scanning quote form needs object/location/deliverable/accuracy/timeline fields; spam protection.
- **Legal** — GDPR consent + privacy; image/attribution rights for other-studio work; **EU-funding publicity obligations** (new).
- **Proof assets** — testimonials, client list, equipment specs, certifications (needed for the acquisition goal).
- **Brand assets** — final name, logo, type licenses, color tokens.
- **Ops** — budget, timeline, hosting/domain, launch project count/growth, analytics, target devices/browsers.
- **Search/filtering** — likely needed across two axes as the portfolio grows.
- **Accessibility target** — none stated (recommend WCAG 2.2 AA).

## 6. Ambiguous decisions (updated)

Resolved by §0: one-brand-vs-two-offers (→ two co-equal pillars, one brand); audience prioritization (→ broad/self-segmenting); employer-as-category-vs-metadata (→ attribution is first-class, with a dedicated experience view); primary goal (→ dual portfolio + inquiries).

Still open: is the studio name final or placeholder (reads like placeholder); homepage sections vs. pages per nav item; project browse model (grid vs. carousels vs. both); gallery "three states" semantics; services depth (section vs. pages vs. inquiry flow) — now leaning toward full service pages given equal prominence; "studio/atelier" vs. one-person personal brand.

## 7. UX & content risks

Motion vs. usability (floating three-state gallery + scroll-linked motion = highest risk; respect `prefers-reduced-motion`, keep native scroll, degrade gracefully). Balancing two co-equal pillars without either feeling secondary — a genuine layout/curation challenge. Carousels as primary browse (hide content, weak for compare, error-prone on touch, poor for SEO/keyboard/SR). Attribution clarity (mis-crediting other-studio work = reputational/legal risk). Content dependency (lorem everywhere; now also service + proof content). Redundant project surfaces. Conversion woven vs. bolted-on. Bilingual maintenance burden for a solo owner.

## 8. Performance & accessibility risks

**Performance.** Image-, motion-, possibly WebGL-heavy — worst-case Core Web Vitals profile. Large hero/gallery imagery → LCP; floating/un-dimensioned media → CLS; scroll-motion + point-cloud → INP/main-thread; custom fonts → render-blocking; eager carousels → transfer size; point-cloud WebGL on mobile → memory/battery, needs a fallback. Plan: responsive AVIF/WebP + `srcset`/`sizes`, explicit dimensions, below-fold lazy-load + LCP priority hint, CDN, code-split motion libs, hard performance budget.

**Accessibility (target WCAG 2.2 AA, to confirm).** Honor `prefers-reduced-motion`; never hijack scroll; non-motion access to gallery content; keyboard-operable carousels with pause and no traps; scrims + tested contrast for text over imagery; correct `lang`/hreflang on RO/EN switch; keyboard/SR-accessible zoom; real alt-text strategy; focus management for in-page nav and overlays.

**SEO.** Editorial image sites under-index; the acquisition goal raises the stakes. Favor SSR/SSG; semantic headings (one `H1`/page); per-project + per-service metadata and structured data (`CreativeWork`/`Person`, `LocalBusiness`/`Service` for the scanning side); sitemaps; RO/EN hreflang; descriptive alt text; deliberate bilingual keywords for scanning services. Carousel-hidden content is crawler-invisible — another reason not to make carousels the primary index.

## 9. Questions to answer before planning implementation

*[Historical note (M5): several questions below were answered by later decisions — e.g. equal-prominence meaning (`DECISIONS_LOG.md` #8), single integrated brand (#9/#3), separate inquiry forms → one form (#46), taxonomy/attribution model (frozen `CONTENT_MODEL.md`). They are retained here as the discovery-phase question set, not as open items.]*

**Newly surfaced by the §0 decisions**
1. Does "equal prominence" mean a strict 50/50 split, or simply that neither is subordinate — and what should a single-interest visitor (only architecture, or only scanning) experience?
2. Is reality-capture fully integrated into the one brand, or does it warrant a distinct service landing / light sub-identity?
3. What are the exact EU-funding publicity/acknowledgment obligations (program logos, mandatory statement, duration, placement)?
4. Which proof assets exist today — testimonials, client list, equipment specs, certifications?
5. Do the two pillars need separate inquiry forms, and what fields does a scanning quote require (object, location, deliverable, accuracy, timeline)?
6. For the professional-experience section: are publication rights and required credits secured per employer (MAAI and others); any NDAs?

**Still open from round 1**
7. Is the name/brand final, or placeholder; are logo/type/color fixed or open?
8. Personal brand vs. studio/atelier?
9. Definitive project taxonomy values on each axis; launch project count + growth; is filtering/search needed?
10. Homepage browse model: grid vs. carousels vs. both; carousels curated highlights or primary index?
11. How many distinct detail/landing templates (portfolio project, scanning/service, professional-experience)?
12. Point-cloud showcase fidelity: WebGL / video / images, and mobile fallback? Zoom: pan-zoom or deep-zoom tiling?
13. i18n: fully bilingual? who translates? missing-translation fallback? correct scanning terminology in both languages?
14. When are real copy, curated projects/images, and service/use-case content ready; typical source image sizes/formats?
15. Who edits day-to-day and how technical (drives CMS); platform/hosting preferences?
16. Budget, timeline, launch date?
17. GDPR analytics + consent; who provides legal copy?
18. Confirm WCAG 2.2 AA + a performance budget (e.g. mobile LCP < 2.5s) as acceptance criteria before locking design.

## Recommended next step

Two questions now sit above the rest because they shape the whole IA and homepage narrative: **(1) what "equal prominence" concretely means** (50/50 vs. neither-subordinate, and the single-interest visitor's path), and **(2) whether reality-capture is one integrated brand or a distinct service line.** Settling these lets us define the navigation model, the template set, and the homepage structure coherently — still before any stack decision. *[Historical note (M5): both were subsequently settled — equal-prominence = neither subordinate (not 50/50), and reality-capture is one integrated brand (`DECISIONS_LOG.md` #8–9). The IA, content model and navigation decisions that followed are the current source of truth.]*
