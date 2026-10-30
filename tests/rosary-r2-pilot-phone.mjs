import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const artifacts=resolve(root,"artifacts/rosary-r2-phone");
await mkdir(artifacts,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const p=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(p!==root&&!p.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden");}
  const data=await readFile(p);
  res.writeHead(200,{"content-type":mime[extname(p)]||"application/octet-stream","cache-control":"no-store"});
  res.end(data);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const {width,height} of [{width:320,height:568},{width:320,height:700},{width:390,height:844}]){
  const page=await browser.newPage({viewport:{width,height},isMobile:true,hasTouch:true,
   deviceScaleFactor:1,reducedMotion:"reduce",serviceWorkers:"block"});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html?aoRosaryR2Pilot=1",
    {waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>window.AO_APP_SHELL_V1?.status?.().visibleOwner===true,null,{timeout:45000});
   assert.equal((await page.evaluate(()=>window.AO_APP_SHELL_V1.navigate("pray"))).ok,true);
   assert.equal(await page.evaluate(()=>window.AO_PRAY_V435930?.open?.("pray.rosary_methods")),true);
   await page.locator("#aoPray435930 [data-p435930-rosary-begin]").click();
   const donor=page.locator("#aoPrayerBookRoot.open");
   await donor.locator("[data-lab-rosary-today]").click();
   await page.waitForFunction(()=>document.querySelector(
    '#aoPrayerBookRoot.open[data-ao-rosary-r2="v1"]'),null,{timeout:14000});
   const baseline=await page.evaluate(()=>{
    const r=document.querySelector("#aoPrayerBookRoot.open");
    const shell=r?.querySelector(".pbShell");
    const rail=shell?.querySelector(".aoRosaryNamedTimeline");
    const stage=shell?.querySelector(".lab-bead-stage");
    const next=shell?.querySelector("[data-lab-rosary-next]");
    const prev=shell?.querySelector("[data-lab-rosary-prev]");
    const dock=shell?.querySelector('[data-ao-rosary-r2-dock="v1"]');
    const dockBox=dock?.getBoundingClientRect();
    const prevBox=prev?.getBoundingClientRect();
    const nextBox=next?.getBoundingClientRect();
    const activePrayer=shell?.querySelector('.aoRosaryActiveCard .aoDevoParagraph[data-ao-devo-active="true"]');
    const prayerBox=activePrayer?.getBoundingClientRect();
    const prayerAboveDock=prayerBox&&dockBox
      ?Math.max(0,Math.min(prayerBox.bottom,dockBox.top)-Math.max(0,prayerBox.top)):0;
    return {
     roots:document.querySelectorAll("#aoPrayerBookRoot.open").length,
     step:window.AO_ROSARY_V381?.state?.()?.step,
     count:window.AO_ROSARY_V381?.steps?.()?.length,
     nativeBeads:stage?.querySelectorAll("[data-ao-rosary-bead]").length||0,
     caption:stage?.querySelectorAll(":scope > .aoRosaryR2NativePosition").length||0,
     chapters:rail?.querySelectorAll("[data-ao-rosary-chapter]").length||0,
     current:rail?.querySelectorAll('[aria-current="step"]').length||0,
     firstMystery:rail?.querySelectorAll(".aoDevoStopNumber")[1]?.textContent,
     nextHeight:next?.getBoundingClientRect().height||0,
     dockCount:shell?.querySelectorAll('[data-ao-rosary-r2-dock="v1"]').length||0,
     dockBottom:dockBox?.bottom??null,dockTop:dockBox?.top??null,
     prevTop:prevBox?.top??null,nextTop:nextBox?.top??null,
     prevBottom:prevBox?.bottom??null,nextBottom:nextBox?.bottom??null,
     rowChildren:dock?.querySelectorAll(":scope > button").length??0,
     prayerAboveDock,
     openingPill:rail?.querySelector('[data-ao-rosary-r2-role="opening"]')?.innerText?.trim(),
     viewportHeight:innerHeight,
     overflow:document.documentElement.scrollWidth-innerWidth,
     text:shell?.querySelector(".aoRosaryActiveCard")?.innerText?.trim()?.length||0
    };
   });
   console.log("ROSARY_R2_PHONE_DIAGNOSTICS "+JSON.stringify({width,height,...baseline}));
   await page.screenshot({path:resolve(artifacts,"rosary-r2-"+width+"x"+height+"-opening.png"),animations:"disabled"});
   assert.equal(baseline.roots,1,"One canonical Rosary donor only");
   assert.ok(baseline.count>60&&baseline.chapters>=7,"Original steps and named chapters missing");
   assert.equal(baseline.firstMystery,"I","R2 must use Roman mystery pills");
   assert.equal(baseline.current,1,"Exactly one current chapter");
   // Opening prayers precede the decades: the donor correctly shows no
   // bead-picker buttons on the opening Sign of the Cross.
   assert.equal(baseline.caption,1,"One source-position caption at opening");
   assert.equal(baseline.openingPill,"Opening","Opening pill must not repeat its title");
   assert.equal(baseline.dockCount,1,"Native Previous/Next row must be one R2 phone dock");
   assert.equal(baseline.rowChildren,2,"Dock must preserve only the native two navigation buttons");
   assert.ok(baseline.nextTop>=0&&baseline.prevTop>=0&&
     baseline.nextBottom<=baseline.viewportHeight-1&&baseline.prevBottom<=baseline.viewportHeight-1,
     "Both native controls must remain visible above the mobile safe-area dock: "+JSON.stringify(baseline));
   assert.ok(baseline.nextHeight>=44&&baseline.text>15,"Source prayer and Next action must remain usable");
   assert.ok(baseline.prayerAboveDock>=18,"The first actual prayer must be readable before scrolling at "+
     width+"x"+height+": "+JSON.stringify(baseline));
   assert.ok(baseline.overflow<=2,"Phone horizontal overflow");
   await donor.locator("[data-lab-rosary-next]").click();
   await page.waitForFunction(before=>window.AO_ROSARY_V381?.state?.()?.step===before+1,
     baseline.step,{timeout:10000});
   await page.waitForFunction(()=>document.querySelector("#aoPrayerBookRoot.open .pbShell")
    ?.dataset.aoRosaryR2CanonicalStep===String(window.AO_ROSARY_V381?.state?.()?.step),null,{timeout:10000});
   assert.equal(await donor.locator(".aoRosaryR2NativePosition").count(),1,
    "R2 must update rather than duplicate bead-position captions");
   await donor.locator("[data-lab-rosary-prev]").click();
   await page.waitForFunction(expected=>window.AO_ROSARY_V381?.state?.()?.step===expected,
     baseline.step,{timeout:10000});
   // Navigate as the reader does: chapter pill, then native Next. Calling
   // the donor's raw setStep() bypasses the presentation's repaint signal.
   const firstMystery=donor.locator(".aoRosaryNamedTimeline [data-ao-rosary-chapter]").nth(1);
   const mysteryStart=Number(await firstMystery.getAttribute("data-ao-rosary-chapter"));
   await firstMystery.click();
   await page.waitForFunction(start=>window.AO_ROSARY_V381?.state?.()?.step===start,
     mysteryStart,{timeout:10000});
   await page.waitForFunction(start=>document.querySelector("#aoPrayerBookRoot.open .pbShell")
     ?.dataset.aoRosaryR2CanonicalStep===String(start),mysteryStart,{timeout:10000});
   let reachedBead=false;
   for(let n=0;n<8;n++){
     const sample=await page.evaluate(()=>{
       const state=window.AO_ROSARY_V381?.state?.();
       const step=window.AO_ROSARY_V381?.steps?.()?.[state?.step];
       const beadCount=document.querySelectorAll("#aoPrayerBookRoot.open .lab-bead-stage [data-ao-rosary-bead]").length;
       return {step:state?.step,isBead:Number.isInteger(step?.bead)&&step.bead>0,beadCount};
     });
     if(sample.isBead&&sample.beadCount>0){reachedBead=true;break}
     const previous=sample.step;
     await donor.locator("[data-lab-rosary-next]").click();
     await page.waitForFunction(before=>window.AO_ROSARY_V381?.state?.()?.step===before+1,
       previous,{timeout:10000});
   }
   assert.ok(reachedBead,"Native bead controls must appear at a real bead step");
   assert.deepEqual(errors,[],"Browser errors in R2 pilot: "+errors.join("; "));
   console.log("PASS Rosary R2 "+width+"x"+height+": source donor, Roman chapter pills, native beads, exact Next/Previous, no overflow");
  }finally{await page.close();}
 }
 const normal=await browser.newPage({viewport:{width:320,height:700},isMobile:true,serviceWorkers:"block"});
 try{
  await normal.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
  await normal.waitForFunction(()=>window.AO_APP_SHELL_V1?.status?.().visibleOwner===true,null,{timeout:45000});
  await normal.evaluate(()=>window.AO_APP_SHELL_V1.navigate("pray"));
  await normal.evaluate(()=>window.AO_PRAY_V435930?.open?.("pray.rosary_methods"));
  await normal.locator("#aoPray435930 [data-p435930-rosary-begin]").click();
  await normal.locator("#aoPrayerBookRoot.open [data-lab-rosary-today]").click();
  await normal.locator("#aoPrayerBookRoot.open .aoRosaryNamedTimeline").waitFor({state:"visible",timeout:14000});
  assert.equal(await normal.locator('#aoPrayerBookRoot.open[data-ao-rosary-r2]').count(),0,
   "Existing public Rosary must stay unchanged without opt-in");
 }finally{await normal.close()}
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
