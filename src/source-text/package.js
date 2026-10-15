import {SOURCE_TEXT_SCHEMA,SOURCE_TEXT_MANIFEST_SCHEMA,validateSourceWork} from "./contracts.js";
export function packageSourceDocument(document,{chunkSize=5}={}){
 if(document?.schema!==SOURCE_TEXT_SCHEMA||!Array.isArray(document.passages))
  throw new Error("SOURCE_TEXT_DOCUMENT_INVALID");
 const work=validateSourceWork(document.work,{requireReproduction:true});
 if(!Number.isInteger(chunkSize)||chunkSize<1||chunkSize>100)
  throw new Error("SOURCE_TEXT_CHUNK_SIZE_INVALID");
 const chunks={},files=[],index=[];
 for(let i=0;i<document.passages.length;i+=chunkSize){
  const slice=document.passages.slice(i,i+chunkSize),path="chunks/"+String(files.length+1).padStart(4,"0")+".json";
  if(slice.some(p=>p.workId!==work.id||p.editionId!==work.editionId||p.witnessId!==work.witnessId))
   throw new Error("SOURCE_TEXT_MIXED_EDITIONS_FORBIDDEN");
  chunks[path]=JSON.stringify({schema:SOURCE_TEXT_SCHEMA,workId:work.id,passages:slice})+"\n";
  files.push({path,count:slice.length});
  for(const p of slice)index.push({id:p.id,section:p.section,heading:p.heading,
   kind:p.kind,locator:p.locator,chunk:path});
 }
 const manifest={schema:SOURCE_TEXT_MANIFEST_SCHEMA,work,chunkSize,
  passages:index,chunks:files,loadedAtStartup:false,searchPolicy:"metadata-first; explicit full-text only"};
 return {manifest,chunks};
}
