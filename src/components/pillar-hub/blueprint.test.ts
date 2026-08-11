/**
 * The shared Pillar Hub blueprint, actually rendered — one set of modules, two
 * instances, and the two differences that are allowed to exist between them.
 *
 * OWNER: Workstream A. ADDED AT THE A5/A6 INTEGRATION.
 *
 * ── WHY THIS SUITE EXISTS ─────────────────────────────────────────────────
 * `HUB_PAGE_IA.md` commits to "**one blueprint, two instances**… differing only
 * in the content they consume", and the two hubs were built concurrently. The
 * collision that produced this file was real: H-4 rendered `PointCloudField`
 * unconditionally and H-1 hard-coded the Reality Capture coordinate grid, so the
 * Architecture & Design instance briefly needed a second copy of H-4 to avoid
 * advertising a capture capability §10.1 says it does not have.
 *
 * The resolution is that both differences are now **instance-level presentation
 * options passed by the composition root** — `copy.pointCloud` and `overlay` —
 * so there is one H-4 and one H-1. That is exactly the kind of thing that decays
 * back into a duplicate component or an `if (pillar === …)` under maintenance,
 * and neither `hub.test.ts` (pure selection) nor the build (which renders only
 * what the live dataset happens to hold) would notice.
 *
 * So this renders the real shared components against the real message sets and
 * asserts the difference in the OUTPUT, which is the only place it matters.
 */

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';

import CuratedWork from './CuratedWork.astro';
import Orientation from './Orientation.astro';
import { architectureDesignHubMessages } from '../../lib/i18n/architecture-design-hub';
import { realityCaptureHubMessages } from '../../lib/i18n/pillar-hub';
import { LOCALES, type Locale } from '../../lib/i18n/routes';

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
});

const TONES = ['#c2bdb2', '#b7b1a5'] as const;

/** H-1, as each composition root composes it. */
const orientation = (locale: Locale, instance: 'rc' | 'ad') =>
  container.renderToString(Orientation, {
    props: {
      locale,
      copy:
        instance === 'rc'
          ? realityCaptureHubMessages(locale).orientation
          : architectureDesignHubMessages(locale).orientation,
      hero: null,
      /* The one difference: RC passes the measurement treatment, A&D passes none. */
      ...(instance === 'rc' ? { overlay: 'measurement' as const } : {}),
      station: 1,
    },
  });

/** H-4, as each composition root composes it. */
const curatedWork = (locale: Locale, instance: 'rc' | 'ad') =>
  container.renderToString(CuratedWork, {
    props: {
      locale,
      copy:
        instance === 'rc'
          ? realityCaptureHubMessages(locale).work
          : architectureDesignHubMessages(locale).work,
      entries: [],
      tones: TONES,
      ...(instance === 'rc' ? { cadence: 'docs' as const } : {}),
      archiveHref: '/proiecte?pillar=architecture',
      station: 3,
    },
  });

describe('H-4 · the capture field is an instance option (§10.1)', () => {
  /**
   * §10.1 verified `<canvas id="cloud">` against all six approved HiFis and
   * tabulates the result: Reality Capture Hub **yes**, Architecture & Design Hub
   * **no**. The A&D instance supplies no `copy.pointCloud`, so the shared module
   * must emit no field at all — not an empty one, and not one reading "point
   * cloud — asset in preparation", which would advertise a capability this
   * pillar does not offer.
   */
  it('renders no point-cloud field on the Architecture & Design instance', async () => {
    for (const locale of LOCALES) {
      const html = await curatedWork(locale, 'ad');
      expect(html, locale).not.toMatch(/id="cloud"|point-cloud|pointcloud|pc-field/i);
      expect(html, locale).not.toMatch(/nor de puncte|point cloud/i);
    }
  });

  /** The RC instance keeps the seam, with the §19.4 gate applied inside it. */
  it('keeps the point-cloud seam on the Reality Capture instance', async () => {
    for (const locale of LOCALES) {
      const html = await curatedWork(locale, 'rc');
      const copy = realityCaptureHubMessages(locale).work.pointCloud;
      expect(copy, `${locale}: the RC instance must author the capture copy`).toBeDefined();
      expect(html, locale).toContain(copy!.label);
    }
  });

  /** Both instances render the same module, so its shared parts must be shared. */
  it('renders the same section shell and the same module CTA on both', async () => {
    for (const locale of LOCALES) {
      for (const instance of ['rc', 'ad'] as const) {
        const html = await curatedWork(locale, instance);
        expect(html, `${locale}/${instance}`).toContain('class="hub-work"');
        expect(html, `${locale}/${instance}`).toContain('hub-modcta');
        expect(html, `${locale}/${instance}`).toContain('/proiecte?pillar=architecture');
      }
    }
  });
});

describe('H-1 · the plate overlay is an instance option', () => {
  /**
   * The coordinate grid, the registration targets and the measuring scan are the
   * Reality Capture treatment — `styles/pages/pillar-hub.css` fences them as
   * "the one block that is Reality Capture's rather than the template's", and
   * the approved A&D HiFi's arrival carries none of them.
   */
  it('renders no coordinate grid, registration target or scan on A&D', async () => {
    for (const locale of LOCALES) {
      const html = await orientation(locale, 'ad');
      expect(html, locale).not.toContain('gridlay');
      expect(html, locale).not.toContain('class="target"');
      expect(html, locale).not.toContain('hub-scan');
    }
  });

  it('keeps the measurement treatment on Reality Capture', async () => {
    for (const locale of LOCALES) {
      const html = await orientation(locale, 'rc');
      expect(html, locale).toContain('gridlay');
      expect(html, locale).toContain('hub-scan');
      /* Two registration targets, transcribed from the HiFi. */
      expect(html.match(/class="target"/g)?.length, locale).toBe(2);
    }
  });

  /** The module itself — heading, thesis, plate, the quiet About link — is shared. */
  it('renders the same orientation shell on both', async () => {
    for (const locale of LOCALES) {
      for (const instance of ['rc', 'ad'] as const) {
        const html = await orientation(locale, instance);
        expect(html, `${locale}/${instance}`).toContain('class="hub-arrival"');
        expect(html, `${locale}/${instance}`).toContain('hub-plate');
        expect(html, `${locale}/${instance}`).toContain('hub-quiet');
      }
    }
  });
});
