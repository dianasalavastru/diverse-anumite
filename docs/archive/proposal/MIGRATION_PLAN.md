# Migration Plan — Documentation Restructure

**Status:** PROPOSAL · planning phase · **not yet executed** · revised 2026-07-30 (rev 2)
**Governs:** the physical execution of `DOCUMENTATION_ARCHITECTURE.md`.
**Prerequisite:** owner approval of the proposed architecture.

This is a planning document. Nothing here has been performed: no files moved, no frozen document altered, no `DECISIONS_LOG` batch written, no release record created. Every "Action" below describes what *will* happen, in order, once approved.

**Preserved authority resolutions (fixed inputs, not re-decided here):**
- `VISUAL_DIRECTION_v2.0.md` is the authoritative visual-direction SSOT.
- `VISUAL_DIRECTION.md` is SUPERSEDED.
- `HOMEPAGE_HIFI_DESIGN.md` is SUPERSEDED.
- `HOMEPAGE_HIFI_v2.md` is a REFERENCE validation artifact — **not** the production Homepage HiFi.
- The production Homepage HiFi has **not** yet been created.

---

## 1. Two kinds of change — governance model

The previous revision made a category error: it routed metadata, folder moves, indexing, and manifest adoption through the four amendment channels that exist to govern the *semantic* content of the frozen product/design corpus. Those channels are for meaning, not filing. This revision separates the two.

### A · Product / design / UX / architecture / technical amendments

Changes that alter the **semantic meaning** of the corpus — what a decision *says*, what a page is responsible for, what the model *is*. These must cite one or more of the four existing amendment channels (`DOCUMENTATION_RELEASE_v1.0.md` §2):

1. **corrections** — factual errors, broken traceability, internal contradictions, typos; restores intended meaning, changes no decision.
2. **genuine architectural discoveries** — a real structural problem the architecture cannot express.
3. **implementation feedback after design** — a constraint only visible once design/build is underway.
4. **usability testing** — real-user evidence against a structural assumption.

A product amendment increments the release (v1.1, v1.2, …).

### B · Documentation-governance operations

Changes to the **container**, not the content. They may alter:

> metadata · document paths · folder structure · indexing · lifecycle labels · reference integrity · manifest structure · README orientation · validation reports

but **must not** change the semantic meaning of any product, IA, content-model, page-contract, wireframe, visual, or technical decision.

**Governing rule (new):**

> **Documentation-governance operations are not a fifth product-amendment channel.** They may alter organisation, metadata, routing, indexing, and reference integrity, but must not change the semantic meaning of frozen specifications. They are logged in `DECISIONS_LOG.md` for auditability and classified separately — never as one of the four product-amendment channels, and never as "channel 1 / process."

Governance operations are recorded as **`DOC-GOV` log entries** (an audit label distinct from the numbered product-amendment batches). They do not, by themselves, increment the product release. If a governance operation also carries a genuine semantic correction, that correction is split out and logged separately as a channel-1 product amendment (see Phase 4).

### Boundary test (applied to every phase)

*"Does this change what a specification means, or only where it lives / how it is labelled / what it points at?"* — Meaning → **A** (a channel). Location, label, or pointer only → **B** (`DOC-GOV`).

---

## 2. Identifier & reference model — stable document IDs

Reference integrity must not depend on physical paths, or every folder move re-breaks it. This revision introduces a **stable `document_id`** as the primary key for every document.

Metadata references documents **by ID, never by path:**

```yaml
document_id:   VISUAL_DIRECTION_V2        # stable · path-independent · assigned once · never changes
title:         Visual Direction (measured reality)
status:        AUTHORITATIVE
supersedes:    [VISUAL_DIRECTION]         # by document_id
superseded_by: —
depends_on:    [CONTENT_MODEL, INFORMATION_ARCHITECTURE, NAV_DECISION_RECORD]   # IDs, not paths
consumed_by:   [HOMEPAGE_HIFI, DESIGN_TOKENS]                                   # IDs, not paths
```

Consequences that make the rest of this plan safer:

- **Physical location lives in exactly one place:** the manifest's ID→path index. Moving a file updates **one row** there, not the `depends_on` list of every document that cites it.
- **Reference integrity survives folder moves.** After IDs are in place (Phase 3), the folder move (Phase 5) cannot break a single ID-based dependency. Only *inline prose links* and the *manifest path index* reference paths, and both are corrected inside the atomic window.
- **Supersession is expressed by ID.** "`WIREFRAMING_GUIDELINES` no longer depends on `VISUAL_DIRECTION`, it depends on `VISUAL_DIRECTION_V2`" is an ID swap, evaluated independent of where either file sits.
- **Validation is machine-checkable:** every ID unique; every `depends_on`/`supersedes`/`superseded_by`/`consumed_by` ID resolves to an existing document; no AUTHORITATIVE document depends on a SUPERSEDED ID.

