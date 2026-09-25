/**
 * Every actionable CTA whose sole destination is Contact is gated on ONE predicate,
 * `isContactActionable` (`availability.ts`): the enquiry form is enabled OR a
 * confirmed direct channel exists (`contactChannels()`).
 *
 * At launch neither exists, so each CTA is absent — and no station is left as an
 * empty shell. Enabling the form OR publishing a channel brings every CTA back
 * with its original, locked string; no copy is re-authored. The header / footer
 * "Contact" item is navigation and is not gated (asserted below on the About page,
 * which renders the full layout).
 *
 * Sites covered here: Service S-5 (`service/Conversion.astro`), homepage M-6
 * (`homepage/Invitation.astro`), Work Entry W-7 (`work-entry/Onward.astro`) and the
 * About closing (`about/AboutPage.astro`). Hub H-6 is covered in
 * `pillar-hub/conversation.test.ts`, the Service page composition in
 * `service/render.test.ts`, the predicate itself in `availability.test.ts`.
 */
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import type { Service } from '../../lib/content';
import { homepageMessages } from '../../lib/i18n/homepage';
import { serviceMessages } from '../../lib/i18n/service';
import { workEntryMessages } from '../../lib/i18n/work-entry';

const CHANNEL = { label: 'Test', value: 'test', href: null };

type State = 'closed' | 'form' | 'channel';
const OPEN_STATES: readonly State[] = ['form', 'channel'];

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
});

afterEach(() => {
  vi.doUnmock('./availability');
  vi.doUnmock('../../lib/i18n/contact');
  vi.resetModules();
});

/**
 * Put the site in one availability state and import the component fresh.
 * `form` flips the flag AND re-binds the real predicate to it (its default closes
 * over the real module's constant); `channel` publishes a stand-in channel through
 * the real source and leaves the real predicate and flag untouched.
 */
async function load<T>(state: State, importer: () => Promise<{ default: T }>): Promise<T> {
  vi.resetModules();
  if (state === 'channel') {
    vi.doMock('../../lib/i18n/contact', async (importOriginal) => ({
      ...(await importOriginal<typeof import('../../lib/i18n/contact')>()),
      contactChannels: () => [CHANNEL],
    }));
  }
  if (state === 'form') {
    vi.doMock('./availability', async (importOriginal) => {
      const actual = await importOriginal<typeof import('./availability')>();
      const { contactChannels } = await import('../../lib/i18n/contact');
      return {
        ...actual,
        ENQUIRY_FORM_ENABLED: true,
        isContactActionable: (locale: 'ro' | 'en') =>
          actual.isContactActionable(locale, { formEnabled: true, channels: contactChannels(locale) }),
      };
    });
  }
  return (await importer()).default;
}

/* -------------------------------------------------------------------------- */
/* Service S-5                                                                 */
/* -------------------------------------------------------------------------- */

const SERVICE = {
  pillar: 'reality-capture',
  slug: { ro: 'scanare-3d', en: null },
} as unknown as Service;

const renderConversion = async (state: State) => {
  const Conversion = await load(state, () => import('../service/Conversion.astro'));
  return container.renderToString(Conversion, {
    props: { service: SERVICE, locale: 'ro', copy: serviceMessages('ro') },
  });
};

describe('Service S-5 — `Începeți o conversație`', () => {
  it('is absent while Contact is not actionable; the Pillar back-path keeps the station', async () => {
    const html = await renderConversion('closed');
    expect(html).not.toContain('/contact');
    expect(html).not.toContain('sv-action--primary');
    expect(html).not.toContain('Începeți o conversație');
    expect(html).toContain('sv-conversion-back');
    expect(html).toContain('Vezi Reality Capture');
  });

  it.each(OPEN_STATES)('returns with its locked string and prefill (%s)', async (state) => {
    const html = await renderConversion(state);
    expect(html).toContain('href="/contact?topic=reality-capture&#38;regarding=scanare-3d"');
    expect(html).toContain('Începeți o conversație');
    expect(html).toContain('sv-conversion-back');
  });
});

/* -------------------------------------------------------------------------- */
/* Homepage M-6                                                                */
/* -------------------------------------------------------------------------- */

