// Annual Mass-of-the-day Schola match using the ACTUAL running 1962 DayResolver.
// Unlike the 1049-file source-universe sweep, this resolves the selected
// principal/Proper on every civil day. It does not infer a local choir choice,
// substitute a votive or Requiem ceremony, or approve musical notation.
import http from "node:http";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {createHash} from "node:crypto";
import {auditSchola2026ProperRepeatability,
 SCHOLA_2026_REPRODUCIBILITY_DATES}
 from "../../src/mass/reader-schola-2026-proper-repeatability.js";
import {properToReaderSlots} from "../../src/mass/proper-reader-slots.js";
import {index1961GradualeGabc,matchSelected1962ProperToGraduale}
 from "../../src/mass/reader-proper-gabc-bulk-join.js";
import {crosswalkSelected2026MassesToPinnedReview}
 from "../../src/mass/reader-schola-selected-queue-crosswalk.js";
import {crosswalkSelected2026ToFullPinnedSource}
 from "../../src/mass/reader-schola-selected-full-source-crosswalk.js";

const root=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const load=async path=>JSON.parse(await readFile(resolve(root,path),"utf8"));
const archive=index1961GradualeGabc(await Promise.all(Array.from({length:6},(_,i)=>
 load("data/mass/chant-corpus/gr1961-proper-"+String(i+1).padStart(3,"0")+".json"))));
const universe=await load("data/research/mass-music-1962-pinned-full-source-universe.v1.json");
const known=new Set(universe.sourceFiles.map(x=>x.path));
const pinnedReviewQueue=await load("data/research/mass-music-1962-91-inline-review-queue.v1.json");

// A matched Gregorian score may be attached only to the original selected
// source paragraph; for compound pre-Gospel slots, resolve its specific role.
function selectedChantSourceRow(slots,match){
 const raw=slots?.slots?.[match.track]?.data?.paragraphs;
 if(!Array.isArray(raw))return null;
 const filtered=match.track==="GRADUAL"
  ?raw.filter(p=>p.liturgicalGroup==="AO.CHANT.GRADUAL")
  :match.track==="ALLELUIA_TRACT_SEQUENCE"
   ?raw.filter(p=>p.liturgicalGroup==="AO.CHANT."+match.sourceGroup)
   :raw;
 return filtered.length===1&&typeof filtered[0]?.latin==="string"?filtered[0]:null;
}
const dates=[];
for(let t=Date.UTC(2026,0,1);t<Date.UTC(2027,0,1);t+=86400000)
 dates.push(new Date(t).toISOString().slice(0,10));
if(dates.length!==365)throw Error("CALENDAR_DATE_RANGE_INCORRECT");

