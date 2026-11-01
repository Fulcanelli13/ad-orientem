/**
 * Source-first annual 1962 Calendar score audit. No scraping or publication.
 * node tools/mass/reader-schola-selected-calendar-audit.mjs
 * node tools/mass/reader-schola-selected-calendar-audit.mjs --from=2024-01-01 --to=2029-12-31
 */
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {summarizeSelectedCalendarChants} from "../../src/mass/reader-schola-selected-calendar-audit.js";

const root=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const options=Object.fromEntries(process.argv.slice(2).map(arg=>{
 const m=/^--(from|to)=(\d{4}-\d\d-\d\d)$/.exec(arg);
 if(!m)throw Error("Expected --from=YYYY-MM-DD or --to=YYYY-MM-DD");
 return [m[1],m[2]];
}));
const from=options.from??"2026-01-01",to=options.to??"2026-12-31";
const start=Date.parse(from+"T12:00:00Z"),end=Date.parse(to+"T12:00:00Z");
if(!Number.isFinite(start)||!Number.isFinite(end)||start>end||
 new Date(start).toISOString().slice(0,10)!==from||
 new Date(end).toISOString().slice(0,10)!==to||end-start>86400000*2500)
 throw Error("Invalid bounded calendar scan range");
const dates=[];
for(let n=start;n<=end;n+=86400000)dates.push(new Date(n).toISOString().slice(0,10));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".json":"application/json",".css":"text/css; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".svg":"image/svg+xml",
 ".woff2":"font/woff2",".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden");}
  const content=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]??"application/octet-stream",
   "cache-control":"no-store"});res.end(content);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e));}
});
await new Promise((yes,no)=>{server.once("error",no);server.listen(0,"127.0.0.1",yes);});
let browser;const rows=[];
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:"block"});
 page.setDefaultTimeout(90000);
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
   {waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",
   null,{timeout:90000});
 const archiveCount=await page.evaluate(async()=>{
   const {index1961GradualeGabc}=await import("/src/mass/reader-proper-gabc-bulk-join.js");
   const sources=await Promise.all(Array.from({length:6},(_,i)=>
     fetch("/data/mass/chant-corpus/gr1961-proper-"+String(i+1).padStart(3,"0")+".json")
       .then(r=>{if(!r.ok)throw Error("GABC archive unavailable: "+r.status);return r.json()})));
   globalThis.__AO_SCHOLA_CALENDAR_AUDIT_INDEX=index1961GradualeGabc(sources);
   return globalThis.__AO_SCHOLA_CALENDAR_AUDIT_INDEX.count;
 });
 assert.equal(archiveCount,1195);
 for(let offset=0;offset<dates.length;offset+=16){
   const batch=await page.evaluate(async selectedDates=>{
     const {properToReaderSlots}=await import("/src/mass/proper-reader-slots.js");
     const {matchSelected1962ProperToGraduale}=await import("/src/mass/reader-proper-gabc-bulk-join.js");
     const resolver=globalThis.AO_RUNTIME_V8.resolver;
     const archive=globalThis.__AO_SCHOLA_CALENDAR_AUDIT_INDEX;
     const digest=async value=>{
       if(!value)return null;
       const bytes=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value));
       return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,"0")).join("");
     };
     return Promise.all(selectedDates.map(async date=>{
       try{
         const resolved=await resolver.resolveDay(date);
         if(resolved?.status!=="ready"||
             String(resolved?.proper?.status??"").toLowerCase()!=="ready"||
             !resolved?.proper?.data||!resolved?.day?.main)
           return {date,status:"DAY_RESOLVER_HOLD",reason:resolved?.status??"NOT_READY"};
         const proper=resolved.proper.data;
         const sourcePath=String(proper.sourcePath??resolved.proper.sourcePath??"");
         const principalId=String(resolved.day.main.id??"");
         if(!/^(Tempora|Sancti|Commune)\/[A-Za-z0-9_-]+$/.test(sourcePath))
           return {date,status:"PROPER_SOURCE_HOLD",principalId,sourcePath,
             reason:"MISSING_OR_INVALID_SELECTED_SOURCE_PATH"};
         const mapped=properToReaderSlots(proper,{language:"en"});
         if(!mapped.ready)return {date,status:"READER_PROPER_HOLD",principalId,sourcePath,
           missing:mapped.missing,reason:"COMPLETE_1962_PROPER_NOT_READY"};
         const result=matchSelected1962ProperToGraduale({properSlots:mapped,archive});
         if(result.status!=="SOURCE_FIRST_CANDIDATES_ONLY_NOT_SCORES")
           return {date,status:"GABC_MATCHER_HOLD",principalId,sourcePath,reason:result.status};
         const tracks=await Promise.all(result.tracks.map(async track=>{
           const paragraphs=mapped.slots[track.track]?.data?.paragraphs??[];
           const latin=paragraphs.map(row=>String(row.latin??"")).join("\n");
           return {track:track.track,part:track.part,status:track.status,
             sourceLatinSha256:await digest(latin),
             sourceLatinOpening:latin.replace(/\s+/g," ").trim().slice(0,160),
             candidateScoreIds:(track.scoreCandidates??[]).map(score=>score.scoreId),
             candidateHashes:(track.scoreCandidates??[]).map(score=>score.sourceGabcSha256),
             allSameRoleMatches:track.allSameRoleMatches??0};
         }));
         return {date,status:"MATCHED_CANDIDATES",principalId,sourcePath,tracks};
       }catch(e){return {date,status:"GABC_MATCHER_HOLD",
         reason:String(e?.message??e).slice(0,180)};}
     }));
   },dates.slice(offset,offset+16));
   rows.push(...batch);
   if(rows.length%160===0||rows.length===dates.length)
     console.log("SCHOLA_CALENDAR_PROGRESS="+JSON.stringify({
       checked:rows.length,range:[from,to],ready:rows.filter(x=>x.status==="MATCHED_CANDIDATES").length,
       holds:rows.filter(x=>x.status!=="MATCHED_CANDIDATES").length}));
 }
}finally{
 await browser?.close();await new Promise(done=>server.close(done));
}
const summary=summarizeSelectedCalendarChants({dates,rows});
assert.ok(summary.totalReadyDays>0,"NO_SELECTED_1962_PROPER_MATCHED: review date-source holds");
const prior=JSON.parse(await readFile(resolve(root,
 "data/research/mass-music-1962-source-roster-91.v1.json"),"utf8"));
