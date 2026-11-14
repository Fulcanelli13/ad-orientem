// Real 320/390px Home navigation and full original image decode.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/home-class-i-rockox-307-phone");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".json":"application/json",".css":"text/css; charset=utf-8",
 ".svg":"image/svg+xml",".jpg":"image/jpeg",".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const bytes=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]??"application/octet-stream",
   "cache-control":"no-store"});res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e));}
});
const target={
 date:"2026-04-07",id:"tempora:Pasc0-2:1:w",
 image:"/assets/home/class-i-2026/rubens-rockox-kmska307-central-panel-original.jpg",
 artworkId:"kmska-307",title:"Christ's First Apparition to the Disciples (Rockox Triptych central panel)",
 artist:"Peter Paul Rubens",
 status:"LOCAL_KMSKA_307_OWNER_SELECTED_CENTRE_PANEL_INSTITUTIONAL_CC0_SOURCE",
 width:3396,height:3934
};
await mkdir(out,{recursive:true});
await new Promise((yes,no)=>{server.once("error",no);server.listen(0,"127.0.0.1",yes);});
const origin="http://127.0.0.1:"+server.address().port+"/index.html";
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
   await page.waitForFunction(()=>window.AO_CALENDAR_APP_V1?.status?.().view==="day",
     null,{timeout:25000});
   assert.equal(await page.evaluate(date=>window.AO_CALENDAR_APP_V1.select(date),target.date),true);
   await page.locator("[data-home-calendar-today]").click();
   await page.waitForFunction(date=>{
    const s=window.AO_RUNTIME_V8?.store?.getState?.();
    return s?.selectedDate===date&&!s.resolving&&s.resolution?.proper?.status==="ready";
   },target.date,{timeout:60000});
   assert.equal(await page.evaluate(()=>window.AO_RUNTIME_V8.store.getState().resolution.day.main.id),
    target.id);
   const el=page.locator('[data-ao-home-art-slot] img[data-ao-home-authoritative-date="'+target.date+'"]');
   await el.waitFor({state:"visible",timeout:30000});
   const art=await el.evaluate(async img=>{await img.decode();return {
    src:new URL(img.src).pathname,alt:img.alt,artworkId:img.dataset.aoHomeAuthoritativeArtwork,
    imageStatus:img.dataset.aoHomeImageStatus,
    width:img.naturalWidth,height:img.naturalHeight
   }});
   assert.equal(art.src,target.image);
   assert.equal(art.artworkId,target.artworkId);
   assert.equal(art.alt,target.title+" — "+target.artist);
   assert.equal(art.imageStatus,target.status);
   assert.equal(art.width,target.width);
   assert.equal(art.height,target.height);
   await page.waitForFunction(()=>!!document.querySelector('[data-home-c3-info="mass"]')?.__c3Artwork?.rights,
    null,{timeout:30000});
   const rights=await page.locator('[data-home-c3-info="mass"]').evaluate(btn=>btn.__c3Artwork?.rights??"");
   assert.match(rights,/Flemish Art Collection/);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert.ok(overflow<=1,"Easter Tuesday horizontal overflow at "+width+"px: "+overflow);
   await page.screenshot({path:resolve(out,"easter-tuesday-rubens-"+width+".png"),animations:"disabled"});
   results.push({width,pass:true,art,overflow,rightsVerified:true});
  }finally{await context.close();}
 }
}finally{
 if(browser)await browser.close();
 await new Promise(done=>server.close(done));
 await writeFile(resolve(out,"report.json"),JSON.stringify({
  schema:"AO_CLASS_I_ROCKOX_307_REAL_HOME_PHONE_V1",
  results,ownerCropReviewCreated:false,noNewArtworkSelection:true
 },null,2)+String.fromCharCode(10));
}
assert.equal(results.length,2);
console.log("PASS exact Rubens Rockox central panel 307 on real 320/390px Home; 3396x3934 decode, CC0 detail, no overflow");
