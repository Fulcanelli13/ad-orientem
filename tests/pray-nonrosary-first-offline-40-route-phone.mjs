import assert from "node:assert/strict";
import http from "node:http";
import {readFileSync} from "node:fs";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {PRAYER_DOOR_ORDER_V1} from "../src/pray/prayer-design-pilot.js";
import {internalPrayerView} from "../src/pray/internal-route-owner.js";

/**
 * Non-Rosary scope only. First-use OFFLINE after a transactional PWA install.
 * The 40 destinations are opened from the actual Prayer UI while airplane
 * mode is enabled in a newly loaded document. No Prayer route is pre-opened
 * online. Original Psalms / Gospel require an independently warmed source
 * and are not misrepresented as available for their first-ever offline read.
 *
 * This is route-entry / offline availability evidence, not 40 full-route
 * stage certificates, print-edition text collation or offline Scripture packs.
 */
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/pray-first-use-offline-nonrosary");
const routeMatrix=JSON.parse(readFileSync(resolve(root,"data/pray/prayer-language-route-matrix.v1.json"),"utf8"));
const ledger=JSON.parse(readFileSync(resolve(root,"data/pray/prayer-release-coverage-evidence.v1.json"),"utf8"));
assert.equal(routeMatrix.routes.length,41);
const routes=routeMatrix.routes.filter(x=>x.id!=="pray.rosary");
assert.equal(routes.length,40);
assert.deepEqual(routes.map(x=>x.id).sort(),ledger.routes.map(x=>x.id).filter(x=>x!=="pray.rosary").sort());
assert.equal(ledger.counts.fullRouteVariantCertificates,0);
assert.equal(ledger.counts.independentOriginalPrintCertificates,0);
const doors=Object.values(PRAYER_DOOR_ORDER_V1).flat().filter(x=>x!=="pray.rosary");
assert.equal(doors.length,38,"Current source-owned non-Rosary shelf count changed");
assert.deepEqual(routes.filter(x=>!doors.includes(x.id)).map(x=>x.id).sort(),
 ["pray.library","pray.sacred_hymns"]);

const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
 ".webp":"image/webp",".png":"image/png",".jpg":"image/jpeg",
 ".woff2":"font/woff2",".webmanifest":"application/manifest+json"};
