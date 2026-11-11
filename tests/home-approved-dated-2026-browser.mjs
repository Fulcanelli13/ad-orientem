// Real source-resolved Home proof — actual H7 browser navigation, not mocks.
// Only asserts published image availability where a fully decoded source image
// can be observed. Screenshots are diagnostic evidence, not human crop approval.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {APPROVED_2026_OTHER_DATE_PREVIEWS} from "../src/home/approved-2026-other-date-previews.js";
import {ANNUAL_HOME_ARTWORK_DAYS_2026} from "../src/home/annual-home-artwork-2026.js";
import {approved2026SeasonalHomeReuse} from "../src/home/approved-2026-seasonal-reuse.js";
import {FROZEN_SELECTED_2026_EXACT_WORK_PREVIEWS} from "../src/home/approved-2026-frozen-selected-previews.js";
import {TWO_FROZEN_CLASS_I_PHOTO_RELEASES_2026} from "../src/home/released-class-i-two-frozen-photos-2026.js";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/home-approved-dated-2026-browser");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".json":"application/json",".css":"text/css; charset=utf-8",
 ".svg":"image/svg+xml",".jpg":"image/jpeg",".png":"image/png",
 ".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const bytes=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]??"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e));}
});
await mkdir(out,{recursive:true});
await new Promise((yes,no)=>{server.once("error",no);server.listen(0,"127.0.0.1",yes);});
const origin="http://127.0.0.1:"+server.address().port+"/index.html";
const cases=[
 {date:"2026-02-18",width:390,principal:"tempora:Quadp3-3:1:v",
  artId:"met-436839",title:"The Penitent Magdalen",
  asset:"/assets/prayer/released/latour-penitent-magdalen-frameless.jpg",remote:false},
 {date:"2026-03-19",width:390,principal:"sancti:03-19:1:w",
  artId:"ART-hilippe-de-hampaigne-he-ream-of-aint-oseph",title:"The Dream of Saint Joseph",
  asset:"/assets/prayer/released/joseph-whole-original.jpg"},
 {date:"2026-03-25",width:320,principal:"sancti:03-25:1:w",
  artId:"met-438724",title:"The Annunciation",
  asset:"/assets/home/c3-approved-met/angelus-frameless.webp"},
 {date:"2026-06-04",width:320,principal:"tempora:Pent01-4:1:w",
  artId:"met-438434",title:"The Virgin Adoring the Host",
  asset:"/assets/home/c3-approved-met/adoration-frameless.webp"},
 {date:"2026-06-12",width:390,principal:"tempora:Pent02-5:1:w",
  artId:"commons-morlete-sacred-heart-1759",title:"The Heart of Jesus",
  asset:"/assets/prayer/released/heart-jesus-full-original.jpg"},
 {date:"2026-12-24",width:320,principal:"sancti:12-24:1:v",
  artId:"ART-hilippe-de-hampaigne-he-ream-of-aint-oseph",title:"The Dream of Saint Joseph",
  asset:"/assets/prayer/released/joseph-whole-original.jpg"},
 {date:"2026-04-07",width:390,principal:"tempora:Pasc0-2:1:w",
  artId:"kmska-307",title:"Christ's First Apparition to the Disciples (Rockox Triptych central panel)",
  asset:"/assets/home/class-i-2026/rubens-rockox-kmska307-central-panel-original.jpg",remote:false}
];
const expandedCases=[
 ...Object.values(APPROVED_2026_OTHER_DATE_PREVIEWS).map((r,i)=>{
  // Two exact previously released CMA source originals now replace remote
  // thumbnails in the Home renderer. Keep the date and work IDs frozen.
  const localCma={
   "2026-05-31":"/assets/prayer/released/girardin-trinity-original.jpg",
   "2026-12-25":"/assets/prayer/released/cavallino-shepherds-original.jpg"
  }[r.date];
  return {date:r.date,width:i%2?320:390,principal:r.principalId,
   artId:r.artworkId,title:r.title,remote:!localCma,
   ...(localCma?{asset:localCma}:{})};
 }),
 {date:"2026-04-02",width:390,principal:"tempora:Quad6-4r:1:w",
  artId:"ART-hilippe-de-hampaigne-a-etite-ne",title:"La Petite Cène",remote:true},
 {date:"2026-05-27",width:320,principal:"tempora:Pasc7-3:1:r",
  artId:"ART-hilippe-de-hampaigne-a-etite-ne",title:"La Petite Cène",remote:true}
];
const seasonalCases=Object.values(ANNUAL_HOME_ARTWORK_DAYS_2026)
 .filter(d=>d.contextualReuseEligible)
 .map((d,i)=>{
  const path=d.principalId.startsWith("commune:C10")?"Commune/C10":"Tempora/feria";
  const r=approved2026SeasonalHomeReuse(d.date,d.principalId,path);
  assert.ok(r?.image&&r.selectionKind==="SEASONAL_CONTEXT_NOT_GOSPEL_SCENE");
  return {date:d.date,width:i%2?320:390,principal:d.principalId,
   artId:r.artworkId,title:r.title,asset:r.image,remote:false};
 });
