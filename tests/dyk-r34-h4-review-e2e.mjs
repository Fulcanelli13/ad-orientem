import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {chromium} from "@playwright/test";

const root=resolve(".");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".json":"application/json; charset=utf-8",".mjs":"text/javascript; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const abs=resolve(root,"."+path);
  if(abs!==root&&!abs.startsWith(root+sep)){res.writeHead(403);return res.end("forbidden")}
  const file=await readFile(abs);
  res.writeHead(200,{"content-type":mime[extname(abs)]||"application/octet-stream","cache-control":"no-store"});
  res.end(file);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
const origin="http://127.0.0.1:"+server.address().port;
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [390,1280]){
  const page=await browser.newPage({viewport:{width,height:844},isMobile:width===390,hasTouch:width===390});
  const errors=[];page.on("pageerror",e=>errors.push(String(e)));
  try{
   await page.goto(origin+"/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:60000});
   await page.waitForSelector(".homeScreen.aoH7Screens .aoH7HomeView",{state:"visible",timeout:45000});
   await page.waitForFunction(()=>{
    const splash=document.querySelector("#ao-cinema-boot");
    if(splash?.isConnected&&getComputedStyle(splash).display!=="none"&&
       getComputedStyle(splash).visibility!=="hidden"&&
       splash.getAttribute("aria-hidden")!=="true")return false;
    const state=globalThis.AO_RUNTIME_V8?.store?.getState?.();
    return state?.route==="home"&&!state.resolving;
   },null,{timeout:45000});
   assert.equal(await page.locator(".homeScreen [data-dyk-r34-review]").count(),0,
    "Default H7 Home must not display unpublished R34 discoveries");
   assert.equal(await page.locator(".homeScreen [data-home-dyk-open]").count(),1,
    "Public six-card Discovery must remain intact");

   await page.goto(origin+"/index.html?aoR17Reader=native&aoDykR34Review=1",
    {waitUntil:"domcontentloaded",timeout:60000});
   await page.waitForSelector(".homeScreen.aoH7Screens .aoH7HomeView",{state:"visible",timeout:45000});
   const review=page.locator(".homeScreen [data-dyk-r34-review]");
   await review.waitFor({state:"visible",timeout:45000});
   assert.equal(await page.locator(".homeScreen [data-home-dyk-open]").count(),1,
    "Review hook must not replace the original six-card Discovery");
   assert.equal(await page.locator(".homeScreen .aoTodayV2Tabs").count(),0,
    "Approved H4 must not revert to legacy tabs");
   const buttons=review.locator("button[data-dyk-r34-source]");
   assert.equal(await buttons.count(),7);
   for(let i=0;i<7;i++){
    const button=buttons.nth(i);
    const id=await button.getAttribute("data-dyk-r34-source");
    await button.click();
    const dialog=page.locator(".aoDykSourceCard[data-dyk-source-folio='"+id+"']");
    await dialog.waitFor({state:"visible",timeout:30000});
    assert.equal(await dialog.getAttribute("role"),"dialog");
    assert.equal(await dialog.getAttribute("aria-modal"),"true");
    const url=await dialog.locator("a[data-dyk-original-source]").getAttribute("href");
    const expected=await page.evaluate(key=>{
      // Uses the same canonical JSON that the H4 review module loads, not
      // an independent hand-written list of purported source locators.
      return fetch("/data/research/did-you-know/dyk-r34-high-signal-24-editorial-selection.v1.json")
        .then(r=>r.json()).then(data=>{
          const source=data.records.find(x=>x.id===key).pilot_source_folio;
          return source.url+"#page="+source.pdf_pages_1based[0];
        });
    },id);
    assert.equal(url,expected,"Original source PDF page link wrong for "+id);
    const secondary=dialog.locator("a[data-dyk-second-source]");
    if(id==="DYK-M04-CANON-047"){
      assert.equal(url.endsWith("#page=13"),true,"Memento of the living opens VIII.3");
      assert.equal(await secondary.count(),1,"Dual Canon fact requires departed source");
      assert.equal((await secondary.getAttribute("href")).endsWith("#page=16"),true,
        "Memento of departed opens IX.2");
    }else assert.equal(await secondary.count(),0,"Other facts must not invent a second source");
    // From Close, reverse-Tab must reach the last source link, including
    // the departed Memento when the fact has two citations.
    await dialog.locator("[data-dyk-source-close]").focus();
    await page.keyboard.press("Shift+Tab");
    const lastSource=id==="DYK-M04-CANON-047"?secondary:dialog.locator("a[data-dyk-original-source]");
    assert.equal(await lastSource.evaluate(el=>document.activeElement===el),true,
      "Modal reverse focus must include its last cited source: "+id);
    await page.keyboard.press("Tab");
    assert.equal(await dialog.locator("[data-dyk-source-close]").evaluate(el=>document.activeElement===el),true,
      "Modal forward focus must return to Close: "+id);
    const bounds=await dialog.evaluate(node=>{
      const box=node.getBoundingClientRect();
      return {left:box.left,right:box.right,viewport:innerWidth,
        bodyWidth:document.documentElement.scrollWidth};
    });
    assert.ok(bounds.left>=-1&&bounds.right<=width+1,
      "Source detail clipped horizontally: "+JSON.stringify(bounds));
    assert.ok(await dialog.locator(".aoDykSourceMain").innerText(),
      "Fact text disappeared from review folio");
    await page.keyboard.press("Escape");
    assert.equal(await page.locator(".aoDykSourceCard").count(),0,"Escape must close source");
    assert.equal(await button.evaluate(el=>document.activeElement===el),true,
      "Source reader must restore focus to triggering review card");
   }
   assert.equal(errors.length,0,"H4 source review page errors: "+errors.join(" | "));
  }finally{await page.close()}
 }
 console.log("PASS H7 R34 QA: normal Home unchanged, seven real opt-in source journeys at 390/1280px, exact PDF pages and focus restore");
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(ok=>server.close(ok));
}
