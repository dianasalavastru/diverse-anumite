/**
 * The Service → activated-field contract, and the rule that merges it.
 *
 * OWNER: Workstream B. Source: `docs/product/CONTENT_MODEL.md` **v3.1 (LOCKED)** §4–§9.
 * Introduced by Stage 1 of `docs/implementation/V31_MIGRATION_PLAN.md`.
 *
 * ── WHAT THIS MODULE IS ────────────────────────────────────────────────────────────────────
 *
 * v3.1 states the whole project model as one sentence (§1):
 *
 *     PROJECT = PILLAR BASE FIELDS
 *             + FIELDS ACTIVATED BY THE SELECTED SERVICES
 *             + OPTIONAL PROJECT LABELS
 *
 * The two tables below are the first two lines of that sentence, transcribed. Labels are absent
 * on purpose: §10 is explicit that "Labels never change which fields a project requires".
 *
 * ── WHY IT IS ITS OWN FILE, AND WHY IT IS PURE ─────────────────────────────────────────────
 *
 * It is **data plus one fold**, and it has two consumers that must never disagree: the Studio,
 * which decides whether an editor is even shown a field, and the build, which refuses a
 * document that is missing one. That is the same argument §7.7 makes about reserved slugs —
 * "one source, read by both the router and the validator" — so the same shape is used here.
 *
 * It is deliberately NOT part of `validation.ts`. Validation emits issues; this module answers a
 * question. The Studio needs the answer for field *visibility* long before any issue exists, and
 * `validation.ts` imports enough of the vocabulary surface that folding this into it would make
 * the Studio pull the whole validator to lay out a form.
 *
 * Constraints, load-bearing: **no `sanity` import, no Astro import, no I/O, no environment
 * access.** The Studio imports `src/lib/content/**` (`studio/schemaTypes/fields.ts` already
 * does); the reverse never happens. Nothing here may break that direction.
 *
 * ── STATUS AT STAGE 1 ──────────────────────────────────────────────────────────────────────
 *
 * **Nothing in production consumes this module yet.** Stage 8 wires it into the Studio schema
 * and into `normalize.ts`. It is written and proven first so the merge rule is settled before
 * anything depends on it.
 */

import { SERVICE_KEYS, SERVICE_KEY_TO_PILLAR, type Pillar, type ServiceKey } from './types.js';

/* ────────────────────────────────────────────────────────────────────────────
 * The requirement lattice — CONTENT_MODEL.md v3.1 §3, §8
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * The three requirement states, **in ascending order of strength**.
 *
 * The order of this array *is* the merge rule (§8):
 *
 *     MANDATORY > OPTIONAL > NOT APPLICABLE
 *
 * Encoding the rule as position rather than as a comparison function means the rule cannot be
 * implemented inconsistently in two places — `mergeRequirement` is a `max` over indices and has
 * no branch to get wrong.
 *
 * `not-applicable` is a real, named state rather than an absence. §3 distinguishes "this field
 * is not relevant to any selected Service" from "this field does not exist", and the Studio
 * renders those differently: the first is a hidden field, the second is a schema error.
 */
export const REQUIREMENT_ORDER = ['not-applicable', 'optional', 'mandatory'] as const;

export type Requirement = (typeof REQUIREMENT_ORDER)[number];

/** Position in `REQUIREMENT_ORDER`. Higher wins. */
export function requirementRank(requirement: Requirement): number {
  return REQUIREMENT_ORDER.indexOf(requirement);
}

/**
 * §8's resolution rule: *the strongest requirement among the selected Services wins.*
 *
 * A commutative, associative, idempotent max with `not-applicable` as its identity — i.e. a
 * join over a three-element chain. Those four properties are what make the fold in
 * `resolveRequirements` independent of the order the editor happened to pick Services in, and
 * they are asserted directly in `requirements.test.ts`.
 */
export function mergeRequirement(a: Requirement, b: Requirement): Requirement {
  return requirementRank(a) >= requirementRank(b) ? a : b;
}

/** The fold identity — the requirement of a field no Pillar and no Service asks for. */
export const NO_REQUIREMENT: Requirement = 'not-applicable';

/* ────────────────────────────────────────────────────────────────────────────
 * Canonical project fields — v3.1 §3
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * **One canonical identity per project concept.** §3 is explicit: a field referenced by two
 * Services is still one field on the project, and selecting both does not create two. There is
 * therefore exactly one vocabulary of project fields, used by *both* tables below — no
 * per-Service field variants, and no parallel "conditional field" union that could drift from
 * this one.
 *
 * These are the concepts the requirement model reasons about, not the full document shape:
 * curation, SEO, media hotspots, capture specifications, related work and the localized slug
 * pair carry no Pillar- or Service-driven requirement and are governed elsewhere.
 */