const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".json":"application/json",".css":"text/css; charset=utf-8",
 ".svg":"image/svg+xml",".woff2":"font/woff2",".png":"image/png",
 ".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+path);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream",
   "cache-control":"no-store"});res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser,raw=[],secondWitness=[];
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:"block"});
 page.setDefaultTimeout(90000);
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
  {waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",
  null,{timeout:90000});
 for(let offset=0;offset<dates.length;offset+=12){
  const batch=dates.slice(offset,offset+12);
  const response=await page.evaluate(async ids=>{
   const r=globalThis.AO_RUNTIME_V8?.resolver;
   // Production DayResolver shares source-fetch/cache state. Parallel
   // resolveDay calls race source transport and produce intermittent
   // Proper.status='failed' for genuinely available 1962 formularies.
   // Serialise each date so a temporary source load cannot silently remove
   // chants from the editorial first-60 ranking.
   const resolveOne=async date=>{
    try{
     const outcome=await r.resolveDay(date);
     const main=outcome?.day?.main??null;
     const proper=outcome?.proper?.data??null;
     return {date,resolvedDate:outcome?.date??null,
      resolverStatus:outcome?.status??null,properStatus:outcome?.proper?.status??null,
      principalId:main?.id??null,principalTitle:main?.title??main?.name??null,
      sourcePath:proper?.sourcePath??outcome?.proper?.sourcePath??null,
      proper:proper??null,
      diagnosticErrors:(outcome?.diagnostic?.errors??[]).slice(0,8),
      diagnosticRequestedFiles:outcome?.diagnostic?.requestedFiles?.length??0};
    }catch(e){return {date,error:String(e?.message??e)}}
   };
   const settled=[];
   for(const date of ids)settled.push(await resolveOne(date));
   return settled;
  },batch);
  raw.push(...response);
  if((offset+batch.length)%60===0||offset+batch.length===365)
   console.log("Actual 2026 Mass-of-day resolved: "+(offset+batch.length)+"/365");
 }
 // P0 independent witness: the original 17 calendar dates that alternated
 // between failed and ready now MUST resolve from a fresh browser/context,
 // not the original MemoryTextFetcher cache. Do not silently improve the
 // first60 shortlist by throwing away missing/failed source days.
 const repeatContext=await browser.newContext({serviceWorkers:"block"});
 try{
  const another=await repeatContext.newPage();
  another.setDefaultTimeout(90000);
  await another.goto("http://127.0.0.1:"+server.address().port+"/index.html",
   {waitUntil:"domcontentloaded",timeout:90000});
  await another.waitForFunction(()=>
   typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",
   null,{timeout:90000});
  secondWitness=await another.evaluate(async dates=>{
   const resolver=globalThis.AO_RUNTIME_V8.resolver,rows=[];
   for(const date of dates){
    try{
     const o=await resolver.resolveDay(date);
     rows.push({date,resolvedDate:o?.date??null,
      resolverStatus:o?.status??null,properStatus:o?.proper?.status??null,
      principalId:o?.day?.main?.id??null,
      sourcePath:o?.proper?.data?.sourcePath??o?.proper?.sourcePath??null,
      proper:o?.proper?.data??null,
      diagnosticErrors:(o?.diagnostic?.errors??[]).slice(0,8),
      diagnosticRequestedFiles:o?.diagnostic?.requestedFiles?.length??0});
    }catch(e){rows.push({date,error:String(e?.message??e)})}
   }
   return rows;
  },SCHOLA_2026_REPRODUCIBILITY_DATES);
 }finally{await repeatContext.close()}
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}

// A given sha256 identifies the EXACT selected-Mass Proper as resolved by
// the unmodified production runtime. No text/score is inferred or replaced.
const selectedProperSha256=row=>row?.proper
 ?createHash("sha256").update(JSON.stringify(row.proper),"utf8").digest("hex"):null;
