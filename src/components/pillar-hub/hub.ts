/**
 * Pillar Hub presentation selection — the pure, testable half of the hub.
 *
 * OWNERSHIP: Workstream A. Page-local pure logic beside its components, exactly
 * as `homepage/highlights.ts` and `work-archive/archive-state.ts` are.
 *
 * ── WHAT THIS FILE IS NOT ─────────────────────────────────────────────────
 * It holds no ordering, no locale filtering, no pillar scoping and no placement
 * filtering. Every one of those is a shared contract owned by Workstream B and
 * reached only through `ContentSource`:
 *
 *   locale scoping        `availableIn`, inside every ContentSource method (§7.1)
 *   discovery order       `discoveryOrder` / `compareCurated` (§7.6)
 *   pillar membership     `inPillarScope`, incl. cross-pillar (§7.4, :63)
 *   hub placements        `source.highlights('pillar-hub', pillar, locale)`
 *                         — taxonomy ∩ curation, ordered (§7.5)
 *   Service order         `source.serviceSummaries(locale, pillar)` (§7.6)
 *
 * It also holds no URL strings. The three destinations the hub owns are built
 * from the frozen route map (`i18n/routes.ts`) and the frozen archive filter
 * contract (`work-archive/archive-state.ts`), never concatenated here — `types.ts`
 * warns that Pillar identity, route slugs and the archive query token are three
 * different namespaces, and this is the file most likely to conflate them.
 *
 * What remains is the three selections the frozen contract genuinely does not
 * make: how many curated cards a hub carousel shows, which live Sector values
 * stand in for the wireframe's "use-cases", and which live equipment values stand
 * in for its optional "capability facts".
 */

import { SECTORS, localize } from '../../lib/content';
import type { Locale, Pillar, Sector, Service, ServiceSummary } from '../../lib/content';
import { routePath } from '../../lib/i18n/routes';
import { pillarRouteKey } from '../../lib/i18n/vocabulary';
import { contactPrefillQuery } from '../contact/prefill';
import { DEFAULT_ARCHIVE_STATE, archiveHref } from '../work-archive/archive-state';

/* -------------------------------------------------------------------------- */
/* Display bounds                                                              */
/* -------------------------------------------------------------------------- */

/**
 * How many curated cards the hub's H-4 carousel shows.
 *
 * Transcribed from the approved RC Hub HiFi's composition (its focus track
 * carries six documentations and its index readout reads `01 · 06`), not chosen.
 * It is a *display bound* on an already-selected, already-ordered set —
 * `CONTENT_MODEL.md` §4 defines a highlight strip as "taxonomy filter ∩ curation
 * flag, ordered by Editorial Priority", and how many of that sequence a slot
 * shows is the slot's business. It changes no membership and no order.
 *
 * It is deliberately larger than the Homepage's `HIGHLIGHT_LIMIT` of 4:
 * `PILLAR_HUB_WIREFRAME.md` §"Editorial rhythm" — "The Homepage introduces; the
 * Hub expands… slower, deeper, more evidence-rich."
 */
export const HUB_HIGHLIGHT_LIMIT = 6;

/* -------------------------------------------------------------------------- */
/* H-1 · plate overlay                                                         */
/* -------------------------------------------------------------------------- */

/**
 * The instance-level presentation option on H-1's opening plate.
 *
 * `'measurement'` is the Reality Capture treatment the approved RC HiFi authors
 * — "subtle coordinate grids, registration targets, measured annotations… NOT a
 * new language" — and which `styles/pages/pillar-hub.css` already fences as "the
 * one block that is Reality Capture's rather than the template's". The approved
 * Architecture & Design HiFi's arrival carries none of it, so that instance
 * passes no overlay and gets the plain plate.
 *
 * It is a *treatment* name from the approved design language, deliberately not a
 * pillar name: `Orientation.astro` must not know which capability it is
 * rendering, and a third instance would choose an existing treatment rather than
 * add a branch.
 */
export type HubPlateOverlay = 'measurement';

/**
 * Registration-target positions, transcribed from the RC HiFi. Percentages of
 * the plate, so they hold at every breakpoint.
 */
export const MEASUREMENT_TARGETS = [
  { left: '22%', top: '32%' },
  { left: '68%', top: '58%' },
] as const satisfies readonly { readonly left: string; readonly top: string }[];

/* -------------------------------------------------------------------------- */
/* Destinations                                                                */
/* -------------------------------------------------------------------------- */

/**
 * H-4's module CTA and H-5's continuation: **the Work Archive filtered to this
 * pillar** — `/proiecte?pillar=reality-capture`, `/en/projects?pillar=reality-capture`.
 *
 * `HUB_PAGE_IA.md` H-5 fixes the destination ("Work Archive filtered to this
 * pillar") and the Depth principle makes it the hub's only answer to breadth:
 * "Whenever additional breadth is required, the canonical continuation is the
 * Work Archive, never an extension of the Hub itself."
 *
 * Composed from `routePath` + `archiveHref` rather than written out, because the
 * A&D token is `architecture` while its Pillar identifier is `architecture-design`
 * (`vocabulary.ts`) — a hand-written hub URL is exactly how that divergence
 * becomes a filter the archive silently ignores.
 */
export function pillarArchiveHref(pillar: Pillar, locale: Locale): string {
  return archiveHref(routePath('workArchive', locale), {
    ...DEFAULT_ARCHIVE_STATE,
    pillar,
  });
}

/** H-5's supporting cross-link: the other pillar's hub (never the primary flow). */
export function pillarHubHref(pillar: Pillar, locale: Locale): string {
  return routePath(pillarRouteKey(pillar) as never, locale, undefined as never);
}

