import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {calendarCustomArticle} from "../src/calendar/customs-read-model.js";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const target=resolve(root,"artifacts/customs-two-calendar");
await mkdir(target,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const absolute=resolve(root,"."+pathname);
  if(absolute!==root&&!absolute.startsWith(root+sep)){res.writeHead(403);return res.end("forbidden");}
  const bytes=await readFile(absolute);
  res.writeHead(200,{"content-type":mime[extname(absolute)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message||error));}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
const origin="http://127.0.0.1:"+server.address().port;
const cases=[{date:"2026-01-06",id:"EPIP-003"},{date:"2026-02-02",id:"CRIB-001"}];
const report={schema:"AO_CUSTOMS_TWO_CALENDAR_REAL_BROWSER_V1",status:"incomplete",
 scope:"draft PR #1642 only; no editorial publication approval",cases:[]};
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390]){
  const page=await browser.newPage({viewport:{width,height:844},locale:"en-GB",
   isMobile:true,hasTouch:true,deviceScaleFactor:1});
  const errors=[];page.on("pageerror",error=>errors.push(String(error)));
  try{
   await page.goto(origin+"/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:60000});
   await page.waitForSelector(".homeScreen.aoTodayV2",{state:"visible",timeout:45000});
   await page.waitForFunction(()=>{
    const splash=document.querySelector("#ao-cinema-boot");
    if(splash?.isConnected&&getComputedStyle(splash).display!=="none"&&
       getComputedStyle(splash).visibility!=="hidden"&&splash.getAttribute("aria-hidden")!=="true")return false;
    const state=globalThis.AO_RUNTIME_V8?.store?.getState?.();
    return state?.route==="home"&&!state.resolving&&Boolean(state.resolution?.day?.main);
   },null,{timeout:45000});
   await page.waitForFunction(()=>Boolean(globalThis.AO_CALENDAR_APP_V1?.select&&globalThis.AO_CALENDAR_APP_V1?.setView),null,{timeout:40000});
   await page.locator('.aoTodayV2Tabs [data-home-calendar-view="year"]').click();
   await page.waitForSelector('.aoTodayV2CalendarInline #ao-calendar-modular-root[data-ao-calendar-view="year"]',
    {state:"visible",timeout:45000});
   for(const item of cases){
    assert.equal(await page.evaluate(date=>globalThis.AO_CALENDAR_APP_V1.select(date),item.date),true,
     "Calendar refused "+item.date);
    await page.evaluate(()=>globalThis.AO_CALENDAR_APP_V1.setView("day"));
    const rootLocator=page.locator('#ao-calendar-modular-root[data-ao-calendar-view="day"]');
    await rootLocator.waitFor({state:"visible",timeout:40000});
    const article=rootLocator.locator('[data-cal-custom-id="'+item.id+'"]').first();
    await article.waitFor({state:"attached",timeout:40000});
    const info=calendarCustomArticle(item.id);
    assert.ok(info,"Published-candidate article model missing "+item.id);
    assert.equal(await article.locator("summary").count(),1,"Article lacks in-Calendar disclosure");
    assert.ok((await article.locator("summary").textContent()).includes(info.title.en));
    await article.locator("summary").click();
    assert.equal(await article.evaluate(node=>node.open),true,"Article cannot expand in Calendar");
    const text=await article.textContent();
    assert.ok(text.includes(info.history.en),"Historical attribution absent from Calendar");
    assert.ok(text.includes(info.caution.en),"Pastoral caution absent from Calendar");
    assert.ok(await article.locator('a[href^="https://"]').count()>=2,"Insufficient source links");
    const geometry=await article.evaluate(node=>{
     const box=node.getBoundingClientRect();
     return {left:box.left,right:box.right,width:box.width,viewport:innerWidth,
      pageWidth:document.documentElement.scrollWidth};
    });
    assert.ok(geometry.left>=-1&&geometry.right<=width+1&&geometry.pageWidth<=width+3,
     "Candidate Calendar article overflows: "+JSON.stringify(geometry));
    assert.equal(await rootLocator.locator('[data-cal-custom-id="'+item.id+'"]').count(),2,
     "Expected exactly one date-context and one browse-catalogue copy for "+item.id);
    // The hidden catalogue provides discovery, not a duplicate visible date card.
    // Calendar repaints asynchronously as day data resolves: capture the
    // browser viewport, not a transient DOM node which may be replaced.
    await page.evaluate(id=>{
      const node=document.querySelector('#ao-calendar-modular-root[data-ao-calendar-view="day"] [data-cal-custom-id="'+id+'"]');
      node?.scrollIntoView({block:"start",behavior:"instant"});
    },item.id);
    await page.screenshot({path:resolve(target,item.id.toLowerCase()+"-"+width+".png")});
    report.cases.push({...item,width,geometry,sourceLinks:await article.locator('a[href^="https://"]').count()});
   }
   assert.deepEqual(errors,[],"Uncaught Calendar runtime errors: "+errors.join(" | "));
  }finally{await page.close();}
 }
 assert.equal(report.cases.length,4);
 report.status="browser_passed_editorial_signoff_still_pending";
 await writeFile(resolve(target,"manifest.json"),JSON.stringify(report,null,2)+"\n");
 console.log("PASS candidate Customs in existing Calendar Day: Epiphany + Candlemas at 320/390, exact article, sources, cautions and no overflow");
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(ok=>server.close(ok));
}
