import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png"};
const server=http.createServer(async(req,res)=>{
 try{
  const p=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const path=resolve(root,"."+p);
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const bytes=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]??"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}
});
await new Promise((ok,no)=>{server.once("error",no);server.listen(4308,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 // SIMPLE here is deliberately a legacy saved URL/mode migration case.
 for(const startMode of ["SIMPLE","MISSAL","LIVE"]){
  const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
  try{
   const page=await ctx.newPage(),errors=[];
   page.on("pageerror",e=>errors.push(e.message));
   await page.goto("http://127.0.0.1:4308/tests/fixtures/reader-phone-harness.html?production=1&mode="+startMode,
     {waitUntil:"networkidle",timeout:50000});
   await page.waitForFunction(()=>document.documentElement.dataset.harnessReady==="true",null,{timeout:20000});
   const result=await page.evaluate(()=>{
     const a=window.__AO_PHONE_PREVIEW;
     const initial=a.model.totalCards;
     a.setPresentationMode("LIVE");
     const cardNames=a.model.cards.map(x=>x.title);
     const mode=document.querySelector("[data-ao-reader-shell]")?.dataset.mode;
     const target=a.model.cards.find(c=>c.title==="Words of Consecration and Elevation · Host");
     if(target)a.showSequence(target.sequence);
     const visibleTitle=document.querySelector('[data-role="section-title"]')?.textContent?.trim()??"";
     return {initial,after:a.model.totalCards,mode,
       cardNames,visibleTitle,current:a.getCurrentCard()?.title};
   });
   assert.equal(result.mode,"LIVE");
    if(startMode==="SIMPLE")assert.equal(result.initial,65,
      "legacy SIMPLE must immediately enter curated LIVE, not a third mode");
   assert.equal(result.after,65,
     startMode+" -> LIVE fell back to coarse cards: "+JSON.stringify(result));
   for(const title of ["Confiteor of the Celebrant","Te igitur","Hanc igitur",
     "Words of Consecration and Elevation · Host","Words of Consecration and Elevation · Chalice",
     "Final Blessing"]){
     assert.ok(result.cardNames.includes(title),startMode+" missing named prayer "+title);
   }
   assert.equal(result.current,"Words of Consecration and Elevation · Host");
   assert.ok(result.visibleTitle.includes("Host"),"Visible reader title lost after LIVE switch: "+JSON.stringify(result));
   assert.deepEqual(errors,[]);
   console.log("PASS "+startMode+" -> LIVE: 65 named prayer cards, main reader synchronized");
  }finally{await ctx.close()}
 }
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
