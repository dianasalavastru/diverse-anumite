/**
 * Service — content object B, a first-class peer of the Work Entry (`CONTENT_MODEL.md` §2).
 *
 * OWNER: Workstream B.
 *
 * `DECISIONS_LOG.md` #36: "one canonical Service object referenced (not copied)". The Service
 * therefore holds **no** list of the work that demonstrates it: that relationship is stored on
 * the Work Entry and read in reverse (IA Step 6, #38). Giving the Service its own copy would
 * create two records of one fact, which is the drift the model exists to prevent.
 */

import { defineArrayMember, defineField, defineType } from 'sanity'

import { PILLAR_OPTIONS, enPublishedField, localizedSlugField } from './fields'
import { SANITY_API_VERSION } from '../../src/lib/content/config'
import {
  SLUG_PATTERN,
  toSanityResult,
  toSanityWarning,
  validateEnAvailability,
  validateServiceDemonstration,
  validateSlugFormat,
  validateVocabulary,
} from '../../src/lib/content/validation'

interface ServiceDraft {
  readonly _id?: string
  readonly name?: { ro?: string; en?: string }
  readonly slug?: { ro?: { current?: string }; en?: { current?: string } }
  readonly enPublished?: boolean
  readonly description?: { ro?: unknown[]; en?: unknown[] }
}

