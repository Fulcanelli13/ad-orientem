// Reconciled canonical text corrections applied between frozen donor corpus and runtime.
// These are source-audit decisions, not renderer heuristics. Ritual timing/actor state is untouched.

export const CANONICAL_TEXT_CORRECTIONS = Object.freeze({
  // English editorial corrections: source-identified Red Missal (2013),
  // user-supplied copy, PDF pages 24, 26, 28. Latin and French are untouched.
  "AO.SM.C0110": Object.freeze({
    id:"RED-EN-2013-001",
    blockId:"AO.SM.B031",
    field:"english",
    from:"Accept, O Holy father, Almighty and Eternal God, this spotless host, which I, Your unworthy servant, offer to You",
    to:"Accept, O holy Father, almighty and everlasting God, this spotless host, which I, Thine unworthy servant, offer unto Thee",
  }),
  "AO.SM.C0121": Object.freeze({
    id:"RED-EN-2013-002",
    blockId:"AO.SM.B036",
    field:"english",
    from:"May this incense blessed by You, arise before You, O Lord, and may Your mercy come down upon us.",
    to:"May this incense which Thou hast blessed, O Lord, ascend to Thee, and may Thy mercy descend upon us.",
  }),
  "AO.SM.C0122": Object.freeze({
    id:"RED-EN-2013-003",
    blockId:"AO.SM.B036",
    field:"english",
    from:"Let my prayer, O Lord, like incense before You; the lifting up of my hands, like the evening sacrifice.",
    to:"Let my prayer rise before Thee as incense, O Lord; let the lifting up of my hands be as the evening sacrifice.",
  }),
  "AO.SM.C0132": Object.freeze({
    id:"RED-EN-2013-004",
    blockId:"AO.SM.B039",
    field:"english",
    from:"May the Lord receive the sacrifice from thy hands, to the praise and glory of His name, to our benefit also, and that of all His holy Church.",
    to:"May the Lord accept the Sacrifice from thy hands, to the praise and glory of His Name, for our benefit and for that of all His holy Church.",
  }),
  "AO.SM.C0148": Object.freeze({
    id:"SRC-PARITY-001",
    blockId:"AO.SM.B046",
    field:"latin",
    from:"Benedíctus qui venit",
    to:"Benedíctus ✠ qui venit",
  }),
  "AO.SM.C0153": Object.freeze({
    id:"SRC-PARITY-002",
    blockId:"AO.SM.B047",
    field:"latin",
    from:"Antístite nostro et ómnibus",
    to:"Antístite nostro N. et ómnibus",
  }),
  "AO.SM.C0194": Object.freeze({
    id:"SRC-PARITY-003",
    blockId:"AO.SM.B057",
    field:"latin",
    from:"lucis pacis",
    to:"lucis et pacis",
  }),
  "AO.SM.C0023": Object.freeze({
    id:"P1-011",
    blockId:"AO.SM.B007",
    field:"latin",
    from:"orare pro me",
    to:"oráre pro me",
  }),
  "AO.SM.C0237": Object.freeze({
    id:"P1-011",
    blockId:"AO.SM.B077",
    field:"latin",
    from:"orare pro me",
    to:"oráre pro me",
  }),
});

function replaceExactlyOnce(value, from, to, label){
  const text=String(value??"");
  if(text.includes(to) && !text.includes(from)) return text;
  const first=text.indexOf(from);
  if(first<0) throw new Error(label+": expected source fragment not found");
  if(text.indexOf(from,first+from.length)>=0) throw new Error(label+": source fragment occurs more than once");
  return text.slice(0,first)+to+text.slice(first+from.length);
}

export function applyCanonicalTextCorrection(blockId, unit){
  if(!unit || typeof unit!=="object") throw new TypeError("Canonical text unit required");
  const correction=CANONICAL_TEXT_CORRECTIONS[unit.cue_id];
  if(!correction) return Object.freeze({...unit});
  if(String(blockId)!==correction.blockId){
    throw new Error(unit.cue_id+": correction block ownership changed");
  }
  const field=correction.field;
  const corrected=replaceExactlyOnce(unit[field],correction.from,correction.to,unit.cue_id);
  return Object.freeze({
    ...unit,
    [field]:corrected,
    canonicalCorrectionId:correction.id,
  });
}
