# Homepage — High-Fidelity Design Specification

**Design-phase artifact. Implements `Documentation v1.0`; does not amend it.**
Status: **authoritative for the Homepage visual layer** · 2026-07-30

This is the high-fidelity design of the Homepage — the pixel-level realization of the frozen Homepage Wireframe. It is an **implementation**, not a redesign. It changes visual execution only; it changes **no architecture, no responsibilities, no modules, no hierarchy, no navigation, no components, no editorial flow.** Where visual difficulty arises, it is solved through design, never through architecture.

**Implemented from (Documentation v1.0):** `HOMEPAGE_WIREFRAME.md` · `HOMEPAGE_PAGE_IA.md` · `COMPONENT_INVENTORY.md` · `VISUAL_DIRECTION.md` · `WIREFRAMING_GUIDELINES.md` · `CONTENT_MODEL.md`. All other corpus docs are supporting context.

**Governing principle (inherited, never restated as new):** *The work is the protagonist; the interface is its frame.* Every value below is a **consequence** of that principle — restraint, whitespace, neutral color, slow motion, quiet type.

**How to read this document.** Three passes, as commissioned. **Pass 1** proves structural fidelity (the architecture, reproduced). **Pass 2** defines the complete visual system (type, space, grid, color, imagery, motion). **Pass 3** specifies each module at high fidelity across ten facets, each decision traced to v1.0. A verification section and a Figma build guide close it.

---

# PASS 1 — Structural fidelity

*Reproduce the frozen wireframe exactly. No visual polish here — only architectural correctness.*

The Homepage is one continuous editorial progression, mapping directly to the Page IA responsibility arc **Orientation → Practice → Capabilities → Evidence → Exploration → Action**. The vertical order, module set, and single-responsibility ownership below are reproduced verbatim from `HOMEPAGE_WIREFRAME.md` and are **fixed**:

| Order | Module | Page IA stage | Single responsibility (unchanged) | Canonical destination |
|---|---|---|---|---|
| — | **Global Header** (persistent frame) | Orientation | Layer-2 task-first nav; never shape-shifts | global destinations |
| 1 | **M-1 Identity** | A | Establish *one* coherent practice before any split | About (quiet) |
| 2 | **M-2 Pillar branch** | B | Two **co-equal** capabilities; early self-segmentation | two Pillar Hubs |
| 3 | **M-3 Practice-credibility** | C | Pillar-**neutral** trust (experience, EU-funded equipment) | About (quiet) |
| 4 | **M-4 Pillar section ×2** | D | Per-pillar editorial preview & proof — enough to *continue*, not to summarize the hub | each Pillar Hub |
| 5 | **M-5 Curated-view highlight** | E | Expose Competitions & Professional Experience as real destinations | each Curated View |
| 6 | **M-6 Contact invitation** | F | The **single** primary conversion action, last | Contact |
| 7 | **M-7 Footer** | G | Persistent orientation, compliance, EU-funding acknowledgment | all global destinations |

**Fixed structural invariants carried into visual design:**

- **Identity precedes the branch** (M-1 before M-2) — the "two businesses" misread is prevented before capabilities appear.
- **The two pillars are held at equal weight from M-2 onward** — no module may make either pillar larger, first-by-hierarchy, or emphasized (D3, no structural primacy).
- **The trust beat (M-3) stays pillar-neutral** — no pillar-specific proof enters it.
- **Highlight modules use two-level navigation** — the **module CTA always continues to the canonical destination** (Hub / Curated View); individual-item link behaviour remains a deferred wireframe-phase decision and is **not** resolved here.
- **One primary conversion action, and only at the end** (M-6). Pillar-hub and curated continuations are *navigation*, kept visually distinct from *conversion*.
- **Curated path is never short-circuited** — Homepage Highlight → Curated View → Work Entry (M-5 module CTA points at the view, not straight at entries).

**Visual emphasis hierarchy (declared by the wireframe, honored by this design):**
1. Identity (M-1) · 2. Capability choice (M-2) · 3. Work previews (M-4) · 4. Curated exploration (M-5) · 5. Contact invitation (M-6).
Everything else — M-3 credibility, Global Header, M-7 footer, and every supporting component — **reinforces** these five moments and never competes with them.

