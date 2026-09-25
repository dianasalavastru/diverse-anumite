/**
 * Reality Capture editorial LOCK (approved 2026-09-25, DECISIONS_LOG #106).
 *
 * ══════════════════════════════════════════════════════════════════════════
 *  WHAT THIS TEST PINS
 * ══════════════════════════════════════════════════════════════════════════
 *
 * RO:  the approved Reality Capture wording, as explicit literal `toEqual` locks — the whole RC
 *      Hub message set (`pillar-hub.ts`) and the Homepage's RC keys (`homepage.ts`:
 *      `arrival.heading`, `capabilities.realityCapture`, `work.realityCapture`,
 *      `work.marker.coordinate`). A reword fails here by name. Changing one of these values is
 *      an editorial decision and must be logged before this file is edited to match it.
 *
 * EN:  WITHHELD for the initial launch and NOT translated. It is frozen as snapshots so that no
 *      edit changes it by accident. The EN hub carries only the structural omissions that mirror
 *      RO; every surviving EN string is byte-identical to what it was before the lock.
 *
 * Alongside the locks, three guards: no precision, placeholder or capture-claim vocabulary on
 * the RO RC surfaces; the retired archive noun (`Documentări`) never reaches a stable RO
 * surface; and each hub's cross-pillar door names the other pillar by its canonical label.
 */

import { describe, expect, it } from 'vitest';

import { LOCALES, type Locale } from './routes';
import { homepageMessages } from './homepage';
import { realityCaptureHubMessages } from './pillar-hub';
import { architectureDesignHubMessages } from './architecture-design-hub';
import { pillarLabel } from './vocabulary';

/** The Homepage's RC keys, RO — the approved lock. */
const HOMEPAGE_RC_RO = {
  arrivalHeading: { lead: 'Proiectăm spațiul.', accent: 'Măsurăm', tail: 'realitatea.' },
  capabilitiesRealityCapture: {
    facets: 'scanare laser 3D · Scan-to-BIM',
    context:
      'Scanăm clădiri, spații interioare, fațade și teren, iar din norul de puncte realizăm modelul BIM.',
  },
  workRealityCapture: {
    index: '04·c',
    title: 'Reality Capture',
    intro: 'Proiecte de scanare laser 3D și Scan-to-BIM.',
    cta: 'Toate proiectele — Reality Capture',
  },
  workMarkerCoordinate: 'a · arhitectură & design — c · reality capture',
} as const;

/** The whole Reality Capture Hub message set, RO — the approved lock. */
const RC_HUB_RO = {
  meta: {
    title: 'Reality Capture · diverse anumite',
    description:
      'Scanare laser 3D și Scan-to-BIM — serviciile de Reality Capture ale atelierului diverse anumite.',
  },
  orientation: {
    eyebrow: 'pilon · capabilitate',
    heading: { lead: 'Reality', tail: 'Capture' },
    lead: 'Scanare laser 3D și Scan-to-BIM: nor de puncte, model BIM, planuri, secțiuni și fațade.',
    heroIndex: 'RC—001',
    aboutLink: 'Despre atelier',
  },
  framing: {
    marker: { no: '02', label: 'Întrebarea', coordinate: 'utilizări frecvente' },
    question: { lead: 'Pentru ce este folosit cel mai des', accent: 'rezultatul', tail: '?' },
    primary: [
      'Scanăm locuințe, clădiri comerciale și industriale, clădiri de patrimoniu, spații interioare, fațade, exterior și teren, precum și parcuri industriale.',
      'Scanarea laser 3D este folosită cel mai des pentru releveu, documentarea situației existente, renovare / intervenție pe existent, bază pentru proiectare, patrimoniu, BIM / Scan-to-BIM și As-Built.',
    ],
    secondary: [
      'Scan-to-BIM poate porni de la o scanare realizată de noi sau de la un nor de puncte furnizat de client.',
      'Rezultatul Scan-to-BIM este folosit cel mai des pentru proiectare pe clădiri existente, renovare / reabilitare, documentație, patrimoniu și facility management.',
    ],
    instruments: { label: 'Cu ce măsurăm', note: 'echipament declarat pe serviciile pilonului' },
  },
  work: {
    marker: { no: '03', label: 'Proiecte în focus', coordinate: 'selecție curatoriată · nu arhiva' },
    intro:
      'Fiecare proiect intră pe rând în focus. Trageți lateral sau folosiți săgețile. Selecția este curatoriată — arhiva completă este mai jos.',
    cta: 'Toate proiectele — Reality Capture',
    carousel: {
      roleDescription: 'carusel de proiecte',
      label: 'Proiecte — folosiți săgețile pentru a naviga',
      previous: 'Proiectul anterior',
      next: 'Proiectul următor',
      position: 'Proiectul în focus',
    },
  },
  services: {
    marker: { no: '04', label: 'Ce puteți comanda', coordinate: 'servicii · pilonul reality capture' },
    intro: 'Fiecare serviciu are pagina lui, cu livrabilele sale. Alegeți serviciul care vi se potrivește.',
    cta: 'Vezi serviciul',
  },
  continue: {
    marker: { no: '05', label: 'Continuare', coordinate: 'arhivă · cealaltă direcție' },
    archive: { kind: 'Proiecte', title: 'Vezi toate proiectele' },
    crossPillar: {
      kind: 'Cealaltă direcție',
      title: 'Arhitectură & Design',
      body: 'Proiectare de arhitectură, design interior, vizualizare 3D și design mobilier.',
    },
  },
  conversation: {
    marker: { no: '06', label: 'Conversație', coordinate: 'un proiect · un mesaj' },
    action: 'Începe o conversație',
    note: 'Mesajul pornește cu subiectul deja setat pe Reality Capture.',
  },
} as const;

