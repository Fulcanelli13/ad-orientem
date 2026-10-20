// Real HTTP + actual MapLibre lab acceptance. No fake data injection.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/mapcn-lab");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",
 ".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://localhost").pathname);
  const file=pathname.endsWith("/")?resolve(root,"."+pathname,"index.html"):resolve(root,"."+pathname);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403).end();return}
  const data=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(data);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500).end(String(e.message||e));}
});
await mkdir(output,{recursive:true});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
const origin="http://127.0.0.1:"+server.address().port;
let browser;
try{
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,hasTouch:true,locale:"en-GB"});
 const page=await context.newPage(),errors=[];
 page.on("pageerror",e=>errors.push(String(e.message||e)));
 await page.goto(origin+"/labs/mapcn-integration/",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>{
  const title=document.querySelector("#mode-title"),count=document.querySelector("#total");
  return title?.textContent==="Sacred places" && /^[1-9][0-9]*$/.test(count?.textContent||"");
 },null,{timeout:110000});
 await page.waitForFunction(()=>/ready/i.test(document.querySelector("#map-status")?.textContent||""),
  null,{timeout:110000});
 assert.ok(await page.locator("canvas.maplibregl-canvas").count()>0,"Must render an actual map canvas");
 assert.ok(await page.locator(".place-row[data-id]").count()>0,"Must show actual canonical records");
 assert.ok(await page.locator("#original[href*='store-locator']").count()===1);
 // Same loaded browser across all widths: capture actual breakpoints, not mockups.
 for(const width of [320,390]){
  await page.setViewportSize({width,height:width<700?844:960});
  await page.waitForTimeout(1550);
  await page.waitForFunction(()=>{const r=document.querySelector(".map-stage")?.getBoundingClientRect();const f=document.querySelector(".map-flag")?.getBoundingClientRect();return r&&f&&r.top>=0&&r.top<innerHeight-200&&f.top>=0&&f.top<innerHeight-250;},null,{timeout:20000});
  const viewport=await page.evaluate(()=>({
   overflow:document.documentElement.scrollWidth-innerWidth,
   map:document.querySelector(".map-stage")?.getBoundingClientRect().width,
   nav:document.querySelectorAll('[role="tab"]').length,
   backdrop:document.querySelector(".sidebar")?.getBoundingClientRect().height
  }));
  assert.ok(viewport.overflow<=2,"Horizontal scroll at "+width+": "+JSON.stringify(viewport));
  assert.ok(viewport.map>=(width<700?280:650),"Map collapsed: "+JSON.stringify(viewport));
  assert.equal(viewport.nav,4);
  await page.screenshot({path:resolve(output,"discover-"+width+".png")});
 }
 await page.locator('[data-mode="time"]').click();
 assert.equal(await page.locator("#mode-title").textContent(),"Time & Mass");
 assert.equal(await page.locator("#date-field").isVisible(),true);
 assert.match(await page.locator("#season").textContent(),/season only/i);
 assert.ok(await page.locator("#original[href*='uptime-monitor']").count()===1);
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:resolve(output,"time-390.png")});
 await page.locator('[data-mode="density"]').click();
 assert.equal(await page.locator("#mode-title").textContent(),"Documented density");
 assert.equal(await page.locator("#legend").isVisible(),true);
 assert.match(await page.locator("#legend").textContent(),/Not a survey/i);
 await page.screenshot({path:resolve(output,"heatmap-390.png")});
 await page.locator('[data-mode="regions"]').click();
 assert.equal(await page.locator("#mode-title").textContent(),"Country coverage");
 assert.equal(await page.locator("#legend").isVisible(),true);
 // Desktop must be tested in a fresh viewport. Resizing a 320px MapLibre
 // WebGL context directly to 1440px produces misleading blank captures.
 const desktopContext=await browser.newContext({viewport:{width:1440,height:960},
   deviceScaleFactor:1,hasTouch:false,locale:"en-GB"});
 const desktop=await desktopContext.newPage();
 const desktopErrors=[];
 desktop.on("pageerror",e=>desktopErrors.push(String(e.message||e)));
 await desktop.goto(origin+"/labs/mapcn-integration/",{waitUntil:"domcontentloaded",timeout:90000});
 await desktop.waitForFunction(()=>/ready/i.test(document.querySelector("#map-status")?.textContent||""),
   null,{timeout:110000});
 await desktop.waitForTimeout(3000);
 const first=await desktop.evaluate(()=>({
   stage:document.querySelector(".map-stage")?.getBoundingClientRect().toJSON(),
   flag:document.querySelector(".map-flag")?.getBoundingClientRect().toJSON(),
   canvas:document.querySelector("canvas.maplibregl-canvas")?.getBoundingClientRect().toJSON(),
 }));
 console.log("Desktop geometry",JSON.stringify(first));
 assert.ok(first.stage?.width>900&&first.stage?.height>650&&first.flag?.top<300
   && first.canvas?.width>900&&first.canvas?.height>650,"Desktop atlas must occupy its viewport: "+JSON.stringify(first));
 await desktop.screenshot({path:resolve(output,"discover-1440.png")});
 await desktop.locator('[data-mode="regions"]').click();
 await desktop.locator("#legend").waitFor({state:"visible"});
 await desktop.waitForTimeout(2600);
 await desktop.screenshot({path:resolve(output,"choropleth-1440.png")});
 assert.deepEqual(desktopErrors,[],"No desktop JavaScript exceptions allowed");
 await desktopContext.close();
 assert.deepEqual(errors,[],"No JavaScript page exceptions allowed");
 console.log(JSON.stringify({status:"PASS",captured:6,source:"REAL_EXPLORE_DATASET",widths:[320,390,1440]}));
 await context.close();
}finally{if(browser)await browser.close();await new Promise(ok=>server.close(ok));}
