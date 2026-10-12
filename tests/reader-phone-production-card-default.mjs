import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/curated65-phone");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
  ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
  ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
  ".webp":"image/webp",".jpg":"image/jpeg",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const name=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+name);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return;}
  const payload=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(payload);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e));}
});
await new Promise((ok,no)=>{server.once("error",no);server.listen(4284,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 await mkdir(out,{recursive:true});
 for(const option of [
  {label:"ordinary64",query:"production=1",cards:65,visible:64,curated:"true"},
  {label:"optional65",query:"production=1&secondConfiteor=1",cards:65,visible:65,curated:"true"},
  {label:"rollback48",query:"production=1&aoLiveCards=48",cards:48,visible:48,curated:"false"},
 ]){
  const context=await browser.newContext({viewport:{width:390,height:844},
    isMobile:true,hasTouch:true,deviceScaleFactor:1,locale:"en-GB"});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(String(e?.message??e)));
  await page.goto("http://127.0.0.1:4284/tests/fixtures/reader-phone-harness.html?"+option.query,
    {waitUntil:"networkidle",timeout:60000});
  await page.waitForFunction(()=>document.documentElement.dataset.harnessReady!=="undefined" &&
    ["true","error"].includes(document.documentElement.dataset.harnessReady),null,{timeout:30000});
  const result=await page.evaluate(()=>{
   const app=window.__AO_PHONE_PREVIEW;
   const node=document.querySelector("#ao-r17-native-reader-preview");
   return {error:window.__AO_PHONE_HARNESS_ERROR??null,
    source:app?.sourceModel?.totalCards,model:app?.model?.totalCards,
    curator:node?.dataset.r17CuratedReview,
    title:app?.getCurrentCard?.()?.title,
    progress:node?.querySelector('[data-role="progress"]')?.textContent??"",
    overflow:document.documentElement.scrollWidth>innerWidth+1};
  });
  assert.equal(result.error,null,option.label+": "+result.error);
  assert.equal(result.source,39,option.label);
  assert.equal(result.model,option.cards,option.label);
  assert.equal(result.curator,option.curated,option.label);
  assert.match(result.progress,new RegExp("1 / "+option.visible+"$"),option.label+" visible-card progress");
  assert.equal(result.overflow,false,option.label+" horizontal overflow");
  assert.ok(result.title,option.label+" must have a named prayer card");
  await page.screenshot({path:resolve(out,"production-"+option.label+"-390.png"),
    animations:"disabled"});
  assert.equal(errors.length,0,option.label+": "+errors.join(" | "));
  await context.close();
 }
 console.log("PASS LIVE production default: 64 ordinary / 65 optional second Confiteor; exact source and visible counts, explicit 48 rollback on real 390px mobile app entry");
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(ok=>server.close(ok));
}
