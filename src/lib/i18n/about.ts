/**
 * About (Despre) interface copy.
 *
 * OWNERSHIP: Workstream A commits the STRUCTURE; Workstream C authors the
 * STRINGS (TECHNICAL_ARCHITECTURE.md §23.3).
 *
 * ══════════════════════════════════════════════════════════════════════════
 *  ALMOST EVERY STRING HERE IS PENDING, AND THAT IS THE HONEST STATE
 * ══════════════════════════════════════════════════════════════════════════
 *
 * About is the one page type whose entire substance is authored editorial prose
 * about a real person and a real practice. IA §2.5 gives its responsibility as
 * "trust in architect/practice", and IA Step 7's table adds "carries EU-funded
 * expansion narrative". None of that copy exists in any authoritative document:
 * `README.md` §"Open questions" records that About has **no Page IA, wireframe,
 * or HiFi**, and no document authors its text.
 *
 * Writing it here would be fabricating biography, history, credentials and
 * claims about a real practice — the single thing this codebase most
 * consistently refuses (§10.4; and see WorkEntryPage.astro, WorkPreviewCard.astro
 * and PointCloudField.astro for the same refusal applied to smaller things).
 *
 * So the strings below are **empty and PENDING (C)**, and every consumer renders
 * its slot only when the string is non-empty — the `ui.ts` convention. The page
 * that results carries its name, and the three onward paths IA Step 7 specifies,
 * and nothing it cannot stand behind. It resolves rather than 404s, which is what
 * the locked global nav requires of it; it does not yet *fulfil* its IA
 * responsibility, and it cannot until copy is authored.
 *
 * `heading` is the exception: it is the locked global-nav label
 * (NAV_DECISION_RECORD.md §4, "Despre · Servicii · Proiecte · Contact"), which is
 * an existing authored decision rather than new copy. The three onward-path
 * labels are likewise the locked nav labels for the destinations they name.
 *
 * OD-8 (§11.3): Romanian copy is authored WITHOUT diacritics. EN strings are NOT
 * translated from RO placeholders — where RO is empty EN is empty, because an
 * invented English rendering of an unwritten Romanian sentence is two
 * fabrications rather than one.
 */

import type { Locale } from './routes';

export interface AboutMessages {
  readonly meta: {
    readonly title: string;
    /** PENDING (C) — no meta description is emitted while empty (§12). */
    readonly description: string;
  };
  /** Mono eyebrow above the page name. */
  readonly eyebrow: string;
  /** The page's `<h1>` — the locked nav label. */
  readonly heading: string;
  /**
   * PENDING (C) — the practice/architect statement that is this page's entire
   * reason to exist (IA §2.5, "trust in architect/practice"). Absent while empty.
   */
  readonly statement: string;
  /**
   * PENDING (C + governance) — the EU-funded expansion narrative IA Step 7
   * assigns to this page. Gated on the same open question as the footer's
   * acknowledgment: "Confirm EU programme publicity rules"
   * (`DECISIONS_LOG.md` Batch 21, open). Absent while empty.
   */
  readonly funding: string;
  /**
   * The onward paths. IA Step 7: About has "**No dominant CTA**; clear onward
   * paths to Work, Services, Contact" (`DECISIONS_LOG.md` #47). Three of equal
   * weight, which is what "no dominant" means structurally.
   */
  readonly onward: {
    /** PENDING (C) — label over the three paths. Absent while empty. */
    readonly label: string;
    readonly work: string;
    readonly services: string;
    readonly contact: string;
  };
}

const ro: AboutMessages = {
  meta: { title: 'Despre · diverse anumite', description: '' },
  eyebrow: 'Atelierul',
  heading: 'Despre',
  statement: '',
  funding: '',
  onward: {
    label: '',
    work: 'Proiecte',
    services: 'Servicii',
    contact: 'Contact',
  },
};

const en: AboutMessages = {
  meta: { title: 'About · diverse anumite', description: '' },
  eyebrow: 'The studio',
  heading: 'About',
  statement: '',
  funding: '',
  onward: {
    label: '',
    work: 'Projects',
    services: 'Services',
    contact: 'Contact',
  },
};

const MESSAGES: Readonly<Record<Locale, AboutMessages>> = { ro, en };

export function aboutMessages(locale: Locale): AboutMessages {
  return MESSAGES[locale];
}
