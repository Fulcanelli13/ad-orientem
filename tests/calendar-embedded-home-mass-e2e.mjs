import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const shots=resolve(root,"artifacts/calendar-convergence");
await mkdir(shots,{recursive:true});
const metrics=[];
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("forbidden")}
  res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream","cache-control":"no-store"});
  res.end(await readFile(path));
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message||error))}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
async function waitForWeekLoader(page){
 await page.waitForFunction(()=>{
   const el=document.getElementById("ao-cinema-loader");
   if(!el)return true;
   const cs=getComputedStyle(el);
   return !el.classList.contains("aoCinemaLoaderOn")||el.getAttribute("aria-hidden")==="true"||
     cs.display==="none"||cs.visibility==="hidden";
 },null,{timeout:25000});
 await page.waitForTimeout(180);
}
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [390,320,1280]){
  const page=await browser.newPage({viewport:{width,height:844},isMobile:width<600,hasTouch:width<600,locale:"en-GB"});
  await page.goto("http://127.0.0.1:"+server.address().port+"/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:60000});
  await page.waitForSelector(".homeScreen.aoTodayV2",{state:"visible",timeout:45000});
  // Do not visually certify a Home that is still behind the cinematic splash.
  await page.waitForFunction(()=>{
    const splash=document.querySelector("#ao-cinema-boot");
    if(splash&&splash.isConnected&&getComputedStyle(splash).display!=="none"
      &&getComputedStyle(splash).visibility!=="hidden"
      &&splash.getAttribute("aria-hidden")!=="true")return false;
    const state=globalThis.AO_RUNTIME_V8?.store?.getState?.();
    return state?.route==="home"&&!state.resolving&&Boolean(state.resolution?.day?.main);
  },null,{timeout:45000});
  await page.waitForTimeout(850);

  await page.waitForFunction(()=>Boolean(globalThis.AO_APP_SHELL_V1?.installed&&globalThis.AO_CALENDAR_APP_V1?.openEmbedded),null,{timeout:40000});
  assert.equal(await page.locator(".homeScreen .aoTodayV2Frontispiece").count(),1);
  await page.screenshot({path:resolve(shots,"today-"+width+".png"),fullPage:true});
  await page.locator('.aoTodayV2Tabs [data-home-calendar-view="year"]').click();
  await page.waitForSelector('.aoTodayV2CalendarInline #ao-calendar-modular-root[data-ao-calendar-view="year"]',{state:"visible",timeout:45000});
  assert.equal(await page.locator('.aoTodayV2CalendarInline .aoCalV2Ring').count(),1,"The canonical 1962 year wheel must appear inside Today");
  assert.equal(await page.locator('.aoTodayV2CalendarInline .aoClockDial').count(),0,
    "Embedded Today must not repeat the full-year clock");
  assert.equal(await page.locator('.aoTodayV2CalendarInline .aoCalV2Coming').count(),0,
    "Embedded Today must not repeat Coming next");
  assert.equal(await page.locator(".aoTodayV2CalendarInline .aoCalYearDailyTrack").count(),1,"A separate daily-colour track must survive Calendar embedding");
  const wheel=await page.locator('.aoTodayV2CalendarInline .aoCalV2Ring').evaluate(el=>({
    verified:Number(el.dataset.verifiedDays),gradient:el.style.getPropertyValue("--year-daily-gradient"),
    season:el.style.getPropertyValue("--year-season-gradient")
  }));
  assert.match(wheel.gradient,/conic-gradient/,"Daily wheel must be sourced from real 1962 dates");
  assert.match(wheel.season,/conic-gradient/,"Inner seasons must remain independent from daily Mass colours");

  await page.waitForFunction(()=>{
    const home=document.querySelector(".homeScreen.aoTodayV2");
    const slot=home?.querySelector("[data-home-calendar-inline]");
    const wheel=slot?.querySelector(".aoCalV2Ring");
    const timeline=slot?.querySelector(".aoCalYearTrack");
    if(!wheel||!timeline)return false;
    const style=getComputedStyle(slot),wr=wheel.getBoundingClientRect(),tr=timeline.getBoundingClientRect();
    return home.dataset.aoHomeCalendarView==="year"&&!slot.hidden&&
      style.display!=="none"&&wr.width>90&&wr.height>90&&tr.width>120&&tr.height>25;
  },null,{timeout:15000}).catch(async error=>{
    console.log("YEAR_VISUAL_DIAGNOSTIC",JSON.stringify(await page.evaluate(()=>{
      const h=document.querySelector(".homeScreen.aoTodayV2"),slot=h?.querySelector("[data-home-calendar-inline]");
      const root=slot?.querySelector("#ao-calendar-modular-root");
      const child=root?.querySelector(".aoCalV2Ring"),track=root?.querySelector(".aoCalYearTrack");
      const data=node=>node?({outer:node.outerHTML.slice(0,300),rect:node.getBoundingClientRect().toJSON(),display:getComputedStyle(node).display}):null;
      return {homeView:h?.dataset.aoHomeCalendarView,tabs:[...h?.querySelectorAll(".aoTodayV2Tabs button")||[]].map(n=>({text:n.textContent,active:n.getAttribute("aria-current")})),
        slot:data(slot),root:data(root),wheel:data(child),timeline:data(track),calendarStatus:globalThis.AO_CALENDAR_APP_V1?.status?.()};
    })));
    throw error;
  });
  assert.equal(await page.locator('.aoTodayV2CalendarInline .aoCalYearTrack').count(),1,"The canonical liturgical-year timeline must be retained");
  assert.equal(await page.locator('.aoTodayV2CalendarInline #ao-calendar-modular-root .aoCalV2Tabs').isVisible(),false,
    "Embedded Calendar must not repeat the host Day/Month/Year tabs");
  await waitForWeekLoader(page);
  if(await page.locator(".aoTodayExploreFoot").isVisible()){
    console.log("FOOTER_LAYOUT_DIAGNOSTIC",JSON.stringify(await page.evaluate(()=>{
      const foot=document.querySelector(".aoTodayExploreFoot");
      const home=document.querySelector(".homeScreen.aoTodayV2");
      const trail=[];let node=foot;
      while(node&&trail.length<8){trail.push({tag:node.tagName,cls:node.className,display:getComputedStyle(node).display,hidden:node.hidden});node=node.parentElement}
      return {view:home?.dataset.aoHomeCalendarView,rootContains:home?.contains(foot),trail,
        inlineVisible:Boolean(home?.querySelector("[data-home-calendar-inline] #ao-calendar-modular-root")),
        footStyle:getComputedStyle(foot).display,stylesheetCount:document.querySelectorAll("[data-ao-today-v2-style]").length};
    })));
  }
  assert.equal(await page.locator(".aoTodayExploreFoot").isVisible(),false,
    "Old Today editorials must be hidden while viewing the Calendar");
  await page.screenshot({path:resolve(shots,"today-year-"+width+".png"),fullPage:true});
  assert.equal(await page.locator('#ao-calendar-modular-root[aria-modal="true"]').count(),0,"Embedded calendar cannot be an independent modal");
  assert.equal(await page.locator('.aoTodayV2CalendarInline [data-cal-body]').count(),1);
  await page.locator('.aoTodayV2Tabs [data-home-calendar-view="picker"]').click();
  await page.waitForSelector('.aoTodayV2CalendarInline #ao-calendar-modular-root[data-ao-calendar-view="picker"]',{timeout:15000});
  await page.waitForFunction(()=>{
    const host=document.querySelector(".aoTodayV2CalendarInline");
    const cal=host?.querySelector("#ao-calendar-modular-root");
    return cal?.dataset.aoCalendarView==="picker"&&Boolean(cal.querySelector("[data-cal-body]"));
  },null,{timeout:12000});
  assert.equal(await page.locator('.aoTodayV2CalendarInline #ao-calendar-modular-root [data-cal-body]').count(),1,
    "Canonical Month content missing");
  await page.locator('[data-home-calendar-today]').click();
  await page.waitForSelector(".homeScreen .aoTodayV2Frontispiece",{state:"visible",timeout:15000});
  assert.equal(await page.locator(".homeScreen #ao-calendar-modular-root").count(),0,"Returning to Today should close the embedded Calendar");
  const follow=page.locator('.homeScreen [data-home-mass-entry]');
  assert.equal(await follow.count(),1,"Follow Mass must remain distinct from Resume Mass");
  await follow.click();
  await page.waitForSelector("[data-ao-full-mass-preflight]",{state:"visible",timeout:20000});
  assert.equal(await page.locator("[data-mass-calendar-context]").count(),1,"Calendar/selected Mass context missing");
  assert.ok(await page.locator("[data-full-mass-category]").count()>=5);
  await page.screenshot({path:resolve(shots,"mass-preflight-"+width+".png"),fullPage:true});
  assert.equal(await page.locator("[data-full-mass-reader-mode]").count(),3);
  await page.locator("[data-mass-calendar-details] > summary").click();
  await page.locator('[data-mass-calendar-view="year"]').click();
  await page.waitForSelector('[data-mass-calendar-host] #ao-calendar-modular-root[data-ao-calendar-view="year"]',{state:"visible",timeout:45000});
  assert.equal(await page.locator('[data-mass-calendar-host] .aoCalV2Ring').count(),1,"Calendar year must render within Mass preparation");
  assert.equal(await page.locator('[data-mass-calendar-host] .aoClockDial').count(),0,
    "Mass preflight must not repeat the full-year clock");
  assert.equal(await page.locator("[data-mass-calendar-host] .aoCalYearDailyTrack").count(),1);
  assert.equal(await page.locator('[data-mass-calendar-host] #ao-calendar-modular-root .aoCalV2Tabs').isVisible(),false,
    "Mass preparation already owns its three Calendar tabs");
  await waitForWeekLoader(page);
  await page.screenshot({path:resolve(shots,"mass-calendar-year-"+width+".png"),fullPage:true});
  await page.locator('[data-mass-calendar-view="picker"]').click();
  await page.waitForSelector('[data-mass-calendar-host] #ao-calendar-modular-root[data-ao-calendar-view="picker"]',{timeout:15000});
  assert.equal(await page.locator("[data-ao-start-live]").count(),1,"Start Mass action must remain available alongside Calendar");
  const native=await page.evaluate(()=>Boolean(globalThis.AO_R17_NATIVE_READER_PREVIEW?.root?.isConnected));
  assert.equal(native,false,"Visiting embedded Calendar must not start or mutate LIVE");
  metrics.push({width,verifiedDays:wheel.verified});
  console.log("PASS embedded Calendar on real "+width+"px: Today→Year→Month→Today→Mass→Year→Month; full canonical Calendar, selected Mass untouched");
  await page.close();
 }
  await writeFile(resolve(shots,"verification.json"),JSON.stringify(metrics,null,2));
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
