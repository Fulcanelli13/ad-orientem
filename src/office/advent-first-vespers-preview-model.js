/**
 * Advent I 2026 First Vespers — bounded, non-public RESEARCH preview model.
 *
 * This module has no fetching, DOM, route registration, storage, import of
 * the Mass reader or public publication. The caller must supply the EXISTING
 * ten-slot source assembly, a 1960 rubric plan, and the independently
 * reviewed universal commemoration / multilingual Ordinary source witness.
 *
 * Each visible text block is copied from its original named section;
 * unsupplied text is never reconstructed or silently translated. All
 * returned states remain unverified, not licensed, not publishable.
 */
import {DIVINUM_OFFICIUM_PIN as PIN} from "../app/source-transport-compat.js";
import {OFFICE_ADVENT_ASSEMBLY_SCHEMA}
 from "./advent-first-vespers-assembled-research.js";
import {OFFICE_ADVENT_RUBRIC_PLAN_SCHEMA}
 from "./advent-first-vespers-rubric-plan.js";
import {ADVENT_COLLECT_ENDING_SCHEMA}
 from "./advent-i-collect-ending-1960-research.js";

export const ADVENT_FIRST_VESPERS_PREVIEW_SCHEMA=
 "ao.office.advent-i-2026-first-vespers-private-preview.v1";
const LANGUAGES=Object.freeze(["la","en","fr"]);
const KEYS=Object.freeze([
 "opening","five-psalmody","chapter","hymn","versicle",
 "magnificat-antiphon","magnificat-canticle","collect",
 "commemorations","conclusion"
]);
const NUMBERS=Object.freeze([[143,"1-8"],[143,"9-15"],
 [144,"1-7"],[144,"8-13a"],[144,"13b-21"]]);
