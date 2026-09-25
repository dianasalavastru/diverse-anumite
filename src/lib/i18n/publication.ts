/**
 * Locale PUBLICATION — which supported locales this build emits.
 *
 * `LOCALES` (routes.ts, frozen) is what the architecture supports; this is what ships.
 * EN is WITHHELD for the initial launch (RO-only). While a locale is unpublished:
 *   - its pages emit no file (page guard / empty getStaticPaths)  → no indexable placeholder
 *   - no hreflang set is emitted anywhere                         → nothing advertises it
 *   - the language toggle is omitted, not disabled                → no dead control, no link to it
 * EN source (messages, page files, route table) is kept intact. Reversal = add 'en' below
 * (and update the pin in publication.test.ts).
 *
 * The per-entity EN gate (`enPublished` + `slug.en`, derive.ts `isEnAvailable`) is separate and
 * untouched: once EN is published again, it still decides which entities get an EN page.
 */
import {
  DEFAULT_LOCALE,
  LOCALES,
  hreflangAlternates,
  type Locale,
  type RouteKey,
} from './routes';

export const PUBLISHED_LOCALES: readonly Locale[] = ['ro'];

if (!PUBLISHED_LOCALES.includes(DEFAULT_LOCALE)) {
  throw new Error(`publication: the default locale "${DEFAULT_LOCALE}" must always be published.`);
}

export function isLocalePublished(
  locale: Locale,
  published: readonly Locale[] = PUBLISHED_LOCALES,
): boolean {
  return published.includes(locale);
}

/**
 * For a static page of `locale`: an empty 404 when the locale is withheld — Astro's static
 * build writes NO file for a response with no body — otherwise `null` (render normally).
 */
export function withheldLocaleResponse(
  locale: Locale,
  published: readonly Locale[] = PUBLISHED_LOCALES,
): Response | null {
  return isLocalePublished(locale, published) ? null : new Response(null, { status: 404 });
}

/** §12 reciprocal pairs only: if any locale is unpublished there is no pair, so nothing is emitted. */
export function publishedHreflangAlternates<K extends RouteKey>(
  key: K,
  slugs?: Partial<Record<Locale, string>>,
  published: readonly Locale[] = PUBLISHED_LOCALES,
): { hreflang: string; path: string }[] {
  return LOCALES.every((locale) => published.includes(locale)) ? hreflangAlternates(key, slugs) : [];
}
