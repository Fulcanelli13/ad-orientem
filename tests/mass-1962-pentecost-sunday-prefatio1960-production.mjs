// Exercise the actual shared v8 1962 resolver and the native R17 Preface slot.
// The documented bad raw Prefaces are corrected only with 1960 source proofs.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".json":"application/json",".svg":"image/svg+xml",".woff2":"font/woff2",
 ".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("Forbidden");return;}
  const data=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(data);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e.message||e))}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:"block"});
 page.setDefaultTimeout(90000);
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
  {waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",
  null,{timeout:90000});
 // The *normal production bootstrap* must install the resolver wrapper.
 // Do not call an installer here: a test-only install could hide wiring errors.
 await page.waitForFunction(()=>
  globalThis.AO_R17_BROWSER_ENTRY?.status?.()?.sharedSundayPrefatio1960?.installed===true,
  null,{timeout:90000});
 const rows=await page.evaluate(async()=>{
  const {properToReaderSlots}=await import("/src/mass/proper-reader-slots.js");
  const installed=globalThis.AO_R17_BROWSER_ENTRY?.status?.()?.sharedSundayPrefatio1960;
  if(!installed?.installed)throw Error("PRODUCTION_1960_SOURCE_BOOTSTRAP_NOT_INSTALLED");
  const dates=["2026-06-07","2026-06-14","2026-06-12","2026-10-11"];
  const results=[];
  for(const date of dates){
   try{
    const r=await globalThis.AO_RUNTIME_V8.resolver.resolveDay(date);
    const p=r?.proper?.data;
    const preface=p?.preface;
    const slot=properToReaderSlots(p,{language:"fr"}).slots.PREFACE;
    results.push({
     date,dayStatus:r?.status,properStatus:r?.proper?.status,
     principalId:r?.day?.main?.id??null,sourcePath:p?.sourcePath??null,
     latin:String(preface?.lat??preface?.la??"").split("\n")[0],
     frenchLength:String(preface?.fr??"").length,
     englishLength:String(preface?.en??"").length,
     prefacio1960Status:r?.preface1960SourceDecision?.status??null,
     rubric:r?.preface1960SourceDecision?.rubric??null,
     slotStatus:slot?.status??null
    });
   }catch(error){results.push({date,error:String(error?.stack??error)});}
  }
  return results;
 });
 console.log("PENT_SUNDAY_1960_SOURCE_SELECTION="+JSON.stringify(rows));
 const expected=[
  ["2026-06-07","tempora:Pent02-0r:2:g","Tempora/Pent02-0r"],
  ["2026-06-14","tempora:Pent03-0r:2:g","Tempora/Pent03-0r"]];
 for(const [date,id,path] of expected){
  const r=rows.find(row=>row.date===date);
  assert.ok(r&&!r.error,date+": "+r?.error);
  assert.equal(r.dayStatus,"ready");
  assert.equal(r.properStatus,"ready",date+" source not ready");
  assert.equal(r.principalId,id);
  assert.equal(r.sourcePath,path);
  assert.equal(r.prefacio1960Status,"SOURCE_VERIFIED",date+" no verified rule precedence");
  assert.equal(r.rubric,"RGMR_494_B");
  assert.match(r.latin,/^de sanctissima Trinitate/i);
  assert.ok(r.frenchLength>100&&r.englishLength>100);
  assert.equal(r.slotStatus,"READY",date+" corrected Preface not in native reader");
 }
 for(const date of ["2026-06-12","2026-10-11"]){
  const r=rows.find(row=>row.date===date);
  assert.ok(r&&!r.error,date+": "+r?.error);
  assert.equal(r.prefacio1960Status,null,date+" changed an unrelated Mass");
  assert.equal(r.properStatus,"ready");
 }

 // Exhaustive 2026 Sunday *scope* test. This is not a certificate for
 // every Sunday's Preface: it proves the narrow 1960 rule owner does not
 // claim any other Sunday, while preserving all 52 production source IDs.
 const sundays=[];
 for(let millis=Date.UTC(2026,0,1);millis<Date.UTC(2027,0,1);millis+=86400000){
  const date=new Date(millis);
  if(date.getUTCDay()===0)sundays.push(date.toISOString().slice(0,10));
 }
 assert.equal(sundays.length,52,"2026 has exactly 52 Sundays");
 const sundayRows=[];
 // Small source-resolver chunks avoid overloading the canonical host source.
 for(let offset=0;offset<sundays.length;offset+=5){
  const dates=sundays.slice(offset,offset+5);
  const chunk=await page.evaluate(async dates=>{
   const {inspectPentecostSunday1960Source}=await import(
    "/src/mass/1962-pentecost-sunday-prefatio1960-source.js");
   const resolver=globalThis.AO_RUNTIME_V8?.resolver;
   return Promise.all(dates.map(async date=>{
    try{
     const r=await resolver.resolveDay(date);
     return {date,id:r?.day?.main?.id??null,dayStatus:r?.status,
      properStatus:r?.proper?.status,
      decision:r?.preface1960SourceDecision?.status??null,
      scope:inspectPentecostSunday1960Source(r)?.status,
      actualHeading:String(r?.proper?.data?.preface?.lat??"").split("\n")[0]};
    }catch(error){return {date,error:String(error?.message??error)}}
   }));
  },dates);
  sundayRows.push(...chunk);
 }
 assert.equal(sundayRows.length,52);
 const certified=sundayRows.filter(r=>r.decision==="SOURCE_VERIFIED").map(r=>r.date).sort();
 assert.deepEqual(certified,["2026-06-07","2026-06-14"],
  "The shared Sunday fix must affect precisely its two source-owned identities");
 for(const r of sundayRows){
  assert.ok(!r.error,r.date+": "+r.error);
  assert.equal(r.dayStatus,"ready",r.date+": date resolver failure");
  assert.equal(r.properStatus,"ready",r.date+": source Proper failure");
  if(certified.includes(r.date)){
   assert.equal(r.scope,"ALREADY_CORRECT",r.date);
   assert.match(r.actualHeading,/^de sanctissima Trinitate/i,r.date);
  }else {
   assert.equal(r.decision,null,r.date+": unauthorized 1960 override");
   assert.equal(r.scope,"NOT_THIS_PRINCIPAL_MASS",r.date+": unrelated source identity");
  }
 }
 console.log("MASS_1960_2026_SUNDAY_SCOPE="+JSON.stringify({
  scanned:52,sourceVerified:certified,unchanged:50,unresolved:0,
  limitation:"Intervention scope only: not universal Preface/Proper certification"
 }));
 console.log("PASS 2026 Sunday source scope: exactly 2 verified corrections and 50 untouched");

 console.log("PASS source-authenticated 1960 Trinity Preface, two actual Sunday Masses, native reader and unchanged controls");
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
