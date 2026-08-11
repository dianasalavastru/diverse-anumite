/**
 * Work Entry — content object A (`CONTENT_MODEL.md` §1).
 *
 * OWNER: Workstream B. `TECHNICAL_ARCHITECTURE.md` §7.1–§7.5, §19.4.
 *
 * One locale-neutral document with localized *fields*. The canonical object is the **Work
 * Entry** even though the public routes say "Proiecte" / "projects" — §11.1's terminology
 * boundary. Editor-facing labels below say "project" because that is the word the owner uses;
 * the schema name does not follow the label.
 *
 * Field groups exist for the editor, not for the model: `PROJECT_CONTEXT.md`:167 requires the
 * owner to add and edit work without touching code, and a flat list of thirty fields is a
 * different kind of barrier than a code deploy but a barrier all the same.
 */

import { defineArrayMember, defineField, defineType } from 'sanity'

import {
  ATTRIBUTION_OPTIONS,
  COMMISSIONING_OPTIONS,
  DISCIPLINE_OPTIONS,
  ENTRY_TYPE_OPTIONS,
  enPublishedField,
  localizedSlugField,
} from './fields'
import { DISCIPLINE_TO_PILLAR, type Discipline } from '../../src/lib/content/types'
import { SANITY_API_VERSION } from '../../src/lib/content/config'
import {
  SLUG_PATTERN,
  toSanityResult,
  toSanityWarning,
  validateAssignment,
  validateAuthorship,
  validateCaptureGate,
  validateEmployerScope,
  validateEnAvailability,
  validateNotRawCaptureSource,
  validateVocabulary,
  validateWorkEntrySlug,
} from '../../src/lib/content/validation'

/** Shape of the document as the Studio hands it to a validator. */
interface WorkEntryDraft {
  readonly _id?: string
  readonly title?: { ro?: string; en?: string }
  readonly slug?: { ro?: { current?: string }; en?: { current?: string } }
  readonly enPublished?: boolean
  readonly discipline?: { primary?: string; secondary?: string[] }
  readonly entryType?: { primary?: string; secondary?: string[] }
  readonly attribution?: string
  readonly employer?: { _ref?: string }
  readonly authorship?: { ro?: string; en?: string }
  readonly description?: { ro?: unknown[]; en?: unknown[] }
  readonly capture?: {
    pointCount?: number
    derivative?: { asset?: { asset?: { _ref?: string } }; poster?: { asset?: { _ref?: string } } }
  }
  readonly capturePublicationCleared?: boolean
}

const isRealityCapture = (document: WorkEntryDraft | undefined): boolean => {
  const discipline = document?.discipline
  return (
    discipline?.primary === 'reality-capture' ||
    (discipline?.secondary ?? []).includes('reality-capture')
  )
}

/** §7.4's derivation table, applied for the editor-visible readout. Never stored. */
function derivedPillarLabel(document: WorkEntryDraft | undefined): string {
  const primary = document?.discipline?.primary as Discipline | undefined
  if (!primary || !(primary in DISCIPLINE_TO_PILLAR)) return 'capability not yet determined'
  const pillar = DISCIPLINE_TO_PILLAR[primary]
  const secondary = (document?.discipline?.secondary ?? [])
    .map((value) => DISCIPLINE_TO_PILLAR[value as Discipline])
    .filter((value) => value && value !== pillar)

  const label = pillar === 'reality-capture' ? 'Reality Capture' : 'Architecture & Design'
  return secondary.length > 0 ? `${label} (also shown under the other capability)` : label
}

