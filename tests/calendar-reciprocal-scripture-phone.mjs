import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html;charset=utf-8",".js":"text/javascript;charset=utf-8",
 ".mjs":"text/javascript;charset=utf-8",".json":"application/json",
 ".css":"text/css;charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".jpg":"image/jpeg",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message||error));}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
let browser;
try{
 browser=await chromium.launch({headless:true,channel:"chromium"});
 const page=await browser.newPage({viewport:{width:390,height:844},
  deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:"en-GB"});
 const errors=[];page.on("pageerror",error=>errors.push(error.message));
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
  {waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.installed===true&&
   globalThis.AO_CALENDAR_APP_V1?.select&&globalThis.AO_SCRIPTURE_CONTEXT_V1?.open,
   null,{timeout:45000});
 const day="2026-08-02";
 const selected=await page.evaluate(async date=>{
   const shell=globalThis.AO_APP_SHELL_V1;
   const nav=await shell.navigate("calendar");
   if(nav?.ok!==true)return {error:"CALENDAR_ROUTE_UNAVAILABLE",nav};
   const ok=await globalThis.AO_CALENDAR_APP_V1.select(date);
   const state=globalThis.AO_RUNTIME_V8?.store?.getState?.();
   return {ok,date:state?.selectedDate,resolutionDate:state?.resolution?.date,
    properStatus:state?.resolution?.proper?.status,
    path:state?.resolution?.proper?.sourcePath??state?.resolution?.proper?.data?.sourcePath,
    linkSlots:[...document.querySelectorAll("#ao-calendar-modular-root [data-cal-scripture-slot]")]
     .map(x=>x.dataset.calScriptureSlot)};
 },day);
 assert.equal(selected.ok,true,JSON.stringify(selected));
 assert.equal(selected.date,day);
 assert.equal(selected.resolutionDate,day);
 assert.equal(selected.path,"Tempora/Pent10-0",
   "Test must use a source-owned actual 1962 Mass, not a guessed feast");
 assert.ok(selected.linkSlots.includes("GOSPEL"),JSON.stringify(selected));
 const visual=await page.locator("#ao-calendar-modular-root .aoCalV2Hero").evaluate(hero=>{
   const reading=hero.querySelector(".aoCalDayScripture"),
     mass=hero.querySelector("[data-cal-mass]"),
     source=hero.querySelector(".aoCalDaySources");
   const before=(a,b)=>Boolean(a&&b&&(a.compareDocumentPosition(b)&Node.DOCUMENT_POSITION_FOLLOWING));
   return {label:reading?.getAttribute("aria-label"),
     scriptureButtons:reading?.querySelectorAll("[data-cal-scripture-slot]").length,
     slots:[...reading?.querySelectorAll("[data-cal-scripture-slot]")||[]].map(n=>n.dataset.calScriptureSlot),
     readingBeforeMass:before(reading,mass),
     massBeforeSources:before(mass,source),
     sourceCollapsed:source?.open===false,
     printCollapsed:hero.querySelector(".aoCalV2PrintOptions")?.open!==true};
 });
 assert.equal(visual.label,"Appointed readings");
 assert.deepEqual(visual.slots,["EPISTLE_OR_LESSON","GOSPEL"]);
 assert.equal(visual.scriptureButtons,2);
 assert.ok(visual.readingBeforeMass&&visual.massBeforeSources,
   "The Scripture links must follow principal observance and precede technical sources");
 assert.equal(visual.sourceCollapsed,true);
 assert.equal(visual.printCollapsed,true);
 await page.locator("#ao-calendar-modular-root [data-cal-close]").tap();
 await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1.getActive()==="home",null,{timeout:15000});
 assert.equal(await page.evaluate(()=>
   globalThis.AO_SCRIPTURE_CONTEXT_V1.open("Luke 18:9",{language:"en"})),true);
 const scripture=page.locator("#ao-scripture-overlay");
 await scripture.waitFor({state:"visible",timeout:15000});
 const initial=await page.evaluate(()=>({
   title:document.querySelector("#ao-scripture-overlay .aoScriptureReading h3")?.textContent,
   edition:globalThis.AO_SCRIPTURE_APP_V1.status().reader?.editionId
 }));
 assert.match(initial.title,/Luke 18:9/);
 await scripture.locator(".aoScriptureRelated summary").tap();
 const button=scripture.locator('[data-scripture-open-related-object^="calendarReading:"]')
  .filter({hasText:""}).first();
 await button.waitFor({state:"visible",timeout:22000});
 const id=await button.getAttribute("data-scripture-open-related-object");
 assert.ok(id.includes("2026-08-02:GOSPEL:"));
 await button.tap();
 await page.waitForFunction(()=>globalThis.AO_CALENDAR_APP_V1.status().open&&
  globalThis.AO_CALENDAR_APP_V1.status().view==="day"&&
  globalThis.AO_CALENDAR_APP_V1.status().selectedDate==="2026-08-02",
  null,{timeout:22000});
 assert.equal(await scripture.isHidden(),true);
 assert.equal(await page.evaluate(()=>globalThis.AO_SCRIPTURE_APP_V1.status().suspended),true);
 assert.equal(await page.evaluate(()=>document.activeElement?.dataset?.calScriptureSlot),"GOSPEL");
 await page.locator("#ao-calendar-modular-root [data-cal-close]").tap();
 await scripture.waitFor({state:"visible",timeout:22000});
 assert.match(await scripture.locator(".aoScriptureReading h3").innerText(),/Luke 18:9/);
 assert.equal(await page.evaluate(()=>globalThis.AO_SCRIPTURE_APP_V1.status().reader?.editionId),initial.edition);
 await page.waitForFunction(target=>
   document.activeElement?.dataset?.scriptureOpenRelatedObject===target,
   id,{timeout:10000});
 assert.equal(await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.getActive()),"home");
 assert.deepEqual(errors,[]);
 console.log("PASS 390px selected 1962 Mass Gospel → exact Calendar source slot → original Scripture edition, verse and focus");
}finally{
 await browser?.close?.();
 await new Promise(ok=>server.close(ok));
}
