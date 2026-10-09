import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const MIME={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{try{const p=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname),file=resolve(root,"."+p);if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}const d=await readFile(file);res.writeHead(200,{"content-type":MIME[extname(file)]||"application/octet-stream","cache-control":"no-store"});res.end(d)}catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e.message||e))}});
await new Promise((ok,no)=>{server.once("error",no);server.listen(4223,"127.0.0.1",ok)});
const out={};
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,serviceWorkers:"block"});
 await page.goto("http://127.0.0.1:4223/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.()?.visibleOwner===true,null,{timeout:20000});
 const home=async()=>{await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("home"));await page.waitForTimeout(90)};
 const section=async(route)=>{await home();const result=await page.evaluate(route=>globalThis.AO_APP_SHELL_V1.navigate(route),route);await page.waitForTimeout(150);return result};
 await section("calendar");
 await page.waitForFunction(()=>globalThis.AO_CALENDAR_APP_V1?.status?.()?.resolutionDate==="2026-10-09",null,{timeout:18000}).catch(()=>{});
 const clickCal=async(sel)=>{
  const before=await page.evaluate(()=>({view:globalThis.AO_CALENDAR_APP_V1.status().view,root:document.querySelector("#ao-calendar-modular-root")?.innerText?.slice(0,140)}));
  await page.locator(sel).first().click({timeout:5000});
  await page.waitForTimeout(350);
  const after=await page.evaluate(()=>({view:globalThis.AO_CALENDAR_APP_V1.status().view,root:document.querySelector("#ao-calendar-modular-root")?.innerText?.slice(0,140)}));
  return {before,after};
 };
 out.calendarYear=await clickCal("[data-cal-view='year']");
 out.calendarMonth=await clickCal("[data-cal-view='picker']");
 out.calendarMajor=await clickCal("[data-cal-month-view='major']");
 out.calendarSanctorale=await clickCal("[data-cal-month-view='sanctorale']");
 await clickCal("[data-cal-view='day']");
 out.calendarSaint=await page.locator("[data-cal-saint-date]").count();
 if(out.calendarSaint){
   const before=await page.evaluate(()=>({saint:!!document.querySelector("#ao-saint-detail-root"),nav:globalThis.AO_APP_SHELL_V1.getActive()}));
   await page.locator("[data-cal-saint-date]").first().click({timeout:5000});
   await page.waitForTimeout(500);
   const after=await page.evaluate(()=>({saintRoots:[...document.querySelectorAll("[id*=saint],[id*=Saint]")].filter(x=>x.getClientRects().length).map(x=>x.id).slice(0,8),nav:globalThis.AO_APP_SHELL_V1.getActive(),text:document.body.innerText.slice(-150)}));
   out.calendarSaint={before,after};
 }
 const learn=await section("learn");
 await page.evaluate(()=>globalThis.AO_LEARN_APP_V1.openModule("learn.sexual_ethics"));
 await page.waitForSelector("#ao-sexual-ethics-root",{state:"visible",timeout:12000});
 const walk=async(attr)=>{
  let q=page.locator("#ao-sexual-ethics-root ["+attr+"]").first();
  const n=await q.count();
  if(n)await q.click({timeout:6000});
  return n;
 };
 out.sexualEthics={family:await walk("data-ao-cse-family"),dossier:await walk("data-ao-cse-dossier"),question:await walk("data-ao-cse-question")};
 out.sexualEthics.detail=await page.evaluate(()=>{
  const r=document.querySelector("#ao-sexual-ethics-root");
  const links=[...r.querySelectorAll(".aoCSEInlineRef,a[href]")];
  const paragraphs=[...r.querySelectorAll("main p")];
  return {title:r.querySelector("h1")?.innerText,paras:paragraphs.map(x=>({words:x.innerText.split(/\s+/).length,refs:x.querySelectorAll("a[href]").length,size:getComputedStyle(x).fontSize})).slice(0,18),
   links:links.map(x=>({text:x.innerText.slice(0,80),href:x.href,hasFragment:Boolean(new URL(x.href).hash)})).slice(0,25),
   totalLinks:links.length,
   nonDeepLinks:links.filter(x=>!new URL(x.href).hash).length
  };
 });
 await section("learn");
 await page.evaluate(()=>globalThis.AO_LEARN_APP_V1.openModule("learn.spiritual_life"));
 await page.waitForSelector("#ao-spiritual-life-root",{state:"visible",timeout:10000});
 const firstLesson=page.locator("#ao-spiritual-life-root [data-ao-sl-lesson]").first();
 if(await firstLesson.count())await firstLesson.click();
 await page.waitForTimeout(100);
 out.spiritualDetail=await page.evaluate(()=>{const r=document.querySelector("#ao-spiritual-life-root");return {heading:r?.querySelector("h1")?.innerText,links:r?.querySelectorAll("a[href]").length,sourceText:(r?.innerText||"").slice(-450),paragraphSizes:[...r.querySelectorAll("main p")].slice(0,15).map(p=>getComputedStyle(p).fontSize)}});
 await home();
 const scriptBtn=page.locator("[data-home-scripture]");
 if(await scriptBtn.count()){
  await scriptBtn.first().click({timeout:6000});
  await page.waitForTimeout(500);
  out.scripture={active:await page.evaluate(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()),visible:await page.evaluate(()=>[...document.querySelectorAll("[id*=scripture],[id*=Scripture]")].filter(x=>x.getClientRects().length).map(x=>x.id).slice(0,15))};
 }
 console.log("UX_DETAIL_RESULT="+JSON.stringify(out));
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
