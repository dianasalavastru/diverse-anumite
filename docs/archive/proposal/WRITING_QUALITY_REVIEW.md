# Technical Writing Quality Review — Authoritative Documents

**Lens:** readability, clarity, repetition, verbosity, ambiguity, examples, discoverability, cognitive load, consistency. **Architecture, governance, and ownership are out of scope** — no recommendation here changes a decision, only how it reads.
**Method:** every authoritative document was read in full, except the Hub / Service / Contact *wireframes*, which follow the identical enforced template confirmed in the Homepage, Work Entry, and Work Archive wireframes.
**One-line verdict:** *The corpus is accurate and consistent but heavily over-written. The dominant problem is not clarity of any single sentence — it is that the same information is stated three to four times per page, wrapped in insider codes (F1/M3/D3/J6) a new reader cannot decode. Fixing four cross-cutting patterns would cut reading time roughly in half without touching a single decision.*

---

## Part A — "Understandable in one reading?" (per document)

| Document | One reading? | Dominant writing issue |
|---|---|---|
| `PROJECT_CONTEXT.md` | **Yes** | Clean, plain, jargon-free. The model the others should imitate. |
| `CONTENT_MODEL.md` | **Yes, with effort** | Excellent structure; the 11-row axis table + the Attribution/Role/Authorship split are dense and need an inline example (currently only in a separate doc). |
| `INFORMATION_ARCHITECTURE.md` | **Partly** | Long and code-heavy (F1/F2/M1–M3/Steps). Sitemap is great; Steps 5–6 are a wall of parenthetical scope-notes. |
| `NAV_DECISION_RECORD.md` | **Yes** | Clear ADR. §6 resolutions would read better as a table. |
| `PAGE_IA_INDEX.md` | **Yes** | Among the clearest docs; but it originates the "system coherence" litany that then repeats across ~5 other docs. |
| `HOMEPAGE_PAGE_IA.md` | **Partly** | Every module described twice (once as a "Stage," once as an "M-module"); boundaries stated ~4×; codes unexpanded. |
| `HUB_PAGE_IA.md` | **Partly** | Same template repetition; "does NOT do" restated in §1, §5, pass/fail, and canonical-intent split. |
| `SERVICE_PAGE_IA.md` | **Partly** | Same; the F1/F5/Step 6 codes assume prior reading. |
| `WORK_ARCHIVE_PAGE_IA.md` | **Partly** | Same; adds a second "system coherence" litany and an "evolution rule" that restate earlier points. |
| `WORK_ENTRY_PAGE_IA.md` | **Partly (hardest of the six)** | Densest: modular base + optional W-4, out-of-sequence numbering, most codes (M2/M3/O2/P10/F1). |
| `CONTACT_PAGE_IA.md` | **Closer to Yes** | Appropriately the simplest, but *still* states its boundary 4× and repeats the coherence litany. |
| `WIREFRAME_PRINCIPLES.md` | **Yes** | Clean principle list. Conceptually overlaps the Guidelines (a reader reads both to learn one thing). |
| `COMPONENT_INVENTORY.md` | **Yes (as reference)** | Consistent per-component template. Not meant to be read cover-to-cover, and shouldn't be — that's correct. |
| `WIREFRAMING_GUIDELINES.md` | **Yes** | Good methodology; checklists are appropriate here. Overlaps Wireframe Principles. |
| `VISUAL_DIRECTION_v2.0.md` | **No** | The hardest read in the corpus: manifesto tone, a "why" after every clause, and the same rules stated in §2, again in §12, again in the acceptance checklist, again in "things we never do." |
| `HOMEPAGE_WIREFRAME.md` | **Partly** | Re-narrates its Page IA module-by-module, then a long ✔ self-validation checklist that re-asserts the body. |
| `WORK_ENTRY_WIREFRAME.md` | **Partly** | Same; plus repeats the "introduces/expands/resolves/discovers/evaluates" litany yet again. |
| `WORK_ARCHIVE_WIREFRAME.md` | **Partly** | Same pattern; validation checklist ~20 lines restating the doc. |
| `PILLAR_HUB / SERVICE / CONTACT_WIREFRAME.md` | **Partly** (by template) | Same structure and same issues as the wireframes above. |
| `DECISIONS_LOG.md` | **No (as onboarding)** | Dense batch shorthand, cryptic codes, no plain-language "where are we." Fine as an audit trail, unreadable cold. |
| `DOCUMENTATION_RELEASE_v1.0.md` | **Yes** | Formal but clear. Slightly ceremonial. |

