# `src/lib/content/` — the content contract and the query layer

> **⚠ 2026-08-13 — this file describes the schema/code as it is TODAY, which is the *superseded* v2.1 taxonomy.** `docs/product/CONTENT_MODEL.md` **v3.1** (CLIENT-VALIDATED) removes **Discipline**, **Entry Type / Project Type**, **Attribution**, **Employer**, **Roles**, **Authorship** and **Commissioning context**; makes **Pillar authored** rather than derived; makes **Services** mandatory and multi-select; and closes **Sector** and **Status** as mandatory single-select vocabularies. Nothing here has been changed yet — the migration is sequenced in `docs/product/PROJECT_MODEL_IMPACT.md` §2. Read that before touching any of this.


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
| `build-source.ts` | The build-time `ContentSource` the pages actually call. Reads the environment; throws rather than falling back. |
| `fixtures.ts` | Placeholder data, generated through the real query layer. **Never ships.** Tests only. |
| `index.ts` | **The browser-safe import surface.** Types, derivations, ordering, validation — nothing more. |
| `server.ts` | **The build-time import surface.** The `ContentSource` factories, the connection config, the transport error, the draft assertion. |
| `live.test.ts` | The live CMS handshake (B3). Skips without credentials; proves the contract against a real dataset with them. |
| `boundary.test.ts` | The §8/§18 regression guard (B4). Walks the client module graph and fails if a `<script>` can reach the query layer. |
| `node-shims.d.ts` | Minimal `node:fs`/`node:child_process` types for `live.test.ts`, so no dependency is added to A's `package.json`. |

## How to consume it

```ts
import { contentSource } from '../lib/content/build-source.js'; // live Sanity, resolved once

const content = contentSource();
const archive = await content.workArchive('ro');        // discovery order, §23.5 facets
const entry   = await content.workEntry(slug, 'en');    // null when untranslated
```

`createFixtureContentSource()` from `fixtures.js` returns the same `ContentSource` and is what the
test suites use. **Pages must not import it** — a page that does emits invented projects as
finished work (§10.4). `build-source.ts` is deliberately not re-exported from `index.ts` for the
same reason `fixtures.ts` is not: the two content origins should never be one autocomplete apart.

Swapping fixtures for real data was one edit per composition point and no component change. That
is the §23.4 I-3 contract, and it held.

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
- **No GROQ in components — and none in the browser** (§8). The boundary has **two doors**, and
  which one a file may use is decided by whether a `<script>` block can reach it:

  | Door | Contains | Who may import it |
  | --- | --- | --- |
  | `index.ts` | types, derivations, ordering, validation | anything — components, islands, shared modules |
  | `server.ts` | `ContentSource` factories, config, transport, draft assertion | `build-source.ts` and tests only |

  This is enforced, not agreed. `boundary.test.ts` walks the module graph from every `<script>`
  block in every `.astro` file and fails on the import chain; `npm run build` then runs
  `scripts/verify-client-bundles.mjs` over `dist/` and fails on the emitted bytes.

  Until B4 there was one door, and `index.ts` re-exported `source.ts`. Because
  `components/work-archive/archive-state.ts` is imported by the archive's composition *and* by
  its island, that single edge put every GROQ projection string into
  `dist/_astro/WorkArchive.*.js`. Tree-shaking did not save it: `groq.ts` builds its projections
  with top-level `projection(...)` calls, which Rollup cannot prove pure. Reachability, not
  elimination, is the property that has to hold.

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

**Integration point I-3 is closed.** Every page-level composition — Homepage, Work Archive, both
curated views, and both Work Entry routes — reads live Sanity through `build-source.ts`. No page
imports `fixtures.ts`. The schema and Studio are in [`studio/`](../../../studio/README.md). Not
built yet: the contact Pages Function (§19.3), the preview environment (§6.2), and the publish
webhook (§17).

**The content boundary is hardened (B4).** No GROQ string, no transport code, no credential and no
credential *name* is reachable from a browser bundle — asserted from the source graph on every
`npm test` and from the emitted output on every `npm run build`.

- `live.test.ts` is the complete verification suite. It self-skips without credentials and runs
  the whole §7/§8/§11.2/§18/§19.4/§23.4 contract against a real dataset with them.
- Its always-on half runs on every `npm test`: the §18 secrets checks, and a pre-flight that puts
  `studio/seed/b3-test-dataset.ndjson` through the same validation predicates the Studio attaches
  to the fields — so the seed cannot be malformed by the time someone imports it.
- `npm run build` now needs the three §18 variables. It is verified against the **`development`**
  dataset and the B3 seed; `production` holds no content yet. Without them the build **fails** —
  it does not fall back to fixtures, because a green build of invented projects is worse than a
  red one (see the header of `build-source.ts`).

**Preview reads are blocked at this boundary on purpose.** `createContentClient` calls
`assertProductionPerspective`, so `perspective: 'drafts'` throws at the transport. The preview
environment (§6.2) needs its own factory carrying its own server-side draft token — kept a
separate seam so that no production code path can acquire draft access by configuration alone.
