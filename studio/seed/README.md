# `studio/seed/` — non-production test documents

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
| `da-test-office` | employer | reference list; Professional Experience grouping (IA §5.1) |
| `da-test-service-linked` | service | Work → Service reference target; the reverse `demonstratedBy` join |
| `da-test-service-unlinked` | service | **F5** — zero demonstrating entries is a valid published state |
| `da-test-work-ad` | workEntry | localized fields RO+EN incl. rich text; homepage placement; Service + related-work references |
| `da-test-work-rc` | workEntry | **cross-pillar** derivation (RC primary + Architecture secondary, §7.4); capture metadata with `capturePublicationCleared: false` |
| `da-test-work-ro-only` | workEntry | the **EN publication gate** (§11.2) — no EN title, no EN slug, `enPublished: false`; Studio attribution + Office + scoped Authorship |
| `drafts.da-test-work-draft` | workEntry (draft) | **draft exclusion** (§8, R2) — readable with the Viewer token, absent from every published read |

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
| `da-test-i4-office-b` | employer | a second Office, so Professional Experience has two groups |
| `da-test-i4-service-architecture` | service | A&D service with deliverables, process and proof |
| `da-test-i4-service-interior` | service | **RO-only service** — no EN page is generated for it |
| `da-test-i4-service-scanning` | service | RC service; its `equipment` row is what the hub's instrument readout renders |
| `da-test-i4-service-photogrammetry` | service | second RC service, so the RC hub lists more than one |
| `da-test-i4-work-ad-1` | workEntry | A&D lead — homepage + hub placement, `feature` prominence |
| `da-test-i4-work-ad-2` | workEntry | second A&D entry; two disciplines inside **one** pillar |
| `da-test-i4-work-rc` | workEntry | pure Reality Capture; **no capture metadata is invented** |
| `da-test-i4-work-cross` | workEntry | cross-pillar the other way round from B3's (A&D primary, RC secondary) |
| `da-test-i4-work-studio` | workEntry | Studio-attributed **and** EN-published, so EN Professional Experience is not empty |
| `da-test-i4-work-competition` | workEntry | the only Competition Entry — without it `/proiecte/concursuri` renders nothing |

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
| `da-test-qa-work-rc-08` | workEntry | fourth RC homepage card, **RO-only** — the EN gate stays visible *inside* the carousel, not only in the archive |
| `da-test-qa-work-rc-09` | workEntry | fifth RC homepage card; EN-published, and the EN carousel's fourth card once `-08` is scoped out |

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

```bash
cd studio && npx sanity dataset import seed/b3-test-dataset.ndjson development
```

```bash
cd studio && npx sanity dataset import seed/i4-minimum-content.ndjson development
```

```bash
cd studio && npx sanity dataset import seed/qa-carousel-population.ndjson --dataset development
```

Re-running is safe: add `--replace` to overwrite the same ids rather than fail on conflict. The
carousel top-up re-curates documents from the other two files, so if you re-import `b3` or `i4`
from an older checkout, re-import all three.

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
  da-test-qa-work-rc-07 da-test-qa-work-rc-08 da-test-qa-work-rc-09
```

```bash
cd studio && npx sanity documents delete --dataset development \
  da-test-office da-test-service-linked da-test-service-unlinked \
  da-test-work-ad da-test-work-rc da-test-work-ro-only drafts.da-test-work-draft
```

```bash
cd studio && npx sanity documents delete --dataset development \
  da-test-i4-office-b da-test-i4-service-architecture da-test-i4-service-interior \
  da-test-i4-service-scanning da-test-i4-service-photogrammetry \
  da-test-i4-work-ad-1 da-test-i4-work-ad-2 da-test-i4-work-rc \
  da-test-i4-work-cross da-test-i4-work-studio da-test-i4-work-competition
```

Deleting the entire `development` dataset also works and is cleaner, since nothing else should
ever live in it.

## Editing it

Change the NDJSON and run `npm test` — the seed pre-flight in `src/lib/content/live.test.ts` runs
every document through the **same validation predicates the Studio attaches to the fields**
(`src/lib/content/validation.ts`), so a value the Studio would reject fails here first, before it
is ever imported. It also asserts that the seed still covers each state the live suite depends on;
removing a document without removing its assertion is a failure, not a silent skip.
