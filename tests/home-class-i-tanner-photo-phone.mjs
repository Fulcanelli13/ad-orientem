// Actual 2026 Pentecost Monday H7 Home phone render for locally retained
// full Tanner original; screenshots do not constitute owner crop approval.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/home-tanner-local-phone");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".json":"application/json",".css":"text/css; charset=utf-8",
 ".svg":"image/svg+xml",".jpg":"image/jpeg",".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const bytes=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]??"application/octet-stream",
   "cache-control":"no-store"});
  res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e));}
});
await mkdir(out,{recursive:true});
await new Promise((yes,no)=>{server.once("error",no);server.listen(0,"127.0.0.1",yes);});
const origin="http://127.0.0.1:"+server.address().port+"/index.html";
const expected="/assets/home/class-i-2026/tanner-nicodemus-1899-pafa-1900-1-original.jpg";
const results=[];let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390]){
  const context=await browser.newContext({viewport:{width,height:844},isMobile:true,
   hasTouch:true,timezoneId:"Indian/Mauritius",serviceWorkers:"block",reducedMotion:"reduce"});
  const page=await context.newPage();page.setDefaultTimeout(60000);
  try{
   const response=await page.goto(origin+"?aoTodayH4=1",{waitUntil:"domcontentloaded",timeout:90000});
   assert.equal(response?.status(),200);
   await page.waitForFunction(()=>typeof window.AO_RUNTIME_V8?.resolver?.resolveDay==="function"&&
    !!window.AO_RUNTIME_V8?.store?.dispatch,null,{timeout:90000});
   await page.locator(".aoH7HomeView .date[data-home-calendar-view='picker']")
    .waitFor({state:"visible",timeout:45000});
   await page.locator(".aoH7HomeView .date[data-home-calendar-view='picker']").click();
   await page.locator(".aoH4CalendarViews [data-home-calendar-view='day']")
    .waitFor({state:"visible",timeout:20000});
   await page.locator(".aoH4CalendarViews [data-home-calendar-view='day']").click();
   await page.waitForFunction(()=>window.AO_CALENDAR_APP_V1?.status?.().view==="day",null,{timeout:25000});
   assert.equal(await page.evaluate(()=>window.AO_CALENDAR_APP_V1.select("2026-05-25")),true);
   await page.locator("[data-home-calendar-today]").click();
   await page.waitForFunction(()=>{
    const s=window.AO_RUNTIME_V8?.store?.getState?.();
    return s?.selectedDate==="2026-05-25"&&!s.resolving&&
      s.resolution?.proper?.status==="ready";
   },null,{timeout:60000});
   assert.equal(await page.evaluate(()=>window.AO_RUNTIME_V8.store.getState().resolution.day.main.id),
     "tempora:Pasc7-1:1:r");
   const el=page.locator('[data-ao-home-art-slot] img[data-ao-home-authoritative-date="2026-05-25"]');
   await el.waitFor({state:"visible",timeout:30000});
   const art=await el.evaluate(async img=>{await img.decode();return {
    src:new URL(img.src).pathname,alt:img.alt,artworkId:img.dataset.aoHomeAuthoritativeArtwork,
    imageStatus:img.dataset.aoHomeImageStatus,
    width:img.naturalWidth,height:img.naturalHeight
   }});
   assert.equal(art.src,expected);
   assert.equal(art.artworkId,"frozen-date:2026-05-25");
   assert.equal(art.alt,"Nicodemus — Henry Ossawa Tanner");
   assert.equal(art.width,2400);assert.equal(art.height,2100);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert.ok(overflow<=1,"Mobile overflow at "+width+"px: "+overflow);
   await page.screenshot({path:resolve(out,"tanner-"+width+".png"),animations:"disabled"});
   results.push({width,pass:true,art,overflow});
  }finally{await context.close();}
 }
}finally{
 if(browser)await browser.close();
 await new Promise(done=>server.close(done));
 await writeFile(resolve(out,"report.json"),JSON.stringify({
  schema:"AO_TANNER_2026_REAL_HOME_PHONE_V1",
  results,ownerCropReviewCreated:false
 },null,2)+"\n");
}
assert.equal(results.length,2);
console.log("PASS exact Tanner PAFA 1900.1 original in real Home 320px/390px, date/Proper, decoded 2400x2100");
