// Exact PRINTED-page ownership for eight 1961 Preface congregational
// responses. This locates the printed PHRASE, not certifies every neume.
// LU p.109 prints both tones on one page. GR p.130* begins the solemn
// dialogue with its Amen; all further solemn responses continue on p.131*.
// The four ferial responses are on p.131* in a separately labelled section.
//
// Source images independently checked 2026-11-06:
//   https://gregobase.selapa.net/sources/3/220.png
//   https://gregobase.selapa.net/sources/2/1007.png
//   https://gregobase.selapa.net/sources/2/1008.png
// Do not interpret the shared phrase text as evidence for a shared melody.
import {PARTICIPATION_REFERENCE_SCORES} from "./reader-participation-reference-scores.js";
import {printedPlatesForParticipationScore} from "./reader-participation-printed-plates.js";

export const PREFACE_PRINTED_PASSAGE_SCHEMA="ao-preface-eight-responses-two-1961-books-v1";
const BOTH=[
 "https://gregobase.selapa.net/sources/3/220.png",
 "https://gregobase.selapa.net/sources/2/1008.png"
];
const SOLEMN_AMEN=[
 BOTH[0],"https://gregobase.selapa.net/sources/2/1007.png"
];
const familySpecs=Object.freeze([
 {sourceId:4449,family:"SOLEMN",section:"1. Tonus solemnis",
  cueIds:["AO.SM.C0136","AO.SM.C0138","AO.SM.C0140","AO.SM.C0143"],
  originalPhraseIndices:[1,3,5,7]},
 {sourceId:4450,family:"FERIAL",section:"2. Tonus ferialis",
  cueIds:["AO.SM.C0136","AO.SM.C0138","AO.SM.C0140","AO.SM.C0143"],
  originalPhraseIndices:[1,3,5,7]}
]);
const names=["Amen","Et cum spíritu tuo","Habémus ad Dóminum","Dignum et iustum est"];
const located=[
 "first response following Per omnia saecula saeculorum",
 "response following Dominus vobiscum",
 "response following Sursum corda",
 "response following Gratias agamus"
];
export const PREFACE_1961_PRINTED_PASSAGES=Object.freeze(familySpecs.flatMap(spec=>
 spec.cueIds.map((cueId,i)=>{
  const score=PARTICIPATION_REFERENCE_SCORES.find(s=>
   s.sourceId===spec.sourceId&&s.sourceCueIds.length===1&&s.sourceCueIds[0]===cueId);
  if(!score||score.sourcePhraseIndex!==spec.originalPhraseIndices[i]||
    score.publicScoreApproved!==false)throw Error("PREFACE_SOURCE_PHRASE_OWNERSHIP_CHANGED");
  const source=printedPlatesForParticipationScore(spec.sourceId);
  const urls=spec.family==="SOLEMN"&&i===0?SOLEMN_AMEN:BOTH;
  if(!source||urls.some(u=>!source.plates.some(p=>p.url===u)))
   throw Error("PREFACE_PRINTED_WITNESS_MISSING_"+score.id);
  return Object.freeze({
   scoreId:score.id,sourceId:score.sourceId,cueId,
   Latin:score.sourceLatin,phrase:names[i],family:spec.family,
   sectionTitle:spec.section,position:located[i],
   originalGabcPhraseIndex:score.sourcePhraseIndex,
   printWitnesses:Object.freeze(urls.map(url=>{
    const plate=source.plates.find(p=>p.url===url);
    return Object.freeze({url,book:plate.book,page:plate.page});
   })),
   printedSourceSectionLocated:true,
   originalGabcPhraseAudit:"SOURCE_GABC_PHRASE_EXACT",
   printNeumeByNeumeComparison:"PENDING_INDEPENDENT_EDITORIAL_COLLATION",
   physicalRitualSelection:"NOT_INFERRED_FROM_PRINTED_TONE",
   reviewerDecision:"UNREVIEWED",publicScoreApproved:false
  });
 })
));
const byId=new Map(PREFACE_1961_PRINTED_PASSAGES.map(x=>[x.scoreId,x]));
if(byId.size!==8)throw Error("EIGHT_PREFACE_PRINTED_PHRASES_REQUIRED");
export function printedPassageForPrefaceScore(scoreId){
 return byId.get(String(scoreId??""))??null;
}
/** Rich editorial view only; never a score-selection/publication action. */
export function comparePrefaceToneFormulae(){
 const pairs=[];
 for(const cueId of familySpecs[0].cueIds){
  const solemn=PREFACE_1961_PRINTED_PASSAGES.find(x=>x.cueId===cueId&&x.family==="SOLEMN");
  const ferial=PREFACE_1961_PRINTED_PASSAGES.find(x=>x.cueId===cueId&&x.family==="FERIAL");
  const scoreA=PARTICIPATION_REFERENCE_SCORES.find(x=>x.id===solemn.scoreId);
  const scoreB=PARTICIPATION_REFERENCE_SCORES.find(x=>x.id===ferial.scoreId);
  const gabcBody=x=>x.gabc.slice(x.gabc.indexOf("%%")+2).replace(/\s+/g,"");
  pairs.push(Object.freeze({
   cueId,solemnScoreId:solemn.scoreId,ferialScoreId:ferial.scoreId,
   identicalGabc: gabcBody(scoreA)===gabcBody(scoreB),
   printedSourceToneSelectionDistinct:true,
   printNeumeVerification:"NOT_CERTIFIED"
  }));
 }
 return Object.freeze(pairs);
}
