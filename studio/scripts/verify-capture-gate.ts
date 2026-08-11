/**
 * §19.4 capture-publication gate — the end-to-end verification.
 *
 * OWNER: Workstream B. Run with `sanity exec`, which loads the real Studio workspace, so the
 * validation this reports is the validation an editor actually sees.
 *
 * WHY THIS EXISTS. `studio/seed/b3-test-dataset.ndjson` cannot carry a file asset, so the seed
 * can only ever exercise the "no derivative attached" case. That gap is not cosmetic: at B3 it
 * hid a real defect. `POINT_CLOUD_DERIVATIVE_FIELDS.assetUrl` projected `asset->url` when
 * `derivative.asset` is a *file field* whose reference sits one level deeper
 * (`asset.asset->url`). Because `normalizeCapture` gates on `assetUrl` being truthy, the gate
 * appeared to pass while silently withholding **every** derivative, cleared or not — and no
 * fixture could catch it, since fixtures author `assetUrl` directly and never dereference.
 *
 * ⚠ WRITES TO THE DATASET. Development only. `teardown` restores the seed state exactly.
 *
 *   cd studio
 *   npx sanity exec scripts/verify-capture-gate.ts --with-user-token -- setup
 *   npx sanity exec scripts/verify-capture-gate.ts --with-user-token -- clear
 *   npx sanity exec scripts/verify-capture-gate.ts --with-user-token -- unclear
 *   npx sanity exec scripts/verify-capture-gate.ts --with-user-token -- rawname
 *   npx sanity exec scripts/verify-capture-gate.ts --with-user-token -- teardown
 *
 * Between `setup`/`clear`/`unclear`, run the build-side half from the repository root:
 *
 *   npx vitest run src/lib/content/live.test.ts -t "capture"
 *
 * That test reads ground truth straight from the Content Lake through a *different* path
 * expression than the projection under test, so a projection bug cannot suppress its own
 * evidence — which is exactly how the original defect stayed hidden.
 */

import {getCliClient} from 'sanity/cli'
import {validateDocument, createWorkspaceFromConfig} from 'sanity'

import config from '../sanity.config'

/** A 2×2 PNG and a few bytes of text. Neither is a real survey; §10.4 forbids fabricated readouts. */
const POSTER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR42mP8z8BQz0AEYBxVSF+FABJyAwEDflRxAAAAAElFTkSuQmCC',
  'base64',
)
const DERIVATIVE = Buffer.from('POINTCLOUD-WEB-DERIVATIVE-TEST-FIXTURE-NOT-A-REAL-SURVEY')

/** The seeded Reality Capture entry. Nothing here touches any other document. */
const TARGET = 'da-test-work-rc'

const MODES = ['setup', 'clear', 'unclear', 'rawname', 'teardown'] as const
type Mode = (typeof MODES)[number]

const mode = process.argv[process.argv.length - 1] as Mode
if (!MODES.includes(mode)) {
  console.error(`Usage: sanity exec scripts/verify-capture-gate.ts --with-user-token -- <${MODES.join('|')}>`)
  process.exit(1)
}

async function main() {
  const client = getCliClient({apiVersion: '2025-02-19'}).withConfig({dataset: 'development'})

  if (client.config().dataset !== 'development') {
    throw new Error('This script writes test data. It refuses to run outside the development dataset.')
  }

  const workspace: any = await createWorkspaceFromConfig({
    ...(Array.isArray(config) ? config[0] : config),
    client,
  } as any)

  /** Reports what the Studio itself would block, not what a unit test asserts. */
  async function report(label: string) {
    const document = await client.getDocument(TARGET)
    const markers = await validateDocument({
      document: document!,
      workspace,
      environment: 'studio',
      getClient: () => client as any,
    } as any)
    const blocking = markers.filter((marker: any) => marker.level === 'error')
    console.log(`\nStudio validation — ${label}:`)
    if (blocking.length === 0) console.log('  (no blocking errors)')
    for (const marker of blocking) {
      console.log(`  ERROR ${(marker.path ?? []).join('.') || '(document)'}: ${marker.message}`)
    }
  }

  if (mode === 'setup') {
    const file = await client.assets.upload('file', DERIVATIVE, {filename: 'da-test-cloud-derivative.bin'})
    const poster = await client.assets.upload('image', POSTER, {filename: 'da-test-cloud-poster.png'})
    await client
      .patch(TARGET)
      .set({
        'capture.derivative': {
          _type: 'pointCloudDerivative',
          asset: {_type: 'file', asset: {_type: 'reference', _ref: file._id}},
          poster: {
            _type: 'imageWithAlt',
            asset: {_type: 'reference', _ref: poster._id},
            alt: {_type: 'localizedString', ro: 'Imagine de test'},
          },
        },
        'capture.pointCount': 1234,
        capturePublicationCleared: false,
      })
      .commit()
    await report('derivative attached, NOT cleared (expect: blocked)')
  }

  if (mode === 'clear') {
    await client.patch(TARGET).set({capturePublicationCleared: true}).commit()
    await report('derivative attached, CLEARED (expect: no errors)')
  }

  if (mode === 'unclear') {
    await client.patch(TARGET).set({capturePublicationCleared: false}).commit()
    await report('derivative attached, un-cleared again (expect: blocked)')
  }

  if (mode === 'rawname') {
    // §19.4: "Raw E57/LAS/LAZ source surveys never enter the CMS." The rule reads the asset's
    // original filename, so it can only be exercised with a real upload.
    const raw = await client.assets.upload('file', DERIVATIVE, {filename: 'da-test-original-survey.e57'})
    await client
      .patch(TARGET)
      .set({'capture.derivative.asset': {_type: 'file', asset: {_type: 'reference', _ref: raw._id}}})
      .commit()
    await report('a raw .e57 uploaded as the derivative (expect: blocked)')
  }

  if (mode === 'teardown') {
    await client.patch(TARGET).unset(['capture.derivative', 'capture.pointCount']).set({capturePublicationCleared: false}).commit()
    const assets = await client.fetch<{_id: string}[]>(
      '*[_type in ["sanity.fileAsset", "sanity.imageAsset"] && originalFilename match "da-test-*"]{_id}',
    )
    for (const asset of assets) await client.delete(asset._id)
    console.log(`teardown: derivative unset, ${assets.length} test asset(s) deleted`)
    await report('restored to seed state (expect: no errors)')
  }
}

main().then(
  () => process.exit(0),
  (error: Error) => {
    console.error(error.message)
    process.exit(1)
  },
)
