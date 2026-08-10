# Contact Wireframe — low-fidelity structural specification

**The canonical structural wireframe for the Contact page** — the site's architectural convergence point, expressed **spatially** and nothing more. It introduces **no new IA, no new Page IA, no new components, and no new visual direction.**

**The Contact page is where accumulated understanding becomes a professional conversation.** It is not a generic contact form. By the time a visitor arrives, the journey is already complete — they understand the practice, a capability, or a service, and they have decided to reach out. The page's job is therefore **not to restart the sales process or re-explain services**, but to **acknowledge the context already built** and let the visitor begin the conversation with minimal effort and complete confidence.

Level: **Low-Fidelity Wireframe**. Status: **authoritative**.

> **Governance note (Decision Log Batch 20, 2026-08-10):** Visual language is now governed by `VISUAL_DIRECTION_v2.0.md` (“measured reality”). Any reference to `VISUAL_DIRECTION.md` below is the **superseded** v1 direction (“architectural publication”); this document remains **structurally authoritative**.

Derived exclusively from: `CONTACT_PAGE_IA.md`, `PAGE_IA_INDEX.md`, `COMPONENT_INVENTORY.md`, `WIREFRAMING_GUIDELINES.md`, `VISUAL_DIRECTION.md`, `CONTENT_MODEL.md`.

**Inherits (applies, does not restate):** Central Design Principle · Narrative Density · Visual Emphasis Hierarchy · Spatial-Composition terminology · editorial pacing · responsive principles.

**Notation.** "Above / below / beside" describe reading order and relative emphasis, never pixel positions.

---

## Persistent frame (inherited)

- **Global Header** — persistent Layer-2 nav, unchanged. Contact has the widest inbound of any page: a Service (with prefills), a Hub, a Work Entry, the Archive, the Homepage, global nav, or search.
- **Footer** — the global footer (also carries EU-funding acknowledgment + About-context, per Step 7).

---

## C-1 · Contact orientation *(Page IA Stage A) — confirm this is where the conversation begins*

**Responsibility realized:** confirm the visitor is in the right place to start a conversation, calmly and without a sales opening.

**Components (Inventory):** Section Header (page intent) · Breadcrumb (parent context — orientation).

**Spatial composition:** a quiet, welcoming opening — a single clear statement that this is where to begin, no hero pitch, no re-explanation of what the practice does. The interface is calm and uncluttered; the tone is *"let's talk,"* not *"let me convince you."*

**Reading intent:** the visitor knows *this is where, and how, the conversation starts.*

**Transition:** oriented, the visitor is shown that their context carried over.

**Responsive intent:** the opening collapses to a single-line statement; orientation remains first.

---

## C-2 · Context summary — Topic / Regarding *(Page IA Stage B) — the page's signature responsibility*

**Responsibility realized:** show the visitor that the architecture already knows why they are here — **continuity of context**, the page's most distinctive job.

**Components (Inventory):** Context Summary Block (echoes the **Topic** = pillar and **Regarding** = originating Service).

**Spatial composition:** a calm, reassuring acknowledgement placed **before** the form — *"You're reaching out about [Service], within [Pillar]."* Understated, never a banner or a sell. When no context carried over, it degrades gracefully to the neutral broad-Topic framing (default **"Not sure"**), never an empty or awkward slot.

**Reading intent:** the visitor understands *the site has understood why I'm here — I won't have to repeat myself.*

**Transition:** reassured that context carried, the visitor moves to the form with the work already half-done.

**Responsive intent:** the summary stacks directly above the form; remains quiet and legible.

---

## C-3 · Enquiry form *(Page IA Stage C) — the single, obvious path to begin*

**Responsibility realized:** frictionless initiation — the **one simple form**, context prefilled, details deferred to follow-up.

**Components (Inventory):** Enquiry Form (name · email · message + optional broad **Topic** selector: Architecture & Design / Reality Capture / Not sure — Topic/Regarding prefilled from C-2).

**Spatial composition:** the **primary action of the page and its visual center of gravity** — a short, unintimidating form with generous spacing and no field expansion per service (qualification happens in follow-up, Step 7). **Minimal cognitive effort:** the fewest fields that still start a real conversation. One obvious primary button; no competing calls to action.

**Reading intent:** the visitor understands *exactly what little I need to provide to begin.*

**Transition:** with the form in front of them, the visitor wants to know what happens after they send it.

**Responsive intent:** the form stacks to full width; the primary button stays obvious and reachable.

---

## C-4 · Contact methods *(Page IA Stage A/C) — alternatives, without diluting the primary path*

**Responsibility realized:** offer any direct channels (email and similar) for visitors who prefer them — beside, not competing with, the form.

**Components (Inventory):** Contact Methods Block (direct channels).

**Spatial composition:** a quiet, secondary affordance placed alongside or beneath the form. Present for choice and accessibility; **never loud enough to fragment the single obvious path.** The form remains primary.

**Reading intent:** the visitor knows *there's another way to reach out if I prefer.*

**Transition:** with the how settled, the visitor is reassured about what follows.

**Responsive intent:** methods stack below the form; remain secondary.

---

## C-5 · Expectations / response *(Page IA Stage D) — calm reassurance, remove uncertainty*

**Responsibility realized:** remove post-submission uncertainty by stating what happens next (how, and roughly when a reply comes).

**Components (Inventory):** Rich Text (response expectation).

**Spatial composition:** a short, reassuring statement near the form — *"You'll hear back within [timeframe]."* **No artificial urgency, no persuasion, no countdown** — only calm, honest expectation-setting. Its purpose is confidence, not pressure.

