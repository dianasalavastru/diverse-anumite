/**
 * The enquiry form's field contract and its submission seam.
 *
 * OWNERSHIP: Workstream A (frontend). This file is the FRONTEND HALF of a
 * boundary whose other half is not built: the Cloudflare Pages Function at
 * `POST /api/contact` (TECHNICAL_ARCHITECTURE.md §4, §19.3, Phase 7).
 *
 * ── THE ONE RULE THIS FILE EXISTS TO KEEP ──────────────────────────────────
 * §19.3: "Server-side validation and constraint in the Function: length caps,
 * type checks, email format, required fields. **Client-side validation is UX
 * only and is never trusted.**"
 *
 * So nothing here is a security control. `validateEnquiry` exists to tell a
 * visitor what to fix before a round trip, and the caps below are the client's
 * copy of limits the Function must enforce independently. If the two ever
 * disagree, the Function wins and the visitor sees its error — which is why the
 * submission path renders a server-supplied failure rather than assuming its own
 * check was sufficient.
 *
 * ── THE FIELD SET IS FROZEN AND SMALL ──────────────────────────────────────
 * IA Step 7: "One simple form (name, email, message) + one **optional broad
 * topic selector** (Architecture & Design / Reality Capture / Not sure)" and
 * "**Two contextual prefills, not extra fields**". `CONTACT_PAGE_IA.md` C-4
 * repeats it with the prohibition attached: "**No per-service field
 * expansion** — details are qualified in follow-up (Step 7)." Adding a field
 * here — a phone number, a budget, a deadline — is an IA change, not an
 * implementation one.
 *
 * ── NO TRANSPORT, NO DOM ───────────────────────────────────────────────────
 * Pure functions and constants only, so the island's behaviour is unit-testable
 * without a browser and the same shapes are readable from the composition.
 */

import type { Pillar } from '../../lib/content';
import type { PrefillService } from './prefill';

/* -------------------------------------------------------------------------- */
/* The endpoint                                                                */
/* -------------------------------------------------------------------------- */

/**
 * The submission target. Named once, here.
 *
 * TECHNICAL_ARCHITECTURE.md §4 draws it into the architecture diagram as
 * `POST /api/contact` → "(Pages Function)" → "Turnstile verify" → "Resend ──►
 * one inbox", and §3 lists it as one of the "**Two exceptions to 'everything is
 * static'**".
 *
 * **It does not exist yet.** Phase 7 builds it. Until then every submission
 * resolves to the `unavailable` outcome below — never to `sent`.
 */
export const ENQUIRY_ENDPOINT = '/api/contact';

/* -------------------------------------------------------------------------- */
/* Field constraints                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Length caps, mirrored from what §19.3 requires the Function to enforce.
 *
 * `email` is 254 because that is the maximum length of an addressable mailbox
 * (RFC 5321's 256-octet path minus the angle brackets) — a real limit rather
 * than a chosen one. `name` and `message` are engineering caps with no upstream
 * authority: they bound the payload without being reachable by a person writing
 * an honest enquiry, and they are stated here so the Function can adopt the same
 * numbers rather than pick its own.
 *
 * There is deliberately **no minimum length** beyond "not empty". A rule that
 * rejects a short message ("Can you scan a 1920s stairwell?") would be the form
 * refusing the exact frictionless start C-3 is responsible for.
 */
export const FIELD_LIMITS = {
  name: 100,
  email: 254,
  message: 4000,
} as const;

/** The broad Topic selector's option values. IA Step 7's three, in its order. */
export const TOPIC_NOT_SURE = 'not-sure';
export type TopicChoice = Pillar | typeof TOPIC_NOT_SURE;
export const TOPIC_CHOICES = [
  'architecture-design',
  'reality-capture',
  TOPIC_NOT_SURE,
] as const satisfies readonly TopicChoice[];

