import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/mass-reader-explorer");
await mkdir(out,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname),file=resolve(root,"."+path);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("Forbidden");return}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message??error));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4295,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const choice of [
  {label:"sung-curated-live",query:"production=1",width:390},
  {label:"sung-rollback48",query:"production=1&aoLiveCards=48",width:390},
  {label:"sung-missal",query:"production=1&mode=MISSAL",width:768},
  {label:"sung-simple-fr",query:"production=1&mode=SIMPLE&lang=fr",width:320},
 ]){
  const context=await browser.newContext({viewport:{width:choice.width,height:844},
    isMobile:choice.width<600,hasTouch:choice.width<600});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",error=>errors.push(String(error?.message??error)));
  await page.goto("http://127.0.0.1:4295/tests/fixtures/reader-phone-harness.html?"+choice.query,
    {waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>document.documentElement.dataset.harnessReady==="true",null,{timeout:30000});
  const before=await page.evaluate(async({isFrench})=>{
    const {installReaderMassExplorerStudy,currentMassExplorerStudyTarget}
      =await import("/src/learn/mass-reader-study-bridge.js");
    const preview=window.__AO_PHONE_PREVIEW;
    const prepared={session:{resolvedMass:{form:"MISSA_CANTATA_INCENSE"}},
      readerPreferences:{mode:preview.getPresentationMode(),language:isFrench?"fr":"en"}};
    window.__AO_MX_BRIDGE=installReaderMassExplorerStudy(preview,prepared,{win:window});
    const card=preview.model.cards.find(card=>card.guideSequence===10&&
      (card.blocks??[]).some(block=>block.blockId==="AO.SM.B031"));
    if(!card)throw new Error("No reader card with published Suscipe source");
    preview.showSection(card.sectionId);
    const panel=preview.root.querySelector('[data-role="mass-preferences"]');
    if(!panel)throw new Error("Reader preferences unavailable");
    panel.dataset.open="true";
    const scroll=preview.root.querySelector(".ao-prayer-card");
    if(scroll)scroll.scrollTop=Math.min(63,Math.max(0,scroll.scrollHeight-scroll.clientHeight));
    const target=currentMassExplorerStudyTarget(preview,prepared);
    return {sectionId:preview.getCurrentCard()?.sectionId,
      mode:preview.getPresentationMode(),cueId:preview.getActiveCue(),
      scrollTop:scroll?.scrollTop??0,source:target?.momentKey??null,
      sourceBlock:target?.blockId??null,modelCount:preview.model.totalCards};
  },{isFrench:choice.query.includes("lang=fr")});
  assert.equal(before.source,"AO.CARD.010",choice.label+" source macro mismatch");
  assert.equal(await page.locator('[data-reader-mass-explorer]').count(),1);
  assert.equal(await page.locator('[data-reader-mass-explorer]').isVisible(),true,
    choice.label+" actual reader did not expose optional contextual study");
  await page.locator('[data-reader-mass-explorer]').click();
  await page.locator("#ao-mass-explorer-root").waitFor({state:"visible",timeout:20000});
  const overlay=await page.locator("#ao-mass-explorer-root").evaluate(node=>({
    role:node.getAttribute("role"),modal:node.getAttribute("aria-modal"),
    origin:node.dataset.aoMxOrigin,
    width:node.getBoundingClientRect().width,
    layer:getComputedStyle(node).zIndex,
    selected:node.querySelector('[data-ao-mx-block][aria-current="true"]')?.getAttribute("data-ao-mx-block"),
    moment:node.querySelector("[data-ao-mx-current]")?.getAttribute("data-ao-mx-current"),
    hasLearnStage:!!node.querySelector("[data-ao-mx-study]"),
  }));
  assert.equal(overlay.role,"dialog");
  assert.equal(overlay.modal,"true");
  assert.equal(overlay.origin,"mass");
  assert.ok(overlay.width>=choice.width-1);
  assert.equal(overlay.moment,"AO.CARD.010");
  if(before.sourceBlock)assert.equal(overlay.selected,before.sourceBlock);
  assert.equal(overlay.hasLearnStage,false,"Active Mass cannot launch unavailable Formation hub");
  assert.equal(await page.locator('#ao-mass-explorer-root [data-ao-mx-open-mass]').count(),0,
    "Reader study cannot offer another start-Mass button");
  await page.screenshot({path:resolve(out,choice.label+"-study.png"),animations:"disabled"});
  const during=await page.evaluate(()=>{
    const p=window.__AO_PHONE_PREVIEW,scroll=p.root.querySelector(".ao-prayer-card");
    return {connected:p.root.isConnected,sectionId:p.getCurrentCard()?.sectionId,
      cueId:p.getActiveCue(),mode:p.getPresentationMode(),scrollTop:scroll?.scrollTop??0,
      count:p.model.totalCards};
  });
  assert.deepEqual(during,{connected:true,sectionId:before.sectionId,cueId:before.cueId,
    mode:before.mode,scrollTop:before.scrollTop,count:before.modelCount},
    "Opening study modified the live ritual state");
  await page.locator('#ao-mass-explorer-root [data-ao-mx-index]').click();
  assert.equal(await page.locator('#ao-mass-explorer-root [data-ao-mx-map="sung"]').count(),1);
  await page.locator('#ao-mass-explorer-root [data-ao-mx-return-mass]').click();
  assert.equal(await page.locator("#ao-mass-explorer-root").count(),0);
  const after=await page.evaluate(()=>{
    const p=window.__AO_PHONE_PREVIEW,scroll=p.root.querySelector(".ao-prayer-card");
    return {connected:p.root.isConnected,sectionId:p.getCurrentCard()?.sectionId,
      cueId:p.getActiveCue(),mode:p.getPresentationMode(),scrollTop:scroll?.scrollTop??0,
      count:p.model.totalCards,focus:document.activeElement?.dataset?.readerMassExplorer??null};
  });
  assert.deepEqual({...after,focus:undefined},{...during,focus:undefined},
    "Returning from Explorer changed live position");
  assert.equal(after.focus,"","Mass reader must regain focus on originating control");
  assert.deepEqual(errors,[],choice.label+" page errors");
  await context.close();
 }
 console.log("PASS native Mass → Explorer → same ritual card/cue/scroll/mode across curated/rollback/Missal/Simple FR");
}finally{
 await browser?.close();await new Promise(ok=>server.close(ok));
}
