# Project Model v3.0 / v3.1 — implementation impact & migration plan

**Companion to [`CONTENT_MODEL.md`](CONTENT_MODEL.md) v3.1 (CLIENT-VALIDATED 2026-08-14).** That document says *what the model is*; this one says *what the audit found and what has to change to get there*. Nothing in this document is a product decision.

> **Updated 2026-08-14 for v3.1.** The five questions this report previously deferred to `CONTENT_MODEL.md` §15 are **closed**. The changes that follow from them are folded into the sections below and marked **(v3.1)**. **No open model question remains.** The *Experiență profesională* view was the last open consequence and is now **permanently retired by product decision** (2026-08-14, §1.7). One item needs a code audit rather than a design decision (§1.6, `validateAuthorship()`).

**Nothing in the Sanity schema, the application code, the filters or the UI has been changed by this pass.** This is the audit and the plan.

---

## 1. Audit summary

### 1.1 What remains valid

| Concept | Verdict |
|---|---|
| **Two Pillars** — Architecture & Design, Reality Capture | valid, unchanged. Only *how a project gets its pillar* changes. |
| **Service as a first-class content object** | valid, unchanged, and now more load-bearing: Service is the axis that drives field requirements. |
| **Project ⇄ Service many-to-many, reference stored on the project** | valid, unchanged. `workEntry.services` is already an array of references — it is already multi-select. |
| **Service → Pillar (authored on the Service)** | valid, unchanged. It is what lets the Services picker be constrained by the project's Pillar. |
| **Curation layer** (featured · pinned · editorialPriority · placements · prominence) | valid, unchanged, and still strictly separate from classification. |
| **Sector as transversal, non-field-activating metadata** | valid; **(v3.1)** its vocabulary closes *and* its cardinality fixes at exactly one. |
| **Localization model** (locale-neutral document, localized fields, `enPublished` gate) | valid, unchanged. |
| **Reserved-slug policy**, per locale | valid, unchanged. |
| **Discovery order** (editorial priority, pillar balancing, year tie-break) | valid; its *input* changes from a derived `PillarAssignment` to a single authored Pillar. |
| **Capture-asset handling** (derivative, poster, point count, publication gate) | valid, unchanged. |
| ~~**Credit fields** (Attribution, Employer, Roles, Authorship)~~ | **(v3.1) RETIRED** — not retained. Crediting is **Colaboratori + Echipă**, both optional and display-only. Commissioning context goes with them. |

### 1.2 Fields that move from project-level to Pillar-level or Service-driven

| Field | Today | Under v3.0 / v3.1 |
|---|---|---|
| **Description** | one optional project field, same for all | **[M] for Architecture & Design · [O] for Reality Capture** — a Pillar-level rule |
| **Location** | one optional project field | **[conditional]** — [M] under Proiectare de arhitectură, Design interior, Scanare laser 3D, Scan-to-BIM, Fotografie de arhitectură; [O] under Vizualizare 3D, Vizualizare de arhitectură |
| **Area** | one optional project field | **[conditional]** — [M] under Proiectare de arhitectură, Design interior, Scanare laser 3D, Scan-to-BIM |
| **Awards** | one optional project field | **[conditional]** — [O] under Proiectare de arhitectură, Design interior; otherwise not applicable |
| **Collaborators** | one optional project field | **[O] base for A&D**; **[conditional] [O]** for RC (Scan-to-BIM, Vizualizare de arhitectură) |
| **Team** | one optional project field | same as Collaborators |
| **Equipment** | lives inside the **capture metadata group**, RC-only, optional | **project-level [conditional] [M]** under Scanare laser 3D and Fotografie de arhitectură. Must move out of the capture group — Fotografie de arhitectură requires it and has no capture asset. |
| **Client** | optional ("leave empty for self-initiated work") | **[M] in both Pillars** |
| **Cover / Gallery** | optional, no validation | **[M] in both Pillars** |
| **Implementation Company** | **does not exist** | new field, **[conditional] [M]** under Design mobilier |
| **Labels** | **does not exist** | new multi-select field, [O], closed vocabulary |
| **Pillar** | **derived, never stored** | **authored, stored, [M], single-value** |
| **Deliverables** | project metadata field | not named in the validated model; retained as [O] display metadata, no rule attached |
| **Sector** | array of open free strings | **(v3.1) single required value** from a closed seven-value vocabulary — a shape change, not only a vocabulary change |
| **Status** | mandatory, `built-realized · unbuilt-proposal · in-progress · delivered` | **(v3.1)** mandatory and single-select still, with a **replaced vocabulary**: `in-dezvoltare · in-desfasurare · finalizat · nerealizat` |
| **Attribution · Employer · Roles · Authorship · Commissioning context** | authored fields, one of them (`employer`) a whole document type | **(v3.1) deleted.** No replacement field, no re-keying, no filter, no validation |

