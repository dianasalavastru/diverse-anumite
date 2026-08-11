/**
 * The Service routes exist where the frozen route map says they do, and the
 * Contact prefill emits the frozen contract.
 *
 * OWNER: Workstream A.
 *
 * Astro routes by FILE PATH; the contract is a TABLE (§11.1, frozen by OD-1 and
 * OD-2). Nothing in the framework checks the two against each other — a segment
 * could be mistyped and the build would still succeed, silently emitting a URL
 * the route map does not know. The archive family already holds this line for
 * its four routes; this holds it for the Service pair.
 */

import { describe, expect, it } from 'vitest';

import { LOCALES, routePath, type Locale } from '../../lib/i18n/routes.js';
import { pillarArchiveParam, pillarTopicParam } from '../../lib/i18n/vocabulary.js';
import { PILLARS } from '../../lib/content/types.js';

/**
 * The route files, read through Vite rather than through `node:fs` — the Astro
 * program has no Node type declarations, and adding them to satisfy one test
 * would widen the build's type surface for every workstream.
 */
const PAGE_MODULES = import.meta.glob('../../pages/**/*.astro');
const PAGE_FILES = Object.keys(PAGE_MODULES).map((path) => path.replace('../../pages/', ''));

/** A dynamic route's file carries a `[param]` segment where the slug goes. */
function dynamicPageExists(path: string, param: string): boolean {
  const relative = `${path.replace(/^\/+/, '')}/[${param}].astro`;
  return PAGE_FILES.includes(relative);
}

describe('Service routes match the frozen locale route map (§11.1)', () => {
  it('RO · /servicii/[serviciu]', () => {
    expect(routePath('service', 'ro', 'x')).toBe('/servicii/x');
    expect(dynamicPageExists('/servicii', 'serviciu')).toBe(true);
  });

  it('EN · /en/services/[service]', () => {
    expect(routePath('service', 'en', 'x')).toBe('/en/services/x');
    expect(dynamicPageExists('/en/services', 'service')).toBe(true);
  });

  it('builds the slug from the route map, never by concatenation', () => {
    for (const locale of LOCALES) {
      const base = routePath('services', locale as Locale);
      expect(routePath('service', locale as Locale, 'abc').startsWith(`${base}/`)).toBe(true);
    }
  });
});

describe('the Contact prefill contract (§23.1)', () => {
  it('emits the parent hub route segment as ?topic=, per locale', () => {
    expect(pillarTopicParam('architecture-design', 'ro')).toBe('arhitectura-design');
    expect(pillarTopicParam('architecture-design', 'en')).toBe('architecture-design');
    expect(pillarTopicParam('reality-capture', 'ro')).toBe('reality-capture');
    expect(pillarTopicParam('reality-capture', 'en')).toBe('reality-capture');
  });

  it('keeps ?topic= validatable against the route map', () => {
    for (const pillar of PILLARS) {
      for (const locale of LOCALES) {
        const token = pillarTopicParam(pillar, locale as Locale);
        const hub = routePath(
          pillar === 'architecture-design'
            ? 'pillarHubArchitectureDesign'
            : 'pillarHubRealityCapture',
          locale as Locale,
        );
        expect(hub.endsWith(`/${token}`)).toBe(true);
      }
    }
  });

  it('does not reuse the archive token, which is a different namespace', () => {
    expect(pillarArchiveParam('architecture-design')).toBe('architecture');
    expect(pillarTopicParam('architecture-design', 'en')).not.toBe(
      pillarArchiveParam('architecture-design'),
    );
  });
});
