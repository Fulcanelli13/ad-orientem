// Annual Mass-of-the-day Schola match using the ACTUAL running 1962 DayResolver.
// Unlike the 1049-file source-universe sweep, this resolves the selected
// principal/Proper on every civil day. It does not infer a local choir choice,
// substitute a votive or Requiem ceremony, or approve musical notation.
import http from "node:http";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {properToReaderSlots} from "../../src/mass/proper-reader-slots.js";
import {index1961GradualeGabc,matchSelected1962ProperToGraduale}
 from "../../src/mass/reader-proper-gabc-bulk-join.js";

const root=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const load=async path=>JSON.parse(await readFile(resolve(root,path),"utf8"));
const archive=index1961GradualeGabc(await Promise.all(Array.from({length:6},(_,i)=>
 load("data/mass/chant-corpus/gr1961-proper-"+String(i+1).padStart(3,"0")+".json"))));
const universe=await load("data/research/mass-music-1962-pinned-full-source-universe.v1.json");
const known=new Set(universe.sourceFiles.map(x=>x.path));
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
let browser,raw=[];
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
   return Promise.all(ids.map(async date=>{
    try{
     const outcome=await r.resolveDay(date);
     const main=outcome?.day?.main??null;
     const proper=outcome?.proper?.data??null;
     return {date,resolvedDate:outcome?.date??null,
      resolverStatus:outcome?.status??null,properStatus:outcome?.proper?.status??null,
      principalId:main?.id??null,principalTitle:main?.title??main?.name??null,
      sourcePath:proper?.sourcePath??outcome?.proper?.sourcePath??null,
      proper:proper??null};
    }catch(e){return {date,error:String(e?.message??e)}}
   }));
  },batch);
  raw.push(...response);
  if((offset+batch.length)%60===0||offset+batch.length===365)
   console.log("Actual 2026 Mass-of-day resolved: "+(offset+batch.length)+"/365");
 }
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}

const tally={},datesWithSelectedSource=new Set(),uniquePaths=new Set();
const rows=raw.map(original=>{
 const {date,sourcePath,principalId,principalTitle,proper,resolvedDate,
  resolverStatus,properStatus,error}=original;
 const row={date,principalId,principalTitle,sourcePath,
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
const dest=resolve(root,".tmp","schola-1962-selected-annual");
await mkdir(dest,{recursive:true});
await writeFile(resolve(dest,"2026-selected-gabc-coverage.json"),JSON.stringify(report,null,2)+"\n");
await writeFile(resolve(dest,"2026-selected-gabc-summary.json"),JSON.stringify({
 schema:report.schema,year:2026,counters:report.counters,publication:report.status,
 claims:{localParishChantsSelected:false,notationApproved:false,recordingsApproved:false,
  specialRitesIndependentlyCertified:false}
},null,2)+"\n");
console.log("ACTUAL_2026_SELECTED_SUMMARY "+JSON.stringify(report.counters));
if(rows.length!==365||raw.some(x=>x.error))process.exitCode=2;
