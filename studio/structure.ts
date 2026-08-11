/**
 * Studio navigation — organised by editorial task, not by schema.
 *
 * OWNER: Workstream B.
 *
 * `PROJECT_CONTEXT.md`:167 requires the owner to add and edit work without touching code. A
 * default Studio would present three document types and leave every real question ("what still
 * needs translating?", "which services have no proof yet?") to a manual scan. Each list below
 * answers one such question.
 *
 * **No list here is a content model.** Every one is a filter over the same two document types,
 * expressed in the frozen vocabulary — the same relationship curated views have to the archive
 * (IA §5: "One archive, many lenses").
 */

import type { StructureResolver } from 'sanity/structure'

import { DISCIPLINE_TO_PILLAR, type Discipline, type Pillar } from '../src/lib/content/types'

/** Derived from §7.4's table rather than restated, so the two can never disagree. */
function disciplinesOf(pillar: Pillar): string[] {
  return (Object.keys(DISCIPLINE_TO_PILLAR) as Discipline[]).filter(
    (discipline) => DISCIPLINE_TO_PILLAR[discipline] === pillar,
  )
}

/**
 * A capability list must include cross-pillar work: `CONTENT_MODEL.md`:63 says a composite entry
 * is "shown in both views", so membership tests the secondary disciplines too.
 */
const IN_PILLAR = 'discipline.primary in $disciplines || count(discipline.secondary[@ in $disciplines]) > 0'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Projects')
        .child(
          S.list()
            .title('Projects')
            .items([
              S.listItem()
                .title('All projects')
                .child(S.documentTypeList('workEntry').title('All projects')),

              S.divider(),

              S.listItem()
                .title('Architecture & Design')
                .child(
                  S.documentList()
                    .title('Architecture & Design')
                    .schemaType('workEntry')
                    .filter(`_type == "workEntry" && (${IN_PILLAR})`)
                    .params({ disciplines: disciplinesOf('architecture-design') }),
                ),

              S.listItem()
                .title('Reality Capture')
                .child(
                  S.documentList()
                    .title('Reality Capture')
                    .schemaType('workEntry')
                    .filter(`_type == "workEntry" && (${IN_PILLAR})`)
                    .params({ disciplines: disciplinesOf('reality-capture') }),
                ),

              S.divider(),

              // The curation layer, made visible: "what is currently on the homepage?" is an
              // editorial question the owner asks constantly (CONTENT_MODEL.md §4).
              S.listItem()
                .title('On the homepage')
                .child(
                  S.documentList()
                    .title('On the homepage')
                    .schemaType('workEntry')
                    .filter('_type == "workEntry" && count(curation.placements[slot == "homepage"]) > 0'),
                ),

              S.listItem()
                .title('On a capability hub')
                .child(
                  S.documentList()
                    .title('On a capability hub')
                    .schemaType('workEntry')
                    .filter('_type == "workEntry" && count(curation.placements[slot == "pillar-hub"]) > 0'),
                ),

              // §11.2: an untranslated entry generates no EN page at all, so "what is missing in
              // English" is the single most consequential list in the Studio.
              S.listItem()
                .title('Not yet in English')
                .child(
                  S.documentList()
                    .title('Not yet in English')
                    .schemaType('workEntry')
                    .filter('_type == "workEntry" && enPublished != true'),
                ),

              S.divider(),

              // The two committed curated routes (IA §2.2). Shown here as the same lenses the
              // published site uses, so the owner sees what each route will contain.
              S.listItem()
                .title('Competitions')
                .child(
                  S.documentList()
                    .title('Competitions')
                    .schemaType('workEntry')
                    .filter(
                      '_type == "workEntry" && (entryType.primary == "competition-entry" || "competition-entry" in entryType.secondary)',
                    ),
                ),

              S.listItem()
                .title('Professional experience')
                .child(
                  S.documentList()
                    .title('Professional experience')
                    .schemaType('workEntry')
                    .filter('_type == "workEntry" && attribution == "studio"'),
                ),
            ]),
        ),

      S.listItem()
        .title('Services')
        .child(
          S.list()
            .title('Services')
            .items([
              S.listItem().title('All services').child(S.documentTypeList('service').title('All services')),

              // F5 made visible. Zero demonstrating entries is a valid published state, so this
              // is a working list, never a problem list.
              S.listItem()
                .title('Without demonstrating work')
                .child(
                  S.documentList()
                    .title('Without demonstrating work')
                    .schemaType('service')
                    .filter('_type == "service" && !(_id in *[_type == "workEntry"].services[]._ref)'),
                ),

              S.listItem()
                .title('Not yet in English')
                .child(
                  S.documentList()
                    .title('Not yet in English')
                    .schemaType('service')
                    .filter('_type == "service" && enPublished != true'),
                ),
            ]),
        ),

      S.divider(),

      S.listItem().title('Offices').child(S.documentTypeList('employer').title('Offices')),
    ])