export const service = defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  groups: [
    { name: 'identity', title: 'Name & address', default: true },
    { name: 'offering', title: 'What it is' },
    { name: 'proof', title: 'Proof' },
    { name: 'curation', title: 'Emphasis' },
    { name: 'seo', title: 'Search' },
  ],

  fields: [
    defineField({
      name: 'name',
      title: 'Service name',
      type: 'localizedString',
      group: 'identity',
      validation: (Rule) =>
        Rule.custom((value: { ro?: string } | undefined) =>
          value?.ro?.trim() ? true : 'A Romanian name is required.',
        ),
    }),

    {
      ...localizedSlugField({ sourceField: 'name' }),
      group: 'identity',
      /**
       * Services live in `/servicii/` — a namespace with no curated routes, so the per-locale
       * reservation (§7.7) does not apply to them. Format is still enforced, because IA §2.2
       * governs every URL on the site.
       */
      validation: (Rule: import('sanity').Rule) =>
        Rule.custom((value: ServiceDraft['slug']) =>
          toSanityResult([
            ...(value?.ro?.current ? validateSlugFormat(value.ro.current, 'slug.ro') : []),
            ...(value?.en?.current ? validateSlugFormat(value.en.current, 'slug.en') : []),
          ]),
        ),
    },

    {
      ...enPublishedField('service'),
      group: 'identity',
      validation: (Rule: import('sanity').Rule) => [
        Rule.custom((_value: boolean | undefined, context: { document?: unknown }) => {
          const document = context.document as ServiceDraft | undefined
          return toSanityResult(
            validateEnAvailability({
              enPublished: document?.enPublished ?? false,
              titleEn: Boolean(document?.name?.en?.trim()),
              slugEn: Boolean(document?.slug?.en?.current),
              bodyEn: (document?.description?.en ?? []).length > 0,
            }),
          )
        }),
        Rule.custom((_value: boolean | undefined, context: { document?: unknown }) => {
          const document = context.document as ServiceDraft | undefined
          return toSanityWarning(
            validateEnAvailability({
              enPublished: document?.enPublished ?? false,
              titleEn: Boolean(document?.name?.en?.trim()),
              slugEn: Boolean(document?.slug?.en?.current),
              bodyEn: (document?.description?.en ?? []).length > 0,
            }),
          )
        }).warning(),
      ],
    },

    /**
     * IA §2.3: "Service → Pillar." Authored, not derived — a Service carries no Discipline, so
     * §7.4's derivation has nothing to work from. This is also the target of the F1 back-path.
     */
    defineField({
      name: 'pillar',
      title: 'Capability',
      type: 'string',
      group: 'identity',
      options: { list: [...PILLAR_OPTIONS], layout: 'radio' },
      description: 'Which capability hub this service belongs to, and links back to.',
      validation: (Rule) =>
        Rule.required().custom((value: string | undefined) =>
          toSanityResult(validateVocabulary(value, 'pillar', 'pillar')),
        ),
    }),

    /* ── The offering — SERVICE_PAGE_IA S-1…S-3 ───────────────────────────── */
    defineField({
      name: 'shortDescription',
      title: 'One-line positioning',
      type: 'localizedString',
      group: 'offering',
      description: 'The single line that appears wherever this service is listed.',
    }),
    defineField({
      name: 'problemSolved',
      title: 'What it solves, and who it is for',
      type: 'localizedRichText',
      group: 'offering',
      description:
        'Written so a visitor recognises their own problem in it — the "is this my solution?" question.',
    }),
    defineField({ name: 'description', title: 'Full description', type: 'localizedRichText', group: 'offering' }),
    defineField({
      name: 'deliverables',
      title: 'What you get',
      type: 'localizedStringList',
      group: 'offering',
    }),
    defineField({ name: 'process', title: 'How it works', type: 'localizedRichText', group: 'offering' }),
    defineField({
      name: 'equipment',
      title: 'Equipment & specifications',
      type: 'localizedStringList',
      group: 'offering',
      description: 'For survey services. Real figures only — nothing here is calculated for you.',
    }),
    defineField({
      name: 'sectors',
      title: 'Typical sectors',
      type: 'array',
      group: 'offering',
      of: [defineArrayMember({ type: 'string' })],
      options: { layout: 'tags' },
      description: 'Lowercase, hyphenated — the same values the projects use.',
      validation: (Rule) =>
        Rule.custom((value: string[] | undefined) => {
          const bad = (value ?? []).filter((sector) => !SLUG_PATTERN.test(sector))
          return bad.length === 0 ? true : `Use lowercase hyphenated values. Fix: ${bad.join(', ')}.`
        }),
    }),
    defineField({ name: 'hero', title: 'Lead image', type: 'imageWithAlt', group: 'offering' }),

    /**
     * S-4's proof set, shown read-only. The field carries no value — it exists so the editor can
     * see, from inside the Service, which projects demonstrate it and understand that the link is
     * made on the project. F5's non-blocking warning is attached here.
     */
    defineField({
      name: 'demonstratedByNote',
      title: 'Projects demonstrating this service',
      type: 'string',
      group: 'proof',
      readOnly: true,
      description:
        'Set on each project, under Links → "Services this demonstrates". A service with none is still fully publishable: the page shows a short editorial note and a contact prompt instead of an empty grid.',
      validation: (Rule) =>
        Rule.custom(async (_value: unknown, context) => {
          const id = (context.document?._id ?? '').replace(/^drafts\./, '')
          if (!id) return true
          const client = context.getClient({ apiVersion: SANITY_API_VERSION })
          const count = await client.fetch<number>(
            'count(*[_type == "workEntry" && !(_id in path("drafts.**")) && references($id)])',
            { id },
          )
          // F5: warning only. This must never harden into an error.
          return toSanityWarning(validateServiceDemonstration(count))
        }).warning(),
    }),

    defineField({ name: 'curation', title: 'Emphasis & order', type: 'curation', group: 'curation' }),
    defineField({ name: 'seo', title: 'Search engine listing', type: 'seo', group: 'seo' }),
  ],

  preview: {
    select: { title: 'name.ro', pillar: 'pillar', media: 'hero', enPublished: 'enPublished' },
    prepare: (selection: Record<string, unknown>) => ({
      title: (selection.title as string) || 'Untitled service',
      subtitle: `${
        PILLAR_OPTIONS.find((option) => option.value === selection.pillar)?.title ?? 'No capability'
      }${selection.enPublished ? '' : ' · RO only'}`,
      media: selection.media as never,
    }),
  },
})
