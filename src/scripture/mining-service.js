/**
 * Shared Scripture mining API. Source-cited research, not another reader.
 * Consumers: Rosary beads, Mass, Formation, Historia Salutis and Prayer.
 * Reuses the exact same Catholic witness and Catena loaders as the public
 * Scripture overlay. No invented Bible text, commentary, or crosswalk.
 */
import {parseScriptureContext,verifiedScriptureCommentary} from "./context.js";
import {loadScriptureWitness} from "./witness-loader.js";
import {loadCatenaForPassage,isCatenaGospel} from "./catena-inline.js";
import {sourceReadingLink} from "./links.js";
import {scriptureReferenceWarning,scriptureParallelReferenceState} from "./reference-safety.js";
import {estherParallelSpans} from "./esther-span-crosswalk.js";

export const SCRIPTURE_MINING_SCHEMA="ao.scripture.mining.v1";
export const MINING_ENGLISH_EDITIONS=Object.freeze(["cpdv-2009","dr-challoner"]);
const MAX_RANGE=100;
const onlyVerses=(records,p)=>records
 .filter(row=>row.book===p.book&&row.chapter===p.chapter&&
   row.verseStart<=p.verseEnd&&row.verseEnd>=p.verseStart)
 .map(row=>Object.freeze({chapter:row.chapter,verse:row.verseStart,text:row.text,
   sourceStatus:row.sourceStatus,reviewed:row.reviewed===true,
   sourceUrl:row.sourceUrl||null}));

/**
 * A single reference is shared by all calling modules; "origin" is an
 * immutable return-context receipt, not authority to change the parent.
 * The two Bible editions are source witnesses, never silently "certified".
 * A textual source error is reported per edition rather than substituted.
 */
export async function mineScriptureReference(reference,{
 origin=null,referenceEdition="cpdv-2009",fetcher=globalThis.fetch?.bind(globalThis),
 cacheStorage=globalThis.caches,cryptoProvider=globalThis.crypto,
 witnessLoader=loadScriptureWitness,commentaryLoader=loadCatenaForPassage
}={}){
 const parsed=parseScriptureContext(reference);
 if(!parsed)throw new Error("INVALID_CATHOLIC_SCRIPTURE_REFERENCE");
 const p=parsed.passage;
 if(p.verseEnd-p.verseStart+1>MAX_RANGE)throw new Error("MINING_RANGE_OVER_100_VERSES");
 if(!MINING_ENGLISH_EDITIONS.includes(referenceEdition))
  throw new Error("UNSUPPORTED_MINING_REFERENCE_EDITION");
 // Explicit traditional Esther coordinates are allowed: a v18 Douay 4:1-17
 // must never be silently misread as CPDV Esther 4:1-17.
 if(referenceEdition!=="cpdv-2009"&&p.book!=="Esther")
  throw new Error("REFERENCE_EDITION_OVERRIDE_ONLY_FOR_ESTHER");
 const parallel=scriptureParallelReferenceState(p,"cpdv-2009","dr-challoner");
 const exceptional=["Psalms","Esther","SongOfSongs"].includes(p.book);
 const cpSpans=p.book==="Esther"&&referenceEdition==="dr-challoner"
  ?estherParallelSpans(p,"dr-challoner","cpdv-2009")
  :Object.freeze([p]);
 const drSpans=p.book==="Esther"
  ?(referenceEdition==="dr-challoner"
    ?Object.freeze([p])
    :estherParallelSpans(p,"cpdv-2009","dr-challoner"))
  :(exceptional?(parallel.canAutoParallel?Object.freeze([parallel.reference]):null):Object.freeze([p]));
 const results=await Promise.all(MINING_ENGLISH_EDITIONS.map(async editionId=>{
   const spans=editionId==="dr-challoner"?drSpans:cpSpans;
   if(!spans)return Object.freeze({editionId,available:false,
     sourceStatus:"CROSS_EDITION_REFERENCE_UNVERIFIED",verses:Object.freeze([]),
     error:"Exact cross-edition coordinates are not verified for this span.",
     sourceUrl:null,sourceUrls:Object.freeze([]),passage:null,passages:Object.freeze([])});
   const urls=Object.freeze(spans.map(x=>sourceReadingLink(x,editionId)));
   const single=spans.length===1?spans[0]:null;
   try{
     const rows=await witnessLoader(editionId,spans[0].book,{fetcher,cacheStorage});
     if(!Array.isArray(rows))throw new Error("INVALID_WITNESS_LOADER_RESULT");
     return Object.freeze({editionId,available:true,sourceStatus:"UNCOLLATED_SOURCE_WITNESS",
       verses:Object.freeze(spans.flatMap(span=>onlyVerses(rows,span))),
       passage:single,passages:spans,sourceUrls:urls,sourceUrl:single?urls[0]:null});
   }catch(error){
     return Object.freeze({editionId,available:false,sourceStatus:"SOURCE_UNAVAILABLE",
       verses:Object.freeze([]),error:String(error?.message??error),
       sourceUrl:single?urls[0]:null,sourceUrls:urls,passage:single,passages:spans});
   }
 }));
 let catena=Object.freeze({available:false,sections:Object.freeze([])});
 if(isCatenaGospel(p)){
   try{
     const sections=await commentaryLoader(p,{fetcher,cacheStorage,cryptoProvider});
     if(!Array.isArray(sections))throw new Error("INVALID_COMMENTARY_RESULT");
     catena=Object.freeze({available:true,language:"en",edition:"Oxford/Newman 1841–45",
       sections:Object.freeze(sections)});
   }catch(error){
     catena=Object.freeze({available:false,sections:Object.freeze([]),
       error:String(error?.message??error)});
   }
 }
 const warning=scriptureReferenceWarning(p.book,"en");
 return Object.freeze({
   schema:SCRIPTURE_MINING_SCHEMA,
   reference:parsed.reference,passage:p,referenceEdition,origin:origin?Object.freeze({...origin}):null,
   primaryEdition:"cpdv-2009",comparisonEdition:"dr-challoner",
   readings:Object.freeze(Object.fromEntries(results.map(x=>[x.editionId,x]))),
   commentary:catena,
   otherCommentarySource:verifiedScriptureCommentary(p),
   referenceWarning:warning||null,
   exactEditionParallelVerified:p.book==="Esther"
     ?Boolean(cpSpans&&drSpans):parallel.canAutoParallel===true,
   editorialStatus:"RESEARCH_NOT_APPROVED_FOR_VERBATIM_ROSARY_CUES"
 });
}

