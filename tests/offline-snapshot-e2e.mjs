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
 await page.waitForFunction(()=>globalThis.AO_OFFLINE_APP_V1?.status?.ready===true,null,{timeout:120000});
 let original=await page.evaluate(()=>globalThis.AO_OFFLINE_APP_V1.status);
 assert.ok(original.version,"First coherent cache has no version");
 assert.equal(original.pendingVersion,null,"First install should not offer an update");
 let cachesNames=await page.evaluate(()=>caches.keys());
 assert.ok(cachesNames.some(x=>x.startsWith("ao-bootstrap-snapshot-v1-")),"Missing committed startup snapshot");
 await context.setOffline(true);
 await page.reload({waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.()?.visibleOwner===true,null,{timeout:35000});
 const offline=await page.evaluate(()=>({screen:!!document.querySelector(".homeScreen"),sw:!!navigator.serviceWorker.controller,version:globalThis.AO_OFFLINE_APP_V1?.status?.version}));
 assert.equal(offline.screen,true,"Cached offline Home failed");
 assert.equal(offline.sw,true,"Offline navigation lost service worker");
 await context.setOffline(false);
 // A deliberately incomplete release must NOT replace a usable version.
 variant=3;failedPath="/__ao_offline_test_3.js";
 const failed=await page.evaluate(()=>globalThis.AO_OFFLINE_APP_V1.check());
 assert.equal(failed.ok,false,"Broken update unexpectedly committed");
 const afterFail=await page.evaluate(()=>globalThis.AO_OFFLINE_APP_V1.status);
 assert.equal(afterFail.version,original.version,"Failed staging invalidated old snapshot");
 variant=2;failedPath=null;
 const update=await page.evaluate(()=>globalThis.AO_OFFLINE_APP_V1.check());
 assert.equal(update.ok,true,"Valid second release did not stage: "+JSON.stringify(update));
 assert.equal(update.updateAvailable,true,"New content did not offer an explicit update");
 assert.notEqual(update.version,original.version,"Update version not fingerprinted");
 await page.waitForSelector("#ao-offline-update-ready",{timeout:10000});
 const old=await page.evaluate(()=>globalThis.AO_OFFLINE_APP_V1.status);
 assert.equal(old.version,original.version,"Staged update changed the active tab before user confirmation");
 await page.locator("#ao-offline-update-ready button").last().click();
 await page.waitForFunction(()=>globalThis.AO_OFFLINE_TEST_ASSET===2,null,{timeout:60000});
 const now=await page.evaluate(()=>globalThis.AO_OFFLINE_APP_V1.status);
 assert.ok(now.version===update.version||now.version===null,"Activation did not use approved new snapshot");
 await context.setOffline(true);
 await page.reload({waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.()?.visibleOwner===true,null,{timeout:35000});
 assert.equal(await page.evaluate(()=>globalThis.AO_OFFLINE_TEST_ASSET),2,"New release not available offline after consent");
 assert.deepEqual(errs.filter(x=>/SyntaxError|ReferenceError|TypeError/.test(x)),[],"Offline/update script error");
 console.log("PASS offline Home fallback, staged failure rollback, explicit update, project prefix and offline reload");
 console.log("OFFLINE_RESULTS="+JSON.stringify({original:original.version,update:update.version,failed:failed.error,cacheCount:cachesNames.length,networkRequests:served}));
 await context.close();
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
