/**
 * Bulk selected 1962 source-section reconciliation; no GABC acquisition.
 * Uses the annual DayResolver sweep and pinned 1962 Latin Missal source files,
 * retaining SHA1 blob witnesses and strict Gregorian role/provenance holds.
 */
import assert from "node:assert/strict";
import {execFileSync} from "node:child_process";
import {createHash} from "node:crypto";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {index1961GradualeGabc} from "../../src/mass/reader-proper-gabc-bulk-join.js";
import {analyzeSelectedPreGospelSource} from "../../src/mass/reader-schola-pre-gospel-source-boundary.js";

const root=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const load=async rel=>JSON.parse(await readFile(resolve(root,rel),"utf8"));
const sha1Blob=text=>createHash("sha1").update("blob "+Buffer.byteLength(text)+"\0"+text).digest("hex");
const PIN="ad8783641455bae38a8eb5782b34241a7b3ff2ef";
const base="https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/"+PIN+
 "/web/www/missa/Latin/";
const archive=index1961GradualeGabc(await Promise.all(Array.from({length:6},(_,i)=>
 load("data/mass/chant-corpus/gr1961-proper-"+String(i+1).padStart(3,"0")+".json"))));
assert.equal(archive.count,1195);
const args=["tools/mass/reader-schola-selected-calendar-audit.mjs",...process.argv.slice(2)];
const result=execFileSync(process.execPath,args,{cwd:root,encoding:"utf8",
 maxBuffer:5*1024*1024,timeout:22*60*1000});
console.log(result.split("\n").filter(s=>s.startsWith("SCHOLA_CALENDAR_SUMMARY=")).join("\n"));
const rangeArgs=process.argv.slice(2);
const from=rangeArgs.find(x=>x.startsWith("--from="))?.slice(7)??"2026-01-01";
const to=rangeArgs.find(x=>x.startsWith("--to="))?.slice(5)??"2026-12-31";
const original=await load("artifacts/mass/schola-1962-selected-calendar-"+from+"_"+to+".json");
assert.equal(original.scoreArchiveCount,1195);
const prior=await load("data/research/mass-music-1962-source-roster-91.v1.json");
const expected=new Map(prior.sourceFiles.map(x=>[x.path,x.sha]));
const cache=new Map();
const fetchSource=async path=>{
 if(!/^(Tempora|Sancti|Commune)\/[A-Za-z0-9_-]+$/.test(path))return null;
 if(cache.has(path))return cache.get(path);
 const promise=(async()=>{
  const url=base+path+".txt";
  try{
   const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
   if(!response.ok)return {path,error:"HTTP_"+response.status};
   const text=await response.text();
   if(text.length<30||!text.includes("["))return {path,error:"INVALID_PINNED_SOURCE_TEXT"};
   const sha=sha1Blob(text);
   if(expected.has(path)&&expected.get(path)!==sha)
    return {path,error:"HISTORICAL_91_SOURCE_BLOB_SHA_DRIFT",expectedSha:expected.get(path),actualSha:sha};
   return {text,sha,path,originalRepo:"DivinumOfficium/divinum-officium",pin:PIN};
  }catch(error){return {path,error:String(error?.message??error)};}
 })();
 cache.set(path,promise);
 return promise;
};
const done=[],tasks=original.rows.filter(x=>x.status==="MATCHED_CANDIDATES");
let index=0;
const worker=async()=>{
 while(index<tasks.length){
  const item=tasks[index++];
  try{
   const evidence=await analyzeSelectedPreGospelSource({
    sourcePath:item.sourcePath,selectedLatin:item.selectedGradualLatin,
    selectedSequenceLatin:item.selectedSequenceLatin??"",fetchSource,archive});
   done.push({date:item.date,sourcePath:item.sourcePath,
    priorChantRoleHolds:item.tracks.filter(t=>t.status==="CHANT_ROLE_UNVERIFIED").length,
    status:evidence.status,pieces:evidence.pieces,holds:evidence.holds,
    sourceRevisions:item.sourceRevisions??null});
  }catch(error){
   done.push({date:item.date,sourcePath:item.sourcePath,status:"RESEARCH_EXCEPTION",
    priorChantRoleHolds:item.tracks.filter(t=>t.status==="CHANT_ROLE_UNVERIFIED").length,
    pieces:[],holds:[{code:String(error?.message??error)}]});
  }
 }
};
await Promise.all(Array.from({length:8},worker));
done.sort((a,b)=>a.date.localeCompare(b.date));
const counts={},parts={};
let newlyClassified=0,unique=0,ambiguous=0;
const candidateIds=new Set(),seenSourcePairs=new Set();
for(const row of done){
 counts[row.status]=(counts[row.status]??0)+1;
 if(row.pieces.length)newlyClassified++;
 for(const part of row.pieces){
  parts[part.status]=(parts[part.status]??0)+1;
  if(part.status==="UNIQUE_SOURCE_TEXT_CANDIDATE")unique++;
  if(part.status==="AMBIGUOUS_SOURCE_TEXT_VARIANTS")ambiguous++;
  for(const id of part.candidateScoreIds??[])candidateIds.add(id);
  seenSourcePairs.add(row.sourcePath+"|"+part.role+"|"+part.opening);
 }
}
const oldRoleHolds=original.rows.flatMap(r=>r.tracks??[])
 .filter(t=>t.status==="CHANT_ROLE_UNVERIFIED").length;
const fetchHolds=(await Promise.all([...cache.values()])).filter(x=>!x?.text)
 .map(x=>({path:x?.path??null,error:x?.error??"SOURCE_UNAVAILABLE"}));
const out={
 schema:"ao-schola-pregospel-2026-selected-1962-pinned-bulk-v1",
 scope:{from,to,calendarDays:original.scope.daysChecked,
  readyMassDays:tasks.length,unreadyMassDays:original.scope.daysChecked-tasks.length,
  previousUnverifiedPreGospelTracks:oldRoleHolds},
 authority:{originalMissalCommit:PIN,scoreCorpus:1195,
  actualMassSelection:"AO_RUNTIME_V8_DAY_RESOLVER",
  sourceOwnerValidation:"LATIN_IN_SELECTED_FORMULARY_PLUS_PINNED_SOURCE_SECTIONS",
  crossEditionMusicalApproval:false},
 results:{classifiedDays:newlyClassified,sourceFilesFetched:cache.size,
  returnedSourceErrors:fetchHolds.length,
  distinctRoleTextTuples:seenSourcePairs.size,distinctScoreIds:candidateIds.size,
  uniqueCandidateOccurrences:unique,ambiguousCandidateOccurrences:ambiguous,
  byDayStatus:counts,byPartStatus:parts},
 missingSourceFiles:fetchHolds,publication:{
  approvedDigitalScores:0,editoriallyVerifiedNotation:0,publicReaderScores:0,
  approvedAudio:0,readerOrCalendarModified:false},
 records:done
};
const dir=resolve(root,"artifacts/mass");await mkdir(dir,{recursive:true});
const file="schola-1962-pregospel-pinned-source-"+from+"_"+to+".json";
await writeFile(resolve(dir,file),JSON.stringify(out,null,2)+"\n");
assert.equal(done.length,tasks.length);
assert.equal(out.publication.approvedDigitalScores,0);
console.log("SCHOLA_PREGOSPEL_BULK_SUMMARY="+JSON.stringify({
 scope:out.scope,results:out.results,missingSourceFiles:out.missingSourceFiles.slice(0,20),
 artifact:"artifacts/mass/"+file}));
