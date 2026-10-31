import assert from "node:assert/strict";
import http from "node:http";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {v384Dates} from "../src/calendar/traditional-year-v384.js";
import {homeSeasonalCustomForDate} from "../src/customs/seasonal-home-spotlight.js";
import {calendarCustomArticle} from "../src/calendar/customs-read-model.js";

// The approved H4 Home has a compact Customs link in "This week", not the
// retired v2 three-tab Calendar or an expanded inline Customs article.
// Test the real Home -> embedded source-owned Calendar handoff instead.
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const shots=resolve(root,"artifacts/customs-home-visual");
await mkdir(shots,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".json":"application/json; charset=utf-8",".mjs":"text/javascript; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const abs=resolve(root,"."+pathname);
  if(abs!==root&&!abs.startsWith(root+sep)){res.writeHead(403);return res.end("forbidden")}
  const data=await readFile(abs);
  res.writeHead(200,{"content-type":mime[extname(abs)]||"application/octet-stream",
   "cache-control":"no-store"});res.end(data);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message||error))}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
const cases=[
 {key:"candlemas",date:"2026-02-02",id:"DOM-011"},
 {key:"palm-sunday",date:v384Dates(2026).palm,id:"DOM-013"},
 {key:"all-souls",date:"2026-11-02",id:"DEAD-001"},
];
const report={schema:"AO_CUSTOMS_H4_HOME_CALENDAR_VISUAL_ACCEPTANCE_V2",
 run_date:"2026-10-31",branch_scope:"H4 production visual contract",
 source:"REAL_BOOTSTRAPPED_HOME_AND_CALENDAR_CHROMIUM",language:"en",
 cases:[],status:"unreviewed_screenshots"};