const renderInvitation = async (state: State) => {
  const Invitation = await load(state, () => import('../homepage/Invitation.astro'));
  return container.renderToString(Invitation, {
    props: { locale: 'ro', copy: homepageMessages('ro').invitation, station: 6 },
  });
};

describe('Homepage M-6 — `Începe o conversație`', () => {
  it('is absent while Contact is not actionable; the question and the confirmed row remain', async () => {
    const html = await renderInvitation('closed');
    expect(html).not.toContain('/contact');
    expect(html).not.toContain('class="act');
    expect(html).not.toContain('Începe o conversație');
    // Not an empty shell: the locked station, its question and its confirmed row stay.
    expect(html).toContain('data-station="6"');
    expect(html).toContain('Un proiect prinde contur?');
    expect(html.match(/class="row"/g)?.length).toBe(1);
    expect(html).toContain('Cluj-Napoca');
  });

  it.each(OPEN_STATES)('returns with its locked string (%s)', async (state) => {
    const html = await renderInvitation(state);
    expect(html).toMatch(/<a class="act rv"[^>]*href="\/contact"/);
    expect(html).toContain('Începe o conversație');
    expect(html).toContain('Cluj-Napoca');
  });
});

/* -------------------------------------------------------------------------- */
/* Work Entry W-7                                                              */
/* -------------------------------------------------------------------------- */

const renderOnward = async (state: State) => {
  const Onward = await load(state, () => import('../work-entry/Onward.astro'));
  return container.renderToString(Onward, {
    props: { pillar: 'architecture-design', locale: 'ro', copy: workEntryMessages('ro') },
  });
};

describe('Work Entry W-7 — `Scrieți-ne`', () => {
  it('is absent while Contact is not actionable; the Hub back-path keeps the module', async () => {
    const html = await renderOnward('closed');
    expect(html).not.toContain('/contact');
    expect(html).not.toContain('we-onward-contact');
    expect(html).not.toContain('Scrieți-ne');
    expect(html).toContain('we-onward-hub');
    expect(html).toContain('Vezi Arhitectură &amp; Design');
  });

  it.each(OPEN_STATES)('returns with its locked string (%s)', async (state) => {
    const html = await renderOnward(state);
    expect(html).toContain('href="/contact"');
    expect(html).toContain('Scrieți-ne');
    expect(html).toContain('we-onward-hub');
  });
});

/* -------------------------------------------------------------------------- */
/* About closing                                                               */
/* -------------------------------------------------------------------------- */

const renderAbout = async (state: State) => {
  const AboutPage = await load(state, () => import('../about/AboutPage.astro'));
  return container.renderToString(AboutPage, { props: { locale: 'ro' } });
};

const onwardList = (html: string): string => {
  const start = html.indexOf('class="ab-onward');
  return html.slice(start, html.indexOf('</ul>', start));
};

describe('About closing — `Discutăm despre un proiect`', () => {
  it('lists Work · Services only while Contact is not actionable', async () => {
    const html = await renderAbout('closed');
    const onward = onwardList(html);
    expect(onward).not.toContain('/contact');
    expect(onward).not.toContain('Discutăm despre un proiect');
    expect(onward.match(/<li\b/g)).toHaveLength(2);
    expect(onward.indexOf('Servicii')).toBeGreaterThan(onward.indexOf('Vezi proiectele'));
  });

  it('keeps the header / footer "Contact" navigation — navigation is not a CTA', async () => {
    const html = await renderAbout('closed');
    expect(html).toMatch(/href="\/contact"[^>]*>\s*Contact\s*</);
  });

  it.each(OPEN_STATES)('returns as the third path with its locked string (%s)', async (state) => {
    const onward = onwardList(await renderAbout(state));
    expect(onward.match(/<li\b/g)).toHaveLength(3);
    const work = onward.indexOf('Vezi proiectele');
    const services = onward.indexOf('Servicii');
    const contact = onward.indexOf('Discutăm despre un proiect');
    expect(work).toBeGreaterThan(-1);
    expect(services).toBeGreaterThan(work);
    expect(contact).toBeGreaterThan(services);
    expect(onward).toContain('href="/contact"');
  });
});
