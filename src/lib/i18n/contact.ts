/**
 * Contact page copy.
 *
 * ⚠ PLACEHOLDER COPY — PENDING WORKSTREAM C. NOTHING HERE IS AUTHORED CONTENT.
 *
 * OWNERSHIP: Workstream A commits the STRUCTURE; Workstream C authors the
 * STRINGS (TECHNICAL_ARCHITECTURE.md §23.3, "i18n message files | A (RO/EN
 * strings authored by C) | two-party file"). Replacing a value here is a copy
 * change and touches no component.
 *
 * ── TWO GOVERNANCE CATEGORIES, EXACTLY AS `ui.ts` DRAWS THEM ────────────────
 *
 *   PLACEHOLDER — interface copy (field labels, error text, control names). It
 *                 names the mechanics of the form and states no fact about the
 *                 practice, so a working placeholder is safe to ship to a
 *                 review environment and cheap to replace.
 *   PENDING      — copy that would assert a FACT: a contact address, a response
 *                 time, a privacy statement. Left as the empty string, and every
 *                 consumer renders its slot only when the string is non-empty,
 *                 so an unauthored fact is an ABSENT element rather than an
 *                 invented one.
 *
 * The Contact page is the one page where that second rule has teeth. Its whole
 * job is to be acted on: a placeholder response time is a promise a visitor
 * plans around, and a placeholder email address is a message sent into a void.
 * `CONTACT_PAGE_IA.md` §"Open" lists both as unresolved dependencies —
 * "Direct contact channels beyond the form (C-3 content); the stated
 * response-time expectation (C-5 content)" — and TECHNICAL_ARCHITECTURE.md
 * §10.4 forbids fabricated content in production output. So they are empty.
 *
 * NOTE ON THE HOMEPAGE PRECEDENT. `homepage.ts` ships
 * `salut@diverseanumite.ro (substituent)` inside a `data-fixture` block, and
 * that is right for the Homepage: the row is a composition anchor at the tail of
 * a page whose purpose is elsewhere. It is NOT right here. On Contact the same
 * string is the primary affordance of the module it sits in, and a visitor
 * would act on it. See `channels()` below.
 *
 * OD-8 (§11.3): Romanian site copy is authored WITHOUT diacritics.
 */

import type { Locale } from './routes';

/* -------------------------------------------------------------------------- */
/* Shapes                                                                      */
/* -------------------------------------------------------------------------- */

/** A field's visible label plus the message shown for each failure it can have. */
export interface FieldCopy {
  readonly label: string;
  /** Rendered as the field's persistent description; omit with `''`. */
  readonly hint: string;
  readonly errors: Readonly<Record<string, string>>;
}

/**
 * One direct channel in C-4. `href` is what the link points at (`mailto:`,
 * `tel:`); a channel with no actionable target carries `null` and renders as
 * text.
 */
export interface ContactChannel {
  readonly label: string;
  readonly value: string;
  readonly href: string | null;
}

export interface ContactMessages {
  readonly meta: { readonly title: string; readonly description: string };

  /** C-1 · Contact orientation (Stage A). */
  readonly orientation: {
    readonly eyebrow: string;
    readonly heading: string;
    readonly statement: string;
    /** Accessible name of the breadcrumb landmark. */
    readonly breadcrumbLabel: string;
    readonly home: string;
    readonly here: string;
  };

  /** C-2 · Context summary — Topic / Regarding (Stage B). */
  readonly context: {
    readonly label: string;
    /**
     * The graceful default, shown whenever no context carried over — which
     * includes every server-rendered load, because the page is static and the
     * prefill lives in the URL (see `islands/contact.ts`).
     */
    readonly neutral: string;
    /** `{topic}` — a pillar arrived, no service did. */
    readonly topicOnly: string;
    /** `{service}` + `{topic}` — the full Service-page hand-over. */
    readonly withService: string;
  };

