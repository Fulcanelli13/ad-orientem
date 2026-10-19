// Visual acceptance of the actual source-owned Explore surface, not a mock.
// The screenshot artifact is required for human review of map pin legibility.
import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/visual-acceptance");
await mkdir(out,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+path);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return;}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message??error));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
const origin="http://127.0.0.1:"+server.address().port;
const captures=[];
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390,1440]){
  const mobile=width<700,context=await browser.newContext({
   viewport:{width,height:mobile?844:960},deviceScaleFactor:mobile?2:1,
   isMobile:mobile,hasTouch:mobile,locale:"en-GB",
  });
  const page=await context.newPage(),errors=[];
  page.on("pageerror",error=>errors.push(String(error?.message??error)));
  try{
   await page.goto(origin+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
   const entry=page.locator('[data-ao-app-surface="find"]');
   await entry.waitFor({state:"visible",timeout:30000});
   await entry.click();
   await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().open===true
    &&globalThis.AO_FIND_APP_V1?.status?.().loadState==="ready"
    &&Boolean(document.querySelector("#ao-find-modular-root .aoHeritageSurface")),
    null,{timeout:60000});
   const map=page.locator("#ao-find-modular-root .aoHeritageSurface .aoFindMap");
   await map.waitFor({state:"visible"});
   await page.waitForTimeout(2200);
   const measures=await page.evaluate(()=>{
    const map=document.querySelector("#ao-find-modular-root .aoHeritageSurface .aoFindMap");
    const r=map?.getBoundingClientRect(),root=document.querySelector("#ao-find-modular-root");
    return {mapWidth:Math.round(r?.width||0),mapHeight:Math.round(r?.height||0),
     documentOverflow:Math.round(document.documentElement.scrollWidth-innerWidth),
     canvas:Boolean(map?.querySelector("canvas.maplibregl-canvas")),
     status:map?.dataset?.aoMapState||null,
     rootOverflow:root?Math.round(root.scrollWidth-root.clientWidth):null};
   });
   assert.ok(measures.mapWidth>=(mobile?280:600),"Map is too narrow at "+width+": "+JSON.stringify(measures));
   assert.ok(measures.mapHeight>=300,"Map is too short at "+width+": "+JSON.stringify(measures));
   assert.ok(measures.documentOverflow<=1,"Document overflow at "+width+": "+JSON.stringify(measures));
   await page.screenshot({path:resolve(out,"explore-"+width+"-overview.png"),fullPage:false});

   const search=page.locator("#ao-find-modular-root .aoHeritageSurface [data-find-query]");
   await search.fill("Lourdes");
   const result=page.locator("#ao-find-modular-root .aoHeritageSearchResults [data-explore-open-place]").first();
   await result.waitFor({state:"visible",timeout:15000});
   await result.click();
   await page.locator("#ao-find-modular-root .aoHeritagePreview").waitFor({state:"visible",timeout:10000});
   await page.screenshot({path:resolve(out,"explore-"+width+"-selected-place.png"),fullPage:false});
   await page.locator("#ao-find-modular-root .aoHeritagePreview button[data-find-close-place]").click();
   await search.fill("");

   const mass=page.locator("#ao-find-modular-root .aoHeritageMassShortcut");
   await mass.click();
   await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().lens==="tlm",null,{timeout:15000});
   const mapButton=page.locator('#ao-find-modular-root [data-find-filter="view"][data-find-filter-value="map"]');
   if(await mapButton.count())await mapButton.click();
   await page.locator('#ao-find-modular-root [data-find-map]').waitFor({state:"visible",timeout:15000});
   await page.waitForTimeout(2400);
   await page.screenshot({path:resolve(out,"explore-"+width+"-mass-emblems.png"),fullPage:false});
   captures.push({width,...measures,errors,massScreenshot:true});
   assert.equal(errors.length,0,"Explore JS runtime errors at "+width+": "+errors.join(" | "));
  }finally{await context.close();}
 }
 await writeFile(resolve(out,"explore-medallion-visual-report.json"),
  JSON.stringify({capturedAt:new Date().toISOString(),captures},null,2));
 console.log("PASS Explore visual captures at 320, 390 and 1440 px",JSON.stringify(captures));
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
