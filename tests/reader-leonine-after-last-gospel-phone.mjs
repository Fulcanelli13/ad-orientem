import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

// Exercise the production R17 reader through its real Next/Previous
// controls; the unit test by itself cannot establish actual reachability.
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
 ".png":"image/png",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
  const body=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]??"application/octet-stream","cache-control":"no-store"});
  res.end(body);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e.message??e))}
});
await new Promise((ok,no)=>{server.once("error",no);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const cfg of [
   {form:"LOW",mode:"LIVE",lang:"en",width:390,expect:true},
   {form:"LOW",mode:"LIVE",lang:"fr",width:320,expect:true},
   {form:"LOW",mode:"MISSAL",lang:"en",width:390,expect:true},
   {form:"MISSA_CANTATA_SIMPLE",mode:"LIVE",lang:"en",width:390,expect:false},
   {form:"SOLEMN",mode:"LIVE",lang:"en",width:390,expect:false},
   {form:"LOW",mode:"LIVE",lang:"en",width:390,requiem:true,expect:true},
   {form:"LOW",mode:"LIVE",lang:"en",width:390,following:"requiem",expect:false},
 ]) {
  const context=await browser.newContext({viewport:{width:cfg.width,height:844},isMobile:true,
   hasTouch:true,deviceScaleFactor:1,serviceWorkers:"block",locale:cfg.lang==="fr"?"fr-FR":"en-GB"});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",err=>errors.push(String(err.message)));
  const params=new URLSearchParams({production:"1",form:cfg.form,mode:cfg.mode,lang:cfg.lang,secondConfiteor:"1"});
  if(cfg.following)params.set("following",cfg.following);
  if(cfg.requiem)params.set("requiem","1");
  await page.goto("http://127.0.0.1:"+server.address().port+
   "/tests/fixtures/reader-phone-harness.html?"+params,{waitUntil:"domcontentloaded",timeout:75000});
  await page.waitForFunction(()=>["true","error"].includes(document.documentElement.dataset.harnessReady),
   null,{timeout:60000});
  const initial=await page.evaluate(()=>({error:window.__AO_PHONE_HARNESS_ERROR??null,
   total:window.__AO_PHONE_PREVIEW?.model?.totalCards??null,
   current:window.__AO_PHONE_PREVIEW?.getCurrentCard?.()?.title}));
  assert.equal(initial.error,null,"Reader mount: "+JSON.stringify({cfg,initial,errors}));
  if(cfg.mode==="LIVE")assert.equal(initial.total,65,
   "Leonine devotion must not add a 66th LIVE Mass card");
  else assert.ok(initial.total>=30&&initial.total<=90,
   "MISSAL can refine the 30 source macros into paragraphs; Leonine is not a Mass card");
  // Jump to the exact final source-owned Gospel card, rather than invent
  // a second prayer card or a different liturgical step.
  const final=await page.evaluate(()=>{
   const api=window.__AO_PHONE_PREVIEW;
   const card=[...api.model.cards].reverse().find(x=>
    /Last Gospel/.test(String(x.title??"")));
   if(!card)throw new Error("Source-owned Last Gospel not in model");
   api.showSequence(card.sequence);
   const section=document.querySelector("#ao-r17-native-reader-preview [data-ao-post-low-mass-leonine]");
   return {sequence:card.sequence,title:card.title,
    section:!!section,blocks:section?.querySelectorAll("[data-leonine-block]").length??0,
    latin:section?.querySelector("[lang=la]")?.innerText??"",
    translation:section?.querySelectorAll(".ao-post-low-mass-translation").length??0,
    renderTitle:document.querySelector('[data-role="section-title"]')?.textContent??""};
  });
  assert.equal(final.section,cfg.expect,
   "Real source-owned Last Gospel Leonine gate "+JSON.stringify({cfg,final}));
  if(cfg.expect){
   // The production reader refreshes source cues without a card transition.
   // This render omits cardTitle and supplies only sectionTitle: it must not
   // remove the Leonine panel before the user can enter it via Next.
   await page.evaluate(()=>window.__AO_PHONE_PREVIEW.syncState());
   await page.waitForTimeout(180);
   assert.equal(await page.locator("#ao-r17-native-reader-preview [data-ao-post-low-mass-leonine]").count(),1,
    "Cue-only refresh removed Leonine prayers from the terminal Last Gospel");
   assert.equal(final.blocks,5,"Missing five sequential Leonine source blocks");
   assert.equal(final.translation,5,"Each prayer must include paired translation");
   assert.match(final.latin,/Ave Maria/);
   const before=await page.evaluate(()=>{
     const r=document.querySelector("#ao-r17-native-reader-preview");
     const scroll=r.querySelector(".ao-prayer-card");
     return {scroll:scroll.scrollTop,post:r.dataset.r17PostMass??"",
      nextText:r.querySelector('[data-reader-nav="next"]')?.textContent??""};
   });
   await page.locator("#ao-r17-native-reader-preview [data-reader-nav='next']").click();
   const after=await page.evaluate(()=>{
    const r=document.querySelector("#ao-r17-native-reader-preview");
    const scroll=r.querySelector(".ao-prayer-card");
    const sec=r.querySelector("[data-ao-post-low-mass-leonine]");
    const box=sec.getBoundingClientRect(),sc=scroll.getBoundingClientRect();
    return {post:r.dataset.r17PostMass,scroll:scroll.scrollTop,
     inViewport:box.top>=sc.top-30&&box.top<sc.bottom+30,
     title:r.querySelector('[data-role="section-title"]')?.textContent??"",
     labels:[...sec.querySelectorAll("h3")].map(h=>h.textContent),
     paragraphCount:sec.querySelectorAll("p").length,
     text:sec.innerText.slice(0,300)};
   });
   assert.equal(after.post,"leonine",
    "Last Gospel Next must first enter post-Mass Leonine reading, not completion");
   assert.ok(after.scroll>before.scroll,
    "Next from Last Gospel must scroll into the post-Mass prayers");
   assert.ok(after.inViewport,"Prayers are not visible in the reader after Next: "+JSON.stringify(after));
   assert.equal(after.labels.length,5);
   assert.ok(after.paragraphCount>=12);
   assert.ok(await page.locator(".ao-post-low-mass").isVisible());
   assert.ok((await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth))<=2,
    "Leonine panel causes horizontal overflow");
   await page.locator("#ao-r17-native-reader-preview [data-reader-nav='previous']").click();
   const back=await page.evaluate(()=>{
    const r=document.querySelector("#ao-r17-native-reader-preview");
    return {post:r.dataset.r17PostMass??"",scroll:r.querySelector(".ao-prayer-card").scrollTop,
     title:r.querySelector('[data-role="section-title"]')?.textContent??""};
   });
   assert.equal(back.post,"","Previous must return to canonical Last Gospel");
   assert.equal(back.scroll,0,"Previous must restore start of Last Gospel");
   await page.locator("#ao-r17-native-reader-preview [data-reader-nav='next']").click();
   assert.equal(await page.locator("#ao-r17-native-reader-preview").getAttribute("data-r17-post-mass"),"leonine");
   await page.locator("#ao-r17-native-reader-preview [data-reader-nav='next']").click();
   assert.notEqual(await page.locator("#ao-r17-native-reader-preview").getAttribute("data-r17-post-mass"),"leonine",
    "Second Next must continue through existing after-Mass lifecycle");
   console.log("LEONINE_PHONE_PASS "+JSON.stringify({cfg,seq:final.sequence,blocks:after.labels.length,scroll:after.scroll}));
  }else{
   assert.equal(final.blocks,0,"Leonine prayers leaked into excluded Mass form/rite");
   await page.locator("#ao-r17-native-reader-preview [data-reader-nav='next']").click();
   assert.notEqual(await page.locator("#ao-r17-native-reader-preview").getAttribute("data-r17-post-mass"),"leonine");
  }
  assert.equal(errors.length,0,JSON.stringify(errors));
  await context.close();
 }
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(ok=>server.close(ok));
}
