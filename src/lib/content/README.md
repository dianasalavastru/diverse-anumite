# `src/lib/content/` — the content contract

**Owner: Workstream B (CMS / backend).** Per
[`docs/implementation/TECHNICAL_ARCHITECTURE.md`](../../../docs/implementation/TECHNICAL_ARCHITECTURE.md)
§23.3, this directory and `types.ts` in particular are B's single-owner files. Workstream A
consumes them and never edits them — the types are the projection of the CMS schema, and two
workstreams editing them re-creates exactly the drift §7.1 exists to prevent.

| File | What it is |
| --- | --- |
| `types.ts` | The content shape contract — vocabularies, Work Entry, Service, curation, media. |
| `derive.ts` | Build-time derivations frozen upstream (Pillar derivation §7.4) + locale/projection helpers. |
| `fixtures.ts` | Phase-0 placeholder data for A. **Never ships.** Regenerated from the real query layer at I-3. |
| `index.ts` | The import surface. Re-exports types + derivations; deliberately not fixtures. |

## Rules this directory encodes

- **Locale-neutral identity, localized fields** (§7.1). One document per Work Entry and per
  Service; `Localized<T>` carries `{ ro, en }`. `enPublished` gates EN page generation.
- **Vocabularies come from `CONTENT_MODEL.md` §3 only** (§7.2). The enumeration in
  `WORK_ARCHIVE_IMPLEMENTATION_NOTES.md`:88 is prohibited — it mixes three axes.
- **Pillar is derived from Discipline, never authored** (§7.4). `derivePillars()` is the single
  implementation; nothing re-derives it locally.
- **Taxonomy ≠ curation** (`CONTENT_MODEL.md` §4). Curation is a separate object on the shape and
  is never a visitor-facing filter.
- **The entry stores the Work⇄Service reference** (IA Step 6). `Service.demonstratedBy` is
  resolved by reversing it, and zero linked entries is a valid published state (F5).
- **No GROQ in components** (§8). Queries land behind this boundary in Phase 4.

## Status

Phase 0 / integration point I-1. The Sanity Studio, the schema, production GROQ, discovery-order
derivation (§7.6), reserved-slug validation (§7.7), and the contact Function are **not** built yet.
