/**
 * Services index interface copy.
 *
 * OWNERSHIP: Workstream A commits the STRUCTURE; Workstream C authors the
 * STRINGS (TECHNICAL_ARCHITECTURE.md §23.3, "i18n message files | A (RO/EN
 * strings authored by C) | two-party file").
 *
 * ── WHY THIS FILE IS ALMOST EMPTY ─────────────────────────────────────────
 * The Services index "orients & routes" (IA §2.5). Everything it presents is
 * live content — the Service names, their one-line positioning, and the pillar
 * they are authored into. The only strings it needs are the frame, and the frame
 * is deliberately thin because IA §2.5 also fixes what this page must NOT do:
 * "*Not:* detail/sell; never a flat list."
 *
 * ── THE TWO STRINGS IN THE MASTHEAD ARE BOTH ALREADY AUTHORED ─────────────
 * `heading` is the question this page exists to answer — IA §2.5 gives it
 * "orient & route" and the visitor arrives asking *what can I commission?*. The
 * string is not new: it is the label `pillar-hub.ts` already authors for the
 * hub's own services module ("Ce puteti comanda" / "What you can commission").
 * `eyebrow` is the locked global-nav label (NAV_DECISION_RECORD.md §4, "Despre ·
 * Servicii · Proiecte · Contact").
 *
 * The two swapped roles at the visual pass. Previously the nav label was the
 * `<h1>` and the question was the eyebrow, which made the page's largest type a
 * category name and buried what the page is for. Neither string is new, the nav
 * label is still on the page, and the accessible name now states the page's job.
 *
 * `intro` and the two group coordinates are **PENDING (C)** and render as absent
 * elements while empty — the `ui.ts` convention, so an unauthored string is
 * never a placeholder shipped to production. The reference mockup fills both
 * slots with marketing copy ("Doua arii complementare, o singura abordare…");
 * that copy is not authored anywhere upstream and is therefore not here.
 *
 * The two group labels are NOT here: they are the Pillar display labels, which
 * already have exactly one declaration in `vocabulary.ts`. A second copy of
 * "Arhitectura & Design" in a message file is how the two drift apart.
 *
 * OD-8 (§11.3): Romanian copy is authored WITHOUT diacritics.
 */

import type { Locale } from './routes';

export interface ServicesIndexMessages {
  readonly meta: {
    readonly title: string;
    /** PENDING (C) — no meta description is emitted while empty (§12). */
    readonly description: string;
  };
  /** Mono eyebrow above the page name — the locked global-nav label. */
  readonly eyebrow: string;
  /** The page's `<h1>` — the question IA §2.5 makes this page answer. */
  readonly heading: string;
  /** PENDING (C) — one line framing the fork. Absent while empty. */
  readonly intro: string;
  /** The running coordinate on each pillar group's marker. PENDING (C). */
  readonly groupCoordinate: string;
  /** Per-row continuation label on the Service Preview Card. */
  readonly cta: string;
  /**
   * Quiet link from a pillar group to that pillar's hub. NAV_DECISION_RECORD.md
   * §5(2) requires hubs stay "reachable and cross-linked" without entering the
   * global nav; IA Step 6 (M1) requires the hub NOT be a mandatory stop. So this
   * is a secondary affordance beside the fork, never the fork itself.
   * `{pillar}` is substituted.
   */
  readonly hub: string;
  /**
   * Shown when no Service is published in this locale at all. PENDING (C).
   * Absent while empty — the page then renders its orientation and nothing more,
   * which is the honest state (see ServicesIndexPage.astro).
   */
  readonly empty: string;
}

const ro: ServicesIndexMessages = {
  meta: { title: 'Servicii · diverse anumite', description: '' },
  eyebrow: 'Servicii',
  heading: 'Ce puteti comanda',
  intro: '',
  groupCoordinate: '',
  cta: 'Vezi serviciul',
  hub: 'Vezi {pillar}',
  empty: '',
};

const en: ServicesIndexMessages = {
  meta: { title: 'Services · diverse anumite', description: '' },
  eyebrow: 'Services',
  heading: 'What you can commission',
  intro: '',
  groupCoordinate: '',
  cta: 'See the service',
  hub: 'See {pillar}',
  empty: '',
};

const MESSAGES: Readonly<Record<Locale, ServicesIndexMessages>> = { ro, en };

export function servicesIndexMessages(locale: Locale): ServicesIndexMessages {
  return MESSAGES[locale];
}
