# `src/lib/content/` — the content contract and the query layer

**Owner: Workstream B (CMS / backend).** Per
[`docs/implementation/TECHNICAL_ARCHITECTURE.md`](../../../docs/implementation/TECHNICAL_ARCHITECTURE.md)
§23.3, this directory and `types.ts` in particular are B's single-owner files. Workstream A
consumes them and never edits them — the types are the projection of the CMS schema, and two
workstreams editing them re-creates exactly the drift §7.1 exists to prevent.

| File | What it is |
| --- | --- |
| `types.ts` | The content shape contract — vocabularies, Work Entry, Service, curation, media. |
| `derive.ts` | Build-time derivations frozen upstream (Pillar derivation §7.4) + locale/projection helpers. |
| `order.ts` | Discovery order (§7.6) and the archive sorts (§23.5). |
| `validation.ts` | The CMS validation rules — pure, shared with the Studio. |
| `config.ts` | Pinned API version and perspective; environment variable names. No values. |
| `client.ts` | The transport. The only module that talks to the CMS over the wire. |
| `groq.ts` | The projections — the single declaration of the query shape. |
| `normalize.ts` | Raw GROQ result → the frozen contract. Where the guarantees are enforced. |
| `source.ts` | `ContentSource` — the interface pages consume, and the I-3 swap point. |
| `fixtures.ts` | Placeholder data, generated through the real query layer. **Never ships.** |
| `index.ts` | The import surface. Deliberately does not re-export fixtures. |
| `live.test.ts` | The live CMS handshake (B3). Skips without credentials; proves the contract against a real dataset with them. |
| `node-shims.d.ts` | Minimal `node:fs`/`node:child_process` types for `live.test.ts`, so no dependency is added to A's `package.json`. |

## How to consume it

```ts
import { createFixtureContentSource } from '../lib/content/fixtures.js'; // today
// import { createSanityContentSource, resolveSanityConfig } from '../lib/content'; // at I-3

const content = createFixtureContentSource();
const archive = await content.workArchive('ro');        // discovery order, §23.5 facets
const entry   = await content.workEntry(slug, 'en');    // null when untranslated
```

Both factories return the same `ContentSource`. Swapping fixtures for real data is one edit at
the composition point — no component changes. That is the §23.4 I-3 contract.

## Rules this directory encodes

- **Locale-neutral identity, localized fields** (§7.1). One document per Work Entry and per
  Service; `Localized<T>` carries `{ ro, en }`. `enPublished` gates EN page generation.
- **Aggregates are locale-scoped** (§7.1). Every `ContentSource` method takes a locale and
  filters before ordering, including nested relations — so no EN page links to a page §11.2
  guarantees does not exist.
- **Vocabularies come from `CONTENT_MODEL.md` §3 only** (§7.2). The enumeration in
  `WORK_ARCHIVE_IMPLEMENTATION_NOTES.md`:88 is prohibited — it mixes three axes. A value outside
  the vocabulary fails the build rather than entering a filter set as an unknown token.
- **Pillar is derived from Discipline, never authored** (§7.4). No projection selects a pillar
  field on a Work Entry; `derivePillars()` is the single implementation.
- **Taxonomy ≠ curation** (`CONTENT_MODEL.md` §4). Curation is a separate object on the shape and
  is never a visitor-facing filter.
- **The entry stores the Work⇄Service reference** (IA Step 6). `Service.demonstratedBy` is
  resolved by reversing it, and zero linked entries is a valid published state (F5).
- **No draft reaches output** (§8, R2). Three independent defences: `perspective: 'published'`,
  a `!(_id in path("drafts.**"))` clause on every query, and a per-document id assertion at
  normalization.
- **Capture publication is gated here, not only in the CMS** (§19.4). A point-cloud derivative
  is dropped from build output unless `capturePublicationCleared` is true.
- **No GROQ in components** (§8). Queries live behind this boundary; `groq.ts` is not exported
  from `index.ts`.

## Why fixtures cannot drift from queries

§23.4 calls I-3 the highest-risk integration and names the mitigation: "B publishes the fixture
set *from* the real query layer, so fixtures and queries share one origin." Here that is
structural rather than a convention:

1. Fixtures are authored in the **raw GROQ response shape**, not the frontend shape.
2. They are handed to `createContentSource()` — the same factory the Sanity source uses.
3. `groq.ts` constrains every projection with `satisfies Record<keyof Raw…, string>`, so a
   projection that omits a field the normalizer reads is a compile error.
4. `query-shape.test.ts` parses the *generated* GROQ and asserts the returned key set matches
   the raw types, and that the fixture documents carry exactly those keys.

## Status

Integration point I-3. The schema and Studio are in [`studio/`](../../../studio/README.md);
the query layer is real and tested against fixtures. Not built yet: the contact Pages Function
(§19.3), the preview environment (§6.2), and the publish webhook (§17).

**No Sanity project exists yet**, so the Sanity source has still not been run against a live
dataset. B3 built everything that does not require one:

- `live.test.ts` is the complete verification suite. It self-skips without credentials and runs
  the whole §7/§8/§11.2/§18/§19.4/§23.4 contract against a real dataset with them.
- Its always-on half runs on every `npm test`: the §18 secrets checks, and a pre-flight that puts
  `studio/seed/b3-test-dataset.ndjson` through the same validation predicates the Studio attaches
  to the fields — so the seed cannot be malformed by the time someone imports it.
- What the owner must do to unblock the rest is
  [`studio/README.md` → One-time setup](../../../studio/README.md#one-time-setup--owner-action-not-yet-done).

**Preview reads are blocked at this boundary on purpose.** `createContentClient` calls
`assertProductionPerspective`, so `perspective: 'drafts'` throws at the transport. The preview
environment (§6.2) needs its own factory carrying its own server-side draft token — kept a
separate seam so that no production code path can acquire draft access by configuration alone.
