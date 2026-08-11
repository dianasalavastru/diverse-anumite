# `studio/seed/` — non-production test documents

**Owner: Workstream B.** These documents exist for one purpose: to prove that the schema and the
query layer behave against a **real Sanity dataset**, not only against the in-repo fixtures. They
are not content, they are not a content sample, and they are not a starting point for real work.

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

## Import

Requires a Sanity login with write access to the project (`npx sanity login`). This is an
owner-side action — the web build's Viewer token cannot and must not do it (§18).

```bash
cd studio && npx sanity dataset import seed/b3-test-dataset.ndjson development
```

Re-running is safe: add `--replace` to overwrite the same ids rather than fail on conflict.

## Verify

From the repository root, with the development dataset's credentials in the environment:

```bash
SANITY_PROJECT_ID=… SANITY_DATASET=development SANITY_READ_TOKEN=… npm test
```

`src/lib/content/live.test.ts` runs the full handshake. Without those variables it skips and says
so. See `../README.md` → **Verifying the live dataset**.

## Teardown

The seed is meant to be deleted once the first real Work Entries land (I-4) and the development
dataset has something better to exercise:

```bash
cd studio && npx sanity documents delete --dataset development \
  da-test-office da-test-service-linked da-test-service-unlinked \
  da-test-work-ad da-test-work-rc da-test-work-ro-only drafts.da-test-work-draft
```

Deleting the entire `development` dataset also works and is cleaner, since nothing else should
ever live in it.

## Editing it

Change the NDJSON and run `npm test` — the seed pre-flight in `src/lib/content/live.test.ts` runs
every document through the **same validation predicates the Studio attaches to the fields**
(`src/lib/content/validation.ts`), so a value the Studio would reject fails here first, before it
is ever imported. It also asserts that the seed still covers each state the live suite depends on;
removing a document without removing its assertion is a failure, not a silent skip.
