# EXPORT MANIFEST — diverse anumite Project Corpus (Corpus A)

**Export type:** Lossless recovery export of the Claude Project document store. Not a cleanup, not a migration.
**Corpus boundary:** all 41 tool-visible Project items (39 Markdown documents + 2 PDF source files), owner-approved.
**Export date:** 2026-08-10
**Export root:** `diverse-anumite-project-corpus-export/`
**Fidelity guarantee:** original content preserved exactly. No documents rewritten, reformatted, renamed, re-headed, re-statused, reference-corrected, reorganized, or deleted. Governance contradictions were left intact by design.

**Verification method:** each Markdown file was compared byte-for-byte against a fresh, independent `project_read` of the current Project source using both `diff` (exit 0 = identical) and `sha256sum` (hash match). Original relative paths preserved.

**Scope notes (owner-directed):**
- The two PDFs cannot be exported as lossless binary via the Projects API (it exposes only extracted text, which is deliberately NOT substituted). They are marked `BINARY SOURCE — REQUIRES EXTERNAL COPY`; placeholder markers live in `_BINARY_SOURCES_REQUIRED/`.
- External HTML prototypes referenced by `MOTION_NOTES.md` are **Corpus B** — out of scope; not reconstructed.
- `INSPIRATION.md` is **not present** in this Project and is **not** created/recovered here (belongs to Corpus B if it exists elsewhere).
- No planned/GAP documents were created. No future Git structure was applied.

---

## Manifest — all 41 corpus items

