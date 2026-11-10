// P0: report the *actual* 10 November 2026 1962 source resolution, not a
// synthetic St Andrew Avellino Proper. Fail closed if its inherited Common or
// selected Calendar owner is unavailable. Required before touching Mass UI.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",
".svg":"image/svg+xml",".png":"image/png",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,"http://localhost").pathname);
  const file=resolve(root,"."+path);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream",
   "cache-control":"no-store"});res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,
  hasTouch:true,serviceWorkers:"block"});
 const errors=[];page.on("pageerror",e=>errors.push(String(e)));
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
  {waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",
  null,{timeout:90000});
 const result=await page.evaluate(async()=>{
  const date="2026-11-10";
  const resolved=await globalThis.AO_RUNTIME_V8.resolver.resolveDay(date);
  const proper=resolved?.proper?.data;
  return {
   date,status:resolved?.status,properStatus:resolved?.proper?.status,
   mainId:resolved?.day?.main?.id,mainTitle:resolved?.day?.main?.title,
   sourcePath:proper?.sourcePath,
   includesDaySource:String(proper?.sourcePath||"").includes("11-10"),
   collected:proper?.collects?.length??0,secret:proper?.secrets?.length??0,
   postcommunion:proper?.postcommunions?.length??0,
   introit:proper?.introit?.lat||proper?.introit?.la||null,
   gospel:proper?.gospel?.lat||proper?.gospel?.la||null,
   unavailableReason:resolved?.proper?.reason||resolved?.proper?.error||
    resolved?.error||null,
   sourceStatus:resolved?.proper?.sourceStatus??null
  };
 });
 console.log("NOV10_1962_ACTUAL_RESOLVER="+JSON.stringify(result));
 assert.equal(result.date,"2026-11-10");
 assert.equal(result.status,"ready","Date-level source not ready");
 assert.equal(result.properStatus,"ready","Actual saint/common Proper not ready");
 assert.ok(result.mainId,"Missing independently resolved Calendar owner");
 assert.ok(result.sourcePath,"No exact 1962 selected Proper");
 assert.ok(result.collected>=1&&result.secret>=1&&result.postcommunion>=1,
  "Required inherited Common/saint orations absent");
 assert.ok(result.introit&&result.gospel,"Complete appointed Mass texts absent");
 assert.deepEqual(errors,[],"Client runtime errors");
 console.log("NOV10_1962_PROPER_START_READY_PASS");
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