export const workEntry = defineType({
  name: 'workEntry',
  title: 'Project',
  type: 'document',
  groups: [
    { name: 'identity', title: 'Name & address', default: true },
    { name: 'classification', title: 'What it is' },
    { name: 'evidence', title: 'The work' },
    { name: 'credits', title: 'Credit' },
    { name: 'capture', title: 'Survey', hidden: ({ document }) => !isRealityCapture(document as WorkEntryDraft) },
    { name: 'relationships', title: 'Links' },
    { name: 'facts', title: 'Facts' },
    { name: 'curation', title: 'Emphasis' },
    { name: 'seo', title: 'Search' },
  ],

  fields: [
    /* ── Identity ─────────────────────────────────────────────────────────── */
    defineField({
      name: 'title',
      title: 'Title',
      type: 'localizedString',
      group: 'identity',
      validation: (Rule) =>
        Rule.custom((value: { ro?: string } | undefined) =>
          value?.ro?.trim() ? true : 'A Romanian title is required.',
        ),
    }),

    {
      ...localizedSlugField({ sourceField: 'title' }),
      group: 'identity',
      /**
       * §7.7 / IA §2.2 (F4): curated-view slugs are reserved **per locale** and validated before
       * publication. The reserved list is generated from the frozen locale route map, so it
       * cannot fall out of step with the router.
       */
      validation: (Rule: import('sanity').Rule) =>
        Rule.custom((value: WorkEntryDraft['slug']) => {
          const issues = [
            ...(value?.ro?.current ? validateWorkEntrySlug(value.ro.current, 'ro', 'slug.ro') : []),
            ...(value?.en?.current ? validateWorkEntrySlug(value.en.current, 'en', 'slug.en') : []),
          ]
          return toSanityResult(issues)
        }),
    },

    {
      ...enPublishedField('project'),
      group: 'identity',
      validation: (Rule: import('sanity').Rule) => [
        Rule.custom((_value: boolean | undefined, context: { document?: unknown }) => {
          const document = context.document as WorkEntryDraft | undefined
          return toSanityResult(
            validateEnAvailability({
              enPublished: document?.enPublished ?? false,
              titleEn: Boolean(document?.title?.en?.trim()),
              slugEn: Boolean(document?.slug?.en?.current),
              bodyEn: (document?.description?.en ?? []).length > 0,
            }),
          )
        }),
        Rule.custom((_value: boolean | undefined, context: { document?: unknown }) => {
          const document = context.document as WorkEntryDraft | undefined
          return toSanityWarning(
            validateEnAvailability({
              enPublished: document?.enPublished ?? false,
              titleEn: Boolean(document?.title?.en?.trim()),
              slugEn: Boolean(document?.slug?.en?.current),
              bodyEn: (document?.description?.en ?? []).length > 0,
            }),
          )
        }).warning(),
      ],
    },

    /* ── Classification — CONTENT_MODEL.md §3 ─────────────────────────────── */
    defineField({
      name: 'discipline',
      title: 'Field of work',
      type: 'object',
      group: 'classification',
      description:
        'Which capability this belongs to is worked out from this, and is never set by hand: Architecture, Interior Design and Visualization all sit under Architecture & Design; Reality Capture sits under Reality Capture. Add a second field of work to have the project appear under both capabilities.',
      fields: [
        defineField({
          name: 'primary',
          title: 'Main field',
          type: 'string',
          options: { list: [...DISCIPLINE_OPTIONS], layout: 'radio' },
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'secondary',
          title: 'Also',
          type: 'array',
          of: [defineArrayMember({ type: 'string' })],
          options: { list: [...DISCIPLINE_OPTIONS] },
        }),
      ],
      validation: (Rule) =>
        Rule.custom((value: WorkEntryDraft['discipline']) =>
          toSanityResult(
            validateAssignment(value?.primary, value?.secondary, 'discipline', 'discipline'),
          ),
        ),
    }),

    defineField({
      name: 'entryType',
      title: 'Kind of project',
      type: 'object',
      group: 'classification',
      description:
        'What the project *is* — not how far along it is. Whether something was built belongs under Facts → Status.',
      fields: [
        defineField({
          name: 'primary',
          title: 'Mainly',
          type: 'string',
          options: { list: [...ENTRY_TYPE_OPTIONS], layout: 'radio' },
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'secondary',
          title: 'Also',
          type: 'array',
          of: [defineArrayMember({ type: 'string' })],
          options: { list: [...ENTRY_TYPE_OPTIONS] },
        }),
      ],
      validation: (Rule) =>
        Rule.custom((value: WorkEntryDraft['entryType']) =>
          toSanityResult(validateAssignment(value?.primary, value?.secondary, 'entryType', 'entryType')),
        ),
    }),

    defineField({
      name: 'sectors',
      title: 'Sector',
      type: 'array',
      group: 'classification',
      of: [defineArrayMember({ type: 'string' })],
      options: { layout: 'tags' },
      description:
        'The kind of place or programme: residential · hospitality · office · cultural · heritage · industrial · infrastructure · education, or a new one. Lowercase, hyphenated.',
      validation: (Rule) =>
        Rule.custom((value: string[] | undefined) => {
          const bad = (value ?? []).filter((sector) => !SLUG_PATTERN.test(sector))
          return bad.length === 0
            ? true
            : `Use lowercase hyphenated values so a sector is one thing everywhere. Fix: ${bad.join(', ')}.`
        }),
    }),

    /* ── Credit — the three-way split, CONTENT_MODEL.md:60 ────────────────── */
    defineField({
      name: 'attribution',
      title: 'Whose work is it',
      type: 'string',
      group: 'credits',
      options: { list: [...ATTRIBUTION_OPTIONS], layout: 'radio' },
      description: 'Shown on the page. This is never offered to visitors as a filter.',
      validation: (Rule) =>
        Rule.required().custom((value: string | undefined) =>
          toSanityResult(validateVocabulary(value, 'attribution', 'attribution')),
        ),
    }),

    defineField({
      name: 'commissioning',
      title: 'How it came about',
      type: 'string',
      group: 'credits',
      options: { list: [...COMMISSIONING_OPTIONS], layout: 'radio' },
      validation: (Rule) =>
        Rule.required().custom((value: string | undefined) =>
          toSanityResult(validateVocabulary(value, 'commissioning', 'commissioning')),
        ),
    }),

    defineField({
      name: 'employer',
      title: 'Office',
      type: 'reference',
      to: [{ type: 'employer' }],
      group: 'credits',
      description:
        'Only for work done inside an office. Professional Experience groups projects by this.',
      hidden: ({ document }) => (document as WorkEntryDraft)?.attribution !== 'studio',
      validation: (Rule) =>
        Rule.custom((value: { _ref?: string } | undefined, context: { document?: unknown }) =>
          toSanityResult(
            validateEmployerScope((context.document as WorkEntryDraft)?.attribution, Boolean(value?._ref)),
          ),
        ),
    }),

    defineField({
      name: 'roles',
      title: 'What you did',
      type: 'localizedStringList',
      group: 'credits',
      description: 'The specific things you performed. Shown on the page; never a filter.',
    }),

    defineField({
      name: 'authorship',
      title: 'Credit statement',
      type: 'localizedString',
      group: 'credits',
      description:
        'One sentence saying exactly what is yours and what is not — e.g. "Visualization by [you]; building design by [firm]". This is what keeps the site honest about visualization, collaboration and office work.',
      validation: (Rule) => [
        Rule.custom((value: { ro?: string } | undefined, context: { document?: unknown }) => {
          const document = context.document as WorkEntryDraft | undefined
          return toSanityResult(
            validateAuthorship(
              document?.entryType?.primary,
              document?.attribution,
              Boolean(value?.ro?.trim()),
            ),
          )
        }),
        Rule.custom((value: { ro?: string } | undefined, context: { document?: unknown }) => {
          const document = context.document as WorkEntryDraft | undefined
          return toSanityWarning(
            validateAuthorship(
              document?.entryType?.primary,
              document?.attribution,
              Boolean(value?.ro?.trim()),
            ),
          )
        }).warning(),
      ],
    }),

    /* ── Evidence ─────────────────────────────────────────────────────────── */
    defineField({ name: 'description', title: 'Description', type: 'localizedRichText', group: 'evidence' }),
    defineField({
      name: 'cover',
      title: 'Cover image',
      type: 'imageWithAlt',
      group: 'evidence',
      description: 'The image that represents this project in every list and card.',
    }),
    defineField({
      name: 'gallery',
      title: 'Images & drawings',
      type: 'array',
      of: [defineArrayMember({ type: 'imageWithAlt' })],
      group: 'evidence',
      options: { layout: 'grid' },
    }),

    /* ── Reality Capture — §10, §19.4 ─────────────────────────────────────── */
    defineField({ name: 'capture', title: 'Survey details', type: 'captureMetadata', group: 'capture' }),
    defineField({
      name: 'capturePublicationCleared',
      title: 'Cleared to publish the point cloud',
      type: 'boolean',
      group: 'capture',
      initialValue: false,
      description:
        'A point cloud can be measured, which makes publishing one different from publishing a photograph of the same building — clients, especially institutional and heritage ones, may restrict it. Until this is on, the point cloud stays unpublished; the accuracy, equipment and point count still appear.',
    }),

    /* ── Relationships — IA §2.3, Step 6 ──────────────────────────────────── */
    defineField({
      name: 'services',
      title: 'Services this demonstrates',
      type: 'array',
      group: 'relationships',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'service' }] })],
      description:
        'Each service page shows the projects that demonstrate it. The link is stored here only — you never edit it from the service side.',
    }),
    defineField({
      name: 'relatedWork',
      title: 'Related projects',
      type: 'array',
      group: 'relationships',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'workEntry' }],
          options: {
            filter: ({ document }: { document: { _id: string } }) => ({
              filter: '_id != $self && _id != $draft',
              params: {
                self: document._id.replace(/^drafts\./, ''),
                draft: `drafts.${document._id.replace(/^drafts\./, '')}`,
              },
            }),
          },
        }),
      ],
      description:
        'Work that broadens understanding of this one — often the most contextualising, not the most similar. A survey and the renovation that followed it belong here.',
    }),

    /* ── Facts, curation, SEO ─────────────────────────────────────────────── */
    defineField({
      name: 'metadata',
      title: 'Facts',
      type: 'workEntryMetadata',
      group: 'facts',
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'curation', title: 'Emphasis & order', type: 'curation', group: 'curation' }),
    defineField({ name: 'seo', title: 'Search engine listing', type: 'seo', group: 'seo' }),
  ],

  /**
   * Document-level rules — the ones that need more than one field, or an asset lookup.
   *
   * §19.4's raw-source prohibition can only be checked here: the upload's original filename
   * lives on the asset document, not in the field value.
   */
  validation: (Rule) =>
    Rule.custom(async (document: WorkEntryDraft | undefined, context) => {
      const derivative = document?.capture?.derivative
      const assetRef = derivative?.asset?.asset?._ref

      let filenameIssues: ReturnType<typeof validateNotRawCaptureSource> = []
      if (assetRef) {
        const client = context.getClient({ apiVersion: SANITY_API_VERSION })
        const originalFilename = await client.fetch<string | null>(
          '*[_id == $ref][0].originalFilename',
          { ref: assetRef },
        )
        filenameIssues = validateNotRawCaptureSource(originalFilename, 'capture.derivative.asset')
      }

      return toSanityResult([
        ...filenameIssues,
        ...validateCaptureGate({
          hasDerivative: Boolean(assetRef),
          hasPoster: Boolean(derivative?.poster?.asset?._ref),
          cleared: document?.capturePublicationCleared ?? false,
          pointCount: document?.capture?.pointCount ?? null,
        }),
      ])
    }),

  /**
   * §7.4: "The Studio shows an **editor-visible read-only readout** so the owner can see which
   * pillar an entry will default to." The subtitle carries it, computed from the same derivation
   * table the build uses — it is displayed, never stored, because Pillar is not an editable field.
   */
  preview: {
    select: {
      title: 'title.ro',
      primary: 'discipline.primary',
      secondary: 'discipline.secondary',
      year: 'metadata.year',
      media: 'cover',
      enPublished: 'enPublished',
    },
    prepare: (selection: Record<string, unknown>) => {
      const document = {
        discipline: {
          primary: selection.primary as string | undefined,
          secondary: (selection.secondary as string[] | undefined) ?? [],
        },
      }
      const en = selection.enPublished ? '' : ' · RO only'
      return {
        title: (selection.title as string) || 'Untitled project',
        subtitle: `${selection.year ?? '—'} · ${derivedPillarLabel(document)}${en}`,
        media: selection.media as never,
      }
    },
  },
})
