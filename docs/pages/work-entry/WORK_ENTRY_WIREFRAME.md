# Work Entry Wireframe — low-fidelity structural specification (canonical template)

**The canonical structural wireframe for a Work Entry** — the single modular template (universal base + optional type modules) from which every Entry Type is realized. It expresses the Work Entry Page IA **spatially** and nothing more. It introduces **no new IA, no new Page IA, no new components, and no new visual direction.**

**The Work Entry is where discovery becomes evaluation.** It is not merely a "proof page"; it gives the visitor enough honest evidence to **evaluate whether this project is relevant to their own situation.** Every module helps answer one central question: **"Is this project relevant evidence for my project?"**

Level: **Low-Fidelity Wireframe**. Status: **authoritative** (template for every Entry Type).

> **Governance note (Decision Log Batch 20, 2026-08-10):** Visual language is now governed by `VISUAL_DIRECTION_v2.0.md` (“measured reality”). Any reference to `VISUAL_DIRECTION.md` below is the **superseded** v1 direction (“architectural publication”); this document remains **structurally authoritative**.

Derived exclusively from: `WORK_ENTRY_PAGE_IA.md`, `PAGE_IA_INDEX.md`, `COMPONENT_INVENTORY.md`, `WIREFRAMING_GUIDELINES.md`, `VISUAL_DIRECTION.md`, `CONTENT_MODEL.md`.

**Inherits (applies, does not restate):** Central Design Principle · Narrative Density · Visual Emphasis Hierarchy · Spatial-Composition terminology · editorial pacing · responsive principles.

**Notation.** "Above / below / beside" describe reading order and relative emphasis, never pixel positions.

---

## Persistent frame (inherited)

- **Global Header** — persistent Layer-2 nav, unchanged. The Work Entry has the most diverse inbound of any page: the Archive, a Curated View, a Service (as proof), a Hub, another Work Entry, or search.
- **Footer** — the global footer.

---

## W-1 · Orientation & Core Facts *(Page IA Stage A) — situate & signal relevance*

**Responsibility realized:** identify the work and situate it via a flexible metadata component (common facts always shown; type-specific attributes when relevant).

**Components (Inventory):** Hero (work variant) · Metadata Strip (title + Pillar · Entry Type · Discipline · Sector · Year · Status) · Breadcrumb (parent pillar/archive — orientation).

**Spatial composition:** an image-led opening with the work already present; the Metadata Strip sits quietly as the first **relevance signal** (sector, type, scale, year), not a data dump. Interface quiet around the work.

**Reading intent:** the visitor knows *what this project is and its key facts* — the first cues for "is this like my situation?"

**Transition:** situated, the visitor turns to the work itself.

**Responsive intent:** hero and metadata stack into one opening unit; identity and key facts remain first.

---

## W-2 · Description & media *(Page IA Stage B) — the work as evidence*

**Responsibility realized:** present the project as evidence to see and assess.

**Components (Inventory):** Rich Text (description) · Gallery · Media Viewer (zoom; point-cloud variant for reality-capture).

**Spatial composition:** **this module is the evaluative and visual center of the page** — the work is the protagonist, generous whitespace, media given room to be examined closely. The description supports the media; the interface frames, never competes (Central Design Principle).

**Reading intent:** the visitor can *see and assess the work directly.*

**Transition:** having seen it, the visitor asks "whose work is this, and how was it produced?" → professional context.

**Responsive intent:** media and description stack; the work stays primary; zoom remains available.

---

## W-3 · Professional context & credits *(Page IA Stage C) — integrity of the evidence*

**Responsibility realized:** establish credibility through **transparency rather than ownership claims** — always present, regardless of Entry Type.

**Components (Inventory):** Section Header · Credits Block (Attribution · Employer · Role · scoped Authorship · Collaborators).

**Spatial composition:** a calm, honest crediting block; for studio work it foregrounds Employer + Role + scoped Authorship and links to Professional Experience. Never over-claims; distinct from any competition Team (which lives in W-4).

**Reading intent:** the visitor understands *the context in which the work was produced and the architect's exact contribution* — so the evidence can be trusted and weighed honestly.

**Transition:** context established, the visitor considers the type-specific substance.

**Responsive intent:** credits stack; remain legible and unambiguous.

---

## W-4 · Type-specific module *(Page IA Stage D) — the evidence unique to this Work type*

**Responsibility realized:** express the characteristics unique to this Entry Type (optional, toggled by type).

**Components (Inventory), composed per type:**
- **Competition:** Rich Text (brief) · Statistic (award/prize) · Rich Text (jury/team) · Gallery (boards).
- **Reality Capture:** Statistic ×n (accuracy/specs) · Rich Text (equipment/deliverables) · Media Viewer (point-cloud) · Gallery (before–after).
- **Design specifics:** largely carried by W-2 (drawings/plans); a minimal block only if needed.

**Spatial composition:** a focused block that adds the type's decisive evidence without repeating W-2; a cross-pillar/composite entry may enable **more than one** such module. Type-specific attributes may also surface in W-1's flexible metadata.

**Reading intent:** the visitor gains *the specific evidence this Work type carries* (a competition's outcome, a capture's accuracy).

**Transition:** with the full evidence in hand, the visitor asks "what does this let me hire?" → demonstrated service.

**Responsive intent:** the type block stacks; its evidence remains legible; media zoom preserved.

---

## W-5 · Demonstrated-service module *(Page IA Stage E) — from evidence to offering*

**Responsibility realized:** connect the evidence to the offering it demonstrates (the hire path).

**Components (Inventory):** Demonstrated Service Block (→ the Service page(s)).

