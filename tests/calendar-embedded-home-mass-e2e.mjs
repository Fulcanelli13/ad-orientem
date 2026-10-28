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
  if(width>=700){
    const layout=await page.locator(".homeScreen .aoTodayV2Frontispiece").evaluate(hero=>{
      const art=hero.querySelector(".aoTodayV2Art"),mass=hero.querySelector(".aoTodayV2PrimaryMass");
      return {noArt:hero.classList.contains("aoTodayV2ArtMissing"),
        artHeight:art?.getBoundingClientRect().height,
        massBottom:mass?.getBoundingClientRect().bottom,viewport:innerHeight};
    });
    if(layout.noArt){
      assert.ok(layout.artHeight<=215,"No approved art must not leave an empty desktop billboard: "+JSON.stringify(layout));
      assert.ok(layout.massBottom<layout.viewport-40,"Mass CTA should appear above the desktop fold: "+JSON.stringify(layout));
    }
  }
  await page.screenshot({path:resolve(shots,"today-"+width+".png"),fullPage:true});
  await page.locator('.aoTodayV2Tabs [data-home-calendar-view="year"]').click();
  await page.waitForSelector('.aoTodayV2CalendarInline #ao-calendar-modular-root[data-ao-calendar-view="year"]',{state:"visible",timeout:45000});
  assert.equal(await page.locator('.aoTodayV2CalendarInline .aoClockDial').count(),1,
    "Home Liturgical Year must show the interactive Clock");
  assert.equal(await page.locator('.aoTodayV2CalendarInline .aoCalV2Ring').count(),0,
    "Legacy mini-wheel must not obscure the Clock in Home");
  assert.equal(await page.locator('.aoTodayV2CalendarInline .aoCalV2Coming').count(),0,
    "Embedded Today must not repeat Coming next");
  assert.equal(await page.locator(".aoTodayV2CalendarInline .aoCalYearDailyTrack").count(),0,"Home Year must not repeat the thin outer day-colour ring");
  const wheel=await page.locator('.aoTodayV2CalendarInline .aoClockDial').evaluate(el=>({
    verified:Number(el.dataset.verifiedDays),gradient:el.style.getPropertyValue("--ao-clock-daily-gradient"),
    seasons:el.querySelectorAll("[data-cal-clock-season]").length
  }));
  assert.match(wheel.gradient,/conic-gradient/,"Clock daily colour must be sourced from real 1962 dates");
  assert.ok(wheel.seasons>=8,"Interactive Clock must retain all season controls");

  await page.waitForFunction(()=>{
    const home=document.querySelector(".homeScreen.aoTodayV2");
    const slot=home?.querySelector("[data-home-calendar-inline]");
    const wheel=slot?.querySelector(".aoClockDial");
    if(!wheel)return false;
    const style=getComputedStyle(slot),wr=wheel.getBoundingClientRect();
    return home.dataset.aoHomeCalendarView==="year"&&!slot.hidden&&
      style.display!=="none"&&wr.width>90&&wr.height>90;
  },null,{timeout:15000}).catch(async error=>{
    console.log("YEAR_VISUAL_DIAGNOSTIC",JSON.stringify(await page.evaluate(()=>{
      const h=document.querySelector(".homeScreen.aoTodayV2"),slot=h?.querySelector("[data-home-calendar-inline]");
      const root=slot?.querySelector("#ao-calendar-modular-root");
      const child=root?.querySelector(".aoClockDial"),track=root?.querySelector(".aoClockContext");
      const data=node=>node?({outer:node.outerHTML.slice(0,300),rect:node.getBoundingClientRect().toJSON(),display:getComputedStyle(node).display}):null;
      return {homeView:h?.dataset.aoHomeCalendarView,tabs:[...h?.querySelectorAll(".aoTodayV2Tabs button")||[]].map(n=>({text:n.textContent,active:n.getAttribute("aria-current")})),
        slot:data(slot),root:data(root),wheel:data(child),timeline:data(track),calendarStatus:globalThis.AO_CALENDAR_APP_V1?.status?.()};
    })));
    throw error;
  });
  await page.locator('.aoTodayV2CalendarInline [data-cal-clock-season="lent"]').click();
  await page.locator('.aoTodayV2CalendarInline .aoClockDetail').waitFor({state:"visible",timeout:12000});
  await page.locator('.aoTodayV2CalendarInline [data-cal-clock-close]').click();
  assert.equal(await page.locator('.aoTodayV2CalendarInline .aoClockDetail').count(),0);
  assert.equal(await page.locator('.aoTodayV2CalendarInline .aoCalYearTrack').count(),0,
    "Home Year must not duplicate Clock with a second timeline");
  assert.equal(await page.locator('.aoTodayV2CalendarInline .aoCalYearSeason').count(),0,
    "Home Year must not stack eleven redundant seasonal cards");
  assert.equal(await page.locator('.aoTodayV2CalendarInline .aoClockContext').count(),1,
    "One contextual season summary should replace the duplicated journey");
  const feastIndex=page.locator('.aoTodayV2CalendarInline .aoClockFeastMenu');
  // A resolved commemoration may already open the feast menu.
  if(!(await feastIndex.evaluate(node=>node.open)))
    await feastIndex.locator(':scope > summary').click();
  await feastIndex.locator('button[data-cal-clock-feast="2026-11-01"]').waitFor({state:"visible",timeout:12000});
  await feastIndex.locator('button[data-cal-clock-feast="2026-11-02"]').waitFor({state:"visible",timeout:12000});
  if(await feastIndex.evaluate(node=>node.open))
    await feastIndex.locator(':scope > summary').click();
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
  const originalHomeDate=await page.evaluate(()=>globalThis.AO_RUNTIME_V8?.store?.getState?.()?.selectedDate);
  const selectedFuture="2032-10-09";
  assert.equal(await page.evaluate(async date=>globalThis.AO_CALENDAR_APP_V1.select(date),
    selectedFuture),true,"Future 2032 Calendar date failed to resolve");
  assert.equal(await page.evaluate(()=>globalThis.AO_RUNTIME_V8.store.getState().selectedDate),
    selectedFuture);
  await page.locator('[data-home-calendar-today]').click();
  await page.waitForSelector(".homeScreen .aoTodayV2Frontispiece",{state:"visible",timeout:15000});
  const futureHome=page.locator('.homeScreen [data-home-selected-day="'+selectedFuture+'"]');
  await futureHome.waitFor({state:"visible",timeout:20000});
  assert.match(await futureHome.textContent(),/not today/i,
    "Selected future day must not be silently represented as Today");
  assert.match(await page.locator(".homeScreen [data-home-mass-entry]").textContent(),
    /Open Mass for selected day/,"Mass preparation must label a selected historical/future date honestly");
  assert.match(await page.locator(".homeScreen .aoTodayV2Tabs [data-home-calendar-today]").textContent(),
    /Selected day/);
  assert.ok(await page.locator(".homeScreen #ao-calendar-modular-root").count()===0,
    "Closing Calendar should retain the selected day without leaving its overlay open");
  await futureHome.locator("[data-home-restore-today]").click();
  await page.waitForFunction(date=>{
    const state=globalThis.AO_RUNTIME_V8?.store?.getState?.();
    return state?.selectedDate===date&&!state.resolving&&state.resolution?.day?.main;
  },originalHomeDate,{timeout:35000});
  assert.equal(await page.locator(".homeScreen [data-home-selected-day]").count(),0);
  assert.match(await page.locator(".homeScreen [data-home-mass-entry]").textContent(),
    /Open today’s Mass/);
  await page.waitForSelector(".homeScreen .aoTodayV2Frontispiece",{state:"visible",timeout:15000});
  assert.equal(await page.locator(".homeScreen #ao-calendar-modular-root").count(),0,"Returning to Today should close the embedded Calendar");
  const follow=page.locator('.homeScreen [data-home-mass-entry]');
  assert.equal(await follow.count(),1,"Follow Mass must remain distinct from Resume Mass");
  await follow.click();
  await page.waitForSelector("[data-ao-full-mass-preflight]",{state:"visible",timeout:20000});
  assert.equal(await page.locator("[data-mass-calendar-context]").count(),1,"Calendar/selected Mass context missing");
  assert.ok(await page.locator("[data-full-mass-category]").count()>=5);
  await page.screenshot({path:resolve(shots,"mass-preflight-"+width+".png"),fullPage:true});
  assert.equal(await page.locator("[data-full-mass-reader-mode]").count(),2);
  // A commemoration can auto-open the outer Calendar context.
  // An unconditional click would close it and hide the nested Calendar control.
  const outerCalendar=page.locator("[data-folio-calendar-details]");
  if(!(await outerCalendar.evaluate(node=>node.open))){
    await page.locator("[data-folio-calendar-details] > summary").click();
  }
  assert.equal(await outerCalendar.evaluate(node=>node.open),true,
    "Liturgical context must be open before expanding the inner Calendar");
  const innerCalendar=page.locator("[data-mass-calendar-details]");
  if(!(await innerCalendar.evaluate(node=>node.open))){
    await page.locator("[data-mass-calendar-details] > summary").click();
  }
  assert.equal(await innerCalendar.evaluate(node=>node.open),true,
    "Nested Mass Calendar must be open before changing views");
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
