import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+path);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return}
  const data=await readFile(file);
  res.writeHead(200,{"content-type":types[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(data);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const [date,lang] of [["2024-05-06","en"],["2027-05-03","fr"]]){
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
  const page=await context.newPage();
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto("http://127.0.0.1:"+server.address().port+"/tests/fixtures/rogation-premass.html",{waitUntil:"domcontentloaded"});
  await page.evaluate(async({date,lang})=>{
   const m=await import("/src/mass/rogation-preflight.js");
   globalThis.__date=date;globalThis.__lang=lang;
   globalThis.__legacy=()=>({
    canStart:true,date:globalThis.__date,calendarRank:4,properSource:"Tempora/Pasc5-0",
    calendarDay:{id:"feria-rogationum"},requestedCelebrationId:"mass_of_day",celebrationId:"mass_of_day"
   });
   globalThis.__rogation=m.mountRogationPreflight({
    doc:document,getResolvedMass:globalThis.__legacy,
    language:()=>globalThis.__lang
   });
  },{date,lang});
  await page.waitForSelector("[data-ao-rogation-preflight]");
  const ordered=await page.evaluate(()=>{
    const flow=document.querySelector("#ao-mass-flow-v1");
    return [...flow.children].indexOf(flow.querySelector("[data-ao-rogation-preflight]"))<
      [...flow.children].indexOf(flow.querySelector(".aoFlowActions"));
  });
  assert.equal(ordered,true,"Rogation choice must precede the Start Mass action");
  await page.locator("[data-ao-rogation-preflight] summary").click();
  await page.waitForFunction(()=>document.querySelector('[data-rogation-choice] option[value="ROGATION_MASS"]')?.disabled===true);
  const status=await page.locator("[data-rogation-status]").textContent();
  assert.match(status,lang==="fr"?/pas encore certifié/i:/not yet certified/i);
  for(const selector of ["[data-ao-rogation-preflight] summary","[data-rogation-service]","[data-rogation-choice]"]){
   const box=await page.locator(selector).boundingBox();
   assert.ok(box&&box.height>=44,selector+" must have an accessible 44px touch target");
  }
  await page.selectOption("[data-rogation-service]","PUBLIC_PROCESSION");
  const selection=await page.evaluate(()=>globalThis.__rogation.selectionFor(globalThis.__legacy()));
  assert.equal(selection.choice,"DAY_MASS");
  assert.equal(selection.service,"PUBLIC_PROCESSION");
  assert.equal(selection.observanceConfirmed,true);
  assert.equal(selection.dayClass,4);
  assert.equal(await page.locator("[data-rogation-choice]").inputValue(),"DAY_MASS");
  const w=await page.evaluate(()=>document.documentElement.scrollWidth);
  assert.ok(w<=390,"phone UI overflow");
  await page.evaluate(()=>{globalThis.__date="2027-05-10";globalThis.__rogation.refresh()});
  assert.equal(await page.locator("[data-ao-rogation-preflight]").count(),0,"control persisted on unrelated date");
  assert.deepEqual(errors,[]);
  await context.close();
 }
 console.log("Rogation pre-Mass phone EN/FR: PASS — touch selection, unpublished form disabled, explicit procession and date reset.");
}finally{await browser?.close();await new Promise(ok=>server.close(()=>ok()))}
