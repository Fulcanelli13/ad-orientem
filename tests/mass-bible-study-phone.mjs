import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,"http://127.0.0.1"),file=resolve(root,"."+decodeURIComponent(url.pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("Forbidden");return;}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e));}
});
await new Promise((ok,no)=>{server.once("error",no);server.listen(4278,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,locale:"en-GB"});
 const page=await context.newPage(),errors=[];
 page.on("pageerror",e=>errors.push(String(e?.message??e)));
 await page.goto("http://127.0.0.1:4278/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 const opened=await page.evaluate(async()=>{
   const m=await import("/src/learn/mass-formation.js");
   window.__massBibleTest=m.createMassFormationRuntime(window);
   return await window.__massBibleTest.open();
 });
 assert.equal(opened,true);
 const base="#ao-mass-formation-root";
 await page.locator(base+' [data-ao-mf-open-bible]').waitFor({state:"visible",timeout:15000});
 assert.equal(await page.locator(base+' [data-ao-mf-stage]').count(),8,"original eight formation stages still available");
 await page.locator(base+' [data-ao-mf-open-bible]').tap();
 await page.waitForFunction(()=>globalThis.__massBibleTest?.status?.().bibleRows===26,null,{timeout:15000});
 assert.equal(await page.locator(base+' [data-ao-mass-bible-row]').count(),26);
 assert.match(await page.locator(base+' [data-ao-mass-bible-study]').innerText(),/source-linked research preview/i);
 assert.equal(await page.locator(base+' [data-ao-mass-bible-row="MB18"]').count(),1);
 assert.equal(await page.locator(base+' [data-ao-mass-bible-row="MB24"]').count(),1);
 await page.locator(base+' [data-ao-mf-bible-filter-select]').selectOption("names");
 assert.equal(await page.locator(base+' [data-ao-mass-bible-row]').count(),3);
 await page.locator(base+' [data-ao-mf-bible-filter-select]').selectOption("all");
 await page.locator(base+' [data-ao-mf-bible-stage]').selectOption("COMMUNION");
 assert.ok(await page.locator(base+' [data-ao-mass-bible-row]').count()>=4);
 await page.locator(base+' [data-ao-mf-bible-stage]').selectOption("");
 const dir=resolve(root,"test-output/mass-bible-source");
 await mkdir(dir,{recursive:true});
 async function capture(name){
  for(const width of [320,390,768]){
   await page.setViewportSize({width,height:844});
   await page.waitForTimeout(170);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert.ok(overflow<=1,name+" produces document overflow at "+width+"px: "+overflow);
   await page.screenshot({path:resolve(dir,name+"-"+width+".png"),animations:"disabled"});
  }
  await page.setViewportSize({width:390,height:844});
 }
 await capture("bible-mass-connections");
 await page.locator(base+' [data-ao-mf-back]').tap();
 await page.locator(base+' [data-ao-mf-open-propers]').tap();
 await page.waitForFunction(()=>globalThis.__massBibleTest?.status?.().witnessedPropers===105,null,{timeout:15000});
 assert.equal(await page.locator(base+' .aoFNav').count(),0,"Proper lookup must not have redundant formation section ribbon");
 assert.equal(await page.locator(base+' [data-ao-mf-bible-proper] option').count(),105);
 await page.locator(base+' [data-ao-mf-bible-proper]').selectOption("Tempora/Pent10-0");
 await page.waitForFunction(()=>globalThis.__massBibleTest?.status?.().properPath==="Tempora/Pent10-0",null,{timeout:15000});
 assert.match(await page.locator(base+' [data-ao-mass-bible-propers]').innerText(),/Luke 18:9–14/);
 assert.match(await page.locator(base+' [data-ao-mass-bible-propers]').innerText(),/Scitis quoniam/);
 await capture("1962-proper-witness");
 await page.locator(base+' [data-ao-mf-back]').tap();
 await page.locator(base+' [data-ao-mf-stage="MF06"]').tap();
 assert.match(await page.locator(base+' .aoMFStage h1').innerText(),/another Calvary/i);
 assert.equal(await page.locator(base+' [data-ao-mf-prev]').count(),1);
 assert.equal(errors.length,0,errors.join(" | "));
 console.log("PASS Mass Bible phone: 26 source-typed links, 105 Proper witness options, stage/genre filters, original 8-stage formation and responsive screenshots");
 await context.close();
}finally{await browser?.close().catch(()=>{});await new Promise(ok=>server.close(ok))}
