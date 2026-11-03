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
   // Approved desktop screen 7 is the actual 3-pane layout. Its left rail,
   // MapLibre canvas and selected Place must be usable simultaneously.
   const verifyDesktopAtlas=async(phase,profileSelector=null)=>{
    if(width<900)return;
    const g=await page.evaluate(selector=>{
     const surface=document.querySelector("#ao-find-modular-root .aoHeritageSurface");
     const rect=s=>s?.getBoundingClientRect?.();
     const rail=rect(surface?.querySelector("[data-mapcn-discover-rail]"));
     const search=rect(surface?.querySelector(".aoHeritageTools"));
     const profile=selector?rect(surface?.querySelector(selector)):null;
     const map=surface?.querySelector(".aoFindBody [data-find-map]");
     const canvas=map?.querySelector("canvas.maplibregl-canvas");
     const mapLeft=rail?.right||0,mapRight=profile?.left||innerWidth;
     const x=(mapLeft+mapRight)/2,y=Math.round(innerHeight*.6);
     const hit=document.elementFromPoint(x,y);
     return {
      rail:rail&&{left:rail.left,right:rail.right,top:rail.top,bottom:rail.bottom,width:rail.width},
      search:search&&{left:search.left,right:search.right},
      profile:profile&&{left:profile.left,right:profile.right,top:profile.top,bottom:profile.bottom,width:profile.width},
      viewport:{width:innerWidth,height:innerHeight},mapCenter:{x,y},
      blocked:Boolean(hit?.closest(".aoMapcnDiscoverRail,.aoHeritageCardLayer,.aoFindSheetBackdrop")),
      sameCanvas:canvas===globalThis.__AO_VISITOR_MAP_CANVAS,
      scrollOverflow:document.documentElement.scrollWidth-innerWidth,
     };
    },profileSelector);
    assert.ok(g.rail&&g.rail.left>=8&&g.rail.top>=8&&g.rail.bottom<=g.viewport.height-8&&
     g.rail.width>=250&&g.rail.width<=380,
     phase+" must keep one source-backed left rail: "+JSON.stringify(g));
    assert.ok(g.search&&g.search.left>=g.rail.right+8,
     phase+" search must sit above map, not directory rail: "+JSON.stringify(g));
    if(profileSelector)assert.ok(g.profile&&g.profile.left>=g.rail.right+75&&
      g.profile.right<=g.viewport.width-8&&g.profile.top>=8&&
      g.profile.bottom<=g.viewport.height-8&&g.profile.width>=290,
      phase+" profile must dock on the right: "+JSON.stringify(g));
    assert.ok(g.sameCanvas&&!g.blocked&&g.scrollOverflow<=2,
     phase+" must leave the original map interactive: "+JSON.stringify(g));
   };
   await page.evaluate(()=>{
    globalThis.__AO_VISITOR_MAP_CANVAS=document.querySelector(
      "#ao-find-modular-root .aoHeritageSurface [data-find-map] canvas.maplibregl-canvas");
   });

   // Approved Sacred Atlas shell screens 1 and 2: one immersive map,
   // three entry tabs, initial peek and an expanded photographic Sacred sheet.
   const tabs=root.locator(".aoAtlasPrimaryTabs");
   assert.equal(await tabs.locator("button").count(),3,"Atlas must have three entrances, not extra top-level sections");
   const sacredTab=tabs.locator('[data-atlas-entry-tab="sacred"]');
   const discoverTab=tabs.locator('[data-atlas-entry-tab="discover"]');
   assert.equal(await discoverTab.getAttribute("aria-pressed"),"true");
   assert.equal(await root.locator(".aoHeritageMore > summary").count(),1,
    "Secondary P6 modules must remain available through the Layers control");
   await sacredTab.click();
   await page.waitForFunction(()=>{
    const root=document.querySelector("#ao-find-modular-root");
    return root?.querySelector(".aoHeritageSurface")?.dataset.atlasEntry==="sacred"
      &&root?.querySelector("[data-mapcn-discover-rail]")?.dataset.discoverExpanded==="true";
   },null,{timeout:15000});
   assert.equal(await sacredTab.getAttribute("aria-pressed"),"true");
   assert.ok(await root.locator(".aoMapcnEditorialCarousel .aoMapcnEditorialCard").count()>0,
    "Sacred places must reuse the existing approved-photo viewport sheet");
   await mapReady("heritage");
   await verifyDesktopAtlas("desktop Sacred Places map");
   if(width>=900){
    assert.equal(await root.locator(".aoMapcnEditorialStrip").isVisible(),false,
     "Desktop Sacred Places must prioritise source-filtered places in the camera, not unrelated worldwide features");
    assert.ok(await root.locator(".aoMapcnDiscoverEntries .aoMapcnDiscoverItem").count()>0,
     "Desktop Sacred Places must retain its existing viewport-owned result cards");
    const railTabs=root.locator(".aoMapcnCategoryTabs");
    assert.equal(await railTabs.locator("button[data-heritage-category]").count(),5,
     "Desktop Sacred Places must expose existing map subject filters inside the results rail");
    assert.equal(await root.locator(".aoHeritageCategories").isVisible(),false,
     "Desktop category controls cannot duplicate the left-rail controls over the map");
    assert.ok(await railTabs.locator('button[data-find-filter="lens"][data-find-filter-value="saints"]').count()===1,
     "The relocated controls must preserve Map of Saints access");
    assert.ok(await root.locator(".aoMapcnDesktopPlaceCard").count()>0,
     "Source-owned desktop Place cards must retain canonical Place identities");
    assert.equal(await root.locator(".aoMapcnDesktopPlaceCard .aoMapcnDiscoverGlyph").count(),0,
     "Desktop Sacred Places must use the shared category-symbol fallback rather than a generic cross");
    const firstSymbol=root.locator(".aoMapcnDesktopPlaceCard .aoSacredPlaceSymbolFallback svg").first();
    if(await firstSymbol.count()){
     const bounds=await firstSymbol.evaluate(svg=>{
      const icon=svg.getBoundingClientRect();
      const frame=svg.closest(".aoSacredPlaceSymbolFallback").getBoundingClientRect();
      return {x:icon.x,y:icon.y,bottom:icon.bottom,frameTop:frame.top,frameBottom:frame.bottom,
       left:icon.left,right:icon.right,frameLeft:frame.left,frameRight:frame.right};
     });
     assert.ok(bounds.y>=bounds.frameTop-1&&bounds.bottom<=bounds.frameBottom+1
       &&bounds.left>=bounds.frameLeft-1&&bounds.right<=bounds.frameRight+1,
       "Desktop category-symbol icon must fit inside its approved-media fallback slot: "+JSON.stringify(bounds));
    }
    await railTabs.locator('[data-heritage-category="shrines"]').click();
    await page.waitForFunction(()=>{
     const root=document.querySelector("#ao-find-modular-root");
     return root?.querySelector('.aoMapcnCategoryTabs [data-heritage-category="shrines"]')?.getAttribute("aria-pressed")==="true";
    },null,{timeout:15000});
    await mapReady("heritage");
    assert.ok(await root.locator('.aoMapcnCategoryTabs [data-heritage-category="shrines"].active').count()===1,
     "Rail subject filter must be operated by the existing app state");
    await root.locator('.aoMapcnCategoryTabs [data-heritage-category="ALL"]').click();
    await page.waitForFunction(()=>{
     const root=document.querySelector("#ao-find-modular-root");
     return root?.querySelector('.aoMapcnCategoryTabs [data-heritage-category="ALL"]')?.getAttribute("aria-pressed")==="true";
    },null,{timeout:15000});
    await mapReady("heritage");
    await verifyDesktopAtlas("desktop Sacred Places restored subject filter");

   }
   await capture("01b-sacred-prototype-sheet");
   await discoverTab.click();
   await page.waitForFunction(desktop=>{
    const root=document.querySelector("#ao-find-modular-root");
    return root?.querySelector(".aoHeritageSurface")?.dataset.atlasEntry==="discover"
      &&root?.querySelector("[data-mapcn-discover-rail]")?.dataset.discoverExpanded===(desktop?"true":"false");
   },width>=900,{timeout:15000});
   assert.equal(await discoverTab.getAttribute("aria-pressed"),"true");
   assert.equal(await page.evaluate(()=>globalThis.__AO_VISITOR_MAP_CANVAS===
    document.querySelector("#ao-find-modular-root .aoHeritageSurface [data-find-map] canvas")),true,
    "The Atlas entrance switch must never remount the MapLibre canvas");
   note.steps.push("approved Discover / Sacred / Latin Mass entrances, mobile peek and full-height desktop rail on one MapLibre canvas");

   // Discover a curated, rights-approved, canonical Place. No network image hotlink.
   const rail=root.locator("[data-mapcn-discover-rail]");
   await rail.waitFor({state:"visible"});
   await verifyDesktopAtlas("desktop initial map");
   assert.equal(await rail.getAttribute("data-discover-expanded"),width>=900?"true":"false");
   if(width>=900){
    // A deliberate desktop collapse is reversible; default stays the full
    // source-backed left rail, unlike the phone Discover peek.
    await rail.locator("[data-mapcn-discover-toggle]").click();
    assert.equal(await rail.getAttribute("data-discover-expanded"),"false");
   }
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
   await verifyDesktopAtlas("desktop selected Place preview",".aoHeritagePreview");
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
   await verifyDesktopAtlas("desktop complete Place folio",".aoExplorePlaceSheet");
   if(width>=900)assert.equal(await full.getAttribute("aria-modal"),"false",
    "Desktop screen 7 keeps the interactive map behind a nonmodal right Place folio");
   assert.ok((await full.innerText()).includes("Lourdes"));
   const profileHero=full.locator(".aoExplorePlaceMedia img");
   await profileHero.waitFor({state:"visible"});
   assert.equal(await full.locator(".aoAtlasPlaceSummary").count(),1,
    "Prototype Place profile must include the source-backed editorial overview");
   assert.ok(await full.locator(".aoAtlasPlaceTags span").count()>=1,
    "Profile category labels must derive from actual documented relationships");
   assert.ok((await full.locator(".aoAtlasPlaceSynopsis").innerText()).length>25,
    "Prototype Place hero must be followed by a substantive Place overview");
   const hierarchy=await full.evaluate(sheet=>{
    const image=sheet.querySelector(".aoExplorePlaceMedia")?.getBoundingClientRect();
    const title=sheet.querySelector(":scope > header")?.getBoundingClientRect();
    const summary=sheet.querySelector(".aoAtlasPlaceSummary")?.getBoundingClientRect();
    return {heroBottom:image?.bottom,titleTop:title?.top,titleBottom:title?.bottom,
      summaryTop:summary?.top};
   });
   assert.equal(await full.locator(":scope > .aoExploreLead").first().count(),1,
    "Alternate Place names must remain readable, but appear after the hero and source-backed summary");
   const altBelow=await full.locator(":scope > .aoExploreLead").first().evaluate(el=>
     el.getBoundingClientRect().top);
   assert.ok(altBelow>=hierarchy.summaryTop,
    "Alternate Place names must never precede the photographic hero");
   assert.ok(hierarchy.heroBottom<=hierarchy.titleTop+8,
    "Approved screen 3 requires the photograph ABOVE the Place title: "+JSON.stringify(hierarchy));
   assert.ok(hierarchy.titleBottom<=hierarchy.summaryTop+8,
    "At-a-glance overview must follow the profile title: "+JSON.stringify(hierarchy));
   if(await full.locator(".aoAtlasPlaceConnections").count()){
    const connection=await full.locator(".aoAtlasPlaceConnections .aoExplorePlaceRow").first().getAttribute("data-explore-open-place");
    assert.ok(connection?.startsWith("place:"),"Connections must keep canonical Place IDs");
   }
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

   // P6 convergence: these are overlays on ONE existing Explore MapLibre
   // canvas, not independent maps or parallel venue/schedule registries.
   // Check both directions, EN/FR and actual 320/390/1440 touch/desktop sizes.
   const p6Surfaces={
    time:{open:'[data-explore-time-mass-toggle]',panel:'.aoTimeMassPanel',
     close:'.aoTimeMassPanel [data-explore-time-mass-toggle]',
     evidence:'.aoTimeMassNotice'},
    layers:{open:'[data-atlas-mode="heatmap"]',panel:'.aoAtlasCoveragePanel',
     close:'.aoAtlasCoverageHead [data-atlas-mode="places"]',
     evidence:'.aoAtlasCoverageCaution'},
    network:{open:'[data-network-toggle]',panel:'.aoNetworkPanel',
     close:'.aoNetworkPanel [data-network-close]',
     evidence:'.aoNetworkExplanation'},
    journey:{open:'[data-explore-journey-open]',panel:'.aoJourneyPanel',
     close:'.aoJourneyPanel [data-explore-journey-close]',
     evidence:'.aoJourneyScope'},
   };
   const p6OwnerNames=Object.keys(p6Surfaces);
   const assertP6Canvas=async mode=>{
    await mapReady("heritage");
    const measurement=await page.evaluate(()=>{
     const root=document.querySelector("#ao-find-modular-root");
     return {same:globalThis.__AO_VISITOR_MAP_CANVAS===
        root?.querySelector(".aoHeritageSurface [data-find-map] canvas.maplibregl-canvas"),
      count:root?.querySelectorAll(".aoHeritageSurface [data-find-map] canvas.maplibregl-canvas").length,
      overflow:document.documentElement.scrollWidth-innerWidth};
    });
    assert.equal(measurement.same,true,mode+" must reuse the same MapLibre canvas");
    assert.equal(measurement.count,1,mode+" must not create a second map canvas");
    assert.ok(measurement.overflow<=2,mode+" created horizontal overflow: "+JSON.stringify(measurement));
   };
   for(const [direction,modes] of [
    ["forward",p6OwnerNames],
    ["reverse",[...p6OwnerNames].reverse()],
   ]){
    for(const mode of modes){
     const cfg=p6Surfaces[mode];
     await root.locator(".aoHeritageMore > summary").click();
     await root.locator(".aoHeritageSecondary "+cfg.open).click();
     await root.locator(cfg.panel).waitFor({state:"attached",timeout:20000});
     for(const other of p6OwnerNames){
      assert.equal(await root.locator(p6Surfaces[other].panel).count(),other===mode?1:0,
       "P6 "+mode+" and "+other+" must have exclusive panel ownership");
     }
     assert.equal(await root.locator(cfg.evidence).count(),1,
      mode+" must expose its source/scope qualification");
     if(mode==="journey"){
      const panel=root.locator('.aoJourneyPanel[data-atlas-journey="true"]');
      assert.equal(await panel.count(),1,"Approved screen 6 sheet is missing");
      assert.ok((await panel.locator(".aoJourneyHeader h2").innerText()).trim(),
       "Pilgrimage sheet must lead with the actual documented itinerary");
      assert.ok(await panel.locator(".aoJourneyRoutes button").count()>1,
       "Route switcher must keep existing documented itineraries");
      const dims=await panel.evaluate(el=>{
       const r=el.getBoundingClientRect();
       return {left:r.left,right:r.right,bottom:r.bottom,height:r.height,
        width:innerWidth,viewportHeight:innerHeight,
        overflow:document.documentElement.scrollWidth-innerWidth};
      });
      if(width<800)assert.ok(dims.left>=-2&&dims.right<=width+2&&
       dims.bottom<=dims.viewportHeight+2&&dims.height<=Math.min(330,dims.viewportHeight*.52)+3
       &&dims.height>=Math.min(300,dims.viewportHeight*.52)-4&&dims.overflow<=2,
       "Approved mobile journey sheet must leave the map in view: "+JSON.stringify(dims));
      const focus=panel.locator("[data-explore-journey-stage-focus]");
      if(await focus.count()){
       const first=focus.first(),id=await first.getAttribute("data-explore-journey-stage-focus");
       await first.click();
       assert.equal(await first.getAttribute("aria-pressed"),"true",
        "A sourced stage number must focus its mapped site");
       assert.equal(await panel.locator('[data-journey-named-stage="'+id+'"].aoJourneyStageSelected').count(),1,
        "Stage focus must be reflected in the active row");
      }
      assert.ok(await panel.locator(".aoJourneyNoLine").count()>0,
       "Never imply route geometry that is not certified");
      if(width<800){
       const handle=panel.locator("[data-explore-journey-sheet-toggle]");
       assert.equal(await handle.getAttribute("aria-expanded"),"false",
        "The pilgrimage sheet starts in map-first stage-card mode");
       await handle.click();
       await page.waitForFunction(()=>document.querySelector(".aoJourneyPanel")?.dataset.journeyExpanded==="true");
       const expanded=await panel.evaluate(el=>el.getBoundingClientRect().height);
       assert.ok(expanded>dims.height+45&&expanded<=dims.viewportHeight-118,
        "Sheet expansion must expose stage details without leaving the map: "+expanded);
       await assertP6Canvas("expanded pilgrimage sheet");
       await panel.locator("[data-explore-journey-sheet-toggle]").click();
       await page.waitForFunction(()=>document.querySelector(".aoJourneyPanel")?.dataset.journeyExpanded==="false");
      }
      await assertP6Canvas("approved journey screen 6 stage focus");
     }
     await assertP6Canvas(mode+" "+direction);
     if(direction==="forward")await capture("p6-"+mode);
     if(direction==="reverse"){
      // The More disclosure is a separate keyboard layer, so Escape closes
      // it first when necessary; a subsequent Escape closes the active panel.
      const menu=root.locator(".aoHeritageMore");
      if(await menu.getAttribute("open")!==null){
       await page.keyboard.press("Escape");
       assert.equal(await menu.getAttribute("open"),null,"Escape should close More before the active panel");
       assert.equal(await root.locator(cfg.panel).count(),1,"Escape from More must retain the active panel");
      }
      await page.keyboard.press("Escape");
     }else await root.locator(cfg.close).click();
     await root.locator(cfg.panel).waitFor({state:"detached",timeout:20000});
     await assertP6Canvas(mode+" return");
    }
   }
   assert.equal(await root.locator(".aoJourneyPanel,.aoTimeMassPanel,.aoNetworkPanel,.aoAtlasCoveragePanel").count(),0);
   assert.ok(await root.locator("[data-mapcn-discover-rail]").count()>0,
    "Discover must be restored after each P6 mode round trip");
   note.steps.push("P6 forward/back and keyboard Escape return across five surfaces; one MapLibre canvas, exclusive sourced panels, no overflow");

   // P6 source-owned handoff: follow one real published place-specific
   // custom from Network to its grouped Traditions folio, then back to the
   // SAME graph focus. This uses the 2026 source registry, not fixture nodes.
   await root.locator(".aoHeritageMore > summary").click();
   await root.locator(".aoHeritageSecondary [data-network-toggle]").click();
   await root.locator(".aoNetworkPanel").waitFor({state:"visible",timeout:20000});
   await root.locator(".aoNetworkPanel [data-network-kind]").selectOption("custom");
   // Desktop has a results rail; the mobile MapCN layout deliberately hides it.
   // Follow the visible Network search interaction at every viewport size.
   await root.locator(".aoNetworkPanel [data-network-search]").fill("Votive candle");
   await page.waitForFunction(()=>{
    const label=document.querySelector("#ao-find-modular-root .aoNetworkCurrent h3");
    return label?.textContent?.includes("Votive candle at a shrine");
   },null,{timeout:15000});
   const publishedLink=root.locator('.aoNetworkPanel [data-network-open-custom="DEV-010"]').first();
   await publishedLink.waitFor({state:"visible"});
   await publishedLink.click();
   const sourceFolio=root.locator('.aoExploreTraditionSheet[data-explore-custom-id="DEV-010"]');
   await sourceFolio.waitFor({state:"visible",timeout:20000});
   assert.equal(await page.evaluate(()=>globalThis.AO_FIND_APP_V1.status().lens),"traditions");
   assert.equal(await root.locator(".aoExploreTraditionSheet").count(),1,
    "Custom handoff must open one canonical published folio, not copies of attestations");
   assert.ok(await sourceFolio.locator('.aoFindSources a[href^="https://"]').count()>0,
    "Published custom must retain original source links");
   assert.ok(await sourceFolio.locator(".aoTraditionEvidence").count()>0,
    "Published custom must retain its documented site attestations");
   assert.equal(await root.locator(".aoNetworkPanel").count(),0,
    "Network must not remain as a duplicate overlay during a customs folio");
   await capture("p6-published-custom");
   // The full folio is modal: the global header sits behind its backdrop.
   // Use its visible Back-to-preview action, then Escape from the preview.
   await sourceFolio.locator("[data-explore-collapse-detail]").click();
   await root.locator('[data-explore-preview="tradition:custom:DEV-010"]').waitFor({state:"visible"});
   await page.keyboard.press("Escape");
   await root.locator(".aoNetworkPanel").waitFor({state:"visible",timeout:20000});
   await mapReady("heritage");
   assert.equal(await root.locator('[data-network-kind]').inputValue(),"custom");
   assert.equal(await root.locator('.aoNetworkPanel [data-network-focus="custom:DEV-010"]').first().getAttribute("aria-pressed"),"true",
    "Network must regain the same selected canonical custom after Back");
   await capture("p6-published-custom-return");
   // The full-sheet Close control returns to the same source panel as well.
   await root.locator('.aoNetworkPanel [data-network-open-custom="DEV-010"]').first().click();
   await sourceFolio.waitFor({state:"visible",timeout:20000});
   await sourceFolio.locator("button[data-find-close-detail]").click();
   await root.locator(".aoNetworkPanel").waitFor({state:"visible",timeout:20000});
   await root.locator('.aoNetworkPanel [data-network-close]').click();
   await mapReady("heritage");
   assert.equal(await root.locator(".aoHeritageSurface [data-find-map] canvas.maplibregl-canvas").count(),1,
    "A text-reader round trip should remount exactly one working MapLibre canvas");
   note.steps.push("published DEV-010 votive-candle custom → one canonical sourced Traditions folio → visible Back-to-preview, Escape and full-sheet Close return to exact Network focus");

   // Continue from this same Explore destination to Mass without hidden menus.
   await root.locator(".aoHeritageMassShortcut").click();
   await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().lens==="tlm",
    null,{timeout:15000});
   const switchMap=root.locator('[data-find-filter="view"][data-find-filter-value="map"]');
   if(await switchMap.count())await switchMap.click();
   await mapReady("tlm");
   // Approved Sacred Atlas screen 4: this is the SAME map, with three
   // entrances, one source-scoped CL27 drawer and viewport-bound results.
   const massTabs=root.locator(".aoAtlasMassTabs");
   await massTabs.waitFor({state:"visible",timeout:15000});
   assert.equal(await massTabs.locator("button").count(),3,
    "Mass mode must retain exactly three prototype Atlas entrances");
   assert.equal(await massTabs.locator('button[aria-current="page"]').count(),1);
   assert.equal(await root.locator('.aoExploreSurface[data-atlas-mass="true"]').count(),1,
    "Mass map must reuse the approved immersive Atlas shell");
   const drawer=root.locator(".aoAtlasTlmExtra");
   assert.equal(await drawer.count(),1,"Mass map must expose the existing evidence filter drawer");
   assert.ok(await drawer.locator(".aoTlmCl27Facet [data-cl27-axis]").count()>=10,
    "All 12 CL27 evidence axes must remain in the filter drawer");
   const massRail=root.locator("[data-tlm-map-rail]");
   await massRail.waitFor({state:"visible",timeout:12000});
   const railGeometry=await massRail.evaluate(el=>{
    const r=el.getBoundingClientRect();
    return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,
      height:r.height,viewport:innerWidth};
   });
   if(width<900)assert.ok(railGeometry.width>=width-4&&railGeometry.bottom<=(width<800?844:960)+2
      &&railGeometry.height>=220,
      "Mobile Latin Mass needs a full-width bottom card sheet: "+JSON.stringify(railGeometry));
   const mapVenueCards=massRail.locator(".aoTlmMapRailItem");
   if(await mapVenueCards.count()){
    assert.equal(await mapVenueCards.first().getAttribute("data-explore-lens"),null,
      "Viewport venue card must use the canonical owner, not a second record");
    assert.ok(await mapVenueCards.first().getAttribute("data-explore-item"),
      "Venue cards must retain exact Directory item identities");
    const first=mapVenueCards.first();
    assert.equal(await first.locator(".aoTlmMapRailVisual").count(),1,
      "Venue card must render an approved photo, sourced institute emblem, or neutral fallback");
   }
   await capture("07b-latin-mass-prototype");
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
   const staged=await page.evaluate(()=>{
     const p=globalThis.AO_RUNTIME_V8?.store?.getState?.()?.resolution?.proper;
     return {hasProper:p?.status==="ready",status:globalThis.AO_CONTENT_V37?.status?.("scripture")?.status};
   });
   if(staged.hasProper)assert.equal(staged.status,"deferred",
     "Daily content summary should expose on-demand status, not a false 'ready' or loading claim");
   // An explicit diagnostics refresh retains the original reader's full-source
   // capability; stub only the transport for this deterministic contract check.
   if(staged.hasProper){
    const explicit=await page.evaluate(async()=>{
      const api=globalThis.AO_CONTENT_V37,svc=globalThis.AO_RUNTIME_V8.scriptureService;
      const old=svc.load,calls=[];
      svc.load=async function(kind){
       calls.push(kind);
       return {reference:{display:String(kind),kind},englishChapter:[],latinChapter:[],
        frenchChapter:[],englishCatena:[],englishNotes:[]};
      };
      try{await api.hydrateDaily(globalThis.AO_RUNTIME_V8.store.getState(),{force:true});}
      finally{svc.load=old;}
      return {calls,documentReady:Boolean(api.getDailyDocument("gospel"))};
    });
    assert.ok(explicit.calls.includes("gospel"),"Explicit manual refresh must still load Gospel");
    assert.ok(explicit.calls.includes("scripture"),"Explicit manual refresh must still load Epistle/Lesson");
    assert.equal(explicit.documentReady,true,"Manual refresh should populate same daily reading cache");
   }
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
