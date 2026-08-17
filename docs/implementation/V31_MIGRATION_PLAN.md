# Content Model v3.1 — implementation plan

**Status: PLAN ONLY — 2026-08-14. Nothing in this plan has been executed.** No schema, source, contract, validation, query, filter, component, fixture, seed, migration or test file has been modified.

**Normative target:** [`../product/CONTENT_MODEL.md`](../product/CONTENT_MODEL.md) v3.1 (LOCKED). Audit and data implications: [`../product/PROJECT_MODEL_IMPACT.md`](../product/PROJECT_MODEL_IMPACT.md). Decisions: `DECISIONS_LOG.md` Batches 22–23.

---

## 0. Verified baseline

Measured on the working tree before planning, not assumed:

| Check | Command | Result |
|---|---|---|
| Unit + integration suites | `npm test` | **28 files, 542 tests, all passing** |
| Type/template check | `npm run check` | **172 files, 0 errors, 0 warnings, 0 hints** |
| Live Sanity handshake | included in `npm test` | **RUNS** — `.env` is present and `SANITY_DATASET=development` |
| Live suite pause lever | `SANITY_READ_TOKEN= npm test` | **510 passed, 32 skipped** — verified working |

Three facts from the baseline shape everything below.

1. **The live suite is not dormant.** `src/lib/content/live.test.ts` currently executes 41 tests against a real `development` dataset. Any contract change turns it red until the dataset is re-seeded.
2. **9 of those 41 tests run without credentials.** The *seed pre-flight* block reads every `studio/seed/*.ndjson` and validates it with `validateAssignment`, `validateAuthorship`, `validateEmployerScope` and `validateVocabulary`. Deleting a validator breaks these even with the token unset — so seed pre-flight moves in lockstep with the validators, not with the seed import.
3. **The Studio already imports from `src/lib/content/`** (`studio/schemaTypes/fields.ts`, `workEntry.ts`, `structure.ts`). The shared-pure-module pattern the plan depends on already exists and needs no new build wiring.

**Standing rule for Stages 2–8:** run `SANITY_READ_TOKEN= npm test`. Restore the full run at Stage 9. Every stop condition below states which form to use.

---

## 1. Executive summary

The migration is decomposed **by taxonomy axis, not by architectural layer.** Each stage takes one retired or changed axis and carries it through every layer it touches — contract, validation, Studio, query, filters, presentation, fixtures — so that each stage ends with `npm run check` and `npm test` fully green and is independently reviewable and revertable.

**Why not the layer ordering suggested in the brief.** A layer-first cut (contract → Studio → query → filters → presentation) breaks every consumer of `types.ts` in one stage and leaves `astro check` red across five stages. Measured blast radius per axis instead: Employer ≈ 12 files, Attribution/Authorship ≈ 14, Entry Type ≈ 18, Discipline ≈ 20, Sector ≈ 10, Status ≈ 8. Each is a reviewable change on its own; together they are not. The dependency direction the brief asks for is preserved *within* every stage — contracts always move before the code that consumes them, in the same commit.

