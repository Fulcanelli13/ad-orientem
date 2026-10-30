/**
 * Source-page-only revalidation of 111 unambiguous archived provenance leads:
 * Commons 46; Cleveland Museum 34; Metropolitan Museum 30; NC Museum 1.
 * This does not certify artwork's photo quality, licensing, or editorial choice.
 */
import {readFileSync,writeFileSync} from "node:fs";
import {createHash} from "node:crypto";
const base="data/calendar/";
const read=n=>JSON.parse(readFileSync(base+n,"utf8"));
const source=read("sacred-art-phase1-canonical383-source-repair-priorities-20261030.v1.json");
const c383=read("sacred-art-curator-queues-383-20261029.v1.json");
if(source.stats.uniqueArchivedUrlOption!==111||source.stats.sourcePageMissing!==289||
 c383.main_records.length!==383)throw Error("Expected frozen source-repair baseline");
const selected=source.rows.filter(x=>x.status==="SINGLE_ARCHIVED_URL_LEAD");
if(selected.length!==111)throw Error("111 single-source cases not present");
const sha=s=>createHash("sha256").update(s).digest("hex");
const sleep=t=>new Promise(resolve=>setTimeout(resolve,t));
const rx=/^https?:\/\/([^/]+)(\/[^?#]*)?/i;
async function get(url,{json=true}={}){
 let err="NOT_QUERIED";
 for(let attempt=1;attempt<=3;attempt++){
  try{
   const response=await fetch(url,{headers:{"Accept":json?"application/json":"text/html,application/xhtml+xml",
    "User-Agent":"AdOrientemSacredArtResearch/0.1 (https://github.com/Fulcanelli13/ad-orientem)"},
    signal:AbortSignal.timeout(24000)});
   if(!response.ok){
    err="HTTP_"+response.status;
    if([429,500,502,503,504].includes(response.status)){await sleep(attempt*900);continue;}
    return {ok:false,status:response.status,error:err};
   }
   const raw=await response.text();
   let body;if(json){try{body=JSON.parse(raw)}catch{return {ok:false,status:response.status,error:"INVALID_JSON"}}}
   return {ok:true,status:response.status,sha256:sha(raw),body,
    finalUrl:response.url,bytes:raw.length};
  }catch(e){err=String(e).slice(0,150);await sleep(attempt*750);}
 }
 return {ok:false,status:null,error:err};
}
const byId=new Map();
async function parallel(arr,fn,concurrency=4){
 let i=0;
 await Promise.all(Array.from({length:Math.min(concurrency,arr.length)},async()=>{
  while(i<arr.length){const index=i++;await fn(arr[index],index);}
 }));
}
const cma=selected.filter(x=>x.canonicalArtworkId.startsWith("cma-"));
const met=selected.filter(x=>x.canonicalArtworkId.startsWith("met-"));
const commons=selected.filter(x=>x.sourceUrlOptions[0].url.includes("commons.wikimedia.org/wiki/File:"));
const other=selected.filter(x=>!cma.includes(x)&&!met.includes(x)&&!commons.includes(x));
if(cma.length!==34||met.length!==30||commons.length!==46||other.length!==1)
 throw Error("Provider source partition drift");
const norm=s=>String(s??"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
 .toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
function accessionFromUrl(url){
 try{return decodeURIComponent(new URL(url).pathname.split("/").filter(Boolean).at(-1));}
 catch{return "";}
}
await parallel(cma,async r=>{
 const expected=Number(r.canonicalArtworkId.slice(4));
 const api="https://openaccess-api.clevelandart.org/api/artworks/"+expected;
 const response=await get(api);
 const d=response.body?.data??{};
 const correct=Number(d.id)===expected&&!!d.id;
 const accession=d.accession_number||d.accessionNumber||"";
 const accessionMatches=norm(accession)===norm(accessionFromUrl(r.sourceUrlOptions[0].url));
 byId.set(r.canonicalArtworkId,{
  sourceLane:"CLEVELAND_OFFICIAL_OBJECT_API",apiUrl:api,
  status:!response.ok?"OFFICIAL_API_NOT_RESOLVED":
    !correct?"OFFICIAL_ID_CONFLICT":
    !accessionMatches?"OFFICIAL_OBJECT_ID_BUT_ARCHIVED_URL_ACCESSION_CONFLICT":
    "OFFICIAL_ID_AND_ACCESSION_CONFIRMED",
  responseStatus:response.status,error:response.error||null,
  officialId:correct?String(d.id):null,
  officialAccession:accession||null,officialTitle:d.title||null,
  reviewedTitleNormalizedMatch:norm(r.title)===norm(d.title),
  accessionMatches,apiResponseSha256:response.sha256||null,
  publishedObjectSourceIdentityConfirmed:correct&&accessionMatches});
},4);
console.log("CMA",cma.length);
await parallel(met,async r=>{
 const expected=Number(r.canonicalArtworkId.slice(4));
 const api="https://collectionapi.metmuseum.org/public/collection/v1/objects/"+expected;
 const response=await get(api),d=response.body||{};
 const correct=Number(d.objectID)===expected;
 const pageId=Number(accessionFromUrl(r.sourceUrlOptions[0].url));
 const directUrlMatch=pageId===expected;
 byId.set(r.canonicalArtworkId,{
  sourceLane:"MET_OFFICIAL_OBJECT_API",apiUrl:api,
  status:!response.ok?"OFFICIAL_API_NOT_RESOLVED":
   !correct?"OFFICIAL_ID_CONFLICT":
   !directUrlMatch?"OFFICIAL_ID_BUT_ARCHIVED_PAGE_ID_CONFLICT":
   "OFFICIAL_OBJECT_ID_AND_ARCHIVED_PAGE_CONFIRMED",
  responseStatus:response.status,error:response.error||null,
  officialId:correct?String(d.objectID):null,
  officialAccession:d.accessionNumber||null,officialTitle:d.title||null,
  reviewedTitleNormalizedMatch:norm(r.title)===norm(d.title),
  objectPageIdMatches:directUrlMatch,apiResponseSha256:response.sha256||null,
  publishedObjectSourceIdentityConfirmed:correct&&directUrlMatch});
},4);
console.log("MET",met.length);
function commonsTitle(url){
 let path=new URL(url).pathname.split("/wiki/").pop();
 try{path=decodeURIComponent(path)}catch{}
 return path.replace(/_/g," ");
}
const apiCommons="https://commons.wikimedia.org/w/api.php";
for(let i=0;i<commons.length;i+=20){
 const rows=commons.slice(i,i+20);
 const url=new URL(apiCommons);
 Object.entries({action:"query",format:"json",prop:"imageinfo",iiprop:"sha1|size|url",
  redirects:"1",maxlag:"5",titles:rows.map(r=>commonsTitle(r.sourceUrlOptions[0].url)).join("|")})
  .forEach(([k,v])=>url.searchParams.set(k,v));
 const result=await get(url.href);
 const pages=Object.values(result.body?.query?.pages||{});
 const alias=new Map();
 for(const k of [...(result.body?.query?.normalized||[]),...(result.body?.query?.redirects||[])])
  alias.set(norm(k.from),norm(k.to));
 const normalizeChain=s=>{
  let key=norm(s),visited=new Set();
  while(alias.has(key)&&!visited.has(key)){visited.add(key);key=alias.get(key);}
  return key;
 };
 const byTitle=new Map(pages.map(p=>[norm(p.title),p]));
 for(const r of rows){
  const p=byTitle.get(normalizeChain(commonsTitle(r.sourceUrlOptions[0].url)));
  const ok=Number.isInteger(p?.pageid)&&p?.ns===6&&Array.isArray(p?.imageinfo)&&p.imageinfo.length>0;
  byId.set(r.canonicalArtworkId,{
   sourceLane:"COMMONS_CURRENT_FILE_PAGE_API",
   apiUrl:"https://commons.wikimedia.org/wiki/"+encodeURIComponent(p?.title||commonsTitle(r.sourceUrlOptions[0].url)),
   status:!result.ok?"COMMONS_API_NOT_RESOLVED":
     ok?"COMMONS_FILE_PAGE_AND_CURRENT_IMAGE_RESOLVED":
     "COMMONS_FILE_MISSING_OR_NOT_IMAGE",
   responseStatus:result.status,error:result.error||null,
   filePageId:p?.pageid||null,
   currentTitle:p?.title||null,
   currentFileSha1:p?.imageinfo?.[0]?.sha1||null,
   sourceFileTitleMatchesCurrentFileTitle:ok,
   officialAccession:null,officialTitle:null,
   apiResponseSha256:result.sha256||null,
   publishedObjectSourceIdentityConfirmed:false,
   publishedSourceFilePageResolved:ok
  });
 }
 await sleep(300);
}
console.log("Commons",commons.length);
for(const r of other){
 const u=r.sourceUrlOptions[0].url;
 const response=await get(u,{json:false});
 byId.set(r.canonicalArtworkId,{sourceLane:"OTHER_PUBLISHER_PAGE",apiUrl:u,
  status:response.ok?"PUBLISHER_HTML_RETRIEVED_NOT_OFFICIAL_ARTWORK_ID_VERIFIED":
   "PUBLISHER_PAGE_NOT_RESOLVED",responseStatus:response.status,error:response.error||null,
  pageResponseSha256:response.sha256||null,
  publishedObjectSourceIdentityConfirmed:false});
}
const audited=selected.map(r=>{
 const verification=byId.get(r.canonicalArtworkId);
 if(!verification)throw Error("Missing fetch result "+r.canonicalArtworkId);
 return {canonicalArtworkId:r.canonicalArtworkId,title:r.title,
  archivedPage:r.sourceUrlOptions[0].url,archiveEvidenceFiles:
   r.sourceUrlOptions[0].archiveFiles,
  verification,
  existingCanonicalSourcePageStillBlank:true,
  editorialDecisionUnchanged:true,artworkIdentityToAccepted856NotModified:true,
  exactImageRightsNotCertified:true,nativeImageNotVisuallyInspected:true,
  productionMutation:false};
});
const statusCounts={};
for(const row of audited){
 statusCounts[row.verification.status]=(statusCounts[row.verification.status]||0)+1;
}
const stats={selectedSingleArchivedSourceUrlCases:111,
 sourceLanes:{commons:commons.length,cleveland:cma.length,met:met.length,other:other.length},
 officialMuseumIdAndArchivedUrlConfirmed:audited.filter(r=>r.verification.publishedObjectSourceIdentityConfirmed).length,
 commonsFilesCurrentlyResolved:audited.filter(r=>r.verification.publishedSourceFilePageResolved).length,
 casesNeedingSourceInvestigation:audited.filter(r=>
  !r.verification.publishedObjectSourceIdentityConfirmed&&!r.verification.publishedSourceFilePageResolved).length,
 newAcceptedCanonical383Links:0,canonical383SourcePageFieldsUpdated:0,
 officialExactNativePhotoQualityCertified:0,photoLicenseCertified:0,productionImports:0,
 byStatus:statusCounts};
if(audited.length!==111||stats.officialMuseumIdAndArchivedUrlConfirmed>64||
 stats.commonsFilesCurrentlyResolved>46||
 audited.some(x=>x.existingCanonicalSourcePageStillBlank!==true||
  x.editorialDecisionUnchanged!==true||x.artworkIdentityToAccepted856NotModified!==true||
  x.productionMutation!==false))throw Error("Frozen source/no-publish gate violation");
const report={schema:"AO_SACRED_ART_CANONICAL383_SINGLE_SOURCE_OFFICIAL_RECHECK_V1",
 generatedAt:new Date().toISOString(),
 sourceQueue:"sacred-art-phase1-canonical383-source-repair-priorities-20261030.v1.json",
 sources:["The Metropolitan Museum official Collection API","Cleveland Museum of Art open-access artwork API",
  "Wikimedia Commons File API","North Carolina Museum original object page"],
 rules:["Official museum object-ID/URL confirmation is source provenance, not final attribution or image approval.",
  "Commons file resolution is source image identity only; photographer and exact licence remain separate.",
  "Do not treat unavailable API response as proof an object does not exist.",
  "Original 383 canonical registry remains unmodified, including 111 blank source_page fields.",
  "No new links to 856 accepted review cards, no production mutation."],
 stats,rows:audited,release:{canonicalMasterUntouched:true,
 photoCertification:false,sourceFieldAutofill:0,productionMutation:false}};
writeFileSync(base+"sacred-art-phase1-canonical383-111-official-source-verification-20261030.v1.json",
 JSON.stringify(report,null,2)+"\n",{flag:"wx"});
console.log(JSON.stringify(stats,null,2));