/**
 * The frozen contact prefill contract, asserted.
 *
 * §23.1 is a *security* rule as much as a UX one — "an unrecognised value is
 * ignored rather than echoed — it must never reach the email subject (§19.3)" —
 * so the cases below are weighted toward what the parser must REFUSE, not only
 * what it accepts.
 */

import { describe, expect, it } from 'vitest';
import { ROUTES } from '../../lib/i18n/routes';
import {
  NO_PREFILL,
  PREFILL_PARAMS,
  PREFILL_VALUE_MAX,
  contactPrefillQuery,
  parseRegarding,
  parseTopic,
  resolvePrefill,
  topicTokens,
  type PrefillService,
} from './prefill';

const SERVICES: readonly PrefillService[] = [
  { slug: 'scanare-3d', name: 'Scanare 3D', pillar: 'reality-capture' },
  { slug: 'proiectare-arhitectura', name: 'Proiectare de arhitectura', pillar: 'architecture-design' },
];

const EN_SERVICES: readonly PrefillService[] = [
  { slug: '3d-scanning', name: '3D Scanning', pillar: 'reality-capture' },
];

describe('the frozen parameter names (§23.1)', () => {
  it('is `topic` and `regarding`, exactly', () => {
    expect(PREFILL_PARAMS.topic).toBe('topic');
    expect(PREFILL_PARAMS.regarding).toBe('regarding');
  });
});

describe('?topic= — validated against the route map', () => {
  it('accepts the Pillar identifiers in both locales', () => {
    expect(parseTopic('architecture-design', 'ro')).toBe('architecture-design');
    expect(parseTopic('reality-capture', 'ro')).toBe('reality-capture');
    expect(parseTopic('architecture-design', 'en')).toBe('architecture-design');
    expect(parseTopic('reality-capture', 'en')).toBe('reality-capture');
  });

  it("accepts the locale's own pillar-hub route segment", () => {
    /* Read from the frozen table rather than transcribed, so this test tracks
       the route map instead of duplicating it. */
    const roHub = ROUTES.pillarHubArchitectureDesign.path.ro.slice(1);
    expect(roHub).toBe('arhitectura-design');
    expect(parseTopic(roHub, 'ro')).toBe('architecture-design');
  });

  it('does not accept the other locale’s hub segment', () => {
    expect(parseTopic('arhitectura-design', 'en')).toBeNull();
  });

  it('does not accept the archive filter token — a different frozen contract (§23.5)', () => {
    expect(parseTopic('architecture', 'ro')).toBeNull();
  });

  it('ignores anything unrecognised', () => {
    for (const value of ['', ' ', 'nope', 'about', '../../etc/passwd', '<script>', 'null']) {
      expect(parseTopic(value, 'ro')).toBeNull();
      expect(parseTopic(value, 'en')).toBeNull();
    }
  });

  it('ignores an oversized value without comparing it', () => {
    expect(parseTopic('a'.repeat(PREFILL_VALUE_MAX + 1), 'ro')).toBeNull();
  });

  it('normalizes case and surrounding whitespace', () => {
    expect(parseTopic('  Reality-Capture  ', 'ro')).toBe('reality-capture');
  });

  it('exposes exactly the accepted tokens', () => {
    expect([...topicTokens('ro').keys()].sort()).toEqual([
      'architecture-design',
      'arhitectura-design',
      'reality-capture',
    ]);
  });
});

describe('?regarding= — validated against known Service slugs', () => {
  it('resolves to the authored Service, not to the string that arrived', () => {
    const service = parseRegarding('scanare-3d', SERVICES);
    expect(service?.name).toBe('Scanare 3D');
    expect(service?.pillar).toBe('reality-capture');
  });

  it('ignores a slug that is not in the locale’s catalogue', () => {
    /* §11.2 applied to context: an RO slug is not a Service on the EN page. */
    expect(parseRegarding('scanare-3d', EN_SERVICES)).toBeNull();
  });

  it('ignores anything unrecognised', () => {
    expect(parseRegarding('made-up-service', SERVICES)).toBeNull();
    expect(parseRegarding('', SERVICES)).toBeNull();
    expect(parseRegarding(null, SERVICES)).toBeNull();
  });

  it('resolves nothing against an empty catalogue', () => {
    expect(parseRegarding('scanare-3d', [])).toBeNull();
  });
});

