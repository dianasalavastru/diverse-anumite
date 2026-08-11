/**
 * Employer / Studio — the small reference list from `CONTENT_MODEL.md` §0, :50.
 *
 * OWNER: Workstream B.
 *
 * It is a reference list, not a content object: IA §5.1 is explicit that Employer is "grouping
 * metadata, not its own page". Professional Experience groups by it; nothing routes to it. Kept
 * deliberately thin so it cannot grow into a second content model.
 */

import { defineField, defineType } from 'sanity'

export const employer = defineType({
  name: 'employer',
  title: 'Office',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description:
        'The office as it should be credited. Used to group Professional Experience — it has no page of its own.',
      validation: (Rule) => Rule.required().min(2).max(120),
    }),
  ],
  preview: {
    select: { title: 'name' },
  },
})
