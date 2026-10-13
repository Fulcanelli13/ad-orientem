// Display-only composition for blocks that contain a resolved Proper payload
// followed by fixed canonical Mass text. This module never changes event timing or
// actor ownership; it only restores the fixed text that follows the Proper cue.

export const PINNED_PROPER_FOLLOWUPS = Object.freeze({
  // The source's Collect/Postcommunion Proper blocks contain response
  // cues but no printed words for them. Materialise those canonical
  // R. Amen cues after the resolved prayer text, as already done for
  // Deo gratias at the Epistle and Laus tibi after the Gospel.
  // Additional commemorations with separate conclusions require their
  // own sourced structure before additional responses may be inserted.
  "AO.SM.B019": Object.freeze([
    Object.freeze({
      id:"AO.SM.C0074",kind:"RESPONSE",latin:"℟. Amen.",
      vernacular:Object.freeze({en:"℟. Amen.",fr:"℟. Amen."}),
      role:"FIXED_RESPONSE",speakerRole:"RESPONDERS",
      speakerEvidence:"CANONICAL_PROPER_RESPONSE_CUE",
    }),
  ]),
  "AO.SM.B088": Object.freeze([
    Object.freeze({
      id:"AO.SM.C0255",kind:"RESPONSE",latin:"℟. Amen.",
      vernacular:Object.freeze({en:"℟. Amen.",fr:"℟. Amen."}),
      role:"FIXED_RESPONSE",speakerRole:"RESPONDERS",
      speakerEvidence:"CANONICAL_PROPER_RESPONSE_CUE",
    }),
  ]),
  "AO.SM.B020": Object.freeze([
    Object.freeze({
      id:"AO.SM.C0076",
      kind:"RESPONSE",
      latin:"℟. Deo grátias.",
      vernacular:Object.freeze({
        en:"℟. Thanks be to God.",
        fr:"℟. Nous rendons grâces à Dieu.",
      }),
      role:"FIXED_RESPONSE",speakerRole:"RESPONDERS",
    }),
  ]),
  "AO.SM.B026": Object.freeze([
    Object.freeze({
      id:"AO.SM.C0087",
      kind:"RESPONSE",
      latin:"℟. Laus tibi, Christe.",
      vernacular:Object.freeze({
        en:"℟. Praise be to Thee, O Christ.",
        fr:"℟. Louange à vous, ô Christ.",
      }),
      role:"FIXED_RESPONSE",speakerRole:"RESPONDERS",
    }),
    Object.freeze({
      id:"AO.SM.C0088",
      kind:"TEXT",
      latin:"Per evangélica dicta deleántur nostra delícta.",
      vernacular:Object.freeze({
        en:"By the words of the Gospel may our sins be blotted out.",
        fr:"Que par les paroles de l’Évangile nos péchés soient effacés.",
      }),
      role:"PRIEST_PRIVATE",speakerRole:"PRIEST",
    }),
  ]),
});

function languageKey(language){
  return String(language??"en").toLowerCase().startsWith("fr") ? "fr" : "en";
}

export function composeProperReaderParagraphs(blockId, resolvedProperParagraphs, {language="en",form="SUNG"}={}) {
  if (!Array.isArray(resolvedProperParagraphs) || resolvedProperParagraphs.length === 0) {
    throw new TypeError("Resolved Proper paragraphs required");
  }
  const locale=languageKey(language);
  const low=String(form??"").toUpperCase()==="LOW";
  const fixed=(PINNED_PROPER_FOLLOWUPS[String(blockId)] ?? []).map(row=>Object.freeze({
    ...row,
    // The frozen Low source uses MINISTER_RESPONSE for exactly these fixed
    // B019/B020/B026/B088 replies; Sung source uses USER_RESPONSE.
    speakerRole:low&&row.kind==="RESPONSE"?"MINISTERS":row.speakerRole,
    speakerEvidence:low&&row.kind==="RESPONSE"
      ?"CANONICAL_LOW_MASS_MINISTER_RESPONSE_CLOCK":row.speakerEvidence,
    vernacular:row.vernacular?.[locale] ?? row.vernacular?.en ?? "",
  }));
  return Object.freeze([
    ...resolvedProperParagraphs.map(x=>Object.freeze({
      ...x,
      speakerRole:low&&x.kind==="RESPONSE"&&x.prayerRole==="ORATION_RESPONSE"
        ?"MINISTERS":x.speakerRole,
      speakerEvidence:low&&x.kind==="RESPONSE"&&x.prayerRole==="ORATION_RESPONSE"
        ?"1962_LOW_MASS_INTERMEDIATE_ORATION_MINISTER_RESPONSE":x.speakerEvidence,
    })),
    ...fixed,
  ]);
}
