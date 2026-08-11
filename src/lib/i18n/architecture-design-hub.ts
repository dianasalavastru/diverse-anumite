/**
 * Pillar Hub editorial copy — the **Architecture & Design** instance.
 *
 * ⚠ PLACEHOLDER COPY — PENDING WORKSTREAM C. NOTHING HERE IS AUTHORED CONTENT.
 *
 * OWNERSHIP: Workstream A commits the STRUCTURE; Workstream C authors the
 * STRINGS (TECHNICAL_ARCHITECTURE.md §23.3, "i18n message files | A (RO/EN
 * strings authored by C) | two-party file"). Replacing a value here is a copy
 * change and touches no component.
 *
 * ── ONE BLUEPRINT, TWO INSTANCES ──────────────────────────────────────────
 * `HUB_PAGE_IA.md` §"One blueprint, two instances" and `PILLAR_HUB_WIREFRAME.md`
 * §"Pillar inheritance" are explicit that the two hubs share the module set, the
 * order and the composition and differ **only in the content they consume**.
 * This file is therefore the second *instance* of the shape declared in
 * `pillar-hub.ts` — it re-declares no structure, and the six module components
 * are consumed unchanged.
 *
 * ── THE ONE STRUCTURAL DIFFERENCE FROM THE RC INSTANCE ────────────────────
 * `work` here is `PillarHubMessages['work']` **minus `pointCloud`**.
 * TECHNICAL_ARCHITECTURE.md §10.1 verified the point cloud against the six
 * approved HiFis and tabulates the result: Reality Capture Hub **yes**,
 * *Architecture & Design Hub **no***. The capture centrepiece is the RC
 * instance's H-4 media treatment, which the wireframe's §"Pillar inheritance"
 * lists as varying by capability ("RC media may be point-cloud/orthophoto; A&D
 * renders/drawings"). Omitting the field rather than authoring unused copy for it
 * is what makes that absence checked by the compiler instead of remembered.
 *
 * Since the integration pass, `pointCloud` is **optional on the shared shape**
 * and `CuratedWork.astro` renders the capture field only for an instance that
 * supplies it — so this omission is not merely documentation, it is what makes
 * the A&D hub render no capture field. Both hubs compose the one shared H-4
 * component; there is no second copy of it.
 *
 * ── WHAT WAS REMOVED FROM THE APPROVED HiFi TRANSCRIPTION ─────────────────
 * The strings below are transcribed from
 * `docs/pages/pillar-hub/pillar-hub-measured-reality-hifi-v1_1.html`
 * (owner-approved 2026-08-10) so that line lengths, `max-width: Nch` measures and
 * the authored rhythm are exercised at their real sizes. Four corrections:
 *
 *  1. **Diacritics removed** (OD-8, §11.3) — the HiFi carries them because it is
 *     a design reference, not production copy.
 *
 *  2. **The "Masurat" figure row is not here at all.** The HiFi prints `10+` years
 *     of practice, `40+` projects, `6` programme types and `1:1`, under its own
 *     disclaimer that these are "valori reprezentative pentru acest prototip —
 *     continut de prezentare, nu date finale". No field in the frozen Content
 *     Model carries any of them, `PILLAR_HUB_WIREFRAME.md` H-2 marks Statistic
 *     **optional**, and `CONTENT_MODEL.md`:101 requires the site to be "honest &
 *     legally safe". Marking them "(substituent)" as the Homepage does for its
 *     credibility readouts is not enough here: those are practice-level facts with
 *     no field anywhere, while a hub figure row reads as a capability claim. They
 *     are omitted, not neutralised, and not derived — deriving a project count
 *     from the archive would invent editorial semantics the Content Model does not
 *     authorise.
 *
 *  3. **No project count in the H-4 heading.** The HiFi's "Sase proiecte, un
 *     singur fel de a lucra" hard-codes six, but the curated set is
 *     `source.highlights('pillar-hub', …)` and is whatever the owner has placed.
 *     The heading states the idea without counting.
 *
 *  4. **`h — 18.4 m` dropped.** A dimension annotation on the opening plate is a
 *     measurement of one fictional prototype building (§10.4). The studio
 *     coordinate line is kept, exactly as the Homepage and the RC hub keep it.
 *
 * OD-8 (§11.3): Romanian site copy is authored WITHOUT diacritics.
 */

import type { PillarHubMessages } from './pillar-hub';
import type { Locale } from './routes';

