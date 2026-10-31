import assert from "node:assert/strict";
import http from "node:http";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {v384Dates} from "../src/calendar/traditional-year-v384.js";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const shots=resolve(root,"artifacts/customs-home-visual");
await mkdir(shots,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const abs=resolve(root,"."+pathname);
  if(abs!==root&&!abs.startsWith(root+sep)){res.writeHead(403);return res.end("forbidden")}
  const content=await readFile(abs);
  res.writeHead(200,{"content-type":mime[extname(abs)]||"application/octet-stream","cache-control":"no-store"});
  res.end(content);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message||error))}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
const cases=[
 {key:"candlemas",date:"2026-02-02",id:"DOM-011"},
 {key:"palm-sunday",date:v384Dates(2026).palm,id:"DOM-013"},
 {key:"all-souls",date:"2026-11-02",id:"DEAD-001"},
];
const report={legacyHomeSnapshot:true,schema:"AO_CUSTOMS_HOME_VISUAL_ACCEPTANCE_20261024_V1",run_date:"2026-10-24",branch_scope:"PR #1631 draft",source:"REAL_BOOTSTRAPPED_HOME_CHROMIUM",language:"en",cases:[],status:"unreviewed_screenshots"};
const origin="http://127.0.0.1:"+server.address().port;
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [390,1280]){
  const page=await browser.newPage({viewport:{width,height:844},isMobile:width<600,hasTouch:width<600,locale:"en-GB",deviceScaleFactor:1});
  const errors=[];
  page.on("pageerror",error=>errors.push(String(error)));
  try{
   await page.goto(origin+"/index.html?aoR17Reader=native&aoTodayH4=0",{waitUntil:"domcontentloaded",timeout:60000});
   await page.waitForSelector(".homeScreen.aoTodayV2",{state:"visible",timeout:45000});
   await page.waitForFunction(()=>{
    const splash=document.querySelector("#ao-cinema-boot");
    if(splash?.isConnected&&getComputedStyle(splash).display!=="none"
      &&getComputedStyle(splash).visibility!=="hidden"
      &&splash.getAttribute("aria-hidden")!=="true")return false;
    const st=globalThis.AO_RUNTIME_V8?.store?.getState?.();
    return st?.route==="home"&&!st.resolving&&Boolean(st.resolution?.day?.main);
   },null,{timeout:45000});
   await page.waitForFunction(()=>Boolean(globalThis.AO_CALENDAR_APP_V1?.openEmbedded&&globalThis.AO_APP_SHELL_V1?.installed),null,{timeout:40000});
   for(const item of cases){
    await page.locator('.aoTodayV2Tabs [data-home-calendar-view="year"]').click();
    await page.waitForSelector('.aoTodayV2CalendarInline #ao-calendar-modular-root[data-ao-calendar-view="year"]',{state:"visible",timeout:45000});
    const result=await page.evaluate(date=>globalThis.AO_CALENDAR_APP_V1.select(date),item.date);
    assert.equal(result,true,"Calendar refused source date "+item.date);
    await page.locator('[data-home-calendar-today]').click();
    await page.waitForFunction(date=>{
      const st=globalThis.AO_RUNTIME_V8?.store?.getState?.();
      return st?.route==="home"&&st.selectedDate===date&&!st.resolving&&Boolean(st.resolution?.day?.main);
    },item.date,{timeout:35000});
    const spotlight=page.locator('.homeScreen [data-home-custom-spotlight="'+item.id+'"]');
    await spotlight.waitFor({state:"visible",timeout:25000});
    assert.equal(await spotlight.count(),1,"Home must feature exactly one tradition");
    assert.equal(await page.locator('.homeScreen [data-home-custom-spotlight]').count(),1,"Home must not stack custom cards");
    assert.equal(await spotlight.getAttribute("data-home-custom-date"),item.date);
    assert.equal(await page.locator('.homeScreen #ao-calendar-modular-root').count(),0,"Home should not preserve an embedded calendar");
    const before=await spotlight.evaluate(node=>{
      const b=node.getBoundingClientRect(),vw=window.innerWidth,cs=getComputedStyle(node);
      const pageWidth=document.documentElement.scrollWidth;
      return {width:b.width,left:b.left,right:b.right,viewport:vw,pageWidth,display:cs.display,
        title:node.querySelector("h2")?.textContent?.trim()||"",summary:node.querySelector(":scope > p")?.textContent?.trim()||"",
        sourceCount:node.querySelectorAll(".aoTodayV2CustomReading a[href]").length,
        summaryClamp:getComputedStyle(node.querySelector(".aoTodayV2CustomSummary")).webkitLineClamp};
    });
    assert.ok(before.title.length>7,"Custom title missing");
    assert.ok(before.summary.length>30,"Source-derived description missing");
    assert.ok(before.sourceCount>=1,"Sourced editorial reader has no citation links");
    assert.equal(before.summaryClamp,"3","Closed Home teaser is too long and crowds the page");
    assert.ok(before.left>=-1&&before.right<=width+1,"Custom card clips horizontally: "+JSON.stringify(before));
    await spotlight.screenshot({path:resolve(shots,item.key+"-"+width+"-collapsed.png")});
    const details=spotlight.locator("details.aoTodayV2CustomDetails");
    await details.locator(":scope > summary").click();
    assert.equal(await details.evaluate(node=>node.open),true,"Source reader refused to expand");
    const more=await details.evaluate(node=>{
      const b=node.getBoundingClientRect();
      const card=node.closest(".aoTodayV2CustomSpotlight");
      const lum=rgb=>{
        const vals=(getComputedStyle(rgb).color.match(/\d+(?:\.\d+)?/g)||[]).slice(0,3).map(Number);
        const channels=vals.map(v=>{const n=v/255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4});
        return .2126*channels[0]+.7152*channels[1]+.0722*channels[2];
      };
      const background=.2126*(8/255/12.92)+.7152*(12/255/12.92)+.0722*(18/255/12.92);
      const contrast=el=>{const fg=lum(el);return (Math.max(fg,background)+.05)/(Math.min(fg,background)+.05)};
      const sources=[...node.querySelectorAll("a[href]")];
      const calendar=card.querySelector(".aoTodayV2CustomCalendarLink");
      return {height:b.height,width:b.width,left:b.left,right:b.right,sourceCount:node.querySelectorAll("a[href]").length,
        history:node.textContent.includes("History"),practice:node.textContent.includes("Traditional practice"),meaning:node.textContent.includes("Meaning"),
        sourceContrast:Math.min(...sources.map(contrast)),calendarContrast:contrast(calendar),
        expandedSummaryClamp:getComputedStyle(card.querySelector(".aoTodayV2CustomSummary")).webkitLineClamp};
    });
    assert.ok(more.history&&more.practice&&more.meaning,"Detailed custom lacks authored teaching sections");
    assert.ok(more.sourceCount>=1,"Expanded custom omitted source citations");
    assert.ok(more.sourceContrast>=4.5&&more.calendarContrast>=4.5,"Link contrast too low on "+item.date+": "+JSON.stringify(more));
    assert.equal(more.expandedSummaryClamp,"none","Open folio must restore full source introduction");
    assert.ok(more.left>=-1&&more.right<=width+1,"Expanded article clips on device width");
    assert.equal(await spotlight.locator('button[data-home-calendar][data-home-calendar-view="day"][data-home-calendar-date="'+item.date+'"]').count(),1);
    await spotlight.screenshot({path:resolve(shots,item.key+"-"+width+"-expanded.png")});
    await page.screenshot({path:resolve(shots,item.key+"-"+width+"-home.png"),fullPage:true});
    report.cases.push({key:item.key,date:item.date,id:item.id,width,before,expanded:more,captured:true});
    await details.locator(":scope > summary").click();
   }
   assert.equal(errors.length,0,"Runtime errors during Home visual capture: "+errors.join(" | "));
  }finally{await page.close();}
 }
 assert.equal(report.cases.length,6);
 report.status="captured_pending_editorial_visual_signoff";
 await writeFile(resolve(shots,"manifest.json"),JSON.stringify(report,null,2)+"\n");
 console.log("PASS six real Home Customs visual acceptance cases: Candlemas, Palm Sunday, All Souls at 390/1280; sourced card, detail, chronology, overflow and single-card checks.");
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(ok=>server.close(ok));
}