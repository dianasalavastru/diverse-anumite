/**
 * Contact island — prefill application, validation UX, and the submission seam.
 *
 * OWNERSHIP: Workstream A. `TECHNICAL_ARCHITECTURE.md` §5.1 does not list a
 * contact island in its interactive inventory, because that table was written
 * for the four media/browse surfaces; §4 does list `POST /api/contact` as one of
 * the two exceptions to "everything is static", and a static page cannot read a
 * query string or post a form without this file.
 *
 * ── IT IS AN ENHANCEMENT, NOT THE PAGE ────────────────────────────────────
 * Without it the page is still complete and usable: a real `<form>` with a real
 * `action`, native constraint validation, C-2 in its specified neutral state,
 * and every module rendered. §14.0: "No interactive surface may become
 * unreachable when an enhancement API is absent." What this adds is the context
 * acknowledgement, field-associated error messages, and a submission that does
 * not leave the page.
 *
 * ── FOUR RULES IT EXISTS TO KEEP ──────────────────────────────────────────
 *  1. **It never echoes a query parameter.** Everything displayed comes from the
 *     catalogue the page serialized out of the CMS. An unrecognised value
 *     resolves to nothing and the page stays in its neutral state (§23.1).
 *  2. **It never claims a message was sent.** Only a 2xx from the endpoint shows
 *     C-6. No endpoint, a 404 from the static host, or a transport error is a
 *     distinct, honestly-worded state — see `enquiry.ts`.
 *  3. **It never lets state exist only visually.** Every error sets
 *     `aria-invalid` and writes into the field's associated error node; every
 *     outcome reaches the polite status region; focus moves to the first
 *     failure, and to the confirmation when the form is replaced.
 *  4. **It never trusts itself.** Client validation is UX only (§19.3); the
 *     Function re-validates and its refusal is rendered as such.
 *
 * ── NO TURNSTILE HERE ─────────────────────────────────────────────────────
 * Phase 7 owns it, server-side (§19.3). Nothing in this file loads a third-party
 * script, and nothing pretends a challenge was solved.
 */

import {
  ENQUIRY_FIELDS,
  buildPayload,
  classifyResponse,
  hasErrors,
  toFormBody,
  validateEnquiry,
  validateField,
  type EnquiryError,
  type EnquiryErrors,
  type EnquiryField,
  type EnquiryValues,
} from '../../components/contact/enquiry';
import {
  NO_PREFILL,
  resolvePrefill,
  type ContactPrefill,
  type PrefillService,
} from '../../components/contact/prefill';
import type { Locale } from '../../lib/i18n/routes';
import type { Pillar } from '../../lib/content';

/* A module, not a global script — top-level bindings here must not collide with
   the motion runtime's (see focus-carousel.ts for the same note). */
export {};

interface Catalogue {
  services: PrefillService[];
  pillars: Record<Pillar, string>;
}

const root = document.querySelector<HTMLElement>('[data-contact]');
const form = document.querySelector<HTMLFormElement>('[data-contact-form]');

if (root && form) start(root, form);

