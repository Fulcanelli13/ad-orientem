// ESM request-consolidation pilot against the same local Pages release bytes.
// No production code, approvals or GitHub Pages publishing are changed.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const site=resolve(root,"dist/web-preview");
const output=resolve(root,"artifacts/pages-esm-bundle-pilot");
await mkdir(output,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(site,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(file!==site&&!file.startsWith(site+sep)){res.writeHead(403);return res.end("forbidden");}
  const body=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream",
   "cache-control":extname(file)===".html"?"no-store":"public,max-age=3600"});
  res.end(body);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message||error));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;const samples=[];
const base="http://127.0.0.1:"+server.address().port;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [390,320])for(const mode of ["baseline","bundled"]){
  const context=await browser.newContext({viewport:{width,height:width===390?844:700},
   isMobile:true,hasTouch:true,deviceScaleFactor:1,locale:"en-GB",reducedMotion:"reduce"});
  const page=await context.newPage(),requests=[],errors=[];
  page.on("request",r=>requests.push({kind:r.resourceType(),url:r.url()}));
  page.on("pageerror",e=>errors.push(String(e.message)));
  try{
   await page.clock.setFixedTime(new Date("2026-11-04T12:00:00+04:00"));
   const cdp=await context.newCDPSession(page);
   await cdp.send("Emulation.setCPUThrottlingRate",{rate:4});
   const file=mode==="baseline"?"index-baseline-pilot.html":"index.html";
   await page.goto(base+"/"+file+"?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>{
    const s=globalThis.AO_RUNTIME_V8?.store?.getState?.(),splash=document.querySelector("#ao-cinema-boot");
    return globalThis.AO_APP_SHELL_V1?.installed&&globalThis.AO_R17_BROWSER_ENTRY?.installed&&
     s?.route==="home"&&!s.resolving&&Boolean(s.resolution?.day?.main)&&
     Boolean(document.querySelector(".aoH7HomeView:not([hidden]) [data-home-h7-enter]"))&&
     (!splash||!splash.isConnected||getComputedStyle(splash).display==="none"||
      getComputedStyle(splash).visibility==="hidden"||splash.getAttribute("aria-hidden")==="true");
   },null,{timeout:90000});
   const counts={requests:requests.length,
    js:requests.filter(x=>x.kind==="script"||/\.m?js(?:\?|$)/.test(x.url)).length,
    durationMs:Math.round(await page.evaluate(()=>performance.now()))};
   if(mode==="bundled"){
    assert.equal(errors.length,0,"Bundled ESM console errors: "+errors.join("; "));
    await page.screenshot({path:resolve(output,"home-"+width+".png"),animations:"disabled"});
    await page.locator(".aoH7HomeView [data-home-calendar-civil-today]").click();
    await page.locator(".aoTodayV2CalendarInline #ao-calendar-modular-root .aoCalV2Hero")
      .waitFor({state:"visible",timeout:45000});
    await page.screenshot({path:resolve(output,"calendar-"+width+".png"),animations:"disabled"});
    await page.locator(".aoH4CalendarBack [data-home-calendar-today]").click();
    await page.locator(".aoH7HomeView [data-home-h7-enter]").waitFor({state:"visible"});
    await page.locator(".aoH7HomeView [data-home-h7-enter]").click();
    await page.locator(".aoH7DoorView:not([hidden]) [data-home-h4-begin]")
      .waitFor({state:"visible",timeout:15000});
    await page.screenshot({path:resolve(output,"door-"+width+".png"),animations:"disabled"});
    assert.equal(errors.length,0,"Bundled ESM phone navigation errors: "+errors.join("; "));
   }
   samples.push({width,mode,...counts,errors});
   console.log("PAGES_ESM_PILOT "+JSON.stringify(samples.at(-1)));
  }finally{await context.close()}
 }
 for(const width of [390,320]){
  const normal=samples.find(s=>s.width===width&&s.mode==="baseline");
  const bundled=samples.find(s=>s.width===width&&s.mode==="bundled");
  assert.ok(bundled.js<normal.js-50,
   "Bundling did not substantially reduce JS requests on "+width+": "+JSON.stringify({normal,bundled}));
 }
 await writeFile(resolve(output,"baseline-vs-bundle.json"),
  JSON.stringify({method:"Chromium, 4x CPU, localhost, isolated browser profiles",samples},null,2)+"\n");
}finally{await browser?.close();await new Promise(ok=>server.close(ok));}
