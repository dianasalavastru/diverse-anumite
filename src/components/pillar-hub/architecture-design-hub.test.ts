/**
 * Unit tests for the Architecture & Design hub instance.
 *
 * `hub.test.ts` already covers the shared blueprint's pure selection. What is
 * pinned here is everything that is *specific to this instance* and that a
 * rendered page would hide:
 *
 *   - the continuation must emit the **archive** pillar token `architecture`,
 *     not the content identifier `architecture-design`. A hub that emits the
 *     wrong one looks identical and filters nothing (`types.ts` warns these are
 *     different namespaces; `vocabulary.ts` holds the single declaration);
 *   - the instance must carry **no point-cloud copy at all**, because §10.1's
 *     verified table gives the A&D Hub `no`. Asserting the absence structurally
 *     is what stops it being re-added by a future copy edit;
 *   - the cross-pillar door must leave the pillar, never loop back to this hub;
 *   - RO and EN carry no placeholder or prototype figures;
 *   - RO and EN describe the same shape, so no module silently disappears in one
 *     locale.
 */

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';

import ContinueToArchive from './ContinueToArchive.astro';
import CuratedWork from './CuratedWork.astro';
import Orientation from './Orientation.astro';
import { LOCALES, type Locale } from '../../lib/i18n/routes';
import { architectureDesignHubMessages } from '../../lib/i18n/architecture-design-hub';
import { realityCaptureHubMessages } from '../../lib/i18n/pillar-hub';
import { contactTopicHref, pillarArchiveHref, pillarHubHref } from './hub';

const PILLAR = 'architecture-design' as const;

describe('the curated-work continuation (H-4 CTA / H-5)', () => {
  /**
   * The whole point of the module CTA. `HUB_PAGE_IA.md` H-5 fixes the
   * destination as "the Work Archive **filtered to this pillar**", and the brief
   * for this hub names the two URLs exactly.
   */
  it('points at the canonical filtered archive, in both locales', () => {
    expect(pillarArchiveHref(PILLAR, 'ro')).toBe('/proiecte?pillar=architecture');
    expect(pillarArchiveHref(PILLAR, 'en')).toBe('/en/projects?pillar=architecture');
  });

  /**
   * The failure this exists to catch: `?pillar=architecture-design` is the
   * *content* identifier. The archive parses `?pillar=` through
   * `pillarFromToken`, which only knows `architecture`, so the wrong token
   * silently resolves to the unfiltered `all` scope.
   */
  it('never emits the content identifier as the archive token', () => {
    for (const locale of LOCALES) {
      expect(pillarArchiveHref(PILLAR, locale)).not.toContain('pillar=architecture-design');
    }
  });

  /** No per-pillar archive route is invented — the continuation is the one archive. */
  it('continues into the shared archive route, not a per-pillar archive', () => {
    expect(pillarArchiveHref(PILLAR, 'ro').startsWith('/proiecte?')).toBe(true);
    expect(pillarArchiveHref(PILLAR, 'en').startsWith('/en/projects?')).toBe(true);
  });
});

describe('the supporting cross-pillar link (H-5)', () => {
  /**
   * `HUB_PAGE_IA.md` §1: a cross-link to the other pillar is "supporting
   * navigation… never part of the primary information flow". It must therefore
   * actually leave this pillar.
   */
  it('leaves the pillar and lands on the Reality Capture hub', () => {
    expect(pillarHubHref('reality-capture', 'ro')).toBe('/reality-capture');
    expect(pillarHubHref('reality-capture', 'en')).toBe('/en/reality-capture');
    expect(pillarHubHref('reality-capture', 'ro')).not.toBe(pillarHubHref(PILLAR, 'ro'));
  });
});

describe('the contact prefill (H-6)', () => {
  /**
   * §23.1: "`?topic=` (broad pillar-level)… **Emitted by Service pages and Pillar
   * Hubs**", validated against the route map. A hub emits no `?regarding=` —
   * `CONTACT_PAGE_IA.md`: "From a Hub → Topic = pillar (no Regarding)".
   */
  it('prefills the pillar Topic and nothing else', () => {
    expect(contactTopicHref(PILLAR, 'ro')).toBe('/contact?topic=arhitectura-design');
    expect(contactTopicHref(PILLAR, 'en')).toBe('/en/contact?topic=architecture-design');

    for (const locale of LOCALES) {
      expect(contactTopicHref(PILLAR, locale)).not.toContain('regarding=');
    }
  });
});

