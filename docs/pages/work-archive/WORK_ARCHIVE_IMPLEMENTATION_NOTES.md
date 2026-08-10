# Archive — Implementation Notes

| Field | Value |
| --- | --- |
| **Status** | AUTHORITATIVE |
| **Phase** | Implementation |
| **Companion to** | `work-archive-measured-reality-hifi-v1.html` |
| **Audience** | Engineering (build) · Content strategy & editors (curate) · Design (reference) |
| **Purpose** | Defines implementation behaviour that intentionally differs from the approved HiFi while preserving the validated UX. |
| **Last updated** | 2026\-08\-01 |

Companion document to `work-archive-measured-reality-hifi-v1.html`.

This is an **implementation bridge**, not a bug list and not a redesign. The HiFi prototype is the approved visual and UX reference. These notes record where the *underlying behaviour and data model* should differ from the prototype in order to comply with the authoritative Information Architecture and Content Model during development.

> Note on sources: at the time of writing, the canonical `CONTENT_MODEL.md`, `PAGE_IA.md` and `COMPONENT_INVENTORY.md` are not present in the connected repository. The dimensions below follow the directives given for this task and the attribution types defined in `docs/00-project/PROJECT_CONTEXT.md`. Final field names and enumerations must be reconciled against the canonical Content Model once it is connected. Nothing here should be treated as inventing that document — it is an implementation checklist to align with it.

* * *

## Purpose

The HiFi prototype validates, and freezes, the **experience**\:

- the visual language (tokens, Pixelify voice, blue\-as\-activation, hairlines);
- the interaction model (pillar tabs, contextual refinement, focus/hover, exit transition);
- the editorial rhythm (asymmetric masonry, varying image sizes, measured spacing);
- the information hierarchy (browse\-first, filters secondary, search tertiary);
- the browsing experience end to end, across both entry journeys.

Implementation will keep all of the above and align the **behaviour beneath it** — the taxonomy, the filter semantics, the curation mechanism and the URL contract — with the authoritative IA and Content Model. The prototype deliberately simplified the data model to prove the experience quickly; production restores the full model.

* * *

## Frozen UX decisions

> These are **implementation constraints, not suggestions**. They are no longer open for discussion during development. Developers should preserve them exactly as validated.

- **Editorial masonry layout** — five\-size vocabulary (feature / wide / tall / std / small), asymmetric composition, measured gaps. Not a uniform card grid.
- **Calm browsing** — greyscale\-at\-rest photography, single accent used only on activation, slow easing, generous spacing.
- **Single canonical Work Archive** — one page at `/proiecte`; pillars are a view of it, never separate archives.
- **Pillar toggle** — `Toate · Arhitectură & Design · Reality Capture` as calm editorial tabs.
- **Pre\-selected pillar from the Hub** — arriving with `?pillar=architecture` / `?pillar=reality-capture` opens the archive already focused (Journey A). No param \= "All" (Journey B).
- **Project → Work Entry transition** — the archive dissolves (siblings fade, chosen image scales, page fades) so the project becomes the protagonist. Reduced\-motion falls back to native navigation.
- **Search as a secondary control** — a quiet inline field; browsing remains primary.
- **Empty\-state behaviour** — honest message \+ suggested categories \+ one\-click reset.
- **Motion language** — slow, precise, editorial; reveal\-on\-scroll; keyboard and reduced\-motion support.
- **Interaction patterns** — focus/hover refinement (subtle scale, greyscale→colour, growing blue mark, metadata reveal), coordinate/measure metadata style, reused header/nav/footer system.

These are the reference. The implementation responsibilities below refine only what sits *underneath* them.

* * *

## Implementation responsibilities

> These define **how production behaviour should realise the approved experience**. They refine what sits beneath the UX — taxonomy, filter semantics, curation, search, URL — and never the experience itself. Each item aligns the prototype's simplifications with the canonical IA and Content Model.

### Filters

The prototype exposes four public controls — pillar, a single flattened `type` chip set, a `year` select and a `status` select. Production should change these as follows:

- **Year becomes sorting, not filtering.**
  Year is a continuous ordinal attribute of every project, not a discovery facet. Filtering to a single year fragments the archive and hides the breadth the page exists to communicate. In the Content Model year is a project attribute, so it belongs on the *sort* axis (e.g. `Cele mai noi` / newest\-first as default, plus curated order). Replace the year `<select>` filter with a sort control (`curated` · `newest` · `oldest`).

- **Status is not exposed as a public filter** (unless a future IA change approves it).
  Status (`built` / `competition` / `concept` / `in-progress`) is an internal project state. Visitors do not browse "by status," and exposing it can surface speculative or unbuilt flags out of context. Keep status as canonical metadata on the **Work Entry**, and optionally as an internal editor filter, but remove it from the public Archive controls.

