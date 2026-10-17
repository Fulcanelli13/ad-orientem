import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

// Real app browser acceptance: no source stub for Scripture/Settings, real
// source-projected search for Explore. Read-only UI checks; no Mass exercised.
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const artifactRoot=resolve(root,"artifacts/ux-phone-controls");
await mkdir(artifactRoot,{recursive:true});
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".jpg":"image/jpeg",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,"http://127.0.0.1");
  const file=resolve(root,"."+decodeURIComponent(url.pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":types[extname(file)]||"application/octet-stream",
   "cache-control":"no-store"});res.end(bytes);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e.message))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
const origin="http://127.0.0.1:"+server.address().port;
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390,430]){
  const context=await browser.newContext({viewport:{width,height:width===320?700:width===390?844:932},
   deviceScaleFactor:1,isMobile:true,hasTouch:true,locale:"en-GB",reducedMotion:"reduce"});
  const page=await context.newPage(),pageErrors=[];
  page.on("pageerror",e=>pageErrors.push(String(e.message||e)));
  try{
   await page.goto(origin+"/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>window.AO_APP_SHELL_V1?.status?.().visibleOwner===true,
     null,{timeout:35000});
   await page.locator('[data-ao-app-surface="find"]').tap();
   await page.waitForFunction(()=>window.AO_FIND_APP_V1?.status?.().loadState==="ready",
     null,{timeout:55000});
   await page.locator(".aoHeritageSurface [data-find-query]").fill("Lourdes");
   await page.locator(".aoHeritageSearchResults button").first()
    .waitFor({state:"visible",timeout:15000});
   const explore=await page.evaluate(()=>{
    const names=[...document.querySelectorAll(".aoHeritageSearchResults button strong")];
    const buttons=[...document.querySelectorAll(".aoHeritageSearchResults button")];
    const metrics=names.map(el=>({lineClamp:getComputedStyle(el).webkitLineClamp,
     whiteSpace:getComputedStyle(el).whiteSpace,font:parseFloat(getComputedStyle(el).fontSize),
     text:el.textContent.trim().slice(0,100)}));
    return {results:names.length,metrics,buttons:buttons.map(el=>el.getBoundingClientRect().height),
     overflow:document.documentElement.scrollWidth-innerWidth};
   });
   assert.ok(explore.results>=1,"Explore search returned no actual places at "+width);
   assert.ok(explore.metrics.every(x=>x.lineClamp==="2"&&x.whiteSpace==="normal"&&x.font>=14),
     "Explore search truncates named sites to one line: "+JSON.stringify(explore.metrics));
   assert.ok(explore.buttons.every(h=>h>=44),"Explore result has undersized target");
   assert.ok(explore.overflow<=1,"Explore horizontal overflow: "+explore.overflow);
   await page.screenshot({path:resolve(artifactRoot,"explore-search-"+width+".png"),
     fullPage:false,animations:"disabled"});

   await page.evaluate(()=>window.AO_SCRIPTURE_CONTEXT_V1?.open?.("Luke 1:28"));
   await page.locator("#ao-scripture-overlay:not([hidden]) .aoScriptureLibrary")
    .waitFor({state:"visible",timeout:15000});
   const scripture=await page.evaluate(()=>{
    const area=document.querySelector("#ao-scripture-overlay");
    const visible=el=>el.getClientRects().length&&getComputedStyle(el).visibility!=="hidden";
    const control=[...area.querySelectorAll(".aoScriptureLibrary button,.aoScriptureLibrary select,.aoScriptureLibrary input,.aoScriptureLibrary details>summary")]
     .filter(visible).map(el=>({height:el.getBoundingClientRect().height,
       text:(el.textContent||el.getAttribute("aria-label")||"").trim().slice(0,60)}));
    const reading=area.querySelector(".aoScriptureReading");
    return {open:!area.hidden,reading:!!reading,controls:control,
     overflow:document.documentElement.scrollWidth-innerWidth};
   });
   assert.ok(scripture.open&&scripture.reading,"Scripture citation did not open readable context");
   assert.ok(scripture.controls.length>=3,"Scripture reader lacks navigation controls");
   assert.ok(scripture.controls.every(x=>x.height>=44),
     "Scripture has too-small touch control: "+JSON.stringify(scripture.controls.filter(x=>x.height<44)));
   assert.ok(scripture.overflow<=1,"Scripture horizontal overflow");
   await page.screenshot({path:resolve(artifactRoot,"scripture-"+width+".png"),
     fullPage:false,animations:"disabled"});
   // Visual regression evidence: same passage, both genuine English editions,
   // using the production one-tap reader selector rather than mock screens.
   await page.locator('#ao-scripture-overlay [data-scripture-english-edition="cpdv-2009"]').click();
   await page.locator("#ao-scripture-overlay [data-scripture-witness-unreviewed='cpdv-2009']")
     .waitFor({state:"visible",timeout:12000});
   await page.screenshot({path:resolve(artifactRoot,"scripture-cpdv-"+width+".png"),
     fullPage:false,animations:"disabled"});
   await page.locator('#ao-scripture-overlay [data-scripture-english-edition="dr-challoner"]').click();
   await page.locator("#ao-scripture-overlay [data-scripture-witness-unreviewed='dr-challoner']")
     .waitFor({state:"visible",timeout:12000});
   await page.evaluate(()=>window.AO_SCRIPTURE_APP_V1.close());

   const settingsOpen=await page.evaluate(()=>window.AO_SETTINGS_APP_V1.open("/settings/accessibility"));
   assert.equal(settingsOpen,true,"Settings overlay unavailable");
   await page.locator('#ao-settings-modular-root [data-pref-select="accessibility.textScale"]')
    .waitFor({state:"visible",timeout:15000});
   await page.locator('#ao-settings-modular-root [data-pref-select="accessibility.textScale"]').focus();
   await page.locator('#ao-settings-modular-root [data-pref-select="accessibility.textScale"]')
    .selectOption("large");
   const focus=await page.evaluate(()=>({
    focused:document.activeElement?.dataset?.prefSelect||null,
    route:window.AO_SETTINGS_APP_V1.status().route,
    inside:document.querySelector("#ao-settings-modular-root")?.contains(document.activeElement)
   }));
   assert.equal(focus.focused,"accessibility.textScale",
     "Settings preference paint discarded keyboard focus: "+JSON.stringify(focus));
   assert.equal(focus.route,"/settings/accessibility");
   assert.equal(focus.inside,true);
   const first=page.locator("#ao-settings-modular-root button:not([disabled])").first();
   const last=page.locator("#ao-settings-modular-root select:not([disabled])").last();
   // The final focusable in this page may not be a select. Resolve the actual
   // first and last element according to Settings' keyboard trap selector.
   const edges=await page.evaluate(()=>{
    const root=document.getElementById("ao-settings-modular-root");
    const all=[...root.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])')]
     .filter(el=>el.getClientRects().length&&!el.closest("[hidden],[inert],details:not([open])"));
    const start=all[0],end=all[all.length-1];end.focus();
    return {count:all.length,first:start?.dataset?.settingsBack!==undefined?"back":
      start?.dataset?.settingsClose!==undefined?"close":"other",
      last:end?.tagName||null};
   });
   assert.ok(edges.count>=2,"Settings has no focusable actions");
   await page.keyboard.press("Tab");
   assert.equal(await page.evaluate(()=>document.activeElement===document.querySelector(
    "#ao-settings-modular-root [data-settings-back]")),true,
    "Settings Tab escaped modal instead of wrapping to Back");
   await page.keyboard.press("Shift+Tab");
   assert.equal(await page.evaluate(()=>{
    const root=document.getElementById("ao-settings-modular-root");
    const all=[...root.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])')]
      .filter(el=>el.getClientRects().length&&!el.closest("[hidden],[inert],details:not([open])"));
    return document.activeElement===all[all.length-1];
   }),true,"Settings Shift+Tab escaped modal");
   await page.screenshot({path:resolve(artifactRoot,"settings-"+width+".png"),
     fullPage:false,animations:"disabled"});
   assert.ok(pageErrors.length===0,"Browser errors: "+pageErrors.slice(0,5).join("; "));
   console.log("PASS "+width+"px Explore name visibility, Scripture touch and Settings keyboard focus");
  }finally{await context.close()}
 }
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
