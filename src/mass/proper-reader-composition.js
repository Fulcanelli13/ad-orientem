// Display-only composition for blocks that contain a resolved Proper payload
// followed by fixed canonical Mass text. This module never changes event timing or
// actor ownership; it only restores the fixed text that follows the Proper cue.

export const PINNED_PROPER_FOLLOWUPS = Object.freeze({
  "AO.SM.B020": Object.freeze([
    Object.freeze({
      id:"AO.SM.C0076",
      kind:"RESPONSE",
      latin:"℟. Deo grátias.",
      vernacular:Object.freeze({
        en:"℟. Thanks be to God.",
        fr:"℟. Nous rendons grâces à Dieu.",
      }),
      role:"FIXED_RESPONSE",
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
      role:"FIXED_RESPONSE",
    }),
    Object.freeze({
      id:"AO.SM.C0088",
      kind:"TEXT",
      latin:"Per evangélica dicta deleántur nostra delícta.",
      vernacular:Object.freeze({
        en:"By the words of the Gospel may our sins be blotted out.",
        fr:"Que par les paroles de l’Évangile nos péchés soient effacés.",
      }),
      role:"PRIEST_PRIVATE",
    }),
  ]),
});

function languageKey(language){
  return String(language??"en").toLowerCase().startsWith("fr") ? "fr" : "en";
}

export function composeProperReaderParagraphs(blockId, resolvedProperParagraphs, {language="en"}={}) {
  if (!Array.isArray(resolvedProperParagraphs) || resolvedProperParagraphs.length === 0) {
    throw new TypeError("Resolved Proper paragraphs required");
  }
  const locale=languageKey(language);
  const fixed=(PINNED_PROPER_FOLLOWUPS[String(blockId)] ?? []).map(row=>Object.freeze({
    ...row,
    vernacular:row.vernacular?.[locale] ?? row.vernacular?.en ?? "",
  }));
  return Object.freeze([
    ...resolvedProperParagraphs.map(x=>Object.freeze({...x})),
    ...fixed,
  ]);
}
