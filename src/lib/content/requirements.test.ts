/**
 * The v3.1 field-requirement contract, proven against `CONTENT_MODEL.md` v3.1 (LOCKED).
 *
 * OWNER: Workstream B. Migration Stage 1.
 *
 * This suite is the reason Stage 1 exists as its own stage: the merge rule is settled and
 * provable here, in isolation, before the Studio schema or the build validator depends on it.
 *
 * The cases below assert **behaviour against the normative document**, not against the
 * implementation's own shape. Every expectation cites the section of v3.1 it transcribes, so a
 * failure names the clause that was violated rather than the line that changed. There are no
 * snapshots: a snapshot of a requirement table proves only that it did not change, which is the
 * one thing that is never in question during a migration.
 */

import { describe, expect, it } from 'vitest';

import {
  ILLUSTRATIVE_EXTRA_FIELDS,
  ILLUSTRATIVE_FIELD_RULES,
  PILLAR_BASE_REQUIREMENTS,
  PROJECT_FIELDS,
  WORK_FIELDS,
  illustrativeForbiddenFields,
  REQUIREMENT_ORDER,
  SERVICE_ACTIVATABLE_FIELDS,
  SERVICE_FIELD_REQUIREMENTS,
  isApplicable,
  mandatoryFields,
  mergeRequirement,
  requirementRank,
  resolveRequirements,
  serviceKeysForPillar,
  type ProjectField,
  type Requirement,
} from './requirements.js';
import {
  PILLARS,
  PROJECT_LABELS,
  SECTORS,
  SERVICE_KEYS,
  SERVICE_KEY_TO_PILLAR,
  STATUSES,
  type ServiceKey,
} from './types.js';

const AD = 'architecture-design';
const RC = 'reality-capture';