*Alignment note (not executed here):* `DOCUMENTATION_ARCHITECTURE.md` §4 currently shows a path-based metadata template. When the architecture is adopted (Phase 2) that template should gain the `document_id` field and switch `depends_on`/`consumed_by` to IDs, so the standard and this plan agree. Flagged for the owner; no edit made now.

---

## 3. The migration lock

The physical move and its reference repair are **one atomic unit**, not two independently usable states. While that unit is in flight the corpus is neither the old thing nor the new thing, so it is closed to consumers.

> **Migration-lock rule:** Once physical migration begins, the corpus enters a **migration lock**. It must not be used for design or implementation until path migration, reference correction, validation, and manifest activation have all completed successfully.

| Aspect | Definition |
|---|---|
| **Lock starts** | The moment the first new-path copy is written in Phase 5. |
| **Prohibited during the lock** | Reading the corpus to design or build against it; drafting or freezing any product/design/technical decision; any product amendment; starting HiFi or technical authoring that resolves document paths; adopting the new manifest as live. The old-path corpus + old manifest remain the *only* sanctioned reference until cutover. |
| **Lock ends (success)** | When **all** hold: (1) every document exists at its target path; (2) validation (Phase 5, §5) passes; (3) the manifest + README are cut over to the new paths; (4) old-path copies are deleted. |
| **Lock ends (rollback)** | When validation fails and the rollback (below) completes: new-path copies discarded, old-path corpus + old manifest confirmed intact and live. |
| **Rollback point** | The pre-migration state: old-path documents are retained untouched and remain authoritative throughout the window; the original manifest stays active and pointing at old paths until the successful cutover. |
| **If validation fails** | Do **not** delete anything. Discard the incomplete/invalid new-path copies, keep the old-path corpus live, record a `DOC-GOV` entry noting the failure and cause, fix the fault in the plan, and re-run the window later. No partial cutover is ever published. |

Because old-path documents are deleted **only after** a valid new-path corpus is cut over, the corpus is never in a broken, consumable state.

---

## 4. Phases

Each phase is labelled with its **operation class** — **[A]** product amendment (names its channel) or **[B]** documentation governance (`DOC-GOV`, not a channel).

### Phase 0 — Approve (no changes)

**Class:** none.
**Goal:** sign off the target architecture.
**Actions:** review `DOCUMENTATION_ARCHITECTURE.md`, `PROJECT_MANIFEST.md`, and this plan; confirm the folder scheme, the state taxonomy, the metadata + stable-ID model, and the preserved authority resolutions.
**Output:** approval to proceed. **Reversible:** N/A.

---

### Phase 1 — Record the visual pivot  ·  **[A] product/design amendment · channels 2 + 3**

**Goal:** make the ledger and release record tell the truth about the post-freeze visual pivot. Highest priority — it is the only genuinely *semantic* change in the migration, and everything downstream assumes it.

**Why these channels:** the pivot is a **genuine architectural discovery** (the "architectural publication" metaphor was found to misexpress the brand — channel 2) surfaced as **implementation feedback after design** (it emerged while producing high-fidelity design — channel 3). It changes what the corpus *means* about its visual authority, so it is a product amendment and increments the release.

**Actions (planned):**
1. New product-amendment batch in `DECISIONS_LOG.md` — *"Visual direction v2.0 supersedes v1; HiFi status clarified."* Records: `VISUAL_DIRECTION_V2` authoritative; `VISUAL_DIRECTION` SUPERSEDED; `HOMEPAGE_HIFI_DESIGN` SUPERSEDED; `HOMEPAGE_HIFI_V2` REFERENCE (validation); production Homepage HiFi = planned, not yet created. Names every affected document by ID.
2. Create `DOCUMENTATION_RELEASE_v1.1.md`: freezes `VISUAL_DIRECTION_V2` as the visual SSOT; marks the two superseded docs; notes the production HiFi as pending; leaves the rest of the v1.0 corpus unchanged.

**Output:** ledger + release record match reality; `VISUAL_DIRECTION_V2` formally frozen. **Release:** → v1.1.
**Touches existing docs?** Appends to `DECISIONS_LOG.md`; adds a new release doc. No frozen spec body edited.
**Reversible:** additive; nothing deleted.

*Note:* this phase is content-only and involves **no file moves** — it can be executed and reviewed entirely before the migration lock is ever considered.

---

### Phase 2 — Adopt the documentation architecture  ·  **[B] documentation governance**

