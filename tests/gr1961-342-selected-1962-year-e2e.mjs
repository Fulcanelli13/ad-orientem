// Full 2026 production DayResolver sweep, research-only; no publication or score mutation.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",
 ".svg":"image/svg+xml",".png":"image/png",".woff2":"font/woff2",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,"http://127.0.0.1");
  const file=resolve(root,"."+decodeURIComponent(url.pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden");}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":types[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e.message));}
});
const dates=[];
for(let at=Date.UTC(2026,0,1);at<Date.UTC(2027,0,1);at+=86400000)
 dates.push(new Date(at).toISOString().slice(0,10));
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok);});
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:"block"});
 page.setDefaultTimeout(90000);
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
  {waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",null,{timeout:90000});
 const init=await page.evaluate(async()=>{
  const response=await fetch("/data/mass/chant-corpus/gr1961-342-source-slot-triage.v1.json");
  if(!response.ok)throw Error("342 immutable ledger not accessible");
  const ledger=await response.json();
  if(ledger.schema!=="ao-gr1961-342-source-slot-triage-v1"||ledger.records.length!==342)throw Error("Research ledger identity drift");
  globalThis.__gr1961ResearchLedger=ledger;
  globalThis.__gr1961ResearchVerifier=await import("/tools/mass/reconcile-gr1961-342-selected-proper.mjs");
  globalThis.__gr1961PreGospelProofCache=new Map();
  return {candidateCount:ledger.records.length,sourceCount:ledger.summary.sourcePaths};
 });
 assert.deepEqual(init,{candidateCount:342,sourceCount:91});
 const rows=[];
 for(let start=0;start<dates.length;start+=10){
  const batch=dates.slice(start,start+10);
  const results=await page.evaluate(async dates=>{
   const resolver=globalThis.AO_RUNTIME_V8.resolver;
   const {reconcile342WithSelectedMass,recoverSelectedPreGospelFor342}=globalThis.__gr1961ResearchVerifier;
   const ledger=globalThis.__gr1961ResearchLedger;
   const cache=globalThis.__gr1961PreGospelProofCache;
   return Promise.all(dates.map(async date=>{
    try{
     const resolved=await resolver.resolveDay(date);
     const original=reconcile342WithSelectedMass(ledger,resolved,{date});
     const recovered=await recoverSelectedPreGospelFor342(ledger,resolved,{
       hostResolver:resolver.properResolver,cache});
     const row=reconcile342WithSelectedMass(ledger,recovered.actual,{date});
     return {...row,
       baselineSegmentHolds:original.unresolved.filter(r=>r.status==="SEGMENT_UNVERIFIED").length,
       preGospelRecovery:{status:recovered.status,sourcePath:recovered.sourcePath,
         cacheHit:recovered.cacheHit,certified:recovered.certified}};
    }catch(e){
     return {date,status:"RESOLVER_EXCEPTION",reason:String(e?.message??e),matched:[],unresolved:[],musicalApprovals:0,readerPromotions:0};
    }
   }));
  },batch);
  assert.equal(results.length,batch.length);
  rows.push(...results);
 }
 const compact=await page.evaluate(rows=>{
  const {summarize342SelectedMassSweep}=globalThis.__gr1961ResearchVerifier;
  const value=summarize342SelectedMassSweep(globalThis.__gr1961ResearchLedger,rows,{year:2026});
  return {...value};
 },rows);
 assert.equal(compact.daysChecked,365,"Every 2026 calendar day must be inspected");
 assert.equal(compact.musicalFacsimileApprovals,0);
 assert.equal(compact.editorialPromotions,0);
 assert.ok(compact.daysSourceReady>0,"Real 1962 DayResolver never yielded a source-ready day");
 assert.equal(compact.observations.length,compact.sourceMatchOccurrences);
 assert.equal(compact.candidateDatePairsInspected,
  compact.unresolvedCandidateDatePairs+compact.sourceMatchOccurrences,
  "Every source-qualified candidate-date pair must receive a counted disposition");
 const datesWithMatches=new Set(compact.observations.map(r=>r.date));
 const baselineSegmentHolds=rows.reduce((n,r)=>n+(r.baselineSegmentHolds??0),0);
 const postRecoverySegmentHolds=compact.unverifiedByStatus?.SEGMENT_UNVERIFIED??0;
 assert.ok(postRecoverySegmentHolds<=baselineSegmentHolds,
  "Certified source proof must not create additional unresolved pre-Gospel cases");
 const recoveryRows=rows.filter(r=>r.preGospelRecovery?.status&&r.preGospelRecovery.status!=="NOT_IN_RESEARCH_SCOPE");
 const recoveryStatusCounts=Object.fromEntries([...new Set(recoveryRows.map(r=>r.preGospelRecovery.status))].sort().map(status=>[
  status,recoveryRows.filter(r=>r.preGospelRecovery.status===status).length]));
 const sourceProofStats={baselineSegmentHolds,postRecoverySegmentHolds,
  reductionInSegmentHolds:baselineSegmentHolds-postRecoverySegmentHolds,
  sourceProofCacheEntries:await page.evaluate(()=>globalThis.__gr1961PreGospelProofCache.size),
  sourceProofRelevantDates:recoveryRows.length,
  sourceProofSourcePaths:new Set(recoveryRows.map(r=>r.preGospelRecovery.sourcePath)).size,
  sourceProofCacheHits:recoveryRows.filter(r=>r.preGospelRecovery.cacheHit).length,
  sourceProofCertifiedDates:recoveryRows.filter(r=>r.preGospelRecovery.certified).length,
  byStatus:recoveryStatusCounts};
 console.log("AO_GR1961_2026_PRE_GOSPEL_RECOVERY="+JSON.stringify(sourceProofStats));
 const paths=new Map();
 for(const row of rows){
  const sourcePath=row.preGospelRecovery?.sourcePath;
  if(!sourcePath||row.preGospelRecovery.status==="NOT_IN_RESEARCH_SCOPE")continue;
  const existing=paths.get(sourcePath)??{sourcePath,dates:0,
    baselineSegmentHolds:0,remainingSegmentHolds:0,recoveryStatuses:{}};
  existing.dates++;
  existing.baselineSegmentHolds+=row.baselineSegmentHolds??0;
  existing.remainingSegmentHolds+=row.unresolved?.filter(x=>x.status==="SEGMENT_UNVERIFIED").length??0;
  const key=row.preGospelRecovery.status;
  existing.recoveryStatuses[key]=(existing.recoveryStatuses[key]??0)+1;
  paths.set(sourcePath,existing);
 }
 const pathReview=[...paths.values()].sort((a,b)=>b.baselineSegmentHolds-a.baselineSegmentHolds||a.sourcePath.localeCompare(b.sourcePath));
 assert.equal(pathReview.reduce((n,r)=>n+r.baselineSegmentHolds,0),baselineSegmentHolds);
 console.log("AO_GR1961_2026_PRE_GOSPEL_SOURCE_PATH_QUEUE="+JSON.stringify(pathReview));

 console.log("AO_GR1961_2026_SELECTED_PROPER_SUMMARY="+JSON.stringify({
  year:compact.year,daysChecked:compact.daysChecked,daysSourceReady:compact.daysSourceReady,
  dayResolverFailures:compact.dayResolverFailures,
  distinctTextMatchedCandidateIds:compact.distinctTextMatchedCandidateIds,
  sourceMatchOccurrences:compact.sourceMatchOccurrences,
  ambiguousVariantOccurrences:compact.ambiguousVariantOccurrences,
  observedMassDates:datesWithMatches.size,
  researchCandidatesNotObservedInSweep:compact.researchCandidatesNotObservedInSweep,
  calendarProperSourcePathsVisited:compact.calendarProperSourcePathsVisited,
  candidateSourcePathsVisited:compact.candidateSourcePathsVisited,
  daysWithCandidateSourcePath:compact.daysWithCandidateSourcePath,
  candidateDatePairsInspected:compact.candidateDatePairsInspected,
  unresolvedCandidateDatePairs:compact.unresolvedCandidateDatePairs,
  distinctUnresolvedCandidateIds:compact.distinctUnresolvedCandidateIds,
  unverifiedByStatus:compact.unverifiedByStatus,
  preGospelRecovery:sourceProofStats,
  musicalFacsimileApprovals:0,editorialPromotions:0,
 }));
 console.log("AO_GR1961_2026_SELECTED_PROPER_OBSERVATIONS="+JSON.stringify(compact.observations));
 console.log("AO_GR1961_2026_SELECTED_PROPER_EXCEPTIONS="+JSON.stringify(compact.exceptions.slice(0,30)));
 console.log("PASS Gregorian 342 against real production 1962 DayResolver; no text-only score publication");
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
