/**
 * Media Viewer island — the runtime behind `MediaViewer.astro` and `Gallery.astro`.
 *
 * OWNERSHIP: Workstream A (Work Entry). §5.1 lists it: "Drawing / media viewer
 * (pan-zoom) | Work Entry | vanilla; **Media Viewer** component". No library
 * (MOTION_NOTES.md:9, upheld at §13) — CSS does the transitions, this file
 * resolves state and sets a transform.
 *
 * ── IT IS AN ENHANCEMENT ──────────────────────────────────────────────────
 * §14.0 makes progressive enhancement mandatory. Every gallery item is an
 * ordinary link to the full-size asset, so with this file absent the media is
 * still inspectable — the browser opens the image. This script intercepts that
 * click and offers a better surface; it never creates the only route to one.
 *
 * ── NO SCROLL TRAP (§14.2) ────────────────────────────────────────────────
 * "The HiFi drawing viewer calls `preventDefault()` with `{passive:false}`
 * across the whole viewer — a scroll trap on touch and trackpad. Zoom must be
 * bound to an explicit activation."
 *
 * Here, `preventDefault` on `wheel` happens on exactly one condition: zooming is
 * already **explicitly active** (the Inspect toggle is on) or the visitor is
 * holding a zoom modifier. A bare wheel or two-finger swipe is never
 * intercepted. The wheel listener is registered non-passive because it must be
 * *able* to cancel in that one case, and it returns without cancelling in every
 * other — which is the distinction §14.2 draws.
 *
 * `touch-action` is likewise conditional, keyed in CSS off `data-zoomed`: at
 * rest the stage handles touch natively; only a zoomed stage claims the gesture,
 * and a single tap on Reset (or Escape) gives it straight back.
 *
 * ── KEYBOARD EQUIVALENTS (§14.1) ──────────────────────────────────────────
 * "Automated tooling cannot detect a missing keyboard equivalent for a canvas
 * gesture", so every pointer gesture has a named control AND a key:
 *
 *   gesture              control              key (stage focused)
 *   ───────────────────  ───────────────────  ─────────────────────────
 *   open                 gallery link         Enter / Space on the link
 *   close                Close button         Escape (native <dialog>)
 *   next / previous      ← → buttons          ArrowLeft / ArrowRight at 1×
 *   zoom in / out        + − buttons          + / - (and = for +)
 *   reset                Reset button         0
 *   activate zoom        Inspect toggle       any of the above
 *   pan                  drag                 arrow keys while zoomed
 *
 * Arrows are unambiguous because the two meanings never coexist: at 1× there is
 * nothing to pan, so they navigate; once zoomed they pan, and the ← → buttons
 * (always present, always in the tab order) keep navigation reachable.
 */

/* A module, not a global script: top-level `const`s here must not share one
   global scope with the motion runtime and the carousel island. */
export {};

/* No reduced-motion branch exists in this file on purpose. Every transition the
   viewer has is declared in CSS, where `prefers-reduced-motion` already resolves
   it to layout parity (MOTION_NOTES.md:62) — and nothing here requests smooth
   scrolling or animates a value in script, so there is nothing left to gate. */

const MIN_SCALE = 1;
const MAX_SCALE = 6;
/** One press of + / − or one control click. */
const STEP = 0.4;
/** Arrow-key pan distance, in CSS pixels. */
const PAN_STEP = 48;

const dialog = document.querySelector<HTMLDialogElement>('dialog[data-media-viewer="image"]');
const items = [...document.querySelectorAll<HTMLAnchorElement>('a[data-viewer-item]')];

/* `showModal` is the whole accessibility model here; without it we would be
   hand-rolling a focus trap, which §14 has no appetite for. A browser without
   it keeps the plain links. */
