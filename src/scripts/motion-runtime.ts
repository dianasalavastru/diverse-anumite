/**
 * The motion runtime — the page-global motion layer every page carries.
 *
 * AUTHORITY: MOTION_NOTES.md, absorbed verbatim per TECHNICAL_ARCHITECTURE.md
 * §5.2 ("Every page carries the HiFi motion layer: load sequence, .rv reveal
 * system, header settle, coordinate rail. This is accepted and budgeted") and
 * §13 ("No library" — MOTION_NOTES.md:9, upheld).
 *
 * No library. CSS transitions and keyframes do the animating; this file only
 * flips classes. Per-page motion (the hero scan, carousel focus, the
 * point-cloud rAF loop) is NOT here — it belongs to those pages and islands.
 *
 * Everything below is guarded on element presence, so a page without a rail or
 * without reveals costs nothing but the listener setup.
 */

const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
const root = document.documentElement;

/* -------------------------------------------------------------------------- */
/* Load sequence (MOTION_NOTES.md §"Load sequence (non-blocking)")             */
/* -------------------------------------------------------------------------- */

/**
 * `anim-load` is rendered onto <html> by the layout, so the pre-paint state is
 * server-side and needs no inline script — which also keeps the CSP free of
 * `unsafe-inline` in script-src (§19.1). `anim-ready` is added on the second
 * animation frame, exactly as the HiFi does, which starts the staged reveal.
 *
 * Under reduced motion the sequence is skipped entirely: the class goes on
 * immediately and motion.css has already resolved every staged element to its
 * final state.
 */
if (reduce) {
  root.classList.add('anim-ready');
} else {
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('anim-ready')));

  /* ── AND A DEADLINE, BECAUSE rAF IS NOT A PROMISE OF A FRAME ──────────────
     `requestAnimationFrame` does not run while the document is not being
     rendered — a background tab, a window behind another window, a restored
     bfcache entry that has not painted yet. Until `anim-ready` lands, the
     header chrome is at `opacity: 0`: the wordmark, the rail and — since the
     small-viewport panel was built — the `MENIU` control that is now the ONLY
     way to reach navigation on a phone. A staged fade that has not started is
     indistinguishable from a header that is not there.

     This is the same lesson the reveal gate below is written around, applied to
     the one part of the load sequence that still depended on a frame arriving.
     The deadline never changes the motion when frames ARE flowing: the double
     rAF resolves in ~32ms and `classList.add` is idempotent, so 400ms is only
     ever reached when the alternative was staying hidden indefinitely. */
  setTimeout(() => root.classList.add('anim-ready'), 400);
}

/* -------------------------------------------------------------------------- */
/* Reveal family (MOTION_NOTES.md §"Reveal family (not uniform fade-up)")      */
/* -------------------------------------------------------------------------- */

type RevealType = 'head' | 'img' | 'meta';

/**
 * The HiFi types reveals with a selector list built from that page's own class
 * names. A global runtime cannot know those, so the type is read from an
 * explicit `data-rv` attribute, with a structural fallback that reproduces the
 * same three-way split: headings are `head`, media blocks are `img`, everything
 * else is `meta`. The visual result is the one MOTION_NOTES.md describes; only
 * the way the type is determined differs.
 */
function revealType(el: Element): RevealType {
  const declared = (el as HTMLElement).dataset.rv;
  if (declared === 'head' || declared === 'img' || declared === 'meta') {
    return declared;
  }
  if (el.matches('h1,h2,h3,h4,hgroup')) return 'head';
  if (el.matches('figure,picture,img,canvas,video,[data-media]')) return 'img';
  return 'meta';
}

const reveals = [...document.querySelectorAll('.rv')];

for (const el of reveals) {
  el.classList.add(`rv--${revealType(el)}`);
}

/* ════════════════════════════════════════════════════════════════════════════
   THE REVEAL GATE FAILS OPEN. IT DID NOT, AND THAT SHIPPED CONTENT INVISIBLE.
   ════════════════════════════════════════════════════════════════════════════

   Every `.rv` element starts at `opacity: 0` (motion.css), and `rv--head` and
   `rv--img` additionally start clipped to an empty box. Until something adds
   `.in`, that content is not merely un-animated — it is **gone**. Headings,
   photographs and whole media regions on every page of the site are behind this
   one class.

   That gate used to be an `IntersectionObserver`, and an observer is a *promise
   of delivery*, not a guarantee of one. It delivers nothing while the document
   is hidden — and after the document becomes visible it only fires again when a
   threshold is **crossed**, so a page that was loaded in a background tab, or
   restored from bfcache, or opened behind another window, and is then read
   without scrolling, never crosses anything. Its headings and images stay at
   `opacity: 0` forever.

   That is not hypothetical. It reproduces exactly: with the document hidden, an
   observer registered on a fully on-screen element never fires at all (a 30s
   `await` on its first callback times out), while the same page's layout,
   geometry and images are all completely correct underneath. The reported
   symptom — "the geometry exists, the space exists, the content is invisible" —
   is this and only this.

   So the observer is gone, and the same decision is computed from layout
   instead. `getBoundingClientRect()` cannot be withheld: it is synchronous, it
   is exact, and it answers whether an element is on screen whether or not the
   compositor feels like telling us.

   ── THE MOTION IS UNCHANGED ────────────────────────────────────────────────
   `shouldReveal` reproduces the observer's geometry exactly rather than
   approximating it: the same 12% threshold, against a root whose bottom edge is
   pulled up by the same 6%, plus the same "already scrolled past" rule. An
   element reveals at the same scroll position it did before. MOTION_NOTES.md's
   staged reveal, its per-type delays and its reading order are all untouched —
   only the thing that *notices* changed.

   ── AND IT STILL RUNS ONCE ─────────────────────────────────────────────────
   `pending` shrinks as elements resolve and is never re-added to, so a revealed
   element is never re-evaluated and never re-animates on scroll-back. When it
   empties, the listeners remove themselves and the page pays nothing.
   ══════════════════════════════════════════════════════════════════════════ */