  /** C-3 · Enquiry form (Stage C). */
  readonly form: {
    readonly legend: string;
    readonly name: FieldCopy;
    readonly email: FieldCopy;
    readonly topic: FieldCopy;
    readonly message: FieldCopy;
    /** The label of the "no pillar chosen" option — IA Step 7's "Not sure". */
    readonly topicNotSure: string;
    readonly submit: string;
    readonly submitting: string;
    /** Marks the required fields; rendered beside the legend. */
    readonly requiredNote: string;
    readonly requiredMark: string;
    /** Announced when a submit attempt is blocked by field errors. */
    readonly invalidSummary: string;
  };

  /** C-3 · submission outcomes that are NOT the confirmation. */
  readonly status: {
    /** A reachable endpoint that refused the submission. */
    readonly failed: string;
    /**
     * PENDING — no endpoint answered. Development-only wording; see
     * `enquiry.ts` for why this state exists and why it may never read as sent.
     */
    readonly unavailable: string;
  };

  /** C-5 · Expectations / response (Stage D). PENDING — a stated fact. */
  readonly expectation: string;

  /**
   * Privacy / consent context beside the form. PENDING.
   *
   * §19.5 names the subprocessors and §19.6 records that the consent
   * determination "is a legal determination, not an engineering one". The
   * Privacy page it feeds is not built and has no key in the frozen route map,
   * so there is nothing authoritative to state and nothing to link to.
   */
  readonly privacy: string;

  /** C-6 · Completion / confirmation (Stage E). */
  readonly confirmation: {
    readonly heading: string;
    /** Plain receipt, used when no context carried over. */
    readonly body: string;
    /** `{topic}` — receipt that echoes the pillar. */
    readonly bodyTopic: string;
    /** `{service}` + `{topic}` — receipt that echoes the full context. */
    readonly bodyService: string;
    /** The optional, quiet return. Never a new funnel (wireframe C-6). */
    readonly home: string;
  };
}

/* -------------------------------------------------------------------------- */
/* RO — the root locale                                                        */
/* -------------------------------------------------------------------------- */

const ro: ContactMessages = {
  meta: {
    title: 'Contact · diverse anumite',
    description: 'Incepeti o conversatie cu atelierul — un formular scurt, fara pasi in plus.',
  },

  orientation: {
    eyebrow: 'Contact · incepem o conversatie',
    heading: 'Contact',
    statement:
      'Aici incepe conversatia. Cateva randuri sunt de ajuns — detaliile le lamurim impreuna, dupa primul mesaj.',
    breadcrumbLabel: 'Firul paginii',
    home: 'Acasa',
    here: 'Contact',
  },

  context: {
    label: 'Ne scrieti despre',
    neutral: 'inca nu stiti exact — e in regula, incepem de la mesajul dumneavoastra',
    topicOnly: '{topic}',
    withService: '{service} · {topic}',
  },

  form: {
    legend: 'Mesajul dumneavoastra',
    name: {
      label: 'Nume',
      hint: '',
      errors: {
        required: 'Va rugam sa completati numele.',
        tooLong: 'Numele este prea lung.',
      },
    },
    email: {
      label: 'Email',
      hint: 'Aici va raspundem.',
      errors: {
        required: 'Va rugam sa completati adresa de email.',
        invalid: 'Adresa de email nu pare completa. Verificati-o, va rugam.',
        tooLong: 'Adresa de email este prea lunga.',
      },
    },
    topic: {
      label: 'Subiect',
      hint: 'Optional.',
      errors: {},
    },
    message: {
      label: 'Mesaj',
      hint: 'Cateva randuri despre ce aveti in minte.',
      errors: {
        required: 'Va rugam sa scrieti un mesaj.',
        tooLong: 'Mesajul depaseste lungimea maxima.',
      },
    },
    topicNotSure: 'Nu stiu inca',
    submit: 'Trimiteti mesajul',
    submitting: 'Se trimite…',
    requiredNote: 'Campurile marcate cu * sunt obligatorii.',
    requiredMark: '*',
    invalidSummary: 'Mesajul nu a fost trimis. Verificati campurile marcate mai jos.',
  },

  status: {
    failed: 'Mesajul nu a putut fi trimis. Va rugam sa incercati din nou.',
    unavailable: '',
  },

  expectation: '',

  privacy: '',

  confirmation: {
    heading: 'Mesajul a ajuns la noi.',
    body: 'Va multumim. Va raspundem pe adresa de email pe care ati lasat-o.',
    bodyTopic: 'Va multumim. Mesajul dumneavoastra despre {topic} a ajuns la noi.',
    bodyService: 'Va multumim. Mesajul dumneavoastra despre {service} ({topic}) a ajuns la noi.',
    home: 'Inapoi la pagina principala',
  },
};

