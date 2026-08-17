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

import type { Pillar } from '../src/lib/content/types'

/**
 * STAGE 5: a capability list is plain equality on the AUTHORED pillar.
 *
 * It used to expand a pillar into its disciplines and test both positions, because a composite
 * entry was "shown in both views". v3.1 §2 gives a project exactly one Pillar, so each project
 * appears in exactly one of these two lists.
 */
const IN_PILLAR = 'pillar == $pillar'

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
                    .filter(`_type == "workEntry" && ${IN_PILLAR}`)
                    .params({ pillar: 'architecture-design' satisfies Pillar }),
                ),

              S.listItem()
                .title('Reality Capture')
                .child(
                  S.documentList()
                    .title('Reality Capture')
                    .schemaType('workEntry')
                    .filter(`_type == "workEntry" && ${IN_PILLAR}`)
                    .params({ pillar: 'reality-capture' satisfies Pillar }),
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

              // The committed curated route (IA §2.2), shown as the same lens the published
              // site uses, so the owner sees what it will contain. Professional experience was
              // the second such pane; it is gone with the view (DECISIONS_LOG.md #97).
              S.listItem()
                .title('Competitions')
                .child(
                  S.documentList()
                    .title('Competitions')
                    .schemaType('workEntry')
                    // STAGE 4: membership moved from the retired Entry Type axis to the
                    // `competition` Label — the same rule `source.ts` applies (DECISIONS_LOG #83).
                    .filter('_type == "workEntry" && "competition" in labels'),
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
    ])
