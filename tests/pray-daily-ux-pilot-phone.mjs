import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {buildPersonalDailyPlan,defaultPersonalDailyPrefs} from "../src/pray/daily-personal-rule.js";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const sourcePlan={morning:buildPersonalDailyPlan({daypart:"morning",prefs:defaultPersonalDailyPrefs("en")}).rows,evening:buildPersonalDailyPlan({daypart:"evening",prefs:defaultPersonalDailyPrefs("en")}).rows};
const captures=resolve(root,"artifacts/pray-daily-ux-pilot");
await mkdir(captures,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+pathname);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return}
  const bytes=await readFile(file);res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream"});res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((ok,no)=>{server.once("error",no);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390]){
  const page=await browser.newPage({viewport:{width,height:width===320?568:844},isMobile:true,hasTouch:true,serviceWorkers:"block"});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  try{
   const origin="http://127.0.0.1:"+server.address().port;
   await page.goto(origin+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:40000});
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
   const opened=await page.evaluate(()=>globalThis.AO_MODULES.open("pray.morning_evening"));
   assert.notEqual(opened,false,"daily reader module must open");
   const base="#aoPray435930.open ";
   await page.waitForSelector(base+'.aoDailyBookSelector',{state:"attached",timeout:20000});
   const openBookSettings=async()=>{
    const aa=page.locator(base+'.aoP435930Head.aoPrayerBookHead > .aoPrayerBookMenu');
    assert.equal(await aa.count(),1,"Historical editions must remain in Aa");
    if(!await aa.evaluate(el=>el.open))await aa.locator(":scope > summary").click();
    assert.ok(await page.locator(base+'.aoDailyBookSelector').isVisible(),"The book selector must be reachable, not always displayed above prayer");
   };
   await openBookSettings();
   const prayerFirstFold=()=>page.evaluate(()=>{
    const root=document.querySelector("#aoPray435930.open");
    const text=root?.querySelector(".aoTP381GuideCard .aoTP381PrayerCard p, .aoTP381GuideCard .aoTP381TextParagraph");
    const rect=text?.getBoundingClientRect();
    return {text:text?.textContent?.trim().slice(0,90)||"",top:rect?.top??9999,
      visiblePixels:rect?Math.max(0,Math.min(rect.bottom,innerHeight-70)-Math.max(0,rect.top)):0,
      height:innerHeight,width:innerWidth};
   });
   const checkPrayerFold=async(daypart)=>{
    const fold=await prayerFirstFold();
    assert.ok(fold.text.length>=8&&fold.visiblePixels>=12,
      "F05 v3.0 prayer-first fold: "+daypart+" first canonical prayer must appear above phone navigation, "+JSON.stringify(fold));
   };
   const state=()=>page.evaluate(()=>{
    const mount=document.querySelector("#aoPray435930.open .aoP435930Mount");
    return {kind:mount?.dataset.aoTraditionalDualAxis,
      mode:mount?.querySelector(".aoDailyUxContinuous")?.dataset.aoDailyUxMode||"cards",
      count:mount?.querySelectorAll(".aoDailyUxStage").length||0,
      overflow:document.documentElement.scrollWidth-innerWidth,
      mountOverflow:(mount?.scrollWidth||0)-(mount?.clientWidth||0)};
   });
   assert.equal((await state()).kind,"daily","card mode must retain original dual-axis reader");
   // Source-book hierarchy is the primary navigation. Only released complete
   // St Pius X editions are actionable; other books remain clearly partial.
   assert.equal(await page.locator(base+'.aoDailyBookSelector').count(),1);
   assert.equal(await page.locator(base+'.aoDailyBookPillPending').count(),3);
   assert.equal(await page.locator(base+'.aoDailyBookEditions [aria-pressed="true"]').count(),1);
   assert.equal(await page.locator(base+'[data-tp381-personal-value="1913"]').getAttribute("aria-pressed"),"true");
   await page.locator(base+'[data-tp381-personal-value="1905"]').click();
   await openBookSettings();
   assert.equal(await page.locator(base+'[data-tp381-personal-value="1905"]').getAttribute("aria-pressed"),"true","1905 pill must switch the existing edition owner");
   assert.equal(await page.locator(base+'[data-ao-pray-guide-card^="piusx-1905"]').count(),1,"1905 must load its complete source-defined stage");
   await page.screenshot({path:resolve(captures,"daily-morning-1905-book-"+width+".png"),animations:"disabled"});
   await page.locator(base+'[data-tp381-personal-value="1913"]').click();
   await openBookSettings();
   assert.equal(await page.locator(base+'[data-tp381-personal-value="1913"]').getAttribute("aria-pressed"),"true");
   assert.equal(await page.locator(base+'[data-ao-pray-guide-card^="piusx-1913"]').count(),1,"1913 restores the original source-defined stage");
   assert.equal(await page.locator(base+'.aoDailyReadingOptions').count(),1,"reading layout belongs to a secondary disclosure");
   assert.equal(await page.locator(base+'.aoDailyReadingOptions').getAttribute("open"),null,"reading options must not displace source books above the prayer");
   assert.equal(await page.locator(base+'.aoDailyUxModes [aria-pressed="true"]').count(),1);
   await page.locator(base+'.aoP435930Head.aoPrayerBookHead > .aoPrayerBookMenu > summary').click();
   await checkPrayerFold("morning");
   await page.screenshot({path:resolve(captures,"daily-morning-cards-"+width+".png"),animations:"disabled"});
   await openBookSettings();
   await page.locator(base+'.aoDailyReadingOptions summary').click();
   await page.locator(base+'[data-tp381-daily-presentation="continuous"]').click();
   let flow=await state();
   assert.equal(flow.mode,"continuous");
   assert.equal(flow.count,sourcePlan.morning.length,"continuous Morning must match the active source-edition plan");
   assert.ok(flow.overflow<=1&&flow.mountOverflow<=1,"morning horizontal overflow "+JSON.stringify(flow));
   assert.ok(await page.locator(base+'.aoDailyUxStage .aoTP381PrayerCard').count()>0,"continuous mode should reuse real prayer cards");
   const first=page.locator(base+'[data-ao-daily-position="0"]');
   assert.ok((await first.innerText()).length>40,"the first prayer must render actual text");
   await page.screenshot({path:resolve(captures,"daily-morning-continuous-"+width+".png"),animations:"disabled"});
   await page.locator(base+'.aoDailyUxJump summary').click();
   await page.locator(base+'[data-tp381-flow-jump="8"]').click();
   assert.equal(await page.evaluate(()=>document.activeElement?.id),"aoDailyPilotStep-8","jump must focus actual prayer without marking it complete");
   assert.equal(await page.locator(base+'[data-ao-daily-position="8"][data-completed]').count(),0);
   await page.locator(base+'[data-tp381-daypart="evening"]').click();
   flow=await state();
   assert.equal(flow.count,sourcePlan.evening.length,"Evening must match the selected St Pius X source-edition plan, not impose the 13-step canonical baseline");
   assert.ok(flow.overflow<=1&&flow.mountOverflow<=1,"evening horizontal overflow "+JSON.stringify(flow));
   await page.screenshot({path:resolve(captures,"daily-evening-continuous-"+width+".png"),animations:"disabled"});
   await openBookSettings();
   await page.locator(base+'.aoDailyReadingOptions summary').click();
   await page.locator(base+'[data-tp381-daily-presentation="guided"]').click();
   assert.equal((await state()).kind,"daily","switching back restores canonical dual-axis cards");
   assert.equal(await page.locator(base+'.aoDailyUxStage').count(),0);
   assert.equal(await page.locator(base+'.aoQuietHorizon').count(),1,"existing horizon presentation must remain");
   await checkPrayerFold("evening");
   await page.screenshot({path:resolve(captures,"daily-evening-cards-"+width+".png"),animations:"disabled"});
   assert.deepEqual(errors,[],"Uncaught phone errors: "+errors.join("; "));
   console.log("PASS "+width+"px: direct 1913/1905 source pills, three pending book labels, secondary reading control and "+sourcePlan.morning.length+"/"+sourcePlan.evening.length+" source-edition stages; no completion inferred");
  }finally{await page.close()}
 }
 // The older phone suite covers French cards. This pilot must additionally
 // prove that the new continuous presentation handles French at 320px.
 const frPage=await browser.newPage({viewport:{width:320,height:568},isMobile:true,hasTouch:true,locale:"fr-FR",serviceWorkers:"block"});
 const frenchErrors=[];frPage.on("pageerror",e=>frenchErrors.push(e.message));
 try{
  const origin="http://127.0.0.1:"+server.address().port;
  await frPage.goto(origin+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
  await frPage.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().installed===true&&typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:40000});
  await frPage.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("settings"));
  await frPage.waitForSelector('#ao-settings-modular-root [data-settings-route="/settings/language-reading"]',{timeout:20000});
  await frPage.locator('[data-settings-route="/settings/language-reading"]').click();
  await frPage.locator('[data-pref-path="general.uiLanguage"][data-pref-value="fr"]').click();
  await frPage.waitForFunction(()=>globalThis.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr",null,{timeout:10000});
  await frPage.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("home"));
  assert.equal(await frPage.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
  const opened=await frPage.evaluate(()=>globalThis.AO_MODULES.open("pray.morning_evening"));
  assert.notEqual(opened,false);
  const base="#aoPray435930.open ";
  await frPage.waitForSelector(base+".aoDailyBookSelector",{state:"attached",timeout:20000});
  const frenchAa=frPage.locator(base+'.aoP435930Head.aoPrayerBookHead > .aoPrayerBookMenu');
  assert.equal(await frenchAa.count(),1);
  await frenchAa.locator(":scope > summary").click();
  assert.ok(await frPage.locator(base+'.aoDailyBookSelector').isVisible());
  assert.match(await frPage.locator(base+".aoDailyBookLabel").innerText(),/Version du livre de prières/i);
  await frPage.locator(base+".aoDailyReadingOptions summary").click();
  await frPage.locator(base+'[data-tp381-daily-presentation="continuous"]').click();
  const first=frPage.locator(base+'[data-ao-daily-position="0"]');
  assert.ok((await first.innerText()).length>160,"French opening prayer should render full source text");
  await first.scrollIntoViewIfNeeded();
  const dimensions=await frPage.evaluate(()=>{
   const mount=document.querySelector("#aoPray435930.open .aoP435930Mount");
   const stage=mount?.querySelector(".aoDailyUxStage");
   const rect=stage?.getBoundingClientRect();
   return {overflow:document.documentElement.scrollWidth-innerWidth,
     mountOverflow:(mount?.scrollWidth||0)-(mount?.clientWidth||0),
     left:rect?.left,right:rect?.right,viewport:innerWidth};
  });
  assert.ok(dimensions.overflow<=1&&dimensions.mountOverflow<=1&&dimensions.left>=-1&&dimensions.right<=dimensions.viewport+1,
   "French continuous 320px text must fit the phone: "+JSON.stringify(dimensions));
  await frPage.screenshot({path:resolve(captures,"daily-morning-continuous-text-320-fr.png"),animations:"disabled"});
  assert.deepEqual(frenchErrors,[],"French pilot errors: "+frenchErrors.join("; "));
  console.log("PASS French 320px: complete source prayer text and edition selector fit without horizontal overflow");
 }finally{await frPage.close()}
 // Explicit legacy rollback must remain possible without changing saved prayer rules.
 const rollback=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:"block"});
 try{
  const origin="http://127.0.0.1:"+server.address().port;
  await rollback.goto(origin+"/index.html?aoDailyUxPilot=0",{waitUntil:"domcontentloaded",timeout:90000});
  await rollback.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:40000});
  assert.equal(await rollback.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
  assert.notEqual(await rollback.evaluate(()=>globalThis.AO_MODULES.open("pray.morning_evening")),false);
  await rollback.waitForSelector("#aoPray435930.open .aoDailyAccessNav",{timeout:20000});
  assert.equal(await rollback.locator("#aoPray435930.open .aoDailyBookSelector").count(),0,
    "Rollback must restore the pre-book-first reader without altering source texts");
  assert.equal(await rollback.locator("#aoPray435930.open [data-tp381-personal-action='edition']").count(),2,
    "Legacy edition settings remain available in Customize");
  console.log("PASS rollback query: legacy daily navigation preserved");
 }finally{await rollback.close()}
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