/** Only the entries that differ from `not-applicable`, so an expectation reads like §9's matrix. */
function active(resolved: Readonly<Record<ProjectField, Requirement>>): Record<string, Requirement> {
  return Object.fromEntries(
    PROJECT_FIELDS.filter((field) => resolved[field] !== 'not-applicable').map((field) => [
      field,
      resolved[field],
    ]),
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Vocabularies — v3.1 §2, §10, §11
 * ──────────────────────────────────────────────────────────────────────────── */

describe('v3.1 vocabularies (CONTENT_MODEL.md §2, §10, §11)', () => {
  it('declares exactly the six canonical Service keys (v3.2 §2)', () => {
    expect([...SERVICE_KEYS]).toEqual([
      'proiectare-arhitectura',
      'design-interior',
      'vizualizare-3d',
      'design-mobilier',
      'scanare-laser-3d',
      'scan-to-bim',
    ]);
    expect(SERVICE_KEYS).toHaveLength(6);
    expect(new Set(SERVICE_KEYS).size).toBe(6);
  });

  it('has fully retired the two v3.1 Reality Capture Services (v3.2 §2, #102)', () => {
    /* No legacy value, no alias, no reserved key. `normalize.ts` resolves an authored key
       through `oneOf(raw.key, SERVICE_KEYS, …)`, so absence here is what makes a retired key
       unauthorable rather than merely discouraged — the build fails on one by name. */
    const keys = SERVICE_KEYS as readonly string[];
    expect(keys).not.toContain('fotografie-arhitectura');
    expect(keys).not.toContain('vizualizare-arhitectura');
  });

  it('assigns each Service key to exactly one Pillar, four and two (v3.2 §2)', () => {
    expect(serviceKeysForPillar(AD)).toEqual([
      'proiectare-arhitectura',
      'design-interior',
      'vizualizare-3d',
      'design-mobilier',
    ]);
    expect(serviceKeysForPillar(RC)).toEqual(['scanare-laser-3d', 'scan-to-bim']);
    /* Together they must partition the vocabulary — no key in both, none in neither. */
    expect([...serviceKeysForPillar(AD), ...serviceKeysForPillar(RC)].sort()).toEqual(
      [...SERVICE_KEYS].sort(),
    );
  });

  it('keeps the two Pillars deliberately ASYMMETRICAL in Service count (v3.2 §2)', () => {
    /*
     * 4 + 2 is the product model, not an unfinished 4 + 4.
     *
     * This case exists to be read, not only to pass. Reality Capture sells two Services; the
     * previous four included one offering that belonged to Architecture & Design and one that
     * was never a distinct Service at all. Nothing in this system may assume equal counts per
     * Pillar, and no replacement Service is to be invented to restore visual balance — every
     * consumer derives its set from `SERVICE_KEY_TO_PILLAR` or from live `Service.pillar`.
     */
    expect(serviceKeysForPillar(AD)).toHaveLength(4);
    expect(serviceKeysForPillar(RC)).toHaveLength(2);
    expect(serviceKeysForPillar(AD).length).not.toBe(serviceKeysForPillar(RC).length);
  });

  it('keeps the Service list closed — no drone, photogrammetry or photography Service (§2, #92, #102)', () => {
    /* Capabilities are not Services. Drone photogrammetry never was one (#92); photography
       stopped being one at v3.2 (#102). Both remain available as capability, workflow and
       project medium — this guard is about the taxonomy, not about the content. */
    expect(
      SERVICE_KEYS.some((key) =>
        /drona|drone|fotogrametri|photogrammetr|fotografi|photograph/i.test(key),
      ),
    ).toBe(false);
  });

  it('keeps exactly one visualization Service, under Architecture & Design (§2, #102 supersedes #93)', () => {
    /*
     * #93 kept `vizualizare-3d` and `vizualizare-arhitectura` as two intentionally distinct
     * Services. Client input superseded it: the practice's visualization offering is the A&D
     * one, and Reality Capture had no distinct Service behind the second name.
     *
     * The A&D key is unchanged — not renamed, not merged, and carrying no legacy alias. The
     * retired key is simply absent, which is why `vizualizare-3d` must still be asserted here.
     */
    expect(SERVICE_KEY_TO_PILLAR['vizualizare-3d']).toBe(AD);
    expect(Object.keys(SERVICE_KEY_TO_PILLAR)).not.toContain('vizualizare-arhitectura');
    expect(serviceKeysForPillar(RC)).not.toContain('vizualizare-3d');
  });

  it('declares the two Project Labels, neither of which is a type (§10)', () => {
    expect([...PROJECT_LABELS]).toEqual(['competition', 'diploma-project']);
  });

  it('declares the seven v3.1 Sectors, in the documented order (§11.1)', () => {
    /* STAGE 6 renamed `SECTORS_V31` into place as the canonical `SECTORS`. */
    expect([...SECTORS]).toEqual([
      'rezidential',
      'comercial-ospitalitate',
      'birouri-business',
      'public-comunitar',
      'industrial-logistic',
      'cultural-patrimoniu',
      'mixed-use-dezvoltari',
    ]);
  });

  it('declares the four v3.1 Statuses and no capture-workflow status (§11.2, DECISIONS_LOG #94)', () => {
    /* STAGE 7 promoted `STATUSES_V31` into place as the canonical `STATUSES`. */
    expect([...STATUSES]).toEqual([
      'in-dezvoltare',
      'in-desfasurare',
      'finalizat',
      'nerealizat',
    ]);
    for (const invented of ['scanat', 'procesare', 'livrat']) {
      expect(STATUSES as readonly string[]).not.toContain(invented);
    }
  });

  /**
   * The machine ↔ authored-label relationship, asserted rather than left to a comment. Display
   * strings themselves are Workstream C's and live in `i18n/vocabulary.ts`; what this pins is
   * that each machine value is the diacritic-free ASCII slug of its authored label, which is the
   * convention OD-8 and `SLUG_PATTERN` between them establish.
   */
  it('uses lowercase hyphenated ASCII for every new machine value (OD-8, SLUG_PATTERN)', () => {
    const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    for (const value of [...SERVICE_KEYS, ...PROJECT_LABELS, ...SECTORS, ...STATUSES]) {
      expect(value, value).toMatch(slug);
    }
  });
});

/* ────────────────────────────────────────────────────────────────────────────
 * Exhaustiveness — v3.1 §5, §7
 * ──────────────────────────────────────────────────────────────────────────── */

describe('table exhaustiveness', () => {
  it('gives every Service key a field contract, and adds no key of its own', () => {
    expect(Object.keys(SERVICE_FIELD_REQUIREMENTS).sort()).toEqual([...SERVICE_KEYS].sort());
  });

  it('covers both Pillars, and every canonical field in each', () => {
    expect(Object.keys(PILLAR_BASE_REQUIREMENTS).sort()).toEqual([...PILLARS].sort());
    for (const pillar of PILLARS) {
      expect(Object.keys(PILLAR_BASE_REQUIREMENTS[pillar]).sort()).toEqual([...PROJECT_FIELDS].sort());
    }
  });

  it('names only canonical project fields in the Service tables — one identity per concept (§3)', () => {
    for (const key of SERVICE_KEYS) {
      for (const field of Object.keys(SERVICE_FIELD_REQUIREMENTS[key])) {
        expect(PROJECT_FIELDS as readonly string[], `${key} → ${field}`).toContain(field);
      }
    }
  });

  it('never lets a Service raise a base-only field such as title or year', () => {
    for (const key of SERVICE_KEYS) {
      for (const field of Object.keys(SERVICE_FIELD_REQUIREMENTS[key]) as ProjectField[]) {
        expect(SERVICE_ACTIVATABLE_FIELDS, `${key} → ${field}`).toContain(field);
      }
    }
  });

  it('activates no field at not-applicable — an absent entry is how "—" is written (§9)', () => {
    for (const key of SERVICE_KEYS) {
      for (const requirement of Object.values(SERVICE_FIELD_REQUIREMENTS[key])) {
        expect(requirement).not.toBe('not-applicable');
      }
    }
  });

  it('never activates Sector or Labels — neither drives field requirements (§10, §11.1)', () => {
    for (const key of SERVICE_KEYS) {
      expect(SERVICE_FIELD_REQUIREMENTS[key].sector).toBeUndefined();
    }
    expect(PROJECT_FIELDS as readonly string[]).not.toContain('labels');
  });
});

/* ────────────────────────────────────────────────────────────────────────────
 * Pillar base requirements — v3.1 §4, §6
 * ──────────────────────────────────────────────────────────────────────────── */

describe('Pillar base requirements (§4 Architecture & Design, §6 Reality Capture)', () => {
  it('Architecture & Design requires the nine base fields and offers two (§4)', () => {
    expect(active(PILLAR_BASE_REQUIREMENTS[AD])).toEqual({
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
    });
  });

  it('Reality Capture requires eight base fields and leaves Description optional (§6)', () => {
    expect(active(PILLAR_BASE_REQUIREMENTS[RC])).toEqual({
      services: 'mandatory',
      sector: 'mandatory',
      title: 'mandatory',
      year: 'mandatory',
      status: 'mandatory',
      client: 'mandatory',
      description: 'optional',
      cover: 'mandatory',
      gallery: 'mandatory',
    });
  });

  /** The single most misreadable clause in v3.1, so it gets its own named case. */
  it('Description: mandatory for A&D, NOT mandatory for Reality Capture (§6, client-validated)', () => {
    expect(PILLAR_BASE_REQUIREMENTS[AD].description).toBe('mandatory');
    expect(PILLAR_BASE_REQUIREMENTS[RC].description).toBe('optional');
    expect(PILLAR_BASE_REQUIREMENTS[RC].description).not.toBe('mandatory');
  });

  it('Location is a base field of neither Pillar (§4, §6)', () => {
    expect(PILLAR_BASE_REQUIREMENTS[AD].location).toBe('not-applicable');
    expect(PILLAR_BASE_REQUIREMENTS[RC].location).toBe('not-applicable');
  });

  it('Collaborators and Team are A&D base fields but not Reality Capture ones (§4, §6, §7)', () => {
    expect(PILLAR_BASE_REQUIREMENTS[AD].collaborators).toBe('optional');
    expect(PILLAR_BASE_REQUIREMENTS[AD].team).toBe('optional');
    expect(PILLAR_BASE_REQUIREMENTS[RC].collaborators).toBe('not-applicable');
    expect(PILLAR_BASE_REQUIREMENTS[RC].team).toBe('not-applicable');
  });

  it('leaves every Service-activated field unrequired at base, in both Pillars', () => {
    for (const pillar of PILLARS) {
      for (const field of SERVICE_ACTIVATABLE_FIELDS) {
        if (pillar === AD && (field === 'collaborators' || field === 'team')) continue;
        expect(PILLAR_BASE_REQUIREMENTS[pillar][field], `${pillar}.${field}`).toBe('not-applicable');
      }
    }
  });
});

/* ────────────────────────────────────────────────────────────────────────────
 * Service tables — v3.1 §5, §7, cross-checked against §9's matrix
 * ──────────────────────────────────────────────────────────────────────────── */

describe('Service-activated fields (§5, §7)', () => {
  const EXPECTED: Readonly<Record<ServiceKey, Record<string, Requirement>>> = {
    'proiectare-arhitectura': { location: 'mandatory', area: 'mandatory', awards: 'optional' },
    'design-interior': { location: 'mandatory', area: 'mandatory', awards: 'optional' },
    'vizualizare-3d': { location: 'optional' },
    'design-mobilier': { implementationCompany: 'mandatory' },
    'scanare-laser-3d': { equipment: 'mandatory', location: 'mandatory', area: 'mandatory' },
    'scan-to-bim': {
      location: 'mandatory',
      area: 'mandatory',
      collaborators: 'optional',
      team: 'optional',
    },
  };

  for (const key of SERVICE_KEYS) {
    it(`${key} activates exactly what v3.1 says it does`, () => {
      expect(SERVICE_FIELD_REQUIREMENTS[key]).toEqual(EXPECTED[key]);
    });
  }

  it('only Scanare laser 3D requires Equipment (v3.2 §7)', () => {
    /* Was two Services while Fotografie de arhitectura existed. Retiring it leaves scanning as
       the only Service that mandates instruments — and, as a side effect, removes the one
       reachable combination of Equipment [M] with Area [—]. */
    const withEquipment = SERVICE_KEYS.filter(
      (key) => SERVICE_FIELD_REQUIREMENTS[key].equipment === 'mandatory',
    );
    expect(withEquipment).toEqual(['scanare-laser-3d']);
  });

  it('only Design mobilier requires an Implementation Company (§5)', () => {
    const withCompany = SERVICE_KEYS.filter(
      (key) => SERVICE_FIELD_REQUIREMENTS[key].implementationCompany !== undefined,
    );
    expect(withCompany).toEqual(['design-mobilier']);
  });

  it('Awards is only ever optional, and only under the two A&D design services (§5)', () => {
    const withAwards = SERVICE_KEYS.filter(
      (key) => SERVICE_FIELD_REQUIREMENTS[key].awards !== undefined,
    );
    expect(withAwards).toEqual(['proiectare-arhitectura', 'design-interior']);
    for (const key of withAwards) expect(SERVICE_FIELD_REQUIREMENTS[key].awards).toBe('optional');
  });
});

/* ────────────────────────────────────────────────────────────────────────────
 * Merge algebra — v3.1 §8
 * ──────────────────────────────────────────────────────────────────────────── */

describe('mergeRequirement — MANDATORY > OPTIONAL > NOT APPLICABLE (§8)', () => {
  const ALL = REQUIREMENT_ORDER;

  it('orders the three states ascending, so rank is the rule', () => {
    expect([...REQUIREMENT_ORDER]).toEqual(['not-applicable', 'optional', 'mandatory']);
    expect(requirementRank('mandatory')).toBeGreaterThan(requirementRank('optional'));
    expect(requirementRank('optional')).toBeGreaterThan(requirementRank('not-applicable'));
  });

  it('MANDATORY WINS over OPTIONAL, in both argument orders', () => {
    expect(mergeRequirement('optional', 'mandatory')).toBe('mandatory');
    expect(mergeRequirement('mandatory', 'optional')).toBe('mandatory');
  });

  it('OPTIONAL wins over NOT APPLICABLE, in both argument orders', () => {
    expect(mergeRequirement('not-applicable', 'optional')).toBe('optional');
    expect(mergeRequirement('optional', 'not-applicable')).toBe('optional');
  });

  it('is commutative', () => {
    for (const a of ALL) for (const b of ALL) expect(mergeRequirement(a, b)).toBe(mergeRequirement(b, a));
  });

  it('is associative', () => {
    for (const a of ALL)
      for (const b of ALL)
        for (const c of ALL) {
          expect(mergeRequirement(mergeRequirement(a, b), c)).toBe(
            mergeRequirement(a, mergeRequirement(b, c)),
          );
        }
  });

  it('is idempotent', () => {
    for (const a of ALL) expect(mergeRequirement(a, a)).toBe(a);
  });

  it('takes not-applicable as its identity', () => {
    for (const a of ALL) {
      expect(mergeRequirement(a, 'not-applicable')).toBe(a);
      expect(mergeRequirement('not-applicable', a)).toBe(a);
    }
  });

  it('never invents a fourth state', () => {
    for (const a of ALL) for (const b of ALL) expect(ALL).toContain(mergeRequirement(a, b));
  });
});

/* ────────────────────────────────────────────────────────────────────────────
 * Worked examples — v3.1 §8, transcribed in full
 * ──────────────────────────────────────────────────────────────────────────── */

describe('resolveRequirements — v3.1 §8 worked examples', () => {
  it('example A — Design interior + Design mobilier (Architecture & Design)', () => {
    expect(active(resolveRequirements(AD, ['design-interior', 'design-mobilier']))).toEqual({
      // A&D base
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
      // from Design interior
      location: 'mandatory',
      area: 'mandatory',
      awards: 'optional',
      // from Design mobilier
      implementationCompany: 'mandatory',
    });
  });

  it('example B — Scanare laser 3D + Scan-to-BIM (Reality Capture)', () => {
    expect(active(resolveRequirements(RC, ['scanare-laser-3d', 'scan-to-bim']))).toEqual({
      // Reality Capture base — note Description stays optional
      services: 'mandatory',
      sector: 'mandatory',
      title: 'mandatory',
      year: 'mandatory',
      status: 'mandatory',
      client: 'mandatory',
      description: 'optional',
      cover: 'mandatory',
      gallery: 'mandatory',
      // from Scanare laser 3D
      equipment: 'mandatory',
      // from both
      location: 'mandatory',
      area: 'mandatory',
      // from Scan-to-BIM
      collaborators: 'optional',
      team: 'optional',
    });
  });

  it('example C — Vizualizare 3D + Proiectare de arhitectura: MANDATORY WINS on Location', () => {
    const resolved = resolveRequirements(AD, ['vizualizare-3d', 'proiectare-arhitectura']);

    /* The collision itself, stated on its own — §8's whole point. */
    expect(SERVICE_FIELD_REQUIREMENTS['vizualizare-3d'].location).toBe('optional');
    expect(SERVICE_FIELD_REQUIREMENTS['proiectare-arhitectura'].location).toBe('mandatory');
    expect(resolved.location).toBe('mandatory');

    /* …and the complete result, not only the colliding field. */
    expect(active(resolved)).toEqual({
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
      location: 'mandatory',
      area: 'mandatory',
      awards: 'optional',
    });
  });

  it('resolves the same result whichever order the Services were selected in', () => {
    expect(resolveRequirements(AD, ['vizualizare-3d', 'proiectare-arhitectura'])).toEqual(
      resolveRequirements(AD, ['proiectare-arhitectura', 'vizualizare-3d']),
    );
    expect(resolveRequirements(RC, ['scan-to-bim', 'scanare-laser-3d'])).toEqual(
      resolveRequirements(RC, ['scanare-laser-3d', 'scan-to-bim']),
    );
  });

  it('is unaffected by a Service selected twice', () => {
    expect(resolveRequirements(RC, ['scanare-laser-3d', 'scanare-laser-3d'])).toEqual(
      resolveRequirements(RC, ['scanare-laser-3d']),
    );
  });
});

/* ────────────────────────────────────────────────────────────────────────────
 * Single-Service and edge resolutions
 * ──────────────────────────────────────────────────────────────────────────── */

describe('resolveRequirements — single Service and edges', () => {
  it('a Reality Capture project may be published without a Description (§6)', () => {
    expect(resolveRequirements(RC, ['scanare-laser-3d']).description).toBe('optional');
    expect(mandatoryFields(RC, ['scanare-laser-3d'])).not.toContain('description');
  });

  it('an Architecture & Design project may not (§4)', () => {
    expect(mandatoryFields(AD, ['vizualizare-3d'])).toContain('description');
  });

  it('Scanare laser 3D requires Equipment, Location and Area (v3.2 §7)', () => {
    /* Replaces the retired Fotografie de arhitectura case. Equipment [M] now always arrives
       together with Area [M], because scanning is the only Service that activates it. */
    const resolved = resolveRequirements(RC, ['scanare-laser-3d']);
    expect(resolved.equipment).toBe('mandatory');
    expect(resolved.location).toBe('mandatory');
    expect(resolved.area).toBe('mandatory');
  });

  it('Scan-to-BIM requires Location and Area, and offers Collaborators and Team (v3.2 §7)', () => {
    expect(active(resolveRequirements(RC, ['scan-to-bim']))).toEqual({
      services: 'mandatory',
      sector: 'mandatory',
      title: 'mandatory',
      year: 'mandatory',
      status: 'mandatory',
      client: 'mandatory',
      description: 'optional',
      cover: 'mandatory',
      gallery: 'mandatory',
      location: 'mandatory',
      area: 'mandatory',
      collaborators: 'optional',
      team: 'optional',
    });
  });

  it('with no Services selected, only the Pillar base applies', () => {
    expect(resolveRequirements(AD, [])).toEqual(PILLAR_BASE_REQUIREMENTS[AD]);
    expect(resolveRequirements(RC, [])).toEqual(PILLAR_BASE_REQUIREMENTS[RC]);
  });

  it('always returns every canonical field, never a partial record', () => {
    for (const pillar of PILLARS) {
      for (const key of SERVICE_KEYS) {
        expect(Object.keys(resolveRequirements(pillar, [key])).sort()).toEqual(
          [...PROJECT_FIELDS].sort(),
        );
      }
    }
  });

  it('never weakens a requirement by adding a Service', () => {
    for (const pillar of PILLARS) {
      const base = resolveRequirements(pillar, []);
      for (const key of SERVICE_KEYS) {
        const withService = resolveRequirements(pillar, [key]);
        for (const field of PROJECT_FIELDS) {
          expect(
            requirementRank(withService[field]),
            `${pillar} + ${key} → ${field}`,
          ).toBeGreaterThanOrEqual(requirementRank(base[field]));
        }
      }
    }
  });

  it('resolves every Pillar × Service pair to a real requirement state', () => {
    for (const pillar of PILLARS) {
      for (const key of SERVICE_KEYS) {
        for (const field of PROJECT_FIELDS) {
          expect(REQUIREMENT_ORDER).toContain(resolveRequirements(pillar, [key])[field]);
        }
      }
    }
  });
});

/* ────────────────────────────────────────────────────────────────────────────
 * Stable Service identity — v3.1 §14.3
 * ──────────────────────────────────────────────────────────────────────────── */

describe('field activation depends on ServiceKey alone (§14.3)', () => {
  /**
   * The property that makes the whole design safe: an editor may rename a Service and change
   * both its localized slugs from the Studio, and nothing about what a project must carry moves.
   *
   * Expressed as the strongest statement available without a CMS: the resolver's signature
   * accepts a key and a Pillar and has no other input, so a Service document carrying a
   * different title or slug but the same key resolves identically — by construction, and here
   * demonstrated on a document-shaped object whose title and slug are deliberately absurd.
   */
  it('is unchanged when a Service is renamed and re-slugged', () => {
    const before = {
      key: 'design-interior' as ServiceKey,
      name: { ro: 'Design interior', en: 'Interior design' },
      slug: { ro: 'design-interior', en: 'interior-design' },
    };
    const afterRename = {
      key: 'design-interior' as ServiceKey,
      name: { ro: 'Amenajari interioare premium', en: 'Premium interiors' },
      slug: { ro: 'amenajari-interioare-premium', en: 'premium-interiors' },
    };

    expect(afterRename.name.ro).not.toBe(before.name.ro);
    expect(afterRename.slug.ro).not.toBe(before.slug.ro);
    expect(resolveRequirements(AD, [afterRename.key])).toEqual(
      resolveRequirements(AD, [before.key]),
    );
  });

  it('keys the table by machine key, never by a localized or display string', () => {
    for (const key of Object.keys(SERVICE_FIELD_REQUIREMENTS)) {
      expect(SERVICE_KEYS as readonly string[], key).toContain(key);
      /* No entry may be a display name: none contains an uppercase letter, a space or a diacritic. */
      expect(key).not.toMatch(/[A-Z\sÀ-ɏ]/);
    }
  });

  /**
   * The vocabulary half of `DECISIONS_LOG.md` #103 (amending OD-8).
   *
   * #103 draws one line: Romanian **editorial copy** carries diacritics, Romanian **identifiers**
   * do not. Every value below is an identifier — it is matched in GROQ, compared in
   * `normalize.ts`'s `oneOf()`, round-tripped through the archive's `?service=` / `?label=`
   * query string, and stored in the Content Lake. A diacritic here is not a typo, it is a
   * silently broken filter link and a build that fails on documents authored before the change.
   *
   * The Service-key case above is the narrower, older assertion and is kept exactly as it was.
   * This widens the same rule to the three vocabularies the archive filters on, and to the
   * Pillar tokens. `Rezidențial` is the label; `rezidential` is the value — and #103 changes the
   * first while freezing the second, which is precisely why both need to be asserted somewhere.
   */
  it('keeps every closed-vocabulary value ASCII, lowercase and hyphenated (#103)', () => {
    const MACHINE_VALUE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

    const vocabularies: ReadonlyArray<readonly [string, readonly string[]]> = [
      ['SERVICE_KEYS', SERVICE_KEYS],
      ['PILLARS', PILLARS],
      ['SECTORS', SECTORS],
      ['STATUSES', STATUSES],
      ['PROJECT_LABELS', PROJECT_LABELS],
    ];

    for (const [name, values] of vocabularies) {
      for (const value of values) {
        expect(value, `${name}: "${value}" is not ASCII`).not.toMatch(/[^\u0000-\u007F]/);
        expect(value, `${name}: "${value}" is not a machine value`).toMatch(MACHINE_VALUE);
      }
    }
  });

  /** The Pillar map's keys are Service keys and its values are Pillar tokens — both identifiers. */
  it('keeps the Service-to-Pillar map ASCII on both sides (#103)', () => {
    for (const [key, pillar] of Object.entries(SERVICE_KEY_TO_PILLAR)) {
      expect(key).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(pillar).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });
});

/* ────────────────────────────────────────────────────────────────────────────
 * Helpers
 * ──────────────────────────────────────────────────────────────────────────── */

describe('helpers', () => {
  it('mandatoryFields lists exactly the mandatory entries, in canonical order', () => {
    const fields = mandatoryFields(AD, ['design-mobilier']);
    expect(fields).toEqual([
      'services',
      'sector',
      'title',
      'year',
      'status',
      'client',
      'description',
      'cover',
      'gallery',
      'implementationCompany',
    ]);
  });

  it('isApplicable is true for optional and mandatory, false for not-applicable', () => {
    expect(isApplicable('mandatory')).toBe(true);
    expect(isApplicable('optional')).toBe(true);
    expect(isApplicable('not-applicable')).toBe(false);
  });

  it('isApplicable is what a Studio "hidden" callback would ask (Stage 8)', () => {
    const resolved = resolveRequirements(AD, ['vizualizare-3d']);
    expect(isApplicable(resolved.location)).toBe(true);
    expect(isApplicable(resolved.implementationCompany)).toBe(false);
    expect(isApplicable(resolved.equipment)).toBe(false);
  });
});


/* ────────────────────────────────────────────────────────────────────────────
 * Illustrative Work — the real tables are untouched, the illustrative one is separate
 * ──────────────────────────────────────────────────────────────────────────── */

describe('the REAL requirement tables are byte-for-byte what they were before illustrative Work', () => {
  /*
   * Literal copies of the tables as they stood before the illustrative mode was added. They are
   * written out here — not derived from the module — so that any edit to the real contract made
   * while touching the illustrative one fails this suite.
   */
  it('REQUIREMENT_ORDER is still the three-state lattice — no `forbidden` state was added to it', () => {
    expect([...REQUIREMENT_ORDER]).toEqual(['not-applicable', 'optional', 'mandatory']);
  });

  it('PROJECT_FIELDS is unchanged', () => {
    expect([...PROJECT_FIELDS]).toEqual([
      'services', 'sector', 'title', 'year', 'status', 'client', 'description', 'cover', 'gallery',
      'location', 'area', 'awards', 'equipment', 'collaborators', 'team', 'implementationCompany',
    ]);
  });

  it('SERVICE_ACTIVATABLE_FIELDS is unchanged', () => {
    expect([...SERVICE_ACTIVATABLE_FIELDS]).toEqual([
      'location', 'area', 'awards', 'equipment', 'collaborators', 'team', 'implementationCompany',
    ]);
  });

  it('PILLAR_BASE_REQUIREMENTS is unchanged', () => {
    expect(PILLAR_BASE_REQUIREMENTS).toEqual({
      'architecture-design': {
        services: 'mandatory', sector: 'mandatory', title: 'mandatory', year: 'mandatory',
        status: 'mandatory', client: 'mandatory', description: 'mandatory', cover: 'mandatory',
        gallery: 'mandatory', collaborators: 'optional', team: 'optional',
        location: 'not-applicable', area: 'not-applicable', awards: 'not-applicable',
        equipment: 'not-applicable', implementationCompany: 'not-applicable',
      },
      'reality-capture': {
        services: 'mandatory', sector: 'mandatory', title: 'mandatory', year: 'mandatory',
        status: 'mandatory', client: 'mandatory', description: 'optional', cover: 'mandatory',
        gallery: 'mandatory', collaborators: 'not-applicable', team: 'not-applicable',
        location: 'not-applicable', area: 'not-applicable', awards: 'not-applicable',
        equipment: 'not-applicable', implementationCompany: 'not-applicable',
      },
    });
  });

  it('SERVICE_FIELD_REQUIREMENTS is unchanged', () => {
    expect(SERVICE_FIELD_REQUIREMENTS).toEqual({
      'proiectare-arhitectura': { location: 'mandatory', area: 'mandatory', awards: 'optional' },
      'design-interior': { location: 'mandatory', area: 'mandatory', awards: 'optional' },
      'vizualizare-3d': { location: 'optional' },
      'design-mobilier': { implementationCompany: 'mandatory' },
      'scanare-laser-3d': { equipment: 'mandatory', location: 'mandatory', area: 'mandatory' },
      'scan-to-bim': { location: 'mandatory', area: 'mandatory', collaborators: 'optional', team: 'optional' },
    });
  });

  it('mandatoryFields resolves exactly as before, for EVERY Pillar and EVERY subset of its Services', () => {
    /* An independent, literal statement of the pre-illustrative contract: the base mandatory
       set per Pillar, plus what each Service makes mandatory. Nothing below reads the module's
       own tables. */
    const BASE: Record<string, readonly ProjectField[]> = {
      'architecture-design': ['services', 'sector', 'title', 'year', 'status', 'client', 'description', 'cover', 'gallery'],
      'reality-capture': ['services', 'sector', 'title', 'year', 'status', 'client', 'cover', 'gallery'],
    };
    const ADDS: Record<ServiceKey, readonly ProjectField[]> = {
      'proiectare-arhitectura': ['location', 'area'],
      'design-interior': ['location', 'area'],
      'vizualizare-3d': [],
      'design-mobilier': ['implementationCompany'],
      'scanare-laser-3d': ['equipment', 'location', 'area'],
      'scan-to-bim': ['location', 'area'],
    };

    let cases = 0;
    for (const pillar of PILLARS) {
      const keys = serviceKeysForPillar(pillar);
      for (let mask = 0; mask < 1 << keys.length; mask += 1) {
        const subset = keys.filter((_, index) => (mask & (1 << index)) !== 0);
        const expected = new Set<ProjectField>([...(BASE[pillar] ?? []), ...subset.flatMap((key) => ADDS[key])]);
        expect([...mandatoryFields(pillar, subset)], `${pillar} ${subset.join('+')}`).toEqual(
          PROJECT_FIELDS.filter((field) => expected.has(field)),
        );
        cases += 1;
      }
    }
    // 2^4 A&D subsets + 2^2 RC subsets.
    expect(cases).toBe(20);
  });
});

describe('ILLUSTRATIVE_FIELD_RULES — the separate table for illustrative Work', () => {
  it('is stated literally', () => {
    expect(ILLUSTRATIVE_FIELD_RULES).toEqual({
      services: 'mandatory',
      title: 'mandatory',
      cover: 'mandatory',
      gallery: 'mandatory',
      sector: 'optional',
      description: 'optional',
      year: 'forbidden',
      status: 'forbidden',
      client: 'forbidden',
      location: 'forbidden',
      area: 'forbidden',
      awards: 'forbidden',
      equipment: 'forbidden',
      collaborators: 'forbidden',
      team: 'forbidden',
      implementationCompany: 'forbidden',
      deliverables: 'forbidden',
      labels: 'forbidden',
      capture: 'forbidden',
    });
  });

  it('covers every canonical project field and the three extra factual fields, and nothing else', () => {
    expect([...ILLUSTRATIVE_EXTRA_FIELDS]).toEqual(['deliverables', 'labels', 'capture']);
    expect([...WORK_FIELDS]).toEqual([...PROJECT_FIELDS, ...ILLUSTRATIVE_EXTRA_FIELDS]);
    expect(Object.keys(ILLUSTRATIVE_FIELD_RULES).sort()).toEqual([...WORK_FIELDS].sort());
  });

  it('forbids every field a Service could activate — an example has no Service-driven facts', () => {
    for (const field of SERVICE_ACTIVATABLE_FIELDS) {
      expect(ILLUSTRATIVE_FIELD_RULES[field], field).toBe('forbidden');
    }
  });

  it('never makes Year or any other factual field optional — forbidden, not "fill it if you like"', () => {
    expect(illustrativeForbiddenFields()).toEqual([
      'year', 'status', 'client', 'location', 'area', 'awards', 'equipment', 'collaborators',
      'team', 'implementationCompany', 'deliverables', 'labels', 'capture',
    ]);
  });

  it('Sector is allowed-optional: neither required nor forbidden', () => {
    expect(ILLUSTRATIVE_FIELD_RULES.sector).toBe('optional');
  });
});
