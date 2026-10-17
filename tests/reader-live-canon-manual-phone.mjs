import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/live-canon-manual");
await mkdir(out,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png"};
const port=4291;
const server=http.createServer(async(req,res)=>{
 try{
  const p=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const f=resolve(root,"."+p);
  if(f!==root&&!f.startsWith(root+sep)){res.writeHead(403);res.end("Forbidden");return;}
  const file=await readFile(f);
  res.writeHead(200,{"content-type":mime[extname(f)]??"application/octet-stream",
    "cache-control":"no-store"});
  res.end(file);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e));}
});
await new Promise((yes,no)=>{server.once("error",no);server.listen(port,"127.0.0.1",yes);});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const {width,height,lang} of [
   {width:320,height:740,lang:"en"},
   {width:390,height:844,lang:"fr"},
 ]){
  const context=await browser.newContext({viewport:{width,height},isMobile:true,
   hasTouch:true,deviceScaleFactor:1,locale:lang==="fr"?"fr-FR":"en-GB"});
  try{
   const page=await context.newPage(),errors=[];
   page.on("pageerror",e=>errors.push(String(e?.message??e)));
   await page.goto("http://127.0.0.1:"+port+"/tests/fixtures/reader-phone-harness.html?aoLiveCards=65&lang="+lang,
    {waitUntil:"networkidle",timeout:45000});
   await page.waitForFunction(()=>document.documentElement.dataset.harnessReady==="true",null,{timeout:20000});
   const initial=await page.evaluate(()=>{
     const a=window.__AO_PHONE_PREVIEW;
     return {total:a.model.totalCards,cue:a.getActiveCue(),visible:
       !document.querySelector("[data-live-canon-follow-trigger]")?.hidden};
   });
   assert.equal(initial.total,65);
   assert.equal(initial.visible,false,"Manual button must be absent outside the two elevation cues");
   const hostCard=await page.evaluate(()=>window.__AO_PHONE_PREVIEW.model.cards.find(c=>
      c.sourceSectionId==="AO.CANON.06"&&
      c.paragraphs.some(p=>p.sourceCueIds?.includes("AO.SM.C0174")))?.sequence);
   assert.ok(hostCard,"Curated Host elevation card missing");
   await page.evaluate(seq=>window.__AO_PHONE_PREVIEW.showSequence(seq),hostCard);
   const hostLine=page.locator('[data-source-cue-ids~="AO.SM.C0174"]').first();
   await hostLine.scrollIntoViewIfNeeded();
   await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getActiveCue()==="AO.SM.C0174",null,{timeout:12000});
   const trigger=page.locator("[data-live-canon-follow-trigger]");
   assert.equal(await trigger.isVisible(),true,"Follow control not visible at Host cue");
   await trigger.click();
   assert.equal(await trigger.getAttribute("aria-expanded"),"true");
   const menu=page.locator(".ao-live-canon-follow-sheet");
   assert.equal(await menu.isVisible(),true);
   assert.equal(await page.locator("[data-canon-observe]").count(),5);
   assert.equal(await page.locator("[data-canon-observe='AO.RUB.C0174.02']").isEnabled(),true);
   await page.locator("[data-canon-observe='AO.RUB.C0174.02']").click();
   await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getObservedCanonCeremonyStage()?.lastPriestEventId==="AO.RUB.C0174.02");
   assert.equal(await page.locator("[data-canon-observe='AO.RUB.C0174.01']").isDisabled(),true);
   // Recording a priest elevation cannot create an observed SERVER bell.
   assert.equal(await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getObservedCanonCeremonyStage()?.lastServerEventId),null);
   await page.locator("[data-canon-observe='AO.RUB.C0174.03']").click();
   await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getObservedCanonCeremonyStage()?.lastServerEventId==="AO.RUB.C0174.03");
   assert.equal(await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getObservedCanonCeremonyStage()?.lastPriestEventId),
      "AO.RUB.C0174.02","Server bell advanced priest stage");
   await page.locator("[data-canon-follow-reset]").click();
   assert.equal(await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getObservedCanonCeremonyStage()?.lastPriestEventId),null);
   assert.equal(await page.locator("[data-canon-observe='AO.RUB.C0174.01']").isEnabled(),true);
   await page.screenshot({path:resolve(out,"manual-host-"+width+"-"+lang+".png")});
   await page.locator("[data-canon-follow-close]").click();
   assert.equal(await trigger.getAttribute("aria-expanded"),"false");

   const chaliceCard=await page.evaluate(()=>window.__AO_PHONE_PREVIEW.model.cards.find(c=>
     c.sourceSectionId==="AO.CANON.07"&&
     c.paragraphs.some(p=>p.sourceCueIds?.includes("AO.SM.C0181")))?.sequence);
   assert.ok(chaliceCard);
   await page.evaluate(seq=>window.__AO_PHONE_PREVIEW.showSequence(seq),chaliceCard);
   const chaliceLine=page.locator('[data-source-cue-ids~="AO.SM.C0181"]').first();
   await chaliceLine.scrollIntoViewIfNeeded();
   await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getActiveCue()==="AO.SM.C0181",null,{timeout:12000});
   assert.equal(await trigger.isVisible(),true);
   await trigger.click();
   assert.equal(await page.locator("[data-canon-observe]").count(),5);
   await page.screenshot({path:resolve(out,"manual-chalice-"+width+"-"+lang+".png")});
   await page.keyboard.press("Escape");
   assert.equal(await menu.isVisible(),false);
   await page.evaluate(()=>window.__AO_PHONE_PREVIEW.setPresentationMode("MISSAL"));
   await page.waitForFunction(()=>document.querySelector("[data-ao-reader-shell]")?.dataset.mode==="MISSAL");
   assert.equal(await trigger.isVisible(),false,"Missal mode must not show manual LIVE control");
   await page.evaluate(()=>window.__AO_PHONE_PREVIEW.setPresentationMode("SIMPLE"));
   assert.equal(await trigger.isVisible(),false,"Simple mode must not show manual LIVE control");
   assert.deepEqual(errors,[],"LIVE Canon manual browser errors");
  }finally{await context.close();}
 }
 console.log("PASS LIVE 65 manual Canon control: mobile 320/390 EN/FR, Host and Chalice options, independent server bell, reset, Escape, Missal/Simple hidden.");
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(()=>ok()));
}
