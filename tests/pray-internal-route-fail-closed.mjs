import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {internalPrayerView,INTERNAL_PRAYER_VIEWS,supportedDirectPrayerRoute} from "../src/pray/internal-route-owner.js";

assert.equal(internalPrayerView("pray.angelus_regina"),"angelus");
assert.equal(internalPrayerView("pray.stations"),"stations");
assert.equal(internalPrayerView("pray.confession"),"confession");
assert.equal(internalPrayerView("pray.novenas"),null,"Registry-owned Novenas cannot be stolen");
assert.equal(internalPrayerView("pray.morning_evening"),null,"Traditional reader cannot be stolen");
assert.equal(internalPrayerView("pray.whatever_missing"),null,"No unknown route may silently become Angelus");
assert.ok(Object.isFrozen(INTERNAL_PRAYER_VIEWS));
assert.equal(supportedDirectPrayerRoute("pray.rosary"),true,"Rosary's bead owner is a supported direct launch");
assert.equal(supportedDirectPrayerRoute("pray.angelus_regina"),true);
assert.equal(supportedDirectPrayerRoute("pray.novenas"),false,"External Novena reader must not be captured by the direct own-reader API");
assert.equal(supportedDirectPrayerRoute("pray.fake_missing_route"),false);

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+pathname);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message??error));}
});
await new Promise((done,fail)=>{server.once("error",fail);server.listen(4284,"127.0.0.1",done)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,locale:"fr-FR",serviceWorkers:"block"});
 const errors=[];page.on("pageerror",error=>errors.push(error.message));
 await page.goto("http://127.0.0.1:4284/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:20000});
 assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
 await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:15000});
 const initial=await page.evaluate(()=>globalThis.AO_PRAY_V435930.state().view);
 assert.equal(initial,"home");
 await page.evaluate(()=>{
  const b=document.createElement("button");
  b.type="button";b.id="bad-internal-prayer-route";
  b.dataset.p435930Own="pray.fake_missing_route";
  b.textContent="Unknown";
  document.querySelector("#aoPray435930 .aoP435930Mount").append(b);
  b.click();
 });
 assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.state().view),"home",
   "Unknown in-reader route replaced current view");
 // Direct API calls must also preserve route and Back context on failure.
 const invalid=await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.fake_missing_route",{returnContext:{surface:"calendar"}}));
 assert.equal(invalid,false);
 assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.state().view),"home",
   "Unknown direct Prayer API launch changed the active view");
 assert.equal(await page.locator('#aoPray435930 [data-p435930-internal-route-error="pray.fake_missing_route"]').count(),1,
   "Exact missing-route failure must be visible, not silently return Angelus");
 assert.equal(await page.locator("#aoPray435930 .aoP435930AngelusSequence").count(),0);
 await page.locator('#aoPray435930 [data-p435930-retry-internal="pray.fake_missing_route"]').evaluate(b=>b.click());
 assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.state().view),"home");
 await page.evaluate(()=>{
  const b=document.createElement("button");b.type="button";
  b.dataset.p435930Own="pray.angelus_regina";
  b.id="valid-internal-prayer-route";b.textContent="Angelus";
  document.querySelector("#aoPray435930 .aoP435930Mount").append(b);b.click();
 });
 // The approved hub-to-Angelus entry adds an introduction, without changing
 // the canonical five/four-card reader or invalid-route fail-closed behavior.
 const intro=page.locator('#aoPray435930.open [data-p435930-pilot-angelus-begin]');
 if(await intro.count())await intro.click();
 await page.waitForSelector('#aoPray435930.open [data-ao-devotional-deck="v1"]',{timeout:9000});
 assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.state().view),"angelus");
 assert.equal(await page.locator("#aoPray435930 [data-p435930-internal-route-error]").count(),0);
 assert.equal(errors.length,0,"Browser errors: "+JSON.stringify(errors));
 console.log("PASS unknown Prayer routes fail visibly without Angelus fallback; valid routes retain card reader");
 await page.close();
}finally{await browser?.close();await new Promise(done=>server.close(done));}
