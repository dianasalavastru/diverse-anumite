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

## One-time setup — **owner action, not yet done**

The Studio needs a Sanity project, and **as of B3 none exists**: there is no project id anywhere
in the repository or its history, no `.env`, no `SANITY_*` variable in any environment, and no
Sanity CLI login on this machine. Creating one is an owner action, because it establishes the
account, the organisation and the billing relationship that own the content — the engineering
workstreams must not choose those.

Everything downstream of it is already built and verified as far as it can be without it: the
schema compiles, the Studio bundle builds, and `src/lib/content/live.test.ts` will run the whole
verification suite the moment credentials exist.

### Step 1 — create the project (owner)

At [sanity.io/manage](https://www.sanity.io/manage), signed in as the account that should **own**
the content long-term. Not a personal throwaway account, and not an engineer's.

- Create the project. Name it for the practice.
- Create **two** datasets: `production` and `development`.
- **Set both datasets to private.** §18.1 chooses a private dataset read by a build-time Viewer
  token, because published Work Entries carry fields that are published but not intended for
  arbitrary public query — `Client`, curation metadata, and `capturePublicationCleared`. A public
  dataset exposes every field of every published document to anyone who can write GROQ. Verify
  this **after** creation; it is the one setting that silently undoes the decision.
- Under **API → CORS origins**, add `http://localhost:3333` with credentials allowed, so the
  Studio can run locally. (Projects created through `sanity init` get this automatically;
  projects created in the manage UI do not.)

Why `development` exists: B3's verification runs against real Sanity infrastructure, and it must
not do that against the dataset that will hold the practice's work. The seed in
[`seed/`](seed/README.md) is imported there and nowhere else.

### Step 2 — tokens (owner)

Under **API → Tokens**, create exactly two, and no others:

| Token | Role | Where it goes |
| --- | --- | --- |
| web build read | **Viewer** | Cloudflare Pages build environment, as an *encrypted secret* named `SANITY_READ_TOKEN`; and locally in a root `.env` for running the verification suite |
| preview draft read | **Viewer** | the preview deployment **only**, server-side — do not create it until that deployment exists (§6.2) |

**No Editor/write token is created for this system at all** (§18). Content is written by a person
signed in to the Studio, never by a token. If a token with write access ever exists, the secrets
model in §18 is broken and the table above is the record of what should have happened instead.

### Step 3 — connect the repository (engineering)

```bash
cp studio/.env.example studio/.env     # SANITY_STUDIO_PROJECT_ID, SANITY_STUDIO_DATASET
cp .env.example .env                   # SANITY_PROJECT_ID, SANITY_DATASET, SANITY_READ_TOKEN
```

Both are `.gitignore`d. The Studio's two variables are **public identifiers, not secrets** — they
are bundled into a client-side build by design; the Studio carries no token and authenticates the
editor through Sanity's own login. Only `SANITY_READ_TOKEN`, in the root `.env`, is a credential.

```bash
cd studio && npm install && npm run dev
```

### Step 4 — seed and verify

```bash
cd studio && npx sanity login
npx sanity dataset import seed/b3-test-dataset.ndjson development
```

Then from the repository root, with the **development** dataset's values in `.env`:

```bash
npm test
```

## Verifying the live dataset

[`src/lib/content/live.test.ts`](../src/lib/content/live.test.ts) is the single command that
answers "does the frozen contract hold against a real dataset?". It **skips itself, loudly, when
no credentials are present**, so a checkout without a token still has a green `npm test` — a suite
that failed without a credential would push someone toward committing one, which is the outcome
§18 exists to prevent.

It proves, against live Sanity: the connection handshake · every projection returning exactly its
declared key set · draft exclusion under `perspective: 'published'`, asserted against drafts the
same token *can* see · localized `{ro, en}` fields with untranslated EN as `null` · the EN
publication gate and §11.2's clean 404 · no EN aggregate linking to a page the EN build does not
generate · Work → Service references and the reverse `demonstratedBy` join · F5 · Employer scoped
to Studio attribution · Pillar derived and never queried · discovery order · no document claiming
a reserved slug · the §19.4 capture gate · **fixture ⇄ live shape equivalence** · and that no
serialized result or error message carries the token.

### The two checks the harness cannot make — now scripted

Both were previously "click through the Studio yourself". Both are now repeatable scripts that
run against the **real workspace**, which is strictly better evidence than a screenshot: they use
Sanity's own `validateDocument` in `environment: 'studio'`, i.e. the exact code path that decides
whether an editor is blocked. Both write to `development` only and delete their own probes.

```bash
cd studio && npx sanity exec scripts/verify-validation-levels.ts --with-user-token
```

Asserts that every rule the architecture declares blocking actually blocks — the reserved-slug
rule (§7.7 / F4), Employer scoping, and vocabulary membership. Exits non-zero if any of them
fails to block.

```bash
cd studio && npx sanity exec scripts/verify-capture-gate.ts --with-user-token -- setup
```

Attaches a real uploaded derivative + poster to the seeded RC entry, then walks
`setup → clear → unclear → rawname → teardown`. Run
`npx vitest run src/lib/content/live.test.ts -t "capture"` from the repository root between
steps for the build-side half. This is the only way to exercise the asset path at all, because
NDJSON cannot carry a file asset — and at B3 that gap was hiding a real defect (see below).

> **`npx sanity documents validate` under-reports.** It shows custom rules on **object-typed**
> fields as `⚠ warning`, never `✖ error` — so the reserved-slug rule on `slug` and the
> primary/secondary rule on `discipline` both look non-blocking there, while the same predicate
> on a scalar or reference field shows as an error. The cause is in Sanity itself: for object
> types it appends an unknown-fields validator with `.warning()`, and `.warning()` sets the level
> on the *whole rule* — but only when `environment !== 'studio'`. The Studio is unaffected.
> **Do not use `sanity documents validate` as a publication gate**; use the script above.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | run the Studio locally |
| `npm run check` | type-check the schema against Sanity's own types |
| `npm run build` / `npm run deploy` | build / host the Studio |
| `npm run export` | `sanity dataset export` — the backup path (§20) |

`npm run build` and `npm run check` both work **offline, with no project**: the schema and the
Studio bundle compile against a placeholder project id. That is how the schema was verified before
a project existed.

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

## Content intake

The path Workstream C takes when the first real projects arrive is
[`CONTENT_INTAKE.md`](CONTENT_INTAKE.md) — the required and conditionally-required field set, the
order to enter things in, the I-4 coverage requirement, and why the path is the Studio rather than
an import.

## Not built yet

- **The Presentation / preview tool.** It needs the separate, Cloudflare Access-protected preview
  deployment described in §6.2, which does not exist. The draft token belongs only to that
  deployment, server-side. What B3 established about it, so it is not rediscovered later:

  | Assumption in §6.2 | Status against the actual setup |
  | --- | --- |
  | `presentationTool` is available in the installed Studio | **holds** — `sanity@6.9.1` exports `sanity/presentation`; no extra dependency |
  | the Studio points at a preview URL | **ready** — `SANITY_STUDIO_PREVIEW_URL` is already reserved in `.env.example`, commented out |
  | the preview environment renders on demand | **blocked, and it is A's call.** `astro.config.mjs` is `output: 'static'` and is Workstream A's single-owner file (§23.3). A preview build needs a server-rendered variant, which is an explicit integration handoff, not a B change |
  | the preview reads drafts | **blocked by design, and deliberately so.** `createContentClient` calls `assertProductionPerspective`, so `perspective: 'drafts'` throws at the transport. Preview needs its own factory that takes the draft token and the drafts perspective — a *separate* seam, so no production code path can ever acquire one by configuration |
  | Cloudflare Access protects the preview deployment | **unverifiable** — no Cloudflare project exists yet |

  None of this is implemented, per the brief: preview is not built until the environment is ready.

- **The publish → webhook → build trigger** (§17), which needs the Cloudflare project.
- **A live in-form Pillar readout.** The derived pillar is shown in the document subtitle today;
  a field-level readout would need a small React input component and is worth adding once the
  Studio is running against real content.
