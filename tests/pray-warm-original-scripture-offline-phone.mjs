import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const captures=resolve(root,"artifacts/pray-warm-scripture-offline");
await mkdir(captures,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{let name=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  if(name==="/")name="/index.html";
  const full=resolve(root,"."+name);
  if(full!==root&&!full.startsWith(root+sep)){res.writeHead(403);return res.end();}
  const buf=await readFile(full);
  res.writeHead(200,{"content-type":mime[extname(full)]||"application/octet-stream","cache-control":"no-store"});res.end(buf);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e.message||e));}
});
await new Promise((yes,no)=>{server.once("error",no);server.listen(4301,"127.0.0.1",yes)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 // This checks warm-cache Prayer re-entry in one running app, NOT a fresh
 // offline install or an approved bundled 73-book Scripture publication.
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:"block"});
 const page=await context.newPage();
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto("http://127.0.0.1:4301/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:30000});
 assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.scriptureService?.load==="function"&&
   globalThis.AO_SCRIPTURE_CACHE_V427?.inspect?.().installed===true,null,{timeout:30000});
 const open=async route=>{
  assert.equal(await page.evaluate(r=>globalThis.AO_PRAY_V435930.open(r,{returnContext:null}),route),true);
 };
 const reader="#aoPray435930.open .aoP435930DevotionalGuidedReader";
 const text=async selector=>(await page.locator(selector).innerText()).replace(/\s+/g," ").trim();
 const snapshot=async(kind)=>{
  const node=page.locator(reader+" [data-ao-scripture-content='ready'][data-ao-scripture-source='"+kind+"']");
  await node.waitFor({timeout:24000});
  assert.ok(await node.locator(".aoP435930ScriptureVerse").count()>0,"Original verses unavailable: "+kind);
  const content=await text(reader+" [data-ao-scripture-content='ready']");
  assert.ok(content.length>70&&/\S/.test(content),"Readied source is blank");
  return content;
 };
 for(const [route,kind,file] of [
  ["pray.penitential_psalms","psalm","penitential"],
  ["pray.seven_words","gospel","seven-words"]
 ]){
  await context.setOffline(false);
  await open(route);
  const onlineText=await snapshot(kind);
  const cache=await page.evaluate(()=>globalThis.AO_SCRIPTURE_CACHE_V427?.inspect?.());
  assert.ok(cache.installed&&cache.entries>0,"Original Scripture result not in the persistent cache: "+kind);
  await page.screenshot({path:resolve(captures,file+"-online-390.png"),animations:"disabled"});
  await context.setOffline(true);
  assert.equal(await page.evaluate(()=>navigator.onLine),false);
  await open("pray.angelus_regina");
  await open(route);
  const offlineText=await snapshot(kind);
  assert.equal(offlineText,onlineText,"Original source text changed between online and offline: "+kind);
  await page.screenshot({path:resolve(captures,file+"-warm-offline-390.png"),animations:"disabled"});
  const after=await page.evaluate(()=>globalThis.AO_SCRIPTURE_CACHE_V427?.inspect?.());
  assert.ok(after.fallbacks>=1,"Offline reopening did not use saved canonical original-source document");
  console.log("WARM_OFFLINE_VERIFIED "+JSON.stringify({kind,chars:offlineText.length,cacheEntries:after.entries,offlineFallbacks:after.fallbacks}));
 }
 assert.deepEqual(errors,[],"Scripture reader browser exceptions");
 console.log("PASS real original psalm and Gospel source warm-cache offline re-entry; NOT FRESH-BOOT OR SOURCE-COLLATION APPROVAL");
 await context.close();
}finally{await browser?.close();await new Promise(done=>server.close(done));}