**Goal:** ratify the system this plan implements.
**Actions:** record a `DOC-GOV` entry adopting `DOCUMENTATION_ARCHITECTURE.md`, the lifecycle-state taxonomy, and the metadata + stable-ID standard; create `METADATA_STANDARD.md` holding the header template, the `document_id` rule, and the controlled vocabularies.
**Output:** the standard exists and is adopted. **Release:** unchanged (governance).
**Boundary check:** defines labels and structure only; changes no specification's meaning → **B**.
**Reversible:** additive.

---

### Phase 3 — Apply metadata headers with stable IDs  ·  **[B] documentation governance**

**Goal:** give every document its header and its permanent `document_id`, and express all cross-document references by ID.

**Actions:**
1. Prepend the standard header to all 31 documents, assigning each a unique `document_id` and filling `status`, `editability`, `supersedes`/`superseded_by`, `depends_on`, `consumed_by`, `audience`, `phase`, `release` — **all references as IDs**.
2. Perform the **reference-integrity redirect** at the ID level: any `depends_on` that names `VISUAL_DIRECTION` is repointed to `VISUAL_DIRECTION_V2` (the authoritative successor). This is a pointer change, not a meaning change → governance. *(The separate, semantic wording fix is Phase 4.)*
3. On the two SUPERSEDED docs, add the `superseded_by` field + a one-line banner — the only body change permitted on them.

**Output:** every doc self-declares state and identity; all machine references are ID-based and superseded-free.
**Boundary check:** headers, labels, and ID pointers only; no specification meaning changes → **B**. (The header addition is additive metadata, not a rewrite.)
**Release:** unchanged (governance). **Reversible:** headers/ID fields can be stripped; bodies untouched.
**Sequencing:** must complete before Phase 5 — once references are ID-based, the folder move cannot break them.

---

### Phase 4 — Semantic language correction  ·  **[A] product amendment · channel 1 (corrections)**

**Goal:** fix the stale *"architectural publication"* language now that the metaphor is superseded — a change to what the text *means*, so a real product amendment, kept strictly separate from the governance pointer-work of Phase 3.

**Actions (planned):**
1. `WIREFRAMING_GUIDELINES.md` §7: neutralise the "architectural publication" metaphor wording so it no longer asserts the superseded visual concept. The underlying *narrative-density* rule is unaffected — only the abandoned metaphor label is corrected.
2. Scan the corpus for any other body text that states the superseded metaphor as current, and correct wording only. (Reference/ID pointers were already handled in Phase 3; this phase is prose meaning, not pointers.)
3. Log as a channel-1 correction batch, doc-by-doc, explicitly noting: no responsibility, module, journey, IA, or component decision changes — only stale wording.

**Output:** no live document *asserts* the superseded visual metaphor. **Release:** folds into v1.1.
**Boundary check:** changes the meaning of text → **A**, channel 1.
**Reversible:** surgical, enumerated.
**Sequencing:** content-only, **no moves** — completed before the migration lock, so the atomic window handles paths alone.

---

### Phase 5 — Atomic folder migration  ·  **[B] documentation governance · UNDER MIGRATION LOCK**

**Goal:** realise the `docs/NN-layer/` structure (`DOCUMENTATION_ARCHITECTURE.md` §6) as one atomic, validated, reversible unit. **Physical move and inline path repair are a single migration unit, never two consumable states.**

**Preconditions:** Phases 1–4 complete and reviewed (all semantic work done; all references ID-based). Announce the **migration lock start**.

**Sequence (strict — the lock holds throughout):**
1. **Copy, don't move.** Write every document to its **target path**, leaving the old-path copy in place and authoritative. (Write-new; do **not** delete-old.)
2. **Repair path-bound text in the new copies only.** Update the sole path-dependent artefacts: inline prose links that mention a path, and any "see `docs/…`" cross-references. ID-based `depends_on`/`consumed_by` need no change (Phase 3). The two SUPERSEDED docs and the source PDFs are copied into `docs/archive/_superseded/` and `docs/sources/`.
3. **Validate the complete new-path corpus** (§5 checklist). Old-path corpus remains the live reference during validation.
4. **Cut over.** Only if validation passes: switch `PROJECT_MANIFEST.md` and `README.md` to the new paths and update the manifest's ID→path index; promote the manifest to root; point README at it. This is the single publish step.
5. **Delete old-path copies** — only now, after a valid, cut-over new corpus exists. Announce the **migration lock end (success)**.

**If validation (step 3) fails:** discard the new-path copies, keep the old-path corpus + old manifest live, log the failure and cause as a `DOC-GOV` entry, and end the lock via rollback. Nothing is deleted; no partial state is published.

**Governance record:** a `DOC-GOV` entry containing the full old→new path table (the audit record) and the validation result.
**Boundary check:** paths, filing, and the manifest index only; no specification meaning changes → **B**.
**Release:** unchanged (governance).

