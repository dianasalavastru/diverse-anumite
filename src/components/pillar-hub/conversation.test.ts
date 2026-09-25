/**
 * H-6's prefill note is gated on the enquiry form (`contact/availability.ts`).
 *
 * The note ("Mesajul pornește cu subiectul deja setat pe …") describes the Contact
 * form's topic prefill, so it renders only while the form exists. The strings are
 * locked and unchanged (see `architecture-design-hub.test.ts` and
 * `rc-copy-firewall.test.ts`); only whether they render is under test here. The
 * single primary action renders in both states.
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
  vi.resetModules();
});

async function renderConversation(
  copy: (typeof HUBS)[number]['copy'],
  enabled?: boolean,
): Promise<string> {
  vi.resetModules();
  if (enabled !== undefined) {
    vi.doMock('../contact/availability', () => ({ ENQUIRY_FORM_ENABLED: enabled }));
  }
  const { default: Conversation } = await import('./Conversation.astro');
  return container.renderToString(Conversation, {
    props: { copy, contactHref: '/contact?topic=x', station: 6 },
  });
}

describe.each(HUBS)('H-6 note — $name hub', ({ copy, note }) => {
  it('hides the prefill note while the form is disabled (launch default)', async () => {
    const html = await renderConversation(copy);

    expect(html).not.toContain(note.replace(/&/g, '&amp;'));
    expect(html).not.toContain('subiectul deja setat');
    expect(html).not.toContain('class="note"');
    expect(html).toContain('href="/contact?topic=x"');
    expect(html).toContain('Începe o conversație');
  });

  it('shows the prefill note when the form is enabled', async () => {
    const html = await renderConversation(copy, true);

    expect(html).toContain(note.replace(/&/g, '&amp;')); // as HTML-escaped by Astro
    expect(html).toContain('href="/contact?topic=x"');
  });
});
