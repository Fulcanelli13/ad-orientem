// Native A/C 65-card Ordo: original 1961 Gregorian minister/celebrant
// dialogue excerpts at exact existing Gospel and Communion source cues.
// Gospel proclamation is variable and MUST NOT borrow the sample printed
// Gospel melody. Printed response notes remain in their existing registry.
// Nothing here is approved public notation or an observed Schola choice.
import {isExplicitRequiemMass} from "./reader-requiem-conditions.js";
export const GOSPEL_CANON_PAX_LEADER_SCHEMA="ao-ordo-1961-gospel-canon-pax-five-leaders-v1";
export const GOSPEL_CANON_PAX_LEADER_SCORES=Object.freeze([
  {
    "id": "AO.REF.LEADER_GOSPEL_4490.0082",
    "sourceId": 4490,
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=4490",
    "sourceFolio": "Liber Usualis (1961), p.106; Graduale Romanum (1961), p.126*",
    "sourcePhraseIndex": 0,
    "sourceCueIds": [
      "AO.SM.C0082"
    ],
    "sourceCueLatin": [
      "℣. Dóminus vobíscum."
    ],
    "sourceLatin": "℣. Dóminus vobíscum.",
    "eventId": "GOSPEL",
    "kind": "CELEBRANT_VERSE",
    "toneFamily": "GOSPEL_STANDARD",
    "settingId": "GOSPEL_STANDARD",
    "printVerification": "PENDING_NOTE_BY_NOTE_FACSIMILE_COLLATION",
    "publicScoreApproved": false,
    "gabc": "name: Source 4490 AO.SM.C0082;\noffice-part: Toni Communes;\nsource: Liber Usualis (1961), p.106; Graduale Romanum (1961), p.126*;\n%%\n(c3) DO(h)mi(h)nus(h) vo(h)bís(h)cum.(h.) (::)"
  },
  {
    "id": "AO.REF.LEADER_GOSPEL_4491.0082",
    "sourceId": 4491,
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=4491",
    "sourceFolio": "Liber Usualis (1961), p.107; Graduale Romanum (1961), p.127*",
    "sourcePhraseIndex": 0,
    "sourceCueIds": [
      "AO.SM.C0082"
    ],
    "sourceCueLatin": [
      "℣. Dóminus vobíscum."
    ],
    "sourceLatin": "℣. Dóminus vobíscum.",
    "eventId": "GOSPEL",
    "kind": "CELEBRANT_VERSE",
    "toneFamily": "GOSPEL_ALTERNATE_AD_LIBITUM",
    "settingId": "GOSPEL_ALTERNATE_AD_LIBITUM",
    "printVerification": "PENDING_NOTE_BY_NOTE_FACSIMILE_COLLATION",
    "publicScoreApproved": false,
    "gabc": "name: Source 4491 AO.SM.C0082;\noffice-part: Toni Communes;\nsource: Liber Usualis (1961), p.107; Graduale Romanum (1961), p.127*;\n%%\n(c3) DO(h)mi(h)nus(h) vo(f)bís(h)cum.(h.) (::)"
  },
  {
    "id": "AO.REF.LEADER_CANON_END_7282.0206",
    "sourceId": 7282,
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=7282",
    "sourceFolio": "Liber Usualis (1961), p.110; Graduale Romanum (1961), p.132*",
    "sourcePhraseIndex": 0,
    "sourceCueIds": [
      "AO.SM.C0206"
    ],
    "sourceCueLatin": [
      "℣. Per ómnia sǽcula sæculórum."
    ],
    "sourceLatin": "℣. Per ómnia sǽcula sæculórum.",
    "eventId": "CANON_END",
    "kind": "CELEBRANT_VERSE",
    "toneFamily": "PRINTED_COMMON_TONE_FIXED_EXCHANGE",
    "settingId": "PRINTED_COMMON_TONE_FIXED_EXCHANGE",
    "printVerification": "PENDING_NOTE_BY_NOTE_FACSIMILE_COLLATION",
    "publicScoreApproved": false,
    "gabc": "name: Source 7282 AO.SM.C0206;\noffice-part: Toni Communes;\nsource: Liber Usualis (1961), p.110; Graduale Romanum (1961), p.132*;\n%%\n(c3) PER(c) ó(e)mni(f)a(f) saé(g)cu(f)la(f) sae(e)cu(f)ló(fe)rum.(e.) (::)"
  },
  {
    "id": "AO.REF.LEADER_PAX_DOMINI_4327.0217",
    "sourceId": 4327,
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=4327",
    "sourceFolio": "Liber Usualis (1961), p.110; Graduale Romanum (1961), p.133*",
    "sourcePhraseIndex": 0,
    "sourceCueIds": [
      "AO.SM.C0217"
    ],
    "sourceCueLatin": [
      "℣. Per ómnia sæcula sæculórum."
    ],
    "sourceLatin": "℣. Per ómnia sæcula sæculórum.",
    "eventId": "PAX_DOMINI",
    "kind": "CELEBRANT_VERSE",
    "toneFamily": "PRINTED_COMMON_TONE_FIXED_EXCHANGE",
    "settingId": "PRINTED_COMMON_TONE_FIXED_EXCHANGE",
    "printVerification": "PENDING_NOTE_BY_NOTE_FACSIMILE_COLLATION",
    "publicScoreApproved": false,
    "gabc": "name: Source 4327 AO.SM.C0217;\noffice-part: Toni Communes;\nsource: Liber Usualis (1961), p.110; Graduale Romanum (1961), p.133*;\n%%\n(c3) PER(c) ó(e)mni(f)a(f) saé(g)cu(f)la(f) sae(e)cu(f)ló(fe)rum.(e.) (::)"
  },
  {
    "id": "AO.REF.LEADER_PAX_DOMINI_4327.0219",
    "sourceId": 4327,
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=4327",
    "sourceFolio": "Liber Usualis (1961), p.110; Graduale Romanum (1961), p.133*",
    "sourcePhraseIndex": 2,
    "sourceCueIds": [
      "AO.SM.C0219"
    ],
    "sourceCueLatin": [
      "℣. Pax ✠ Dómini sit ✠ semper ✠ vobíscum."
    ],
    "sourceLatin": "℣. Pax ✠ Dómini sit ✠ semper ✠ vobíscum.",
    "eventId": "PAX_DOMINI",
    "kind": "CELEBRANT_VERSE",
    "toneFamily": "PRINTED_COMMON_TONE_FIXED_EXCHANGE",
    "settingId": "PRINTED_COMMON_TONE_FIXED_EXCHANGE",
    "printVerification": "PENDING_NOTE_BY_NOTE_FACSIMILE_COLLATION",
    "publicScoreApproved": false,
    "gabc": "name: Source 4327 AO.SM.C0219;\noffice-part: Toni Communes;\nsource: Liber Usualis (1961), p.110; Graduale Romanum (1961), p.133*;\n%%\n(c3) <sp>V/</sp>. Pax(f) †~Dó(ef)mi(f)ni(f.) (,) sit(g) †~sem(f)per(e) vo(f)bís-(fe)†cum.(e.) (::)"
  }
]
.map(x=>Object.freeze({...x,sourceCueIds:Object.freeze(x.sourceCueIds),
 sourceCueLatin:Object.freeze(x.sourceCueLatin)})));
