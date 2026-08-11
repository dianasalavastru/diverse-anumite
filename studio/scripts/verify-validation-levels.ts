/**
 * Do the blocking validation rules actually block? — the §7.7 / F4 verification.
 *
 * OWNER: Workstream B. Run with `sanity exec`, which loads the real Studio workspace.
 *
 * WHY THIS EXISTS, AND WHY `sanity documents validate` IS NOT ENOUGH.
 *
 * The obvious way to check that a rule blocks is `npx sanity documents validate`. It reports
 * **object-typed fields' custom rules as warnings, never errors** — so the reserved-slug rule
 * on `slug` (an object of `{ro, en}`) and the primary/secondary rule on `discipline` both show
 * as `⚠`, while the same predicate on a scalar or reference field shows as `✖`.
 *
 * That is a Sanity CLI artifact, not a defect in this schema. In `validateItemObservable`:
 *
 *     addUnknownFieldsValidator = (rule) =>
 *       type?.jsonType === 'object' && … && environment !== 'studio'
 *         ? rule.custom(unknownFieldsValidator(type), {…}).warning()
 *         : rule
 *
 * `.warning()` sets the level on the **whole rule**, not just the appended unknown-fields
 * constraint — and it is applied only when `environment !== 'studio'`. The CLI runs as `cli`;
 * the Studio runs as `studio`. So the CLI downgrades every object-typed field's custom rules,
 * and the Studio does not.
 *
 * This script therefore validates the same document under **both** environments and prints the
 * levels side by side. `studio` is the column that decides whether an editor is blocked.
 *
 * ⚠ WRITES TO THE DATASET. Development only, and it deletes its own probes at the end.
 *
 *   cd studio
 *   npx sanity exec scripts/verify-validation-levels.ts --with-user-token
 */

import {getCliClient} from 'sanity/cli'
import {validateDocument, createWorkspaceFromConfig} from 'sanity'

import config from '../sanity.config'

/** Each probe violates exactly one blocking rule, so the levels cannot be confused. */
const PROBES = [
  {
    label: 'reserved curated-view slug (§7.7, IA §2.2 F4) — on an OBJECT field',
    document: {
      _id: 'da-test-probe-slug',
      _type: 'workEntry',
      title: {_type: 'localizedString', ro: 'TEST — sonda slug rezervat (a nu se publica)'},
      slug: {_type: 'object', ro: {_type: 'slug', current: 'concursuri'}},
      enPublished: false,
      discipline: {_type: 'object', primary: 'architecture', secondary: []},
      entryType: {_type: 'object', primary: 'design-project', secondary: []},
      attribution: 'independent',
      commissioning: 'self-initiated',
      sectors: ['cultural'],
      authorship: {_type: 'localizedString', ro: 'Document de test.'},
      capturePublicationCleared: false,
      metadata: {_type: 'workEntryMetadata', year: 2024, status: 'unbuilt-proposal', collaborators: [], team: []},
      curation: {_type: 'curation', featured: false, pinned: false, editorialPriority: 0, prominence: 'standard', placements: []},
    },
  },
  {
    label: 'Employer scoped to Studio attribution (CONTENT_MODEL.md:50) — on a REFERENCE field',
    document: {
      _id: 'da-test-probe-employer',
      _type: 'workEntry',
      title: {_type: 'localizedString', ro: 'TEST — sonda birou lipsa (a nu se publica)'},
      slug: {_type: 'object', ro: {_type: 'slug', current: 'test-sonda-birou'}},
      enPublished: false,
      discipline: {_type: 'object', primary: 'architecture', secondary: []},
      entryType: {_type: 'object', primary: 'design-project', secondary: []},
      attribution: 'studio',
      commissioning: 'self-initiated',
      sectors: ['office'],
      authorship: {_type: 'localizedString', ro: 'Document de test.'},
      capturePublicationCleared: false,
      metadata: {_type: 'workEntryMetadata', year: 2024, status: 'unbuilt-proposal', collaborators: [], team: []},
      curation: {_type: 'curation', featured: false, pinned: false, editorialPriority: 0, prominence: 'standard', placements: []},
    },
  },
  {
    label: 'value outside a controlled vocabulary (§7.2) — on a SCALAR field',
    document: {
      _id: 'da-test-probe-vocabulary',
      _type: 'workEntry',
      title: {_type: 'localizedString', ro: 'TEST — sonda vocabular (a nu se publica)'},
      slug: {_type: 'object', ro: {_type: 'slug', current: 'test-sonda-vocabular'}},
      enPublished: false,
      discipline: {_type: 'object', primary: 'architecture', secondary: []},
      entryType: {_type: 'object', primary: 'design-project', secondary: []},
      attribution: 'freelance',
      commissioning: 'self-initiated',
      sectors: ['cultural'],
      authorship: {_type: 'localizedString', ro: 'Document de test.'},
      capturePublicationCleared: false,
      metadata: {_type: 'workEntryMetadata', year: 2024, status: 'unbuilt-proposal', collaborators: [], team: []},
      curation: {_type: 'curation', featured: false, pinned: false, editorialPriority: 0, prominence: 'standard', placements: []},
    },
  },
] as const

async function main() {
  const client = getCliClient({apiVersion: '2025-02-19'}).withConfig({dataset: 'development'})
  if (client.config().dataset !== 'development') {
    throw new Error('This script writes probe documents. It refuses to run outside the development dataset.')
  }

  const workspace: any = await createWorkspaceFromConfig({
    ...(Array.isArray(config) ? config[0] : config),
    client,
  } as any)

  let blockedInStudio = 0

  try {
    for (const probe of PROBES) {
      await client.createOrReplace(probe.document as never)
      console.log(`\n${probe.label}`)

      for (const environment of ['studio', 'cli'] as const) {
        const markers = await validateDocument({
          document: probe.document as never,
          workspace,
          environment,
          getClient: () => client as any,
        } as any)
        const relevant = markers.filter((marker: any) => !/English body copy/.test(marker.message))
        const worst = relevant.some((marker: any) => marker.level === 'error') ? 'ERROR' : 'warning'
        console.log(`  ${environment.padEnd(7)} → ${worst}`)
        for (const marker of relevant) {
          console.log(`      ${marker.level.toUpperCase().padEnd(7)} ${(marker.path ?? []).join('.')}: ${marker.message.slice(0, 90)}`)
        }
        if (environment === 'studio' && worst === 'ERROR') blockedInStudio += 1
      }
    }
  } finally {
    for (const probe of PROBES) await client.delete(probe.document._id)
    console.log(`\nprobes deleted (${PROBES.length})`)
  }

  console.log(`\nBlocked in the Studio: ${blockedInStudio}/${PROBES.length}`)
  if (blockedInStudio !== PROBES.length) {
    throw new Error('A rule the architecture declares blocking did not block in the Studio environment.')
  }
}

main().then(
  () => process.exit(0),
  (error: Error) => {
    console.error(error.message)
    process.exit(1)
  },
)
