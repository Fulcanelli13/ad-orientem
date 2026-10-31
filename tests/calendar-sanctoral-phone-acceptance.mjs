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
   // H7 opens canonical Calendar via its top bar; Day is an embedded lens.
   const calOpen=page.locator('.aoH7HomeView .ib[data-home-calendar-view="picker"]');
   await calOpen.waitFor({state:"visible",timeout:20000});
   await calOpen.click();
   const dayTab=page.locator('.aoH4CalendarViews [data-home-calendar-view="day"]');
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
   // H7 Home keeps its approved layout; supplementary saints remain in Calendar.
   await page.locator(".aoH4CalendarBack [data-home-calendar-today]").click();
   await page.waitForSelector(".aoH7HomeView",{state:"visible",timeout:15000});
   const homeMetrics=await page.evaluate(()=>({
     home:document.querySelectorAll(".aoH7HomeView:not([hidden])").length,
     doorHidden:document.querySelector(".aoH7DoorView")?.hidden,
     massEntry:document.querySelectorAll(".aoH7HomeView [data-home-h7-enter]").length,
     overflow:document.documentElement.scrollWidth-innerWidth,
     readModelRequests:performance.getEntriesByType("resource")
       .filter(x=>x.name.includes("living-sanctoral-read-model.v1.json")).length,
   }));
   assert.equal(homeMetrics.home,1,"H7 Home not restored from Calendar");
   assert.equal(homeMetrics.doorHidden,true,"Mass door opened when leaving Calendar");
   assert.equal(homeMetrics.massEntry,1,"H7 must have one Enter Mass action");
   assert.ok(homeMetrics.overflow<=1,"H7 Home horizontal overflow");
   assert.equal(requests.filter(x=>x.status===200).length,1,"Calendar source should be loaded once");
   await page.screenshot({path:resolve(output,"h7-home-after-newman-"+width+".png"),fullPage:false,animations:"disabled"});
   await page.locator('.aoH7HomeView .ib[data-home-calendar-view="picker"]').click();
   await page.locator('.aoH4CalendarViews [data-home-calendar-view="day"]').click();
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
   if(width===390){
     // Check the observed source-verified Annunciation and original Holy Thursday.
     assert.equal(await page.evaluate(async()=>window.AO_CALENDAR_APP_V1.select("2027-04-05")),true);
     const transfer=page.locator('.aoTodayV2CalendarInline [data-cal-transfer-claim="ANNUNCIATION_2027"]');
     await transfer.waitFor({state:"attached",timeout:55000});
     await page.locator(".aoTodayV2CalendarInline .aoCalDaySources summary").click();
     await transfer.waitFor({state:"visible",timeout:12000});
     assert.match(await transfer.innerText(),/RG 96\(a\)/);
     assert.equal(await transfer.locator('time[datetime="2027-03-25"]').count(),1);
     assert.equal(await transfer.locator('time[datetime="2027-04-05"]').count(),1);
     assert.match(await transfer.locator("a").getAttribute("href"),
       /^https:\/\/missale\.online\/festkalender\/en\/2027$/);
     assert.equal(await page.locator(".aoTodayV2CalendarInline [data-cal-mass]").count()<=1,true);
     assert.equal(await page.evaluate(async()=>window.AO_CALENDAR_APP_V1.select("2027-03-25")),true);
     await page.waitForFunction(()=>window.AO_RUNTIME_V8?.store?.getState?.()?.resolution?.date==="2027-03-25",
       null,{timeout:50000});
     assert.equal(await page.locator(".aoTodayV2CalendarInline [data-cal-transfer-claim]").count(),0,
       "Holy Thursday must not falsely claim to be the transferred Annunciation");
   }
   if(width===390){
     // An independently audited 2027 occurrence gets an exact clause; an
     // unrelated Sunday may not inherit a source-only commemoration.
     assert.equal(await page.evaluate(async()=>window.AO_CALENDAR_APP_V1.select("2027-08-15")),true);
     const claim=page.locator('.aoTodayV2CalendarInline [data-cal-observed-commemoration="ASSUMPTION_SUNDAY_2027"]');
     await page.waitForFunction(()=>window.AO_RUNTIME_V8?.store?.getState?.()?.resolution?.date==="2027-08-15",null,{timeout:55000});
     await claim.waitFor({state:"attached",timeout:55000});
     await page.locator(".aoTodayV2CalendarInline .aoCalDaySources summary").click();
     await claim.waitFor({state:"visible",timeout:12000});
     assert.match(await claim.innerText(),/RG 108\(a\).*RG 111\(a\)/);
     assert.match(await claim.locator("a").getAttribute("href"),
       /^https:\/\/gcatholic\.org\/calendar\/2027\/Extraordinary-en$/);
     assert.equal(await claim.locator("a").getAttribute("rel"),"noopener noreferrer");
     assert.equal(await page.locator(".aoTodayV2CalendarInline [data-cal-mass]").count()<=1,true);
     assert.equal(await page.evaluate(async()=>window.AO_CALENDAR_APP_V1.select("2027-08-22")),true);
     await page.waitForFunction(()=>window.AO_RUNTIME_V8?.store?.getState?.()?.resolution?.date==="2027-08-22",
       null,{timeout:55000});
     assert.equal(await page.locator(".aoTodayV2CalendarInline [data-cal-observed-commemoration]").count(),0,
       "No 2027-source claim can leak into an unrelated Sunday");
   }
   if(width===390){
     assert.equal(await page.evaluate(async()=>window.AO_CALENDAR_APP_V1.select("2027-06-30")),true);
     await page.waitForFunction(()=>window.AO_RUNTIME_V8?.store?.getState?.()?.resolution?.date==="2027-06-30",
       null,{timeout:55000});
     const peterPaul=page.locator('.aoTodayV2CalendarInline [data-cal-apostles-inseparable="PETER_PAUL_INSEPARABLE_2027"]');
     await peterPaul.waitFor({state:"attached",timeout:30000});
     await page.locator(".aoTodayV2CalendarInline .aoCalDaySources summary").click();
     await peterPaul.waitFor({state:"visible",timeout:12000});
     assert.match(await peterPaul.innerText(),/RG 110/);
     assert.match(await peterPaul.innerText(),/one conclusion/i);
     assert.equal(await peterPaul.locator("a").getAttribute("href"),
       "https://gcatholic.org/calendar/2027/Extraordinary-en");
     assert.equal(await peterPaul.locator("a").getAttribute("rel"),"noopener noreferrer");
     assert.equal(await page.locator(".aoTodayV2CalendarInline [data-cal-mass]").count()<=1,true);
     assert.equal(await page.evaluate(async()=>window.AO_CALENDAR_APP_V1.select("2027-06-29")),true);
     await page.waitForFunction(()=>window.AO_RUNTIME_V8?.store?.getState?.()?.resolution?.date==="2027-06-29",
       null,{timeout:50000});
     assert.equal(await page.locator(".aoTodayV2CalendarInline [data-cal-apostles-inseparable]").count(),0,
       "The combined Peter-Paul feast on June 29 must not inherit the June 30 §110 claim");
   }
   if(width===390){
     assert.equal(await page.evaluate(async()=>window.AO_CALENDAR_APP_V1.select("2026-10-04")),true);
     await page.waitForFunction(()=>window.AO_RUNTIME_V8?.store?.getState?.()?.resolution?.date==="2026-10-04",
       null,{timeout:55000});
     const omission=page.locator('.aoTodayV2CalendarInline [data-cal-omitted-feast="FRANCIS_ASSISI_2026_SUNDAY_OMISSION"]');
     await omission.waitFor({state:"attached",timeout:30000});
     await page.locator(".aoTodayV2CalendarInline .aoCalDaySources summary").click();
     await omission.waitFor({state:"visible",timeout:12000});
     assert.match(await omission.innerText(),/RG 111\(b\)/);
     assert.match(await omission.innerText(),/St Francis of Assisi/);
     assert.equal(await omission.locator("a").count(),2);
     assert.equal(await omission.locator("a").first().getAttribute("href"),
       "https://ordo.fsspx.org/day/2026-10-04?lang=en");
     assert.equal(await omission.locator("a").first().getAttribute("rel"),"noopener noreferrer");
     assert.equal(await page.locator(".aoTodayV2CalendarInline [data-cal-mass]").count()<=1,true);
     assert.equal(await page.evaluate(async()=>window.AO_CALENDAR_APP_V1.select("2026-10-05")),true);
     await page.waitForFunction(()=>window.AO_RUNTIME_V8?.store?.getState?.()?.resolution?.date==="2026-10-05",
       null,{timeout:55000});
     assert.equal(await page.locator(".aoTodayV2CalendarInline [data-cal-omitted-feast]").count(),0,
       "An omitted October 4 feast cannot be carried as a commemoration to October 5");
   }
   if(width===390){
     const sourceSurvey=await page.evaluate(async()=>{
       const dates=["2026-07-05","2026-07-12","2026-08-30","2026-11-22","2026-12-06"];
       const resolver=window.AO_RUNTIME_V8.resolver;
       return Promise.all(dates.map(async date=>{
         const r=await resolver.resolveDay(date);
         return {date,status:r?.status,main:r?.day?.main?.id,mainPath:r?.day?.main?.path,
           properPath:r?.proper?.data?.sourcePath,comms:r?.day?.commemorations?.map(x=>x.id)};
       }));
     });
     console.log("BATCH_OMISSION_SOURCE_AUDIT",JSON.stringify(sourceSurvey));
     for(const [date,id,clause] of [
       ["2026-07-05","PENT6_ANTHONY_MARY_ZACCARIA_2026_OMITTED","RG 111(b)"],
       ["2026-07-12","PENT7_JOHN_GUALBERT_2026_OMITTED","RG 111(b)"],
       ["2026-08-30","PENT14_ROSE_LIMA_2026_OMITTED","RG 111(b)"],
       ["2026-11-22","PENT24_CECILIA_2026_OMITTED","RG 111(b)"],
       ["2026-12-06","ADVENT2_NICHOLAS_2026_OMITTED","RG 111(a)"],
     ]){
       assert.equal(await page.evaluate(async d=>window.AO_CALENDAR_APP_V1.select(d),date),true);
       await page.waitForFunction(d=>window.AO_RUNTIME_V8?.store?.getState?.()?.resolution?.date===d,
         date,{timeout:55000});
       const c=page.locator('.aoTodayV2CalendarInline [data-cal-omitted-feast="'+id+'"]');
       const exists=await c.count();
       if(!exists){
         const source=await page.evaluate(()=>{
           const r=window.AO_RUNTIME_V8?.store?.getState?.()?.resolution;
           return {date:r?.date,status:r?.status,main:r?.day?.main,comms:r?.day?.commemorations,
             properPath:r?.proper?.data?.sourcePath,properStatus:r?.proper?.status};
         });
         console.log("BATCH_OMISSION_MISMATCH",date,JSON.stringify(source));
       }
       await c.waitFor({state:"attached",timeout:30000});
       assert.match(await c.textContent(),new RegExp(clause.replace(/[()]/g,x=>"\\"+x)));
       assert.equal(await c.locator("a").first().getAttribute("href"),
         "https://ordo.fsspx.org/day/"+date+"?lang=en");
       assert.equal(await page.locator(".aoTodayV2CalendarInline [data-cal-mass]").count()<=1,true);
     }
     assert.equal(await page.evaluate(async()=>window.AO_CALENDAR_APP_V1.select("2026-12-13")),true);
     await page.waitForFunction(()=>window.AO_RUNTIME_V8?.store?.getState?.()?.resolution?.date==="2026-12-13",
       null,{timeout:55000});
     assert.equal(await page.locator(".aoTodayV2CalendarInline [data-cal-omitted-feast]").count(),0,
       "Disputed St Lucy/Advent III must remain without a certified omission claim");
   }
   if(width===390){
     const dates=["2027-03-07","2027-06-13","2027-08-08","2028-06-11","2028-08-20","2028-12-03"];
     const observed=await page.evaluate(async dates=>{
       const resolver=window.AO_RUNTIME_V8.resolver;
       return Promise.all(dates.map(async date=>{
         const r=await resolver.resolveDay(date);
         return {date,status:r?.status,main:r?.day?.main?.id,path:r?.day?.main?.path,
           comms:r?.day?.commemorations?.map(c=>c?.id),
           properPath:r?.proper?.data?.sourcePath};
       }));
     },dates);
     console.log("MULTI_YEAR_OMISSIONS_REAL_SOURCE",JSON.stringify(observed));
     for(const [date,id,clause] of [
      ["2027-03-07","LENT4_THOMAS_AQUINAS_2027_OMITTED","RG 111(a)"],
      ["2027-06-13","PENT4_ANTHONY_PADUA_2027_OMITTED","RG 111(b)"],
      ["2027-08-08","PENT12_JOHN_VIANNEY_2027_OMITTED","RG 111(b)"],
      ["2028-06-11","TRINITY_BARNABAS_2028_OMITTED","RG 111(a)"],
      ["2028-08-20","PENT11_BERNARD_2028_OMITTED","RG 111(b)"],
      ["2028-12-03","ADVENT1_FRANCIS_XAVIER_2028_OMITTED","RG 111(a)"]
     ]){
       assert.equal(await page.evaluate(async d=>window.AO_CALENDAR_APP_V1.select(d),date),true);
       await page.waitForFunction(d=>window.AO_RUNTIME_V8?.store?.getState?.()?.resolution?.date===d,
         date,{timeout:55000});
       const claim=page.locator('.aoTodayV2CalendarInline [data-cal-omitted-feast="'+id+'"]');
       await claim.waitFor({state:"attached",timeout:30000});
       assert.ok((await claim.textContent())?.includes(clause),date+" correct original clause");
       assert.equal(await claim.locator("a").first().getAttribute("href"),
        "https://ordo.fsspx.org/calendar/"+date.slice(0,4)+"/"+Number(date.slice(5,7)));
       assert.equal(await page.locator(".aoTodayV2CalendarInline [data-cal-mass]").count()<=1,true);
     }
     assert.equal(await page.evaluate(async()=>window.AO_CALENDAR_APP_V1.select("2028-12-04")),true);
     await page.waitForFunction(()=>window.AO_RUNTIME_V8?.store?.getState?.()?.resolution?.date==="2028-12-04",
       null,{timeout:55000});
     assert.equal(await page.locator(".aoTodayV2CalendarInline [data-cal-omitted-feast]").count(),0,
       "Do not transfer the omitted Francis Xavier feast to 4 December");
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