/* -------------------------------------------------------------------------- */
/* Shape                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * The hub blueprint, minus the capture centrepiece (§10.1 — see the header).
 *
 * Composed from `PillarHubMessages` with `Omit` rather than re-declared, so the
 * two instances cannot drift: every other field, and every nested shape, stays
 * literally the same type the shared modules consume.
 */
export type ArchitectureDesignHubMessages = Omit<PillarHubMessages, 'work'> & {
  readonly work: Omit<PillarHubMessages['work'], 'pointCloud'>;
};

/* -------------------------------------------------------------------------- */
/* RO — transcribed from the approved A&D Hub HiFi, per the header notes        */
/* -------------------------------------------------------------------------- */

const ro: ArchitectureDesignHubMessages = {
  meta: {
    title: 'Arhitectura & Design — pilon · diverse anumite',
    description:
      'Locuinte, interioare, concursuri si spatiu public — arhitectura care porneste de la loc si este dusa pana la ultima muchie.',
  },

  orientation: {
    eyebrow: 'pilon · capabilitate',
    heading: { lead: 'Arhitectura', tail: '& Design' },
    thesis: {
      lead: 'Gandim spatiul la fel — de la casa la spatiu public, pana la',
      accent: 'ultima muchie',
      tail: '.',
    },
    lead:
      'Arhitectura, interior si spatiu construit — locuinte, amenajari interioare, concursuri, proiecte publice si lucrari conceptuale. Lucram cu mana si cu instrumentul, de la prima curba de nivel pana la ultima muchie de beton. Un singur fel de a gandi, indiferent de scara.',
    heroFallbackAlt: 'Imagine substituent — fotografie de proiect, in asteptare',
    heroIndex: 'AD—001',
    heroCoordinates: '46.77°N 23.59°E',
    aboutLink: 'Despre atelier',
  },

  framing: {
    marker: { no: '02', label: 'Cum gandim', coordinate: 'metoda, nu stilul' },
    question: {
      lead: 'Nu incepem de la forma. Incepem de la',
      accent: 'loc',
      tail: '.',
    },
    primary: [
      'Panta, lumina, vecinatatile, programul, felul in care se ajunge la intrare — toate se citesc inainte de prima linie. Masuram locul, uneori la milimetru, pentru ca un proiect bun incepe de la o citire onesta a lui, nu de la o imagine.',
      'De la o locuinta la un concurs public, intrebarile raman aceleasi. Desenam putin si taiem mult — un gest clar in locul a zece decorative.',
    ],
    secondary: [
      'Materialele nu imita: betonul ramane beton, lemnul ramane lemn, piatra ramane piatra. Le alegem putine si le lasam sa imbatraneasca frumos.',
      'Detaliul este locul unde se castiga sau se pierde un proiect — o locuinta, un interior sau un spatiu public deopotriva. Petrecem la fel de mult timp pe o muchie de tamplarie cat pe volumetria de ansamblu.',
    ],
    useCases: {
      label: 'Unde se aplica',
      note: 'sectoare declarate pe serviciile pilonului',
    },
    instruments: {
      label: 'Cu ce lucram',
      note: 'echipament declarat pe serviciile pilonului',
    },
  },

  work: {
    marker: {
      no: '03',
      label: 'Proiecte in focus',
      coordinate: 'selectie curatoriata · nu arhiva',
    },
    title: 'Un singur fel de a lucra, la orice scara.',
    intro:
      'Fiecare proiect intra pe rand in focus. Trageti lateral sau folositi sagetile. Selectia este curatoriata — arhiva completa este mai jos.',
    cta: 'Toate proiectele — Arhitectura & Design',
    carousel: {
      roleDescription: 'carusel de proiecte',
      label: 'Proiecte — folositi sagetile pentru a naviga',
      previous: 'Proiectul anterior',
      next: 'Proiectul urmator',
      position: 'Proiectul in focus',
    },
  },

  services: {
    marker: {
      no: '04',
      label: 'Ce puteti comanda',
      coordinate: 'servicii · pilonul arhitectura & design',
    },
    intro:
      'Fiecare serviciu are pagina lui, cu livrabile, proces si etape. Aici doar recunoasteti care vi se potriveste.',
    cta: 'Vezi serviciul',
  },

  continue: {
    marker: { no: '05', label: 'Continuare', coordinate: 'ati vazut cum gandim' },
    frame: { lead: 'Ati vazut cum gandim.', accent: 'Continuati', tail: 'cum vreti.' },
    archive: {
      kind: 'Proiecte',
      title: 'Vezi toate proiectele',
      body: 'Toata arhitectura, proiect cu proiect, in arhiva completa.',
    },
    crossPillar: {
      kind: 'Reality Capture',
      title: 'Cum masuram',
      body: 'Felul in care masurarea reala hraneste proiectul de arhitectura.',
    },
  },

  conversation: {
    marker: { no: '06', label: 'Conversatie', coordinate: 'un teren · un mesaj' },
    invitation: {
      lead: 'Un proiect care porneste de la',
      accent: 'teren',
      tail: '?',
    },
    action: 'Incepe o conversatie',
    note: 'Mesajul porneste cu subiectul deja setat pe Arhitectura & Design.',
  },
};

