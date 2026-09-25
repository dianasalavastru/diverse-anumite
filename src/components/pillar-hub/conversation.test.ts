/**
 * H-6 is gated on contact availability (`contact/availability.ts`).
 *
 * The note ("Mesajul pornește cu subiectul deja setat pe …") describes the Contact
 * form's topic prefill, so it renders only while the form exists. The single
 * primary action ("Începe o conversație") points only at Contact, so it renders only
 * while Contact is actionable (form enabled OR a confirmed channel). With neither,
 * nothing but the marker would remain, so the whole station is omitted. The strings
 * are locked and unchanged (see `architecture-design-hub.test.ts` and
 * `rc-copy-firewall.test.ts`); only whether they render is under test here.
 */
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { architectureDesignHubMessages } from '../../lib/i18n/architecture-design-hub';
import { realityCaptureHubMessages } from '../../lib/i18n/pillar-hub';

const HUBS = [
  {
    name: 'Arhitectură & Design',
    copy: architectureDesignHubMessages('ro').conversation,
    note: 'Mesajul pornește cu subiectul deja setat pe Arhitectură & Design.',
  },
  {
    name: 'Reality Capture',
    copy: realityCaptureHubMessages('ro').conversation,
    note: 'Mesajul pornește cu subiectul deja setat pe Reality Capture.',
  },
] as const;

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
});

afterEach(() => {
  vi.doUnmock('../contact/availability');
  vi.doUnmock('../../lib/i18n/contact');
  vi.resetModules();
});

const CHANNEL = { label: 'Test', value: 'test', href: null };

type State = { form?: boolean; channel?: boolean };

async function renderConversation(
  copy: (typeof HUBS)[number]['copy'],
  { form, channel }: State = {},
): Promise<string> {
  vi.resetModules();
  if (channel) {
    vi.doMock('../../lib/i18n/contact', async (importOriginal) => ({
      ...(await importOriginal<typeof import('../../lib/i18n/contact')>()),
      contactChannels: () => [CHANNEL],
    }));
  }
  if (form !== undefined) {
    // The flag, and the real predicate handed that flag (its default closes over the
    // real module's binding, so it is re-bound here rather than stubbed).
    vi.doMock('../contact/availability', async (importOriginal) => {
      const actual = await importOriginal<typeof import('../contact/availability')>();
      const { contactChannels } = await import('../../lib/i18n/contact');
      return {
        ...actual,
        ENQUIRY_FORM_ENABLED: form,
        isContactActionable: (locale: 'ro' | 'en') =>
          actual.isContactActionable(locale, { formEnabled: form, channels: contactChannels(locale) }),
      };
    });
  }
  const { default: Conversation } = await import('./Conversation.astro');
  return container.renderToString(Conversation, {
    props: { locale: 'ro', copy, contactHref: '/contact?topic=x', station: 6 },
  });
}

describe.each(HUBS)('H-6 — $name hub', ({ copy, note }) => {
  it('omits the whole station while Contact is not actionable (launch default)', async () => {
    const html = await renderConversation(copy);

    expect(html).not.toContain('hub-conversation');
    expect(html).not.toContain('data-station="6"');
    expect(html).not.toContain('conversation-heading');
    expect(html).not.toContain('/contact');
    expect(html).not.toContain('Începe o conversație');
    expect(html).not.toContain('subiectul deja setat');
    expect(html.trim()).toBe('');
  });

  it('returns the action, without the prefill note, when only a confirmed channel exists', async () => {
    const html = await renderConversation(copy, { channel: true });

    expect(html).toContain('data-station="6"');
    expect(html).toContain('href="/contact?topic=x"');
    expect(html).toContain('Începe o conversație');
    expect(html).not.toContain('subiectul deja setat');
    expect(html).not.toContain('class="note"');
  });

  it('returns the action and the prefill note when the form is enabled', async () => {
    const html = await renderConversation(copy, { form: true });

    expect(html).toContain('data-station="6"');
    expect(html).toContain('href="/contact?topic=x"');
    expect(html).toContain('Începe o conversație');
    expect(html).toContain(note.replace(/&/g, '&amp;')); // as HTML-escaped by Astro
  });
});