Pass 1 result: the module skeleton is reproduced with zero architectural change. Visual language may now be applied on top of it.

---

# PASS 2 — Visual language system

*One coherent system, derived entirely from the Visual Direction qualities: architectural publication · calm · editorial · precise · timeless · premium-through-quality · the interface stays quiet.*

## 2.1 Typography

**Pairing — editorial serif + neutral grotesque.** The pairing itself encodes the brand: a literary serif for *authorship and voice*, a neutral grotesque for *architectural precision*. Two families only; no third voice.

- **Editorial Serif (display & voice).** Primary recommendation **Canela** or **Fraunces** (Fraunces is variable & open-source — the accessible default). Used for the identity statement, section titles, and the occasional pull-line. High-contrast, quietly literary, never decorative. Weights used: **Regular 400** and **Medium 500** only.
- **Neutral Grotesque (text & interface).** Primary recommendation **Neue Haas Grotesk** or **Söhne**; open-source default **Inter**. Used for body, metadata, labels, navigation, buttons, captions. Neutral, precise, architectural. Weights used: **Regular 400**, **Medium 500**. **No bold, ever** — emphasis comes from scale and space, not weight.

**Type scale (desktop) — a restrained major-third (~1.25) progression, 8px baseline rhythm.** Fluid `clamp()` values collapse the top end on small screens.

| Token | Family | Size / line-height | Tracking | Use |
|---|---|---|---|---|
| Display XL | Serif 400 | 72 / 76px (`clamp(40px,6vw,72px)`) | −0.02em | M-1 identity statement |
| Display L | Serif 400 | 48 / 54px | −0.015em | Pillar names (M-2), major titles |
| Heading | Serif 500 | 32 / 40px | −0.01em | Section titles (M-3, M-4, M-5, M-6) |
| Subhead | Serif 400 | 24 / 32px | 0 | Pillar-section framing lines |
| Lead | Grotesque 400 | 20 / 32px | 0 | Identity positioning line, invitation |
| Body | Grotesque 400 | 17 / 28px | 0 | Prose, descriptions |
| Detail | Grotesque 400 | 14 / 20px | +0.01em | Metadata, captions, footer |
| Label | Grotesque 500 | 12 / 16px | +0.10em, uppercase | Eyebrows, nav, section labels |

**Hierarchy & rhythm.** Exactly one Display XL on the page (M-1). Section titles are all one rank (Heading) so no section outranks another — this is how two co-equal pillars stay co-equal typographically. Labels (12px, tracked, uppercase) are the connective tissue — eyebrows above sections, nav items, metadata keys — quietly signalling structure without shouting. All line-heights snap to the 8px baseline so the whole page shares one vertical cadence.

**Why (v1.0):** *architectural hierarchy · reading comfort · restraint · rhythm · confidence* (Visual Direction §8). Typography "supports understanding, not becomes a visual statement." Single-rank section titles enforce *no structural primacy* (D3) at the type level.

## 2.2 Spacing & whitespace

