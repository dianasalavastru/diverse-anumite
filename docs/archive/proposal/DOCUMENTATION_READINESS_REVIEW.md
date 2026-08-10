# Documentation Readiness Review — Independent Design-Readiness Assessment

**Reviewer role:** independent Chief Documentation Architect (design-readiness review).
**Stance:** adversarial by intent. Not here to praise. The goal is the *minimum complete architecture that enables a clean implementation* — not a finished documentation set.
**Scope:** the full corpus as it exists today (31 markdown docs + 2 source PDFs) plus the three planning proposals (`DOCUMENTATION_ARCHITECTURE.md`, `PROJECT_MANIFEST.md`, `MIGRATION_PLAN.md`).
**Method note:** the six Page IA and six wireframe documents were assessed as a *homogeneous set* (the Homepage pair read in full; the remaining ten evaluated via `PAGE_IA_INDEX.md`'s contract map and their shared structure). Their uniformity is itself a finding, not a gap in this review.

**One-sentence verdict:** *The design architecture is genuinely strong and nearly build-ready as a spec; the implementation layer is absent; and the documentation **process** has begun to over-engineer itself relative to a one-person portfolio website.*

---

# Part 1 — Documentation maturity by layer

Maturity = how close the layer is to enabling clean implementation. Confidence = how sure I am of that number given what's written down.

| Layer | Maturity | Confidence | Blocking issue | Recommendation |
|---|---:|---|---|---|
| Project foundation | 90% | High | none | Freeze the practice **name** (still reads as a working title) and confirm it isn't a blocker. Otherwise done. |
| Governance | 65% | High | Ledger stopped at the freeze; release record now states a falsehood (freezes the *old* visual direction) | Record the visual pivot; then **stop adding governance machinery** (see Parts 9/11). |
| Content model | 95% | High | none for design; CMS mapping absent for build | Freeze holds. Best artifact in the corpus. |
| Information architecture | 93% | High | none | A few open items (slugs, long-tail routes) are correctly deferred. |
| Navigation | 92% | High | Authority shared with IA Step 1 (duplication) | Make one the owner, the other a pointer. |
| Page IA | 88% | Medium | Item-level link behaviour deferred (acceptable) | Complete as a design spec. Confidence capped because 5 of 6 assessed via the index. |
| Design system | 82% | High | `WIREFRAMING_GUIDELINES` + wireframes cite the **superseded** visual direction | Correct the stale references; no tokens/API yet (a build-layer concern). |
| Wireframes | 85% | Medium | Same stale visual-direction pointers; written in "architectural publication" language now abandoned | Pointer/wording correction; structurally sound. |
| Visual direction | 55% | High | **Two competing versions; v2.0 is authoritative but NOT frozen; downstream still points at v1** | **Freeze v2.0. This is the single most important pre-implementation act.** |
| Homepage HiFi | 35% | High | Two conflicting HiFis, neither is production; other 5 pages have none | Produce ONE production Homepage HiFi from v2.0. Expected next phase. |
| Documentation architecture (proposed) | 75% | Medium | Unadopted; heavier than the project warrants | Adopt a **slimmed** version (Parts 9/11). |
| Migration strategy (proposed) | 70% | Medium | Solves a filing problem before the build problem; possibly unnecessary | Demote/scrap the folder migration; keep only the governance + reference fixes. |
| Implementation documentation | 5% | High | Essentially absent | **Must** create a minimal set before build. |
| Technical documentation | 0% | High | Absent — no stack, rendering, hosting, CMS, tokens | **The true gate.** Nothing can be built without it. |

**Reading of the table:** everything *above* the visual layer is 82–95% and effectively done. Everything *from* the visual layer down is 0–55%. The corpus has a sharp cliff exactly where design meets build. That cliff is the whole story.

---

# Part 2 — Dependency analysis

**The spine is clean.** Foundation → Content Model → IA → Page IA → Design System → Wireframes → Visual → HiFi is strictly top-down, acyclic, single-direction. No circular *conceptual* dependency exists. This is the corpus's real achievement and should be preserved in any redesign.

**Duplicated authority (the actual problem):**

1. **Navigation is owned twice.** `NAV_DECISION_RECORD.md` and `INFORMATION_ARCHITECTURE.md` Step 1 both state the nav model; NAV self-describes as a "concise mirror" of IA. A mirror is a second copy that can drift. → One should own; the other should be a one-line pointer.
2. **"What the corpus is" is owned four times.** `PAGE_IA_INDEX.md`, `PROJECT_MANIFEST.md` (proposed), `DOCUMENTATION_ARCHITECTURE.md` (proposed), and `DOCUMENTATION_RELEASE_v1.0.md` all partially restate structure/status/authority. That is four maps of the same territory — a duplicated-authority smell that will rot. → Collapse to **one** living index (the manifest) + the decision log.
3. **The freeze is recorded twice** — `DECISIONS_LOG` Batch 19 *and* `DOCUMENTATION_RELEASE_v1.0`. Harmless but symptomatic.

**Documents that own too little:** `PAGE_IA_INDEX.md` (owns nothing — pure map), `README.md` (empty), `VISUAL_DIRECTION.md` (now superseded), `CONTENT_MODEL_VALIDATION.md` (a one-time artifact holding no live authority).

**Documents that own too much:** `DECISIONS_LOG.md` owns every decision across every layer. For a ledger that is correct, but it has become **dense insider shorthand** (codes like F1/M3/C2/D3/J6) that no newcomer can parse without reading the entire corpus first. It is overloaded *as an onboarding surface* even though it is correct *as an audit trail*.

**Merge candidates:** NAV → into IA (or invert); PAGE_IA_INDEX → into the manifest; CONTENT_MODEL_VALIDATION → appendix of the content model; the two reviews → they are already effectively archived.
**Split candidates:** none. The corpus's error is *too many small documents*, not too few big ones. Do not split anything.

**Single authoritative home — confirmed?** Mostly yes, with three exceptions: **navigation** (two homes), **corpus map/status** (four homes), and **visual direction** (two homes, unresolved in governance). Everything else — content model, IA, each page contract, component vocabulary, layout per page — has exactly one home. That is a strong result marred by three fixable duplications.

---

# Part 3 — Missing documentation (only what earns its place)

I reject documentation-by-reflex. Each candidate below is tested against single responsibility and "can an existing doc absorb it?"

**MUST exist before implementation begins:**

- **`TECHNICAL_ARCHITECTURE`** — stack, rendering (SSR/SSG), hosting/CDN, repo layout, build tooling. *Why:* nothing can be scaffolded without it; it is the true gate. *No existing doc can absorb it* (all existing docs are deliberately implementation-independent). *Owns:* technical stack decisions. *Must never own:* IA, content, or visual decisions. *Before build:* **yes, hard blocker.**
- **`CONTENT_MODEL_IMPLEMENTATION`** — the conceptual `CONTENT_MODEL` mapped to real CMS collections/fields, plus reserved-slug enforcement and i18n slug strategy. *Why:* the "owner edits without code" promise is unmet until this exists; it is where F4/i18n become real. *Cannot be absorbed:* `CONTENT_MODEL` is frozen and conceptual by design. *Owns:* CMS schema. *Must never own:* the conceptual model (that stays upstream). *Before build:* **yes.**
- **Production `HOMEPAGE_HIFI`** (then per page, just-in-time) — the real visual spec from v2.0. *Why:* two conflicting HiFis exist and neither is production. *Before build of that page:* **yes.**
- **`DESIGN_TOKENS`** — derived from the production HiFi. *Why:* the bridge from visual spec to code. *Before build:* **yes**, but it *follows* the Homepage HiFi, so it isn't a day-one artifact.

**Can safely wait until implementation is underway:**

- **`SEO_I18N_PLAN`** and **`PERFORMANCE_BUDGET`** — real value, but they are *acceptance criteria*, not design inputs. Author them as the build starts. **Recommend: not standalone documents** — see below.

**Recommend AGAINST creating as separate documents (fails single-responsibility for a project this size):**

- **`MOTION_GUIDELINES`** — motion rules already live authoritatively in `VISUAL_DIRECTION_v2.0` §2.3 and will live in tokens. A separate motion doc for a solo portfolio duplicates authority. → Keep motion in the visual direction + tokens.
- **`ACCESSIBILITY_GUIDELINES`** — a WCAG 2.2 AA commitment + a per-page checklist is ~one page; it belongs as a section of the design system or the tech architecture, not a standalone layer. → Fold in.
- **`METADATA_STANDARD`**, **`PRODUCT_BRIEF`**, **`COMPONENT_API`**, per-doc changelogs, a glossary — all fail the test. Metadata rules fit inside the architecture doc; product goals already live in context + log; component behaviour already lives in the inventory (the code becomes the API); the log is the changelog. → Do not create.

**Net:** the real missing set is **two documents** (`TECHNICAL_ARCHITECTURE`, `CONTENT_MODEL_IMPLEMENTATION`) plus the **production HiFi + tokens** stream. Everything else the roadmap proposes is either deferrable or should never be a standalone doc.

---

# Part 4 — Would I approve implementation today?

**Outcome: B — "ready after a small set of implementation documents" — with two hard blockers, and explicitly *not* A.**

Justification: the *design architecture* alone would earn an **A** — it is coherent, single-responsibility, reviewed, and complete through wireframes. But "implementation" means writing code, and code cannot begin because:

1. **Blocker 1 — the visual layer is ungoverned and self-contradictory.** v2.0 is authoritative but unfrozen; the freeze record points at the superseded v1; the wireframes and guidelines still speak the abandoned metaphor; two HiFis conflict. A developer literally cannot tell which visual truth to build. This is not a missing *document* — it is a missing *decision record*, and it is cheap to fix.
2. **Blocker 2 — there is no technical or CMS layer.** No stack, no rendering strategy, no CMS field mapping, no tokens. A build cannot be scaffolded.

It is **not C** (architecture incomplete) — the architecture *is* complete; what's missing is downstream of it. It is emphatically **not D** — nothing needs redesign. So: **B**, gated on (1) a one-batch governance fix and (2) two implementation documents + the Homepage HiFi. That is days of work, not weeks.

---

# Part 5 — Roadmap review (challenged and reordered)

**Challenge:** the proposed roadmap (and the migration plan behind it) front-loads a **filing project** — metadata headers, stable IDs, folder moves, an atomic migration lock, manifest adoption — *before* the two documents that actually unblock the build. It optimises the *container* before the *content*. In a Claude Project, "folders" are path prefixes and the corpus is ~30 files; the elaborate migration buys little and delays the real gate.

**Independent optimal sequence** (replaces the current roadmap):

1. **Record & freeze the visual pivot.** One decision-log batch: v2.0 authoritative, v1 + beige HiFi superseded, v2 HiFi = reference, production HiFi pending. Freeze v2.0. *(This is Blocker 1, and it is the only governance act that matters right now.)*
2. **Correct the stale visual references.** Repoint `WIREFRAMING_GUIDELINES` + the six wireframes from v1 → v2.0; neutralise "architectural publication" wording. Small, surgical.
3. **Decide the stack + CMS.** Author `TECHNICAL_ARCHITECTURE` and `CONTENT_MODEL_IMPLEMENTATION`. *(Blocker 2. This is the true gate — do it before any pixels.)*
4. **Produce the production Homepage HiFi** from v2.0 + the frozen Homepage wireframe/Page IA, using `HOMEPAGE_HIFI_v2` as a validated reference.
5. **Derive `DESIGN_TOKENS`** from that HiFi.
6. **Build the Homepage as a vertical slice** — real CMS, real tokens, real components, one page end-to-end. This validates the entire stack before you commit five more pages to it.
7. **Roll forward page by page:** Hub → Service → Archive → Work Entry → Contact, each as HiFi → build, freezing each HiFi just before its page is built.

**Removed / merged:** the folder-migration project (steps become a *lightweight* status-label pass + a README pointer, done opportunistically, not a locked atomic ceremony); the release-versioning cadence (collapse to the decision log); `MOTION`/`ACCESSIBILITY`/`SEO`/`PERFORMANCE` as separate milestones (folded into steps 3–5 as sections/checklists).

**The reorder in one line:** *governance fix → tech/CMS decision → Homepage slice → roll out.* Filing is not on the critical path.

---

# Part 6 — Ten biggest risks (ranked)

| # | Risk | Why it matters | Likelihood | Impact | Mitigation |
|---|---|---|---|---|---|
| 1 | **Ungoverned visual pivot** | Two visual truths, freeze record wrong, downstream stale → builder can't tell what to build | Certain (already true) | Critical | One decision-log batch + freeze v2.0 + repoint refs (Part 5 steps 1–2) |
| 2 | **No technical/CMS layer** | Build cannot start; will be improvised inconsistently if it does | Certain | Critical | Author the two implementation docs *before* code (step 3) |
| 3 | **Process over-engineering** | Governance/migration ceremony exceeds a solo portfolio's needs → maintenance tax, contributor friction | High | High | Slim governance to status-label + log; drop migration ceremony (Parts 9/11) |
| 4 | **No production HiFi / two drafts** | Visual ambiguity at the exact moment of build | High | High | Produce ONE Homepage HiFi from v2.0 (step 4) |
| 5 | **CMS "edit without code" unmodeled** | The owner's hard requirement is unmet; discovered late = expensive rework | High | High | `CONTENT_MODEL_IMPLEMENTATION` maps model→CMS early (step 3) |
| 6 | **Tacit knowledge in the log** | New engineer/designer can't decode F1/M3/D3 shorthand without reading everything | High | Medium-High | A short "how to read this project" + plain-language decision summaries |
| 7 | **Point-cloud / motion performance** | v2.0's signature moments are "prototype candidates," unvalidated; worst-case CWV | Medium-High | High | Prototype the point cloud + motion in the Homepage slice (step 6) before committing |
| 8 | **Duplicated authority** | Nav (2 homes), corpus-map (4 homes) drift over time | Medium | Medium | Merge to single owners (Part 2) |
| 9 | **Accessibility not committed** | WCAG 2.2 AA is *mentioned*, never an acceptance criterion → untested at launch | Medium | Medium | Commit AA as a build acceptance checklist (in step 3) |
| 10 | **Content readiness** | Everything is lorem; bilingual copy + curated assets + proof content are the real long pole | High | High (schedule) | Start a content inventory in parallel; it is out of doc-architecture scope but gates launch |

Risks 1–2 are true blockers. Risk 3 is the meta-risk this review most wants to flag: the documentation is at more risk from *too much process* than from *too little*.

---

# Part 7 — Blind spots (what confuses the newcomers in 6 months)

*A new senior engineer and a new product designer open this cold. Here is where they stall:*

- **"Which visual direction is real?"** They find `VISUAL_DIRECTION.md` (frozen per the release record) and `VISUAL_DIRECTION_v2.0.md` (says it's authoritative). The governance says the wrong one is frozen. **This is the first thing they hit and the most damaging.** Until Part 5 step 1 is done, the corpus actively misleads.
- **"Which HiFi do I build from?"** `HOMEPAGE_HIFI_DESIGN` says "authoritative for the Homepage visual layer"; `HOMEPAGE_HIFI_v2` says "supersedes nothing, validation exercise." Both sound official. Neither is production.
- **The decision log is unreadable cold.** F1/F2/M1–M5/C1/C2/D3/J6 are meaningful only after you've read the reviews and IA. There is no plain-language "state of the project in 10 sentences." Heavy reliance on historical knowledge.
- **The wireframes speak a dead language.** A designer reading `HOMEPAGE_WIREFRAME` sees "architectural publication" framing that the visual direction has abandoned. They will either build the wrong feel or waste a day reconciling it.
- **No stack = no starting point.** An engineer cannot even scaffold: Next? Astro? Which CMS? SSR or SSG? The corpus is 30 documents deep and answers none of it.
- **Subtle taxonomy.** Discipline vs Service vs Pillar vs Entry Type vs Attribution is genuinely hard; the model itself warns authors will conflate them. A newcomer *will* mis-tag without the worked examples in front of them.
- **Implicit responsive contract.** v2.0 demands "re-compose, not stack" but no breakpoints or art-direction rules are written; a developer will default to a naive stack and violate the visual intent silently.
- **No definition of "done" for a page.** Wireframes have a Definition of Done; *implementation* has none. When is a built page acceptable — which docs must it satisfy, at what a11y/perf bar? Undefined.
- **The name.** "diverse anumite" — final brand or placeholder? Nothing says. A designer won't know whether to treat the wordmark as fixed.
- **Pillar hub public names still open.** Routes exist; labels don't. A builder hits a `[slug open]` and stops.

The through-line: **the architecture is explicit; the *transition to build* is implicit.** Everything a designer/engineer needs to *start* — which visual is real, what stack, what "done" means, what the brand is called — is exactly what's missing or contradictory.

---

# Part 8 — Executive verdict

## Strengths
- **The layered design architecture** (content → IA → page contracts → components → wireframes) is senior-grade: strictly top-down, acyclic, single-responsibility. This is rare and worth protecting.
- **The content model** is the standout: identity/taxonomy/curation separation, stress-tested against 10 real cases, honest attribution. It will keep the site from rotting as the portfolio grows.
- **Discipline about reference-not-duplicate.** Principles are inherited/cited, not re-decided. Most corpora fail this; this one largely succeeds.
- **The visual pivot itself was the right call** — preserving the designer's real identity over a borrowed "publication" metaphor. The *content* of v2.0 is strong; only its *governance* lags.

## Weaknesses
- **A governed contradiction at the visual layer** — the worst kind, because the paperwork actively points the wrong way.
- **A hard cliff at the design/build boundary** — 0–5% maturity on everything technical.
- **Process weight outrunning the artifact** — six lifecycle states, four amendment channels, release versioning, an atomic migration lock, and stable-ID metadata for a **seven-page single-owner portfolio**.
- **Onboarding surface is poor** — the log is an audit trail, not an explanation; no plain-language "start here."

## Immediate priorities (in order)
1. Record + freeze the visual pivot (fixes the contradiction and the freeze record).
2. Repoint/rewrite the stale visual references in guidelines + wireframes.
3. Author `TECHNICAL_ARCHITECTURE` + `CONTENT_MODEL_IMPLEMENTATION`.
4. Produce the production Homepage HiFi → derive tokens.
5. Build the Homepage vertical slice.

## Things that should NOT be worked on yet (prevent premature optimisation)
- The **folder migration** (metadata headers, moves, atomic lock, manifest cutover). It is cosmetic relative to the build gate; do a lightweight status-label pass instead, later.
- **HiFi for pages beyond the Homepage.** Don't spec six pages before one is built and validated.
- **Standalone MOTION / ACCESSIBILITY / SEO / PERFORMANCE documents.** Fold them in.
- **Any further architectural refinement of the frozen corpus.** It is done; stop polishing it.
- **Release versioning cadence (v1.1, v1.2…).** Overhead without a team to serve.

## Suggested roadmap (next 5–8 milestones only)
1. Governance fix: freeze v2.0, correct references. *(½ day)*
2. Plain-language "Project State" one-pager (kills the onboarding blind spot). *(½ day)*
3. `TECHNICAL_ARCHITECTURE` + `CONTENT_MODEL_IMPLEMENTATION`. *(the real gate)*
4. Production Homepage HiFi. 5. `DESIGN_TOKENS`. 6. Homepage vertical slice (prototype the point cloud + motion here). 7. Roll out remaining pages HiFi→build. **Stop planning here.**

---

# Part 9 — Architecture challenge (redesign from scratch)

*Assume I just joined and owe nothing to the existing structure — including the docs I wrote.*

**The design-content layers: KEEP.** If I started today I would design essentially the same content-model → IA → nav → page-IA → design-system → wireframe → visual chain. The layering and single-responsibility discipline are correct. I would not redesign them.

**The governance/meta layer: REDESIGN and SIMPLIFY hard.** Here I would not build what exists.

- **Documentation architecture** — *simplify.* Six lifecycle states + a frozen/living sub-axis + `LOCKED-PENDING-MIGRATION` is more taxonomy than a solo site needs. I'd use **three** states: `Active` (build to it), `Reference` (context/history), `Superseded/Archived` (don't). That covers every real case here.
- **Layering** — *keep*, but note the layering has a usability cost: the implementation-inputs table lists **~8 "always required" docs per page**. A builder opening eight documents to build one page is a purity-over-usability smell. I'd add a per-page "build sheet" that *inlines* the handful of constraints that actually bind, so purity lives upstream and usability lives at the point of work.
- **Dependency graph** — *keep the shape*, fix the three duplications (nav, corpus-map ×4, visual ×2).
- **Governance model (4 channels + DOC-GOV + release increments)** — *redesign.* This is FAANG change-control on a portfolio. I'd replace it with: a **status field per doc** + an **append-only decision log** + a one-line rule ("frozen docs change only with a logged reason"). Drop the four-channel taxonomy, the DOC-GOV audit class, and release versioning. They are ceremony with no team to serve.
- **Migration strategy** — *remove almost entirely.* In a Claude Project, a flat folder with clear status labels is *fine*. The atomic-lock, copy-validate-cutover-delete machinery is engineering a problem the medium doesn't really have. Keep only: (a) the visual-pivot record, (b) the reference correction, (c) a README pointer. Drop the folder reorg or make it a trivial, un-ceremonied relabel.
- **Release strategy** — *remove.* "Documentation v1.0/v1.1" implies external consumers and cadence that don't exist. The decision log is the version history.
- **Metadata model** — *partially keep.* `document_id` is cheap and genuinely useful (survives moves) — keep it. Drop `editability` sub-states and the lock marker. A doc needs: `id`, `status`, `owns` (one line), `depends_on` (by id). That's it.
- **Document granularity** — *merge.* 31 docs for a 7-page site is too fine-grained. Target ~12–15: merge NAV into IA; fold PAGE_IA_INDEX into the manifest; make CONTENT_MODEL_VALIDATION an appendix; retire the four map/status docs into one living index; keep the six page contracts but consider one combined "Page Contracts" doc with six sections.
- **Implementation roadmap** — *reorder* per Part 5 (tech/CMS before filing).

**Would I remove anything entirely?** Yes: the release-record series, `METADATA_STANDARD` as a separate doc, `PAGE_IA_INDEX` (fold up), and the migration ceremony. **Would I split anything?** No. The pressure is all toward consolidation.

**Net redesign:** same excellent design spine; a **third** of the governance/meta apparatus; ~12–15 docs instead of 31→40.

---

# Part 10 — What I'd do differently with hindsight

**Create earlier:**
- A **provisional technical/CMS constraint sheet** at the very start. Rendering/CMS choices shape whether the content model is even realisable ("edit without code" is a CMS claim). Deciding stack *provisionally* early would have grounded the whole design.
- **One visual direction, authored after the brand was locked** — not two authored around an unsettled metaphor.

**Postpone:**
- The **per-page HiFi** ambition until the stack existed and one page was built.
- The **freeze/governance apparatus** — freezing a 7-page site's docs corpus-wide, up front, is what *created* the current contradiction (see below).

**Never create:**
- The **second visual direction as a parallel document.** It should have **superseded v1 in place** (or v1 amended), not spawned a rival — that fork is the direct cause of today's ambiguity.
- The **four overlapping map/status documents.**
- **Release versioning** and the **migration ceremony.**

**Reviews too early:** the **UI review (`ARCHITECTURE_REVIEW_02`)** reviewed a *pre-IA mock* against the new IA — useful, but it was reviewing an artifact already known to be stale. **Reviews too late:** *nothing* reviewed the **visual layer's governance** until this review — the pivot slipped through because the freeze happened before the visual direction had actually settled.

**Frozen too early:** the **visual direction** (frozen in v1.0, superseded hours later). Classic premature freeze — the corpus was declared immutable before the most subjective, least-settled layer had converged. **Frozen at the right time:** the **content model** (froze after a real stress test). That's the model to emulate.

**Should have stayed provisional longer:** visual direction and homepage HiFi. **Should have frozen earlier:** nothing — the design layers froze appropriately; the error was freezing the *visual* layer on the same schedule as the *structural* layers, when visual was nowhere near as settled.

**Ideal lifecycle for a project like this:**
> Brief → *provisional* stack/CMS constraints → content model (freeze after stress test) → IA + nav (freeze) → page contracts (freeze) → **one** visual direction, authored after brand lock, held *provisional* → wireframes + visual iterated *together* (not visual after wireframes) → tokens → **vertical-slice build of one page** → freeze visual/HiFi **just-in-time, per page, at build** → roll out.

The key inversion: **freeze structure early and hard; keep visual provisional and freeze it late, per page, at the moment of build** — the opposite of what happened.

---

# Part 11 — Is the documentation over-engineered?

**Yes — at the process/meta layer, though not at the design-content layer.** Be precise about where.

**The website:** 7 page types, one owner, one (probable) developer, a CMS, image handling, some scroll motion, one point-cloud showcase. Genuinely **moderate** implementation complexity.

**The documentation:** 31 files (proposed 40+), six lifecycle states, four amendment channels, an immutability policy, a release-versioning scheme, a `DOC-GOV` audit class, an atomic migration lock, stable-ID metadata, and four overlapping corpus maps. This is **high** complexity — and much of it (the parts *I* proposed) is enterprise change-control transplanted onto a portfolio site.

**Complexity estimates:**
- Documentation complexity: **HIGH** — and rising faster than the site.
- Implementation complexity: **MODERATE.**
- Documentation maintenance complexity: **HIGH and compounding** — every new doc must be metadata-tagged, ID'd, dependency-linked, release-versioned, and migration-tracked. That tax is paid forever, by one person.

**Where purity has cost usability:**
- **Eight required docs to build one page.** The strict layer separation is architecturally pure and operationally heavy.
- **Wireframes forbidden from mentioning color/type**, so a builder cross-references the visual direction constantly — and right now that reference is *stale*.
- **The freeze/amendment ceremony** means even fixing a typo in a frozen doc is, on paper, an "amendment batch citing a channel." For a solo author, that's friction with no reviewer to protect.
- **The migration plan** spends real design effort on an atomic lock protecting a ~30-file move that, in this medium, could be a five-minute relabel.

**Concrete simplifications (net reduction):**
1. Governance: 6 states → **3**; drop channels/DOC-GOV/release-versioning → **status field + append-only log + one rule.**
2. Docs: 31 → **~12–15** (merge nav→IA, index→manifest, validation→appendix, retire 4 map docs, retire release series).
3. Migration: replace the atomic-lock project with **relabel + README pointer**; drop the folder reorg or do it un-ceremonied.
4. Implementation layer: **2 real docs** (`TECHNICAL_ARCHITECTURE`, `CONTENT_MODEL_IMPLEMENTATION`) + HiFi/tokens — not 8.
5. Per-page **build sheets** that inline the binding constraints, so builders don't open eight documents.

**The one-line judgment:** the *design* documentation is right-sized and excellent; the *governance and migration* documentation has begun to model an organisation that doesn't exist. Maximise clarity, minimise the ceremony — and do it before the ceremony calcifies into something a future maintainer is afraid to touch.

---

## Closing

Approve for implementation? **Not yet — B, not A** — but the gap to "yes" is small and specific: **freeze the visual pivot, decide the stack/CMS, build one page.** Do *not* spend the interim perfecting the documentation system; it is already more elaborate than the website warrants. The next real artifact is not another Markdown document about documents — it is a running Homepage.