**Pattern:** the foundation, model, nav, principles, and inventory read well. The **six Page IA docs, the six wireframes, the visual direction, and the decision log** — the documents a builder actually opens most — are where reading cost concentrates.

---

## Part B — The four cross-cutting patterns (fix these first; they touch every heavy doc)

**1 · The same module is documented three to four times.** For each page: the Page IA describes each module once in "information flow" (Stage A–G) and *again* in "module inventory" (M-/H-/S-…); then the wireframe describes the *same* modules again ("Responsibility realized / Spatial composition / Reading intent"); then the wireframe's validation checklist asserts them a fourth time. A builder reading Homepage material meets "M-2, the pillar branch" four times in slightly different words.
→ **Fix:** in each Page IA, **merge "information flow" into "module inventory"** — one section, one description per module (keep the stage label as a tag). **Delete the wireframe validation checklists** (they are author self-QA, not reader information) or reduce to a one-line "conforms to Page IA §3." Est. **30–40% length cut** on twelve documents, zero content lost.

**2 · Insider codes with no legend.** `F1 F2 F4 F5 · M1–M5 · C1 C2 · D3 D8 D9 · J1–J6 · O2 · P10 · R1–R6 · Step 5/6/7`. These are meaningful only after reading the reviews and the decision log. They appear inside almost every sentence of the Page IA/wireframe layer ("per F1," "the F5 empty-state," "D3 no structural primacy," "M3 base + optional modules").
→ **Fix (highest single comprehension win):** either **expand on first use** ("the co-equal-pillars rule (D3)") or add a **one-page legend** mapping every code to a plain phrase, linked from each doc's header. This alone moves several docs from "Partly" to "Yes."

**3 · Each page states its boundary four times.** The "what this is *not*" idea appears as: the §1 "does NOT do" list, then §5 "responsibility boundaries," then a §5 pass/fail "no module does X," then the "canonical-intent split." Four passes at one idea.
→ **Fix:** state boundaries **once** (§1 "does NOT do"). Cut the three echoes.

**4 · Over-bolding destroys scannability.** In the Page IA and visual docs, most sentences contain bold; many have three or four bolded fragments. When ~40% of the text is bold, bold stops signalling anything and the eye can't find the real key point.
→ **Fix:** cap emphasis at **one bolded phrase per paragraph** — the single takeaway. Everything else plain.

Together these four are ~80% of the readability tax, and none touches architecture.

---

## Part C — Targeted recommendations (by the requested categories)

**Sections to SHORTEN**
- `VISUAL_DIRECTION_v2.0.md` — the biggest opportunity. §2 (mechanisms), §12 (principles), the acceptance checklist, and "things we never do" restate the same ~8 rules four times. Keep §2 as the canonical statement; compress the rest to cross-references.
- Every **wireframe** — delete the ~15–20-line self-validation ✔ block.
- Every **Page IA** — delete "concrete pass/fail tests" (duplicates "success criteria") and merge flow into inventory.
- `INFORMATION_ARCHITECTURE.md` Steps 5–6 — move the long parenthetical scope-notes into footnotes so the decision reads cleanly.
- `DECISIONS_LOG.md` — not shorten, but **add** a 10-sentence plain-language "current state" at the top so it's usable without reading all 19 batches.

**Sections to SPLIT** — **none.** The corpus's pressure is entirely toward consolidation; splitting would worsen the reading experience. (The one nuance: `VISUAL_DIRECTION_v2.0` could split its *philosophy* into an appendix so the *rules* sit alone — a split that shortens the main read.)

**Sections to MERGE (for the reader, not the architecture)**
- Within each Page IA: **"information flow" + "module inventory"** → one section.
- `WIREFRAME_PRINCIPLES.md` + `WIREFRAMING_GUIDELINES.md` — a reader learns "how to wireframe" from two documents that overlap; they read as one manual.
- Each Page IA + its wireframe are consumed together to build one page; at minimum, **stop restating the modules across them** (the wireframe should add only spatial composition, and reference the Page IA for responsibility rather than re-asserting it).

**Unnecessary prose to cut**
- The wireframe **validation checklists** (all six).
- The **"Homepage introduces; Hub expands; Service resolves; Archive discovers; Work Entry evaluates; Contact converts"** litany — it appears in the index, both of those Page IA docs, and multiple wireframes. Keep it **once**, in `PAGE_IA_INDEX.md`; delete the copies.
- The repeated header disclaimers ("introduces no new IA, no new Page IA, no new components, no new visual direction") — say it once in the Guidelines; the per-doc repetition is boilerplate a reader learns to skip (which trains them to skip headers that sometimes *do* matter).
- The "*Future:* none essential." lines under most modules — near-empty rows that add scanning cost.