let requestCount=0,offlineFailures=0;
const server=http.createServer(async(req,res)=>{
 try{
  let pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  if(pathname.startsWith("/ad-orientem/"))pathname=pathname.slice("/ad-orientem".length);
  if(pathname==="/"||!pathname)pathname="/index.html";
  const file=resolve(root,"."+pathname);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);return res.end("forbidden")}
  const body=await readFile(file);
  requestCount++;
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream",
   "cache-control":"no-store"});
  res.end(body);
 }catch(e){offlineFailures++;res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((ok,bad)=>{server.once("error",bad);server.listen(0,"127.0.0.1",ok)});
const report={schema:"ao.pray.nonrosary-first-offline-40-route-entry.v1",
 scope:"FIRST_USE_OFFLINE_AFTER_ONLINE_TRANSACTIONAL_APP_INSTALL_NO_PRAYER_PREOPEN",
 certification:"TWO_PHONE_LANGUAGE_SAMPLES_ENTRY_ONLY_NOT_ALL_STAGE_OR_INDEPENDENT_PRINT",
 testedVariants:[{width:320,language:"fr"},{width:390,language:"en"}],
 routeCount:40,excluded:"pray.rosary",
 cases:[],snapshots:[],limitations:[
  "Original Psalm and Gospel Scripture requests remain source-first and are not included in first-ever offline-text certification.",
  "Remote links, images, historical facsimiles, new Scripture packs and an offline first-ever installation are not certified.",
  "These 80 first-use route-entry cases are not comprehensive source-to-card or original printed edition certificates."
 ],errors:[]};
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const variant of report.testedVariants){
  const {width,language}=variant;
  const context=await browser.newContext({viewport:{width,height:width===320?700:844},
   deviceScaleFactor:1,isMobile:true,hasTouch:true,
   serviceWorkers:"allow",reducedMotion:"reduce",
   locale:language==="fr"?"fr-FR":"en-GB"});
  let page=await context.newPage(),pageErrors=[];
  const wire=p=>p.on("pageerror",e=>pageErrors.push(String(e.message||e)));
  wire(page);
  const origin="http://127.0.0.1:"+server.address().port+"/ad-orientem/index.html?aoOfflineTest=1";
  try{
   await page.goto(origin,{waitUntil:"load",timeout:90000});
   await page.waitForFunction(()=>globalThis.AO_OFFLINE_APP_V1?.status?.ready===true||
    Boolean(globalThis.AO_OFFLINE_APP_V1?.status?.error),
    null,{timeout:90000});
   const first=await page.evaluate(async()=>{
    const state=globalThis.AO_OFFLINE_APP_V1?.status;
    const cache=state?.version?await caches.open("ao-bootstrap-snapshot-v1-"+state.version):null;
    const marker=cache?await cache.match(new URL("__ao_bootstrap_completed__",location.href)):null;
    const metadata=marker?await marker.json():null;
    return {version:state?.version,ready:state?.ready,error:state?.error,
     files:metadata?.files,bytes:metadata?.bytes,controller:!!navigator.serviceWorker?.controller};
   });
   assert.equal(first.error,null,"Transactional PWA bootstrap failed: "+JSON.stringify(first));
   assert.equal(first.ready,true,"PWA offline readiness is false");
   assert.ok(first.files>0&&first.files<=544&&first.bytes>0&&first.bytes<=35000000,
    "No verified bounded transactional startup cache: "+JSON.stringify(first));
   // True OFFLINE document reboot: neither imported JavaScript modules nor
   // application state from the first document can conceal missing resources.
   await page.close();
   await context.setOffline(true);
   page=await context.newPage();wire(page);
   await page.goto(origin,{waitUntil:"domcontentloaded",timeout:55000});
   await page.waitForFunction(()=>globalThis.AO_OFFLINE_APP_V1?.status?.ready===true&&
    globalThis.AO_SETTINGS_APP_V1?.status?.().installed===true&&
    typeof globalThis.AO_APP_SHELL_V1?.navigate==="function",
    null,{timeout:40000});
   const boot=await page.evaluate(()=>({
    offline:navigator.onLine===false,controller:!!navigator.serviceWorker.controller,
    version:globalThis.AO_OFFLINE_APP_V1?.status?.version,
    lang:document.documentElement.lang
   }));
   assert.equal(boot.offline,true,"Browser not in actual offline mode");
   assert.equal(boot.controller,true,"Offline document lacks worker controller");
   assert.equal(boot.version,first.version,"Offline reboot changed committed snapshot version");
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("settings")))?.ok,true);
   await page.locator('#ao-settings-modular-root [data-settings-route="/settings/language-reading"]').click();
   await page.locator('#ao-settings-modular-root [data-pref-path="general.uiLanguage"][data-pref-value="'+language+'"]').click();
   await page.waitForFunction(lang=>document.documentElement.lang===lang,language,{timeout:12000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("pray")))?.ok,true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",
    null,{timeout:22000});
   // The first invocation of AO_PRAY_V435930 happens AFTER offline reboot.
   report.snapshots.push({...first,...boot,width,language});

   const hub=async()=>{
    assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.hub",{returnContext:null})),true);
    await page.locator("#aoPray435930.open [data-ao-pray-pilot-mosaic]").waitFor({state:"visible",timeout:10000});
   };
   for(const row of routes){
    const {id}=row,door=row.doors[0]||null;
    if(id==="pray.sacred_hymns"){
     const result=await page.evaluate(id=>globalThis.AO_MODULES.open(id,{returnContext:null}),id);
     assert.equal(result?.ok,true,id+" search-only handoff failed first-use offline");
    }else{
     await hub();
     if(id==="pray.library"){
      await page.locator('#aoPray435930.open [data-p435930-own="pray.library"]').first().click();
     }else{
      assert.ok(door,id+" lacks nine-door source ownership");
      await page.locator('#aoPray435930.open [data-p435930-family="'+door+'"]').first().click();
      await page.locator('#aoPray435930.open [data-ao-prayer-shelf="'+door+'"]').waitFor({timeout:10000});
      const key=row.sourceFamily==="canonical-prayer"?"data-p435930-door-prayer":"data-p435930-own";
      const direct='#aoPray435930.open [data-ao-prayer-shelf="'+door+'"] ['+key+'="'+id+'"]';
      const external='#aoPray435930.open [data-ao-prayer-shelf="'+door+'"] [data-p435930-external="'+id+'"]';
      const target=page.locator(direct+","+external).first();
      assert.equal(await target.count(),1,id+" missing from source-owned nine-door shelf offline");
      await target.click({timeout:15000});
     }
    }
    const expected=row.sourceFamily==="canonical-prayer"?"library":
     row.sourceFamily==="novena-programmes"?"novenas":
     row.sourceFamily==="traditional-pray"?"traditional-pray":internalPrayerView(id);
    assert.ok(expected,id+" has no registered canonical source reader");
    await page.waitForFunction(({expected,id})=>{
     const m=document.querySelector("#aoPray435930.open .aoP435930Mount");
     return m?.dataset.aoPrayView===expected&&
      (expected!=="traditional-pray"||m.dataset.aoTraditionalPrayRoute===id);
    },{expected,id},{timeout:18000}).catch(async error=>{
     const diag=await page.evaluate(()=>({
      visible:document.querySelector("#aoPray435930.open .aoP435930Mount")?.dataset.aoPrayView,
      traditional:document.querySelector("#aoPray435930.open .aoP435930Mount")?.dataset.aoTraditionalPrayRoute,
      error:document.querySelector("[data-p435930-internal-route-error],[data-p435930-family-open-error]")?.textContent||null,
      offline:navigator.onLine===false
     }));
     throw new Error(id+" first-use offline route failed: "+JSON.stringify(diag)+" "+String(error));
    });
    const state=await page.evaluate(({id})=>{
     const mount=document.querySelector("#aoPray435930.open .aoP435930Mount");
     const scroll=mount?.querySelector(".aoDevoCardScroll");
     const source=(mount?.innerText||"").trim();
     const overflow=mount?Math.max(0,mount.scrollWidth-mount.clientWidth):null;
     const gutter=mount?Math.max(0,mount.offsetWidth-mount.clientWidth-
      parseFloat(getComputedStyle(mount).borderLeftWidth||0)-
      parseFloat(getComputedStyle(mount).borderRightWidth||0)):0;
     const scripture=[...mount?.querySelectorAll("[data-ao-scripture-source]")||[]]
      .map(n=>({kind:n.dataset.aoScriptureSource,state:n.dataset.aoScriptureContent}));
     return {id,owner:mount?.dataset.aoPrayView,traditionalRoute:mount?.dataset.aoTraditionalPrayRoute,
      chars:source.length,language:document.documentElement.lang,
      isOffline:navigator.onLine===false,worker:!!navigator.serviceWorker.controller,
      documentOverflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),
      contentOverflow:Math.max(0,overflow-gutter),
      internalErrors:mount?.querySelectorAll("[data-p435930-internal-route-error],[data-p435930-family-open-error]").length,
      libraryCount:mount?.querySelectorAll("[data-p435930-lib-open]").length,
      readerScroll:scroll?getComputedStyle(scroll).overflowY:null,
      scripture,privateIntentionEditors:mount?.querySelectorAll(
        ".aoP435930ConfessionReader textarea,.aoP435930ConfessionReader input[type='text']").length};
    },{id});
    assert.equal(state.isOffline,true,id+" offline state lost");
    assert.equal(state.worker,true,id+" service-worker control lost");
    assert.equal(state.language,language,id+" changed UI language");
    assert.equal(state.owner,expected,id+" reader owner changed in offline mode");
    assert.ok(state.chars>=10,id+" first-use offline source reader blank");
    assert.ok(state.documentOverflow<=2&&state.contentOverflow<=2,
     id+" clips "+width+"px "+language+" offline: "+JSON.stringify(state));
    assert.equal(state.internalErrors,0,id+" showed internal route failure");
    if(id==="pray.library")assert.ok(state.libraryCount>=48,id+" lost canonical library offline");
    if(id==="pray.confession")assert.equal(state.privateIntentionEditors,0,
     "Offline Confession must not introduce persistent sins/intention fields");
    // A canonical Scripture request is asynchronous; do not confuse the
    // reader's initial paint with absence of the source-state marker. Wait
    // for its real loaded/unavailable status, without claiming cold original
    // source text while disconnected or substituting fabricated verses.
    if(id==="pray.penitential_psalms"||id==="pray.seven_words"){
     await page.waitForFunction(()=>document.querySelector(
      "#aoPray435930.open .aoP435930Mount [data-ao-scripture-source][data-ao-scripture-content]"),
      null,{timeout:12000});
     const statuses=await page.locator(
      "#aoPray435930.open [data-ao-scripture-source][data-ao-scripture-content]"
     ).evaluateAll(nodes=>nodes.map(x=>x.dataset.aoScriptureContent));
     assert.ok(statuses.length>0&&statuses.every(x=>["ready","unavailable","loading"].includes(x)),
      id+" lacks a truthful asynchronous source status: "+JSON.stringify(statuses));
    }
    report.cases.push({width,language,door:door||"library-or-search",...state});
    console.log("PASS OFFLINE_FIRST_USE "+width+" "+language+" "+id+" -> "+expected);
    if(row.sourceFamily==="canonical-prayer"){
     await page.locator("#aoPray435930.open [data-p435930-lib-back]").click();
     assert.equal(await page.locator('#aoPray435930.open [data-ao-prayer-shelf="'+door+'"]').count(),1,
      id+" canonical Back lost offline shelf");
    }
   }
   assert.equal(report.cases.filter(x=>x.width===width&&x.language===language).length,40,
    "Non-Rosary offline route inventory incomplete");
   assert.deepEqual(pageErrors,[],"Offline browser exception "+width+"/"+language+": "+pageErrors.join(" | "));
   console.log("PASS OFFLINE_NONROSARY "+width+" "+language+" 40/40 routes on first offline document");
  }catch(error){report.errors.push({width,language,details:String(error?.stack||error)});throw error;}
  finally{await context.close()}
 }
 assert.equal(report.cases.length,80);
 assert.equal(new Set(report.cases.map(x=>x.id)).size,40);
 console.log("PASS 80/80 non-Rosary source-owned route entries on first-use cold PWA offline reboot; NOT original Scripture first-offline full text, all-stage, or independent historical editions");
}finally{
 await mkdir(output,{recursive:true});
 await writeFile(resolve(output,"first-use-offline-nonrosary-40-route.json"),JSON.stringify(report,null,2)+"\n");
 await browser?.close().catch(()=>{});
 await new Promise(done=>server.close(done));
}
