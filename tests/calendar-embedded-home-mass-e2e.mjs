import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
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
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [390,320]){
  const page=await browser.newPage({viewport:{width,height:844},isMobile:true,hasTouch:true,locale:"en-GB"});
  await page.goto("http://127.0.0.1:"+server.address().port+"/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:60000});
  await page.waitForSelector(".homeScreen.aoTodayV2",{state:"visible",timeout:45000});
  await page.waitForFunction(()=>Boolean(globalThis.AO_APP_SHELL_V1?.installed&&globalThis.AO_CALENDAR_APP_V1?.openEmbedded),null,{timeout:40000});
  assert.equal(await page.locator(".homeScreen .aoTodayV2Frontispiece").count(),1);
  await page.locator('.aoTodayV2Tabs [data-home-calendar-view="year"]').click();
  await page.waitForSelector('.aoTodayV2CalendarInline #ao-calendar-modular-root[data-ao-calendar-view="year"]',{state:"visible",timeout:45000});
  assert.equal(await page.locator('.aoTodayV2CalendarInline .aoCalV2Ring').count(),1,"The canonical 1962 year wheel must appear inside Today");
  assert.equal(await page.locator('.aoTodayV2CalendarInline .aoCalYearTrack').count(),1,"The canonical liturgical-year timeline must be retained");
  assert.equal(await page.locator('#ao-calendar-modular-root[aria-modal="true"]').count(),0,"Embedded calendar cannot be an independent modal");
  assert.equal(await page.locator('.aoTodayV2CalendarInline [data-cal-body]').count(),1);
  await page.locator('.aoTodayV2Tabs [data-home-calendar-view="picker"]').click();
  await page.waitForSelector('.aoTodayV2CalendarInline #ao-calendar-modular-root[data-ao-calendar-view="picker"]',{timeout:15000});
  assert.ok(await page.locator('.aoTodayV2CalendarInline [data-cal-body]').count()>0,"Canonical Month content missing");
  await page.locator('[data-home-calendar-today]').click();
  await page.waitForSelector(".homeScreen .aoTodayV2Frontispiece",{state:"visible",timeout:15000});
  assert.equal(await page.locator(".homeScreen #ao-calendar-modular-root").count(),0,"Returning to Today should close the embedded Calendar");
  const follow=page.locator('.homeScreen [data-home-mass-entry]');
  assert.equal(await follow.count(),1,"Follow Mass must remain distinct from Resume Mass");
  await follow.click();
  await page.waitForSelector("[data-ao-full-mass-preflight]",{state:"visible",timeout:20000});
  assert.equal(await page.locator("[data-mass-calendar-context]").count(),1,"Calendar/selected Mass context missing");
  assert.ok(await page.locator("[data-full-mass-category]").count()>=5);
  assert.equal(await page.locator("[data-full-mass-reader-mode]").count(),3);
  await page.locator("[data-mass-calendar-details] > summary").click();
  await page.locator('[data-mass-calendar-view="year"]').click();
  await page.waitForSelector('[data-mass-calendar-host] #ao-calendar-modular-root[data-ao-calendar-view="year"]',{state:"visible",timeout:45000});
  assert.equal(await page.locator('[data-mass-calendar-host] .aoCalV2Ring').count(),1,"Calendar year must render within Mass preparation");
  await page.locator('[data-mass-calendar-view="picker"]').click();
  await page.waitForSelector('[data-mass-calendar-host] #ao-calendar-modular-root[data-ao-calendar-view="picker"]',{timeout:15000});
  assert.equal(await page.locator("[data-ao-start-live]").count(),1,"Start Mass action must remain available alongside Calendar");
  const native=await page.evaluate(()=>Boolean(globalThis.AO_R17_NATIVE_READER_PREVIEW?.root?.isConnected));
  assert.equal(native,false,"Visiting embedded Calendar must not start or mutate LIVE");
  console.log("PASS embedded Calendar on real "+width+"px: Today→Year→Month→Today→Mass→Year→Month; full canonical Calendar, selected Mass untouched");
  await page.close();
 }
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
