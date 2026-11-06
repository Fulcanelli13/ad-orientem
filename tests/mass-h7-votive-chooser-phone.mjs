import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

// Regressions were caused by burying the canonical votive selector under H7.
// Exercise the actual Home -> H7 door -> source-owned Mass catalogue route.
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",
 ".svg":"image/svg+xml",".webp":"image/webp",".png":"image/png",".jpg":"image/jpeg"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const bytes=await readFile(path);res.writeHead(200,{"content-type":mime[extname(path)]??"application/octet-stream","cache-control":"no-store"});res.end(bytes);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message??error));}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [390,320]){
  const page=await browser.newPage({viewport:{width,height:844},isMobile:true,hasTouch:true});
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html?aoMassAccessM1=1&aoR17Reader=native",
     {waitUntil:"domcontentloaded",timeout:60000});
   const enter=page.locator(".homeScreen.aoTodayH4 [data-home-h7-enter]");
   await enter.waitFor({state:"visible",timeout:30000});
   await enter.click();
   const choose=page.locator(".aoH7DoorView:not([hidden]) [data-home-mass-choose-celebration]");
   await choose.waitFor({state:"visible",timeout:12000});
   assert.match(await choose.textContent(),/Votive|votive/);
   await choose.click();
   const category=page.locator('[data-full-mass-category="VOTIVE"]');
   await category.waitFor({state:"visible",timeout:22000});
   const source=await page.evaluate(()=>{
    const api=globalThis.AO_R17_BROWSER_ENTRY;
    const s=api?.status?.()?.fullMassPreflight;
    const buttons=[...document.querySelectorAll('[data-full-mass-category]')]
       .filter(n=>n.getClientRects().length>0);
    return {step:s?.step,focus:s?.m1Focus,labels:buttons.map(n=>n.dataset.fullMassCategory),
      readerPresent:!!globalThis.AO_R17_NATIVE_READER_PREVIEW?.root?.isConnected};
   });
   assert.equal(source.step,"celebration","H7 route must focus the existing source selection");
   assert.equal(source.focus,"mass");
   assert.ok(source.labels.includes("CALENDAR")&&source.labels.includes("VOTIVE")&&
     source.labels.includes("REQUIEM")&&source.labels.includes("NUPTIAL"),JSON.stringify(source));
   assert.equal(source.readerPresent,false,"Choosing a Mass may not start the reader");
   await category.click();
   await page.waitForFunction(()=>{
    const stage=String(globalThis.AO_CELEBRATION_ARCH_V1?.stage??"").toLowerCase();
    return stage==="votive"&&
      document.querySelectorAll('[data-ao-mass-catalogue-choice]').length>0;
   },null,{timeout:20000});
   const options=await page.evaluate(()=>{
    const elements=[...document.querySelectorAll('[data-ao-mass-catalogue-choice]')];
    return elements.map(x=>({id:x.dataset.aoMassCatalogueChoice,text:x.textContent.trim(),
      disabled:x.disabled,visible:x.getClientRects().length>0}));
   });
   assert.ok(options.length>=2,"Source-owned specific votive options must be accessible");
   assert.ok(options.some(x=>x.visible&&x.text),"Votive options are still hidden: "+JSON.stringify(options));
   assert.ok(options.every(x=>x.id),"Each visible votive requires a source-owned identifier");
   console.log("PASS H7 "+width+"px Mass of day / Votive / Requiem / Nuptial chooser and specific votive catalogue",options.length);
  }finally{await page.close();}
 }
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
