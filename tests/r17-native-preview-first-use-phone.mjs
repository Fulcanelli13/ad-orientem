// Production phone evidence: the source-owned R17 reader must not load until
// an actual Start Mass, and must preserve its 65-card LIVE model thereafter.
import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/r17-native-first-use");
await mkdir(out,{recursive:true});
const mime={".html":"text/html;charset=utf-8",".js":"text/javascript;charset=utf-8",
 ".mjs":"text/javascript;charset=utf-8",".json":"application/json;charset=utf-8",
 ".css":"text/css;charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("forbidden");}
  const body=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream",
   "cache-control":"no-store"});
  res.end(body);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
const base="http://127.0.0.1:"+server.address().port;
const results=[];let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390]){
  const context=await browser.newContext({viewport:{width,height:width===320?700:844},
   isMobile:true,hasTouch:true,deviceScaleFactor:1,locale:"en-GB",reducedMotion:"reduce"});
  const page=await context.newPage(),requests=[],errors=[];
  page.on("request",r=>requests.push({path:new URL(r.url()).pathname,kind:r.resourceType()}));
  page.on("pageerror",e=>errors.push(String(e.message)));
  try{
   await page.clock.setFixedTime(new Date("2026-11-04T12:00:00+04:00"));
   await page.goto(base+"/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>{
    const state=globalThis.AO_RUNTIME_V8?.store?.getState?.();
    const splash=document.querySelector("#ao-cinema-boot");
    return globalThis.AO_APP_SHELL_V1?.installed&&globalThis.AO_R17_BROWSER_ENTRY?.installed&&
      state?.route==="home"&&!state.resolving&&state.resolution?.proper?.status==="ready"&&
      Boolean(document.querySelector(".aoH7HomeView:not([hidden]) [data-home-h7-enter]"))&&
      (!splash||getComputedStyle(splash).display==="none"||
        getComputedStyle(splash).visibility==="hidden"||splash.getAttribute("aria-hidden")==="true");
   },null,{timeout:90000});
   const initial=requests.length,initialScripts=requests.filter(r=>r.kind==="script").length;
   const nativePath="/src/mass/reader-native-preview.js";
   assert.equal(requests.filter(r=>r.path===nativePath).length,0,
     "Native R17 renderer should not load during Home startup");
   assert.equal(Boolean(await page.evaluate(()=>globalThis.AO_R17_NATIVE_READER_PREVIEW?.root?.isConnected)),false,
     "Opening Home must not mount LIVE");
   await page.locator(".aoH7HomeView [data-home-h7-enter]").click();
   const door=page.locator(".aoH7DoorView:not([hidden])");
   await door.locator("[data-home-h4-begin]").waitFor({state:"visible",timeout:15000});
   assert.equal(requests.filter(r=>r.path===nativePath).length,0,
     "H7 Mass door must not eagerly load native LIVE");
   await page.screenshot({path:resolve(out,"before-start-"+width+".png"),animations:"disabled"});
   const startAt=await page.evaluate(()=>performance.now());
   await door.locator("[data-home-h4-begin]").click();
   await page.waitForFunction(()=>
     Boolean(globalThis.AO_R17_NATIVE_READER_PREVIEW?.root?.isConnected)||
     Boolean(document.querySelector("[data-home-h4-begin][disabled]")?.dataset?.aoR17Error),
     null,{timeout:70000});
   const result=await page.evaluate(()=>({
     mounted:Boolean(globalThis.AO_R17_NATIVE_READER_PREVIEW?.root?.isConnected),
     cards:globalThis.AO_R17_NATIVE_READER_PREVIEW?.model?.cards?.length??0,
     error:document.querySelector("[data-home-shortcut-error]")?.textContent??null
   }));
   assert.equal(result.mounted,true,"Native first-use import/start failed: "+JSON.stringify(result));
   assert.ok(result.cards>=60,"Native 65-family production reader did not mount: "+JSON.stringify(result));
   assert.ok(requests.filter(r=>r.path===nativePath).length>=1,
     "First Start must dynamically retrieve the original source-owned R17 renderer");
   assert.deepEqual(errors,[],"Phone errors after R17 load: "+JSON.stringify(errors.slice(0,4)));
   const firstUseReadyMs=Math.round((await page.evaluate(()=>performance.now()))-startAt);
   const after=requests.length;
   await page.screenshot({path:resolve(out,"after-start-"+width+".png"),animations:"disabled"});
   results.push({width,initial,initialScripts,after,firstUseReadyMs,firstUseRequests:after-initial,cardCount:result.cards,
     loadedOnFirstUse:requests.some(r=>r.path===nativePath)});
   console.log("PASS R17 first-use native preview "+JSON.stringify(results.at(-1)));
  }finally{await context.close()}
 }
 await writeFile(resolve(out,"cold-vs-first-use.json"),JSON.stringify({results,
  note:"Local Chromium 320/390: presence and first-use correctness, not a speedup claim"},null,2)+"\n");
}finally{await browser?.close();await new Promise(ok=>server.close(ok));}
