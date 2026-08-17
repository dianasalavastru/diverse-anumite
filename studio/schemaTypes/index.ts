/**
 * The complete schema — `TECHNICAL_ARCHITECTURE.md` §7.
 *
 * OWNER: Workstream B.
 *
 * Two documents, exactly as `CONTENT_MODEL.md` states: "There are **two first-class objects**:
 * the **Work Entry** and the **Service**". Nothing else is a document type — Pillar, Sector,
 * Status and Labels are axes on the Work Entry, not entities, and turning any of them into a
 * document would be adding a content axis, which §1.2 forbids.
 *
 * STAGE 2: the `employer` reference list is **deleted**. It existed only to group the
 * Professional Experience curated view, which is permanently retired (`CONTENT_MODEL.md` v3.1
 * §13, `DECISIONS_LOG.md` #97). No document type replaces it.
 */

import {
  captureMetadata,
  curation,
  highlightPlacement,
  imageWithAlt,
  localizedRichText,
  localizedString,
  localizedStringList,
  localizedText,
  pointCloudDerivative,
  seo,
  workEntryMetadata,
} from './objects'
import { service } from './service'
import { workEntry } from './workEntry'

export const schemaTypes = [
  // Documents
  workEntry,
  service,

  // Objects
  localizedString,
  localizedText,
  localizedStringList,
  localizedRichText,
  imageWithAlt,
  highlightPlacement,
  curation,
  seo,
  workEntryMetadata,
  captureMetadata,
  pointCloudDerivative,
]