### 1.3 Every remaining use of Discipline

**Documentation**

| File | What it encodes |
|---|---|
| `docs/product/CONTENT_MODEL.md` | *(rewritten by this pass)* |
| `docs/product/INFORMATION_ARCHITECTURE.md` | §2.3 facet list · Step 5 shared/contextual filters · Step 5 rationale · Open items |
| `docs/implementation/TECHNICAL_ARCHITECTURE.md` | §7.2 vocabulary table · §7.3 field contract · §7.4 the whole derivation section · §22 OD-7 · §23.5 filter contract |
| `docs/pages/work-archive/WORK_ARCHIVE_PAGE_IA.md` | lines 99, 173 — filter set |
| `docs/pages/work-archive/WORK_ARCHIVE_IMPLEMENTATION_NOTES.md` | lines 72–96, 121, 135, 167 — the contextual-refinement design and the prohibited enumeration |
| `docs/pages/work-entry/WORK_ENTRY_PAGE_IA.md` | lines 18, 83 — W-1 metadata inputs |
| `docs/pages/service/SERVICE_PAGE_IA.md` | line 169 — "discipline-relevant use-cases" |
| `docs/design/COMPONENT_INVENTORY.md` | lines 80, 100, 114 — Metadata Strip · Filter Bar · Project Metadata inputs |
| `docs/governance/DECISIONS_LOG.md` | #11, #12 (Batch 3) |
| `docs/references/CONTENT_MODEL_VALIDATION.md` | the entire worksheet |
| `studio/README.md` | lines 134, 163, 167 |
| `studio/seed/README.md` | lines 71, 106 |
| `src/lib/content/README.md` | line 56 |

**Code**

| File | What it encodes |
|---|---|
| `src/lib/content/types.ts` | `DISCIPLINES`, `Discipline`, `DISCIPLINE_TO_PILLAR`, `DisciplineAssignment`, `PillarAssignment`, `WorkEntry.discipline`, `WorkEntry.pillars`, `WorkArchiveItem.discipline` |
| `src/lib/content/derive.ts` | `derivePillars()`, `isCrossPillar()` — both die |
| `src/lib/content/validation.ts` | `VOCABULARIES.discipline`, `validateAssignment()` |
| `src/lib/content/groq.ts` | `discipline{primary, secondary}` projections |
| `src/lib/content/normalize.ts` | discipline normalization + pillar derivation |
| `src/lib/content/fixtures.ts` | every fixture project |
| `src/lib/content/order.ts` | `inPillarScope()` reads `pillars.primary` + `pillars.secondary`; `discoveryOrder()` queues by `pillars.primary` |
| `src/lib/i18n/vocabulary.ts` | `DISCIPLINE_LABELS`, `disciplineLabel()` |
| `src/components/work-archive/archive-state.ts` | `?discipline=` param, `contextualFacet()`, `ArchiveState.discipline`, matching |
| `src/components/work-archive/facets.ts` | `itemFacets().disciplines`, `collectFacetValues()` A&D scoping |
| `src/components/work-archive/ArchiveFilters.astro` | the Discipline control |
| `src/scripts/islands/work-archive.ts` | the Discipline control's client wiring |
| `src/components/work-entry/ProjectMetadata.astro` | renders Discipline |
| `studio/schemaTypes/workEntry.ts` | the `discipline` field, `isRealityCapture()`, `derivedPillarLabel()`, the preview subtitle |
| `studio/schemaTypes/fields.ts` | `DISCIPLINE_OPTIONS` |
| `studio/structure.ts` | `disciplinesOf()`, the `IN_PILLAR` GROQ predicate, both pillar panes |
| `studio/scripts/verify-validation-levels.ts` | discipline assignment checks |
| `studio/seed/*.ndjson` | every seeded project |

