// Browser/phone acceptance of real Calendar Day supplementary saints UI.
// Never changes 1962 Mass, selected Proper, Home owner or Map of Saints.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/calendar-sanctoral-phone");
await mkdir(output,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return;}
  const body=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(body);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
const base="http://127.0.0.1:"+server.address().port;
let browser;
const reports=[];
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390,430]){
  const page=await browser.newPage({
   viewport:{width,height:width===320?700:width===390?844:932},
   isMobile:true,hasTouch:true,deviceScaleFactor:1,locale:"en-GB",reducedMotion:"reduce"
  });
  const errors=[],requests=[];
  page.on("pageerror",error=>errors.push(String(error.message||error)));
  page.on("response",response=>{if(response.url().includes("living-sanctoral-read-model.v1.json"))
    requests.push({status:response.status(),url:response.url()});});
  try{
   await page.goto(base+"/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForSelector(".homeScreen.aoTodayV2",{state:"visible",timeout:50000});
   await page.waitForFunction(()=>Boolean(window.AO_RUNTIME_V8?.resolver?.resolveDay) &&
     Boolean(window.AO_APP_SHELL_V1?.status?.().visibleOwner),null,{timeout:45000});
   const dayTab=page.locator('.homeScreen .aoTodayV2ReadReflect [data-home-calendar-view="day"]');
   await dayTab.waitFor({state:"visible",timeout:20000});
   await dayTab.click();
   const host=page.locator(".aoTodayV2CalendarInline #ao-calendar-modular-root");
   await host.waitFor({state:"visible",timeout:40000});
   await page.waitForFunction(()=>window.AO_CALENDAR_APP_V1?.status?.().view==="day",null,{timeout:15000});
   const changed=await page.evaluate(async()=>window.AO_CALENDAR_APP_V1.select("2026-10-09"));
   assert.equal(changed,true,"Unable to select Newman modern memorial day in canonical Calendar");
   await page.waitForFunction(()=>{
     const state=window.AO_RUNTIME_V8?.store?.getState?.();
     const holder=document.querySelector(".aoTodayV2CalendarInline #ao-calendar-modular-root");
     return state?.selectedDate==="2026-10-09" && state?.resolution?.day?.main &&
       Boolean(holder?.querySelector('.aoCalSecondarySaintCard h4'));
   },null,{timeout:55000});
   const metrics=await page.evaluate(()=>{
     const c=document.querySelector(".aoTodayV2CalendarInline #ao-calendar-modular-root");
     const el=c?.querySelector(".aoCalSecondarySaintCard");
     const summary=el?.querySelector("summary");
     const hero=c?.querySelector(".aoCalV2Hero");
     const layout=el?.getBoundingClientRect();
     return {
       width:innerWidth,overflow:document.documentElement.scrollWidth-innerWidth,
       sectionCount:c?.querySelectorAll(".aoCalSecondarySaints").length,
       cardCount:c?.querySelectorAll(".aoCalSecondarySaintCard").length,
       title:el?.querySelector("h4")?.textContent?.trim(),
       heroTitle:hero?.querySelector("h2")?.textContent?.trim(),
       massButtons:c?.querySelectorAll("[data-cal-mass]").length,
       layout:layout?{left:layout.left,right:layout.right,width:layout.width}:null,
       font:el?parseFloat(getComputedStyle(el.querySelector("p")).fontSize):0,
       touchHeight:summary?.getBoundingClientRect().height||0,
       sourceInitialClosed:summary?.parentElement?.open===false,
       observedId:window.AO_RUNTIME_V8?.store?.getState?.()?.resolution?.day?.main?.id,
       view:c?.dataset.aoCalendarView,
     };
   });
   assert.equal(metrics.view,"day");
   assert.equal(metrics.sectionCount,1);
   assert.equal(metrics.cardCount,1);
   assert.match(metrics.title,/Newman/);
   assert.ok(metrics.heroTitle.length>5,"Principal 1962 feast missing");
   assert.ok(metrics.observedId && !metrics.observedId.includes("newman"),"Modern saint replaced 1962 principal");
   assert.ok(metrics.massButtons<=1,"Supplementary entry added Mass controls");
   assert.ok(metrics.overflow<=1,"Global horizontal overflow: "+JSON.stringify(metrics));
   assert.ok(metrics.layout.left>=-1 && metrics.layout.right<=width+1,"Card clipped outside phone viewport");
   assert.ok(metrics.font>=12,"Body text too small for mobile");
   assert.ok(metrics.touchHeight>=44,"Further reading disclosure below 44px touch area");
   assert.equal(metrics.sourceInitialClosed,true,"Source disclosure must be collapsed by default");
   assert.equal(requests.filter(x=>x.status===200).length,1,"Sanctoral data should load only once on Calendar opening");
   await page.locator(".aoCalSecondarySaintCard summary").click();
   assert.equal(await page.locator(".aoCalSecondarySaintCard details").getAttribute("open"),"");
   const href=await page.locator(".aoCalSecondarySaintCard a").getAttribute("href");
   assert.ok(/^https:\/\/(?:press|www)\.vatican\.va\//.test(href||""),"Only Vatican sources in globally rendered memorials");
   assert.equal(await page.locator(".aoCalSecondarySaintCard a").getAttribute("rel"),"noopener noreferrer");
   await page.screenshot({path:resolve(output,"calendar-newman-"+width+".png"),fullPage:false,animations:"disabled"});
   // The same saint appears in Home's observance summary, using the
   // *same shared read model* and without creating another Mass entry.
   await page.locator(".aoTodayV2Tabs [data-home-calendar-today]").click();
   await page.waitForSelector(".homeScreen.aoTodayV2 .aoTodayV2Honoured .aoTodayV2ObservedRow",
     {state:"visible",timeout:25000});
   const homeMetrics=await page.evaluate(()=>{
     const screen=document.querySelector(".homeScreen.aoTodayV2");
     const rows=[...screen.querySelectorAll(".aoTodayV2Honoured .aoTodayV2ObservedRow")];
     return {titles:rows.map(x=>x.textContent.trim()),
       buttons:screen.querySelectorAll("[data-home-mass-entry],[data-resume-mass]").length,
       overflow:document.documentElement.scrollWidth-innerWidth,
       readModelRequests:performance.getEntriesByType("resource")
         .filter(x=>x.name.includes("living-sanctoral-read-model.v1.json")).length};
   });
   assert.ok(homeMetrics.titles.some(x=>/Newman/.test(x)),"Home omitted vetted Newman modern-date reference");
   assert.ok(homeMetrics.titles.some(x=>/The prescribed 1962 Mass remains unchanged/.test(x)),"Home confused modern saint with 1962 Mass");
   assert.equal(homeMetrics.buttons,1,"Home must have one Mass entry");
   assert.ok(homeMetrics.overflow<=1,"Home honour rows overflow phone width");
   assert.equal(requests.filter(x=>x.status===200).length,1,"Home and Calendar must share one dataset request");
   await page.screenshot({path:resolve(output,"home-observances-newman-"+width+".png"),fullPage:false,animations:"disabled"});
   await page.locator('.aoTodayV2Honoured [data-home-calendar-view="day"]').first().click();
   await host.waitFor({state:"visible",timeout:40000});
   const historic=await page.evaluate(async()=>window.AO_CALENDAR_APP_V1.select("2025-10-09"));
   assert.equal(historic,true);
   await page.waitForFunction(()=>window.AO_RUNTIME_V8?.store?.getState?.()?.selectedDate==="2025-10-09",null,{timeout:45000});
   assert.equal(await page.locator(".aoCalSecondarySaintCard").count(),0,
     "Newman 2026 memorial erroneously back-projected to 2025");
   assert.equal(await page.locator(".aoCalV2Hero").count(),1,
     "1962 principal feast disappeared when changing days");
   if(width===390){
     // Original RG claims are shown only for the source-resolved 1962 occurrence.
     assert.equal(await page.evaluate(async()=>window.AO_CALENDAR_APP_V1.select("2026-11-01")),true);
     const exact=page.locator('.aoTodayV2CalendarInline #ao-calendar-modular-root [data-cal-rubric-claim="ALL_SAINTS_OCCURRENT_SUNDAY"]');
     await exact.waitFor({state:"attached",timeout:55000});
     await page.locator(".aoTodayV2CalendarInline .aoCalDaySources summary").click();
     await exact.waitFor({state:"visible",timeout:12000});
     assert.match(await exact.innerText(),/RG 108\(a\).*RG 111\(a\)/);
     const witness=exact.locator("a");
     assert.match(await witness.getAttribute("href"),/^https:\/\/ordo\.fsspx\.org\/day\/2026-11-01/);
     assert.equal(await witness.getAttribute("rel"),"noopener noreferrer");
     assert.equal(await page.locator(".aoTodayV2CalendarInline [data-cal-mass]").count()<=1,true);
     assert.equal(await page.evaluate(async()=>window.AO_CALENDAR_APP_V1.select("2026-10-11")),true);
     await page.waitForFunction(()=>window.AO_RUNTIME_V8.store.getState().resolution?.date==="2026-10-11");
     assert.equal(await page.locator(".aoTodayV2CalendarInline [data-cal-rubric-claim]").count(),0,
       "No date-specific clauses may survive when another observance is selected");
   }
   // A later saint may have a source-reviewed physical shrine even when no
   // dedicated Saints biography is published. Link only the exact Place ID.
   assert.equal(await page.evaluate(async()=>window.AO_CALENDAR_APP_V1.select("2026-09-23")),true);
   const placeAction=page.locator(".aoTodayV2CalendarInline #ao-calendar-modular-root "+
     '[data-cal-secondary-place="place:IT:santuario-san-pio-rotondo"]');
   await placeAction.waitFor({state:"visible",timeout:55000});
   assert.equal(await placeAction.getAttribute("data-cal-secondary-saint"),"saint.pio-pietrelcina");
   assert.ok((await placeAction.boundingBox())?.height>=44,"Physical Place action below 44px target");
   assert.equal(await page.locator(".aoTodayV2CalendarInline [data-cal-mass]").count()<=1,true,
     "Additional Place button must not create Mass selection");
   if(width===390){
     await placeAction.click();
     await page.waitForFunction(()=>window.AO_FIND_APP_V1?.status?.().open===true&&
       window.AO_FIND_APP_V1.status().lens==="shrines"&&
       window.AO_FIND_APP_V1.status().selectedPlaceId==="place:IT:santuario-san-pio-rotondo",
       null,{timeout:60000});
     assert.equal(await page.evaluate(()=>window.AO_RUNTIME_V8.store.getState().selectedDate),"2026-09-23",
       "Explore must not reset the Calendar-selected date");
     assert.equal(await page.locator("#ao-find-root").count()<=1,true,"No duplicate Explore mount");
   }
   assert.equal(errors.length,0,"Browser runtime errors: "+errors.slice(0,4).join(" ; "));
   reports.push({width,...metrics,requestCount:requests.length,pageErrors:errors.length});
   console.log("PASS "+width+"px Calendar: Newman modern saint under 1962 principal, accessible disclosure, one lazy fetch, historical gate");
  }finally{await page.close();}
 }
 await writeFile(resolve(output,"sanctoral-phone-metrics.json"),JSON.stringify(reports,null,2));
}finally{await browser?.close();await new Promise(ok=>server.close(ok));}
