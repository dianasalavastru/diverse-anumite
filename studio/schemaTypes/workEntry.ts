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
  PILLAR_OPTIONS,
  SECTOR_OPTIONS,
  LABEL_OPTIONS,
  enPublishedField,
  localizedSlugField,
} from './fields'
import { SANITY_API_VERSION } from '../../src/lib/content/config'
import type { Pillar, ServiceKey } from '../../src/lib/content/types'
import {
  toSanityResult,
  toSanityWarning,
  validateCaptureGate,
  validateEnAvailability,
  validateNotRawCaptureSource,
  validateVocabulary,
  validateFieldRequirements,
  validateServicePillarConsistency,
  validateServicesPresent,
  validateWorkEntrySlug,
} from '../../src/lib/content/validation'

/** Shape of the document as the Studio hands it to a validator. */
interface WorkEntryDraft {
  readonly _id?: string
  readonly title?: { ro?: string; en?: string }
  readonly slug?: { ro?: { current?: string }; en?: { current?: string } }
  readonly enPublished?: boolean
  readonly pillar?: string
  readonly labels?: string[]
  readonly description?: { ro?: unknown[]; en?: unknown[] }
  readonly capture?: {
    pointCount?: number
    derivative?: { asset?: { asset?: { _ref?: string } }; poster?: { asset?: { _ref?: string } } }
  }
  readonly capturePublicationCleared?: boolean
  readonly sector?: string
  readonly cover?: unknown
  readonly gallery?: unknown[]
  readonly services?: readonly { _ref?: string }[]
  readonly metadata?: {
    year?: number
    status?: string
    client?: string
    location?: { ro?: string }
    area?: number
    awards?: { ro?: string[] }
    equipment?: string[]
    collaborators?: string[]
    team?: string[]
    implementationCompany?: string
  }
}

/** The Survey group is Reality Capture's, and Pillar is now authored rather than derived. */
const isRealityCapture = (document: WorkEntryDraft | undefined): boolean =>
  document?.pillar === 'reality-capture'

/**
 * The v3.1 Service contract, checked at the document level — STAGE 8.
 *
 * This is where the **exact** answer lives. A field's `hidden` callback can only ask a
 * synchronous, Pillar-level question (see `conditional()` in `objects.ts`), because Sanity hands
 * it unresolved `{_ref}` objects. Here the rule is async, so it resolves the referenced Services
 * and reads their real **keys** — never their titles or slugs, which the owner may change at any
 * time without moving a single requirement (v3.1 §14.3).
 *
 * Three rules, all imported, none restated: Services present, Services belonging to the
 * project's own Pillar, and every mandatory field actually filled in. `requirements.ts` is the
 * only place the table exists, and `normalize.ts` calls the identical functions at build time —
 * so the Studio blocks exactly what the build would refuse.
 */
