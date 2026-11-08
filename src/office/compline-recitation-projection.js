/**
 * Print-conforming Compline reading projection for the 1961 Roman Breviary.
 * Witness: Breviarium Romanum (Mame 1961) Ordinarium §54–67, printed
 * pp. 132–141. The upstream 42-block source extraction is retained
 * unchanged for provenance, but its post-Nunc Kyrie and second Pater
 * belong to other Office structures and must not be recited at Compline.
 * Rubricae §147; Ordinary §56 choose whether to recite an opening
 * Pater noster or make an examen at the day's final prayer.
 *
 * PRIVATE REVIEW ONLY: this is not edition/rights certification and
 * never sets any public release flag.
 */
export const COMPLINE_CONTEXT=Object.freeze({
 FINAL_PRAYER:"FINAL_PRAYER",OTHER_TIME:"OTHER_TIME"
});
export const COMPLINE_EXAMEN_RUBRIC_SOURCE=
 "Breviarium Romanum (1961) Rubricae §147; Ordinarium §56";
export const COMPLINE_PRINTED_ORDINARY_SOURCE=
 "Breviarium Romanum (1961) Ordinarium §§54–67, pp. 132–141";
const OPENING_PATER="Psalterium/Common/Prayers#Pater noster";
const SECOND_PATER="Psalterium/Common/Prayers#Pater noster Et";
const POST_CANTICLE_KYRIE="Psalterium/Common/Prayers#Kyrie";
const FINAL_ASSISTANCE="Psalterium/Common/Prayers#Divinum auxilium + Fidelium animae:Amen";
const INITIAL_BLESSING="Psalterium/Common/Prayers#Benedictio Completorium_";
const CONCLUDING_BLESSING="Psalterium/Common/Prayers#Benedictio Completorium2";
const AMEN_SOURCE="Psalterium/Common/Prayers#Fidelium animae:R.Amen";
const NOTE=Object.freeze({
 la:Object.freeze(["Rubrica (non textus precationis): Pater noster hic omittitur. Examen conscientiae per rationabile tempus fit; deinde Confiteor."]),
 en:Object.freeze(["Rubric (not a prayer text): Omit the opening Our Father. Examine your conscience for a suitable time, then continue with the Confiteor."]),
 fr:Object.freeze(["Rubrique (non texte de prière) : omettre ici le Notre Père. Faire un examen de conscience pendant un temps convenable, puis poursuivre avec le Confiteor."])
});
function withheld(reason){return Object.freeze({
 status:"WITHHELD",reason,events:Object.freeze([]),frames:Object.freeze([]),
 readingEvents:Object.freeze([]),publishable:false,published:false,readingPublished:false
});}
export function projectComplineRecitation(review,{context="FINAL_PRAYER"}={}){
 if(!Object.values(COMPLINE_CONTEXT).includes(context))
  return withheld("COMPLINE_RECITATION_CONTEXT_UNREVIEWED");
 if(!review||review.status!=="PRIVATE_SOURCE_TEXT_REVIEW"||
   review.hour!=="COMPLINE"||review.published!==false||
   review.eventCount!==42||review.events?.length!==42||
   !Array.isArray(review.frames)||review.frames.length<42||
   !Array.isArray(review.availableLanguages)||!review.availableLanguages.includes("la"))
  return withheld("COMPLINE_SOURCE_SEQUENCE_UNAVAILABLE");
 const events=review.events,languageKeys=review.availableLanguages;
 // 1961 Ordinary §64–65: after the Nunc dimittis antiphon, continue
 // immediately with Domine exaudi / Dominus vobiscum and Oremus.
 const k=events.findIndex(x=>x.kind==="KYRIE"&&x.sourceId===POST_CANTICLE_KYRIE);
 const p=events.findIndex(x=>x.kind==="PATER_NOSTER"&&x.sourceId===SECOND_PATER);
 if(k<1||p!==k+1||events[k-1]?.kind!=="ANTIPHON"||
   !events[k-1].sourceId?.endsWith("#Ant 4")||
   events[p+1]?.kind!=="DIALOGUE"||
   events.filter(x=>x.sourceId===POST_CANTICLE_KYRIE).length!==1||
   events.filter(x=>x.sourceId===SECOND_PATER).length!==1)
  return withheld("COMPLINE_1961_ORDINARY_POST_CANTICLE_POSITION_MISMATCH");
 const idx=events.findIndex(x=>x.kind==="PATER_NOSTER"&&x.sourceId===OPENING_PATER);
 if(idx<1||events.filter(x=>x.kind==="PATER_NOSTER"&&x.sourceId===OPENING_PATER).length!==1||
   events[idx-1]?.sourceId!=="Psalterium/Common/Prayers#Adjutorium nostrum"||
   events[idx+1]?.sourceId!=="Psalterium/Common/Prayers#Confiteor_")
  return withheld("COMPLINE_1961_EXAMINATION_POSITION_NOT_VERIFIED");
 const final=events.at(-1);
 if(final?.kind!=="FINAL_ASSISTANCE"||final?.sourceId!==FINAL_ASSISTANCE||
   events.filter(x=>x.kind==="BLESSING"&&x.sourceId===INITIAL_BLESSING).length!==1||
   events.filter(x=>x.kind==="BLESSING"&&x.sourceId===CONCLUDING_BLESSING).length!==1||
   languageKeys.some(l=>!Array.isArray(final.texts?.[l])||
     final.texts[l].length!==2||!/^R\.\s/u.test(final.texts[l][1])))
  return withheld("COMPLINE_1961_BLESSINGS_OR_FINAL_AMEN_UNRESOLVED");
 const toOmit=new Set([k,p]);
 const readingEvents=Object.freeze(events.filter((_,i)=>!toOmit.has(i)));
 if(readingEvents.length!==40)return withheld("COMPLINE_1961_READING_COUNT_INVALID");
 const resultFrames=[];
 let replacementCount=0,amenCount=0;
 for(const f of review.frames){
  if(toOmit.has(f.eventIndex))continue;
  if(f.eventIndex===idx&&f.sourceId===OPENING_PATER&&context==="FINAL_PRAYER"){
   const texts=Object.freeze(Object.fromEntries(
    languageKeys.map(l=>[l,NOTE[l]])
   ));
   resultFrames.push(Object.freeze({
    kind:"EXAMINATION",sourceId:COMPLINE_EXAMEN_RUBRIC_SOURCE,
    eventIndex:idx,subIndex:0,subTotal:1,focusType:"EDITORIAL_RUBRIC",
    label:null,texts,originalSourceOnly:false,editorialRubric:true
   }));
   replacementCount++;continue;
  }
  if(f.sourceId===INITIAL_BLESSING||f.sourceId===CONCLUDING_BLESSING){
   if(f.subTotal!==1||languageKeys.some(l=>f.texts?.[l]?.length!==1))
    return withheld("COMPLINE_1961_BLESSING_FRAME_INVALID");
   const texts=Object.freeze(Object.fromEntries(languageKeys.map(l=>[
    l,Object.freeze([...f.texts[l],final.texts[l][1]])
   ])));
   resultFrames.push(Object.freeze({...f,texts,sourceAmen:AMEN_SOURCE,
    printConformed:true}));
   amenCount++;continue;
  }
  resultFrames.push(f);
 }
 if(amenCount!==2||replacementCount!==(context==="FINAL_PRAYER"?1:0)||
   resultFrames.some(f=>f.sourceId===SECOND_PATER||f.sourceId===POST_CANTICLE_KYRIE))
  return withheld("COMPLINE_1961_FRAME_PROJECTION_MISMATCH");
 const frames=Object.freeze(resultFrames);
 return Object.freeze({
  ...review,events,readingEvents,readingEventCount:readingEvents.length,
  sourceEventCount:42,sourceFrameCount:review.frames.length,
  frames,frameCount:frames.length,recitationContext:context,
  printedOrdinaryWitness:COMPLINE_PRINTED_ORDINARY_SOURCE,
  postCanticleKyrieOmitted:true,postCanticlePaterOmitted:true,
  blessingAmensRestoredFromPinnedSource:2,
  editorialRubricFrames:replacementCount,
  openingPaterOmitted:context==="FINAL_PRAYER",
  liturgicallyCertified:false,rightsApproved:false,
  publishable:false,published:false,readingPublished:false
 });
}
