/**
 * CMS validation rules — pure, so the Studio and the build share one implementation.
 *
 * OWNER: Workstream B. `TECHNICAL_ARCHITECTURE.md` §7.2, §7.7, §11.2, §19.4; IA §2.2 (F4),
 * Step 6 (F5).
 *
 * These rules live here rather than inside `studio/` for the reason §7.7 gives about reserved
 * slugs — "one source, read by both the router and the validator". The same argument applies to
 * every rule below: the Studio blocks a bad value at authoring time and the build refuses it at
 * read time, and if those two were separate implementations they would eventually disagree.
 * `studio/schemaTypes/**` calls these functions; it does not restate them.
 *
 * **No product rule is invented here.** Every rule cites the upstream document that requires it.
 * Where the architecture specifies a *non-blocking* signal (F5), the issue is emitted at
 * `warning` and never at `error` — a Service with zero demonstrating entries is explicitly a
 * valid published state.
 */

import { isReservedSlug, RESERVED_SLUGS, type Locale } from '../i18n/routes.js';
import {
  PILLAR_BASE_REQUIREMENTS,
  PROJECT_FIELDS,
  SERVICE_FIELD_REQUIREMENTS,
  resolveRequirements,
  type ProjectField,
} from './requirements.js';
import {
  PROJECT_LABELS,
  SECTORS,
  SERVICE_KEYS,
  HIGHLIGHT_SLOTS,
  PILLARS,
  PROMINENCES,
  STATUSES,
  type Pillar,
  type ServiceKey,
} from './types.js';

export type ValidationLevel = 'error' | 'warning';

export interface ValidationIssue {
  readonly level: ValidationLevel;
  /** Dotted field path, for the Studio to attach the message to the right input. */
  readonly path: string;
  readonly message: string;
}

const error = (path: string, message: string): ValidationIssue => ({ level: 'error', path, message });
const warning = (path: string, message: string): ValidationIssue => ({ level: 'warning', path, message });

/* ────────────────────────────────────────────────────────────────────────────
 * Slugs — IA §2.2, §7.7
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * IA §2.2: "Lowercase, hyphenated, localized slugs." ASCII-only is consistent with OD-8 (§11.3),
 * which authors RO copy without diacritics — but it holds regardless, because a URL segment
 * carrying `ș`/`ț` would be percent-encoded in every shared link.
 */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateSlugFormat(slug: string, path: string): ValidationIssue[] {
  if (slug.trim() === '') return [error(path, 'Slug is required.')];
  if (!SLUG_PATTERN.test(slug)) {
    return [
      error(
        path,
        'Slug must be lowercase, and words separated by single hyphens (a-z, 0-9). No spaces, accents or trailing hyphens. (INFORMATION_ARCHITECTURE.md §2.2)',
      ),
    ];
  }
  return [];
}

/**
 * §7.7 / IA §2.2 (F4): curated-view slugs are reserved **per locale** and no Work Entry may
 * claim them in either locale. The list is generated from the frozen locale route map, so
 * adding a curated route reserves its slug automatically — it is never hand-listed here.
 *
 * Scope note: the reservation protects the shared `/proiecte/` namespace. Services live in
 * `/servicii/` and that namespace holds no curated routes, so Service slugs are format-checked
 * only. If a curated Service route is ever added, it enters the route map and this function
 * gains a Service caller — no rule here changes.
 */
export function validateWorkEntrySlug(slug: string, locale: Locale, path: string): ValidationIssue[] {
  const format = validateSlugFormat(slug, path);
  if (format.length > 0) return format;

  if (isReservedSlug(slug, locale)) {
    return [
      error(
        path,
        `'${slug}' is a reserved curated-view route in ${locale.toUpperCase()} (${RESERVED_SLUGS[locale].join(', ')}). A Work Entry may not claim it. (INFORMATION_ARCHITECTURE.md §2.2 F4)`,
      ),
    ];
  }
  return [];
}

/* ────────────────────────────────────────────────────────────────────────────
 * Controlled vocabularies — §7.2
 * ──────────────────────────────────────────────────────────────────────────── */

export const VOCABULARIES = {
  label: PROJECT_LABELS,
  sector: SECTORS,
  serviceKey: SERVICE_KEYS,
  status: STATUSES,
  pillar: PILLARS,
  prominence: PROMINENCES,
  highlightSlot: HIGHLIGHT_SLOTS,
} as const satisfies Readonly<Record<string, readonly string[]>>;

