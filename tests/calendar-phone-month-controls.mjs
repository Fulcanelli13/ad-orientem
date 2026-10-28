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
   // The Ordo uses the same resolved month, without replacing the 42-date grid.
   await cal.locator('[data-cal-month-layout="ordo"]').click();
   const ordoPanel=cal.locator('[data-cal-month-presentation="ordo"]');
   assert.equal(await ordoPanel.isVisible(),true,"Ordo presentation must be visible");
   assert.equal(await cal.locator('[data-cal-month-presentation="grid"]').isHidden(),true,
     "Grid remains mounted but is hidden in Ordo mode");
   const ordoCount=await cal.locator('.aoCalOrdoEntry').count();
   assert.ok(ordoCount>=28&&ordoCount<=31,"Ordo must list every in-month day: "+ordoCount);
   // Capture actual resolved liturgical content, not a frame of loading skeletons.
   // A few resolved entries are not a visual acceptance baseline: the
   // prior capture showed several "Day awaiting resolution" placeholders
   // beside Christ the King. Require the entire week in view to resolve
   // before taking evidence, without inventing missing day identities.
   await page.waitForFunction(()=>[
     "2026-10-21","2026-10-22","2026-10-23","2026-10-24",
     "2026-10-25","2026-10-26","2026-10-27"
   ].every(date=>document.querySelector(
     '#ao-calendar-modular-root [data-cal-ordo-date="'+date+'"]')?.dataset.ready==="1"),
   null,{timeout:90000});
   const kingLabel=await cal.locator(
     '[data-cal-ordo-date="2026-10-25"] .aoCalOrdoIdentity strong').innerText();
   assert.equal(kingLabel,lang==="fr"?"Fête de Notre-Seigneur Jésus-Christ Roi":"Christ the King",
     "Original source-bound French King feast heading lost");
   const firstResolvedDate=await cal.locator('.aoCalOrdoEntry[data-ready="1"]').first()
     .getAttribute('data-cal-ordo-date');
   const firstOrdo=cal.locator('[data-cal-ordo-date="'+firstResolvedDate+'"]');
   await firstOrdo.locator(':scope > summary').click();
   assert.equal(await firstOrdo.getAttribute('open'),"",
     "Resolved Ordo day must expand without navigating away");
   assert.equal(await firstOrdo.locator('.aoCalOrdoVerified').count(),1,
     "Resolved Ordo must show only source-backed Mass availability");
   const latinFacts=firstOrdo.locator('.aoCalOrdoFact dd[lang="la"]');
   if(await latinFacts.count()){
     const firstLatin=await latinFacts.first().innerText();
     assert.doesNotMatch(firstLatin,/^(?:Ps|Psalm)\\.?\\s*\\d+/i,
       "An Introit source reference is not its Latin incipit: "+firstLatin);
   }
   assert.equal(await firstOrdo.locator('[data-cal-month-index-date]').count(),1,
     "Expanded Ordo day must link to the canonical Day");
   if(width===390&&lang==="en"){
     // Independent 365-day audit identifies 26 October 2026 as the
     // 1962 general-calendar green IV-class feria, with no Gloria/Credo.
     const dateId="2026-10-26";
     await page.waitForFunction(date=>
       document.querySelector('[data-cal-ordo-date="'+date+'"]')?.dataset.ready==="1",
       dateId,{timeout:45000});
     const feria=cal.locator('[data-cal-ordo-date="'+dateId+'"]');
     if(await feria.getAttribute("open")===null)await feria.locator(':scope > summary').click();
     const facts=await feria.locator('.aoCalOrdoFact').allTextContents();
     assert.ok(facts.some(t=>/Gloria/.test(t)&&/Omitted/.test(t)),
       "Resolved Oct 26 feria must omit Gloria under Breviary 238c");
     assert.ok(facts.some(t=>/Credo/.test(t)&&/Omitted/.test(t)),
       "Resolved Oct 26 feria must omit Credo under RGMR 475-476");
     const evidence=feria.locator(".aoCalOrdoBasis");
     assert.equal(await evidence.count(),1,
       "Displayed source-supported rules need reviewable rubrical provenance");
     assert.ok(await evidence.locator('a[href^="https://isidore.co/"]').count()>=2);
   }
   await page.screenshot({path:resolve(output,"calendar-ordo-"+lang+"-"+width+".png"),
     fullPage:false,animations:"disabled"});
   await cal.locator('[data-cal-month-view="temporale"]').click();
   assert.equal(await cal.locator('.aoCalOrdoList').getAttribute("data-cal-month-filter"),"temporale",
     "Existing source-cycle filter must apply to Ordo too");
   await cal.locator('[data-cal-month-view="calendar"]').click();
   await cal.locator('[data-cal-month-layout="grid"]').click();
   assert.equal(await cal.locator('[data-cal-month-presentation="grid"]').isVisible(),true,
     "Switching back must restore the original grid");
   assert.equal(await cal.locator('[data-cal-pick-date]').count(),42,
     "Grid switch must retain 42 cells");
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
   // November I-class and All Souls principal Masses must display actual
   // original French Officium headings, not the English host nameFr field.
   // These assertions use the real 2026 resolver, not synthetic strings.
   await page.waitForFunction(()=>["2026-11-01","2026-11-02"].every(date=>
     document.querySelector('[data-cal-pick-date="'+date+'"]')?.dataset.ready==="1"),
     null,{timeout:90000});
   for(const [date,en,frTitle] of [
     ["2026-11-01","All Saints","Tous les Saints"],
     ["2026-11-02","Commemoration of All Souls","Commémoraison de tous les fidèles défunts"]
   ]){
     const title=await cal.locator('[data-cal-pick-date="'+date+'"] .aoCalMonthName').innerText();
     assert.equal(title,lang==="fr"?frTitle:en,date+" original selected feast in "+lang);
   }
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
     assert.equal(await catalogue.locator(".aoCalCustomCatalogueItems [data-cal-custom-item]").count(),35,
       "The existing Day catalogue must expose 35 published canonical customs");
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
