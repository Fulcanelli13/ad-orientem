// Production DayResolver, Calendar Day and Home show the SAME observed
// 1962 commemorations. This catches raw source-ID leaks and split rendering.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/p0-calendar-home");
await mkdir(out,{recursive:true});
const mime={".html":"text/html;charset=utf-8",".js":"text/javascript;charset=utf-8",
 ".mjs":"text/javascript;charset=utf-8",".json":"application/json;charset=utf-8",
 ".css":"text/css;charset=utf-8",".svg":"image/svg+xml",
 ".png":"image/png",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message||error))}
});
await new Promise((done,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",done)});
let browser;
const results=[];
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390,430]){
  const page=await browser.newPage({
   viewport:{width,height:width===320?700:width===390?844:932},
   isMobile:true,hasTouch:true,deviceScaleFactor:1,
   locale:"en-GB",reducedMotion:"reduce"
  });
  const errors=[];
  page.on("pageerror",x=>errors.push(String(x.message||x)));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html?aoR17Reader=native",
    {waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForSelector(".homeScreen.aoTodayV2",{state:"visible",timeout:50000});
   await page.locator('.homeScreen .aoTodayV2ReadReflect [data-home-calendar-view="day"]').click();
   const cal=page.locator(".aoTodayV2CalendarInline #ao-calendar-modular-root");
   await cal.waitFor({state:"visible",timeout:45000});
   for(const date of ["2026-01-14","2026-02-24","2026-03-19"]){
    assert.equal(await page.evaluate(async d=>window.AO_CALENDAR_APP_V1?.select?.(d),date),true,
      "Could not select source-independent historic commemoration date");
    await page.waitForFunction(d=>
      window.AO_RUNTIME_V8?.store?.getState?.()?.selectedDate===d &&
      document.querySelector(".aoTodayV2CalendarInline #ao-calendar-modular-root")?.dataset.aoCalendarPaintDate===d &&
      Boolean(document.querySelector(".aoTodayV2CalendarInline .aoCalV2Hero")),date,{timeout:60000});
    await page.waitForFunction(()=>Boolean(document.querySelector(
      ".aoTodayV2CalendarInline .aoCalV2Commemorations p span")),null,{timeout:35000});
    const fromCalendar=await cal.locator(".aoCalV2Commemorations p span").allTextContents();
    assert.ok(fromCalendar.length>0,"No 1962 commemoration on "+date);
    assert.ok(fromCalendar.every(v=>v.trim()&&!/^(sancti|tempora|commune):/.test(v)),
      "Calendar exposes raw source ID on "+date+": "+JSON.stringify(fromCalendar));
    await page.locator(".aoTodayV2Tabs [data-home-calendar-today]").click();
    await page.waitForSelector(".homeScreen.aoTodayV2 .aoTodayV2Honoured .aoTodayV2ObservedRow",
      {state:"visible",timeout:30000});
    const fromHome=await page.locator(
      ".homeScreen.aoTodayV2 .aoTodayV2Honoured .aoTodayV2ObservedRow"
      ).evaluateAll(rows=>rows.filter(x=>x.textContent.includes("1962 Mass commemoration"))
       .map(x=>x.querySelector("strong")?.textContent.trim()).filter(Boolean));
    assert.deepEqual(fromHome,fromCalendar.map(s=>s.trim()),
      "Home and Calendar disagree on actual observed 1962 commemorations for "+date);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    assert.ok(overflow<=1,"Home overflow with 1962 commemorations at "+width+"px: "+overflow);
    if(date==="2026-01-14")
      await page.screenshot({path:resolve(out,"home-1962-commemoration-"+width+".png"),animations:"disabled"});
    results.push({date,width,calendar:fromCalendar,home:fromHome,overflow});
    await page.locator('.aoTodayV2ReadReflect [data-home-calendar-view="day"]').click();
    await cal.waitFor({state:"visible",timeout:45000});
   }
   assert.equal(errors.length,0,"Home/Calendar browser errors: "+errors.slice(0,3).join(" ; "));
   console.log("PASS P0 Home/Calendar historical commemoration parity at "+width+"px, three 1962 dates");
  }finally{await page.close()}
 }
 await writeFile(resolve(out,"home-calendar-parity.json"),JSON.stringify({results},null,2)+"\n");
}finally{await browser?.close();await new Promise(done=>server.close(done))}