export type VocabularyName = keyof typeof VOCABULARIES;

/**
 * Sanity's `options.list` is an editor affordance, not a constraint — a value set by import or
 * by the API is not rejected by it. Vocabulary membership is therefore validated explicitly.
 */
export function validateVocabulary(
  value: string | undefined | null,
  vocabulary: VocabularyName,
  path: string,
): ValidationIssue[] {
  const allowed = VOCABULARIES[vocabulary] as readonly string[];
  if (!value) return [error(path, `${vocabulary} is required.`)];
  if (!allowed.includes(value)) {
    return [error(path, `'${value}' is not a permitted ${vocabulary}. Allowed: ${allowed.join(', ')}. (TECHNICAL_ARCHITECTURE.md §7.2)`)];
  }
  return [];
}

/*
 * STAGE 5 — `validateAssignment()` is deleted.
 *
 * It policed "a value may not repeat as its own secondary" for the two primary+secondary axes,
 * Discipline and Entry Type. Both are retired (Stages 4 and 5) and nothing in v3.1 has that
 * shape: Pillar is a single authored value, and Labels are a plain set whose duplicates the
 * Studio's `Rule.unique()` and `normalizeLabels()` already handle. No successor rule exists.
 */

/* ────────────────────────────────────────────────────────────────────────────
 * Crediting — no rule, by design (v3.1 §13)
 *
 * STAGE 2 deleted `validateEmployerScope()`; STAGE 3 deletes `validateAuthorship()`.
 *
 * `validateAuthorship()` required a scoped credit sentence whenever over-claiming was possible
 * — Visualization Commission entries, and Studio or Collaboration attribution. Every input it
 * read is retired: Entry Type no longer exists (Stage 4), and
 * Attribution no longer exists. It is **deleted, not re-keyed onto a Service**: v3.1 §12
 * retires the authorship concept itself, so a Service-triggered successor would reintroduce by
 * the back door exactly what the client decided to remove (`DECISIONS_LOG.md` #91).
 *
 * Nothing validates crediting now. `metadata.collaborators` and `metadata.team` are optional
 * plain lists with no cross-field rule, and honest credit for work whose design belongs to
 * someone else is carried by authored Description prose. That trade-off is recorded upstream,
 * not decided here.
 * ──────────────────────────────────────────────────────────────────────────── */

/* ────────────────────────────────────────────────────────────────────────────
 * Services and the field contract — CONTENT_MODEL.md v3.1 §2, §5, §7, §8
 *
 * All three rules below are built on `requirements.ts` and **restate nothing**. That module is
 * the single authority for which field a Pillar and a set of Services require; these functions
 * only turn its answer into issues. The Studio and the build both call them, so an editor is
 * blocked by exactly what the build refuses.
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * v3.1 §2: a project references **one or more** Services, and it is that selection which
 * activates its conditional fields. Zero Services is therefore not an incomplete project but an
 * unclassifiable one — nothing decides whether it needs a Location, an Area or an Equipment
 * list. Never defaulted: no Service is added on the project's behalf.
 */
export function validateServicesPresent(serviceCount: number, path = 'services'): ValidationIssue[] {
  if (serviceCount > 0) return [];
  return [
    error(
      path,
      'A project must demonstrate at least one Service — the Services it lists are what decide which other fields it has to carry. (CONTENT_MODEL.md v3.1 §2)',
    ),
  ];
}

/** A referenced Service, reduced to what the consistency rule needs. */
export interface ReferencedService {
  readonly key: ServiceKey;
  readonly pillar: Pillar;
  /** For the message only — the editor recognises the Service by name, not by key. */
  readonly name?: string;
}

/**
 * v3.1 §2: "PROJECT has one or more SERVICE (all within its own Pillar)."
 *
 * The Studio's reference filter narrows the picker to the project's Pillar, but a filter is an
 * authoring affordance, not a constraint — the same argument this file already makes about
 * `options.list`. It does not retroactively clear a reference either, so an editor who switches
 * a project's Pillar keeps whatever they had selected. That is deliberate: **the offending
 * Services are named and the document is blocked, never silently emptied.** Losing an editor's
 * selection to make a form validate is a worse failure than refusing to publish.
 */
