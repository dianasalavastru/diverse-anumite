/**
 * The complete schema — `TECHNICAL_ARCHITECTURE.md` §7.
 *
 * OWNER: Workstream B.
 *
 * Two documents and one reference list, exactly as `CONTENT_MODEL.md` §0 states: "There are
 * **two first-class objects**: the **Work Entry** and the **Service**", supported by "a small
 * **reference list** (Employer/Studio)". Nothing else is a document type — Pillar, Discipline,
 * Entry Type, Attribution, Sector and Status are axes on the Work Entry, not entities, and
 * turning any of them into a document would be adding a content axis, which §1.2 forbids.
 */

import { employer } from './employer'
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
  employer,

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
