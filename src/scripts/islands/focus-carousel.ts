/**
 * Focus carousel island — the runtime behind FocusCarousel.astro.
 *
 * OWNERSHIP: Workstream A. No library (MOTION_NOTES.md:9, upheld at §13):
 * scroll-snap and CSS transitions do the animating; this file resolves which
 * card is in focus and flips classes and ARIA state.
 *
 * It is an *enhancement*. Without it the carousel is still a horizontally
 * scrollable list of links — swipeable, trackpad-scrollable, and fully operable
 * by Tab (§14.0: "No interactive surface may become unreachable when an
 * enhancement API is absent"). The first card is marked focused server-side so
 * the composition is correct before hydration.
 *
 * NO SCROLL TRAP (§14.2). Every listener that could capture scrolling is
 * passive; `preventDefault` is called only for ArrowLeft/ArrowRight, and only
 * while the carousel itself has focus.
 */

/* A module, not a global script: without this, top-level `const`s here and in
   motion-runtime.ts share one global scope and collide. */
export {};

const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

/** Column gap between cards. Transcribed from the HiFi's `.traverse{gap:26px}`. */
const CARD_GAP = 26;

/** Matches the HiFi's post-scroll settle before the focus state is recomputed. */
const SETTLE_MS = 60;

type Card = HTMLElement;

function cardsOf(track: HTMLElement): Card[] {
  return [...track.children].filter((child): child is Card => child instanceof HTMLElement);
}

/**
 * The card nearest the track's horizontal centre takes focus — the same rule the
 * HiFi uses, and the one scroll-snap's `center` alignment converges on.
 */
function resolveFocus(track: HTMLElement): void {
  const cards = cardsOf(track);
  if (cards.length === 0) return;

  const bounds = track.getBoundingClientRect();
  const centre = bounds.left + bounds.width / 2;

  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  cards.forEach((card, index) => {
    const rect = card.getBoundingClientRect();
    const distance = Math.abs(rect.left + rect.width / 2 - centre);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });

  cards.forEach((card, index) => {
    const focused = index === bestIndex;
    card.classList.toggle('focused', focused);
    // aria-current marks the focused item — MOTION_NOTES.md:62. Absent rather
    // than "false" on the others, so assistive tech announces one, not all.
    if (focused) card.setAttribute('aria-current', 'true');
    else card.removeAttribute('aria-current');
  });

  const readout = document.querySelector<HTMLElement>(
    `.tindex[data-carousel-index="${CSS.escape(track.id)}"]`,
  );
  if (readout) {
    const position = String(bestIndex + 1).padStart(2, '0');
    const total = String(cards.length).padStart(2, '0');
    readout.replaceChildren(
      Object.assign(document.createElement('b'), { textContent: position }),
      document.createTextNode(`·${total}`),
    );
  }
}

/** One card's worth of scroll, including the authored gap. */
function step(track: HTMLElement): number {
  const first = cardsOf(track)[0];
  return (first?.offsetWidth ?? 0) + CARD_GAP;
}

function scrollByCards(track: HTMLElement, direction: number): void {
  track.scrollBy({ left: direction * step(track), behavior: reduce ? 'auto' : 'smooth' });
}

const tracks = [...document.querySelectorAll<HTMLElement>('[data-focus-carousel]')];

for (const track of tracks) {
  resolveFocus(track);

  /* -- scroll settle ------------------------------------------------------- */
  let settle: ReturnType<typeof setTimeout> | undefined;
  track.addEventListener(
    'scroll',
    () => {
      clearTimeout(settle);
      settle = setTimeout(() => resolveFocus(track), SETTLE_MS);
    },
    { passive: true },
  );

  /* -- keyboard ------------------------------------------------------------ */
  track.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    // Only while the region itself holds focus: a card link inside must keep
    // the browser's own caret/scroll behaviour.
    if (event.target !== track) return;
    event.preventDefault();
    scrollByCards(track, event.key === 'ArrowRight' ? 1 : -1);
  });

  /**
   * Tabbing to a card brings it into focus — otherwise a keyboard visitor could
   * read a card whose state says another one is "measured". This is the keyboard
   * equivalent §14.1 requires for a pointer-driven inspection surface.
   */
  track.addEventListener('focusin', (event) => {
    const card = (event.target as HTMLElement).closest<HTMLElement>('.proj');
    if (!card || card.parentElement !== track) return;
    const offset =
      card.offsetLeft - track.offsetLeft - (track.clientWidth - card.offsetWidth) / 2;
    track.scrollTo({ left: offset, behavior: reduce ? 'auto' : 'smooth' });
    resolveFocus(track);
  });

  /* -- drag to explore (mouse only; snap suspended during the drag) --------- */
  let dragging = false;
  let originX = 0;
  let originScroll = 0;

  track.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse') return; // touch keeps native swipe
    dragging = true;
    originX = event.clientX;
    originScroll = track.scrollLeft;
    track.style.scrollSnapType = 'none';
  });

  track.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    track.scrollLeft = originScroll - (event.clientX - originX);
  });

  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    track.style.scrollSnapType = '';
    resolveFocus(track);
  };

  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', endDrag);
  track.addEventListener('pointerleave', endDrag);
}

/* -- controls -------------------------------------------------------------- */

for (const control of document.querySelectorAll<HTMLButtonElement>('[data-carousel-target]')) {
  control.addEventListener('click', () => {
    const track = document.getElementById(control.dataset.carouselTarget ?? '');
    if (!track) return;
    scrollByCards(track, Number(control.dataset.carouselStep) || 1);
  });
}

/* -- reflow ---------------------------------------------------------------- */

if (tracks.length > 0) {
  addEventListener(
    'resize',
    () => {
      for (const track of tracks) resolveFocus(track);
    },
    { passive: true },
  );
}
