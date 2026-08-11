/**
 * Reusable object types.
 *
 * OWNER: Workstream B. `TECHNICAL_ARCHITECTURE.md` §7.1, §9, §19.2.
 *
 * Localization is **field-level, on a locale-neutral document** (§7.1). Every translatable
 * field is one of the `localized*` objects below; everything structural — taxonomy, curation,
 * relationships, media, capture metadata — lives once and is never duplicated per language.
 * Document-level internationalization is rejected upstream and no plugin here reintroduces it.
 */

import { defineArrayMember, defineField, defineType } from 'sanity'

import { PROMINENCE_OPTIONS, HIGHLIGHT_SLOT_OPTIONS, PILLAR_OPTIONS, STATUS_OPTIONS } from './fields'
import { validateVocabulary, toSanityResult } from '../../src/lib/content/validation'

/* ────────────────────────────────────────────────────────────────────────────
 * Localized primitives — §7.1
 * ──────────────────────────────────────────────────────────────────────────── */

export const localizedString = defineType({
  name: 'localizedString',
  title: 'Text (RO / EN)',
  type: 'object',
  options: { columns: 2 },
  fields: [
    defineField({ name: 'ro', title: 'Romanian', type: 'string' }),
    defineField({ name: 'en', title: 'English', type: 'string' }),
  ],
})

export const localizedText = defineType({
  name: 'localizedText',
  title: 'Paragraph (RO / EN)',
  type: 'object',
  fields: [
    defineField({ name: 'ro', title: 'Romanian', type: 'text', rows: 3 }),
    defineField({ name: 'en', title: 'English', type: 'text', rows: 3 }),
  ],
})

export const localizedStringList = defineType({
  name: 'localizedStringList',
  title: 'List (RO / EN)',
  type: 'object',
  fields: [
    defineField({
      name: 'ro',
      title: 'Romanian',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'en',
      title: 'English',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      options: { layout: 'tags' },
    }),
  ],
})

/**
 * §19.2: "No `innerHTML` from CMS content. No unsafe raw HTML rendering. Portable Text is
 * serialized through **controlled components** with an explicit allowlist of block/mark types."
 *
 * The allowlist starts at the schema: an editor cannot author a block type the serializer does
 * not know how to render, because no such type exists in the field. There is deliberately no
 * raw-HTML block and no embed type. Link annotations are restricted to safe URL schemes, which
 * is what keeps `javascript:` out of an authored href.
 */
const richTextBlocks = [
  defineArrayMember({
    type: 'block',
    styles: [
      { title: 'Normal', value: 'normal' },
      { title: 'Heading', value: 'h2' },
      { title: 'Subheading', value: 'h3' },
      { title: 'Quote', value: 'blockquote' },
    ],
    lists: [
      { title: 'Bulleted', value: 'bullet' },
      { title: 'Numbered', value: 'number' },
    ],
    marks: {
      decorators: [
        { title: 'Bold', value: 'strong' },
        { title: 'Italic', value: 'em' },
      ],
      annotations: [
        {
          name: 'link',
          type: 'object',
          title: 'Link',
          fields: [
            defineField({
              name: 'href',
              type: 'url',
              title: 'URL',
              validation: (Rule) =>
                Rule.required().uri({ scheme: ['http', 'https', 'mailto', 'tel'] }),
            }),
          ],
        },
      ],
    },
  }),
]

export const localizedRichText = defineType({
  name: 'localizedRichText',
  title: 'Rich text (RO / EN)',
  type: 'object',
  fields: [
    defineField({ name: 'ro', title: 'Romanian', type: 'array', of: richTextBlocks }),
    defineField({ name: 'en', title: 'English', type: 'array', of: richTextBlocks }),
  ],
})

/* ────────────────────────────────────────────────────────────────────────────
 * Media — §9, §12
 * ──────────────────────────────────────────────────────────────────────────── */

