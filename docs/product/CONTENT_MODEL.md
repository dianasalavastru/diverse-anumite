# Project Model & Taxonomy — CLIENT-VALIDATED

**Status: CLIENT-VALIDATED — v3.1, 2026-08-14. This document is the single source of truth for how a project is classified and which fields it requires.** All five questions left open by v3.0 were closed by the client on 2026-08-14 and are now written into the model itself; **nothing in this document is open, and nothing here blocks implementation.** It supersedes the frozen v2.1 model in its entirety on the taxonomy question. Where any other document (IA, Technical Architecture, Page IA, wireframes, Studio schema, code comments) still describes **Discipline**, **Entry Type** or **Project Type**, that description is superseded by this document and must be corrected, not reconciled.

Implementation impact and the migration plan live in [`PROJECT_MODEL_IMPACT.md`](PROJECT_MODEL_IMPACT.md). The historic worksheet [`../references/CONTENT_MODEL_VALIDATION.md`](../references/CONTENT_MODEL_VALIDATION.md) is a superseded point-in-time record and must not be built from.

---

## 1. The model in one sentence

```
PROJECT  =  PILLAR BASE FIELDS
          + FIELDS ACTIVATED BY THE SELECTED SERVICES
          + OPTIONAL PROJECT LABELS
```

Nothing sits between Pillar and Service. There is no Discipline, no Entry Type, no Project Type.

---

## 2. The taxonomy tree

```
PROJECT
│
├── PILLAR  [1 — exactly one]
│   ├── Arhitectură & Design      (Architecture & Design)
│   └── Reality Capture           (Reality Capture)
│
├── SERVICES  [1..N — multi-select, constrained to the project's Pillar]
│   │
│   ├── under Arhitectură & Design
│   │   ├── Proiectare de arhitectură
│   │   ├── Design interior
│   │   ├── Vizualizare 3D
│   │   └── Design mobilier
│   │
│   └── under Reality Capture
│       ├── Scanare laser 3D
│       ├── Scan-to-BIM
│       ├── Fotografie de arhitectură
│       └── Vizualizare de arhitectură
│
├── SECTOR  [1 — MANDATORY, SINGLE-SELECT · transversal, one vocabulary for both Pillars]
│   ├── Rezidențial
│   ├── Comercial & ospitalitate
│   ├── Birouri & business
│   ├── Public & comunitar
│   ├── Industrial & logistic
│   ├── Cultural & patrimoniu
│   └── Mixed-use & dezvoltări
│
├── STATUS  [1 — MANDATORY, SINGLE-SELECT · same vocabulary for both Pillars]
│   ├── În dezvoltare
│   ├── În desfășurare
│   ├── Finalizat
│   └── Nerealizat
│
├── LABELS  [0..N — optional, not mutually exclusive]
│   ├── CONCURS                   (competition)
│   └── PROIECT DE DIPLOMĂ        (diploma-project)
│
├── PILLAR BASE FIELDS            → §4 (A&D) · §6 (Reality Capture)
│
└── SERVICE-ACTIVATED FIELDS      → §5 (A&D) · §7 (Reality Capture)
    └── requirement derived from the selected Services (§8 merge rule)
```

> **The eight Services above are the complete, closed list for v3.1.**
>
> - **Drone photogrammetry is not a Service.** It is described in the brief and in older documentation as part of the practice's *capability*, and that framing stays true — but it is **not part of the Service taxonomy** and no ninth Service is created for it. It may be added later if explicitly validated; it is out of scope now.
> - **`Vizualizare 3D` (A&D) and `Vizualizare de arhitectură` (Reality Capture) are two intentionally distinct Services.** The similar names are not an accident, an oversight, or a duplication to be cleaned up: they are different offerings under different Pillars, with different activated fields (§5, §7). **Do not merge them and do not rename them** to resolve the apparent similarity — this is decided.

**Relationships**

```
PILLAR   ──has many──▶  SERVICE
SERVICE  ──belongs to one──▶  PILLAR

PROJECT  ──belongs to one──▶  PILLAR
PROJECT  ──has one or more──▶  SERVICE   (all within its own Pillar)
PROJECT  ──has one──▶  SECTOR
PROJECT  ──has one──▶  STATUS
PROJECT  ──may have──▶  LABELS
```

