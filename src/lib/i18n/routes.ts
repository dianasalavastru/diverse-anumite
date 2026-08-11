/**
 * The locale route map — FROZEN.
 *
 * OWNERSHIP: Workstream A, single-owner file. Values frozen by OD-1 and OD-2
 * (TECHNICAL_ARCHITECTURE.md §23.3; DECISIONS_LOG.md #76, #77).
 *
 * TECHNICAL_ARCHITECTURE.md §11.1: Astro's i18n provides locale *prefixing*
 * only — it does not translate path segments. Localized segments require an
 * explicit route map, and this module is "the single source read by the router,
 * the CMS reserved-slug validator, the hreflang emitter, and the sitemap".
 * §23.1 lists it as frozen contract #1 and #2: changing it after Phase 1 begins
 * requires an amendment, because more than one workstream builds against it.
 *
 * TERMINOLOGY BOUNDARY (§11.1). `/proiecte` and `/en/projects` are public URL
 * labels. They do NOT rename the canonical content object, which remains the
 * **Work Entry** (CONTENT_MODEL.md §1) — exactly as "Proiecte" never renamed it
 * (NAV_DECISION_RECORD.md:24). The route keys below use the public route names;
 * the content types that describe the objects are Workstream B's (types.ts).
 *
 * This module is pure: no Astro import, no DOM, no CMS. It is consumed by
 * layouts, components, the sitemap and the hreflang emitter alike, and is unit
 * tested against the frozen table in §11.1.
 */

/* -------------------------------------------------------------------------- */
/* Locales                                                                     */
/* -------------------------------------------------------------------------- */

