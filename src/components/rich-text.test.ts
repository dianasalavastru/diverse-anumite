/**
 * The Portable Text allowlist — §19.2.
 *
 * "Portable Text is serialized through **controlled components** with an
 * explicit allowlist of block/mark types. An unknown type renders nothing, never
 * raw markup."
 *
 * This is a security boundary, so the cases below are written as attacks on it
 * rather than as happy paths: unknown block types, unknown styles, unknown
 * marks, unknown annotations, and hostile hrefs. The rule under test in every
 * one is the same — the parser emits nothing for what it does not recognise.
 */

import { describe, expect, it } from 'vitest';

import { safeHref, tagForStyle, toRichTextItems } from './rich-text';
import type { PortableTextBlock } from '../lib/content';

const block = (fields: Record<string, unknown>): PortableTextBlock =>
  ({ _type: 'block', _key: 'k', style: 'normal', ...fields }) as PortableTextBlock;

const span = (text: string, marks: readonly string[] = []) => ({
  _type: 'span',
  _key: `s-${text}`,
  text,
  marks,
});

describe('allowed content', () => {
  it('renders the four authored styles', () => {
    const items = toRichTextItems([
      block({ style: 'normal', children: [span('body')] }),
      block({ style: 'h2', children: [span('heading')] }),
      block({ style: 'h3', children: [span('subheading')] }),
      block({ style: 'blockquote', children: [span('quote')] }),
    ]);

    expect(items).toHaveLength(4);
    expect(items.map((item) => (item.kind === 'block' ? item.line.style : null))).toEqual([
      'normal',
      'h2',
      'h3',
      'blockquote',
    ]);
  });

  it('folds consecutive list items of the same type into one list', () => {
    const items = toRichTextItems([
      block({ listItem: 'bullet', children: [span('a')] }),
      block({ listItem: 'bullet', children: [span('b')] }),
      block({ listItem: 'number', children: [span('c')] }),
      block({ children: [span('after')] }),
    ]);

    expect(items.map((item) => item.kind)).toEqual(['list', 'list', 'block']);
    expect(items[0]).toMatchObject({ kind: 'list', list: 'bullet' });
    expect(items[0]?.kind === 'list' && items[0].lines).toHaveLength(2);
    expect(items[1]).toMatchObject({ kind: 'list', list: 'number' });
  });

  it('applies the two authored decorators', () => {
    const items = toRichTextItems([
      block({ children: [span('bold', ['strong']), span('italic', ['em'])] }),
    ]);

    const spans = items[0]?.kind === 'block' ? items[0].line.spans : [];
    expect(spans[0]).toMatchObject({ text: 'bold', strong: true, em: false });
    expect(spans[1]).toMatchObject({ text: 'italic', strong: false, em: true });
  });

  it('resolves a link annotation onto its span', () => {
    const items = toRichTextItems([
      block({
        children: [span('link', ['a1'])],
        markDefs: [{ _type: 'link', _key: 'a1', href: 'https://example.org/page' }],
      }),
    ]);

    const spans = items[0]?.kind === 'block' ? items[0].line.spans : [];
    expect(spans[0]?.href).toBe('https://example.org/page');
  });
});

describe('the allowlist rejects everything else', () => {
  it('drops an unknown block type outright', () => {
    expect(
      toRichTextItems([
        { _type: 'htmlEmbed', _key: 'x', html: '<script>alert(1)</script>' } as PortableTextBlock,
      ]),
    ).toEqual([]);
  });

  it('drops a block whose style is not in the allowlist', () => {
    // Not "renders as a paragraph" — §19.2 says renders nothing.
    expect(toRichTextItems([block({ style: 'h1', children: [span('big')] })])).toEqual([]);
    expect(toRichTextItems([block({ style: undefined, children: [span('x')] })])).toEqual([]);
  });

  it('drops an inline object that is not a text span', () => {
    const items = toRichTextItems([
      block({ children: [{ _type: 'inlineImage', _key: 'i' }, span('kept')] }),
    ]);
    const spans = items[0]?.kind === 'block' ? items[0].line.spans : [];
    expect(spans.map((s) => s.text)).toEqual(['kept']);
  });

  it('ignores an unknown decorator without dropping the text', () => {
    const items = toRichTextItems([block({ children: [span('text', ['underline', 'strong'])] })]);
    const spans = items[0]?.kind === 'block' ? items[0].line.spans : [];
    expect(spans[0]).toMatchObject({ text: 'text', strong: true, em: false, href: null });
  });

  it('ignores an unknown annotation type', () => {
    const items = toRichTextItems([
      block({
        children: [span('text', ['a1'])],
        markDefs: [{ _type: 'internalRef', _key: 'a1', href: 'https://example.org' }],
      }),
    ]);
    const spans = items[0]?.kind === 'block' ? items[0].line.spans : [];
    expect(spans[0]?.href).toBeNull();
  });

  it('drops a block with no renderable text', () => {
    expect(toRichTextItems([block({ children: [span('')] })])).toEqual([]);
    expect(toRichTextItems([block({ children: [] })])).toEqual([]);
  });

  it('returns nothing for an absent field', () => {
    expect(toRichTextItems(null)).toEqual([]);
    expect(toRichTextItems(undefined)).toEqual([]);
  });
});

describe('href schemes', () => {
  it('accepts only the four schemes the CMS validates', () => {
    expect(safeHref('https://example.org')).toBe('https://example.org');
    expect(safeHref('http://example.org')).toBe('http://example.org');
    expect(safeHref('mailto:salut@example.org')).toBe('mailto:salut@example.org');
    expect(safeHref('tel:+40000000000')).toBe('tel:+40000000000');
  });

  it('rejects script and data URLs, in any casing or spacing', () => {
    expect(safeHref('javascript:alert(1)')).toBeNull();
    expect(safeHref('JavaScript:alert(1)')).toBeNull();
    expect(safeHref('  javascript:alert(1)')).toBeNull();
    expect(safeHref('data:text/html;base64,PHNjcmlwdD4=')).toBeNull();
    expect(safeHref('vbscript:msgbox(1)')).toBeNull();
    expect(safeHref('file:///etc/passwd')).toBeNull();
  });

  it('rejects a relative href — internal links come from the route map', () => {
    expect(safeHref('/proiecte/ceva')).toBeNull();
    expect(safeHref('../up')).toBeNull();
    expect(safeHref('')).toBeNull();
    expect(safeHref(null)).toBeNull();
    expect(safeHref(42)).toBeNull();
  });
});

describe('heading levels are offset so the page outline stays valid', () => {
  it('never emits an h2, because the section already owns one', () => {
    expect(tagForStyle('h2', 3)).toBe('h3');
    expect(tagForStyle('h3', 3)).toBe('h4');
    expect(tagForStyle('h2', 4)).toBe('h4');
    expect(tagForStyle('h3', 4)).toBe('h5');
  });

  it('maps the remaining styles to their elements', () => {
    expect(tagForStyle('normal', 3)).toBe('p');
    expect(tagForStyle('blockquote', 3)).toBe('blockquote');
  });
});