**What each axis answers**

| Axis | The question it answers |
|---|---|
| **Pillar** | Where does this project belong? |
| **Services** | What work does this project demonstrate? |
| **Sector** | What domain or context is it in? |
| **Status** | Where does it stand? |
| **Labels** | Does it have a special editorial characteristic? |

---

## 3. Legend

| Mark | Meaning |
|---|---|
| **[M]** | **Mandatory** — the project cannot be published without it. |
| **[O]** | **Optional** — offered, never blocking. |
| **[conditional]** | The requirement is **determined by the selected Service(s)**. It may resolve to [M], to [O], or to not-applicable. |

A field marked [conditional] is **one canonical field on the project**. Selecting two Services that both reference it does not create two fields — it only changes whether the single field is required.

---

## 4. Architecture & Design — Pillar base fields

Required of **every** project whose Pillar is Arhitectură & Design, whatever Services are selected.

```
ARHITECTURĂ & DESIGN — BASE
│
├── [M] Servicii            Services            (multiple, A&D only)
├── [M] Sector / Domeniu    Sector
├── [M] Titlu               Title
├── [M] An                  Year
├── [M] Stadiu / Status     Status
├── [M] Client              Client
├── [M] Descriere           Description
├── [M] Imagine principală  Cover
├── [M] Galerie             Gallery
│
├── [O] Colaboratori        Collaborators
└── [O] Echipă              Team
```

> **Locație / Location is NOT an Architecture & Design base field.** Its requirement is decided by the selected Services (§5).

---

## 5. Architecture & Design — fields activated by Service

| Service | Adds | Requirement |
|---|---|---|
| **Proiectare de arhitectură** | Locație · Suprafață | **[M]** · **[M]** |
| | Premii (Awards) | [O] |
| **Design interior** | Locație · Suprafață | **[M]** · **[M]** |
| | Premii (Awards) | [O] |
| **Vizualizare 3D** | Locație | [O] |
| **Design mobilier** | Firmă implementare (Implementation Company) | **[M]** |

---

## 6. Reality Capture — Pillar base fields

Required of **every** project whose Pillar is Reality Capture, whatever Services are selected.

```
REALITY CAPTURE — BASE
│
├── [M] Servicii            Services            (multiple, RC only)
├── [M] Sector / Domeniu    Sector
├── [M] Titlu               Title
├── [M] An                  Year
├── [M] Stadiu / Status     Status
├── [M] Client              Client
├── [M] Imagine principală  Cover
└── [M] Galerie             Gallery
```

> **Descriere / Description is deliberately NOT mandatory for Reality Capture.** This is a client-validated decision, not an oversight: a survey is evidenced by its imagery and its measured facts, and forcing narrative prose onto every scan would produce filler. Description remains available and is [O].
>
> **Locație / Location is NOT a Reality Capture base field** either. Its requirement is decided by the selected Services (§7).

---

## 7. Reality Capture — fields activated by Service

| Service | Adds | Requirement |
|---|---|---|
| **Scanare laser 3D** | Echipament · Locație · Suprafață | **[M]** · **[M]** · **[M]** |
| **Scan-to-BIM** | Locație · Suprafață | **[M]** · **[M]** |
| | Colaboratori · Echipă | [O] · [O] |
| **Fotografie de arhitectură** | Echipament · Locație | **[M]** · **[M]** |
| **Vizualizare de arhitectură** | Locație | [O] |
| | Colaboratori · Echipă | [O] · [O] |

---

## 8. The multiple-Service merge rule

Services are multi-select and their field requirements are **additive**. The project keeps **one** canonical field per concept; the selected Services only decide that field's requirement level.

```
MANDATORY  >  OPTIONAL  >  NOT APPLICABLE
```

Read as: *the strongest requirement among the selected Services wins.* If one selected Service makes a field optional and another makes it mandatory, the field is **mandatory**.

**Worked example A — Architecture & Design**

