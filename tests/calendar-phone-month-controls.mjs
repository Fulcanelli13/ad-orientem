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
const customsSeed=JSON.parse(await readFile(resolve(root,"data/customs/customs-atlas-seed.v1.json"),"utf8"));
const candidateIds=["EPIP-003","CRIB-001"];
const candidateCount=candidateIds.filter(id=>customsSeed.customs.some(row=>
  row.custom_id===id&&row.publication_state==="PUBLISHED")).length;
assert.ok(candidateCount===0||candidateCount===2,"A partial Customs candidate cohort must not pass");
const expectedCustoms=35+candidateCount;
assert.equal(customsSeed.customs.filter(row=>row.publication_state==="PUBLISHED").length,expectedCustoms,
  "The frozen 35 published customs must remain intact and only the complete candidate cohort may be added");
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
 for(const width of [320,390,430])for(const lang of ["en","fr"]){
  const page=await browser.newPage({viewport:{width,height:width===320?700:width===390?844:932},
   isMobile:true,hasTouch:true,deviceScaleFactor:1,locale:lang==="fr"?"fr-FR":"en-GB",reducedMotion:"reduce"});
  const errors=[];
  page.on("pageerror",error=>errors.push(String(error.message||error)));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html?aoR17Reader=native",
     {waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>window.AO_APP_SHELL_V1?.status?.().visibleOwner===true,
     null,{timeout:35000});
   if(lang==="fr"){
     // Exercise the actual settings owner, not a mocked locale flag.
     await page.evaluate(()=>globalThis.AO_APP_SHELL_V1?.navigate?.("settings"));
     await page.locator("#ao-settings-modular-root").waitFor({state:"visible",timeout:15000});
     await page.locator('[data-settings-route="/settings/language-reading"]').click();
     await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().route==="/settings/language-reading");
     await page.locator('[data-pref-path="general.uiLanguage"][data-pref-value="fr"]').click();
     await page.waitForFunction(()=>globalThis.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr");
     await page.evaluate(()=>globalThis.AO_SETTINGS_APP_V1?.close?.());
     await page.locator(".homeScreen.aoTodayV2").waitFor({state:"visible",timeout:20000});
   }
   await page.locator('.aoTodayV2Tabs [data-home-calendar-view="picker"]').click();
   const cal=page.locator(".aoTodayV2CalendarInline #ao-calendar-modular-root");
   await cal.locator('.aoCalV2MonthGrid').waitFor({state:"visible",timeout:40000});
   const metrics=await page.evaluate(()=>{
    const el=document.querySelector(".aoTodayV2CalendarInline #ao-calendar-modular-root");
    const tabs=el.querySelector(".aoCalV2Picker .aoCalMonthTabs");
    const rows=[...tabs.querySelectorAll("button")].map(x=>{
      const r=x.getBoundingClientRect(),c=getComputedStyle(x);
      return {label:x.textContent.trim(),top:r.top,height:r.height,width:r.width,
       font:parseFloat(c.fontSize),whiteSpace:c.whiteSpace};
    });
    const nav=[...el.querySelectorAll(".aoCalV2Picker .aoCalV2MonthNav button")]
      .map(x=>({height:x.getBoundingClientRect().height,
       font:parseFloat(getComputedStyle(x).fontSize)}));
    const a=el.querySelector(".aoCalV2MonthGrid").getBoundingClientRect();
    const v=tabs.getBoundingClientRect();
    return {
     embedded:el.dataset.aoCalendarEmbedded,calendarView:el.dataset.aoCalendarView,
     tabDisplay:getComputedStyle(tabs).display,tabs:rows,tabScrollWidth:tabs.scrollWidth,
     tabWidth:tabs.clientWidth,tabHeight:v.height,gridCount:el.querySelectorAll("[data-cal-pick-date]").length,
     gridTop:a.top,nav,overflow:document.documentElement.scrollWidth-innerWidth,
     month:el.querySelector(".aoCalV2YearHeading h2")?.textContent?.trim()||"",
     state:el.querySelector("[data-cal-month-status]")?.textContent?.trim()||"",
    };
   });
   assert.equal(metrics.calendarView,"picker");
   assert.equal(metrics.gridCount,42,"Never suppress unresolved liturgical days");
   assert.equal(metrics.tabDisplay,"flex","Month views must stay on one horizontal rail");
   assert.equal(metrics.tabs.length,3,"Month should offer only All, Temporale and Sanctorale");
   if(lang==="fr"){
     assert.ok(metrics.tabs.some(t=>/Tout/i.test(t.label)),"French All tab untranslated");
     assert.ok(metrics.tabs.some(t=>/Temporal/i.test(t.label)),"French Temporale filter untranslated");
     assert.ok(metrics.tabs.some(t=>/Sanctoral/i.test(t.label)),"French Sanctorale filter untranslated");
   }
   assert.ok(metrics.tabs.every(x=>Math.abs(x.top-metrics.tabs[0].top)<2),
     "Month categories wrapped, hiding the calendar dates: "+JSON.stringify(metrics.tabs));
   assert.ok(metrics.tabs.every(x=>x.height>=44&&x.font>=12&&x.whiteSpace==="nowrap"),
     "Month categories are unreadable or too small: "+JSON.stringify(metrics.tabs));
   assert.ok(metrics.nav.length===3&&metrics.nav.every(x=>x.height>=44&&x.font>=13),
     "Previous/Today/Next controls too small: "+JSON.stringify(metrics.nav));
   assert.equal(await cal.locator(".aoCalHybridOverview").count(),1,
     "The main Month view must integrate both principal observances and devotional practices");
   assert.equal(await cal.locator(".aoCalHybridMajorSection").count(),1,
     "Major celebrations must be included within the main calendar");
   assert.equal(await cal.locator(".aoCalHybridPracticesSection").count(),1,
     "Practices and novena starts must be included within the main calendar");
   const monthPracticeMarks=await cal.locator(".aoCalV2MonthGrid .hasPractice").count();
   assert.ok(Number.isInteger(monthPracticeMarks),"Practice markers must not disturb 42-day grid");
   assert.ok(metrics.gridTop<width*2,"Calendar grid pushed below the useful phone fold");
   assert.ok(metrics.overflow<=1,"Calendar caused global horizontal overflow: "+metrics.overflow);
   assert.ok(metrics.tabScrollWidth>=metrics.tabWidth,
     "Calendar horizontal month rail has invalid scroll geometry");
   await page.screenshot({path:resolve(output,"calendar-month-"+lang+"-"+width+".png"),
     fullPage:false,animations:"disabled"});
   await cal.locator('[data-cal-month-view="temporale"]').click();
   assert.equal(await cal.locator(".aoCalV2MonthGrid").getAttribute("data-cal-month-filter"),"temporale",
     "Temporale should filter the existing grid, not open a second page");
   assert.equal(await cal.locator("[data-cal-pick-date]").count(),42);
   await cal.locator('[data-cal-month-view="sanctorale"]').click();
   assert.equal(await cal.locator(".aoCalV2MonthGrid").getAttribute("data-cal-month-filter"),"sanctorale",
     "Sanctorale should filter the same 42-date grid");
   assert.equal(await cal.locator("[data-cal-pick-date]").count(),42);
   await cal.locator('[data-cal-month-view="calendar"]').click();
   assert.equal(await cal.locator(".aoCalV2MonthGrid").getAttribute("data-cal-month-filter"),"calendar");
   assert.equal(await cal.locator(".aoCalHybridMajorSection").count(),1);
   assert.equal(await cal.locator(".aoCalHybridPracticesSection").count(),1);
   const original=await cal.locator(".aoCalV2YearHeading h2").innerText();
   await cal.locator('[data-cal-month-shift="1"]').click();
   await page.waitForFunction(previous=>
      document.querySelector(".aoTodayV2CalendarInline .aoCalV2YearHeading h2")?.textContent!==previous,
     original,{timeout:10000});
   assert.equal(await cal.locator("[data-cal-pick-date]").count(),42);
   // Inspect actual published Calendar customs, not only the shell/month grid.
   // The first month shift from October 2026 lands in November.
   if((width===320&&lang==="en")||(width===390&&lang==="fr")){
     const monthCustom=cal.locator('.aoCalCustomMonthContext [data-cal-custom-id="DEAD-001"]');
     await monthCustom.waitFor({state:"visible",timeout:15000});
     await monthCustom.locator("summary").click();
     assert.ok(await monthCustom.locator(".aoCalCustomArticleContent a[href^='https://']").count()>0,
       "November canonical custom must expose its actual source links in Month");
     await page.screenshot({path:resolve(output,"calendar-custom-month-"+lang+"-"+width+".png"),
       fullPage:true,animations:"disabled"});
     await cal.locator('[data-cal-pick-date="2026-11-02"]').click();
     await page.waitForFunction(()=>globalThis.AO_RUNTIME_V8?.store?.getState?.()?.resolution?.date==="2026-11-02",
       null,{timeout:15000});
     // The Home-embedded month remains in picker mode after date selection.
     // Enter the existing selected-day Calendar via its real Home control.
     await page.locator(".aoTodayV2Tabs [data-home-calendar-today]").click();
     await page.locator('[data-home-calendar-view="day"]').first().click();
     await page.waitForFunction(()=>document.getElementById("ao-calendar-modular-root")?.dataset.aoCalendarView==="day",
       null,{timeout:15000});
     const dayCustom=cal.locator('.aoCalCustomsBlock [data-cal-custom-id="DEAD-001"]');
     await dayCustom.waitFor({state:"visible",timeout:10000}).catch(async err=>{
       console.log("CALENDAR_CUSTOM_DAY_DIAGNOSTIC",JSON.stringify(await page.evaluate(()=>{
         const root=document.getElementById("ao-calendar-modular-root"),store=globalThis.AO_RUNTIME_V8?.store?.getState?.();
         return {selectedDate:store?.selectedDate,resolvedDate:store?.resolution?.date,
           resolving:store?.resolving,resolutionStatus:store?.resolution?.status,
           calendarView:root?.dataset.aoCalendarView,rootVisible:!!root?.getClientRects().length,
           practiceCount:root?.querySelectorAll(".aoCalCustomsBlock").length,
           title:root?.querySelector(".aoCalV2Hero h2")?.textContent,
           emptyText:root?.querySelector(".aoCalModEmpty")?.textContent?.trim().slice(0,350),
           body:root?.querySelector("[data-cal-body]")?.textContent?.trim().slice(0,400)};
       })));
       await page.screenshot({path:resolve(output,"calendar-custom-day-diagnostic-"+lang+"-"+width+".png"),fullPage:true});
       throw err;
     });
     assert.equal(await cal.locator('.aoCalCustomsBlock [data-cal-custom-id="DEAD-003"]').count(),1,
       "All Souls must retain all its published day-specific customs");
     await dayCustom.locator("summary").click();
     assert.ok(await dayCustom.locator(".aoCalCustomArticleContent a[href^='https://']").count()>0,
       "Day article must show the actual attributed sources");
     const catalogue=cal.locator(".aoCalCustomCatalogue");
     await catalogue.locator(":scope > summary").click();
     assert.equal(await catalogue.locator(".aoCalCustomCatalogueItems [data-cal-custom-item]").count(),expectedCustoms,
       "The existing Day catalogue must reflect the 35 frozen Customs plus the complete candidate cohort");
     const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
     assert.ok(overflow<=1,"Customs Calendar introduces phone horizontal overflow: "+overflow);
     await page.screenshot({path:resolve(output,"calendar-custom-day-"+lang+"-"+width+".png"),
       fullPage:true,animations:"disabled"});
   }
   assert.equal(errors.length,0,"Calendar runtime errors: "+errors.slice(0,3).join("; "));
   console.log("PASS "+width+"px "+lang+": three in-grid filters, 44px controls, 42 days, month navigation");
  }finally{await page.close();}
 }
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
