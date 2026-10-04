// Display-only composition for blocks that contain a resolved Proper payload
// followed by fixed canonical Mass text. This module never changes event timing or
// actor ownership; it only restores the fixed text that follows the Proper cue.

export const PINNED_PROPER_FOLLOWUPS = Object.freeze({
  "AO.SM.B020": Object.freeze([
    Object.freeze({
      id:"AO.SM.C0076",
      kind:"RESPONSE",
      latin:"℟. Deo grátias.",
      vernacular:"℟. Thanks be to God.",
      role:"FIXED_RESPONSE",
    }),
  ]),
  "AO.SM.B026": Object.freeze([
    Object.freeze({
      id:"AO.SM.C0087",
      kind:"RESPONSE",
      latin:"℟. Laus tibi, Christe.",
      vernacular:"℟. Praise be to Thee, O Christ.",
      role:"FIXED_RESPONSE",
    }),
    Object.freeze({
      id:"AO.SM.C0088",
      kind:"TEXT",
      latin:"Per evangélica dicta deleántur nostra delícta.",
      vernacular:"By the words of the Gospel may our sins be blotted out.",
      role:"PRIEST_PRIVATE",
    }),
  ]),
});

export function composeProperReaderParagraphs(blockId, resolvedProperParagraphs) {
  if (!Array.isArray(resolvedProperParagraphs) || resolvedProperParagraphs.length === 0) {
    throw new TypeError("Resolved Proper paragraphs required");
  }
  const fixed = PINNED_PROPER_FOLLOWUPS[String(blockId)] ?? [];
  return Object.freeze([
    ...resolvedProperParagraphs.map(x=>Object.freeze({...x})),
    ...fixed,
  ]);
}
