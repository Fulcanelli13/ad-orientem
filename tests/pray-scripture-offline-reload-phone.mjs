import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const evidence=resolve(root,"artifacts/pray-scripture-offline-reload");
await mkdir(evidence,{recursive:true});
const mime={".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".html":"text/html; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".webp":"image/webp",".png":"image/png",".jpg":"image/jpeg",".woff2":"font/woff2",".webmanifest":"application/manifest+json"};
const server=http.createServer(async(req,res)=>{
 try{
  let path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  if(path.startsWith("/ad-orientem/"))path=path.slice("/ad-orientem".length);
  if(path==="/"||!path)path="/index.html";
  const full=resolve(root,"."+path);
  if(full!==root&&!full.startsWith(root+sep)){res.writeHead(403);return res.end();}
  const buf=await readFile(full);
  res.writeHead(200,{"content-type":mime[extname(full)]||"application/octet-stream","cache-control":"no-store"});
  res.end(buf);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e.message||e));}
});
await new Promise((ok,no)=>{server.once("error",no);server.listen(4306,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,serviceWorkers:"allow"});
 const origin="http://127.0.0.1:4306/ad-orientem/index.html?aoOfflineTest=1";
 let page=await context.newPage();
 const errors=[];const wire=pg=>{
  pg.on("pageerror",e=>errors.push(String(e.message||e)));
  pg.on("console",msg=>{
   if(msg.type()==="warning"&&/Scripture source unavailable/.test(msg.text()))
    console.log("SCRIPTURE_SOURCE_WARNING "+msg.text().slice(0,250));
  });
 };
 wire(page);
 await page.goto(origin,{waitUntil:"load",timeout:90000});
 await page.waitForFunction(()=>globalThis.AO_OFFLINE_APP_V1?.status?.ready===true ||
  Boolean(globalThis.AO_OFFLINE_APP_V1?.status?.error),null,{timeout:90000}).catch(async error=>{
   const context=await page.evaluate(()=>({status:globalThis.AO_OFFLINE_APP_V1?.status??null,
     serviceWorker:('serviceWorker' in navigator),controller:!!navigator.serviceWorker?.controller,
     href:location.href})).catch(e=>({readError:String(e)}));
   throw new Error("Offline bootstrap wait failed: "+JSON.stringify(context),{cause:error});
  });
 const bootstrap=await page.evaluate(()=>globalThis.AO_OFFLINE_APP_V1?.status??null);
 assert.equal(bootstrap?.error,null,"Transactional offline bootstrap failed before Prayer test: "+JSON.stringify(bootstrap));
 assert.equal(bootstrap?.ready,true,"Transactional offline bootstrap never became ready: "+JSON.stringify(bootstrap));
 const ready=await page.evaluate(()=>globalThis.AO_OFFLINE_APP_V1.status);
 assert.equal(ready.error,null,"Transactional bootstrap failed: "+JSON.stringify(ready));
 assert.ok(ready.version,"No complete offline app snapshot");
 // Measure the completed and cryptographically verified resource snapshot.
 // The presence of READY is meaningful only after the transactional commit.
 const certified=await page.evaluate(async()=>{
  const status=globalThis.AO_OFFLINE_APP_V1.status;
  const cache=await caches.open("ao-bootstrap-snapshot-v1-"+status.version);
  const entries=await cache.keys();
  const marker=entries.find(x=>x.url.includes("__ao_bootstrap_completed__"));
  const metadata=marker?await (await cache.match(marker)).json():null;
  return {entries:entries.length,files:metadata?.files??null,bytes:metadata?.bytes??null};
 });
 console.log("OFFLINE_CERTIFIED_GRAPH "+JSON.stringify(certified));
 assert.ok(certified.files>0&&certified.files<=416,"Unexpected measured offline graph size: "+JSON.stringify(certified));
 assert.ok(certified.bytes>0&&certified.bytes<=35_000_000,"Offline byte ceiling must remain enforced");

 const openPrayer=async(p,route)=>{
  await p.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:30000});
  assert.equal(await p.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true,"Canonical Prayer hub unavailable");
  await p.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:15000});
  assert.equal(await p.evaluate(r=>globalThis.AO_PRAY_V435930.open(r,{returnContext:null}),route),true,
   "Canonical Prayer route failed: "+route);
 };
 const selectors={psalm:"#aoPray435930.open [data-ao-scripture-source='psalm']",
                  gospel:"#aoPray435930.open [data-ao-scripture-source='gospel']"};
 const original=async(p,kind,allowRetry)=>{
  const locator=p.locator(selectors[kind]);
  await locator.waitFor({timeout:18000});
  await p.waitForFunction(k=>{
   const el=document.querySelector("#aoPray435930.open [data-ao-scripture-source='"+k+"']");
   return ["unavailable","ready"].includes(el?.dataset.aoScriptureContent);
  },kind,{timeout:17000});
  if(allowRetry&&await locator.getAttribute("data-ao-scripture-content")==="unavailable"){
   console.log("SOURCE_FIRST_LOAD_RETRY "+kind);
   await p.locator("#aoPray435930.open [data-p435930-scripture-retry='"+kind+"']").tap();
   await p.waitForFunction(k=>document.querySelector(
    "#aoPray435930.open [data-ao-scripture-source='"+k+"']"
   )?.dataset.aoScriptureContent==="ready",kind,{timeout:19000});
  }
  assert.equal(await locator.getAttribute("data-ao-scripture-content"),"ready",
    kind+" did not display original Scripture text");
  assert.ok(await locator.locator(".aoP435930ScriptureVerse").count()>=1,"Missing source verses: "+kind);
  const text=(await locator.innerText()).replace(/\s+/g," ").trim();
  assert.ok(text.length>60,"Unrealistically empty original Scripture: "+kind);
  return text;
 };

 const snapshots={};
 for(const [kind,route] of [["psalm","pray.penitential_psalms"],["gospel","pray.seven_words"]]){
  await openPrayer(page,route);
  snapshots[kind]=await original(page,kind,true);
  const cache=await page.evaluate(()=>globalThis.AO_SCRIPTURE_CACHE_V427?.inspect?.()??null);
  assert.ok(cache?.installed&&cache?.entries>=1,"Persistent Scripture cache unavailable");
  await page.screenshot({path:resolve(evidence,kind+"-online-before-restart.png"),animations:"disabled"});
 }
 const before=await page.evaluate(()=>({
  cache:globalThis.AO_SCRIPTURE_CACHE_V427.inspect(),
  snapshot:globalThis.AO_OFFLINE_APP_V1.status
 }));
 assert.ok(before.cache.entries>=2,"Psalm/Gospel response documents missing from persistent cache");
 console.log("ONLINE_ORIGINALS "+JSON.stringify({
  psalm:snapshots.psalm.length,gospel:snapshots.gospel.length,
  entries:before.cache.entries,appVersion:before.snapshot.version
 }));

 // An actual new page/document in the same installed PWA origin. Both
 // JavaScript runtime and in-memory Scripture cache must be reconstructed.
 await page.close();
 await context.setOffline(true);
 page=await context.newPage();wire(page);
 await page.goto(origin,{waitUntil:"domcontentloaded",timeout:35000});
 await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.()?.visibleOwner===true,null,{timeout:35000});
 // Offline bridge initialises on window load, after the Home shell appears.
 // Wait for its real STATUS handshake with the existing installed worker.
 await page.waitForFunction(()=>globalThis.AO_OFFLINE_APP_V1?.status?.ready===true,null,{timeout:25000});
 const cold=await page.evaluate(()=>({
  controller:!!navigator.serviceWorker.controller,
  app:globalThis.AO_OFFLINE_APP_V1?.status||null,
  scripture:globalThis.AO_SCRIPTURE_CACHE_V427?.inspect?.()||null,
  online:navigator.onLine
 }));
 assert.equal(cold.online,false,"Browser is not actually offline after restart");
 assert.equal(cold.controller,true,"Rebooted offline app has no service-worker controller");
 assert.equal(cold.app?.version,before.snapshot.version,"Offline app restarted from the wrong snapshot");
 assert.ok(cold.scripture?.installed,"Persistent Scripture cache wrapper not reinstalled after restart");
 assert.equal(cold.scripture.hits,0,"Offline test reused the previous document runtime");

 for(const [kind,route] of [["psalm","pray.penitential_psalms"],["gospel","pray.seven_words"]]){
  await openPrayer(page,route);
  const reopened=await original(page,kind,false);
  assert.equal(reopened,snapshots[kind],kind+" original verses differ after offline document restart");
  await page.screenshot({path:resolve(evidence,kind+"-offline-after-restart.png"),animations:"disabled"});
  const cache=await page.evaluate(()=>globalThis.AO_SCRIPTURE_CACHE_V427?.inspect?.());
  assert.ok(cache?.fallbacks>=1,"Scripture did not recover from persisted offline original response");
  console.log("OFFLINE_RESTART_VERIFIED "+JSON.stringify({kind,chars:reopened.length,entries:cache.entries,fallbacks:cache.fallbacks}));
 }
 assert.deepEqual(errors,[],"Offline reboot has browser exceptions: "+errors.join(" | "));
 console.log("PASS real-original Psalm and Gospel survive an offline PWA reload with identical verse text");
 console.log("NOT_CERTIFIED first-ever offline installation, all-book offline preload, textual edition collation or physical-device release");
 await context.close();
}finally{
 await browser?.close();
 await new Promise(done=>server.close(done));
}
