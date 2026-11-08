// A/C LIVE/MISSAL: source-exact 1961 celebrant Preface turns at their OWN
// 1962 Ordinary source cue IDs. An actual source-verified rubrical tone family
// selects solemn or ferial. NO score is automatically public-approved.
// Copied phrase-for-phrase, without melodic edits, from the already committed
// 31 Oct 2026 GABC #4449 and #4450 print-linked research originals.
import {resolve1962DialogueToneFamily} from "./reader-mass-1962-tone-family.js";
import {isExplicitRequiemMass} from "./reader-requiem-conditions.js";

export const PREFACE_CELEBRANT_INLINE_SCHEMA="ao-ordo-preface-1961-8-celebrant-reference-v1";
export const PREFACE_CELEBRANT_INLINE_SCORES=Object.freeze([
  {
    "id": "AO.REF.PREFACE_CELEBRANT_SOLEMN.0135",
    "sourceId": 4449,
    "sourceName": "Toni Praefationum (1. Tonus solemnis)",
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=4449",
    "sourceFolio": "Liber Usualis (Solesmes, 1961), p. 109",
    "sourceDocument": "data/research/mass-music-m05-cc0-gabc-seven-20261031.v1.json",
    "sourcePhraseIndex": 0,
    "sourceCueIds": [
      "AO.SM.C0135"
    ],
    "sourceCueLatin": [
      "Per ómnia sæcula sæculórum."
    ],
    "sourceLatin": "Per ómnia sæcula sæculórum.",
    "kind": "CELEBRANT_INTONATION",
    "eventId": "PREFACE_DIALOGUE",
    "toneFamily": "SOLEMN",
    "settingId": null,
    "printVerification": "PENDING_NOTE_BY_NOTE_FACSIMILE_COLLATION",
    "publicScoreApproved": false,
    "gabc": "name: SOLEMN PER_OMNIA;\noffice-part: Toni Communes;\nsource: Liber Usualis (Solesmes, 1961), p. 109;\n%%\n(c3) PER(c) ó(e)mni(f)a(f) saé(g)cu(f)la(f) sae(e)cu(f)ló(fe)rum.(e.) (::)"
  },
  {
    "id": "AO.REF.PREFACE_CELEBRANT_SOLEMN.0137",
    "sourceId": 4449,
    "sourceName": "Toni Praefationum (1. Tonus solemnis)",
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=4449",
    "sourceFolio": "Liber Usualis (Solesmes, 1961), p. 109",
    "sourceDocument": "data/research/mass-music-m05-cc0-gabc-seven-20261031.v1.json",
    "sourcePhraseIndex": 2,
    "sourceCueIds": [
      "AO.SM.C0137"
    ],
    "sourceCueLatin": [
      "℣. Dóminus vobíscum."
    ],
    "sourceLatin": "℣. Dóminus vobíscum.",
    "kind": "CELEBRANT_INTONATION",
    "eventId": "PREFACE_DIALOGUE",
    "toneFamily": "SOLEMN",
    "settingId": null,
    "printVerification": "PENDING_NOTE_BY_NOTE_FACSIMILE_COLLATION",
    "publicScoreApproved": false,
    "gabc": "name: SOLEMN DOMINUS_VOBISCUM;\noffice-part: Toni Communes;\nsource: Liber Usualis (Solesmes, 1961), p. 109;\n%%\n(c3) <nlba><sp>V/</sp>. Dó(e)mi(f)nus</nlba>(g) vo(ef)bís(gf)cum.(f.) (::)"
  },
  {
    "id": "AO.REF.PREFACE_CELEBRANT_SOLEMN.0139",
    "sourceId": 4449,
    "sourceName": "Toni Praefationum (1. Tonus solemnis)",
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=4449",
    "sourceFolio": "Liber Usualis (Solesmes, 1961), p. 109",
    "sourceDocument": "data/research/mass-music-m05-cc0-gabc-seven-20261031.v1.json",
    "sourcePhraseIndex": 4,
    "sourceCueIds": [
      "AO.SM.C0139"
    ],
    "sourceCueLatin": [
      "℣. Sursum corda."
    ],
    "sourceLatin": "℣. Sursum corda.",
    "kind": "CELEBRANT_INTONATION",
    "eventId": "PREFACE_DIALOGUE",
    "toneFamily": "SOLEMN",
    "settingId": null,
    "printVerification": "PENDING_NOTE_BY_NOTE_FACSIMILE_COLLATION",
    "publicScoreApproved": false,
    "gabc": "name: SOLEMN SURSUM_CORDA;\noffice-part: Toni Communes;\nsource: Liber Usualis (Solesmes, 1961), p. 109;\n%%\n(c3) <sp>V/</sp>. Sur(f!gwh)sum(g) cor(fg)da.(fe..) (::)"
  },
  {
    "id": "AO.REF.PREFACE_CELEBRANT_SOLEMN.0141",
    "sourceId": 4449,
    "sourceName": "Toni Praefationum (1. Tonus solemnis)",
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=4449",
    "sourceFolio": "Liber Usualis (Solesmes, 1961), p. 109",
    "sourceDocument": "data/research/mass-music-m05-cc0-gabc-seven-20261031.v1.json",
    "sourcePhraseIndex": 6,
    "sourceCueIds": [
      "AO.SM.C0141",
      "AO.SM.C0142"
    ],
    "sourceCueLatin": [
      "℣. Grátias agámus Dómino",
      "Deo nostro."
    ],
    "sourceLatin": "℣. Grátias agámus Dómino Deo nostro.",
    "kind": "CELEBRANT_INTONATION",
    "eventId": "PREFACE_DIALOGUE",
    "toneFamily": "SOLEMN",
    "settingId": null,
    "printVerification": "PENDING_NOTE_BY_NOTE_FACSIMILE_COLLATION",
    "publicScoreApproved": false,
    "gabc": "name: SOLEMN GRATIAS_AGAMUS;\noffice-part: Toni Communes;\nsource: Liber Usualis (Solesmes, 1961), p. 109;\n%%\n(c3) <sp>V/</sp>. Grá(g)ti(fe)as(ef) a(g)gá(f!gwh)mus(g.) (,)\nDó(g)mi(f)no(fe) De(ef)o(g) no(fg)stro.(f.) (::)"
  },
  {
    "id": "AO.REF.PREFACE_CELEBRANT_FERIAL.0135",
    "sourceId": 4450,
    "sourceName": "Toni Praefationum (2. Tonus ferialis)",
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=4450",
    "sourceFolio": "Liber Usualis (Solesmes, 1961), p. 109",
    "sourceDocument": "data/research/mass-music-m05-cc0-gabc-seven-20261031.v1.json",
    "sourcePhraseIndex": 0,
    "sourceCueIds": [
      "AO.SM.C0135"
    ],
    "sourceCueLatin": [
      "Per ómnia sæcula sæculórum."
    ],
    "sourceLatin": "Per ómnia sæcula sæculórum.",
    "kind": "CELEBRANT_INTONATION",
    "eventId": "PREFACE_DIALOGUE",
    "toneFamily": "FERIAL",
    "settingId": null,
    "printVerification": "PENDING_NOTE_BY_NOTE_FACSIMILE_COLLATION",
    "publicScoreApproved": false,
    "gabc": "name: FERIAL PER_OMNIA;\noffice-part: Toni Communes;\nsource: Liber Usualis (Solesmes, 1961), p. 109;\n%%\n(c3) PER(c) ó(e)mni(f)a(f) saé(g)cu(f)la(f) sae(e)cu(f)ló(fe)rum.(e.) (::)"
  },
  {
    "id": "AO.REF.PREFACE_CELEBRANT_FERIAL.0137",
    "sourceId": 4450,
    "sourceName": "Toni Praefationum (2. Tonus ferialis)",
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=4450",
    "sourceFolio": "Liber Usualis (Solesmes, 1961), p. 109",
    "sourceDocument": "data/research/mass-music-m05-cc0-gabc-seven-20261031.v1.json",
    "sourcePhraseIndex": 2,
    "sourceCueIds": [
      "AO.SM.C0137"
    ],
    "sourceCueLatin": [
      "℣. Dóminus vobíscum."
    ],
    "sourceLatin": "℣. Dóminus vobíscum.",
    "kind": "CELEBRANT_INTONATION",
    "eventId": "PREFACE_DIALOGUE",
    "toneFamily": "FERIAL",
    "settingId": null,
    "printVerification": "PENDING_NOTE_BY_NOTE_FACSIMILE_COLLATION",
    "publicScoreApproved": false,
    "gabc": "name: FERIAL DOMINUS_VOBISCUM;\noffice-part: Toni Communes;\nsource: Liber Usualis (Solesmes, 1961), p. 109;\n%%\n(c3) <nlba><sp>V/</sp>. Dó(e)mi(f)nus</nlba>(g) vo(ef)bís(g)cum.(f.) (::)"
  },
  {
    "id": "AO.REF.PREFACE_CELEBRANT_FERIAL.0139",
    "sourceId": 4450,
    "sourceName": "Toni Praefationum (2. Tonus ferialis)",
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=4450",
    "sourceFolio": "Liber Usualis (Solesmes, 1961), p. 109",
    "sourceDocument": "data/research/mass-music-m05-cc0-gabc-seven-20261031.v1.json",
    "sourcePhraseIndex": 4,
    "sourceCueIds": [
      "AO.SM.C0139"
    ],
    "sourceCueLatin": [
      "℣. Sursum corda."
    ],
    "sourceLatin": "℣. Sursum corda.",
    "kind": "CELEBRANT_INTONATION",
    "eventId": "PREFACE_DIALOGUE",
    "toneFamily": "FERIAL",
    "settingId": null,
    "printVerification": "PENDING_NOTE_BY_NOTE_FACSIMILE_COLLATION",
    "publicScoreApproved": false,
    "gabc": "name: FERIAL SURSUM_CORDA;\noffice-part: Toni Communes;\nsource: Liber Usualis (Solesmes, 1961), p. 109;\n%%\n(c3) <sp>V/</sp>. Sur(h)sum(g) cor(fg)da.(fe..) (::)"
  },
  {
    "id": "AO.REF.PREFACE_CELEBRANT_FERIAL.0141",
    "sourceId": 4450,
    "sourceName": "Toni Praefationum (2. Tonus ferialis)",
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=4450",
    "sourceFolio": "Liber Usualis (Solesmes, 1961), p. 109",
    "sourceDocument": "data/research/mass-music-m05-cc0-gabc-seven-20261031.v1.json",
    "sourcePhraseIndex": 6,
    "sourceCueIds": [
      "AO.SM.C0141",
      "AO.SM.C0142"
    ],
    "sourceCueLatin": [
      "℣. Grátias agámus Dómino",
      "Deo nostro."
    ],
    "sourceLatin": "℣. Grátias agámus Dómino Deo nostro.",
    "kind": "CELEBRANT_INTONATION",
    "eventId": "PREFACE_DIALOGUE",
    "toneFamily": "FERIAL",
    "settingId": null,
    "printVerification": "PENDING_NOTE_BY_NOTE_FACSIMILE_COLLATION",
    "publicScoreApproved": false,
    "gabc": "name: FERIAL GRATIAS_AGAMUS;\noffice-part: Toni Communes;\nsource: Liber Usualis (Solesmes, 1961), p. 109;\n%%\n(c3) <sp>V/</sp>. Grá(h)ti(g)as(g) a(f)gá(g)mus(g.) (,)\n<nlba>Dó(g)mi(g)no</nlba>(g) De(e)o(f) no(g)stro.(f.) (::)"
  }
]
.map(x=>Object.freeze({...x,sourceCueIds:Object.freeze(x.sourceCueIds),
 sourceCueLatin:Object.freeze(x.sourceCueLatin)})));