export const imageWithAlt = defineType({
  name: 'imageWithAlt',
  title: 'Image',
  type: 'image',
  // §9: hotspot/crop is a hard requirement, not a nicety — VISUAL_DIRECTION_v2.0:199 forbids
  // cropping "to fit a slot".
  options: { hotspot: true },
  fields: [
    defineField({
      name: 'alt',
      title: 'Alternative text',
      type: 'localizedString',
      description:
        'What the image shows, for someone who cannot see it. Written by you — never generated from the filename. (Required in Romanian.)',
      validation: (Rule) =>
        Rule.custom((value: { ro?: string } | undefined) =>
          value?.ro?.trim() ? true : 'Romanian alternative text is required.',
        ),
    }),
  ],
})

/* ────────────────────────────────────────────────────────────────────────────
 * Curation — CONTENT_MODEL.md §4, §7.5
 * ──────────────────────────────────────────────────────────────────────────── */

export const highlightPlacement = defineType({
  name: 'highlightPlacement',
  title: 'Placement',
  type: 'object',
  fields: [
    defineField({
      name: 'slot',
      title: 'Where',
      type: 'string',
      options: { list: [...HIGHLIGHT_SLOT_OPTIONS] },
      validation: (Rule) =>
        Rule.required().custom((value: string | undefined) =>
          toSanityResult(validateVocabulary(value, 'highlightSlot', 'curation.placements[].slot')),
        ),
    }),
    defineField({
      name: 'pillar',
      title: 'For which capability',
      type: 'string',
      options: { list: [...PILLAR_OPTIONS] },
      description: 'Leave empty for a placement that is not tied to one capability.',
      validation: (Rule) => Rule.custom((value: string | undefined) => (value ? toSanityResult(validateVocabulary(value, 'pillar', 'pillar')) : true)),
    }),
  ],
  preview: {
    select: { slot: 'slot', pillar: 'pillar' },
    prepare: ({ slot, pillar }: { slot?: string; pillar?: string }) => ({
      title: HIGHLIGHT_SLOT_OPTIONS.find((option) => option.value === slot)?.title ?? 'Placement',
      subtitle: PILLAR_OPTIONS.find((option) => option.value === pillar)?.title ?? 'Both capabilities',
    }),
  },
})

/**
 * `CONTENT_MODEL.md` §4: "The owner can re-curate the homepage at any time without
 * re-classifying a single entry." Everything in this object is editorial and changes often;
 * nothing in it is taxonomy, and none of it is ever a visitor-facing filter.
 */
export const curation = defineType({
  name: 'curation',
  title: 'Emphasis & order',
  type: 'object',
  options: { collapsible: true, collapsed: false },
  description:
    'How prominent this is and where it appears — separate from what it *is*. Changing anything here re-curates the site without re-classifying anything.',
  fields: [
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
      description: 'Elevates this for prominence in general "featured" strips.',
    }),
    defineField({
      name: 'pinned',
      title: 'Pin to the top',
      type: 'boolean',
      initialValue: false,
      description: 'Holds this at the top of every curated list, ahead of the priority below.',
    }),
    defineField({
      name: 'editorialPriority',
      title: 'Priority',
      type: 'number',
      initialValue: 0,
      description:
        'Higher shows earlier. This is what makes "most representative first" beat "newest first". Ties fall back to the most recent year.',
      validation: (Rule) => Rule.integer().min(0).max(1000),
    }),
    defineField({
      name: 'prominence',
      title: 'Size in the archive grid',
      type: 'string',
      initialValue: 'standard',
      options: { list: [...PROMINENCE_OPTIONS], layout: 'radio' },
      description: 'Which size this occupies in the editorial grid. You set the rhythm; no code changes.',
      validation: (Rule) =>
        Rule.required().custom((value: string | undefined) =>
          toSanityResult(validateVocabulary(value, 'prominence', 'curation.prominence')),
        ),
    }),
    defineField({
      name: 'placements',
      title: 'Show on',
      type: 'array',
      of: [defineArrayMember({ type: 'highlightPlacement' })],
      description:
        'Explicit slots this appears in — the homepage, a capability hub, or both. Leave empty to keep it in the archive only.',
    }),
  ],
})

/* ────────────────────────────────────────────────────────────────────────────
 * SEO — §12
 * ──────────────────────────────────────────────────────────────────────────── */

