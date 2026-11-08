/**
 * Compline recitation context after the 1961 Roman Breviary rubrics:
 * Rubricae Breviarii et Missalis Romani §147; Ordinarium §56.
 * Preserve all 42 original source blocks. Apply a distinct display-only
 * editorial-rubric replacement to the first Pater noster ONLY when
 * Compline is the final prayer at the end of the day.
 */
export const COMPLINE_CONTEXT=Object.freeze({
 FINAL_PRAYER:"FINAL_PRAYER",OTHER_TIME:"OTHER_TIME"
});
export const COMPLINE_EXAMEN_RUBRIC_SOURCE=
 "Breviarium Romanum (1961) Rubricae §147; Ordinarium §56";
const OPENING_PATER="Psalterium/Common/Prayers#Pater noster";
const NOTE=Object.freeze({
 la:Object.freeze(["Rubrica (non textus precationis): Pater noster hic omittitur. Examen conscientiae per rationabile tempus fit; deinde Confiteor."]),
 en:Object.freeze(["Rubric (not a prayer text): Omit the opening Our Father. Examine your conscience for a suitable time, then continue with the Confiteor."]),
 fr:Object.freeze(["Rubrique (non texte de prière) : omettre ici le Notre Père. Faire un examen de conscience pendant un temps convenable, puis poursuivre avec le Confiteor."])
});
function withheld(reason){return Object.freeze({
 status:"WITHHELD",reason,events:Object.freeze([]),frames:Object.freeze([]),
 publishable:false,published:false,readingPublished:false
});}
export function projectComplineRecitation(review,{context="FINAL_PRAYER"}={}){
 if(!Object.values(COMPLINE_CONTEXT).includes(context))
  return withheld("COMPLINE_RECITATION_CONTEXT_UNREVIEWED");
 if(!review||review.status!=="PRIVATE_SOURCE_TEXT_REVIEW"||
   review.hour!=="COMPLINE"||review.published!==false||
   review.eventCount!==42||review.events?.length!==42||
   !Array.isArray(review.frames)||review.frames.length<42)
  return withheld("COMPLINE_SOURCE_SEQUENCE_UNAVAILABLE");
 const idx=review.events.findIndex(x=>x.kind==="PATER_NOSTER"&&x.sourceId===OPENING_PATER);
 if(idx<1||review.events.filter(x=>x.kind==="PATER_NOSTER"&&x.sourceId===OPENING_PATER).length!==1||
    review.events[idx-1]?.sourceId!=="Psalterium/Common/Prayers#Adjutorium nostrum"||
    review.events[idx+1]?.sourceId!=="Psalterium/Common/Prayers#Confiteor_")
  return withheld("COMPLINE_1961_EXAMINATION_POSITION_NOT_VERIFIED");
 const matching=review.frames.filter(x=>x.eventIndex===idx&&x.sourceId===OPENING_PATER);
 if(matching.length!==1)return withheld("COMPLINE_OPENING_PATER_FRAME_NOT_UNIQUE");
 const latin=review.availableLanguages?.includes("la");
 if(!latin)return withheld("COMPLINE_LATIN_RUBRIC_LANGUAGE_MISSING");
 if(context==="OTHER_TIME")
  return Object.freeze({...review,recitationContext:context,editorialRubricFrames:0,
   openingPaterOmitted:false});
 const texts=Object.freeze(Object.fromEntries(
  review.availableLanguages.map(l=>[l,NOTE[l]])
 ));
 const examen=Object.freeze({
  kind:"EXAMINATION",sourceId:COMPLINE_EXAMEN_RUBRIC_SOURCE,
  eventIndex:idx,subIndex:0,subTotal:1,focusType:"EDITORIAL_RUBRIC",
  label:null,texts,originalSourceOnly:false,editorialRubric:true
 });
 const frames=Object.freeze(review.frames.map(f=>f===matching[0]?examen:f));
 return Object.freeze({...review,frames,frameCount:frames.length,
  recitationContext:context,editorialRubricFrames:1,openingPaterOmitted:true});
}
