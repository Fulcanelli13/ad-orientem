// 9 Nov 2026: official ICRSP France Ordo lists both Theodore and pro Papa,
// but the 1960 II-class weekday norm §434(c) permits only one ordinary extra.
// Confirm actual 390px Home and Mass door show the conflict and never silently
// present a three-oration institute Mass as verified. Do not alter the Proper.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const DAY="2026-11-09";
const mime={".html":"text/html;charset=utf-8",".js":"text/javascript;charset=utf-8",
 ".mjs":"text/javascript;charset=utf-8",".json":"application/json",
 ".css":"text/css;charset=utf-8",".svg":"image/svg+xml",
 ".png":"image/png",".woff2":"font/woff2",".webp":"image/webp"};
const srv=http.createServer(async(req,res)=>{
 try{
  const name=resolve(root,"."+decodeURIComponent(
   new URL(req.url,"http://127.0.0.1").pathname));
  if(name!==root&&!name.startsWith(root+sep)){
   res.writeHead(403);return res.end("Forbidden");
  }
  const bytes=await readFile(name);
  res.writeHead(200,{"content-type":mime[extname(name)]??"application/octet-stream",
   "cache-control":"no-store"});res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message))}
});
await new Promise(done=>srv.listen(0,"127.0.0.1",done));
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const lang of ["en","fr"]){
  const page=await browser.newPage({viewport:{width:390,height:844},
   isMobile:true,hasTouch:true,serviceWorkers:"block",
   locale:lang==="fr"?"fr-FR":"en-GB"});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  try{
   await page.goto("http://127.0.0.1:"+srv.address().port+
    "/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForSelector(".homeScreen .aoH7HomeView [data-home-h7-enter]",
    {state:"visible",timeout:60000});
   await page.waitForFunction(()=>Boolean(
    globalThis.AO_CALENDAR_APP_V1?.select&&globalThis.AO_R17_BROWSER_ENTRY?.installed),
    null,{timeout:60000});
   await page.locator(".homeScreen .aoH7HomeView .date[data-home-calendar-view='picker']").click();
   await page.waitForSelector(".homeScreen .aoH4CalendarInline #ao-calendar-modular-root",
    {state:"visible",timeout:45000});
   assert.equal(await page.evaluate(d=>
    globalThis.AO_CALENDAR_APP_V1.select(d,{closeAfter:false}),DAY),true);
   await page.locator(".homeScreen .aoH4CalendarBack [data-home-calendar-today]").click();
   await page.waitForFunction(d=>{
    const s=globalThis.AO_RUNTIME_V8?.store?.getState?.();
    return s?.selectedDate===d&&!s?.resolving&&s?.resolution?.date===d&&
     document.querySelector(".aoH7HomeView [data-home-icrsp-intake-hold='2026-11-09']");
   },DAY,{timeout:60000});
   const home=page.locator(".homeScreen .aoH7HomeView");
   const uiLanguage=await page.locator(".homeScreen").getAttribute("data-home-language");
   const uiFr=uiLanguage==="fr";
   if(lang==="fr"){
    // Browser locale alone must not be mistaken for the actual Home
    // language setting. Verify the real French renderer independently.
    const french=await page.evaluate(async()=>{
     const {renderIcrspFranceHomeOrdo}=await import(
      "/src/calendar/icrsp-france-ordo-evidence.js");
     return renderIcrspFranceHomeOrdo("2026-11-09","fr");
    });
    assert.match(french,/data-mass-1962-rubric-conflict="RGMR_434_C"/);
    assert.match(french,/une seule oraison supplémentaire distincte/);
   }

   const warning=home.locator('[data-home-icrsp-intake-hold="2026-11-09"]');
   assert.equal(await warning.count(),1);
   assert.equal(await warning.getAttribute("data-mass-source-status"),"UNVERIFIED");
   assert.equal(await warning.locator('[data-mass-1962-rubric-conflict="RGMR_434_C"]').count(),1);
   const words=await warning.innerText();
   assert.match(words,uiFr?/saint Théodore/i:/St Theodore|saint Theodore/i);
   assert.match(words,uiFr?/oraison pour le Pape/i:/Prayer for the Pope/);
   assert.match(words,uiFr?/une seule oraison supplémentaire distincte/:/only one separate additional oration/);
   assert.match(words,uiFr?/non encore vérifiée/:/not yet verified/);
   assert.equal(await home.locator('[data-home-icrsp-sunday],[data-home-icrsp-votive]').count(),0);
   const source=await page.evaluate(async()=>{
    const r=await globalThis.AO_RUNTIME_V8.resolver.resolveDay("2026-11-09");
    const {review1962OrationLimits}=await import("/src/mass/1962-oration-limit-review.js");
    const {icrspFranceOrdoIntakeStatus}=await import("/src/calendar/icrsp-france-ordo-intake-status.js");
    const status=icrspFranceOrdoIntakeStatus("2026-11-09");
    return {date:r.date,status:r.status,properStatus:r.proper?.status,
     source:r.proper?.data?.sourcePath,main:r.day?.main?.id,
     calendarClass:r.day?.main?.rank,
     protectedStatus:status.status,
     reviewed:review1962OrationLimits({expectation:{
      date:"2026-11-09",ordoLiturgicalDayClass:2,
      sourceClaim:{sourceOrder:["PRINCIPAL","COMMEMORATION:SAINT_THEODORE_MARTYR","ORATIO_PRO_PAPA"]}
     },form:"LOW"})};
   });
   assert.equal(source.date,DAY);
   assert.equal(source.status,"ready");
   assert.equal(source.properStatus,"ready");
   assert.equal(source.calendarClass,2);
   assert.equal(source.reviewed.reason,
    "SECOND_CLASS_DAY_MORE_THAN_ONE_ADDITIONAL_ORATION");
   assert.equal(source.reviewed.permittedSeparateGroups,2);
   assert.equal(source.reviewed.sourceClaimedGroups,3);
   await home.locator("[data-home-h7-enter]").click();
   const door=page.locator(".homeScreen .aoH7DoorView:not([hidden])");
   await door.waitFor({state:"visible",timeout:30000});
   const doorWarning=door.locator('[data-home-icrsp-intake-hold="2026-11-09"]');
   assert.equal(await doorWarning.count(),1);
   assert.equal(await doorWarning.locator('[data-mass-1962-rubric-conflict="RGMR_434_C"]').count(),1);
   assert.equal(await door.locator('[data-home-icrsp-sunday],[data-home-icrsp-votive]').count(),0);
   assert.match(await door.innerText(),uiFr?/Commencer la messe du calendrier général/:/Begin general-calendar Mass/);
   const assembled=await page.evaluate(async()=>{
    const r=await globalThis.AO_R17_BROWSER_ENTRY.prepare();
    const mass=r?.session?.resolvedMass,p=mass?.proper?.data??mass?.proper;
    return {date:mass?.date,form:mass?.form,sourcePath:p?.sourcePath,
     sourceOrdoExpectation:p?.sourceOrdoExpectation?.id??null,
     prayerRoles:["collects","secrets","postcommunions"].map(k=>
      (p?.[k]??[]).map(x=>x.liturgicalPurpose??"PRINCIPAL"))};
   });
   assert.equal(assembled.date,DAY);
   assert.equal(assembled.sourcePath,"Sancti/11-09",
    "Canonical Lateran Dedication source changed");
   console.log("NOV09_UNIVERSAL_1962_PRAYER_COUNTS "+JSON.stringify({
    language:lang,counts:assembled.prayerRoles.map(x=>x.length),
    roles:assembled.prayerRoles,sourcePath:assembled.sourcePath
   }));
   assert.deepEqual(assembled.prayerRoles.map(x=>x.length),[2,2,2],
    "General 1962 Lateran Dedication must retain St Theodore's commemoration in each oration set");
   assert.equal(assembled.sourceOrdoExpectation,null,
    "Source-unverified ICRSP Mass may not acquire a local certification contract");
   for(const roles of assembled.prayerRoles)
    assert.ok(!roles.includes("ORATIO_PRO_PAPA"),
     "Papal oration cannot silently appear in a general Roman Mass");
   assert.deepEqual(errors,[]);
   console.log("ICRSP_NOV09_1962_RUBRIC_HOLD_PHONE_PASS "+JSON.stringify({
    requestedLocale:lang,visibleHomeLanguage:uiLanguage,date:DAY,sourcePath:source.source,prepared:assembled.sourcePath,
    generalMassReady:true,phoneWarnsBothPlaces:true,
    listedGroups:3,ordinary1962Limit:2,papalNotInvented:true}));
  }finally{await page.close();}
 }
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(done=>srv.close(done));
}
