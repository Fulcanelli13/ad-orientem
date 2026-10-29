/**
 * Explicit, on-demand read-through of ONE pinned original Latin Office leaf.
 *
 * Uses the application's existing installed fetch/source transport, injected
 * by the host. It introduces no crawler, new backend, annual generator,
 * repository checkout, filesystem write or raw Office text archive.
 *
 * The earlier Mass parsed-source Map cannot preserve conditional [Rank]
 * headers. This narrowly gated original-leaf read is necessary to avoid
 * guessing the 1960 Roman variant. The original source text exists only
 * transiently in this function; consumers receive metadata, never prayers.
 */
import {DIVINUM_OFFICIUM_PIN} from "../app/source-transport-compat.js";
import {createOfficePinnedFilenameLookup} from "./pinned-filename-index.js";
import {planUniversalOfficeKeys} from "./universal-source-descriptors.js";
import {planTemporalOfficeLeads} from "./temporal-source-leads.js";
import {parseConditionalOfficeMetadata}
 from "./conditional-metadata-parser.js";

export const OFFICE_CONDITIONAL_SOURCE_READER="ao.office.conditional-source-reader.v1";
const BASE="https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/"+
 DIVINUM_OFFICIUM_PIN+"/web/www/horas/Latin/";
const PATH=/^(?:Tempora|Sancti|Commune)\/[A-Za-z0-9._-]+$/;
const MAX_CHARS=600000;

export function officePinnedOriginalSourceUrl(path){
 if(typeof path!=="string"||!PATH.test(path)||
    path.includes("..")||path.length>120)
  throw Error("OFFICE_CONDITIONAL_SOURCE_PATH_INVALID");
 return BASE+path+".txt";
}

/**
 * Existing app/browser transport must be passed in: fetchSource(url,init)
 * (e.g. the installed source-transport-compatible fetch), not a new client.
 * A source path must be explicitly chosen; no annual/date list API exists.
 */
export function createOfficeConditionalSourceReader({
 fetchSource,filenameIndex,maxDistinctReads=12
}={}){
 if(typeof fetchSource!=="function"||
    !Number.isInteger(maxDistinctReads)||maxDistinctReads<1||
    maxDistinctReads>24)
  throw Error("OFFICE_CONDITIONAL_READER_CONFIG_INVALID");
 const filenames=createOfficePinnedFilenameLookup(filenameIndex);
 const cache=new Map();
 async function readOne(path){
  const url=officePinnedOriginalSourceUrl(path);
  if(filenames.lookup(path).filenameStatus!=="PINNED_LATIN_FILENAME_LISTED")
   throw Error("OFFICE_CONDITIONAL_SOURCE_FILENAME_NOT_INDEXED");
  if(!cache.has(path)){
   if(cache.size>=maxDistinctReads)
    throw Error("OFFICE_CONDITIONAL_SOURCE_READ_BUDGET_EXHAUSTED");
   const promise=(async()=>{
    const response=await fetchSource(url,Object.freeze({
     method:"GET",mode:"cors",credentials:"omit",redirect:"error",
     referrerPolicy:"no-referrer",cache:"no-store"
    }));
    if(response?.ok!==true||response?.status!==200)
     throw Error("OFFICE_CONDITIONAL_SOURCE_READ_FAILED");
    // No accepted redirect, revision switch, source-family substitution
    // or a second domain pretending to be the pinned original.
    if(response.url&&response.url!==url)
     throw Error("OFFICE_CONDITIONAL_SOURCE_FINAL_URL_MISMATCH");
    const len=Number(response.headers?.get?.("content-length"));
    if(Number.isFinite(len)&&len>MAX_CHARS*4)
     throw Error("OFFICE_CONDITIONAL_SOURCE_TOO_LARGE");
    if(typeof response.text!=="function")
     throw Error("OFFICE_CONDITIONAL_SOURCE_RESPONSE_INVALID");
    const original=await response.text();
    if(typeof original!=="string"||original.length>MAX_CHARS)
     throw Error("OFFICE_CONDITIONAL_SOURCE_TOO_LARGE");
    return parseConditionalOfficeMetadata({
     sourcePath:path,sourceRevision:DIVINUM_OFFICIUM_PIN,
     language:"la",sourceText:original
    });
   })();
   cache.set(path,promise);
   promise.catch(()=>{if(cache.get(path)===promise)cache.delete(path)});
  }
  return cache.get(path);
 }
 async function readDateLead({date,path}={}){
  // A path is selected by the caller, not by relative array ordinal.
  // Date-derived candidates can be ambiguous or lose to local feasts.
  const possible=[
   ...planUniversalOfficeKeys(date).keys,
   ...planTemporalOfficeLeads(date).leads
  ];
  if(!possible.some(row=>row.path===path))
   throw Error("OFFICE_CONDITIONAL_SOURCE_NOT_DATE_LEAD");
  return readOne(path);
 }
 return Object.freeze({
  schema:OFFICE_CONDITIONAL_SOURCE_READER,
  sourceRevision:DIVINUM_OFFICIUM_PIN,
  readOne,readDateLead,cachedSourceCount:()=>cache.size,
  remainingReadBudget:()=>maxDistinctReads-cache.size,
  // No clearCache(): explicit bounded request budget survives failures.
  bulkReadSupported:false,persistentArchiveSupported:false,
  officeAppointmentSupported:false
 });
}
