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
 for(const width of [390,320]){
  const page=await browser.newPage({viewport:{width,height:844},isMobile:true,hasTouch:true,locale:"en-GB"});
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
  assert.equal(await page.locator('.aoTodayV2CalendarInline .aoClock').count(),1,"Canonical Liturgical Clock must render within Today");
  assert.equal(await page.locator('.aoTodayV2CalendarInline .aoCalModTop').isVisible(),false,"Today Year must not duplicate its Calendar toolbar");
  assert.equal(await page.locator('.aoTodayV2CalendarInline .aoClockSector').count(),8,"Eight grouped seasonal sectors must be present");
  assert.equal(await page.locator('.aoTodayV2CalendarInline .aoClockCore').count(),1,"The selected liturgical day must remain at the centre");
  // The embedded host briefly swaps the view while its first paint settles.
  // Inspect the *visible* dial rather than a transient detached/hidden frame.
  await page.waitForFunction(()=>{
    const el=document.querySelector(".aoTodayV2CalendarInline .aoClockDial");
    if(!el)return false;
    const rect=el.getBoundingClientRect();
    return rect.width>200&&rect.height>200;
  },null,{timeout:15000});
  const wheel=await page.locator('.aoTodayV2CalendarInline .aoClockDial').evaluate(el=>({
    width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height,
    monthSegments:el.querySelectorAll(".aoClockMonthSegment").length,
    seasons:el.querySelectorAll(".aoClockSector").length
  }));
  console.log("CLOCK_SIZE_DIAGNOSTIC",JSON.stringify({width,wheel,...await page.locator(".aoTodayV2CalendarInline .aoClockDial").evaluate(el=>{const c=getComputedStyle(el),p=el.parentElement;return {styleWidth:c.width,styleHeight:c.height,parentWidth:p?.getBoundingClientRect().width,rootWidth:document.querySelector(".aoTodayV2CalendarInline")?.getBoundingClientRect().width}})}));
  assert.ok(wheel.width>200&&wheel.height>200,"Liturgical Clock must be visible on a phone");
  // Sticky Home navigation must never conceal or overprint the Year heading.
  const visual=await page.evaluate(()=>{
    const heading=document.querySelector(".aoTodayV2CalendarInline .aoClockHeader");
    const tabs=document.querySelector(".aoTodayV2Tabs");
    if(!heading||!tabs)return null;
    const h=heading.getBoundingClientRect(),t=tabs.getBoundingClientRect();
    return {headingHeight:h.height,yearText:heading.textContent.trim(),
      intersects:h.left<t.right&&h.right>t.left&&h.top<t.bottom&&h.bottom>t.top};
  });
  assert.ok(visual&&visual.headingHeight>16&&!visual.intersects,"Year controls must not sit behind Today tabs");
  assert.equal(await page.locator('.aoTodayV2CalendarInline .aoClockSeasonMenu').count(),0,
    "A second visible season navigation is redundant with the eight-sector wheel");

  assert.ok(wheel.monthSegments>=12,"Liturgical Clock must use Advent-to-Advent month geometry");
  await page.screenshot({path:resolve(shots,"today-year-"+width+".png"),fullPage:true});
  await page.locator('.aoTodayV2CalendarInline g[data-cal-clock-season="advent"] path').first().click();
  assert.equal(await page.locator('.aoTodayV2CalendarInline .aoClockDetail').count(),1,
    "Tapping Advent must open a bilingual season detail");
  await page.locator('.aoTodayV2CalendarInline [data-cal-clock-close]').click();
  assert.equal(await page.locator('.aoTodayV2CalendarInline .aoClockDetail').count(),0,
    "Season detail must be dismissible");
  // Keyboard focus must survive the SVG rerender and return to its opener
  // when the floating details close. These are 320/390 px real Chromium tests.
  const adventSector=page.locator('.aoTodayV2CalendarInline g[data-cal-clock-season="advent"]');
  await adventSector.focus();
  await adventSector.press("Enter");
  assert.equal(await page.locator('.aoTodayV2CalendarInline .aoClockDetail').count(),1,
    "Keyboard Enter must open the selected liturgical season");
  assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute("data-cal-clock-season")),"advent",
    "Repainting the Clock must preserve keyboard focus on the selected SVG sector");
  const dismiss=page.locator('.aoTodayV2CalendarInline [data-cal-clock-close]');
  await dismiss.focus();
  await dismiss.press("Enter");
  assert.equal(await page.locator('.aoTodayV2CalendarInline .aoClockDetail').count(),0,
    "Keyboard dismissal must close the floating detail");
  assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute("data-cal-clock-season")),"advent",
    "Closing details must return keyboard focus to the originating sector");
  await adventSector.press("Enter");
  assert.equal(await page.locator('.aoTodayV2CalendarInline .aoClockDetail').count(),1,
    "The selected season must remain keyboard accessible after restoration");
  await page.keyboard.press("Escape");
  assert.equal(await page.locator('.aoTodayV2CalendarInline .aoClockDetail').count(),0,
    "Escape must dismiss the selected season without changing Calendar view");
  assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute("data-cal-clock-season")),"advent",
    "Escape must return keyboard focus to the source season");

  await page.waitForFunction(()=>{
    const home=document.querySelector(".homeScreen.aoTodayV2");
    const slot=home?.querySelector("[data-home-calendar-inline]");
    const dial=slot?.querySelector(".aoClockDial");
    if(!dial)return false;
    const style=getComputedStyle(slot),rect=dial.getBoundingClientRect();
    return home.dataset.aoHomeCalendarView==="year"&&!slot.hidden&&
      style.display!=="none"&&rect.width>200&&rect.height>200;
  },null,{timeout:15000});
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
  assert.equal(await page.locator(".aoTodayV2CalendarInline .aoCalMonthFilter").count(),1,
    "Month must have exactly one filter");
  await page.screenshot({path:resolve(shots,"today-month-"+width+".png"),fullPage:true});
  await page.locator('.aoTodayV2Tabs [data-home-calendar-today]').click();
  await page.waitForSelector(".homeScreen .aoTodayV2Frontispiece",{state:"visible",timeout:15000});
  await page.screenshot({path:resolve(shots,"today-day-"+width+".png"),fullPage:true});
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
  assert.equal(await page.locator('[data-mass-calendar-host] .aoClockDial').count(),1,"Liturgical Clock must render within Mass preparation");
  assert.equal(await page.locator("[data-mass-calendar-host] .aoClockCore").count(),1);
  assert.equal(await page.locator('[data-mass-calendar-host] #ao-calendar-modular-root .aoCalV2Tabs').isVisible(),false,
    "Mass preparation already owns its three Calendar tabs");
  await waitForWeekLoader(page);
  await page.screenshot({path:resolve(shots,"mass-calendar-year-"+width+".png"),fullPage:true});
  await page.locator('[data-mass-calendar-view="picker"]').click();
  await page.waitForSelector('[data-mass-calendar-host] #ao-calendar-modular-root[data-ao-calendar-view="picker"]',{timeout:15000});
  assert.equal(await page.locator("[data-ao-start-live]").count(),1,"Start Mass action must remain available alongside Calendar");
  const native=await page.evaluate(()=>Boolean(globalThis.AO_R17_NATIVE_READER_PREVIEW?.root?.isConnected));
  assert.equal(native,false,"Visiting embedded Calendar must not start or mutate LIVE");
  metrics.push({width,wheelWidth:wheel.width,months:wheel.monthSegments});
  console.log("PASS embedded Calendar on real "+width+"px: Today→Year→Month→Today→Mass→Year→Month; full canonical Calendar, selected Mass untouched");
  await page.close();
 }
  // Tablet and desktop acceptance share the exact canonical Home→Year dial.
  // Do not assume passing the 320/390 phone matrix certifies larger layouts.
  for(const width of [768,1280]){
    const page=await browser.newPage({viewport:{width,height:900},locale:"en-GB"});
    await page.goto("http://127.0.0.1:"+server.address().port+"/index.html?aoR17Reader=native",
      {waitUntil:"domcontentloaded",timeout:60000});
    await page.waitForSelector(".homeScreen.aoTodayV2",{state:"visible",timeout:45000});
    await page.waitForFunction(()=>Boolean(globalThis.AO_APP_SHELL_V1?.installed&&globalThis.AO_CALENDAR_APP_V1?.openEmbedded),
      null,{timeout:40000});
    await page.locator('.aoTodayV2Tabs [data-home-calendar-view="year"]').click();
    await page.waitForSelector('.aoTodayV2CalendarInline .aoClockDial',{state:"visible",timeout:45000});
    const rect=await page.locator('.aoTodayV2CalendarInline .aoClockDial').evaluate(el=>{
      const r=el.getBoundingClientRect(),h=document.querySelector(".aoClockHeader")?.getBoundingClientRect();
      return {left:r.left,right:r.right,width:r.width,height:r.height,headingRight:h?.right??0};
    });
    assert.ok(rect.width>300&&rect.right<=width+3&&rect.left>=-3,
      "The Liturgical Clock must fit the "+width+"px viewport without horizontal clipping");
    assert.ok(rect.headingRight<=width+3,"The Year heading must fit the "+width+"px viewport");
    assert.equal(await page.locator('.aoTodayV2CalendarInline .aoClockSector').count(),8,
      "Tablet/desktop view must preserve eight accessible seasons");
    await page.screenshot({path:resolve(shots,"today-year-"+width+".png"),fullPage:true});
    metrics.push({width,wheelWidth:rect.width,months:await page.locator(".aoClockMonthSegment").count()});
    await page.locator('.aoTodayV2Tabs [data-home-calendar-view="picker"]').click();
    await page.waitForSelector('.aoTodayV2CalendarInline #ao-calendar-modular-root[data-ao-calendar-view="picker"] .aoCalV2Picker',
      {state:"visible",timeout:15000});
    await page.screenshot({path:resolve(shots,"today-month-"+width+".png"),fullPage:true});
    await page.locator('.aoTodayV2Tabs [data-home-calendar-today]').click();
    await page.waitForSelector('.aoTodayV2CalendarInline #ao-calendar-modular-root[data-ao-calendar-view="day"] .aoCalV2Hero',
      {state:"visible",timeout:15000});
    await page.screenshot({path:resolve(shots,"today-day-"+width+".png"),fullPage:true});
    await page.close();
  }
  // French acceptance deliberately uses the same real Calendar owner and day
  // resolver, not a standalone mock of translated strings. The 320px run
  // catches French label expansion that English-only tests cannot detect.
  for(const width of [320,390,1280]){
    const page=await browser.newPage({viewport:{width,height:900},isMobile:width<=390,hasTouch:width<=390,locale:"fr-FR"});
    await page.goto("http://127.0.0.1:"+server.address().port+"/index.html?aoR17Reader=native",
      {waitUntil:"domcontentloaded",timeout:60000});
    await page.waitForSelector(".homeScreen.aoTodayV2",{state:"visible",timeout:45000});
    await page.waitForFunction(()=>Boolean(
      globalThis.AO_RUNTIME_V8?.store?.getState?.()?.resolution?.day?.main
      &&globalThis.AO_APP_SHELL_V1?.installed
      &&globalThis.AO_CALENDAR_APP_V1?.openEmbedded),null,{timeout:45000});
    await page.evaluate(()=>globalThis.AO_RUNTIME_V8.store.dispatch({type:"set-language",language:"fr"}));
    await page.waitForFunction(()=>globalThis.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr",
      null,{timeout:10000});
    await page.waitForFunction(()=>{
      const splash=document.querySelector("#ao-cinema-boot");
      return !splash||!splash.isConnected||getComputedStyle(splash).display==="none"
        ||getComputedStyle(splash).visibility==="hidden"||splash.getAttribute("aria-hidden")==="true";
    },null,{timeout:45000});
    await page.locator('.aoTodayV2Tabs [data-home-calendar-view="year"]').click();
    await page.waitForSelector('.aoTodayV2CalendarInline .aoClockDial',{state:"visible",timeout:45000});
    assert.equal(await page.locator('.aoTodayV2CalendarInline [data-cal-clock-season="advent"]').getAttribute("aria-label"),
      "Avent","French Year wheel sector labels must come from the actual runtime language");
    const wheelBox=await page.locator(".aoTodayV2CalendarInline .aoClockDial").boundingBox();
    assert.ok(wheelBox&&wheelBox.x>=-3&&wheelBox.x+wheelBox.width<=width+3,
      "French Year wheel must not clip horizontally at "+width+"px");
    await page.screenshot({path:resolve(shots,"today-year-fr-"+width+".png"),fullPage:true});
    await page.locator('.aoTodayV2CalendarInline [data-cal-clock-season="advent"] path').first().click();
    assert.match(await page.locator(".aoTodayV2CalendarInline .aoClockDetail").innerText(),
      /TEMPS LITURGIQUE/,"French season disclosure must be translated");
    await page.locator('.aoTodayV2CalendarInline [data-cal-clock-close]').click();
    await page.locator('.aoTodayV2Tabs [data-home-calendar-view="picker"]').click();
    await page.waitForSelector('.aoTodayV2CalendarInline #ao-calendar-modular-root[data-ao-calendar-view="picker"] .aoCalMonthFilter',
      {state:"visible",timeout:15000});
    assert.equal(await page.locator('.aoTodayV2CalendarInline [data-cal-month-filter]').getAttribute("aria-label"),
      "Filtrer les célébrations du mois","French Month control must expose a translated accessible label");
    await page.screenshot({path:resolve(shots,"today-month-fr-"+width+".png"),fullPage:true});
    await page.locator('.aoTodayV2Tabs [data-home-calendar-today]').click();
    await page.waitForSelector(".homeScreen .aoTodayV2Frontispiece",{state:"visible",timeout:15000});
    assert.equal(await page.locator(".homeScreen #ao-calendar-modular-root").count(),0,"Today return must close the embedded Calendar");
    assert.equal(await page.evaluate(()=>globalThis.AO_RUNTIME_V8?.store?.getState?.()?.language),"fr");
    await page.screenshot({path:resolve(shots,"today-day-fr-"+width+".png"),fullPage:true});
    metrics.push({width,language:"fr",views:["year","picker","today"],wheelWidth:wheelBox.width});
    await page.close();
  }
  await writeFile(resolve(shots,"verification.json"),JSON.stringify(metrics,null,2));
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