**Where DIAGRAMS would beat prose**
- **One journey map** in `PAGE_IA_INDEX.md` (Homepage→Hub→Service→Contact, Archive→Work Entry→Service→Contact, etc.) would replace dozens of textual "A → B → C" restatements scattered through every Page IA and wireframe.
- **The Work Entry modular model** (universal base W-1/2/3/5/6/7 + optional W-4 by Entry Type) — a simple diagram makes the out-of-sequence numbering instantly clear where a paragraph struggles.
- **Module → Component → Content** (`COMPONENT_INVENTORY.md` §6) — currently a prose chain; a three-box diagram lands in one glance.
- **The Archive's two-region layout** (control region vs results region) — a boxes sketch beats the paragraph.

**Where EXAMPLES are missing**
- The Page IA docs are almost entirely abstract until a "content differences" footer. Pull a **concrete example inline**: e.g. in `HUB_PAGE_IA.md` H-2, show a real Reality-Capture use-case ("heritage façade documentation") *at* the module, not only in the footer.
- `CONTENT_MODEL.md` — the Attribution vs Role vs Authorship distinction is the subtlest idea in the corpus and has **no inline example** (the worked examples live in a separate reference doc). One example beside the definition would prevent the guaranteed confusion.
- `VISUAL_DIRECTION_v2.0.md` — "blue as semantic activation" is stated as a rule but never shown; a two-column *do / don't* example ("blue on the one primary action ✓ / blue on a stack of buttons ✗") would make it operational.

**Where wording is TOO ABSTRACT**
- Page IA module fields: "*Consumes:* pillar framing (name, one-line positioning)" — a reader can't picture it. Anchor abstract nouns to a concrete instance the first time.
- `VISUAL_DIRECTION_v2.0.md` — "silence is space *and* time," "the reveal is an act of inspection," "measured reality" — evocative but not buildable. A designer needs these translated into at least one concrete behaviour each (and some are, later — but the abstraction comes first and dominates).
- `WIREFRAME_PRINCIPLES.md` — "simplicity through responsibility," "why precedes what" — fine as slogans, but each should carry one concrete "e.g." so a new designer knows what it forbids in practice.

---

## Part D — Consistency issues (writing-level only)

- **Public label drift:** the same section is called *Proiecte*, *Work*, *Lucrări*, and *Work archive* across docs. The content model explains why — but a reader still meets four names for one thing. Pick one public label per language and use it verbatim everywhere; footnote the internal name once.
- **Stale "derived from" pointers:** the wireframes list `VISUAL_DIRECTION.md` (the superseded one) and speak of "architectural publication." Even setting governance aside, this is a *consistency* defect a reader will trip on.
- **Emphasis style is inconsistent** — some docs bold key terms, some italicize, some use both; headings sometimes carry status, sometimes not. Pick one convention.
- **Module-field template varies slightly** between Page IA docs (some modules list "Future," some omit it; "Destinations" vs "Destinations:" formatting). Normalize the template so the eye learns one shape.
- **Out-of-sequence numbering** (`W-4` documented after `W-7`) is explained, but still reads as an error on first pass; a diagram or a renumber-with-note would remove the stumble.

---

## Part E — Priority order (maximum human value per edit)

1. **Add a one-page code legend** and link it from every Page IA/wireframe. *(Cheapest fix, biggest comprehension gain.)*
2. **Delete the six wireframe validation checklists** and the Page IA "pass/fail" duplication. *(Large length cut, zero content loss.)*
3. **Merge "information flow" into "module inventory"** in all six Page IA docs. *(Removes the double-description.)*
4. **Add a plain-language "current state" header to `DECISIONS_LOG.md`.** *(Turns the least-readable doc into a usable entry point.)*
5. **Compress `VISUAL_DIRECTION_v2.0.md`** to a "rules at a glance" table + philosophy appendix. *(Turns the one "No" into a "Yes.")*
6. **State each page's boundary once; cut the three echoes.** Reduce bolding to one phrase per paragraph.
7. **Add the single journey-map diagram** to the index and delete the textual journey restatements it replaces.
8. **Add one inline example** to each Page IA module family and to the Attribution/Role/Authorship split.

Steps 1–4 are a day of editing and would move most of the "Partly/No" documents to "Yes." Nothing above changes a decision — it changes how fast a human finds the decision that's already there.

**The core message:** this documentation is *complete and correct*; it is *not economical*. It reads like it was written to prove rigor to a reviewer rather than to be consumed by a builder under time pressure. Optimising it for humans means saying each true thing **once**, in plain words, with an example — and trusting the reader to remember it.
