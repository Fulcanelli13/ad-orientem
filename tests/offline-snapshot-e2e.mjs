import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".js":"text/javascript; charset=utf-8",".html":"text/html; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".webp":"image/webp",".png":"image/png",".jpg":"image/jpeg",".woff2":"font/woff2",".webmanifest":"application/manifest+json"};
let variant=1,failedPath=null,served=0;
const server=http.createServer(async(req,res)=>{
 try{
  let pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  if(pathname.startsWith("/ad-orientem/"))pathname=pathname.slice("/ad-orientem".length);
  if(pathname==="/"||!pathname)pathname="/index.html";
  if(pathname.startsWith("/__ao_offline_test_")){
   if(failedPath===pathname){res.writeHead(503);res.end("deliberately broken release");return}
   res.writeHead(200,{"content-type":"text/javascript"});res.end("globalThis.AO_OFFLINE_TEST_ASSET="+JSON.stringify(variant)+";");return;
  }
  const file=resolve(root,"."+pathname);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return}
  let body=await readFile(file);
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
     "src/pray/traditional-pray-runtime.js","src/pray/focus-installer.js"];
   const missing=[];
   for(const path of essential)if(!await cache.match(new URL(path,base)))missing.push(path);
   return {...meta,missing};
 });
 assert.deepEqual(firstSnapshot.missing,[],"First-use Prayer lazy entry modules not in completed snapshot");
 assert.ok(firstSnapshot.files<=320 && firstSnapshot.bytes<=35000000,
  "Offline Rosary change exceeded transactional bootstrap limits");
 console.log("OFFLINE_FIRST_USE_SNAPSHOT="+JSON.stringify(firstSnapshot));
 await context.setOffline(true);
 await page.reload({waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.()?.visibleOwner===true,null,{timeout:35000});
 const offline=await page.evaluate(()=>({screen:!!document.querySelector(".homeScreen"),sw:!!navigator.serviceWorker.controller,version:globalThis.AO_OFFLINE_APP_V1?.status?.version}));
 assert.equal(offline.screen,true,"Cached offline Home failed");
 assert.equal(offline.sw,true,"Offline navigation lost service worker");
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
 await offlineChooser.locator("[data-p435930-rosary-choose='ordinary']").tap();
 await offlineChooser.locator("[data-p435930-rosary-decades='15']").tap();
 await offlineChooser.locator("[data-p435930-rosary-begin]").tap();
 await page.waitForSelector("#aoPrayerBookRoot.open [data-lab-rosary-next]",{timeout:12000});
 await page.locator("#aoPrayerBookRoot.open [data-lab-rosary-next]").first().tap();
 assert.ok(await page.evaluate(()=>globalThis.AO_ROSARY_V381?.state?.()?.step>0),
  "Offline Rosary cannot advance past first prayer");
 console.log("PASS core Rosary opens and advances on first offline use");
 await context.setOffline(false);
 await page.waitForFunction(expected=>globalThis.AO_OFFLINE_APP_V1?.status?.version===expected,original.version,{timeout:20000});
 // Open the real Rosary through its production Prayer owner before staging the next release.
 // A staged update must never navigate away or move a bead without user consent.
 await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:20000});
 assert.equal(await page.evaluate(async()=>globalThis.AO_PRAY_APP_V1.open()),true,"Prayer owner unavailable in installed-style PWA");
 await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:25000});
 assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.rosary_methods",{returnContext:null})),true);
 const chooser=page.locator("#aoPray435930.open [data-ao-rosary-chooser]");
 await chooser.waitFor({timeout:10000});
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
 // A deliberately incomplete release must NOT replace a usable version.
 variant=3;failedPath="/__ao_offline_test_3.js";
 const failed=await page.evaluate(()=>globalThis.AO_OFFLINE_APP_V1.check());
 assert.equal(failed.ok,false,"Broken update unexpectedly committed");
 const afterFail=await page.evaluate(()=>globalThis.AO_OFFLINE_APP_V1.status);
 assert.equal(afterFail.version,original.version,"Failed staging invalidated old snapshot");
 await assertRosaryUninterrupted("failed staging");
 // The update prompt must match the French language selected in the real app.
 await page.evaluate(()=>globalThis.AO_RUNTIME_V8.store.dispatch({type:"set-language",language:"fr"}));
 await page.waitForFunction(()=>globalThis.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr",null,{timeout:10000});
 await assertRosaryUninterrupted("French language selection");
 variant=2;failedPath=null;
 const update=await page.evaluate(()=>globalThis.AO_OFFLINE_APP_V1.check());
 assert.equal(update.ok,true,"Valid second release did not stage: "+JSON.stringify(update));
 assert.equal(update.updateAvailable,true,"New content did not offer an explicit update");
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
