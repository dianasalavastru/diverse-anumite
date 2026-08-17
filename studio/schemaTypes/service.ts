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

import {
  PILLAR_OPTIONS,
  SECTOR_OPTIONS,
  SERVICE_KEY_OPTIONS,
  enPublishedField,
  localizedSlugField,
} from './fields'
import { SANITY_API_VERSION } from '../../src/lib/content/config'
import {
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
     * STAGE 8 — the Service's **stable machine identity** (v3.1 §14.3).
     *
     * Everything that depends on what a Service *means* depends on this and on nothing else:
     * which fields a project must carry, which Pillar's picker offers it, what the build
     * validates. Name and slug are yours to change at any time and changing them must never
     * move a field requirement — which is the whole reason this field exists rather than the
     * rules keying off the slug.
     *
     * **Required, unique, and set once.** `readOnly` engages the moment a value exists, so a
     * key can be chosen on creation and never re-pointed afterwards; re-pointing it would
     * silently rewrite the contract of every project referencing this Service. Uniqueness is
     * checked against the dataset, because two Services sharing a key would make requirement
     * resolution ambiguous.
     */
    defineField({
      name: 'key',
      title: 'Service identity',
      type: 'string',
      group: 'identity',
      options: { list: [...SERVICE_KEY_OPTIONS] },
      readOnly: ({ value }) => Boolean(value),
      description:
        'Which of the eight services this is. Chosen once, on creation, and locked afterwards — the site decides which fields each project must fill in from this, so it can never be re-pointed. Renaming the service or its address is always safe.',
      validation: (Rule) =>
        Rule.required().custom(async (value: string | undefined, context) => {
          const vocabulary = toSanityResult(validateVocabulary(value, 'serviceKey', 'key'))
          if (vocabulary !== true) return vocabulary

          const id = (context.document?._id ?? '').replace(/^drafts\./, '')
          const client = context.getClient({ apiVersion: SANITY_API_VERSION })
          const taken = await client.fetch<boolean>(
            'defined(*[_type == "service" && key == $key && !(_id in [$id, $draftId])][0]._id)',
            { key: value, id, draftId: `drafts.${id}` },
          )
          return taken
            ? `Another service already uses the identity '${value}'. Each of the eight exists once.`
            : true
        }),
    }),

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
    /**
     * STAGE 6: still an ARRAY, now on the closed vocabulary (v3.1 §11.1, decided 2026-08-14).
     *
     * This is deliberately NOT the project's `sector`. A project names the one sector it is in;
     * a Service names the sectors it is **typically relevant in**, which is genuinely plural
     * and genuinely optional. Same seven values, different cardinality, different question —
     * do not collapse this to a scalar to make the two match.
     */
    defineField({
      name: 'sectors',
      title: 'Typical sectors',
      type: 'array',
      group: 'offering',
      of: [defineArrayMember({ type: 'string' })],
      options: { list: [...SECTOR_OPTIONS], layout: 'grid' },
      description:
        'The sectors this service is usually relevant in. Tick any that apply, or none — this is not the sector of a single project.',
      validation: (Rule) =>
        Rule.unique().custom((value: string[] | undefined) =>
          toSanityResult((value ?? []).flatMap((sector) => validateVocabulary(sector, 'sector', 'sectors'))),
        ),
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