/**
 * H-6's destination: Contact with **Topic prefilled to this pillar**
 * (`HUB_PAGE_IA.md` H-6; `CONTACT_PAGE_IA.md` §"Prefill sources": "From a Hub →
 * Topic = pillar (no Regarding)").
 *
 * §23.1's prefill contract fixes the parameter name as `?topic=` and says values
 * are "validated against the route map". Neither the token nor the query string
 * is built here: `contact/prefill.ts` is the one emitter *and* the parser, so the
 * two sides are checked against each other, and `pillarTopicParam` in
 * `vocabulary.ts` is the token's single declaration — beside the three other
 * Pillar namespaces `types.ts` warns are distinct. A hub that built its own would
 * be the fifth, and the one nobody would think to check against Contact.
 *
 * No `?regarding=` is emitted: a hub is not a Service page.
 */
export function contactTopicHref(pillar: Pillar, locale: Locale): string {
  return `${routePath('contact', locale)}${contactPrefillQuery({ topic: pillar }, locale)}`;
}

/* -------------------------------------------------------------------------- */
/* H-2 · use-cases                                                             */
/* -------------------------------------------------------------------------- */

/**
 * The use-case set for H-2, from live content.
 *
 * `HUB_PAGE_IA.md` H-2 *Consumes:* "capability framing + use-cases
 * (Sector/use-case-relevant, e.g. heritage documentation for RC)". Sector is a
 * real, closed axis (v3.1 §11.1) and `Service.sectors` is authored as
 * "Sector-relevant use-cases (S-2)" — so the set is read off the pillar's
 * Services rather than written as copy, and it cannot claim a use-case the
 * practice has not published a service for.
 *
 * **Services only, never Work Entries.** "Where this capability applies" is a
 * statement about the offering; deriving it from delivered work would answer a
 * different question ("where we have worked") with the same words.
 *
 * Order is the frozen vocabulary's — the identical rule `work-archive/facets.ts`
 * applies to the archive's Sector control, so the same axis reads the same way
 * on both pages.
 *
 * STAGE 6: the "then authored values, sorted" tail is gone. The axis is closed
 * (v3.1 §11.1), so there is no such thing as a value outside the vocabulary —
 * `normalize.ts` fails the build before one could reach here. The set is simply
 * the vocabulary filtered by what the pillar's Services declare.
 */
export function useCaseSectors(services: readonly Service[]): readonly Sector[] {
  const found = new Set<Sector>();
  for (const service of services) {
    for (const sector of service.sectors) found.add(sector);
  }

  return SECTORS.filter((value) => found.has(value));
}

/* -------------------------------------------------------------------------- */
/* H-2 · capability facts                                                      */
/* -------------------------------------------------------------------------- */

/** One row of the instruments readout: a Service and the equipment it declares. */
export interface InstrumentReadout {
  readonly id: string;
  readonly service: string;
  readonly equipment: readonly string[];
}

/**
 * The optional "capability facts" of `PILLAR_HUB_WIREFRAME.md` H-2 — **as
 * declared equipment, not as figures.**
 *
 * The wireframe offers "Statistic ×n (optional — capability facts, e.g.
 * equipment/accuracy for Reality Capture)" and the approved HiFi fills that slot
 * with `2 mm`, `1:1`, `7 tipuri de sit`, `2 metode`. Three of those four have no
 * field behind them anywhere in the frozen Content Model, and the fourth
 * (accuracy) exists only per Work Entry, as `CaptureMetadata.accuracy` describing
 * one survey — never as a pillar-wide figure. §10.4 forbids inventing them and
 * forbids computing them.
 *
 * `Service.equipment` ("Equipment & specs — capture services",
 * `CONTENT_MODEL.md`:31) is the one capability-level technical fact the contract
 * actually carries, so it is what this slot renders. A pillar whose Services
 * declare no equipment renders no readout at all — the module is marked optional
 * upstream, and an empty instrument list is the honest state.
 *
 * Ordered by the Services' own curated order (the caller passes
 * `source.serviceSummaries`, already ordered by B); `byId` supplies the authored
 * field that the recognition projection does not carry.
 */
export function instrumentReadouts(
  ordered: readonly ServiceSummary[],
  byId: ReadonlyMap<string, Service>,
  locale: Locale,
): readonly InstrumentReadout[] {
  const rows: InstrumentReadout[] = [];

  for (const summary of ordered) {
    const service = byId.get(summary._id);
    const equipment = localize(service?.equipment ?? null, locale);
    const name = localize(summary.name, locale);
    if (!service || !name || !equipment || equipment.length === 0) continue;
    rows.push({ id: summary._id, service: name, equipment });
  }

  return rows;
}

/** Index the full Services the page loads once, for the lookup above. */
export function indexServicesById(services: readonly Service[]): ReadonlyMap<string, Service> {
  return new Map(services.map((service) => [service._id, service]));
}

/**
 * The pillar's Services, from the full projection.
 *
 * `Service.pillar` is authored (IA §2.3, "Service → Pillar") — Services are not
 * classified by an authored Pillar of their own (IA §2.3), exactly as projects are, and
 * this is a read, not a derivation. Used only to reach `sectors` and `equipment`,
 * which the recognition projection `ServiceSummary` deliberately does not carry;
 * ordering and the H-3 card set both come from `serviceSummaries` instead.
 */
export function servicesInPillar(
  services: readonly Service[],
  pillar: Pillar,
): readonly Service[] {
  return services.filter((service) => service.pillar === pillar);
}
