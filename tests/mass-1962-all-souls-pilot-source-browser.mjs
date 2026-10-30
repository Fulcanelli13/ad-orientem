// 2 November 2026 pilot gate: load all THREE appointed Mass texts through
// the real production Calendar/Proper resolver, not synthetic reader fixtures.
// A missing Latin, English or French text must fail rather than silently
// present the First Mass for the Second or Third.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
  ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
  ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".woff2":"font/woff2",
  ".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
   const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
   const path=resolve(root,"."+pathname);
   if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
   const bytes=await readFile(path);
   res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream",
     "cache-control":"no-store"});
   res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,
   hasTouch:true,serviceWorkers:"block",locale:"en-GB"});
 const pageErrors=[];
 page.on("pageerror",e=>pageErrors.push(String(e.message)));
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{
   waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>
   typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function" &&
   typeof globalThis.AO_RUNTIME_V8?.resolver?.properResolver?.resolveSource==="function",
   null,{timeout:90000});
 const report=await page.evaluate(async()=>{
   const resolver=globalThis.AO_RUNTIME_V8.resolver;
   const {resolve1962AllSoulsAdditionalProper,is1962AllSoulsCalendarMass}
     =await import("/src/mass/1962-all-souls-source.js");
   const {deriveHostOptions}=await import("/src/mass/browser-entry.js");
   const date="2026-11-02";
   const first=await resolver.resolveDay(date,{formularyIndex:0});
   if(first?.status!=="ready"||first.day?.main?.id!=="sancti:11-02m1:1:b"||
     first.proper?.data?.sourcePath!=="Sancti/11-02m1")
     throw Error("ALL_SOULS_FIRST_ACTUAL_SOURCE_NOT_READY");
   const list=[first.proper.data];
   for(const number of [2,3]){
     const proper=await resolve1962AllSoulsAdditionalProper({
       calendarResolution:first,properResolver:resolver.properResolver,massNumber:number});
     if(proper.status!=="ready"||proper.data.sourcePath!=="Sancti/11-02m"+number)
       throw Error("ALL_SOULS_ADDITIONAL_PROPER_UNAVAILABLE:"+number);
     list.push(proper.data);
   }
   const required=["introit","epistle","gradual","sequence","gospel",
     "offertory","communion","preface"];
   const orations=["collects","secrets","postcommunions"];
   return list.map((proper,i)=>{
     const number=i+1,path="Sancti/11-02m"+number;
     const context={date,calendarDay:{id:"sancti:11-02m"+number+":1:b"},
       requestedCelebrationId:"mass_of_day",celebrationId:"mass_of_day",
       celebrationType:"calendar",proper:{status:"ready",data:proper}};
     const missing=[];
     for(const key of required)for(const lang of ["lat","en","fr"])
       if(!String(proper[key]?.[lang]??"").trim())missing.push(key+"."+lang);
     for(const key of orations)for(const lang of ["lat","en","fr"])
       if(!String(proper[key]?.[0]?.[lang]??"").trim())missing.push(key+"[0]."+lang);
     return {number,path,actualPath:proper.sourcePath,
       requiemRecognised:is1962AllSoulsCalendarMass(context),
       overlays:deriveHostOptions({resolvedMass:context}).overlays,
       missing,
       epistle:proper.epistle?.lat??null,
       gospel:proper.gospel?.lat??null,
       collect:proper.collects?.[0]?.lat??null,
       sequence:proper.sequence?.lat??null,
       gloria:proper.hasGloria??false,credo:proper.hasCredo??false};
   });
 });
 assert.equal(report.length,3);
 for(const item of report){
   assert.equal(item.actualPath,item.path);
   assert.equal(item.requiemRecognised,true,"Mass "+item.number+" not treated as Requiem");
   assert.deepEqual(item.overlays,["REQUIEM"]);
   assert.deepEqual(item.missing,[],"Mass "+item.number+" missing production translations");
   assert.ok(item.epistle.length>15&&item.gospel.length>15&&item.collect.length>15);
   assert.ok(item.sequence.includes("Dies")||item.sequence.includes("Dies"),
     "Mass "+item.number+" lost the Dies irae");
   assert.equal(item.gloria,false);
   assert.equal(item.credo,false);
 }
 assert.equal(new Set(report.map(x=>x.epistle)).size,3,
   "The three Masses lost their distinct appointed lessons");
 assert.equal(new Set(report.map(x=>x.gospel)).size,3,
   "The three Masses lost their distinct Gospels");
 assert.equal(new Set(report.map(x=>x.collect)).size,3,
   "The three Masses reused a different Mass's Collect");
 assert.deepEqual(pageErrors,[],"Production runtime threw during All Souls source resolution");
 console.log("PASS 2026-11-02 production All Souls I/II/III: three distinct Latin/EN/FR propers, Requiem overlays, no Gloria/Credo");
 await page.close();
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(ok=>server.close(ok));
}
