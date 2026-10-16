import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
   const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
   if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return}
   const content=await readFile(file);
   res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream",
     "cache-control":"no-store"});res.end(content);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e.message??e))}
});
await new Promise((done,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",done)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390]){
  const page=await browser.newPage({
    viewport:{width,height:width===320?700:844},isMobile:true,hasTouch:true,
    reducedMotion:"reduce"
  });
  const errors=[];page.on("pageerror",err=>errors.push(err.message));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
     {waitUntil:"domcontentloaded",timeout:90000});
   await page.locator(".homeScreen.aoTodayV2").waitFor({state:"visible",timeout:65000});
   const tab=page.locator('.homeScreen .aoTodayV2ReadReflect [data-home-calendar-view="day"]');
   await tab.waitFor({state:"visible",timeout:25000});
   await tab.click();
   await page.locator(".aoTodayV2CalendarInline #ao-calendar-modular-root")
     .waitFor({state:"visible",timeout:45000});
   assert.equal(await page.evaluate(async()=>await window.AO_CALENDAR_APP_V1.select("2026-10-03")),
     true,"Calendar must resolve St Thérèse's 1962 principal source");
   await page.waitForFunction(()=>{
     const state=window.AO_RUNTIME_V8?.store?.getState?.();
     return state?.selectedDate==="2026-10-03"&&
       state?.resolution?.day?.main?.id==="sancti:10-03:3:w"&&
       !!document.querySelector('[data-cal-saint-date="2026-10-03"]');
   },null,{timeout:55000});
   const before=await page.evaluate(()=>({
     day:AO_RUNTIME_V8.store.getState().selectedDate,
     main:AO_RUNTIME_V8.store.getState().resolution.day.main.id,
     properPath:AO_RUNTIME_V8.store.getState().resolution.proper?.data?.sourcePath??null
   }));
   await page.locator('.aoTodayV2CalendarInline [data-cal-saint-date="2026-10-03"]').click();
   await page.locator('#ao-find-modular-root .aoSaintPlaceSheet [data-saint-id="saint:therese-of-lisieux"]')
     .waitFor({state:"visible",timeout:80000});
   const after=await page.evaluate(()=>({
     renderedSaintId:document.querySelector("#ao-find-modular-root .aoSaintPlaceSheet [data-saint-id]")?.getAttribute("data-saint-id"),
     lens:AO_FIND_APP_V1.status().lens,
     day:AO_RUNTIME_V8.store.getState().selectedDate,
     main:AO_RUNTIME_V8.store.getState().resolution.day.main.id,
     properPath:AO_RUNTIME_V8.store.getState().resolution.proper?.data?.sourcePath??null,
     shown:!!document.querySelector('#ao-find-modular-root .aoSaintPlaceSheet [data-saint-id="saint:therese-of-lisieux"]')
   }));
   assert.equal(after.renderedSaintId,"saint:therese-of-lisieux");
   assert.equal(after.lens,"saints");
   assert.equal(after.day,before.day);
   assert.equal(after.main,before.main,"The profile must not override the canonical 1962 principal");
   assert.equal(after.properPath,before.properPath,"Mass Proper source must not change");
   assert(after.shown);

   // Later calendar date is a supplementary person record, never today's
   // 1962 Thérèse Mass. It must still open the SAME verified biography.
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
     {waitUntil:"domcontentloaded",timeout:90000});
   await page.locator(".homeScreen.aoTodayV2").waitFor({state:"visible",timeout:65000});
   await page.locator('.homeScreen .aoTodayV2ReadReflect [data-home-calendar-view="day"]')
      .click();
   await page.locator(".aoTodayV2CalendarInline #ao-calendar-modular-root")
     .waitFor({state:"visible",timeout:45000});
   assert.equal(await page.evaluate(async()=>await AO_CALENDAR_APP_V1.select("2026-10-01")),true);
   const supplement=page.locator('.aoTodayV2CalendarInline [data-cal-secondary-saint-profile="saint.therese-lisieux"]');
   await supplement.waitFor({state:"visible",timeout:60000});
   const secondaryBefore=await page.evaluate(()=>({
     date:AO_RUNTIME_V8.store.getState().selectedDate,
     principal:AO_RUNTIME_V8.store.getState().resolution.day.main.id,
     proper:AO_RUNTIME_V8.store.getState().resolution.proper?.data?.sourcePath??null
   }));
   assert.notEqual(secondaryBefore.principal,"sancti:10-03:3:w",
     "Modern Thérèse date cannot replace original traditional feast");
   await supplement.click();
   await page.locator('#ao-find-modular-root .aoSaintPlaceSheet [data-saint-id="saint:therese-of-lisieux"]')
     .waitFor({state:"visible",timeout:75000});
   const secondaryAfter=await page.evaluate(()=>({
     date:AO_RUNTIME_V8.store.getState().selectedDate,
     principal:AO_RUNTIME_V8.store.getState().resolution.day.main.id,
     proper:AO_RUNTIME_V8.store.getState().resolution.proper?.data?.sourcePath??null
   }));
   assert.deepEqual(secondaryAfter,secondaryBefore,
     "Supplementary saint biography must not change traditional 1962 Mass selection");
   assert.deepEqual(errors,[],"Runtime errors: "+errors.join(" | "));
   console.log("PASS "+width+"px Calendar original 3 Oct and supplementary 1 Oct St Thérèse → same exact native Saints biography, 1962 Mass unchanged");
  }finally{await page.close()}
 }
}finally{await browser?.close().catch(()=>{});await new Promise(done=>server.close(done))}