**Base unit 8px.** Scale: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 · 160 · 200`. Nothing off-scale.

**Section rhythm (the page's breathing).** Vertical space *between* modules is the largest material on the page:
- Desktop: **160px** between major modules (**200px** before M-6 Contact, to isolate the single action).
- Tablet: **96px** (120px before M-6).
- Mobile: **72px** (88px before M-6).

**Within-module rhythm.** Eyebrow→title 16px; title→intro 24px; intro→content 48–64px; content→module-CTA 48px.

**Whitespace philosophy.** Whitespace is an **architectural material**, not leftover space — it sets pacing, focus, and calm, and it is the primary way each module is "understood before the next" (narrative density, WG §7). Generous outer margins and large inter-module gaps mean the page can *never* read as a dense landing page; it reads as a composed editorial spread.

**Why (v1.0):** whitespace as material, *understanding before persuasion*, *deliberate pacing* (Visual Direction §4). The extra isolation around M-6 makes the single conversion action feel calm and inevitable rather than urgent.

## 2.3 Grid

Editorial asymmetry is permitted *within* a strict column grid — composed, not populated.

- **Desktop (≥1280px):** 12 columns · max content width **1280px** (page max 1440) · gutter **24px** · outer margin **80–120px** (fluid). Content rarely fills all 12 — text columns run 6–8 cols, imagery may run full-bleed or 10 cols.
- **Tablet (768–1279px):** 8 columns · gutter **24px** · outer margin **48px**.
- **Mobile (<768px):** 4 columns · gutter **16px** · outer margin **20–24px**.

**Full-bleed exception:** the M-1 identity hero and pillar imagery may extend to the viewport edge (edge-to-edge image, text inset to grid) — the one place the frame yields entirely to the work.

**Why (v1.0):** *balanced proportions · consistent alignment · composed, not populated* (Visual Direction §4–5). The pillar pair (M-2) and pillar sections (M-4) are laid on symmetric column spans so equal weight is structural, not merely visual.

## 2.4 Color

A near-monochrome, warm-neutral, gallery palette. Color carries **no** persuasive load; emphasis is achieved by tone, scale, and space.

| Token | Value | Role |
|---|---|---|
| Paper | `#F5F3EF` | Page background (warm plaster white) |
| Surface | `#FBFAF8` | Lifted card/section surface |
| Ink | `#1A1917` | Primary text, wordmark |
| Ink-60 | `#6B6862` | Secondary text, metadata, captions |
| Hairline | `#E3DFD7` | Dividers, card edges, 1px rules |
| Signal (clay) | `#9C6B4F` | **Restricted** — link underline, focus ring, hover accent only |

**Architectural neutrality.** The base experience is Ink on Paper. The single low-chroma accent (**Signal**, a muted clay) appears *only* on interactive affordance — a link underline on hover, a focus ring, a small directional caret — never as fill, never as decoration, never on more than a hairline of area at once.

**Emphasis strategy (no color used for emphasis).** Attention is directed by, in order: **scale** (Display XL vs Heading), **imagery presence** (a photograph always outweighs text), **whitespace isolation** (M-6), and **tonal contrast** (Ink vs Ink-60). This keeps the palette out of the persuasion business entirely.

**Why (v1.0):** *evidence over claims · not sales-driven · the interface stays quiet · premium through quality, not luxury signals* (Visual Direction §2, §9). A neutral field lets project imagery — the protagonist — supply all the color.

## 2.5 Imagery

Imagery is the primary visual language; the interface frames it (Visual Direction §7).

- **Photography style.** Architectural, atmospheric, natural light, material-forward — atmosphere · materiality · precision · scale · context. Calm, wide tonal range, no heavy filters or trendy grading. Reality-Capture imagery may read as scan/point-cloud aesthetics, presented with the same calm.
- **Cropping.** Generous; respect the work; let negative space into the frame. Never a busy, edge-to-edge-cluttered crop. The image may contain its own whitespace.
- **Aspect ratios (a small, consistent set — consistency is calm).** `16:9` hero (M-1) · `4:5` portrait and `3:2` landscape for Work Preview Cards (one ratio per row, mixed only deliberately) · `3:2` for pillar gateways (M-2) and curated views (M-5) · `1:1` reserved for tight grids. A limited ratio set makes the page feel authored.
- **Composition.** Image as protagonist; captions minimal and set in Detail/Label type; no text overlaid *on* imagery except the M-1 hero (where the identity line sits in a quiet inset, not stamped across the photo).
- **Treatment.** Square corners (0px radius) — architectural precision; no drop shadows; at most a 1px Hairline edge where an image meets Paper. A subtle load-in (below). No borders-as-decoration.

**Why (v1.0):** "when in doubt, the interface yields to the image"; *carefully curated imagery · minimal visual noise.* Square corners and shadow-free framing keep the interface from performing.

## 2.6 Motion

**Subtle · slow · meaningful — never decorative.**

