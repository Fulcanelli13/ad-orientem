import assert from "node:assert/strict";
import http from "node:http";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/live-mass-visual-focus");
await mkdir(output,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("forbidden")}
  res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream","cache-control":"no-store"});
  res.end(await readFile(path));
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
const findings={schema:"ao-real-entry-live-visual-opacity-v1",cases:[],errors:[]};
let browser;
const frame=()=>new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done)));
try{
 browser=await chromium.launch({headless:true});
 const viewports=[{width:390,height:844,isMobile:true,lang:"en"},
  {width:390,height:844,isMobile:true,lang:"fr"},
  {width:1280,height:800,isMobile:false,lang:"en"}];
 for(const spec of viewports){
  const context=await browser.newContext({viewport:{width:spec.width,height:spec.height},
    isMobile:spec.isMobile,hasTouch:spec.isMobile,deviceScaleFactor:1,
    locale:spec.lang==="fr"?"fr-FR":"en-GB",serviceWorkers:"block"});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  const samples=[];
  const params=new URLSearchParams({production:"1",mode:"LIVE",lang:spec.lang,secondConfiteor:"1"});
  await page.goto("http://127.0.0.1:"+server.address().port+"/tests/fixtures/reader-phone-harness.html?"+params,
    {waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>["true","error"].includes(document.documentElement.dataset.harnessReady),
    null,{timeout:60000});
  const initial=await page.evaluate(()=>{
    const api=window.__AO_PHONE_PREVIEW;
    const root=document.querySelector("#ao-r17-native-reader-preview");
    const shell=root?.querySelector(".ao-reader-shell");
    return {error:window.__AO_PHONE_HARNESS_ERROR||null,
      owner:api?.ownership?.cards,curated:root?.dataset.r17CuratedReview,
      mode:shell?.dataset.mode,modelCards:api?.model?.totalCards,
      named:(api?.model?.cards||[]).map(x=>({seq:x.sequence,title:x.title}))};
  });
  assert.ok(!initial.error,spec.lang+" launch error: "+initial.error);
  assert.equal(initial.mode,"LIVE");
  assert.equal(initial.curated,"true","Real production mount bypassed curated CSS override");
  assert.ok(initial.modelCards>=64,"Production did not select the curated LIVE reader");
  const cards=initial.named.filter(x=>/^Kyrie|Gloria · Praise and Supplication|Credo · Holy Spirit/.test(x.title));
  assert.ok(cards.length>=2,"Missing source-rich LIVE sections");
  const sample=async(card,at)=>{
   await page.evaluate(async ({seq,at})=>{
     const api=window.__AO_PHONE_PREVIEW;
     api.showSequence(seq);
     await new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done)));
     const scroll=document.querySelector("#ao-r17-native-reader-preview .ao-prayer-card");
     scroll.scrollTop=(scroll.scrollHeight-scroll.clientHeight)*at;
     scroll.dispatchEvent(new Event("scroll",{bubbles:true}));
     await new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done)));
   },{seq:card.seq,at});
   // The app animates opacity for 280ms: compare computed values at rest.
   await page.waitForTimeout(370);
   const data=await page.evaluate(()=>{
    const root=document.querySelector("#ao-r17-native-reader-preview");
    const scroll=root.querySelector(".ao-prayer-card");
    const rows=[...scroll.querySelectorAll(".ao-prayer-body .ao-reader-paragraph")]
      .filter(x=>x.getClientRects().length&&x.dataset.kind!=="RUBRIC");
    // Visual reading focus is independent from the source ceremonial cue.
    // A source cue may remain active while a Proper paragraph is lit.
    const active=rows.filter(x=>x.dataset.readingActive==="true");
    const a=active[0],aIndex=rows.indexOf(a);
    return {cardId:window.__AO_PHONE_PREVIEW.getCurrentCard()?.sectionId,
      maxScroll:scroll.scrollHeight-scroll.clientHeight,
      scrollTop:scroll.scrollTop,eligible:rows.length,active:active.length,
      activeIndex:aIndex,activeCue:a?.dataset.cueId||null,
      activeOpacity:a?Number(getComputedStyle(a).opacity):null,
      farOpacities:rows.filter(x=>x.dataset.readingPosition==="distant")
        .map(x=>Number(getComputedStyle(x).opacity)),
      nextOpacities:rows.filter(x=>x.dataset.readingPosition==="next")
        .map(x=>Number(getComputedStyle(x).opacity)),
      previousOpacities:rows.filter(x=>x.dataset.readingPosition==="previous")
        .map(x=>Number(getComputedStyle(x).opacity)),
      unclassified:rows.filter(x=>!["current","next","previous","distant"].includes(x.dataset.readingPosition)).length,
      focusMarker:root.dataset.r17NativeCue,
      visualFocus:scroll.querySelector("[data-role='paragraphs']")?.dataset.aoVisualFocus||null,
      physicalOverflow:document.documentElement.scrollWidth-innerWidth};
   });
   samples.push({title:card.title,at,...data});
   assert.ok(data.eligible>=4,spec.lang+"/"+card.title+" insufficient visible text");
   assert.ok(data.maxScroll>80,spec.lang+"/"+card.title+" cannot scroll between passages");
   assert.equal(data.active,1,spec.lang+"/"+card.title+" no unique focused paragraph");
   assert.ok(data.activeOpacity>=.94,spec.lang+"/"+card.title+" active paragraph not illuminated: "+JSON.stringify(data));
   assert.equal(data.unclassified,0,
      spec.lang+"/"+card.title+" visible text missing its shared reading focus classification");
   assert.ok(data.farOpacities.length>=1&&
      Math.min(...data.farOpacities)>=.29&&Math.max(...data.farOpacities)<=.41,
      spec.lang+"/"+card.title+" distant text outside gentle muted floor: "+JSON.stringify(data));
   assert.ok(data.nextOpacities.every(x=>x>=.58&&x<=.72),
      spec.lang+"/"+card.title+" next paragraph not softly anticipated: "+JSON.stringify(data));
   assert.ok(data.previousOpacities.every(x=>x>=.48&&x<=.62),
      spec.lang+"/"+card.title+" prior paragraph not softly muted: "+JSON.stringify(data));
   assert.ok(data.nextOpacities.length+data.previousOpacities.length>=1,
      spec.lang+"/"+card.title+" missing adjacent reading paragraph");
   assert.ok(data.physicalOverflow<=2,spec.lang+"/"+card.title+" document horizontal overflow");
   return data;
  };
  for(const card of cards.slice(0,3)){
    const opening=await sample(card,0);
    const later=await sample(card,.70);
    assert.notEqual(later.activeIndex,opening.activeIndex,
      spec.lang+"/"+card.title+" scroll did not transfer visual reading focus");
  }
  assert.deepEqual(errors,[],spec.lang+" browser errors");
  findings.cases.push({...spec,curated:initial.curated,total:initial.modelCards,samples});
  console.log("LIVE_VISUAL_FOCUS="+JSON.stringify({viewport:spec.width,lang:spec.lang,
    curated:initial.curated,cards:cards.length,checks:samples.length,
    minInactive:Math.min(...samples.flatMap(x=>x.farOpacities)),
    maxInactive:Math.max(...samples.flatMap(x=>x.farOpacities)),
    allTransferred:true}));
  await context.close();
 }
} catch(error){findings.errors.push(String(error?.stack||error));throw error}
finally{
 await writeFile(resolve(output,"live-visual-focus.json"),JSON.stringify(findings,null,2));
 await browser?.close().catch(()=>{});
 await new Promise(ok=>server.close(ok));
}