/** IA §2.2: RO at root, EN under `/en/`. DECISIONS_LOG.md #21. */
export const LOCALES = ['ro', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

/** RO is the default locale and is not prefixed. `x-default` points at it (§12). */
export const DEFAULT_LOCALE: Locale = 'ro';

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** `''` for RO (root), `/en` for EN. */
export function localePrefix(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? '' : `/${locale}`;
}

/* -------------------------------------------------------------------------- */
/* The frozen route table                                                      */
/* -------------------------------------------------------------------------- */

/**
 * One key per row of the §11.1 table. Keys are stable identifiers; never build
 * a URL by string-concatenating a segment yourself.
 */
export type RouteKey =
  | 'home'
  | 'about'
  | 'services'
  | 'service'
  | 'workArchive'
  | 'workEntry'
  | 'competitions'
  | 'professionalExperience'
  | 'pillarHubArchitectureDesign'
  | 'pillarHubRealityCapture'
  | 'contact';

/** The dynamic segment a route expects, if any. */
export type RouteParam = 'service' | 'work';

interface RouteDefinition {
  /** Locale-specific path, WITHOUT the locale prefix. `/` for home. */
  readonly path: Readonly<Record<Locale, string>>;
  /** Present when the route ends in a dynamic segment. */
  readonly param?: RouteParam;
}

/**
 * TECHNICAL_ARCHITECTURE.md §11.1, transcribed verbatim.
 *
 *   Route                    RO (locked, IA §2.1)              EN (approved)
 *   Home                     /                                 /en/
 *   About                    /despre                           /en/about
 *   Services index           /servicii                          /en/services
 *   Service                  /servicii/[serviciu]               /en/services/[service]
 *   Work archive             /proiecte                          /en/projects
 *   Work Entry               /proiecte/[proiect]                /en/projects/[project]
 *   Competitions             /proiecte/concursuri               /en/projects/competitions
 *   Professional Experience  /proiecte/experienta-profesionala  /en/projects/professional-experience
 *   Pillar hub A             /arhitectura-design                /en/architecture-design
 *   Pillar hub B             /reality-capture                   /en/reality-capture
 *   Contact                  /contact                           /en/contact
 */
export const ROUTES: Readonly<Record<RouteKey, RouteDefinition>> = {
  home: { path: { ro: '/', en: '/' } },
  about: { path: { ro: '/despre', en: '/about' } },
  services: { path: { ro: '/servicii', en: '/services' } },
  service: { path: { ro: '/servicii', en: '/services' }, param: 'service' },
  workArchive: { path: { ro: '/proiecte', en: '/projects' } },
  workEntry: { path: { ro: '/proiecte', en: '/projects' }, param: 'work' },
  competitions: {
    path: { ro: '/proiecte/concursuri', en: '/projects/competitions' },
  },
  professionalExperience: {
    path: {
      ro: '/proiecte/experienta-profesionala',
      en: '/projects/professional-experience',
    },
  },
  pillarHubArchitectureDesign: {
    path: { ro: '/arhitectura-design', en: '/architecture-design' },
  },
  pillarHubRealityCapture: {
    path: { ro: '/reality-capture', en: '/reality-capture' },
  },
  contact: { path: { ro: '/contact', en: '/contact' } },
} as const;

/* -------------------------------------------------------------------------- */
/* Path construction                                                           */
/* -------------------------------------------------------------------------- */

/** Routes that take a dynamic segment require a slug; the rest reject one. */
type SlugArg<K extends RouteKey> = (typeof ROUTES)[K] extends { param: RouteParam }
  ? [slug: string]
  : [slug?: never];

/**
 * Build an absolute, locale-prefixed path.
 *
 *   routePath('workArchive', 'ro')            -> '/proiecte'
 *   routePath('workArchive', 'en')            -> '/en/projects'
 *   routePath('workEntry', 'ro', 'casa-in-panta') -> '/proiecte/casa-in-panta'
 *   routePath('home', 'en')                   -> '/en/'
 *
 * IA §2.2: lowercase, hyphenated, localized slugs. The per-entity slug is
 * authored content (Workstream C) and is passed in, never derived here.
 */
export function routePath<K extends RouteKey>(
  key: K,
  locale: Locale,
  ...[slug]: SlugArg<K>
): string {
  const route = ROUTES[key];
  const prefix = localePrefix(locale);
  const base = route.path[locale];

  if (route.param) {
    if (!slug) {
      throw new Error(`routePath: route "${key}" requires a slug.`);
    }
    return `${prefix}${base}/${slug}`;
  }

  // Home is the only route whose path is '/'; prefixed it must keep a trailing
  // slash ('/en/'), unprefixed it is just '/'.
  if (base === '/') {
    return prefix === '' ? '/' : `${prefix}/`;
  }

  return `${prefix}${base}`;
}

/* -------------------------------------------------------------------------- */
/* Reserved slugs                                                              */
/* -------------------------------------------------------------------------- */

/**
 * IA §2.2 (F4) + §11.1: curated-view slugs are reserved PER LOCALE and no Work
 * Entry may claim them in either locale. §7.7: "The reserved list is generated
 * from the locale route map — one source, read by both the router and the
 * validator."
 *
 * Generated, not hand-listed: it is the final segment of every curated route
 * that sits inside the Work Archive namespace. Adding a curated route to the
 * table above therefore reserves its slug automatically.
 */
const CURATED_WORK_ROUTES = ['competitions', 'professionalExperience'] as const;

function curatedSlugs(locale: Locale): readonly string[] {
  return CURATED_WORK_ROUTES.map((key) => {
    const segments = ROUTES[key].path[locale].split('/');
    return segments[segments.length - 1] as string;
  });
}

export const RESERVED_SLUGS: Readonly<Record<Locale, readonly string[]>> = {
  ro: curatedSlugs('ro'),
  en: curatedSlugs('en'),
};

/** True when a Work Entry slug would collide with a curated route in `locale`. */
export function isReservedSlug(slug: string, locale: Locale): boolean {
  return RESERVED_SLUGS[locale].includes(slug);
}

/* -------------------------------------------------------------------------- */
/* Locale counterparts                                                         */
/* -------------------------------------------------------------------------- */

/**
 * The counterpart path of the current route in another locale — the input to
 * the language switcher and to the hreflang emitter (§12).
 *
 * Returns `null` when no counterpart may be emitted. §11.2 is strict about
 * this: no EN page is generated for an untranslated entity, no hreflang pair is
 * emitted, the switcher is disabled with an accessible explanation, and
 * `/en/<untranslated>` returns a clean 404 rather than a redirect to RO. RO
 * content is NEVER served under an EN URL.
 *
 * For a parameterized route the caller must pass the counterpart's own
 * localized slug — slugs are localized per entity (§7.1) and cannot be derived
 * from the RO slug. Passing no slug for a parameterized route means "this
 * entity has no counterpart in that locale" and yields `null`.
 */
export function counterpartPath<K extends RouteKey>(
  key: K,
  targetLocale: Locale,
  slug?: string,
): string | null {
  const route = ROUTES[key];

  if (route.param) {
    if (!slug) return null;
    return routePath(key as never, targetLocale, slug as never);
  }

  return routePath(key as never, targetLocale, undefined as never);
}

/** The other locale. Two locales are locked by IA §2.2, so this is total. */
export function otherLocale(locale: Locale): Locale {
  return locale === 'ro' ? 'en' : 'ro';
}

/**
 * `hreflang` set for a route (§12). Emitted "only where both counterparts
 * exist"; `x-default` points at RO.
 *
 * `slugs` carries the localized slug per locale for parameterized routes; omit
 * it for static routes. A locale with no slug is excluded from the set, which
 * is exactly rule 4 of §11.2.
 */
export function hreflangAlternates<K extends RouteKey>(
  key: K,
  slugs?: Partial<Record<Locale, string>>,
): { hreflang: string; path: string }[] {
  const available = LOCALES.map((locale) => {
    const path = counterpartPath(key, locale, slugs?.[locale]);
    return path ? { locale, path } : null;
  }).filter((entry): entry is { locale: Locale; path: string } => entry !== null);

  // Reciprocal pairs only: a single-locale route emits nothing.
  if (available.length < LOCALES.length) return [];

  const alternates = available.map(({ locale, path }) => ({
    hreflang: locale as string,
    path,
  }));

  const fallback = available.find(({ locale }) => locale === DEFAULT_LOCALE);
  if (fallback) {
    alternates.push({ hreflang: 'x-default', path: fallback.path });
  }

  return alternates;
}
