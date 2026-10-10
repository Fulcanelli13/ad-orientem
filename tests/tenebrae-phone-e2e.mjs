import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".woff2":"font/woff2",".jpg":"image/jpeg",".webp":"image/webp"};
const requests=[];
const server=http.createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+path);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return}
  const content=await readFile(file);
  requests.push(path);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(content);
 }catch(err){res.writeHead(err?.code==="ENOENT"?404:500);res.end(String(err?.message??err))}
});
await new Promise((ok,bad)=>{server.once("error",bad);server.listen(4216,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true,channel:"chromium"});
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,locale:"en-GB",serviceWorkers:"block"});
 const page=await context.newPage(),errors=[],external=[];
 page.on("pageerror",e=>errors.push(String(e.message)));
 page.on("request",r=>{if(/divinumofficium|github.com/i.test(r.url()))external.push(r.url())});
 await page.goto("http://127.0.0.1:4216/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:30000});
 assert.equal(await page.evaluate(async()=>globalThis.AO_PRAY_APP_V1.open()),true);
 await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
 assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.tenebrae",{returnContext:null})),true);
 for(let day=0;day<3;day++){
  if(day)await page.locator('#aoPray435930 [data-p435930-tenebrae-day="'+day+'"]').click();
  for(const hour of ["MATINS","LAUDS"]){
   if(hour==="LAUDS")await page.locator('#aoPray435930 [data-p435930-tenebrae-hour="LAUDS"]').click();
   else if(day)await page.locator('#aoPray435930 [data-p435930-tenebrae-hour="MATINS"]').click();
   await page.waitForFunction(({day,hour})=>{
     const root=document.querySelector("#aoPray435930 .aoTenebBody");
     if(root?.dataset?.tenebraeReady!=="true")return false;
     const state=globalThis.AO_PRAY_V435930?.state?.();
     return !!state&&state.view==="tenebrae"&&root.querySelector(".aoTenebReading");
   },{day,hour},{timeout:25000});
   assert.equal(await page.locator('#aoPray435930 .aoTenebReading').count(),1);
   assert.equal(await page.locator('#aoPray435930 .aoTenebReading[data-tenebrae-section]').getAttribute("data-tenebrae-section"),hour==="MATINS"?"M.N1.P1":"L.P1");
   assert.equal(await page.locator('#aoPray435930 .aoTenebFooter span').textContent(),hour==="MATINS"?"1 / 30":"1 / 10");
   await page.locator('#aoPray435930 [data-p435930-tenebrae-move="next"]').click();
   assert.equal(await page.locator('#aoPray435930 .aoTenebReading').getAttribute("data-tenebrae-section"),hour==="MATINS"?"M.N1.P2":"L.P2");
  }
 }
 await page.locator('#aoPray435930 [data-p435930-tenebrae-hour="MATINS"]').click();
 await page.locator('#aoPray435930 [data-p435930-tenebrae-face]').click();
 assert.equal(await page.locator('#aoPray435930 .aoTenebPrayer').getAttribute("lang"),"la");
 assert.match(await page.locator('#aoPray435930 .aoTenebPrayer').textContent(),/In pace/);
 await page.locator('#aoPray435930 [data-p435930-tenebrae-face]').click();
 assert.equal(await page.locator('#aoPray435930 .aoTenebPrayer').getAttribute("lang"),"en");
 const overflow=await page.evaluate(()=>{
  const el=document.querySelector("#aoPray435930 .aoTenebBody");
  return el?el.scrollWidth-el.clientWidth:null
 });
 assert.ok(overflow!==null&&overflow<4,"Tenebrae horizontal mobile overflow: "+overflow);
 assert.deepEqual(external,[],"In-app Tenebrae must not use external redirected texts");
 assert.ok(requests.some(r=>r.endsWith("/psalms-01.json")),"Offline Psalter not loaded");
 assert.equal(errors.length,0,"Tenebrae phone console errors: "+errors.join(" | "));
 console.log("Tenebrae 390px phone PASS — all six 1960 Offices open in PRAY, local source loads, day/hour nav, verse progression, Latin toggle, zero external text fetch.");
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
