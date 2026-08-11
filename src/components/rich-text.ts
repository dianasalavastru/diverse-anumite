/**
 * Portable Text → a closed set of renderable items.
 *
 * OWNERSHIP: Workstream A. Pure, and therefore unit tested — which matters here
 * more than anywhere else in the frontend, because this module IS the §19.2
 * boundary.
 *
 * ══════════════════════════════════════════════════════════════════════════
 *  §19.2, verbatim, is the specification:
 *
 *  "**No `innerHTML` from CMS content. No unsafe raw HTML rendering.** Portable
 *   Text is serialized through **controlled components** with an explicit
 *   allowlist of block/mark types. An unknown type renders nothing, never raw
 *   markup."
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Every branch below is an allowlist test. There is no `default:` that falls
 * through to output: an unknown block type, style, list type, decorator or
 * annotation produces *nothing*, not the raw value and not a degraded fallback.
 * The component that consumes this (`RichText.astro`) has no `set:html` at all,
 * so nothing this module rejects can be reached by another path.
 *
 * THE ALLOWLIST MATCHES THE SCHEMA. `studio/schemaTypes/objects.ts`
 * `richTextBlocks` authors exactly: styles normal · h2 · h3 · blockquote; lists
 * bullet · number; decorators strong · em; one `link` annotation whose href
 * Sanity validates to `http | https | mailto | tel`. That schema's own comment
 * approaches it from the other side — "an editor cannot author a block type the
 * serializer does not know how to render". This module is the other half, and it
 * **re-validates** the href scheme rather than trusting it: the Studio rule
 * binds authoring, while content can also arrive by import, migration or API.
 */

import type { PortableTextBlock, RichText } from '../lib/content';

/* -------------------------------------------------------------------------- */
/* Allowlists                                                                  */
/* -------------------------------------------------------------------------- */

export const BLOCK_STYLES = ['normal', 'h2', 'h3', 'blockquote'] as const;
export type BlockStyle = (typeof BLOCK_STYLES)[number];

export const LIST_TYPES = ['bullet', 'number'] as const;
export type ListType = (typeof LIST_TYPES)[number];

export const DECORATORS = ['strong', 'em'] as const;
export type Decorator = (typeof DECORATORS)[number];

export const LINK_SCHEMES = ['http:', 'https:', 'mailto:', 'tel:'] as const;

/* -------------------------------------------------------------------------- */
/* Shapes                                                                      */
/* -------------------------------------------------------------------------- */

export interface RichTextSpan {
  readonly text: string;
  readonly strong: boolean;
  readonly em: boolean;
  readonly href: string | null;
}

export interface RichTextLine {
  readonly style: BlockStyle;
  readonly spans: readonly RichTextSpan[];
}

/** One rendered unit: a standalone block, or a run of list items. */
export type RichTextItem =
  | { readonly kind: 'block'; readonly line: RichTextLine }
  | { readonly kind: 'list'; readonly list: ListType; readonly lines: readonly RichTextLine[] };

/* -------------------------------------------------------------------------- */
/* Parsing                                                                     */
/* -------------------------------------------------------------------------- */

function isAllowed<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value);
}

/**
 * An annotation href is emitted only when it parses AND its scheme is in the
 * allowlist. `new URL` throwing is the answer we want: an href we cannot parse
 * is an href we do not emit — which is what keeps `javascript:` and every other
 * scheme out, by construction rather than by blocklist.
 *
 * A *relative* href is rejected too, and deliberately: authored prose links out
 * of the site, while internal navigation is built from the frozen route map by
 * the page, never typed into a text field where it would silently rot.
 */
export function safeHref(value: unknown): string | null {
  if (typeof value !== 'string' || value.trim() === '') return null;
  try {
    const url = new URL(value);
    return (LINK_SCHEMES as readonly string[]).includes(url.protocol) ? value : null;
  } catch {
    return null;
  }
}

function readSpans(block: PortableTextBlock): readonly RichTextSpan[] {
  const children = Array.isArray(block.children) ? block.children : [];
  const markDefs = Array.isArray(block.markDefs) ? block.markDefs : [];

  const links = new Map<string, string>();
  for (const def of markDefs as readonly Record<string, unknown>[]) {
    // Allowlist: `link` is the only annotation type in the schema. Any other
    // `_type` contributes no mark, so a span carrying it renders as plain text.
    if (def?._type !== 'link' || typeof def._key !== 'string') continue;
    const href = safeHref(def.href);
    if (href) links.set(def._key, href);
  }

  const spans: RichTextSpan[] = [];
  for (const child of children as readonly Record<string, unknown>[]) {
    // Allowlist: only text spans render. An inline object — none exist in the
    // schema today — is an unknown type and renders nothing (§19.2).
    if (child?._type !== 'span' || typeof child.text !== 'string' || child.text === '') continue;

    const marks: readonly unknown[] = Array.isArray(child.marks) ? child.marks : [];

    spans.push({
      text: child.text,
      strong: marks.some((mark) => mark === 'strong'),
      em: marks.some((mark) => mark === 'em'),
      // A span carries at most one link in practice; the first recognised key
      // wins, and an unrecognised mark applies nothing.
      href: marks.map((mark) => links.get(String(mark))).find(Boolean) ?? null,
    });
  }

  return spans;
}

/**
 * Group the flat block array into rendered items, folding consecutive
 * `listItem` blocks of the same type into one list so the markup is a real
 * `<ul>`/`<ol>` rather than a run of orphan `<li>` elements.
 */
export function toRichTextItems(source: RichText | null | undefined): readonly RichTextItem[] {
  if (!source) return [];

  const items: RichTextItem[] = [];

  for (const block of source) {
    // Allowlist gate 1 — `block` is the only known block type.
    if (block?._type !== 'block') continue;
    // Allowlist gate 2 — an unknown style renders nothing, rather than silently
    // degrading to a paragraph. §19.2 says "renders nothing".
    if (!isAllowed(block.style, BLOCK_STYLES)) continue;

    const spans = readSpans(block);
    if (spans.length === 0) continue;

    const line: RichTextLine = { style: block.style, spans };
    const listItem = block.listItem;

    // Allowlist gate 3 — an unknown list type is not a list; the block still
    // renders as its (allowed) style, which loses no authored text.
    if (isAllowed(listItem, LIST_TYPES)) {
      const previous = items[items.length - 1];
      if (previous?.kind === 'list' && previous.list === listItem) {
        (previous.lines as RichTextLine[]).push(line);
      } else {
        items.push({ kind: 'list', list: listItem, lines: [line] });
      }
      continue;
    }

    items.push({ kind: 'block', line });
  }

  return items;
}

/**
 * The element an allowed style renders as.
 *
 * Heading levels are **offset, not copied**. An authored `h2` is a heading
 * *inside* a page section that already owns an `<h2>`; emitting a second one
 * would flatten the document outline, against the semantic-heading requirement
 * of WCAG 2.2 AA (DECISIONS_LOG #78). `headingLevel` names the level an authored
 * top-level heading takes, and its sub-heading takes the next one down.
 */
export function tagForStyle(style: BlockStyle, headingLevel: 3 | 4): string {
  if (style === 'h2') return headingLevel === 3 ? 'h3' : 'h4';
  if (style === 'h3') return headingLevel === 3 ? 'h4' : 'h5';
  if (style === 'blockquote') return 'blockquote';
  return 'p';
}