**Tests:** `content.test.ts`, `validation.test.ts`, `source.test.ts`, `query-shape.test.ts`, `order.test.ts`, `live.test.ts`, `archive-state.test.ts`, `highlights.test.ts`, `modules.test.ts`, `preview.test.ts`, `boundary.test.ts`.

### 1.4 Every remaining use of Entry Type / Project Type

**Documentation:** the same set as §1.3, plus `docs/pages/work-entry/WORK_ENTRY_PAGE_IA.md` lines 3, 48, 97, 128, 136, 139, 182, 195 (the whole "one blueprint, all Entry Types" framing and the W-4 toggle rule), and `docs/foundation/PROJECT_CONTEXT.md`.

**Code**

| File | What it encodes |
|---|---|
| `src/lib/content/types.ts` | `ENTRY_TYPES`, `EntryType`, `EntryTypeAssignment`, `WorkEntry.entryType`, `WorkEntrySummary.entryType` |
| `src/lib/content/validation.ts` | `VOCABULARIES.entryType`; `validateAuthorship()` keys off `entryType.primary === 'visualization-commission'` |
| `src/lib/content/source.ts` | `isCompetition()` — the Competitions curated view |
| `src/lib/content/derive.ts` | `toWorkEntrySummary()` carries `entryType` |
| `src/lib/content/groq.ts`, `normalize.ts`, `fixtures.ts` | projections, normalization, fixtures |
| `src/lib/i18n/vocabulary.ts` | `ENTRY_TYPE_LABELS`, `entryTypeLabel()` |
| `src/components/WorkPreviewCard.astro` | prints `entryTypeLabel(entry.entryType.primary)` as the card's facet line |
| `src/components/work-archive/archive-state.ts` | `?type=` param, `ArchiveState.type`, matching |
| `src/components/work-archive/facets.ts` | `itemFacets().types`, `collectFacetValues().types` |
| `src/components/work-archive/ArchiveFilters.astro`, `src/scripts/islands/work-archive.ts` | the Entry Type control |
| `src/components/work-archive/CuratedCompetitions.astro` | the curated Competitions strip |
| `src/components/work-entry/modules.ts` | `isCompetitionEntry()`, `awardsAndTeamInCompetition()` — the W-4 module toggle |
| `src/components/work-entry/ProjectMetadata.astro`, `Hero.astro` | render Entry Type |
| `studio/schemaTypes/workEntry.ts` | the `entryType` field |
| `studio/schemaTypes/fields.ts` | `ENTRY_TYPE_OPTIONS` |
| `studio/structure.ts` | the Competitions pane's GROQ filter on `entryType` |
| `studio/seed/*.ndjson` | every seeded project |

### 1.5 Filter logic affected

The frozen archive contract (`TECHNICAL_ARCHITECTURE.md` §23.5) is:

```
?pillar= &sector= &type= &discipline= &service= &sort=
```

- `type` — **removed.** Entry Type no longer exists.
- `discipline` — **removed.** Discipline no longer exists, so the Architecture & Design pillar loses its contextual refinement entirely.
- `service` — **promoted.** It was the Reality Capture–only refinement; Services now exist in both pillars and are mandatory on every project, which makes Service the natural refinement for **both**. `facets.ts::serviceOptions()` currently hard-filters `summary.pillar !== 'reality-capture'` and must instead scope to the active pillar mode.
- `label` — **new**, shared across both pillars, if Labels are to be filterable. Not required by the validated decisions; recommended, since CONCURS already has a curated view.
- `pillar` and `sort` — unchanged. `pillar` stays a *mode*, not a filter; the `architecture` ⇄ `architecture-design` token mapping is unaffected.

Proposed contract: `?pillar= &sector= &service= &label= &sort=`.

Secondary consequences:
- `contextualFacet()` collapses — there is one refinement (Service) available in both pillar modes, and the "none for All" rule needs a decision (recommended: offer Service under All too, since every project now has one).
- `matchesArchiveState()` and `ArchiveItemFacets` lose `types` and `disciplines`.
- `itemFacets()` currently unions primary + secondary for pillars, types and disciplines. With single-value Pillar, no Entry Type and no Discipline, only `sectors`, `services` and `labels` remain, and `pillars` becomes a single value.
- **Already-shared URLs.** `?type=` / `?discipline=` become unknown parameters. `parseArchiveState()` already ignores unrecognised parameters, so old links degrade to the unfiltered archive rather than breaking — acceptable, and worth stating in the release note.

