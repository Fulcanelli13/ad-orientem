/**
 * Living Church P3+ — source-owned apologetics research viewer.
 * UNPUBLISHED editorial preview: never a public answer-routing interface.
 *
 * Consumes Folio's original canonical index and original answer packs
 * at their canonical paths. This file does NOT author a single new Q&A.
 */
import {createCanonResearchQuestionCatalog} from "./formation-canon-question-catalog.mjs";

export const CANON_RESEARCH_READER_VERSION="AO_CANON_ORIGINAL_RESEARCH_READER_V1";
const MAIN_INDEX="data/learn/formation-historical-answer-crosswalk-20261013.v1.json";
const EXTRA_INDEX="data/learn/research/formation-new-15-indexed-answer-adequacy-20261014.v1.json";
const VALID_PATH=/^data\/learn\/[a-z0-9_./-]+\.json$/i;

export function canonResearchPreviewEnabled(win=globalThis){
 const p=new URLSearchParams(win?.location?.search||"");
 return ["aoVisibleMassReview","aoLivingChurchReview",
  "aoLivingChurchCharacters","aoCanonResearchReview"].every(k=>p.get(k)==="1");
}
function pathToUrl(path){
 if(typeof path!=="string"||!VALID_PATH.test(path)||path.includes("..")||path.includes("//"))
  throw Error("Invalid original research owner path");
 return new URL("../../"+path,import.meta.url).href;
}
async function fetchJSON(fetcher,path){
 const response=await fetcher(pathToUrl(path));
 if(!response?.ok)throw Error("Original research source unavailable: "+path);
 const json=await response.json();
 if(!json||typeof json!=="object")throw Error("Invalid original research payload");
 return json;
}
function findRecord(document,id){
 for(const key of ["records","drafts","dossiers"]){
  const records=document[key];
  if(Array.isArray(records)){
   const record=records.find(r=>r.id===id||r.historical_id===id);
   if(record)return record;
  }
 }
 return null;
}
function textOf(p,locale){
 const original=p?.text;
 if(typeof original==="string")return locale==="en"?original:null;
 const source=original?.[locale];
 return typeof source==="string"&&source.trim()?source:null;
}
function safeSource(link){
 const url=typeof link?.url==="string"?link.url:null;
 if(!url)return null;
 try{const uri=new URL(url);if(uri.protocol!=="https:")return null;return uri.href;}catch{return null;}
}
function originalParagraphs(record,document,language){
 const paragraphs=record?.paragraphs||record?.sections||[];
 if(!Array.isArray(paragraphs))return [];
 const registry=new Map(Array.isArray(document.source_registry)?
  document.source_registry.map(r=>[r.id,r]):[]);
 return paragraphs.map(p=>{
  const sourceIds=Array.isArray(p.source_ids)?p.source_ids:[];
  const inlineLinks=Array.isArray(p.source_links)?p.source_links:[];
  const links=[...sourceIds.map(s=>registry.get(s)),...inlineLinks]
   .map(s=>({id:s?.id||null,title:s?.title||s?.id||"Original source",url:safeSource(s)}))
   .filter(s=>s.url);
  const distinct=[...new Map(links.map(x=>[x.url,x])).values()];
  return Object.freeze({role:String(p.role||"source paragraph"),
   sourceText:textOf(p,language),language,translationMissing:!textOf(p,language),
   sources:Object.freeze(distinct),sourceIds:Object.freeze([...sourceIds]),
   ownerApproval:false});
 });
}
/**
 * Review-only interface. When imported by a non-review app route it fails shut.
 * For editor preview, answer bodies remain cited research drafts, not approved
 * Canon speech, and this exposes no native navigation target.
 */
export async function createCanonResearchReviewer(win=globalThis,{fetcher}={}){
 if(!canonResearchPreviewEnabled(win))throw Error("Canon research requires four explicit review flags");
 const request=fetcher||(typeof win.fetch==="function"?win.fetch.bind(win):null);
 if(typeof request!=="function")throw Error("Original research fetcher missing");
 const [index,delta]=await Promise.all([fetchJSON(request,MAIN_INDEX),fetchJSON(request,EXTRA_INDEX)]);
 const catalog=createCanonResearchQuestionCatalog(index,delta);
 const cache=new Map([[MAIN_INDEX,index],[EXTRA_INDEX,delta]]);
 async function readDocument(path){
  if(!cache.has(path))cache.set(path,fetchJSON(request,path));
  try{return await cache.get(path);}catch(error){cache.delete(path);throw error;}
 }
 async function originalResearch(id,{lang="en"}={}){
  const question=catalog.get(id);
  if(!question)return Object.freeze({ok:false,code:"UNKNOWN_ORIGINAL_QUESTION"});
  const language=lang==="fr"?"fr":"en";
  const pointer=question.supplementPointer;
  const candidates=pointer?[pointer,...question.canonicalOwnerPointers]:
   question.canonicalOwnerPointers;
  for(const ref of candidates){
   if(!ref?.path)continue;
   const wanted=ref.recordId||ref.id;
   try{
    const doc=await readDocument(ref.path),record=findRecord(doc,wanted);
    if(!record)continue;
    const paragraphs=originalParagraphs(record,doc,language);
    if(!paragraphs.length)continue;
    // Documents and dossier source IDs remain individually attributable.
    return Object.freeze({ok:true,questionId:question.questionId,
     questionTitleCandidate:question.historicalQuestionCandidate,
     originalSourcePointer:Object.freeze({path:ref.path,recordId:wanted}),
     canonicalOwnerIds:question.canonicalOwnerIds,language,
     paragraphs:Object.freeze(paragraphs),
     sourceOwnerReviewOnly:true,publicAnswerAuthorized:false,
     historicVerbatimCertified:false,characterQuote:false,nativeRoute:null});
   }catch{
    // A missing/unusable first document can never create an approved fallback.
    // Later original owners may be displayed in research mode, never public.
   }
  }
  return Object.freeze({ok:false,code:"UNAVAILABLE_SOURCE_OWNER",questionId:question.questionId});
 }
 return Object.freeze({version:CANON_RESEARCH_READER_VERSION,
  counts:catalog.counts,byBank:catalog.byBank,
  find:(query,opts)=>catalog.find(query,opts),
  listBank:bank=>catalog.listBank(bank),
  get:id=>catalog.get(id),
  originalResearch,
  canPublish:false,
  publicHandoff:()=>Object.freeze({ok:false,code:"ORIGINAL_EDITORIAL_PUBLICATION_HOLD"})
 });
}
