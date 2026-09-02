/**
 * Reality Capture copy — TEMPORARY HOLD BASELINE, **not** an editorial lock.
 *
 * ══════════════════════════════════════════════════════════════════════════
 *  WHAT THIS TEST MEANS, AND WHAT IT DOES NOT MEAN
 * ══════════════════════════════════════════════════════════════════════════
 *
 * MEANS:     "Do not change Reality Capture copy while the Stable RO editorial
 *            work is happening."
 *
 * DOES NOT   "This Reality Capture wording is permanently approved."
 * MEAN:
 *
 * The Reality Capture pillar is editorially **held** pending client clarification: its final
 * taxonomy beyond the current provisional two Services, its positioning and its copy are all
 * open. The snapshot below is therefore a *hold baseline* — it freezes whatever RC says today so
 * that a Stable RO change cannot alter it **by accident**, as a side effect of a neighbouring
 * edit or a "consistency" sweep across the message files.
 *
 * ── UPDATING THIS SNAPSHOT IS A NORMAL, EXPECTED OPERATION ────────────────
 * When the RC editorial hold is lifted, RC copy is *supposed* to change, and this test is
 * *supposed* to be updated in the same change. Update it **deliberately**: edit the RC message
 * values first, then refresh the snapshot and read the diff to confirm it contains only what the
 * RC pass intended. Do not refresh it to make an unrelated batch go green — a failure here
 * during Stable RO work means something touched RC that should not have.
 *
 * ── WHY THE BASELINE IS THE WORKING TREE, NOT `HEAD` ──────────────────────
 * The RC message file carries two approved editorial hunks that were made before this test
 * existed (the removal of `ortofoto` / `orthophoto` from the RC meta description and the RC
 * opening lead). Those are intentional and belong to the editorial workstream, so the baseline is
 * taken **with them applied** — freezing `HEAD` instead would have re-introduced wording the
 * editorial pass had already removed.
 *
 * ── THE SECOND ASSERTION: `Documentări` MUST NOT LEAK ─────────────────────
 * The locked global governance fixes the canonical archive noun as *Proiect / Proiecte* and
 * forbids `Documentări` as a competing one. RC copy still uses it in five places. That is a
 * problem for the RC pass to resolve, **not** for a Stable RO cleanup — so the noun is pinned to
 * exactly one file. It may stay where it is; it may not spread.
 */

import { describe, expect, it } from 'vitest';

import { LOCALES } from './routes';
import { realityCaptureHubMessages } from './pillar-hub';

describe('Reality Capture hub copy — temporary hold baseline', () => {
  /**
   * Whole-message-set snapshots. Deliberately not field-by-field assertions: the point is to
   * catch *any* change, including one to a field nobody thought to enumerate.
   */
  it('RO copy is unchanged (TEMPORARY HOLD BASELINE — not an editorial lock)', () => {
    expect(realityCaptureHubMessages('ro')).toMatchSnapshot();
  });

  it('EN copy is unchanged (TEMPORARY HOLD BASELINE — not an editorial lock)', () => {
    expect(realityCaptureHubMessages('en')).toMatchSnapshot();
  });

  /**
   * The competing archive noun, pinned by count.
   *
   * ── THE RULE IS ABOUT THE PLURAL, AND ONLY THE PLURAL ────────────────────
   * The locked governance forbids **`Documentări`** as an archive taxonomy noun competing with
   * *Proiecte*. That is the plural, and in RC's diacritic-free RO it is spelled `Documentari`. It
   * appears three times: the H-4 marker label, the carousel's accessible label, and the H-5
   * archive door's `kind`.
   *
   * `Documentarea` — the definite singular, in the three carousel item labels — is deliberately
   * NOT counted here. It names one item ("the previous documentation"), it is not a category
   * name, and folding it into this assertion would make the test enforce something stricter than
   * the decision it exists to enforce.
   *
   * Pinned in both directions: adding a fourth fails, and quietly "tidying" one away during
   * Stable RO fails too. The noun is held, which means held **in place** — its resolution belongs
   * to the RC editorial pass, not to a neighbouring cleanup.
   */
  it('keeps the archive noun `Documentari` at exactly its three Reality Capture sites', () => {
    const ro = JSON.stringify(realityCaptureHubMessages('ro'));
    expect(ro.match(/Documentari|Documentări/g)?.length ?? 0).toBe(3);
  });

  /**
   * The Stable RO surfaces, asserted from the outside. If a Stable RO edit ever reaches for the
   * RC archive noun — in a homepage work section, an A&D hub door, the archive, a Service page —
   * this fails naming the file. The Architecture & Design hub is the likeliest place for it to
   * appear, because it is the one page built from the same shared blueprint as Reality Capture.
   *
   * Scoped to the plural for the reason given above. Note for the reader who greps and finds a
   * near-miss: the Homepage's RC work module is titled `Documentare` (singular) and its prose
   * says "arhiva de documentare". Neither is the forbidden archive noun, both predate this test,
   * and both disappear on their own when the locked Homepage collapses its two work modules into
   * one selected-work section — so they are left alone rather than swept up here.
   */
  it('never lets the RC archive noun reach a stable Romanian surface', async () => {
    const stable = await Promise.all([
      import('./homepage').then((m) => m.homepageMessages),
      import('./architecture-design-hub').then((m) => m.architectureDesignHubMessages),
      import('./services-index').then((m) => m.servicesIndexMessages),
      import('./work-archive').then((m) => m.workArchiveMessages),
      import('./service').then((m) => m.serviceMessages),
    ]);

    for (const messages of stable) {
      for (const locale of LOCALES) {
        expect(JSON.stringify(messages(locale))).not.toMatch(/Documentari|Documentări/);
      }
    }
  });
});
