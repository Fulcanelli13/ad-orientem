import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",
  ".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
  const bytes=await readFile(path);
  res.writeHead(200,{"content-type":types[extname(path)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(err){res.writeHead(err?.code==="ENOENT"?404:500);res.end(String(err?.message||err))}
});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:"block"});
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",null,{timeout:80000});
 const actual=await page.evaluate(async()=>{
  const date="2026-10-11",resolver=globalThis.AO_RUNTIME_V8.resolver;
  const result=await resolver.resolveDay(date);
  const {massCalendarPreflightContext,fillMassCalendarPreflight}=await import("/src/mass/calendar-preflight-context.js");
  const main=result?.day?.main,proper=result?.proper?.data;
  const resolutionState={selectedDate:date,resolving:false,resolution:result};
  const legacy={date,celebrationId:"mass_of_day",celebrationType:"CALENDAR",calendarDay:main,
    actualCelebration:main,proper:result.proper,canStart:result?.proper?.status==="ready"};
  const context=massCalendarPreflightContext(legacy,resolutionState,"fr");
  const section=document.createElement("section");
  section.innerHTML='<div data-mass-calendar-commemoration hidden>'+
    '<span data-mass-calendar-commemoration-name></span><span data-mass-calendar-commemoration-prayers></span>'+
    '<span data-mass-calendar-commemoration-label></span></div>';
  fillMassCalendarPreflight(section,context);
  const comms=(result?.day?.commemorations||main?.commemorations||[]).map(x=>({id:x.id,title:x.title||x.name,path:x.path,inseparable:x.inseparable}));
  return {resolutionDate:result?.date,dayDate:result?.day?.date,contextCalendar:context.calendar,
    status:result?.status,properStatus:result?.proper?.status,main:{id:main?.id,title:main?.title,rank:main?.rank,color:main?.color},
    commemorations:comms,selectedCommemoration:context.commemorations,
    active:context.commemorationApplies,prayerStatus:context.commemorationOrations.status,
    counts:context.commemorationOrations.counts,
    properCalendarCommemorations:proper?.calendarCommemorations?.map(x=>({path:x.path,title:x.title,inseparable:x.inseparable})),
    prayerLanguageLengths:Object.fromEntries(["collects","secrets","postcommunions"].map(key=>
      [key,(proper?.[key]||[]).map(x=>Object.fromEntries(["lat","en","fr"].map(lang=>[lang,String(x?.[lang]||"").length])))])),
    banner:{visible:!section.querySelector("[data-mass-calendar-commemoration]").hidden,
      name:section.querySelector("[data-mass-calendar-commemoration-name]").textContent,
      explanation:section.querySelector("[data-mass-calendar-commemoration-prayers]").textContent}
  };
 });
 console.log("OCT11_REAL_1962_MASS="+JSON.stringify(actual));
 assert.equal(actual.status,"ready","Oct 11 1962 date resolution failed");
 assert.equal(actual.properStatus,"ready","Oct 11 Mass Proper not loaded");
 assert.match(actual.main.id||"",/tempora:Pent20-0:/i,"Should celebrate 20th Sunday after Pentecost");
 assert.match(actual.selectedCommemoration.join(" "),/Maternit|Mère|Marie|Mary/i,"Oct 11 Marian commemoration missing in preflight");
 assert.equal(actual.active,true,"Calendar commemoration did not apply to the selected Mass");
 assert.equal(actual.prayerStatus,"COMPLETE","Actual Proper is missing one of the 2/2/2 bilingual prayer sets");
 assert.deepEqual(actual.counts,[2,2,2],"Expected primary + Marian collect, secret and postcommunion");
 assert.equal(actual.banner.visible,true);
 assert.match(actual.banner.explanation,/collecte.*secrète.*postcommunion/i,"Pre-Mass guide omits where the extra prayers occur");
 console.log("PASS: real Oct 11 2026 XX Sunday + Marian Maternity; full bilingual 2/2/2 orations and preflight display");
}finally{await browser?.close();await new Promise(done=>server.close(done))}
