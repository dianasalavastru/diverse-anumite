# `studio/` — the Sanity Studio

**Owner: Workstream B (CMS / backend).** Per
[`docs/implementation/TECHNICAL_ARCHITECTURE.md`](../docs/implementation/TECHNICAL_ARCHITECTURE.md)
§23.3, `studio/**` is B's. It is a **separate application** with its own `package.json`,
`node_modules`, `tsconfig.json` and `check` script — the web app's root scaffold is Workstream
A's single-owner file and is not touched from here.

The Studio *reads* two things from the web app, deliberately and read-only:

| Imported from | Why |
| --- | --- |
| `src/lib/content/types.ts` | the frozen vocabularies — the option lists are built from them, never re-declared (§7.2) |
| `src/lib/content/validation.ts` | the validation rules, shared with the build so the Studio and the build cannot disagree |
| `src/lib/i18n/routes.ts` (transitively) | the reserved-slug list, generated from the frozen route map (§7.7: "one source, read by both the router and the validator") |

## One-time setup

The Studio needs a Sanity project, which does not exist yet — creating it is an owner action,
because it establishes the account that owns the content.

1. Create the project and a `production` dataset at [sanity.io/manage](https://www.sanity.io/manage).
2. **Set the dataset to private.** §18.1 chooses a private dataset read by a build-time Viewer
   token, because published Work Entries carry fields that are published but not intended for
   arbitrary public query — `Client`, curation metadata, and `capturePublicationCleared`. A
   public dataset exposes every field of every published document to anyone who can write GROQ.
   Verify this after creation; it is the one setting that silently undoes the decision.
3. Copy `.env.example` to `.env` and fill in the project id and dataset name. Both are public
   identifiers, not secrets — the Studio carries no token and authenticates the editor through
   Sanity's own login.
4. Create the **read-only Viewer** token for the web build, and put it in the Cloudflare Pages
   build environment as an encrypted secret (`SANITY_READ_TOKEN`, see `../.env.example`).
   An Editor/write token must exist nowhere in this system (§18).

```bash
npm install
npm run dev
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | run the Studio locally |
| `npm run check` | type-check the schema against Sanity's own types |
| `npm run build` / `npm run deploy` | build / host the Studio |
| `npm run export` | `sanity dataset export` — the backup path (§20) |

## What the schema is

Two documents and one reference list, exactly as `CONTENT_MODEL.md` §0 states:

- **`workEntry`** — the canonical portfolio object. One locale-neutral document with localized
  *fields*; document-level internationalization is rejected (§7.1).
- **`service`** — a first-class peer, not a facet or tag (`CONTENT_MODEL.md` §2).
- **`employer`** — a small reference list. Grouping metadata for Professional Experience, with
  no page of its own (IA §5.1), which is why it is absent from the global "create new" menu.

Everything else is an *axis* on the Work Entry. Pillar, Discipline, Entry Type, Attribution,
Sector and Status are not documents, and making one a document would be adding a content axis —
which §1.2 forbids this layer from doing.

**Pillar has no field.** It is derived from Discipline (§7.4) and is shown to the editor as a
read-only readout in each project's subtitle, computed from the same table the build uses.

## Editing model

The Studio is organised by task, not by schema (`structure.ts`). Each list answers a question
an editor actually asks: what is on the homepage right now, what still needs translating, which
services have no proof yet, what belongs to Competitions or Professional Experience. They are
lenses over the same two document types — the same relationship curated views have to the
archive (IA §5: "One archive, many lenses").

Field groups follow the same logic: *Name & address · What it is · The work · Credit · Survey ·
Links · Facts · Emphasis · Search*. The Survey group appears only on Reality Capture work.

Two things the editor controls that developers must never override:

- **Emphasis and order** are CMS fields (`curation`), not code. Prominence maps to the archive's
  five-size grid; priority makes "most representative first" beat "newest first"; placements say
  where something appears. No deploy is required to re-curate (§7.5).
- **English publication** is one switch per document. Off means no English page is generated at
  all — not a Romanian page at an English address (§11.2).

## Validation posture

Blocking errors are limited to things that would produce a broken or dishonest page:

- a slug that is malformed, duplicated within its locale, or claims a reserved curated route
  (`concursuri` / `experienta-profesionala` in RO, `competitions` /
  `professional-experience` in EN — generated from the route map, never hand-listed);
- English publication without an English title and slug;
- a value outside a controlled vocabulary, or a secondary that repeats its primary;
- an Office on non-office work, or office work with no Office named;
- a missing credit statement on visualization, collaboration or office work — the case where
  over-claiming is possible;
- a point cloud attached without publication clearance, without a still-image fallback, or
  uploaded as a raw survey file.

Warnings never block, by design:

- **a service with no demonstrating work.** IA Step 6 (F5) is explicit that such a page is fully
  publishable — it shows an editorial note and a contact prompt rather than an empty grid. This
  must never harden into an error.
- an undeclared point count — the figure is read from the field and never computed (§10.4).
- English content that exists while the English switch is off.
- a missing English body on a page published in English.

## Not built yet

- **The Presentation / preview tool.** It needs the separate, Cloudflare Access-protected
  preview deployment described in §6.2, which does not exist. The draft token belongs only to
  that deployment, server-side.
- **The publish → webhook → build trigger** (§17), which needs the Cloudflare project.
- **A live in-form Pillar readout.** The derived pillar is shown in the document subtitle today;
  a field-level readout would need a small React input component and is worth adding once the
  Studio is running against real content.