export const PROJECT_FIELDS = [
  'services',
  'sector',
  'title',
  'year',
  'status',
  'client',
  'description',
  'cover',
  'gallery',
  'location',
  'area',
  'awards',
  'equipment',
  'collaborators',
  'team',
  'implementationCompany',
] as const;

export type ProjectField = (typeof PROJECT_FIELDS)[number];

/**
 * The subset a Service may activate — the fields that appear in §5 and §7.
 *
 * A **subset of `PROJECT_FIELDS`, not a second union.** Declaring it as its own type would be
 * the duplicate vocabulary this module exists to avoid; declaring it as a list keeps one
 * identity per concept while still letting the invariant "no Service raises a base-only field
 * such as `title`" be asserted in the tests rather than merely assumed.
 */
export const SERVICE_ACTIVATABLE_FIELDS: readonly ProjectField[] = [
  'location',
  'area',
  'awards',
  'equipment',
  'collaborators',
  'team',
  'implementationCompany',
];

/** Every field at `not-applicable` — the starting point of a fold, and the shape of a result. */
function emptyRequirements(): Record<ProjectField, Requirement> {
  return Object.fromEntries(
    PROJECT_FIELDS.map((field) => [field, NO_REQUIREMENT]),
  ) as Record<ProjectField, Requirement>;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Pillar base requirements — v3.1 §4 (Architecture & Design) and §6 (Reality Capture)
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * What a project must carry **whatever Services are selected**.
 *
 * Written out in full — every field, both Pillars — rather than as a partial with defaults.
 * `Record<Pillar, Record<ProjectField, Requirement>>` makes an unlisted field a compile error,
 * and this table encodes two client-validated decisions that a default would quietly hide:
 *
 *   - **Description is `mandatory` for Architecture & Design and `optional` for Reality
 *     Capture** (§6). Deliberate, not an oversight: a survey is evidenced by its imagery and its
 *     measured facts, and requiring prose on every scan would produce filler.
 *   - **Location is a base field of neither Pillar** (§4, §6). It is `not-applicable` here and
 *     is raised only by the selected Services (§5, §7).
 *
 * Collaborators and Team are optional base fields under Architecture & Design (§4) but are
 * **not** base fields under Reality Capture (§6) — there they are raised, still optionally, by
 * Scan-to-BIM and Vizualizare de arhitectură (§7).
 */
export const PILLAR_BASE_REQUIREMENTS: Readonly<
  Record<Pillar, Readonly<Record<ProjectField, Requirement>>>
> = {
  'architecture-design': {
    services: 'mandatory',
    sector: 'mandatory',
    title: 'mandatory',
    year: 'mandatory',
    status: 'mandatory',
    client: 'mandatory',
    description: 'mandatory',
    cover: 'mandatory',
    gallery: 'mandatory',
    collaborators: 'optional',
    team: 'optional',
    location: 'not-applicable',
    area: 'not-applicable',
    awards: 'not-applicable',
    equipment: 'not-applicable',
    implementationCompany: 'not-applicable',
  },
  'reality-capture': {
    services: 'mandatory',
    sector: 'mandatory',
    title: 'mandatory',
    year: 'mandatory',
    status: 'mandatory',
    client: 'mandatory',
    // §6, client-validated: NOT mandatory for Reality Capture.
    description: 'optional',
    cover: 'mandatory',
    gallery: 'mandatory',
    collaborators: 'not-applicable',
    team: 'not-applicable',
    location: 'not-applicable',
    area: 'not-applicable',
    awards: 'not-applicable',
    equipment: 'not-applicable',
    implementationCompany: 'not-applicable',
  },
};

/* ────────────────────────────────────────────────────────────────────────────
 * Service-activated fields — v3.1 §5 (A&D) and §7 (Reality Capture)
 * ──────────────────────────────────────────────────────────────────────────── */

/** What one Service adds. Absent field = that Service does not activate it (`—` in §9's matrix). */
export type ServiceFieldActivation = Readonly<Partial<Record<ProjectField, Requirement>>>;

/**
 * The §5 and §7 tables, transcribed.
 *
 * **Keyed by `ServiceKey` and by nothing else.** A Service's title and its two localized slugs
 * are editor-owned and changeable from the Studio at any time; keying a requirement to either
 * would let a rename silently change what a project is required to carry. `ServiceKey` exists
 * precisely so that cannot happen (v3.1 §14.3), and `requirements.test.ts` asserts the property
 * by resolving requirements from keys alone.
 *
 * `Record<ServiceKey, …>` — not `Partial` — so adding a ninth Service without stating its field
 * contract fails compilation rather than silently activating nothing.
 */
export const SERVICE_FIELD_REQUIREMENTS: Readonly<Record<ServiceKey, ServiceFieldActivation>> = {
  /* ── Arhitectura & Design — v3.1 §5 ─────────────────────────────────────── */
  'proiectare-arhitectura': {
    location: 'mandatory',
    area: 'mandatory',
    awards: 'optional',
  },
  'design-interior': {
    location: 'mandatory',
    area: 'mandatory',
    awards: 'optional',
  },
  'vizualizare-3d': {
    location: 'optional',
  },
  'design-mobilier': {
    implementationCompany: 'mandatory',
  },

  /* ── Reality Capture — v3.1 §7 ──────────────────────────────────────────── */
  'scanare-laser-3d': {
    equipment: 'mandatory',
    location: 'mandatory',
    area: 'mandatory',
  },
  'scan-to-bim': {
    location: 'mandatory',
    area: 'mandatory',
    collaborators: 'optional',
    team: 'optional',
  },
  'fotografie-arhitectura': {
    equipment: 'mandatory',
    location: 'mandatory',
  },
  'vizualizare-arhitectura': {
    location: 'optional',
    collaborators: 'optional',
    team: 'optional',
  },
};

/* ────────────────────────────────────────────────────────────────────────────
 * Resolution — v3.1 §8
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * The requirement state of every canonical project field, for one Pillar and one selection of
 * Services.
 *
 * Start from the Pillar's base (§4, §6), then fold in each selected Service (§5, §7), resolving
 * every collision with `mergeRequirement` (§8). Because that merge is a commutative, associative
 * join, the result depends on the *set* of Services and never on the order they were selected
 * in — which is what makes it safe to call from a Studio form whose array order is the editor's.
 *
 * **Total and side-effect-free by design.** It emits no issues, throws on nothing, and does not
 * check that the given Services belong to the given Pillar: a mismatched selection resolves to
 * whatever the union of its tables says. Pillar↔Service consistency is a *validation* question
 * with its own rule and its own error message, and it lands with the rest of validation at
 * Stage 8. Keeping the two apart is what lets the Studio call this while a document is still
 * half-authored and invalid.
 *
 * Duplicate keys in `serviceKeys` are harmless — the merge is idempotent.
 */
export function resolveRequirements(
  pillar: Pillar,
  serviceKeys: readonly ServiceKey[],
): Readonly<Record<ProjectField, Requirement>> {
  const resolved = emptyRequirements();
  const base = PILLAR_BASE_REQUIREMENTS[pillar];

  for (const field of PROJECT_FIELDS) {
    resolved[field] = mergeRequirement(resolved[field], base[field]);
  }

  for (const key of serviceKeys) {
    const activation = SERVICE_FIELD_REQUIREMENTS[key];
    for (const field of PROJECT_FIELDS) {
      const added = activation[field];
      if (added) resolved[field] = mergeRequirement(resolved[field], added);
    }
  }

  return resolved;
}

/** The fields a project with this Pillar and these Services cannot be published without. */
export function mandatoryFields(
  pillar: Pillar,
  serviceKeys: readonly ServiceKey[],
): readonly ProjectField[] {
  const resolved = resolveRequirements(pillar, serviceKeys);
  return PROJECT_FIELDS.filter((field) => resolved[field] === 'mandatory');
}

/**
 * Whether a field is worth showing at all — `optional` or `mandatory`.
 *
 * The Studio's `hidden` callback is the intended caller (Stage 8): a field no selected Service
 * activates is not shown, rather than shown and left unvalidated.
 */
export function isApplicable(requirement: Requirement): boolean {
  return requirement !== 'not-applicable';
}

/**
 * Every Service key belonging to a Pillar — v3.1 §2's "Services … constrained to the selected
 * Pillar", as a static list.
 *
 * The Studio's reference picker will constrain by the authored `Service.pillar` field at Stage 8,
 * because that is the runtime authority; this is the static counterpart, and having both is what
 * lets a test prove the two agree.
 */
export function serviceKeysForPillar(pillar: Pillar): readonly ServiceKey[] {
  return SERVICE_KEYS.filter((key) => SERVICE_KEY_TO_PILLAR[key] === pillar);
}
