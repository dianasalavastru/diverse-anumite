/**
 * Whether the Contact page offers the enquiry form (C-3) at all.
 *
 * OFF for the initial launch. The form posts to `POST /api/contact`
 * (`enquiry.ts`, TECHNICAL_ARCHITECTURE.md §4, §19.3, Phase 7), and none of the
 * three things behind that endpoint exists yet: there is no Pages Function, no
 * Turnstile verification and no Resend delivery. A form whose every submission
 * goes nowhere is worse than no form, so the page ships without one.
 *
 * ENABLE ONLY WHEN the `/api/contact` Pages Function, its Turnstile
 * verification AND its Resend delivery all exist and have been exercised
 * end-to-end against the deployed site.
 *
 * What `false` does (`ContactPage.astro`):
 *   · C-3 (`EnquiryForm`), C-2 (`ContextSummary`, "Ne scrieți despre …"), the
 *     topic index (`ContactTopics`) and C-6 (`ConfirmationState`) are not
 *     rendered — all four exist only to frame, prefill or acknowledge a
 *     submission;
 *   · the contact island is not rendered onto the page (`ContactIsland.astro`),
 *     so no `<script>` for it is emitted and nothing reads `?topic=` /
 *     `?regarding=`. Links that carry those parameters still land on a working
 *     page — the parameters are simply ignored;
 *   · C-4 (direct channels) and C-5 (response expectation) still render the
 *     moment they carry confirmed values — today both are empty, so neither
 *     appears (`lib/i18n/contact.ts`);
 *   · while `contactChannels()` is also empty, C-1 and the meta description use
 *     the no-channel copy (`copy.closed` in `lib/i18n/contact.ts`) instead of the
 *     form-enabled invitation, and the hubs' H-6 prefill note is not rendered
 *     (`pillar-hub/Conversation.astro`).
 *
 * Flipping this to `true` restores the full composition exactly as it was.
 */
export const ENQUIRY_FORM_ENABLED = false;
