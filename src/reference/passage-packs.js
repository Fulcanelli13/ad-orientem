import {sourceCanDisplay} from "./text-parser.js";
import {validateSourceWork,assertPassageReproductionScope,validateSourcePageSpan} from "./edition-witness-contracts.js";

const ID=/^[a-z0-9][a-z0-9._-]{1,100}$/i;
const PASSAGE=/^[a-z0-9._-]+:s[0-9]{3}(?::p[0-9]{3})?$/i;
const HASH=/^[a-f0-9]{64}$/;
const FILE=/^section-[0-9]{3,}\.json$/;

const ANCHOR=/^[a-z0-9][a-z0-9._-]{0,79}$/;
const nonblank=x=>typeof x==="string"&&x.trim().length>0;
const stableCitation=({workId,editionId,witnessId},sourceAnchor)=>
 [workId,editionId,witnessId,sourceAnchor].map(encodeURIComponent).join("::");
function assertEditionIdentity(identity){
 if(!identity||identity.workId?.startsWith("WORK-")!==true||
    !nonblank(identity.editionId)||!nonblank(identity.witnessId)||
    !nonblank(identity.reviewId)||!["PROJECT_AUTHORED_DEMO","REPRODUCTION_CLEARED"].includes(identity.rightsStatus))
  throw new Error("SOURCE_PACK_EDITION_IDENTITY_INVALID");
 if(identity.rightsStatus==="PROJECT_AUTHORED_DEMO"){
  if(identity.demoOnly!==true||identity.scope!=="PROJECT_AUTHORED_ONLY"||
     identity.publicationApproval!=="NOT_FOR_PUBLICATION")
   throw new Error("SOURCE_PACK_DEMO_ONLY");
 }else if(identity.demoOnly!==false||
  identity.publicationApproval!=="APPROVED_FOR_READING"||
  !["REVIEWED_EXCERPTS_ONLY","FULL_WORK_REVIEWED"].includes(identity.scope))
   throw new Error("SOURCE_PACK_PUBLICATION_APPROVAL_REQUIRED");
 return identity;
}
function assertPassageMeta(meta,passageId,identity){
 if(!meta||meta.passageId!==passageId||!ANCHOR.test(meta.sourceAnchor??"")||
    !nonblank(meta.sourceLocator)||!HASH.test(meta.textSha256??"")||
    meta.citationId!==stableCitation(identity,meta.sourceAnchor))
  throw new Error("SOURCE_PACK_CITATION_IDENTITY_INVALID");
 if(meta.sourcePage!==null&&(typeof meta.sourcePage!=="string"||
     !meta.sourcePage.startsWith("https://")))
  throw new Error("SOURCE_PACK_SOURCE_PAGE_INVALID");
 validateSourcePageSpan(meta);
}
function assertQualifiedDocument(document,sourceWork,passageLocators){
 if(sourceWork===undefined&&passageLocators===undefined)return null;
 validateSourceWork(sourceWork,{requireReproduction:true});
 if(sourceWork.id!==document.workId||sourceWork.witnessId!==document.witnessId||
    sourceWork.language!==document.language||!passageLocators||
    typeof passageLocators!=="object"||Array.isArray(passageLocators))
  throw new Error("SOURCE_PACK_WORK_EDITION_WITNESS_MISMATCH");
 const rights=sourceWork.rights;
 const demo=rights.status==="PROJECT_AUTHORED_DEMO";
 if(!demo&&(sourceWork.demoOnly===true||
   rights.publicationApproval!=="APPROVED_FOR_READING"||
   !["REVIEWED_EXCERPTS_ONLY","FULL_WORK_REVIEWED"].includes(rights.scope)||
   (rights.scope==="FULL_WORK_REVIEWED"&&!nonblank(rights.fullWorkReviewId))))
   throw new Error("SOURCE_PACK_PUBLICATION_APPROVAL_REQUIRED");
 const identity=assertEditionIdentity({
  workId:sourceWork.id,editionId:sourceWork.editionId,
  witnessId:sourceWork.witnessId,reviewId:rights.reviewId,
  rightsStatus:rights.status,
  scope:demo?"PROJECT_AUTHORED_ONLY":rights.scope,
  demoOnly:demo,publicationApproval:demo?"NOT_FOR_PUBLICATION":rights.publicationApproval
 });
 const meta=new Map(),anchors=new Set(),entries=[];
 for(const section of document.sections??[])for(const paragraph of section.paragraphs??[]){
  const loc=passageLocators[paragraph.id];
  if(!ANCHOR.test(paragraph.sourceAnchor??"")||anchors.has(paragraph.sourceAnchor)||
     !loc||typeof loc!=="object"||!nonblank(loc.sourceLocator)||
     loc.sourcePage!==undefined&&(typeof loc.sourcePage!=="string"||
      !loc.sourcePage.startsWith("https://")))
   throw new Error("SOURCE_PACK_LOCATOR_REQUIRED_OR_DUPLICATE");
  anchors.add(paragraph.sourceAnchor);
  const entry={passageId:paragraph.id,sourceAnchor:paragraph.sourceAnchor,
   sourceLocator:loc.sourceLocator,sourcePage:loc.sourcePage??null,
   citationId:stableCitation(identity,paragraph.sourceAnchor)};
  if(loc.sourcePages!==undefined)entry.sourcePages=loc.sourcePages;
  validateSourcePageSpan(entry);
  meta.set(paragraph.id,entry);
  entries.push({locator:"#"+paragraph.sourceAnchor,text:paragraph.text});
 }
 if(meta.size===0||Object.keys(passageLocators).length!==meta.size)
  throw new Error("SOURCE_PACK_LOCATOR_COVERAGE_INVALID");
 assertPassageReproductionScope(sourceWork,entries);
 return {identity,meta};
}

