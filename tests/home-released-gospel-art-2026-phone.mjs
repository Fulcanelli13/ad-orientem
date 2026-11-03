// Source-resolved real Home DOM test, not a fake image gallery.
// Verifies 320/390 phone widths for two specific 1962 dates.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/home-released-gospel-date-qa");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
 ".jpg":"image/jpeg",".png":"image/png",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const bytes=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]??"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e));}
});
await mkdir(out,{recursive:true});
await new Promise((yes,no)=>{server.once("error",no);server.listen(0,"127.0.0.1",yes);});
const origin="http://127.0.0.1:"+server.address().port+"/index.html";
const cases=[
 {date:"2026-03-25",width:390,principal:"sancti:03-25:1:w"},
 {date:"2026-12-16",width:320,principal:"tempora:Adv3-3:2:v"}
];
const results=[];
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const spec of cases){
  const context=await browser.newContext({viewport:{width:spec.width,height:844},
    isMobile:true,hasTouch:true,timezoneId:"Indian/Mauritius",
    serviceWorkers:"block",reducedMotion:"reduce"});
  const page=await context.newPage();
  page.setDefaultTimeout(60000);
  const result={...spec,pass:false};
  try{
   const response=await page.goto(origin+"?aoTodayH4=1",{waitUntil:"domcontentloaded",timeout:90000});
   assert.equal(response?.status(),200);
   await page.waitForFunction(()=>typeof window.AO_RUNTIME_V8?.resolver?.resolveDay==="function"
      && !!window.AO_RUNTIME_V8?.store?.dispatch,null,{timeout:90000});
   // Select through the actual embedded Calendar; direct store dispatch
   // bypasses the Home presentation owner and does not rehydrate C3 art.
   await page.locator(".aoH7HomeView .date[data-home-calendar-view='picker']")
     .waitFor({state:"visible",timeout:45000});
   await page.locator(".aoH7HomeView .date[data-home-calendar-view='picker']").click();
   const dayButton=page.locator(".aoH4CalendarViews [data-home-calendar-view='day']");
   await dayButton.waitFor({state:"visible",timeout:18000});
   await dayButton.click();
   await page.waitForFunction(()=>window.AO_CALENDAR_APP_V1?.status?.().view==="day",
     null,{timeout:18000});
   const selected=await page.evaluate(date=>window.AO_CALENDAR_APP_V1.select(date),spec.date);
   assert.equal(selected,true,"Canonical Calendar refused selected date");
   await page.locator("[data-home-calendar-today]").click();
   await page.waitForFunction(date=>{
     const state=window.AO_RUNTIME_V8?.store?.getState?.();
     return state?.selectedDate===date&&!state.resolving&&state.resolution?.day?.main;
   },spec.date,{timeout:45000});
   const resolved=await page.evaluate(()=>{
     const state=window.AO_RUNTIME_V8.store.getState(),day=state.resolution;
     return {id:day?.day?.main?.id,path:day?.proper?.sourcePath,
       gospel:day?.proper?.data?.gospel?.reference??null};
   });
   assert.equal(resolved.id,spec.principal);
   const img=page.locator('[data-ao-home-art-slot] img[data-ao-released-gospel-date="'+spec.date+'"]');
   await img.waitFor({state:"visible",timeout:60000});
   const imgData=await img.evaluate(image=>({
      src:image.getAttribute("src"),
      alt:image.alt,
      artwork:image.dataset.aoReleasedGospelArtwork,
      loaded:image.complete&&image.naturalWidth>0,
      width:image.naturalWidth,height:image.naturalHeight
   }));
   assert.equal(imgData.src,"/assets/home/c3-approved-met/angelus-frameless.webp");
   assert.equal(imgData.artwork,"met-438724");
   assert.match(imgData.alt,/Champaigne/);
   assert.ok(imgData.loaded,"Released painting bytes must decode in the real Home");
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert.ok(overflow<=1,"Home horizontal overflow at "+spec.width+": "+overflow);
   await page.screenshot({path:resolve(out,spec.date+"-"+spec.width+".png"),animations:"disabled"});
   Object.assign(result,{pass:true,resolved,imgData,overflow});
   console.log("PASS Home "+spec.date+" "+spec.width+"px released Met image decoded");
  }catch(e){result.failure=String(e?.stack??e).slice(0,1100);console.error("FAIL Home "+spec.date+": "+result.failure);}
  finally{results.push(result);await context.close();}
 }
}finally{
 if(browser)await browser.close();
 await new Promise(ok=>server.close(ok));
 await writeFile(resolve(out,"report.json"),JSON.stringify(results,null,2)+"\n");
}
assert.ok(results.length===cases.length&&results.every(x=>x.pass),
 "Exact Gospel date browser QA failed; inspect artifact.");
