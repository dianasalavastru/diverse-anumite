# `studio/seed/` — non-production test documents

> **2026-08-17 — migrated to `CONTENT_MODEL.md` v3.1 (Stage 9).** Every document here carries an authored **Pillar**, a single closed **Sector**, a v3.1 **Status**, 0..N **Labels**, and **1..N Services** that all belong to its own Pillar. **Discipline**, **Entry Type**, **Attribution**, **Employer**, **Roles**, **Authorship** and **Commissioning context** are gone from the data, and the `employer` documents are deleted with the type. See "What Stage 9 changed" below for the per-document record.
>
> **One field pair is deliberately absent: `cover` and `gallery`.** Both are **[M]** in the model and stay mandatory everywhere — they are simply **Sanity asset references**, and NDJSON cannot carry an asset. The seed is therefore *textual-contract complete* and *media-hydration pending*; the assets are attached to the dataset after import (see **Media hydration**). The pre-flight in `src/lib/content/live.test.ts` states that distinction explicitly, and the live suite enforces the full contract with no exception.


**Owner: Workstream B.** These documents exist for one purpose: to prove that the schema and the
query layer behave against a **real Sanity dataset**, not only against the in-repo fixtures. They
are not content, they are not a content sample, and they are not a starting point for real work.

Three files live here, all imported into `development` only:

| File | Purpose |
| --- | --- |
| `b3-test-dataset.ndjson` | the B3 contract seed — one document per contract, nothing more |
| `i4-minimum-content.ndjson` | the **I-4 Lite** minimum content set — enough mock content to render every page end to end |
| `qa-carousel-population.ndjson` | the **homepage carousel visual-QA** top-up — three extra Reality Capture records so station 04 holds a realistic item count |

Everything below applies to both. The pre-flight in `src/lib/content/live.test.ts` reads **every**
`*.ndjson` in this directory, so neither file can be edited into a state the Studio would reject.

> ⛔ **Never import this into the `production` dataset.** It belongs in `development` only. The
> live verification harness refuses to run against a dataset named `production` for this reason.

## Why it is safe

Every document here satisfies all four of the conditions the brief sets for non-production test
content, and the always-on part of `src/lib/content/live.test.ts` asserts the first three on every
`npm test` — so the seed cannot quietly stop meeting them:

| Condition | How it is met | Enforced by |
| --- | --- | --- |
| impossible to confuse with production | lives in a dedicated `development` dataset | the harness refuses `production` |
| clearly marked as a test fixture | every `_id` is prefixed `da-test-`; every title/name contains `TEST` | `is unmistakably non-production` |
| no fabricated public claims | no real client, office, location, award, accuracy figure, equipment model or point count; every free-text value says it is a test document | authored that way; review before changing |
| will not be published to production | never referenced by a production build; removed by the teardown below | this file + the dataset boundary |

There is deliberately **no invented portfolio content**. No HiFi project is reproduced here, no
project narrative is written, and no capture figure is stated — `TECHNICAL_ARCHITECTURE.md` §10.4
treats a fabricated capture readout as a false accuracy claim, so the capture fields carry the
words "no real … declared" rather than a number.

## What each document exercises

| `_id` | Type | The contract it proves |
| --- | --- | --- |
| `da-test-work-ad` | workEntry | localized fields RO+EN incl. rich text; homepage placement; related-work references; **two Services**, so the §8 merge resolves against real data |
| `da-test-work-rc` | workEntry | Reality Capture; capture metadata with `capturePublicationCleared: false` |
| `da-test-work-ro-only` | workEntry | the **EN publication gate** (§11.2) — no EN title, no EN slug, `enPublished: false` |
| `drafts.da-test-work-draft` | workEntry (draft) | **draft exclusion** (§8, R2) — readable with the Viewer token, absent from every published read |

This file holds **no Service documents**. All eight canonical Services live in
`i4-minimum-content.ndjson`, which is why that file must be imported **first** — see **Import**.

`drafts.da-test-work-draft` is the only document here that is meant to be *visible to the token and
invisible to the build*. It is what makes the published-perspective assertion a real test rather
than a tautology.

### `i4-minimum-content.ndjson` — the I-4 Lite set

