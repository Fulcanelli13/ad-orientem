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
   assert.equal(await map.getAttribute("data-ao-cartography"),"enhanced-dark",
     "OpenFreeMap Dark map must apply the verified label and territory legibility palette");
   // Keep OpenStreetMap/OpenFreeMap attribution visible and operable, but
   // prevent the default bright strip from overpowering the dark atlas.
   const credits=await page.evaluate(()=>{
     const node=document.querySelector(".aoHeritageSurface .aoFindMap .maplibregl-ctrl-attrib");
     const bg=node?getComputedStyle(node).backgroundColor:"";
     return {present:Boolean(node),text:node?.textContent||"",background:bg,
       links:node?.querySelectorAll("a[href]").length||0};
   });
   assert.ok(credits.present&&credits.links>0&&/OpenStreetMap/i.test(credits.text),
     "Map provider credits and source links must remain available: "+JSON.stringify(credits));
   const rgb=(credits.background.match(/[0-9.]+/g)||[]).slice(0,3).map(Number);
   assert.ok(rgb.length===3&&rgb.every(value=>value<100),
     "Attribution must use the dark atlas palette: "+JSON.stringify(credits));
   const rail=page.locator("#ao-find-modular-root [data-mapcn-discover-rail]");
   await rail.waitFor({state:"visible"});
   assert.equal(await rail.getAttribute("data-discover-expanded"),"false",
     "The immersive map must begin with Discover in compact mode");
   assert.ok(await rail.locator("button[data-explore-open-place]").count()>0,
     "MapCN Discover must contain canonical actionable Places");
   assert.match(await rail.locator(".aoMapcnDiscoverTitle").innerText(),/In this area/i,
     "MapCN Discover should describe the current map viewport");
   const railGeometry=await rail.evaluate(el=>{const r=el.getBoundingClientRect();return {
     width:r.width,height:r.height,left:r.left,right:r.right,top:r.top,bottom:r.bottom};});
   assert.ok(railGeometry.width>280&&railGeometry.bottom<= (mobile?844:960)+1
    &&railGeometry.height<=75&&railGeometry.height>=60,
     "Collapsed Discover must leave the map visible: "+JSON.stringify(railGeometry));
   await page.screenshot({path:resolve(out,"explore-"+width+"-compact-discovery.png"),fullPage:false});
   await rail.locator("[data-mapcn-discover-toggle]").click();
   assert.equal(await rail.getAttribute("data-discover-expanded"),"true");
   assert.equal(await rail.locator("[data-mapcn-discover-toggle]").getAttribute("aria-expanded"),"true");
   // Height animates from its compact state. Measure only once the actual
   // expanded layout settles; an intermediate animation frame is not a defect.
   await page.waitForFunction(()=>{
     const rail=document.querySelector("#ao-find-modular-root [data-mapcn-discover-rail]");
     return rail?.dataset?.discoverExpanded==="true" && rail.getBoundingClientRect().height>300;
   },null,{timeout:4000});
   const openedRail=await rail.evaluate(el=>{const r=el.getBoundingClientRect();return {
     height:r.height,top:r.top,bottom:r.bottom,vh:innerHeight};});
   assert.ok(openedRail.height>150&&openedRail.top>=0&&openedRail.bottom<=openedRail.vh+1,
     "Expanded Discover must remain within the viewport: "+JSON.stringify(openedRail));
   await page.screenshot({path:resolve(out,"explore-"+width+"-expanded-discovery.png"),fullPage:false});
   const guide=page.locator("#ao-find-modular-root .aoHeritageMapHint");
   if(mobile){
     assert.equal(await guide.isVisible(),false,
       "On phones the browsable list replaces the old passive map hint");
   }else{
     await guide.waitFor({state:"visible"});
     assert.match(await guide.innerText(),/Numbers zoom.*icons open places/i);
   }
   const originalCanvas=await page.locator(".aoHeritageSurface .aoFindMap canvas.maplibregl-canvas").count();
   assert.equal(originalCanvas,1,"One map canvas, shared with canonical Explore");
   await rail.locator("button[data-explore-open-place]").first().click();
   await page.locator("#ao-find-modular-root .aoHeritagePreview").waitFor({state:"visible",timeout:15000});
   assert.equal(await rail.locator("button[data-explore-open-place]").first().getAttribute("aria-current"),"true",
     "Selected Place should remain synchronized with its map rail row");
   assert.equal(await page.locator(".aoHeritageSurface .aoFindMap canvas.maplibregl-canvas").count(),1,
     "Opening a rail Place must preserve the existing map canvas");
   await page.locator("#ao-find-modular-root .aoHeritageCardClose").click();
   await rail.waitFor({state:"visible"});
   assert.equal(await page.locator(".aoHeritageSurface .aoFindMap canvas.maplibregl-canvas").count(),1);
   await page.screenshot({path:resolve(out,"explore-"+width+"-overview.png"),fullPage:false});

   // Specialist tools are available through the secondary More navigation,
   // not as a second row permanently covering the map.
   const openMoreTool=async selector=>{
     const more=page.locator("#ao-find-modular-root .aoHeritageMore");
     await more.locator(":scope > summary").click();
     await more.locator(selector).click();
   };
   // P3 MapCN Uptime Monitor adaptation stays inside the SAME canonical map.
   await openMoreTool("[data-explore-time-mass-toggle]");
   const timeMass=page.locator("#ao-find-modular-root [data-explore-time-mass-panel]");
   await timeMass.waitFor({state:"visible",timeout:15000});
   assert.ok(await timeMass.locator("[data-explore-time-mass-date]").count()>0);
   assert.ok(await timeMass.locator(".aoTimeMassRow").count()>0,
     "P3 must show source-owned directory rows, not a template placeholder");
   assert.ok(await timeMass.locator("a[href^='https://']").count()>0,
     "P3 needs publisher links, not guessed times");
   assert.equal(await page.locator(".aoHeritageSurface .aoFindMap canvas.maplibregl-canvas").count(),1);
   await timeMass.locator("[data-explore-time-mass-date]").fill("2026-12-25");
   await timeMass.locator("[data-explore-time-mass-date]").dispatchEvent("change");
   await page.waitForFunction(()=>document.querySelector(".aoTimeMassSeason h3")?.textContent
     ?.includes("Christmas"),null,{timeout:10000});
   const boardFit=await timeMass.evaluate(el=>{const r=el.getBoundingClientRect();return {
     top:r.top,bottom:r.bottom,width:r.width,height:r.height,vh:innerHeight};});
   assert.ok(boardFit.top>=0&&boardFit.bottom<=boardFit.vh+1&&boardFit.height>230,
     "P3 panel must fit mobile and desktop: "+JSON.stringify(boardFit));
   await page.screenshot({path:resolve(out,"explore-"+width+"-time-mass.png"),fullPage:false});
   await timeMass.locator(".aoTimeMassHead [data-explore-time-mass-toggle]").click();
   await timeMass.waitFor({state:"detached",timeout:10000});
   assert.equal(await page.locator(".aoHeritageSurface .aoFindMap canvas.maplibregl-canvas").count(),1);
   // P4 MapCN Heatmap + Choropleth · exact canonical coverage only.
   await openMoreTool('[data-atlas-mode="heatmap"]');
   const atlas=page.locator("#ao-find-modular-root [data-atlas-coverage-panel]");
   await atlas.waitFor({state:"visible",timeout:15000});
   assert.equal(await atlas.getAttribute("data-atlas-mode"),"heatmap");
   assert.match(await atlas.locator(".aoAtlasCoverageCaution").innerText(),/not Catholic population/i);
   assert.ok(Number(await atlas.locator(".aoAtlasCoverageMetrics strong").first().textContent())>0);
   assert.equal(await page.locator(".aoHeritageSurface .aoFindMap canvas.maplibregl-canvas").count(),1);
   const atlasFit=await atlas.evaluate(el=>{const r=el.getBoundingClientRect();
     return {top:r.top,bottom:r.bottom,height:r.height,vh:innerHeight,overflow:document.documentElement.scrollWidth-innerWidth};});
   assert.ok(atlasFit.top>=0&&atlasFit.bottom<=atlasFit.vh+1&&atlasFit.height>200&&atlasFit.overflow<=1,
     "P4 heatmap panel must fit viewport: "+JSON.stringify(atlasFit));
   await page.screenshot({path:resolve(out,"explore-"+width+"-atlas-heatmap.png"),fullPage:false});
   await atlas.locator('[data-atlas-mode="countries"]').click();
   await atlas.waitFor({state:"visible",timeout:15000});
   assert.equal(await atlas.getAttribute("data-atlas-mode"),"countries");
   assert.ok(await atlas.locator('[data-atlas-country]').count()>0);
   await page.waitForFunction(()=>{
      const el=document.querySelector("[data-atlas-boundary-status]");
      return el&&/Natural Earth|unavailable/i.test(el.textContent||"");
   },null,{timeout:35000});
   await page.screenshot({path:resolve(out,"explore-"+width+"-atlas-countries.png"),fullPage:false});
   await atlas.locator('[data-atlas-scope="tlm"]').click();
   assert.equal(await atlas.locator('[data-atlas-scope="tlm"]').getAttribute("aria-pressed"),"true");
   await atlas.locator('[data-atlas-mode="places"]').first().click();
   await atlas.waitFor({state:"detached",timeout:15000});
   await page.locator("#ao-find-modular-root [data-mapcn-discover-rail]").waitFor({state:"visible"});
   assert.equal(await page.locator(".aoHeritageSurface .aoFindMap canvas.maplibregl-canvas").count(),1);
   // P5 · provenance-bound relationship graph, never a second map.
   await openMoreTool("[data-network-toggle]");
   const graph=page.locator("#ao-find-modular-root [data-network-panel]");
   await graph.waitFor({state:"visible",timeout:20000});
   assert.ok(Number(await graph.locator(".aoNetworkStats strong").first().textContent())>0,
      "Real canonical relationship nodes should be present");
   assert.ok(await graph.locator("a[href^='https://']").count()>0,
      "Network edges must expose original source links");
   assert.ok(await graph.locator(".aoNetworkSvgItem").count()>0,
      "The graph must render selectable relationship nodes");
   assert.equal(await page.locator(".aoHeritageSurface .aoFindMap canvas.maplibregl-canvas").count(),1,
      "P5 must preserve the existing MapLibre map");
   const graphFit=await graph.evaluate(el=>{
     const b=el.getBoundingClientRect();
     return {top:b.top,bottom:b.bottom,height:b.height,width:b.width,vh:innerHeight};
   });
   assert.ok(graphFit.top>=0&&graphFit.bottom<=graphFit.vh+1&&graphFit.height>230,
      "The network must stay within the available viewport: "+JSON.stringify(graphFit));
   await page.screenshot({path:resolve(out,"explore-"+width+"-network.png"),fullPage:false});
   const node=graph.locator(".aoNetworkSvgItem").first();
   await node.focus();
   await page.keyboard.press("Enter");
   await graph.waitFor({state:"visible",timeout:10000});
   await graph.locator("select[data-network-kind]").selectOption("place");
   assert.equal(await graph.locator("select[data-network-kind]").inputValue(),"place");
   // Provenance-bound custom and attributed-name facets at 320, 390 and 1440.
   await graph.locator("select[data-network-kind]").selectOption("custom");
   assert.ok(await graph.locator(".aoNetworkResults button[data-network-focus^='custom:']").count()>0);
   // On phones the result rail is intentionally hidden: selecting the facet
   // focuses its first sourced record and exposes the canonical custom CTA.
   await graph.locator("[data-network-open-custom]").first().waitFor({state:"visible"});
   const customSearch=graph.locator("input[data-network-search]");
   await customSearch.fill("Ex-votos");
   await page.waitForFunction(()=>document.querySelector(
     "#ao-find-modular-root .aoNetworkCurrent h3")?.textContent==="Ex-votos",null,{timeout:8000});
   await customSearch.fill("");
   await graph.locator("[data-network-open-custom]").first().waitFor({state:"visible"});
   assert.ok(await graph.locator("a[href^='https://']").count()>0);
   await page.screenshot({path:resolve(out,"explore-"+width+"-network-custom.png"),fullPage:false});
   await graph.locator("select[data-network-kind]").selectOption("person");
   assert.ok(await graph.locator(".aoNetworkResults button[data-network-focus^='person:']").count()>0);
   await graph.locator(".aoNetworkMention").waitFor({state:"visible"});
   assert.match(await graph.locator(".aoNetworkMention").innerText(),/not a linked Saints profile/i);
   await page.screenshot({path:resolve(out,"explore-"+width+"-network-person.png"),fullPage:false});
   await graph.locator("button[data-network-close]").click();
   await graph.waitFor({state:"detached",timeout:10000});
   await page.locator("#ao-find-modular-root [data-mapcn-discover-rail]").waitFor({state:"visible"});
   assert.equal(await page.locator(".aoHeritageSurface .aoFindMap canvas.maplibregl-canvas").count(),1);
   // P5: custom CTA must open a grouped canonical custom, not a bare
   // geographic attestation. Verify this at all three accepted viewport sizes.
   await openMoreTool("[data-network-toggle]");
   await graph.waitFor({state:"visible"});
   await graph.locator("select[data-network-kind]").selectOption("custom");
   const customCta=graph.locator(".aoNetworkCurrent [data-network-open-custom]");
   await customCta.waitFor({state:"visible"});
   const canonicalId=await customCta.getAttribute("data-network-open-custom");
   await customCta.click();
   const networkCustomFolio=page.locator('#ao-find-modular-root .aoExploreTraditionSheet[data-explore-custom-id="'+canonicalId+'"]');
   await networkCustomFolio.waitFor({state:"visible",timeout:12000});
   assert.ok(await networkCustomFolio.locator("a[href^='https://']").count()>0,
     "Canonical custom handoff must preserve independently cited publishers");
   assert.equal(await graph.count(),0);
   await page.screenshot({path:resolve(out,"explore-"+width+"-network-custom-folio.png"),fullPage:false});
   assert.equal(await page.evaluate(()=>globalThis.AO_FIND_APP_V1.open({lens:"heritage"})),true);
   await page.locator("#ao-find-modular-root [data-mapcn-discover-rail]").waitFor({state:"visible"});
   assert.equal(await page.locator(".aoHeritageSurface .aoFindMap canvas.maplibregl-canvas").count(),1);
   // P6: canonical three-letter identifiers must round-trip through the
   // existing Calendar-to-Explore owner; research-only IDs must fail closed.
   assert.equal(await page.evaluate(()=>globalThis.AO_FIND_APP_V1.open({
     lens:"traditions",customId:"DEV-010",expandDetail:true})),true);
   await page.locator('#ao-find-modular-root .aoExploreTraditionSheet[data-explore-custom-id="DEV-010"]').waitFor({state:"visible"});
   assert.equal(await page.evaluate(()=>globalThis.AO_FIND_APP_V1.open({
     lens:"traditions",customId:"DEV-999"})),false);
   assert.equal(await page.locator('#ao-find-modular-root .aoExploreTraditionSheet[data-explore-custom-id="DEV-010"]').count(),1);
   assert.equal(await page.evaluate(()=>globalThis.AO_FIND_APP_V1.open({lens:"heritage"})),true);
   await page.locator("#ao-find-modular-root [data-mapcn-discover-rail]").waitFor({state:"visible"});
   assert.equal(await page.locator(".aoHeritageSurface .aoFindMap canvas.maplibregl-canvas").count(),1,
     "P6 cross-lens return must preserve a single MapLibre canvas");
   const p6French=await page.evaluate(async()=>{
     globalThis.AO_RUNTIME_V8.store.dispatch({type:"set-language",language:"fr"});
     await globalThis.AO_FIND_APP_V1.paint();
     return globalThis.AO_RUNTIME_V8.store.getState().language;
   });
   assert.equal(p6French,"fr");
   await openMoreTool("[data-network-toggle]");
   await graph.waitFor({state:"visible"});
   await graph.locator("select[data-network-kind]").selectOption("person");
   assert.ok(await graph.locator("a[href^='https://']").count()>0);
   await page.screenshot({path:resolve(out,"explore-"+width+"-network-fr.png"),fullPage:false});
   await graph.locator("button[data-network-close]").click();
   assert.equal(await page.evaluate(async()=>{
     globalThis.AO_RUNTIME_V8.store.dispatch({type:"set-language",language:"en"});
     await globalThis.AO_FIND_APP_V1.paint();
     return globalThis.AO_RUNTIME_V8.store.getState().language;
   }),"en");
   await page.locator("#ao-find-modular-root [data-mapcn-discover-rail]").waitFor({state:"visible"});
   // D is a same-map journey folio: no new page and no manufactured route
   // lines. Exercise a historical source-owned 3-stage pilgrimage.
   await openMoreTool("[data-explore-journey-open]");
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
   // 2026 Walsingham deliberately ends at Priory grounds, not the linked
   // Roman Catholic Shrine. Review the warning and related-place CTA.
   await journey.locator('[data-explore-journey-select="route:GB:ely-walsingham-lms"]').click();
   await page.waitForFunction(()=>document.querySelector("#ao-find-modular-root .aoJourneyDetail h3")
      ?.textContent?.includes("Ely to Walsingham"),null,{timeout:15000});
   assert.equal(await journey.locator("[data-journey-named-stage]").count(),3);
   await journey.locator(".aoJourneyEndpointWarning").waitFor({state:"visible"});
   assert.ok((await journey.locator(".aoJourneyEndpointWarning").innerText()).includes("NOT the pilgrimage endpoint"));
   assert.equal(await journey.locator("[data-explore-journey-focus]").count(),0,
     "Never offer exact destination navigation to the wrong Catholic Shrine");
   await page.waitForTimeout(500);
   await page.screenshot({path:resolve(out,"explore-"+width+"-journey-walsingham-2026.png"),fullPage:false});
   await journey.locator('[data-explore-journey-select="route:NZ:nga-tapuwae-russell"]').click();
   await page.waitForFunction(()=>document.querySelector("#ao-find-modular-root .aoJourneyDetail h3")
      ?.textContent?.includes("Ngā Tapuwae"),null,{timeout:12000});
   await journey.locator(".aoJourneyModeWarning").waitFor({state:"visible"});
   assert.match(await journey.locator(".aoJourneyModeWarning").innerText(),/driving and ferry transfers/);
   assert.equal(await journey.locator("[data-journey-named-stage]").count(),0,
     "A multimodal regional booklet must not be converted to fabricated walking stages");
   assert.ok((await journey.locator('.aoJourneyOfficialMap[href*="NGA-TAPUWAE-Route-Overview"]').count())===1,
     "Diocesan PDF remains a link-only publication, not copied geometry");
   await page.screenshot({path:resolve(out,"explore-"+width+"-journey-nga-tapuwae.png"),fullPage:false});
   // Holywell has two independently sourced, geographically distinct sacred
   // places already in the canonical registry. Buttons focus those pins;
   // the journey still does NOT claim to know the walking path between them.
   await journey.locator('[data-explore-journey-select="route:GB:holywell-church-to-well"]').click();
   await page.waitForFunction(()=>document.querySelector("#ao-find-modular-root .aoJourneyDetail h3")
      ?.textContent?.includes("St Winefride"),null,{timeout:12000});
   assert.equal(await journey.locator("[data-explore-journey-stage-focus]").count(),2);
   await page.waitForFunction(()=>document.querySelectorAll(
      "#ao-find-modular-root [data-journey-map-stage]").length===2,null,{timeout:12000});
   const stageMarkerSizes=await page.locator("[data-journey-map-stage]").evaluateAll(markers=>
     markers.map(marker=>({width:marker.getBoundingClientRect().width,
       height:marker.getBoundingClientRect().height})));
   assert.ok(stageMarkerSizes.length===2&&stageMarkerSizes.every(size=>size.width>=43.99&&size.height>=43.99),
     "Journey map medallions need 44px touch targets: "+JSON.stringify(stageMarkerSizes));
   const holywellStage=journey.locator('[data-explore-journey-stage-focus="route:GB:holywell-church-to-well#stage-1"]');
   await holywellStage.click();
   assert.equal(await holywellStage.getAttribute("aria-pressed"),"true");
   assert.ok((await journey.locator(".aoJourneyNoLine").innerText()).includes("No route line"),
     "Two matched canonical site anchors are not walking geometry");
   await page.waitForTimeout(600);
   const stageGap=await page.locator("[data-journey-map-stage]").evaluateAll(buttons=>{
     if(buttons.length!==2)return -1;
     const [a,b]=buttons.map(button=>button.getBoundingClientRect());
     return Math.hypot(a.left+a.width/2-b.left-b.width/2,
       a.top+a.height/2-b.top-b.height/2);
   });
   assert.ok(stageGap>=48,"Two distinct Holywell site medallions must be visually separated: "+stageGap);
   await page.screenshot({path:resolve(out,"explore-"+width+"-journey-holywell-site-markers.png"),fullPage:false});
   // D-to-C round trip must preserve the same map and selected Journey.
   // The stage number still focuses the map; its name opens the Place folio.
   await page.evaluate(()=>globalThis.__AO_JOURNEY_CANVAS_REVIEW=
     document.querySelector("#ao-find-modular-root .maplibregl-canvas"));
   assert.equal(await journey.locator("[data-explore-journey-stage-place]").count(),2);
   await journey.locator('[data-explore-journey-stage-place="route:GB:holywell-church-to-well#stage-1"]').click();
   const stagePlace=page.locator('#ao-find-modular-root .aoHeritagePreview[data-explore-place-owner="place:GB:holywell-st-winefride-church"]');
   await stagePlace.waitFor({state:"visible",timeout:12000});
   assert.equal(await journey.count(),1,"Opening a sacred place preserves the pilgrimage beneath it");
   assert.equal(await journey.evaluate(el=>getComputedStyle(el).visibility),"hidden",
     "A preserved Journey must not remain visually superimposed beneath the C Place folio");
   if(mobile){
     const noPhoto=await stagePlace.evaluate(el=>{
       const title=el.querySelector(".aoHeritageCardTitle"),
         empty=el.querySelector(".aoHeritageCardEmpty");
       if(!empty||!title||el.querySelector(".aoHeritagePlaceThumb"))return null;
       const t=title.getBoundingClientRect(),e=empty.getBoundingClientRect();
       return {titleLeft:t.left,textLeft:e.left,textWidth:e.width};
     });
     assert.ok(noPhoto&&Math.abs(noPhoto.titleLeft-noPhoto.textLeft)<16&&noPhoto.textWidth>0.75*width,
       "No-photo Place preview needs one legible mobile text column: "+JSON.stringify(noPhoto));
   }
   assert.ok(await page.evaluate(()=>globalThis.__AO_JOURNEY_CANVAS_REVIEW===
     document.querySelector("#ao-find-modular-root .maplibregl-canvas")),
     "Place preview may not remount the map");
   assert.match(await stagePlace.locator("[data-find-close-place]").getAttribute("aria-label"),
     /Return to pilgrimage journey/);
   await page.screenshot({path:resolve(out,"explore-"+width+"-journey-holywell-place-preview.png"),fullPage:false});
   await stagePlace.locator("[data-explore-expand-place]").click();
   const expandedPlace=page.locator('#ao-find-modular-root .aoExplorePlaceSheet[data-explore-place-owner="place:GB:holywell-st-winefride-church"]');
   await expandedPlace.waitFor({state:"visible",timeout:12000});
   assert.equal(await page.locator("#ao-find-modular-root .aoHeritageCardLayer:visible").count(),0,
     "The expanded Place must hide the underlying preview and its duplicate close control");
   const holywellCloseState=await expandedPlace.locator('header button[data-find-close-place]').evaluate(button=>({
     svgCount:button.querySelectorAll('svg.aoUiIcon').length,
     fallbackCount:button.querySelectorAll('[data-ao-asset-id="ao-ui-close"]').length,
     fallbackDisplay:getComputedStyle(button.querySelector('[data-ao-asset-id="ao-ui-close"]')).display,
   }));
   assert.ok(holywellCloseState.fallbackCount===1&&(
     (holywellCloseState.svgCount===0&&holywellCloseState.fallbackDisplay!=="none")||
     (holywellCloseState.svgCount===1&&holywellCloseState.fallbackDisplay==="none")),
     "Expanded Holywell close must show one glyph before OR after SVG hydration: "+JSON.stringify(holywellCloseState));
   assert.match(await expandedPlace.locator("header small").innerText(),/PILGRIMAGE PLACE/);
   await expandedPlace.locator("header [data-find-close-place]").click();
   await page.waitForFunction(()=>!document.querySelector("#ao-find-modular-root .aoFindSheetBackdrop"),null,{timeout:12000});
   assert.equal(await journey.evaluate(el=>getComputedStyle(el).visibility),"visible",
     "Closing the Place folio must reveal the exact same Journey");
   assert.equal(await journey.locator('[data-explore-journey-select="route:GB:holywell-church-to-well"]').getAttribute("aria-pressed"),"true");
   assert.equal(await journey.locator("[data-explore-journey-stage-place]").count(),2);
   assert.ok(await page.evaluate(()=>globalThis.__AO_JOURNEY_CANVAS_REVIEW===
     document.querySelector("#ao-find-modular-root .maplibregl-canvas")),
     "Returning from a Place must keep map canvas unchanged");
   const shrineMarker=page.locator('[data-journey-map-stage="route:GB:holywell-church-to-well#stage-2"]');
   await shrineMarker.click();
   const shrinePlace=page.locator('#ao-find-modular-root .aoHeritagePreview[data-explore-place-owner="place:GB:holywell-st-winefride"]');
   await shrinePlace.waitFor({state:"visible",timeout:12000});
   await shrinePlace.locator("[data-find-close-place]").click();
   assert.equal(await journey.locator('[data-explore-journey-select="route:GB:holywell-church-to-well"]').getAttribute("aria-pressed"),"true",
     "Clicking a map-stage medallion must also return to the existing selected pilgrimage");
   assert.ok(await page.evaluate(()=>globalThis.__AO_JOURNEY_CANVAS_REVIEW===
     document.querySelector("#ao-find-modular-root .maplibregl-canvas")));
   // The two Mauritius Père Laval routes share a canonical sanctuary but
   // only Saint-Louis has a separately sourced departure point. A missing
   // Terre-Rouge coordinate must never become an invented map marker.
   await journey.locator('[data-explore-journey-select="route:MU:pere-laval-saint-louis"]').click();
   await page.waitForFunction(()=>document.querySelector(".aoJourneyDetail h3")?.textContent?.includes("Saint-Louis"),
     null,{timeout:12000});
   assert.equal(await journey.locator("[data-explore-journey-stage-place]").count(),2);
   assert.equal(await page.locator("#ao-find-modular-root [data-journey-map-stage]").count(),2);
   await journey.locator('[data-explore-journey-stage-place="route:MU:pere-laval-saint-louis#stage-1"]').click();
   const cathedralPlace=page.locator('#ao-find-modular-root .aoHeritagePreview[data-explore-place-owner="place:MU:saint-louis-cathedral-port-louis"]');
   await cathedralPlace.waitFor({state:"visible",timeout:12000});
   await cathedralPlace.locator("[data-find-close-place]").click();
   assert.equal(await journey.locator('[data-explore-journey-select="route:MU:pere-laval-saint-louis"]').getAttribute("aria-pressed"),"true");
   await journey.locator('[data-explore-journey-select="route:MU:pere-laval-saint-joseph"]').click();
   await page.waitForFunction(()=>document.querySelector(".aoJourneyDetail h3")?.textContent?.includes("Saint-Joseph"),
     null,{timeout:12000});
   assert.equal(await journey.locator("[data-explore-journey-stage-place]").count(),1,
     "Terre-Rouge departure has not been independently geocoded");
   assert.equal(await page.locator("#ao-find-modular-root [data-journey-map-stage]").count(),1);
   await journey.locator('[data-explore-journey-select="route:FR:paris-chartres-pentecost"]').click();
   await journey.locator('[data-explore-journey-destination="place:FR:chartres-notre-dame"]').click();
   const chartresPlace=page.locator('#ao-find-modular-root .aoHeritagePreview[data-explore-place-owner="place:FR:chartres-notre-dame"]');
   await chartresPlace.waitFor({state:"visible"});
   assert.equal(await journey.count(),1,
     "Discovering a destination must keep the active Journey under its C editorial Place folio");
   assert.ok(await page.evaluate(()=>globalThis.__AO_JOURNEY_CANVAS_REVIEW===
     document.querySelector("#ao-find-modular-root .maplibregl-canvas")),
     "Destination CTA must keep the same map canvas");
   await chartresPlace.locator("[data-find-close-place]").click();
   assert.equal(await journey.locator('[data-explore-journey-select="route:FR:paris-chartres-pentecost"]').getAttribute("aria-pressed"),"true");
   await journey.locator("[data-explore-journey-close]").click();
   assert.equal(await journey.count(),0,
     "Explicit Journey close returns to the Atlas; Place sheet close does not");

   const search=page.locator("#ao-find-modular-root .aoHeritageSurface [data-find-query]");
   // C -> D: enter from an ordinary Atlas Place preview, with Journey closed.
   // The reverse link must choose the exact route and reuse the same map.
   await search.fill("Chartres");
   const chartresSearch=page.locator('#ao-find-modular-root .aoHeritageSearchResults [data-explore-open-place="place:FR:chartres-notre-dame"]');
   await chartresSearch.waitFor({state:"visible",timeout:15000});
   await chartresSearch.click();
   const reverseChartres=page.locator('#ao-find-modular-root .aoHeritagePreview[data-explore-place-owner="place:FR:chartres-notre-dame"]');
   await reverseChartres.waitFor({state:"visible",timeout:12000});
   assert.equal(await reverseChartres.locator('[data-explore-place-journey="route:FR:paris-chartres-pentecost"]').count(),1);
   assert.equal(await journey.count(),0);
   await reverseChartres.locator('[data-explore-place-journey="route:FR:paris-chartres-pentecost"]').click();
   await journey.waitFor({state:"visible",timeout:12000});
   assert.equal(await journey.locator('[data-explore-journey-select="route:FR:paris-chartres-pentecost"]').getAttribute("aria-pressed"),"true");
   assert.ok(await page.evaluate(()=>globalThis.__AO_JOURNEY_CANVAS_REVIEW===
     document.querySelector("#ao-find-modular-root .maplibregl-canvas")),
     "Reverse Place→Journey selection must not create a second map");
   await page.screenshot({path:resolve(out,"explore-"+width+"-chartres-place-to-journey.png"),fullPage:false});
   await journey.locator("[data-explore-journey-close]").click();
   assert.equal(await journey.count(),0);

   // A destination with two documented departures must present both routes,
   // never arbitrarily choose one when entering from its Sacred Atlas page.
   await search.fill("Père Laval");
   const lavalSearch=page.locator('#ao-find-modular-root .aoHeritageSearchResults [data-explore-open-place="place:MU:pere-laval-sainte-croix"]');
   await lavalSearch.waitFor({state:"visible",timeout:15000});
   await lavalSearch.click();
   const lavalPreview=page.locator('#ao-find-modular-root .aoHeritagePreview[data-explore-place-owner="place:MU:pere-laval-sainte-croix"]');
   await lavalPreview.waitFor({state:"visible",timeout:12000});
   assert.equal(await lavalPreview.locator("[data-explore-place-journey-list]").count(),1);
   await lavalPreview.locator("[data-explore-place-journey-list]").click();
   const lavalFull=page.locator('#ao-find-modular-root .aoExplorePlaceSheet[data-explore-place-owner="place:MU:pere-laval-sainte-croix"]');
   await lavalFull.waitFor({state:"visible",timeout:12000});
   assert.equal(await lavalFull.locator("[data-explore-place-journey]").count(),2);
   const reverseList=lavalFull.locator("[data-explore-place-journeys]");
   await reverseList.scrollIntoViewIfNeeded();
   const visibleRouteRows=await reverseList.locator("[data-explore-place-journey]").evaluateAll(rows=>
     rows.every(row=>{const box=row.getBoundingClientRect();return box.height>=44&&box.top<innerHeight&&box.bottom>0;}));
   assert.ok(visibleRouteRows,"Both documented Père Laval pilgrimage choices need visible, usable 44px targets");
   const lavalCloseState=await lavalFull.locator('header button[data-find-close-place]').evaluate(button=>({
     svgCount:button.querySelectorAll('svg.aoUiIcon').length,
     fallbackCount:button.querySelectorAll('[data-ao-asset-id="ao-ui-close"]').length,
     fallbackDisplay:getComputedStyle(button.querySelector('[data-ao-asset-id="ao-ui-close"]')).display,
   }));
   assert.ok(lavalCloseState.fallbackCount===1&&(
     (lavalCloseState.svgCount===0&&lavalCloseState.fallbackDisplay!=="none")||
     (lavalCloseState.svgCount===1&&lavalCloseState.fallbackDisplay==="none")),
     "Père Laval close must show one glyph before OR after SVG hydration: "+JSON.stringify(lavalCloseState));
   assert.equal(await lavalFull.locator('header button[data-find-close-place]').count(),1,
     "Expanded Place must contain exactly one close button");
   await page.screenshot({path:resolve(out,"explore-"+width+"-pere-laval-two-pilgrimages.png"),fullPage:false});
   await lavalFull.locator('[data-explore-place-journey="route:MU:pere-laval-saint-joseph"]').click();
   await journey.waitFor({state:"visible",timeout:12000});
   assert.equal(await journey.locator('[data-explore-journey-select="route:MU:pere-laval-saint-joseph"]').getAttribute("aria-pressed"),"true");
   assert.ok(await page.evaluate(()=>globalThis.__AO_JOURNEY_CANVAS_REVIEW===
     document.querySelector("#ao-find-modular-root .maplibregl-canvas")));
   await journey.locator("[data-explore-journey-close]").click();

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
   // Wikimedia-hosted institute images can outlive the MapLibre idle event.
   // Wait for a decoded image instead of equating a positioned DOM emblem
   // overlay with a fully painted crest. This is a strict visual gate.
   await page.waitForFunction(()=>{
     const map=globalThis.__AO_EXPLORE_VISUAL_REVIEW_MAP;
     if(!map?.getLayer?.("ao-explore-points"))return false;
     const points=map.queryRenderedFeatures?.({layers:["ao-explore-points"]})||[];
     const eligible=points.some(p=>["FSSP","ICKSP","IBP","SSPX","DIOCESAN"].includes(
       String(p.properties?.provider_group||"")));
     if(!eligible)return true;
     if(map.getLayer?.("ao-explore-institution-emblems"))return true;
     return [...document.querySelectorAll(".aoExploreInstitutionMapPin img")]
       .some(img=>img.complete&&img.naturalWidth>0);
   },null,{timeout:18000,polling:250});
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
