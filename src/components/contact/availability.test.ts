/**
 * The Contact page with the enquiry form OFF (initial launch) and ON (the flag
 * flipped), actually rendered.
 *
 * Off: no `<form>`, no `/api/contact`, no `[dev]` text, no island script, no
 * context line or topic index — only the orientation remains. On: the full
 * composition returns. The content read is stubbed so the suite needs no
 * network; the Service catalogue is non-empty so the topic index WOULD render
 * if it were not gated.
 */
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

const SERVICES = [
  {
    _id: 's1',
    key: 'k1',
    name: { ro: 'Serviciu de probă', en: null },
    slug: { ro: 'serviciu-proba', en: null },
    enPublished: false,
    pillar: 'architecture-design',
    shortDescription: null,
    hero: null,
    curation: { featured: false },
  },
];

vi.mock('../../lib/content/build-source', () => ({
  contentSource: () => ({ serviceSummaries: async () => SERVICES }),
}));

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
});

afterEach(() => {
  vi.doUnmock('./availability');
  vi.resetModules();
});

async function renderContact(enabled?: boolean): Promise<string> {
  vi.resetModules();
  if (enabled !== undefined) {
    vi.doMock('./availability', () => ({ ENQUIRY_FORM_ENABLED: enabled }));
  }
  const { default: ContactPage } = await import('./ContactPage.astro');
  return container.renderToString(ContactPage, { props: { locale: 'ro' } });
}

describe('Contact page — enquiry form disabled (launch default)', () => {
  it('the shipped flag is off', async () => {
    const { ENQUIRY_FORM_ENABLED } = await import('./availability');
    expect(ENQUIRY_FORM_ENABLED).toBe(false);
  });

  it('renders no form, no endpoint, no dev text and no island', async () => {
    const html = await renderContact();

    expect(html).not.toMatch(/<form\b/);
    expect(html).not.toContain('/api/contact');
    expect(html).not.toContain('[dev]');
    expect(html).not.toContain('data-contact');
    expect(html).not.toContain('data-prefill');
    expect(html).not.toContain('islands/contact');
    expect(html).not.toContain('ContactIsland');
  });

  it('drops the modules that only exist for the form', async () => {
    const html = await renderContact();

    expect(html).not.toContain('Ne scrieți despre'); // C-2
    expect(html).not.toContain('c-topics'); // topic index
    expect(html).not.toContain('Serviciu de probă');
    expect(html).not.toContain('data-confirmation'); // C-6
    expect(html).not.toContain('Mesajul a ajuns la noi.');
  });

  it('keeps the orientation: breadcrumb, eyebrow, heading, statement', async () => {
    const html = await renderContact();

    expect(html).toContain('class="c-crumbs"');
    expect(html).toContain('Acasă');
    expect(html).toContain('Contact · începem o conversație');
    expect(html).toMatch(/<h1[^>]*>Contact<\/h1>/);
    expect(html).toContain('Aici începe conversația.');
  });
});

describe('Contact page — enquiry form enabled (flag flipped)', () => {
  it('renders the form, the context line, topics, confirmation and the island', async () => {
    const html = await renderContact(true);

    expect(html).toMatch(/<form\b/);
    expect(html).toContain('action="/api/contact"');
    expect(html).toContain('data-contact');
    expect(html).toContain('Ne scrieți despre');
    expect(html).toContain('Serviciu de probă');
    expect(html).toContain('data-confirmation');
    expect(html).toMatch(/<script[^>]*type="module"/);
    expect(html).not.toContain('[dev]');
  });
});