```
Services: Design interior + Design mobilier

  A&D base mandatory fields
+ Locație              [M]   (from Design interior)
+ Suprafață            [M]   (from Design interior)
+ Firmă implementare   [M]   (from Design mobilier)
+ Premii               [O]   (from Design interior)
```

**Worked example B — Reality Capture**

```
Services: Scanare laser 3D + Scan-to-BIM

  Reality Capture base mandatory fields
+ Echipament           [M]   (from Scanare laser 3D)
+ Locație              [M]   (from both)
+ Suprafață            [M]   (from both)
+ Colaboratori         [O]   (from Scan-to-BIM)
+ Echipă               [O]   (from Scan-to-BIM)
```

**Worked example C — the merge rule doing real work**

```
Services: Vizualizare 3D + Proiectare de arhitectură

  Locație is [O] for Vizualizare 3D
  Locație is [M] for Proiectare de arhitectură
  → Locație resolves to [M].            MANDATORY WINS.
```

---

## 9. Full field-resolution matrix

One row per field, one column per Service. `—` = the Service does not activate the field.

### Architecture & Design

| Field | base | Proiectare de arhitectură | Design interior | Vizualizare 3D | Design mobilier |
|---|:--:|:--:|:--:|:--:|:--:|
| Servicii | **M** | — | — | — | — |
| Sector | **M** | — | — | — | — |
| Titlu | **M** | — | — | — | — |
| An | **M** | — | — | — | — |
| Stadiu / Status | **M** | — | — | — | — |
| Client | **M** | — | — | — | — |
| Descriere | **M** | — | — | — | — |
| Imagine principală | **M** | — | — | — | — |
| Galerie | **M** | — | — | — | — |
| Colaboratori | O | — | — | — | — |
| Echipă | O | — | — | — | — |
| **Locație** | — | **M** | **M** | O | — |
| **Suprafață** | — | **M** | **M** | — | — |
| **Premii** | — | O | O | — | — |
| **Firmă implementare** | — | — | — | — | **M** |

### Reality Capture

| Field | base | Scanare laser 3D | Scan-to-BIM | Fotografie de arhitectură | Vizualizare de arhitectură |
|---|:--:|:--:|:--:|:--:|:--:|
| Servicii | **M** | — | — | — | — |
| Sector | **M** | — | — | — | — |
| Titlu | **M** | — | — | — | — |
| An | **M** | — | — | — | — |
| Stadiu / Status | **M** | — | — | — | — |
| Client | **M** | — | — | — | — |
| Imagine principală | **M** | — | — | — | — |
| Galerie | **M** | — | — | — | — |
| Descriere | O | — | — | — | — |
| **Locație** | — | **M** | **M** | **M** | O |
| **Suprafață** | — | **M** | **M** | — | — |
| **Echipament** | — | **M** | — | **M** | — |
| **Colaboratori** | — | — | O | — | O |
| **Echipă** | — | — | O | — | O |

---

## 10. Project Labels

Labels are **optional editorial flags**, not a taxonomy layer and not a type.

| Value | Label (RO) |
|---|---|
| `competition` | **CONCURS** |
| `diploma-project` | **PROIECT DE DIPLOMĂ** |

- A project may carry **none**, **one**, or **both**. They are not mutually exclusive.
- Labels never change which fields a project requires.
- Labels are what the *Concursuri* curated view is built from. That view keeps its existing public routes — `/proiecte/concursuri` and `/en/projects/competitions` — and its membership rule becomes `labels contains competition`.
- **No Entry Type / Project Type is created to support them.** That was the old mechanism; it is removed.

---

## 11. Global vocabularies — Sector and Status

### 11.1 Sector — [M], exactly one

**Sector is mandatory and single-select: every project carries exactly one.** One **global** vocabulary, used identically by both Pillars. There are no separate Architecture sectors and Reality Capture sectors.

| Value | Label (RO) |
|---|---|
| `rezidential` | Rezidențial |
| `comercial-ospitalitate` | Comercial & ospitalitate |
| `birouri-business` | Birouri & business |
| `public-comunitar` | Public & comunitar |
| `industrial-logistic` | Industrial & logistic |
| `cultural-patrimoniu` | Cultural & patrimoniu |
| `mixed-use-dezvoltari` | Mixed-use & dezvoltări |

