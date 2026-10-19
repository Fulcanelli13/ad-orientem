import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

// Exercise the real Prayer -> Rosary Methods -> canonical bead player.
// This audit does not create an alternative Rosary timeline or focus owner.
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/rosary-full-bead-focus");
await mkdir(out,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
  res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream","cache-control":"no-store"});
  res.end(await readFile(path));
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((ok,reject)=>{server.once("error",reject);server.listen(0,"127.0.0.1",ok)});
const report={schema:"ao-rosary-canonical-complete-bead-focus-v1",scenarios:[],errors:[],
 limitations:[
  "Two recitation depths, default canonical mystery set, 390px mobile. The other mystery sets require a separate set-specific run.",
  "Each bead's source identity, canonical navigation and active visual paragraph are checked; long-paragraph scroll reachability is sampled at prayer stages.",
  "Contemplation stages use their own canonical surface; they are not silently counted as prayer focus successes."
 ]};
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const depth of ["simple","guided"]){
  const page=await browser.newPage({viewport:{width:390,height:844},
   isMobile:true,hasTouch:true,reducedMotion:"reduce",serviceWorkers:"block",deviceScaleFactor:1});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  const result={depth,status:"not-started",steps:[],errors};
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
    {waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>window.AO_APP_SHELL_V1?.status?.().visibleOwner===true,
    null,{timeout:45000});
   assert.equal((await page.evaluate(()=>window.AO_APP_SHELL_V1.navigate("pray"))).ok,true);
   assert.equal(await page.evaluate(()=>window.AO_PRAY_V435930?.open?.("pray.rosary_methods")),true);
   await page.locator("#aoPray435930 [data-p435930-rosary-begin]").click();
   const player=page.locator("#aoPrayerBookRoot.open");
   await player.locator(".aoP435930RosaryBar").waitFor({state:"attached",timeout:15000});
   // Methods Begin opens the canonical Rosary preparation surface.
   // Its Today button starts the actual bead player; do not count the
   // preparation step as a source bead or attempt to open active settings.
   await player.locator("[data-lab-rosary-today]").click();
   await player.locator(".aoRosaryActiveOptions").waitFor({state:"visible",timeout:15000});
   await page.waitForFunction(()=>window.AO_ROSARY_V381?.steps?.()?.length>0,
     null,{timeout:12000});
   if(depth==="guided"){
    const opts=player.locator(".aoRosaryActiveOptions");
    await opts.locator(":scope > summary").click();
    await opts.locator('[data-p435930-rosary-depth="guided"]').click();
    await page.waitForFunction(()=>document.querySelector(
     "#aoPrayerBookRoot.open .aoRosaryActiveOptionsState")?.textContent?.includes("Guided"),
     null,{timeout:10000});
    await opts.locator(":scope > summary").click();
   }
   const source=await page.evaluate(()=>({
    steps:window.AO_ROSARY_V381?.steps?.().map((s,i)=>({
     i,kind:s.kind??null,mi:s.mi??null,bead:s.bead??null,prayer:s.prayer??null})),
    method:window.AO_ROSARY_V381?.getMethod?.(),
   }));
   assert.ok(source.steps?.length>60&&source.steps.length<250,"Unexpected canonical Rosary length");
   result.sourceCount=source.steps.length;result.method=source.method;
   for(let i=0;i<source.steps.length;i++){
    await page.evaluate(()=>new Promise(ok=>requestAnimationFrame(()=>requestAnimationFrame(ok))));
    const state=await page.evaluate(()=>{
     const api=window.AO_ROSARY_V381,root=document.querySelector("#aoPrayerBookRoot.open");
     const active=root?.querySelector(".aoRosaryActiveCard");
     const scroll=active?.querySelector(".aoRosaryPrayerScroll")||
       (active?.classList.contains("aoRosaryPrayerScroll")?active:null);
     const candidates=[...(scroll?.querySelectorAll(".aoDevoParagraph")||[])].filter(x=>
       x.getClientRects().length&&!x.hidden&&!x.closest("[hidden]"));
     const selected=candidates.filter(x=>x.dataset.aoDevoActive==="true");
     return {
      step:api?.state?.()?.step,rootCount:document.querySelectorAll("#aoPrayerBookRoot.open").length,
      activeCards:root?.querySelectorAll(".aoRosaryActiveCard").length||0,
      kind:active?.dataset.aoRosaryCardKind??null,
      visualIndex:Number(active?.dataset.aoRosaryCanonicalStep),
      paragraphs:candidates.length,selected:selected.length,
      visibleText:scroll?.innerText?.trim()?.length||0,
      focusOpacity:selected.length?Number(getComputedStyle(selected[0]).opacity):null,
      backgroundOpacity:candidates.filter(x=>x.dataset.aoDevoActive!=="true")
       .map(x=>Number(getComputedStyle(x).opacity)),
      scrollTravel:scroll?Math.max(0,scroll.scrollHeight-scroll.clientHeight):0,
      next:!!root?.querySelector("[data-lab-rosary-next]:not([disabled])"),
      overflow:document.documentElement.scrollWidth-innerWidth
     };
    });
    const src=source.steps[i];
    result.steps.push({...src,...state});
    assert.equal(state.step,i,depth+" lost canonical bead sequence at "+i);
    assert.equal(state.visualIndex,i,depth+" decorator diverged from canonical step at "+i);
    assert.equal(state.rootCount,1,depth+" competing Rosary owners at "+i);
    assert.equal(state.activeCards,1,depth+" missing or competing active card at "+i);
    assert.ok(["prayer","contemplation"].includes(state.kind),depth+" unknown stage at "+i);
    if(state.kind==="prayer"){
     assert.ok(state.visibleText>10&&state.paragraphs>=1,depth+" empty prayer at "+i);
     assert.equal(state.selected,1,depth+" missing/duplicate active focus at bead "+i);
     // Computed opacity checks must allow the 240ms transition to settle.
     if(i%12===0||i===source.steps.length-1){
      await page.waitForTimeout(285);
      const opacity=await page.evaluate(()=>{
       const a=document.querySelector("#aoPrayerBookRoot.open .aoRosaryActiveCard .aoDevoParagraph[data-ao-devo-active='true']");
       return a?Number(getComputedStyle(a).opacity):null;
      });
      assert.ok(opacity>=.9,depth+" visually unlit active prayer at "+i+" opacity "+opacity);
     }
    }else assert.equal(src.kind,"mystery",
     depth+" unexpected contemplation card outside source mystery: "+i);
    assert.ok(state.overflow<=2,depth+" horizontal viewport overflow at "+i);
    if(i<source.steps.length-1){
     assert.equal(state.next,true,depth+" Next unavailable before the Rosary ends at "+i);
     await player.locator("[data-lab-rosary-next]").click();
     await page.waitForFunction(next=>window.AO_ROSARY_V381?.state?.()?.step===next,
      i+1,{timeout:8000});
    }
   }
   assert.deepEqual(errors,[],"Rosary browser errors");
   result.status="all-source-steps-verified";
  }catch(e){
   result.status="needs-review";
   result.failure=String(e?.stack||e);
   report.errors.push({depth,reason:result.failure});
  }
  report.scenarios.push(result);
  console.log("ROSARY_BEAD_CASE="+JSON.stringify({depth,status:result.status,
   traversed:result.steps.length,expected:result.sourceCount,
   prayers:result.steps.filter(x=>x.kind==="prayer").length,
   contemplations:result.steps.filter(x=>x.kind==="contemplation").length,
   failure:result.failure?.slice(0,280)}));
  await page.close();
 }
} finally{
 await writeFile(resolve(out,"rosary-complete-bead-ledger.json"),JSON.stringify(report,null,2));
 await browser?.close().catch(()=>{});
 await new Promise(ok=>server.close(ok));
}
assert.equal(report.errors.length,0,"Canonical Rosary full-bead focus audit failed");