async function validateServiceContract(
  document: WorkEntryDraft | undefined,
  client: { fetch: <T>(query: string, params?: Record<string, unknown>) => Promise<T> },
) {
  const refs = (document?.services ?? [])
    .map((service) => service?._ref)
    .filter((ref): ref is string => Boolean(ref))

  const present = validateServicesPresent(refs.length)
  if (present.length > 0) return present

  const referenced = await client.fetch<readonly { key?: string; pillar?: string; name?: string }[]>(
    '*[_type == "service" && _id in $refs]{ key, pillar, "name": name.ro }',
    { refs: [...refs, ...refs.map((ref) => `drafts.${ref}`)] },
  )

  /*
   * A Service with no `key` is legacy data — the field is required, unique and immutable on
   * every Service authored since Stage 8, so only documents predating it can lack one. Such a
   * Service activates nothing, which would let a project through carrying only its Pillar's
   * base requirements. That is a silent under-enforcement, so it is reported instead: the
   * project is blocked and the offending Service is named, exactly as a wrong-Pillar reference
   * is. Nothing is guessed, and nothing is dropped quietly.
   */
  const unkeyed = referenced.filter((service) => !service.key)
  if (unkeyed.length > 0) {
    return [
      {
        level: 'error' as const,
        path: 'services',
        message:
          `${unkeyed.length === 1 ? 'This Service has' : 'These Services have'} no capability key yet: ` +
          `${unkeyed.map((service) => service.name ?? '(untitled)').join(', ')}. ` +
          'Open each one and set its key — until then it activates no fields, and this project cannot be checked against the model. (CONTENT_MODEL.md v3.1 §14.3)',
      },
    ]
  }

  const services = referenced
    .filter((service): service is { key: ServiceKey; pillar: Pillar; name?: string } =>
      Boolean(service.key) && Boolean(service.pillar),
    )
    .map((service) => ({ key: service.key, pillar: service.pillar, name: service.name }))

  const pillar = document?.pillar as Pillar | undefined
  const consistency = validateServicePillarConsistency(pillar, services)
  if (consistency.length > 0 || !pillar) return consistency

  const metadata = document?.metadata
  return validateFieldRequirements(
    pillar,
    services.map((service) => service.key),
    {
      services: refs.length > 0,
      sector: Boolean(document?.sector),
      title: Boolean(document?.title?.ro?.trim()),
      year: typeof metadata?.year === 'number',
      status: Boolean(metadata?.status),
      client: Boolean(metadata?.client?.trim()),
      description: (document?.description?.ro ?? []).length > 0,
      cover: Boolean(document?.cover),
      gallery: (document?.gallery ?? []).length > 0,
      location: Boolean(metadata?.location?.ro?.trim()),
      area: typeof metadata?.area === 'number',
      awards: (metadata?.awards?.ro ?? []).length > 0,
      equipment: (metadata?.equipment ?? []).length > 0,
      collaborators: (metadata?.collaborators ?? []).length > 0,
      team: (metadata?.team ?? []).length > 0,
      implementationCompany: Boolean(metadata?.implementationCompany?.trim()),
    },
  )
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
    /**
     * STAGE 5: the `discipline` object is deleted and **Pillar is authored here**.
     *
     * Pillar used to be worked out from the field of work and shown read-only, and a second
     * field of work could put one project under both capabilities. v3.1 §2 replaces all of
     * that: one project, one capability, chosen by the editor. Work spanning both is two
     * projects linked under Links → Related projects.
     *
     * A radio group, not a list of checkboxes: exactly one value, always.
     */
    defineField({
      name: 'pillar',
      title: 'Capability',
      type: 'string',
      group: 'classification',
      options: { list: [...PILLAR_OPTIONS], layout: 'radio' },
      description:
        'Which capability this project belongs to. Exactly one. A project that spans both — a survey and the design that followed it — is two projects, linked to each other under Links.',
      validation: (Rule) =>
        Rule.required().custom((value: string | undefined) =>
          toSanityResult(validateVocabulary(value, 'pillar', 'pillar')),
        ),
    }),

    /**
     * STAGE 4: the `entryType` field is deleted and **Project Labels** take its place — a
     * different kind of field, not a rename.
     *
     * Entry Type was mandatory, single-primary, and answered "what *is* this project". Labels
     * are optional, multiple and answer "does this project have a special characteristic". Four
     * of the five old values are simply retired; only `competition-entry`'s meaning survives, as
     * the `competition` Label (`CONTENT_MODEL.md` v3.1 §10, §12).
     *
     * Checkboxes rather than a radio group, because the two are **not mutually exclusive**: a
     * diploma project entered in a competition carries both, and that is a valid state the
     * editor must be able to express in one field.
     */
    defineField({
      name: 'labels',
      title: 'Labels',
      type: 'array',
      group: 'classification',
      of: [defineArrayMember({ type: 'string' })],
      options: { list: [...LABEL_OPTIONS], layout: 'grid' },
      initialValue: [],
      description:
        'Optional marks. Tick any that apply — a project can carry both, or neither. A label says something special about the project; it never changes which other fields you have to fill in.',
      validation: (Rule) =>
        Rule.unique().custom((value: string[] | undefined) =>
          toSanityResult((value ?? []).flatMap((label) => validateVocabulary(label, 'label', 'labels'))),
        ),
    }),

    /**
     * STAGE 6: `sectors` (a free-string tag array) becomes `sector` — one required value from a
     * closed seven-value vocabulary (v3.1 §11.1).
     *
     * The old ad-hoc `SLUG_PATTERN` check is deleted with it: it only enforced *shape*, because
     * the axis was open and any lowercase-hyphenated token was legal. Membership is what
     * matters now, and `validateVocabulary` is the same rule the build applies.
     *
     * A radio group, not tags: exactly one value, always. Genuinely mixed-use work uses
     * *Mixed-use & dezvoltări*, which is why one value is always sufficient.
     */
    defineField({
      name: 'sector',
      title: 'Sector',
      type: 'string',
      group: 'classification',
      options: { list: [...SECTOR_OPTIONS], layout: 'radio' },
      description:
        'The kind of place or programme this project is. Exactly one — a project that genuinely mixes uses is Mixed-use & dezvoltări.',
      validation: (Rule) =>
        Rule.required().custom((value: string | undefined) =>
          toSanityResult(validateVocabulary(value, 'sector', 'sector')),
        ),
    }),

    /*
     * ── Credit ────────────────────────────────────────────────────────────
     *
     * STAGE 3: `attribution`, `commissioning`, `roles` and `authorship` are deleted, together
     * with both `validateAuthorship` attachments (an error rule and a `.warning()` rule on the
     * same field). `CONTENT_MODEL.md` v3.1 §12 retires all four and §13 makes crediting the job
     * of two optional lists — Collaborators and Team — which live on `metadata`, not here.
     *
     * Nothing replaces them. There is no successor field, no Label, and no Service-keyed
     * authorship rule: retiring the concept and re-triggering it from a Service would be the
     * same requirement wearing a different name (`DECISIONS_LOG.md` #91).
     *
     * The `credits` field group is left declared but currently holds no field. It is not
     * removed here because Stage 8 moves the crediting fields into it; removing and restoring a
     * group inside one migration would churn the editor's tab order twice.
     */

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
    /**
     * STAGE 8 — Services are **mandatory, 1..N, and scoped to the project's own capability**
     * (v3.1 §2). The selection is what activates this project's conditional fields (§5, §7), so
     * an empty list is not an incomplete project but an unclassifiable one.
     *
     * The picker is filtered to the chosen capability — the same `options.filter` mechanism
     * `relatedWork` below already uses. A filter is an authoring affordance, though, not a
     * constraint: it does not clear a reference already made, so switching capability leaves
     * incompatible selections in place. The document-level rule at the foot of this file names
     * them and blocks; **it never empties the field on the editor's behalf.**
     */
    defineField({
      name: 'services',
      title: 'Services this demonstrates',
      type: 'array',
      group: 'relationships',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'service' }],
          options: {
            filter: ({ document }: { document: { pillar?: string } }) => ({
              filter: 'pillar == $pillar',
              params: { pillar: document?.pillar ?? '' },
            }),
          } as never,
        }),
      ],
      description:
        'Which of your services this project demonstrates. At least one, and only services from the capability you chose above — they decide which other fields you have to fill in. Each service page shows the projects that demonstrate it; the link is stored here only.',
      validation: (Rule) =>
        Rule.required()
          .min(1)
          .custom((value: unknown[] | undefined) =>
            toSanityResult(validateServicesPresent((value ?? []).length)),
          ),
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
      const client = context.getClient({ apiVersion: SANITY_API_VERSION })
      const derivative = document?.capture?.derivative
      const assetRef = derivative?.asset?.asset?._ref

      let filenameIssues: ReturnType<typeof validateNotRawCaptureSource> = []
      if (assetRef) {
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
        ...(await validateServiceContract(document, client)),
      ])
    }),

  /**
   * §7.4: "The Studio shows an **editor-visible read-only readout** so the owner can see which
   * pillar an entry will default to." The subtitle carries it, computed from the same derivation
   * table the build uses — it is displayed, never stored, because Pillar is not an editable field.
   */
  /**
   * STAGE 5: the subtitle reads the AUTHORED pillar. §7.4's read-only derived readout existed
   * because the editor could not see which capability a project would land in; now they choose
   * it, so the subtitle simply echoes the choice.
   */
  preview: {
    select: {
      title: 'title.ro',
      pillar: 'pillar',
      year: 'metadata.year',
      media: 'cover',
      enPublished: 'enPublished',
    },
    prepare: (selection: Record<string, unknown>) => {
      const pillar =
        PILLAR_OPTIONS.find((option) => option.value === selection.pillar)?.title ??
        'capability not yet chosen'
      const en = selection.enPublished ? '' : ' · RO only'
      return {
        title: (selection.title as string) || 'Untitled project',
        subtitle: `${selection.year ?? '—'} · ${pillar}${en}`,
        media: selection.media as never,
      }
    },
  },
})