export function validateServicePillarConsistency(
  projectPillar: string | undefined | null,
  services: readonly ReferencedService[],
  path = 'services',
): ValidationIssue[] {
  if (!projectPillar) return [];

  const foreign = services.filter((service) => service.pillar !== projectPillar);
  if (foreign.length === 0) return [];

  const named = foreign.map((service) => service.name ?? service.key).join(', ');
  return [
    error(
      path,
      `${foreign.length === 1 ? 'This Service belongs' : 'These Services belong'} to the other capability: ${named}. ` +
        'Either change the project\'s capability back, or remove them — they are kept until you decide. (CONTENT_MODEL.md v3.1 §2)',
    ),
  ];
}

/** Whether each canonical project field actually carries a value. */
export type FieldPresence = Readonly<Partial<Record<ProjectField, boolean>>>;

/**
 * The whole v3.1 field contract, in one rule (§4–§8).
 *
 * Resolve the requirement of every canonical field from the Pillar's base plus the selected
 * Services, then report **every** mandatory field that has no value — not the first. An editor
 * fixing one missing field at a time, publish attempt after publish attempt, is the experience
 * this avoids; `ValidationIssue[]` was always a list for exactly this reason.
 *
 * Optional and not-applicable fields are never reported. The merge is the resolver's
 * `MANDATORY > OPTIONAL > NOT APPLICABLE`, so two Services disagreeing about a field resolve
 * the same way here as they do in the Studio's own visibility.
 */
export function validateFieldRequirements(
  pillar: Pillar,
  serviceKeys: readonly ServiceKey[],
  presence: FieldPresence,
): ValidationIssue[] {
  const resolved = resolveRequirements(pillar, serviceKeys);

  return PROJECT_FIELDS.filter(
    (field) => resolved[field] === 'mandatory' && presence[field] !== true,
  ).map((field) =>
    error(
      field,
      `'${field}' is required for this project: ${describeRequirement(field, pillar, serviceKeys)}. (CONTENT_MODEL.md v3.1 §4–§8)`,
    ),
  );
}

/** Why a field is mandatory — the Pillar's base, a selected Service, or both. */
function describeRequirement(
  field: ProjectField,
  pillar: Pillar,
  serviceKeys: readonly ServiceKey[],
): string {
  if (PILLAR_BASE_REQUIREMENTS[pillar][field] === 'mandatory') {
    return `every ${pillar} project carries it`;
  }
  const responsible = serviceKeys.filter(
    (key) => SERVICE_FIELD_REQUIREMENTS[key][field] === 'mandatory',
  );
  return responsible.length > 0
    ? `required by ${responsible.join(', ')}`
    : 'required by the selected Services';
}

/* ────────────────────────────────────────────────────────────────────────────
 * EN availability — §7.1, §11.2
 * ──────────────────────────────────────────────────────────────────────────── */

export interface EnAvailabilityInput {
  readonly enPublished: boolean;
  readonly titleEn: boolean;
  readonly slugEn: boolean;
  /** Body copy — its absence is a quality warning, not a publication blocker. */
  readonly bodyEn: boolean;
}

/**
 * §7.1: `enPublished` is the EN page-generation gate; §11.2: no EN page is generated for an
 * untranslated entity and RO is never served under an EN URL. The gate is only honest if the
 * fields the EN route needs actually exist — otherwise the build would emit `/en/undefined`.
 *
 * The reverse (EN fields present, gate off) is **not** an error: translating ahead of
 * publication is normal editorial work. It is surfaced as information so the editor knows the
 * page is not live.
 */
