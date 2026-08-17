/**
 * Shared field factories and the Studio's option lists.
 *
 * OWNER: Workstream B. `TECHNICAL_ARCHITECTURE.md` §7.2, §7.7, §19.2.
 *
 * Two rules govern this file:
 *
 *   1. **No vocabulary is declared here.** Every option list is built from the frozen unions in
 *      `src/lib/content/types.ts`, which are themselves transcribed from `CONTENT_MODEL.md` §3.
 *      A `satisfies` constraint makes an incomplete list a compile error, so a value cannot be
 *      added to the model and quietly missed in the Studio, or vice versa.
 *   2. **No validation rule is restated here.** The predicates live in
 *      `src/lib/content/validation.ts` and are shared with the build (§7.7's "one source, read
 *      by both the router and the validator", generalised).
 *
 * The titles below are **editor-facing Studio labels**, transcribed from the canonical English
 * names in `CONTENT_MODEL.md` §3. They are not site copy: visitor-facing RO/EN labels are
 * Workstream C's, rendered through Workstream A's i18n layer.
 */

import { defineField, type SlugValidationContext } from 'sanity'

import { SANITY_API_VERSION } from '../../src/lib/content/config'
import {
  PROJECT_LABELS,
  HIGHLIGHT_SLOTS,
  SECTORS,
  SERVICE_KEYS,
  PILLARS,
  PROMINENCES,
  STATUSES,
  type ProjectLabel,
  type HighlightSlot,
  type Sector,
  type ServiceKey,
  type Pillar,
  type Prominence,
  type Status,
} from '../../src/lib/content/types'

/* ────────────────────────────────────────────────────────────────────────────
 * Option lists — CONTENT_MODEL.md §3, via the frozen unions
 * ──────────────────────────────────────────────────────────────────────────── */

interface Option<T extends string> {
  readonly title: string
  readonly value: T
}

/** A list must name every value of its union; TypeScript enforces it. */
type CompleteList<T extends string> = readonly Option<T>[] & { length: number }

/**
 * Project Labels (v3.1 §10) — the optional flags that replaced the Entry Type axis at Stage 4.
 *
 * Titles are the editor-facing Studio labels, transcribed from the model document. RO carries
 * diacritics here because this string is read only inside the Studio by the owner, not served
 * as site copy — OD-8's no-diacritics rule governs the latter.
 */
export const LABEL_OPTIONS = [
  { title: 'CONCURS', value: 'competition' },
  { title: 'PROIECT DE DIPLOMĂ', value: 'diploma-project' },
] as const satisfies CompleteList<ProjectLabel>

/**
 * Status (v3.1 §11.2) — **replaced wholesale at Stage 7**. Four values, both Pillars, no
 * capture-workflow additions (`DECISIONS_LOG.md` #94).
 *
 * Diacritics are kept here because these strings are read only inside the Studio by the owner;
 * OD-8's no-diacritics rule governs site copy, which lives in `src/lib/i18n/vocabulary.ts`.
 */
export const STATUS_OPTIONS = [
  { title: 'În dezvoltare', value: 'in-dezvoltare' },
  { title: 'În desfășurare', value: 'in-desfasurare' },
  { title: 'Finalizat', value: 'finalizat' },
  { title: 'Nerealizat', value: 'nerealizat' },
] as const satisfies CompleteList<Status>

export const PILLAR_OPTIONS = [
  { title: 'Architecture & Design', value: 'architecture-design' },
  { title: 'Reality Capture', value: 'reality-capture' },
] as const satisfies CompleteList<Pillar>

export const PROMINENCE_OPTIONS = [
  { title: 'Feature — the largest tile', value: 'feature' },
  { title: 'Large', value: 'large' },
  { title: 'Standard', value: 'standard' },
  { title: 'Small', value: 'small' },
] as const satisfies CompleteList<Prominence>

export const HIGHLIGHT_SLOT_OPTIONS = [
  { title: 'Homepage', value: 'homepage' },
  { title: 'Pillar hub', value: 'pillar-hub' },
] as const satisfies CompleteList<HighlightSlot>

/**
 * Sector (v3.1 §11.1) — **closed at Stage 6**. Seven values, one global vocabulary, read by the
 * project's single `sector` and by the Service's plural `sectors` alike.
 *
 * Titles are authored, not derived. The old list was built with
 * `value.charAt(0).toUpperCase() + value.slice(1)`, which cannot produce "Comercial &
 * ospitalitate" from `comercial-ospitalitate` — it would have shown the editor a machine token
 * with one capital letter. Diacritics are kept here because this string is read only inside the
 * Studio by the owner; OD-8's no-diacritics rule governs site copy, which lives in
 * `src/lib/i18n/vocabulary.ts`.
 */