- **Sector becomes a first\-class filter.**
  Sector (residential, public, cultural, heritage, industrial, infrastructure, landscape, …) is the single most meaningful *cross\-pillar* discovery axis and the one that best communicates breadth ("so many kinds of work"). Promote Sector to a primary, always\-available filter alongside the pillar toggle. This is the facet that should carry the `Toate` view.

- **Architecture exposes a contextual Discipline refinement.**
  Within the Architecture & Design pillar, the secondary chips should be **Discipline** (architecture · interior · competition · urbanism / public space · visualization), which is the correct canonical dimension for that pillar — not the flattened `type` used in the prototype.

- **Reality Capture exposes a contextual Service refinement.**
  Within the Reality Capture pillar, the secondary chips should be **Service** (laser scanning · drone photogrammetry · point\-cloud documentation · scan\-to\-BIM · digital twin · restoration support · surveying). Again the canonical dimension for that pillar, replacing the flattened `type`.

The interaction shape stays identical to the prototype (primary pillar tabs \+ contextual secondary chips \+ quiet search \+ result count). Only the *meaning* of the secondary facet changes: Sector globally, Discipline inside Architecture, Service inside Reality Capture. This matches the Content Model's separation of concerns while preserving the approved UX.

### Metadata

The prototype collapsed the taxonomy into two attributes (`data-type` and `data-status`) that mix several canonical dimensions — e.g. `locuință` (a sector), `concurs` (an entry type), `patrimoniu` (a sector), `scan-to-BIM` (a deliverable / service), `dronă` (a discipline / method). This was a deliberate simplification for the prototype and must not carry into production.

During implementation, Work Entries should expose the **canonical Content Model fields as independent dimensions**. Do not merge them:

| Dimension | What it answers | Example values |
| --- | --- | --- |
| **Entry Type** | the nature of the engagement / attribution | built project · competition · concept · professional experience (office / internship) · visualization · documentation service |
| **Sector** | the program / building type | residential · interior · public · cultural · heritage · industrial · infrastructure · landscape |
| **Discipline** | the Architecture\-pillar craft | architecture · interior design · urbanism / public space · competition design · visualization |
| **Service** | the Reality\-Capture\-pillar offering | laser scanning · drone photogrammetry · point\-cloud documentation · scan\-to\-BIM · digital twin · restoration support |
| **Deliverable** | the output produced | measured drawings / plans · ortho\-photo · point cloud · BIM model · digital twin · 3D scan · report |

Each remains an independent axis, so a single project can be, for example, *Entry Type \= documentation service · Sector \= heritage · Service \= laser scanning · Deliverable \= point cloud \+ measured drawings* without any of those values overwriting another. Entry Type should also align with the attribution types in `PROJECT_CONTEXT.md` so authorship is communicated honestly on the Work Entry.

The Archive's filters read from these fields (Sector globally; Discipline / Service contextually); the Work Entry displays the full set.

### Editorial curation

Editorial rhythm is **part of the design system**, not an accident of markup. The prototype hardcodes each project's size class (`s-feature`, `s-tall`, …) and its position in HTML order — correct for a validation prototype, wrong for production, where editors must curate the visual rhythm **without touching code**.

Keep two responsibilities strictly separate:

- **Engineering builds the rendering engine — once.** The masonry, the five\-size vocabulary and the composition logic are implemented as a system that reads metadata and lays out the grid. Developers do not decide which projects lead or in what order they appear.
- **Editors curate the experience — continuously.** Which projects are prominent, how large each renders, and the order they fall in are content decisions, made in the CMS, changeable without a deploy.

Prominence, ordering and visual hierarchy are therefore expressed as **editorial metadata**, never as code. On each Work Entry, for example:

- a `prominence` / `weight` field (e.g. `feature` · `large` · `standard` · `small`) that maps to the masonry size vocabulary;
- a `featured` / `pinned` flag for hero placement;
- a `curated_order` (manual sort) that the `curated` sort mode respects.

The masonry engine reads these fields and composes the layout; the size vocabulary and the composition logic stay exactly as approved. Content editors curate rhythm and emphasis from the CMS; developers do not re\-order markup. This keeps the authored, editorial feel of the Archive a living editorial decision rather than a frozen build artefact.

### Search

**Search is a convenience layer. It is not part of the Information Architecture.** Browsing remains the primary discovery mechanism; the Archive is intentionally designed around *exploration*, not search. Search accelerates a known\-item lookup for the minority of visitors who arrive with one in mind — it never replaces, and must never crowd out, the editorial browse.

With that established, treat search as a **candidate feature**. Its placement and interaction are validated visually in the prototype (a quiet, secondary inline field — never dominant). Its *final behaviour* should be confirmed during implementation:

- which fields it searches (title, sector, discipline / service, location, year, tags);
- whether it is client\-side over the loaded set or backed by a search index / server endpoint (depends on eventual archive size);
- debounce, minimum characters, and whether results also respect the active pillar/filters;
- whether it ships at launch or as a fast\-follow.

The visual contract is frozen; the retrieval behaviour is an implementation decision.

### URL state

> **Principle: the URL represents navigation state, never editorial decisions.** Editorial hierarchy — what leads, what is prominent, what order projects appear in — is defined by content strategy and CMS metadata (see *Editorial curation*), not by URL parameters. The URL captures where the visitor *is* so a view can be shared and restored; it must never become a back\-door for curation.

The Archive must be shareable and deep\-linkable. The prototype already reflects **pillar** in the URL (`?pillar=architecture`) via `replaceState`. Production should extend the URL contract:

- **Pillar** — always reflected (`?pillar=architecture` | `reality-capture`; absent \= All). Powers Journey A deep\-linking from the Hubs; treat as the canonical, primary state.
- **Filters** — reflect the active Sector and the contextual Discipline / Service in the URL (e.g. `?pillar=architecture&discipline=interior` or `?sector=heritage`) so any filtered view can be shared and restored, and the browser back button behaves.
- **Sorting** — reflect the sort mode when not default (e.g. `?sort=newest`), since year moves from filter to sort.
- **Search query** — decide during implementation whether `?q=` is persisted; if search ships, persisting it keeps results shareable, but confirm against the IA.

Recommended mechanics: use `replaceState` for incremental in\-page changes (filters, sort, search) to avoid history spam, and reserve `pushState` for the primary pillar switch if a discrete back\-step between pillars is desired. Restore all of the above from the URL on load, in addition to the already\-implemented pillar preselect.

* * *

## Explicitly out of scope

These notes do **not** require redesigning the Archive. The visual design, the interaction model, the editorial rhythm and the information hierarchy are approved and frozen. Nothing here changes layout, composition, motion, hierarchy, typography or the component system. Every item above refines **production behaviour** — the data model, filter semantics, curation mechanism, search retrieval and URL contract — so the approved experience is backed by the canonical IA and Content Model.

* * *

## Reusable template for implementation companions

This document is intended as the **template for every future `*_IMPLEMENTATION_NOTES.md`**. Each production HiFi page should ship with a companion that follows the same shape, so the implementation layer reads consistently across the site and any developer knows where to look.

Generic structure:

1. **Document header** — Status · Phase · Companion to · Audience · Purpose · Last updated.
2. **Purpose** — what the HiFi validated and froze; what implementation will align beneath it.
3. **Frozen UX decisions** — the experience constraints; not open for discussion.
4. **Implementation responsibilities** — how production realises the experience, with page\-specific subsections (see below).
5. **Explicitly out of scope** — an unambiguous statement that no redesign is implied.
6. **Conclusion** — the experience\-vs\-implementation distinction.

Only the subsections under *Implementation responsibilities* change per page. Suggested emphases:

- **HOMEPAGE\_IMPLEMENTATION\_NOTES.md** — intro gallery states & self\-segmentation, section data sources, motion / performance budget, navigation model.
- **ARCHITECTURE\_HUB\_IMPLEMENTATION\_NOTES.md** — focus\-carousel data source, curated\-selection rule (Hub \= depth, not the Archive), pillar → Archive routing, cross\-pillar bridge.
- **REALITY\_CAPTURE\_HUB\_IMPLEMENTATION\_NOTES.md** — as above, plus comparison and point\-cloud asset sourcing and capture metadata.
- **WORK\_ENTRY\_IMPLEMENTATION\_NOTES.md** — canonical metadata fields (Entry Type / Sector / Discipline / Service / Deliverable), drawings / plans & point\-cloud asset pipeline, honest attribution, related\-work source.
- **SERVICE\_PAGE\_IMPLEMENTATION\_NOTES.md** — offering / service model, pillar linkage, contact and continuation routing.

Keeping this shape makes the implementation layer predictable: a developer opening any companion finds the frozen constraints in section 3 and their own responsibilities in section 4, in the same order, every time.

* * *

## Conclusion

The HiFi prototype remains the **authoritative reference for the experience** — visual language, interaction, editorial rhythm, information hierarchy and browsing feel. This document is the **authority for production behaviour** — the data model, filter semantics, curation mechanism, search retrieval and URL contract that realise that experience against the canonical IA and Content Model.

The two are complementary and must never be confused. Nothing in this document is a request to change the design; where the design and the implementation appear to disagree, the HiFi governs the experience and these notes govern only what is built beneath it.

**The HiFi defines what the Archive is. These notes define how it is built. Neither is a redesign of the other.**
