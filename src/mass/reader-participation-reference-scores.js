import {resolve1962DialogueToneFamily} from "./reader-mass-1962-tone-family.js";
import {isExplicitRequiemMass} from "./reader-requiem-conditions.js";
// Preview-only exact-phrase Gregorian references for the 65-card Sung Mass.
// Original 1961 GABC phrase bodies, no melody edits, sourced from already
// committed M05 research and existing Kyriale Ordinary pilot. Clef is
// carried from the parent score when excerpting a later response phrase.
// NOT approved for publication, automated Mass setting or live singing.
export const PARTICIPATION_REFERENCE_SCHEMA="ao-sung-mass-participation-reference-v1";
export const PARTICIPATION_REFERENCE_SCORES=Object.freeze([
  {
    "id": "AO.REF.PREFACE_SOLEMN.0136",
    "sourceId": 4449,
    "sourceName": "Toni Praefationum (1. Tonus solemnis)",
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=4449",
    "sourceFolio": "Liber Usualis (Solesmes, 1961), p. 109",
    "sourceDocument": "data/research/mass-music-m05-cc0-gabc-seven-20261031.v1.json",
    "sourcePhraseIndex": 1,
    "sourceCueIds": [
      "AO.SM.C0136"
    ],
    "sourceLatin": "℟. Amen.",
    "kind": "PEOPLE_RESPONSE",
    "eventId": "PREFACE_DIALOGUE",
    "toneFamily": "SOLEMN",
    "settingId": null,
    "printVerification": "PENDING_NOTE_BY_NOTE_FACSIMILE_COLLATION",
    "publicScoreApproved": false,
    "gabc": "name: PREFACE_SOLEMN AO.SM.C0136;\noffice-part: Toni Communes;\nsource: Liber Usualis (Solesmes, 1961), p. 109;\n%%\n(c3) <sp>R/</sp>. A(e)men.(ef..) (::)"
  },
  {
    "id": "AO.REF.PREFACE_SOLEMN.0138",
    "sourceId": 4449,
    "sourceName": "Toni Praefationum (1. Tonus solemnis)",
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=4449",
    "sourceFolio": "Liber Usualis (Solesmes, 1961), p. 109",
    "sourceDocument": "data/research/mass-music-m05-cc0-gabc-seven-20261031.v1.json",
    "sourcePhraseIndex": 3,
    "sourceCueIds": [
      "AO.SM.C0138"
    ],
    "sourceLatin": "℟. Et cum spíritu tuo.",
    "kind": "PEOPLE_RESPONSE",
    "eventId": "PREFACE_DIALOGUE",
    "toneFamily": "SOLEMN",
    "settingId": null,
    "printVerification": "PENDING_NOTE_BY_NOTE_FACSIMILE_COLLATION",
    "publicScoreApproved": false,
    "gabc": "name: PREFACE_SOLEMN AO.SM.C0138;\noffice-part: Toni Communes;\nsource: Liber Usualis (Solesmes, 1961), p. 109;\n%%\n(c3) <sp>R/</sp>. Et(e) cum(f) spí(g)ri(e)tu(f) tu(gf)o.(f.) (::)"
  },
  {
    "id": "AO.REF.PREFACE_SOLEMN.0140",
    "sourceId": 4449,
    "sourceName": "Toni Praefationum (1. Tonus solemnis)",
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=4449",
    "sourceFolio": "Liber Usualis (Solesmes, 1961), p. 109",
    "sourceDocument": "data/research/mass-music-m05-cc0-gabc-seven-20261031.v1.json",
    "sourcePhraseIndex": 5,
    "sourceCueIds": [
      "AO.SM.C0140"
    ],
    "sourceLatin": "℟. Habémus ad Dóminum.",
    "kind": "PEOPLE_RESPONSE",
    "eventId": "PREFACE_DIALOGUE",
    "toneFamily": "SOLEMN",
    "settingId": null,
    "printVerification": "PENDING_NOTE_BY_NOTE_FACSIMILE_COLLATION",
    "publicScoreApproved": false,
    "gabc": "name: PREFACE_SOLEMN AO.SM.C0140;\noffice-part: Toni Communes;\nsource: Liber Usualis (Solesmes, 1961), p. 109;\n%%\n(c3) <sp>R/</sp>. Ha(g)bé(f!gwh)mus(g) ad(g) Dó(fg)mi(f)num.(fe..) (::)"
  },
  {
    "id": "AO.REF.PREFACE_SOLEMN.0143",
    "sourceId": 4449,
    "sourceName": "Toni Praefationum (1. Tonus solemnis)",
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=4449",
    "sourceFolio": "Liber Usualis (Solesmes, 1961), p. 109",
    "sourceDocument": "data/research/mass-music-m05-cc0-gabc-seven-20261031.v1.json",
    "sourcePhraseIndex": 7,
    "sourceCueIds": [
      "AO.SM.C0143"
    ],
    "sourceLatin": "℟. Dignum et iustum est.",
    "kind": "PEOPLE_RESPONSE",
    "eventId": "PREFACE_DIALOGUE",
    "toneFamily": "SOLEMN",
    "settingId": null,
    "printVerification": "PENDING_NOTE_BY_NOTE_FACSIMILE_COLLATION",
    "publicScoreApproved": false,
    "gabc": "name: PREFACE_SOLEMN AO.SM.C0143;\noffice-part: Toni Communes;\nsource: Liber Usualis (Solesmes, 1961), p. 109;\n%%\n(c3) <sp>R/</sp>. Di(f!gwh)gnum(g) et(g) ju(fg)stum(f) est.(fe..) (::)"
  },
  {
    "id": "AO.REF.PREFACE_FERIAL.0136",
    "sourceId": 4450,
    "sourceName": "Toni Praefationum (2. Tonus ferialis)",
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=4450",
    "sourceFolio": "Liber Usualis (Solesmes, 1961), p. 109",
    "sourceDocument": "data/research/mass-music-m05-cc0-gabc-seven-20261031.v1.json",
    "sourcePhraseIndex": 1,
    "sourceCueIds": [
      "AO.SM.C0136"
    ],
    "sourceLatin": "℟. Amen.",
    "kind": "PEOPLE_RESPONSE",
    "eventId": "PREFACE_DIALOGUE",
    "toneFamily": "FERIAL",
    "settingId": null,
    "printVerification": "PENDING_NOTE_BY_NOTE_FACSIMILE_COLLATION",
    "publicScoreApproved": false,
    "gabc": "name: PREFACE_FERIAL AO.SM.C0136;\noffice-part: Toni Communes;\nsource: Liber Usualis (Solesmes, 1961), p. 109;\n%%\n(c3) <sp>R/</sp>. A(e)men.(ef..) (::)"
  },
  {
    "id": "AO.REF.PREFACE_FERIAL.0138",
    "sourceId": 4450,
    "sourceName": "Toni Praefationum (2. Tonus ferialis)",
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=4450",
    "sourceFolio": "Liber Usualis (Solesmes, 1961), p. 109",
    "sourceDocument": "data/research/mass-music-m05-cc0-gabc-seven-20261031.v1.json",
    "sourcePhraseIndex": 3,
    "sourceCueIds": [
      "AO.SM.C0138"
    ],
    "sourceLatin": "℟. Et cum spíritu tuo.",
    "kind": "PEOPLE_RESPONSE",
    "eventId": "PREFACE_DIALOGUE",
    "toneFamily": "FERIAL",
    "settingId": null,
    "printVerification": "PENDING_NOTE_BY_NOTE_FACSIMILE_COLLATION",
    "publicScoreApproved": false,
    "gabc": "name: PREFACE_FERIAL AO.SM.C0138;\noffice-part: Toni Communes;\nsource: Liber Usualis (Solesmes, 1961), p. 109;\n%%\n(c3) <sp>R/</sp>. Et(e) cum(f) spí(g)ri(e)tu(f) tu(g)o.(f.) (::)"
  },
  {
    "id": "AO.REF.PREFACE_FERIAL.0140",
    "sourceId": 4450,
    "sourceName": "Toni Praefationum (2. Tonus ferialis)",
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=4450",
    "sourceFolio": "Liber Usualis (Solesmes, 1961), p. 109",
    "sourceDocument": "data/research/mass-music-m05-cc0-gabc-seven-20261031.v1.json",
    "sourcePhraseIndex": 5,
    "sourceCueIds": [
      "AO.SM.C0140"
    ],
    "sourceLatin": "℟. Habémus ad Dóminum.",
    "kind": "PEOPLE_RESPONSE",
    "eventId": "PREFACE_DIALOGUE",
    "toneFamily": "FERIAL",
    "settingId": null,
    "printVerification": "PENDING_NOTE_BY_NOTE_FACSIMILE_COLLATION",
    "publicScoreApproved": false,
    "gabc": "name: PREFACE_FERIAL AO.SM.C0140;\noffice-part: Toni Communes;\nsource: Liber Usualis (Solesmes, 1961), p. 109;\n%%\n(c3) <sp>R/</sp>. Ha(g)bé(h)mus(g) ad(f) Dó(g)mi(f)num.(fe..) (::)"
  },
  {
    "id": "AO.REF.PREFACE_FERIAL.0143",
    "sourceId": 4450,
    "sourceName": "Toni Praefationum (2. Tonus ferialis)",
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=4450",
    "sourceFolio": "Liber Usualis (Solesmes, 1961), p. 109",
    "sourceDocument": "data/research/mass-music-m05-cc0-gabc-seven-20261031.v1.json",
    "sourcePhraseIndex": 7,
    "sourceCueIds": [
      "AO.SM.C0143"
    ],
    "sourceLatin": "℟. Dignum et iustum est.",
    "kind": "PEOPLE_RESPONSE",
    "eventId": "PREFACE_DIALOGUE",
    "toneFamily": "FERIAL",
    "settingId": null,
    "printVerification": "PENDING_NOTE_BY_NOTE_FACSIMILE_COLLATION",
    "publicScoreApproved": false,
    "gabc": "name: PREFACE_FERIAL AO.SM.C0143;\noffice-part: Toni Communes;\nsource: Liber Usualis (Solesmes, 1961), p. 109;\n%%\n(c3) <sp>R/</sp>. Di(h)gnum(g) et(f) ju(g)stum(f) est.(fe..) (::)"
  },
  {
    "id": "AO.REF.ORATIONS_FESTIVE.0071",
    "sourceId": 4487,
    "sourceName": "Dominus vobiscum (Toni Orationem: Tonus festivus.)",
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=4487",
    "sourceFolio": "Liber Usualis (Solesmes, 1961), p. 98",
    "sourceDocument": "data/research/mass-music-m05-cc0-gabc-seven-20261031.v1.json",
    "sourcePhraseIndex": 1,
    "sourceCueIds": [
      "AO.SM.C0071"
    ],
    "sourceLatin": "℟. Et cum spíritu tuo.",
    "kind": "PEOPLE_RESPONSE",
    "eventId": "COLLECT",
    "toneFamily": "SOLEMN",
    "settingId": null,
    "printVerification": "PENDING_NOTE_BY_NOTE_FACSIMILE_COLLATION",
    "publicScoreApproved": false,
    "gabc": "name: ORATIONS_FESTIVE AO.SM.C0071;\noffice-part: Toni Communes;\nsource: Liber Usualis (Solesmes, 1961), p. 98;\n%%\n(c3) <sp>R/</sp>. Et(h) cum(h) spí(h)ri(h)tu(h) tu(h)o.(h.) (::)"
  },
  {
    "id": "AO.REF.ORATIONS_FESTIVE.0252",
    "sourceId": 4487,
    "sourceName": "Dominus vobiscum (Toni Orationem: Tonus festivus.)",
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=4487",
    "sourceFolio": "Liber Usualis (Solesmes, 1961), p. 98",
    "sourceDocument": "data/research/mass-music-m05-cc0-gabc-seven-20261031.v1.json",
    "sourcePhraseIndex": 1,
    "sourceCueIds": [
      "AO.SM.C0252"
    ],
    "sourceLatin": "℟. Et cum spíritu tuo.",
    "kind": "PEOPLE_RESPONSE",
    "eventId": "POSTCOMMUNION",
    "toneFamily": "SOLEMN",
    "settingId": null,
    "printVerification": "PENDING_NOTE_BY_NOTE_FACSIMILE_COLLATION",
    "publicScoreApproved": false,
    "gabc": "name: ORATIONS_FESTIVE AO.SM.C0252;\noffice-part: Toni Communes;\nsource: Liber Usualis (Solesmes, 1961), p. 98;\n%%\n(c3) <sp>R/</sp>. Et(h) cum(h) spí(h)ri(h)tu(h) tu(h)o.(h.) (::)"
  },
  {
    "id": "AO.REF.PATERNOSTER_COMMON.0210",
    "sourceId": 7282,
    "sourceName": "Per omnia ... Et ne nos inducas",
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=7282",
    "sourceFolio": "Liber Usualis (Solesmes, 1961), p. 110",
    "sourceDocument": "data/research/mass-music-m05-cc0-gabc-seven-20261031.v1.json",
    "sourcePhraseIndex": 3,
    "sourceCueIds": [
      "AO.SM.C0210"
    ],
    "sourceLatin": "℟. Sed líbera nos a malo.",
    "kind": "PEOPLE_RESPONSE",
    "eventId": "PATERNOSTER",
    "toneFamily": "UNRESOLVED",
    "settingId": null,
    "printVerification": "PENDING_NOTE_BY_NOTE_FACSIMILE_COLLATION",
    "publicScoreApproved": false,
    "gabc": "name: PATERNOSTER_COMMON AO.SM.C0210;\noffice-part: Toni Communes;\nsource: Liber Usualis (Solesmes, 1961), p. 110;\n%%\n(c3) <sp>R/</sp>. Sed(e) lí(f)be(f)ra(f) nos(f) a(g) ma(fe)lo.(e.) (::)"
  },
  {
    "id": "AO.REF.GLORIA_VIII.0053",
    "sourceId": 961,
    "sourceName": "Gloria VIII",
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=961",
    "sourceFolio": "Graduale Romanum (Solesmes, 1961), p. 29*",
    "sourceDocument": "src/mass/reader-ordinary-scores-1961.js",
    "sourcePhraseIndex": 0,
    "sourceCueIds": [
      "AO.SM.C0053",
      "AO.SM.C0054"
    ],
    "sourceLatin": "Glória in excélsis Deo.",
    "kind": "CELEBRANT_INTONATION",
    "eventId": "GLORIA_INTONATION",
    "toneFamily": "SELECTED_ORDINARY",
    "settingId": "MASS_08",
    "printVerification": "PENDING_NOTE_BY_NOTE_FACSIMILE_COLLATION",
    "publicScoreApproved": false,
    "gabc": "name: GLORIA_VIII AO.SM.C0053;\noffice-part: Kyriale;\nsource: Graduale Romanum 1961;\n%%\n(c3) GLó(h')ri(h)a(f') in(e) ex(d)cél(e')sis(f) De(e.)o.(d.) (::)"
  },
  {
    "id": "AO.REF.CREDO_III.0089",
    "sourceId": 749,
    "sourceName": "Credo III",
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=749",
    "sourceFolio": "Graduale Romanum (Solesmes, 1961), p. 64*",
    "sourceDocument": "src/mass/reader-ordinary-scores-1961.js",
    "sourcePhraseIndex": 0,
    "sourceCueIds": [
      "AO.SM.C0089",
      "AO.SM.C0090"
    ],
    "sourceLatin": "Credo in unum Deum.",
    "kind": "CELEBRANT_INTONATION",
    "eventId": "CREDO_INTONATION",
    "toneFamily": "SELECTED_ORDINARY",
    "settingId": "CREDO_03",
    "printVerification": "PENDING_NOTE_BY_NOTE_FACSIMILE_COLLATION",
    "publicScoreApproved": false,
    "gabc": "name: CREDO_III AO.SM.C0089;\noffice-part: Kyriale;\nsource: Graduale Romanum 1961;\n%%\n(c3) CRe(h)do(f) in(d) u(gxg)num(f) De(fvED)um,(d.) (::)"
  }
].map(score=>Object.freeze({...score,sourceCueIds:Object.freeze(score.sourceCueIds)})));

