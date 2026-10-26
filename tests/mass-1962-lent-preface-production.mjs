// Production 2026 Gregorian date sweep for the actual source-normalizer
// defect identified by the Calendar's 365-day Preface audit (22 dates).
import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
  ".json":"application/json",".svg":"image/svg+xml",".woff2":"font/woff2",".png":"image/png"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(await readFile(file));
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e.message||e))}
});
const candidates=[
 "2026-02-23","2026-02-25","2026-02-26","2026-02-27","2026-02-28",
 "2026-03-02","2026-03-03","2026-03-04","2026-03-05","2026-03-06","2026-03-07",
 "2026-03-09","2026-03-10","2026-03-11","2026-03-12","2026-03-13","2026-03-14",
 "2026-03-16","2026-03-17","2026-03-18","2026-03-20","2026-03-21"
];
assert.equal(candidates.length,22);
await new Promise(done=>server.listen(0,"127.0.0.1",done));
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:"block"});
 page.setDefaultTimeout(90000);
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
   {waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",
   null,{timeout:90000});
 const cases=await page.evaluate(async dates=>{
   const host=globalThis.AO_RUNTIME_V8.resolver;
   const {recoverReaderProperOmissions,authenticated1962PrefaceRecoveryOwner}=
     await import("/src/mass/reader-proper-runtime-recovery.js");
   const {properToReaderSlots}=await import("/src/mass/proper-reader-slots.js");
   const results=[];
   for(const date of dates){
     try{
       const resolution=await host.resolveDay(date);
       const id=resolution?.day?.main?.id;
       const original=resolution?.proper?.data;
       const before=String(original?.preface?.lat??original?.preface?.la??"").split("\n")[0];
       const owner=authenticated1962PrefaceRecoveryOwner(id,original?.sourcePath);
       const recovered=await recoverReaderProperOmissions(original,{
         hostResolver:host.properResolver,principalCelebrationId:id
       });
       const after=String(recovered?.preface?.lat??recovered?.preface?.la??"").split("\n")[0];
       const slot=properToReaderSlots(recovered,{language:"fr"}).slots.PREFACE;
       results.push({date,id,properSourcePath:original?.sourcePath??null,owner:owner?.section??null,
         before,after,source:recovered?.preface?.sourcePath??null,
         enLength:String(recovered?.preface?.en??"").length,
         frLength:String(recovered?.preface?.fr??"").length,
         originalUnchanged:String(original?.preface?.lat??"").startsWith("Communis"),
         slot:slot.status});
     }catch(e){results.push({date,error:String(e?.stack||e)})}
   }
   return results;
 },candidates);
 console.log("MASS_1962_LENT_PREFACE_TRIAGE="+JSON.stringify(cases));
 for(const row of cases){
   assert.ok(!row.error,row.date+": "+row.error);
   assert.match(row.id,/^tempora:Quad[1-4]-[1-6]:[123]:v$/i,row.date);
   assert.equal(row.owner,"Quad",row.date+" source-path owner not recognized: "+row.properSourcePath);
   assert.match(row.before,/^Communis/i,row.date+" baseline is no longer a Common Preface");
   assert.match(row.after,/^de Quadragesima/i,row.date+" reader did not recover Lenten Preface");
   assert.equal(row.source,"Ordo/Prefationes");
   assert.ok(row.enLength>100&&row.frLength>100,row.date+" source translations incomplete");
   assert.equal(row.slot,"READY",row.date+" corrected source unavailable to actual R17 slot");
   assert.equal(row.originalUnchanged,true,row.date+" mutated host source");
 }
 console.log("MASS_1962_LENT_PREFACE_RECOVERY="+JSON.stringify({
   total:cases.length,recovered:cases.filter(x=>/^de Quadragesima/i.test(x.after)).length,
   completeFrench:cases.filter(x=>x.frLength>100).length,results:cases
 }));
 console.log("PASS all 22 Lenten source-backed Preface corrections reach the real reader.");
}finally{await browser?.close();await new Promise(done=>server.close(done))}