const PRAYERS="Psalterium/Common/Prayers#";
const PROPER="Tempora/Adv1-0#";
function withheld(reason){
 return Object.freeze({schema:ADVENT_FIRST_VESPERS_PREVIEW_SCHEMA,
  status:"WITHHELD",reason,blocks:Object.freeze([]),
  researchOnly:true,completeHourCertified:false,
  printedEditionCertified:false,translationApproved:false,
  rightsApproved:false,publishable:false,published:false});
}
function safeText(v){
 return typeof v==="string"&&v.trim().length>0&&v.length<19000&&
 !/[\u0000]/u.test(v);
}
function chunks(lines,{withVerse=false}={}){
 if(typeof lines==="string")return safeText(lines)?[lines]:null;
 if(!Array.isArray(lines)||!lines.length||lines.length>120)return null;
 const out=[];
 for(const item of lines){
  if(typeof item==="string"&&safeText(item)){out.push(item);continue}
  if(withVerse&&typeof item==="object"&&safeText(item?.text)&&
     typeof item.verse==="string"&&/^Luke 1:(4[6-9]|5[0-5])$/u.test(item.verse)){
   out.push(item.verse+" "+item.text);continue;
  }
  return null;
 }
 return out;
}
export function projectAdventI2026ResearchPreview({
 assembly,rubricPlan,collectEndingReview
}={}){
 if(assembly?.schema!==OFFICE_ADVENT_ASSEMBLY_SCHEMA||
  assembly.status!=="ORDERED_TRILINGUAL_SOURCE_RESEARCH_NOT_A_COMPLETE_OFFICE"||
  assembly.sourceRevision!==PIN||assembly.civilDate!=="2026-11-28"||
  assembly.officeDate!=="2026-11-29"||assembly.officePart!=="FIRST"||
  assembly.sourceComponentSlots!==10||assembly.sourceTextComponentSlots!==9||
  assembly.liturgicallyCompleteSlots!==0||
  assembly.completeHourVerified!==false||
  assembly.printedEditionCertified!==false||
  assembly.translationAlignmentVerified!==false||
  assembly.rightsApproved!==false||
  assembly.publishable!==false||assembly.published!==false||
  !Array.isArray(assembly.slots)||assembly.slots.length!==10||
  assembly.slots.some((x,i)=>x.key!==KEYS[i]||
    x.liturgicallyComplete!==false||x.visibleInLiveReader!==false))
  return withheld("PREVIEW_APPROVED_OR_SOURCE_ASSEMBLY_CHANGED");
 if(rubricPlan?.schema!==OFFICE_ADVENT_RUBRIC_PLAN_SCHEMA||
  rubricPlan.status!=="RUBRIC_ORDER_RESEARCH_WITH_HELD_COLLATION"||
  rubricPlan.sourceRevision!==PIN||
  rubricPlan.civilDate!==assembly.civilDate||
  rubricPlan.officeDate!==assembly.officeDate||
  rubricPlan.officePart!=="FIRST"||
  rubricPlan.calendarScope!=="UNIVERSAL"||
  rubricPlan.sourceAudit?.universalCommemorationDecision!=="NO_UNIVERSAL_COMMEMORATION"||
  rubricPlan.sourceAudit?.collectEndingSourceDecision!=="TRILINGUAL_SOURCE_IDENTIFIED"||
  rubricPlan.sourceAudit?.fullAntiphonUsages!==12||
  rubricPlan.sourceAudit?.totalDoxologyPositionsIncludingOpening!==7||
  rubricPlan.rubricsFullyCertified!==false||
  rubricPlan.completeHourVerified!==false||
  rubricPlan.printedEditionCertified!==false||
  rubricPlan.translationAlignmentVerified!==false||
  rubricPlan.rightsApproved!==false||
  rubricPlan.publishable!==false||rubricPlan.published!==false||
  !Array.isArray(rubricPlan.orderedEvents)||
  rubricPlan.orderedEvents.length<30||rubricPlan.orderedEvents.length>55)
  return withheld("PREVIEW_REVIEWED_1960_RUBRIC_PLAN_REQUIRED");
 if(collectEndingReview?.schema!==ADVENT_COLLECT_ENDING_SCHEMA||
  collectEndingReview.status!=="THREE_LANGUAGE_SOURCE_COLLECT_AND_DISMISSAL_VARIANTS_NOT_PRINT_CERTIFIED"||
  collectEndingReview.sourceRevision!==PIN||
  collectEndingReview.officeDate!==assembly.officeDate||
  collectEndingReview.civilDate!==assembly.civilDate||
  collectEndingReview.officePart!=="FIRST"||
  collectEndingReview.calendarScope!=="UNIVERSAL"||
  collectEndingReview.recitation!==rubricPlan.recitation||
  collectEndingReview.minister!==rubricPlan.minister||
  collectEndingReview.dialogueVariant!==rubricPlan.dialogue||
  collectEndingReview.languageComponentsLocated!==3||
  collectEndingReview.collectEndingSourceMacroResolved!==true||
  collectEndingReview.exactPrintedCollectEndingCollated!==false||
  collectEndingReview.translationFidelityCertified!==false||
  collectEndingReview.completeHourCertified!==false||
  collectEndingReview.rightsApproved!==false||
  collectEndingReview.publishable!==false||
  collectEndingReview.published!==false)
  return withheld("PREVIEW_ORDINARY_ROLE_OR_SOURCE_VARIANT_CHANGED");

 const slot=Object.fromEntries(assembly.slots.map(s=>[s.key,s]));
 const blocks=[];
 const add=(event,sourceId,get,extra={})=>{
  const texts={};
  for(const language of LANGUAGES){
   const lines=get(language);
   const result=chunks(lines,extra.withVerse?{withVerse:true}:{});
   if(!result)return false;
   texts[language]=Object.freeze([...result]);
  }
  blocks.push(Object.freeze({
   kind:event.kind,sourceId,slot:event.slot??null,
   position:event.position??null,
   sourceRow:event.sourceRow??null,
   texts:Object.freeze(texts),
   originalSourceOnly:true,translationCertified:false,
   printedEditionCertified:false,rightsApproved:false
  }));
  return true;
 };
 const psalms=slot["five-psalmody"];
 const canticle=slot["magnificat-canticle"];
 let psalmParts=0,antiphonUses=0,doxologies=0;
 for(const event of rubricPlan.orderedEvents){
  const ps=i=>{
   const x=psalms.texts?.[i]?.[event.position-1];
   if(!x||typeof x.antiphon!=="string"||
     typeof x.verses!=="string")return null;
   return x;
  };
  let ok=false;
  switch(event.kind){
   case "OPENING": {
    if(event.sourceId!==PRAYERS+"Deus in adjutorium")break;
    ok=add(event,event.sourceId,l=>{
     const x=slot.opening.texts?.[l]?.[2];
     return x?.sourceId===event.sourceId?x.sourceText:null;
    });break;
   }
   case "SEASONAL_OPENING_RESPONSE":{
    if(event.sourceId!==PRAYERS+"Alleluia")break;
    ok=add(event,event.sourceId,l=>{
     const x=slot.opening.texts?.[l]?.[3];
     return x?.sourceId===event.sourceId?[x.sourceText?.[0]]:null;
    });break;
   }
   case "ANTIPHON_BEFORE":
   case "ANTIPHON_AFTER":{
    const index=event.position;
    if(event.slot==="five-psalmody"){
     if(!(index>=1&&index<=5)||event.sourceRow!==index||
        event.sourceId!==PROPER+"Ant Laudes")break;
     ok=add(event,event.sourceId+"#"+index,l=>[ps(l)?.antiphon]);
    }else if(event.slot==="magnificat-antiphon"&&
     event.sourceId===PROPER+"Ant 1"){
     ok=add(event,event.sourceId,l=>[slot["magnificat-antiphon"].texts?.[l]]);
    }
    if(ok)antiphonUses++;
    break;
   }
   case "PSALM_PORTION":{
    const expected=NUMBERS[event.position-1];
    if(!expected||event.sourceId!==
       "Psalterium/Psalmorum/Psalm"+expected[0]+"#"+expected[1])break;
    ok=add(event,event.sourceId,l=>[ps(l)?.verses]);
    if(ok)psalmParts++;
    break;
   }
   case "GLORIA_PATRI":{
    if(event.sourceId!==PRAYERS+"Gloria")break;
    ok=add(event,event.sourceId,l=>canticle.texts?.[l]?.gloria);
    if(ok)doxologies++;
    break;
   }
   case "CHAPTER":{
    if(event.sourceId!==PROPER+"Capitulum Laudes")break;
    ok=add(event,event.sourceId,l=>[slot.chapter.texts?.[l]?.text]);break;
   }
   case "CHAPTER_RESPONSE":{
    if(event.sourceId!==PRAYERS+"Deo gratias")break;
    ok=add(event,event.sourceId,l=>[slot.chapter.texts?.[l]?.response]);break;
   }
   case "HYMN":{
    if(event.sourceId!=="Psalterium/Special/Major Special#Hymnus Adv Vespera")break;
    ok=add(event,event.sourceId,l=>{
     const hymn=slot.hymn.texts?.[l];
     if(!Array.isArray(hymn)||hymn.length<20)return null;
     return hymn.map(x=>x.kind==="STANZA_SEPARATOR"?"\n":
       x.kind==="HYMN_LINE"?x.text:null);
    });break;
   }
   case "VERSICLE":{
    if(event.sourceId!=="Psalterium/Special/Major Special#Adv Versum 3")break;
    ok=add(event,event.sourceId,l=>slot.versicle.texts?.[l]);break;
   }
   case "MAGNIFICAT":{
    if(event.sourceId!=="Psalterium/Psalmorum/Psalm232#LUKE_1_46_55")break;
    ok=add(event,event.sourceId,l=>canticle.texts?.[l]?.verses,{withVerse:true});break;
   }
   case "BEFORE_COLLECT_DIALOGUE":{
    if(event.sourceId!==PRAYERS+"Dominus"||
       event.variant!==collectEndingReview.dialogueVariant)break;
    ok=add(event,event.sourceId,l=>collectEndingReview.languages?.[l]?.beforeCollect);break;
   }
   case "OREMUS":{
    if(event.sourceId!==PRAYERS+"Oremus")break;
    ok=add(event,event.sourceId,l=>[collectEndingReview.languages?.[l]?.oremus]);break;
   }
   case "COLLECT":{
    if(event.sourceId!==PROPER+"Oratio")break;
    ok=add(event,event.sourceId,l=>[collectEndingReview.languages?.[l]?.collectBody]);break;
   }
   case "COLLECT_ENDING":{
    if(event.sourceId!==PRAYERS+"Qui vivis"||
       event.macroResolved!==true)break;
    ok=add(event,event.sourceId,l=>collectEndingReview.languages?.[l]?.collectConclusion);break;
   }
   case "NO_UNIVERSAL_COMMEMORATION":{
    if(event.slot!=="commemorations"||
       event.universalScopeOnly!==true||
       event.localCalendarAdjudicated!==false)break;
    blocks.push(Object.freeze({
     kind:"RESEARCH_CALENDAR_NOTICE",slot:"commemorations",
     sourceId:null,position:null,sourceRow:null,
     texts:null,originalSourceOnly:false,
     message:"No universal commemoration. Local calendars remain unreviewed.",
     translationCertified:false,printedEditionCertified:false,
     rightsApproved:false
    }));ok=true;break;
   }
   case "SECOND_DOMINE_EXAUDI_OMITTED":{
    if(event.slot!=="conclusion"||
       collectEndingReview.dialogueVariant!=="DOMINE_EXAUDI")break;
    // A rubric OMITTING a dialogue has no visible prayer block.
    ok=true;break;
   }
   case "DISMISSAL_DIALOGUE_SOURCE_CANDIDATE":{
    if(event.sourceId!==PRAYERS+"Dominus"||
       collectEndingReview.dialogueVariant!=="DOMINUS_VOBISCUM")break;
    ok=add(event,event.sourceId,l=>collectEndingReview.languages?.[l]?.beforeBenedicamus);break;
   }
   case "BENEDICAMUS":{
    if(event.sourceId!==PRAYERS+"Benedicamus Domino")break;
    ok=add(event,event.sourceId,l=>collectEndingReview.languages?.[l]?.benedicamus);break;
   }
   case "FIDELIUM_ANIMAE":{
    if(event.sourceId!==PRAYERS+"Fidelium animae")break;
    ok=add(event,event.sourceId,l=>collectEndingReview.languages?.[l]?.fideliumAnimae);break;
   }
   default:break;
  }
  if(!ok)return withheld("PREVIEW_UNMATCHED_OR_MISSING_SOURCE_EVENT:"+event.kind);
 }
 const requiredKinds=[
  "OPENING","SEASONAL_OPENING_RESPONSE","CHAPTER",
  "CHAPTER_RESPONSE","HYMN","VERSICLE","MAGNIFICAT",
  "OREMUS","COLLECT","COLLECT_ENDING","BENEDICAMUS","FIDELIUM_ANIMAE"
 ];
 if(psalmParts!==5||antiphonUses!==12||doxologies!==6||
  !requiredKinds.every(k=>blocks.some(x=>x.kind===k))||
  blocks.filter(x=>x.kind==="RESEARCH_CALENDAR_NOTICE").length!==1)
  return withheld("PREVIEW_SOURCE_SEQUENCE_COUNTS_CHANGED");
 return Object.freeze({
  schema:ADVENT_FIRST_VESPERS_PREVIEW_SCHEMA,
  status:"PRIVATE_RESEARCH_PREVIEW_SOURCE_SEQUENCE_ONLY",
  civilDate:"2026-11-28",officeDate:"2026-11-29",
  hour:"VESPERS",officePart:"FIRST",
  sourceRevision:PIN,calendarScope:"UNIVERSAL_ONLY",
  recitation:rubricPlan.recitation,minister:rubricPlan.minister,
  availableLanguages:Object.freeze([...LANGUAGES]),
  blocks:Object.freeze(blocks),blockCount:blocks.length,
  psalmPortions:psalmParts,antiphonUses,
  doxologyPositionsIncludingOpening:doxologies+1,
  sourceCollectEndingOnce:blocks.filter(x=>x.kind==="COLLECT_ENDING").length===1,
  localCalendarReviewed:false,
  translationReviewRequired:collectEndingReview.translationReviewRequired,
  researchOnly:true,
  completeHourCertified:false,printedEditionCertified:false,
  translationApproved:false,rightsApproved:false,
  publishable:false,published:false
 });
}