const origin="http://127.0.0.1:"+server.address().port;
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [390,1280]){
  const page=await browser.newPage({viewport:{width,height:844},
   isMobile:width<600,hasTouch:width<600,locale:"en-GB",deviceScaleFactor:1});
  const errors=[];
  page.on("pageerror",error=>errors.push(String(error)));
  try{
   await page.goto(origin+"/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:60000});
   await page.waitForSelector(".homeScreen.aoTodayH4",{state:"visible",timeout:45000});
   await page.waitForFunction(()=>{
    const splash=document.querySelector("#ao-cinema-boot");
    if(splash?.isConnected&&getComputedStyle(splash).display!=="none"&&
      getComputedStyle(splash).visibility!=="hidden"&&
      splash.getAttribute("aria-hidden")!=="true")return false;
    const st=globalThis.AO_RUNTIME_V8?.store?.getState?.();
    return st?.route==="home"&&!st.resolving&&Boolean(st.resolution?.day?.main);
   },null,{timeout:45000});
   await page.waitForFunction(()=>Boolean(globalThis.AO_CALENDAR_APP_V1?.openEmbedded&&
    globalThis.AO_APP_SHELL_V1?.installed),null,{timeout:40000});
   assert.equal(await page.locator(".homeScreen .aoTodayV2Tabs").count(),0,
    "H4 must not regress to retired multi-tab Home");
   assert.equal(await page.locator(".homeScreen .aoH4DateOpen[data-home-calendar-view='picker']").count(),1);
   assert.equal(await page.locator(".homeScreen [data-home-dyk-open]").count(),1,
    "H4 Discovery component must remain present after Customs changes");
   for(const item of cases){
    const editorial=homeSeasonalCustomForDate(item.date);
    const article=calendarCustomArticle(item.id);
    assert.ok(editorial&&article&&editorial.id===item.id&&editorial.article===article,
      "Date-specific Customs selection must use the published canonical article: "+item.date);
    assert.ok(article.sources?.length>=1,"Cannot surface an unsourced Customs article");
    assert.ok(article.title?.en?.length>6&&article.title?.fr?.length>6);
    await page.locator(".homeScreen .aoH4DateOpen[data-home-calendar-view='picker']").click();
    await page.waitForSelector(".homeScreen .aoH4CalendarInline #ao-calendar-modular-root",
      {state:"visible",timeout:45000});
    const selected=await page.evaluate(date=>globalThis.AO_CALENDAR_APP_V1.select(date,{closeAfter:false}),item.date);
    assert.equal(selected,true,"Calendar refused date "+item.date);
    await page.locator(".homeScreen .aoH4CalendarBack [data-home-calendar-today]").click();
    await page.waitForFunction(date=>{
      const state=globalThis.AO_RUNTIME_V8?.store?.getState?.();
      return state?.route==="home"&&state.selectedDate===date&&!state.resolving&&
        Boolean(state.resolution?.day?.main)&&
        Boolean(document.querySelector(".homeScreen.aoTodayH4 .aoH4Custom"));
    },item.date,{timeout:45000});
    const custom=page.locator(".homeScreen .aoH4Custom");
    assert.equal(await custom.count(),1,"H4 must show exactly one selected Customs teaser");
    assert.equal(await custom.getAttribute("data-home-calendar-date"),item.date);
    assert.equal(await custom.getAttribute("data-home-calendar-view"),"day");
    assert.equal(await custom.locator("strong").innerText(),article.title.en,
      "Home Customs must derive its title from the same published Calendar owner");
    assert.equal(await page.locator(".homeScreen .aoTodayV2CustomSpotlight").count(),0,
      "Do not reintroduce retired expanded Customs panel into approved H4");
    const bounds=await custom.evaluate(el=>{
      const b=el.getBoundingClientRect();
      return {left:b.left,right:b.right,width:b.width,viewport:innerWidth,
       docWidth:document.documentElement.scrollWidth,
       title:el.querySelector("strong")?.textContent?.trim()||"",
       caption:el.querySelector("small")?.textContent?.trim()||""};
    });
    assert.ok(bounds.left>=-1&&bounds.right<=width+1&&bounds.docWidth<=width+1,
      "H4 Customs teaser clips at "+width+": "+JSON.stringify(bounds));
    assert.ok(bounds.title.length>6&&bounds.caption.length>2);
    await custom.screenshot({path:resolve(shots,item.key+"-"+width+"-teaser.png")});
    await page.screenshot({path:resolve(shots,item.key+"-"+width+"-home.png"),fullPage:true});
    await custom.click();
    await page.waitForSelector(".homeScreen .aoH4CalendarInline #ao-calendar-modular-root",
      {state:"visible",timeout:45000});
    await page.waitForFunction(date=>{
      const root=document.querySelector(".homeScreen #ao-calendar-modular-root");
      const state=globalThis.AO_RUNTIME_V8?.store?.getState?.();
      return Boolean(root)&&state?.selectedDate===date;
    },item.date,{timeout:45000});
    const canonicalCustom=page.locator(".homeScreen #ao-calendar-modular-root .aoCalCustomArticle[data-cal-custom-id='"+item.id+"']");
    await canonicalCustom.waitFor({state:"visible",timeout:45000});
    assert.equal(await canonicalCustom.count(),1,
      "Calendar must show the exact published Customs article from H4");
    await canonicalCustom.locator(":scope > summary").click();
    const sourceLinks=canonicalCustom.locator(".aoCalCustomArticleContent a[href]");
    assert.ok(await sourceLinks.count()>=article.sources.length,
      "Calendar must show actual source citations from the published article");
    const external=await sourceLinks.first().getAttribute("href");
    assert.ok(/^https:\/\//.test(external),"Customs evidence link must be an actual HTTPS source");
    await page.screenshot({path:resolve(shots,item.key+"-"+width+"-calendar.png"),fullPage:true});
    report.cases.push({key:item.key,date:item.date,id:item.id,width,
      teaser:bounds,sourceCount:await sourceLinks.count(),
      exactCalendarCustomsArticle:true,sourceBacked:true,captured:true});
    await page.locator(".homeScreen .aoH4CalendarBack [data-home-calendar-today]").click();
    await page.waitForSelector(".homeScreen .aoH4Custom",{state:"visible"});
   }
   assert.deepEqual(errors,[],"Runtime errors in H4 Customs acceptance at "+width);
  }finally{await page.close()}
 }
 assert.equal(report.cases.length,6);
 report.status="captured_pending_editorial_visual_signoff";
 await writeFile(resolve(shots,"manifest.json"),JSON.stringify(report,null,2)+"\n");
 console.log("PASS six real H4 Home -> Calendar Customs cases: dates, source-backed titles, exact day article and citations, 390/1280px, no retired UI");
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(ok=>server.close(ok));
}
