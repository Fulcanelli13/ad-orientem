import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".js":"text/javascript; charset=utf-8",".html":"text/html; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".webp":"image/webp",".png":"image/png",".jpg":"image/jpeg",".woff2":"font/woff2",".webmanifest":"application/manifest+json"};
let variant=1,swRevision=1,failedPath=null,served=0,failedHits=0,assetHits=[];
const server=http.createServer(async(req,res)=>{
 try{
  let pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  if(pathname.startsWith("/ad-orientem/"))pathname=pathname.slice("/ad-orientem".length);
  if(pathname==="/"||!pathname)pathname="/index.html";
  if(pathname.startsWith("/__ao_offline_test_")){
   assetHits.push(pathname);
   if(failedPath===pathname){failedHits++;res.writeHead(503);res.end("deliberately broken release");return}
   res.writeHead(200,{"content-type":"text/javascript"});res.end("globalThis.AO_OFFLINE_TEST_ASSET="+JSON.stringify(variant)+";");return;
  }
  const file=resolve(root,"."+pathname);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return}
  let body=await readFile(file);
  if(pathname==="/sw.js"&&swRevision>1)
   body=Buffer.from(body.toString("utf8")+"\n// worker-revision-"+swRevision+"\n");
  if(pathname==="/index.html"&&variant!==1){
    const extra='<script src="./__ao_offline_test_'+variant+'.js"></script><!-- offline-build-'+variant+' -->';
    body=Buffer.from(body.toString("utf8").replace("</body>",extra+"</body>"));
  }
  served++;
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(body);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((ok,no)=>{server.once("error",no);server.listen(4208,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,serviceWorkers:"allow"});
 const page=await context.newPage();
 const errs=[];page.on("pageerror",e=>errs.push(String(e.message||e)));
 const origin="http://127.0.0.1:4208/ad-orientem/index.html?aoOfflineTest=1";
 await page.goto(origin,{waitUntil:"load",timeout:90000});
 try{
   await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.()?.visibleOwner===true,null,{timeout:25000});
 }catch(e){
   console.error("OFFLINE_PREFIX_BOOT_DIAGNOSTIC="+JSON.stringify(await page.evaluate(()=>({
     href:location.href,readyState:document.readyState,app:globalThis.AO_APP_SHELL_V1?.status?.()??null,
     offline:globalThis.AO_OFFLINE_APP_V1?.status??null,
     native:typeof globalThis.AO_R17_BROWSER_ENTRY,
     title:document.title,bodyText:document.body?.innerText?.slice(0,280)
   }))));
   console.error("OFFLINE_PREFIX_PAGE_ERRORS="+JSON.stringify(errs));
   throw e;
 }
 try{
   await page.waitForFunction(()=>{
     const s=globalThis.AO_OFFLINE_APP_V1?.status;
     return s?.ready===true||Boolean(s?.error);
   },null,{timeout:45000});
 }catch(e){
   console.error("OFFLINE_STAGE_DIAGNOSTIC="+JSON.stringify(await page.evaluate(async()=>({
     status:globalThis.AO_OFFLINE_APP_V1?.status??null,
     cacheNames:await caches.keys(),
     stagingCount:(await(await caches.open("ao-bootstrap-staging-v1")).keys()).length,
     stagingTail:(await(await caches.open("ao-bootstrap-staging-v1")).keys()).slice(-5).map(r=>r.url),
     controller:navigator.serviceWorker.controller?.scriptURL??null,
     registrations:(await navigator.serviceWorker.getRegistrations()).map(r=>({scope:r.scope,active:r.active?.state,installing:r.installing?.state,waiting:r.waiting?.state}))
   }))));
   console.error("OFFLINE_STAGE_PAGE_ERRORS="+JSON.stringify(errs));
   throw e;
 }
 const initialOfflineState=await page.evaluate(()=>globalThis.AO_OFFLINE_APP_V1.status);
 assert.equal(initialOfflineState.error,null,"First offline snapshot could not be staged: "+JSON.stringify(initialOfflineState));
 let original=await page.evaluate(()=>globalThis.AO_OFFLINE_APP_V1.status);
 assert.ok(original.version,"First coherent cache has no version");
 assert.equal(original.pendingVersion,null,"First install should not offer an update");
 let cachesNames=await page.evaluate(()=>caches.keys());
 assert.ok(cachesNames.some(x=>x.startsWith("ao-bootstrap-snapshot-v1-")),"Missing committed startup snapshot");
 const firstSnapshot=await page.evaluate(async()=>{
   const version=globalThis.AO_OFFLINE_APP_V1.status.version;
   const cache=await caches.open("ao-bootstrap-snapshot-v1-"+version);
   const base=new URL("/ad-orientem/",location.origin);
   const readiness=await cache.match(new URL("__ao_bootstrap_completed__",base));
   const meta=await readiness.json();
   const essential=["src/pray/presentation-coherence.js","src/pray/novena-runtime.js",
     "src/pray/traditional-pray-runtime.js","src/pray/focus-installer.js",
     "src/pray/devotional-card-deck.js","src/pray/devotional-cinematic.js",
     "assets/pray/angelus/tanner-annunciation-1898.webp",
     "assets/vendor/exsurge/exsurge.min.js"];
   const missing=[];
   for(const path of essential)if(!await cache.match(new URL(path,base)))missing.push(path);
   return {...meta,missing};
 });
 assert.deepEqual(firstSnapshot.missing,[],"First-use Prayer lazy entry modules not in completed snapshot");
 assert.ok(firstSnapshot.files>0 && firstSnapshot.files<=512 && firstSnapshot.bytes<=35000000,
  "Measured first-use graph must fit its 512-resource and 35 MB transactional limits: "+JSON.stringify(firstSnapshot));
 console.log("OFFLINE_FIRST_USE_SNAPSHOT="+JSON.stringify(firstSnapshot));
 await context.setOffline(true);
 await page.reload({waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.()?.visibleOwner===true,null,{timeout:35000});
 const offline=await page.evaluate(()=>({screen:!!document.querySelector(".homeScreen"),sw:!!navigator.serviceWorker.controller,version:globalThis.AO_OFFLINE_APP_V1?.status?.version}));
 assert.equal(offline.screen,true,"Cached offline Home failed");
 assert.equal(offline.sw,true,"Offline navigation lost service worker");
 // Render a real score on FIRST offline use, not only check that a binary
 // resource was written to the snapshot. Neither priest nor choir state exists
 // in this temporary verification viewport.
 const offlineScore=await page.evaluate(async()=>{
   let node=null,engraver=null;
   try{
     const owner=await import("./src/mass/reader-kyriale-research-gabc.js");
     const renderer=await import("./src/mass/reader-chant-engraver.js");
     const source=owner.offlineKyrialeResearchScore("KYRIE","MASS_08");
     node=document.createElement("div");
     node.style.width="310px";
     node.style.position="absolute";
     node.style.left="-5000px";
     document.body.append(node);
     engraver=renderer.createOfflineChantEngraver({viewport:node,document});
     const rendered=await engraver.engrave(source.gabc);
     return {rendered,svg:node.querySelector("svg")!==null,
       sourceId:source.scoreId,remoteAudio:false};
   }catch(error){
     return {rendered:false,svg:false,error:String(error)};
   }finally{
     engraver?.destroy?.();node?.remove?.();
   }
 });
 assert.equal(offlineScore.rendered,true,
   "First offline-use Kyriale engraving failed: "+JSON.stringify(offlineScore));
 assert.equal(offlineScore.svg,true,"Offline Kyrie VIII failed to yield SVG");
 assert.equal(offlineScore.sourceId,"GREGOBASE-1184");
 console.log("OFFLINE_KYRIALE_GREGORIAN_SCORE="+JSON.stringify(offlineScore));
 // The Rosary is a core devotional pilot journey: it must open on a first
 // offline launch after a completed bootstrap, even before it was opened online.
 // This exercises the actual first-use dynamic Prayer module graph, not just Home.
 const offlinePrayOpened=await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open());
 if(!offlinePrayOpened){
   console.error("OFFLINE_PRAY_FIRST_USE_DIAGNOSTIC="+JSON.stringify(await page.evaluate(()=>({
     status:globalThis.AO_PRAY_APP_V1?.status?.(),
     offline:globalThis.AO_OFFLINE_APP_V1?.status,
     cacheNames:null,
     visibleApp:globalThis.AO_APP_SHELL_V1?.status?.()
   }))));
 }
 assert.equal(offlinePrayOpened,true,"Core Rosary reader cannot open on first offline use");
 assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.rosary_methods",{returnContext:null})),true,
  "Rosary method chooser cannot open from offline Prayer hub");
 const offlineChooser=page.locator("#aoPray435930.open [data-ao-rosary-chooser]");
 await offlineChooser.waitFor({timeout:12000});
 const offlineMethod=offlineChooser.locator("[data-p435930-rosary-choose='ordinary']");
 const offlineCustomize=offlineChooser.locator("[data-p435930-rosary-customize]");
 await offlineCustomize.tap();
 assert.equal(await offlineCustomize.getAttribute("aria-expanded"),"true",
  "Offline Rosary options did not expand before selecting the fifteen-decade mode");
  await offlineMethod.tap();
 await offlineChooser.locator("[data-p435930-rosary-decades='15']").tap();
 await offlineChooser.locator("[data-p435930-rosary-begin]").tap();
 await page.waitForSelector("#aoPrayerBookRoot.open [data-lab-rosary-next]",{timeout:12000});
 await page.locator("#aoPrayerBookRoot.open [data-lab-rosary-next]").first().tap();
 assert.ok(await page.evaluate(()=>globalThis.AO_ROSARY_V381?.state?.()?.step>0),
  "Offline Rosary cannot advance past first prayer");
 console.log("PASS core Rosary opens and advances on first offline use");
 // The historical six-section Guide is part of the first-use Rosary reader.
 // Its links can remain remote, but the entire bilingual Guide must render
 // while disconnected without displacing the active prayer.
 const readingOptions=page.locator("#aoPrayerBookRoot.open .aoRosaryActiveOptions");
 await readingOptions.waitFor({state:"attached",timeout:12000});
 await readingOptions.evaluate(el=>{if(!el.open)el.open=true});
 const offlineGuide=page.locator("#aoPrayerBookRoot.open .aoRosaryGuide");
 await offlineGuide.waitFor({state:"visible",timeout:12000});
 assert.equal(await offlineGuide.locator(".aoRosaryGuideSection").count(),6,
   "Offline Rosary Guide lost its six source-linked sections");
 assert.equal(await offlineGuide.locator(".aoRosaryGuideSection a[href^='https://']").count(),6);
 const guideStep=await page.evaluate(()=>globalThis.AO_ROSARY_V381?.state?.()?.step);
 await offlineGuide.evaluate(el=>{el.open=true});
 await page.waitForFunction(()=>{
   const el=document.querySelector("#aoPrayerBookRoot.open .aoRosaryGuide[open] .aoRosaryGuideBody");
   return Boolean(el)&&getComputedStyle(el).overflowY==="auto";
 },null,{timeout:9000});
 const guideLayout=await offlineGuide.locator(".aoRosaryGuideBody").evaluate(el=>{
   const rect=el.getBoundingClientRect();
   return {height:rect.height,scroll:el.scrollHeight,overflow:getComputedStyle(el).overflowY,viewport:innerHeight};
 });
 assert.equal(guideLayout.overflow,"auto","Expanded offline Guide must scroll internally on phones");
 assert.ok(guideLayout.height<=Math.min(guideLayout.viewport*.34,290)+2,
   "Offline Rosary Guide obscures the active prayer: "+JSON.stringify(guideLayout));
 assert.ok(guideLayout.scroll>guideLayout.height,"Offline Guide historical sections are clipped");
 assert.equal(await page.evaluate(()=>globalThis.AO_ROSARY_V381?.state?.()?.step),guideStep,
   "Opening the native Reading options / Guide advanced Rosary beads");
 console.log("PASS six historic Rosary Guide sections accessible offline from native Reading options");
 // Switch the *application* language, not merely the browser locale; start
 // Divine Mercy for the first time only after airplane-mode launch.
 await page.evaluate(()=>globalThis.AO_RUNTIME_V8.store.dispatch({type:"set-language",language:"fr"}));
 await page.waitForFunction(()=>globalThis.AO_RUNTIME_V8.store.getState().language==="fr",null,{timeout:10000});
 assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.divine_mercy",{returnContext:null})),true,
  "Divine Mercy could not start on first offline use");
 await page.locator("#aoPray435930.open .aoMercyReader").waitFor({timeout:12000});
 assert.match(await page.locator("#aoPray435930.open .aoMercyPrayer").innerText(),/Au nom du Père/,
  "First-use offline Divine Mercy did not render French opening prayer");
 assert.match(await page.locator("#aoPray435930.open [data-ao-mercy-bead-navigation] .aoMercyBeadPosition").innerText(),/Prières initiales/i,
  "First-use offline Divine Mercy lost its French prayer counter");
 await page.locator("#aoPray435930.open [data-p435930-mercy-jump=\'4\']").tap();
 assert.match(await page.locator("#aoPray435930.open .aoMercyPrayer").innerText(),/Père éternel/i,
  "First-use offline Divine Mercy did not advance to the first large bead");
 assert.equal(await page.locator("#aoPray435930.open .aoMercyBeadNavigation [role=\'progressbar\']").getAttribute("aria-valuenow"),"5");
 assert.match(await page.locator("#aoPray435930.open .aoMercySource a").getAttribute("href"),
  /^https:\/\/www\.vaticannews\.va\/fr\//,
  "Offline Divine Mercy lost its source link");
 assert.ok(await page.evaluate(()=>globalThis.AO_OFFLINE_APP_V1?.status?.supported),
  "PWA lost offline support during devotional navigation");
 console.log("PASS six-section offline Rosary Guide, bounded mobile scroll, French Divine Mercy opening and advancement");
 // Stay disconnected. These canonical devotional modules must render on
 // first use from the same completed bootstrap, without pre-visiting online.
 assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.angelus",{returnContext:null})),true,
  "First-use Angelus failed while offline");
 const angelusRoot=page.locator("#aoPray435930.open");
 await angelusRoot.locator("[data-ao-angelus-form]").waitFor({timeout:12000});
 assert.equal(await angelusRoot.locator("[data-ao-angelus-form]").getAttribute("data-ao-angelus-form"),"angelus",
  "Offline Angelus launched the wrong liturgical form");
 // The related August Queen prayer has its own sourced card. Keep the five
 // Angelus-history paragraphs distinct from that separate Marian devotion.
 assert.equal(await angelusRoot.locator(".aoAngelusGuideSection:not([data-ao-b01-august-queen])").count(),5,
  "Offline Angelus lost its five historical guide sections");
 assert.equal(await angelusRoot.locator(".aoAngelusGuideSection:not([data-ao-b01-august-queen]) a[href^='https://']").count(),5,
  "Offline Angelus lost its five historical source links");
 assert.equal(await angelusRoot.locator("[data-ao-b01-august-queen] a[href^='https://']").count(),1,
  "Related August Queen prayer must retain its own source, not become part of the Angelus");
 const angelusText=await angelusRoot.locator(".aoP435930Mount").innerText();
 assert.ok(angelusText.length>80,"Offline Angelus prayer rendered blank");
 await angelusRoot.locator("[data-p435930-seg='group']").first().evaluate(x=>x.click());
 await page.waitForFunction(()=>{
  const root=document.querySelector("#aoPray435930.open");
  return root?.querySelector("[data-ao-angelus-recitation]")?.dataset?.aoAngelusRecitation==="group" &&
   !!root.querySelector("[data-ao-angelus-voice=leader]") &&
   !!root.querySelector("[data-ao-angelus-voice=response]");
 },null,{timeout:10000});
 await angelusRoot.locator("[data-p435930-seg='regina']").first().evaluate(x=>x.click());
 await page.waitForFunction(()=>document.querySelector("#aoPray435930.open [data-ao-angelus-form]")?.dataset?.aoAngelusForm==="regina",null,{timeout:10000});
 assert.equal(await angelusRoot.locator(".aoAngelusGuideSection:not([data-ao-b01-august-queen])").count(),4,
  "Offline Regina Cæli did not show its four source-backed guide sections");
 assert.equal(await angelusRoot.locator("[data-p435930-angelus-appendix]").count(),0,
  "Angelus-only appendix leaked into offline Regina Cæli");
 console.log("PASS first-use offline French Angelus/Regina Caeli, group responses and source-linked guide");
 // Fourteen Stations require an internally navigable prayer sequence; remote
 // historical links remain external and are deliberately not claimed offline.
 assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.stations",{returnContext:null})),true,
  "First-use Stations of the Cross failed offline");
 const stationRoot=page.locator("#aoPray435930.open");
 await page.waitForFunction(()=>document.querySelector("#aoPray435930.open .aoP435930Mount")?.dataset?.aoPrayView==="stations",null,{timeout:10000});
 assert.equal(await stationRoot.locator("[data-p435930-station-step]").count(),14,
  "Offline Stations lost fourteen station-selector buttons");
 assert.equal(await stationRoot.locator("[data-p435930-station-step][aria-current='step']").count(),1,
  "Offline Stations initial active step is ambiguous");
 assert.equal(await stationRoot.locator("[data-p435930-station-step='0'][aria-current='step']").count(),1,
  "First-use Stations should open at the first station");
 assert.ok((await stationRoot.locator(".aoP435930Stations").innerText()).length>150,
  "Offline Stations returned an empty prayer");
 await stationRoot.locator("[data-p435930-station-step=\'1\']").tap();
 await page.waitForFunction(()=>document.querySelector("#aoPray435930.open [data-p435930-station-step='1'][aria-current='step']"),null,{timeout:12000});
 await stationRoot.locator("[data-p435930-station-step=\'0\']").tap();
 await page.waitForFunction(()=>document.querySelector("#aoPray435930.open [data-p435930-station-step='0'][aria-current='step']"),null,{timeout:12000});
 assert.ok(await stationRoot.locator("details.aoP435930Source a.aoP435930SourceLink").count(),
  "Offline Stations omitted the original historical witness link");
 console.log("PASS first-use offline French fourteen Stations and forward/back navigation");
 // Restore the baseline language before the existing Rosary-update test.
 await page.evaluate(()=>globalThis.AO_RUNTIME_V8.store.dispatch({type:"set-language",language:"en"}));
 await context.setOffline(false);
 // The original staged-update test assumes a fresh Prayer navigation. Separate
 // it from the Mercy route so a retained overlapping devotional sheet cannot
 // make the second chooser physically hidden.
 await page.reload({waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.()?.visibleOwner===true,null,{timeout:35000});
 await page.waitForFunction(expected=>globalThis.AO_OFFLINE_APP_V1?.status?.version===expected,original.version,{timeout:20000});
 // Open the real Rosary through its production Prayer owner before staging the next release.
 // A staged update must never navigate away or move a bead without user consent.
 await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:20000});
 assert.equal(await page.evaluate(async()=>globalThis.AO_PRAY_APP_V1.open()),true,"Prayer owner unavailable in installed-style PWA");
 await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:25000});
 assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.rosary_methods",{returnContext:null})),true);
 const chooser=page.locator("#aoPray435930.open [data-ao-rosary-chooser]");
 await chooser.waitFor({timeout:10000});
 const customize=chooser.locator("[data-p435930-rosary-customize]");
 await customize.tap();
 assert.equal(await customize.getAttribute("aria-expanded"),"true",
  "Rosary options did not expand for the staged-update regression");
 await chooser.locator("[data-p435930-rosary-choose='ordinary']").tap();
 await chooser.locator("[data-p435930-rosary-decades='15']").tap();
 await chooser.locator("[data-p435930-rosary-begin]").tap();
 await page.waitForFunction(()=>globalThis.AO_ROSARY_V381?.state?.()?.set==="joyful"&&
   document.querySelector("#aoPrayerBookRoot.open [data-lab-rosary-next]"),null,{timeout:15000});
 await page.locator("#aoPrayerBookRoot.open [data-lab-rosary-next]").first().tap();
 const activeRosary=await page.evaluate(()=>({
   step:globalThis.AO_ROSARY_V381.state().step,
   set:globalThis.AO_ROSARY_V381.state().set,
   method:globalThis.AO_ROSARY_V381.getMethod(),
   path:location.pathname
 }));
 assert.equal(activeRosary.method,"ordinary");
 assert.ok(activeRosary.step>0,"Rosary did not advance to a meaningful prayer step");
 const assertRosaryUninterrupted=async stage=>{
   const current=await page.evaluate(()=>({
     step:globalThis.AO_ROSARY_V381?.state?.()?.step,
     set:globalThis.AO_ROSARY_V381?.state?.()?.set,
     method:globalThis.AO_ROSARY_V381?.getMethod?.(),
     path:location.pathname,
     playerOpen:Boolean(document.querySelector("#aoPrayerBookRoot.open"))
   }));
   assert.deepEqual(current,{...activeRosary,playerOpen:true},
     "PWA update "+stage+" interrupted active Rosary before consent");
 };
 // A replacement worker must take control of the existing installed-like tab,
 // while retaining the explicit snapshot consent and current Rosary state.
 swRevision=2;
 const takeoverResult=await page.evaluate(async()=>{
   if(!navigator.serviceWorker.controller)return {changed:false,error:"NO_CONTROLLER"};
   let changed=false;
   const takeover=new Promise(resolve=>{
     const timeout=setTimeout(()=>resolve(false),20000);
     navigator.serviceWorker.addEventListener("controllerchange",()=>{
       changed=true;clearTimeout(timeout);resolve(true);
     },{once:true});
   });
   const reg=await navigator.serviceWorker.getRegistration();
   const prior={active:reg.active?.state,waiting:reg.waiting?.state,script:reg.active?.scriptURL};
   await reg.update();
   await takeover;
   return {changed,prior,active:reg.active?.state,waiting:reg.waiting?.state,
     installing:reg.installing?.state,controller:navigator.serviceWorker.controller?.state};
 });
 console.log("OFFLINE_WORKER_UPGRADE_DIAGNOSTIC="+JSON.stringify({swRevision,takeoverResult}));
 assert.equal(takeoverResult.changed,true,"Replacement worker remained waiting behind an installed app");
 await assertRosaryUninterrupted("service-worker takeover");
 assert.equal((await page.evaluate(()=>globalThis.AO_OFFLINE_APP_V1.status)).version,original.version,
  "Worker activation promoted a snapshot without user consent");
 // A deliberately incomplete release must NOT replace a usable version.
 variant=3;failedPath="/__ao_offline_test_3.js";
 const failed=await page.evaluate(()=>globalThis.AO_OFFLINE_APP_V1.check());
 if(failed.ok!==false)console.error("OFFLINE_REJECT_DIAGNOSTIC="+JSON.stringify({
   variant,failedPath,failedHits,assetHits:assetHits.slice(-12),served,failed,
   active:await page.evaluate(()=>globalThis.AO_OFFLINE_APP_V1.status)
 }));
 assert.equal(failed.ok,false,"Broken update unexpectedly committed");
 const afterFail=await page.evaluate(()=>globalThis.AO_OFFLINE_APP_V1.status);
 assert.equal(afterFail.version,original.version,"Failed staging invalidated old snapshot");
 console.log("OFFLINE_RETRY_DIAGNOSTIC="+JSON.stringify({failedHits,failed,failedPath,assetHits:assetHits.slice(-8)}));
 assert.ok(failedHits>=3,"Transient HTTP 503 must receive three bounded attempts");
 await page.waitForSelector("#ao-offline-check-failed",{timeout:10000});
 assert.match(await page.locator("#ao-offline-check-failed").innerText(),/Could not check for an app update/);
 assert.equal(await page.locator("#ao-offline-check-failed button").last().innerText(),"Retry");
 await assertRosaryUninterrupted("failed staging");
 // The update prompt must match the French language selected in the real app.
 await page.evaluate(()=>globalThis.AO_RUNTIME_V8.store.dispatch({type:"set-language",language:"fr"}));
 await page.waitForFunction(()=>globalThis.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr",null,{timeout:10000});
 await assertRosaryUninterrupted("French language selection");
 variant=2;failedPath=null;
 const update=await page.evaluate(()=>globalThis.AO_OFFLINE_APP_V1.check());
 assert.equal(update.ok,true,"Valid second release did not stage: "+JSON.stringify(update));
 assert.equal(update.updateAvailable,true,"New content did not offer an explicit update");
 assert.equal(await page.locator("#ao-offline-check-failed").count(),0,"Resolved update-check warning remains visible");
 assert.notEqual(update.version,original.version,"Update version not fingerprinted");
 await page.waitForSelector("#ao-offline-update-ready",{timeout:10000});
 const prompt=page.locator("#ao-offline-update-ready");
 assert.match(await prompt.getAttribute("aria-label"),/Mise à jour de l.application disponible/);
 assert.match(await prompt.locator("span").first().innerText(),/Une mise à jour est disponible/);
 assert.equal((await prompt.locator("button").allInnerTexts()).join(" / "),"Plus tard / Mettre à jour",
  "French UI must not leak English update controls");
 const old=await page.evaluate(()=>globalThis.AO_OFFLINE_APP_V1.status);
 assert.equal(old.version,original.version,"Staged update changed the active tab before user confirmation");
 await assertRosaryUninterrupted("ready prompt");
 // Simulate eviction of the staged (not active) version. A failed touch update
 // must display an accessible error, leave the old snapshot active and retain the bead.
 assert.equal(await page.evaluate(version=>caches.delete("ao-bootstrap-snapshot-v1-"+version),update.version),true);
 await prompt.locator("button").last().tap();
 await page.waitForFunction(()=>document.querySelector("#ao-offline-update-ready [role='alert']")?.hidden===false,null,{timeout:12000});
 assert.match(await prompt.locator("[role='alert']").innerText(),/La mise à jour n.a pas pu être appliquée/);
 assert.equal(await prompt.locator("button").last().isEnabled(),true,"Failed update must allow retry");
 assert.equal((await page.evaluate(()=>globalThis.AO_OFFLINE_APP_V1.status)).version,original.version);
 await assertRosaryUninterrupted("rejected update");
 // A valid restaging makes Retry/Update safe again without clearing all site data.
 const retried=await page.evaluate(()=>globalThis.AO_OFFLINE_APP_V1.check());
 assert.equal(retried.ok,true,"Restaging after failed consent must recover");
 assert.equal(retried.version,update.version,"Restaged release changed unexpectedly");
 await assertRosaryUninterrupted("restaged update");
 await prompt.locator("button").last().tap();
 await page.waitForFunction(()=>globalThis.AO_OFFLINE_TEST_ASSET===2,null,{timeout:60000});
 await page.waitForFunction(expected=>globalThis.AO_OFFLINE_APP_V1?.status?.version===expected,update.version,{timeout:20000});
 const now=await page.evaluate(()=>globalThis.AO_OFFLINE_APP_V1.status);
 assert.equal(now.version,update.version,"Activation did not use approved new snapshot");
 await context.setOffline(true);
 await page.reload({waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.()?.visibleOwner===true,null,{timeout:35000});
 assert.equal(await page.evaluate(()=>globalThis.AO_OFFLINE_TEST_ASSET),2,"New release not available offline after consent");
 assert.deepEqual(errs.filter(x=>/SyntaxError|ReferenceError|TypeError/.test(x)),[],"Offline/update script error");
 console.log("PASS offline Home fallback, French update prompt, recoverable failed consent, Rosary state preserved, and explicit offline update");
 console.log("OFFLINE_RESULTS="+JSON.stringify({original:original.version,update:update.version,failed:failed.error,cacheCount:cachesNames.length,networkRequests:served}));
 await context.close();
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