export function isTopicChoice(value: string): value is TopicChoice {
  return (TOPIC_CHOICES as readonly string[]).includes(value);
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                  */
/* -------------------------------------------------------------------------- */

export type EnquiryField = 'name' | 'email' | 'message';
export const ENQUIRY_FIELDS = ['name', 'email', 'message'] as const satisfies readonly EnquiryField[];

/** Error identifiers, not messages. The strings live in `lib/i18n/contact.ts`. */
export type EnquiryError = 'required' | 'invalid' | 'tooLong';

export interface EnquiryValues {
  readonly name: string;
  readonly email: string;
  readonly message: string;
  readonly topic: string;
}

export type EnquiryErrors = Partial<Record<EnquiryField, EnquiryError>>;

/**
 * A deliberately permissive shape check: one `@`, something either side, a dot
 * in the domain. It is not an RFC 5322 parser and must not become one — the only
 * authority on whether an address is real is the mail that reaches it, and a
 * stricter client-side pattern rejects valid addresses far more often than it
 * catches invalid ones. The browser's own `type="email"` check is roughly this,
 * and the Function re-checks server-side (§19.3).
 */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validate one field. Returns `undefined` when the value is acceptable. */
export function validateField(field: EnquiryField, raw: string): EnquiryError | undefined {
  const value = raw.trim();

  if (!value) return 'required';
  if (value.length > FIELD_LIMITS[field]) return 'tooLong';
  if (field === 'email' && !EMAIL_SHAPE.test(value)) return 'invalid';

  return undefined;
}

/**
 * Validate the whole form, in DOM order.
 *
 * Order matters for accessibility, not for logic: WCAG 2.2 AA 3.3.1 requires the
 * error to be identified, and the island moves focus to the FIRST field in this
 * order that failed, which is the first one a visitor reading down the form
 * would reach.
 *
 * The Topic selector is never validated. It is optional (IA Step 7) and it is a
 * closed `<select>` — its value is one of `TOPIC_CHOICES` or the control was
 * tampered with, and `buildPayload` drops anything else rather than reporting it.
 */
export function validateEnquiry(values: EnquiryValues): EnquiryErrors {
  const errors: EnquiryErrors = {};

  for (const field of ENQUIRY_FIELDS) {
    const error = validateField(field, values[field]);
    if (error) errors[field] = error;
  }

  return errors;
}

export function hasErrors(errors: EnquiryErrors): boolean {
  return ENQUIRY_FIELDS.some((field) => errors[field] !== undefined);
}

/* -------------------------------------------------------------------------- */
/* The payload                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * What `POST /api/contact` receives.
 *
 * `topic` and `regarding` are **machine values** — a Pillar identifier and a
 * localized Service slug, both already validated against the frozen vocabularies
 * by the time they get here. §19.3 requires exactly that: "the subject carries
 * Topic/Regarding routing values only, never visitor-supplied text", because
 * Resend retains subject lines. The Function composes the subject from these two
 * fields; the client composes no subject at all.
 *
 * `locale` travels so the Function can reply — and route — in the language the
 * enquiry was written in. It is read from `<html lang>`, not from the URL.
 */
export interface EnquiryPayload {
  readonly name: string;
  readonly email: string;
  readonly message: string;
  readonly topic: Pillar | null;
  readonly regarding: string | null;
  readonly locale: string;
}

/**
 * Build the payload from validated values plus the resolved prefill.
 *
 * The Service slug comes from the resolved `PrefillService` — the object the
 * prefill layer matched against the CMS — and never from the raw query string.
 * An unrecognised `?regarding=` has already become `null` by this point, so the
 * §23.1 rule ("an unrecognised value is ignored rather than echoed") holds all
 * the way to the wire, not just to the screen.
 */
export function buildPayload(
  values: EnquiryValues,
  context: { readonly regarding: PrefillService | null; readonly locale: string },
): EnquiryPayload {
  const topic = isTopicChoice(values.topic) && values.topic !== TOPIC_NOT_SURE ? values.topic : null;

  return {
    name: values.name.trim(),
    email: values.email.trim(),
    message: values.message.trim(),
    topic: context.regarding ? context.regarding.pillar : topic,
    regarding: context.regarding ? context.regarding.slug : null,
    locale: context.locale,
  };
}

/**
 * The payload as a URL-encoded body.
 *
 * The enhanced path sends the SAME content type as the no-JS `<form>` POST, so
 * the Function parses one format and the two paths cannot diverge in what the
 * inbox receives. The island adds `Accept: application/json` so the Function can
 * still answer the two callers differently — JSON to the island, a redirect or a
 * rendered page to the native POST — which is a response-side decision Phase 7
 * owns and this file does not pre-empt.
 *
 * A `null` topic or regarding is OMITTED rather than sent as the string
 * "null" — an absent key is unambiguous on the other side.
 */
export function toFormBody(payload: EnquiryPayload): URLSearchParams {
  const body = new URLSearchParams();

  body.set('name', payload.name);
  body.set('email', payload.email);
  body.set('message', payload.message);
  body.set('locale', payload.locale);
  if (payload.topic) body.set('topic', payload.topic);
  if (payload.regarding) body.set('regarding', payload.regarding);

  return body;
}

/* -------------------------------------------------------------------------- */
/* Submission outcomes                                                         */
/* -------------------------------------------------------------------------- */

/**
 * The three ways a submission can end.
 *
 *   sent        — the endpoint accepted it. The ONLY state that shows C-6.
 *   failed      — the endpoint answered and refused (validation, rate limit,
 *                 Turnstile). The visitor may correct and retry.
 *   unavailable — nothing answered: no endpoint, a 404/405 from the static
 *                 host, or a transport error.
 *
 * `unavailable` is a separate state from `failed` on purpose. Before Phase 7
 * wires the Function, EVERY submission lands here, and the one thing the page
 * may never do is imply a message was delivered when no server ever saw it.
 * Collapsing it into `failed` would produce "please try again" forever; showing
 * C-6 would be a lie. It is announced as what it is — the endpoint is not
 * connected — and the visitor's text is left untouched in the form.
 */
export type SubmissionOutcome = 'sent' | 'failed' | 'unavailable';

/**
 * Classify a fetch result.
 *
 * A 404 or 405 means the route does not exist on a static host, which is the
 * pre-Phase-7 world, not a rejected enquiry. A 5xx means the Function is there
 * and broken — also "not delivered, not the visitor's fault", so it reads as
 * unavailable rather than asking someone to fix a message that was fine.
 */
export function classifyResponse(status: number): SubmissionOutcome {
  if (status >= 200 && status < 300) return 'sent';
  if (status === 404 || status === 405 || status === 501) return 'unavailable';
  if (status >= 500) return 'unavailable';
  return 'failed';
}