**Spatial composition:** a quiet link from this evidence to the relevant service; **hidden entirely when the entry demonstrates no service** (personal/competition work) — no empty module.

**Reading intent:** the visitor understands *what service this project is relevant evidence for.*

**Transition:** the visitor may want more relevant work → related work.

**Responsive intent:** stacks; hidden state leaves no gap.

---

## W-6 · Related work module *(Page IA Stage E) — broaden the evaluation*

**Responsibility realized:** route to work that **broadens understanding** — not always the most similar, often the most contextualizing.

**Components (Inventory):** Related Work Strip (Work Preview Card ×n; cross-pillar-aware) · CTA Group ("see more" → filtered Work Archive).

**Spatial composition:** a curated strip of related entries, work-as-protagonist; items route to Work Entries, the strip's "see more" to the filtered archive.

**Reading intent:** the visitor knows *where to find more evidence relevant to their evaluation.*

**Transition:** into the onward affordances.

**Responsive intent:** the strip reflows/stacks; unchanged behaviour.

---

## W-7 · Onward module — Hub back-path + light contact *(Page IA Stage E)*

**Responsibility realized:** provide the F1 hub back-path and a **light, non-pitch** contact affordance.

**Components (Inventory):** CTA Group (Hub back-path) · CTA Group (light, secondary — contact).

**Spatial composition:** quiet navigational affordances; **no dominant conversion CTA** (the Work Entry is evidence, conversion-quiet by design, O2). Contact is available but understated.

**Reading intent:** the visitor knows *how to step back to the capability or reach out — without being sold to.*

**Transition:** into the persistent footer.

**Responsive intent:** affordances stack; remain light.

---

## Central idea — discovery becomes evaluation

The Work Entry sits at the **evaluation** step of the journey. Everything on the page serves one question: **"Is this project relevant evidence for my project?"** The page does not persuade or claim excellence (Integrity + independent-assessment principles) — it provides honest, contextualized evidence and lets the visitor reach their own conclusion. This is richer than "proof": the visitor is assessing *relevance to their own situation*, exactly as one would read a case study.

## Editorial rhythm

The Homepage introduces; the Hub expands; the Service resolves; the Archive lets discover; **the Work Entry lets evaluate.** It should feel: **focused on a single project · honest · evidence-rich · transparent · self-contained (independently assessable) — never a pitch.** A visitor can understand and judge this project **without first understanding the practice's services.**

## Reading progression

**Orientation & facts → the work → professional context → type-specific substance → relationships & continue**

Each stage supplies a distinct input to the evaluation:
- **Orientation & facts** (W-1) — *is this the kind of project I care about?* (sector/type/scale)
- **The work** (W-2) — *is the work itself good?* (direct assessment)
- **Professional context** (W-3) — *can I trust this evidence, and whose is it?* (integrity)
- **Type-specific substance** (W-4) — *what specific evidence does this type carry?*
- **Relationships & continue** (W-5/W-6/W-7) — *what does it let me hire, what else is relevant, how do I proceed?*

By the end, the visitor can answer the central question honestly — for or against.

## Integrity

The page must ensure the visitor **never leaves with a misleading impression** regarding authorship, responsibility, collaboration, or project scope. W-3 is always present; scoped Authorship prevents over-claiming (e.g. visualization-only, studio work).

## Cross-pillar / composite entries

A cross-pillar entry has a **single canonical page**, surfaces in both pillars' discovery, may enable **more than one W-4 module**, and cross-references its linked pair (e.g. survey + renovation) via W-6.

## Visual emphasis hierarchy (work-entry-specific application)

The Work Entry's dominant idea is **the evidence itself.** Concentration points:

1. **The work** (W-2 description & media) — the evaluative and visual center
2. **Relevance & integrity signals** (W-1 core facts + W-3 credits)
3. **Demonstrated service** (W-5) — relevance to a need

Everything else (W-4 type substance, W-6 related, W-7 onward, header, footer) supports the evaluation rather than competing with it.

## Narrative density
Follows the system-wide convention — one idea per module; split rather than compress. No work-entry-specific exception.

---

## Validation

- **Responsibilities preserved:** W-1…W-7 (base) + optional W-4 each realize exactly their Work Entry Page IA responsibility; none moved ✔.
- **Approved components only:** Hero · Metadata Strip · Breadcrumb · Rich Text · Gallery · Media Viewer · Section Header · Credits Block · Statistic · Demonstrated Service Block · Related Work Strip · Work Preview Card · CTA Group · Global Header · Footer ✔ (no components invented).
- **One responsibility per module** ✔.
- **Central idea (evaluation)** — every module serves "is this relevant evidence for my project?" ✔.
- **Modular base + optional type layer (M3)** — W-4 toggles by Entry Type; base unchanged ✔.
- **Credits always present; honest, scoped** (integrity) ✔.
- **W-5 hidden when no demonstrated service** (no empty module) ✔.
- **Cross-pillar:** single canonical page; may enable more than one W-4 ✔.
- **Independent assessment:** the project is understandable without first understanding services ✔.
- **No dominant conversion CTA** (evidence, conversion-quiet, O2); light contact + hub back-path only ✔.
- **Central Design Principle** — the work is the protagonist (W-2 the center); interface frames ✔.
- **Visual emphasis hierarchy** declared (the evidence is the center) ✔.
- **Responsive intent preserved** ✔.
- **No architectural decisions introduced** ✔.

**Result:** the canonical Work Entry template — the moment where discovery becomes evaluation, giving the visitor honest, contextualized evidence to judge a project's relevance to their own situation, on one modular blueprint for every Entry Type.
