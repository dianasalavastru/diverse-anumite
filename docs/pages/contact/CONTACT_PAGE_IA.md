# Contact Page IA — authoritative blueprint

The Contact Page defined as an **information-architecture object** — the **architectural convergence point** of the site, and the only page whose primary responsibility is **conversion**. Consistent with the philosophy of the whole architecture (*understanding before persuasion*), it **enables action** rather than persuading visitors to act. By design, this is the **simplest** blueprint of the set: it converts accumulated understanding into action, adding no new persuasion, explanation, or browsing responsibilities.

Authoritative inputs (do not reopen or reinterpret): `HOMEPAGE_PAGE_IA.md`, `HUB_PAGE_IA.md`, `SERVICE_PAGE_IA.md`, `WORK_ENTRY_PAGE_IA.md`, `WORK_ARCHIVE_PAGE_IA.md`, `INFORMATION_ARCHITECTURE.md`, `CONTENT_MODEL.md` (frozen v2.1), `NAV_DECISION_RECORD.md`, `ARCHITECTURE_REVIEW_02.md`, `DECISIONS_LOG.md`.

Level: Page IA (not UI). No wireframes, layout, or styling. **Why precedes what.** Status: authoritative (2026-07-30).

**Arrival assumption.** Visitors arrive after reading a Service, after exploring Work, directly from search, or through global navigation. The page should **preserve the context accumulated during their journey** wherever possible. The **Topic / Regarding prefills are first-class architectural concepts**, not implementation details.

---

## 1. Contact responsibility

**Primary purpose:** help visitors **confidently initiate a relevant conversation.** Its job is **not to convince people to contact** — it is to make contacting **clear, contextual, frictionless, and appropriately routed.** **Success = the successful initiation of a *relevant* enquiry, not generic form submissions.**

**User questions it answers**
- How do I contact you?
- What should I contact you about?
- Have you understood why I'm here?
- Will my enquiry reach the right context?
- What happens next?

**What it intentionally does NOT do** (these belong elsewhere)
- Does not explain services — **that's the Service page.**
- Does not present portfolio work — **that's the Archive / Work Entry.**
- Does not tell the practice story — **that's About.**
- Does not persuade — **it enables action, not persuasion.**
- Does not become a marketing landing page.

**Relationship to the rest of the architecture** — every major journey converges here:
- **Homepage → Hub → Service → Contact**
- **Archive → Work Entry → Service → Contact**
- **Work Entry → Contact** · **Hub → Contact**

The Contact Page is the **architectural convergence point**, feeding **one inbox**; detailed qualification (e.g. a scanning brief) happens in **follow-up**, not by front-loading the form (Step 7).

---

## 2. Information flow (sequence of visitor understanding)

Stages of understanding, not visual layout. Kept deliberately minimal.

**Stage A — Orientation.**
- *Understand:* this is where I start a conversation, and how.
- *Why:* confirm the visitor is in the right place to act.
- *Hands next:* into context confirmation.

**Stage B — Context confirmation.**
- *Understand:* the site already knows why I'm here (my Topic, and the Service I was Regarding).
- *Why:* reassure the visitor that context carried over — reducing effort and repetition; this is the page's most distinctive job.
- *Hands next:* into providing the enquiry.

**Stage C — Provide enquiry.**
- *Understand:* what little I need to give to start the conversation.
- *Why:* frictionless initiation — a simple form, context prefilled, details deferred to follow-up.
- *Hands next:* into expectation setting.

**Stage D — Expectation setting.**
- *Understand:* what happens next (how and roughly when a reply comes).
- *Why:* remove post-submission uncertainty — confidence to act.
- *Hands next:* into completion.

**Stage E — Completion.**
- *Understand:* the enquiry was received, and it reached the right context.
- *Why:* close the loop cleanly.
- *Hands next:* confirmation (and, optionally, back to the Hub or Homepage).

*(Persistent Layer-2 global nav + footer are inherited, not a contact-specific stage.)*

---

## 3. Module inventory (each owns exactly one responsibility)

**C-1 · Contact orientation module** *(Stage A)*
- *Why:* confirm this is where to start a conversation.
- *Question:* how do I contact you?
- *Consumes:* none.
- *Destinations:* none (orientation).
- *Dependencies:* none.

**C-2 · Context summary module (Topic / Regarding)** *(Stage B)*
- *Why:* show the visitor their context carried over — the page's signature responsibility.
- *Question:* have you understood why I'm here?
- *Consumes:* the **Topic** prefill (pillar) and the **Regarding** prefill (the exact originating Service), passed from the source page.
- *Destinations:* none (it frames the enquiry).
- *Dependencies:* the prefill values (see prefill sources below). When absent, the broad Topic selector defaults to "Not sure."