**Reading intent:** the visitor understands *what will happen after I send this — so I can act without hesitation.*

**Transition:** confident about the outcome, the visitor sends the enquiry → completion.

**Responsive intent:** stacks near the form; remains brief and calm.

---

## C-6 · Completion / confirmation *(Page IA Stage E) — close the loop cleanly*

**Responsibility realized:** confirm receipt and that the enquiry reached the right context; close the loop without scattering the visitor.

**Components (Inventory):** Confirmation State (echoes Topic/Regarding) · CTA Group (**optional**, light — Hub or Homepage).

**Spatial composition:** a clean confirmation that echoes the context — *"Your enquiry about [Service] has been received."* **Avoid forced onward navigation:** the goal was reached; any return links are optional and quiet. Calm closure, not a new funnel.

**Reading intent:** the visitor knows *it worked, and it reached the right person with the right context.*

**Transition:** into the persistent footer (or an optional, quiet return).

**Responsive intent:** confirmation stacks; optional links remain light and secondary.

---

## Central idea — understanding becomes conversation

Contact sits at the **conversation** step of the journey — the convergence point where every path (Homepage → Hub → Service, Archive → Work Entry → Service, and their shortcuts) finally meets. Everything on the page reinforces that **the visitor has already completed the journey.** The page therefore **acknowledges** context rather than rebuilding it: it does not explain services (that was the Service page), present work (the Archive / Work Entry), or tell the practice story (About). Consistent with the whole architecture — *understanding before persuasion* — Contact **enables action rather than persuading anyone to act.**

## Editorial rhythm

The Homepage introduces; the Hub expands; the Service resolves; the Archive lets discover; the Work Entry lets evaluate; **Contact lets converse.** It should feel: **welcoming · effortless · reassuring · contextual · calm — never a funnel, never a pitch.** The visitor should leave the page having *started a relationship,* not *submitted a form.*

## Reading progression

**Orientation → context acknowledged → the simple ask → alternatives → what happens next → clean confirmation**

Each stage removes a reason to hesitate:
- **Orientation** (C-1) — *am I in the right place?* (yes, calmly)
- **Context acknowledged** (C-2) — *do they know why I'm here?* (continuity — the signature moment)
- **The simple ask** (C-3) — *what must I do?* (a single, obvious, low-effort path)
- **Alternatives** (C-4) — *is there another way?* (present, secondary)
- **What happens next** (C-5) — *what follows?* (calm reassurance, no urgency)
- **Clean confirmation** (C-6) — *did it work?* (yes, and it reached the right context)

By the end, the visitor has begun a **relevant, contextual conversation** with minimal effort and complete confidence.

## Continuity principle

**The architecture should never ask the visitor to repeat what it already knows.** Context accumulated upstream (Topic + Regarding) is carried forward and *acknowledged*, reducing both effort and doubt. Continuity is what turns a generic contact form into a professional conversation — it signals that the practice was already listening. When no context exists, the page degrades gracefully to a calm, neutral default rather than a broken or empty acknowledgement.

## Calm principle

**Confidence comes from removing uncertainty, not from adding pressure.** The page carries no artificial urgency, no persuasion, no competing calls to action — only clarity about the next step and reassurance about what follows. A single obvious path, calmly presented, converts better here than any funnel would, because the decision was already made upstream.

## Visual emphasis hierarchy (contact-specific application)

Contact's dominant idea is **the single, effortless step forward.** Concentration points:

1. **The enquiry form** (C-3) — the primary action and visual center of gravity
2. **Context acknowledgement** (C-2) — the reassurance that makes the form feel effortless
3. **Response expectation** (C-5) — the calm that removes the last hesitation

Everything else (C-1 orientation, C-4 alternative channels, C-6 confirmation, header, footer) supports the single step rather than competing with it. Nothing on the page is loud.

## Narrative density
Follows the system-wide convention — one idea per module; split rather than compress. No contact-specific exception.

---

## Validation

- **Responsibilities preserved:** C-1…C-6 each realize exactly their Contact Page IA responsibility; none moved ✔.
- **Approved components only:** Section Header · Breadcrumb · Context Summary Block · Enquiry Form · Contact Methods Block · Rich Text · Confirmation State · CTA Group · Global Header · Footer ✔ (no components invented).
- **One responsibility per module** ✔.
- **Central idea (conversation)** — every module reinforces that the journey is already complete; the page acknowledges context rather than rebuilding it ✔.
- **Continuity of context** — Topic + Regarding echoed before the form (C-2); graceful "Not sure" default when absent ✔.
- **Single simple form** — name · email · message + optional Topic selector; no per-service field expansion (Step 7) ✔.
- **Single obvious path** — one primary action; alternatives (C-4) kept secondary ✔.
- **Minimal cognitive effort** — fewest fields; context prefilled; details deferred to follow-up ✔.
- **Calm reassurance, no artificial urgency** — C-5 sets expectations without pressure; no persuasion anywhere ✔.
- **Enables action, does not persuade** — explains nothing, browses nothing, sells nothing (Page IA §1) ✔.
- **Clean completion** — confirmation echoes context; no forced onward navigation (C-6) ✔.
- **Central Design Principle** — the interface is a quiet frame; the visitor's intent is the protagonist ✔.
- **Visual emphasis hierarchy** declared (the single effortless step is the center) ✔.
- **Responsive intent preserved** ✔.
- **No architectural decisions introduced** ✔.

**Result:** the canonical Contact wireframe — the convergence point where accumulated understanding becomes a professional conversation, honouring the context the visitor already built and offering a single, calm, effortless path to begin.