const reduceForProof=row=>({
 date:row.date,resolverStatus:row.resolverStatus??null,
 properStatus:row.properStatus??null,principalId:row.principalId??null,
 sourcePath:row.sourcePath??null,
 selectedProperSha256:selectedProperSha256(row),
 errors:[...(row.diagnosticErrors??[]),...(row.error?[row.error]:[])].slice(0,8)
});
const byDate=new Map(raw.map(x=>[x.date,x]));
const witness1=SCHOLA_2026_REPRODUCIBILITY_DATES.map(date=>reduceForProof(byDate.get(date)));
const witness2=secondWitness.map(reduceForProof);
const reproducibility=auditSchola2026ProperRepeatability({first:witness1,second:witness2});
const identityManifest={
 schema:"ao-schola-2026-selected-calendar-proper-identity-manifest-v1",
 selectedYear:2026,sourceAuthority:"AO_RUNTIME_V8.resolver.resolveDay",
 sourceCorpus:"PINNED_1962_SOURCE_NO_INFERRED_PROPER",
 status:"RESEARCH_SOURCE_IDENTITY_ONLY_NOT_MUSICAL_PUBLICATION",
 counters:{civilDays:365,ready:raw.filter(x=>
  x.resolverStatus==="ready"&&["ready","cached"].includes(String(x.properStatus).toLowerCase())).length,
  blocked:raw.filter(x=>x.resolverStatus!=="ready"||
   !["ready","cached"].includes(String(x.properStatus).toLowerCase())).length,
  musicalApprovals:0,publicScores:0},
 calendar:raw.map(reduceForProof)
};
const tally={},datesWithSelectedSource=new Set(),uniquePaths=new Set();
const rows=raw.map(original=>{
 const {date,sourcePath,principalId,principalTitle,proper,resolvedDate,
  resolverStatus,properStatus,error}=original;
 const row={date,principalId,principalTitle,sourcePath,
  // Original resolver-owned flattened Latin: source-first research only.
  selectedGradualLatin:proper?.gradual?.lat??proper?.gradual?.la??null,
  selectedSequenceLatin:proper?.sequence?.lat??proper?.sequence?.la??null,
  sourceExistsInPinnedLatinTree:known.has(sourcePath),
  resolverStatus,properStatus,englishReaderReady:false,frenchReaderReady:false,
  status:null,tracks:[],notPublic:true};
 const hold=(code,detail)=>{row.status=code;if(detail)row.holdReason=detail;return row};
 if(error)return hold("RESOLVER_EXCEPTION",error);
 if(resolvedDate!==date||resolverStatus!=="ready"||
   !["ready","cached"].includes(String(properStatus).toLowerCase())||!proper)
  return hold("DAY_OR_PROPER_NOT_READY","Production 1962 day/Proper not ready");
 if(!/^(?:Tempora|Sancti|Commune)\/[A-Za-z0-9_-]+$/.test(String(sourcePath??"")))
  return hold("SOURCE_PATH_UNVERIFIED","No valid selected Proper source path");
 if(!principalId)return hold("PRINCIPAL_ID_MISSING");
 datesWithSelectedSource.add(date);uniquePaths.add(sourcePath);
 let en,fr;
 try{en=properToReaderSlots(proper,{language:"en"});}
 catch(e){return hold("EN_READER_PROJECTION_EXCEPTION",String(e?.message??e))}
 try{fr=properToReaderSlots(proper,{language:"fr"});}
 catch(e){return hold("FR_READER_PROJECTION_EXCEPTION",String(e?.message??e))}
 row.englishReaderReady=en.ready;row.frenchReaderReady=fr.ready;
 row.englishMissing=en.missing;row.frenchMissing=fr.missing;
 if(!en.ready)return hold("EN_READER_HOLD","Source Proper incomplete in existing English Reader");
 const match=matchSelected1962ProperToGraduale({properSlots:en,archive});
 if(match.status!=="SOURCE_FIRST_CANDIDATES_ONLY_NOT_SCORES")
  return hold("SOURCE_MATCHER_HOLD",match.status);
 row.status="SOURCE_MATCHED_FOR_REVIEW";
 row.tracks=match.tracks.map(x=>({
  role:x.track,part:x.part??null,sourceGroup:x.sourceGroup??null,
  status:x.status,reason:x.reason??null,
  selectedParagraphId:selectedChantSourceRow(en,x)?.id??null,
  selectedLatin:selectedChantSourceRow(en,x)?.latin??null,
  candidates:(x.scoreCandidates??[]).map(c=>({
   scoreId:c.scoreId,sourceGabcSha256:c.sourceGabcSha256,
   printed1961Page:c.printed1961Page,matchingOpeningWords:c.matchingOpeningWords,
   status:c.status,editorApproved:false,publicScore:false
  }))
 }));
 return row;
});
for(const row of rows){
 tally[row.status]=(tally[row.status]??0)+1;
 for(const t of row.tracks)tally["TRACK_"+t.status]=(tally["TRACK_"+t.status]??0)+1;
}
const report={schema:"ao-schola-selected-mass-2026-proper-gabc-candidate-coverage-v1",
 year:2026,sourceAuthority:"AO_RUNTIME_V8.resolver.resolveDay",
 sourceMode:"ACTUAL_CALENDAR_SELECTED_MASS_OF_DAY_NOT_VOTIVE_OR_LOCAL_PROGRAMME",
 sourceScoreCorpus:1195,pinnedSourceUniverse:known.size,
 status:"EDITORIAL_CANDIDATES_ONLY_NO_DIGITAL_NOTATION_PUBLICATION",
 counters:{civilDays:365,daysWithPrincipalAndSource:datesWithSelectedSource.size,
  distinctSelectedSourcePaths:uniquePaths.size,pathsMissingFromPinnedTree:
   [...uniquePaths].filter(x=>!known.has(x)).sort(),...tally},
 provenance:{sourceRepo:universe.sourceRepository,sourceRef:universe.sourceRef,
  note:"Pinned Latin tree is a separate historical cross-check; exact selected Latin comes from production 1962 Proper, not historical source-file assumptions"},
 rows};
