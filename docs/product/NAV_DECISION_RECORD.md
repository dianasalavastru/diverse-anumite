# Navigation Decision Record

**Scope:** IA Step 1 — navigation philosophy. **Status:** Agreed & locked 2026-07-28. Authoritative concise reference for the IA and UX phases. Detailed working version: `INFORMATION_ARCHITECTURE.md` (Step 1). Underlying model: `CONTENT_MODEL.md` (v2.1). *§5(2) updated for review finding F1 (2026-07-30); §6 refreshed for review finding M4 (2026-07-30) — sitemap-phase questions reconciled with the now-locked IA. Documentation hygiene only; no navigation behaviour or decision changed.*

## 1. Two navigation layers
The site has two distinct navigation layers with different responsibilities:
- **Homepage narrative navigation (Layer 1)** — the homepage as a guided story.
- **Global Information Architecture (Layer 2)** — the persistent, site-wide navigation.

## 2. Purpose of each layer & who it serves
- **Layer 1 — Homepage narrative.** Onboarding and storytelling: introduce the practice, present both capabilities, and guide the visitor toward the path most relevant to them. Serves **first-time and undecided visitors**, especially social-referral and mobile arrivals who need orientation before exploring.
- **Layer 2 — Global IA.** Exploration and wayfinding: efficient movement between the main areas of the site from any page. Serves **higher-intent and returning visitors, and deep-linkers** who arrive directly on an interior page (e.g. a Service page from search) and never see the homepage.

## 3. Relationship between the layers
Layer 2 is a persistent base layer present on every page (including the homepage) and must remain **consistent — it never shape-shifts** between the homepage and interior pages ("fixed navigation"). Layer 1 is **additive**: the homepage's narrative wayfinding sits on top of the global nav and hands visitors off into it; it is not a look-alike substitute that behaves differently. In-page homepage section cues may be anchors, but the doorways they lead to (archive, service pages, about) are real, persistent routes.

## 4. Global navigation philosophy — task-first
The global navigation follows a **task-first** philosophy.

Global navigation: **Despre · Servicii · Proiecte · Contact** (+ language toggle). These represent the primary user tasks rather than exposing the site's topical pillars (Architecture & Design; Reality Capture) directly.

**Why task-first over topic-first:** once navigation is split into two layers, topic-first's decisive advantages — self-segmentation, a one-click route to scanning, and clean separation of the two audiences — are delivered by the **homepage fork (Layer 1)**, by **deep links**, and by **dedicated pillar hubs**, not by the top bar. Task-first additionally reads as one unified practice (serving the single-brand decision), matches studio-site convention, and scales more flatly. The pillars are reflected by the site's **structure**, not by the menu — avoiding the "schema-as-menu" anti-pattern.

*Label mapping to the content model:* Despre = About · Servicii = the Services section · **Proiecte = the public label for the Work archive of Work Entries** · Contact. The internal canonical object remains the **Work Entry** regardless of the public "Proiecte" label.

## 5. Conditions for consistency with the frozen content model
Task-first global navigation is valid **only while all three hold** (these are what the round-1 homepage mockup violated):
1. **Servicii and Proiecte both expose the two pillars internally** — each opens with a co-equal pillar fork, never a flat mixed list.
2. **Dedicated pillar hubs exist as first-class landing pages** for users and SEO — reachable and cross-linked, though not top-nav items (preserving topical authority, especially for the scanning line). Reachability is delivered by the homepage fork, deep links, and **contextual back-paths from Service pages (and relevant Work Entries) to their parent hub** — not by the global nav (F1, 2026-07-30).
3. **Reality Capture work is fully represented inside the Work archive** as first-class Work Entries, reachable like any other entry.

## 6. Sitemap-phase questions — resolutions
The questions originally raised for the sitemap phase have since been decided in IA Steps 2–7 and the Decision Log. This record keeps the final decisions, not the historical uncertainty.

- **Pillar-hub route structure (standalone vs. nested), and where hubs live** — **Resolved:** standalone depth-1 routes, not nested, not in the top nav (IA Step 2 §2.1; `DECISIONS_LOG.md` #19–20).
- **i18n URL strategy** — **Resolved:** RO at root, EN under `/en/`, localized slugs, hreflang + `x-default` (IA §2.2; `DECISIONS_LOG.md` #21). *Slug-localization detail and missing-translation fallback remain open — carried in the IA "Open" list.*
- **Which curated views become indexable routes vs. filter states** — **Resolved:** curated routes = Competitions + Professional Experience; all other facets (incl. Sector) are filter states on `/proiecte` (IA §2.2, §2.5; `DECISIONS_LOG.md` #21). *Whether to add committed SEO landing routes for long-tail intersections (e.g. heritage × scanning) is tracked separately as review finding F3 — open, SEO phase.*
- **Canonical-intent across pillar hub / Services index / individual Service page** — **Resolved in principle:** one purpose per page type (`DECISIONS_LOG.md` #22), reinforced by M1 — the Service page is the shared conversion/canonical destination, the Pillar Hub carries topical intent, and the Services index is a router (IA §2.5 anti-cannibalization; Step 6 "Two convergent journeys"; `DECISIONS_LOG.md` #63–65). *Per-URL canonical tags are an SEO/build-phase implementation detail.*
- **Enumeration of supporting/utility pages** — **Resolved:** Contact, About (Despre), Privacy/GDPR, Legal/imprint, and 404, plus EU-funding as a site-wide footer element (not a page); sitemap.xml/robots.txt are technical, not pages (IA Step 7; `DECISIONS_LOG.md` #45–48).

**Still genuinely open (carried into the naming/design phase):**
- **Public naming of the pillar hubs** — the routes exist and are locked; only their public labels/slugs (working: `/arhitectura-design`, `/reality-capture`) are undecided. Also carried in the IA "Open" list.
