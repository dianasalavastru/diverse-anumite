/**
 * UI message structure for the Global Header and Footer.
 *
 * OWNERSHIP: Workstream A commits the STRUCTURE; Workstream C authors the
 * STRINGS (TECHNICAL_ARCHITECTURE.md §23.3, "i18n message files | A (RO/EN
 * strings authored by C) | two-party file").
 *
 * Two categories live here and they are governed differently:
 *
 *   LOCKED   — labels fixed by an upstream document. The RO global-nav labels
 *              are locked by NAV_DECISION_RECORD.md §4 ("Despre · Servicii ·
 *              Proiecte · Contact" + language toggle). Do not edit these
 *              without an upstream amendment.
 *   PENDING  — copy Workstream C has not authored yet. Left as empty strings,
 *              and every consumer renders the slot only when it is non-empty,
 *              so an unauthored string is an absent element rather than a
 *              placeholder shipped to production.
 *
 * OD-8 (§11.3): Romanian site copy is authored WITHOUT diacritics. The approved
 * HiFis' RO copy carries diacritics because it is a design reference, not
 * production copy. Strings below follow the owner decision.
 */

import type { Locale } from './routes';

export interface NavLabels {
  /** LOCKED — NAV_DECISION_RECORD.md §4, task-first global navigation. */
  readonly about: string;
  readonly services: string;
  readonly workArchive: string;
  readonly contact: string;
}

export interface FooterLabels {
  /** Column heading over the global-nav echo. From the approved HiFis. */
  readonly navGroup: string;
  /** Column heading over the social links. From the approved HiFis. */
  readonly socialGroup: string;
  /**
   * PENDING (C) — the short studio statement under the footer wordmark.
   * VISUAL_DIRECTION_v2.0 §6 "The closing" requires a composed ending, not a
   * utility footer; the sentence itself is authored copy.
   */
  readonly statement: string;
  /**
   * PENDING (C + governance) — the EU-funding acknowledgment. IA Step 7 places
   * it in the footer, not on a page. The exact wording is gated on
   * "Confirm EU programme publicity rules" (DECISIONS_LOG.md Batch 21, open).
   */
  readonly euFunding: string;
  /** PENDING (C) — copyright / coordinate line. */
  readonly colophon: string;
}

export interface LanguageToggleLabels {
  /** Label of the link to the other locale. */
  readonly label: string;
  /**
   * §11.2 rule 5 — the accessible explanation shown when the current entity has
   * no counterpart in the other locale. The switcher is disabled, never a dead
   * link. PENDING (C): the exact wording, and the UX form of the disabled state,
   * are open upstream (OD-3, NAV_DECISION_RECORD.md:36).
   */
  readonly unavailable: string;
}

export interface UiMessages {
  readonly nav: NavLabels;
  readonly footer: FooterLabels;
  readonly language: LanguageToggleLabels;
  /** Label of the small-viewport menu control, closed. */
  readonly menu: string;
  /**
   * Label the same control takes while its panel is open. The control keeps its
   * `aria-expanded` state either way — this is the SIGHTED affordance, because a
   * full-surface panel headed by a button still reading "MENIU" gives a pointer
   * user nothing to aim at to get out of it.
   */
  readonly menuClose: string;
  /** Accessible name for the header landmark. */
  readonly primaryNavigation: string;
  /** Skip link target label — WCAG 2.2 AA bypass-blocks. */
  readonly skipToContent: string;
}

const ro: UiMessages = {
  nav: {
    about: 'Despre',
    services: 'Servicii',
    workArchive: 'Proiecte',
    contact: 'Contact',
  },
  footer: {
    navGroup: 'Atelier',
    socialGroup: 'Urmariti',
    statement: '',
    euFunding: '',
    colophon: '',
  },
  language: {
    label: 'EN',
    unavailable: '',
  },
  menu: 'Meniu',
  menuClose: 'Inchide',
  primaryNavigation: 'Navigare principala',
  skipToContent: 'Sari la continut',
};

/**
 * EN labels mirror the locked RO task labels and the approved EN route segments
 * (§11.1: about · services · projects · contact). PENDING (C) confirmation —
 * no upstream document authors EN nav wording.
 */
const en: UiMessages = {
  nav: {
    about: 'About',
    services: 'Services',
    workArchive: 'Projects',
    contact: 'Contact',
  },
  footer: {
    navGroup: 'Studio',
    socialGroup: 'Follow',
    statement: '',
    euFunding: '',
    colophon: '',
  },
  language: {
    label: 'RO',
    unavailable: '',
  },
  menu: 'Menu',
  menuClose: 'Close',
  primaryNavigation: 'Primary navigation',
  skipToContent: 'Skip to content',
};

const MESSAGES: Readonly<Record<Locale, UiMessages>> = { ro, en };

export function ui(locale: Locale): UiMessages {
  return MESSAGES[locale];
}
