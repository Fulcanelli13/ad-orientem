// Production acceptance of original Solesmes facsimiles in the existing
// Schola Music Plan; this is NOT approval of source GABC or parish singing.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",
 ".svg":"image/svg+xml",".png":"image/png"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end()}
  const bytes=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream",
   "cache-control":"no-store"});res.end(bytes);
 }catch(err){res.writeHead(err?.code==="ENOENT"?404:500);res.end(String(err?.message||err))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
const base="http://127.0.0.1:"+server.address().port+"/tests/fixtures/reader-phone-harness.html";
const transparent=Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=","base64");
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [390,320]){
  const ctx=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,
   serviceWorkers:"block"});
  try{
   const page=await ctx.newPage(),errors=[];
   page.on("pageerror",e=>errors.push(e.message));
   await page.route(/^https:\/\/gregobase\.selapa\.net\/sources\/2\/\d+\.png$/,r=>
    r.fulfill({status:200,contentType:"image/png",body:transparent}));
   await page.goto(base+"?mode=LIVE",{waitUntil:"domcontentloaded",timeout:60000});
   await page.waitForFunction(()=>document.documentElement.dataset.harnessReady==="true",null,{timeout:45000});
   const plan=page.locator("[data-schola-local-panel]");
   await plan.waitFor({state:"attached"});
   // The native programme is deliberately collapsed until opened by user.
   await plan.locator("summary").first().click();
   await page.waitForFunction(()=>document.querySelector(
    '[data-schola-kyriale-choice="KYRIE"]')?.options.length>3,null,{timeout:30000});
   const selector=page.locator('[data-schola-kyriale-choice="KYRIE"]');
   const panel=page.locator('[data-schola-original-score="KYRIE"]');
   assert.equal(await panel.isVisible(),false,"Unselected local setting must expose no printed source");
   await selector.selectOption("MASS_08");
   await panel.waitFor({state:"visible",timeout:30000});
   await panel.locator("[data-schola-original-toggle]").click();
   assert.equal(await panel.locator("img").count(),2);
   assert.match(await panel.locator("img").nth(0).getAttribute("src"),/\/905\.png$/);
   assert.match(await panel.locator("img").nth(1).getAttribute("src"),/\/906\.png$/);
   assert.match(await panel.locator("[data-schola-original-pdf]").getAttribute("href"),/kyriale-solesmes\.pdf#page=30/);
   assert.match(await panel.innerText(),/not a certified GABC transcription/);
   await selector.selectOption("MASS_11");
   await page.waitForFunction(()=>document.querySelector(
    '[data-schola-original-score="KYRIE"] img')?.getAttribute("src")?.endsWith("/915.png"),
    null,{timeout:20000});
   assert.equal(await panel.locator("img").count(),2);
   await selector.selectOption("CUSTOM");
   assert.equal(await panel.isVisible(),false,"Custom title must have no inherited Kyrie source");
   assert.equal(await panel.locator("[data-schola-original-content]").isVisible(),false,
    "Switching to custom closes old print");
   const gloria=page.locator('[data-schola-kyriale-choice="GLORIA"]');
   await gloria.selectOption("MASS_08");
   const gloriaPanel=page.locator('[data-schola-original-score="GLORIA"]');
   await gloriaPanel.waitFor({state:"visible",timeout:20000});
   await gloriaPanel.locator("[data-schola-original-toggle]").click();
   assert.equal(await gloriaPanel.locator("img").count(),2);
   assert.match(await gloriaPanel.locator("img").nth(0).getAttribute("src"),/\/906\.png$/);
   await page.locator('[data-schola-kyriale-choice="CREDO"]').selectOption("CREDO_03");
   const credoPanel=page.locator('[data-schola-original-score="CREDO"]');
   await credoPanel.waitFor({state:"visible",timeout:20000});
   await credoPanel.locator("[data-schola-original-toggle]").click();
   assert.equal(await credoPanel.locator("img").count(),3);
   assert.match(await credoPanel.locator("img").nth(2).getAttribute("src"),/\/943\.png$/);
   assert.equal(await page.locator("[data-ao-reader-shell]").evaluate(node=>
    node.getBoundingClientRect().width<=window.innerWidth+1),true);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),true);
   assert.deepEqual(errors,[],"No Schola facsimile UI exception");
   console.log("PASS M29 "+width+"px LIVE: exact original 1961 page references for explicit Kyrie/Gloria/Credo setting, no custom setting leakage, no width overflow");
  }finally{await ctx.close()}
 }
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
