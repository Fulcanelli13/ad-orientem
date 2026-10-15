import {SOURCE_TEXT_MANIFEST_SCHEMA,validateSourceWork,assertPassageReproductionScope,validateSourcePageSpan} from "./contracts.js";
const SAFE_CHUNK=/^chunks\/[0-9]{4}\.json$/;
export function createSourceTextReader({manifest,loadChunk}={}){
 if(manifest?.schema!==SOURCE_TEXT_MANIFEST_SCHEMA||
   !Array.isArray(manifest.passages)||!Array.isArray(manifest.chunks)||
   typeof loadChunk!=="function")throw new Error("SOURCE_TEXT_MANIFEST_INVALID");
 validateSourceWork(manifest.work,{requireReproduction:true});
 const files=new Set(manifest.chunks.map(x=>x.path)),ids=new Map(),cache=new Map(),byChunk=new Map(),citations=new Set();
 if(!files.size||manifest.chunks.some(x=>!SAFE_CHUNK.test(x.path))||
    files.size!==manifest.chunks.length)throw new Error("SOURCE_TEXT_CHUNK_PATH_INVALID");
 manifest.passages.forEach((p,i)=>{
  if(!p?.id?.startsWith(manifest.work.id+"/")||ids.has(p.id)||!files.has(p.chunk))
   throw new Error("SOURCE_TEXT_INDEX_INVALID");
  if(p.editionQualifiedCitation!==undefined){
   if(typeof p.editionQualifiedCitation!=="string"||!p.editionQualifiedCitation.trim()||
      citations.has(p.editionQualifiedCitation))throw new Error("SOURCE_TEXT_CITATION_DUPLICATE_OR_INVALID");
   citations.add(p.editionQualifiedCitation);
  }
  ids.set(p.id,{...p,index:i});
  if(!byChunk.has(p.chunk))byChunk.set(p.chunk,[]);
  byChunk.get(p.chunk).push(p.id);
 });
 for(const file of manifest.chunks){
  if(!Number.isInteger(file.count)||file.count!==byChunk.get(file.path)?.length)
   throw new Error("SOURCE_TEXT_CHUNK_COUNT_INVALID");
 }
 async function chunkFor(path){
  if(!cache.has(path))cache.set(path,Promise.resolve().then(()=>loadChunk(path))
   .then(data=>{
    const parsed=typeof data==="string"?JSON.parse(data):data;
    if(parsed?.schema!=="AO_SOURCE_TEXT_V1"||parsed.workId!==manifest.work.id||
      !Array.isArray(parsed.passages))throw new Error("SOURCE_TEXT_CHUNK_INVALID");
    const expected=byChunk.get(path)??[];
    if(parsed.passages.length!==expected.length)
     throw new Error("SOURCE_TEXT_CHUNK_COUNT_MISMATCH");
    for(let i=0;i<parsed.passages.length;i++){
     const p=parsed.passages[i];
     const expectedIndex=ids.get(expected[i]);
     validateSourcePageSpan(p);
     if(expectedIndex.sourcePages!==undefined){
      validateSourcePageSpan(expectedIndex);
      if(JSON.stringify(p.sourcePages)!==JSON.stringify(expectedIndex.sourcePages))
       throw new Error("SOURCE_SCAN_PAGE_SPAN_IDENTITY_MISMATCH");
     }
     if(p?.id!==expected[i]||p.workId!==manifest.work.id||
       p.editionId!==manifest.work.editionId||p.witnessId!==manifest.work.witnessId||
       typeof p.text!=="string"||
       ["sourceLocator","editionQualifiedCitation","sourcePage"].some(field=>
        expectedIndex[field]!==undefined&&p[field]!==expectedIndex[field]))
      throw new Error("SOURCE_TEXT_CHUNK_IDENTITY_MISMATCH");
    }
    assertPassageReproductionScope(manifest.work,parsed.passages);
    return new Map(parsed.passages.map(p=>[p.id,p]));
   }).catch(error=>{cache.delete(path);throw error;}));
  return cache.get(path);
 }
 async function open(id){
  const hit=ids.get(id);if(!hit)throw new Error("SOURCE_TEXT_PASSAGE_NOT_FOUND");
  const passage=(await chunkFor(hit.chunk)).get(id);
  if(!passage)throw new Error("SOURCE_TEXT_PASSAGE_MISSING_FROM_CHUNK");
  return Object.freeze({passage,previous:manifest.passages[hit.index-1]?.id??null,
   next:manifest.passages[hit.index+1]?.id??null});
 }
 function searchMetadata(query,{limit=30}={}){
  const q=String(query??"").trim().toLocaleLowerCase();
  if(!q)return [];
  return manifest.passages.filter(p=>(p.heading+" "+p.section+" "+p.locator+" "+(p.sourceLocator??"")+" "+(p.editionQualifiedCitation??"")).toLocaleLowerCase().includes(q))
   .slice(0,Math.max(1,Math.min(100,limit)));
 }
 async function searchFullText(query,{limit=30}={}){
  const q=String(query??"").trim().toLocaleLowerCase();
  if(!q)return [];
  const results=[];
  for(const file of manifest.chunks){
   const chunk=await chunkFor(file.path);
   for(const passage of chunk.values()){
    if(passage.text.toLocaleLowerCase().includes(q))results.push(passage);
    if(results.length>=Math.max(1,Math.min(100,limit)))return results;
   }
  }
  return results;
 }
 return Object.freeze({open,searchMetadata,searchFullText,
  firstId:manifest.passages[0]?.id??null,loadedChunks:()=>cache.size,
  work:manifest.work});
}
