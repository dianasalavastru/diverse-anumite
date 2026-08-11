/**
 * CMS validation tests — the rules the Studio enforces at authoring time.
 *
 * OWNER: Workstream B. Each test cites the upstream document that requires the rule; none
 * invents product behaviour.
 */

import { describe, expect, it } from 'vitest';

import { RESERVED_SLUGS } from '../i18n/routes.js';
import {
  errorsOf,
  toSanityResult,
  validateAssignment,
  validateAuthorship,
  validateCaptureGate,
  validateEmployerScope,
  validateEnAvailability,
  validateNotRawCaptureSource,
  validateServiceDemonstration,
  validateSlugFormat,
  validateVocabulary,
  validateWorkEntrySlug,
  warningsOf,
  VOCABULARIES,
} from './validation.js';
import { ATTRIBUTIONS, DISCIPLINES, ENTRY_TYPES, PILLARS, STATUSES } from './types.js';

describe('Slug format (IA §2.2)', () => {
  it.each(['casa-in-panta', 'releveu-3d', 'a1'])('accepts %s', (slug) => {
    expect(validateSlugFormat(slug, 'slug.ro')).toEqual([]);
  });

  it.each(['Casa', 'casa in panta', 'casa--panta', '-casa', 'casa-', 'casa_panta', 'casă'])(
    'rejects %s',
    (slug) => {
      expect(validateSlugFormat(slug, 'slug.ro')).toHaveLength(1);
    },
  );

  it('requires a value', () => {
    expect(errorsOf(validateSlugFormat('  ', 'slug.ro'))).toHaveLength(1);
  });
});

describe('Reserved slugs, per locale (§7.7, IA §2.2 F4)', () => {
  it('reads the reserved list from the frozen locale route map, not a hand-list', () => {
    // §7.7: "one source, read by both the router and the validator".
    expect(RESERVED_SLUGS.ro).toEqual(['concursuri', 'experienta-profesionala']);
    expect(RESERVED_SLUGS.en).toEqual(['competitions', 'professional-experience']);
  });

  it('blocks a curated-route slug in its own locale', () => {
    expect(errorsOf(validateWorkEntrySlug('concursuri', 'ro', 'slug.ro'))).toHaveLength(1);
    expect(errorsOf(validateWorkEntrySlug('competitions', 'en', 'slug.en'))).toHaveLength(1);
  });

  it('scopes the reservation per locale — the RO slug is not reserved in EN', () => {
    // The two namespaces are independent: `/proiecte/concursuri` and `/en/projects/competitions`
    // are different routes, so a Work Entry may legitimately hold `concursuri` as an EN slug.
    expect(validateWorkEntrySlug('concursuri', 'en', 'slug.en')).toEqual([]);
    expect(validateWorkEntrySlug('competitions', 'ro', 'slug.ro')).toEqual([]);
  });

  it('allows an ordinary slug in both locales', () => {
    expect(validateWorkEntrySlug('casa-in-panta', 'ro', 'slug.ro')).toEqual([]);
    expect(validateWorkEntrySlug('house-on-a-slope', 'en', 'slug.en')).toEqual([]);
  });
});

describe('Controlled vocabularies (§7.2)', () => {
  it('carries exactly the frozen vocabularies from CONTENT_MODEL.md §3', () => {
    expect(VOCABULARIES.entryType).toEqual(ENTRY_TYPES);
    expect(VOCABULARIES.status).toEqual(STATUSES);
    expect(VOCABULARIES.attribution).toEqual(ATTRIBUTIONS);
    expect(VOCABULARIES.discipline).toEqual(DISCIPLINES);
    expect(VOCABULARIES.pillar).toEqual(PILLARS);
  });

  it('rejects the prohibited collapsed taxonomy', () => {
    // §7.2's prohibition: `WORK_ARCHIVE_IMPLEMENTATION_NOTES.md`:88 mixes three axes —
    // "built project" is a Status value, "professional experience" an Attribution value.
    for (const forbidden of ['built project', 'professional experience', 'documentation service']) {
      expect(errorsOf(validateVocabulary(forbidden, 'entryType', 'entryType.primary'))).toHaveLength(1);
    }
  });

  it('rejects an empty value', () => {
    expect(errorsOf(validateVocabulary(undefined, 'status', 'metadata.status'))).toHaveLength(1);
  });

  it('rejects a secondary that repeats or duplicates the primary', () => {
    expect(
      errorsOf(validateAssignment('architecture', ['architecture'], 'discipline', 'discipline')),
    ).toHaveLength(1);
    expect(
      errorsOf(
        validateAssignment('architecture', ['visualization', 'visualization'], 'discipline', 'discipline'),
      ),
    ).toHaveLength(1);
  });

  it('accepts a legitimate primary + secondary assignment', () => {
    expect(validateAssignment('reality-capture', ['architecture'], 'discipline', 'discipline')).toEqual([]);
  });
});