**C-3 · Contact methods module** *(Stage A/C)*
- *Why:* offer the ways to reach the practice (form + any direct channels).
- *Question:* how do I contact you (beyond the form)?
- *Consumes:* contact channels.
- *Destinations:* the chosen channel.
- *Dependencies:* contact details.

**C-4 · Enquiry form module** *(Stage C)*
- *Why:* frictionless initiation — the single simple form.
- *Question:* what should I provide?
- *Consumes:* name, email, message + the **optional broad Topic selector** (Architecture & Design / Reality Capture / Not sure), with Topic/Regarding prefilled from C-2. **No per-service field expansion** — details are qualified in follow-up (Step 7).
- *Destinations:* submission → **one inbox** (context-tagged).
- *Dependencies:* one inbox; prefill values.

**C-5 · Expectations / response module** *(Stage D)*
- *Why:* remove post-submission uncertainty.
- *Question:* what happens next?
- *Consumes:* the response process (how/roughly when).
- *Destinations:* none.
- *Dependencies:* a stated response expectation.

**C-6 · Completion / next-steps module** *(Stage E)*
- *Why:* confirm receipt and close the loop cleanly.
- *Question:* did it work, and did it reach the right context?
- *Consumes:* submission confirmation (echoing Topic/Regarding).
- *Destinations:* confirmation; **optional** Hub or Homepage. **Avoid unnecessary onward navigation after a successful submission.**
- *Dependencies:* submission handling.

*(Persistent global nav + footer are inherited, not contact-specific modules.)*

### Prefill sources (Topic / Regarding as first-class concepts)
- **From a Service page →** Topic = pillar, **Regarding = that service.**
- **From a Hub →** Topic = pillar (no Regarding).
- **From a Work Entry →** Topic = pillar; Regarding = the demonstrated service where applicable.
- **From the Archive / Homepage / global nav / search →** no prefill; the broad Topic selector defaults to "Not sure."

---

## 4. Navigation integration

**Inbound paths** — Homepage; Hub; Service (primary, with prefills); Work Entry; Archive; global navigation; search.

**Outbound paths**
- **→ Confirmation** (the primary post-submission state).
- **→ optional Hub** and **→ optional Homepage.**
- **Avoid unnecessary onward navigation after a successful submission** — the goal was reached; don't scatter the visitor.

**Canonical-intent split (anti-cannibalization):** Contact = **initiate a conversation**; every other page routes *to* it and none of them hosts the inbox. The Contact Page owns conversion intent and adds none of the explaining, browsing, or storytelling done upstream.

### Architectural principles (reinforced)
- **Context should reduce effort;** prefills reduce repetition.
- **Visitors should never need to repeat information the architecture already knows.**
- **Contact is contextual, never generic.**
- **The page enables conversations rather than collecting submissions.**

---

## 5. Success criteria (Page-IA, not aesthetic)

Visitors should:
- **understand how to make contact;**
- **understand what information to provide;**
- **understand what happens next;**
- **never lose the context accumulated during their journey** (Topic/Regarding carried through);
- **successfully initiate an appropriately contextual enquiry.**

**The page should succeed because it removes uncertainty, not because it increases persuasion.**

**Concrete pass/fail tests**
- A visitor arriving from a Service reaches Contact with **Topic + Regarding already set**, and never re-enters that context.
- The form is the **single simple form** (name, email, message + optional Topic selector); no per-service field expansion.
- Every submission is **context-tagged** and reaches **one inbox.**
- Post-submission, the visitor gets a **clean confirmation** with no forced onward navigation.
- The page **explains nothing, browses nothing, and persuades nothing** — it only enables the enquiry.

---

## Evolution rule
Future **communication methods** should **extend the Contact Page without changing its primary responsibility.** New channels should **improve accessibility and convenience** — not introduce additional marketing or navigation responsibilities.

## System coherence — the architecture as one continuous language
- **Homepage →** understand the practice.
- **Hub →** understand a capability.
- **Service →** understand a solution.
- **Work Archive →** confidently explore evidence.
- **Work Entry →** independently assess evidence.
- **Contact →** confidently initiate a relevant conversation.

Together, the six Page IA blueprints form **one complete information-architecture language**: every page has a single responsibility, every transition is intentional, and every journey is built around **understanding before persuasion** — with Contact as the point where accumulated understanding becomes action.

## Open (carried into wireframing / dependencies)
Direct contact channels beyond the form (C-3 content); the stated response-time expectation (C-5 content); whether the confirmation echoes the full context inline. The Contact Page depends on the Topic/Regarding prefill contract being honoured by upstream pages (Service, Hub, Work Entry) — already specified in their blueprints.