describe('resolvePrefill', () => {
  it('carries the full Service hand-over', () => {
    const prefill = resolvePrefill('?topic=reality-capture&regarding=scanare-3d', 'ro', SERVICES);
    expect(prefill.topic).toBe('reality-capture');
    expect(prefill.regarding?.slug).toBe('scanare-3d');
  });

  it('accepts a query string with or without the leading `?`', () => {
    expect(resolvePrefill('topic=reality-capture', 'ro', SERVICES).topic).toBe('reality-capture');
  });

  it('carries a Hub hand-over — a topic with no service', () => {
    const prefill = resolvePrefill('?topic=architecture-design', 'ro', SERVICES);
    expect(prefill.topic).toBe('architecture-design');
    expect(prefill.regarding).toBeNull();
  });

  it('derives the Topic from the Service when only `regarding` is present', () => {
    /* CONTACT_PAGE_IA.md §"Prefill sources": "From a Service page → Topic =
       pillar, Regarding = that service." */
    const prefill = resolvePrefill('?regarding=scanare-3d', 'ro', SERVICES);
    expect(prefill.topic).toBe('reality-capture');
  });

  it('lets the resolved Service override a contradicting `topic`', () => {
    const prefill = resolvePrefill(
      '?topic=architecture-design&regarding=scanare-3d',
      'ro',
      SERVICES,
    );
    expect(prefill.topic).toBe('reality-capture');
  });

  it('degrades to the neutral state on junk', () => {
    expect(resolvePrefill('?topic=nope&regarding=nope', 'ro', SERVICES)).toEqual(NO_PREFILL);
    expect(resolvePrefill('', 'ro', SERVICES)).toEqual(NO_PREFILL);
    expect(resolvePrefill('?q=' + 'x'.repeat(5000), 'ro', SERVICES)).toEqual(NO_PREFILL);
  });

  it('never returns a value that did not come from the catalogue', () => {
    const prefill = resolvePrefill('?regarding=<img src=x onerror=alert(1)>', 'ro', SERVICES);
    expect(prefill.regarding).toBeNull();
    expect(prefill.topic).toBeNull();
  });
});

describe('emission and consumption agree', () => {
  /**
   * The integration contract, in one place: `contactPrefillQuery` is the site's
   * ONE `?topic=`/`?regarding=` emitter — both Pillar Hubs (through
   * `pillar-hub/hub.ts`) and every Service page (through
   * `service/Conversion.astro`) route through it — and `resolvePrefill` is the
   * only consumer. Everything below is that round trip, in both locales.
   */
  it('round-trips a Service hand-over', () => {
    const query = contactPrefillQuery({ topic: 'reality-capture', regarding: 'scanare-3d' }, 'ro');
    const prefill = resolvePrefill(query, 'ro', SERVICES);
    expect(prefill.topic).toBe('reality-capture');
    expect(prefill.regarding?.slug).toBe('scanare-3d');
  });

  it('round-trips a Hub hand-over', () => {
    const query = contactPrefillQuery({ topic: 'architecture-design' }, 'en');
    expect(resolvePrefill(query, 'en', EN_SERVICES).topic).toBe('architecture-design');
  });

  it('emits nothing when there is nothing to carry', () => {
    expect(contactPrefillQuery({}, 'ro')).toBe('');
    expect(contactPrefillQuery({ topic: null, regarding: null }, 'en')).toBe('');
  });

  /**
   * §23.1: values are "validated against the route map". The emitted token is
   * the parent hub's own final path segment in the active locale — the single
   * declaration in `vocabulary.ts` — so it cannot disagree with the route it
   * names, and it matches what both emitters put in their `href`.
   */
  it('emits the localized route-map segment, and the parser accepts it', () => {
    const ro = contactPrefillQuery({ topic: 'architecture-design' }, 'ro');
    expect(ro).toBe(`?topic=${ROUTES.pillarHubArchitectureDesign.path.ro.slice(1)}`);
    expect(ro).toBe('?topic=arhitectura-design');
    expect(resolvePrefill(ro, 'ro', SERVICES).topic).toBe('architecture-design');

    const en = contactPrefillQuery({ topic: 'architecture-design' }, 'en');
    expect(en).toBe(`?topic=${ROUTES.pillarHubArchitectureDesign.path.en.slice(1)}`);
    expect(en).toBe('?topic=architecture-design');
    expect(resolvePrefill(en, 'en', EN_SERVICES).topic).toBe('architecture-design');
  });

  /**
   * Every pillar, both locales, emitter → parser → the same semantic pillar.
   * This is the assertion that would have caught a second, divergent token
   * mapping — the reason `prefill.ts` no longer derives one of its own.
   */
  it('round-trips every pillar in every locale', () => {
    for (const locale of ['ro', 'en'] as const) {
      for (const pillar of ['architecture-design', 'reality-capture'] as const) {
        const query = contactPrefillQuery({ topic: pillar }, locale);
        expect(resolvePrefill(query, locale, SERVICES).topic, `${locale}/${pillar}`).toBe(pillar);
      }
    }
  });
});
