import { normalizeScrollmapperSource } from "./normalize-scrollmapper.mjs";
#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const PIN="e1b254cef86d0e65b1a5d1a94b8b112d0f296a2c";
const SOURCES=[
 {id:"dr-challoner",tag:"DRC",path:"sources/en/DRC/DRC.json",
   sha1:"3cc9190cb18ef900585b47cb9a00bca8171394b8"},
 {id:"crampon-1923",tag:"FreCrampon",path:"sources/fr/FreCrampon/FreCrampon.json",
   sha1:"d00e7f91c6f20c9e5c6a970deb655bf041dcfdbd"}
];
const out="artifacts/scripture-candidates";
await mkdir(out,{recursive:true});
function shape(value) {
 if(Array.isArray(value))return {type:"array",count:value.length,first:shape(value[0])};
 if(value&&typeof value==="object")return {
   type:"object",keys:Object.keys(value).slice(0,24),
   samples:Object.fromEntries(Object.entries(value).slice(0,6).map(([k,v])=>[
     k,Array.isArray(v)?{type:"array",count:v.length,
       first:v.length?(typeof v[0]==="object"?Object.keys(v[0]||{}).slice(0,16):typeof v[0]):null}
     :typeof v==="object"&&v?{type:"object",keys:Object.keys(v).slice(0,10)}:typeof v
   ]))
 };
 return {type:typeof value};
}
const report=[];
for(const source of SOURCES) {
 const url="https://raw.githubusercontent.com/scrollmapper/bible_databases/"+PIN+"/"+source.path;
 const response=await fetch(url,{signal:AbortSignal.timeout(120000)});
 if(!response.ok)throw new Error("Source download failed "+source.tag+" HTTP "+response.status);
 const bytes=Buffer.from(await response.arrayBuffer());
 const hash=createHash("sha1").update("blob "+bytes.length+"\0").update(bytes).digest("hex");
 if(hash!==source.sha1)throw new Error("Pinned Git blob SHA mismatch "+source.tag+": "+hash);
 const json=JSON.parse(bytes.toString("utf8"));
 const inspection=shape(json);
 const normalized=normalizeScrollmapperSource(json,source.id);
 const filename=out+"/"+source.tag+".json";
 await writeFile(filename,bytes);
 await writeFile(out+"/"+source.tag+"-canonical-candidate.json",JSON.stringify({
   editionId:source.id,provenance:{rightsReview:"pending",versificationReview:"pending",editionReview:"pending",
     sourceUrl:url,sourceEdition:source.tag+" (historical source candidate)",licenceId:"PENDING",reviewer:null,reviewDate:null},
   books:normalized.books
 }));
 report.push({editionId:source.id,path:source.path,url,
   gitCommit:PIN,gitBlobSha:hash,bytes:bytes.length,
   sha256:createHash("sha256").update(bytes).digest("hex"),inspection,
   status:"RESEARCH_ONLY_NOT_CERTIFIED_OR_PUBLISHABLE",
   normalized:{bookCount:normalized.bookCount,chapterCount:normalized.chapterCount,
     verseCount:normalized.verseCount,held:normalized.held}});
 console.log(source.tag+" verified "+bytes.length+" bytes. Shape: "+JSON.stringify(inspection).slice(0,3000));
 console.log(source.tag+" canonical 73-book normalization: "+JSON.stringify({books:normalized.bookCount,chapters:normalized.chapterCount,verses:normalized.verseCount,held:normalized.held}));
 console.log(source.tag+" book names: "+JSON.stringify(json.books?.map(b=>b.name)));
 console.log(source.tag+" chapter shape: "+JSON.stringify(shape(json.books?.[0]?.chapters)).slice(0,2000));
 console.log(source.tag+" verses shape: "+JSON.stringify(shape(json.books?.[0]?.chapters?.[0]?.verses)).slice(0,2000));
}
await writeFile(out+"/source-report.json",JSON.stringify(report,null,2)+"\n");
console.log("Two source snapshots byte-verified; neither is approved for in-app import.");
