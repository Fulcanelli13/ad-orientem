// Real mobile Home acceptance for two EXACT 2026 owner-selected paintings.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/home-two-frozen-class-i-photo-phone");
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
const cases=[
 {date:"2026-03-15",id:"tempora:Quad4-0:1:pv",
  image:"/assets/home/class-i-2026/lanfranco-ngi72-miracle-original.jpg",
  artworkId:"ART-iovanni-anfranco-iracle-of-oaves-and-ishes",
  alt:"Miracle of Loaves and Fishes — Giovanni Lanfranco",
  imageStatus:"LOCAL_NGI72_LANFRANCO_ORIGINAL_WGA_PD_ART_SOURCE",
  width:1285,height:683,credit:/Web Gallery of Art/},
 {date:"2026-07-01",id:"sancti:07-01:1:r",
  image:"/assets/home/class-i-2026/van-dyck-kmska297-lance-thrust-2400.webp",
  artworkId:"ART-nthony-van-yck-he-ance-hrust",
  alt:"The Lance Thrust — Anthony van Dyck",
  imageStatus:"LOCAL_KMSKA297_VAN_DYCK_COMMONS_CC0_FULL_FRAME_WEBP",
  width:1771,height:2400,credit:/CC0 1\.0/}
];
await mkdir(out,{recursive:true});
await new Promise((yes,no)=>{server.once("error",no);server.listen(0,"127.0.0.1",yes);});
const origin="http://127.0.0.1:"+server.address().port+"/index.html";
const results=[];let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const row of cases)for(const width of [320,390]){
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
   assert.equal(await page.evaluate(date=>window.AO_CALENDAR_APP_V1.select(date),row.date),true);
   await page.locator("[data-home-calendar-today]").click();
   await page.waitForFunction(date=>{
    const s=window.AO_RUNTIME_V8?.store?.getState?.();
    return s?.selectedDate===date&&!s.resolving&&s.resolution?.proper?.status==="ready";
   },row.date,{timeout:60000});
   assert.equal(await page.evaluate(()=>window.AO_RUNTIME_V8.store.getState().resolution.day.main.id),
     row.id);
   const el=page.locator('[data-ao-home-art-slot] img[data-ao-home-authoritative-date="'+row.date+'"]');
   await el.waitFor({state:"visible",timeout:30000});
   const art=await el.evaluate(async img=>{await img.decode();return {
    src:new URL(img.src).pathname,alt:img.alt,artworkId:img.dataset.aoHomeAuthoritativeArtwork,
    imageStatus:img.dataset.aoHomeImageStatus,
    width:img.naturalWidth,height:img.naturalHeight
   }});
   assert.equal(art.src,row.image);
   assert.equal(art.artworkId,row.artworkId);
   assert.equal(art.alt,row.alt);
   assert.equal(art.imageStatus,row.imageStatus);
   assert.equal(art.width,row.width);assert.equal(art.height,row.height);
   await page.waitForFunction(()=>!!document.querySelector('[data-home-c3-info="mass"]')?.__c3Artwork?.rights,
     null,{timeout:30000});
   const attribution=await page.locator('[data-home-c3-info="mass"]').evaluate(
    btn=>btn.__c3Artwork?.rights??"");
   assert.match(attribution,row.credit);
   assert.equal(attribution.includes("museum photo master"),false);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert.ok(overflow<=1,"Mobile overflow on "+row.date+" at "+width+"px: "+overflow);
   await page.screenshot({path:resolve(out,row.date+"-"+width+".png"),animations:"disabled"});
   results.push({date:row.date,width,pass:true,art,overflow,creditVisible:true});
  }finally{await context.close();}
 }
}finally{
 if(browser)await browser.close();
 await new Promise(done=>server.close(done));
 await writeFile(resolve(out,"report.json"),JSON.stringify({
  schema:"AO_TWO_FROZEN_CLASS_I_2026_REAL_HOME_PHONE_V1",
  results,ownerCropReviewCreated:false,noNewArtworkSelection:true
 },null,2)+"\n");
}
assert.equal(results.length,4);
console.log("PASS two frozen Class I exact photos in real Home at 320/390px: decoded NGI72 JPEG and KMSKA 297 full-frame WebP, attribution, date, Proper, no overflow");
