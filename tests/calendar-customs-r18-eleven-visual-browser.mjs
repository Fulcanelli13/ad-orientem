// Actual-browser phone/desktop acceptance for the opt-in, unpublished R18
// Calendar editorial view. Screenshots are short-lived PR review evidence.
import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {calendarCustomArticleIds} from "../src/calendar/customs-read-model.js";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/calendar-customs-r18-eleven-visual");
const publishedCount=calendarCustomArticleIds().length;
const remainingReviewCount=publishedCount===36?10:11;
assert.ok([35,36].includes(publishedCount),"Unexpected canonical corpus before review release: "+publishedCount);
await mkdir(output,{recursive:true});
const mime={
 ".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
 ".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp"
};
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,"http://127.0.0.1");
  const path=resolve(root,"."+decodeURIComponent(url.pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end("Forbidden");return;}
  res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream","cache-control":"no-store"});
  res.end(await readFile(path));
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;
const results=[];
try{
 browser=await chromium.launch({headless:true});
 for(const [width,height,lang] of [
   [320,700,"en"],[390,844,"fr"],[430,932,"en"],
   [1280,800,"en"],[1280,800,"fr"]
 ]){
  const page=await browser.newPage({viewport:{width,height},isMobile:width<=430,
   hasTouch:width<=430,deviceScaleFactor:1,locale:lang==="fr"?"fr-FR":"en-GB",
   reducedMotion:"reduce"});
  const errors=[];
  page.on("pageerror",e=>errors.push(String(e?.message||e)));
  const tag=lang+"-"+width;
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+
     "/index.html?aoR17Reader=native&customsR18Eleven=review",
     {waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.().visibleOwner===true,
     null,{timeout:35000});
   if(lang==="fr"){
    await page.evaluate(()=>globalThis.AO_APP_SHELL_V1?.navigate?.("settings"));
    await page.locator("#ao-settings-modular-root").waitFor({state:"visible",timeout:15000});
    await page.locator('[data-settings-route="/settings/language-reading"]').click();
    await page.waitForFunction(()=>
      globalThis.AO_SETTINGS_APP_V1?.status?.().route==="/settings/language-reading");
    await page.locator('[data-pref-path="general.uiLanguage"][data-pref-value="fr"]').click();
    await page.waitForFunction(()=>
      globalThis.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr");
    await page.evaluate(()=>globalThis.AO_SETTINGS_APP_V1?.close?.());
    await page.locator(".homeScreen.aoTodayV2").waitFor({state:"visible",timeout:20000});
   }
   await page.locator('.aoH7HomeView .ib[data-home-calendar-view="picker"]').click();
   await page.locator('.aoH4CalendarViews [data-home-calendar-view="day"]').click();
   const cal=page.locator(".aoTodayV2CalendarInline #ao-calendar-modular-root");
   await cal.locator(".aoCalCustomCatalogue").waitFor({state:"attached",timeout:45000});
   await cal.locator(".aoCalCustomCatalogue > summary").click();
   const reviewer=cal.locator('[data-cal-r18-eleven-editorial-preview]');
   await reviewer.waitFor({state:"visible",timeout:10000});
   assert.equal(await reviewer.locator('[data-cal-r18-eleven-key]').count(),remainingReviewCount);
   assert.equal(await cal.locator(".aoCalCustomCatalogueItems [data-cal-custom-item]").count(),publishedCount);
   assert.equal(await reviewer.locator('[data-cal-custom-item]').count(),0);
   assert.equal(await reviewer.getAttribute("data-cal-r18-published-count"),String(publishedCount));
   const originalSix=cal.locator('[data-cal-r18-six-supplement]');
   await originalSix.waitFor({state:"visible",timeout:10000});
   const sourceIds=["PATR-002","XMAS-002","XMAS-003","SBAR-001","XMAS-004","EPIP-004"];
   const sourceRemaining=sourceIds.filter(id=>!calendarCustomArticleIds().includes(id)).length;
   assert.equal(await originalSix.locator('[data-cal-r18-six-review-key]').count(),sourceRemaining);
   assert.equal(await originalSix.getAttribute("data-cal-r18-six-count"),String(sourceRemaining));
   assert.equal(await originalSix.locator('a[href^="https://"]').count(),12);
   assert.equal(await originalSix.locator('[data-cal-custom-item]').count(),0);
   assert.equal(await originalSix.locator('[data-cal-custom-id]').count(),0);

   if(publishedCount===36){
     assert.equal(await reviewer.locator('[data-cal-r18-eleven-key="CUSTOMS-R18-14"]').count(),0,
       "PENT-001 cannot appear a second time as unpublished R18-14");
     assert.equal(await cal.locator('[data-cal-custom-id="PENT-001"]').count(),1);
   }
   // Day-resolution repaint may replace expanded <details>; finish week
   // resolution before opening the editorial copy for visual capture.
   await page.waitForFunction(()=>
     !document.getElementById("ao-cinema-loader")?.classList.contains("aoCinemaLoaderOn"),
     null,{timeout:90000});
   const first=reviewer.locator('[data-cal-r18-eleven-key="CUSTOMS-R18-03"]');
   if(await first.getAttribute("open")===null)
     await first.locator(":scope > summary").click();
   await first.locator(".aoCalCustomArticleContent").waitFor({state:"visible",timeout:10000});
   const cols=first.locator(".aoCalR18ElevenLanguage");
   assert.equal(await cols.count(),2);
   assert.equal(await cols.nth(0).getAttribute("lang"),"en");
   assert.equal(await cols.nth(1).getAttribute("lang"),"fr");
   assert.equal(await cols.nth(0).locator("h6").count(),7);
   assert.equal(await cols.nth(1).locator("h6").count(),7);
   assert.ok(await first.locator('a[href^="https://"]').count()>0);
   const rects=await page.evaluate(()=>{
     const el=document.querySelector('[data-cal-r18-eleven-editorial-preview]');
     const cols=[...document.querySelectorAll(
      '[data-cal-r18-eleven-key="CUSTOMS-R18-03"] .aoCalR18ElevenLanguage'
     )].map(e=>{const r=e.getBoundingClientRect();return {x:r.x,w:r.width,right:r.right}});
     const r=el.getBoundingClientRect();
     return {viewport:innerWidth,overflow:document.documentElement.scrollWidth-innerWidth,
       section:{left:r.left,right:r.right,width:r.width},cols};
   });
   assert.ok(rects.overflow<=1,"Global horizontal overflow: "+JSON.stringify(rects));
   assert.ok(rects.section.left>=-1&&rects.section.right<=rects.viewport+1,
    "Reviewer section is clipped: "+JSON.stringify(rects));
   assert.ok(rects.cols.every(x=>x.w>100&&x.x>=-1&&x.right<=rects.viewport+1),
    "Bilingual text is clipped: "+JSON.stringify(rects));
   if(width<=430){
    assert.ok(Math.abs(rects.cols[0].x-rects.cols[1].x)<4,
      "On phone the two full-language columns should stack: "+JSON.stringify(rects));
   }else{
    assert.ok(rects.cols[1].x>rects.cols[0].x+50,
      "On desktop bilingual copy should be side by side: "+JSON.stringify(rects));
   }
   // The live week resolver can replace Calendar DOM nodes while preparing
   // the liturgical week; wait for its overlay to clear and capture the
   // browser viewport rather than a transient element handle.
   await reviewer.waitFor({state:"visible",timeout:10000});
   assert.equal(await first.getAttribute("open"),"",
     "The editor-expanded first article should persist through settled Calendar render");
   await first.evaluate(el=>{
     el.scrollIntoView({block:"start",behavior:"instant"});
     window.scrollBy({top:-82,behavior:"instant"});
   });
   const file=resolve(output,"editorial-"+tag+".png");
   await page.screenshot({path:file,fullPage:false,animations:"disabled",timeout:25000});
   // On a narrow phone, the translated column must be available below the
   // English copy. Capture it independently without faking a two-column fit.
   if(width<=430){
    await cols.nth(1).evaluate(el=>{
      el.scrollIntoView({block:"start",behavior:"instant"});
      window.scrollBy({top:-82,behavior:"instant"});
    });
    await page.screenshot({path:resolve(output,"editorial-fr-column-"+tag+".png"),
      fullPage:false,animations:"disabled",timeout:25000});
   }
   assert.equal(await page.locator('[data-cal-r18-eleven-editorial-preview]').count(),1,
     "Reviewer should survive Calendar week preparation");
   const olderFirst=originalSix.locator('[data-cal-r18-six-review-key="PATR-002"]');
   if(await olderFirst.getAttribute("open")===null)
     await olderFirst.locator(":scope > summary").click();
   await olderFirst.locator(".aoCalCustomArticleContent").waitFor({state:"visible",timeout:10000});
   assert.equal(await olderFirst.locator(".aoCalR18ElevenLanguage").count(),2);
   await olderFirst.evaluate(el=>{
      el.scrollIntoView({block:"start",behavior:"instant"});
      window.scrollBy({top:-82,behavior:"instant"});
   });
   await page.screenshot({path:resolve(output,"editorial-original-six-"+tag+".png"),
       fullPage:false,animations:"disabled",timeout:25000});
   results.push({tag,public_customs:publishedCount,review_articles:remainingReviewCount,
     language_columns:2,overflow:rects.overflow,screenshot:file});
   assert.equal(errors.length,0,"Browser errors: "+errors.join(" | "));
  }catch(error){
   const path=resolve(output,"diagnostic-"+tag+".png");
   await page.screenshot({path,fullPage:false,timeout:10000}).catch(()=>{});
   console.error("R18_VISUAL_ERROR",tag,error?.stack||String(error));
   throw error;
  }finally{await page.close()}
 }
 const negative=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await negative.goto("http://127.0.0.1:"+server.address().port+"/index.html?aoR17Reader=native",
  {waitUntil:"domcontentloaded",timeout:90000});
 await negative.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.().visibleOwner===true,
  null,{timeout:35000});
 await negative.locator(".aoTodayV2Tabs [data-home-calendar-today]").click();
 await negative.locator('[data-home-calendar-view="day"]').first().click();
 await negative.locator(".aoCalCustomCatalogue").waitFor({state:"attached",timeout:45000});
 assert.equal(await negative.locator('[data-cal-r18-six-supplement]').count(),0,
   "The six old review dossiers must also be absent by default");
 assert.equal(await negative.locator('[data-cal-r18-eleven-editorial-preview]').count(),0,
   "Without the explicit query param, editorial copy must not enter the Calendar");
 await negative.close();
 console.log("PASS R18 Calendar actual browser visual acceptance "+JSON.stringify(results));
}finally{
 if(browser)await browser.close();
 await new Promise(resolve=>server.close(resolve));
}