### 1.6 Schema validation affected

The current validators assume *unconditional* field requirements. Service-driven requirements are a new class of rule.

- **New:** a single service-key → field-requirement table (`CONTENT_MODEL.md` §5, §7) plus a `max(M, O, N/A)` merge (§8). Written once in `src/lib/content/validation.ts` and read by both the Studio and the build, exactly as every existing rule is.
- **New:** Pillar required and single-valued; Services non-empty; every selected Service's `pillar` equal to the project's Pillar.
- **New:** Description required for Architecture & Design, not for Reality Capture.
- **New:** Client, Cover, Gallery required in both Pillars.
- **(v3.1) REMOVED, not re-keyed — `validateAuthorship()`.** The earlier plan was to re-key its trigger from `entryType.primary === 'visualization-commission'` onto Attribution and/or the visualization Services. **That plan is withdrawn.** Authorship itself is retired with the old model, so the rule and its consumers are **deleted**. During implementation, audit every call site (`studio/schemaTypes/workEntry.ts` attaches it twice — once as an error, once as a warning) and remove the behaviour. Preserve something only if the audit finds an invariant there that has nothing to do with authorship; none is expected. **Do not substitute a Service-keyed authorship rule.**
- **(v3.1) REMOVED:** `validateEmployerScope()` and its bidirectional Studio↔Employer rule, together with the `employer` document type — unless a use for that document type is found outside crediting.
- **(v3.1) Changed:** `VOCABULARIES` additionally loses `attribution` and `commissioning`; `status` keeps its slot with four new values.
- **Changed:** `validateVocabulary()` loses `entryType` and `discipline` **(and, v3.1, `attribution` and `commissioning`)**, gains `label` and a now-closed, now-single-valued `sector`.
- **Removed:** `validateAssignment()` (primary/secondary duplication checks) has nothing left to check.
- **Unchanged:** slug rules, EN-availability rules, capture-gate rules, raw-capture-format rules, the Service zero-demonstration warning.
- **Studio ergonomics:** conditional fields should be `hidden`/`readOnly` when no selected Service activates them, so an editor is never shown a field that does not apply. The Studio's `hidden` callbacks currently key off `discipline.primary === 'reality-capture'` (the "Survey" group) — that must be re-keyed onto Pillar.

### 1.7 Curated views affected

