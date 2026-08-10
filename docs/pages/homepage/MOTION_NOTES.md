# MOTION_NOTES — Homepage animated prototype

**Companion to `homepage-measured-reality-animated.html`.** Documents the motion layer added on top of the static HiFi, and records the two carousel focus prototypes (A and B) so they can be compared. Validation prototype, not production.

**Source of truth.** The static `homepage-measured-reality(-photo).html` is unchanged in IA, order, layout, typography, spacing, colour, hierarchy, carousel concept, identity, and responsive structure. The animated file adds *only* a motion layer — plus one intentional composition change requested separately: the **hero wordmark** (below).

**No library.** Everything is CSS transitions + keyframes, `IntersectionObserver` for scroll reveals, and a single `requestAnimationFrame` loop for the point cloud (which already existed). A library (GSAP, Framer, Lenis, etc.) was considered and rejected: the required effects — typed reveals, a load sequence, a scan/clip hero, focus-carousel transitions — are all achievable cleanly with the platform, and a dependency would add weight, lock-in, and removal cost for zero benefit at this fidelity. The layer is isolated and easy to delete or revise.

## Timing & easing tokens

Defined once as CSS custom properties and reused everywhere:

- `--t-micro: .18s` — hover / press micro-interactions
- `--t-state: .36s` — state transitions (focus, hover reveals)
- `--t-rev: .66s` — content reveals
- `--t-major: 1s` — hero scan, carousel focus transition
- `--ease: cubic-bezier(.2,0,0,1)` — smooth acceleration/deceleration, **no overshoot or bounce** (reused from the base file)

## Motion functions → where they appear

Every animation serves at least one of the six required functions:

- **Reveal** — the typed scroll-reveal family; the load sequence; metadata resolving on focus.
- **Focus** — the carousel focus state (scale up + full contrast + blue marker), adjacent items made quieter.
- **Measure** — the hero scan bar, hero baseline + coordinate resolve, the carousel scan line, the point-cloud blue scan points, the coordinate index.
- **Assemble** — the point cloud builds in from 0→full density on first view; the hero wordmark is scanned into existence.
- **Transition** — header settle-to-solid; slow eased scroll on carousel controls; state changes share one easing family.
- **Discover** — hover/focus reveals; drag-to-inspect on the point cloud and the carousels; focus-carousel exploration.

## The hero wordmark (intentional composition change)

The `diverse anumite` pixel wordmark now appears **inside the landing composition** as an editorial graphic in electric blue, not merely as a nav logo (the nav logo remains). It is anchored to the measured layout grid, paired with the hero image (a band sitting behind the middle of the word, showing through the letter gaps), and annotated with technical markers — a blue baseline dimension and a coordinate label. On load it is **measured into existence**: a blue scan bar sweeps left→right while the wordmark clip-reveals with it and the image resolves behind it; then the baseline draws and the coordinates resolve. It answers "who is this studio?" before any project appears, and it is the homepage's second signature moment after the carousel. Reduced-motion shows it immediately, fully composed.

## Load sequence (non-blocking)

`markers → hero wordmark + image → supporting copy → navigation`. Driven by an `html.anim-load` class set before paint and an `html.anim-ready` class added on the second animation frame; the whole page is present and usable throughout — only opacity/clip/width transition in, so nothing blocks access. Total staged duration ≈ 1.1s. Skipped entirely under reduced-motion.

## Reveal family (not uniform fade-up)

`.rv` elements are typed by content and revealed once:
- **head** (headings) — a vertical clip/mask reveal.
- **img** (image blocks, carousels, curated blocks) — a left→right clip wipe (a "scan" in).
- **meta** (eyebrows, captions, metadata, controls) — opacity + a small rise, slightly delayed so it arrives after its heading/image.
Stagger comes from per-type transition-delays, establishing reading order without every element animating on its own timeline. Reveals run once (unobserved after firing), not on every scroll-back.

## Technical elements

Lines and markers **draw and resolve** rather than fade: the hero baseline scales in, the coordinate rail and its blue tick track the active station, the credibility dots light in sequence, the carousel blue marker grows on focus, and the point cloud's blue scan points read as active measurement.

## Navigation & interactive states

Hover and focus share one motion family (underline draw-ins, caret nudges). **Keyboard `:focus-visible` is at least as clear as pointer hover** — visible blue outlines on links, buttons, cards, and the carousels, and underline parity on nav/links. Movement is never the *only* signal of interactivity (state is also carried by colour, outline, and metadata).

## Ambient motion (one place only)

The **point cloud** is the single ambient element: a very slow auto-rotation. It **pauses when scrolled off-screen** (an `IntersectionObserver` gates the rAF loop) and is **static under reduced-motion**. No other part of the page moves at rest.

## Accessibility

`@media (prefers-reduced-motion: reduce)` resolves every reveal, the load sequence, the hero scan, the carousel scan, and the ambient rotation to their final static states instantly — no transforms, no clips, no animation. Content and layout are identical with motion removed. Focus order and keyboard operation are unchanged; the carousel exposes `role="group"`, `aria-roledescription`, an `aria-live` index readout, and `aria-current` on the focused project.

---

## Carousel focus prototypes (the signature interaction)

The carousel is the homepage's principal motion moment — where "documented architecture → recognition → focus → lived spatial experience" becomes visible. Two prototypes were designed. **Version B is implemented; Version A is documented here for comparison and easy fallback.**

### A — Minimal focus (documented, not active)

The quietest possible expression. On focus, a project:
- scales up subtly (≈1.0 → 1.05) with `--t-state` easing;
- gains photographic clarity (greyscale → colour) and full opacity;
- resolves its title + metadata from dimmed/offset to final;
- adjacent projects drop to ~0.7 opacity and ~0.95 scale (quieter, never hidden).

No technical layer. Calm, fast, unobtrusive — appropriate if the brief ever wants the carousel to recede relative to other moments.
*To switch to A:* remove the `.pscan` / `.pcoord` elements (injected in JS) and the `pscan` keyframe usage; keep everything else.

### B — Measured Reality (implemented)

Everything in A, plus a **brief technical-to-photographic transition** that appears *only during* the focus change and then clears, leaving the photograph dominant and the carousel calm:
- a blue **scan line** sweeps once across the newly focused image (`--t-major`), reading as measurement/documentation;
- the electric-blue **semantic marker** (`.pmark`) activates and grows;
- a small **coordinate label** (`pt·NN`) resolves into the corner of the focused image;
- the focused image gains a slight contrast/saturation lift (clarity);
- title, metadata, and the **index readout** (`NN·NN`, `aria-live`) update in sync;
- adjacent projects quiet down (scale + opacity + greyscale) without disappearing.

The technical layer is transient by design — after the sweep, only the architecture photograph and the persistent blue marker remain. No 3D cover-flow, no perspective, no heavy blur on neighbours, no permanent overlays, no large zoom jumps.

**Interaction coverage (both versions):** native touch swipe + scroll-snap; horizontal trackpad; drag-to-explore (mouse pointer, snap suspended during drag); arrow keys when the carousel is focused; and `←/→` controls. The focused state is expressed through scale, contrast, metadata, the index readout, and `aria-current` — never through animation alone.

**Why B is the implemented choice:** it is the clearest place on the homepage where the *measured reality* philosophy becomes literally visible — the studio's craft (scanning, measuring, documenting) performed on its own portfolio — while still resolving to a calm, photograph-first state. It is the page's strongest, most memorable motion treatment without becoming a technology demo.