/* -------------------------------------------------------------------------- */
/* EN — placeholder translation of the above, PENDING (C)                      */
/* -------------------------------------------------------------------------- */

const en: ArchitectureDesignHubMessages = {
  meta: {
    title: 'Architecture & Design — capability · diverse anumite',
    description:
      'Houses, interiors, competitions and public space — architecture that starts from the place and is taken through to the last edge.',
  },

  orientation: {
    eyebrow: 'capability · one of two',
    heading: { lead: 'Architecture', tail: '& Design' },
    thesis: {
      lead: 'We think about space the same way — from a house to a public square, down to the',
      accent: 'last edge',
      tail: '.',
    },
    lead:
      'Architecture, interiors and built space — houses, interior fit-outs, competitions, public projects and conceptual work. We work by hand and by instrument, from the first contour line to the last concrete edge. One way of thinking, whatever the scale.',
    heroFallbackAlt: 'Placeholder image — project photography pending',
    heroIndex: 'AD—001',
    heroCoordinates: '46.77°N 23.59°E',
    aboutLink: 'About the studio',
  },

  framing: {
    marker: { no: '02', label: 'How we think', coordinate: 'method, not style' },
    question: {
      lead: 'We do not start from form. We start from the',
      accent: 'place',
      tail: '.',
    },
    primary: [
      'The slope, the light, the neighbours, the brief, the way you arrive at the door — all of it is read before the first line. We measure the place, sometimes to the millimetre, because a good project starts from an honest reading of it, not from an image.',
      'From a house to a public competition, the questions stay the same. We draw little and cut a lot — one clear gesture instead of ten decorative ones.',
    ],
    secondary: [
      'Materials do not imitate: concrete stays concrete, timber stays timber, stone stays stone. We choose few and let them age well.',
      'The detail is where a project is won or lost — a house, an interior or a public space alike. We spend as long on a joinery edge as on the overall massing.',
    ],
    useCases: {
      label: 'Where it applies',
      note: 'sectors declared on this capability’s services',
    },
    instruments: {
      label: 'What we work with',
      note: 'equipment declared on this capability’s services',
    },
  },

  work: {
    marker: {
      no: '03',
      label: 'Projects in focus',
      coordinate: 'a curated selection · not the archive',
    },
    title: 'One way of working, at any scale.',
    intro:
      'Each project comes into focus in turn. Drag sideways or use the arrows. The selection is curated — the full archive is below.',
    cta: 'All projects — Architecture & Design',
    carousel: {
      roleDescription: 'project carousel',
      label: 'Projects — use the arrow keys to navigate',
      previous: 'Previous project',
      next: 'Next project',
      position: 'Project in focus',
    },
  },

  services: {
    marker: {
      no: '04',
      label: 'What you can commission',
      coordinate: 'services · architecture & design',
    },
    intro:
      'Each service has its own page, with deliverables, process and stages. Here you only recognise which one fits.',
    cta: 'See the service',
  },

  continue: {
    marker: { no: '05', label: 'Continue', coordinate: 'you have seen how we think' },
    frame: { lead: 'You have seen how we think.', accent: 'Continue', tail: 'however you like.' },
    archive: {
      kind: 'Projects',
      title: 'See all projects',
      body: 'All of the architecture, project by project, in the full archive.',
    },
    crossPillar: {
      kind: 'Reality Capture',
      title: 'How we measure',
      body: 'The way measuring reality feeds the architectural project.',
    },
  },

  conversation: {
    marker: { no: '06', label: 'Conversation', coordinate: 'one site · one message' },
    invitation: {
      lead: 'A project that starts from the',
      accent: 'ground',
      tail: '?',
    },
    action: 'Start a conversation',
    note: 'The message starts with the topic already set to Architecture & Design.',
  },
};

const ARCHITECTURE_DESIGN: Readonly<Record<Locale, ArchitectureDesignHubMessages>> = { ro, en };

/** The Architecture & Design hub's copy. */
export function architectureDesignHubMessages(locale: Locale): ArchitectureDesignHubMessages {
  return ARCHITECTURE_DESIGN[locale];
}