const crosswalk=crosswalkSelected2026MassesToPinnedReview({
 annualReport:report,reviewQueue:pinnedReviewQueue
});
const fullSourceAudit=await load(".tmp/schola-1962-coverage/full-source-coverage.json");
const allSourceCrosswalk=crosswalkSelected2026ToFullPinnedSource({
 annualReport:report,fullSourceAudit,prior91Crosswalk:crosswalk
});
const dest=resolve(root,".tmp","schola-1962-selected-annual");
await mkdir(dest,{recursive:true});
await writeFile(resolve(dest,"2026-proper-source-identity-manifest.json"),
 JSON.stringify(identityManifest,null,2)+"\n");
await writeFile(resolve(dest,"2026-proper-17date-independent-repeatability.json"),
 JSON.stringify(reproducibility,null,2)+"\n");
console.log("SCHOLA_2026_SOURCE_REPEATABILITY "+
 JSON.stringify(reproducibility.summary));
if(!reproducibility.summary.stable)process.exitCode=2;
await writeFile(resolve(dest,"2026-selected-gabc-coverage.json"),JSON.stringify(report,null,2)+"\n");
await writeFile(resolve(dest,"2026-selected-pinned91-inline-crosswalk.json"),
 JSON.stringify(crosswalk,null,2)+"\n");
await writeFile(resolve(dest,"2026-selected-full1049-inline-crosswalk.json"),
 JSON.stringify(allSourceCrosswalk,null,2)+"\n");
await writeFile(resolve(dest,"2026-selected-full1049-summary.json"),
 JSON.stringify({schema:allSourceCrosswalk.schema,
  counters:allSourceCrosswalk.counters,
  missingSourcePaths:allSourceCrosswalk.absentFromPinnedLatinTree,
  prior91Overlap:allSourceCrosswalk.comparisonWithPrior91,
  publication:allSourceCrosswalk.publication},null,2)+"\n");
await writeFile(resolve(dest,"2026-selected-gabc-summary.json"),JSON.stringify({
 schema:report.schema,year:2026,counters:report.counters,publication:report.status,
 claims:{localParishChantsSelected:false,notationApproved:false,recordingsApproved:false,
  specialRitesIndependentlyCertified:false}
},null,2)+"\n");
console.log("ACTUAL_2026_SELECTED_SUMMARY "+JSON.stringify(report.counters));
console.log("SELECTED_VS_PINNED_91_INLINE_SUMMARY "+JSON.stringify(crosswalk.counters));
console.log("SELECTED_VS_FULL_1049_SOURCE_INLINE_SUMMARY "+JSON.stringify(allSourceCrosswalk.counters));
console.log("PINNED_91_SOURCE_OVERLAP "+JSON.stringify(allSourceCrosswalk.comparisonWithPrior91));
if(rows.length!==365||raw.some(x=>x.error))process.exitCode=2;
