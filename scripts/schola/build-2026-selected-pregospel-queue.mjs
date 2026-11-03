// Source-first, zero-network review of actual 2026 selected Gradual,
// Alleluia and Tract text using cached, authenticated pinned Latin witnesses.
// This is an editorial artifact, not an adjustment to LIVE or Schola.
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {resolve,join} from "node:path";
import {fileURLToPath} from "node:url";
import {gitBlobSha1} from "./pinned-1962-source-library.mjs";
import {index1961GradualeGabc}
 from "../../src/mass/reader-proper-gabc-bulk-join.js";
import {buildSelected2026PreGospelSourceReview}
 from "../../src/mass/reader-schola-selected-pregospel-review.js";

const root=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const load=async p=>JSON.parse(await readFile(join(root,p),"utf8"));
const full=await load("data/research/mass-music-1962-pinned-full-source-universe.v1.json");
if(full.fullLatinSourceTreeCount!==1049||
 full.sourceRef!=="ad8783641455bae38a8eb5782b34241a7b3ff2ef"||
 full.sourceFiles?.length!==1049)throw Error("PINNED_1049_MANIFEST_MISSING");
const byPath=new Map(full.sourceFiles.map(x=>[x.path,x]));
const archive=index1961GradualeGabc(await Promise.all(Array.from({length:6},(_,i)=>
 load("data/mass/chant-corpus/gr1961-proper-"+
 String(i+1).padStart(3,"0")+".json"))));
const report=await load(".tmp/schola-1962-selected-annual/2026-selected-gabc-coverage.json");
const cached=new Map();
const base=join(root,".cache","schola-pinned-1962",full.sourceRef);
async function readPinned(path){
 if(!/^(Tempora|Sancti|Commune)\/[A-Za-z0-9_-]+$/.test(path))return null;
 const entry=byPath.get(path);if(!entry)return null;
 if(!cached.has(path))cached.set(path,(async()=>{
  const data=await readFile(join(base,entry.sha+".txt"));
  if(data.length!==entry.size||gitBlobSha1(data)!==entry.sha)
   throw Error("PINNED_PREGOSPEL_BLOB_SHA_OR_SIZE_DRIFT:"+path);
  return {text:data.toString("utf8"),sha:entry.sha,path};
 })());
 return cached.get(path);
}
const result=await buildSelected2026PreGospelSourceReview({
 annualReport:report,archive,fetchSource:readPinned});
const output=join(root,".tmp","schola-1962-selected-annual");
await mkdir(output,{recursive:true});
await writeFile(join(output,"2026-selected-pregospel-source-queue.json"),
 JSON.stringify(result,null,2)+"\n");
await writeFile(join(output,"2026-selected-pregospel-source-summary.json"),
 JSON.stringify({schema:result.schema,counters:result.counters,
  publication:result.publication,sourceCacheReadCount:cached.size,
  scoreReviewLeadCount:result.scoreReviewLeads.length},null,2)+"\n");
console.log("SELECTED_2026_PREGOSPEL_SOURCE_SUMMARY "+
 JSON.stringify({...result.counters,authenticatedSourcesRead:cached.size}));
if(result.counters.daysChecked!==365||result.publication.publicScores!==0)
 throw Error("PREGOSPEL_RESEARCH_SCOPE_DRIFT");
