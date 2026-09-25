/**
 * Not-found (404) page copy.
 *
 * OWNERSHIP: Workstream A commits the STRUCTURE; the three strings are the
 * human-approved launch copy (2026-09), with correct diacritics
 * (DECISIONS_LOG.md #103).
 *
 * RO ONLY. EN is withheld for the initial launch (`publication.ts`), and the
 * site emits a single top-level `404.html` — Cloudflare Pages serves it for
 * every unmatched path, `/en/*` included — so there is no EN 404 to author.
 *
 * Nothing else is carried: no eyebrow, no marker, no coordinate, no
 * explanation beyond the body line. `title` is the heading in the site's
 * existing `<page> · diverse anumite` pattern, not new copy.
 */

export interface NotFoundMessages {
  readonly title: string;
  readonly heading: string;
  readonly body: string;
  /** The one onward link, to `/`. */
  readonly home: string;
}

const HEADING = 'Pagina nu a fost găsită.';

const ro: NotFoundMessages = {
  title: `${HEADING.replace(/\.$/, '')} · diverse anumite`,
  heading: HEADING,
  body: 'Pagina pe care o cauți nu există sau a fost mutată.',
  home: 'Înapoi la pagina principală',
};

export function notFoundMessages(): NotFoundMessages {
  return ro;
}