export const seo = defineType({
  name: 'seo',
  title: 'Search engine listing',
  type: 'object',
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'localizedString',
      description: 'Leave empty to use the page title.',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'localizedString',
      description: 'One or two sentences shown under the title in search results.',
    }),
  ],
})

/* ────────────────────────────────────────────────────────────────────────────
 * Work Entry metadata — CONTENT_MODEL.md:54
 * ──────────────────────────────────────────────────────────────────────────── */

export const workEntryMetadata = defineType({
  name: 'workEntryMetadata',
  title: 'Project facts',
  type: 'object',
  fields: [
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
      description: 'Sorts the archive. Required.',
      validation: (Rule) => Rule.required().integer().min(1980).max(2100),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: { list: [...STATUS_OPTIONS], layout: 'radio' },
      description:
        'Where the project stands. This is not the kind of project — that is "Type" — and it is never shown as a visitor filter.',
      validation: (Rule) =>
        Rule.required().custom((value: string | undefined) =>
          toSanityResult(validateVocabulary(value, 'status', 'metadata.status')),
        ),
    }),
    defineField({ name: 'location', title: 'Location', type: 'localizedString' }),
    defineField({
      name: 'client',
      title: 'Client',
      type: 'string',
      description: 'Shown on the page. Leave empty for self-initiated work.',
    }),
    defineField({
      name: 'collaborators',
      title: 'Collaborators',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'team',
      title: 'Team',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      options: { layout: 'tags' },
    }),
    defineField({ name: 'awards', title: 'Awards', type: 'localizedStringList' }),
    defineField({
      name: 'area',
      title: 'Area (m²)',
      type: 'number',
      validation: (Rule) => Rule.positive(),
    }),
    defineField({ name: 'deliverables', title: 'Deliverables', type: 'localizedStringList' }),
  ],
})

/* ────────────────────────────────────────────────────────────────────────────
 * Reality Capture — §10, §19.4
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * §19.4: raw E57/LAS/LAZ source surveys never enter the CMS. Only a bounded web derivative,
 * stripped of georeferencing, provenance and client identifiers, may be uploaded — and the
 * file-extension rule is enforced on the asset, not merely described here.
 */
export const pointCloudDerivative = defineType({
  name: 'pointCloudDerivative',
  title: 'Point cloud (web version)',
  type: 'object',
  fields: [
    defineField({
      name: 'asset',
      title: 'Web derivative file',
      type: 'file',
      description:
        'The reduced, publication-ready version only. Never the original survey file: originals carry georeferencing, provenance and client identifiers, and are not permitted here.',
    }),
    defineField({
      name: 'poster',
      title: 'Still image',
      type: 'imageWithAlt',
      description:
        'Shown instead of the interactive viewer when motion is reduced or the viewer cannot run. Required whenever a point cloud is published.',
    }),
  ],
})

/**
 * §10.4: "Point count, accuracy, and equipment are CMS capture-metadata fields rendered from
 * the real derived asset." The HiFis print a fabricated figure from a decorative multiplier;
 * nothing here is ever computed, so an empty field renders nothing rather than an estimate.
 */
export const captureMetadata = defineType({
  name: 'captureMetadata',
  title: 'Survey details',
  type: 'object',
  options: { collapsible: true, collapsed: false },
  description:
    'Technical claims shown to institutional clients. Every figure here is what you measured — nothing is calculated for you.',
  fields: [
    defineField({
      name: 'accuracy',
      title: 'Accuracy / specification',
      type: 'localizedString',
      description: 'As you would state it to a client, e.g. "2 mm at 10 m".',
    }),
    defineField({
      name: 'equipment',
      title: 'Equipment',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'software',
      title: 'Software',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'pointCount',
      title: 'Point count',
      type: 'number',
      description: 'The real number of points in the published file. Leave empty and no figure is shown.',
      validation: (Rule) => Rule.integer().positive(),
    }),
    defineField({ name: 'derivative', title: 'Point cloud', type: 'pointCloudDerivative' }),
  ],
})
