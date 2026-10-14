// UI-only 320/390/430 acceptance for Today's canonical inline Calendar month.
// No Mass entry, translations, date resolver, Ordo identity, or month data edits.
import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/calendar-phone-month-controls");
await mkdir(output,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const p=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(p!==root&&!p.startsWith(root+sep)){res.writeHead(403);res.end("Forbidden");return;}
  res.writeHead(200,{"content-type":mime[extname(p)]||"application/octet-stream","cache-control":"no-store"});
  res.end(await readFile(p));
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390,430]){
  const page=await browser.newPage({viewport:{width,height:width===320?700:width===390?844:932},
   isMobile:true,hasTouch:true,deviceScaleFactor:1,locale:"en-GB",reducedMotion:"reduce"});
  const errors=[];
  page.on("pageerror",error=>errors.push(String(error.message||error)));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html?aoR17Reader=native",
     {waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>window.AO_APP_SHELL_V1?.status?.().visibleOwner===true,
     null,{timeout:35000});
   await page.locator('.aoTodayV2Tabs [data-home-calendar-view="picker"]').click();
   const cal=page.locator(".aoTodayV2CalendarInline #ao-calendar-modular-root");
   await cal.locator('.aoCalV2MonthGrid').waitFor({state:"visible",timeout:40000});
   const metrics=await page.evaluate(()=>{
    const el=document.querySelector(".aoTodayV2CalendarInline #ao-calendar-modular-root");
    const filter=el?.querySelector(".aoCalV2Picker .aoCalMonthFilter select");
    const nav=[...(el?.querySelectorAll(".aoCalV2Picker .aoCalV2MonthNav button")||[])]
      .map(x=>({height:x.getBoundingClientRect().height,font:parseFloat(getComputedStyle(x).fontSize)}));
    const grid=el?.querySelector(".aoCalV2MonthGrid")?.getBoundingClientRect();
    const rect=filter?.getBoundingClientRect();
    return {calendarView:el?.dataset.aoCalendarView,filterOptions:[...(filter?.options||[])].map(o=>o.value),
      filterHeight:rect?.height||0,filterFont:filter?parseFloat(getComputedStyle(filter).fontSize):0,
      filterWidth:rect?.width||0,gridCount:el?.querySelectorAll("[data-cal-pick-date]").length||0,
      gridTop:grid?.top||Infinity,nav,overflow:document.documentElement.scrollWidth-innerWidth};
   });
   assert.equal(metrics.calendarView,"picker");
   assert.equal(metrics.gridCount,42,"Never suppress unresolved liturgical days");
   assert.deepEqual(metrics.filterOptions,["calendar","major","temporale","sanctorale","practices"],
     "Month filter must expose all five distinct source-backed categories");
   assert.ok(metrics.filterHeight>=44&&metrics.filterFont>=12&&metrics.filterWidth>100,
     "Canonical Month filter is not touch/phone legible: "+JSON.stringify(metrics));
   assert.ok(metrics.nav.length===3&&metrics.nav.every(x=>x.height>=44&&x.font>=13),
     "Previous/Today/Next controls too small: "+JSON.stringify(metrics.nav));
   assert.ok(metrics.gridTop<width*2,"Calendar grid pushed below the useful phone fold");
   assert.ok(metrics.overflow<=1,"Calendar caused global horizontal overflow: "+metrics.overflow);
   await page.screenshot({path:resolve(output,"calendar-month-"+width+".png"),
     fullPage:false,animations:"disabled"});
   const filter=cal.locator("[data-cal-month-filter]");
   await filter.selectOption("practices");
   assert.equal(await filter.inputValue(),"practices","Practices filter not accessible on phone");
   await filter.selectOption("calendar");
   assert.equal(await cal.locator("[data-cal-pick-date]").count(),42);
   const original=await cal.locator(".aoCalV2YearHeading h2").innerText();
   await cal.locator('[data-cal-month-shift="1"]').click();
   await page.waitForFunction(previous=>
      document.querySelector(".aoTodayV2CalendarInline .aoCalV2YearHeading h2")?.textContent!==previous,
     original,{timeout:10000});
   assert.equal(await cal.locator("[data-cal-pick-date]").count(),42);
   assert.equal(errors.length,0,"Calendar runtime errors: "+errors.slice(0,3).join("; "));
   console.log("PASS "+width+"px: five single-row month tabs, 44px controls, 42 days, month navigation");
  }finally{await page.close();}
 }
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
