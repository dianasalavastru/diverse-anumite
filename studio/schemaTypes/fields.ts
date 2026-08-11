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
  ATTRIBUTIONS,
  COMMISSIONING_CONTEXTS,
  DISCIPLINES,
  ENTRY_TYPES,
  HIGHLIGHT_SLOTS,
  KNOWN_SECTORS,
  PILLARS,
  PROMINENCES,
  STATUSES,
  type Attribution,
  type CommissioningContext,
  type Discipline,
  type EntryType,
  type HighlightSlot,
  type KnownSector,
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

export const ENTRY_TYPE_OPTIONS = [
  { title: 'Design Project', value: 'design-project' },
  { title: 'Concept / Study', value: 'concept-study' },
  { title: 'Competition Entry', value: 'competition-entry' },
  { title: 'Survey / Documentation', value: 'survey-documentation' },
  { title: 'Visualization Commission', value: 'visualization-commission' },
] as const satisfies CompleteList<EntryType>

export const STATUS_OPTIONS = [
  { title: 'Built / Realized', value: 'built-realized' },
  { title: 'Unbuilt / Proposal', value: 'unbuilt-proposal' },
  { title: 'In progress', value: 'in-progress' },
  { title: 'Delivered', value: 'delivered' },
] as const satisfies CompleteList<Status>

export const ATTRIBUTION_OPTIONS = [
  { title: 'Independent', value: 'independent' },
  { title: 'Collaboration', value: 'collaboration' },
  { title: 'Studio (employed / internship)', value: 'studio' },
] as const satisfies CompleteList<Attribution>

export const DISCIPLINE_OPTIONS = [
  { title: 'Architecture', value: 'architecture' },
  { title: 'Interior Design', value: 'interior-design' },
  { title: 'Reality Capture', value: 'reality-capture' },
  { title: 'Visualization', value: 'visualization' },
] as const satisfies CompleteList<Discipline>

export const COMMISSIONING_OPTIONS = [
  { title: 'Self-initiated', value: 'self-initiated' },
  { title: 'Client-commissioned', value: 'client-commissioned' },
] as const satisfies CompleteList<CommissioningContext>

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
 * `CONTENT_MODEL.md`:53 leaves Sector open-ended ("…") and :100 makes a new sector "a new
 * *value*, not a new structure". The known values are offered for consistency; the field stays
 * a free string so adding one is a content decision, not a code change.
 */
export const SECTOR_OPTIONS = KNOWN_SECTORS.map((value) => ({
  value,
  title: value.charAt(0).toUpperCase() + value.slice(1),
})) satisfies readonly Option<KnownSector>[]

/** Re-exported so the schema files never re-derive a vocabulary from a literal. */
export const VOCABULARY_VALUES = {
  ENTRY_TYPES,
  STATUSES,
  ATTRIBUTIONS,
  DISCIPLINES,
  COMMISSIONING_CONTEXTS,
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
