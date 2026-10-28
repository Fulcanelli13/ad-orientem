// End-to-end visitor journey against the actual Ad Orientem UI and MapLibre.
// No mocked projection, fabricated locations, external booking or geolocation.
import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/explore-user-journey");
await mkdir(output,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+pathname);
  if(file!==root&&!file.startsWith(root+sep)){
   res.writeHead(403);res.end("forbidden");return;
  }
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(error){
  res.writeHead(error?.code==="ENOENT"?404:500);
  res.end(String(error?.message??error));
 }
});
await new Promise((yes,no)=>{server.once("error",no);server.listen(0,"127.0.0.1",yes)});
const origin="http://127.0.0.1:"+server.address().port;
const results=[];
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const {width,language} of [{width:320,language:"en"},{width:390,language:"fr"},{width:1440,language:"en"}]){
  const mobile=width<800;
  const context=await browser.newContext({
   viewport:{width,height:mobile?844:960},
   isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1,
   locale:language==="fr"?"fr-FR":"en-GB",
   reducedMotion:"reduce",
  });
  const page=await context.newPage();
  const errors=[],offRouteScripture=[];
  page.on("pageerror",e=>errors.push(String(e?.message??e)));
  page.on("request",request=>{
   const url=request.url();
   if(url.startsWith("https://raw.githubusercontent.com/")&&
     (/\/sources\/(?:fr\/FreCrampon|la\/VulgClementine)\//.test(url)||
      /\/AlvaroBalbin\/catena\/.*\/john\.jsonl/.test(url)))offRouteScripture.push(url);
  });
  const note={width,language,steps:[]};
  const capture=async name=>page.screenshot({
   path:resolve(output,"explore-journey-"+width+"-"+language+"-"+name+".png"),fullPage:false,
  });
  const mapReady=async lens=>{
   await page.waitForFunction(expected=>{
    const root=document.querySelector("#ao-find-modular-root");
    return globalThis.AO_FIND_APP_V1?.status?.().lens===expected
     &&root?.dataset?.exploreLens===expected
     &&root.querySelector("[data-find-map]")?.dataset?.aoMapState==="ready"
     &&!!root.querySelector("[data-find-map] canvas.maplibregl-canvas");
   },lens,{timeout:60000});
  };
  try{
   await page.goto(origin+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
   await page.locator('[data-ao-app-surface="find"]').waitFor({state:"visible",timeout:30000});
   await page.locator('[data-ao-app-surface="find"]').click();
   await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().loadState==="ready"
     &&Boolean(document.querySelector(".aoHeritageSurface")),null,{timeout:60000});
   await mapReady("heritage");
   if(language==="fr"){
    const switched=await page.evaluate(async()=>{
     globalThis.AO_RUNTIME_V8.store.dispatch({type:"set-language",language:"fr"});
     await globalThis.AO_FIND_APP_V1.paint();
     return globalThis.AO_RUNTIME_V8.store.getState().language;
    });
    assert.equal(switched,"fr");
    await mapReady("heritage");
   }
   assert.equal(await page.locator(".aoHeritageSurface [data-find-map] canvas").count(),1);
   assert.equal(await page.locator(".aoHeritageSurface [data-heritage-world]").count(),1);
   assert.equal(await page.locator(".aoHeritageSurface .aoHeritageMassShortcut").count(),1);
   await capture("01-entry-map");
   note.steps.push("entry map ready, one MapLibre canvas, Mass shortcut visible");
   const root=page.locator("#ao-find-modular-root");
   await page.evaluate(()=>{
    globalThis.__AO_VISITOR_MAP_CANVAS=document.querySelector(
      "#ao-find-modular-root .aoHeritageSurface [data-find-map] canvas.maplibregl-canvas");
   });

   // Discover a curated, rights-approved, canonical Place. No network image hotlink.
   const rail=root.locator("[data-mapcn-discover-rail]");
   await rail.waitFor({state:"visible"});
   assert.equal(await rail.getAttribute("data-discover-expanded"),"false");
   await rail.locator("[data-mapcn-discover-toggle]").click();
   assert.equal(await rail.getAttribute("data-discover-expanded"),"true");
   const featured=rail.locator(
    '.aoMapcnEditorialCard[data-explore-open-place="place:FR:sanctuaire-notre-dame-de-lourdes"]');
   await featured.waitFor({state:"attached",timeout:10000});
   const approved=featured.locator("img");
   await page.waitForFunction(()=>{
    const img=document.querySelector(
     '#ao-find-modular-root .aoMapcnEditorialCard[data-explore-open-place="place:FR:sanctuaire-notre-dame-de-lourdes"] img');
    return Boolean(img?.complete&&img.naturalWidth>0);
   },null,{timeout:20000});
   assert.match(await approved.getAttribute("src"),/^assets\/approved\/place-media\//);
   await capture("02-editorial-discovery");
   await featured.click();
   const place=root.locator(
    '.aoHeritagePreview[data-explore-place-owner="place:FR:sanctuaire-notre-dame-de-lourdes"]');
   await place.waitFor({state:"visible",timeout:20000});
   assert.equal((await page.evaluate(()=>globalThis.AO_FIND_APP_V1.status().selectedPlaceId)),
    "place:FR:sanctuaire-notre-dame-de-lourdes");
   assert.equal(await place.locator(".aoHeritageCardTitle").count(),1);
   assert.ok((await place.locator(".aoHeritageCardTitle").innerText()).includes("Lourdes"));
   assert.equal(await root.locator(".aoHeritageSearchResults").count(),0);
   assert.equal(await page.evaluate(()=>globalThis.__AO_VISITOR_MAP_CANVAS===
     document.querySelector("#ao-find-modular-root .aoHeritageSurface [data-find-map] canvas")),true,
     "Opening a Place preview must not remount MapLibre");
   await capture("03-place-preview");
   note.steps.push("licensed editorial image opens exactly its canonical Place");

   await place.locator("[data-explore-expand-place]").click();
   const full=root.locator(
    '.aoExplorePlaceSheet[data-explore-place-owner="place:FR:sanctuaire-notre-dame-de-lourdes"]');
   await full.waitFor({state:"visible",timeout:15000});
   assert.ok((await full.innerText()).includes("Lourdes"));
   assert.ok(await full.locator('a[href^="https://"]').count()>0,
    "Place editorial reading must retain external primary evidence/source links");
   assert.ok(await full.locator("details.aoPlaceAccordion").count()>0,
    "Place reading must include progressively disclosed sourced chapters");
   assert.equal(await page.evaluate(()=>globalThis.__AO_VISITOR_MAP_CANVAS===
    document.querySelector("#ao-find-modular-root .aoHeritageSurface [data-find-map] canvas")),true,
    "Opening full Place reader must not destroy existing map");
   await capture("04-full-place-folio");
   note.steps.push("full sourced Place reader, source links, same map canvas");

   // Back is a two-stage unwind, not a jump to Home or an unrelated map.
   await full.locator("[data-explore-collapse-place]").click();
   await place.waitFor({state:"visible"});
   assert.equal(await root.locator(".aoExplorePlaceSheet").count(),0);
   await place.locator("button[data-find-close-place]").click();
   await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().selectedPlaceId==null,
    null,{timeout:15000});
   assert.equal(await page.locator(".aoHeritageSurface [data-find-map] canvas").count(),1);
   assert.equal(await page.evaluate(()=>globalThis.__AO_VISITOR_MAP_CANVAS===
    document.querySelector("#ao-find-modular-root .aoHeritageSurface [data-find-map] canvas")),true,
    "Returning from Place reader must preserve the same map canvas");
   assert.equal(await page.evaluate(()=>globalThis.AO_FIND_APP_V1.status().lens),"heritage");
   assert.equal(await rail.getAttribute("data-discover-expanded"),"true",
    "The visitor's open Discover state should survive a Place round trip");
   await capture("05-return-map");
   note.steps.push("Place back navigation returns to same map and preserved Discover");

   // Continue from this same Explore destination to Mass without hidden menus.
   await root.locator(".aoHeritageMassShortcut").click();
   await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().lens==="tlm",
    null,{timeout:15000});
   const switchMap=root.locator('[data-find-filter="view"][data-find-filter-value="map"]');
   if(await switchMap.count())await switchMap.click();
   await mapReady("tlm");
   assert.ok(await root.locator(".aoTlmProviderStrip").count()>0,
    "Mass explorer must retain identity/affiliation discovery");
   assert.ok(await root.locator(".aoAtlasTlmExtra summary").count()>0,
    "Mass source-affiliation filters must remain accessible");
   const mapContext=root.locator("[data-tlm-viewport-count]");
   await page.waitForFunction(fr=>{
    const text=document.querySelector("#ao-find-modular-root [data-tlm-viewport-count]")?.textContent||"";
    return fr?/Dans cette vue : \d+ \/ \d+ lieux cartographiés/.test(text)
      :/In this view: \d+ \/ \d+ mapped venues/.test(text);
   },language==="fr",{timeout:12000});
   const initial=await mapContext.textContent();
   const match=initial?.match(/(\d+) \/ (\d+)/);
   assert.ok(match&&Number(match[1])<=Number(match[2]),"Viewport count must be a subset of mapped records: "+initial);
   const globe=root.locator("[data-explore-map-reset]");
   assert.equal(await globe.count(),1,"There must be exactly one visible reset to all mapped venues");
   assert.ok(await globe.isVisible(),"Map reset is hidden on "+width);
   assert.ok((await globe.boundingBox())?.width>=88,"Map reset must have a readable label");
   assert.ok((await globe.boundingBox())?.height>=44,"Map reset must be touch-accessible");
   assert.match(await globe.innerText(),language==="fr"?/Tous les lieux/:/All mapped/);
   const zoomIn=root.locator(".aoFindMap .maplibregl-ctrl-zoom-in");
   await zoomIn.click();
   await zoomIn.click();
   await page.waitForTimeout(350);
   const zoomed=await mapContext.textContent();
   assert.match(zoomed,/\d+ \/ \d+/,"Pan/zoom must keep a legible current-viewport count");
   await globe.click();
   await page.waitForTimeout(420);
   const restored=await mapContext.textContent();
   assert.match(restored,/\d+ \/ \d+/,"All mapped reset must restore a valid viewport status");
   await capture("06-mass-map");
   note.steps.push("Mass shortcut opens source-owned traditional Mass directory map, dynamic in-view count and labeled global reset");

   // Back from Mass returns to Explore, never exits the app.
   await root.locator(".aoFindHeader [data-find-close]").click();
   await mapReady("heritage");
   assert.equal(await page.evaluate(()=>globalThis.AO_FIND_APP_V1?.status?.().open),true);
   assert.equal(await root.locator(".aoHeritageMassShortcut").count(),1);
   assert.ok(await rail.count()>0);
   await capture("07-return-from-mass");
   note.steps.push("Mass back returns to Explore rather than Home");
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert.ok(overflow<=1,"Visit flow created horizontal viewport overflow: "+overflow);
   await page.waitForTimeout(400);
   assert.deepEqual(offRouteScripture,[],
    "Map-only visitor must not download complete Latin/French Bible or Catena source corpora");
   assert.equal(errors.length,0,"Actual visitor flow JS exceptions: "+errors.join(" | "));
   results.push({...note,passed:true});
   console.log("PASS end-to-end Explore visitor "+width+"px "+language+": "+note.steps.join("; "));
  }catch(e){
   results.push({...note,passed:false,error:String(e?.stack||e)});
   await capture("FAIL-current-state").catch(()=>{});
   throw e;
  }finally{
   await context.close();
  }
 }
}finally{
 await writeFile(resolve(output,"journey-result.json"),JSON.stringify(results,null,2)+"\n");
 await browser?.close().catch(()=>{});
 await new Promise(resolve=>server.close(resolve));
}
