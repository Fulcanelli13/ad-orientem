import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",
 ".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{try{
 const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://local").pathname));
 if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden");}
 const bytes=await readFile(path);res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream","cache-control":"no-store"});res.end(bytes);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(e.message)}});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:"block"});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function"
  && globalThis.AO_R17_BROWSER_ENTRY?.installed,{timeout:90000});
 const audit=await page.evaluate(async()=>{
  const runtime=globalThis.AO_RUNTIME_V8;
  const {properToReaderSlots}=await import("/src/mass/proper-reader-slots.js");
  const inputs=[
   ["2026-01-06","Epiphania"],["2026-02-02","Nativit"],
   ["2026-04-05","Paschal"],["2026-05-24","Spiritu"],
   ["2026-06-12","Cordis"],["2026-10-07","Maria"],
   ["2026-10-11","Trinitate"],["2026-10-15","Communis"],
   ["2026-10-18","Trinitate"],["2026-12-08","Maria"],
   ["2025-11-30","Communis"],["2025-12-27","Nativit"],
   ["2026-01-07","Epiphania"],["2026-02-25","Quadragesima"],
   ["2026-03-19","Joseph"],["2026-04-08","Paschalis"],
   ["2026-04-19","Paschalis"],["2026-05-01","Joseph"],
   ["2026-05-15","Ascensione"],["2026-05-23","Spiritu"],
   ["2026-09-21","Apostolis"]
  ];
  const results=[];
  const owner=globalThis.AO_R17_BROWSER_ENTRY?.status?.()?.prefaceOwner;
  console.log("ACTUAL_PREFACE_OWNER="+JSON.stringify(owner));
  for(const [date,section] of inputs){
    const value=await runtime.resolver.resolveDay(date);
    const pref=value?.proper?.data?.preface;
    const reader=pref?properToReaderSlots(value.proper.data,{language:"fr"}).slots.PREFACE:null;
    results.push({date,section,id:value?.day?.main?.id,status:value?.status,
      properStatus:value?.proper?.status,prefaceLatin:(pref?.lat??pref?.la)?.slice(0,130),
      prefaceFrench:pref?.fr?.slice(0,90),
      prefaceEnglishLen:pref?.en?.length,prefaceFrenchLen:pref?.fr?.length,
      readerStatus:reader?.status,chosen:value?.prefaceDecision?.id??null,
      applies:value?.prefaceDecision?.applied??null});
  }
  return results;
 });
 console.log("AO_REAL_PREFACE_10_DATE="+JSON.stringify({errors,rows:audit}));
 assert.equal(errors.length,0,"Browser errors");
 for(const a of audit){
  assert.equal(a.status,"ready",a.date);
  assert.equal(a.properStatus,"ready",a.date);
  assert.equal(a.readerStatus,"READY",a.date);
  assert.ok(a.prefaceFrenchLen>200&&a.prefaceEnglishLen>200,a.date);
  assert.match(a.prefaceLatin||"",new RegExp(a.section,"i"),"Wrong 1962 Preface on "+a.date);
 }
 for(const d of ["2026-05-24","2026-10-07","2026-12-08",
   "2026-01-07","2026-02-25","2026-03-19",
   "2026-04-08","2026-04-19","2026-05-01","2026-05-15","2026-05-23"]){
  assert.equal(audit.find(x=>x.date===d).applies,true,d);
 }
 assert.equal(audit.find(x=>x.date==="2026-10-11").applies,null,"No prefatory substitution due to commemoration");
 console.log("PASS: 21/21 actual 1962 date Prefaces, full French+English source text and READY R17 slot");
}finally{await browser?.close();await new Promise(done=>server.close(done))}
