// Research-only, fail-closed adapter from an authenticated 1962 Proper into the
// existing Ad Orientem Missal's section/paragraph vocabulary.
// Not imported into production Calendar or reader. No router is implemented here.
import {properToReaderSlots,READER_PROPER_SLOTS} from "../mass/proper-reader-slots.js";

const ORATION_SLOTS=new Set(["COLLECT_SET","SECRET_SET","POSTCOMMUNION_SET"]);
const FIELDS=Object.freeze({
 COLLECT_SET:["collects","collect"],
 SECRET_SET:["secrets","secret"],
 POSTCOMMUNION_SET:["postcommunions","postcommunion"],
});
const canonical=x=>String(x??"").trim().replace(/^\/+|\/+$/g,"").toLowerCase();
const text=x=>typeof x==="string"&&Boolean(x.trim());
const date=x=>/^\d{4}-\d{2}-\d{2}$/.test(x||"")&&!Number.isNaN(Date.parse(x+"T12:00:00Z"));
const held=(reason,details={})=>Object.freeze({
 schema:"ao-p1-missal-link-resolution-v1",status:"HELD",reason,
 route:null,externalUrl:null,readOnly:true,...details,
});
const rows=(value,plural,single)=>Array.isArray(value?.[plural])&&value[plural].length
 ?value[plural]:(value?.[single]?[value[single]]:[]);