| ORIGINAL PROJECT PATH | EXPORTED PATH | TYPE | EXPORT STATUS | VERIFICATION STATUS | NOTES |
|---|---|---|---|---|---|
| `PROJECT_CONTEXT.md` | `PROJECT_CONTEXT.md` | Markdown | EXPORTED — VERIFIED | Byte-identical (diff 0 + sha256) | 3968 B. Foundation/brief. No trailing newline in source (preserved). |
| `README.md` | `README.md` | Markdown | EXPORTED — VERIFIED | Byte-identical (diff 0 + sha256) | 0 B. Legitimately empty (placeholder) in store. |
| `01_DRAFT_propunere websiteATELIERdiverseanumite.pdf` | `_BINARY_SOURCES_REQUIRED/…REQUIRES_EXTERNAL_COPY.txt` (marker only) | PDF (binary) | BINARY SOURCE — REQUIRES EXTERNAL COPY | N/A — not exported | Source client proposal, draft 1. API returns extracted text only; original binary must be supplied externally. |
| `02_DRAFT_propunere websiteATELIERdiverseanumite.pdf` | `_BINARY_SOURCES_REQUIRED/…REQUIRES_EXTERNAL_COPY.txt` (marker only) | PDF (binary) | BINARY SOURCE — REQUIRES EXTERNAL COPY | N/A — not exported | Source client proposal, draft 2. Same limitation. |
| `claude/START_HERE.md` | `claude/START_HERE.md` | Markdown | EXPORTED — VERIFIED | Byte-identical (diff 0 + sha256) | 14042 B. Newest doc; onboarding front page. |
| `claude/DECISIONS_LOG.md` | `claude/DECISIONS_LOG.md` | Markdown | EXPORTED — VERIFIED | Byte-identical (diff 0 + sha256) | 9731 B. LIVING ledger; ends Batch 19. |
| `claude/DOCUMENTATION_RELEASE_v1.0.md` | `claude/DOCUMENTATION_RELEASE_v1.0.md` | Markdown | EXPORTED — VERIFIED | Byte-identical (diff 0 + sha256) | 6758 B. Freeze record (stale re v2.0 — preserved as-is). |
| `claude/CONTENT_MODEL.md` | `claude/CONTENT_MODEL.md` | Markdown | EXPORTED — VERIFIED | Byte-identical (diff 0 + sha256) | 12071 B. FROZEN v2.1. |
| `claude/CONTENT_MODEL_VALIDATION.md` | `claude/CONTENT_MODEL_VALIDATION.md` | Markdown | EXPORTED — VERIFIED | Byte-identical (diff 0 + sha256) | 11603 B. Reference (F6 terminology note). |
| `claude/INFORMATION_ARCHITECTURE.md` | `claude/INFORMATION_ARCHITECTURE.md` | Markdown | EXPORTED — VERIFIED | Byte-identical (diff 0 + sha256) | 16599 B. Steps 1–7 locked. |
| `claude/NAV_DECISION_RECORD.md` | `claude/NAV_DECISION_RECORD.md` | Markdown | EXPORTED — VERIFIED | Byte-identical (diff 0 + sha256) | 6246 B. Navigation ADR. |
| `claude/DISCOVERY_REVIEW.md` | `claude/DISCOVERY_REVIEW.md` | Markdown | EXPORTED — VERIFIED | Byte-identical (diff 0 + sha256) | 19845 B. Historical (superseded in part). |
| `claude/ARCHITECTURE_REVIEW.md` | `claude/ARCHITECTURE_REVIEW.md` | Markdown | EXPORTED — VERIFIED | Byte-identical (diff 0 + sha256) | 12875 B. Historical review (F1–F6). |
| `claude/ARCHITECTURE_REVIEW_02.md` | `claude/ARCHITECTURE_REVIEW_02.md` | Markdown | EXPORTED — VERIFIED | Byte-identical (diff 0 + sha256) | 10876 B. Historical review (C1/C2/M1–M5). |
| `claude/PAGE_IA_INDEX.md` | `claude/PAGE_IA_INDEX.md` | Markdown | EXPORTED — VERIFIED | Byte-identical (diff 0 + sha256) | 5615 B. Page IA index (reference). |
| `claude/HOMEPAGE_PAGE_IA.md` | `claude/HOMEPAGE_PAGE_IA.md` | Markdown | EXPORTED — VERIFIED | Byte-identical (diff 0 + sha256) | 13471 B. Authoritative page contract. |
| `claude/HUB_PAGE_IA.md` | `claude/HUB_PAGE_IA.md` | Markdown | EXPORTED — VERIFIED | Byte-identical (diff 0 + sha256) | 13235 B. Authoritative page contract. |
| `claude/SERVICE_PAGE_IA.md` | `claude/SERVICE_PAGE_IA.md` | Markdown | EXPORTED — VERIFIED | Byte-identical (diff 0 + sha256) | 12726 B. Authoritative page contract. |
| `claude/WORK_ARCHIVE_PAGE_IA.md` | `claude/WORK_ARCHIVE_PAGE_IA.md` | Markdown | EXPORTED — VERIFIED | Byte-identical (diff 0 + sha256) | 12970 B. Authoritative page contract. |
| `claude/WORK_ENTRY_PAGE_IA.md` | `claude/WORK_ENTRY_PAGE_IA.md` | Markdown | EXPORTED — VERIFIED | Byte-identical (diff 0 + sha256) | 15650 B. Authoritative page contract. |
| `claude/CONTACT_PAGE_IA.md` | `claude/CONTACT_PAGE_IA.md` | Markdown | EXPORTED — VERIFIED | Byte-identical (diff 0 + sha256) | 10188 B. Authoritative page contract. |
| `claude/WIREFRAME_PRINCIPLES.md` | `claude/WIREFRAME_PRINCIPLES.md` | Markdown | EXPORTED — VERIFIED | Byte-identical (diff 0 + sha256) | 6480 B. Design system. |
| `claude/COMPONENT_INVENTORY.md` | `claude/COMPONENT_INVENTORY.md` | Markdown | EXPORTED — VERIFIED | Byte-identical (diff 0 + sha256) | 17959 B. Design system. |
| `claude/WIREFRAMING_GUIDELINES.md` | `claude/WIREFRAMING_GUIDELINES.md` | Markdown | EXPORTED — VERIFIED | Byte-identical (diff 0 + sha256) | 6371 B. Cites superseded VISUAL_DIRECTION.md (preserved). |
| `claude/HOMEPAGE_WIREFRAME.md` | `claude/HOMEPAGE_WIREFRAME.md` | Markdown | EXPORTED — VERIFIED | Byte-identical (diff 0 + sha256) | 12132 B. Cites superseded VD (preserved). |
| `claude/PILLAR_HUB_WIREFRAME.md` | `claude/PILLAR_HUB_WIREFRAME.md` | Markdown | EXPORTED — VERIFIED | Byte-identical (diff 0 + sha256) | 12649 B. Cites superseded VD (preserved). |
| `claude/SERVICE_WIREFRAME.md` | `claude/SERVICE_WIREFRAME.md` | Markdown | EXPORTED — VERIFIED | Byte-identical (diff 0 + sha256) | 11777 B. Cites superseded VD (preserved). |
| `claude/WORK_ARCHIVE_WIREFRAME.md` | `claude/WORK_ARCHIVE_WIREFRAME.md` | Markdown | EXPORTED — VERIFIED | Byte-identical (diff 0 + sha256) | 11740 B. Cites superseded VD (preserved). |
| `claude/WORK_ENTRY_WIREFRAME.md` | `claude/WORK_ENTRY_WIREFRAME.md` | Markdown | EXPORTED — VERIFIED | Byte-identical (diff 0 + sha256) | 12262 B. Cites superseded VD (preserved). |
| `claude/CONTACT_WIREFRAME.md` | `claude/CONTACT_WIREFRAME.md` | Markdown | EXPORTED — VERIFIED | Byte-identical (diff 0 + sha256) | 12630 B. Cites superseded VD (preserved). |
| `claude/VISUAL_DIRECTION.md` | `claude/VISUAL_DIRECTION.md` | Markdown | EXPORTED — VERIFIED | Byte-identical (diff 0 + sha256) | 6072 B. SUPERSEDED (v1) — retained per recovery scope. |
| `claude/VISUAL_DIRECTION_v2.0.md` | `claude/VISUAL_DIRECTION_v2.0.md` | Markdown | EXPORTED — VERIFIED | Byte-identical (diff 0 + sha256) | 30123 B. Current visual authority (freeze pending). |
| `claude/design/HOMEPAGE_HIFI_DESIGN.md` | `claude/design/HOMEPAGE_HIFI_DESIGN.md` | Markdown | EXPORTED — VERIFIED | Byte-identical (diff 0 + sha256) | 35142 B. SUPERSEDED HiFi — retained. |
| `claude/design/HOMEPAGE_HIFI_v2.md` | `claude/design/HOMEPAGE_HIFI_v2.md` | Markdown | EXPORTED — VERIFIED | Byte-identical (diff 0 + sha256) | 25310 B. Reference (validation) HiFi. |
| `claude/design/MOTION_NOTES.md` | `claude/design/MOTION_NOTES.md` | Markdown | EXPORTED — VERIFIED | Byte-identical (diff 0 + sha256) | 8558 B. ORPHAN — ungoverned. References Corpus-B HTML (not exported). |
| `claude/proposal/DOCUMENTATION_ARCHITECTURE.md` | `claude/proposal/DOCUMENTATION_ARCHITECTURE.md` | Markdown | EXPORTED — VERIFIED | Byte-identical (diff 0 + sha256) | 38460 B. Proposal (planning). |
| `claude/proposal/PROJECT_MANIFEST.md` | `claude/proposal/PROJECT_MANIFEST.md` | Markdown | EXPORTED — VERIFIED | Byte-identical (diff 0 + sha256) | 15551 B. Proposal (proposed entry point). |
| `claude/proposal/MIGRATION_PLAN.md` | `claude/proposal/MIGRATION_PLAN.md` | Markdown | EXPORTED — VERIFIED | Byte-identical (diff 0 + sha256) | 20016 B. Proposal (not executed). |
| `claude/proposal/REPOSITORY_STRUCTURE.md` | `claude/proposal/REPOSITORY_STRUCTURE.md` | Markdown | EXPORTED — VERIFIED | Byte-identical (diff 0 + sha256) | 20001 B. Proposal (rev 2). |
| `claude/proposal/DOCUMENTATION_READINESS_REVIEW.md` | `claude/proposal/DOCUMENTATION_READINESS_REVIEW.md` | Markdown | EXPORTED — VERIFIED | Byte-identical (diff 0 + sha256) | 29618 B. Independent review (challenges roadmap). |
| `claude/proposal/WRITING_QUALITY_REVIEW.md` | `claude/proposal/WRITING_QUALITY_REVIEW.md` | Markdown | EXPORTED — VERIFIED | Byte-identical (diff 0 + sha256) | 14138 B. Independent review. |

---

## Summary

- **41 corpus items total.**
- **39 Markdown documents:** EXPORTED — VERIFIED (byte-identical, all diff exit 0 + sha256 match).
- **2 PDF source files:** BINARY SOURCE — REQUIRES EXTERNAL COPY (not exported; owner will supply binaries).
- **0 failures.**
- Version families kept distinguishable: `VISUAL_DIRECTION.md` (v1) vs `VISUAL_DIRECTION_v2.0.md`; `HOMEPAGE_HIFI_DESIGN.md` vs `HOMEPAGE_HIFI_v2.md`; `01_` vs `02_` PDF drafts — all exported/marked under their distinct original filenames.