/** The observer's own bookkeeping, kept: reveal once, then forget. */
const pending = new Set(reveals);

function resolve(el: Element): void {
  el.classList.add('in');
  pending.delete(el);
}

/**
 * The `{ threshold: 0.12, rootMargin: '0px 0px -6% 0px' }` contract, computed.
 *
 * A zero-height element can never reach a ratio, so it resolves on entry
 * instead — otherwise an empty-but-present box would be the one thing that
 * could still stick, which is the bug this function exists to end.
 */
function shouldReveal(el: Element): boolean {
  const box = el.getBoundingClientRect();

  // Scrolled past: it ended above the viewport and will never intersect again.
  if (box.bottom <= 0) return true;

  const rootBottom = window.innerHeight * 0.94; // rootMargin: 0 0 -6% 0
  if (box.top >= rootBottom) return false;

  if (box.height === 0) return true;

  const visible = Math.min(box.bottom, rootBottom) - Math.max(box.top, 0);
  return visible / box.height >= 0.12;
}

if (reduce) {
  // Layout parity: final state, immediately, no transition (MOTION_NOTES.md:62).
  for (const el of reveals) resolve(el);
} else if (reveals.length > 0) {
  let queued = false;

  const sweep = (): void => {
    queued = false;
    for (const el of [...pending]) {
      if (shouldReveal(el)) resolve(el);
    }
    if (pending.size === 0) {
      removeEventListener('scroll', schedule);
      removeEventListener('resize', schedule);
      removeEventListener('load', sweep);
      document.removeEventListener('visibilitychange', sweep);
    }
  };

  /** One sweep per frame at most, however many events arrive. */
  function schedule(): void {
    if (queued) return;
    queued = true;
    requestAnimationFrame(sweep);
  }

  /* Scroll and resize are high-frequency, so they coalesce into one frame. */
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);

  /* `load` and `visibilitychange` sweep SYNCHRONOUSLY, and that difference is
     the whole point of listening to them.
     They are the two moments the observer had no answer for — a page whose
     images settle late and shift the layout, and a page that was never visible
     when its content first came on screen — and both can occur while
     `requestAnimationFrame` is still frozen. Deferring these to a frame would
     hand the correctness path back to the same "runs only when the browser feels
     like rendering" dependency this rewrite exists to remove. They are rare
     enough that the throttle buys nothing anyway. */
  addEventListener('load', sweep);
  document.addEventListener('visibilitychange', sweep);

  /* Synchronously, before the first paint the runtime can affect: whatever is
     already on screen is already readable. Nothing above the fold waits for an
     event that may never come. */
  sweep();
}

/* -------------------------------------------------------------------------- */
/* Header settle + coordinate rail                                            */
/* -------------------------------------------------------------------------- */

const header = document.querySelector<HTMLElement>('.site-header');
const stations = [...document.querySelectorAll<HTMLElement>('[data-station]')];
const railStops = [...document.querySelectorAll<HTMLElement>('.rail .st')];

/**
 * The settle threshold, in pixels of scroll.
 *
 * It used to be `innerHeight * 0.6`, which is what the HiFis animate — and for
 * every pixel below it the fixed header declared no background, so the page
 * scrolled underneath it in full. 60vh is most of About's opening on a laptop
 * and several screens on a phone.
 *
 * 2px, not 0: `scrollY` is fractional on trackpads, high-DPI displays and
 * pinch-zoomed viewports, and both rubber-band overscroll and the browser's own
 * scroll anchoring can land it a hair off zero while the page has visually not
 * moved. Toggling a 0.4s background transition on that noise is a visible
 * flicker at rest. Two pixels is below the header's own hairline and cannot be
 * read as "still at the top" by anyone — the state is opaque before any content
 * has travelled far enough to reach the header's underside.
 */
const SETTLE_AT = 2;

if (header || (stations.length > 0 && railStops.length > 0)) {
  const onScroll = () => {
    // Header settle-to-solid the moment the page leaves the top.
    header?.classList.toggle('solid', scrollY > SETTLE_AT);

    if (stations.length === 0 || railStops.length === 0) return;

    // The rail's blue tick tracks the active station
    // (MOTION_NOTES.md §"Technical elements").
    const mid = scrollY + innerHeight * 0.5;
    let current = 1;
    for (const section of stations) {
      if (section.offsetTop <= mid) current = Number(section.dataset.station);
    }
    for (const stop of railStops) {
      stop.classList.toggle('active', Number(stop.dataset.st) === current);
    }
  };

  addEventListener('scroll', onScroll, { passive: true });

  /* Synchronously, for a document that is ALREADY scrolled when this module
     runs — a deep link with a fragment, a hard reload part-way down a page. */
  onScroll();

  /* And again at the two moments the scroll offset moves without this module
     being anywhere near it. The browser restores a reload's scroll position
     around `load`, and a bfcache entry comes back at its old offset on
     `pageshow` — in both cases the initial call above has already run, at
     scrollY 0, and there is no scroll event to correct it. A page restored
     half-way down would otherwise paint a transparent header over its content
     until the reader happened to scroll.

     `classList.toggle` with a boolean is idempotent, so the extra calls are
     free when the state is already right — which is the common case. */
  addEventListener('load', onScroll);
  addEventListener('pageshow', onScroll);
}