const encoder=()=>new TextEncoder();
const bytes=s=>encoder().encode(s);
async function sha256(raw,cryptoProvider){
 if(!cryptoProvider?.subtle?.digest)throw new Error("SOURCE_PACK_HASH_PROVIDER_REQUIRED");
 const result=await cryptoProvider.subtle.digest("SHA-256",bytes(raw));
 return Array.from(new Uint8Array(result),x=>x.toString(16).padStart(2,"0")).join("");
}
function assertAccess(meta){
 if(meta?.rights!=="CLEARED"||meta?.status!=="ELIGIBLE_FOR_READING")
  throw new Error("SOURCE_PACK_RIGHTS_OR_TEXT_NOT_CLEARED");
}
function assertManifest(manifest){
 if(manifest?.schema!=="ao.source-pack-manifest.v1")throw new Error("SOURCE_PACK_MANIFEST_INVALID");
 assertAccess(manifest);
 if(!ID.test(manifest.workId??"")||!ID.test(manifest.witnessId??"")||
    !ID.test(manifest.revision??"")||!["la","en","fr"].includes(manifest.language))
  throw new Error("SOURCE_PACK_IDENTITY_INVALID");
 if(!Array.isArray(manifest.sections)||!manifest.sections.length)
  throw new Error("SOURCE_PACK_SECTIONS_MISSING");
 if(manifest.editionIdentity!==undefined){
  assertEditionIdentity(manifest.editionIdentity);
  if(manifest.editionIdentity.workId!==manifest.workId||
     manifest.editionIdentity.witnessId!==manifest.witnessId)
   throw new Error("SOURCE_PACK_WORK_EDITION_WITNESS_MISMATCH");
 }
 const ids=new Set(),files=new Set();
 for(const s of manifest.sections){
  if(!PASSAGE.test(s.id)||!s.id.startsWith(manifest.witnessId+":")||
     !FILE.test(s.file)||!HASH.test(s.sha256)||files.has(s.file)||ids.has(s.id)||
     !Number.isSafeInteger(s.byteSize)||s.byteSize<1||
     !Array.isArray(s.passageIds)||!s.passageIds.length||
     new Set(s.passageIds).size!==s.passageIds.length||
     !s.passageIds.every(id=>PASSAGE.test(id)&&id.startsWith(s.id+":p")&&!ids.has(id)))
   throw new Error("SOURCE_PACK_SECTION_INVALID");
  if(manifest.editionIdentity){
   if(!Array.isArray(s.passageMeta)||s.passageMeta.length!==s.passageIds.length)
    throw new Error("SOURCE_PACK_PASSAGE_METADATA_MISSING");
   s.passageMeta.forEach((m,i)=>assertPassageMeta(m,s.passageIds[i],manifest.editionIdentity));
  }else if(s.passageMeta!==undefined)
   throw new Error("SOURCE_PACK_UNQUALIFIED_PASSAGE_METADATA");
  files.add(s.file);ids.add(s.id);
  for(const id of s.passageIds)ids.add(id);
 }
 return manifest;
}
async function assertChunk(chunk,section,manifest,cryptoProvider){
 if(chunk?.schema!=="ao.source-pack-section.v1"||
    chunk.workId!==manifest.workId||chunk.witnessId!==manifest.witnessId||
    chunk.revision!==manifest.revision||chunk.language!==manifest.language||
    chunk.section?.id!==section.id||chunk.section?.title!==section.title||
    !Array.isArray(chunk.paragraphs)||chunk.paragraphs.length!==section.passageIds.length)
  throw new Error("SOURCE_PACK_CONTENT_IDENTITY_MISMATCH");
 if(manifest.editionIdentity&&JSON.stringify(chunk.editionIdentity)!==JSON.stringify(manifest.editionIdentity))
  throw new Error("SOURCE_PACK_CHUNK_EDITION_MISMATCH");
 if(!manifest.editionIdentity&&chunk.editionIdentity!==undefined)
  throw new Error("SOURCE_PACK_UNQUALIFIED_CHUNK");
 for(let i=0;i<chunk.paragraphs.length;i++){
  const p=chunk.paragraphs[i];
  if(p?.id!==section.passageIds[i]||typeof p.text!=="string"||!p.text.trim()||
      p.unresolved===true||p.text.includes("\u0000"))
   throw new Error("SOURCE_PACK_CONTENT_INVALID");
  if(manifest.editionIdentity){
   const meta=section.passageMeta[i];
   if(JSON.stringify(p.sourceMeta)!==JSON.stringify(meta)||
      await sha256(p.text,cryptoProvider)!==meta.textSha256)
    throw new Error("SOURCE_PACK_APPROVED_EXCERPT_IDENTITY_MISMATCH");
  }else if(p.sourceMeta!==undefined)
   throw new Error("SOURCE_PACK_UNQUALIFIED_CHUNK");
 }
 return chunk;
}

