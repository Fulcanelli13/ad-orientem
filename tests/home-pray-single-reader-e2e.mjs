import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const uri=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+uri);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);return res.end("forbidden");}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4296,"127.0.0.1",ok);});
let browser;
try{
 browser=await chromium.launch({headless:true});
 const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:"fr-FR",serviceWorkers:"block"});
 const page=await ctx.newPage(),errors=[];
 page.on("pageerror",e=>errors.push(String(e?.message??e)));
 await page.goto("http://127.0.0.1:4296/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>globalThis.AO_HOME_APP_V1?.status?.().installed===true || globalThis.AO_APP_SHELL_V1?.status?.().visibleOwner===true,null,{timeout:30000});
 await page.waitForSelector(".homeScreen",{state:"visible",timeout:20000});
 // The real first-use cinematic intentionally intercepts clicks until ready.
 // Insert the shortcut only after initial Home boot/calendar repaint settles.
 await page.waitForFunction(()=>{
  const boot=document.getElementById("ao-cinema-boot");
  const safe=!boot||boot.hidden||getComputedStyle(boot).display==="none"||
    getComputedStyle(boot).pointerEvents==="none";
  return safe&&globalThis.AO_RUNTIME_V8?.store?.getState?.()?.resolving!==true;
 },null,{timeout:30000});
 const read=async()=>page.evaluate(()=>{
  const root=document.querySelector("#aoPray435930.open");
  const deck=root?.querySelector('[data-ao-devotional-deck="v1"]');
  const current=deck?.querySelector('.aoDevoCard:not([hidden])');
  return {owner:root?.querySelector(".aoP435930Mount")?.dataset?.aoPrayView??null,deck:deck?.dataset?.aoDevotionalDeck??null,
   cards:deck?.querySelectorAll('.aoDevoCard')?.length??0,
   timeline:deck?.querySelectorAll('.aoDevoStop')?.length??0,
   first:current?.dataset?.aoDevoCard??null,
   scroll:current?.querySelector('.aoDevoCardScroll')?getComputedStyle(current.querySelector('.aoDevoCardScroll')).overflowY:null,
   railOwner:root?.querySelector('[data-ao-ritual-module="angelus"]')?.getAttribute("data-ao-ritual-module")??null};
 });
 // Exercise the real delegated Home click, not a mock registry call.
 await page.evaluate(()=>{
  const btn=document.createElement("button");
  btn.type="button";btn.id="single-owner-home-angelus";btn.dataset.homeCuStatic="angelus";
  btn.textContent="Angelus";document.querySelector(".homeScreen").append(btn);
 });
 await page.locator("#single-owner-home-angelus").click();
 try{
  await page.waitForSelector('#aoPray435930.open [data-ao-devotional-deck="v1"]',{timeout:15000});
 }catch(error){
  const diagnostic=await page.evaluate(()=>({
   route:globalThis.AO_RUNTIME_V8?.store?.getState?.()?.route,
   shell:globalThis.AO_APP_SHELL_V1?.status?.(),
   home:globalThis.AO_HOME_APP_V1?.status?.(),
   pray:globalThis.AO_PRAY_APP_V1?.status?.(),
   loaded:typeof globalThis.AO_PRAY_V435930?.open,
   prayerState:globalThis.AO_PRAY_V435930?.state?.(),
   module:globalThis.AO_MODULES?.resolve?.("pray.angelus_regina"),
   root:document.querySelector("#aoPray435930")?.outerHTML?.slice(0,750),
   error:document.querySelector(".homeScreen [data-home-shortcut-error]")?.textContent??null,
  }));
  throw new Error("Home Angelus failed to reach canonical card reader: "+JSON.stringify({diagnostic,errors})+"; "+error);
 }
 const fromHome=await read();
 assert.equal(fromHome.owner,"angelus");
 assert.equal(fromHome.deck,"v1","Home still opened a legacy Daily Rule prayer sheet");
 assert.ok(fromHome.cards>=4&&fromHome.timeline===fromHome.cards,"Home lost named cards/timeline");
 assert.equal(fromHome.scroll,"auto","Home Angelus does not have card-local vertical reading");
 // Navigate through the actual Prayer catalogue, not a second direct reader.
 const back=await page.evaluate(async()=>globalThis.AO_APP_SHELL_V1.navigate("pray"));
 assert.equal(back?.ok,true,"Prayer catalogue did not open");
 await page.waitForSelector("#aoPray435930.open [data-p435930-family='daily']",{timeout:15000});
 await page.locator("#aoPray435930 [data-p435930-family='daily']").click();
 await page.locator("#aoPray435930 [data-p435930-own='pray.angelus_regina']").click();
 // The default nine-door Prayer discovery may offer an explicit Angelus
 // recitation entry. Unlike the direct Home shortcut, that catalogue path
 // requires the user's real "Begin prayer" action before opening the SAME
 // canonical card reader. The legacy grouped rollback opens it directly.
 const begin=page.locator("#aoPray435930.open [data-p435930-pilot-angelus-begin]");
 if(await begin.count()){
  assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930?.state?.()?.view),
   "angelus","Catalogue Angelus entry escaped its canonical reader owner");
  await begin.click();
 }
 await page.waitForSelector('#aoPray435930.open [data-ao-devotional-deck="v1"]',{timeout:15000});
 const fromPrayers=await read();
 assert.deepEqual(fromHome,fromPrayers,"Home and Prayers render different Angelus reader owners/models");
 assert.equal(errors.length,0,"Unexpected browser errors: "+JSON.stringify(errors));
 console.log("PASS same visible Angelus reader from Home and Prayers: "+JSON.stringify(fromHome));
 await ctx.close();
}finally{await browser?.close();await new Promise(ok=>server.close(ok));}