describe('the message set', () => {
  /**
   * §10.1 tabulates the point cloud against the six approved HiFis: Reality
   * Capture Hub **yes**, Architecture & Design Hub **no**. The absence is
   * asserted on the copy rather than on the markup because copy is where it
   * would come back.
   */
  it('carries no point-cloud copy (§10.1 — the A&D hub has no capture field)', () => {
    for (const locale of LOCALES) {
      const copy = architectureDesignHubMessages(locale);
      expect(Object.keys(copy.work)).not.toContain('pointCloud');
      expect(JSON.stringify(copy)).not.toMatch(/point cloud|nor de puncte/i);
    }
  });

  /**
   * The four prototype figures from the approved HiFi's "Masurat" row. The HiFi
   * itself calls them "valori reprezentative pentru acest prototip", no field in
   * the frozen Content Model carries them, and `PILLAR_HUB_WIREFRAME.md` H-2
   * marks Statistic optional. They are omitted, not neutralised and not derived.
   */
  it('publishes none of the HiFi prototype statistics', () => {
    for (const locale of LOCALES) {
      const serialized = JSON.stringify(architectureDesignHubMessages(locale));
      for (const figure of ['10+', '40+', '1:1', 'substituent)', 'placeholder)', 'TODO', 'TEST']) {
        expect(serialized, `${locale}: "${figure}" must not reach production copy`).not.toContain(
          figure,
        );
      }
    }
  });

  /*
   * REMOVED — the "authors the Romanian copy without diacritics" assertion.
   *
   * `DECISIONS_LOG.md` #103 (2026-09-02) amends OD-8: Romanian human-facing editorial copy is
   * authored WITH correct diacritics, and is never transliterated to satisfy an implementation
   * constraint. This was the only executable enforcement of the old rule anywhere in the suite.
   *
   * The identifier half of #103 did not disappear with it — it moved to where it belongs, beside
   * the identifiers themselves: `lib/i18n/routes.test.ts` (route segments and the derived query
   * tokens) and `lib/content/requirements.test.ts` (Service keys and every closed vocabulary).
   * Those assertions landed in the same change as this removal, so the ASCII boundary was never
   * unguarded for a single commit.
   */

  /**
   * Structural parity. A module whose copy exists in one locale and not the other
   * would render in RO and vanish in EN, which §11.2 never asks for — the locale
   * gate applies to *entities*, not to the page's own chrome.
   */
  it('describes the same shape in both locales', () => {
    const shape = (value: unknown): unknown => {
      if (Array.isArray(value)) return value.length > 0 ? [shape(value[0])] : [];
      if (value && typeof value === 'object') {
        return Object.fromEntries(
          Object.entries(value as Record<string, unknown>)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, entry]) => [key, shape(entry)]),
        );
      }
      return typeof value;
    };

    const [ro, en] = LOCALES.map((locale: Locale) => shape(architectureDesignHubMessages(locale)));
    expect(en).toEqual(ro);
  });

  /**
   * Every string a module renders must be non-empty: unlike `ui.ts`, whose
   * consumers omit an unauthored slot, these are the hub's editorial spine and an
   * empty one would render a blank heading rather than nothing.
   */
  it('leaves no rendered string empty', () => {
    const walk = (value: unknown, path: string): void => {
      if (typeof value === 'string') {
        expect(value.trim(), `${path} is empty`).not.toBe('');
        return;
      }
      if (Array.isArray(value)) return value.forEach((item, i) => walk(item, `${path}[${i}]`));
      if (value && typeof value === 'object') {
        for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
          walk(entry, `${path}.${key}`);
        }
      }
    };

    for (const locale of LOCALES) {
      walk(architectureDesignHubMessages(locale), locale);
    }
  });

  /**
   * The H-4 heading must not hard-code a count the curated set may not have. Since Wave 3 the
   * locked A&D Hub has no H-4 heading at all (`work.title` is ABSENT); the count rule still
   * applies if one is ever authored.
   */
  it('states the curated-work heading, if any, without counting the set', () => {
    for (const locale of LOCALES) {
      const { title } = architectureDesignHubMessages(locale).work;
      if (title !== undefined) expect(title).not.toMatch(/\b(sase|six|\d+)\b/i);
    }
  });

  /**
   * Locked absences (Stable RO + Wave 3). Absent is an omitted key — the shared shape marks each
   * optional and the shared module renders no element for it — never `''` and never a stand-in.
   * Asserted in both locales because EN mirrors RO's shape.
   */
  it('omits every locked-absent slot', () => {
    for (const locale of LOCALES) {
      const copy = architectureDesignHubMessages(locale);
      expect(copy.orientation, locale).not.toHaveProperty('thesis');
      expect(copy.orientation, locale).not.toHaveProperty('heroFallbackAlt');
      expect(copy.orientation, locale).not.toHaveProperty('heroCoordinates');
      expect(copy.work, locale).not.toHaveProperty('title');
      expect(copy.continue, locale).not.toHaveProperty('frame');
      expect(copy.continue.archive, locale).not.toHaveProperty('body');
      expect(copy.conversation, locale).not.toHaveProperty('invitation');
    }
  });

  /** X3 — unconfirmed geography and fabricated dimensions never reach this hub's copy. */
  it('carries no coordinates and no dimension readout', () => {
    for (const locale of LOCALES) {
      const serialized = JSON.stringify(architectureDesignHubMessages(locale));
      expect(serialized, locale).not.toMatch(/\d{1,3}\.\d+°\s*[NS]/);
      expect(serialized, locale).not.toMatch(/\bh\s*—\s*\d+(\.\d+)?\s*m\b/);
    }
  });

  /** The locked Stable RO values, exactly. A reword fails here by name. */
  it('carries the locked Stable RO strings', () => {
    const ro = architectureDesignHubMessages('ro');
    expect(ro.meta.title).toBe('Arhitectură & Design · diverse anumite');
    expect(ro.meta.description).toBe(
      'Proiectare de arhitectură, design interior, vizualizare 3D și design mobilier — serviciile de Arhitectură & Design ale atelierului diverse anumite.',
    );
    expect(ro.orientation.lead).toBe(
      'Proiectare de arhitectură, design interior, vizualizare 3D și design mobilier.',
    );
    expect(ro.services.intro).toBe(
      'Fiecare serviciu are pagina lui, cu livrabilele sale. Alegeți serviciul care vi se potrivește.',
    );
    expect(ro.work.cta).toBe('Toate proiectele — Arhitectură & Design');
    expect(ro.conversation.note).toBe(
      'Mesajul pornește cu subiectul deja setat pe Arhitectură & Design.',
    );
  });
});

