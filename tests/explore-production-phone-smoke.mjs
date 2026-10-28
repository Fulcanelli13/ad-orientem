// Real production URL audit. Unlike explore-user-journey-acceptance.mjs,
// this test never serves a local copy or injects mocked data into the app.
// The only operations against production are ordinary read-only UI actions.
import assert from "node:assert/strict";
import {mkdir,writeFile} from "node:fs/promises";
import {resolve} from "node:path";
import {chromium} from "@playwright/test";

const root=resolve("artifacts/explore-production-smoke");
await mkdir(root,{recursive:true});
const origin=new URL(process.env.AO_EXPLORE_PRODUCTION_URL||"https://ad-orientem.vercel.app/");
assert.equal(origin.protocol,"https:","Production inspection requires HTTPS");
assert.equal(origin.hostname,"ad-orientem.vercel.app","Do not silently inspect another project");
assert.equal(origin.pathname,"/","Production smoke only accepts the canonical root");
const cases=[{width:320,locale:"en-GB"},{width:390,locale:"fr-FR"},{width:1440,locale:"en-GB"}];
const report={target:origin.origin,startedAt:new Date().toISOString(),cases:[]};
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const {width,locale} of cases){
  const mobile=width<800,fr=locale==="fr-FR",started=performance.now();
  const context=await browser.newContext({
   viewport:{width,height:mobile?844:960},
   isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1,
   locale,reducedMotion:"reduce",permissions:[],
  });
  const page=await context.newPage();
  // Diagnostic-only: observe legacy ScriptureService invocation, delegate unchanged.
  // Installed before app boot; does not alter sources or returned documents.
  await page.addInitScript(()=>{
    let current;
    const history=[];
    Object.defineProperty(window,"__AO_TRACE_SVC_CALLS",{value:history});
    Object.defineProperty(window,"AO_RUNTIME_V8",{configurable:true,enumerable:true,
      get(){return current},set(next){
        current=next;
        const svc=next?.scriptureService;
        if(!svc||typeof svc.load!=="function"||svc.__aoTraceInstalled)return;
        const original=svc.load;
        svc.load=function(...args){
          history.push({kind:String(args[0]??""),text:String(args[1]??"").slice(0,100),
           contextOnly:Boolean(args[2]?.contextOnly),stack:String(new Error().stack||"").split("\n").slice(1,10)});
          return original.apply(this,args);
        };
        Object.defineProperty(svc,"__aoTraceInstalled",{value:true});
      }
    });
  });
  const record={width,locale,passed:false,steps:[],errors:[],failedResponses:[],bytesByType:{},bytesByHost:{},largestResources:[],timingsMs:{},scriptureInitiators:[],scriptureCalls:[]};
  const cdp=await context.newCDPSession(page);
  await cdp.send("Network.enable");
  let phase="bootstrap";
  cdp.on("Network.requestWillBeSent",event=>{
   try{
    const url=new URL(event.request.url);
    if(url.hostname!=="raw.githubusercontent.com")return;
    const stack=event.initiator?.stack;
    const frames=[];
    for(let frame=stack;frame&&frames.length<8;frame=frame.parent){
     for(const f of frame.callFrames??[]){
      const src=new URL(f.url||origin.href);
      frames.push({file:src.pathname,function:f.functionName,line:f.lineNumber,column:f.columnNumber});
      if(frames.length>=8)break;
     }
    }
    record.scriptureInitiators.push({phase,host:url.hostname,path:url.pathname.slice(0,220),
     initiatorType:event.initiator?.type,frames});
   }catch{}
  });
  const capture=async name=>page.screenshot({
   path:resolve(root,"explore-production-"+width+"-"+locale.slice(0,2)+"-"+name+".png"),
   fullPage:false,
  });
  page.on("pageerror",error=>record.errors.push(String(error?.message??error).slice(0,350)));
  page.on("response",response=>{
   if(response.status()>=400&&record.failedResponses.length<30){
    const url=new URL(response.url());
    record.failedResponses.push({status:response.status(),host:url.hostname,path:url.pathname.slice(0,180),resourceType:response.request().resourceType()});
   }
  });
  page.on("requestfinished",async request=>{
   try{
    const sizes=await request.sizes();
    const type=request.resourceType();
    const bytes=Math.max(0,sizes.responseBodySize??0);
    record.bytesByType[type]=(record.bytesByType[type]??0)+bytes;
    const url=new URL(request.url());
    record.bytesByHost[url.hostname]=(record.bytesByHost[url.hostname]??0)+bytes;
    if(bytes>=100000){
     record.largestResources.push({host:url.hostname,path:url.pathname.slice(0,150),type,bytes});
     record.largestResources.sort((a,b)=>b.bytes-a.bytes);
     record.largestResources.length=Math.min(12,record.largestResources.length);
    }
   }catch{}
  });
  const mark=(step)=>{record.steps.push(step);record.timingsMs[step]=Math.round(performance.now()-started)};
  const mapReady=async lens=>{
   await page.waitForFunction(expected=>{
    const root=document.querySelector("#ao-find-modular-root");
    return globalThis.AO_FIND_APP_V1?.status?.().lens===expected
      &&root?.dataset?.exploreLens===expected
      &&root.querySelector("[data-find-map]")?.dataset?.aoMapState==="ready"
      &&Boolean(root.querySelector("[data-find-map] canvas.maplibregl-canvas"));
   },lens,{timeout:85000});
  };
  try{
   const response=await page.goto(origin.href,{waitUntil:"domcontentloaded",timeout:90000});
   assert.equal(response?.status(),200,"Production index is not HTTP 200");
   mark("document");
   phase="before-explore";
   const find=page.locator('[data-ao-app-surface="find"]');
   await find.waitFor({state:"visible",timeout:35000});
   await find.click({timeout:15000});
   phase="explore-open";
   await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().loadState==="ready"
     &&Boolean(document.querySelector(".aoHeritageSurface")),null,{timeout:85000});
   mark("explore-data");
   await mapReady("heritage");
   mark("sacred-map-ready");
   phase="map-ready";
   const rootEl=page.locator("#ao-find-modular-root");
   assert.equal(await rootEl.locator(".aoHeritageSurface [data-find-map] canvas").count(),1);
   assert.ok(await rootEl.locator("[data-heritage-world]").count()>0);
   assert.ok(await rootEl.locator(".aoHeritageMassShortcut").count()>0);
   if(fr){
    const switched=await page.evaluate(async()=>{
     globalThis.AO_RUNTIME_V8.store.dispatch({type:"set-language",language:"fr"});
     await globalThis.AO_FIND_APP_V1.paint();
     return globalThis.AO_RUNTIME_V8.store.getState().language;
    });
    assert.equal(switched,"fr");
    await mapReady("heritage");
    mark("french-map-ready");
   }
   await capture("map");
   await page.evaluate(()=>{
    globalThis.__AO_PROD_CANVAS=document.querySelector(
      "#ao-find-modular-root .aoHeritageSurface [data-find-map] canvas.maplibregl-canvas");
   });
   const rail=rootEl.locator("[data-mapcn-discover-rail]");
   await rail.waitFor({state:"visible",timeout:15000});
   await rail.locator("[data-mapcn-discover-toggle]").click({timeout:12000});
   const featured=rail.locator(
    '.aoMapcnEditorialCard[data-explore-open-place="place:FR:sanctuaire-notre-dame-de-lourdes"]');
   await featured.waitFor({state:"visible",timeout:20000});
   await featured.click({timeout:16000});
   const preview=rootEl.locator(
    '.aoHeritagePreview[data-explore-place-owner="place:FR:sanctuaire-notre-dame-de-lourdes"]');
   await preview.waitFor({state:"visible",timeout:16000});
   assert.match(await preview.locator(".aoHeritageCardTitle").innerText(),/Lourdes/);
   assert.equal(await page.evaluate(()=>globalThis.__AO_PROD_CANVAS===
     document.querySelector("#ao-find-modular-root .aoHeritageSurface [data-find-map] canvas")),true,
     "Place selection remounted map on production");
   await preview.locator("[data-explore-expand-place]").click({timeout:12000});
   const reader=rootEl.locator(
    '.aoExplorePlaceSheet[data-explore-place-owner="place:FR:sanctuaire-notre-dame-de-lourdes"]');
   await reader.waitFor({state:"visible",timeout:15000});
   assert.ok(await reader.locator("details.aoPlaceAccordion").count()>0);
   assert.ok(await reader.locator('a[href^="https://"]').count()>0);
   mark("sourced-place-reader");
   phase="place-reader";
   await capture("sourced-place");
   await reader.locator("[data-explore-collapse-place]").click({timeout:12000});
   await preview.waitFor({state:"visible",timeout:12000});
   await preview.locator("button[data-find-close-place]").click({timeout:12000});
   assert.equal(await page.evaluate(()=>globalThis.__AO_PROD_CANVAS===
     document.querySelector("#ao-find-modular-root .aoHeritageSurface [data-find-map] canvas")),true,
     "Return from Place discarded MapLibre canvas");
   mark("back-to-same-map");
   await rootEl.locator(".aoHeritageMassShortcut").click({timeout:15000});
   await mapReady("tlm");
   const count=rootEl.locator("[data-tlm-viewport-count]");
   await page.waitForFunction(fr=>{
    const t=document.querySelector("#ao-find-modular-root [data-tlm-viewport-count]")?.textContent||"";
    return fr?/Dans cette vue : \d+ \/ \d+ lieux cartographiés/.test(t)
      :/In this view: \d+ \/ \d+ mapped venues/.test(t);
   },fr,{timeout:16000});
   const label=await count.innerText();
   const nums=label.match(/(\d+) \/ (\d+)/);
   assert.ok(nums&&Number(nums[1])<=Number(nums[2]),"Invalid source-backed viewport label: "+label);
   const all=rootEl.locator("[data-explore-map-reset]");
   assert.ok(await all.isVisible());
   assert.ok((await all.boundingBox())?.height>=44);
   const zoom=rootEl.locator(".aoFindMap .maplibregl-ctrl-zoom-in");
   await zoom.click({timeout:11000});
   await all.click({timeout:11000});
   mark("mass-map-interactions");
   await capture("mass-map");
   await rootEl.locator(".aoFindHeader [data-find-close]").click({timeout:12000});
   await mapReady("heritage");
   assert.equal(await page.evaluate(()=>globalThis.AO_FIND_APP_V1?.status?.().open),true);
   mark("return-to-explore");
   const dimensions=await page.evaluate(()=>({
    pageWidth:document.documentElement.scrollWidth,
    viewportWidth:innerWidth,
    mapCanvasCount:document.querySelectorAll("#ao-find-modular-root [data-find-map] canvas").length,
   }));
   assert.ok(dimensions.pageWidth-dimensions.viewportWidth<=1,"Horizontal overflow "+JSON.stringify(dimensions));
   assert.equal(record.errors.length,0,"Production JS errors: "+record.errors.join(" | "));
   // Failed external image/tiles requests are recorded for human diagnosis;
   // they do not automatically imply the whole app is broken.
   record.scriptureCalls=await page.evaluate(()=>globalThis.__AO_TRACE_SVC_CALLS??[]);
   record.passed=true;
   record.viewportCount=label;
   record.dimensions=dimensions;
   console.log("PASS production Explore "+width+" "+locale+" "+JSON.stringify(record.timingsMs));
  }catch(error){
   record.failure=String(error?.stack??error).slice(0,4000);
   await capture("FAIL").catch(()=>{});
   console.error("FAIL production Explore "+width+" "+locale+": "+record.failure);
   // Continue remaining devices and preserve forensic evidence before failing.
  }finally{
   report.cases.push(record);
   await context.close().catch(()=>{});
  }
 }
}finally{
 report.completedAt=new Date().toISOString();
 report.allPassed=report.cases.length===cases.length&&report.cases.every(x=>x.passed);
 await writeFile(resolve(root,"production-smoke-results.json"),JSON.stringify(report,null,2)+"\n");
 await browser?.close().catch(()=>{});
}
assert.equal(report.allPassed,true,"At least one actual production Explore device journey failed; consult artifact");