/**
 * Build self-contained, SHA-256 verified per-section JSON chunks from a
 * rights-approved parser output. No PDF/HTML acquisition or publication.
 * The caller decides where / whether to store the returned bytes.
 */
export async function compileSourcePassagePacks(document,{
 cryptoProvider=globalThis.crypto,sourceWork,passageLocators
}={}){
 if(document?.schema!=="ao.pinned-source-paragraphs.v1"||
    !ID.test(document.workId??"")||!ID.test(document.witnessId??"")||
    !ID.test(document.revision??""))throw new Error("SOURCE_PACK_DOCUMENT_INVALID");
 assertAccess(document);
 const qualified=assertQualifiedDocument(document,sourceWork,passageLocators);
 const chunks=[],sections=[];
 for(let i=0;i<document.sections.length;i++){
  const section=document.sections[i];
  if(!sourceCanDisplay(document,section.id))
   throw new Error("SOURCE_PACK_UNVERIFIED_SECTION");
  const passageMeta=qualified?await Promise.all(section.paragraphs.map(async p=>({
   ...qualified.meta.get(p.id),textSha256:await sha256(p.text,cryptoProvider)
  }))):null;
  const content={
   schema:"ao.source-pack-section.v1",workId:document.workId,
   witnessId:document.witnessId,revision:document.revision,language:document.language,
   section:{id:section.id,title:section.title,sourceAnchor:section.sourceAnchor??null},
   paragraphs:section.paragraphs.map((p,j)=>({
    id:p.id,text:p.text,unresolved:p.unresolved,
    sourceLine:p.sourceLine??null,sourceAnchor:p.sourceAnchor??null,
    ...(qualified?{sourceMeta:passageMeta[j]}:{})
   })),
   ...(qualified?{editionIdentity:qualified.identity}:{})
  };
  const raw=JSON.stringify(content),file="section-"+String(i+1).padStart(3,"0")+".json";
  chunks.push(Object.freeze({file,raw}));
  sections.push(Object.freeze({
   id:section.id,title:section.title,sourceAnchor:section.sourceAnchor??null,
   file,byteSize:bytes(raw).length,sha256:await sha256(raw,cryptoProvider),
   passageIds:Object.freeze(section.paragraphs.map(p=>p.id)),
   ...(qualified?{passageMeta:Object.freeze(passageMeta)}:{})
  }));
 }
 const manifest=assertManifest(Object.freeze({
  schema:"ao.source-pack-manifest.v1",workId:document.workId,
  witnessId:document.witnessId,revision:document.revision,
  language:document.language,format:document.format,
  rights:document.rights,status:document.status,
  ...(qualified?{editionIdentity:qualified.identity}:{}),
  sections:Object.freeze(sections)
 }));
 return Object.freeze({manifest,chunks:Object.freeze(chunks)});
}

/**
 * Zero-fetch initialization. loadChunk must be supplied explicitly by the
 * embedding app; the generic service never proxies arbitrary network URLs.
 * Offline fallback, if desired, belongs to the host application's fetcher.
 */