**Two deviations, both derived from the code:**
- **Fixtures are not a late stage.** `fixtures.ts` is the substrate that `source.test.ts`, `content.test.ts`, `query-shape.test.ts`, `order.test.ts`, `highlights.test.ts` and `preview.test.ts` run against. It changes inside every stage that changes the contract, or that stage cannot be verified. Only the NDJSON **seeds** are deferred (Stage 9) — they serve the live suite alone.
- **Professional Experience is retired in Stage 2, early.** It has the widest blast radius of any retired concept (13 files), and as of 2026-08-14 it is **permanently retired by product decision** (`DECISIONS_LOG.md` #97) — not deferred. Removing it first takes that noise out of every later stage.

Ten stages. Stages 1–8 leave the repository green and undeployed. Stage 9 restores live verification. Stage 10 proves the deletion is complete.

---

## 2. Dependency graph

```
  ┌─────────────────────────────────────────────────────────────┐
  │ S1  Foundations                                             │
  │     vocabularies · ServiceKey · requirement resolver        │  pure, no consumers
  └───────────────┬─────────────────────────────────────────────┘
                  │ (consumed only at S8)
                  │
  ┌───────────────┴───────────┐   ┌───────────────────────────┐
  │ S2  Employer / Prof.Exp.  │   │ S3  Attribution · Roles ·  │
  │     retirement            │──▶│     Authorship ·           │
  │                           │   │     Commissioning          │
  └───────────────────────────┘   └───────────┬───────────────┘
        S2 must precede S3: Credits.astro and                │
        validateEmployerScope couple the two.                │
                                                             │
  ┌──────────────────────────────────────────────────────────┴──┐
  │ S4  Entry Type → Labels                                     │
  │     (unblocks the Competitions view + W-4 toggle)           │
  └───────────────┬─────────────────────────────────────────────┘
                  │
  ┌───────────────┴─────────────────────────────────────────────┐
  │ S5  Discipline → authored Pillar                            │
  │     (A&D refinement dies here; Service takes both pillars)  │
  └───────────────┬─────────────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
  ┌─────┴──────┐   ┌────────┴───────┐
  │ S6 Sector  │   │ S7 Status      │   independent of each other
  └─────┬──────┘   └────────┬───────┘
        └─────────┬─────────┘
                  │
  ┌───────────────┴─────────────────────────────────────────────┐
  │ S8  Services mandatory · pillar-constrained ·               │  ← consumes S1
  │     key-driven field activation · Equipment move            │  ← needs S5's Pillar
  └───────────────┬─────────────────────────────────────────────┘
                  │
  ┌───────────────┴──────────┐   ┌──────────────────────────────┐
  │ S9  Seeds + live suite   │──▶│ S10 Preflight tooling +      │
  │     re-enabled           │   │     dead-code sweep          │
  └──────────────────────────┘   └──────────────────────────────┘
```

Hard constraints, all verified in the code:
- **S2 → S3.** `Credits.astro` renders Employer and Attribution from one ordered list; `validateEmployerScope()` takes `attribution` as its first argument.
- **S5 → S8.** The Services picker filter and the pillar-consistency validator both need the project's authored `pillar`.
- **S1 → S8.** The resolver is written first and sits unused (and unit-tested) until S8 wires it.
- **S4 ∥ S5 ∥ S6 ∥ S7** touch overlapping files (`WorkPreviewCard.astro`, `ProjectMetadata.astro`, `normalize.ts`, `fixtures.ts`) and must run in sequence, not in parallel branches.

---

## 3. The stages

Every stage ends with the repository green. No stage may be deployed; see §7.

---

### Stage 1 — Foundations: vocabularies, Service keys, requirement resolver

**Goal.** The v3.1 vocabularies and the Service → field-requirement contract exist as pure, tested code that nothing consumes yet. After this stage the merge rule is provably correct in isolation, before any consumer depends on it.

**Files — production/source**
- `src/lib/content/types.ts` — **additive only.** Add `SERVICE_KEYS` / `ServiceKey`, `PROJECT_LABELS` / `ProjectLabel`, `SECTORS` / `SectorV31` *(named `SECTORS`; the existing `KNOWN_SECTORS`/`Sector` stay until S6)*, `STATUSES_V31` *(temporary name; renamed to `STATUSES` in S7)*. Nothing existing is touched.
- `src/lib/content/requirements.ts` — **new file.** The whole Service → activated-fields contract:
  - `REQUIREMENT_ORDER = ['not-applicable','optional','mandatory'] as const`; `type Requirement`
  - `type ConditionalField = 'location' | 'area' | 'awards' | 'equipment' | 'collaborators' | 'team' | 'implementationCompany'`
  - `type BaseField = 'services' | 'sector' | 'title' | 'year' | 'status' | 'client' | 'description' | 'cover' | 'gallery' | 'collaborators' | 'team'`
  - `PILLAR_BASE_REQUIREMENTS: Readonly<Record<Pillar, Readonly<Record<BaseField, Requirement>>>>` — transcribes v3.1 §4 and §6
  - `SERVICE_FIELD_REQUIREMENTS: Readonly<Record<ServiceKey, Readonly<Partial<Record<ConditionalField, Requirement>>>>>` — transcribes v3.1 §5 and §7
  - `mergeRequirement(a, b): Requirement` — `REQUIREMENT_ORDER[max(rank(a), rank(b))]`
  - `resolveRequirements(pillar, keys): Readonly<Record<ProjectField, Requirement>>` — fold base then every selected service
- `src/lib/content/index.ts` — re-export the new module through the boundary barrel.

**Files — Studio.** None.

**Files — tests (new)**
- `src/lib/content/requirements.test.ts` — new.

**Files — fixtures/seeds.** None.

**Changes at symbol level.** All additive. `requirements.ts` imports only `Pillar` and `ServiceKey` from `types.ts` — no `sanity` import, no Astro import, no I/O — so both the Studio and the build can consume it, in the direction the repo already uses (studio → src, never the reverse).

**Deletions.** None.

**Data implications.** None. No document shape changes; no document becomes invalid.

**Tests.**
- *New:* the eight service keys each resolve their documented field set (v3.1 §5, §7); `mergeRequirement` is commutative, associative and idempotent; `not-applicable` is the fold identity; **the collision cases** — `['vizualizare-3d','proiectare-arhitectura']` → `location: mandatory` (v3.1 §8 example C), `['design-interior','design-mobilier']` → location/area/implementationCompany mandatory and awards optional (example A), `['scanare-laser-3d','scan-to-bim']` → example B; A&D base gives `description: mandatory` and RC base gives `description: optional`; A&D base gives `collaborators/team: optional` while RC base gives `not-applicable` until a service raises them; the tables are exhaustive over `SERVICE_KEYS` (a missing key is a compile error via `Record<ServiceKey, …>`, and a test asserts the runtime key set matches).
- *Update / delete:* none.

**Verification checkpoint**
```bash
npm run check
```
```bash
npm test
```

**Stop condition.** `npm run check` reports 0 errors. `npm test` reports 28+1 files and 542+N tests passing, **including the live suite** (this stage changes nothing the live dataset can violate — it is the last stage that runs with credentials until Stage 9).

---

### Stage 2 — Retire the Employer / Professional Experience surface

**Goal.** No code path depends on the Employer document type or on Attribution-driven curated membership. **The `professionalExperience` route key, its two localized paths and both reserved slugs survive untouched** — reservation is generated from `ROUTES`, not from page existence, and this stage proves that with a test.

> **PRODUCT DECISION — 2026-08-14. Professional Experience is PERMANENTLY RETIRED.** It is not awaiting an editorial decision and there is no replacement membership rule to design. The **About / Despre** page is the surviving home for professional-background content. Accordingly: **do not invent a Label, a taxonomy axis or any other membership rule to replace it, and do not plan to restore the view.** The two routes 404 after this stage; **`experienta-profesionala` and `professional-experience` stay reserved** so no Work Entry can claim a historical slug. Recorded at `DECISIONS_LOG.md` #97.

**Files — production/source**
- `src/lib/content/types.ts` — delete `Employer`, `EmployerGroup`; delete `WorkEntry.employer`, `WorkArchiveItem.employer`.
- `src/lib/content/source.ts` — delete `isProfessionalExperience()`, `groupByEmployer()`, `ContentSource.professionalExperience()`, `ContentSource.employers()`, `RawDocuments.employers()`, the `employers` entry in `createSanityDocuments()`, the `EmployerGroup` re-export, and the `'professionalExperience'` member of `CuratedView`.
- `src/lib/content/groq.ts` — delete `RawEmployer`, `EMPLOYER_FIELDS`, the `EMPLOYER` projection, `QUERY_ALL_EMPLOYERS`, and the `employer` key from `WORK_ARCHIVE_ITEM_FIELDS` and `WORK_ENTRY_FIELDS`.
- `src/lib/content/normalize.ts` — delete `normalizeEmployer()`; drop the employer↔attribution consistency throw in `normalizeWorkEntry` (its partner rule dies in S3).
- `src/lib/content/validation.ts` — delete `validateEmployerScope()`.
- `src/components/work-archive/CuratedProfessionalExperience.astro` — **delete file.**
- `src/pages/proiecte/experienta-profesionala.astro`, `src/pages/en/projects/professional-experience.astro` — **delete files.**
- `src/components/work-archive/ArchiveContinue.astro` — remove the `professionalExperience` destination (otherwise it links to a page that no longer builds).
- `src/components/homepage/CuratedViews.astro` — remove the `experience` prop, the employer-name line and the Professional Experience half of the module.
- `src/components/homepage/Homepage.astro` — remove the `source.professionalExperience(locale)` call from the parallel fetch.
- `src/components/work-entry/Credits.astro` — remove the employer row and the Professional Experience link only. **The rest of Credits is S3's.**
- `src/components/GlobalHeader.astro` — **leave `workRoutes` alone.** It is a "which route keeps *Proiecte* current" set; keeping the key is harmless and avoids touching a tested nav invariant. It is not a navigation link to the retired view.
- `src/lib/i18n/work-archive.ts`, `work-entry.ts`, `homepage.ts` — remove the now-unreferenced `professionalExperience` / `employer` message keys.

**Files — Studio**
- `studio/schemaTypes/employer.ts` — **delete file.**
- `studio/schemaTypes/index.ts` — remove the import and the `employer` registration; correct the header comment.
- `studio/schemaTypes/workEntry.ts` — delete the `employer` field and its validator.
- `studio/structure.ts` — delete the *Professional experience* desk pane.
- `studio/scripts/verify-validation-levels.ts` — remove the employer probe document and its expectations.

**Files — tests**
- `src/lib/content/source.test.ts` — delete the `professionalExperience` and `employers` cases; update the ContentSource method-name assertion at line ~305.
- `src/lib/content/live.test.ts` — remove `QUERY_ALL_EMPLOYERS` / `validateEmployerScope` from imports, the employer entry in the fixture⇄live method table (~line 771) and the `professionalExperience` live case (~line 600); **remove `validateEmployerScope` from the always-on seed pre-flight.**
- `src/components/work-archive/routes.test.ts`, `src/lib/i18n/routes.test.ts`, `src/components/global-header.test.ts` — **do not weaken.** The `professionalExperience` route assertions must keep passing; that is the point.
- *New:* a test asserting `RESERVED_SLUGS.ro` still contains `experienta-profesionala` and `RESERVED_SLUGS.en` still contains `professional-experience` with no page present.

**Files — fixtures/seeds**
- `src/lib/content/fixtures.ts` — remove the `emp-1` employer fixture, `employer` fields, and the employer document set.
- NDJSON seeds — **not this stage** (Stage 9). Live suite is paused from here.

**Deletions (inventory).** `Employer`, `EmployerGroup`, `RawEmployer`, `EMPLOYER_FIELDS`, `QUERY_ALL_EMPLOYERS`, `normalizeEmployer`, `isProfessionalExperience`, `groupByEmployer`, `ContentSource.professionalExperience`, `ContentSource.employers`, `validateEmployerScope`, the `employer` Sanity document type, `CuratedProfessionalExperience.astro`, two page routes.

**Retained deliberately.** `ROUTES.professionalExperience`, `CURATED_WORK_ROUTES`, both reserved slugs, `RouteKey`'s `professionalExperience` member — **retained solely to keep the two historical slugs reserved**, not as a placeholder for a future view. **`/proiecte/experienta-profesionala` and `/en/projects/professional-experience` return 404 permanently.**

**Data implications.** Existing documents keep an `employer` reference field the schema no longer declares; Sanity tolerates undeclared fields, and the projection stops selecting it. **No document becomes unpublishable.** Stage 10's preflight strips the orphaned field.

**Tests — edge cases.** Reserved slugs survive page deletion. A Work Entry attempting `experienta-profesionala` as its slug is still rejected. The homepage renders with the Competitions half alone.

**Verification checkpoint**
```bash
npm run check
```
```bash
SANITY_READ_TOKEN= npm test
```
```bash
cd studio && npm run check
```

**Stop condition.** `npm run check` 0 errors; `SANITY_READ_TOKEN= npm test` all-pass with the live block skipped (32 skipped is the expected count until seeds change); `studio` `tsc --noEmit` clean. `grep -rn "employer\|Employer" src studio --include="*.ts" --include="*.astro" | grep -v node_modules` returns only i18n strings intentionally left, or nothing.

---

### Stage 3 — Retire Attribution, Commissioning, Roles and Authorship

**Goal.** Crediting is carried by `Colaboratori` and `Echipă` alone. No authorship-specific validation exists anywhere. **`validateAuthorship()` is deleted, not re-keyed.**

**Audit gate before deleting (required by the brief).** Confirm each helper carries no unrelated surviving responsibility:
- `validateAuthorship()` — sole responsibility is the Visualization-Commission / Studio / Collaboration credit rule. **Verified attached twice in `studio/schemaTypes/workEntry.ts`** (once as an error rule, once via `.warning()`), and once in `live.test.ts`'s seed pre-flight. No other caller. **Safe to delete outright.**
- `validateAssignment()` — called only for `discipline` and `entryType`. Both die (S4, S5). **Do not delete here**; it becomes dead at S5 and is removed there.
- `oneOf()` in `normalize.ts` — also normalizes `status`, `pillar`, `prominence`. **Keep.**
- `localize()` in `derive.ts` — general-purpose. **Keep.**

**Files — production/source**
- `src/lib/content/types.ts` — delete `ATTRIBUTIONS`/`Attribution`, `COMMISSIONING_CONTEXTS`/`CommissioningContext`, `AuthorshipStatement`; delete `WorkEntry.attribution`, `.commissioning`, `.roles`, `.authorship`, and `WorkArchiveItem.attribution`.
- `src/lib/content/validation.ts` — delete `validateAuthorship()`; remove `attribution` and `commissioning` from `VOCABULARIES`.
- `src/lib/content/groq.ts` — remove `attribution`, `commissioning`, `roles`, `authorship` from `RawWorkEntry`, `RawWorkArchiveItem` and both projection maps.
- `src/lib/content/normalize.ts` — remove the corresponding normalization.
- `src/components/work-entry/Credits.astro` — reduce to Collaborators + Team; **the module must not render when both are empty** (v3.1 §13; same rule as W-5).
- `src/components/work-entry/modules.ts` — `credits` stops being unconditional; add a `hasCredits(entry)` predicate and gate the module on it. *(This changes rail-station numbering — see tests.)*
- `src/lib/i18n/vocabulary.ts` — delete `ATTRIBUTION_LABELS`/`attributionLabel()`, `COMMISSIONING_LABELS`/`commissioningLabel()`.
- `src/lib/i18n/work-entry.ts` — remove `attribution`, `authorship`, `roles` label keys.
- `src/components/work-entry/ProjectMetadata.astro` — remove the commissioning row.

**Files — Studio**
- `studio/schemaTypes/workEntry.ts` — delete the `attribution`, `commissioning`, `roles`, `authorship` fields and **both** `validateAuthorship` attachments; the `credits` field group keeps only Collaborators/Team *(which live on `metadata`; consider whether the group survives — see S8)*.
- `studio/schemaTypes/fields.ts` — delete `ATTRIBUTION_OPTIONS`, `COMMISSIONING_OPTIONS` and their entries in `VOCABULARY_VALUES`.
- `studio/scripts/verify-validation-levels.ts` — remove authorship expectations from the probe documents.

**Files — tests**
- `src/lib/content/validation.test.ts` — **delete** the `validateAuthorship` and vocabulary cases for the two removed vocabularies.
- `src/components/work-entry/modules.test.ts` — update station numbering; **add** the new case: an entry with neither Collaborators nor Team renders no Credits module.
- `src/lib/content/live.test.ts` — remove `validateAuthorship`/`validateVocabulary('attribution')` from the always-on seed pre-flight.
- `src/lib/content/source.test.ts`, `content.test.ts`, `query-shape.test.ts` — drop removed keys.

**Files — fixtures/seeds.** `fixtures.ts` — remove the four fields from every fixture entry.

**Deletions.** `Attribution`, `ATTRIBUTIONS`, `CommissioningContext`, `COMMISSIONING_CONTEXTS`, `AuthorshipStatement`, `validateAuthorship`, `attributionLabel`, `commissioningLabel`, `ATTRIBUTION_OPTIONS`, `COMMISSIONING_OPTIONS`, four Studio fields, three i18n label sets.

**Data implications.** Existing documents keep orphaned fields; nothing becomes unpublishable. **A visualization project loses its enforced credit sentence** — this is the recorded client decision (`DECISIONS_LOG.md` #91), and the substitute is authored Description prose. Flag it to the content owner at Stage 9, not silently.

**Tests — edge cases.** Credits absent when both lists are empty; Credits present with only Team; **rail-station numbering stays contiguous** when Credits is absent (this is the regression `modules.test.ts` exists to catch).

**Verification checkpoint**
```bash
npm run check
```
```bash
SANITY_READ_TOKEN= npm test
```
```bash
cd studio && npm run check
```

**Stop condition.** All three green. `grep -rniE "attribution|authorship|commissioning" src studio --include="*.ts" --include="*.astro" | grep -v node_modules` returns nothing outside comments explicitly marked historical.

---

### Stage 4 — Entry Type → Labels

**Goal.** `labels` is the only editorial-flag axis. Competition membership — curated view, Studio pane, W-4 module, archive filter — derives from `labels contains 'competition'`. No Entry Type exists.

**Files — production/source**
- `src/lib/content/types.ts` — delete `ENTRY_TYPES`/`EntryType`/`EntryTypeAssignment`; add `labels: readonly ProjectLabel[]` to `WorkEntry`, `WorkEntrySummary` and `WorkArchiveItem`; delete `entryType` from all three.
- `src/lib/content/validation.ts` — remove `entryType` from `VOCABULARIES`; add `label` with `PROJECT_LABELS`.
- `src/lib/content/groq.ts` — delete `ENTRY_TYPE_ASSIGNMENT`; replace `entryType` with `labels: 'coalesce(labels, [])'` in all three projection maps and raw types.
- `src/lib/content/normalize.ts` — delete `normalizeEntryType()`; add `normalizeLabels()` (unknown value → build error via `oneOf`, absent → `[]`).
- `src/lib/content/derive.ts` — `toWorkEntrySummary()` carries `labels` instead of `entryType`.
- `src/lib/content/source.ts` — replace `isCompetition()` with `hasLabel(item, label)`; `curatedView('competitions')` filters on `hasLabel(item, 'competition')`.
- `src/components/work-entry/modules.ts` — `isCompetitionEntry()` → `hasCompetitionLabel(entry)`; `awardsAndTeamInCompetition()` keeps its evidence guard unchanged.
- `src/components/work-archive/archive-state.ts` — delete `ARCHIVE_PARAMS.type`, `ArchiveState.type`, `ArchiveItemFacets.types`, `ArchiveFacetValues.types`; add `label` in the same positions.
- `src/components/work-archive/facets.ts` — `itemFacets().types` → `.labels`; `collectFacetValues().types` → `.labels` ordered by `PROJECT_LABELS`.
- `src/components/work-archive/ArchiveFilters.astro` — the `data-facet="type"` chip group becomes `data-facet="label"`.
- `src/components/work-archive/ResultsGrid.astro` — `data-facet-types` → `data-facet-labels`.
- `src/scripts/islands/work-archive.ts` — the matching dataset key, option lookup and readout label.
- `src/components/WorkPreviewCard.astro` — **the card's facet line becomes Sector**, not Entry Type (`entry.sectors[0]` today; becomes `entry.sector` at S6). Optionally badge `competition`.
- `src/components/work-entry/ProjectMetadata.astro` — Entry Type row → Labels row.
- `src/lib/i18n/vocabulary.ts` — delete `ENTRY_TYPE_LABELS`/`entryTypeLabel()`; add `LABEL_LABELS`/`projectLabelLabel()` (RO: `CONCURS`, `PROIECT DE DIPLOMĂ`).
- `src/lib/i18n/work-archive.ts`, `work-entry.ts` — `entryType` facet/label copy → `label`.

**Files — Studio**
- `studio/schemaTypes/workEntry.ts` — delete the `entryType` field; add `labels` (array of string, `options.list` from `LABEL_OPTIONS`, `layout: 'grid'`, `Rule.unique()`, initial `[]`).
- `studio/schemaTypes/fields.ts` — delete `ENTRY_TYPE_OPTIONS`; add `LABEL_OPTIONS` with `satisfies CompleteList<ProjectLabel>`.
- `studio/structure.ts` — the Competitions pane filter becomes `_type == "workEntry" && "competition" in labels`.
- `studio/scripts/verify-validation-levels.ts` — drop `entryType` from probes.

**Files — tests**
- `archive-state.test.ts` — `type` → `label` throughout; **new:** `?type=competition-entry` parses to the default state (legacy tolerance).
- `modules.test.ts` — competition toggle keys off the label.
- `source.test.ts`, `content.test.ts`, `query-shape.test.ts`, `highlights.test.ts`, `preview.test.ts` — key changes.
- `live.test.ts` seed pre-flight — drop the `entryType` assignment validation.

**Files — fixtures.** `fixtures.ts` — `entryType` → `labels` on every entry; keep one competition-labelled entry and add one carrying **both** labels.

**Deletions.** `ENTRY_TYPES`, `EntryType`, `EntryTypeAssignment`, `normalizeEntryType`, `isCompetition`, `isCompetitionEntry`, `entryTypeLabel`, `ENTRY_TYPE_LABELS`, `ENTRY_TYPE_OPTIONS`, `ENTRY_TYPE_ASSIGNMENT`, `ARCHIVE_PARAMS.type`.

**Data implications.** **Existing documents temporarily have no `labels` and lose competition membership.** The Competitions view renders empty against un-migrated data until Stage 9 re-seeds. Expected and bounded — the live suite is paused.

**Tests — edge cases.** Both labels on one project; zero labels; an unknown label value fails the build in `normalize`; **`/proiecte/concursuri` still resolves and still renders the empty state cleanly**; `?type=` and `?label=nonsense` both fall back to default state.

**Verification checkpoint**
```bash
npm run check
```
```bash
SANITY_READ_TOKEN= npm test
```
```bash
npm run build
```

**Stop condition.** All green, **including `npm run build`** — this is the first stage that changes a public route's membership, and `postbuild` runs the client-bundle and dev-media guards. `/proiecte/concursuri` and `/en/projects/competitions` must exist in `dist/`.

---

### Stage 5 — Discipline → authored Pillar

**Goal.** Pillar is a stored, authored, single value. No derivation, no primary/secondary, no cross-pillar entry. Service becomes the archive's contextual refinement in **both** pillars.

**Files — production/source**
- `src/lib/content/types.ts` — delete `DISCIPLINES`/`Discipline`/`DisciplineAssignment`, `DISCIPLINE_TO_PILLAR`, `PillarAssignment`; `WorkEntry.pillars` → `pillar: Pillar`; same on `WorkEntrySummary`; delete `WorkArchiveItem.discipline`; add `key: ServiceKey` to `ServiceRef` and `ServiceSummary`.
- `src/lib/content/derive.ts` — **delete `derivePillars()` and `isCrossPillar()`. Keep `localize`, `isEnAvailable`, `EnGated`, `toWorkEntrySummary`, `toServiceSummary`** — the file survives.
- `src/lib/content/validation.ts` — remove `discipline` from `VOCABULARIES`; **delete `validateAssignment()`** (now dead, per S3's audit gate).
- `src/lib/content/groq.ts` — delete `DISCIPLINE_ASSIGNMENT`; replace `discipline` with `pillar: 'pillar'` in all three projection maps; add `key` to `SERVICE_SUMMARY_FIELDS` and to `WORK_ARCHIVE_ITEM_FIELDS.services`.
- `src/lib/content/normalize.ts` — delete `normalizeDiscipline()`; `pillar` via `oneOf(raw.pillar, PILLARS, …)`.
- `src/lib/content/order.ts` — `Orderable.pillars: PillarAssignment` → `pillar: Pillar`; `inPillarScope()` becomes equality; `discoveryOrder()` queues by `item.pillar`.
- `src/components/work-archive/archive-state.ts` — delete `ARCHIVE_PARAMS.discipline`, `ArchiveState.discipline`, `ArchiveItemFacets.disciplines`, `ArchiveFacetValues.disciplines`; **`contextualFacet()` collapses** — Service is offered under both pillar modes *(and under `all`; see Q11)*.
- `src/components/work-archive/facets.ts` — delete the disciplines projection; **remove the `summary.pillar !== 'reality-capture'` hard filter in `serviceOptions()`** and scope by the active pillar mode instead; `itemFacets().pillars` becomes a single-element list.
- `src/components/work-archive/ArchiveFilters.astro`, `ResultsGrid.astro`, `src/scripts/islands/work-archive.ts` — remove the Discipline control, its dataset key and its readout.
- `src/components/work-entry/ProjectMetadata.astro` — remove the Discipline row.
- `src/components/WorkPreviewCard.astro`, `src/components/pillar-hub/hub.ts`, `src/components/work-archive/preview.ts` — `pillars.primary` → `pillar`.
- `src/lib/i18n/vocabulary.ts` — delete `DISCIPLINE_LABELS`/`disciplineLabel()`.
- `src/lib/i18n/work-archive.ts`, `work-entry.ts` — remove Discipline facet/label copy.

**Files — Studio**
- `studio/schemaTypes/workEntry.ts` — delete the `discipline` field, `isRealityCapture()` and `derivedPillarLabel()`; add authored `pillar` (`options.list` from `PILLAR_OPTIONS`, `layout: 'radio'`, `Rule.required()`); re-key the **Survey** field group's `hidden` callback onto `document.pillar !== 'reality-capture'`; rewrite the document `preview.prepare` subtitle to read the authored pillar.
- `studio/schemaTypes/fields.ts` — delete `DISCIPLINE_OPTIONS` and its `VOCABULARY_VALUES` entry.
- `studio/structure.ts` — delete `disciplinesOf()` and the `IN_PILLAR` GROQ predicate; both pillar panes become `_type == "workEntry" && pillar == $pillar`.
- `studio/scripts/verify-validation-levels.ts` — probes carry `pillar`.

**Files — tests**
- `order.test.ts` — single-pillar `Orderable`; **delete the cross-pillar interleaving cases and replace them** with single-pillar balancing.
- `archive-state.test.ts` — remove discipline; **new:** Service refinement available under both pillar modes; `?discipline=` ignored.
- `content.test.ts`, `source.test.ts`, `query-shape.test.ts`, `preview.test.ts`, `hub.test.ts`, `highlights.test.ts` — shape changes.
- `live.test.ts` — remove `DISCIPLINE_TO_PILLAR` import, the discipline seed pre-flight and the cross-pillar derivation live case.
- **Delete:** every test asserting Pillar derivation or cross-pillar dual membership. There is no honest v3.1 equivalent.

**Files — fixtures.** `fixtures.ts` — authored `pillar` on every entry; **the cross-pillar fixture becomes two linked entries** (this is the fixture that proves the replacement relationship).

**Deletions.** `Discipline`, `DISCIPLINES`, `DisciplineAssignment`, `DISCIPLINE_TO_PILLAR`, `PillarAssignment`, `derivePillars`, `isCrossPillar`, `normalizeDiscipline`, `validateAssignment`, `disciplineLabel`, `DISCIPLINE_LABELS`, `DISCIPLINE_OPTIONS`, `DISCIPLINE_ASSIGNMENT`, `disciplinesOf`, `IN_PILLAR`, `derivedPillarLabel`, `isRealityCapture`, `ARCHIVE_PARAMS.discipline`.

**Data implications.** **This is the first stage where existing documents become genuinely invalid**: no live document has an authored `pillar`, so `normalize` throws at build. Bounded by the paused live suite and by fixtures being the only source under test. **Do not run a build against a live dataset between Stage 5 and Stage 9.**

**Tests — edge cases.** A document with no `pillar` fails the build loudly (not silently defaulted). Two linked entries surface independently in their own pillars. Discovery-order balancing still interleaves with single-valued pillars. The Service refinement lists only the active pillar's services.

**Verification checkpoint**
```bash
npm run check
```
```bash
SANITY_READ_TOKEN= npm test
```
```bash
cd studio && npm run check
```

**Stop condition.** All green. `grep -rni "discipline" src studio --include="*.ts" --include="*.astro" | grep -v node_modules` returns nothing. **`npm run build` is expected to fail against live data and must not be treated as a gate here** — it returns as a gate at Stage 9.

---

### Stage 6 — Sector: array → single closed value

**Goal.** Every project carries exactly one Sector from the closed seven-value vocabulary.

**Files — production/source**
- `src/lib/content/types.ts` — delete `KNOWN_SECTORS` and the open `Sector = KnownSector | (string & {})`; promote `SECTORS`/`Sector` from Stage 1 to the closed union; `WorkEntry.sectors` → `sector: Sector`; same on `WorkEntrySummary` and `WorkArchiveItem`. **`Service.sectors` stays an array** — decided 2026-08-14: it means "typical sectors", a genuinely plural and optional concept — but its member type closes onto the same vocabulary.
- `src/lib/content/validation.ts` — add `sector` to `VOCABULARIES`.
- `src/lib/content/groq.ts` — `sectors: 'sectors'` → `sector: 'sector'` on the three work projections; `Service.sectors` unchanged.
- `src/lib/content/normalize.ts` — `normalizeSectors()` → `normalizeSector()` via `oneOf`; keep an array normalizer for `Service.sectors`, now vocabulary-checked.
- `src/components/work-archive/facets.ts` — `itemFacets().sectors` becomes single-element; `collectFacetValues()` orders by `SECTORS` and drops the open-value tail.
- `src/components/WorkPreviewCard.astro` — `entry.sectors[0]` → `entry.sector`.
- `src/components/work-entry/ProjectMetadata.astro` — the joined sector list becomes one value.
- `src/lib/i18n/vocabulary.ts` — replace `SECTOR_LABELS` with the seven new values in RO/EN. The de-slugging fallback is **deleted**: both fields now share one closed vocabulary, so an unknown token can no longer reach a label lookup.

**Files — Studio**
- `studio/schemaTypes/workEntry.ts` — `sectors` array → `sector` string with `options.list` (`layout: 'radio'` or `dropdown`), `Rule.required()`; delete the ad-hoc `SLUG_PATTERN` check.
- `studio/schemaTypes/service.ts` — `sectors` keeps `layout: 'tags'` but gains `options.list` and vocabulary validation.
- `studio/schemaTypes/fields.ts` — `SECTOR_OPTIONS` rebuilt from `SECTORS` with authored RO titles (**not** `charAt(0).toUpperCase()`, which cannot produce "Comercial & ospitalitate").

**Files — tests.** `archive-state.test.ts`, `content.test.ts`, `source.test.ts`, `query-shape.test.ts`, `preview.test.ts`; **new:** an unknown sector fails the build; the sector facet lists in vocabulary order.

**Files — fixtures.** `fixtures.ts` — one sector per entry, from the new vocabulary.

**Deletions.** `KNOWN_SECTORS`, `KnownSector`, the open `Sector`, `normalizeSectors` (work entries), the old eight-value `SECTOR_LABELS`.

**Data implications.** **Lossy for any document with two or more sectors** — Stage 10's preflight must flag, never auto-pick. Old values (`residential`, `heritage`, …) are not in the new vocabulary and fail `oneOf` loudly.

**Verification checkpoint**
```bash
npm run check
```
```bash
SANITY_READ_TOKEN= npm test
```

**Stop condition.** Both green; no reference to any old sector token remains in `src/` or `studio/`.

---

### Stage 7 — Status vocabulary replacement

**Goal.** Status is the four-value v3.1 vocabulary, mandatory and single-select in both pillars.

**Files — production/source**
- `src/lib/content/types.ts` — replace `STATUSES` values with `in-dezvoltare · in-desfasurare · finalizat · nerealizat`; rename `STATUSES_V31` from Stage 1 into place.
- `src/lib/i18n/vocabulary.ts` — replace `STATUS_LABELS` (RO without diacritics per OD-8: `In dezvoltare`, `In desfasurare`, `Finalizat`, `Nerealizat`; EN as agreed with C).
- No structural change: `metadata.status` keeps its shape and its `oneOf` normalization.

**Files — Studio.** `studio/schemaTypes/fields.ts` — `STATUS_OPTIONS` rebuilt; `objects.ts` — the `status` field description no longer references "Type".

**Files — tests.** `content.test.ts`, `validation.test.ts`, `source.test.ts`; **new:** every old status value is rejected by `oneOf`.

**Files — fixtures.** `fixtures.ts` — new status values; keep at least one of each.

**Deletions.** The four old status values and their labels.

**Data implications.** **Every existing document's status becomes invalid.** Mapping is defined in `PROJECT_MODEL_IMPACT.md` §3 and is **lossy** (`built-realized` and `delivered` both → `finalizat`; `in-dezvoltare` has no source). Preflight flags, never guesses.

**Verification checkpoint**
```bash
npm run check
```
```bash
SANITY_READ_TOKEN= npm test
```

**Stop condition.** Both green; `grep -rn "built-realized\|unbuilt-proposal\|in-progress\|delivered" src studio --include="*.ts" --include="*.astro" | grep -v node_modules` returns nothing.

---

### Stage 8 — Services mandatory, pillar-constrained, key-driven field activation

**Goal.** The full v3.1 field contract is enforced. Stage 1's resolver becomes the single authority, read by the Studio and by the build.

**Files — production/source**
- `src/lib/content/types.ts` — `WorkEntry.services` becomes non-empty by contract; add `metadata.equipment: readonly string[]` and `metadata.implementationCompany: string | null`; **remove `equipment` from `CaptureMetadata`**; add `key: ServiceKey` to `Service`.
- `src/lib/content/validation.ts` — new rules, all built on `requirements.ts`:
  - `validateServicesPresent(serviceCount)`
  - `validateServicePillarConsistency(projectPillar, services: {key, pillar}[])`
  - `validateFieldRequirements(pillar, serviceKeys, presence: Record<ProjectField, boolean>)` — one rule, one table, emitting one issue per unmet mandatory field
- `src/lib/content/groq.ts` — `metadata` gains `equipment` and `implementationCompany`; `CAPTURE_FIELDS` loses `equipment`; `WORK_ARCHIVE_ITEM_FIELDS.services` gains `key` and `pillar`.
- `src/lib/content/normalize.ts` — normalize the new metadata fields; **build-time enforcement**: run `validateFieldRequirements` in `normalizeWorkEntry` and throw on error, exactly as the draft-id assertion already does.
- `src/components/media/PointCloudField.astro` — **the only consumer of `capture.equipment`** (line 114). Read `metadata.equipment` instead; the prop shape changes.
- `src/components/work-entry/ProjectMetadata.astro` — render Equipment and Implementation Company when present.
- `src/lib/i18n/work-entry.ts` — labels for the two new fields.

**Files — Studio**
- `studio/schemaTypes/workEntry.ts` — `services` gains `Rule.required().min(1)` and `options.filter` scoping by `document.pillar` (**the `relatedWork` field already uses `options.filter` with params — same mechanism, proven in this repo**); a document-level async rule fetches the referenced services' pillars and errors on a mismatch; conditional fields gain `hidden` callbacks driven by `resolveRequirements(...) === 'not-applicable'` and validators driven by `=== 'mandatory'`.
- `studio/schemaTypes/objects.ts` — `workEntryMetadata` gains `equipment` and `implementationCompany`; `captureMetadata` loses `equipment`; `client` loses "leave empty for self-initiated work".
- `studio/schemaTypes/service.ts` — add the required immutable `key` field (`options.list` from `SERVICE_KEY_OPTIONS`, `readOnly: ({value}) => Boolean(value)`, `Rule.required()`, uniqueness checked by async fetch).
- `studio/schemaTypes/fields.ts` — `SERVICE_KEY_OPTIONS` with `satisfies CompleteList<ServiceKey>`.
- `studio/scripts/verify-validation-levels.ts` — add probes for each new blocking rule.

**Files — tests**
- **New:** `validateFieldRequirements` against every worked example in v3.1 §8; the pillar/service consistency rule; a project with zero services; an RC project with no Description passing; an A&D project with no Description failing; a `design-mobilier` project missing Implementation Company failing.
- **Update:** `validation.test.ts`, `source.test.ts`, `render.test.ts`, `modules.test.ts`, `preview.test.ts`.
- **Delete:** nothing that is not already gone.

**Files — fixtures.** `fixtures.ts` — every fixture gains services with keys and satisfies its resolved requirements; add the two multi-service collision fixtures.

**Deletions.** `CaptureMetadata.equipment`, the "leave empty for self-initiated" description, any remaining unconditional metadata validation.

**Data implications.** **Every existing document is now invalid** until it carries a pillar, at least one service, a sector, a v3.1 status and the fields its services activate. This is the intended end state; it is why Stage 9 exists.

**Tests — edge cases.** Two services where one says optional and the other mandatory → mandatory. `not-applicable` fields are hidden in the Studio, not merely unvalidated. **A Service renamed in the Studio does not change field activation** (assert against `key`, with title and slug changed in the fixture). Changing a project's Pillar with services from the other pillar produces a blocking error, not a silent drop.

**Verification checkpoint**
```bash
npm run check
```
```bash
SANITY_READ_TOKEN= npm test
```
```bash
cd studio && npm run check
```
```bash
cd studio && npx tsx scripts/verify-validation-levels.ts
```
*(Confirm the script's actual invocation from `studio/README.md` before relying on the last command — it is not wired into a package script today.)*

**Stop condition.** All green, and every rule in the verify-validation-levels output is at the intended level (`error` vs `warning`). **This is the last stage before the data catches up.**

---

### Stage 9 — Seeds, dataset re-import, live suite restored

**Goal.** The `development` dataset satisfies v3.1 and the full `npm test` — live suite included — is green again.

**Files — fixtures/seeds**
- `studio/seed/b3-test-dataset.ndjson` — rewritten: authored `pillar`, `sector`, `labels`, `services` with `key`, new statuses, `metadata.equipment`, no retired fields; **one document per contract**, including a both-labels project, a multi-service collision project, and the two linked replacements for the old cross-pillar entry.
- `studio/seed/i4-minimum-content.ndjson`, `studio/seed/qa-carousel-population.ndjson` — same treatment; the eight real Service documents replace the four `TEST —` demo services (or are added alongside, per `studio/seed/README.md`'s namespacing rule that every seed id starts `da-test-`).
- `studio/seed/README.md` — update the coverage table and the import/teardown commands.

**Files — tests.** `src/lib/content/live.test.ts` — the seed pre-flight's validator set becomes the v3.1 set; the live assertions lose derivation/cross-pillar/employer cases and gain pillar-authoring, service-key and requirement cases.

**Operational steps (not code).** Teardown the old seed and import the new one, using the commands already documented in `studio/seed/README.md`:
```bash
cd studio && npx sanity dataset import seed/b3-test-dataset.ndjson development
```
Run the documented teardown first; all three files must be re-imported together, as that README already warns.

**Data implications.** `development` is rebuilt. **`production` is not touched** — that is Stage 10.

**Verification checkpoint**
```bash
npm test
```
```bash
npm run build
```

**Stop condition.** **Full `npm test` green with credentials present — 28 files, all tests, zero skipped in the live block.** `npm run build` green including `postbuild`. This is the checkpoint that proves the whole migration.

---

### Stage 10 — Production preflight tooling + dead-code sweep

**Goal.** A safe, reviewable path exists for any real content in the `production` dataset, and the compiler + a grep gate prove no retired concept survives.

**Files — production/source.** None.

**Files — new tooling (write, do not execute)**
- `studio/scripts/preflight-v31.ts` — **read-only report, no writes.** Against a named dataset, it lists per document: derived pillar candidate (from the old `DISCIPLINE_TO_PILLAR` table, embedded in the script rather than re-imported, since the runtime table is deleted); competition label candidate; sector candidates and **whether there is more than one** (human decision); status candidate and **whether the mapping is lossy**; missing mandatory fields under the resolved requirements; cross-pillar entries needing a human split; services that do not yet exist. Output: a table plus a machine-readable JSON manifest.
- `studio/scripts/migrate-v31.ts` — **written but not run**, and gated behind an explicit `--apply` plus a required `--dataset` that refuses `production` unless `--i-mean-it` is also passed. Consumes only the manifest rows the preflight marked unambiguous; every flagged row is skipped and reported.
- `studio/README.md` — document both, including the order (**Services first, then projects** — services must exist before a project can reference one).

**Dead-code sweep.**
```bash
grep -rniE "discipline|entrytype|entry type|attribution|authorship|employer|commissioning|\broles\b" src studio scripts --include="*.ts" --include="*.astro" --include="*.mjs" | grep -v node_modules
```
Expected: no hits outside deliberately-marked historical comments. Then re-read `src/lib/content/index.ts` for exports nothing imports, and confirm `derive.ts` still earns its place (it does — `localize`, `isEnAvailable`, the two projections).

**Verification checkpoint**
```bash
npm test
```
```bash
npm run build
```
```bash
npm run check
```
```bash
cd studio && npm run check
```

**Stop condition.** All four green; the grep gate returns clean; the preflight script runs read-only against `development` and reports zero unresolved rows there.

---

## 4. Deletion inventory (consolidated)

| Stage | Symbols / files deleted |
|---|---|
| **2** | `Employer`, `EmployerGroup`, `RawEmployer`, `EMPLOYER_FIELDS`, `QUERY_ALL_EMPLOYERS`, `normalizeEmployer`, `isProfessionalExperience`, `groupByEmployer`, `ContentSource.professionalExperience`, `ContentSource.employers`, `validateEmployerScope`, `studio/schemaTypes/employer.ts`, `CuratedProfessionalExperience.astro`, 2 page files, 1 Studio desk pane |
| **3** | `Attribution`, `ATTRIBUTIONS`, `CommissioningContext`, `COMMISSIONING_CONTEXTS`, `AuthorshipStatement`, **`validateAuthorship`**, `attributionLabel`, `commissioningLabel`, `ATTRIBUTION_OPTIONS`, `COMMISSIONING_OPTIONS`, 4 Studio fields |
| **4** | `ENTRY_TYPES`, `EntryType`, `EntryTypeAssignment`, `normalizeEntryType`, `isCompetition`, `isCompetitionEntry`, `entryTypeLabel`, `ENTRY_TYPE_LABELS`, `ENTRY_TYPE_OPTIONS`, `ENTRY_TYPE_ASSIGNMENT`, `ARCHIVE_PARAMS.type` |
| **5** | `Discipline`, `DISCIPLINES`, `DisciplineAssignment`, `DISCIPLINE_TO_PILLAR`, `PillarAssignment`, `derivePillars`, `isCrossPillar`, `normalizeDiscipline`, **`validateAssignment`**, `disciplineLabel`, `DISCIPLINE_LABELS`, `DISCIPLINE_OPTIONS`, `DISCIPLINE_ASSIGNMENT`, `disciplinesOf`, `IN_PILLAR`, `derivedPillarLabel`, `isRealityCapture`, `ARCHIVE_PARAMS.discipline` |
| **6** | `KNOWN_SECTORS`, `KnownSector`, open `Sector`, `normalizeSectors` (work), old `SECTOR_LABELS` |
| **7** | 4 old status values + labels |
| **8** | `CaptureMetadata.equipment` |

**Files that survive despite carrying a retired name:** `src/lib/content/derive.ts` (keeps `localize`, `isEnAvailable`, `EnGated`, `toWorkEntrySummary`, `toServiceSummary`); `normalize.ts::oneOf` (still normalizes status, pillar, prominence, labels); `ROUTES.professionalExperience` + `CURATED_WORK_ROUTES` (**deliberately retained so both slugs stay reserved**).

---

## 5. Data & migration strategy

**Repository-owned data — rewritten, never migrated.** `src/lib/content/fixtures.ts` (per stage) and the three `studio/seed/*.ndjson` files (Stage 9). All seed ids are `da-test-` namespaced and the live harness refuses to run against `production`.

**The `development` dataset — rebuilt at Stage 9** via the teardown/import commands already in `studio/seed/README.md`. Invalid from Stage 5 to Stage 9; the paused live suite is what makes that safe.

**The `production` dataset — never touched by this plan.** Stage 10 delivers a read-only preflight and a gated migration script. Contents unknown from the repository; **confirm before Stage 9.** Required transformations and their automation status:

| Transformation | Automatable? |
|---|---|
| `pillar` ← `DISCIPLINE_TO_PILLAR[discipline.primary]` | **Yes**, for single-pillar entries |
| Cross-pillar entry → two linked projects, or one pillar | **No — human** |
| `entryType == competition-entry` (primary or secondary) → `labels: ['competition']` | **Yes** |
| Drop `discipline`, `entryType`, `attribution`, `commissioning`, `employer`, `roles`, `authorship`; delete `employer` docs | **Yes**, after a human check for office names worth preserving into Collaborators/Team |
| `sectors[]` → one `sector` | **Yes** for exactly one old sector; **No — human** for two or more |
| Status remap | **Yes** mechanically, but `built-realized`/`delivered` → `finalizat` is **lossy**; flag for review |
| `capture.equipment` → `metadata.equipment` | **Yes** |
| Populate mandatory `services` | **No — human.** Services must be authored first |
| Newly missing mandatory fields (Client, Cover, Gallery, Sector, service-driven Location/Area/Equipment/Implementation Company) | **Report only** |

**Ordering rule:** Services (with keys) → projects → links → curation. Enforced by the reference graph and already documented in `studio/CONTENT_INTAKE.md` §3.

---

## 6. Test strategy

- **Regression floor:** 542 tests today. No stage may reduce the *passing* count except by the tests it explicitly deletes as obsolete, and each such deletion is listed above with its replacement.
- **The pause is part of the contract.** Stages 2–8 run `SANITY_READ_TOKEN= npm test`; the expected shape is *510 passed / 32 skipped* until seeds change. A stage that reports a different skip count has touched something it should not have.
- **Nine always-on tests inside the live file** (secrets model + seed pre-flight) run regardless of credentials and move with the validators, not with the seed import. This is the coupling most likely to be missed.
- **New suites:** `requirements.test.ts` (S1) and the field-requirement/consistency suites (S8) are the heart of the change and deserve the most cases.
- **Deleted suites:** Pillar-derivation and cross-pillar cases (S5), `validateAuthorship`/`validateEmployerScope` cases (S2, S3). They have no honest v3.1 equivalent; replacing them with weakened assertions would be worse than deleting them.
- **Edge cases that must exist by the end:** requirement collision both ways; zero services; unknown vocabulary values failing the *build*, not silently defaulting; both labels on one project; Credits absent when empty; RC without Description passing; A&D without Description failing; a renamed Service not changing activation; a pillar switch stranding a service; reserved slugs surviving page deletion; `?type=`/`?discipline=` degrading to default state.

---

## 7. Risks and rollback boundaries

| Risk (from the brief) | Control |
|---|---|
| Studio accepts what runtime rejects | One shared pure module (`requirements.ts` + `validation.ts`) read by both, as the repo already does for slugs and vocabularies. `verify-validation-levels.ts` probes each rule's level. |
| Runtime accepts what Studio cannot author | Every runtime vocabulary is `satisfies CompleteList<T>`-checked into a Studio option list; an incomplete list is a compile error. |
| Title/slug rename changes Service behaviour | Activation keys off the immutable `key` field only. Studio marks it `readOnly` once set. A test renames title+slug and asserts identical activation. |
| Stale service refs after a Pillar change | Blocking validator, not a silent clear. `options.filter` is authoring help only — the repo already states this about `options.list`. |
| Old Sector arrays silently lose data | Preflight flags multi-sector documents for human selection; the migration script skips them. |
| Ambiguous Status migration | Lossy mappings are reported, never applied silently. |
| Cross-pillar content silently collapsed | Preflight flags; migration script refuses. The S5 fixture change models the intended replacement. |
| Competition routes break | S4's stop condition includes `npm run build` and an explicit check that both competition routes exist in `dist/`. |
| Reserved slugs silently freed | `ROUTES.professionalExperience` and `CURATED_WORK_ROUTES` are explicitly retained; S2 adds a test asserting both slugs stay reserved with no page present. |
| Empty Credits module renders | S3 gates the module on `hasCredits`, with a test for the empty case and for contiguous rail-station numbering. |
| RC accidentally requires Description | Encoded in `PILLAR_BASE_REQUIREMENTS`, with a test per pillar. |
| Equipment stays coupled to capture assets | S8 moves the field and updates `PointCloudField.astro`, its only consumer. A test asserts a capture-less project can still carry equipment. |
| Legacy Professional Experience logic surviving | S2 deletes the whole vertical; S10's grep gate proves it. The view is permanently retired, so a partial survival has no future consumer to justify it. |
| Mixed old/new contract published | **No deploy between Stage 1 and Stage 9.** Stages 5–8 knowingly leave live data invalid; `npm run build` is a gate only at S4, S9 and S10. |

**Rollback boundaries.** Each stage is one revertable commit; the axis decomposition means reverting one does not strand another, with two exceptions: **S2 before S3** and **S5 before S8**. The only irreversible step in the whole plan is the Stage 9 dataset re-import — take a `sanity dataset export` of `development` first.

---

## 8. Blockers

**One, and it is not blocking Stage 1.**

- **The `production` dataset's contents are unknown from the repository.** Whether it holds real Work Entries determines how much of Stage 10 is a report and how much is real migration. **Confirm before Stage 9**, not before Stage 1.

**Two items that needed a decision before the stage that consumes them.**

- ~~**Professional Experience membership** (editorial).~~ **CLOSED 2026-08-14 — the view is permanently retired** (`DECISIONS_LOG.md` #97). About / Despre covers the content need. No replacement rule is to be designed and the view is not to be restored. Both slugs stay reserved.
- ~~**`Service.sectors`**~~ — **CLOSED 2026-08-14 by product decision.** `Service.sectors` **stays plural**: an optional multi-select naming the sectors a Service is typically relevant in. It moves onto the **same closed seven-value vocabulary** as the project's Sector but is **not** converted to a scalar. The distinction is intentional and is now part of the model — *Project*: `sector: Sector`, mandatory, exactly one; *Service*: `sectors: Sector[]`, optional, many.
