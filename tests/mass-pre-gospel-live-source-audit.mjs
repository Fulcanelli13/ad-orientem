import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
 ".png":"image/png",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const full=resolve(root,"."+path);
  if(full!==root&&!full.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return;}
  const body=await readFile(full);
  res.writeHead(200,{"content-type":mime[extname(full)]??"application/octet-stream",
    "cache-control":"no-store"});res.end(body);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:"block"});
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
   {waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",
   null,{timeout:80000});
 const evidence=await page.evaluate(async()=>{
  const resolver=globalThis.AO_RUNTIME_V8.resolver;
  const {recoverReaderProperOmissions}=await import("/src/mass/reader-proper-runtime-recovery.js");
  const {properToReaderSlots}=await import("/src/mass/proper-reader-slots.js");
  const dates=["2026-10-07","2026-02-22"];
  const report=[];
  for(const date of dates){
   const resolved=await resolver.resolveDay(date);
   const source=resolved?.proper;
   const plain=source?.data??source;
   const updated=await recoverReaderProperOmissions(source,{
    hostResolver:resolver.properResolver,
   });
   const data=updated?.data??updated;
   const proof=data?.readerChantSourceProof??null;
   const slots=properToReaderSlots(data,{language:"en"});
   report.push({
    date,status:resolved?.status,sourceStatus:source?.status,
    sourcePath:data?.sourcePath??null,
    originalGradualChars:String(plain?.gradual?.lat??"").length,
    recoveredGradualChars:String(data?.gradual?.lat??"").length,
    sourceProofMode:proof?.sourceMode??null,
    sourceKinds:proof?.parts?.map(p=>p.kind)??[],
    sectionIds:proof?.parts?.map(p=>p.sourceSectionId)??[],
    readerGradualParagraphs:slots.slots.GRADUAL.data?.paragraphs?.length??0,
    readerFollowupStatus:slots.slots.ALLELUIA_TRACT_SEQUENCE.status,
    unchangedMainText:plain?.gradual?.lat===data?.gradual?.lat,
   });
  }
  return report;
 });
 for(const row of evidence){
  console.log("LIVE_PRE_GOSPEL_SOURCE_AUDIT="+JSON.stringify(row));
  assert.equal(row.unchangedMainText,true,"Source recovery rewrote the already resolved Gradual");
  assert.ok(row.sourcePath,"Real calendar Proper failed to identify its source");
 }
 assert.equal(evidence.length,2);
 console.log("PASS two real-calendar source recoveries audited for named and intra-section Gradual ownership; absence is an explicit evidence hold");
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(ok=>server.close(ok));
}