- **Timing.** Durations **400–700ms**; easing `cubic-bezier(0.2, 0, 0, 1)` (a calm settle). Nothing snappy, nothing bouncy.
- **Entrance (scroll-in).** On first enter, a module fades from 0→1 with an **8–16px** upward rise; content within a module staggers by ~60ms. Each element animates **once**. No re-trigger on scroll-up.
- **Hover — imagery.** Image scales **1.0 → 1.02** over **600ms** with a simultaneous caption/underline reveal. No tilt, no glow.
- **Hover — links & CTAs.** Text-link underline draws in from left in Signal over 240ms; button (CTA) shifts background Ink→Ink-90 and a caret nudges 4px. Calm, predictable feedback.
- **Header.** On scroll past the hero, the transparent header settles to Paper with a Hairline base over 300ms — a single, quiet state change (never a reflow, never a shrink that would count as "shape-shift").
- **Reduced motion.** `prefers-reduced-motion: reduce` disables all rises/scales; content simply appears. Focus states remain.

**Why (v1.0):** "motion clarifies; it never entertains… feedback reassures; it never distracts… the interface disappears behind the content" (Visual Direction §6). Slow, single-run motion reinforces *calm exploration over conversion pressure*.

## 2.7 Component styling tokens (styling only — no new components)

Every component below is **from the Component Inventory**; only its *appearance* is defined here.

- **CTA Group.** Primary = filled Ink button, Paper label, Label type, 16×28px padding, 0px radius, caret; used **once** on the page (M-6). Secondary/navigational = ghost text-link with Signal underline-on-hover (M-2 gateways, M-4 and M-5 module CTAs). This visual split is how *conversion* stays distinct from *navigation*.
- **Highlight Card (view variant, M-2 gateway).** Full-bleed 3:2 image, pillar name in Display L inset bottom-left over a subtle bottom scrim, Label eyebrow "Capability". Entire card is one target.
- **Work Preview Card.** Image (4:5 or 3:2), then Label metadata line (Entry Type · Year) and title in Subhead. No description on the homepage (progressive disclosure). Identical structure wherever it appears.
- **Curated View Card.** 3:2 image, Heading title ("Competitions" / "Professional Experience"), one Detail line of framing. Reads as an editorial teaser, not a category tile.
- **Section Introduction / Section Header.** Label eyebrow + Heading title + optional single Lead/Body line. One idea only.
- **Statistic.** Value in Subhead (serif), label in Label type beneath; set in a quiet evenly-weighted row, never a loud metric bar.
- **Global Header / Footer / Navigation Group.** Detail/Label type, Hairline separators, Ink on Paper. Utility register — deliberately the quietest type on the page.

---

# PASS 3 — Module-by-module high-fidelity specification

*Refinement of execution only. For each module: visual composition · spacing rhythm · typography hierarchy · imagery treatment · layout · alignment · emphasis · interaction · hover · responsive — each tied back to v1.0. No responsibility, order, component, or destination changes.*

## Global Header *(persistent frame — never an M-module, never shape-shifts)*

**Visual composition.** A thin, quiet bar: wordmark left; nav group right (Despre · Servicii · Proiecte · Contact); EN language toggle at the far right, separated by a Hairline. Over the M-1 hero it is transparent with Ink or Paper text chosen for contrast; after scrolling past the hero it settles to a Paper fill with a 1px Hairline base.
**Spacing rhythm.** 72px tall desktop / 56px mobile; outer margins match the grid; nav items spaced 32px.
**Typography hierarchy.** Wordmark in Detail-caps or a small serif mark; nav items in Label type (12px, tracked, uppercase). The header is intentionally the quietest type on the page.
**Imagery treatment.** None — the header never carries imagery; it must not compete with the hero.
**Layout / alignment.** Space-between; wordmark and nav baseline-aligned; EN pinned right.
**Emphasis.** Minimal by design — a supporting element, not a concentration point.
**Interaction.** "Servicii" opens a pillar-grouped dropdown (Navigation Group) — Architecture & Design / Reality Capture columns; the only header disclosure. Current section gets a static Signal underline.
**Hover.** Nav item underline draws in (Signal, 240ms); dropdown fades/rises 200ms.
**Responsive.** Below 768px, nav collapses to a menu affordance (right); the dropdown becomes an in-menu group; wordmark stays left; EN inside the menu. The item set and order never change.
**Why (v1.0):** realizes the **Global Header** component exactly — Layer-2 task-first nav, *pillar hubs are not items here*, additive to the homepage narrative, and the scroll settle is a single state change that honors "never shape-shifts" (NAV_DECISION_RECORD).