function start(root: HTMLElement, form: HTMLFormElement): void {
  const locale: Locale = document.documentElement.lang === 'en' ? 'en' : 'ro';
  const catalogue = readCatalogue(root);

  const status = form.querySelector<HTMLElement>('[data-form-status]');
  const submit = form.querySelector<HTMLButtonElement>('[data-submit]');
  const submitLabel = form.querySelector<HTMLElement>('[data-submit-label]');
  const regardingInput = form.querySelector<HTMLInputElement>('[data-regarding]');
  const confirmation = root.querySelector<HTMLElement>('[data-confirmation]');
  const body = root.querySelector<HTMLElement>('.c-body');

  /**
   * The messages, read back off the DOM the page already rendered.
   *
   * The alternative — importing `lib/i18n/contact.ts` — would bundle BOTH
   * locales' copy into the client for a page that renders one, which is the
   * trade `work-archive.ts` also declines ("no message table — and no second
   * locale's copy — is ever bundled into the client"). Every string below was
   * authored in one file and travels on the element that uses it.
   */
  const errorNodes = new Map<EnquiryField, HTMLElement>();
  const controls = new Map<EnquiryField, HTMLInputElement | HTMLTextAreaElement>();

  for (const field of ENQUIRY_FIELDS) {
    const control = form.querySelector<HTMLInputElement | HTMLTextAreaElement>(
      `[data-field="${field}"]`,
    );
    const node = form.querySelector<HTMLElement>(`[data-error-for="${field}"]`);
    if (control) controls.set(field, control);
    if (node) errorNodes.set(field, node);
  }

  const topicSelect = form.querySelector<HTMLSelectElement>('[data-field="topic"]');

  /* ---------------------------------------------------------------------- */
  /* C-2 · the prefill                                                      */
  /* ---------------------------------------------------------------------- */

  const prefill = catalogue
    ? resolvePrefill(location.search, locale, catalogue.services)
    : NO_PREFILL;

  applyPrefill(prefill);

  function applyPrefill(prefill: ContactPrefill): void {
    if (!prefill.topic && !prefill.regarding) return;

    /* The Topic selector is set, not locked: C-4 calls it "the **optional** broad
       Topic selector", and a visitor who arrived from one service but wants to
       ask about another must be able to say so. */
    if (topicSelect && prefill.topic) topicSelect.value = prefill.topic;

    if (regardingInput) regardingInput.value = prefill.regarding?.slug ?? '';

    writeContext(prefill);
  }

  /** Fill C-2's template from authored labels — never from the query string. */
  function writeContext(prefill: ContactPrefill): void {
    const node = root.querySelector<HTMLElement>('[data-context-value]');
    if (!node || !catalogue) return;

    const topicLabel = prefill.topic ? catalogue.pillars[prefill.topic] : '';

    if (prefill.regarding) {
      node.textContent = fill(node.dataset.withService, {
        service: prefill.regarding.name,
        topic: topicLabel,
      });
      return;
    }

    if (prefill.topic) {
      node.textContent = fill(node.dataset.topicOnly, { topic: topicLabel });
    }
  }

  /* ---------------------------------------------------------------------- */
  /* C-3 · validation                                                       */
  /* ---------------------------------------------------------------------- */

  /**
   * Take over from the browser. Until this line runs, native validation is the
   * error layer; after it, every message is associated with its field.
   */
  form.noValidate = true;

  /**
   * Revalidation is opt-in per field: a field is only re-checked while it is
   * already showing an error. WCAG 2.2 AA 3.3.1 asks for errors to be
   * identified, not for them to appear while someone is still typing an address
   * — validating on every keystroke reports "invalid" three characters into an
   * email and reads as the form arguing with the visitor.
   */
  const showing = new Set<EnquiryField>();

  for (const [field, control] of controls) {
    control.addEventListener('blur', () => {
      if (showing.has(field)) revalidate(field);
    });
    control.addEventListener('input', () => {
      if (showing.has(field)) revalidate(field);
    });
  }

  function revalidate(field: EnquiryField): void {
    const control = controls.get(field);
    if (!control) return;
    setFieldError(field, validateField(field, control.value));
  }

  function setFieldError(field: EnquiryField, error: EnquiryError | undefined): void {
    const control = controls.get(field);
    const node = errorNodes.get(field);
    if (!control || !node) return;

    if (!error) {
      showing.delete(field);
      control.removeAttribute('aria-invalid');
      node.textContent = '';
      return;
    }

    showing.add(field);
    control.setAttribute('aria-invalid', 'true');
    /* The message text for every error a field can have is rendered onto the
       error node as data attributes by the form component, in the page's own
       locale. */
    node.textContent = node.dataset[error] ?? '';
  }

  function readValues(): EnquiryValues {
    return {
      name: controls.get('name')?.value ?? '',
      email: controls.get('email')?.value ?? '',
      message: controls.get('message')?.value ?? '',
      topic: topicSelect?.value ?? '',
    };
  }

  function applyErrors(errors: EnquiryErrors): void {
    for (const field of ENQUIRY_FIELDS) setFieldError(field, errors[field]);
  }

  /* ---------------------------------------------------------------------- */
  /* C-3 · submission                                                       */
  /* ---------------------------------------------------------------------- */

  let busy = false;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (busy) return;

    const values = readValues();
    const errors = validateEnquiry(values);
    applyErrors(errors);

    if (hasErrors(errors)) {
      announce(form.dataset.invalidSummary ?? '');
      /* 2.4.3 / 3.3.1 — focus the first failure in DOM order, which is the first
         one a visitor reading down the form would reach. Its label, its invalid
         state and its message are announced together by the focus move. */
      const first = ENQUIRY_FIELDS.find((field) => errors[field]);
      if (first) controls.get(first)?.focus();
      return;
    }

    void send(values);
  });

  async function send(values: EnquiryValues): Promise<void> {
    const endpoint = form.dataset.endpoint;
    if (!endpoint) return;

    setBusy(true);
    announce(submitLabel?.dataset.busy ?? '');

    let outcome: ReturnType<typeof classifyResponse> = 'unavailable';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          Accept: 'application/json',
        },
        body: toFormBody(
          buildPayload(values, { regarding: prefill.regarding, locale }),
        ).toString(),
      });
      outcome = classifyResponse(response.status);
    } catch {
      /* A transport error is indistinguishable, from here, from an endpoint that
         does not exist — and both mean the same thing to the visitor: nothing
         was delivered. Neither is ever reported as sent. */
      outcome = 'unavailable';
    }

    setBusy(false);

    if (outcome === 'sent') {
      complete();
      return;
    }

    announce(outcome === 'failed' ? statusText('failed') : statusText('unavailable'));
  }

  function setBusy(next: boolean): void {
    busy = next;
    form.setAttribute('aria-busy', String(next));
    if (submit) submit.disabled = next;
    if (submitLabel) {
      submitLabel.textContent =
        (next ? submitLabel.dataset.busy : submitLabel.dataset.idle) ?? submitLabel.textContent;
    }
  }

  /**
   * The pre-Phase-7 state.
   *
   * `status.unavailable` is PENDING copy and is empty until Workstream C writes
   * it, so nothing is invented for production. What stands in until then is a
   * developer-facing console warning plus a visible, unmistakably non-production
   * line — it must be impossible to read as "your message was sent", and equally
   * impossible to mistake for authored copy.
   */
  function statusText(kind: 'failed' | 'unavailable'): string {
    const authored = status?.dataset[kind] ?? '';
    if (authored) return authored;

    if (kind === 'unavailable') {
      console.warn(
        `[contact] POST ${form.dataset.endpoint} did not answer. The Pages Function is not ` +
          `wired yet (TECHNICAL_ARCHITECTURE.md §4, §19.3, Phase 7). The message was NOT sent.`,
      );
      return '[dev] The submission endpoint is not connected yet — nothing was sent.';
    }

    console.warn(`[contact] POST ${form.dataset.endpoint} refused the submission.`);
    return '[dev] The submission was refused by the endpoint — nothing was sent.';
  }

  function announce(message: string): void {
    if (!status) return;
    status.textContent = message;
  }

  /* ---------------------------------------------------------------------- */
  /* C-6 · completion                                                       */
  /* ---------------------------------------------------------------------- */

  /**
   * Reached only on a 2xx. The form and the secondary region are removed from
   * the page — not merely hidden behind the confirmation — so nothing that was
   * part of the completed act stays keyboard-reachable behind the receipt.
   */
  function complete(): void {
    if (!confirmation) return;

    writeConfirmation();

    if (body) body.hidden = true;
    confirmation.hidden = false;
    confirmation.focus();
    announce('');
  }

  function writeConfirmation(): void {
    const node = confirmation?.querySelector<HTMLElement>('[data-confirmation-body]');
    if (!node || !catalogue) return;

    const topicLabel = prefill.topic ? catalogue.pillars[prefill.topic] : '';

    if (prefill.regarding) {
      node.textContent = fill(node.dataset.service, {
        service: prefill.regarding.name,
        topic: topicLabel,
      });
      return;
    }

    if (prefill.topic) {
      node.textContent = fill(node.dataset.topic, { topic: topicLabel });
    }
    /* No prefill: the plain receipt the server already rendered stands. */
  }
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Parse the catalogue the page serialized.
 *
 * A malformed attribute yields `null` and the page keeps its neutral C-2 and its
 * working form — the prefill is an enhancement of an enhancement, and losing it
 * must not cost anyone the ability to send a message.
 */
function readCatalogue(root: HTMLElement): Catalogue | null {
  const raw = root.dataset.prefill;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Catalogue;
    return Array.isArray(parsed.services) && parsed.pillars ? parsed : null;
  } catch {
    return null;
  }
}

/** Substitute `{name}` placeholders in an authored template. */
function fill(template: string | undefined, values: Record<string, string>): string {
  if (!template) return '';
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}