describe('Honest attribution (CONTENT_MODEL.md:50, :60)', () => {
  it('requires an Employer on a Studio-attributed entry (IA §5.1)', () => {
    expect(errorsOf(validateEmployerScope('studio', false))).toHaveLength(1);
    expect(validateEmployerScope('studio', true)).toEqual([]);
  });

  it('forbids an Employer on a non-Studio entry', () => {
    expect(errorsOf(validateEmployerScope('independent', true))).toHaveLength(1);
    expect(validateEmployerScope('independent', false)).toEqual([]);
  });

  it('requires scoped Authorship where over-claiming is possible', () => {
    // PROJECT_CONTEXT.md:30 makes a correct Visualization Commission credit a product
    // requirement: the images are the architect's, the building design is not.
    expect(errorsOf(validateAuthorship('visualization-commission', 'independent', false))).toHaveLength(1);
    expect(errorsOf(validateAuthorship('design-project', 'studio', false))).toHaveLength(1);
    expect(errorsOf(validateAuthorship('design-project', 'collaboration', false))).toHaveLength(1);
  });

  it('only warns for an independent design project', () => {
    const issues = validateAuthorship('design-project', 'independent', false);
    expect(errorsOf(issues)).toHaveLength(0);
    expect(warningsOf(issues)).toHaveLength(1);
  });
});

describe('EN availability consistency (§7.1, §11.2)', () => {
  const base = { enPublished: true, titleEn: true, slugEn: true, bodyEn: true };

  it('passes a fully translated entity', () => {
    expect(validateEnAvailability(base)).toEqual([]);
  });

  it('blocks EN publication without an EN title or slug', () => {
    expect(errorsOf(validateEnAvailability({ ...base, titleEn: false }))).toHaveLength(1);
    expect(errorsOf(validateEnAvailability({ ...base, slugEn: false }))).toHaveLength(1);
  });

  it('warns but does not block when EN body copy is missing', () => {
    const issues = validateEnAvailability({ ...base, bodyEn: false });
    expect(errorsOf(issues)).toHaveLength(0);
    expect(warningsOf(issues)).toHaveLength(1);
  });

  it('is silent on an untranslated entity — RO is never blocked by a missing EN counterpart', () => {
    // §11.2 rule 6.
    expect(
      validateEnAvailability({ enPublished: false, titleEn: false, slugEn: false, bodyEn: false }),
    ).toEqual([]);
  });

  it('informs when EN content exists but the gate is off', () => {
    const issues = validateEnAvailability({ ...base, enPublished: false });
    expect(errorsOf(issues)).toHaveLength(0);
    expect(warningsOf(issues)).toHaveLength(1);
  });
});

describe('Reality Capture gating (§19.4, §10.2, §10.4)', () => {
  it('rejects raw survey formats outright', () => {
    for (const name of ['survey.e57', 'scan.LAS', 'cloud.laz', 'project.rcp']) {
      expect(errorsOf(validateNotRawCaptureSource(name, 'capture.derivative')), name).toHaveLength(1);
    }
  });

  it('accepts a web derivative', () => {
    expect(validateNotRawCaptureSource('derivative.bin', 'capture.derivative')).toEqual([]);
    expect(validateNotRawCaptureSource('poster.jpg', 'capture.derivative.poster')).toEqual([]);
  });

  it('blocks an uncleared derivative', () => {
    const issues = validateCaptureGate({
      hasDerivative: true,
      hasPoster: true,
      cleared: false,
      pointCount: 1000,
    });
    expect(errorsOf(issues)).toHaveLength(1);
  });

  it('requires a poster fallback for a published derivative (§10.2, §14.0)', () => {
    const issues = validateCaptureGate({
      hasDerivative: true,
      hasPoster: false,
      cleared: true,
      pointCount: 1000,
    });
    expect(errorsOf(issues)).toHaveLength(1);
  });

  it('warns on an undeclared point count rather than computing one (§10.4)', () => {
    const issues = validateCaptureGate({
      hasDerivative: true,
      hasPoster: true,
      cleared: true,
      pointCount: null,
    });
    expect(errorsOf(issues)).toHaveLength(0);
    expect(warningsOf(issues)).toHaveLength(1);
  });

  it('is silent for an entry with no derivative', () => {
    expect(
      validateCaptureGate({ hasDerivative: false, hasPoster: false, cleared: false, pointCount: null }),
    ).toEqual([]);
  });
});

describe('Service empty state stays non-blocking (IA Step 6, F5)', () => {
  it('warns — never errors — on zero demonstrating entries', () => {
    const issues = validateServiceDemonstration(0);
    expect(errorsOf(issues)).toHaveLength(0);
    expect(warningsOf(issues)).toHaveLength(1);
    // F5: "Service pages are fully publishable with zero linked Work Entries."
    expect(toSanityResult(issues)).toBe(true);
  });

  it('is silent once an entry demonstrates the service', () => {
    expect(validateServiceDemonstration(2)).toEqual([]);
  });
});

describe('Sanity result mapping', () => {
  it('passes when only warnings are present', () => {
    expect(toSanityResult(validateAuthorship('design-project', 'independent', false))).toBe(true);
  });

  it('returns the blocking messages when errors are present', () => {
    const result = toSanityResult(validateWorkEntrySlug('concursuri', 'ro', 'slug.ro'));
    expect(typeof result).toBe('string');
    expect(result).toContain('reserved');
  });
});
