import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
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
 await page.waitForFunction(()=>document.getElementById("ao-tenebrae-shared-reader-v1")?.sheet?.cssRules?.length>0,
   null,{timeout:15000});
 assert.equal(await page.locator("#ao-tenebrae-shared-reader-v1").count(),1,
  "Tenebrae module should load the shared liturgical reader stylesheet once");
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
   assert.equal(await page.locator('#aoPray435930 .aoTenebBody').getAttribute("data-ao-liturgical-reader"),"tenebrae");
   assert.equal(await page.locator('#aoPray435930 .aoTenebReaderRibbon').count(),1);
   assert.equal(await page.locator('#aoPray435930 .aoTenebReaderRibbon [data-p435930-tenebrae-face]').count(),1);
   assert.equal(await page.locator('#aoPray435930 .aoTenebReading [data-p435930-tenebrae-face]').count(),0,
      "Language switch should have one stable ribbon owner rather than repeat on cards");
   assert.equal(await page.locator('#aoPray435930 .aoTenebReading[data-tenebrae-section]').getAttribute("data-tenebrae-section"),hour==="MATINS"?"M.N1.P1":"L.P1");
   assert.equal(await page.locator('#aoPray435930 .aoTenebStageNav').evaluate(node=>getComputedStyle(node).position),"sticky",
      "Office progress and section jump must remain in the shared reading header");
   const ribbon=await page.locator('#aoPray435930 .aoTenebReaderRibbon').evaluate(node=>({
     background:getComputedStyle(node).backgroundImage,
     display:getComputedStyle(node).display,
   }));
   assert.equal(ribbon.display,"flex","Tenebrae should share a compact reading ribbon");
   assert.match(ribbon.background,/linear-gradient/,"Tenebrae ribbon must use the dark gradient liturgical surface");
   const progress=page.locator('#aoPray435930 .aoTenebStageNav .aoDevoProgress');
   assert.equal(await progress.count(),1,"One shared Tenebrae progress track");
   assert.equal(await progress.getAttribute("aria-valuenow"),"1");
   assert.equal(await progress.getAttribute("aria-valuemax"),hour==="MATINS"?"32":"10");
   if(day===0){
     const shotDir=resolve(root,"artifacts/tenebrae-reader-parity");
     await mkdir(shotDir,{recursive:true});
     await page.locator('#aoPray435930 .aoTenebBody').screenshot({
       path:resolve(shotDir,hour.toLowerCase()+"-390px.png"),
       animations:"disabled",
     });
   }
   assert.equal(await page.locator('#aoPray435930 [data-p435930-tenebrae-move]').count(),0,
      "No redundant Previous/Next buttons");
   const reading=page.locator('#aoPray435930 .aoTenebReading');
   const swipe=async(dx,dy)=>{
    await page.locator('#aoPray435930 .aoTenebReading').evaluate((el,{dx,dy})=>{
     const touch=(x,y)=>new Touch({identifier:1,target:el,clientX:x,clientY:y});
     el.dispatchEvent(new TouchEvent("touchstart",{bubbles:true,touches:[touch(250,340)],changedTouches:[touch(250,340)]}));
     el.dispatchEvent(new TouchEvent("touchend",{bubbles:true,touches:[],changedTouches:[touch(250+dx,340+dy)]}));
    },{dx,dy});
   };
   await swipe(8,-150);
   assert.equal(await reading.getAttribute("data-tenebrae-section"),hour==="MATINS"?"M.N1.P1":"L.P1",
    "Vertical scroll must never advance the Office card");
   await swipe(-160,8);
   assert.equal(await reading.getAttribute("data-tenebrae-section"),hour==="MATINS"?"M.N1.P2":"L.P2",
    "Horizontal swipe must advance exactly one source-owned step");
   assert.equal(await progress.getAttribute("aria-valuenow"),"2",
    "Tenebrae progress did not follow stage change");
   await page.locator('#aoPray435930 .aoTenebReading').focus();
   await page.keyboard.press("ArrowLeft");
   assert.equal(await reading.getAttribute("data-tenebrae-section"),hour==="MATINS"?"M.N1.P1":"L.P1",
    "Keyboard left must return one step");
   assert.equal(await progress.getAttribute("aria-valuenow"),"1");
   await page.keyboard.press("ArrowRight");
   assert.equal(await reading.getAttribute("data-tenebrae-section"),hour==="MATINS"?"M.N1.P2":"L.P2",
    "Keyboard right must advance one step");
  }
 }
 await page.locator('#aoPray435930 [data-p435930-tenebrae-hour="MATINS"]').click();
 await page.locator('#aoPray435930 [data-p435930-tenebrae-face]').click();
 assert.equal(await page.locator('#aoPray435930 [data-p435930-tenebrae-face]').getAttribute("aria-pressed"),"true");
 assert.equal(await page.locator('#aoPray435930 .aoTenebPrayer').getAttribute("lang"),"la");
 assert.match(await page.locator('#aoPray435930 .aoTenebPrayer').textContent(),/In pace/);
 await page.locator('#aoPray435930 [data-p435930-tenebrae-face]').click();
 assert.equal(await page.locator('#aoPray435930 [data-p435930-tenebrae-face]').getAttribute("aria-pressed"),"false");
 assert.equal(await page.locator('#aoPray435930 .aoTenebPrayer').getAttribute("lang"),"en");
 assert.equal(await page.locator('#aoPray435930 .aoTenebGuideIntro').count(),1,"About Tenebrae is always available");
 await page.locator('#aoPray435930 [data-p435930-tenebrae-mode="simple"]').click();
 assert.equal(await page.locator('#aoPray435930 .aoTenebBody').getAttribute("data-tenebrae-mode"),"simple");
 assert.equal(await page.locator('#aoPray435930 .aoTenebContext').count(),0);
 await page.locator('#aoPray435930 [data-p435930-tenebrae-mode="guided"]').click();
 assert.equal(await page.locator('#aoPray435930 .aoTenebBody').getAttribute("data-tenebrae-mode"),"guided");
 assert.equal(await page.locator('#aoPray435930 .aoTenebContext').count(),1);
 await page.locator('#aoPray435930 [data-p435930-tenebrae-jump="20"]').click();
 assert.equal(await page.locator('#aoPray435930 .aoTenebReading').getAttribute("data-tenebrae-section"),"M.N3.P1");
 await page.locator('#aoPray435930 [data-p435930-tenebrae-jump="0"]').click();
 assert.equal(await page.locator('#aoPray435930 .aoTenebReading').getAttribute("data-tenebrae-section"),"M.N1.P1");
 const overflow=await page.evaluate(()=>{
  const el=document.querySelector("#aoPray435930 .aoTenebBody");
  return el?el.scrollWidth-el.clientWidth:null
 });
 assert.ok(overflow!==null&&overflow<4,"Tenebrae horizontal mobile overflow: "+overflow);
 await page.setViewportSize({width:320,height:750});
 const narrow=await page.evaluate(()=>{
   const body=document.querySelector("#aoPray435930 .aoTenebBody");
   const content=document.querySelector("#aoPray435930 .aoTenebReading");
   return {overflow:body.scrollWidth-body.clientWidth,cardWidth:content.getBoundingClientRect().width};
 });
 assert.ok(narrow.overflow<4,"Tenebrae must not overflow a 320px mobile reader: "+JSON.stringify(narrow));
 assert.ok(narrow.cardWidth>240&&narrow.cardWidth<=320,"Tenebrae reading surface is unusable at 320px: "+JSON.stringify(narrow));
 await page.setViewportSize({width:390,height:844});
 assert.deepEqual(external.filter(url=>/Quad6-[456]|Psalm(?:50|68|231)/i.test(url)),[],
   "Tenebrae text/psalter must never request upstream URLs at runtime");
 assert.ok(requests.some(r=>r.endsWith("/psalms-01.json")),"Offline Psalter not loaded");
 assert.equal(errors.length,0,"Tenebrae phone console errors: "+errors.join(" | "));
 console.log("Tenebrae 390px phone PASS — all six 1960 Offices open in PRAY, local source loads, day/hour nav, verse progression, Latin toggle, zero external text fetch.");
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
