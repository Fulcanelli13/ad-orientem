import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".webp":"image/webp",".png":"image/png",".woff2":"font/woff2"};
const hits=[];
const server=http.createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+path);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return}
  const data=await readFile(file);
  hits.push({path,bytes:data.length});
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(data);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}
});
await new Promise((ok,no)=>{server.once("error",no);server.listen(4203,"127.0.0.1",ok)});
let browser;
const mustDefer=[
 "/src/calendar/calendar-runtime.js",
 "/src/learn/traditional-life.js","/src/learn/spiritual-life-data.js",
 "/src/learn/sexual-ethics.js","/src/learn/latin-course-v2.js",
 "/src/glossary/browser-entry.js"
];
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,serviceWorkers:"block"});
 const pageErrors=[];
 page.on("pageerror",e=>pageErrors.push(String(e?.message??e)));
 const t=Date.now();
 await page.goto("http://127.0.0.1:4203/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.()?.visibleOwner===true,null,{timeout:30000});
 const coldMs=Date.now()-t,cold=hits.slice();
 for(const path of mustDefer)assert.equal(cold.some(h=>h.path===path),false,"Home eagerly downloaded "+path);
 const owners=await page.evaluate(()=>({
  learn:globalThis.AO_LEARN_APP_V1?.status?.().installed,
  calendar:globalThis.AO_CALENDAR_APP_V1?.status?.().installed,
  calendarLoaded:globalThis.AO_CALENDAR_APP_V1?.status?.().loaded??false,
  calendarCache:globalThis.AO_CALENDAR_WEEK_CACHE_V4345?.version,
  mass:Boolean(globalThis.AO_R17_BROWSER_ENTRY),
  spiritualRoute:globalThis.AO_MODULES?.get?.("learn.spiritual_life")?.id,
  sexualRoute:globalThis.AO_MODULES?.get?.("learn.sexual_ethics")?.id,
  traditionalRoute:globalThis.AO_MODULES?.get?.("learn.rites.sick")?.id
 }));
 assert.equal(owners.learn,true,"Formation route owner missing from Home");
 assert.equal(owners.calendar,true,"Calendar route owner missing from Home");
 assert.equal(owners.calendarLoaded,false,"Calendar heavy runtime should be absent from Home");
 assert.equal(owners.calendarCache,"43.45-modular-exact","Week-cache compatibility API removed");
 assert.equal(owners.mass,true,"Native Mass owner missing");
 for(const route of ["spiritualRoute","sexualRoute","traditionalRoute"])assert.ok(owners[route]?.startsWith("learn."),"Formation deep-link route missing "+route);
 const learnOpen=await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("learn"));
 assert.equal(learnOpen?.ok,true,"Formation hub could not open");
 await page.locator("#ao-learn-modular-root").waitFor({state:"visible",timeout:12000});
 for(const path of mustDefer.filter(x=>x.includes("/learn/")||x.includes("glossary/")))assert.equal(hits.some(x=>x.path===path),false,"Formation hub eagerly downloaded course "+path);
 const direct=await page.evaluate(()=>globalThis.AO_LEARN_APP_V1?.openModule?.("learn.spiritual_life"));
 assert.equal(direct,true,"Spiritual Life failed first-use lazy launch");
 assert.ok(hits.some(x=>x.path==="/src/learn/spiritual-life-data.js"),"Spiritual Life lessons were not fetched on first use");
 assert.equal(await page.evaluate(()=>globalThis.AO_SPIRITUAL_LIFE_V1?.status?.().open),true,"Spiritual Life module did not open");

 // Check genuine formation descriptive prose, not heading or kicker microtype.
 for(const width of [320,360,390,430]){
   await page.setViewportSize({width,height:844});
   const metrics=await page.evaluate(()=>{
     const root=document.getElementById("ao-spiritual-life-root");
     const boundary=root.querySelector(".aoSLBoundary");
     const row=root.querySelector(".aoSLRow p");
     return {boundary:parseFloat(getComputedStyle(boundary).fontSize),
       row:parseFloat(getComputedStyle(row).fontSize),
       overflow:root.scrollWidth-root.clientWidth};
   });
   assert.ok(metrics.boundary>=14&&metrics.row>=14,
     "Spiritual Life body copy below 14px at "+width+": "+JSON.stringify(metrics));
   assert.ok(metrics.overflow<=2,"Spiritual Life overflows at "+width+": "+JSON.stringify(metrics));
 }
 await page.setViewportSize({width:390,height:844});
 await page.evaluate(()=>globalThis.AO_APP_SHELL_V1?.navigate?.("home"));
 const calStart=Date.now();
 const opened=await page.evaluate(()=>globalThis.AO_APP_SHELL_V1?.navigate?.("calendar"));
 assert.equal(opened?.ok,true,"Canonical Calendar navigation failed");
 await page.locator("#ao-calendar-modular-root").waitFor({state:"visible",timeout:15000});
 const calMs=Date.now()-calStart;
 assert.equal(hits.some(x=>x.path==="/src/calendar/calendar-runtime.js"),true,"Calendar did not load on first use");
 const calendar=await page.evaluate(()=>({
  status:globalThis.AO_CALENDAR_APP_V1?.status?.(),
  week:globalThis.AO_CALENDAR_WEEK_CACHE_V4345?.inspect?.(),
  root:document.getElementById("ao-calendar-modular-root")?.id
 }));
 assert.equal(calendar.status?.installed,true);
 assert.equal(calendar.status?.open,true);
 assert.equal(calendar.root,"ao-calendar-modular-root");
 assert.equal(calendar.week?.version,"43.45-modular-exact");
 // Liturgical Year is usable on first visit, with one proportional track
 // and navigable cards even before the whole year's Masses are loaded.
 assert.equal(await page.evaluate(()=>globalThis.AO_CALENDAR_APP_V1.setView("year")),true);
 await page.locator("#ao-calendar-modular-root .aoCalYearTrack").waitFor({state:"visible",timeout:5000});
 assert.equal(await page.locator("#ao-calendar-modular-root [data-cal-year-segment]").count(),9);
 assert.equal(await page.locator("#ao-calendar-modular-root [data-cal-year-period]").count(),9);
 const yearSize=await page.evaluate(()=>{
   const root=document.getElementById("ao-calendar-modular-root");
   const track=root.querySelector(".aoCalYearTrack");
   const pieces=[...root.querySelectorAll(".aoCalYearSegment")];
   return {
     horizontalOverflow:root.scrollWidth-root.clientWidth,
     trackWidth:track?.getBoundingClientRect().width,
     partsWidth:pieces.reduce((sum,x)=>sum+x.getBoundingClientRect().width,0),
     expanded:root.querySelectorAll("[data-cal-year-period][aria-expanded=true]").length
   };
 });
 assert.ok(yearSize.trackWidth>150,"Year timeline has no usable phone width");
 assert.ok(Math.abs(yearSize.partsWidth-yearSize.trackWidth)<5,"Period widths are not proportional inside track");
 assert.ok(yearSize.horizontalOverflow<=2,"Year view causes horizontal overflow on phone");
 for(const width of [320,360,390,430]){
   await page.setViewportSize({width,height:844});
   const measure=await page.evaluate(()=>{
     const root=document.getElementById("ao-calendar-modular-root");
     const ring=root?.querySelector(".aoCalV2Ring")?.getBoundingClientRect();
     const timeline=root?.querySelector(".aoCalYearTrack")?.getBoundingClientRect();
     const hero=root?.querySelector(".aoCalV2YearHeroGrid")?.getBoundingClientRect();
     return {overflow:root.scrollWidth-root.clientWidth,ringWidth:ring?.width||0,trackWidth:timeline?.width||0,heroWidth:hero?.width||0};
   });
   assert.ok(measure.overflow<=2,"Year view overflows at "+width+"px: "+JSON.stringify(measure));
   assert.ok(measure.ringWidth>100&&measure.ringWidth<165,"Year wheel is not compact at "+width+"px: "+JSON.stringify(measure));
   assert.ok(measure.trackWidth>width*.7,"Year timeline is too narrow at "+width+"px");
 }
 await page.setViewportSize({width:390,height:844});
 assert.equal(yearSize.expanded,1,"Only one year period may be expanded");
 await page.locator("#ao-calendar-modular-root [data-cal-year-period='advent']").click();
 assert.equal(await page.locator("#ao-calendar-modular-root [data-cal-year-period='advent']").getAttribute("aria-expanded"),"true","Year period tap did not expand details");
 assert.equal(await page.locator("#ao-calendar-modular-root [data-cal-year-period='after-pentecost']").getAttribute("aria-expanded"),"false","Previously expanded period was not collapsed");
 const firstMonth=await page.locator("#ao-calendar-modular-root [data-cal-year-id='advent'] [data-cal-year-month]").getAttribute("data-cal-year-month");
 await page.locator("#ao-calendar-modular-root [data-cal-year-id='advent'] [data-cal-year-month]").click();
 await page.locator("#ao-calendar-modular-root .aoCalV2MonthGrid").waitFor({state:"visible",timeout:5000});
 assert.equal(await page.evaluate(()=>globalThis.AO_CALENDAR_APP_V1.status().pickerMonthId),firstMonth,"Year period Month navigation selected the wrong month");

 // Calendar must preserve working day/year/month controls on actual mobile DOM.
 assert.equal(await page.evaluate(()=>globalThis.AO_CALENDAR_APP_V1?.setView?.("year")),true);
 await page.locator("#ao-calendar-modular-root [data-cal-view='year'].active").waitFor({timeout:8000});
 assert.ok(await page.locator("#ao-calendar-modular-root .aoCalV2YearHero").count()>0);
 // Major milestones must open the Day surface, not update the year silently.
 const nextButton=page.locator("#ao-calendar-modular-root .aoCalV2YearHero [data-cal-year-open-day]").first();
 const targetDate=await nextButton.getAttribute("data-cal-year-open-day");
 assert.match(targetDate,/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/);
 await nextButton.click();
 await page.locator("#ao-calendar-modular-root [data-cal-view='day'].active").waitFor({timeout:15000});
 await page.waitForFunction(date=>globalThis.AO_CALENDAR_APP_V1?.status?.().selectedDate===date,targetDate,{timeout:15000});
 assert.equal(await page.evaluate(()=>globalThis.AO_CALENDAR_APP_V1?.status?.().view),"day");
 await page.evaluate(()=>globalThis.AO_CALENDAR_APP_V1?.setView?.("year"));
 await page.locator("#ao-calendar-modular-root [data-cal-view='year'].active").waitFor({timeout:8000});
 await page.locator("#ao-calendar-modular-root [data-cal-open-month='major']").click();
 assert.equal(await page.evaluate(()=>globalThis.AO_CALENDAR_APP_V1?.status?.().pickerMonthId),targetDate.slice(0,7),"Major Month opened stale previously browsed month");
 await page.locator("#ao-calendar-modular-root [data-cal-month-index='major']").waitFor({timeout:8000});
 assert.equal(await page.evaluate(()=>globalThis.AO_CALENDAR_APP_V1?.status?.().view),"picker");
 assert.equal(await page.evaluate(()=>globalThis.AO_CALENDAR_APP_V1?.status?.().monthView),"major");
 // The Today control is a navigation action, not merely a month-grid scroll.
 await page.locator("#ao-calendar-modular-root [data-cal-today]").click();
 await page.locator("#ao-calendar-modular-root [data-cal-view='day'].active").waitFor({timeout:8000});
 assert.equal(await page.evaluate(()=>globalThis.AO_CALENDAR_APP_V1?.status?.().view),"day");


 // Month export must work from the visible Calendar, never from a second
 // hand-authored feast list. Select a fully audited 2026 month and wait
 // for all original daily Proper sources before enabling download.
 assert.equal(await page.evaluate(()=>globalThis.AO_CALENDAR_APP_V1.select("2026-10-07")),true);
 assert.equal(await page.evaluate(()=>globalThis.AO_CALENDAR_APP_V1.setView("picker")),true);
 await page.locator("#ao-calendar-modular-root [data-cal-export-ics='2026-10']").waitFor({state:"visible",timeout:12000});
 try{
   await page.waitForFunction(()=>{
     const el=document.querySelector("#ao-calendar-modular-root [data-cal-export-ics='2026-10']");
     return Boolean(el&&!el.disabled);
   },null,{timeout:90000});
 }catch(error){
   const diagnostics=await page.evaluate(()=>{
     const month="2026-10",api=globalThis.AO_CALENDAR_APP_V1,cache=globalThis.AO_CALENDAR_WEEK_CACHE_V4345;
     const days=api?.monthGridIds?.(month)?.filter(d=>d.startsWith(month))||[];
     return {status:api?.status?.(),days:days.map(d=>{
       const r=cache?.get?.(d);
       return {date:d,status:r?.status||null,day:Boolean(r?.day?.main),title:r?.day?.main?.title||null,rank:r?.day?.main?.rank||null,properStatus:r?.proper?.status||null,rawError:r?.error||null};
     })};
   });
   throw new Error("Month export remained unavailable: "+String(error?.message||error)+" · "+JSON.stringify(diagnostics));
 }
 const [calendarDownload]=await Promise.all([
   page.waitForEvent("download",{timeout:15000}),
   page.locator("#ao-calendar-modular-root [data-cal-export-ics='2026-10']").click()
 ]);
 assert.equal(calendarDownload.suggestedFilename(),"ad-orientem-1962-2026-10.ics");
 const icsStream=await calendarDownload.createReadStream();
 const icsChunks=[];for await(const chunk of icsStream)icsChunks.push(chunk);
 const icsContent=Buffer.concat(icsChunks).toString("utf8");
 assert.equal((icsContent.match(/BEGIN:VEVENT/g)||[]).length,31,"Month download omits resolved October observances");
 assert.match(icsContent,/DTSTART;VALUE=DATE:20261007/);
 assert.match(icsContent.replace(/\r\n[ \t]/g,""),/Rosary|Rosaire/i,"Holy Rosary must come from the canonical October 7 day");
 assert.doesNotMatch(icsContent,/\bLOCATION:|BEGIN:VALARM/,"Calendar export must not invent Mass places or times");
 console.log("PASS Calendar monthly .ics download: visible button, all 31 source-resolved days, Holy Rosary, no invented Mass times");

 // Date-specific Latin/vernacular print is limited to structurally complete
 // ordinary Proper sheets. No false claim to a complete 1962 Mass booklet.
 const candidates=await page.evaluate(async()=>{
   const mod=await import("/src/calendar/print-proper.js");
   const cache=globalThis.AO_CALENDAR_WEEK_CACHE_V4345;
   return ["2026-10-07","2026-10-04","2026-10-11","2026-10-15"].map(date=>{
     const r=cache?.get?.(date),assessment=mod.assessPrintableProper(r,{language:"en"});
     return {date,ok:assessment.ok,reason:assessment.reason,missing:assessment.missing||[]};
   });
 });
 const printableCandidate=candidates.find(x=>x.ok);
 assert.ok(printableCandidate,"No October 2026 ordinary Mass has printable bilingual Propers: "+JSON.stringify(candidates));
 assert.equal(await page.evaluate(id=>globalThis.AO_CALENDAR_APP_V1.select(id),printableCandidate.date),true);
 assert.equal(await page.evaluate(()=>globalThis.AO_CALENDAR_APP_V1.setView("day")),true);
 const printButton=page.locator("#ao-calendar-modular-root [data-cal-print-proper]");
 await printButton.waitFor({state:"visible",timeout:15000});
 const popupPromise=page.waitForEvent("popup",{timeout:15000});
 await printButton.click();
 const printed=await popupPromise;
 await printed.locator("header h1").waitFor({state:"visible",timeout:12000});
 const printContent=await printed.locator("body").innerText();
 assert.match(printContent,/LATIN/);
 assert.match(printContent,/ENGLISH/);
 assert.match(printContent,/Mass Proper only/);
 assert.ok((await printed.locator(".cols").count())>=8,"Printable source omitted basic ordinary Proper sections");
 await printed.close();
 console.log("PASS Calendar bilingual Proper print opens faithful two-column source-bound extract; no claim to a complete Missal");


 // Clean Calendar boot: Glossary must load only after its own contextual click.
 const glossaryUrl="/src/glossary/browser-entry.js";
 assert.equal(hits.some(x=>x.path===glossaryUrl),false,"Glossary unexpectedly loaded before its Calendar button");
 await page.locator("#ao-calendar-modular-root [data-cal-glossary]").click();
 await page.locator("#ao-glossary-root").waitFor({state:"visible",timeout:25000});
 assert.equal(hits.some(x=>x.path===glossaryUrl),true,"Calendar Glossary click failed to import its owner");
 assert.equal(await page.evaluate(()=>globalThis.AO_GLOSSARY_V1?.status?.().open),true,"Contextual Glossary click did not open the real reader");
 await page.evaluate(()=>globalThis.AO_GLOSSARY_V1?.close?.());

 // Documented 1962-calendar oracle (not the modern Roman calendar):
 // https://gcatholic.org/calendar/2024/Extraordinary-en
 // https://gcatholic.org/calendar/2027/Extraordinary-en
 // https://missale.online/festkalender/en/2027/druck
 const roman1962Cases=[
   ["2024-03-25",/Holy Monday|Monday of Holy Week|Feria II of Holy Week|Lundi saint/i],
   ["2024-04-08",/Annunciation|Annonciation/i],
   ["2024-12-08",/Immaculate Conception|Immaculée Conception/i],
   ["2027-02-10",/Ash Wednesday|Mercredi des Cendres/i],
   ["2027-03-19",/St[.]? Joseph|Saint Joseph|Saint-Joseph/i],
   ["2027-03-25",/Holy Thursday|Jeudi saint/i],
   ["2027-03-26",/Good Friday|Vendredi saint/i],
   ["2027-03-28",/Easter Sunday|Dimanche de Pâques/i],
   ["2027-04-05",/Annunciation|Annonciation/i],
   ["2027-05-06",/Ascension/i],
   ["2027-05-16",/Pentecost|Pentecôte/i],
   ["2027-08-15",/Assumption|Assomption/i],
   ["2027-10-31",/Christ the King|Christ-Roi|Kingship of Our Lord/i],
   ["2027-11-01",/All Saints|Toussaint/i]
 ];
 await page.evaluate(()=>globalThis.AO_CALENDAR_APP_V1.setView("day"));
 const oracleFindings=[],oracleMismatch=[];
 for(const [date,expected] of roman1962Cases){
   const opened=await page.evaluate(id=>globalThis.AO_CALENDAR_APP_V1.select(id),date);
   const title=await page.locator("#ao-calendar-modular-root .aoCalV2Hero h2").textContent();
   const resolved=await page.evaluate(id=>{
     const r=globalThis.AO_CALENDAR_WEEK_CACHE_V4345?.get?.(id);
     const p=r?.proper?.data,day=r?.day?.main;
     return {status:r?.status,rank:p?.rank||day?.rank||null,colour:p?.color||day?.color||null};
   },date);
   const ok=opened===true&&resolved.status!=="failed"&&expected.test(title||"");
   oracleFindings.push({date,title,status:resolved.status,rank:resolved.rank,colour:resolved.colour,ok});
   if(!ok)oracleMismatch.push({date,actual:title,expected:String(expected),status:resolved.status});
 }
 console.log("CALENDAR_1962_ORACLE_FINDINGS="+JSON.stringify(oracleFindings));
 assert.deepEqual(oracleMismatch,[],"1962 resolved Masses disagree with independent sample");
 // Issue #690: verify actual full-source 1962 Mass texts, not just date labels.
 // The Advent ferias explicitly inherit the preceding Sunday's three
 // orations under their original [Rule] Oratio Dominica.
 for(const [date,pattern,expectedCommSource] of [
   ["2026-05-23",/Vigil of Pentecost/,null],
   ["2026-11-01",/All Saints/,new RegExp("^Tempora/Pent[0-9]+-0")],
   ["2026-11-30",/Andrew/,new RegExp("^Tempora/Adv1-1")],
   ["2026-12-08",/Immaculate Conception/,new RegExp("^Tempora/Adv2-2")],
 ]){
   assert.equal(await page.evaluate(id=>globalThis.AO_CALENDAR_APP_V1.select(id),date),true);
   const r=await page.evaluate(id=>globalThis.AO_CALENDAR_WEEK_CACHE_V4345?.get?.(id),date);
   assert.ok(r?.day?.main && r?.proper?.data,date+": missing original resolved Mass");
   assert.match(String(r.proper.data.name||r.day.main.title||""),pattern,date+": wrong 1962 principal celebration");
   if(expectedCommSource){
     const comm=r.day.commemorations||[],texts=r.proper.data;
     assert.ok(comm.some(c=>expectedCommSource.test(c.path||"")),date+": missing privileged commemoration");
     assert.ok((texts.calendarCommemorations||[]).some(c=>expectedCommSource.test(c.path||"")),date+": Proper source commemoration missing");
     for(const key of ["collects","secrets","postcommunions"])
       assert.ok((texts[key]||[]).length>=2,date+": missing actual commemorated "+key);
   } else {
     assert.equal(r.proper.data.nameFr,"Vigile de la Pentecôte",date+": French title missing");
   }
 }

 // In Passion Week 2027 the first-class Mass of St Joseph displaces the
 // third-class Friday, which survives as a commemoration. Confirm all three
 // facets of precedence: principal observance, class/colour, commemoration.
 const josephResolution=await page.evaluate(()=>{
   const r=globalThis.AO_CALENDAR_WEEK_CACHE_V4345?.get?.("2027-03-19");
   return {
     id:r?.day?.main?.id,
     rank:r?.day?.main?.rank,
     colour:r?.day?.main?.color,
     commemorations:(r?.day?.commemorations||[]).map(x=>({id:x.id,title:x.title}))
   };
 });
 assert.equal(josephResolution.id,"sancti:03-19:1:w","St Joseph must own the principal Mass instead of Passion Friday");
 assert.equal(josephResolution.rank,1,"St Joseph must be I class under the 1962 ordo");
 assert.match(josephResolution.colour||"",/white/i,"St Joseph must be white, not Passion Friday violet");
 assert.ok(josephResolution.commemorations.some(x=>/quad5|passion|feria vi/i.test(String(x.id||"")+" "+String(x.title||""))),
   "Friday of Passion Week must remain commemorated under St Joseph");

 assert.equal(await page.evaluate(id=>globalThis.AO_CALENDAR_APP_V1.select(id),"2027-04-05"),true);
 assert.equal(await page.evaluate(()=>globalThis.AO_CALENDAR_APP_V1.setMonthView("major")),true);
 await page.locator("#ao-calendar-modular-root [data-cal-month-index='major']").waitFor({state:"visible",timeout:12000});
 await page.waitForFunction(()=>globalThis.AO_CALENDAR_APP_V1?.status?.().monthReady===true,null,{timeout:45000});
 const transferred=await page.locator("#ao-calendar-modular-root [data-cal-month-index-date='2027-04-05']").textContent();
 assert.match(transferred||"",/Annunciation|Annonciation/i,"Transferred Annunciation absent from April's observed Major index");
 // A first-class sanctoral feast that falls on Sunday must not be
 // misclassified as an ordinary Sunday of the temporal cycle.
 await page.evaluate(()=>globalThis.AO_CALENDAR_APP_V1.setView("day"));
 assert.equal(await page.evaluate(id=>globalThis.AO_CALENDAR_APP_V1.select(id),"2027-08-15"),true);
 assert.equal(await page.evaluate(()=>globalThis.AO_CALENDAR_APP_V1.setMonthView("sanctorale")),true);
 await page.locator("#ao-calendar-modular-root [data-cal-month-index='sanctorale']").waitFor({state:"visible",timeout:12000});
 await page.waitForFunction(()=>globalThis.AO_CALENDAR_APP_V1?.status?.().monthReady===true,null,{timeout:45000});
 const assumptionEntry=await page.locator("#ao-calendar-modular-root [data-cal-month-index-date='2027-08-15']").textContent();
 assert.match(assumptionEntry||"",/Assumption|Assomption/i,"Sunday Assumption must remain Sanctorale by observed principal Mass");
 console.log("PASS Calendar 1962 source-oracle sample: 14 observed days and transferred April feast");

 await page.evaluate(()=>globalThis.AO_APP_SHELL_V1?.navigate?.("home"));
 const fetchedBefore=hits.filter(x=>x.path==="/src/calendar/calendar-runtime.js").length;
 const second=await page.evaluate(()=>globalThis.AO_APP_SHELL_V1?.navigate?.("calendar"));
 assert.equal(second?.ok,true);
 assert.equal(hits.filter(x=>x.path==="/src/calendar/calendar-runtime.js").length,fetchedBefore,"Calendar code fetched again on re-entry");

 // Calendar explanations are body copy, not secondary labels.
 await page.evaluate(()=>globalThis.AO_CALENDAR_APP_V1.setView("day"));
 assert.equal(await page.evaluate(()=>globalThis.AO_CALENDAR_APP_V1.select("2027-08-15")),true);
 await page.locator("#ao-calendar-modular-root .aoCalV2Saint p").waitFor({state:"visible",timeout:12000});
 for(const width of [320,360,390,430]){
   await page.setViewportSize({width,height:844});
   const result=await page.evaluate(()=>{
     const root=document.getElementById("ao-calendar-modular-root");
     const el=root.querySelector(".aoCalV2Saint p");
     return {size:parseFloat(getComputedStyle(el).fontSize),overflow:root.scrollWidth-root.clientWidth};
   });
   assert.ok(result.size>=14,"Calendar explanatory text below 14px at "+width+": "+JSON.stringify(result));
   assert.ok(result.overflow<=2,"Calendar text overflows at "+width+": "+JSON.stringify(result));
 }
 const learnReturn=await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("learn"));
 assert.equal(learnReturn?.ok,true);
 assert.equal(await page.evaluate(()=>globalThis.AO_LEARN_APP_V1.openModule("learn.sexual_ethics")),true);
 assert.equal(await page.evaluate(()=>globalThis.AO_SEXUAL_ETHICS_V1.openQuestion("CSE001")),true);
 await page.locator("#ao-sexual-ethics-root .aoCSEAnswer").waitFor({state:"visible",timeout:16000});
 for(const chapter of ["mat005","1co006"]){
   const href="https://www.newadvent.org/bible/"+chapter+".htm";
   assert.ok(await page.locator('#ao-sexual-ethics-root [data-ao-cse-inline-source="SCR"][href="'+href+'"]').count()>0,
     "CSE001 citation does not open Scripture chapter "+chapter);
 }
 for(const width of [320,360,390,430]){
   await page.setViewportSize({width,height:844});
   const result=await page.evaluate(()=>{
     const root=document.getElementById("ao-sexual-ethics-root");
     const size=selector=>parseFloat(getComputedStyle(root.querySelector(selector)).fontSize);
     return {answer:size(".aoCSEAnswer"),source:size(".aoCSEInlineRef"),overflow:root.scrollWidth-root.clientWidth};
   });
   assert.ok(result.answer>=15&&result.source>=13,"Formation reading text too small at "+width+": "+JSON.stringify(result));
   assert.ok(result.overflow<=2,"Formation reader overflows at "+width+": "+JSON.stringify(result));
 }
 console.log("PASS Calendar and Sexual Ethics reading/source checks at 320/360/390/430px");
 assert.deepEqual(pageErrors.filter(s=>/SyntaxError|ReferenceError|TypeError|import.*failed|Cannot read/.test(s)),[], "Deferred Formation/Calendar caused errors");
 console.log("PASS Home avoided Formation courses and Calendar runtime; first-use Formation child and Calendar navigation preserved");
 console.log("FORMATION_CALENDAR_LAZY="+JSON.stringify({coldMs,calMs,coldRequests:cold.length,coldBytes:cold.reduce((n,v)=>n+v.bytes,0),calendarInstalled:calendar.status.installed,deepLinks:["learn.spiritual_life","learn.sexual_ethics","learn.rites.sick"]}));
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
