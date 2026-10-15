import {sourceCanDisplay} from "./text-parser.js";

const ID=/^[a-z0-9][a-z0-9._-]{1,100}$/i;
const PASSAGE=/^[a-z0-9._-]+:s[0-9]{3}(?::p[0-9]{3})?$/i;
const HASH=/^[a-f0-9]{64}$/;
const FILE=/^section-[0-9]{3,}\.json$/;
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
 const ids=new Set(),files=new Set();
 for(const s of manifest.sections){
  if(!PASSAGE.test(s.id)||!s.id.startsWith(manifest.witnessId+":")||
     !FILE.test(s.file)||!HASH.test(s.sha256)||files.has(s.file)||ids.has(s.id)||
     !Number.isSafeInteger(s.byteSize)||s.byteSize<1||
     !Array.isArray(s.passageIds)||!s.passageIds.length||
     new Set(s.passageIds).size!==s.passageIds.length||
     !s.passageIds.every(id=>PASSAGE.test(id)&&id.startsWith(s.id+":p")&&!ids.has(id)))
   throw new Error("SOURCE_PACK_SECTION_INVALID");
  files.add(s.file);ids.add(s.id);
  for(const id of s.passageIds)ids.add(id);
 }
 return manifest;
}
function assertChunk(chunk,section,manifest){
 if(chunk?.schema!=="ao.source-pack-section.v1"||
    chunk.workId!==manifest.workId||chunk.witnessId!==manifest.witnessId||
    chunk.revision!==manifest.revision||chunk.language!==manifest.language||
    chunk.section?.id!==section.id||chunk.section?.title!==section.title||
    !Array.isArray(chunk.paragraphs)||chunk.paragraphs.length!==section.passageIds.length)
  throw new Error("SOURCE_PACK_CONTENT_IDENTITY_MISMATCH");
 for(let i=0;i<chunk.paragraphs.length;i++){
  const p=chunk.paragraphs[i];
  if(p?.id!==section.passageIds[i]||typeof p.text!=="string"||!p.text.trim()||
      p.unresolved===true||p.text.includes("\u0000"))
   throw new Error("SOURCE_PACK_CONTENT_INVALID");
 }
 return chunk;
}

/**
 * Build self-contained, SHA-256 verified per-section JSON chunks from a
 * rights-approved parser output. No PDF/HTML acquisition or publication.
 * The caller decides where / whether to store the returned bytes.
 */
export async function compileSourcePassagePacks(document,{cryptoProvider=globalThis.crypto}={}){
 if(document?.schema!=="ao.pinned-source-paragraphs.v1"||
    !ID.test(document.workId??"")||!ID.test(document.witnessId??"")||
    !ID.test(document.revision??""))throw new Error("SOURCE_PACK_DOCUMENT_INVALID");
 assertAccess(document);
 const chunks=[],sections=[];
 for(let i=0;i<document.sections.length;i++){
  const section=document.sections[i];
  if(!sourceCanDisplay(document,section.id))
   throw new Error("SOURCE_PACK_UNVERIFIED_SECTION");
  const content={
   schema:"ao.source-pack-section.v1",workId:document.workId,
   witnessId:document.witnessId,revision:document.revision,language:document.language,
   section:{id:section.id,title:section.title,sourceAnchor:section.sourceAnchor??null},
   paragraphs:section.paragraphs.map(p=>({
    id:p.id,text:p.text,unresolved:p.unresolved,
    sourceLine:p.sourceLine??null,sourceAnchor:p.sourceAnchor??null
   }))
  };
  const raw=JSON.stringify(content),file="section-"+String(i+1).padStart(3,"0")+".json";
  chunks.push(Object.freeze({file,raw}));
  sections.push(Object.freeze({
   id:section.id,title:section.title,sourceAnchor:section.sourceAnchor??null,
   file,byteSize:bytes(raw).length,sha256:await sha256(raw,cryptoProvider),
   passageIds:Object.freeze(section.paragraphs.map(p=>p.id))
  }));
 }
 const manifest=assertManifest(Object.freeze({
  schema:"ao.source-pack-manifest.v1",workId:document.workId,
  witnessId:document.witnessId,revision:document.revision,
  language:document.language,format:document.format,
  rights:document.rights,status:document.status,
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
  assertChunk(chunk,section,manifest);
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
 return Object.freeze({
  manifest,open,search,
  sections:()=>Object.freeze(manifest.sections.map(s=>Object.freeze({
   id:s.id,title:s.title,passageId:s.passageIds[0],count:s.passageIds.length
  }))),
  previous:()=>previous,
  cachedSections:()=>cache.size
 });
}
