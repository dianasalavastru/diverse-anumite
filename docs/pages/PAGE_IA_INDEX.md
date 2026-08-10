# Page IA Index — architectural reference

**A map, not a specification.** This document ties the six Page IA blueprints into one coherent system. It introduces **no new architectural decisions**, reinterprets nothing, and duplicates no detailed Page IA content — it only **summarizes and cross-references**. Every statement is traceable to an authoritative document.

**Read this first** if you are new to the project — then read the individual blueprints for detail.

Authoritative sources: `HOMEPAGE_PAGE_IA.md`, `HUB_PAGE_IA.md`, `SERVICE_PAGE_IA.md`, `WORK_ARCHIVE_PAGE_IA.md`, `WORK_ENTRY_PAGE_IA.md`, `CONTACT_PAGE_IA.md` — built on `INFORMATION_ARCHITECTURE.md`, `CONTENT_MODEL.md` (frozen v2.1), `NAV_DECISION_RECORD.md`, `ARCHITECTURE_REVIEW_02.md`, `DECISIONS_LOG.md`.

---

## 1. Purpose

The Page IA Index is the **reference layer** connecting the individual Page IA blueprints. Where each blueprint defines one page, this index defines the **language of the website as a whole** — how the pages relate, how journeys flow, and where each responsibility begins and ends. It is the entry point to the Page IA layer; it is not itself a page specification.

## 2. The six Page IA contracts

| Page | Primary responsibility | Primary inbound | Primary outbound | Blueprint |
|---|---|---|---|---|
| **Homepage** | Understand the practice | Entry | Hub | `HOMEPAGE_PAGE_IA.md` |
| **Hub** | Understand a capability | Homepage | Service / Archive | `HUB_PAGE_IA.md` |
| **Service** | Understand a solution | Hub / Search / Work Entry | Contact | `SERVICE_PAGE_IA.md` |
| **Work Archive** | Confidently explore evidence | Hub / Service | Work Entry | `WORK_ARCHIVE_PAGE_IA.md` |
| **Work Entry** | Independently assess evidence | Archive / Service | Service / Contact | `WORK_ENTRY_PAGE_IA.md` |
| **Contact** | Confidently initiate a relevant conversation | Everywhere | Confirmation | `CONTACT_PAGE_IA.md` |

*(Inbound/outbound show the **primary** edges; each blueprint lists the full set.)*

## 3. Responsibility boundaries (what each page intentionally does NOT do)

These make overlaps immediately visible — no two pages share a responsibility.

- **Homepage** — not a Hub · not a Service · not the Archive · does not sell or list (it **routes**).
- **Hub** — not a second Homepage · not a Service page · not the Archive · not About (single-capability focus).
- **Service** — not a Hub · not the Archive · not About · not Contact · not a persuasion-only landing.
- **Work Archive** — not a Service page · not About · not a Work Entry (no in-depth project) · does not persuade.
- **Work Entry** — not a pitch · not a Service explainer · not the Archive · not About · not a Hub.
- **Contact** — does not explain services · does not present work · not About · does not persuade · not a marketing landing.

## 4. Journey language

The primary architectural journeys, in the system's own vocabulary:

**Discovery** — Homepage → Hub → Archive → Work Entry
**Decision** — Homepage → Hub → Service → Contact
**Evidence-driven** — Archive → Work Entry → Service → Contact
**Search** — Search → Service → Contact · or · Search → Work Entry → Service → Contact

Two structural facts underlie all of them: **the Work Entry is the convergence point between discovery and service journeys** (`WORK_ENTRY_PAGE_IA.md` §4), and **Contact is where every major journey terminates** (`CONTACT_PAGE_IA.md` §1).

## 5. Responsibility progression

How visitor understanding evolves across the system — one page, one step of understanding:

**Practice → Capability → Solution → Evidence exploration → Evidence assessment → Conversation**

- **Practice** — Homepage
- **Capability** — Hub
- **Solution** — Service
- **Evidence exploration** — Work Archive
- **Evidence assessment** — Work Entry
- **Conversation** — Contact

Each stage builds on the previous; understanding accumulates, and Contact converts it into action.

## 6. Shared architectural principles

Recurring principles already established across the blueprints — collected here, not redefined:

- **Why precedes what.**
- **Understanding before persuasion.**
- **One page, one responsibility.**
- **One module, one responsibility.**
- **Reference, don't duplicate.**
- **Canonical destinations** (module CTA → canonical page).
- **Context before action** (Topic / Regarding prefills).
- **Honest attribution** (transparency over ownership claims).
- **Evidence over claims** (independent assessment, not persuasion).
- **Progressive disclosure** (filters reduce complexity, not expose taxonomy).
- **Browse before filtering.**
- **Empty states preserve context** (never a bare error).

## 7. Dependency map

Where the Page IA layer sits in the overall project — each layer depends on the one above and is a stable contract for the one below:

**Foundations → Content Model → Information Architecture → Page IA → Wireframes → Components → Visual Design**

The Page IA layer is downstream of the frozen architecture and **upstream of all design/build**. It translates the locked IA into per-page contracts without adding architecture.

## 8. Completion statement

The Page IA layer now forms a **complete architectural language** for the website. Each page owns a single responsibility, every transition is intentional, and together the six Page IA documents provide **stable contracts** for wireframing, component design, visual design, and implementation. **Future design work should extend these contracts rather than redefine them.**
