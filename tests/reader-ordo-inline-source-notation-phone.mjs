// Actual production Ordo: the 65-card reader's own Mass-preferences button
// must expose source-cue notation (preview) without an undocumented URL flag.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,".tmp/ordo-gregorian-inline-phone");
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
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream",
   "cache-control":"no-store"});res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}
});
await new Promise((ok,no)=>{server.once("error",no);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 await mkdir(out,{recursive:true});
 const base="http://127.0.0.1:"+server.address().port;
 for(const {width,form,mode} of [
  {width:320,form:"MISSA_CANTATA_INCENSE",mode:"live"},
  {width:390,form:"MISSA_CANTATA_INCENSE",mode:"missal"},
  {width:390,form:"LOW",mode:"live"}
 ]){
  const context=await browser.newContext({viewport:{width,height:844},
   isMobile:true,hasTouch:true,deviceScaleFactor:1});
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",e=>errors.push(String(e?.message??e)));
  const qp=new URLSearchParams({production:"1",print:"1",notation:"1",
   form,mode});
  await page.goto(base+"/tests/fixtures/reader-phone-harness.html?"+qp.toString(),
   {waitUntil:"domcontentloaded",timeout:60000});
  await page.waitForFunction(()=>["true","error"].includes(
   document.documentElement.dataset.harnessReady),null,{timeout:30000});
  const entry=await page.evaluate(()=>{
   const api=window.__AO_PHONE_PREVIEW;
   if(!api)return {error:window.__AO_PHONE_HARNESS_ERROR};
   const target=(api.model?.cards??[]).find(c=>
    JSON.stringify(c).includes("AO.SM.C0138"));
   if(!target)return {error:"source cue AO.SM.C0138 absent from mass model",
    first:(api.model?.cards??[]).slice(0,3).map(c=>({
      sequence:c.sequence,id:c.id,sectionId:c.sectionId}))};
   api.showSequence(target.sequence);
   const reader=document.querySelector("#ao-r17-native-reader-preview");
   return {error:null,totalCards:api.model.totalCards,
    sourceMacros:api.sourceModel?.totalCards,visibleTitle:
    reader?.querySelector('[data-role="section-title"]')?.textContent,
    target:{sequence:target.sequence,sectionId:target.sectionId},
    cueReady:!!reader?.querySelector('[data-cue-id="AO.SM.C0138"]')};
  });
  assert.equal(entry.error,null,JSON.stringify(entry));
  assert.equal(entry.sourceMacros,30,"The 30 original Mass source macros remain intact");
  assert.ok(entry.totalCards>=65,"MISSAL may expand units but cannot lose the canonical 65-card Mass");
  if(mode==="live")assert.equal(entry.totalCards,65,"LIVE stays at exactly 65 cards");
  const rootSelector="#ao-r17-native-reader-preview";
  const state=()=>page.evaluate(rootSelector=>{
   const host=document.querySelector(rootSelector);
   const pref=host?.querySelector("[data-reader-chant-preview]");
   const marks=[...host.querySelectorAll(".ao-proper-reference-notation")];
   return {
    control:!!pref,disabled:pref?.disabled,pressed:pref?.getAttribute("aria-pressed"),
    status:pref?.textContent?.trim(),
    scoreCount:marks.length,
    approved:marks.map(m=>m.dataset.approved),
    staffSvg:marks.filter(m=>m.querySelector(".ao-proper-reference-staff svg")).length,
    referenceScores:marks.map(m=>m.dataset.referenceScore),
    acPresentation:marks.map(m=>{
      const mark=m.querySelector(".ao-proper-reference-mark");
      const expand=m.querySelector(".ao-proper-reference-expand");
      const staff=m.querySelector(".ao-proper-reference-staff");
      const style=staff?getComputedStyle(staff):null;
      return {
       marker:mark?.textContent??"",
       markerColor:mark?getComputedStyle(mark).color:null,
       directTap:expand?.contains(staff)===true,
       staffBackground:style?.backgroundColor??null,
       staffPixelFilter:staff?.querySelector('svg')?getComputedStyle(staff.querySelector('svg')).filter:null,
       label:m.querySelector(".ao-proper-reference-label")?.textContent?.trim()??"",
       wrapperWidth:m.clientWidth,staffWidth:staff?.clientWidth??0,
       parentWidth:m.parentElement?.clientWidth??0
      };
     }),
    literalLatin:host?.querySelector('[data-cue-id="AO.SM.C0138"] .ao-line-primary')
      ?.textContent?.trim()??null,
    sourceMacros:window.__AO_PHONE_PREVIEW?.sourceModel?.totalCards,
    width:document.documentElement.scrollWidth,viewport:innerWidth,
   };
  },rootSelector);
  const before=await state();
  assert.equal(before.control,true);
  assert.equal(before.pressed,"false");
  assert.equal(before.scoreCount,0,"Provisional music may never auto-publish");
  await page.click("[data-reader-preferences]");
  const button=page.locator("[data-reader-chant-preview]");
  if(form==="LOW"){
   assert.equal((await state()).disabled,true,"Low Mass has text only");
  }else{
   assert.equal((await state()).disabled,false);
   await button.click();
   await page.waitForFunction(()=>document.querySelectorAll(
     ".ao-proper-reference-notation[data-reference-ready=true]").length>0,null,
     {timeout:20000});
   const after=await state();
   assert.equal(after.pressed,"true");
   assert.ok(after.scoreCount>0,"Actual Ordo card must have source-linked Gregorian score");
   assert.equal(after.staffSvg,after.scoreCount,
    "Selected source notation must engrave to actual inline Exsurge SVG");
   assert.ok(after.approved.every(x=>x==="false"),
    "Editorial-preview notation is never published-approved music");
   assert.ok(after.literalLatin&&after.literalLatin.length>8,
    "The original bilingual prayer must remain");
   assert.equal(after.sourceMacros,30,"No change to the original Mass macro source");
   assert.ok(after.width<=after.viewport+1,"No horizontal phone overflow");
   assert.ok(after.acPresentation.every(x=>["℣","℟","♫"].includes(x.marker)),
    "A/C must show the liturgical role beside the score");
   assert.ok(after.acPresentation.every(x=>x.directTap),
    "Tap-to-enlarge must attach to the staff itself, not a boxed secondary button");
   assert.ok(after.acPresentation.every(x=>
     x.staffBackground==="rgba(0, 0, 0, 0)"||x.staffBackground==="transparent"),
    "Claude A/C unboxed presentation must not return to the grey/white score panel");
   assert.ok(after.acPresentation.every(x=>x.staffPixelFilter?.includes("brightness(0)")),
    "Actual Exsurge SVG must normalize black score glyphs to readable light ink on dark Ordo");

   assert.ok(after.acPresentation.every(x=>x.label.includes("1961")&&x.label.length<70),
    "Small provenance copy, no oversized review-workbench metadata");
   assert.ok(after.acPresentation.every(x=>x.staffWidth>0&&x.wrapperWidth>0),
    "Source score must occupy the prayer's available reading column");
   // Capture the actual Ordo content, not the still-open preferences sheet.
   await page.click("[data-reader-preferences-close]");
   assert.equal(await page.locator('[data-role="mass-preferences"]').getAttribute("data-open"),"false");
   // The A/C score surface opens a full-size vector rendering.
   await page.locator(".ao-proper-reference-expand").first().click();
   await page.waitForFunction(()=>Boolean(document.querySelector(
     ".ao-proper-reference-zoom[open] .ao-proper-reference-wide svg")),null,
     {timeout:15000});
   await page.locator(".ao-proper-reference-zoom header button").click();
   assert.equal(await page.locator(".ao-proper-reference-zoom").count(),0,
     "Closing zoom returns to the same canonical Mass card");
   await page.screenshot({path:resolve(out,
     "ordo-"+form.toLowerCase()+"-"+mode+"-"+width+"-notation.png"),
    animations:"disabled"});
   // The A/C Aa/♫ switch is local to the paragraph; Latin remains.
   const localView=page.locator(".ao-proper-reference-notation").first();
   const localToggle=localView.locator(".ao-proper-reference-toggle");
   assert.equal(await localToggle.textContent(),"Aa");
   await localToggle.click();
   assert.equal(await localView.getAttribute("data-reference-view"),"text");
   assert.equal(await localToggle.textContent(),"♫");
   assert.equal(await localView.locator(".ao-proper-reference-expand").isVisible(),false);
   assert.ok((await state()).literalLatin?.length>8);
   await localToggle.click();
   assert.equal(await localView.getAttribute("data-reference-view"),"notation");
   assert.equal(await localView.locator(".ao-proper-reference-expand").isVisible(),true);
   // Reopen preferences: the on/off state must survive closing the sheet.
   await page.click("[data-reader-preferences]");
   assert.equal((await state()).pressed,"true");
   await button.click();
   const off=await state();
   assert.equal(off.pressed,"false");
   assert.equal(off.scoreCount,0,"Off must remove all provisional inline scores");
   assert.ok(off.literalLatin&&off.literalLatin.length>8,
    "Turning notation off must not remove the Latin text");
  }
  assert.deepEqual(errors,[],"No actual reader runtime errors: "+errors.join("|"));
  console.log("PASS actual Ordo Gregorian control",JSON.stringify({width,form,mode,before,after:await state()}));
  await context.close();
 }
}finally{
 await browser?.close();await new Promise(ok=>server.close(ok));
}