/** Saved editorial choices only; never preserve Bible quotations in notes. */
export function validateScriptureMiningDecision(value){
 if(!value||typeof value!=="object"||
   typeof value.reference!=="string"||!parseScriptureContext(value.reference)||
   !Number.isInteger(value.rating)||value.rating<0||value.rating>5||
   !["KEEP_HERE","SUITABLE_ELSEWHERE","REJECT","UNDECIDED"].includes(value.disposition)||
   (value.referenceEdition!==undefined&&
    !MINING_ENGLISH_EDITIONS.includes(value.referenceEdition))||
   typeof value.originModule!=="string"||!["rosary","mass","formation","historia","novena","stations","prayer","other"].includes(value.originModule)||
   typeof value.originId!=="string"||value.originId.length>150||
   (value.originBead!==undefined&&value.originBead!==null&&
    (!Number.isInteger(value.originBead)||value.originBead<1||value.originBead>10))||
   (value.destinationId!==null&&typeof value.destinationId!=="string")||
   (typeof value.destinationId==="string"&&value.destinationId.length>100)||
   (value.destinationBead!==null&&(!Number.isInteger(value.destinationBead)||value.destinationBead<1||value.destinationBead>10))||
   typeof value.duplicate!=="boolean")
   throw new Error("INVALID_SCRIPTURE_MINING_DECISION");
 return Object.freeze({schema:"ao.scripture.mining-decision.v1",
   reference:value.reference,referenceEdition:value.referenceEdition??"cpdv-2009",
   rating:value.rating,disposition:value.disposition,
   originModule:value.originModule,originId:value.originId,
   originBead:value.originBead??null,
   destinationId:value.destinationId,destinationBead:value.destinationBead,
   duplicate:value.duplicate,
   // Selection metadata only: never falsely treat a reference as approved text.
   editorialStatus:"RESEARCH_SELECTION_UNAPPROVED"});
}

/** Agreement counts independent original editorial families, never mirrors. */
export function countIndependentSelections(records){
 if(!Array.isArray(records))throw new TypeError("Selection records required");
 return new Set(records.filter(x=>x?.qualified===true&&
   typeof x.editorialFamilyId==="string"&&x.editorialFamilyId.trim())
   .map(x=>x.editorialFamilyId.trim())).size;
}
