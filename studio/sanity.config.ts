/**
 * Sanity Studio configuration — `TECHNICAL_ARCHITECTURE.md` §7, §18.
 *
 * OWNER: Workstream B.
 *
 * SECRETS. Nothing here is a credential. `projectId` and `dataset` are public identifiers and
 * are read from `SANITY_STUDIO_*` variables (Sanity's required prefix for values bundled into
 * the Studio). The Studio authenticates the *editor*, through Sanity's own login — it never
 * carries a token. §18's three tokens live elsewhere and none of them belongs in this file:
 * the read-only Viewer token in the build environment, the draft token in the preview
 * environment only, and the Editor/write token nowhere in this system at all.
 *
 * DATASET VISIBILITY. §18.1 chooses a **private** dataset. That is a setting on the dataset in
 * Sanity's project management, not a value declared here — see `README.md` in this folder for
 * the one-time setup, and note that it must be verified after creation, because a public
 * dataset would expose `Client`, curation metadata and `capturePublicationCleared` to arbitrary
 * public GROQ.
 */

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'

import { SANITY_API_VERSION } from '../src/lib/content/config'
import { schemaTypes } from './schemaTypes'
import { structure } from './structure'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? ''
const dataset = process.env.SANITY_STUDIO_DATASET ?? 'production'

if (!projectId) {
  throw new Error(
    'SANITY_STUDIO_PROJECT_ID is not set. Copy studio/.env.example to studio/.env and fill it in — see studio/README.md.',
  )
}

export default defineConfig({
  name: 'diverse-anumite',
  title: 'diverse anumite',

  projectId,
  dataset,

  plugins: [
    structureTool({ structure }),
    /**
     * Vision runs GROQ against the dataset from inside the Studio, as the logged-in editor. It
     * is pinned to the same API version the build uses so a query tested here behaves the same
     * way there (§8).
     */
    visionTool({ defaultApiVersion: SANITY_API_VERSION }),
  ],

  schema: {
    types: schemaTypes,
  },

})