const sung=new Set(["SOLEMN","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE"]);
const norm=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
 .replace(/æ/gi,"ae").replace(/œ/gi,"oe").replace(/j/gi,"i")
 .toLowerCase().replace(/[^a-z0-9]+/g,"");
const exact=(p,text)=>[p?.primary,p?.secondary,p?.alternate].some(v=>
 typeof v==="string"&&norm(v)===norm(text));
const cueIds=p=>Array.isArray(p?.sourceCueIds)?p.sourceCueIds.map(String):[];

/** Opt-in reference music only. Context is a verified *actual Mass*, not a
 * calendar/date/feast guess. No two phrase transcripts may be put on
 * ambiguous or duplicate cue-bearing rows.
 */
export function prefaceCelebrantInlineScoresForParagraph({
 paragraph=null,paragraphs=[],form=null,resolvedMass=null
}={}){
 if(!sung.has(String(form??"").toUpperCase())||!paragraph||
    paragraph.kind==="RUBRIC"||!Array.isArray(paragraphs)||
    (paragraph.speakerRole&&paragraph.speakerRole!=="PRIEST")||
    isExplicitRequiemMass({session:{resolvedMass}}))return Object.freeze([]);
 const tone=resolve1962DialogueToneFamily("PREFACE_DIALOGUE",{resolvedMass});
 if(tone?.status!=="RUBRICAL_FAMILY_RESOLVED"||
    !["SOLEMN","FERIAL"].includes(tone.family))return Object.freeze([]);
 const result=[];
 for(const score of PREFACE_CELEBRANT_INLINE_SCORES){
  if(score.toneFamily!==tone.family||score.publicScoreApproved!==false)continue;
  const fragments=score.sourceCueIds.map(id=>{
   const matches=paragraphs.filter(p=>cueIds(p).includes(id)&&p.kind!=="RUBRIC");
   return matches.length===1?matches[0]:null;
  });
  if(fragments.some(p=>!p)||fragments[0]!==paragraph)continue;
  if(fragments.length===1){
   if(cueIds(paragraph).length!==1||!exact(paragraph,score.sourceLatin))continue;
  }else if(fragments.length===2){
   if(fragments[0]===fragments[1]){
    // Source-audited C0141+C0142 is one printed celebrant turn.
    if(cueIds(paragraph).join(",")!==score.sourceCueIds.join(",")||
       !exact(paragraph,score.sourceLatin))continue;
   }else{
    const at=paragraphs.indexOf(fragments[0]);
    if(at<0||paragraphs[at+1]!==fragments[1]||
       !fragments.every((p,i)=>cueIds(p).length===1&&
         exact(p,score.sourceCueLatin[i])))continue;
   }
  }else continue;
  result.push(score);
 }
 return Object.freeze(result);
}