export const SECTOR_OPTIONS = [
  { title: 'Rezidențial', value: 'rezidential' },
  { title: 'Comercial & ospitalitate', value: 'comercial-ospitalitate' },
  { title: 'Birouri & business', value: 'birouri-business' },
  { title: 'Public & comunitar', value: 'public-comunitar' },
  { title: 'Industrial & logistic', value: 'industrial-logistic' },
  { title: 'Cultural & patrimoniu', value: 'cultural-patrimoniu' },
  { title: 'Mixed-use & dezvoltări', value: 'mixed-use-dezvoltari' },
] as const satisfies CompleteList<Sector>

/**
 * Service machine keys (v3.1 §14.3) — the stable identity field activation reads.
 *
 * Titles are the Romanian Service names the owner knows. The **value** is what everything else
 * depends on and never changes; the title is only how the key is recognised in the picker.
 */
export const SERVICE_KEY_OPTIONS = [
  { title: 'Proiectare de arhitectură', value: 'proiectare-arhitectura' },
  { title: 'Design interior', value: 'design-interior' },
  { title: 'Vizualizare 3D', value: 'vizualizare-3d' },
  { title: 'Design mobilier', value: 'design-mobilier' },
  { title: 'Scanare laser 3D', value: 'scanare-laser-3d' },
  { title: 'Scan-to-BIM', value: 'scan-to-bim' },
  { title: 'Fotografie de arhitectură', value: 'fotografie-arhitectura' },
  { title: 'Vizualizare de arhitectură', value: 'vizualizare-arhitectura' },
] as const satisfies CompleteList<ServiceKey>

/** Re-exported so the schema files never re-derive a vocabulary from a literal. */
export const VOCABULARY_VALUES = {
  PROJECT_LABELS,
  SECTORS,
  SERVICE_KEYS,
  STATUSES,
  PILLARS,
  PROMINENCES,
  HIGHLIGHT_SLOTS,
} as const

/* ────────────────────────────────────────────────────────────────────────────
 * Slug uniqueness — per locale
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * Slugs are localized (§7.1), so uniqueness is per locale *and* per field path: two Work
 * Entries may not share `slug.ro.current`, and independently may not share `slug.en.current`.
 * Sanity's default `isUnique` assumes a single top-level `slug` field and would compare the
 * wrong path here.
 *
 * The path segment is taken from the schema's own validation context, never from user input,
 * and is allowlisted before interpolation regardless.
 */
export async function isLocalizedSlugUnique(
  slug: string,
  context: SlugValidationContext,
): Promise<boolean> {
  const { document, getClient, path } = context
  if (!document) return true

  const fieldPath = (path ?? [])
    .filter((segment): segment is string => typeof segment === 'string')
    .join('.')

  if (!/^[a-zA-Z0-9_.]+$/.test(fieldPath)) return true

  const id = document._id.replace(/^drafts\./, '')
  const client = getClient({ apiVersion: SANITY_API_VERSION })

  return client.fetch<boolean>(
    `!defined(*[_type == $type && !(_id in [$id, $draftId]) && ${fieldPath}.current == $slug][0]._id)`,
    { type: document._type, id, draftId: `drafts.${id}`, slug },
  )
}

/* ────────────────────────────────────────────────────────────────────────────
 * Field factories
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * The localized slug pair. `source` names the field the RO/EN slug is generated from, so the
 * editor gets a working "Generate" button in both languages.
 *
 * Reserved-slug and format validation are attached by the *document*, not here, because the
 * reservation protects the `/proiecte/` namespace specifically (§7.7).
 */
export function localizedSlugField(options: {
  readonly name?: string
  readonly title?: string
  readonly sourceField: string
  readonly description?: string
}) {
  return defineField({
    name: options.name ?? 'slug',
    title: options.title ?? 'URL slug',
    type: 'object',
    description:
      options.description ??
      'The address this page lives at, per language. Romanian and English are independent — changing one never changes the other.',
    options: { columns: 2 },
    fields: [
      defineField({
        name: 'ro',
        title: 'Romanian',
        type: 'slug',
        options: {
          source: (doc: Record<string, unknown>) =>
            ((doc[options.sourceField] as Record<string, string> | undefined)?.ro ?? '') as string,
          maxLength: 96,
          isUnique: isLocalizedSlugUnique,
        },
        validation: (Rule) => Rule.required().error('A Romanian slug is required — Romanian is the root locale.'),
      }),
      defineField({
        name: 'en',
        title: 'English',
        type: 'slug',
        description: 'Required only when the entry is published in English.',
        options: {
          source: (doc: Record<string, unknown>) =>
            ((doc[options.sourceField] as Record<string, string> | undefined)?.en ?? '') as string,
          maxLength: 96,
          isUnique: isLocalizedSlugUnique,
        },
      }),
    ],
  })
}

/** `enPublished` — the EN page-generation gate (§7.1). One boolean, stated plainly for the editor. */
export function enPublishedField(what: string) {
  return defineField({
    name: 'enPublished',
    title: 'Published in English',
    type: 'boolean',
    initialValue: false,
    description:
      `When this is off, no English page is generated for this ${what}: it is left out of the English sitemap, ` +
      'no language pair is declared, and the language switcher is disabled for it. Romanian is never affected. ' +
      'Romanian text is never shown on an English address.',
  })
}
