import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/curated65-phone");
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
   // Use the reader's exact 39%-focus geometry, not merely
   // scrollIntoViewIfNeeded (a visible bottom rubric can remain unfocused).
   async function focusCue(cueId){
     const outcome=await page.evaluate(async target=>{
       const api=window.__AO_PHONE_PREVIEW;
       const card=api.model.cards.find(c=>c.paragraphs.some(p=>
         p.sourceCueIds?.includes(target)));
       if(!card)return {found:false,reason:"SOURCE_CARD_MISSING"};
       api.showSequence(card.sequence);
       const frames=()=>new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done)));
       await frames();
       const scroller=document.querySelector("#ao-r17-native-reader-preview .ao-prayer-card");
       const node=[...scroller.querySelectorAll(".ao-reader-paragraph[data-cue-id]")]
         .find(n=>n.dataset.cueId===target);
       if(!node)return {found:false,reason:"CUE_DOM_MISSING"};
       const max=Math.max(0,scroller.scrollHeight-scroller.clientHeight);
       const candidates=[0,max];
       for(let y=0;y<=max;y+=16)candidates.push(y);
       for(const amount of [...new Set(candidates)]){
         scroller.scrollTop=Math.max(0,Math.min(max,amount));
         scroller.dispatchEvent(new Event("scroll",{bubbles:true}));
         await frames();
         if(api.getActiveCue()===target)
           return {found:true,cardId:card.sectionId,focused:target,max};
       }
       return {found:false,reason:"CUE_FOCUS_UNREACHABLE",
         current:api.getActiveCue(),cardId:card.sectionId,max};
     },cueId);
     assert.equal(outcome.found,true,cueId+" focus unreachable "+JSON.stringify(outcome));
   }
   await focusCue("AO.SM.C0174");
   const trigger=page.locator("[data-live-canon-follow-trigger]");
   assert.equal(await trigger.isVisible(),true,"Follow control not visible at Host cue");
   await trigger.click();
   assert.equal(await trigger.getAttribute("aria-expanded"),"true");
   const menu=page.locator(".ao-live-canon-follow-sheet");
   assert.equal(await menu.isVisible(),true);
   assert.equal(await page.locator("[data-canon-observe]").count(),5);
   assert.equal(await page.locator("[data-canon-observe='AO.RUB.C0174.02']").isEnabled(),true);
   // A textual cue offers an EXPECTED bell. Recording the first genuflection
   // must suppress that inference: no bell has been independently heard and
   // the priest has not yet performed the elevation.
   await page.locator("[data-canon-observe='AO.RUB.C0174.01']").click();
   await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getNativeEventState()?.canonStageBellOverride===true &&
     window.__AO_PHONE_PREVIEW.getNativeEventState()?.priestAction?.id==="AO.RUB.C0174.01");
   const firstStage=await page.evaluate(()=>({
     bell:window.__AO_PHONE_PREVIEW.getNativeEventState()?.bell,
     cinematic:window.__AO_PHONE_PREVIEW.getNativeEventState()?.cinematic,
     bellHidden:document.querySelector('.ao-rail-right [data-channel="bell"]')?.dataset.active,
   }));
   assert.equal(firstStage.bell,null,"First genuflection displayed a bell that was not observed");
   assert.equal(firstStage.cinematic,null,"First genuflection animated the Host elevation");
   assert.equal(firstStage.bellHidden,"false","Bell icon lingered at genuflection");
   await page.locator("[data-canon-observe='AO.RUB.C0174.02']").click();
   await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getObservedCanonCeremonyStage()?.lastPriestEventId==="AO.RUB.C0174.02");
   assert.equal(await page.locator("[data-canon-observe='AO.RUB.C0174.01']").isDisabled(),true);
   // Recording a priest elevation cannot create an observed SERVER bell.
   assert.equal(await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getObservedCanonCeremonyStage()?.lastServerEventId),null);
   await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getNativeEventState()?.cinematic?.sourceRubricEventId==="AO.RUB.C0174.02");
   assert.equal(await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getNativeEventState()?.bell),null,
     "Observed priest elevation must not infer a heard bell");
   await page.locator("[data-canon-observe='AO.RUB.C0174.03']").click();
   await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getObservedCanonCeremonyStage()?.lastServerEventId==="AO.RUB.C0174.03");
   assert.equal(await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getObservedCanonCeremonyStage()?.lastPriestEventId),
      "AO.RUB.C0174.02","Server bell advanced priest stage");
   await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getNativeEventState()?.bell?.id==="AO.RUB.C0174.03");
   await page.locator("[data-canon-observe='AO.RUB.C0174.04']").click();
   await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getNativeEventState()?.priestAction?.id==="AO.RUB.C0174.04");
   assert.equal(await page.evaluate(()=>({
     icon:document.querySelector('.ao-rail-right [data-channel="bell"]')?.dataset.active,
     source:window.__AO_PHONE_PREVIEW.getNativeEventState()?.bell,
   }).icon),"false","Prior audible bell stayed visible when Host replaced");
   await page.locator("[data-canon-follow-reset]").click();
   assert.equal(await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getObservedCanonCeremonyStage()?.lastPriestEventId),null);
   assert.equal(await page.locator("[data-canon-observe='AO.RUB.C0174.01']").isEnabled(),true);
   await page.screenshot({path:resolve(out,"manual-host-"+width+"-"+lang+".png")});
   await page.locator("[data-canon-follow-close]").click();
   assert.equal(await trigger.getAttribute("aria-expanded"),"false");

   await focusCue("AO.SM.C0181");
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
   await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getPresentationMode()==="LIVE");
   assert.equal(await trigger.isVisible(),true,
     "A saved Simple mode must migrate back to LIVE and restore the source-owned manual Canon control");
   assert.deepEqual(errors,[],"LIVE Canon manual browser errors");
  }finally{await context.close();}
 }
 console.log("PASS LIVE 64 manual Canon control: mobile 320/390 EN/FR, Host and Chalice options, independent server bell, reset, Escape, Missal hidden, saved Simple migrated to LIVE.");
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(()=>ok()));
}
