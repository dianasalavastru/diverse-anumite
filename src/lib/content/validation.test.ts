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
  validateCaptureGate,
  validateEnAvailability,
  validateNotRawCaptureSource,
  validateFieldRequirements,
  validateServiceDemonstration,
  validateServicePillarConsistency,
  validateServicesPresent,
  validateSlugFormat,
  validateVocabulary,
  validateWorkEntrySlug,
  warningsOf,
  VOCABULARIES,
} from './validation.js';
import type { FieldPresence, ReferencedService } from './validation.js';
import { PILLARS, PROJECT_LABELS, SERVICE_KEYS, STATUSES } from './types.js';

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
    expect(VOCABULARIES.label).toEqual(PROJECT_LABELS);
    expect(VOCABULARIES.status).toEqual(STATUSES);
    expect(VOCABULARIES.pillar).toEqual(PILLARS);
  });

  it('rejects the prohibited collapsed taxonomy', () => {
    // §7.2's prohibition: `WORK_ARCHIVE_IMPLEMENTATION_NOTES.md`:88 mixes three axes —
    // "built project" is a Status value; "professional experience" named a retired axis.
    for (const forbidden of ['built project', 'professional experience', 'documentation service']) {
      expect(errorsOf(validateVocabulary(forbidden, 'label', 'labels'))).toHaveLength(1);
    }
  });

  it('rejects an empty value', () => {
    expect(errorsOf(validateVocabulary(undefined, 'status', 'metadata.status'))).toHaveLength(1);
  });

  /*
   * STAGE 5: the two `validateAssignment` cases are gone with the rule. It policed the
   * primary+secondary shape of Discipline and Entry Type; both axes are retired and nothing in
   * v3.1 has that shape. The replacement coverage is the Pillar block below.
   */
});

describe('Pillar — authored, mandatory, exactly one (v3.1 §2, Stage 5)', () => {
  it('accepts both canonical values and nothing else', () => {
    for (const pillar of PILLARS) {
      expect(validateVocabulary(pillar, 'pillar', 'pillar')).toEqual([]);
    }
    for (const invalid of ['architecture', 'interior-design', 'visualization', 'Architecture & Design', '']) {
      expect(errorsOf(validateVocabulary(invalid, 'pillar', 'pillar')), invalid).not.toHaveLength(0);
    }
  });

  it('rejects a missing pillar rather than defaulting one', () => {
    expect(errorsOf(validateVocabulary(undefined, 'pillar', 'pillar'))).toHaveLength(1);
    expect(errorsOf(validateVocabulary(null, 'pillar', 'pillar'))).toHaveLength(1);
  });

  it('carries exactly the two canonical pillars', () => {
    expect([...PILLARS]).toEqual(['architecture-design', 'reality-capture']);
  });

  it('knows no Discipline vocabulary — the axis is retired, not renamed', () => {
    expect(Object.keys(VOCABULARIES)).not.toContain('discipline');
    expect(Object.keys(VOCABULARIES)).toContain('pillar');
  });
});

describe('Project Labels — the closed vocabulary that replaced Entry Type (v3.1 §10)', () => {
  it('accepts each canonical value and nothing else', () => {
    for (const label of PROJECT_LABELS) {
      expect(validateVocabulary(label, 'label', 'labels')).toEqual([]);
    }
    for (const invented of ['built project', 'design-project', 'competition-entry', 'CONCURS', '']) {
      expect(errorsOf(validateVocabulary(invented, 'label', 'labels')), invented).not.toHaveLength(0);
    }
  });

  it('carries exactly the two client-validated labels', () => {
    expect([...PROJECT_LABELS]).toEqual(['competition', 'diploma-project']);
  });

  it('knows no Entry Type vocabulary — the axis is retired, not renamed', () => {
    expect(Object.keys(VOCABULARIES)).not.toContain('entryType');
    expect(Object.keys(VOCABULARIES)).toContain('label');
  });
});

