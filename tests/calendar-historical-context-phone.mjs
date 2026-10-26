// Real browser acceptance for historical context in the canonical Calendar day.
// Does not alter or stub Mass resolver, liturgical Calendar or source transport.
import assert from "node:assert/strict";
import http from "node:http";
import { mkdir, readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/calendar-historical-context");
await mkdir(output,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".jpg":"image/jpeg",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const p=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(p!==root&&!p.startsWith(root+sep)){res.writeHead(403);res.end("Forbidden");return}
  res.writeHead(200,{"content-type":mime[extname(p)]||"application/octet-stream","cache-control":"no-store"});
  res.end(await readFile(p));
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error.message||error))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});

let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},
  isMobile:true,hasTouch:true,deviceScaleFactor:1,reducedMotion:"reduce"});
 try{
  await page.goto("http://127.0.0.1:"+server.address().port+"/index.html?aoR17Reader=native",
   {waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.().visibleOwner===true,
   null,{timeout:40000});
  await page.locator('.aoTodayV2Tabs [data-home-calendar-view="picker"]').click();
  await page.locator(".aoTodayV2CalendarInline #ao-calendar-modular-root .aoCalV2MonthGrid")
   .waitFor({state:"visible",timeout:45000});

  const day=async date=>{
   const success=await page.evaluate(async target=>{
    const cache=globalThis.AO_CALENDAR_WEEK_CACHE_V4345;
    const calendar=globalThis.AO_CALENDAR_APP_V1;
    if(typeof cache?.revealDate!=="function"||typeof calendar?.setView!=="function")
      throw Error("Canonical Calendar runtime unavailable");
    const result=await cache.revealDate(target,{prefetch:false});
    calendar.setView("day");
    return result;
   },date);
   assert.equal(success,true,"Cannot resolve actual 1962 day "+date);
   await page.waitForFunction(target=>{
    const root=document.querySelector(".aoTodayV2CalendarInline #ao-calendar-modular-root");
    return root?.dataset.aoCalendarView==="day"
      &&globalThis.AO_RUNTIME_V8?.store?.getState?.()?.resolution?.date===target;
   },date,{timeout:25000});
   return page.locator(".aoTodayV2CalendarInline #ao-calendar-modular-root");
  };
  const cases=[
   ["2026-05-23","history.pentecost-vigil-pre1955"],
   ["2026-05-27","history.pentecost-ember-wednesday"],
   ["2026-12-08","history.immaculate-conception-older-vigil-octave"]
  ];
  for(const [date,id] of cases){
   const cal=await day(date);
   const note=cal.locator('[data-cal-historical-date="'+date+'"] [data-cal-historical-id="'+id+'"]');
   await note.waitFor({state:"visible",timeout:12000});
   assert.equal(await cal.locator(".aoCalHistoricalCard").count(),1);
   assert.equal(await note.locator('a[href^="https://"]').count(),2);
   assert.equal(await note.getAttribute("open"),null,"Historical note should begin collapsed");
   await note.locator("summary").click();
   assert.ok((await note.locator("p").innerText()).length>100);
   assert.ok(await note.locator(".aoCalHistoricalSources").isVisible());
   const over=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert.ok(over<=1,"New historical context causes horizontal overflow: "+over);
   await page.screenshot({path:resolve(output,"calendar-history-"+date+".png"),
     fullPage:true,animations:"disabled"});
  }
  const impeded=await day("2026-11-22");
  assert.equal(await impeded.locator('.aoCalHistoricalCard[data-cal-historical-id="history.saint-cecilia-feast-date"]').count(),0,
    "An impeded Cecilia feast must not be presented as the observed principal");
  console.log("PASS canonical Calendar: 3 historical source notes, links, disclosure and impeded Saint.");
 }finally{await page.close()}
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
