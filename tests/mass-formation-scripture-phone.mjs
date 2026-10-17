import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(request,response)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(request.url,"http://127.0.0.1").pathname));
  if(file!==root&&!file.startsWith(root+sep)){response.writeHead(403);response.end("forbidden");return;}
  const bytes=await readFile(file);
  response.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream","cache-control":"no-store"});
  response.end(bytes);
 }catch(error){response.writeHead(error?.code==="ENOENT"?404:500);response.end(String(error.message??error));}
});
await new Promise((resolveStart,rejectStart)=>{server.once("error",rejectStart);server.listen(0,"127.0.0.1",resolveStart);});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390,430]){
  const page=await browser.newPage({viewport:{width,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,serviceWorkers:"block"});
  const errors=[];page.on("pageerror",error=>errors.push(String(error.message??error)));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.()?.visibleOwner===true,null,{timeout:45000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("learn"))).ok,true);
   const opened=await page.evaluate(()=>globalThis.AO_LEARN_APP_V1.openModule("learn.mass",{stageId:"MF06"}));
   assert.equal(opened,true,"Canonical learn.mass launch failed");
   const lesson=page.locator("#ao-mass-formation-root");
   await lesson.waitFor({state:"visible",timeout:15000});
   await lesson.locator('[data-ao-mass-formation-anchor="MFS11"]').waitFor({state:"visible",timeout:9000});
   assert.equal(await lesson.locator(".aoMFBibleItem [data-ao-scripture-context]").count(),4,
     "MF06 must show four independent studied passages");
   const originalClaims=await lesson.locator(".aoMFClaim").count();
   assert.equal(originalClaims,3,"Published bilingual Mass explanations were replaced");
   const origin=lesson.locator('[data-ao-mass-formation-anchor="MFS11"]');
   assert.equal(await origin.getAttribute("data-ao-scripture-context"),"Genesis 14:18–20");
   const size=await origin.evaluate(el=>({h:el.getBoundingClientRect().height,overflow:document.documentElement.scrollWidth-innerWidth}));
   assert.ok(size.h>=44&&size.overflow<=2,"Mass study source button does not fit phone "+width);
   await origin.tap();
   const scripture=page.locator("#ao-scripture-overlay");
   await scripture.waitFor({state:"visible",timeout:9000});
   assert.match(await scripture.locator(".aoScriptureReading h3").innerText(),/Genesis 14:18/);
   await scripture.locator(".aoScriptureVerse").first().waitFor({state:"visible",timeout:12000});
   assert.equal(await scripture.locator('[data-scripture-witness-unreviewed="dr-challoner"]').count(),1);
   await scripture.locator('[data-scripture-context-depth="chapter"]').tap();
   assert.ok(await scripture.locator(".aoScriptureVerse").count()>15,"Cannot expand to full original Bible chapter");
   await scripture.locator('[data-scripture-close]').tap();
   assert.equal(await page.evaluate(()=>globalThis.AO_MASS_FORMATION_V1?.status?.()?.stageId),"MF06",
     "Close must return to the very same Formation lesson");
   assert.equal(await lesson.locator(".aoMFClaim").count(),originalClaims,
     "The Bible reader mutated source-backed lesson content");
   assert.equal(await origin.evaluate(el=>el===document.activeElement),true,
     "Return must restore focus to the triggering Mass Formation passage");
   assert.deepEqual(errors.filter(e=>/TypeError|SyntaxError|ReferenceError/.test(e)),[],
     "Mass study handoff raised runtime errors");
   console.log("PASS "+width+"px learn.mass MF06 → Genesis passage → full chapter → original lesson");
  }finally{await page.close();}
 }
}finally{await browser?.close();await new Promise(resolveClose=>server.close(resolveClose));}
