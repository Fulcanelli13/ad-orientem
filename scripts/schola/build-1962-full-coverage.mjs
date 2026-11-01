// Source-first, one-run bulk audit for the entire pinned 1962 Latin Missal tree.
// Output is research-only: NEVER selects the local Mass or publishes musical scores.
// Usage: node scripts/schola/build-1962-full-coverage.mjs [--limit=10]
// Full invocation fetches each immutable Git blob only once and reuses SHA-keyed cache.
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {join,resolve} from "node:path";
import {index1961GradualeGabc} from "../../src/mass/reader-proper-gabc-bulk-join.js";
import {sweepPinned1962MassSourceFiles} from "../../src/mass/reader-mass-1962-gabc-coverage-sweep.js";
import {gitBlobSha1,validatePinnedLatinFile,validatePinnedSourceInventory}
 from "./pinned-1962-source-library.mjs";

const root=resolve(import.meta.dirname,"../..");
const readJson=async path=>JSON.parse(await readFile(join(root,path),"utf8"));
const inventory=await readJson("data/research/mass-music-1962-pinned-full-source-universe.v1.json");
const witness=await readJson("data/research/mass-music-1962-source-roster-91.v1.json");
validatePinnedSourceInventory(inventory,witness);
const arg=process.argv.find(x=>/^--limit=\d+$/.test(x));
const limit=arg?Number(arg.split("=")[1]):inventory.sourceFiles.length;
if(!Number.isSafeInteger(limit)||limit<1||limit>inventory.sourceFiles.length)
 throw new Error("INVALID_AUDIT_LIMIT");
const entries=inventory.sourceFiles.slice(0,limit);
const cache=join(root,".cache","schola-pinned-1962",inventory.sourceRef);
const output=join(root,".tmp","schola-1962-coverage");
await mkdir(cache,{recursive:true});await mkdir(output,{recursive:true});
const shaMatch=(entry,bytes)=>bytes.length===entry.size&&gitBlobSha1(bytes)===entry.sha;
async function obtain(entry){
 const file=join(cache,entry.sha+".txt");
 try{
  const prior=await readFile(file);
  if(shaMatch(entry,prior))return {bytes:prior,cached:true};
 }catch{}
 const url="https://raw.githubusercontent.com/"+inventory.sourceRepository+"/"+
  inventory.sourceRef+"/"+inventory.sourceRoot+"/"+entry.path+".txt";
 let reason="UNKNOWN";
 for(let attempt=1;attempt<=4;attempt++){
  try{
   const response=await fetch(url,{signal:AbortSignal.timeout(45000),
    headers:{"User-Agent":"AdOrientem-source-first-1962-research"}});
   if(!response.ok)throw new Error("HTTP_"+response.status);
   const bytes=Buffer.from(await response.arrayBuffer());
   if(!shaMatch(entry,bytes))throw new Error("PINNED_GIT_BLOB_MISMATCH");
   await writeFile(file,bytes);
   return {bytes,cached:false};
  }catch(e){
   reason=String(e?.message??e);
   if(attempt<4)await new Promise(done=>setTimeout(done,500*attempt*attempt));
  }
 }
 throw new Error(reason);
}
const sources=Array(entries.length),failed=[];
let cursor=0,completed=0,cacheHits=0;
async function worker(){
 while(true){
  const index=cursor++;if(index>=entries.length)return;
  const entry=entries[index];
  try{
   const {bytes,cached}=await obtain(entry);
   sources[index]=validatePinnedLatinFile({entry,bytes});
   if(cached)cacheHits++;
  }catch(e){
   failed.push({path:entry.path,sha:entry.sha,reason:String(e?.message??e)});
  }
  completed++;
  if(completed%100===0||completed===entries.length)
   console.log("Pinned Latin sources: "+completed+"/"+entries.length+
    " · authenticated "+(completed-failed.length)+" · failed "+failed.length);
 }
}
await Promise.all(Array.from({length:8},()=>worker()));
const verified=sources.filter(Boolean);
const archive=index1961GradualeGabc(await Promise.all(
 Array.from({length:6},(_,i)=>readJson("data/mass/chant-corpus/gr1961-proper-"+
  String(i+1).padStart(3,"0")+".json"))));
const audit=sweepPinned1962MassSourceFiles({sources:verified,archive,baseCount:verified.length});
const holds=verified.flatMap(s=>{
 const issue=s.sourceSectionHolds;
 return [...issue.duplicate.map(section=>({path:s.path,section,type:"DUPLICATE_SECTION"})),
  ...issue.conditional.map(section=>({path:s.path,section,type:"CONDITIONAL_HEADING_NOT_SELECTED"}))];
});
const result={
 schema:"ao-schola-full-pinned-1962-candidate-universe-audit-v1",
 sourceRef:inventory.sourceRef,
 sourceUniverseCount:inventory.fullLatinSourceTreeCount,
 auditedSourceCount:entries.length,
 authenticatedSourceCount:verified.length,
 authenticationFailures:failed.sort((a,b)=>a.path.localeCompare(b.path)),
 sourceSectionExceptions:holds,
 cacheHits,
 coverage:audit,
 scope:"Full pinned Latin source-tree candidate universe, NOT a 1962 date/feast selected formulary manifest",
 permissions:{sourceMatchingOnly:true,editorialApproved:false,
  selected1962MassConfirmed:false,publicNotation:false,audio:false}
};
await writeFile(join(output,"full-source-coverage.json"),JSON.stringify(result,null,2)+"\n");
await writeFile(join(output,"coverage-summary.json"),JSON.stringify({
 sourceRef:result.sourceRef,inventory:result.sourceUniverseCount,
 attempted:entries.length,authenticated:verified.length,failed:failed.length,
 possibleChantRows:audit.sourceFiles.reduce((n,x)=>n+x.tracks.length,0),
 matchStatuses:audit.candidateStatuses,sourceSectionExceptions:holds.length,
 historical91Preserved:true,calendarSelectedMasses:0,approvedDigitalScores:0,
 limits:"Source universe only; must intersect actual resolved 1962 Proper before publication"
},null,2)+"\n");
console.log(JSON.stringify({attempted:entries.length,authenticated:verified.length,
 failed:failed.length,sourceSectionExceptions:holds.length,
 statuses:audit.candidateStatuses},null,2));
if(failed.length)process.exitCode=2;
