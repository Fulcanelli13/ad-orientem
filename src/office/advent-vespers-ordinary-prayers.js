/**
 * First Vespers Ordinary opening and conclusion SOURCE candidates.
 * The actual 1960 recitation branch, priest/lay dialog, local concurrence,
 * and dismissal setting are NOT selected here.
 */
import {DIVINUM_OFFICIUM_PIN} from "../app/source-transport-compat.js";
import {ADVENT_VESPERS_REMAINDER_SCHEMA} from "./advent-vespers-remainder-research.js";
export const OFFICE_VESPERS_ORIGINAL_PRAYERS_SCHEMA="ao.office.vespers-ordinary-prayers.v1";
const PIN=DIVINUM_OFFICIUM_PIN;
const PRAYERS="Psalterium/Common/Prayers",langs=["la","en","fr"];
const OPENING=["Pater noster","Ave Maria","Deus in adjutorium","Alleluia"];
const ENDING=["Dominus","Benedicamus Domino","Fidelium animae"];
const fail=reason=>Object.freeze({
 schema:OFFICE_VESPERS_ORIGINAL_PRAYERS_SCHEMA,status:"WITHHELD",reason,
 selected1960Ordinary:false,appointedOfficeVerified:false,
 completeHourVerified:false,printedEditionCertified:false,
 translationAlignmentVerified:false,rightsApproved:false,
 publishable:false,published:false
});
function ordinaryVerified(x){
 return x?.schema===ADVENT_VESPERS_REMAINDER_SCHEMA&&
 x.status==="ORDINARY_ORDER_SOURCE_OBSERVED_CONDITIONAL_UNRESOLVED"&&
 x.sourceRevision===PIN&&
 x.sourcePath==="Ordinarium/Vespera"&&
 x.conditionalRubricsResolved===false&&
 x.firstVespersOrdinaryAuthorized===false&&
 x.completeHourVerified===false&&x.publishable===false&&x.published===false;
}
function extract(map,key){
 if(!(map instanceof Map))return null;
 const raw=map.get(key);
 const count=key==="Pater noster"||key==="Ave Maria"?1:
  key==="Deus in adjutorium"?4:key==="Alleluia"?2:
  key==="Dominus"?5:2;
 if(!Array.isArray(raw)||raw.length!==count)return null;
 const lines=raw.map(x=>typeof x==="string"?x.trim():"");
 if(lines.some(x=>!x||x.length>900||/[$@&{}<>]/u.test(x)))
  return null;
 if(key==="Dominus"){
  if(!/^V\. /u.test(lines[0])||!/^R\. /u.test(lines[1])||
     !/^V\. /u.test(lines[2])||!/^R\. /u.test(lines[3])||
     !lines[4].startsWith("/:"))return null;
 }else if(key==="Deus in adjutorium"){
  if(!/^V\. /u.test(lines[0])||!/^R\. /u.test(lines[1]))
   return null;
 }else if(key==="Pater noster"||key==="Ave Maria"){
  if(!/^v\. /u.test(lines[0]))return null;
 }else if(key==="Alleluia"){
  if(!lines.every(x=>/^v\. /u.test(x)))return null;
 }else if(!/^V\. /u.test(lines[0])||!/^R\. /u.test(lines[1]))
  return null;
 return Object.freeze(lines);
}
export async function reviewAdventVespersOrdinaryPrayerSources({
 ordinaryWitness,readSource
}={}){
 if(!ordinaryVerified(ordinaryWitness))
  return fail("OFFICE_VESPERS_ORDINARY_WITNESS_REQUIRED");
 if(typeof readSource!=="function")
  return fail("OFFICE_VESPERS_PRAYER_SOURCE_READER_REQUIRED");
 const witnesses={};
 for(const language of langs){
  const doc=await readSource(PRAYERS,language);
  if(doc?.sourceRevision!==PIN||doc.sourcePath!==PRAYERS||
     doc.language!==language||!(doc.map instanceof Map))
   return fail("OFFICE_VESPERS_PRAYER_PINNED_SOURCE_INVALID:"+language);
  const names=[...OPENING,...ENDING],parts={};
  for(const key of names){
   const lines=extract(doc.map,key);
   if(!lines)return fail("OFFICE_VESPERS_PRAYER_SECTION_MISSING:"+language+":"+key);
   parts[key]=Object.freeze({sourceId:PRAYERS+"#"+key,
    sourceText:Object.freeze([...lines]),
    liturgicalChoiceAuthorized:false});
  }
  witnesses[language]=Object.freeze({
   opening:Object.freeze(OPENING.map(key=>parts[key])),
   ending:Object.freeze(ENDING.map(key=>parts[key])),
   priestAndNonPriestDialogueBothRetained:true,
   alleluiaAndPassiontideAlternativesRetained:true,
   firstVespersOpeningRubricsVerified:false,
   finalPrayersAndDismissalRubricsVerified:false
  });
 }
 return Object.freeze({
  schema:OFFICE_VESPERS_ORIGINAL_PRAYERS_SCHEMA,
  status:"OPENING_AND_CONCLUSION_SOURCE_CANDIDATES_UNVERIFIED",
  sourceRevision:PIN,civilDate:"2026-11-28",officeDate:"2026-11-29",
  officePart:"FIRST",hour:"VESPERS",
  sourcePath:PRAYERS,
  languages:Object.freeze(witnesses),sourcePrayerSectionCountPerLocale:7,
  selected1960Ordinary:false,appointedOfficeVerified:false,
  priestOrLayVariantVerified:false,localCalendarChecked:false,
  completeHourVerified:false,printedEditionCertified:false,
  translationAlignmentVerified:false,rightsApproved:false,
  publishable:false,published:false
 });
}