/**
 * Precision, capture-claim and placeholder vocabulary. None of it may appear on an RO Reality
 * Capture surface: accuracy, scale and capture metrics are rendered from live values or not at
 * all (§10.4), and a marked stand-in is never page copy.
 */
const RC_FORBIDDEN =
  /\d+(\.\d+)?°|milimetr|centimetr|\b1:1\b|precis|precizi|±|\bmm\b|puncte\/m|ortofoto|peisaj|geam[aă]n|substituent|a[sș]teptare|preg[aă]tire|\bADA\b/i;

/** The RO surfaces that carry Reality Capture copy. */
const rcSurfacesRo = () => {
  const home = homepageMessages('ro');
  const ad = architectureDesignHubMessages('ro');
  return {
    'pillar-hub.ts (RC hub, RO)': realityCaptureHubMessages('ro'),
    'homepage.ts (RC keys, RO)': {
      arrivalHeading: home.arrival.heading,
      capabilitiesRealityCapture: home.capabilities.realityCapture,
      workRealityCapture: home.work.realityCapture,
      workMarkerCoordinate: home.work.marker.coordinate,
    },
    'architecture-design-hub.ts (RO)': ad,
  };
};

describe('Homepage Reality Capture keys — editorial lock', () => {
  it('RO RC keys carry the approved wording (LOCK #106)', () => {
    const ro = homepageMessages('ro');
    expect({
      arrivalHeading: ro.arrival.heading,
      capabilitiesRealityCapture: ro.capabilities.realityCapture,
      workRealityCapture: ro.work.realityCapture,
      workMarkerCoordinate: ro.work.marker.coordinate,
    }).toEqual(HOMEPAGE_RC_RO);
  });

  it('EN RC capability copy is frozen (EN withheld — not translated)', () => {
    expect(homepageMessages('en').capabilities.realityCapture).toMatchSnapshot();
  });

  /**
   * The neighbour test. The A&D and RC halves of `capabilities` are sibling properties; this
   * asserts they stayed distinct, so a copy/paste that filled one plate with the other's text
   * fails here by name.
   */
  it('keeps the two capability plates distinct — the A&D edit never bleeds into RC', () => {
    for (const locale of LOCALES) {
      const { architectureDesign, realityCapture } = homepageMessages(locale).capabilities;
      expect(realityCapture.facets).not.toBe(architectureDesign.facets);
      expect(realityCapture.context).not.toBe(architectureDesign.context);
    }
  });
});

describe('Reality Capture hub copy — editorial lock', () => {
  it('RO copy carries the approved wording (LOCK #106)', () => {
    expect(realityCaptureHubMessages('ro')).toEqual(RC_HUB_RO);
  });

  it('EN copy is frozen (EN withheld — not translated)', () => {
    expect(realityCaptureHubMessages('en')).toMatchSnapshot();
  });

  /** Clone of the A&D hub's parity test: no module renders in one locale and vanishes in the other. */
  it('describes the same shape in both locales', () => {
    const shape = (value: unknown): unknown => {
      if (Array.isArray(value)) return value.length > 0 ? [shape(value[0])] : [];
      if (value && typeof value === 'object') {
        return Object.fromEntries(
          Object.entries(value as Record<string, unknown>)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, entry]) => [key, shape(entry)]),
        );
      }
      return typeof value;
    };

    const [ro, en] = LOCALES.map((locale: Locale) => shape(realityCaptureHubMessages(locale)));
    expect(en).toEqual(ro);
  });

  it('publishes no precision, capture-claim or placeholder vocabulary on an RO RC surface', () => {
    for (const [surface, messages] of Object.entries(rcSurfacesRo())) {
      expect(JSON.stringify(messages), surface).not.toMatch(RC_FORBIDDEN);
    }
  });

  /** Each hub's cross-pillar door names the other pillar by its one canonical label. */
  it('titles each cross-pillar door with the other pillar’s canonical label', () => {
    expect(realityCaptureHubMessages('ro').continue.crossPillar.title).toBe(
      pillarLabel('architecture-design', 'ro'),
    );
    expect(architectureDesignHubMessages('ro').continue.crossPillar.title).toBe(
      pillarLabel('reality-capture', 'ro'),
    );
  });

  /**
   * The canonical archive noun is *Proiect / Proiecte*; `Documentări` (and its ASCII spelling,
   * and the `Documentare` module title it replaced) must not compete with it on any stable
   * surface — the Reality Capture hub included, now that it is locked.
   *
   * On RO the check is case-insensitive and word-bounded, so it catches `Documentări`,
   * `Documentari`, `Documentare` and `Documentar` in any case, while ordinary prose such as
   * "documentarea situației existente" and "documentație" — not archive nouns — stays allowed.
   */
  it('never lets the archive noun reach a stable surface', async () => {
    const stable = await Promise.all([
      import('./homepage').then((m) => m.homepageMessages),
      import('./pillar-hub').then((m) => m.realityCaptureHubMessages),
      import('./architecture-design-hub').then((m) => m.architectureDesignHubMessages),
      import('./services-index').then((m) => m.servicesIndexMessages),
      import('./work-archive').then((m) => m.workArchiveMessages),
      import('./service').then((m) => m.serviceMessages),
    ]);

    for (const messages of stable) {
      for (const locale of LOCALES) {
        expect(JSON.stringify(messages(locale))).not.toMatch(/Documentari|Documentări/);
      }
      expect(JSON.stringify(messages('ro'))).not.toMatch(/\bdocument(?:ari|ări|are|ar)\b/i);
    }
  });
});