assert.equal(prior.sourceCount,91);
const priorPaths=new Set(prior.sourceFiles.map(row=>row.path));
const selectedPaths=[...new Set(rows.map(row=>row.sourcePath)
 .filter(path=>/^(Tempora|Sancti|Commune)\/[A-Za-z0-9_-]+$/.test(path)))].sort();
const outsidePrior=selectedPaths.filter(path=>!priorPaths.has(path));
const alreadyKnown=selectedPaths.filter(path=>priorPaths.has(path));
const selectionCrosswalk={priorAuthenticatedSourceFiles:91,
 actualSelectedSourcePathCount:selectedPaths.length,
 selectedPathsAmongPrior91:alreadyKnown.length,
 selectedPathsOutsidePrior91:outsidePrior.length,
 selectedNewPaths:outsidePrior,selectedExistingPaths:alreadyKnown,
 sourcePathProofOnlyNotMusicalApproval:true};
const out={...summary,selectionCrosswalk,selectionMethod:
 "Actual default 1962 DayResolver properToReaderSlots + existing 1195-score source-first role matcher; no feast-title inference, re-scrape, alternate Mass or publication",
 rows};
const directory=resolve(root,"artifacts/mass");
await mkdir(directory,{recursive:true});
const name="schola-1962-selected-calendar-"+from+"_"+to+".json";
await writeFile(resolve(directory,name),JSON.stringify(out,null,2)+"\n");
assert.equal(rows.length,dates.length);
console.log("SCHOLA_CALENDAR_SUMMARY="+JSON.stringify({
 scope:out.scope,daysReady:out.totalReadyDays,dayStatuses:out.dayStatuses,
 distinctSourcePaths:out.uniqueActualSourcePaths,
 distinctSourceTextSignatures:out.distinctActualSourceTextSignatures,
 chantEntries:out.matchedChantEntries,candidateStatuses:out.candidateStatuses,
 output:"artifacts/mass/"+name,publication:out.publication}));