The B3 seed proves the contracts; it does not fill a page. This file adds the minimum coherent
**mock** content needed to look at the whole site: six Work Entries, four Services and one more
Office. It is demo content and says so in every title — no real client, office, location, award,
accuracy figure, equipment model or point count appears anywhere in it, and no media is uploaded
(every image box renders the authored plate tone, which is `Plate.astro`'s designed empty state).

| `_id` | Type | What it makes visible |
| --- | --- | --- |
| `da-test-i4-service-architecture` | service | `proiectare-arhitectura` — A&D service with deliverables, process and proof |
| `da-test-i4-service-interior` | service | `design-interior` — **RO-only service**, so no EN page is generated for it |
| `da-test-i4-service-scanning` | service | `scanare-laser-3d` — RC service; its `equipment` row is what the hub's instrument readout renders |
| `da-test-service-vizualizare-3d` | service | `vizualizare-3d` — the A&D Service that activates Location as **[O]** |
| `da-test-service-design-mobilier` | service | `design-mobilier` — the only Service that makes Implementation Company **[M]** |
| `da-test-service-scan-to-bim` | service | `scan-to-bim` — RC, so the RC hub lists more than one Service |
| `da-test-service-fotografie-arhitectura` | service | `fotografie-arhitectura` — the second RC Service that makes Equipment **[M]** |
| `da-test-service-vizualizare-arhitectura` | service | `vizualizare-arhitectura` — **F5**: publishable with zero demonstrating Work Entries |
| `da-test-i4-work-ad-1` | workEntry | A&D lead — homepage + hub placement, `feature` prominence |
| `da-test-i4-work-ad-2` | workEntry | second A&D entry; **two Services** inside one Pillar |
| `da-test-i4-work-rc` | workEntry | pure Reality Capture; **no capture metadata is invented** |
| `da-test-i4-work-cross` | workEntry | the legacy cross-pillar entry, resolved to **Architecture & Design** by hand (Stage 9) |
| `da-test-i4-work-studio` | workEntry | EN-published A&D entry with no curated placement |
| `da-test-i4-work-competition` | workEntry | the only `competition`-labelled project — without it `/proiecte/concursuri` renders nothing |

The eight canonical Service documents are all here, one per `ServiceKey`, and the pre-flight
asserts that: every key is canonical, every key is unique, and every key agrees with its
document's Pillar. Five of them are demonstrated by no Work Entry, which is a valid published
state (**F5**) rather than an omission.

Reality Capture fields are deliberately absent rather than filled: `TECHNICAL_ARCHITECTURE.md`
§10.4 treats a fabricated capture readout as a false accuracy claim, so no scanner, accuracy,
point count, coordinate or derivative is stated for any of these entries. The one capture readout
the site shows comes from the B3 seed and says, in words, that nothing real is declared.

### `qa-carousel-population.ndjson` — the homepage carousel top-up

The I-4 Lite set renders every page but leaves station 04 with two Homepage Highlights per
pillar, which is not enough to judge the Focus Carousel's overflow, snap rhythm or card cadence.
This file closes that gap **for Reality Capture only** — Architecture & Design reaches a
realistic count purely by re-curating entries that already exist, and no record was invented for
it. Nothing here is a new content model: these are ordinary Work Entries with an ordinary
`curation.placements` entry, selected by the same `source.highlights('homepage', pillar, locale)`
call as everything else.

| `_id` | Type | What it makes visible |
| --- | --- | --- |
| `da-test-qa-work-rc-07` | workEntry | third RC homepage card; EN-published |
| `da-test-qa-work-rc-09` | workEntry | fourth RC homepage card, **RO-only** — the EN gate stays visible *inside* the carousel, not only in the archive |

`da-test-qa-work-rc-08` was retired at Stage 9 (see below). It carried the RO-only-inside-the-carousel
case, which `-09` now carries instead — `-09` was previously EN-published and defined entirely in
terms of `-08`, so its old role disappeared with that document.

Same rules as the rest of the directory: no client, no award, no location presented as factual,
no photographer credit, no capture figure, and every title says TEST. The imagery these cards
show in a `DEV_VISUAL_MEDIA=true` session is the existing render-layer overlay keyed on the entry
id (`src/lib/dev/visual-media.ts`); nothing is uploaded to Sanity.

This file also re-curates six documents that were already seeded — `curation.placements` and, for
`da-test-work-ro-only`, `curation.editorialPriority`. Curation is editorial by design
(`CONTENT_MODEL.md` §4: "re-curate the homepage at any time without re-classifying a single
entry"); no taxonomy, discipline or metadata field was touched to raise a carousel count.

## Import

Requires a Sanity login with write access to the project (`npx sanity login`). This is an
owner-side action — the web build's Viewer token cannot and must not do it (§18).

**Order matters, and it changed at Stage 9.** `i4-minimum-content.ndjson` owns all eight
canonical Service documents, and the Work Entries in the other two files reference them — so it
must be imported **first** or those references dangle.

```bash
cd studio && npx sanity dataset import seed/i4-minimum-content.ndjson development --replace
```

```bash
cd studio && npx sanity dataset import seed/b3-test-dataset.ndjson development --replace
```

```bash
cd studio && npx sanity dataset import seed/qa-carousel-population.ndjson development --replace
```

`--replace` overwrites the same ids rather than failing on conflict, so re-running is safe. The
carousel top-up re-curates documents from the other two files, so if you re-import `b3` or `i4`
from an older checkout, re-import all three.

### Media hydration — required after import

`cover` and `gallery` are **[M]** on every Work Entry, and NDJSON cannot carry a Sanity asset.
Until an asset is attached, an imported entry fails the build's own contract check — which is
correct: the seed is a migration source, not a finished document.

Attach one image asset per entry as `cover` plus at least one `gallery` item. For a
development dataset the deterministic local visual-QA pool under `.dev-visual-media/` is the
intended source: it is pillar-keyed (`architecture`, `reality-capture`, `general`), it is
already downscaled, and reusing it for `da-test-` documents invents nothing. **Never do this for
real client content** — a Work Entry with no real imagery is a content gap to report, not a slot
to fill.

## Verify

From the repository root, with the development dataset's credentials in the environment:

```bash
SANITY_PROJECT_ID=… SANITY_DATASET=development SANITY_READ_TOKEN=… npm test
```

`src/lib/content/live.test.ts` runs the full handshake. Without those variables it skips and says
so. See `../README.md` → **Verifying the live dataset**.

## Teardown

All three files are meant to be deleted once real Work Entries land and the development dataset
has something better to exercise. Delete the carousel top-up first — it references documents the
other two files own:

```bash
cd studio && npx sanity documents delete --dataset development \
  da-test-qa-work-rc-07 da-test-qa-work-rc-09
```

```bash
cd studio && npx sanity documents delete --dataset development \
  da-test-work-ad da-test-work-rc da-test-work-ro-only drafts.da-test-work-draft
```

```bash
cd studio && npx sanity documents delete --dataset development \
  da-test-i4-work-ad-1 da-test-i4-work-ad-2 da-test-i4-work-rc \
  da-test-i4-work-cross da-test-i4-work-studio da-test-i4-work-competition
```

Services last — a Work Entry may not be deleted after the Service it references, or the delete
is refused for the reference it would strand:

```bash
cd studio && npx sanity documents delete --dataset development \
  da-test-i4-service-architecture da-test-i4-service-interior da-test-i4-service-scanning \
  da-test-service-vizualizare-3d da-test-service-design-mobilier da-test-service-scan-to-bim \
  da-test-service-fotografie-arhitectura da-test-service-vizualizare-arhitectura
```

Deleting the entire `development` dataset also works and is cleaner, since nothing else should
ever live in it.

## Editing it

Change the NDJSON and run `npm test` — the seed pre-flight in `src/lib/content/live.test.ts` runs
every document through the **same validation predicates the Studio attaches to the fields**
(`src/lib/content/validation.ts`), so a value the Studio would reject fails here first, before it
is ever imported. It also asserts that the seed still covers each state the live suite depends on;
removing a document without removing its assertion is a failure, not a silent skip.

## What Stage 9 changed

The migration of this corpus to `CONTENT_MODEL.md` v3.1, recorded per document so the decisions
are auditable rather than implied by a diff.

**Retired documents.** Six, none of them re-keyed to keep a count up:

| `_id` | Why |
| --- | --- |
| `da-test-office`, `da-test-i4-office-b` | the `employer` document type is retired (`DECISIONS_LOG.md` #91, #97) |
| `da-test-service-linked`, `da-test-service-unlinked` | named only by a QA role ("with work" / "without work"), never by a Service identity. Replaced by purpose-built canonical Services; both structural invariants are preserved and are now asserted structurally rather than by document id |
| `da-test-i4-service-photogrammetry` | drone photogrammetry is **not** a Service (`DECISIONS_LOG.md` #92). Retired rather than re-keyed to a free canonical key |
| `da-test-qa-work-rc-08` | its title and its only Service reference both made its identity the retired photogrammetry concept, so it was retired with it rather than force-mapped to an unrelated Service |

**Per-document Pillar decisions.** `da-test-work-rc` → `reality-capture`, `da-test-i4-work-cross`
→ `architecture-design`. These are decisions about two specific documents, **not** a
Discipline→Pillar rule; no such rule exists anywhere in the code.

**Cross-pillar Service references, resolved rather than tolerated.** `da-test-work-rc` lost an
A&D Service reference and `da-test-i4-work-cross` lost a Reality Capture one, in both cases
because the document's decided Pillar excludes it. That loss is the point of the decision, not a
side effect of it.

**Deterministic placeholder values.** `client`, `area` and `equipment` were absent and are
mandatory under the resolved contract. Every document here is synthetic and says so, so they
carry deterministic test values (`TEST — client nedeclarat`, round-hundred areas, `TEST — niciun
echipament real declarat`). Nothing plausible-sounding was manufactured, and no figure is
presented as measured.
