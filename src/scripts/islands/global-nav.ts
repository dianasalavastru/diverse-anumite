/**
 * Global navigation island — the disclosure behind the small-viewport `MENIU`
 * control in GlobalHeader.astro.
 *
 * OWNERSHIP: Workstream A. No library (MOTION_NOTES.md:9, upheld at §13): the
 * open/close transition is CSS; this file only flips one class and keeps the
 * ARIA state honest.
 *
 * ── WHAT IT IS RESPONSIBLE FOR ─────────────────────────────────────────────
 * Exactly one piece of state — open or closed — expressed in four places that
 * must never disagree:
 *   `aria-expanded` on the trigger   (the state, for assistive tech)
 *   the trigger's visible label      (the state, for sighted pointer users)
 *   `menu-open` on <html>            (the panel's visibility + the scroll lock)
 *   `inert` on the page behind it    (nothing under the panel is reachable)
 *
 * ── IT IS AN ENHANCEMENT, AND THE CLOSED STATE IS NOT ITS JOB ──────────────
 * The panel is closed by the stylesheet, so it is closed and untabbable before
 * this module exists and whether or not it ever loads. If the module never
 * runs, the header offers the wordmark and nothing else — and the Global
 * Footer's nav echo still carries every one of these destinations on every page
 * (§14.0). Scripting-disabled specifically is handled better than that, in
 * BaseLayout's <noscript>: the horizontal nav is unhidden and allowed to wrap.
 *
 * ── NO SCROLL TRAP, NO STUCK LOCK (§14.2) ──────────────────────────────────
 * The lock is `overflow: hidden` on <html> — it never moves the scroll position,
 * so opening and closing cannot jump the page. It is scoped inside the same
 * media query as the panel, and it is released on EVERY exit: close, Escape,
 * link activation, a viewport that grows past the breakpoint, and a bfcache
 * restore. There is no path that leaves the document unscrollable.
 */

/* A module, not a global script: without this, top-level `const`s here and in
   motion-runtime.ts share one global scope and collide. */
export {};

/** Everything the panel covers, and therefore everything it must neutralise. */
const BEHIND = 'main, .site-footer, .rail, .skip-link';

const trigger = document.querySelector<HTMLButtonElement>('.site-header .menu');
const panelId = trigger?.getAttribute('aria-controls');
const panel = panelId ? document.getElementById(panelId) : null;

if (trigger && panel) {
  const root = document.documentElement;

  /**
   * Does the panel exist at this viewport?
   *
   * Asked of the stylesheet, which owns the breakpoint, rather than answered by
   * a `matchMedia('(max-width: 720px)')` here — a second copy of the number that
   * can drift from the first the day someone moves it. The control is
   * `display: none` above the breakpoint and shown below it, so its own computed
   * display IS the answer, and it cannot disagree with the CSS.
   */
  const panelApplies = (): boolean => getComputedStyle(trigger).display !== 'none';

  /* Read from the markup rather than re-derived here: the strings are i18n
     copy (ui.ts), and a runtime that hard-codes "Close" has just introduced a
     second, untranslated source for a label the component already owns. */
  const labelOpen = trigger.dataset.labelOpen ?? trigger.textContent ?? '';
  const labelClose = trigger.dataset.labelClose ?? labelOpen;

  const behind = [...document.querySelectorAll<HTMLElement>(BEHIND)];

  let open = false;

  /* The stylesheet already renders it closed; this states the same thing in the
     property the tab order actually reads, from the moment the module runs. */
  panel.inert = true;

  function setOpen(next: boolean): void {
    if (next === open || !trigger || !panel) return;
    open = next;

    trigger.setAttribute('aria-expanded', String(next));
    trigger.textContent = next ? labelClose : labelOpen;
    root.classList.toggle('menu-open', next);

    /* The closed panel's untabbability must not be a CONSEQUENCE of a
       transition finishing. `visibility: hidden` arrives at the end of the fade
       out — and a transition only advances while the document is being
       rendered, so in a tab that is not painting it may not arrive at all,
       leaving five invisible links sitting in the tab order. `inert` is
       synchronous and settles it here, in the same statement as the state. */
    panel.inert = !next;

    /* `inert` rather than a hand-rolled focus trap: it removes the covered page
       from the tab order AND from the accessibility tree in one attribute, so a
       screen-reader user cannot read through the panel into the page underneath
       either. The header itself stays live — the wordmark is a real destination
       and it is visible above the panel, so taking it away would be a lie. */
    for (const el of behind) {
      if (next) el.setAttribute('inert', '');
      else el.removeAttribute('inert');
    }
  }

  /* `panelApplies()` on the way in as well: the control is unclickable above the
     breakpoint anyway, so this is not about the click — it is about never
     letting `inert` be applied in a state the stylesheet will not undo. */
  trigger.addEventListener('click', () => setOpen(!open && panelApplies()));

  /* Activating a link closes the panel BEFORE the navigation commits. The next
     document renders closed on its own, but a bfcache restore of THIS one would
     otherwise come back mid-state, with the page behind it still inert. */
  panel.addEventListener('click', (event) => {
    if ((event.target as Element | null)?.closest('a[href]')) setOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !open) return;
    setOpen(false);
    /* Focus goes back to what opened it — otherwise Escape leaves focus on an
       element that is now `visibility: hidden`, and the next Tab starts over at
       the top of the document. */
    trigger.focus();
  });

  /**
   * The panel only exists below the breakpoint, and it must not survive the
   * viewport growing past it — rotation, a resized window, a browser zoom step.
   *
   * This is the one transition that can strand state where the user cannot
   * reach it: above the breakpoint the panel is `display: none` and the trigger
   * with it, so an open state that outlives the resize leaves the page `inert`
   * with nothing on screen to close it. The scroll lock releases on its own
   * (its rule lives inside the media query); `inert` and `aria-expanded` do not.
   *
   * So it is re-asserted from `resize` — which every viewport change raises,
   * including the ones a `matchMedia` change listener alone has been observed to
   * miss — and the check is a computed-style read guarded behind `open`, so a
   * closed menu pays one boolean per event.
   */
  const reassert = (): void => {
    if (open && !panelApplies()) setOpen(false);
  };

  addEventListener('resize', reassert, { passive: true });

  /* bfcache: `pageshow` with `persisted` restores the DOM exactly as it was
     left, class and inert attributes included. Re-assert closed. */
  addEventListener('pageshow', () => setOpen(false));
}
