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

## 2. What C needs per project

> **⚠ REWRITTEN 2026-08-13, updated 2026-08-14 for `docs/product/CONTENT_MODEL.md` v3.1 (CLIENT-VALIDATED).**
> Discipline ("field of work") and Entry Type ("kind of project") are **removed from the model**, and so
> are **Attribution ("whose work it is"), Office/Employer, Roles ("what you did") and the Credit
> statement** — crediting is now just **Colaboratori** and **Echipă**. The Studio
> schema does **not yet** implement v3.0 — see `docs/product/PROJECT_MODEL_IMPACT.md` §2 for the
> sequencing. **Intake must not start against the old schema**, or every entry authored will need
> re-classifying by hand. The table below is what the Studio will ask for, and the checklist C
> should collect material against in the meantime.

This is the intake form. Everything on it maps to exactly one field group in the Studio, and the
group names below are the tab names the editor sees.

### Always required — both pillars

| What | Why it is required |
| --- | --- |
| **Capability (Pillar)** — Arhitectura & Design *or* Reality Capture | exactly one; it decides which Services may be chosen (v3.0 §2) |
| **Services** — one or more, from the chosen capability | mandatory, multi-select; **they decide which other fields are required** (v3.0 §5, §7) |
| **Sector** — **exactly one** of the seven | mandatory, single-select; classification and filtering only, never activates a field (v3.1 §11.1). Genuinely mixed projects use *Mixed-use & dezvoltări* |
| Romanian title | root locale (§11.1) |
| Romanian URL slug | the route (§11.1). Lowercase, hyphenated, ASCII — OD-8 authors RO without diacritics |
| Year | sorts the archive (IA Step 5) |
| Status | **În dezvoltare · În desfășurare · Finalizat · Nerealizat** — one value, both capabilities |
| Client | required in both pillars under v3.0 |
| Cover image + Romanian alt text | required in both pillars under v3.0 |
| Gallery | required in both pillars under v3.0 |

### Required by capability

| What | Arhitectura & Design | Reality Capture |
| --- | --- | --- |
| **Description** | **required** | **optional** — deliberate, client-validated (v3.0 §6) |
| Collaborators · Team | optional base fields | not base fields; may be activated as optional by a Service |

**Crediting is Colaboratori and Echipa, and nothing else.** An office, a co-author or a partner
practice is named in one of those two lists. There is no "whose work it is", no Office field, no
"what you did" list and no Credit statement — all four are retired (v3.1 §12).

### Required by the Services chosen — the merge rule

Requirements from several Services are **additive**, and the strongest wins:
**MANDATORY > OPTIONAL > NOT APPLICABLE.** One field on the project, however many Services ask for it.

| If the project has this Service | it must also carry |
| --- | --- |
| Proiectare de arhitectura | **Location**, **Area** (Awards optional) |
| Design interior | **Location**, **Area** (Awards optional) |
| Vizualizare 3D | Location (optional) |
| Design mobilier | **Implementation company** |
| Scanare laser 3D | **Equipment**, **Location**, **Area** |
| Scan-to-BIM | **Location**, **Area** (Collaborators, Team optional) |
| Fotografie de arhitectura | **Equipment**, **Location** |
| Vizualizare de arhitectura | Location, Collaborators, Team (all optional) |

*Example:* Design interior + Design mobilier ⇒ Location **and** Area **and** Implementation company
are all required; Awards stays optional.

### Conditionally required — the Studio blocks publication without them

| When | Also required |
| --- | --- |
| **Published in English** is on | an English title **and** an English slug. Otherwise no EN page is generated at all (§11.2) |
| A point cloud is attached | **Cleared to publish the point cloud** must be on, and a poster image must exist (§19.4, §10.2) |

There are no other conditional rules. The Studio/Collaboration credit-statement rules that used to
sit here are **gone with the fields they policed** (v3.1).

### Optional everywhere

**Labels** — CONCURS · PROIECT DE DIPLOMA. Any combination, including both or neither. A Label never
changes which fields are required. Related projects · Point count, when a point cloud is published
(never estimated — §10.4).

### Deliberately absent

**Discipline ("field of work") and Entry Type ("kind of project")** — removed (v3.0 §12). A
competition is now a **Label** on a project that still declares its real Services, not a kind of
project.

**"Whose work it is" (Attribution), Office, "What you did" (Roles) and the Credit statement
(Authorship)** — removed (v3.1 §12). Do not collect material for them.

**Drone photogrammetry is not a Service.** It describes the practice's capability and appears in
older briefs on that basis, but it is not selectable and no project may be tagged with it. The
Reality Capture list is exactly the four services above.

**Vizualizare 3D and Vizualizare de arhitectura are two different services**, deliberately — one
under each capability. The similar names are intentional; pick by the project's capability.

---

## 3. The order to do it in

The reference graph only points one way, so entering content in this order means never revisiting a
document to add a link:

1. **Services.** They are referenced by Work Entries, so they must exist first. A Service with zero
   demonstrating projects is a **fully publishable state** (IA Step 6, F5): the page shows an
   editorial note and a contact prompt, never an empty grid. Do not hold a Service back waiting for
   proof.
2. **Projects**, Romanian first, all five before any English.
3. **Links** — `Services this demonstrates` and `Related projects`, once every target exists. The
   Work Entry stores the Service reference and the Service page derives its proof list by reversing
   it (`DECISIONS_LOG.md` #38). C never edits the link from the Service side; there is no field for
   it.
4. **Curation** — Emphasis & order. Placements, priority and size. This is the layer that decides
   what the homepage shows, and it is independent of taxonomy: re-curating never re-classifies
   (`CONTENT_MODEL.md` §4).
5. **English**, per entry, last. Turn on *Published in English* only once the English title, slug
   and body exist.

## 4. The I-4 coverage requirement

§23.4 does not ask for five arbitrary entries. The set must include:

- [ ] **one project per capability, and one pair of *linked* projects across the two capabilities** —
      v3.0 removes cross-pillar entries, so the pair exercises the related-projects relationship that
      replaced them;
- [ ] one project with **two or more Services whose field requirements collide** (e.g. Vizualizare 3D
      + Proiectare de arhitectura, where Location is optional for one and mandatory for the other),
      so the MANDATORY > OPTIONAL merge rule is exercised against real content;
- [ ] one entry carrying both **Colaboratori and Echipa**, so the Credits Block is exercised — and
      one carrying neither, so its absence is exercised too;
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