/**
 * The absences above, as rendered by the SHARED modules. Each guard is instance-level: the A&D
 * instance renders no element for an omitted key, while Reality Capture — under the editorial
 * hold — keeps rendering exactly what it did (its values are frozen by `rc-copy-firewall.test.ts`).
 */
describe('absent slots render nothing on A&D, and nothing changes on RC', () => {
  let container: AstroContainer;

  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it('H-1 renders no coordinate line and an unnamed plate on A&D', async () => {
    for (const locale of LOCALES) {
      const html = await container.renderToString(Orientation, {
        props: { locale, copy: architectureDesignHubMessages(locale).orientation, hero: null, station: 1 },
      });
      expect(html, locale).not.toContain('hub-arrival-dim');
      expect(html, locale).not.toMatch(/\d{1,3}\.\d+°\s*[NS]/);
      expect(html, locale).not.toContain('role="img"');
      expect(html, locale).not.toContain('data-fixture');
    }
  });

  it('H-1 keeps the RC coordinate line and fallback alt (held until the RC synthesis)', async () => {
    for (const locale of LOCALES) {
      const copy = realityCaptureHubMessages(locale).orientation;
      const html = await container.renderToString(Orientation, {
        props: { locale, copy, hero: null, overlay: 'measurement', station: 1 },
      });
      expect(html, locale).toContain('hub-arrival-dim');
      expect(html, locale).toContain(copy.heroCoordinates!);
      expect(html, locale).toContain(`aria-label="${copy.heroFallbackAlt!}"`);
    }
  });

  it('H-4 renders no heading under the marker on A&D, and keeps RC\'s', async () => {
    for (const locale of LOCALES) {
      const ad = await container.renderToString(CuratedWork, {
        props: {
          locale,
          copy: architectureDesignHubMessages(locale).work,
          entries: [],
          tones: ['#cbc6bc'],
          archiveHref: pillarArchiveHref(PILLAR, locale),
          station: 3,
        },
      });
      expect(ad, locale).not.toMatch(/<h3[\s>]/);

      const rcCopy = realityCaptureHubMessages(locale).work;
      const rc = await container.renderToString(CuratedWork, {
        props: { locale, copy: rcCopy, entries: [], tones: ['#cbc6bc'], cadence: 'docs', archiveHref: '/x', station: 3 },
      });
      expect(rc, locale).toContain(rcCopy.title!);
    }
  });

  it('H-5 renders the archive door with no body line on A&D', async () => {
    for (const locale of LOCALES) {
      const html = await container.renderToString(ContinueToArchive, {
        props: {
          copy: architectureDesignHubMessages(locale).continue,
          archiveHref: pillarArchiveHref(PILLAR, locale),
          crossPillarHref: pillarHubHref('reality-capture', locale),
          station: 5,
        },
      });
      /* One body line only: the cross-pillar door's (RC-flavoured, held for the RC synthesis). */
      expect(html.match(/class="d"/g)?.length, locale).toBe(1);
    }
  });
});