describe('Crediting carries no validation rule (v3.1 §13)', () => {
  /**
   * STAGE 2 removed `validateEmployerScope`; STAGE 3 removes `validateAuthorship`.
   *
   * The old cases asserted that a scoped Authorship statement was *required* wherever
   * over-claiming was possible. `CONTENT_MODEL.md` v3.1 §12 retires the Authorship concept
   * itself, so there is no rule left to assert and no successor to write — the honest
   * replacement is the absence contract below, which also proves the rule was **not re-keyed
   * onto a Service** (`DECISIONS_LOG.md` #91).
   *
   * The consequence is recorded, not hidden: a visualization project no longer has an enforced
   * credit sentence. That is the client's decision, and the substitute is authored Description
   * prose.
   */
  it('exports no Employer and no Authorship rule — retired, not replaced', async () => {
    const validation = await import('./validation.js');
    const exported = Object.keys(validation);

    expect(exported).not.toContain('validateEmployerScope');
    expect(exported).not.toContain('validateAuthorship');
    expect(exported.filter((name) => /employer|authorship|attribution|commissioning/i.test(name))).toEqual(
      [],
    );
  });

  it('knows no Attribution or Commissioning vocabulary', () => {
    expect(Object.keys(VOCABULARIES)).not.toContain('attribution');
    expect(Object.keys(VOCABULARIES)).not.toContain('commissioning');
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

/* ────────────────────────────────────────────────────────────────────────────
 * STAGE 8 — Services drive the field contract (v3.1 §2, §4–§8)
 * ──────────────────────────────────────────────────────────────────────────── */

/** The three A&D and two RC Services these cases lean on, as the rule receives them. */
const AD_ARCH: ReferencedService = {
  key: 'proiectare-arhitectura',
  pillar: 'architecture-design',
  name: 'Proiectare de arhitectura',
};
const AD_FURNITURE: ReferencedService = {
  key: 'design-mobilier',
  pillar: 'architecture-design',
  name: 'Design mobilier',
};
const AD_VIZ: ReferencedService = {
  key: 'vizualizare-3d',
  pillar: 'architecture-design',
  name: 'Vizualizare 3D',
};
const RC_SCAN: ReferencedService = {
  key: 'scanare-laser-3d',
  pillar: 'reality-capture',
  name: 'Scanare laser 3D',
};

const keysOf = (services: readonly ReferencedService[]) => services.map((service) => service.key);

/** Everything present, so a case only has to say what it *removes*. */
function allPresent(overrides: FieldPresence = {}): FieldPresence {
  return {
    title: true,
    services: true,
    sector: true,
    year: true,
    status: true,
    cover: true,
    gallery: true,
    description: true,
    location: true,
    client: true,
    area: true,
    collaborators: true,
    team: true,
    awards: true,
    equipment: true,
    implementationCompany: true,
    ...overrides,
  };
}

describe('Services are mandatory, and at least one (v3.1 §2, Stage 8)', () => {
  it('blocks a project that demonstrates no Service at all', () => {
    const issues = validateServicesPresent(0);
    expect(errorsOf(issues)).toHaveLength(1);
    expect(toSanityResult(issues)).toContain('at least one Service');
  });

  it('accepts one Service', () => {
    expect(validateServicesPresent(1)).toEqual([]);
  });

  it('accepts several Services — the model is 1..N, not exactly one', () => {
    expect(validateServicesPresent(4)).toEqual([]);
  });

  it('is the entry\'s own rule, not the Service page\'s F5 rule', () => {
    /* Two rules, two directions, opposite levels — a Service with no entries is publishable
       (F5, warning), a project with no Services is not (§2, error). Asserting them together
       is what stops one being "simplified" into the other. */
    expect(errorsOf(validateServicesPresent(0))).toHaveLength(1);
    expect(errorsOf(validateServiceDemonstration(0))).toHaveLength(0);
  });
});

describe('Every Service sits inside the project\'s Pillar (v3.1 §2, Stage 8)', () => {
  it('accepts Services from the project\'s own Pillar', () => {
    expect(
      validateServicePillarConsistency('architecture-design', [AD_ARCH, AD_FURNITURE]),
    ).toEqual([]);
    expect(validateServicePillarConsistency('reality-capture', [RC_SCAN])).toEqual([]);
  });

  it('blocks a Service borrowed from the other Pillar', () => {
    const issues = validateServicePillarConsistency('architecture-design', [AD_ARCH, RC_SCAN]);
    expect(errorsOf(issues)).toHaveLength(1);
    expect(toSanityResult(issues)).toContain('Scanare laser 3D');
    // Only the offending one is named — the compliant Service must not be implicated.
    expect(toSanityResult(issues)).not.toContain('Proiectare de arhitectura');
  });

  it('names every offending Service, so the editor fixes the set in one pass', () => {
    const issues = validateServicePillarConsistency('reality-capture', [AD_ARCH, AD_FURNITURE]);
    const message = String(toSanityResult(issues));
    expect(message).toContain('Proiectare de arhitectura');
    expect(message).toContain('Design mobilier');
  });

  it('blocks a Pillar switch that leaves incompatible references — and keeps them', () => {
    /*
     * The migration case the model has to survive: an editor flips an existing A&D project to
     * Reality Capture. Its Services are still the A&D ones.
     *
     * The rule blocks. It does NOT clear the references and it does not rewrite them — the
     * input array is handed back untouched, and the editor decides whether the Pillar or the
     * Services were the mistake. A rule that silently emptied the field would destroy authored
     * work to make a form validate.
     */
    const selected: readonly ReferencedService[] = [AD_ARCH, AD_VIZ];
    const before = keysOf(selected);

    expect(validateServicePillarConsistency('architecture-design', selected)).toEqual([]);
    const afterSwitch = validateServicePillarConsistency('reality-capture', selected);

    expect(errorsOf(afterSwitch)).toHaveLength(1);
    expect(keysOf(selected)).toEqual(before);
    expect(selected).toHaveLength(2);
  });

  it('stays silent while the Pillar itself is still empty', () => {
    /* An unset Pillar is the `pillar` field's own rule to report. Restating it here would
       give the editor two errors for one omission. */
    expect(validateServicePillarConsistency(null, [AD_ARCH])).toEqual([]);
    expect(validateServicePillarConsistency(undefined, [RC_SCAN])).toEqual([]);
  });
});

describe('Only `key` activates fields — never title or slug (v3.1 §14.3, Stage 8)', () => {
  const presence = allPresent({ implementationCompany: false });

  it('is unchanged when the Service is renamed', () => {
    const renamed: ReferencedService = { ...AD_FURNITURE, name: 'Mobilier pe comanda' };
    expect(
      validateFieldRequirements('architecture-design', keysOf([renamed]), presence),
    ).toEqual(validateFieldRequirements('architecture-design', keysOf([AD_FURNITURE]), presence));
    expect(errorsOf(validateFieldRequirements('architecture-design', keysOf([renamed]), presence))).toHaveLength(1);
  });

  it('is unchanged when the Service slug changes', () => {
    /* Slug is a routing concern. The requirement table is keyed by `key` and never reads a
       slug, so this is asserted the only way it can be: the rule's input has no slug in it at
       all. If activation ever started depending on one, this signature would have to change. */
    expect(Object.keys(AD_FURNITURE)).toEqual(['key', 'pillar', 'name']);
  });

  it('changes only when the key changes', () => {
    const asFurniture = validateFieldRequirements('architecture-design', ['design-mobilier'], presence);
    const asArchitecture = validateFieldRequirements('architecture-design', ['proiectare-arhitectura'], presence);
    expect(errorsOf(asFurniture)).toHaveLength(1);
    expect(errorsOf(asArchitecture)).toHaveLength(0);
  });

  it('accepts every key in the vocabulary, on its own Pillar', () => {
    for (const key of SERVICE_KEYS) {
      const pillar = key === 'proiectare-arhitectura' || key === 'design-interior'
        || key === 'vizualizare-3d' || key === 'design-mobilier'
        ? 'architecture-design'
        : 'reality-capture';
      expect(validateFieldRequirements(pillar, [key], allPresent()), key).toEqual([]);
    }
  });
});

describe('The field contract, through the validation layer (v3.1 §8 worked examples)', () => {
  it('Example A — Design interior + Design mobilier', () => {
    const keys = ['design-interior', 'design-mobilier'] as const;
    expect(validateFieldRequirements('architecture-design', keys, allPresent())).toEqual([]);

    // [M] Locație, Suprafață (Design interior) and Firmă implementare (Design mobilier).
    for (const field of ['location', 'area', 'implementationCompany'] as const) {
      const issues = validateFieldRequirements('architecture-design', keys, allPresent({ [field]: false }));
      expect(errorsOf(issues), field).toHaveLength(1);
      expect(String(toSanityResult(issues))).toContain(field);
    }
    // [O] Premii — optional is never reported.
    expect(validateFieldRequirements('architecture-design', keys, allPresent({ awards: false }))).toEqual([]);
    // Design mobilier is the Service the message must name for Firmă implementare.
    expect(
      String(toSanityResult(validateFieldRequirements('architecture-design', keys, allPresent({ implementationCompany: false })))),
    ).toContain('design-mobilier');
  });

  it('Example B — Scanare laser 3D + Scan-to-BIM', () => {
    const keys = ['scanare-laser-3d', 'scan-to-bim'] as const;
    expect(validateFieldRequirements('reality-capture', keys, allPresent())).toEqual([]);

    for (const field of ['equipment', 'location', 'area'] as const) {
      expect(errorsOf(validateFieldRequirements('reality-capture', keys, allPresent({ [field]: false }))), field).toHaveLength(1);
    }
    // [O] Colaboratori, Echipă.
    expect(
      validateFieldRequirements('reality-capture', keys, allPresent({ collaborators: false, team: false })),
    ).toEqual([]);
  });

  it('reports EVERY missing mandatory field at once, not the first', () => {
    const issues = validateFieldRequirements(
      'architecture-design',
      keysOf([AD_ARCH, AD_FURNITURE]),
      allPresent({ location: false, implementationCompany: false, description: false }),
    );
    const paths = errorsOf(issues).map((issue) => issue.path);
    expect(paths).toContain('location');
    expect(paths).toContain('implementationCompany');
    expect(paths).toContain('description');
  });

  it('Example C — the merge rule doing real work: MANDATORY wins', () => {
    /* Vizualizare 3D alone leaves Locație optional; adding Proiectare de arhitectură makes it
       mandatory. The union must not be order-dependent. */
    const lax = validateFieldRequirements('architecture-design', ['vizualizare-3d'], allPresent({ location: false }));
    expect(lax).toEqual([]);

    for (const keys of [['vizualizare-3d', 'proiectare-arhitectura'], ['proiectare-arhitectura', 'vizualizare-3d']] as const) {
      expect(errorsOf(validateFieldRequirements('architecture-design', keys, allPresent({ location: false }))), keys.join('+')).toHaveLength(1);
    }
  });
});

describe('Description is Pillar-asymmetric (v3.1 §4 vs §6, Stage 8)', () => {
  it('blocks an Architecture & Design project with no Description', () => {
    const issues = validateFieldRequirements('architecture-design', ['proiectare-arhitectura'], allPresent({ description: false }));
    expect(errorsOf(issues)).toHaveLength(1);
    expect(String(toSanityResult(issues))).toContain('every architecture-design project carries it');
  });

  it('accepts a Reality Capture project with no Description', () => {
    /* §6 makes Description optional for Reality Capture: a survey is evidenced by its capture
       data, not by narrative. This asymmetry is the one thing about Description that has to be
       stated in a test, because it is the one thing a reader would assume wrong. */
    expect(validateFieldRequirements('reality-capture', ['scanare-laser-3d'], allPresent({ description: false }))).toEqual([]);
  });
});

describe('Equipment is a project field, not a capture field (v3.1 §6, Stage 8)', () => {
  it('is satisfied by the project\'s own Equipment, with no capture block involved', () => {
    /* The presence map has no capture key at all — Equipment is resolved and reported purely
       from the project's own field. A project that carries Equipment but no point cloud is
       valid, which is the whole point of the move. */
    expect(validateFieldRequirements('reality-capture', ['scanare-laser-3d'], allPresent())).toEqual([]);
    expect(Object.keys(allPresent())).not.toContain('capture');
  });

  it('blocks a Reality Capture project with no Equipment', () => {
    const issues = validateFieldRequirements('reality-capture', ['scanare-laser-3d'], allPresent({ equipment: false }));
    expect(errorsOf(issues)).toHaveLength(1);
    expect(String(toSanityResult(issues))).toContain('equipment');
  });

  it('never asks an Architecture & Design project for Equipment', () => {
    expect(validateFieldRequirements('architecture-design', ['proiectare-arhitectura'], allPresent({ equipment: false }))).toEqual([]);
  });
});

describe('Implementation Company across its three states (v3.1 §5, Stage 8)', () => {
  it('MANDATORY under Design mobilier', () => {
    expect(
      errorsOf(validateFieldRequirements('architecture-design', ['design-mobilier'], allPresent({ implementationCompany: false }))),
    ).toHaveLength(1);
  });

  it('OPTIONAL under Design interior — absent is fine, present is fine', () => {
    expect(validateFieldRequirements('architecture-design', ['design-interior'], allPresent({ implementationCompany: false }))).toEqual([]);
    expect(validateFieldRequirements('architecture-design', ['design-interior'], allPresent())).toEqual([]);
  });

  it('NOT APPLICABLE on Reality Capture — never requested, never reported', () => {
    expect(validateFieldRequirements('reality-capture', ['scanare-laser-3d'], allPresent({ implementationCompany: false }))).toEqual([]);
  });
});

describe('Sanity result mapping', () => {
  it('passes when only warnings are present', () => {
    /* Re-keyed at Stage 3: `validateAuthorship` was the warning-only example. The Service
       zero-demonstration rule (F5) is the other rule specified as non-blocking, so it carries
       the case now — the property under test, "warnings do not block", is unchanged. */
    const warningOnly = validateServiceDemonstration(0);
    expect(errorsOf(warningOnly)).toHaveLength(0);
    expect(warningsOf(warningOnly)).toHaveLength(1);
    expect(toSanityResult(warningOnly)).toBe(true);
  });

  it('returns the blocking messages when errors are present', () => {
    const result = toSanityResult(validateWorkEntrySlug('concursuri', 'ro', 'slug.ro'));
    expect(typeof result).toBe('string');
    expect(result).toContain('reserved');
  });
});