function sourcePathFrom(value){
 return String(value?.prayerSourcePath??value?.path??"").trim();
}
function sourceMatches(requested,actuallyUsed,observance){
 if(!canonical(requested)||canonical(requested)!==canonical(observance))return false;
 // An explicitly inherited source may differ from the observed day.
 return canonical(actuallyUsed)===canonical(observance) ||
   /^tempora\/adv[1-4]-[1-6]$/i.test(observance)&&
   canonical(actuallyUsed)===canonical(observance).replace(/-[1-6]$/,"-0");
}
export function inspectP1InternalMissalLink({anchor,calendarResolution,proper,language="en"}={}){
 if(!anchor||typeof anchor!=="object"||!text(anchor.anchorId))
   return held("MISSING_REGISTERED_ANCHOR");
 if(anchor.requestedSurface!=="MISSAL_READ_ONLY")
   return held("NOT_A_READ_ONLY_MISSAL_REQUEST",{anchorId:anchor.anchorId});
 if(!ORATION_SLOTS.has(anchor.slot)||!READER_PROPER_SLOTS.includes(anchor.slot))
   return held("NON_CANONICAL_ORATION_SLOT",{anchorId:anchor.anchorId});
 const currentDate=calendarResolution?.date;
 if(calendarResolution?.status!=="ready"||!date(currentDate)||
    anchor.monthDay&&currentDate.slice(5)!==anchor.monthDay)
   return held("SOURCE_DATE_NOT_VERIFIED",{anchorId:anchor.anchorId});
 const main=calendarResolution?.day?.main;
 if(!text(main?.id)||!text(main?.path))
   return held("MISSING_CANONICAL_CALENDAR_PRINCIPAL",{anchorId:anchor.anchorId});
 const envelope=proper?.data&&typeof proper.data==="object"?proper:null;
 if(envelope&&!["READY","CACHED"].includes(String(envelope.status??"").toUpperCase()))
   return held("PROPER_NOT_READY",{anchorId:anchor.anchorId});
 const data=envelope?envelope.data:proper;
 const path=String(data?.sourcePath??envelope?.sourcePath??"").trim();
 if(!text(path)||canonical(path)!==canonical(main.path))
   return held("PROPER_OWNER_PATH_MISMATCH",{anchorId:anchor.anchorId});
 let index=0,ownerId=main.id,ownerPath=main.path;
 if(anchor.sourceKind==="PRINCIPAL_1962"){
   if(anchor.sourceIdentityId!==main.id || anchor.orationOwnerId!==main.id)
     return held("PRINCIPAL_ID_MISMATCH",{anchorId:anchor.anchorId});
 }else if(anchor.sourceKind==="HISTORICAL_COMMEMORATION"){
   // The P1 oration-trio ID is an editorial research key, not an actual
   // calendar commemoration ID. Require a distinct *real* 1962 ID.
   if(!text(anchor.calendarCommemorationId))
     return held("CANONICAL_COMMEMORATION_ID_MISSING",{anchorId:anchor.anchorId});
   const comms=Array.isArray(calendarResolution.day.commemorations)?
     calendarResolution.day.commemorations:[];
   index=comms.findIndex(c=>c?.id===anchor.calendarCommemorationId);
   if(index<0)return held("CALENDAR_COMMEMORATION_ID_MISMATCH",{anchorId:anchor.anchorId});
   ownerId=comms[index].id;ownerPath=comms[index].path;
   if(!text(ownerPath)||comms.filter(c=>c.id===ownerId).length!==1)
     return held("AMBIGUOUS_CALENDAR_COMMEMORATION",{anchorId:anchor.anchorId});
   const sources=Array.isArray(data.calendarCommemorations)?data.calendarCommemorations.filter(x=>!x?.inseparable):[];
   if(sources.length!==comms.length||sources[index]?.id&&sources[index].id!==ownerId||
      !sourceMatches(sources[index]?.path,sourcePathFrom(sources[index]),ownerPath))
     return held("SOURCE_COMMEMORATION_OWNER_MISMATCH",{anchorId:anchor.anchorId});
   // A REFERENCE in the Missal is not a statement that this oration was
   // recited in a particular Low/Sung Mass. Raw 1962 Proper source already
   // contains the historical commemoration and its three prayer rows.
   // Mass-form projection independently decides whether to recite them.
   // This bridge NEVER drives the actual Mass; reject requests to do so.
   index+=1;
 }else return held("UNSUPPORTED_ANCHOR_OWNER",{anchorId:anchor.anchorId});
 const [plural,singular]=FIELDS[anchor.slot];
 const raw=rows(data,plural,singular);
 if(raw.length<=index)return held("SOURCE_ORATION_ROW_MISSING",{anchorId:anchor.anchorId});
 const rawPrayer=raw[index];
 if(!text(rawPrayer?.lat??rawPrayer?.la))
   return held("SOURCE_LATIN_ORATION_MISSING",{anchorId:anchor.anchorId});
 if(text(rawPrayer.sourcePath) && canonical(rawPrayer.sourcePath)!==canonical(ownerPath) &&
     canonical(rawPrayer.sourcePath)!==canonical(sourcePathFrom(
       (data.calendarCommemorations??[])[index-1])))
   return held("ORATION_ROW_SOURCE_CONTRADICTION",{anchorId:anchor.anchorId});
 let projected;
 try{projected=properToReaderSlots(data,{language});}
 catch{return held("READER_PROPER_PROJECTION_REJECTED",{anchorId:anchor.anchorId});}
 if(!projected.ready)return held("FULL_READER_PROPER_INCOMPLETE",{
   anchorId:anchor.anchorId,missingSlots:[...projected.missing]});
 const slot=projected.slots[anchor.slot];
 if(slot?.status!=="READY")return held("REQUESTED_ORATION_SLOT_NOT_READY",{anchorId:anchor.anchorId});
 const candidates=(slot.data?.paragraphs??[]).filter(p=>
   p?.orationGroupIndex===index+1 &&
   p.kind==="TEXT" &&
   (index===0 ?
      ["PRINCIPAL_ORATION","PRINCIPAL_ORATION"].includes(p.prayerRole) ||
        p.id?.endsWith(".PRINCIPAL"):
      p.prayerRole==="ADDITIONAL_ORATION"||
        p.prayerRole==="FIRST_COMMEMORATION"||
        p.prayerRole==="SECOND_COMMEMORATION"
   )
 );
 if(candidates.length!==1)
   return held("PARAGRAPH_ID_NOT_UNIQUE",{anchorId:anchor.anchorId,candidateCount:candidates.length});
 const paragraph=candidates[0];
 // The source may omit the paragraph path, but the principal's original
 // 1962 day and the explicit row order establish ownership. For added
 // commemorations require an exact paragraph owner where one is provided.
 if(text(paragraph.sourcePath)&&index>0 &&
   canonical(paragraph.sourcePath)!==canonical(ownerPath)&&
   canonical(paragraph.sourcePath)!==canonical(sourcePathFrom(
     (data.calendarCommemorations??[])[index-1])))
   return held("PARAGRAPH_OWNER_MISMATCH",{anchorId:anchor.anchorId});
 return Object.freeze({
   schema:"ao-p1-missal-link-resolution-v1",
   status:"SOURCE_READY_ROUTER_NOT_IMPLEMENTED",
   anchorId:anchor.anchorId,
   calendarDate:currentDate,
   sourceIdentityId:ownerId,
   sourcePath:path,
   prayerOwnerPath:ownerPath,
   prayerIndex:index,
   readerMode:"MISSAL",
   readerSlot:anchor.slot,
   readerParagraphId:paragraph.id,
   route:null,externalUrl:null,readOnly:true,
   affectsLiveSession:false,
   maySelectCelebrantMass:false,
   referenceNotProofOfMassFormSelection:true,
   intendedUse:"HISTORICAL_MISSAL_REFERENCE_ONLY",
   liturgicalRecitationStatus:"NOT_ASSERTED_BY_THIS_LINK",
 });
}