if (dialog && items.length > 0 && typeof dialog.showModal === 'function') {
  const stage = dialog.querySelector<HTMLElement>('[data-lb-stage]');
  const image = dialog.querySelector<HTMLImageElement>('[data-lb-image]');
  const positionEl = dialog.querySelector<HTMLElement>('[data-lb-position]');
  const captionEl = dialog.querySelector<HTMLElement>('[data-lb-caption]');
  const coordinateEl = dialog.querySelector<HTMLElement>('[data-lb-coordinate]');
  const zoomEl = dialog.querySelector<HTMLElement>('[data-lb-zoom]');
  const statusEl = dialog.querySelector<HTMLElement>('[data-lb-status]');
  const inspectButton = dialog.querySelector<HTMLButtonElement>('[data-lb-inspect]');

  const positionLabel = dialog.dataset.labelPosition ?? '';
  const zoomLabel = dialog.dataset.labelZoom ?? '';

  if (stage && image) {
    let index = 0;
    let scale = MIN_SCALE;
    let x = 0;
    let y = 0;
    let inspect = false;
    let opener: HTMLElement | null = null;

    /* -- rendering --------------------------------------------------------- */

    const zoomed = () => scale > MIN_SCALE;

    /**
     * Keep the image overlapping the stage. Without a bound, one flick can send
     * a zoomed image off-screen and leave the visitor with an empty stage and no
     * obvious way back — Reset exists, but a control you need because the
     * surface misbehaved is not an affordance.
     */
    function clamp(): void {
      const stageBox = stage!.getBoundingClientRect();
      const width = (image!.offsetWidth * scale - stageBox.width) / 2;
      const height = (image!.offsetHeight * scale - stageBox.height) / 2;
      x = Math.min(Math.max(x, -Math.max(width, 0)), Math.max(width, 0));
      y = Math.min(Math.max(y, -Math.max(height, 0)), Math.max(height, 0));
    }

    function render(): void {
      if (!zoomed()) {
        x = 0;
        y = 0;
      } else {
        clamp();
      }
      image!.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
      stage!.dataset.zoomed = String(zoomed());
      if (zoomEl) zoomEl.textContent = `${Math.round(scale * 100)}%`;
    }

    function announce(message: string): void {
      if (statusEl) statusEl.textContent = message;
    }

    function setInspect(next: boolean, announceIt = true): void {
      inspect = next;
      stage!.dataset.inspect = String(inspect);
      inspectButton?.setAttribute('aria-pressed', String(inspect));
      if (!inspect) {
        scale = MIN_SCALE;
        render();
      }
      if (announceIt) announce(`${zoomLabel} ${Math.round(scale * 100)}%`);
    }

    function setScale(next: number): void {
      scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
      // Zooming in IS an explicit activation, so it turns inspection on; zooming
      // back to 1× hands the gesture surface back to the page.
      if (zoomed() && !inspect) setInspect(true, false);
      render();
    }

    function show(next: number): void {
      index = (next + items.length) % items.length;
      const item = items[index] as HTMLAnchorElement;

      scale = MIN_SCALE;
      setInspect(false, false);

      const caption = item.dataset.viewerCaption ?? '';
      image!.src = item.href;
      // The authored alt, carried across from the gallery item. Empty stays
      // empty — §12 "meaningful alt from CMS (authored, not derived)"; inventing
      // one from a filename is exactly what that forbids.
      image!.alt = caption;

      if (captionEl) captionEl.textContent = caption;
      if (coordinateEl) coordinateEl.textContent = item.dataset.viewerCoordinate ?? '';
      const position = `${positionLabel} ${index + 1} / ${items.length}`;
      if (positionEl) positionEl.textContent = position;

      render();
      announce(caption ? `${position} — ${caption}` : position);
    }

    /* -- open / close ------------------------------------------------------ */

    function open(next: number): void {
      opener = document.activeElement as HTMLElement | null;
      show(next);
      dialog!.showModal();
      // Focus the inspection surface itself so the keyboard equivalents are
      // immediately live. Tab still cycles the dialog's controls natively.
      stage!.focus();
    }

    for (const [position, item] of items.entries()) {
      item.addEventListener('click', (event) => {
        // Let a modified click do what the visitor asked (new tab, download,
        // save). Intercepting those would be worse than not enhancing at all.
        if (event.defaultPrevented || event.button !== 0) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        open(position);
      });
    }

    /**
     * Cleanup runs *before* `close()`, not in the `close` handler.
     *
     * Verified on the baseline: a WebKit build in the browser baseline (§14.0)
     * closes the dialog without ever dispatching `close`, so cleanup hung off
     * that event silently never ran. It is idempotent and also attached to the
     * event below, so whichever path a browser takes, it happens at most once
     * and at least once.
     *
     * Focus restoration is deliberately kept in both places: the platform
     * returns focus to the opener on its own — which is why `<dialog>` is the
     * mechanism here — and the explicit call is the guarantee for the case where
     * the opener was re-rendered underneath.
     */
    function cleanup(): void {
      // Free the decoded image rather than holding a full-resolution bitmap for
      // the rest of the session.
      image!.removeAttribute('src');
      setInspect(false, false);
      opener?.focus?.();
      opener = null;
    }

    function dismiss(): void {
      cleanup();
      dialog!.close();
    }

    dialog.querySelector<HTMLButtonElement>('[data-lb-close]')?.addEventListener('click', dismiss);

    /**
     * Click outside the image to dismiss — the behaviour every lightbox has.
     *
     * The test is on the target being the dialog **or the stage itself**, never
     * a descendant: the stage is `inset: 0`, so it covers the dialog and a
     * `target === dialog` check alone would never fire. A click that lands on
     * the image, a control, or a bar has that element as its target and is left
     * alone — which is also why the double-click zoom below is bound to the
     * image rather than to the stage, so the two can never contend for the same
     * click.
     */
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog || event.target === stage) dismiss();
    });

    /* The Escape path: the platform's own close-watcher closes the dialog and
       this is where cleanup catches up. See `cleanup` for why it is not the only
       place it runs. */
    dialog.addEventListener('close', cleanup);

    /* -- navigation -------------------------------------------------------- */

    for (const control of dialog.querySelectorAll<HTMLButtonElement>('[data-lb-step]')) {
      control.addEventListener('click', () => show(index + Number(control.dataset.lbStep)));
    }

    for (const control of dialog.querySelectorAll<HTMLButtonElement>('[data-lb-zoom-step]')) {
      control.addEventListener('click', () => {
        setScale(scale + Number(control.dataset.lbZoomStep) * STEP);
        announce(`${zoomLabel} ${Math.round(scale * 100)}%`);
      });
    }

    dialog.querySelector<HTMLButtonElement>('[data-lb-reset]')?.addEventListener('click', () => {
      setInspect(false);
    });

    inspectButton?.addEventListener('click', () => setInspect(!inspect));

    /* -- keyboard ---------------------------------------------------------- */

    stage.addEventListener('keydown', (event) => {
      // Only while the stage itself holds focus: a control inside the dialog
      // must keep the browser's own activation behaviour.
      if (event.target !== stage) return;

      switch (event.key) {
        case '+':
        case '=':
          event.preventDefault();
          setScale(scale + STEP);
          announce(`${zoomLabel} ${Math.round(scale * 100)}%`);
          return;
        case '-':
          event.preventDefault();
          setScale(scale - STEP);
          announce(`${zoomLabel} ${Math.round(scale * 100)}%`);
          return;
        case '0':
          event.preventDefault();
          setInspect(false);
          return;
        default:
          break;
      }

      const pan: Record<string, [number, number]> = {
        ArrowLeft: [PAN_STEP, 0],
        ArrowRight: [-PAN_STEP, 0],
        ArrowUp: [0, PAN_STEP],
        ArrowDown: [0, -PAN_STEP],
      };
      const delta = pan[event.key];
      if (!delta) return;

      if (zoomed()) {
        event.preventDefault();
        x += delta[0];
        y += delta[1];
        render();
        return;
      }

      // At 1× there is nothing to pan, so the horizontal arrows navigate. The
      // vertical ones are left to the browser.
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        show(index + (event.key === 'ArrowRight' ? 1 : -1));
      }
    });

    /* -- pointer ----------------------------------------------------------- */

    /**
     * Wheel zoom, behind an explicit activation — §14.2.
     *
     * `preventDefault` is reached only when inspection is already on, or when
     * the visitor holds a zoom modifier (which is itself the explicit
     * activation, and is what a browser's own page zoom uses). Every other
     * wheel event returns untouched, so trackpad and touch scrolling behave
     * normally over the stage.
     */
    stage.addEventListener(
      'wheel',
      (event) => {
        const modifier = event.ctrlKey || event.metaKey;
        if (!inspect && !modifier) return;
        event.preventDefault();
        setScale(scale + -event.deltaY * 0.0016 * scale);
      },
      { passive: false },
    );

    /* A double-click is an unambiguous, deliberate gesture — the second of the
       two activations §14.2 names ("click-to-focus or modifier key"). Bound to
       the image, not the stage, so it cannot contend with click-outside-to-
       dismiss. */
    image.addEventListener('dblclick', () => {
      if (zoomed()) setInspect(false);
      else setScale(2.4);
    });

    let dragging = false;
    let originX = 0;
    let originY = 0;

    stage.addEventListener('pointerdown', (event) => {
      if (!zoomed()) return; // at 1× the surface is not claimed at all
      dragging = true;
      originX = event.clientX - x;
      originY = event.clientY - y;
      stage.setPointerCapture(event.pointerId);
    });

    stage.addEventListener('pointermove', (event) => {
      if (!dragging) return;
      x = event.clientX - originX;
      y = event.clientY - originY;
      render();
    });

    const endDrag = (event: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    };

    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);

    /* A viewport change can leave a zoomed image outside its bounds. */
    addEventListener(
      'resize',
      () => {
        if (dialog.open) render();
      },
      { passive: true },
    );
  }
}
