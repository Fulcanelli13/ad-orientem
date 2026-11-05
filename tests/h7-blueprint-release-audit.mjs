// H7 blueprint: test real Calendar Day -> Mass door and record lab timings.
// Timings are informational until verified against an actual mid-range phone.
import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/h7-blueprint-release");
await mkdir(out,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return;}
  const body=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream",
   "cache-control":extname(file)===".html"?"no-store":"public, max-age=3600"});
  res.end(body);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
const base="http://127.0.0.1:"+server.address().port;
let browser;const samples=[];
try{
 browser=await chromium.launch({headless:true});
 for(const width of [390,320]){
  const context=await browser.newContext({viewport:{width,height:width===390?844:700},
   isMobile:true,hasTouch:true,deviceScaleFactor:1,locale:"en-GB",reducedMotion:"reduce"});
  const page=await context.newPage();
  const errors=[];page.on("pageerror",e=>errors.push(String(e.message)));
  const requestList=[];page.on("request",req=>requestList.push({url:req.url(),kind:req.resourceType()}));
  // Observe actual Chromium transfer sizes and long tasks instead of
  // mistaking Resource Timing's unavailable transferSize for a zero payload.
  const networkResponses=new Map(),wireTransfers=[];
  // A slow font provider must not hold the whole source-ready app behind
  // the cinematic curtain. Exercise the boot contract on the narrow phone.
  if(width===320)await page.addInitScript(()=>{
    Object.defineProperty(document.fonts,"status",{
      configurable:true,get:()=>"loading"
    });
  });
  await page.addInitScript(()=>{
    globalThis.__AO_H7_LONG_TASKS=[];
    try{
      const observer=new PerformanceObserver(list=>{
        for(const entry of list.getEntries())
          globalThis.__AO_H7_LONG_TASKS.push({start:entry.startTime,duration:entry.duration});
      });
      observer.observe({type:"longtask",buffered:true});
    }catch{}
  });
  try{
   await page.clock.setFixedTime(new Date("2026-11-04T12:00:00+04:00"));
   const cdp=await context.newCDPSession(page);
   await cdp.send("Emulation.setCPUThrottlingRate",{rate:4});
   await cdp.send("Network.enable");
   cdp.on("Network.responseReceived",event=>networkResponses.set(event.requestId,{
     url:event.response.url,type:event.type,mimeType:event.response.mimeType,
     status:event.response.status}));
   cdp.on("Network.loadingFinished",event=>{
     const response=networkResponses.get(event.requestId);
     if(!response)return;
     wireTransfers.push({...response,bytes:event.encodedDataLength||0});
     networkResponses.delete(event.requestId);
   });
   await page.goto(base+"/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:90000});
   const homeReady=()=>{const state=globalThis.AO_RUNTIME_V8?.store?.getState?.();
    const splash=document.querySelector("#ao-cinema-boot");
    const splashVisible=Boolean(splash&&splash.isConnected&&getComputedStyle(splash).display!=="none"&&
      getComputedStyle(splash).visibility!=="hidden"&&splash.getAttribute("aria-hidden")!=="true");
    return Boolean(state?.route==="home"&&!state.resolving&&state.resolution?.day?.main&&
      document.querySelector(".aoH7HomeView:not([hidden]) [data-home-h7-enter]")&&!splashVisible);
   };
   await page.waitForFunction(homeReady,null,{timeout:90000});
   // Home DOM can settle one frame before finishBoot() records its outcome.
   // Await the actual cinematic completion instead of sampling a race.
   await page.waitForFunction(()=>Boolean(document.documentElement.dataset.aoCinemaBootReason),
     null,{timeout:15000});
   const fontBoot=await page.evaluate(()=>({
     reason:document.documentElement.dataset.aoCinemaBootReason,
     fontStatus:document.fonts?.status??null
   }));
   assert.equal(fontBoot.reason,"home-stable",
     "Home must finish from resolved content, not the eight-second boot watchdog");
   if(width===320)assert.equal(fontBoot.fontStatus,"loading",
     "Font-stall boot regression did not simulate a persistent remote-font delay");
   const cold=await page.evaluate(()=>({settledMs:Math.round(performance.now()),
    firstContentfulPaintMs:Math.round(performance.getEntriesByType("paint")
      .find(x=>x.name==="first-contentful-paint")?.startTime??0)}));
   cold.requestCount=requestList.length;
   cold.scriptRequests=requestList.filter(x=>x.kind==="script"||/\.m?js(\?|$)/.test(x.url)).length;
   const criticalTasks=await page.evaluate(()=>(globalThis.__AO_H7_LONG_TASKS||[])
     .filter(x=>x.start<performance.now()));
   cold.longTaskMs=Math.round(criticalTasks.reduce((a,x)=>a+x.duration,0));
   cold.longTaskCount=criticalTasks.length;
   cold.transferredBytes=wireTransfers.reduce((a,x)=>a+x.bytes,0);
   cold.scriptTransferredBytes=wireTransfers
     .filter(x=>x.type==="Script"||/\.(?:m?js)(?:\?|$)/.test(x.url))
     .reduce((a,x)=>a+x.bytes,0);
   cold.largestTransfers=[...wireTransfers].sort((a,b)=>b.bytes-a.bytes).slice(0,12)
     .map(x=>({path:(()=>{try{return new URL(x.url).pathname}catch{return x.url}})(),
       type:x.type,bytes:x.bytes}));
   // The original donor injects a title-sized "LITURGICAL DAY" kicker.
   // H7 replaces it with the wordmark/calendar/date hierarchy: it cannot
   // overlap the brand in either 320 or 390 px.
   const legacyKicker=page.locator(".aoH7HomeView .aoH7Hero > .aoLiturgicalDayKicker");
   if(await legacyKicker.count()){
     assert.equal(await legacyKicker.evaluate(el=>getComputedStyle(el).display),"none",
       "Legacy liturgical-day kicker overlaps the approved H7 wordmark");
   }
   await page.screenshot({path:resolve(out,"home-"+width+".png"),animations:"disabled"});
   const now=()=>page.evaluate(()=>performance.now());
   const tCal=await now();
   await page.locator(".aoH7HomeView [data-home-calendar-civil-today]").click();
   const day=page.locator(".aoTodayV2CalendarInline #ao-calendar-modular-root[data-ao-calendar-view='day']");
   await day.locator(".aoCalV2Hero").waitFor({state:"visible",timeout:50000});
   const calendarOpenMs=Math.round((await now())-tCal);
   const date="2026-11-04";
   assert.equal(await page.evaluate(async d=>globalThis.AO_CALENDAR_APP_V1.select(d),date),true);
   await page.waitForFunction(d=>globalThis.AO_RUNTIME_V8?.store?.getState?.()?.selectedDate===d&&
     document.querySelector(".aoTodayV2CalendarInline #ao-calendar-modular-root")?.dataset.aoCalendarPaintDate===d,
     date,{timeout:50000});
   const feast=(await day.locator(".aoCalV2Hero h2").innerText()).trim();
   assert.ok(feast.length>3);
   const action=day.locator("[data-cal-mass]");
   await action.waitFor({state:"visible",timeout:30000});
   await page.screenshot({path:resolve(out,"calendar-day-"+width+".png"),animations:"disabled"});
   // Calendar -> H7 door is a state switch, not a full Home remount.
   // Tag the existing H7 node to detect an accidental expensive re-render.
   await page.evaluate(()=>{
     const screen=document.querySelector(".homeScreen.aoTodayH4.aoH7Screens");
     if(screen)screen.dataset.aoH7DoorNodeProbe="retained";
   });
   const tDoor=await now();await action.click();
   const door=page.locator(".aoH7DoorView:not([hidden])");
   await door.locator("[data-home-h4-begin]").waitFor({state:"visible",timeout:30000});
   const calendarToDoorMs=Math.round((await now())-tDoor);
   assert.equal(await page.locator(".homeScreen.aoTodayH4.aoH7Screens")
     .getAttribute("data-ao-h7-door-node-probe"),"retained",
     "Calendar to Mass door unnecessarily remounted the entire Home view");
   assert.equal(await page.locator('html[data-ao-m1-mass-root="true"]').count(),0,
     "Calendar Day bypassed H7 and opened old M1 preflight");
   assert.equal(await page.evaluate(()=>globalThis.AO_RUNTIME_V8?.store?.getState?.()?.selectedDate),date);
   assert.equal(await page.evaluate(()=>Boolean(globalThis.AO_R17_NATIVE_READER_PREVIEW?.root?.isConnected)),false,
     "Opening the door must not start the reader");
   await page.screenshot({path:resolve(out,"mass-door-"+width+".png"),animations:"disabled"});
   await door.locator("[data-home-h7-back]").click();
   await page.locator(".aoH7HomeView [data-home-h7-enter]").waitFor({state:"visible",timeout:15000});
   await page.locator(".aoH7HomeView [data-home-h7-enter]").click();
   await door.locator("[data-home-h4-begin]").waitFor({state:"visible",timeout:15000});
   await door.locator("[data-home-h7-back]").click();
   requestList.length=0;
   await page.reload({waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(homeReady,null,{timeout:90000});
   const warm={settledMs:Math.round(await now()),requestCount:requestList.length};
   assert.deepEqual(errors,[],"Uncaught browser errors");
   samples.push({width,profile:"headless Chromium 4x CPU, loopback static server",
    cold,fontBoot,calendarOpenMs,calendarToDoorMs,feast,warm,
    targets:{coldSettledMs:1500,startupRequestsBelow:30,calendarToDoorMsBelow:300},
    meets:{cold:cold.settledMs<=1500,requests:cold.requestCount<30,door:calendarToDoorMs<300}});
   console.log("H7_BLUEPRINT_AUDIT "+JSON.stringify(samples.at(-1)));
  }finally{await context.close();}
 }
 await writeFile(resolve(out,"performance-baseline.json"),JSON.stringify({
  note:"CI localhost timing is a reproducible proxy, not a real-user/mobile-network performance certification.",
  samples},null,2)+"\n");
}finally{await browser?.close();await new Promise(ok=>server.close(ok));}