| View | Today | Under v3.0 |
|---|---|---|
| **Concursuri** `/proiecte/concursuri`, `/en/projects/competitions` | membership = `entryType.primary == 'competition-entry' \|\| 'competition-entry' in entryType.secondary` (`source.ts::isCompetition`, mirrored in `studio/structure.ts`) | membership = `'competition' in labels`. **Routes unchanged, reserved slugs unchanged, page unchanged.** Only the predicate moves. |
| **Experiență profesională** `/proiecte/experienta-profesionala` | membership = `attribution == 'studio'`, grouped by Employer | **PERMANENTLY RETIRED — product decision 2026-08-14** (`DECISIONS_LOG.md` #97). Not deferred, not awaiting a rule. `isProfessionalExperience()`, `groupByEmployer()`, the component and both pages are deleted; **no Label, axis or membership rule replaces them, and the view is not to be restored.** The **About / Despre** page is the surviving home for professional-background content. **Both routes 404; both slugs stay reserved** so no project can claim a historical URL. |
| **Work Entry W-4 competition module** | toggled by `isCompetitionEntry()` | toggled by the `competition` label, with the same "only if it has award/team evidence" guard. |
| **Work Entry W-4 capture module** | toggled by presence of capture metadata, *not* by Discipline | **already correct** — no change needed. |
| **Studio desk panes** (`studio/structure.ts`) | two pillar panes built from `disciplinesOf()` + an `IN_PILLAR` GROQ predicate over `discipline.primary`/`.secondary`; a Competitions pane filtered on `entryType` | pillar panes become `pillar == $pillar`; the Competitions pane becomes `"competition" in labels`. Both get simpler. |

A **PROIECT DE DIPLOMĂ** view is *not* implied by the decisions. The label exists; whether it gets a curated route is a separate editorial decision and no route is reserved for it today.

### 1.8 How CONCURS works today, and what changes

Today CONCURS is a **value of the Entry Type axis** (`competition-entry`), and that single value carries four jobs at once:

1. curated-view membership (`source.ts::isCompetition`);
2. the Work Entry's W-4 competition module toggle (`work-entry/modules.ts`);
3. field placement — Awards and Team render inside the competition module instead of Project Metadata (`awardsAndTeamInCompetition()`);
4. an archive filter value and a card badge (`?type=competition-entry`, `WorkPreviewCard.astro`).

Under v3.0 it becomes **a Label**, and all four jobs re-key onto `labels contains 'competition'`. Nothing else about those behaviours changes. The important structural gain: a competition is no longer *a kind of project* that excludes being, say, an architectural design project — it is a flag on a project that still declares its real Services.

### 1.9 Does PROIECT DE DIPLOMĂ exist anywhere?

**No.** A full-repository search (`diploma`, `dizertaț`, `thesis`) returns no occurrence in any schema, type, component, fixture, seed file or document. The only `thesis` hits are unrelated design copy ("thesis line" on the pillar hub). It is entirely new.

### 1.10 Code, docs and tests encoding the old taxonomy

Consolidated: **11 documentation files**, **~30 source files**, **11 test files**, **5 Studio schema/structure/script files**, **3 seed NDJSON datasets**. The per-file inventory is §1.3 and §1.4.

---

### 1.11 (v3.1) Every use of the retired credit concepts

Attribution, Employer, Roles, Authorship and Commissioning context are deleted. Inventory, so nothing is missed:

**Code**

| File | What it encodes |
|---|---|
| `src/lib/content/types.ts` | `ATTRIBUTIONS`/`Attribution`, `COMMISSIONING_CONTEXTS`/`CommissioningContext`, `Employer`, `EmployerGroup`, `AuthorshipStatement`, `WorkEntry.attribution/commissioning/employer/roles/authorship`, `WorkArchiveItem.attribution/employer` |
| `src/lib/content/validation.ts` | `VOCABULARIES.attribution`, `VOCABULARIES.commissioning`, **`validateAuthorship()`**, `validateEmployerScope()` |
| `src/lib/content/source.ts` | `isProfessionalExperience()`, `groupByEmployer()`, `ContentSource.professionalExperience()`, the `CuratedView` union member |
| `src/lib/content/groq.ts` | `QUERY_ALL_EMPLOYERS`, `RawEmployer`, employer/attribution/authorship projections |
| `src/lib/content/normalize.ts` | `normalizeEmployer()` and the credit-field normalizers |
| `src/lib/content/derive.ts` · `fixtures.ts` | employer fixtures and credit fields on every fixture project |
| `src/lib/i18n/vocabulary.ts` | `ATTRIBUTION_LABELS`/`attributionLabel()`, `COMMISSIONING_LABELS`/`commissioningLabel()` |
| `src/components/work-entry/Credits.astro` | W-3 renders Attribution, Roles, Authorship, Employer |
| `src/components/homepage/CuratedViews.astro` | the Professional Experience entry point |
| `studio/schemaTypes/workEntry.ts` | `attribution`, `commissioning`, `employer`, `roles`, `authorship` fields and the `credits` group |
| `studio/schemaTypes/employer.ts` · `index.ts` | the whole `employer` document type and its registration |
| `studio/schemaTypes/fields.ts` | `ATTRIBUTION_OPTIONS`, `COMMISSIONING_OPTIONS` |
| `studio/structure.ts` | the Professional Experience / employer desk panes |
| `studio/scripts/verify-validation-levels.ts` | authorship and employer-scope level checks |
| `src/lib/i18n/routes.ts` | the `professionalExperience` route key — **routes and reserved slugs stay**; only what fills the page is undecided |

**Documentation** — `INFORMATION_ARCHITECTURE.md` Step 5 / §5.1 · `WORK_ENTRY_PAGE_IA.md` W-3 · `COMPONENT_INVENTORY.md` Credits Block · `TECHNICAL_ARCHITECTURE.md` §7.2/§7.3 · `studio/CONTENT_INTAKE.md`. All annotated by this pass.

**W-3 Credits Block does not disappear** — it renders Colaboratori and Echipă, and is absent when the project carries neither, following the same "no empty module" rule as W-5.

---

## 2. Proposed migration

Sequenced so the repository always builds and the test suite always means something.

### Stage 0 — documentation *(this pass, done)*

`CONTENT_MODEL.md` rewritten to v3.0; this impact report added; downstream documents corrected or annotated; a decision-log batch recorded. No schema, code, filter, UI or data change.

### Stage 1 — the contract layer

Change `src/lib/content/types.ts` and `validation.ts` first, because everything else is typed against them. Delete `ENTRY_TYPES`, `DISCIPLINES`, `DISCIPLINE_TO_PILLAR`, `DisciplineAssignment`, `EntryTypeAssignment`, `PillarAssignment` — **and (v3.1) `ATTRIBUTIONS`, `COMMISSIONING_CONTEXTS`, `Employer`, `EmployerGroup`, `AuthorshipStatement`, `validateAuthorship()`, `validateEmployerScope()`**. Add `SERVICE_KEYS`, `LABELS`, the closed single-valued `SECTORS`, the replaced `STATUSES`, and the service-key → field-requirement table with its merge function. `WorkEntry.pillars: PillarAssignment` becomes `WorkEntry.pillar: Pillar`; `sectors: readonly Sector[]` becomes `sector: Sector`. The compiler then lists every remaining site — that list *is* the rest of the work.

**(v3.1) Nothing blocks this stage any more.** The earlier note that "Q1 blocks the validator work" is withdrawn: the answer is deletion, not re-keying.

### Stage 2 — the Studio schema

Add authored `pillar`; add `labels`; add `implementationCompany`; move `equipment` to project metadata; make `services` required and pillar-constrained; add the stable immutable `key` field to the Service document; make `sector` a single required value from the closed list; replace the Status option list; delete `discipline` and `entryType` **and (v3.1) `attribution`, `commissioning`, `employer`, `roles`, `authorship`, plus the `employer` document type and its registration**; re-key the "Survey" group's `hidden` callback and the document preview onto Pillar; wire the conditional validators. Update `studio/structure.ts` and `studio/scripts/verify-validation-levels.ts`.

### Stage 3 — query layer, fixtures and seeds

`groq.ts` projections, `normalize.ts`, `order.ts` (single Pillar), `source.ts::isCompetition`, `derive.ts` (delete `derivePillars`/`isCrossPillar`), `fixtures.ts`, and the three seed NDJSON datasets. **(v3.1)** also remove `QUERY_ALL_EMPLOYERS`, `normalizeEmployer`, `isProfessionalExperience`, `groupByEmployer` and `ContentSource.professionalExperience()`, once §1.7's editorial decision is taken.

### Stage 4 — presentation

`i18n/vocabulary.ts` (drop Entry Type, Discipline, **Attribution and Commissioning** labels; add Label labels; replace Status labels; replace Sector labels), `WorkPreviewCard.astro` (choose the card's facet line — recommended: Sector, since every project has exactly one), `work-entry/ProjectMetadata.astro`, `work-entry/modules.ts`, `CompetitionModule.astro`, `Hero.astro`, **`work-entry/Credits.astro` (reduced to Colaboratori + Echipă)** and **`homepage/CuratedViews.astro`**.

### Stage 5 — filters

`archive-state.ts` (new parameter set), `facets.ts` (Service scoped to the active pillar; labels facet), `ArchiveFilters.astro`, `islands/work-archive.ts`. This is the stage that changes a frozen contract (§23.5) and should land as one reviewable change.

### Stage 6 — tests

Rewrite the eleven affected suites against the new contract. Add coverage the old model had no need for: the merge rule (cases where [O] and [M] collide on the same field — e.g. Vizualizare 3D + Proiectare de arhitectură on Location), the pillar/service consistency rule, the Reality-Capture-description exemption, single-valued Sector, and the four-value Status vocabulary. **(v3.1)** delete the authorship and employer-scope suites rather than porting them.

---

## 3. Migration & data implications

- **No production content is at risk from the repository's point of view.** Every project and service document in the repo is test or fixture data: `studio/seed/b3-test-dataset.ndjson`, `studio/seed/i4-minimum-content.ndjson`, `studio/seed/qa-carousel-population.ndjson` (all prefixed `TEST —`) and `src/lib/content/fixtures.ts`. These are rewritten, not migrated.
- **If the live Sanity `production` dataset already holds real entries**, they need a one-off migration script:
  - `pillar` ← `DISCIPLINE_TO_PILLAR[discipline.primary]`;
  - `entryType == 'competition-entry'` (primary **or** secondary) → `labels: ['competition']`;
  - drop `discipline` and `entryType`;
  - **(v3.1)** drop `attribution`, `commissioning`, `employer`, `roles`, `authorship`, and delete the `employer` documents — after checking whether any office name they carried should be preserved by hand into `collaborators` or `team`, which is a **content decision, not a scripted one**;
  - **(v3.1)** `sectors[]` → a single `sector`: `residential → rezidential` · `hospitality → comercial-ospitalitate` · `office → birouri-business` · `education`/`infrastructure` → `public-comunitar` · `industrial → industrial-logistic` · `cultural`/`heritage` → `cultural-patrimoniu`. **An entry carrying more than one old sector needs a human to pick one** (`mixed-use-dezvoltari` where genuinely mixed);
  - **(v3.1)** Status: `built-realized → finalizat` · `unbuilt-proposal → nerealizat` · `in-progress → in-desfasurare` · `delivered → finalizat`. **`in-dezvoltare` has no old counterpart** and is only ever set by hand; the `delivered`/`built-realized` collapse onto `finalizat` is lossy and should be spot-checked;
  - move `capture.equipment` → `metadata.equipment`;
  - then flag for manual review every entry that now fails a newly-mandatory field (Client, Cover, Gallery, Sector, and the Service-driven Location/Area/Equipment).

  **The audit cannot tell from the repository whether that dataset has content — confirm before Stage 2.**
- **Cross-pillar entries need a human decision, not a script.** Any entry whose old `discipline.secondary` derived into the other pillar must be split into two linked projects or assigned to one pillar. The seed data contains at least one such entry by design (`da-test-i4-work-ad-2` and the cross-pillar I-4 fixture).
- **Services must exist before projects can be migrated**, because Services become mandatory. The eight validated Service documents have to be authored first, with their stable keys.
- **Old shared archive URLs** carrying `?type=` or `?discipline=` degrade gracefully to the unfiltered archive; no redirect is needed.
- **No public route changes.** `/proiecte/concursuri`, `/en/projects/competitions`, `/proiecte/experienta-profesionala` and every project and service URL are untouched, so no redirects and no SEO impact.
- **Reserved slugs unchanged.**

---

## 4. Risks worth naming

1. **Mandatory Cover + Gallery + Client** is stricter than today's schema and will block publication of entries that were previously fine. Intended, but the owner should see it before Stage 2.
2. **The Service key must be stable.** If field rules ever key off a slug or a display name, renaming a Service in the Studio silently changes validation. Hence the separate `key` field.
3. **Losing the Discipline refinement narrows Architecture & Design browsing** until Service replaces it. Every A&D project will carry at least one Service, so the refinement is at least as expressive — but it is a real UX change to the approved archive design, and `WORK_ARCHIVE_IMPLEMENTATION_NOTES.md` should be re-read against it before Stage 5.
4. ~~**Open question Q1 blocks Stage 2's validator work.**~~ **(v3.1) Withdrawn — Q1 is closed and nothing is blocked.** The rule is deleted rather than re-keyed. The residual work is an *audit* of `validateAuthorship()`'s call sites to confirm no unrelated invariant is hiding in them.
5. ~~**The *Experiență profesională* view is the one thing left to decide.**~~ **CLOSED 2026-08-14 — permanently retired.** Its routes and reserved slugs stay (slug protection only); the view, its component, its pages and its membership logic are deleted outright. **Do not design a replacement rule and do not plan a restoration.**
6. **(v3.1) Two conversions are lossy and need human review, not a script:** multi-sector entries collapsing to one Sector, and `delivered`/`built-realized` collapsing to `finalizat`.
7. **(v3.1) Retiring Authorship removes the model's explicit honesty mechanism for visualization work.** `PROJECT_CONTEXT.md` treats correct credit for work whose building design belongs to someone else as a product requirement. Under v3.1 that is carried by **Colaboratori / Echipă** and by the project's Description — authored prose rather than an enforced field. This is the client's decision and is recorded, not reopened; it is named here so nobody rediscovers it mid-build and treats it as a defect.
