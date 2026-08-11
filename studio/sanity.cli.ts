/**
 * Sanity CLI configuration — used by `sanity dev`, `sanity build`, `sanity deploy` and
 * `sanity dataset export` (the backup path, §20).
 *
 * OWNER: Workstream B. Carries identifiers only, never a token.
 */

import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  },
  /**
   * The Studio is a separate application; its build output never enters the web app's.
   *
   * `autoUpdates` moved under `deployment` in @sanity/cli 7.x — the top-level form still works
   * but warns on every `sanity build`. Corrected at B3 rather than carried as noise.
   */
  deployment: { autoUpdates: false },
})
