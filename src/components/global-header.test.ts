/**
 * The Global Header, actually rendered — the small-viewport navigation contract.
 *
 * OWNER: Workstream A.
 *
 * ── WHY THIS SUITE EXISTS ─────────────────────────────────────────────────
 * The header shipped with `display: none` on its nav below 720px and a `MENIU`
 * control that was rendered `disabled` with nothing behind it. Every global
 * destination — all four task links AND the language toggle — was therefore
 * unreachable at every small viewport, by pointer, touch and keyboard alike.
 * Nothing failed: `nav-routes.test.ts` proves the destinations EXIST, and every
 * one of them did. What no test asserted was that the header still OFFERS them
 * once the row is hidden.
 *
 * That is what this file holds. It renders the real component and asserts the
 * panel's markup contract — the part a stylesheet cannot rescue and a browser
 * pass cannot regression-guard:
 *
 *   1. the trigger is a native, ENABLED <button> wired to a panel that exists;
 *   2. the panel offers every destination the desktop row does, at the same
 *      href, from the same route map — not a second hand-maintained copy;
 *   3. the current route is marked in the panel, structurally (`aria-current`),
 *      not only in colour;
 *   4. §11.2 rule 5 survives the trip: an entity with no counterpart gets a
 *      disabled <span>, never a dead link falling back to RO.
 *
 * The OPEN/CLOSED behaviour is a runtime and a stylesheet, and is verified in a
 * real browser rather than asserted here — `visibility` and `aria-expanded`
 * transitions need a layout engine and an event loop, and a jsdom imitation of
 * both would be a test of the imitation.
 */

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';

import GlobalHeader from './GlobalHeader.astro';
import { routePath, type Locale, type RouteKey } from '../lib/i18n/routes';
import { ui } from '../lib/i18n/ui';

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
});

/* A type alias, not an interface: the container's `props` is constrained to
   `Record<string, any>`, and only an alias picks up the implicit index
   signature that satisfies it. */
type HeaderProps = {
  locale: Locale;
  current?: RouteKey;
  variant?: 'default' | 'on-hero';
  counterpart?: string | null;
  counterpartLocale: Locale;
};

const render = (props: HeaderProps) => container.renderToString(GlobalHeader, { props });

/**
 * The panel only — never the desktop row. Both render the same destinations, so
 * an assertion made against the whole document would pass on the row alone and
 * prove nothing about the surface this suite exists for.
 */
function panelOf(html: string): string {
  const start = html.indexOf('<div class="menu-panel"');
  expect(start, 'the small-viewport panel is not rendered at all').toBeGreaterThan(-1);
  return html.slice(start);
}

/** The four locked task links, in the order NAV_DECISION_RECORD.md §4 fixes. */
const TASK_ROUTES: RouteKey[] = ['about', 'services', 'workArchive', 'contact'];

describe('the small-viewport trigger is a real, wired disclosure control', () => {
  it('is an enabled native button — the bug was that it was not', async () => {
    const html = await render({ locale: 'ro', counterpartLocale: 'en', counterpart: '/en/' });

    const button = /<button[^>]*class="menu"[^>]*>/.exec(html)?.[0] ?? '';
    expect(button, 'no <button class="menu"> in the header').not.toBe('');

    /* The regression, named. A disabled control cannot be clicked, cannot be
       tapped and cannot be focused — with the nav row hidden, that left the
       header with exactly one destination on every phone. */
    expect(button).not.toMatch(/\bdisabled\b/);
    expect(button).toContain('type="button"');
  });

  it('exposes aria-expanded and aria-controls, and controls something real', async () => {
    const html = await render({ locale: 'ro', counterpartLocale: 'en', counterpart: '/en/' });

    const button = /<button[^>]*class="menu"[^>]*>/.exec(html)?.[0] ?? '';
    expect(button).toContain('aria-expanded="false"');

    const controls = /aria-controls="([^"]+)"/.exec(button)?.[1];
    expect(controls, 'the trigger controls nothing').toBeTruthy();
    expect(html, `aria-controls="${controls}" points at no element`).toContain(`id="${controls}"`);
  });

  it('carries its own accessible name in both locales, open and closed', async () => {
    for (const locale of ['ro', 'en'] as const) {
      const t = ui(locale);
      const html = await render({ locale, counterpartLocale: locale === 'ro' ? 'en' : 'ro' });
      const button = /<button[^>]*class="menu"[^>]*>[^<]*/.exec(html)?.[0] ?? '';

      expect(button).toContain(t.menu);
      /* Both labels come from the message file, so the runtime never has to
         invent an untranslated "Close" of its own. */
      expect(button).toContain(`data-label-close="${t.menuClose}"`);
      expect(t.menuClose.length).toBeGreaterThan(0);
    }
  });

  it('does not misuse the ARIA menu pattern — these are page links in a nav', async () => {
    const panel = panelOf(await render({ locale: 'ro', counterpartLocale: 'en', counterpart: '/en/' }));

    expect(panel).toContain('<nav');
    expect(panel).not.toContain('role="menu"');
    expect(panel).not.toContain('role="menuitem"');
  });
});

