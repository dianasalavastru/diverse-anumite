# Homepage Wireframe — low-fidelity structural specification

**The first realization of the completed architecture.** This is a *structural* wireframe — it expresses the Homepage Page IA **spatially** and nothing more. It introduces **no new IA, no new Page IA, no new components, and no new visual direction.**

Level: **Low-Fidelity Wireframe**. Status: **authoritative**.

Derived exclusively from: `HOMEPAGE_PAGE_IA.md`, `PAGE_IA_INDEX.md`, `INFORMATION_ARCHITECTURE.md`, `CONTENT_MODEL.md`, `NAV_DECISION_RECORD.md`, `WIREFRAME_PRINCIPLES.md`, `COMPONENT_INVENTORY.md`, `WIREFRAMING_GUIDELINES.md`, `VISUAL_DIRECTION.md`.

**This page inherits the system-wide conventions** (narrative density, visual emphasis hierarchy, spatial-composition terminology) from `WIREFRAMING_GUIDELINES.md` and the Central Design Principle from `VISUAL_DIRECTION.md`; it does not redefine them — it only applies them.

**Defines:** module order, spatial composition, grouping, hierarchy, reading flow, transitions, responsive intent. **Does not define:** colors, typography, spacing values, animation, styling, or interaction beyond architectural intent.

**Notation.** "Above / below / beside" describe *reading order and relative emphasis*, never pixel positions.

---

## Persistent frame (inherited, not an M-module)

- **Global Header** — the persistent Layer-2 nav (Despre · Servicii · Proiecte · Contact · EN), present at the top of every page and unchanged on the homepage (never shape-shifts). It frames the page; the narrative modules below are additive.
- **Footer** — realized by module **M-7** (below).

---

## M-1 · Identity module *(Page IA Stage A — establish one practice)*

**Responsibility realized:** establish that this is *one* coherent practice before any split (J1, D9).

**Components (Inventory):** Hero (identity variant) · Rich Text (a brief identity/positioning line) · a light text link to About.

**Spatial composition:** the Hero is the dominant element of the opening — one identity, one image-led statement, with the work/imagery carrying the weight and the interface quiet around it. The identity line sits with the Hero as a single orientation unit. The About link is a quiet secondary affordance, never an emphasized action.

**Reading intent:** the visitor leaves understanding *this is one architect / one coherent practice.*

**Transition:** identity established, the page can now present *what* the practice does — hands into the dual-capability branch.

**Responsive intent:** the Hero and identity line stack into a single opening unit on narrow screens; the identity remains the first thing understood.

---

## M-2 · Pillar branch module *(Page IA Stage B — early self-segmentation)*

**Responsibility realized:** present the two capabilities as **co-equal entry points** and let the visitor choose a direction early (D3, D8, M4).

**Components (Inventory):** Section Introduction (frames "two capabilities") · Highlight Card — *pillar-gateway usage, "view" variant* ×2 (Architecture & Design; Reality Capture), each carrying representative media + the pillar name and continuing to its Pillar Hub (name-as-doorway pattern).

> **Component note (escalation, not invention):** the two pillar gateways are expressed with the existing Highlight Card ("view"). A dedicated *Pillar Entry* component, if desired, is a Component-Inventory decision to escalate — not invented here.

**Spatial composition:** the two gateways are presented at **equal visual weight** — neither larger, first, nor emphasized over the other (no structural primacy). The Section Introduction sits above them as a light frame; the two read as a balanced pair.

**Reading intent:** the visitor leaves understanding *there are two co-equal capabilities, and I can choose a direction now.*

**Transition:** a committed visitor branches to a Pillar Hub; an undecided visitor continues down the unified narrative.

**Responsive intent:** the pair may stack; stacking must **not** imply primacy — both remain equal in weight and the order carries no hierarchy.

---

## M-3 · Practice-credibility module *(Page IA Stage C — pillar-neutral trust)*

**Responsibility realized:** establish credibility early, **pillar-neutral**, without forcing pillar content (J3).

**Components (Inventory):** Section Header · Rich Text (practice-level trust: experience, the EU-funded professional equipment) · Statistic ×n (optional) · a light text link to About.

**Spatial composition:** a calm, prose-led band. Any Statistics are supporting, evenly weighted, never a loud metric row — evidence over claims. The About link remains a quiet secondary affordance.

**Reading intent:** the visitor leaves understanding *why this practice is credible*, in pillar-neutral terms.

**Transition:** trust established, the page moves into per-pillar proof.

**Responsive intent:** prose and any statistics stack; the trust reads before the per-pillar sections regardless of width.

---

## M-4 · Pillar section module ×2 *(Page IA Stage D — per-pillar editorial preview & proof)*

**Responsibility realized:** give enough of each capability's work to *decide to continue into its Hub* — **not** to summarize the Hub (M-4 constraint).

**Components (Inventory), per section:** Section Introduction (capability framing) · Work Preview Card ×n (curated pillar work) · CTA Group (module CTA → the Pillar Hub — the C1 continuation).

**Spatial composition:** each pillar section is a self-contained editorial unit — a framing line, a curated set of Work Preview Cards (the work as protagonist, generous whitespace), and a single continuation to the Hub. The two sections carry **comparable weight** (no primacy); their editorial order is the designer's. Individual Work Preview Cards may link to Work Entries; the section's CTA is the canonical continuation to the Hub.

**Reading intent:** the visitor leaves each section with *enough understanding and curiosity to continue into that Pillar Hub.*

