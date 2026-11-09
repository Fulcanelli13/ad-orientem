// M45: real canonical 65-card Order of Mass, actual inline Kyrie XVI notation.
// No debug URL switch, no automatic song assignment or approved-score claim.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const captures=resolve(root,".tmp/m45-kyrie-inline-notation");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const name=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+name);
  if(file!==root&&!file.startsWith(root+sep)){
   res.writeHead(403);res.end("forbidden");return;
  }
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream",
   "cache-control":"no-store"});res.end(bytes);
 }catch(err){res.writeHead(err?.code==="ENOENT"?404:500);res.end(String(err?.message??err))}
});
await new Promise((ok,no)=>{server.once("error",no);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 await mkdir(captures,{recursive:true});
 const base="http://127.0.0.1:"+server.address().port;
 for(const [width,mode] of [[320,"live"],[390,"live"],[320,"missal"],[390,"missal"]]){
  const context=await browser.newContext({viewport:{width,height:844},
   isMobile:true,hasTouch:true,deviceScaleFactor:1});
  try{
   const page=await context.newPage();
   const errors=[];page.on("pageerror",e=>errors.push(String(e?.message??e)));
   const query=new URLSearchParams({production:"1",print:"1",notation:"1",
     form:"MISSA_CANTATA_INCENSE",mode});
   await page.goto(base+"/tests/fixtures/reader-phone-harness.html?"+query,
      {waitUntil:"domcontentloaded",timeout:60000});
   await page.waitForFunction(()=>["true","error"].includes(
      document.documentElement.dataset.harnessReady),null,{timeout:35000});
   const initial=await page.evaluate(()=>{
    const api=window.__AO_PHONE_PREVIEW;
    if(!api)return {error:window.__AO_PHONE_HARNESS_ERROR};
    const card=api.model.cards.find(c=>JSON.stringify(c).includes("AO.SM.C0044"));
    if(!card)return {error:"MISSING_KYRIE_SOURCE_CUE"};
    api.showSequence(card.sequence);
    return {error:null,cards:api.model.totalCards,sourceCards:api.sourceModel.totalCards};
   });
   assert.equal(initial.error,null,JSON.stringify(initial));
   assert.equal(initial.sourceCards,30);
   assert.ok(initial.cards>=65);
   if(mode==="live")assert.equal(initial.cards,65);
   const paragraph=page.locator('[data-cue-id="AO.SM.C0044"]');
   const chooser=page.locator('[data-ordinary-reference-chooser="KYRIE"] select');
   await chooser.waitFor({timeout:20000});
   assert.equal(await chooser.count(),1);
   assert.equal(await chooser.inputValue(),"",
     "Kyrie research setting cannot be inferred from the calendar or default form");
   assert.equal(await page.locator('[data-reference-score="GREGOBASE-545"]').count(),0);
   await chooser.selectOption("MASS_16");
   const ref=page.locator('[data-reference-score="GREGOBASE-545"]');
   await page.waitForFunction(()=>!!document.querySelector(
     '[data-reference-score="GREGOBASE-545"][data-reference-ready="true"] svg'),null,
     {timeout:35000});
   assert.equal(await ref.count(),1);
   assert.equal(await ref.getAttribute("data-approved"),"false");
   assert.equal(await ref.getAttribute("data-reference-ordinary-setting"),"MASS_16");
   assert.equal(await ref.getAttribute("data-reference-ordinary-movement"),"KYRIE");
   assert.equal(await paragraph.locator('[data-reference-score="GREGOBASE-545"]').count(),1,
     "One selected complete score at its canonical source cue, not another Mass card");
   assert.ok((await paragraph.locator(".ao-line-primary").textContent())?.length>3);
   assert.match(await ref.locator(".ao-proper-reference-label").textContent(),/research transcription/i);
   const original=ref.locator("[data-ordinary-printed-source]");
   assert.equal(await original.count(),1);
   assert.equal(await original.getAttribute("target"),"_blank");
   assert.match(await original.getAttribute("href"),/kyriale-solesmes\.pdf#page=56$/);
   await ref.locator(".ao-proper-reference-expand").click();
   const dlg=page.locator("dialog.ao-proper-reference-zoom");
   await dlg.waitFor({state:"visible",timeout:20000});
   assert.equal(await dlg.getAttribute("data-reference-zoom-mode"),"fit");
   assert.match(await dlg.locator(".ao-proper-reference-provenance").textContent(),/not musically certified/i);
   assert.match(await dlg.locator("[data-reference-zoom-original]").getAttribute("href"),
     /kyriale-solesmes\.pdf#page=56$/);
   assert.match(await dlg.locator("[data-reference-zoom-transcription]").getAttribute("href"),
     /gregobase\.selapa\.net\/chant\.php\?id=545$/);
   await page.waitForFunction(()=>!!document.querySelector(
     "dialog.ao-proper-reference-zoom .ao-proper-reference-wide svg"),null,{timeout:35000});
   const geometry=()=>page.evaluate(()=>{
    const dlg=document.querySelector("dialog.ao-proper-reference-zoom");
    const viewport=dlg?.querySelector(".ao-proper-reference-scroll");
    const wide=dlg?.querySelector(".ao-proper-reference-wide");
    return {dialogOpen:dlg?.open,mode:dlg?.dataset.referenceZoomMode,
      wideWidth:wide?.clientWidth,viewportWidth:viewport?.clientWidth,
      hasSvg:!!wide?.querySelector("svg"),overflow:document.documentElement.scrollWidth-innerWidth};
   });
   const fitted=await geometry();
   assert.ok(fitted.dialogOpen&&fitted.hasSvg&&fitted.wideWidth<=fitted.viewportWidth+1,
     "Fit screen must show notation without forced page-width scrolling");
   const resize=dlg.locator("[data-reference-zoom-size]");
   await resize.click();
   assert.equal(await resize.getAttribute("aria-pressed"),"true");
   const large=await geometry();
   assert.equal(large.mode,"large");
   assert.ok(large.wideWidth>=840&&large.wideWidth>large.viewportWidth,
     "Large print must offer scrollable full-size notation");
   await resize.click();
   assert.equal(await resize.getAttribute("aria-pressed"),"false");
   assert.equal((await geometry()).mode,"fit");
   await dlg.locator('button[aria-label="Close enlarged Gregorian notation"]').click();
   assert.equal(await dlg.count(),0);
   assert.equal(await ref.count(),1);
   const toggle=ref.locator(".ao-proper-reference-toggle");
   await toggle.click();
   assert.equal(await ref.getAttribute("data-reference-view"),"text");
   await toggle.click();
   assert.equal(await ref.getAttribute("data-reference-view"),"notation");
   assert.ok((await paragraph.locator(".ao-line-primary").textContent())?.length>3);
   const size=await page.evaluate(()=>({width:innerWidth,
     pageWidth:document.documentElement.scrollWidth}));
   assert.ok(size.pageWidth<=size.width+1,
     "Inline score must not overflow the 320/390px reader");
   await page.screenshot({path:resolve(captures,`m45-kyrie-xvi-${mode}-${width}.png`),
      animations:"disabled"});
   // Clearing the explicit choice must remove the stale GABC immediately.
   await chooser.selectOption("");
   assert.equal(await page.locator('[data-reference-score="GREGOBASE-545"]').count(),0);
   assert.ok((await paragraph.locator(".ao-line-primary").textContent())?.length>3);
   assert.deepEqual(errors,[],"No reader runtime errors");
   console.log("PASS M45 genuine Order of Mass Kyrie XVI",JSON.stringify({
     width,mode,sourceCardCount:initial.sourceCards,readerCards:initial.cards,
     fitted,large,textPreserved:true,sourceOriginalPage:56,approved:false}));
  }finally{await context.close()}
 }
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