#### 5. Validation checklist (gate between "new corpus built" and "cutover")

All must pass before step 4:

- [ ] Every one of the 31 documents (+ 2 source PDFs + the 3 proposal docs) exists at exactly one target path; count reconciles.
- [ ] Every document carries a valid header and a unique `document_id`.
- [ ] Every `depends_on` / `supersedes` / `superseded_by` / `consumed_by` ID resolves to an existing document.
- [ ] **No AUTHORITATIVE document depends on a SUPERSEDED document** (by ID).
- [ ] No inline link or path-reference in any new-path copy points at an old path.
- [ ] The manifest ID→path index matches the actual files exactly (no orphans, no missing entries).
- [ ] The two SUPERSEDED docs resolve to `archive/_superseded/`; the source PDFs to `sources/`.
- [ ] No document asserts the superseded visual metaphor as current (confirms Phase 4 held through the copy).

A failed item aborts to rollback; it never proceeds to cutover.

---

### Phase 6 — Confirm & release the lock  ·  **[B] documentation governance**

**Goal:** close out the migration cleanly.
**Actions:** confirm the manifest is live at root and the README points to it; record a `DOC-GOV` entry marking the migration lock closed and the new structure in effect; move `DOCUMENTATION_ARCHITECTURE.md` and this plan into `docs/governance/` (itself a trivial in-structure move, inside the now-open corpus).
**Output:** the corpus is open again, on the new structure, entry point live. **Release:** unchanged (governance). **Reversible:** yes.

---

### Phase 7 — Create the implementation layer  ·  new authoring (not an amendment)

**Goal:** fill the technical gaps (`DOCUMENTATION_ARCHITECTURE.md` §11). These are **new WORKING DRAFTs** — new authoring, neither a governance operation nor an amendment to a frozen doc. They may begin any time after Phase 1 and do not block Phases 2–6.

**Order (dependency & priority):**
1. `TECHNICAL_ARCHITECTURE` (stack, rendering, hosting) — P1.
2. `CONTENT_MODEL_IMPLEMENTATION` (CMS schema, reserved slugs, i18n) — P1.
3. **Production HiFi** — Homepage first, then Hub → Service → Archive → Work Entry → Contact — P1; each frozen before its page is built.
4. `DESIGN_TOKENS` (from the production HiFi) — P1.
5. `ACCESSIBILITY_GUIDELINES`, `MOTION_GUIDELINES` — P2.
6. `SEO_I18N_PLAN`, `PERFORMANCE_BUDGET` — P2.

Each new doc gets a `document_id` and header (`WORKING DRAFT` → `AUTHORITATIVE` on freeze). Reaching authoritative state is a **[A] product event** — a new frozen spec — logged as a product batch and incrementing the release (v1.2+) as the technical layer matures; its *filing* is governance.

---

## 5. Summary — operations, classes, releases

| Phase | Operation | Class | Channel (if A) | Log record | Release | Moves files? |
|---|---|---|---|---|---|---|
| 0 | Approve | — | — | — | — | No |
| 1 | Record visual pivot; freeze v2.0 | **A** product | 2 + 3 | product batch | → **v1.1** | No |
| 2 | Adopt doc architecture + metadata standard | **B** gov | — | `DOC-GOV` | v1.1 | No |
| 3 | Metadata headers + stable IDs + ID-level ref redirect | **B** gov | — | `DOC-GOV` | v1.1 | No |
| 4 | Correct stale "architectural publication" wording | **A** product | 1 | product batch | v1.1 | No |
| 5 | **Atomic folder migration** (copy→repair→validate→cutover→delete) | **B** gov | — | `DOC-GOV` + path table | v1.1 | **Yes (locked)** |
| 6 | Confirm & release the migration lock | **B** gov | — | `DOC-GOV` | v1.1 | trivial in-structure |
| 7 | Author implementation layer (new drafts) | new authoring → **A** on freeze | 3 (on freeze) | product batch per doc | v1.2+ | No |

**Sequencing invariant:** all semantic work (Phases 1, 4) and all reference/ID work (Phase 3) complete **before** the atomic move (Phase 5). Because references are ID-based by then, the move touches only physical paths, inline path links, and the manifest index — the smallest possible blast radius, executed under lock, validated before cutover, and reversible until the final delete.

**Rollback posture:** the corpus is never left in a broken, consumable state. Old-path documents and the original manifest remain live and authoritative until a fully-built new corpus passes validation and is cut over; if anything fails, the new copies are discarded and the old corpus simply continues. The only body edits to frozen specifications are the Phase-4 wording correction (channel 1, semantic, enumerated) and the Phase-3 metadata headers (governance, additive) — neither changes any architectural, IA, content-model, page, wireframe, visual, or technical decision.