const SUNG=new Set(["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
const norm=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
 .replace(/æ/gi,"ae").replace(/œ/gi,"oe").replace(/j/gi,"i")
 .toLowerCase().replace(/[^a-z0-9]+/g,"");
const cueList=p=>Array.isArray(p?.sourceCueIds)?p.sourceCueIds.map(String):[];
const originalText=p=>[p?.primary,p?.secondary,p?.alternate].find(x=>typeof x==="string"&&x.trim())??"";
/** Explicit opt-in preview ONLY. Do not call from approved public chant selector.
 * The current paragraph must own the first source cue, every other phrase
 * fragment must be present in the same canonical ordered source sequence,
 * and the selected liturgical tone must be verified before display.
 */
export function participationReferenceScoresForParagraph({
 paragraph=null,paragraphs=[],form=null,resolvedMass=null,selectedSettings={}
}={}){
 if(!SUNG.has(String(form??"").toUpperCase())||!paragraph||paragraph.kind==="RUBRIC"||
    !Array.isArray(paragraphs))return Object.freeze([]);
 const out=[];const cueIds=cueList(paragraph);
 for(const score of PARTICIPATION_REFERENCE_SCORES){
  if(!cueIds.includes(score.sourceCueIds[0])||!score.gabc.includes("%%")||
     score.publicScoreApproved!==false)continue;
  const fragments=score.sourceCueIds.map(cueId=>{
   const matched=paragraphs.filter(p=>cueList(p).includes(cueId)&&p.kind!=="RUBRIC");
   return matched.length===1?matched[0]:null;
  });
  if(fragments.some(p=>!p))continue;
  // The explicitly targeted row and the source-indexed fragment must agree;
  // an alternate translation or a stale/forged Latin row cannot borrow notes.
  if(norm(originalText(paragraph))!==norm(originalText(fragments[0])))continue;
  // Exact sequence matters for the two-piece Gloria and Credo intonation.
  const indices=fragments.map(p=>paragraphs.indexOf(p));
  if(!indices.every((n,i)=>n>=0&&(i===0||n===indices[0]+i)))continue;
  const combined=fragments.map(originalText).join(" ");
  if(norm(combined)!==norm(score.sourceLatin))continue;
  if(score.toneFamily==="UNRESOLVED")continue; // Pater reference held
  if(score.toneFamily==="SELECTED_ORDINARY"){
   if(isExplicitRequiemMass({session:{resolvedMass}}))continue;
   const movement=score.eventId==="GLORIA_INTONATION"?"GLORIA":"CREDO";
   if((movement==="GLORIA"&&resolvedMass?.provenance?.gloria===false)||
      (movement==="CREDO"&&resolvedMass?.provenance?.credo===false)||
      selectedSettings?.[movement]!==score.settingId)continue;
  }else{
   const tone=resolve1962DialogueToneFamily(score.eventId,{resolvedMass});
   if(tone?.status!=="RUBRICAL_FAMILY_RESOLVED"||
     tone.family!==score.toneFamily)continue;
  }
  out.push(score);
 }
 return Object.freeze(out);
}