Sector is **classification and filtering metadata only**. It never activates a project field.

**Genuinely mixed-use work uses `mixed-use-dezvoltari`** — that value exists precisely so a single Sector is always sufficient, and it is why the axis does not need to be multi-select. Cardinality may be revisited if real content demonstrates a need; for v3.0/v3.1 it is **decided and closed**.

> **The Service object's `sectors` is a different field, and it stays plural** (decided 2026-08-14). A **project** has exactly one Sector — where this piece of work actually is. A **Service** lists the sectors it is *typically relevant in*, which is genuinely many and genuinely optional. Both read the same closed seven-value vocabulary; only their cardinality differs.
>
> | | Field | Cardinality | Required |
> |---|---|---|---|
> | **Project** | `sector` | exactly one | **[M]** |
> | **Service** | `sectors` | zero or more | [O] |
>
> Do **not** collapse the Service field to a scalar to make the two match — they answer different questions.

### 11.2 Status — [M], exactly one

**Status is mandatory and single-select in both Pillars.** Closed vocabulary:

| Value | Label (RO) |
|---|---|
| `in-dezvoltare` | În dezvoltare |
| `in-desfasurare` | În desfășurare |
| `finalizat` | Finalizat |
| `nerealizat` | Nerealizat |

**These four values are the whole vocabulary.** No capture-workflow statuses (*Scanat*, *Procesare*, *Livrat* or similar) are to be added — a survey's progress is expressed by these same four values, like every other project. The vocabulary **replaces** the v2.1 set (Built/Realized · Unbuilt/Proposal · In progress · Delivered), which is withdrawn. It may be revisited once real Reality Capture content has been entered; until then it is **decided and closed**, and it is not an implementation blocker.

---

## 12. Removed concepts

These are gone from the model. They must not be reintroduced, and no field, filter, view, label or comment may reconstruct them under another name.

| Removed | Was | Replaced by |
|---|---|---|
| **Discipline** | mandatory axis (Architecture · Interior Design · Reality Capture · Visualization), primary + secondary; **Pillar was derived from it** | **Pillar is now authored directly** (one per project). The granularity Discipline carried is carried by **Services**. |
| **Entry Type / Project Type** | mandatory axis (Design Project · Concept/Study · Competition Entry · Survey/Documentation · Visualization Commission), primary + secondary | Nothing replaces it as an axis. Its two genuinely useful values become **Labels** (CONCURS) or are expressed by **Service** selection (Survey/Documentation → Scanare laser 3D; Visualization Commission → Vizualizare 3D / Vizualizare de arhitectură). |
| **Derived Pillar** | Pillar computed from Discipline via a derivation table; never authored | **Pillar is an authored field.** No derivation table, no read-only Studio readout, no primary/secondary Pillar pair. |
| **Cross-pillar projects** | one project could resolve into **both** Pillars via secondary Discipline | **A project belongs to exactly one Pillar.** Work spanning both is modelled as **two linked projects** (the "related projects" link already exists for this). |
| **Separate sector vocabularies** | one open-ended list with per-pillar usage drift | **One global, closed Sector vocabulary**, single-select (§11.1). |
| **Attribution** | mandatory axis (Independent · Collaboration · Studio); the membership rule of the *Experiență profesională* curated view | **Nothing.** Crediting is carried by **Colaboratori** and **Echipă** — see §13. |
| **Employer / Office** | reference list, 0–1, only when Attribution = Studio; the grouping key of *Experiență profesională* | **Nothing.** An office's name, where it needs saying, is written into Colaboratori or Echipă. |
| **Roles** | multiple free-text functions performed, display-only | **Nothing.** Absorbed by Echipă. |
| **Authorship** (scoped credit statement) | mandatory localized sentence for Visualization Commission / Studio / Collaboration entries, enforced by `validateAuthorship()` | **Nothing.** The concept is retired together with the model that required it. |
| **Commissioning context** | self-initiated vs client-commissioned | **Nothing.** Client is now a mandatory base field in both Pillars, so the distinction it encoded no longer needs its own axis. |
| **Old Status vocabulary** | Built/Realized · Unbuilt/Proposal · In progress · Delivered | **În dezvoltare · În desfășurare · Finalizat · Nerealizat** (§11.2). |