## M-1 · Identity *(Stage A — establish one practice)*

**Visual composition.** A full-bleed 16:9 identity hero image carries the opening; the identity statement (Display XL, serif) sits in a quiet lower-left inset with the positioning line (Lead) beneath it, and a single quiet text-link to About. One image, one statement — one practice.
**Spacing rhythm.** Hero fills the first viewport (≈ 88vh, not forced 100vh); statement inset padded 80px from edges desktop; 160px of Paper below before M-2.
**Typography hierarchy.** Display XL identity statement is the single largest type on the entire page (the #1 concentration point); Lead positioning line second; About link in Label type, tertiary.
**Imagery treatment.** Atmospheric, material-forward architectural photograph; generous crop; a subtle bottom scrim only enough to keep the inset legible — never a heavy overlay.
**Layout / alignment.** Text inset to the grid (left, lower third); image to the viewport edge — the one place the frame fully yields to the work.
**Emphasis.** The strongest moment on the page; nothing else in the first viewport competes.
**Interaction.** Quiet: the hero holds; a faint downward affordance may indicate more below.
**Hover.** About link underline (Signal). The hero image does not zoom (it is the setting, not a target).
**Responsive.** Hero and identity line stack into one opening unit; statement scales via `clamp()` to ~40px; identity remains the first thing understood.
**Why (v1.0):** realizes the **Hero (identity variant)** + Rich Text + quiet About link; establishes *one coherent practice before any split* (J1, D9). Making the identity the largest type and the About link tertiary keeps this an *orientation*, not a pitch. The single hero embodies the Central Design Principle at first contact.

## M-2 · Pillar branch *(Stage B — early self-segmentation, co-equal)*

**Visual composition.** A light Section Introduction ("Two capabilities, one practice"), then **two gateways side by side at identical size** — each a Highlight Card (view variant): full-bleed 3:2 pillar image, the pillar name (Display L) inset bottom-left, a "Capability" Label eyebrow. Architecture & Design and Reality Capture read as a balanced pair.
**Spacing rhythm.** Intro 48px above the pair; the two cards share one row with a 24px gutter; equal internal padding.
**Typography hierarchy.** Pillar names in Display L (equal rank to each other); eyebrow Labels above; intro is a single Subhead/Lead line. No third pillar-level type.
**Imagery treatment.** One representative image per pillar, matched in crop energy and tonal weight so neither looks more important; RC image calm, not gimmicky.
**Layout / alignment.** Two equal 6-column spans (desktop); centers aligned; identical aspect ratios. Symmetry is the guarantee of co-equality.
**Emphasis.** The #2 concentration point — the choice. Both halves weighted identically; neither leads.
**Interaction.** Whole card is the target; the pillar **name is the doorway** to the Pillar Hub (module CTA → Hub, fixed).
**Hover.** Image scales 1.02 (600ms); pillar name gains a Signal underline; a caret appears. Both cards behave identically.
**Responsive.** The pair stacks vertically; **stacking must not imply primacy** — identical size, identical treatment, and the vertical order is arbitrary (a subtle "1 of 2 / 2 of 2" is avoided; equal Labels only). 
**Why (v1.0):** realizes **Section Introduction + Highlight Card (view) ×2 → Pillar Hubs**; *two co-equal capabilities, choose a direction now* (D3, D8, M4). Identical size/type/imagery is the design mechanism that enforces *no structural primacy*. The dedicated "Pillar Entry" component remains a deferred inventory question — this design expresses the gateway via the existing Highlight Card, as the wireframe specifies.

## M-3 · Practice-credibility *(Stage C — pillar-neutral trust)*

**Visual composition.** A calm, prose-led band on Surface: a Section Header ("The practice"), a short Rich Text paragraph on experience and the EU-funded professional equipment, an optional evenly-weighted row of 2–3 Statistics, and a quiet About link. Pillar-neutral throughout.
**Spacing rhythm.** Prose column max ~7 cols; 64px between prose and any statistic row; the band separated 160px from M-2 and M-4.
**Typography hierarchy.** Section Header (Heading); Body prose; Statistic values in serif Subhead with Label captions; About link in Label. Prose leads, numbers support.
**Imagery treatment.** None, or a single restrained supporting image — this beat is about quiet authority, not spectacle; keeping it near-imageless also prevents any pillar's imagery from entering a neutral zone.
**Layout / alignment.** Left-aligned prose; statistics in an even, low-contrast row (never a loud KPI bar).
**Emphasis.** Deliberately a *supporting* module — it reinforces the surrounding concentration points, it is not one itself.
**Interaction.** Static; About link only.
**Hover.** About link underline (Signal).
**Responsive.** Prose then statistics stack; trust still reads before the per-pillar sections at any width.
**Why (v1.0):** realizes **Section Header + Rich Text + optional Statistic ×n + About link**; *pillar-neutral credibility early* (J3) without forcing pillar content on the scroller. Evenly-weighted, quiet statistics enact *evidence over claims*. Its restraint is what keeps the two pillars co-equal — credibility is shared, not attributed to one side.

## M-4 · Pillar section ×2 *(Stage D — per-pillar preview & proof)*

**Visual composition.** Two self-contained editorial units of **comparable weight**, one per pillar, each: a Section Introduction (capability framing line), a curated set of **Work Preview Cards**, and a single CTA Group continuing to that Pillar Hub. The work is the protagonist here — generous whitespace, imagery-forward.
**Spacing rhythm.** Framing line 48px above the card set; cards on a 3-up (desktop) row with 24px gutters and 40px row gaps; module CTA 48px below the cards; 160px between the two pillar sections.
**Typography hierarchy.** Section title (Heading, equal rank across both pillars); framing line (Subhead/Lead); card titles (Subhead) with Label metadata; module CTA in Label. No pillar's title outranks the other's.
**Imagery treatment.** Curated Work Preview imagery in a consistent ratio per pillar row; each pillar chooses 3–5 Homepage-Highlight entries; RC previews may use a scan-appropriate still, held to the same calm.
**Layout / alignment.** Symmetric column structure for both sections (same card count band, same grid spans) so the two carry equal weight; the editorial *order* of the two is the designer's, but neither is visually primary.
**Emphasis.** The #3 concentration point — the work previews. Framing and CTA support the imagery.
**Interaction.** **Module CTA → Pillar Hub is fixed.** Individual Work Preview Card link behaviour (to a Work Entry vs to the hub) is a **deferred wireframe-phase decision** and is intentionally left open here.
**Hover.** Card image scales 1.02; title gains Signal underline; module CTA caret nudges. Both sections identical.
**Responsive.** Cards reflow 3→2→1; each section preserves framing → work → continue; the two sections stay comparably weighted.
**Why (v1.0):** realizes **Section Introduction + Work Preview Card ×n + CTA Group → Hub**; gives *enough to decide to continue into the hub — not a hub summary* (M-4 constraint), protecting the homepage from accumulating hub-level content. Equal weighting sustains D3; the fixed module-CTA sustains the C1 continuation and the highlight-navigation rule.

## M-5 · Curated-view highlight *(Stage E — canonical curated views)*

**Visual composition.** Two Curated View Cards of comparable weight — **Competitions** and **Professional Experience** — presented as editorial teasers (image, Heading title, one framing Detail line), not a category grid.
**Spacing rhythm.** Two-up row, 24px gutter (or two generous stacked bands); 160px isolation from M-4 and M-6.
**Typography hierarchy.** Curated-view titles in Heading; framing line in Detail; both cards equal.
**Imagery treatment.** One evocative image per view; Professional Experience reads as authored history, Competitions as ideas/ambition — matched in tonal calm.
**Layout / alignment.** Two equal spans; aligned baselines.
**Emphasis.** The #4 concentration point — exploration; lighter than M-4's work but a clear editorial beat.
**Interaction.** **Module CTA → the Curated View** (then Work Entry). No shortcut straight to entries; individual-item behaviour deferred.
**Hover.** Image 1.02 scale; title underline (Signal).
**Responsive.** The two cards stack; each remains a distinct destination.
**Why (v1.0):** realizes **Curated View Card ×2 → Curated Views**; exposes the two canonical curated narratives that *cut across the archive* as real destinations (M5), preserving Homepage Highlight → Curated View → Work Entry. Teaser treatment (not a grid) keeps it from becoming a second archive.

## M-6 · Contact invitation *(Stage F — the single primary action)*

**Visual composition.** A calm, singular invitation centered in generous Paper: a Section Introduction / Rich Text line ("If a project is taking shape, let's talk."), then **one** primary CTA Group → Contact. Nothing else shares this space.
**Spacing rhythm.** The most isolated module — **200px** above it desktop; the invitation and its single button vertically centered with wide margins.
**Typography hierarchy.** Invitation in Heading (serif) or Lead; the single primary button in Label. One action, unmistakable.
**Imagery treatment.** None — imagery here would compete with the one action; the calm empty field *is* the treatment.
**Layout / alignment.** Centered, narrow measure (max ~6 cols); a composed close.
**Emphasis.** The #5 concentration point — and the page's **only** primary conversion action, deliberately last, after understanding has accumulated.
**Interaction.** Single primary CTA → Contact (which carries the service-aware form + prefills — no inline form here).
**Hover.** Button background Ink→Ink-90; caret nudges 4px. Calm, no pulse.
**Responsive.** Invitation and single action stack; remains the last and only primary conversion action.
**Why (v1.0):** realizes **Section Introduction/Rich Text + one primary CTA → Contact**; provides the acquisition *path* without hard-selling (J6). Isolation and a single action enact *context before action* and *calm exploration over conversion pressure*; keeping conversion visually distinct from the navigational continuations above preserves the wireframe's navigation/conversion split.

## M-7 · Footer *(Stage G — orientation & compliance)*

**Visual composition.** A quiet closing band on a slightly deeper Paper: a Navigation Group echoing global nav, social links, the **EU-funding acknowledgment**, and the language toggle. Grouped, legible, unemphasized.
**Spacing rhythm.** 64–96px internal padding; groups on the 12-col grid; a Hairline top edge.
**Typography hierarchy.** Detail and Label type throughout — the footer never rises above utility register; EU-funding acknowledgment set quietly in Detail, never as a promoted "page."
**Imagery treatment.** EU-funding logo lockup at compliant size only; no other imagery.
**Layout / alignment.** Multi-column groups (nav · social · legal · funding) that stack on mobile.
**Emphasis.** Minimal — a supporting close.
**Interaction.** Standard links; language toggle mirrors the header's EN.
**Hover.** Link underline (Signal).
**Responsive.** Footer groups stack; content unchanged.
**Why (v1.0):** realizes the **Footer** component — persistent orientation, compliance, social, and the EU-funding acknowledgment living *here* (Step 7), never as a dedicated page. Utility-register type keeps it from competing with the work above.

---

# Cross-cutting realizations

**Visual emphasis hierarchy — how attention is engineered.** The five concentration points are separated *tonally and by scale*, never by color: Identity wins by being the only Display XL over full-bleed imagery; Capability choice wins by symmetric paired imagery; Work previews win by imagery density; Curated exploration is a lighter imagery beat; Contact wins by isolation (200px of Paper and a single filled button). M-3, header, and footer are held in body/label type and near-imageless so they visibly *support*. This is the wireframe's declared hierarchy, realized without a single persuasive color.

**Co-equality safeguards (D3), collected.** Equal card size and identical treatment in M-2; single-rank section titles across both pillars in M-4; symmetric grid spans; stacking orders that carry no "1st/2nd" signal; a pillar-neutral, near-imageless M-3. Any future visual tweak that makes one pillar heavier is an architecture violation, not a style choice.

**Accessibility.** Ink `#1A1917` on Paper `#F5F3EF` ≈ 14:1 contrast (far above AA); Ink-60 reserved for non-essential text and still ≥ AA at Body size. Focus rings use Signal at 2px with a Paper offset on every interactive element. Tap targets ≥ 44px. `prefers-reduced-motion` honored. Semantic landmarks: one `<header>`, `<main>` with sectioned modules, one `<footer>`; a visible skip link. Nav order and labels match Layer-2 exactly for screen readers.

**Responsive summary.** Desktop 12-col / tablet 8-col / mobile 4-col; section rhythm 160→96→72px; hero and identity collapse to one unit; pillar pair and pillar sections stack without primacy; the header collapses to a menu preserving item set and order; every module's *responsibility and order survive* at every width (WG §6).

---

# Verification — against the commissioned evaluation checklist

- **Every Homepage module exists** — Global Header + M-1…M-7 all specified ✔.
- **No responsibilities changed** — each module realizes exactly its Page IA responsibility; none moved ✔.
- **No architecture changed** — no new sections, no merges/splits, no nav change, no new components, no destination change ✔.
- **Hierarchy preserved** — vertical order and the five concentration points reproduced from the wireframe ✔.
- **Central Design Principle respected** — full-bleed work imagery leads; the interface is neutral, quiet, shadow-free, square-cornered; color carries no load ✔.
- **Narrative density preserved** — one idea per module; 160px inter-module whitespace makes each understood before the next; no module accumulates responsibilities ✔.
- **Visual Emphasis Hierarchy implemented** — Identity → Capability → Work → Curated → Contact, by scale/imagery/isolation, not color ✔.
- **Editorial rhythm preserved** — Orientation → Practice → Capabilities → Evidence → Exploration → Action reads as one paced spread ✔.
- **Interaction remains calm** — 400–700ms settle easing, single-run entrances, 1.02 hovers, reduced-motion support ✔.
- **Nothing feels promotional** — one primary action, last; no urgency, no loud metrics, no persuasive color; statistics evenly weighted ✔.
- **The work remains the protagonist** — imagery is the largest visual material in M-1/M-2/M-4/M-5; the interface yields at the hero; type and color stay quiet throughout ✔.
- **Components only from the Inventory** — Hero · Rich Text · Highlight Card · Section Introduction · Section Header · Statistic · Work Preview Card · CTA Group · Curated View Card · Navigation Group · Global Header · Footer; styled, not invented ✔.
- **Two-level highlight navigation intact** — module CTAs → canonical destinations; individual-item behaviour left deferred, not resolved ✔.
- **Co-equal pillars** — no visual primacy anywhere ✔.

**Result:** a production-grade Homepage visual system that is fully faithful to Documentation v1.0 — visual excellence achieved through restraint, with zero architectural change.

---

# Figma build guide (implementation-ready)

**Pages:** `01 Cover` · `02 Foundations (Styles)` · `03 Components` · `04 Homepage — Desktop` · `05 Homepage — Tablet` · `06 Homepage — Mobile` · `07 Prototype`.

**Local styles / variables.** Create color variables (Paper, Surface, Ink, Ink-60, Hairline, Signal); text styles for every scale token (§2.1) with the two families; a spacing variable set (§2.2); an 8px baseline layout grid + the three column grids (§2.3); effect styles limited to the two hover/entrance transitions (§2.6). One shadow style: none.

**Components (build as Figma components with variants — mirror the Inventory, invent none):** Global Header (transparent / solid variants) · Footer · Navigation Group (horizontal / stacked) · Hero (identity) · Section Introduction · Section Header · Highlight Card (view) · Work Preview Card (4:5 / 3:2) · Curated View Card · Statistic · CTA Group (primary / navigational) · Rich Text. Use Auto Layout throughout so the section-rhythm spacing tokens are literal.

**Frames.** Desktop 1440 (1280 content), Tablet 834, Mobile 390. Assemble M-1…M-7 top-to-bottom at the section-rhythm gaps. Use placeholder architectural imagery at the specified ratios; mark curated selections as "Homepage Highlight" from the curation layer.

**Prototype.** Wire only the canonical destinations: header nav → (stub pages); M-2 gateways & M-4 module CTAs → Pillar Hub (stub); M-5 cards → Curated View (stub); M-6 → Contact (stub). Leave individual Work Preview Card targets unwired — a deliberate open decision, per v1.0.

**Handoff order (matches the design commission):** Homepage → Hub → Service → Archive → Work Entry → Contact.