const SUNG=new Set(["SOLEMN","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE"]);
const norm=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
 .replace(/æ/gi,"ae").replace(/œ/gi,"oe").replace(/j/gi,"i")
 .toLowerCase().replace(/[^a-z0-9]+/g,"");
const own=p=>Array.isArray(p?.sourceCueIds)?p.sourceCueIds.map(String):[];
export function gospelCanonPaxLeaderScoresForParagraph({
 paragraph=null,paragraphs=[],form=null,resolvedMass=null,selectedSettings={}
}={}){
 if(!SUNG.has(String(form??"").toUpperCase())||!paragraph||
    paragraph.kind==="RUBRIC"||!Array.isArray(paragraphs))return Object.freeze([]);
 const result=[];
 for(const score of GOSPEL_CANON_PAX_LEADER_SCORES){
  if(score.publicScoreApproved!==false||own(paragraph).length!==1||
     own(paragraph)[0]!==score.sourceCueIds[0]||
     paragraphs.filter(p=>own(p).includes(score.sourceCueIds[0])&&p.kind!=="RUBRIC").length!==1||
     ![paragraph.primary,paragraph.secondary,paragraph.alternate].some(v=>
      typeof v==="string"&&norm(v)===norm(score.sourceLatin)))continue;
  if(score.eventId==="GOSPEL"){
   // Tone is independent of solemn/ferial Preface tone. Never infer it from
   // the date or a sample Gospel text; optional second tone is user-selected.
   const selected=selectedSettings?.GOSPEL_TONE??"GOSPEL_STANDARD";
   if(score.toneFamily!==selected)continue;
   if(paragraph.speakerRole&&![
      "PRIEST","DEACON","GOSPEL_PROCLAIMER","MINISTER"].includes(paragraph.speakerRole))continue;
  }else{
   // Common Canon/Pax response music is only offered in the ordinary
   // non-Requiem rite with the original 1962 source cue and an actual Mass.
   if(resolvedMass?.schema!=="ao-resolved-mass-v2"||
      (resolvedMass.distinctRite&&resolvedMass.distinctRite!=="NONE")||
      isExplicitRequiemMass({session:{resolvedMass}}))continue;
  }
  result.push(score);
 }
 return Object.freeze(result);
}