---

## 13. What the model keeps

The simplification is to the **classification** layer only. The following are unchanged and remain in force.

**Two content objects.** The project (internally `workEntry`) and the **Service**. Service stays a **first-class content object** with its own page, its own SEO target and its own editorial copy — it is not a tag. The project stores the reference; the Service page renders the projects that demonstrate it, in reverse. A Service with zero projects is still fully publishable.

**The curation layer stays separate from classification.** Featured · Pinned · Editorial Priority · Homepage/Hub placements · Masonry prominence. Taxonomy decides *eligibility*; curation decides *emphasis and order*. The owner re-curates the homepage without re-classifying anything.

**Crediting is carried by two fields, and only two.** **Colaboratori** (Collaborators) and **Echipă** (Team) — both optional, both plain lists, both display-only and never filters. They are sufficient for crediting in this model: an office, a co-author or a partner practice is named in one of them. **Attribution, Employer/Office, Roles and the scoped Authorship statement are retired** (§12) and take no part in taxonomy, filtering, field activation or validation.

> **The *Experiență profesională* curated view is permanently retired** (product decision, 2026-08-14; `DECISIONS_LOG.md` #97). It was defined as *Attribution = Studio, grouped by Employer*, and both of those are gone. **There is no replacement membership rule, and none is to be designed** — the **About / Despre** page is the surviving home for professional-background content. `/proiecte/experienta-profesionala` and `/en/projects/professional-experience` will 404, while **both slugs stay reserved** so no project can claim a historical URL.

**Reality-capture asset handling stays.** Point-cloud web derivative, poster fallback, point count, accuracy, and the `capturePublicationCleared` publication gate are unaffected by this change.

**Localization stays.** One locale-neutral document per project and per Service, with localized *fields*; `enPublished` gates English page generation. Romanian is the root locale.

---

## 14. Implementation notes

Written for the build, not for the client.

1. **Pillar becomes an authored, required, single-value field** on the project. Delete the Discipline→Pillar derivation table and every consumer of it.
2. **Services are constrained to the project's Pillar** in the reference picker, and at least one is required.
3. **Each Service document needs a stable machine key** (`proiectare-arhitectura`, `design-interior`, `vizualizare-3d`, `design-mobilier`, `scanare-laser-3d`, `scan-to-bim`, `fotografie-arhitectura`, `vizualizare-arhitectura`). The field-activation rules in §5 and §7 must key off that stable value — **never off an editable slug or a display name**, both of which the owner can change from the Studio.
4. **The requirement table is data, not branching.** Express §5/§7 as one lookup keyed by service key, and resolve it with a single `max(MANDATORY, OPTIONAL, N/A)` merge (§8). One table, read by the Studio validator and the build validator alike.
5. **Fields that become [conditional]** — Locație, Suprafață, Premii, Echipament, Colaboratori, Echipă, Firmă implementare — stay **single canonical fields on the project**. Only their validation changes.
6. **`Firmă implementare` is a new field** and does not exist anywhere today.
7. **`Echipament` moves out of the capture-metadata group** into project-level metadata, because Fotografie de arhitectură now requires it and that service has no capture asset.
8. **Labels are a new multi-select field** with the closed vocabulary in §10.
9. **Sector becomes a closed vocabulary** (§11) rather than an open free-string axis, and the old values (`residential`, `hospitality`, `office`, `cultural`, `heritage`, `industrial`, `infrastructure`, `education`) map onto the new seven.
10. **Archive filters:** the frozen filter contract loses `type` and `discipline`. Proposed replacement — Pillar (mode) · Sector (shared) · Service (contextual refinement, now available in **both** pillars) · Label (shared) · Year as sort. Sequencing and URL implications are in [`PROJECT_MODEL_IMPACT.md`](PROJECT_MODEL_IMPACT.md).
11. **Sector changes shape as well as vocabulary:** it is currently an *array* of free strings and becomes a **single required value** from the closed list (§11.1).
12. **Status keeps its shape and replaces its vocabulary** (§11.2). All four old values map onto the new four; the mapping is in [`PROJECT_MODEL_IMPACT.md`](PROJECT_MODEL_IMPACT.md) §3.
13. **`validateAuthorship()` is removed, not re-keyed.** It currently fires on `entryType === 'visualization-commission'` (plus Studio / Collaboration attribution). Because Authorship itself is retired, the correct action is **deletion of the rule and its consumers**, not moving its trigger onto a Service. Audit its call sites during implementation and preserve only an invariant that turns out to be unrelated to authorship; there is no expectation that one exists.
14. **Attribution, Employer, Roles, Authorship and Commissioning context are deleted** from the schema, the type contract, the vocabularies, the label maps, the Studio groups and the projections. `employer` as a *document type* goes with them unless a use is found for it outside crediting.

---

## 15. Closed questions — nothing is open

The five questions v3.0 carried were **closed by the client on 2026-08-14** and are written into the normative sections above. They are recorded here only so a reader following an old cross-reference lands on the answer.

| # | Question as posed by v3.0 | Closed as | Written into |
|---|---|---|---|
| **Q1** | Are Attribution / Employer / Roles / Authorship retained? | **No — retired.** Colaboratori and Echipă are the crediting fields, and they are sufficient. | §12, §13, §14.13–14 |
| **Q2** | Where does drone photogrammetry sit? | **Not a Service.** It stays a description of the practice's capability. No ninth Service. | §2 |
| **Q3** | Are *Vizualizare 3D* and *Vizualizare de arhitectură* too similar? | **They are intentionally distinct.** Keep both names; do not merge or rename. | §2 |
| **Q4** | What is the Status vocabulary? | **În dezvoltare · În desfășurare · Finalizat · Nerealizat.** Mandatory, single-select, both Pillars. | §11.2 |
| **Q5** | Is Sector single- or multi-select? | **Mandatory, single-select.** `Mixed-use & dezvoltări` covers genuinely mixed projects. | §11.1 |

**There are no open questions and no blockers in this model.** Two items are explicitly *revisitable later against real content* — the Status vocabulary and Sector cardinality — but both are decided for v3.1 and neither is a reason to delay implementation. The one downstream consequence, the *Experiență profesională* curated view, was **closed on 2026-08-14: the view is permanently retired** (§13).

---

## 16. Change log

- **v3.1 (2026-08-14) — CLIENT-VALIDATED. The five open questions closed.** Attribution, Employer, Roles, Authorship and Commissioning context **retired** — crediting is Colaboratori + Echipă (Q1). Drone photogrammetry confirmed **not** a Service; the eight-Service list is closed (Q2). *Vizualizare 3D* and *Vizualizare de arhitectură* confirmed **intentionally distinct** (Q3). Status vocabulary replaced with **În dezvoltare · În desfășurare · Finalizat · Nerealizat**, mandatory and single-select in both Pillars (Q4). Sector confirmed **mandatory and single-select** (Q5). No change to Pillar, Services, Labels, the merge rule, routes, localization, curation, capture-asset handling or discovery order.
- **v3.0 (2026-08-13) — CLIENT-VALIDATED. Simplified project model.** Discipline and Entry Type / Project Type removed entirely. Pillar becomes authored and single-valued; Services become the multi-select axis and the driver of conditional field requirements; CONCURS and PROIECT DE DIPLOMĂ become optional Labels; one global Sector vocabulary replaces the open per-pillar list. Cross-pillar projects are modelled as two linked projects. The curation layer, the Service object and capture-asset handling are unchanged. *(v3.0 additionally retained the credit fields pending Q1; v3.1 retires them.)*
- v2.1 (FROZEN 2026-07-28) — **superseded.** Service elevated to a first-class object; curation layer separated from taxonomy. Its Discipline / Entry Type / derived-Pillar taxonomy is withdrawn by v3.0.
- v2 — Work Entry as canonical object; Entry Type = nature not status; Pillar derived; Sector facet; scoped Authorship; modular detail layout.
- v1 — initial one-object, multi-axis proposal.

---

*Romanian labels above are written with diacritics for readability. Site copy follows the standing owner decision (OD-8) to author Romanian **without** diacritics; slugs remain lowercase ASCII and hyphenated.*
