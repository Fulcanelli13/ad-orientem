import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/rosary-methods-phone");
await mkdir(out,{recursive:true});
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":types[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e?.message||e));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390,430]){
  const page=await browser.newPage({viewport:{width,height:width===320?700:width===390?844:932},
   isMobile:true,hasTouch:true,locale:"en-GB",deviceScaleFactor:1,reducedMotion:"reduce",serviceWorkers:"block"});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
     {waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>window.AO_APP_SHELL_V1?.status?.().visibleOwner===true,null,{timeout:45000});
   const nav=await page.evaluate(()=>window.AO_APP_SHELL_V1.navigate("pray"));
   assert.equal(nav?.ok,true,"Prayer destination did not open");
   // Rosary Methods is an internal route of the canonical Prayer donor, not
   // an AO_MODULES public route. Exercise the real installed presentation owner.
   const launch=await page.evaluate(()=>window.AO_PRAY_V435930?.open?.("pray.rosary_methods"));
   assert.equal(launch,true,"Canonical Prayer Rosary Methods screen unavailable");
   const chooser=page.locator('#aoPray435930 [data-ao-rosary-chooser]');
   await chooser.waitFor({state:"visible",timeout:15000});
   const first=await chooser.evaluate(root=>{
    const b=root.querySelector("[data-p435930-rosary-begin]");
    const panel=root.querySelector("#ao-rosary-chooser-options");
    const toggle=root.querySelector("[data-p435930-rosary-customize]");
    const source=document.querySelector("#aoPray435930 .aoPrayerBookSources .aoRosarySourceCurrent a");
    const sourcesClosed=!!source&&!source.closest(".aoPrayerBookSources").open;
    const box=b.getBoundingClientRect(),outer=root.getBoundingClientRect();
    return {begins:root.querySelectorAll("[data-p435930-rosary-begin]").length,
      label:b.textContent.trim(),buttonHeight:box.height,
      relativeY:box.top-outer.top,
      panelHidden:panel.hidden,options:panel.querySelectorAll("[data-p435930-rosary-choose]").length,
      toggleHeight:toggle.getBoundingClientRect().height,toggleExpanded:toggle.getAttribute("aria-expanded"),
      sourceHref:source?.href,sourcesClosed,overflow:document.documentElement.scrollWidth-innerWidth};
   });
   assert.equal(first.begins,1,"More than one Rosary start button");
   assert.equal(first.panelHidden,true,"Complex Rosary options must not obstruct first prayer");
   assert.equal(first.toggleExpanded,"false");
   assert.ok(first.buttonHeight>=52&&first.toggleHeight>=44,"Rosary phone controls undersized");
   assert.ok(first.relativeY<360,"Begin prayer buried below method controls: "+JSON.stringify(first));
   assert.equal(first.options,5,"Rosary historical methods removed or duplicated");
   assert.ok(first.sourceHref?.startsWith("https://")&&first.sourcesClosed,
    "Method provenance must remain reachable inside Aa without appearing in the Rosary body");
   assert.ok(first.overflow<=1,"Rosary chooser overflow");
   await page.screenshot({path:resolve(out,"rosary-prayer-first-"+width+".png"),
     fullPage:false,animations:"disabled"});

   const toggle=chooser.locator("[data-p435930-rosary-customize]");
   await toggle.click();
   assert.equal(await toggle.getAttribute("aria-expanded"),"true");
   const panel=chooser.locator("#ao-rosary-chooser-options");
   assert.equal(await panel.isVisible(),true);
   assert.equal(await panel.locator("[data-p435930-rosary-choose]").count(),5);
   assert.equal(await panel.locator("[data-p435930-rosary-decades]").count(),2);
   assert.equal(await panel.locator("[data-p435930-rosary-guidance]").count(),2);
   await panel.locator('[data-p435930-rosary-decades="15"]').click();
   assert.match(await chooser.locator(".aoRosaryReadyChoice").textContent(),/Fifteen decades/);
   assert.equal(await toggle.getAttribute("aria-expanded"),"true","Option panel closed after changing length");
   assert.equal(await page.evaluate(()=>document.activeElement?.dataset?.p435930RosaryDecades),"15",
     "Focus lost after changing Rosary length");
   await panel.locator('[data-p435930-rosary-choose="scriptural"]').click();
   assert.match(await chooser.locator(".aoRosaryReadyChoice").textContent(),/Five decades.*Guided/);
   assert.equal(await panel.locator('[data-p435930-rosary-guidance="simple"]').isDisabled(),true,
     "Scriptural method must retain its guided-only constraint");
   await panel.locator('[data-p435930-rosary-choose="montfort"]').click();
   assert.match(await chooser.locator(".aoRosaryReady h2").textContent(),/Montfort/);
   assert.match(await chooser.locator(".aoRosarySourceCurrent").textContent(),/Adapted devotional wording/);
   assert.equal(await page.evaluate(()=>document.activeElement?.dataset?.p435930RosaryChoose),"montfort");
   await page.screenshot({path:resolve(out,"rosary-methods-open-"+width+".png"),
     fullPage:false,animations:"disabled"});

   await panel.locator('[data-p435930-rosary-choose="ordinary"]').click();
   await panel.locator('[data-p435930-rosary-guidance="simple"]').click();
   await toggle.click();
   assert.equal(await panel.isVisible(),false);
   await chooser.locator("[data-p435930-rosary-begin]").click();
   await page.waitForFunction(()=>
     window.AO_ROSARY_V381?.getMethod?.()==="ordinary" &&
     !!document.querySelector("#aoPrayerBookRoot.open .pbShell"),
     null,{timeout:18000});
   assert.ok(await page.locator("#aoPrayerBookRoot.open .pbShell").count()>=1,
     "Begin must open canonical Rosary donor, not a second prayer engine");
   assert.deepEqual(errors,[],"Uncaught Rosary errors: "+errors.slice(0,5).join("; "));
   console.log("PASS "+width+"px Rosary first-action, all methods, 5/15, reading, provenance, donor");
  }finally{await page.close();}
 }
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
