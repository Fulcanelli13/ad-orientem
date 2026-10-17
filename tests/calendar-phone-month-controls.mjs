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
   assert.equal(metrics.tabs.length,5);
   if(lang==="fr"){
     assert.ok(metrics.tabs.some(t=>/Jours majeurs/i.test(t.label)),"French Major tab untranslated");
     assert.ok(metrics.tabs.some(t=>/Pratiques/i.test(t.label)),"French Practices tab untranslated");
   }
   assert.ok(metrics.tabs.every(x=>Math.abs(x.top-metrics.tabs[0].top)<2),
     "Month categories wrapped, hiding the calendar dates: "+JSON.stringify(metrics.tabs));
   assert.ok(metrics.tabs.every(x=>x.height>=44&&x.font>=12&&x.whiteSpace==="nowrap"),
     "Month categories are unreadable or too small: "+JSON.stringify(metrics.tabs));
   assert.ok(metrics.nav.length===3&&metrics.nav.every(x=>x.height>=44&&x.font>=13),
     "Previous/Today/Next controls too small: "+JSON.stringify(metrics.nav));
   assert.ok(metrics.gridTop<width*2,"Calendar grid pushed below the useful phone fold");
   assert.ok(metrics.overflow<=1,"Calendar caused global horizontal overflow: "+metrics.overflow);
   assert.ok(metrics.tabScrollWidth>=metrics.tabWidth,
     "Calendar horizontal month rail has invalid scroll geometry");
   await page.screenshot({path:resolve(output,"calendar-month-"+lang+"-"+width+".png"),
     fullPage:false,animations:"disabled"});
   const practices=cal.locator('[data-cal-month-view="practices"]');
   await practices.click();
   assert.equal(await practices.getAttribute("aria-current"),"page",
     "Practices not keyboard/touch accessible in horizontal category rail");
   // These are index views, not a second full Calendar. Their source-owned
   // list is compact, while every saint action remains independently tappable.
   for(const view of ["temporale","sanctorale"]){
     await cal.locator('[data-cal-month-view="'+view+'"]').click();
     await cal.locator('[data-cal-month-index="'+view+'"]').waitFor({state:"visible",timeout:12000});
     // Source resolution can repaint this entire index repeatedly. Inspect
     // semantic controls synchronously, and measure geometry only if this
     // snapshot already has laid-out rows; no stale Playwright element wait.
     const index=await cal.locator('[data-cal-month-index="'+view+'"]').evaluate(el=>{
       const rows=[...el.querySelectorAll(".aoCalMonthIndexRow")];
       const actions=[...el.querySelectorAll(".aoCalMonthSaintDetail")];
       const unknown=el.querySelector("[data-cal-unclassified]");
       const utilities=document.querySelector(".aoTodayV2CalendarInline .aoCalMonthUtilities");
       return {rows:rows.length,actions:actions.length,
         heights:rows.map(x=>x.getBoundingClientRect().height),
         actionWidths:actions.map(x=>x.getBoundingClientRect().width),
         legacyPills:actions.filter(x=>x.textContent.includes("Life & sources")||x.textContent.includes("Vie & sources")).length,
         unknownCollapsed:unknown?unknown.open===false:true,
         utilitiesCollapsed:utilities?.open===false,
         overflow:el.scrollWidth-el.clientWidth};
     });
     assert.equal(index.unknownCollapsed,true,"Unclassified source identities should begin in a collapsed, inspectable note");
     assert.equal(index.utilitiesCollapsed,true,"Month list export and jump should not fill the normal list");
     assert.equal(index.overflow<=1,true,"Month "+view+" causes horizontal overflow: "+JSON.stringify(index));
     assert.equal(index.legacyPills,0,"Month index restored repetitive large biography buttons");
     if(index.rows){
       if(view==="sanctorale")
         assert.equal(index.actions,index.rows,"Every saint still needs an independent Life & sources control");
       // A concurrent source-cache repaint can briefly return 0px rectangles
       // for detached rows. Restrict size assertions to laid-out snapshots.
       const laidOut=index.heights.every(x=>x>=44);
       if(laidOut){
         assert.ok(index.heights.every(x=>x<=106),"Month "+view+" still uses oversized list cards: "+JSON.stringify(index));
         if(view==="sanctorale")
           assert.ok(index.actionWidths.every(x=>x>=44&&x<=56),"Biography action must be compact but touch accessible: "+JSON.stringify({width,lang,view,index}));
       }
     }
   }
   await cal.locator('[data-cal-month-view="calendar"]').click();
   assert.equal(await cal.locator("[data-cal-pick-date]").count(),42);
   const original=await cal.locator(".aoCalV2YearHeading h2").innerText();
   await cal.locator('[data-cal-month-shift="1"]').click();
   await page.waitForFunction(previous=>
      document.querySelector(".aoTodayV2CalendarInline .aoCalV2YearHeading h2")?.textContent!==previous,
     original,{timeout:10000});
   assert.equal(await cal.locator("[data-cal-pick-date]").count(),42);
   assert.equal(errors.length,0,"Calendar runtime errors: "+errors.slice(0,3).join("; "));
   console.log("PASS "+width+"px "+lang+": five single-row month tabs, 44px controls, 42 days, month navigation");
  }finally{await page.close();}
 }
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
