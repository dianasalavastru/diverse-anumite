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

if (reduce) {
  // Layout parity: final state, immediately, no transition (MOTION_NOTES.md:62).
  for (const el of reveals) el.classList.add('in');
} else if (reveals.length > 0) {
  // Reveals run ONCE — unobserved after firing, not on every scroll-back.
  const revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        /**
         * Already scrolled PAST counts as revealed.
         *
         * The observer's first callback reports every element, including those
         * above the viewport — and those are never going to intersect again on
         * a downward read. Browsers restore scroll position on reload and on
         * back-navigation, and a deep link lands mid-page, so without this an
         * ordinary reload leaves everything above the fold permanently at
         * `opacity: 0`. The HiFi has the same gap; it is not visible in a
         * prototype that is only ever opened at the top.
         *
         * `bottom <= 0` means the element ended above the viewport's top edge.
         * It resolves to the same final state, with no transition worth seeing.
         */
        const passed = entry.boundingClientRect.bottom <= 0;
        if (!entry.isIntersecting && !passed) continue;
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  );
  for (const el of reveals) revealObserver.observe(el);
}

/* -------------------------------------------------------------------------- */
/* Header settle + coordinate rail                                            */
/* -------------------------------------------------------------------------- */

const header = document.querySelector<HTMLElement>('.site-header');
const stations = [...document.querySelectorAll<HTMLElement>('[data-station]')];
const railStops = [...document.querySelectorAll<HTMLElement>('.rail .st')];

if (header || (stations.length > 0 && railStops.length > 0)) {
  const onScroll = () => {
    // Header settle-to-solid past 60% of the first viewport.
    header?.classList.toggle('solid', scrollY > innerHeight * 0.6);

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
  onScroll();
}
