/**
 * The contact prefill contract — `?topic=` and `?regarding=`.
 *
 * OWNERSHIP: Workstream A. FROZEN by TECHNICAL_ARCHITECTURE.md §23.1:
 *
 *   "Query parameters are `?topic=` (broad pillar-level) and `?regarding=` (the
 *    originating Service slug), per `IA` Step 7's two-prefill model. Emitted by
 *    Service pages and Pillar Hubs; consumed by Contact (C-2 Topic Summary).
 *    Values are validated against the route map and known Service slugs; an
 *    unrecognised value is ignored rather than echoed — it must never reach the
 *    email subject (§19.3)."
 *
 * `CONTACT_PAGE_IA.md` §"Arrival assumption" raises the same two values from an
 * implementation detail to an architectural concept: "The **Topic / Regarding
 * prefills are first-class architectural concepts**". This module is that
 * concept, declared once — the parser AND the emitter, so the two sides cannot
 * drift. No page builds one of these URLs by concatenation.
 *
 * ── WHY BOTH SIDES LIVE HERE ───────────────────────────────────────────────
 * The emitters (Service pages, Pillar Hubs) are Phase 6 work and are not built.
 * Shipping `contactPrefillHref()` alongside the parser means the page that
 * eventually emits the link cannot invent a token spelling the consumer does not
 * accept: the two functions are checked against each other in `prefill.test.ts`.
 *
 * ── IT IS PURE, AND IT RUNS ON THE CLIENT ──────────────────────────────────
 * The site is 100% prerendered (§6.1), so nothing server-side can read a query
 * string. The prefill is therefore applied by the contact island, which imports
 * this file. It may only reach the browser-safe half of the content boundary
 * (`lib/content/index.ts`, per `server.ts`'s B4 note) — it does, and it touches
 * no DOM, so it is testable in isolation.
 *
 * ── WHAT IS DELIBERATELY NOT HERE ──────────────────────────────────────────
 * No subject line. §19.3: "no personal data in the subject line — the subject
 * carries Topic/Regarding routing values only". The subject is composed by the
 * Function from the *machine values* this module validates; nothing on the
 * client composes one, and no visitor-supplied string is ever a candidate.
 */

import { PILLARS, type Locale, type Pillar } from '../../lib/content';
import { pillarTopicParam } from '../../lib/i18n/vocabulary';

/* -------------------------------------------------------------------------- */
/* The frozen parameter names                                                  */
/* -------------------------------------------------------------------------- */

/** §23.1, verbatim. Declared once so no caller spells them. */
export const PREFILL_PARAMS = {
  topic: 'topic',
  regarding: 'regarding',
} as const;

/**
 * The longest a prefill value may be before it is rejected unread.
 *
 * Every legitimate value is an allowlisted token or a localized Service slug —
 * IA §2.2 makes slugs "lowercase, hyphenated", and none in the corpus is close
 * to this. The cap exists so a multi-kilobyte query value is discarded by length
 * rather than compared, and so nothing oversized is ever held in memory long
 * enough to be echoed by a mistake made later.
 */
export const PREFILL_VALUE_MAX = 64;

/* -------------------------------------------------------------------------- */
/* Shapes                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * A Service, as the prefill layer needs it: its localized slug (the token that
 * travels in the URL), its authored name (what C-2 may display) and its pillar
 * (what C-2 derives the Topic from).
 *
 * The name comes from the CMS through the page composition, never from the URL.
 * That is the whole reason `regarding` resolves to an OBJECT and not to the
 * string that arrived: the page can only ever render authored content.
 */
export interface PrefillService {
  readonly slug: string;
  readonly name: string;
  readonly pillar: Pillar;
}

export interface ContactPrefill {
  /** The broad Topic. `null` means the C-4 selector stays on "Not sure". */
  readonly topic: Pillar | null;
  /** The exact originating Service, or `null`. */
  readonly regarding: PrefillService | null;
}

export const NO_PREFILL: ContactPrefill = { topic: null, regarding: null };

/* -------------------------------------------------------------------------- */
/* Topic — validated against the route map                                     */
/* -------------------------------------------------------------------------- */

/**
 * Every token accepted for `?topic=` in `locale`, mapped to its Pillar.
 *
 * Two spellings are accepted, and both are "validated against the route map"
 * in the sense §23.1 requires:
 *
 *   1. the **pillar hub's own route segment in that locale** — `pillarTopicParam`
 *      in `vocabulary.ts`, which is what every emitter on the site produces (see
 *      `contactPrefillQuery` below);
 *   2. the **Pillar identifier** (`architecture-design`, `reality-capture`) — a
 *      locale-neutral spelling, accepted so that a link pasted across locales, or
 *      hand-written from the content vocabulary, still carries its context rather
 *      than degrading to "Not sure". In EN the two coincide, and `reality-capture`
 *      is identical in both locales; RO's `arhitectura-design` is the only case
 *      where they differ at all.
 *
 * The **token mapping is declared once**, in `vocabulary.ts`, beside the three
 * other Pillar namespaces `types.ts` warns are distinct. This module used to
 * derive it a second time from `ROUTES`; the two agreed, which is exactly why a
 * later divergence would have been silent — a `?topic=` the emitter produced and
 * the parser rejected looks like a page that simply forgot the context.
 *
 * The archive's `?pillar=architecture` token (§23.5) is deliberately NOT
 * accepted: it belongs to a different frozen contract, and widening this one to
 * cover it would be inventing surface the specification does not ask for.
 */
