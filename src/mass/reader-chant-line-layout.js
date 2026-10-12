// Source-cue-targeted chant typography, never a new liturgical text boundary.
// Line breaks are presentation whitespace only: a cue keeps one DOM paragraph,
// one sourceCueId and one exact gesture/focus anchor.
const PHRASE_CUES=Object.freeze([
  "AO.SM.C0055", // Et in terra pax / Laudamus / Benedicimus
  "AO.SM.C0059", // Gratias conclusion / Domine Deus
  "AO.SM.C0063", // first and second Qui tollis
  "AO.SM.C0066", // Tu solus triplet
  "AO.SM.C0094", // Credo procession of doctrinal clauses
  "AO.SM.C0097", // Crucifixus / Resurrexit / Ascendit
  "AO.SM.C0103", // Church / Baptism / Resurrection
]);
const eligible=new Set(PHRASE_CUES);

export function insertChantPhraseBreaks(value,sourceCueIds=[]){
  if(value==null)return value;
  const ids=(sourceCueIds??[]).map(String);
  if(ids.length!==1||!eligible.has(ids[0]))return value;
  const raw=String(value);
  // A layout break only where this cue already has a complete sentence.
  // The same boundary works across source-provided Latin, English and
  // French without rewriting words or inventing choir/congregation turns.
  const shown=raw.replace(/([.!?])([ \t]+)(?=\p{Lu})/gu,"$1\n");
  if(shown.replace(/\s+/gu," ").trim()!==raw.replace(/\s+/gu," ").trim())
    throw new Error(ids[0]+": chant line break changed source words");
  return shown;
}

export const CHANT_PHRASE_CUE_IDS=PHRASE_CUES;