describe('the panel offers every destination the desktop row does', () => {
  for (const locale of ['ro', 'en'] as const) {
    it(`${locale}: all four task links, at the frozen paths`, async () => {
      const t = ui(locale);
      const panel = panelOf(
        await render({ locale, counterpartLocale: locale === 'ro' ? 'en' : 'ro', counterpart: '/x' }),
      );

      for (const key of TASK_ROUTES) {
        const href = routePath(key as never, locale, undefined as never);
        expect(panel, `${key} missing from the small-viewport panel`).toContain(`href="${href}"`);
      }

      /* The labels too — a panel of correct hrefs under wrong words is still a
         second navigation. Both come from the one `items` array. */
      for (const label of [t.nav.about, t.nav.services, t.nav.workArchive, t.nav.contact]) {
        expect(panel).toContain(label);
      }
    });
  }

  it('offers the language toggle, which the hidden row also carried', async () => {
    const panel = panelOf(
      await render({ locale: 'ro', counterpartLocale: 'en', counterpart: '/en/despre' }),
    );

    expect(panel).toContain('href="/en/despre"');
    expect(panel).toContain('hreflang="en"');
    expect(panel).toContain('EN');
  });

  it('keeps §11.2 rule 5: no counterpart is a disabled span, never a dead link', async () => {
    const panel = panelOf(await render({ locale: 'en', counterpartLocale: 'ro', counterpart: null }));

    expect(panel).toContain('aria-disabled="true"');
    /* The failure this forbids is a switcher that silently lands an EN reader
       on the RO page. If it is not a link, it cannot. */
    expect(/<a[^>]*class="en"/.test(panel)).toBe(false);
  });

  it('renders the same hrefs as the desktop row — one route map, not two', async () => {
    const html = await render({ locale: 'ro', counterpartLocale: 'en', counterpart: '/en/' });
    const split = html.indexOf('<div class="menu-panel"');

    /* Everything inside a <nav>, which is what excludes the wordmark: it stays
       in the header, visible ABOVE the panel, so Home is offered once and is
       deliberately not repeated in the list. */
    const navHrefs = (part: string) =>
      [...part.matchAll(/<nav[\s\S]*?<\/nav>/g)]
        .flatMap((nav) => [...nav[0].matchAll(/href="([^"]+)"/g)].map((m) => m[1]))
        .sort();

    const row = navHrefs(html.slice(0, split));
    expect(row.length).toBe(5); // four task links + the language toggle
    expect(navHrefs(html.slice(split))).toEqual(row);
  });
});

describe('the current route is marked inside the panel', () => {
  it('marks it structurally, not only in colour', async () => {
    const panel = panelOf(
      await render({ locale: 'ro', current: 'about', counterpartLocale: 'en', counterpart: '/en/about' }),
    );

    const about = /<a[^>]*href="\/despre"[^>]*>/.exec(panel)?.[0] ?? '';
    expect(about).toContain('aria-current="page"');
    expect(about).toContain('here');

    /* Exactly one. Two current items is not a state, it is a bug. */
    expect([...panel.matchAll(/aria-current="page"/g)]).toHaveLength(1);
  });

  it('keeps the Work Archive item current across its entries and curated views', async () => {
    for (const current of ['workEntry', 'competitions', 'professionalExperience'] as RouteKey[]) {
      const panel = panelOf(
        await render({ locale: 'ro', current, counterpartLocale: 'en', counterpart: null }),
      );
      const item = /<a[^>]*href="\/proiecte"[^>]*>/.exec(panel)?.[0] ?? '';
      expect(item, `${current} does not light the Proiecte item`).toContain('aria-current="page"');
    }
  });

  it('keeps the Services item current on a Service page', async () => {
    const panel = panelOf(
      await render({ locale: 'en', current: 'service', counterpartLocale: 'ro', counterpart: null }),
    );
    const item = /<a[^>]*href="\/en\/services"[^>]*>/.exec(panel)?.[0] ?? '';
    expect(item).toContain('aria-current="page"');
  });

  it('marks nothing when the page is not a nav destination', async () => {
    const panel = panelOf(
      await render({ locale: 'ro', current: 'home', counterpartLocale: 'en', counterpart: '/en/' }),
    );
    expect(panel).not.toContain('aria-current="page"');
  });
});

describe('the approved desktop header is untouched', () => {
  /**
   * The panel renders as a SIBLING of <header>, not a child. That is the whole
   * reason every `.site-header nav …` rule in global-header.css and motion.css
   * still means what it meant: a nested panel would have inherited the desktop
   * row's display, gap and type scale — and its `display: none` below 720px.
   */
  it('renders the panel outside the header element', async () => {
    const html = await render({ locale: 'ro', counterpartLocale: 'en', counterpart: '/en/' });

    const headerEnd = html.indexOf('</header>');
    const panelStart = html.indexOf('<div class="menu-panel"');

    expect(headerEnd).toBeGreaterThan(-1);
    expect(panelStart).toBeGreaterThan(headerEnd);
  });

  it('still renders the row itself, with the wordmark and the on-hero variant', async () => {
    const plain = await render({ locale: 'ro', counterpartLocale: 'en', counterpart: '/en/' });
    expect(plain).toContain('class="site-header"');
    expect(plain).toContain(`href="${routePath('home', 'ro')}"`);

    const hero = await render({
      locale: 'ro',
      variant: 'on-hero',
      counterpartLocale: 'en',
      counterpart: '/en/',
    });
    expect(hero).toContain('on-hero');
  });
});
