// Reconciled canonical text corrections applied between frozen donor corpus and runtime.
// These are source-audit decisions, not renderer heuristics. Ritual timing/actor state is untouched.

export const CANONICAL_TEXT_CORRECTIONS = Object.freeze({
  // English editorial corrections: source-identified Red Missal (2013),
  // user-supplied copy, PDF pages 24, 26, 28. Latin and French are untouched.
  // Red Missal 2013 preferred English, second editorial wave.
  "AO.SM.C0044": Object.freeze({
    id:"RED-EN-2013-W2-01",
    blockId:"AO.SM.B015",
    field:"english",
    from:"Lord, have mercy.",
    to:"Lord, have mercy on us.",
  }),
  "AO.SM.C0045": Object.freeze({
    id:"RED-EN-2013-W2-02",
    blockId:"AO.SM.B015",
    field:"english",
    from:"Lord, have mercy.",
    to:"Lord, have mercy on us.",
  }),
  "AO.SM.C0046": Object.freeze({
    id:"RED-EN-2013-W2-03",
    blockId:"AO.SM.B015",
    field:"english",
    from:"Lord, have mercy.",
    to:"Lord, have mercy on us.",
  }),
  "AO.SM.C0047": Object.freeze({
    id:"RED-EN-2013-W2-04",
    blockId:"AO.SM.B015",
    field:"english",
    from:"Christ, have mercy.",
    to:"Christ, have mercy on us.",
  }),
  "AO.SM.C0048": Object.freeze({
    id:"RED-EN-2013-W2-05",
    blockId:"AO.SM.B015",
    field:"english",
    from:"Christ, have mercy.",
    to:"Christ, have mercy on us.",
  }),
  "AO.SM.C0049": Object.freeze({
    id:"RED-EN-2013-W2-06",
    blockId:"AO.SM.B015",
    field:"english",
    from:"Christ, have mercy.",
    to:"Christ, have mercy on us.",
  }),
  "AO.SM.C0050": Object.freeze({
    id:"RED-EN-2013-W2-07",
    blockId:"AO.SM.B015",
    field:"english",
    from:"Lord, have mercy.",
    to:"Lord, have mercy on us.",
  }),
  "AO.SM.C0051": Object.freeze({
    id:"RED-EN-2013-W2-08",
    blockId:"AO.SM.B015",
    field:"english",
    from:"Lord, have mercy.",
    to:"Lord, have mercy on us.",
  }),
  "AO.SM.C0052": Object.freeze({
    id:"RED-EN-2013-W2-09",
    blockId:"AO.SM.B015",
    field:"english",
    from:"Lord, have mercy.",
    to:"Lord, have mercy on us.",
  }),
  "AO.SM.C0183": Object.freeze({
    id:"RED-EN-2013-W2-10",
    blockId:"AO.SM.B054",
    field:"english",
    from:"offer unto thy excellent majesty of thy gifts and grants,",
    to:"offer unto Thy most sovereign Majesty out of the gifts Thou hast bestowed upon us,",
  }),
  "AO.SM.C0208": Object.freeze({
    id:"RED-EN-2013-W2-11",
    blockId:"AO.SM.B062",
    field:"english",
    from:"Admonished by saving precepts, and formed by divine teaching, we dare to say:",
    to:"Admonished by Thy saving precepts and formed by Thy divine instruction, we make bold to say:",
  }),
  "AO.SM.C0214": Object.freeze({
    id:"RED-EN-2013-W2-12",
    blockId:"AO.SM.B064",
    field:"english",
    from:"that, assisted by the help of thy mercy, we may always be free from sin and secure from all disturbance.",
    to:"that, through the bounteous help of Thy mercy, we may always be free from sin and safe from all disquiet.",
  }),
  "AO.SM.C0221": Object.freeze({
    id:"RED-EN-2013-W2-13",
    blockId:"AO.SM.B067",
    field:"english",
    from:"be for us who receive it unto life everlasting.",
    to:"be for us who receive it a source of eternal life.",
  }),
  "AO.SM.C0225": Object.freeze({
    id:"RED-EN-2013-W2-14",
    blockId:"AO.SM.B069",
    field:"english",
    from:"regard not my sins, but the faith of Thy Church; and vouchsafe to grant her peace and unity according to Thy will:",
    to:"look not upon my sins, but upon the faith of Thy Church; and deign to give her peace and unity according to Thy will:",
  }),
  "AO.SM.C0233": Object.freeze({
    id:"RED-EN-2013-W2-15",
    blockId:"AO.SM.B075",
    field:"english",
    from:"Praising I will call upon the Lord",
    to:"I will call upon the Lord and give praise",
  }),
  // Reviewed 2013 Red Missal p.13, p.15: prayer at the foot of the altar.
  "AO.SM.C0021": Object.freeze({
    id:"RED-EN-2013-W3-01",
    blockId:"AO.SM.B007",
    field:"english",
    from:"and to you Father, that I have sinned",
    to:"and to you, Father, that I have sinned",
  }),
  "AO.SM.C0039": Object.freeze({
    id:"RED-EN-2013-W3-03",
    blockId:"AO.SM.B012",
    field:"english",
    from:"whose relics are here, and of all the Saints: that thou wouldst vouchsafe to forgive me all my sins. Amen.",
    to:"whose relics are here, and of all the Saints, that Thou wilt deign to pardon me all my sins. Amen.",
  }),
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

// An additional correction on a different field may share a canonical cue.
// Keep the original per-cue registry and its IDs stable for existing consumers.
// The supplementary registry is source-owned, not a renderer replacement rule.
export const CANONICAL_TEXT_ADDITIONAL_FIELD_CORRECTIONS = Object.freeze({
  "AO.SM.C0023": Object.freeze({
    id:"RED-EN-2013-W4-01",
    blockId:"AO.SM.B007",
    field:"english",
    from:"and thee Father, to pray",
    to:"and you, Father, to pray",
  }),
});

export function getCanonicalTextCorrections(cueId){
  const primary=CANONICAL_TEXT_CORRECTIONS[cueId];
  const additional=CANONICAL_TEXT_ADDITIONAL_FIELD_CORRECTIONS[cueId];
  if(!primary&&!additional)return Object.freeze([]);
  const all=[primary,additional].filter(Boolean);
  const fields=new Set();
  for(const rule of all){
    if(!["latin","english"].includes(rule.field))
      throw new Error(cueId+": unowned text correction field "+rule.field);
    if(fields.has(rule.field))
      throw new Error(cueId+": duplicate correction owner for "+rule.field);
    fields.add(rule.field);
  }
  return Object.freeze(all);
}

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
  const corrections=getCanonicalTextCorrections(unit.cue_id);
  if(!corrections.length)return Object.freeze({...unit});
  let next={...unit};
  for(const correction of corrections){
    if(String(blockId)!==correction.blockId)
      throw new Error(unit.cue_id+": correction block ownership changed");
    next[correction.field]=replaceExactlyOnce(
      next[correction.field],correction.from,correction.to,
      unit.cue_id+"/"+correction.field);
  }
  const ids=Object.freeze(corrections.map(c=>c.id));
  return Object.freeze({
    ...next,
    // Backwards-compatible ID for older source/reader consumers.
    canonicalCorrectionId:ids[0],
    // Precise provenance for multiple field owners on the same cue.
    canonicalCorrectionIds:ids,
  });
}