**Transition:** capabilities previewed, the page surfaces the nameable curated bodies of work.

**Responsive intent:** cards reflow/stack within each section; the section keeps its framing-then-work-then-continue order; the two sections remain comparably weighted.

---

## M-5 · Curated-view highlight module *(Page IA Stage E — canonical curated views)*

**Responsibility realized:** expose **Competitions** and **Professional Experience** as real destinations that cut across the archive (M5).

**Components (Inventory):** Curated View Card ×2 (Competitions; Professional Experience), each continuing to its Curated View.

**Spatial composition:** two curated-view entries of comparable weight, presented as editorial teasers, not a category grid. Each card's canonical destination is its Curated View (Homepage Highlight → Curated View → Work Entry); no shortcut straight to entries.

**Reading intent:** the visitor leaves understanding *there are notable, nameable bodies of work to explore.*

**Transition:** exploration surfaced, the page offers the single path to begin a conversation.

**Responsive intent:** the two cards stack; each remains a distinct destination.

---

## M-6 · Contact-invitation module *(Page IA Stage F — a path to Contact)*

**Responsibility realized:** provide a clear path to start a conversation **without hard-selling** (J6). This carries the homepage's **single primary (conversion) action.**

**Components (Inventory):** Section Introduction / Rich Text (a quiet invitation) · CTA Group (primary action → Contact).

**Spatial composition:** a calm, singular invitation — one primary action, no competing conversion prompts. It appears **only here, at the end**, after understanding has accumulated. The pillar-hub and curated-view continuations above are *navigation*, kept distinct from this *conversion* action.

**Reading intent:** the visitor leaves understanding *how to start a conversation.*

**Transition:** into the persistent footer.

**Responsive intent:** the invitation and its single action stack; it remains the last and only primary conversion action.

---

## M-7 · Footer module *(Page IA Stage G — persistent orientation & compliance)*

**Responsibility realized:** persistent orientation, compliance, social (M-7).

**Components (Inventory):** Footer (global) — nav echo (Navigation Group), social links, EU-funding acknowledgment, language.

**Spatial composition:** a quiet closing band; the EU-funding acknowledgment lives here (Step 7), never emphasized as a page. Navigation grouped and legible.

**Reading intent:** the visitor understands *how to navigate anywhere, and that the practice is legitimate.*

**Transition:** end of page; lateral movement via global nav.

**Responsive intent:** footer groups stack; content unchanged.

---

## Overall page composition

The homepage reads as one continuous editorial progression, mapping directly to the responsibility arc:

**Orientation → Practice → Capabilities → Evidence → Exploration → Action**
- **Orientation:** Global Header + M-1 opening.
- **Practice:** M-1 identity.
- **Capabilities:** M-2 branch (+ M-3 credibility supports it, pillar-neutral).
- **Evidence:** M-4 per-pillar preview & proof.
- **Exploration:** M-5 curated views.
- **Action:** M-6 contact invitation.
- (M-7 footer: persistent close.)

**Rhythm reinforces *understanding before persuasion*:** generous whitespace separates modules so each is understood before the next; the work is the protagonist throughout (the Central Design Principle); the interface stays quiet; and the **only** primary conversion action appears **last**. The two pillars are held at equal weight from the branch onward, so neither reads as primary.

## Narrative density
Follows the system-wide convention (`WIREFRAMING_GUIDELINES.md` §7). No homepage-specific exception.

## Visual emphasis hierarchy (homepage-specific application)
Applying the system-wide convention (`WIREFRAMING_GUIDELINES.md` §8), the Homepage's concentration points are:

1. **Identity** (M-1)
2. **Capability choice** (M-2)
3. **Work previews** (M-4)
4. **Curated exploration** (M-5)
5. **Contact invitation** (M-6)

Everything else (M-3 credibility, the Global Header, M-7 footer, and all supporting components) reinforces these moments rather than competing with them.

---

## Validation (against Wireframing Guidelines §5 + Wireframe Principles)

- **Every Page IA module present:** M-1…M-7 ✔ (plus the inherited Global Header).
- **Responsibilities preserved:** each module realizes exactly its Page IA responsibility; none moved ✔.
- **Components from Inventory only:** Hero · Rich Text · Highlight Card · Section Introduction · Section Header · Statistic · Work Preview Card · CTA Group · Curated View Card · Footer · Navigation Group ✔ (Pillar-gateway usage flagged for escalation, not invented).
- **No duplicated content:** previews reference canonical destinations; nothing repeated ✔.
- **Canonical destinations intact:** branch/pillar CTAs → Hubs; curated cards → Curated Views; contact → Contact ✔.
- **One primary action:** a single primary *conversion* action (Contact, M-6); pillar/curated hand-offs are navigation, kept distinct ✔.
- **Reading flow matches Principles:** Orientation → Understanding → Evidence → Decision → Action, uninterrupted ✔.
- **Narrative density & visual emphasis hierarchy:** inherited conventions respected; homepage concentration points declared ✔.
- **Visual Direction reflected without styling:** calm, editorial, evidence-first, work-as-protagonist, quiet interface — through hierarchy and restraint, no color/type/spacing introduced ✔.
- **Reconstructability:** another designer could rebuild this Homepage in a layout tool without making any architectural decision ✔.

## Note (single escalation)
The only open item is whether to add a dedicated **Pillar Entry** component to the Component Inventory for M-2 (currently expressed via Highlight Card). Inventory-level choice, not an architecture change; does not block wireframing.
