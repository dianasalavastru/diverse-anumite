# Content intake — the path Workstream C uses at I-4

**Owner: Workstream B** (this document and the machinery behind it).
**Performed by: Workstream C** (the content itself).

`TECHNICAL_ARCHITECTURE.md` §23.4 defines integration point **I-4** as "~5 real Work Entries incl.
one cross-pillar and one Studio-attributed, exercising Pillar derivation, discovery order, and the
Credits Block." This document is the exact route those five entries take from "the owner has the
material" to "the build renders them". It invents no content and unblocks nothing — I-4 begins when
real material exists, not before.

> **The path is the Studio, not an import.** §23.3 gives C "CMS content, media, hotspots, taxonomy
> tagging, RO/EN copy, per-entity slugs" and explicitly **not** "code of any kind". A hand-written
> NDJSON import would make C author JSON, bypass every field validation the Studio attaches, and
> skip the image pipeline entirely (§9 needs assets uploaded to Sanity so hotspot/crop and the
> image CDN work at all). Bulk import exists here only as the migration escape hatch in §5.

---

## 1. Before C starts — B's precondition checklist

| # | Must be true | Verified by |
| --- | --- | --- |
| 1 | The Sanity project exists and the dataset is **private** | manage UI; §18.1 |
| 2 | C has an **Editor** login on the project (a person, not a token) | manage → Members |
| 3 | The Studio runs (`cd studio && npm run dev`) and C can sign in | manual |
| 4 | The `development` dataset is clean of the B3 seed, or C is working in `production` | `studio/seed/README.md` → Teardown |
| 5 | The live handshake is green against the target dataset | `npm test` with credentials set |

Nothing below is safe until #1 and #5 hold. Item 5 in particular: the intake path assumes the query
layer already returns the frozen shape from that dataset.

---

## 2. What C needs per Work Entry

This is the intake form. Everything on it maps to exactly one field group in the Studio, and the
group names below are the tab names the editor sees.

### Required — the entry cannot be published without them

| What | Studio location | Why it is required |
| --- | --- | --- |
| Romanian title | Name & address → Title | root locale (§11.1) |
| Romanian URL slug | Name & address → URL slug → Romanian | the route (§11.1). Lowercase, hyphenated, ASCII — OD-8 authors RO without diacritics |
| Main field of work | What it is → Field of work → Main field | **Pillar is derived from this** (§7.4) and is never typed in |
| Kind of project | What it is → Kind of project → Mainly | drives the detail layout (`CONTENT_MODEL.md` §3) |
| Whose work it is | Credit → Whose work is it | Independent · Collaboration · Studio |
| How it came about | Credit → How it came about | self-initiated vs client-commissioned |
| Year | Facts → Year | sorts the archive (IA Step 5) |
| Status | Facts → Status | Built/Realized · Unbuilt/Proposal · In progress · Delivered |

### Conditionally required — the Studio blocks publication without them

| When | Also required |
| --- | --- |
| Whose work it is = **Studio** | an **Office** (Credit → Office) *and* a Credit statement. Professional Experience groups by the Office (IA §5.1) |
| Whose work it is = **Collaboration** | a Credit statement |
| Kind of project = **Visualization Commission** | a Credit statement — the images are yours, the building design is not (`CONTENT_MODEL.md`:60) |
| **Published in English** is on | an English title **and** an English slug. Otherwise no EN page is generated at all (§11.2) |
| A point cloud is attached | **Cleared to publish the point cloud** must be on, and a poster image must exist (§19.4, §10.2) |

### Strongly wanted — warnings, never blockers

Cover image + Romanian alt text · Description (RO, and EN if publishing in English) · Location ·
Sector · What you did (roles) · Services this demonstrates · Related projects · Point count, when a
point cloud is published (never estimated — §10.4).

### Deliberately absent

**Pillar.** It is derived from the field of work and shown read-only under each project's name in
the Studio list. If it reads wrong, the field of work is wrong — the pillar is not editable
(§7.4).

---

## 3. The order to do it in

The reference graph only points one way, so entering content in this order means never revisiting a
document to add a link:

1. **Offices** (if any Studio-attributed work is coming). Created from inside a project's Credit
   tab — they are absent from the global "create new" menu by design.
2. **Services.** They are referenced by Work Entries, so they must exist first. A Service with zero
   demonstrating projects is a **fully publishable state** (IA Step 6, F5): the page shows an
   editorial note and a contact prompt, never an empty grid. Do not hold a Service back waiting for
   proof.
3. **Work Entries**, Romanian first, all five before any English.
4. **Links** — `Services this demonstrates` and `Related projects`, once every target exists. The
   Work Entry stores the Service reference and the Service page derives its proof list by reversing
   it (`DECISIONS_LOG.md` #38). C never edits the link from the Service side; there is no field for
   it.
5. **Curation** — Emphasis & order. Placements, priority and size. This is the layer that decides
   what the homepage shows, and it is independent of taxonomy: re-curating never re-classifies
   (`CONTENT_MODEL.md` §4).
6. **English**, per entry, last. Turn on *Published in English* only once the English title, slug
   and body exist.

## 4. The I-4 coverage requirement

§23.4 does not ask for five arbitrary entries. The set must include:

- [ ] one **cross-pillar** entry — a second field of work whose pillar differs from the first, so
      Pillar derivation is exercised in both directions;
- [ ] one **Studio-attributed** entry with an Office and a scoped Credit statement, so the Credits
      Block and Professional Experience grouping are exercised;
- [ ] at least two entries carrying **Emphasis → Priority** and a homepage placement, so discovery
      order has something to order;
- [ ] at least one entry **not** published in English, so §11.2 is exercised against real content
      rather than a fixture.

A set that misses any of these satisfies the count and not the integration point.

## 5. Bulk import — the escape hatch, not the path

If existing content is ever migrated from elsewhere, the mechanism is
`sanity dataset import <file>.ndjson <dataset>` and `studio/seed/b3-test-dataset.ndjson` is the
worked example of the document shape. Three cautions, none optional:

1. **Import bypasses field validation.** `options.list` and `Rule.custom` are Studio affordances;
   the API does not apply them. A bad vocabulary value imports cleanly and then **fails the build**
   at `normalize.ts` instead (§7.2) — which is the designed behaviour, but it fails late.
2. **Images must be uploaded first** and referenced by asset id. NDJSON cannot carry a file, and an
   entry without a real Sanity asset gets no hotspot, no crop and no image CDN (§9).
3. **Validate before importing.** Run the imported documents through the shared predicates the way
   `src/lib/content/live.test.ts` runs the seed through them, rather than discovering the problem
   in a failing production build.

## 6. After the first five land — B's I-4 acceptance

Run, in this order:

```bash
SANITY_PROJECT_ID=… SANITY_DATASET=… SANITY_READ_TOKEN=… npm test
```

Then confirm by inspection, because these are content properties no test can assert:

- the derived pillar under each project's name in the Studio matches what the entry actually is;
- the archive order the build produces is the order the owner wants — if it is not, that is a
  **Priority** change in the CMS, never a code change (§7.5);
- each Credit statement says what is the architect's and what is not.

Anything that fails at `normalize.ts` is a content error with a document id in the message. Anything
that fails at `shapeDiff` is a **schema/query** error and comes back to B.
