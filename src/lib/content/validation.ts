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
  ATTRIBUTIONS,
  COMMISSIONING_CONTEXTS,
  DISCIPLINES,
  ENTRY_TYPES,
  HIGHLIGHT_SLOTS,
  PILLARS,
  PROMINENCES,
  STATUSES,
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
  entryType: ENTRY_TYPES,
  status: STATUSES,
  attribution: ATTRIBUTIONS,
  discipline: DISCIPLINES,
  commissioning: COMMISSIONING_CONTEXTS,
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

/**
 * `CONTENT_MODEL.md`:44–47: primary + optional secondary. A value repeated as its own secondary
 * is meaningless and would double-count the entry in Pillar derivation.
 */
export function validateAssignment(
  primary: string | undefined | null,
  secondary: readonly string[] | undefined | null,
  vocabulary: VocabularyName,
  path: string,
): ValidationIssue[] {
  const issues = [...validateVocabulary(primary, vocabulary, `${path}.primary`)];
  const seen = new Set<string>();

  for (const value of secondary ?? []) {
    issues.push(...validateVocabulary(value, vocabulary, `${path}.secondary`));
    if (value === primary) {
      issues.push(error(`${path}.secondary`, `'${value}' is already the primary ${vocabulary}.`));
    }
    if (seen.has(value)) {
      issues.push(error(`${path}.secondary`, `'${value}' is listed twice.`));
    }
    seen.add(value);
  }

  return issues;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Honest attribution — CONTENT_MODEL.md:50, :60
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * Employer applies **only** when Attribution = Studio (`CONTENT_MODEL.md`:50), and Professional
 * Experience is defined as exactly that set (IA §5.1). Both directions are errors: a Studio
 * entry without an Employer cannot be grouped in the curated view, and an Employer on an
 * independent entry misattributes the work.
 */
export function validateEmployerScope(
  attribution: string | undefined | null,
  hasEmployer: boolean,
  path = 'employer',
): ValidationIssue[] {
  if (attribution === 'studio' && !hasEmployer) {
    return [
      error(
        path,
        'A Studio-attributed entry must name its Employer — Professional Experience groups by it. (INFORMATION_ARCHITECTURE.md §5.1)',
      ),
    ];
  }
  if (attribution !== 'studio' && hasEmployer) {
    return [
      error(
        path,
        `Employer applies only when Attribution = Studio (this entry is '${attribution}'). (CONTENT_MODEL.md:50)`,
      ),
    ];
  }
  return [];
}

/**
 * `CONTENT_MODEL.md`:60 and `PROJECT_CONTEXT.md`:30 make a correct Visualization Commission
 * credit a product requirement: the images are the architect's, the building design is not.
 * Attribution alone cannot say that — only the scoped Authorship statement can.
 */
export function validateAuthorship(
  entryTypePrimary: string | undefined | null,
  attribution: string | undefined | null,
  hasAuthorshipRo: boolean,
  path = 'authorship',
): ValidationIssue[] {
  const mustBeExplicit =
    entryTypePrimary === 'visualization-commission' ||
    attribution === 'studio' ||
    attribution === 'collaboration';

  if (mustBeExplicit && !hasAuthorshipRo) {
    return [
      error(
        path,
        'A scoped Authorship statement is required for Visualization Commission, Studio and Collaboration entries — it is what prevents over-claiming. (CONTENT_MODEL.md:52, :60)',
      ),
    ];
  }
  if (!hasAuthorshipRo) {
    return [warning(path, 'No Authorship statement. Consider stating the scope of your contribution.')];
  }
  return [];
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
