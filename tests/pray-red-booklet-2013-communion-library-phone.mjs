/**
 * 2013 Red Booklet completeness follow-up: five existing full Communion
 * source prayers discoverable in the Library. No new prayer bodies or
 * assertions of exact 2013 English wording.
 */
import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {COMMUNION_TREASURY_V383 as SOURCE} from "../src/pray/traditional-pray-data.js";
import {RED_BOOKLET_COMMUNION_LIBRARY_LINKS_V1 as LINKS} from "../src/pray/red-booklet-communion-library-links.v1.js";
import {RED_BOOKLET_SUSCIPE_LIBRARY_LINK_V1 as SUSCIPE} from "../src/pray/red-booklet-suscipe-library-link.v1.js";
import {prayerAcquisitionCandidates} from "../src/pray/prayer-acquisition-historical-witnesses.v1.js";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
  const bytes=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream","cache-control":"no-store"});res.end(bytes);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message||error))}
});
await new Promise((yes,no)=>{server.once("error",no);server.listen(0,"127.0.0.1",yes)});
const normalize=v=>String(v??"").normalize("NFC").replace(/\s+/g,"");
const scope="#aoPray435930.open ";
let browser,checked=0;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390])for(const ui of ["en","fr"]){
  const context=await browser.newContext({viewport:{width,height:width===320?700:844},isMobile:true,hasTouch:true,locale:ui==="fr"?"fr-FR":"en-GB",serviceWorkers:"block",reducedMotion:"reduce"});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().installed===true&&typeof globalThis.AO_APP_SHELL_V1?.navigate==="function",null,{timeout:45000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("settings")))?.ok,true);
   await page.locator('#ao-settings-modular-root [data-settings-route="/settings/language-reading"]').click();
   await page.locator('#ao-settings-modular-root [data-pref-path="general.uiLanguage"][data-pref-value="'+ui+'"]').click();
   await page.waitForFunction(lang=>document.documentElement.lang===lang,ui,{timeout:10000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("pray")))?.ok,true);
   await page.waitForFunction(()=>typeof globalThis.AO_TRADITIONAL_PRAY_V381?.open==="function",null,{timeout:30000});
   for(const link of LINKS){
    assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.library",{returnContext:null})),true);
    const browse=page.locator(scope+'[data-ao-prayer-subject-browser]');
    if(!await browse.evaluate(el=>el.open))await browse.locator("summary").evaluate(el=>el.click());
    await page.locator(scope+'[data-p435930-lib-subject="III"]').evaluate(el=>el.click());
    const button=page.locator(scope+'[data-p435930-red-communion="'+link.id+'"]');
    assert.equal(await button.count(),1,"A source prayer is absent from Eucharistic Library: "+link.id);
    assert.ok((await button.innerText()).includes(ui==="fr"?link.fr:link.en),"Wrong Library title "+link.id+"/"+ui);
    await button.evaluate(el=>el.click());
    await page.waitForFunction(target=>{
      const s=globalThis.AO_TRADITIONAL_PRAY_V381?.state?.();
      return s?.route==="pray.communion_treasury"&&s.communion===target.phase;
    },{phase:link.phase},{timeout:15000});
    const state=await page.evaluate(()=>globalThis.AO_TRADITIONAL_PRAY_V381.state());
    const reader=page.locator(scope+'[data-ao-devo-card="communion-'+link.phase+'-'+link.sourceId+'"]');
    assert.equal(await reader.count(),1,"Incorrect Communion reader card "+link.id);
    const vernacular=reader.locator('[data-face-v],.aoTP381Reader').first();
    const actual=await vernacular.innerText();
    const expected=SOURCE[link.sourceId]?.[ui];
    assert.ok(expected?.length>30,"Missing original source text "+link.id+"/"+ui);
    assert.equal(normalize(actual),normalize(expected),"Original prayer body lost or changed "+link.id+"/"+ui);
    assert.equal(await vernacular.getAttribute("lang"),ui,"Wrong original vernacular face "+link.id+"/"+ui);
    assert.ok(Number.isInteger(state.communionStep));
    checked++;
   }
   // Suscipe opens the unchanged, source-owned Morning Offering reader. Its
   // Latin witness is independently printed; the French UI never invents FR.
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.library",{returnContext:null})),true);
   await page.locator(scope+'[data-p435930-lib-search]').evaluate(el=>{
    el.value="Suscipe";el.dispatchEvent(new Event("input",{bubbles:true}));
   });
   const suscipeEntry=page.locator(scope+'[data-p435930-red-suscipe="ignatius_suscipe"]');
   assert.equal(await suscipeEntry.count(),1,"Suscipe must be discoverable by name globally");
   await suscipeEntry.evaluate(el=>el.click());
   await page.waitForFunction(id=>{
    const state=globalThis.AO_TRADITIONAL_PRAY_V381?.state?.();
    return state?.route==="pray.morning_evening"&&state.dailyMode==="direct"&&state.dailyDirectId===id;
   },SUSCIPE.sourceIds.en,{timeout:15000});
   for(const language of ["en","la"]){
    const id=SUSCIPE.sourceIds[language];
    if(language==="la")await page.locator(scope+'[data-tp381-suscipe-lang="la"]').evaluate(el=>el.click());
    const source=prayerAcquisitionCandidates("self_offering",{language}).find(x=>x.id===id);
    const card=page.locator(scope+'[data-ao-personal-source="'+id+'"]');
    assert.equal(await card.count(),1,"Suscipe original source card missing "+language);
    const face=card.locator('.aoTP381Reader');
    assert.equal(await face.getAttribute("lang"),language,"Source language mismatched "+language);
    assert.equal(normalize(await face.innerText()),normalize(source.text),"Original Lasance wording differs "+language);
    const state=await page.evaluate(()=>globalThis.AO_TRADITIONAL_PRAY_V381.state());
    assert.equal(state.dailyDirectId,id);
    assert.equal(state.dailyDirectLanguage,language);
    checked++;
   }
   assert.equal(await page.locator(scope+'[data-ao-suscipe-source-note]').count(),1);
   assert.equal(await page.evaluate(()=>globalThis.AO_TRADITIONAL_PRAY_V381.open("pray.morning_evening",{dailySourcePrayer:"bogus"})),false);
   assert.equal((await page.evaluate(()=>globalThis.AO_TRADITIONAL_PRAY_V381.state())).dailyDirectId,SUSCIPE.sourceIds.la);
   // Source-only links must be found by title even without subject selection.
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.library",{returnContext:null})),true);
   await page.locator(scope+'[data-p435930-lib-search]').evaluate(el=>{el.value="Bonaventure";el.dispatchEvent(new Event("input",{bubbles:true}))});
   const found=page.locator(scope+'[data-p435930-red-communion="communion_bonaventure"]');
   assert.equal(await found.count(),1,"Global Prayer Library search failed for Bonaventure");
   await found.evaluate(el=>el.click());
   await page.waitForFunction(()=>globalThis.AO_TRADITIONAL_PRAY_V381?.state?.().route==="pray.communion_treasury",null,{timeout:15000});
   assert.equal(await page.locator(scope+'[data-ao-devo-card="communion-after-afterBonaventure"]').count(),1);
   const prior=await page.evaluate(()=>globalThis.AO_TRADITIONAL_PRAY_V381.state());
   assert.equal(await page.evaluate(()=>globalThis.AO_TRADITIONAL_PRAY_V381.open("pray.communion_treasury",{communionPrayer:"not-published"})),false,"Invalid deep link must fail closed");
   const after=await page.evaluate(()=>globalThis.AO_TRADITIONAL_PRAY_V381.state());
   assert.equal(after.route,prior.route);
   assert.equal(after.communionStep,prior.communionStep);
   assert.deepEqual(errors,[],"Browser JavaScript errors "+width+"/"+ui);
   console.log("PASS "+width+"px "+ui+": all five Communion works open exact source cards; title search and invalid source guard.");
  }finally{await context.close()}
 }
 assert.equal(checked,28,"Five Communion plus Suscipe EN and LA in four device/language combinations");
 console.log("PASS 28 source-owned reading-body comparisons, five Communion plus EN/LA Suscipe × 320/390 EN/FR; no copied Red Booklet wording.");
}finally{await browser?.close().catch(()=>{});await new Promise(done=>server.close(done))}
