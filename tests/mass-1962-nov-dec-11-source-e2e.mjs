// Source diagnosis for real November–December 2026 Mass commemoration cases.
// Reads the existing production DayResolver, recovery and source-form selector.
// No new liturgical decisions are inferred from these inventory records.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const dates=[
 "2026-11-09","2026-11-10","2026-11-11","2026-11-19",
 "2026-11-23","2026-11-24","2026-11-26","2026-12-02",
 "2026-12-03","2026-12-05","2026-12-07"
];
const mime={".html":"text/html;charset=utf-8",".js":"text/javascript;charset=utf-8",
 ".mjs":"text/javascript;charset=utf-8",".json":"application/json",
 ".css":"text/css;charset=utf-8",".svg":"image/svg+xml"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
  const bytes=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]??"application/octet-stream"});
  res.end(bytes);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message??error))}
});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:"block"});
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",null,{timeout:80000});
 const findings=await page.evaluate(async dates=>{
  const resolver=globalThis.AO_RUNTIME_V8.resolver;
  const {recoverReaderProperOmissions}=await import("/src/mass/reader-proper-runtime-recovery.js");
  const {select1962CommemorationsForMassForm:select}=await import("/src/mass/1962-commemoration-form-source.js");
  const groups=["collects","secrets","postcommunions"];
  const out=[];
  for(const date of dates){
   const r=await resolver.resolveDay(date);
   const raw=r?.proper?.data;
   const prepared=await recoverReaderProperOmissions(r.proper,{
    hostResolver:resolver.properResolver,principalCelebrationId:r.day?.main?.id,calendarDate:date
   });
   const data=prepared?.data??prepared;
   const forms={};
   for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
    const s=select({proper:prepared,calendarResolution:r,form});
    forms[form]={status:s.status,reason:s.reason??null,scope:s.decision?.scope??null,
     applied:s.decision?.appliedCount??null,prayerGroups:s.decision?.prayerGroupCount??null};
   }
   out.push({
    date,resolverStatus:r?.status,properStatus:r?.proper?.status,
    principal:r.day?.main?{id:r.day.main.id,title:r.day.main.title,path:r.day.main.path,
     rank:r.day.main.rank}:null,
    commemorations:(r.day?.commemorations??[]).map(x=>({
     id:x.id,title:x.title,rank:x.rank,path:x.path,privileged:!!x.privileged,
     inseparable:!!x.inseparable})),
    sourceCommemorations:(data?.calendarCommemorations??[]).map(x=>({
     name:x.name,path:x.path,prayerSourcePath:x.prayerSourcePath,rank:x.rank,
     inseparable:!!x.inseparable})),
    sourcePath:data?.sourcePath,
    prayers:Object.fromEntries(groups.map(k=>[k,(data?.[k]??[]).map(x=>({
     lat:!!String(x?.lat??x?.la??"").trim(),en:!!String(x?.en??"").trim(),
     fr:!!String(x?.fr??"").trim(),sourcePath:x?.sourcePath??null}))])),
    formDecisions:forms,
   });
  }
  return out;
 },dates);
 for(const f of findings){
  console.log("NOV_DEC_1962_SOURCE_CASE="+JSON.stringify(f));
  assert.equal(f.resolverStatus,"ready",f.date+" source day");
  assert.equal(f.properStatus,"ready",f.date+" source Proper");
  assert.equal(f.commemorations.length,1,f.date+" expected exactly one commemoration");
 }
 console.log("PASS: 11 production November/December 1962 commemoration source cases inspected, with no source/rubrical inference.");
}finally{await browser?.close();await new Promise(done=>server.close(done))}
