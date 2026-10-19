import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+path);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("Forbidden");return}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream"});
  res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}
});
await new Promise((ok,bad)=>{server.once("error",bad);server.listen(4382,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390]){
  const ctx=await browser.newContext({viewport:{width,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  for(const rite of ["mass","asperges","palm","ash","candlemas"]){
   const page=await ctx.newPage(),errors=[];
   page.on("pageerror",error=>errors.push(String(error.message??error)));
   const query=new URLSearchParams({mode:"LIVE",...(rite==="mass"?{}:{rite})});
   await page.goto("http://127.0.0.1:4382/tests/fixtures/reader-phone-harness.html?"+query,
     {waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>["true","error"].includes(document.documentElement.dataset.harnessReady),
     null,{timeout:90000});
   assert.equal(await page.evaluate(()=>document.documentElement.dataset.harnessReady),"true",
     rite+": "+await page.evaluate(()=>globalThis.__AO_PHONE_HARNESS_ERROR??""));
   assert.equal(await page.locator("[data-reader-nav]").count(),0,
     "Reader rendered invisible or visible edge navigation buttons: "+rite+" "+width+"px");
   assert.equal(await page.locator(".ao-prayer-card").getAttribute("aria-keyshortcuts"),
     "ArrowLeft ArrowRight");
   assert.equal(await page.locator("#ao-reader-navigation-instructions").count(),1);
   assert.equal(await page.locator('[data-role="section-jump"]').count(),1,
     "Source section jump should remain available");
   const card=()=>page.evaluate(()=>window.__AO_PHONE_PREVIEW.getCurrentCard()?.id
     ??window.__AO_PHONE_PREVIEW.getCurrentCard()?.sectionId??null);
   const initial=await card();
   assert.ok(initial,rite+" missing starting card");
   const cdp=await ctx.newCDPSession(page);
   const swipe=async(horizontal,forward=true)=>{
    const box=await page.locator(".ao-prayer-card").boundingBox();
    assert.ok(box && box.height>120 && box.width>200,"Card has no touch surface");
    const x=Math.round(box.x+box.width*(forward?.78:.22));
    const y=Math.round(box.y+Math.min(box.height*.40,250));
    const x2=Math.round(box.x+box.width*(forward?.22:.78));
    const y2=Math.round(y-145);
    await cdp.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x,y}]});
    for(let step=1;step<=5;step++){
      const xNow=horizontal?Math.round(x+(x2-x)*step/5):x;
      const yNow=horizontal?y:Math.round(y+(y2-y)*step/5);
      await cdp.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x:xNow,y:yNow}]});
    }
    await cdp.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
   };
   await swipe(false);
   assert.equal(await card(),initial,"Vertical swipe advanced source card in "+rite);
   await swipe(true,true);
   await page.waitForFunction(prev=>
     (globalThis.__AO_PHONE_PREVIEW.getCurrentCard()?.id
      ??globalThis.__AO_PHONE_PREVIEW.getCurrentCard()?.sectionId)!==prev,
     initial,{timeout:8000});
   const next=await card();
   assert.notEqual(next,initial,rite+" horizontal left swipe did not advance");
   assert.equal(await page.evaluate(()=>
     document.querySelector("#ao-r17-native-reader-preview")?.dataset.aoLastNavInput),
     "swipe:next",rite+" did not use source-owned swipe navigation");
   await page.waitForTimeout(440);
   await swipe(true,false);
   await page.waitForFunction(prev=>
     (globalThis.__AO_PHONE_PREVIEW.getCurrentCard()?.id
      ??globalThis.__AO_PHONE_PREVIEW.getCurrentCard()?.sectionId)===prev,
     initial,{timeout:8000});
   assert.equal(await card(),initial,"Swipe back did not restore source card");
   await page.locator(".ao-prayer-card").focus();
   await page.keyboard.press("ArrowRight");
   await page.waitForFunction(prev=>
     (globalThis.__AO_PHONE_PREVIEW.getCurrentCard()?.id
      ??globalThis.__AO_PHONE_PREVIEW.getCurrentCard()?.sectionId)!==prev,
     initial,{timeout:8000});
   assert.equal(await card(),next,"Keyboard did not reach same source card as swipe");
   await page.locator(".ao-prayer-card").focus();
   await page.keyboard.press("ArrowLeft");
   await page.waitForFunction(prev=>
     (globalThis.__AO_PHONE_PREVIEW.getCurrentCard()?.id
      ??globalThis.__AO_PHONE_PREVIEW.getCurrentCard()?.sectionId)===prev,
     initial,{timeout:8000});
   assert.deepEqual(errors,[],rite+" generated page errors");
   await page.close();
  }
  await ctx.close();
 }
 console.log("PASS swipe-first Mass/Asperges/Palm/Ash/Candlemas: 320/390px no arrows, native vertical scroll, reversible horizontal swipes, keyboard+section jump retained.");
}finally{
 await browser?.close();
 await new Promise(resolve=>server.close(resolve));
}
