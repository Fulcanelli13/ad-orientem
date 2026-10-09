import assert from "node:assert/strict";
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

// Check the application's ACTUAL 1962 DayResolver and source paths.
// No resolver stubs or publication mutations. This is an integration gate,
// separate from the native-reader E2E exercising real checked-in Proper files.
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json",
 ".css":"text/css",".svg":"image/svg+xml",".png":"image/png",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const uri=new URL(req.url,"http://127.0.0.1").pathname;
  const path=decodeURIComponent(uri);
  const file=resolve(root,"."+path);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return}
  const data=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(data);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,serviceWorkers:"block"});
 const page=await context.newPage();
 const errors=[];page.on("pageerror",error=>errors.push(error.message));
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",
  null,{timeout:20000});
 for(const date of ["2024-05-06","2027-05-03","2027-05-04","2027-05-05"]){
  const evidence=await page.evaluate(async date=>{
   const resolved=await globalThis.AO_RUNTIME_V8.resolver.resolveDay(date);
   const {resolvedRogationCandidate}=await import("/src/mass/rogation-preflight.js");
   const host={date,canStart:true,requestedCelebrationId:"mass_of_day",
     celebrationId:"mass_of_day"};
   const outcome=resolvedRogationCandidate(host,resolved,{requireResolver:true});
   return {
    date,eligible:outcome.eligible,votiveAllowed:outcome.votiveAllowed,authority:outcome.authority,
    status:resolved?.status,properStatus:resolved?.proper?.status,
    sourcePath:resolved?.proper?.data?.sourcePath??null,
    properId:resolved?.proper?.data?.id??null,
    rank:resolved?.day?.main?.rank??null,
    dayTitle:resolved?.day?.main?.title??null,
    dayKeys:Object.keys(resolved?.day??{}).slice(0,12),
    properKeys:Object.keys(resolved?.proper?.data??{}).slice(0,12),
    errors:resolved?.diagnostic?.errors??[]
   };
  },date);
  console.log("ACTUAL_ROGATION_DAYRESOLVER",JSON.stringify(evidence));
  assert.equal(evidence.eligible,true,
   "Actual DayResolver must certify the Minor Rogation date and the day's real Proper: "+JSON.stringify(evidence));
  assert.equal(evidence.authority,"DAY_RESOLVER");
  assert.ok([2,3,4].includes(Number(evidence.rank))&&evidence.votiveAllowed,
   "The conditional II-class Rogation Mass must be eligible on an unimpeded day: "+JSON.stringify(evidence));
 }
 await context.close();
 console.log("Actual DayResolver Minor Rogation 1962 weekday eligibility: PASS");
}finally{await browser?.close();await new Promise(ok=>server.close(()=>ok()))}