export function validateEnAvailability(input: EnAvailabilityInput, path = 'enPublished'): ValidationIssue[] {
  if (!input.enPublished) {
    if (input.titleEn && input.slugEn) {
      return [
        warning(
          path,
          'English content exists but "Published in English" is off, so no EN page is generated. (TECHNICAL_ARCHITECTURE.md §11.2)',
        ),
      ];
    }
    return [];
  }

  const issues: ValidationIssue[] = [];
  if (!input.titleEn) issues.push(error('title.en', 'An English title is required to publish in English.'));
  if (!input.slugEn) issues.push(error('slug.en', 'An English slug is required to publish in English — EN routes use localized slugs. (§11.1)'));
  if (!input.bodyEn) {
    issues.push(
      warning(
        path,
        'Published in English with no English body copy. The EN page will generate, but with Romanian-free but empty content.',
      ),
    );
  }
  return issues;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Reality Capture — §19.4, §10.2, §10.4
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * §19.4: "Raw E57/LAS/LAZ source surveys never enter the CMS or the frontend pipeline."
 * Mirrors the `.gitignore` block, which states the reasoning: raw captures carry
 * georeferencing, provenance and client identifiers, and heritage/institutional clients may
 * hold contractual restrictions.
 */
export const RAW_CAPTURE_EXTENSIONS = [
  'e57', 'las', 'laz', 'ptx', 'pts', 'rcp', 'rcs', 'fls', 'fws', 'zfs', 'zfprj',
] as const;

export function validateNotRawCaptureSource(filename: string | undefined | null, path: string): ValidationIssue[] {
  if (!filename) return [];
  const extension = filename.split('.').pop()?.toLowerCase() ?? '';
  if ((RAW_CAPTURE_EXTENSIONS as readonly string[]).includes(extension)) {
    return [
      error(
        path,
        `'.${extension}' is a raw survey format and must never enter the CMS. Upload only a bounded web derivative, stripped of georeferencing, provenance and client identifiers. (TECHNICAL_ARCHITECTURE.md §19.4)`,
      ),
    ];
  }
  return [];
}

export interface CaptureGateInput {
  readonly hasDerivative: boolean;
  readonly hasPoster: boolean;
  readonly cleared: boolean;
  readonly pointCount: number | null;
}

/**
 * §19.4's publication gate, plus §10.2's fallback requirement and §10.4's honesty requirement.
 *
 * The point-count warning matters more than it looks: §10.4 records that the HiFis print a
 * fabricated "≈ 8,032,000 puncte" from a decorative multiplier, and calls a decorative figure
 * surviving into production a false accuracy claim against `CONTENT_MODEL.md`:101. The field is
 * therefore never computed — if it is empty, nothing is rendered.
 */
export function validateCaptureGate(input: CaptureGateInput): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (input.hasDerivative && !input.cleared) {
    issues.push(
      error(
        'capturePublicationCleared',
        'A point-cloud derivative is attached but publication is not cleared. A point cloud is measurable — publishing one is materially different from publishing a photograph. Confirm publication rights before clearing. (TECHNICAL_ARCHITECTURE.md §19.4)',
      ),
    );
  }

  if (input.hasDerivative && !input.hasPoster) {
    issues.push(
      error(
        'capture.derivative.poster',
        'A point-cloud derivative requires a static poster image: the viewer must degrade to it under reduced motion and where WebGL is unavailable. (§10.2, §14.0)',
      ),
    );
  }

  if (input.hasDerivative && input.pointCount === null) {
    issues.push(
      warning(
        'capture.pointCount',
        'No point count declared. The figure shown to visitors is read from this field and is never computed from the asset — leaving it empty renders nothing rather than an estimate. (§10.4)',
      ),
    );
  }

  return issues;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Service — IA Step 6 (F5)
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * F5, verbatim: a Service page is "fully publishable with **zero** linked Work Entries", and
 * "the CMS surfaces the zero-linked state to editors as a **non-blocking** warning/info state."
 * This must never harden into an error.
 */
export function validateServiceDemonstration(count: number, path = 'demonstratedBy'): ValidationIssue[] {
  if (count === 0) {
    return [
      warning(
        path,
        'No Work Entry currently demonstrates this service, so the page will show the editorial empty state and a Contact CTA instead of a proof section. This is a valid published state. (INFORMATION_ARCHITECTURE.md Step 6, F5)',
      ),
    ];
  }
  return [];
}

/* ────────────────────────────────────────────────────────────────────────────
 * Aggregation
 * ──────────────────────────────────────────────────────────────────────────── */

export function errorsOf(issues: readonly ValidationIssue[]): readonly ValidationIssue[] {
  return issues.filter((issue) => issue.level === 'error');
}

export function warningsOf(issues: readonly ValidationIssue[]): readonly ValidationIssue[] {
  return issues.filter((issue) => issue.level === 'warning');
}

/** Collapse a rule's issues into the single string Sanity's `Rule.custom` expects, or `true`. */
export function toSanityResult(issues: readonly ValidationIssue[]): true | string {
  const blocking = errorsOf(issues);
  if (blocking.length === 0) return true;
  return blocking.map((issue) => issue.message).join(' ');
}

/**
 * The non-blocking counterpart, for a rule declared with `.warning()`. Kept separate so a rule
 * can never accidentally promote a warning to an error: F5 and the EN-body signal are specified
 * as non-blocking, and the Studio must honour that.
 */
export function toSanityWarning(issues: readonly ValidationIssue[]): true | string {
  const advisory = warningsOf(issues);
  if (advisory.length === 0) return true;
  return advisory.map((issue) => issue.message).join(' ');
}