export function createSourcePackReader(manifest,{
 loadChunk,cryptoProvider=globalThis.crypto,maxCachedSections=2
}={}){
 assertManifest(manifest);
 if(typeof loadChunk!=="function")throw new Error("SOURCE_PACK_LOADER_REQUIRED");
 if(!Number.isSafeInteger(maxCachedSections)||maxCachedSections<1||maxCachedSections>32)
  throw new Error("SOURCE_PACK_CACHE_BOUND_INVALID");
 const cache=new Map(),positions=new Map(),bySection=new Map();
 let previous=null;
 manifest.sections.forEach(section=>{
  bySection.set(section.id,section);
  section.passageIds.forEach(id=>{positions.set(id,{section,index:positions.size});});
 });
 const order=[...positions.keys()];
 async function get(section){
  if(cache.has(section.id)){
   const old=cache.get(section.id);cache.delete(section.id);cache.set(section.id,old);
   return old;
  }
  const raw=await loadChunk(section.file);
  if(typeof raw!=="string"||bytes(raw).length!==section.byteSize||
      await sha256(raw,cryptoProvider)!==section.sha256)
   throw new Error("SOURCE_PACK_CHECKSUM_MISMATCH");
  let chunk;
  try{chunk=JSON.parse(raw)}catch{throw new Error("SOURCE_PACK_INVALID_JSON")}
  await assertChunk(chunk,section,manifest,cryptoProvider);
  cache.set(section.id,chunk);
  if(cache.size>maxCachedSections)cache.delete(cache.keys().next().value);
  return chunk;
 }
 async function open(passageId){
  const target=positions.get(passageId);
  if(!target)throw new Error("SOURCE_PACK_UNKNOWN_PASSAGE");
  const chunk=await get(target.section);
  const at=target.section.passageIds.indexOf(passageId),p=chunk.paragraphs[at];
  previous=passageId;
  return Object.freeze({
   workId:manifest.workId,witnessId:manifest.witnessId,
   revision:manifest.revision,language:manifest.language,
   passageId,sectionId:target.section.id,sectionTitle:target.section.title,
   text:p.text,sourceAnchor:p.sourceAnchor,sourceLine:p.sourceLine,
   ...(manifest.editionIdentity?{
    editionId:manifest.editionIdentity.editionId,
    citationId:p.sourceMeta.citationId,
    sourceLocator:p.sourceMeta.sourceLocator,
    sourcePage:p.sourceMeta.sourcePage,
    sourcePages:p.sourceMeta.sourcePages??null,
    demoOnly:manifest.editionIdentity.demoOnly
   }:{}),
   previousId:order[target.index-1]??null,nextId:order[target.index+1]??null
  });
 }
 async function search(query,{sectionId=null,limit=20}={}){
  const q=String(query??"").trim().toLocaleLowerCase();
  if(q.length<2||q.length>120||!Number.isSafeInteger(limit)||limit<1||limit>100)
   throw new Error("SOURCE_PACK_SEARCH_QUERY_INVALID");
  if(sectionId&&!bySection.has(sectionId))throw new Error("SOURCE_PACK_UNKNOWN_SECTION");
  const found=[];
  for(const section of sectionId?[bySection.get(sectionId)]:manifest.sections){
   const chunk=await get(section);
   for(const p of chunk.paragraphs){
    if(p.text.toLocaleLowerCase().includes(q)){
     found.push(Object.freeze({id:p.id,sectionId:section.id,title:section.title,
      preview:p.text.slice(0,180)}));
     if(found.length===limit)return Object.freeze(found);
    }
   }
  }
  return Object.freeze(found);
 }
 function searchMetadata(query,{limit=20}={}){
  const q=String(query??"").trim().toLocaleLowerCase();
  if(q.length<2||q.length>120||!Number.isSafeInteger(limit)||limit<1||limit>100)
   throw new Error("SOURCE_PACK_SEARCH_QUERY_INVALID");
  const found=[];
  for(const section of manifest.sections){
   for(let i=0;i<section.passageIds.length;i++){
    const meta=section.passageMeta?.[i]??null;
    if([section.title,section.sourceAnchor,section.id,section.passageIds[i],
       meta?.sourceAnchor,meta?.sourceLocator,meta?.citationId].filter(Boolean)
       .some(v=>v.toLocaleLowerCase().includes(q))){
     found.push(Object.freeze({id:section.passageIds[i],sectionId:section.id,
      title:section.title,sourceLocator:meta?.sourceLocator??null,
      citationId:meta?.citationId??null}));
     if(found.length===limit)return Object.freeze(found);
    }
   }
  }
  return Object.freeze(found);
 }
 return Object.freeze({
  manifest,open,search,searchMetadata,
  sections:()=>Object.freeze(manifest.sections.map(s=>Object.freeze({
   id:s.id,title:s.title,passageId:s.passageIds[0],count:s.passageIds.length
  }))),
  previous:()=>previous,
  cachedSections:()=>cache.size
 });
}
