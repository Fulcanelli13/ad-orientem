// Visual acceptance of the actual source-owned Explore surface, not a mock.
// The screenshot artifact is required for human review of map pin legibility.
import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/visual-acceptance");
await mkdir(out,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+path);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return;}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message??error));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
const origin="http://127.0.0.1:"+server.address().port;
const captures=[];
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390,1440]){
  const mobile=width<700,context=await browser.newContext({
   viewport:{width,height:mobile?844:960},deviceScaleFactor:mobile?2:1,
   isMobile:mobile,hasTouch:mobile,locale:"en-GB",
  });
  const page=await context.newPage(),errors=[];
  page.on("pageerror",error=>errors.push(String(error?.message??error)));
  try{
   await page.goto(origin+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
   const entry=page.locator('[data-ao-app-surface="find"]');
   await entry.waitFor({state:"visible",timeout:30000});
   await entry.click();
   await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().open===true
    &&globalThis.AO_FIND_APP_V1?.status?.().loadState==="ready"
    &&Boolean(document.querySelector("#ao-find-modular-root .aoHeritageSurface")),
    null,{timeout:60000});
   const map=page.locator("#ao-find-modular-root .aoHeritageSurface .aoFindMap");
   await map.waitFor({state:"visible"});
   // A canvas exists before MapLibre has loaded tiles or the GeoJSON cluster
   // source. An image taken in that state is NOT visual acceptance.
   await page.waitForFunction(()=>document.querySelector(
     "#ao-find-modular-root .aoHeritageSurface [data-find-map]"
   )?.dataset?.aoMapState==="ready",null,{timeout:45000});
   await page.waitForTimeout(650);
   const measures=await page.evaluate(()=>{
    const map=document.querySelector("#ao-find-modular-root .aoHeritageSurface .aoFindMap");
    const r=map?.getBoundingClientRect(),root=document.querySelector("#ao-find-modular-root");
    const search=document.querySelector(".aoHeritageSurface .aoHeritageTools")?.getBoundingClientRect();
    const categories=document.querySelector(".aoHeritageSurface .aoHeritageCategories")?.getBoundingClientRect();
    return {mapWidth:Math.round(r?.width||0),mapHeight:Math.round(r?.height||0),
     mapTop:Math.round(r?.top||0),searchBottom:Math.round(search?.bottom||0),
     categoriesBottom:Math.round(categories?.bottom||0),
     documentOverflow:Math.round(document.documentElement.scrollWidth-innerWidth),
     canvas:Boolean(map?.querySelector("canvas.maplibregl-canvas")),
     status:map?.dataset?.aoMapState||null,
     rootOverflow:root?Math.round(root.scrollWidth-root.clientWidth):null};
   });
   assert.ok(measures.mapWidth>=(mobile?280:600),"Map is too narrow at "+width+": "+JSON.stringify(measures));
   assert.ok(measures.mapHeight>=(mobile?729:810),
     "A immersive map must use nearly all remaining viewport height "+JSON.stringify(measures));
   assert.ok(measures.mapTop<measures.searchBottom&&measures.mapTop<measures.categoriesBottom,
     "A search/categories must FLOAT OVER the map, not push it down "+JSON.stringify(measures));
   assert.ok(measures.mapHeight>=300,"Map is too short at "+width+": "+JSON.stringify(measures));
   assert.ok(measures.documentOverflow<=1,"Document overflow at "+width+": "+JSON.stringify(measures));
   assert.equal(measures.status,"ready","Cannot certify an empty/loading basemap at "+width);
   await page.screenshot({path:resolve(out,"explore-"+width+"-overview.png"),fullPage:false});

   // D is a same-map journey folio: no new page and no manufactured route
   // lines. Exercise a historical source-owned 3-stage pilgrimage.
   await page.locator("#ao-find-modular-root [data-explore-journey-open]").click();
   const journey=page.locator("#ao-find-modular-root [data-explore-journey-panel]");
   await journey.waitFor({state:"visible"});
   assert.equal(await journey.locator("[data-explore-journey-select]").count(),20,
     "Only the 20 documented route IDs may be treated as journeys");
   const route=journey.locator('[data-explore-journey-select="route:FR:paris-chartres-pentecost"]');
   await route.click();
   await page.waitForFunction(()=>document.querySelector("#ao-find-modular-root .aoJourneyDetail h3")
      ?.textContent?.includes("Saint-Sulpice"),null,{timeout:15000});
   await page.waitForFunction(()=>{
     const active=document.querySelector(".aoJourneyRoutes button.active"),
       rail=document.querySelector(".aoJourneyRoutes");
     if(!active||!rail)return false;
     const a=active.getBoundingClientRect(),r=rail.getBoundingClientRect();
     return a.left>=r.left-2&&a.right<=r.right+2;
   },null,{timeout:8000});
   assert.equal(await page.locator("#ao-find-modular-root .aoHeritageCategories button.active").count(),1,
     "Journey uses one active mode marker, not a redundant pilgrimage chip");
   assert.ok(await journey.locator(".aoJourneyEvidence a[href^='https://']").count()>0,
     "D must link to original publisher evidence");
   assert.equal(await journey.locator(".aoJourneyAnchors li").count(),4,
     "D must show the four source-named Chartres anchors in official order");
   assert.equal(await journey.locator("[data-journey-named-stage]").count(),4,
     "Verified names stay text-only; no intermediate coordinates may be inferred");
   assert.ok((await journey.locator(".aoJourneyNoLine").innerText()).includes("No route line"));
   await page.waitForTimeout(700);
   await page.screenshot({path:resolve(out,"explore-"+width+"-journey-chartres.png"),fullPage:false});
   await journey.locator('[data-explore-journey-destination="place:FR:chartres-notre-dame"]').click();
   await page.locator("#ao-find-modular-root .aoHeritagePreview").waitFor({state:"visible"});
   assert.equal(await journey.count(),0,"Discovering destination returns to the C editorial folio");
   await page.locator("#ao-find-modular-root .aoHeritagePreview button[data-find-close-place]").click();

   const search=page.locator("#ao-find-modular-root .aoHeritageSurface [data-find-query]");
   await search.fill("Lourdes");
   const result=page.locator("#ao-find-modular-root .aoHeritageSearchResults [data-explore-open-place]").first();
   await result.waitFor({state:"visible",timeout:15000});
   await result.click();
   await page.locator("#ao-find-modular-root .aoHeritagePreview").waitFor({state:"visible",timeout:10000});
   assert.equal(await page.locator("#ao-find-modular-root .aoHeritageSearchResults").count(),0,
     "C selected Place cannot leave search results obscuring the map");
   const folio=await page.evaluate(()=>{
    const sheet=document.querySelector(".aoHeritageSurface .aoHeritagePreview");
    const photo=sheet?.querySelector(".aoHeritagePlaceThumb");
    const title=sheet?.querySelector(".aoHeritageCardTitle");
    const frame=sheet?.getBoundingClientRect(),art=photo?.getBoundingClientRect(),
      heading=title?.getBoundingClientRect();
    return {left:frame?.left,width:frame?.width,height:frame?.height,
      photoLeft:art?.left,photoWidth:art?.width,titleLeft:heading?.left,
      actionHeights:[...(sheet?.querySelectorAll("button,a")||[])]
       .filter(el=>getComputedStyle(el).display!=="none")
       .map(el=>el.getBoundingClientRect().height)};
   });
   assert.ok(folio.actionHeights.every(h=>h>=44),
     "C place folio must preserve 44px touch targets "+JSON.stringify(folio));
   if(mobile){
    assert.ok(folio.height<422,"C mobile folio must preserve map visibility "+JSON.stringify(folio));
    assert.ok(folio.photoWidth>=70&&folio.photoLeft<folio.titleLeft,
      "C mobile requires left-hand photograph, right-hand text "+JSON.stringify(folio));
   }else{
    assert.ok(folio.left>0.65*width,"C desktop folio must dock right "+JSON.stringify(folio));
    assert.ok(folio.photoWidth>=0.7*folio.width,
      "C desktop artwork must span most of the folio "+JSON.stringify(folio));
   }
   const selectedImage=page.locator("#ao-find-modular-root .aoHeritagePreview .aoHeritagePlaceThumb img");
   if(await selectedImage.count()){
    await page.waitForFunction(()=>{const img=document.querySelector(
      "#ao-find-modular-root .aoHeritagePreview .aoHeritagePlaceThumb img");
      return Boolean(img?.complete&&img.naturalWidth>0)},null,{timeout:15000});
    await selectedImage.evaluate(img=>img.decode());
    // Let the source-qualified geography focus and decoded hero paint before
    // judging the C editorial layout.
    await page.waitForTimeout(650);
   }
   await page.screenshot({path:resolve(out,"explore-"+width+"-selected-place.png"),fullPage:false});
   await page.locator("#ao-find-modular-root .aoHeritagePreview button[data-find-close-place]").click();
   await search.fill("");

   // Test-only hook: preserve production map ownership while allowing a
   // geographic close-up of real, source-backed institutional emblems.
   const patched=await page.evaluate(()=>{
     const module=globalThis.AO_FIND_MAPLIBRE_MODULE;
     if(!module?.Map)return false;
     globalThis.AO_FIND_MAPLIBRE_MODULE={...module,Map:new Proxy(module.Map,{
       construct(Target,args,newTarget){
         const instance=Reflect.construct(Target,args,newTarget);
         globalThis.__AO_EXPLORE_VISUAL_REVIEW_MAP=instance;
         return instance;
       },
     })};
     return true;
   });
   assert.equal(patched,true,"MapLibre module missing for emblem close-up");

   const mass=page.locator("#ao-find-modular-root .aoHeritageMassShortcut");
   await mass.click();
   await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().lens==="tlm",null,{timeout:15000});
   const mapButton=page.locator('#ao-find-modular-root [data-find-filter="view"][data-find-filter-value="map"]');
   if(await mapButton.count())await mapButton.click();
   await page.locator('#ao-find-modular-root [data-find-map]').waitFor({state:"visible",timeout:15000});
   await page.waitForFunction(()=>document.querySelector(
     "#ao-find-modular-root [data-find-map]"
   )?.dataset?.aoMapState==="ready",null,{timeout:45000});
   await page.waitForTimeout(650);
   const massLayout=await page.evaluate(()=>{
    const root=document.querySelector(".aoExploreSurface:has(.aoExploreTlmFilters)");
    const map=root?.querySelector(".aoFindBody[data-find-view=map] .aoFindMap")?.getBoundingClientRect();
    const search=root?.querySelector(".aoTlmToolbar")?.getBoundingClientRect();
    const institutions=root?.querySelector(".aoTlmProviderStrip")?.getBoundingClientRect();
    const drawer=root?.querySelector(".aoAtlasTlmExtra summary");
    return {mapHeight:map?.height??0,mapTop:map?.top??0,
     searchBottom:search?.bottom??0,logosBottom:institutions?.bottom??0,
     hasSourceFilterDrawer:Boolean(drawer)};
   });
   assert.ok(massLayout.mapHeight>=(mobile?729:810),
     "Mass map must use same immersive full-stage composition as Sacred Atlas "+JSON.stringify(massLayout));
   assert.ok(massLayout.mapTop<massLayout.searchBottom&&massLayout.mapTop<massLayout.logosBottom,
     "Mass search and logos must float OVER the map, not in stacked bars "+JSON.stringify(massLayout));
   assert.ok(massLayout.hasSourceFilterDrawer,
     "Existing source-affiliation/grouping filters must be accessible");
   await page.screenshot({path:resolve(out,"explore-"+width+"-mass-emblems.png"),fullPage:false});
   const closer=await page.evaluate(()=>{
     const map=globalThis.__AO_EXPLORE_VISUAL_REVIEW_MAP;
     if(!map?.jumpTo)return {ready:false};
     map.jumpTo({center:[2.3522,48.8566],zoom:13.3});
     return {ready:true,zoom:map.getZoom()};
   });
   assert.ok(closer.ready,"Zoomable institute map unavailable");
   await page.waitForTimeout(1200);
   const emblemReview=await page.evaluate(()=>{
     const map=globalThis.__AO_EXPLORE_VISUAL_REVIEW_MAP;
     const points=map.queryRenderedFeatures?.({layers:["ao-explore-points"]})||[];
     const eligible=points.filter(p=>["FSSP","ICKSP","IBP","SSPX","DIOCESAN"].includes(
       String(p.properties?.provider_group||""))).length;
     const logoOverlays=document.querySelectorAll(".aoExploreInstitutionMapPin img");
     return {pointCount:points.length,eligible,
       emblemLayer:Boolean(map.getLayer?.("ao-explore-institution-emblems")),
       logoOverlays:logoOverlays.length,
       logoLoaded:[...logoOverlays].filter(img=>img.complete&&img.naturalWidth>0).length,
       overlayDiagnostics:map.__aoInstitutionEmblemDiagnostics?.()??null,
       clusterCount:map.queryRenderedFeatures?.({layers:["ao-explore-clusters"]})?.length??0};
   });
   assert.ok(emblemReview.eligible===0||emblemReview.emblemLayer||emblemReview.logoLoaded>0,
     "Institution logos must render ON eligible map pins, not only in filter chips: "+JSON.stringify(emblemReview));
   await page.screenshot({path:resolve(out,"explore-"+width+"-mass-emblems-closeup.png"),fullPage:false});
   captures.push({width,...measures,errors,massScreenshot:true,
     closeup:emblemReview});
   assert.equal(errors.length,0,"Explore JS runtime errors at "+width+": "+errors.join(" | "));
  }finally{await context.close();}
 }
 await writeFile(resolve(out,"explore-medallion-visual-report.json"),
  JSON.stringify({capturedAt:new Date().toISOString(),captures},null,2));
 console.log("PASS Explore visual captures at 320, 390 and 1440 px",JSON.stringify(captures));
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
