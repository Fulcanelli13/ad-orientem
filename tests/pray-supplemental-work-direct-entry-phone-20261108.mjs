/**
 * Eight source-owned historical prayer entries: exact original bodies and
 * selected intentions, in two phone widths and English/French UI contexts.
 */
import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {PRIESTLY_INTERCESSIONS_B19,priestlyIntercessionFor} from "../src/pray/priestly-intercessions-b19.js";
import {occasionalIntercessionFor} from "../src/pray/occasional-intercessions-b20.js";
import {occasionalIntercessionB21For} from "../src/pray/occasional-intercessions-b21.js";
import {PRAY_CANONICAL_DATA_V435930 as DATA} from "../src/pray/canonical-data.js";
import {PRAYER_SUPPLEMENTAL_LIVE_WORK_LINKS_V1 as LINKS} from "../src/pray/prayer-supplemental-live-works.v1.js";
import {internalPrayerView} from "../src/pray/internal-route-owner.js";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
  const bytes=await readFile(path);res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream","cache-control":"no-store"});res.end(bytes);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((yes,no)=>{server.once("error",no);server.listen(0,"127.0.0.1",yes)});
const normalize=s=>String(s??"").normalize("NFC").replace(/\s+/g,"");
let browser,checks=0;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390])for(const ui of ["en","fr"]){
  const ctx=await browser.newContext({viewport:{width,height:width===320?700:844},isMobile:true,hasTouch:true,locale:ui==="fr"?"fr-FR":"en-GB",serviceWorkers:"block",reducedMotion:"reduce"});
  const page=await ctx.newPage(),errs=[];page.on("pageerror",e=>errs.push(String(e.message)));
  const scope="#aoPray435930.open ";
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().installed===true&&typeof globalThis.AO_APP_SHELL_V1?.navigate==="function",null,{timeout:45000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("settings")))?.ok,true);
   await page.locator('#ao-settings-modular-root [data-settings-route="/settings/language-reading"]').click();
   await page.locator('#ao-settings-modular-root [data-pref-path="general.uiLanguage"][data-pref-value="'+ui+'"]').click();
   await page.waitForFunction(x=>document.documentElement.lang===x,ui,{timeout:10000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("pray")))?.ok,true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
   for(const item of LINKS){
    assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.library",{returnContext:null})),true);
    const browser=page.locator(scope+'[data-ao-prayer-subject-browser]');
    if(!(await browser.evaluate(el=>el.open)))await browser.locator("summary").evaluate(el=>el.click());
    await page.locator(scope+'[data-p435930-lib-subject="'+item.subject+'"]').evaluate(el=>el.click());
    const link=page.locator(scope+'[data-p435930-subject-work="'+item.id+'"]');
    assert.equal(await link.count(),1,"Missing exact work result "+item.id);
    assert.ok((await link.innerText()).includes(ui==="fr"?item.fr:item.en),"Language title mismatch "+item.id+"/"+ui);
    await link.evaluate(el=>el.click());
    await page.waitForFunction(view=>document.querySelector("#aoPray435930.open .aoP435930Mount")?.dataset.aoPrayView===view,internalPrayerView(item.route),{timeout:15000});
    const isPriest=item.owner==="B19",selector=isPriest?".aoPriestsText":".aoOccasionalText";
    const parent=isPriest?"[data-ao-priests-intercession]":"[data-ao-occasional-intercession]";
    const actual=await page.locator(scope+parent+" "+selector).evaluate(el=>({lang:el.getAttribute("lang"),text:el.textContent}));
    const expected=isPriest?priestlyIntercessionFor(item.purpose,ui,false):
      item.owner==="B20"?occasionalIntercessionFor(item.purpose,ui,false,DATA.prayers.devotion_ad_te_beate_ioseph):
      occasionalIntercessionB21For(item.purpose,ui,false,DATA.prayers.devotion_ad_te_beate_ioseph);
    assert.equal(expected.id,item.id);
    assert.equal(actual.lang,expected.language,"Reader source language mismatch "+item.id+"/"+ui);
    assert.equal(normalize(actual.text),normalize(expected.text),"Wrong prayer body or incomplete source "+item.id+"/"+ui);
    const selected=scope+parent+' [data-p435930-'+(isPriest?"priests":"occasional")+'-purpose="'+item.purpose+'"]';
    assert.equal(await page.locator(selected).getAttribute("aria-pressed"),"true","Wrong original reader purpose selected "+item.id);
    checks++;
   }
   // A work can be found without first knowing its theological subject.
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.library",{returnContext:null})),true);
   await page.locator(scope+'[data-p435930-lib-search]').evaluate(el=>{el.value='journey';el.dispatchEvent(new Event('input',{bubbles:true}))});
   const searchHit=page.locator(scope+'[data-p435930-subject-work="occasional_travel_lasance_1911_en"]');
   assert.equal(await searchHit.count(),1,"Global Library search must find the original journey prayer");
   await searchHit.evaluate(el=>el.click());
   await page.waitForFunction(()=>document.querySelector("#aoPray435930.open .aoP435930Mount")?.dataset.aoPrayView==='occasionals',null,{timeout:10000});
   const searchPrayer=await page.locator(scope+'[data-ao-occasional-intercession] .aoOccasionalText').innerText();
   assert.equal(normalize(searchPrayer),normalize(occasionalIntercessionB21For('travel',ui,false,DATA.prayers.devotion_ad_te_beate_ioseph).text));
   assert.deepEqual(errs,[],"Unexpected browser JS error "+width+"/"+ui);
   console.log("PASS "+width+"px "+ui+": 8/8 historical individual entries, original source languages and full prayer bodies.");
  }finally{await ctx.close()}
 }
 assert.equal(checks,32);
 console.log("PASS 32/32 exact original B19/B20/B21 source/DOM comparisons and selected-purpose reader handoffs across 320/390 EN/FR. No invented French.");
}finally{await browser?.close().catch(()=>{});await new Promise(done=>server.close(done))}