assert.equal(seasonalCases.length,105);
const frozenCases=Object.values(FROZEN_SELECTED_2026_EXACT_WORK_PREVIEWS).map((r,i)=>{
 // The frozen source register deliberately remains a remote-preview ledger.
 // These two previously owner-accepted photos now have exact local assets.
 // Do not make the other two frozen source previews appear locally certified.
 const local=TWO_FROZEN_CLASS_I_PHOTO_RELEASES_2026[r.date]??null;
 return {date:r.date,width:i%2?320:390,principal:r.principalId,
  artId:r.artworkId,title:r.title,remote:!local,
  ...(local?{asset:local.image}:{})};
});
assert.equal(frozenCases.length,4);
const fullCases=[...cases,...expandedCases,...seasonalCases,...frozenCases];
assert.equal(fullCases.length,129);
let browser;const results=[];
try{
 browser=await chromium.launch({headless:true});
 for(const spec of fullCases){
  const context=await browser.newContext({viewport:{width:spec.width,height:844},
   isMobile:true,hasTouch:true,timezoneId:"Indian/Mauritius",
   serviceWorkers:"block",reducedMotion:"reduce"});
  const page=await context.newPage();
  page.setDefaultTimeout(60000);
  const row={...spec,passed:false,stage:"BOOT"};
  try{
   const response=await page.goto(origin+"?aoTodayH4=1",
      {waitUntil:"domcontentloaded",timeout:90000});
   assert.equal(response?.status(),200);
   await page.waitForFunction(()=>typeof window.AO_RUNTIME_V8?.resolver?.resolveDay==="function"
    &&!!window.AO_RUNTIME_V8?.store?.dispatch,null,{timeout:90000});
   await page.locator(".aoH7HomeView .date[data-home-calendar-view='picker']")
    .waitFor({state:"visible",timeout:45000});
   row.stage="SELECT_DATE";
   await page.locator(".aoH7HomeView .date[data-home-calendar-view='picker']").click();
   await page.locator(".aoH4CalendarViews [data-home-calendar-view='day']")
    .waitFor({state:"visible",timeout:20000});
   await page.locator(".aoH4CalendarViews [data-home-calendar-view='day']").click();
   await page.waitForFunction(()=>window.AO_CALENDAR_APP_V1?.status?.().view==="day",
    null,{timeout:25000});
   assert.equal(await page.evaluate(d=>window.AO_CALENDAR_APP_V1.select(d),spec.date),true);
   await page.locator("[data-home-calendar-today]").click();
   await page.waitForFunction(date=>{
    const s=window.AO_RUNTIME_V8?.store?.getState?.();
    return s?.selectedDate===date&&!s.resolving&&s.resolution?.date===date&&s.resolution?.proper?.status==="ready";
   },spec.date,{timeout:60000});
   const principal=await page.evaluate(()=>window.AO_RUNTIME_V8.store.getState().resolution.day?.main?.id);
   assert.equal(principal,spec.principal);
   row.stage="HOME_ART";
   const image=page.locator('[data-ao-home-art-slot] img[data-ao-home-authoritative-date="'+spec.date+'"]');
   await image.waitFor({state:"visible",timeout:40000});
   const art=await image.evaluate(async img=>{
    await img.decode().catch(()=>{});
    return {title:img.alt,id:img.dataset.aoHomeAuthoritativeArtwork,
     src:img.src,loaded:img.naturalWidth>0,naturalWidth:img.naturalWidth,
     naturalHeight:img.naturalHeight,status:img.dataset.aoHomeImageStatus};
   });
   assert.equal(art.id,spec.artId);
   assert.ok(art.title.includes(spec.title),"Wrong painted title for "+spec.date+": "+art.title);
   assert.ok(art.loaded,"The user-selected real Home painting did not decode");
   if(!spec.remote)assert.ok(art.naturalWidth>=500&&art.naturalHeight>=500,
    "Locally released artwork did not decode at reasonable source resolution");
   if(spec.remote)assert.match(art.src,/(?:commons\.wikimedia|upload\.wikimedia)\.org/);
   else assert.ok(art.src.endsWith(spec.asset),"Wrong original Home image for "+spec.date+": "+art.src);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert.ok(overflow<=1,"Mobile overflow "+spec.width+": "+overflow);
   await page.screenshot({path:resolve(out,"home-"+spec.date+"-"+spec.width+".png"),
    animations:"disabled"});
   Object.assign(row,{stage:"PASS",passed:true,principal,art,overflow});
   console.log("PASS REAL HOME "+spec.date+" "+spec.artId+" decoded "+art.naturalWidth+"x"+art.naturalHeight);
  }catch(e){
   row.error=String(e?.stack??e).slice(0,1500);
   console.error("FAIL REAL HOME "+spec.date+" "+row.stage+": "+row.error);
   await page.screenshot({path:resolve(out,"failure-"+spec.date+".png")}).catch(()=>{});
  }finally{results.push(row);await context.close();}
 }
}finally{
 if(browser)await browser.close();
 await new Promise(ok=>server.close(ok));
 await writeFile(resolve(out,"report.json"),JSON.stringify({
  schema:"AO_2026_HOME_AUTHORITATIVE_DATED_AND_SEASONAL_ART_BROWSER_V2",
  expectedContextualCases:seasonalCases.length,
  cases:results,successful:results.filter(x=>x.passed).length,
  visualCropUserApprovedByThisTest:false
 },null,2)+"\n");
}
assert.ok(results.length===fullCases.length&&results.every(x=>x.passed),
 "Source-owned Home image browser proof failed; inspect screenshots and report.");