export function topicTokens(locale: Locale): ReadonlyMap<string, Pillar> {
  const tokens = new Map<string, Pillar>();
  for (const pillar of PILLARS) {
    tokens.set(pillar, pillar);
    tokens.set(pillarTopicParam(pillar, locale), pillar);
  }
  return tokens;
}

/** Normalize before comparison. Anything that survives is compared, never echoed. */
function normalize(raw: string | null | undefined): string | null {
  if (typeof raw !== 'string') return null;
  const value = raw.trim().toLowerCase();
  if (!value || value.length > PREFILL_VALUE_MAX) return null;
  return value;
}

/** The Pillar `raw` names in `locale`, or `null` — unrecognised is ignored (§23.1). */
export function parseTopic(raw: string | null | undefined, locale: Locale): Pillar | null {
  const value = normalize(raw);
  return value ? (topicTokens(locale).get(value) ?? null) : null;
}

/* -------------------------------------------------------------------------- */
/* Regarding — validated against known Service slugs                           */
/* -------------------------------------------------------------------------- */

/**
 * The Service `raw` names, or `null`.
 *
 * `services` is the set of Services published **in the active locale**, supplied
 * by the page composition from `ContentSource.serviceSummaries(locale)`. A slug
 * that is real in RO but untranslated in EN therefore does not resolve on the EN
 * page — the same rule §11.2 applies to routing, applied to context.
 */
export function parseRegarding(
  raw: string | null | undefined,
  services: readonly PrefillService[],
): PrefillService | null {
  const value = normalize(raw);
  if (!value) return null;
  return services.find((service) => service.slug.toLowerCase() === value) ?? null;
}

/* -------------------------------------------------------------------------- */
/* Resolution                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Resolve both parameters out of a query string.
 *
 * `search` is `location.search` (leading `?` optional). Everything unrecognised
 * is dropped silently — C-2's neutral default is a specified state
 * (`CONTACT_WIREFRAME.md` C-2: "it degrades gracefully to the neutral broad-Topic
 * framing (default **'Not sure'**), never an empty or awkward slot"), so an
 * ignored value costs the visitor nothing and needs no error.
 *
 * **A resolved Service decides the Topic.** IA Step 7 defines the pair as
 * "a broad `Topic` … **and** the exact originating `Regarding` service, passed
 * from the Service page / pillar the visitor came from", and `CONTACT_PAGE_IA.md`
 * §"Prefill sources" fixes it: "From a Service page → Topic = pillar, Regarding =
 * that service." So when a Service resolves, its pillar — an authored CMS value —
 * supersedes whatever `?topic=` claimed. A hand-edited URL cannot pair a real
 * service with a contradicting topic, and the two values can never disagree in
 * the message that reaches the inbox.
 */
export function resolvePrefill(
  search: string,
  locale: Locale,
  services: readonly PrefillService[],
): ContactPrefill {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);

  const regarding = parseRegarding(params.get(PREFILL_PARAMS.regarding), services);
  if (regarding) return { topic: regarding.pillar, regarding };

  return { topic: parseTopic(params.get(PREFILL_PARAMS.topic), locale), regarding: null };
}

/* -------------------------------------------------------------------------- */
/* Emission — the other half of the contract                                   */
/* -------------------------------------------------------------------------- */

/**
 * The query string a Service page or Pillar Hub appends to its Contact link —
 * **the site's one `?topic=` / `?regarding=` emitter.**
 *
 * Returns `''` when there is nothing to carry, so a caller can always
 * concatenate it onto `routePath('contact', locale)` unconditionally.
 *
 *   Service page → contactPrefillQuery({ topic: pillar, regarding: slug }, locale)
 *   Pillar hub   → contactPrefillQuery({ topic: pillar }, locale)
 *
 * ── WHY THE TOKEN IS LOCALIZED, AND WHY `locale` IS REQUIRED ───────────────
 * §23.1 says values are "validated against the route map", and the route map is
 * localized: `pillarTopicParam` reads the parent hub's own final path segment
 * out of the frozen table, so a token can never disagree with the route it
 * names. Its companion is localized for a harder reason — `?regarding=` is "the
 * originating Service slug" and slugs are localized per entity (§7.1) — so a
 * Contact page reached from `/en/services/…` receives two EN tokens and one
 * reached from `/servicii/…` two RO ones. A locale-neutral topic beside a
 * locale-scoped regarding is the pair that can disagree.
 *
 * Both emitters on the site — `pillar-hub/hub.ts` and `service/Conversion.astro`
 * — call this, so there is one spelling in the wild and `prefill.test.ts` checks
 * it against the parser directly.
 *
 * `CONTACT_PAGE_IA.md` §"Prefill sources" also lists a Work Entry as an emitter
 * ("Topic = pillar; Regarding = the demonstrated service where applicable"),
 * while §23.1 names only Services and Hubs. The narrower list is the frozen one
 * and `Onward.astro` already records why the Work Entry stays out of it; this
 * function takes no position — it emits what its caller supplies.
 */
export function contactPrefillQuery(
  prefill: {
    readonly topic?: Pillar | null;
    readonly regarding?: string | null;
  },
  locale: Locale,
): string {
  const params = new URLSearchParams();
  if (prefill.topic) params.set(PREFILL_PARAMS.topic, pillarTopicParam(prefill.topic, locale));
  if (prefill.regarding) params.set(PREFILL_PARAMS.regarding, prefill.regarding);

  const query = params.toString();
  return query ? `?${query}` : '';
}