/* -------------------------------------------------------------------------- */
/* EN — placeholder translation of the above, PENDING (C)                      */
/* -------------------------------------------------------------------------- */

const en: ContactMessages = {
  meta: {
    title: 'Contact · diverse anumite',
    description: 'Start a conversation with the studio — a short form, no extra steps.',
  },

  orientation: {
    eyebrow: 'Contact · starting a conversation',
    heading: 'Contact',
    statement:
      'This is where the conversation starts. A few lines are enough — the details we work out together, after the first message.',
    breadcrumbLabel: 'Breadcrumb',
    home: 'Home',
    here: 'Contact',
  },

  context: {
    label: 'You are writing about',
    neutral: 'not sure yet — that is fine, we start from your message',
    topicOnly: '{topic}',
    withService: '{service} · {topic}',
  },

  form: {
    legend: 'Your message',
    name: {
      label: 'Name',
      hint: '',
      errors: {
        required: 'Please enter your name.',
        tooLong: 'That name is too long.',
      },
    },
    email: {
      label: 'Email',
      hint: 'This is where we reply.',
      errors: {
        required: 'Please enter your email address.',
        invalid: 'That email address does not look complete. Please check it.',
        tooLong: 'That email address is too long.',
      },
    },
    topic: {
      label: 'Topic',
      hint: 'Optional.',
      errors: {},
    },
    message: {
      label: 'Message',
      hint: 'A few lines about what you have in mind.',
      errors: {
        required: 'Please write a message.',
        tooLong: 'That message is over the maximum length.',
      },
    },
    topicNotSure: 'Not sure',
    submit: 'Send the message',
    submitting: 'Sending…',
    requiredNote: 'Fields marked * are required.',
    requiredMark: '*',
    invalidSummary: 'The message was not sent. Please check the fields marked below.',
  },

  status: {
    failed: 'The message could not be sent. Please try again.',
    unavailable: '',
  },

  expectation: '',

  privacy: '',

  confirmation: {
    heading: 'Your message reached us.',
    body: 'Thank you. We will reply to the email address you left.',
    bodyTopic: 'Thank you. Your message about {topic} reached us.',
    bodyService: 'Thank you. Your message about {service} ({topic}) reached us.',
    home: 'Back to the homepage',
  },
};

const MESSAGES: Readonly<Record<Locale, ContactMessages>> = { ro, en };

export function contactMessages(locale: Locale): ContactMessages {
  return MESSAGES[locale];
}

/* -------------------------------------------------------------------------- */
/* Direct channels — C-4                                                       */
/* -------------------------------------------------------------------------- */

/**
 * The direct contact channels (C-4). **Empty, deliberately.**
 *
 * Same shape and same reasoning as `GlobalFooter.astro`'s `socialLinks`:
 * "social channels are content, not structure", so the structure ships and the
 * list stays empty until Workstream C supplies real values. `ContactMethods`
 * renders nothing at all while this is empty — no heading, no empty slot.
 *
 * Nothing in this repository authorises a value. The address that appears in
 * three approved HiFis (`salut@diverseanumite.ro`) is design-reference filler:
 * `README.md` is explicit that the HiFis are "**not production source code**",
 * and no product, IA or governance document names an inbox, a phone number or a
 * social handle. `CONTACT_PAGE_IA.md` §"Open" still carries "Direct contact
 * channels beyond the form (C-3 content)" as an unresolved dependency.
 *
 * A placeholder here is materially different from a placeholder elsewhere: it
 * is an address a visitor would send a real enquiry to. The form is the primary
 * path (wireframe C-3) and it works without this module, so an absent C-4 costs
 * the page nothing it is responsible for.
 *
 * Locale-parameterised because a channel's LABEL is copy even when its value is
 * not; the signature is ready for the strings, not waiting on a refactor.
 */
export function contactChannels(_locale: Locale): readonly ContactChannel[] {
  return [];
}
