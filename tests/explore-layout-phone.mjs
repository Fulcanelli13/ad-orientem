import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const atlasScreenshots=resolve(root,"artifacts/sacred-atlas-r1");
await mkdir(atlasScreenshots,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
  try{
    const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
    if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return;}
    const bytes=await readFile(file);
    res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
    res.end(bytes);
  }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message??error));}
});
await new Promise((yes,no)=>{server.once("error",no);server.listen(4206,"127.0.0.1",yes)});
let browser;
const snapshots=[];
try{
  browser=await chromium.launch({headless:true});
  for(const config of [{width:320,height:640,locale:"fr-FR"},{width:390,height:844,locale:"en-GB"},
     {width:430,height:932,locale:"fr-FR"},{width:768,height:1000,locale:"en-GB"}]){
    const {width,height,locale}=config;
    const context=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:width<600,locale,deviceScaleFactor:1});
    await context.grantPermissions(["geolocation"],{origin:"http://127.0.0.1:4206"});
    await context.setGeolocation({latitude:43.09738,longitude:-0.05875,accuracy:100});
    const page=await context.newPage(),errors=[];
    page.on("pageerror",e=>errors.push(e.message));
    // Native Explore acceptance elsewhere tests live MapLibre; use a deterministic
    // map canvas here so dimensions and click layering are never network-dependent.
    await page.addInitScript(()=>{
      class MapStub{
        constructor(options){
          this.options=options;this.center={lng:options.center[0],lat:options.center[1]};this.zoom=options.zoom;
          window.__EXPLORE_LAYOUT_MAP_OPTIONS__=options;
          window.__EXPLORE_LAYOUT_MAP_MOUNTS__=(window.__EXPLORE_LAYOUT_MAP_MOUNTS__||0)+1;
          const canvas=document.createElement("canvas");canvas.className="aoLayoutMapCanvas";
          canvas.style.cssText="display:block;width:100%;height:100%";
          options.container.append(canvas);
          window.__EXPLORE_FIRST_CANVAS__??=canvas;
        }
        addControl(){} on(){} getCenter(){return this.center;}
        getZoom(){return this.zoom;} remove(){}
      }
      window.AO_FIND_MAPLIBRE_MODULE={Map:MapStub,NavigationControl:class{},FullscreenControl:class{}};
    });
    await page.goto("http://127.0.0.1:4206/index.html",{waitUntil:"domcontentloaded",timeout:90000});
    await page.locator('[data-ao-app-surface="find"]').tap();
    await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().loadState==="ready"&&!!document.querySelector('.aoHeritageWorldReset'),null,{timeout:60000});
    const initial=await page.evaluate(()=>{
      const rect=selector=>{const el=document.querySelector(selector);if(!el)return null;
        const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right};};
      return {map:rect(".aoHeritageBody"),header:rect(".aoFindHeader"),
        tools:rect(".aoHeritageTools"),filters:rect(".aoHeritageCategories"),world:rect(".aoHeritageWorldReset"),
        overflow:document.documentElement.scrollWidth-innerWidth,
        wrap:window.__EXPLORE_LAYOUT_MAP_OPTIONS__?.renderWorldCopies,
        bounds:window.__EXPLORE_LAYOUT_MAP_OPTIONS__?.maxBounds,
        zoom:window.__EXPLORE_LAYOUT_MAP_OPTIONS__?.zoom,
        center:window.__EXPLORE_LAYOUT_MAP_OPTIONS__?.center,
        chips:[...document.querySelectorAll('.aoHeritageCategories button')].map(b=>b.getBoundingClientRect().height),
        searchWidth:rect(".aoFindSearch input")?.width};
    });
    // Map data can load before MapLibre's third-party background. The map
    // must communicate this independently of the canonical search/results.
    const visibleMapStatus=page.locator('.aoFindMap[data-ao-map-state="loading"] .aoExploreMapLoading').first();
    await visibleMapStatus.waitFor({state:"visible",timeout:10000});
    const pending=await visibleMapStatus.evaluate(el=>({
      role:el.getAttribute("role"),text:el.textContent,
      pointerEvents:getComputedStyle(el).pointerEvents
    }));
    assert.equal(pending.role,"status");
    assert.ok(pending.text.length>15,"Map loading notice is empty");
    assert.equal(pending.pointerEvents,"none","Map status should not block pan/zoom/taps");
    assert.ok(initial.map?.height>=200,width+"px map too short: "+JSON.stringify(initial));
    assert.ok(initial.world?.height>=44&&initial.world.width>=44,width+"px world control too small");
    assert.ok(initial.world.bottom<initial.map.bottom,width+"px world button outside map");
    // One worldwide map, exactly two atlas destinations. Discover overview
    // remains a Sacred Atlas subview in Layers, not a third top-level tab.
    const atlasTabs=await page.locator(".aoAtlasPrimaryTabs > button").allTextContents();
    assert.equal(atlasTabs.length,2,width+"px expected two atlas tabs");
    assert.ok(atlasTabs.some(t=>/TLM/.test(t))&&atlasTabs.some(t=>/Sacred Atlas|Atlas sacré/.test(t)),
      width+"px atlas tabs are not TLM / Sacred: "+atlasTabs.join(" | "));
    const tab=page.locator('.aoAtlasPrimaryTabs [data-atlas-entry-tab="sacred"]');
    await tab.tap();
    await page.waitForFunction(()=>document.querySelector('.aoHeritageSurface')?.dataset.atlasEntry==="sacred");
    const sacredChips=await page.locator('.aoHeritageCategories button').evaluateAll(nodes=>
      nodes.map(b=>b.getBoundingClientRect().height));
    assert.ok(sacredChips.length>=4&&sacredChips.every(h=>h>=44),
      width+"px Sacred Places category chip too small");
    if(width<=430){
      const rail=page.locator('.aoHeritageSurface[data-atlas-entry="sacred"] .aoMapcnDiscoverRail');
      await rail.waitFor({state:"visible",timeout:15000});
      const before=await rail.evaluate(el=>({height:el.getBoundingClientRect().height,
        state:el.dataset.discoverExpanded,
        aria:el.querySelector('[data-mapcn-discover-toggle]')?.getAttribute("aria-expanded")}));
      assert.equal(before.state,"false",width+"px Sacred Places drawer must begin collapsed");
      assert.equal(before.aria,"false",width+"px collapsed rail must be accessible");
      assert.ok(before.height>=72&&before.height<=100,
        width+"px collapsed Sacred Places rail still occupies map: "+JSON.stringify(before));
      await page.screenshot({path:resolve(atlasScreenshots,width+"-sacred-closed.png"),animations:"disabled"});
      await rail.locator('[data-mapcn-discover-toggle]').tap();
      await page.waitForFunction(()=>{const rail=document.querySelector('.aoHeritageSurface[data-atlas-entry="sacred"] .aoMapcnDiscoverRail');return rail?.dataset.discoverExpanded==="true"&&rail.getBoundingClientRect().height>=170;},null,{timeout:10000});
      const expanded=await rail.evaluate(el=>({height:el.getBoundingClientRect().height,
        aria:el.querySelector('[data-mapcn-discover-toggle]')?.getAttribute("aria-expanded")}));
      assert.equal(expanded.aria,"true",width+"px expanded rail must announce itself");
      assert.ok(expanded.height>before.height+90,
        width+"px expanded Places rail did not open visibly: "+JSON.stringify(expanded));
      assert.ok(expanded.height<=Math.min(height*.48,420)+3,
        width+"px expanded Places rail covers too much of the map");
      await page.screenshot({path:resolve(atlasScreenshots,width+"-sacred-expanded.png"),animations:"disabled"});
      await rail.locator('[data-mapcn-discover-toggle]').tap();
      await page.waitForFunction(()=>{const rail=document.querySelector('.aoHeritageSurface[data-atlas-entry="sacred"] .aoMapcnDiscoverRail');return rail?.dataset.discoverExpanded==="false"&&rail.getBoundingClientRect().height<=100;},null,{timeout:10000});
    }
    await page.locator(".aoHeritageMore > summary").tap();
    await page.locator('.aoHeritageSecondary [data-atlas-entry-tab="discover"]').tap();
    await page.waitForFunction(()=>document.querySelector('.aoHeritageSurface')?.dataset.atlasEntry==="discover");
    assert.ok(initial.searchWidth>=65,width+"px search collapsed");
    assert.ok(initial.overflow<=1,width+"px viewport horizontally overflows");
    assert.equal(initial.wrap,false,width+"px repeated world enabled");
    assert.deepEqual(initial.bounds,width<=430
      ?undefined
      :[[-179.99,-85.051129],[179.99,85.051129]],
      width+"px negative-zoom phone overview must not install a wrapping camera clamp");
    if(width<=430){
      assert.ok(initial.zoom<0&&initial.zoom>=-2,
        width+"px must use negative phone overview zoom to prevent edge-clipped global clusters: "+initial.zoom);
      assert.ok(initial.center[0]>-10&&initial.center[0]<50,
        width+"px must centre on the nonwrapped published Place extent: "+JSON.stringify(initial.center));
    }else assert.ok(initial.zoom>=0,"Tablet default zoom must remain unchanged");
    await page.locator('.aoHeritageNearby').tap();
    await page.locator('.aoHeritageNearbyPanel').waitFor({state:"visible"});
    const nearby=await page.locator('.aoHeritageNearbyResult').count();
    assert.ok(nearby>0&&nearby<=6,width+"px Near me must show compact distance-ranked records");
    assert.match(await page.locator('.aoHeritageNearbyPanel').innerText(),/km/);
    await page.locator('[data-heritage-nearby-close]').tap();
    assert.equal(await page.locator('.aoHeritageNearbyPanel').count(),0);
    assert.equal(await page.evaluate(()=>window.__EXPLORE_LAYOUT_MAP_MOUNTS__),1,
      width+"px Nearby action reconstructed map canvas");
    if(width===390){
      const menu=page.locator('.aoHeritageSurface .aoHeritageMore');
      await menu.locator('summary').first().tap();
      const section=menu.locator('.aoHeritageFeatured');
      await section.locator('summary').tap();
      assert.ok((await section.locator('[data-explore-open-place]').count())>=12,
        "Curated menu must show actual canonical Places without adding a map strip");
      await section.locator('[data-explore-open-place="place:FR:sanctuaire-notre-dame-de-lourdes"]').tap();
      await page.locator('.aoHeritageEditorialPreview').waitFor({state:"visible"});
      await page.locator('.aoHeritageEditorialPreview [data-explore-expand-place]').tap();
      await page.locator('.aoExplorePlaceEditorial').waitFor({state:"visible"});
      assert.ok((await page.locator('.aoExplorePlaceChapters [data-explore-place-jump]').count())>=2);
      // The published illustrated guide owns the origin introduction. The
      // Place reader deliberately avoids repeating it as an ORIGIN story chapter.
      assert.ok((await page.locator('.aoExploreEditorialOpening p').count())>=1,
        "Featured Lourdes must retain the separate sourced historical opening");
      const historicalSource=await page.locator('.aoExploreEditorialOpening a').getAttribute('href');
      assert.ok(historicalSource?.startsWith("https://"),
        "Sourced historical opening must link to its own original evidence");
      assert.ok((await page.locator('.aoExploreStoryChapter[data-story-kind="PILGRIMAGE"]').count())>=1,
        "Featured Lourdes must retain its separately sourced pilgrimage chapter");
      const links=await page.locator('.aoExploreStoryEvidence a').evaluateAll(nodes=>
        nodes.map(el=>({height:el.getBoundingClientRect().height,href:el.getAttribute('href')})));
      assert.ok(links.length>=1&&links.every(link=>link.height>=44&&link.href.startsWith("https://")),
        "Pilgrimage story evidence must be independently clickable at a full phone touch target");
      await page.locator('[data-explore-place-jump="calendar"]').tap();
      assert.equal(await page.locator('[data-explore-place-chapter="calendar"]').count(),1,
        "Canonical Calendar relationship must remain in Place reader");
      await page.locator('[data-explore-place-jump="sources"]').tap();
      assert.equal(await page.locator('[data-explore-place-chapter="sources"] details').getAttribute('open'),'',
        "In-place Sources shortcut must reveal original evidence rather than opening another screen");
      await page.locator('[data-explore-collapse-place]').tap();
      await page.locator('.aoHeritageEditorialPreview button[data-find-close-place]').tap();
      assert.equal(await page.evaluate(()=>window.__EXPLORE_LAYOUT_MAP_MOUNTS__),1,
        "Editorial Place navigation must preserve the original map canvas");
    }
    await page.locator('.aoHeritageSurface [data-find-query]').fill("Sanctuaire Notre-Dame de Lourdes");
    await page.locator('.aoHeritageSearchResults [data-explore-open-place]').first().tap();
    await page.locator('.aoHeritageCardLayer .aoHeritagePreview').waitFor({state:"visible"});
    if(width<=430){
      const photo=page.locator('.aoHeritageCardLayer .aoHeritagePlaceThumb img').first();
      await photo.waitFor({state:"visible",timeout:15000});
      await page.waitForFunction(()=>{
        const img=document.querySelector('.aoHeritageCardLayer .aoHeritagePlaceThumb img');
        return img?.complete&&img.naturalWidth>0;
      },null,{timeout:15000});
      const previewPhoto=await photo.evaluate(img=>{
        const figure=img.closest('figure'),credit=figure?.querySelector('figcaption');
        return {fit:getComputedStyle(img).objectFit,loaded:img.naturalWidth>0,
          creditVisible:credit&&getComputedStyle(credit).display!=="none"&&credit.getBoundingClientRect().height>8,
          credit:credit?.innerText||""};
      });
      assert.equal(previewPhoto.fit,"contain",width+"px approved photo was cropped");
      assert.ok(previewPhoto.loaded&&previewPhoto.creditVisible&&previewPhoto.credit.trim().length>4,
        width+"px preview lost its photograph attribution: "+JSON.stringify(previewPhoto));
      // Computed 'display: block' was not enough: QA screenshots showed the
      // photo and name flex-shrunk completely away at 320px while the actions
      // remained visible. Test the actual on-screen intersections.
      const visual=await page.evaluate(()=>{
        const sheet=document.querySelector(".aoHeritageCardLayer .aoHeritagePreview");
        const title=sheet?.querySelector(".aoHeritageCardTitle");
        const image=sheet?.querySelector(".aoHeritagePlaceThumb img");
        const caption=sheet?.querySelector(".aoHeritagePlaceThumb figcaption");
        const r=sheet?.getBoundingClientRect(),t=title?.getBoundingClientRect(),
              i=image?.getBoundingClientRect(),c=caption?.getBoundingClientRect();
        const intersection=(a,b)=>a&&b?
          Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)):0;
        return {scrollTop:sheet?.scrollTop,titleVisible:intersection(t,r),
          titleHeight:t?.height,imageVisible:intersection(i,r),imageHeight:i?.height,
          captionBelow:c&&i?c.top>=i.bottom-2:false,
          titleText:title?.textContent?.trim()};
      });
      assert.ok(visual.titleHeight>=22&&visual.titleVisible>=Math.min(24,visual.titleHeight*.7),
        width+"px card title is hidden by sheet overflow: "+JSON.stringify(visual));
      assert.ok(visual.imageHeight>=100&&visual.imageVisible>=65,
        width+"px approved photo collapsed or is outside card: "+JSON.stringify(visual));
      assert.ok(visual.captionBelow,
        width+"px credit overlaps the approved photograph: "+JSON.stringify(visual));
      // A 320px card used to keep Discover below the scroll fold. Its primary
      // action now belongs to a bounded sticky dock, and must be hit-testable
      // without the user having to scroll inside the map preview.
      const action=await page.evaluate(()=>{
        const sheet=document.querySelector(".aoHeritageCardLayer .aoHeritagePreview");
        const button=sheet?.querySelector("[data-explore-expand-place]");
        const dock=button?.closest(".aoHeritagePreviewActions");
        const r=sheet?.getBoundingClientRect(), b=button?.getBoundingClientRect(),
              d=dock?.getBoundingClientRect();
        const pointX=b?(b.left+b.right)/2:0,pointY=b?(b.top+b.bottom)/2:0;
        const target=document.elementFromPoint(pointX,pointY);
        return {scrollTop:sheet?.scrollTop,
          visible:b&&r?Math.max(0,Math.min(b.bottom,r.bottom)-Math.max(b.top,r.top)):0,
          dockHeight:d?.height,
          dockPosition:dock?getComputedStyle(dock).position:null,
          clickable:target===button||Boolean(button?.contains(target))};
      });
      assert.ok(action.scrollTop===0&&action.dockPosition==="sticky"&&
        action.dockHeight<=72&&action.visible>=40&&action.clickable,
        width+"px Discover needs an initial-scroll gesture or is covered: "+JSON.stringify(action));
      await page.screenshot({path:resolve(atlasScreenshots,width+"-lourdes-preview.png"),animations:"disabled"});
    }
    assert.equal(await page.evaluate(()=>window.__EXPLORE_LAYOUT_MAP_MOUNTS__),1,
      width+"px selecting a Place recreated the map");
    assert.equal(await page.evaluate(()=>window.__EXPLORE_FIRST_CANVAS__===document.querySelector('.aoLayoutMapCanvas')),true,
      width+"px selecting a Place replaced the existing canvas");
    const card=await page.evaluate(()=>{
      const el=document.querySelector('.aoHeritageCardLayer .aoHeritagePreview');
      const world=document.querySelector('.aoHeritageWorldReset');
      const r=el.getBoundingClientRect(),w=world.getBoundingClientRect();
      const at=document.elementFromPoint(w.left+w.width/2,w.top+w.height/2);
      return {height:r.height,modal:el.getAttribute("aria-modal"),
        worldAccessible:at===world||world.contains(at),
        actionHeights:[...el.querySelectorAll('button,a')].map(e=>e.getBoundingClientRect().height),
        overflow:document.documentElement.scrollWidth-innerWidth};
    });
    assert.equal(card.modal,"false",width+"px map still blocked by modal card");
    assert.ok(card.worldAccessible,width+"px floating card intercepts map controls");
    assert.ok(card.height<height*.60,width+"px card covers too much map");
    assert.ok(card.actionHeights.every(h=>h>=44),width+"px undersized card action");
    assert.ok(card.overflow<=1,width+"px card overflows viewport");
    await page.locator('.aoHeritageCardLayer .aoHeritageSheetHandle').tap();
    await page.locator('.aoExplorePlaceSheet').waitFor({state:"visible"});
    if(width<=430){
      const img=page.locator('.aoExplorePlaceSheet>.aoExplorePlaceMedia img').first();
      await img.waitFor({state:"visible",timeout:15000});
      const photo=await img.evaluate(el=>{
        const figure=el.closest('figure'),credit=figure?.querySelector('figcaption');
        const image=el.getBoundingClientRect(),caption=credit?.getBoundingClientRect();
        return {fit:getComputedStyle(el).objectFit,photoLoaded:el.complete&&el.naturalWidth>0,
          creditBelow:caption&&caption.top>=image.bottom-2,
          creditVisible:credit&&getComputedStyle(credit).display!=="none"&&caption.height>=8,
          creditSourceLinks:credit?.querySelectorAll('a[href^="https://"]').length||0};
      });
      assert.equal(photo.fit,"contain",width+"px full Place artwork cropped");
      assert.ok(photo.photoLoaded&&photo.creditBelow&&photo.creditVisible&&photo.creditSourceLinks>=2,
        width+"px full Place must show source and rights below the image: "+JSON.stringify(photo));
      await page.screenshot({path:resolve(atlasScreenshots,width+"-lourdes-profile.png"),animations:"disabled"});
    }
    await page.locator('[data-explore-collapse-place]').tap();
    await page.locator('.aoHeritageCardLayer .aoHeritagePreview').waitFor({state:"visible"});
    await page.locator('.aoHeritageWorldReset').tap();
    await page.waitForFunction(()=>!document.querySelector('.aoHeritageCardLayer')&&
      document.querySelector('[data-heritage-category="ALL"]')?.getAttribute("aria-pressed")==="true"&&
      document.querySelector('.aoHeritageSurface [data-find-query]')?.value==="",null,{timeout:15000});
    await page.locator('.aoAtlasPrimaryTabs [data-atlas-entry-tab="sacred"]').tap();
    await page.waitForFunction(()=>document.querySelector('.aoHeritageSurface')?.dataset.atlasEntry==="sacred");
    await page.locator('[data-heritage-category="relics"]').tap();
    await page.waitForFunction(()=>document.querySelector('[data-heritage-category="relics"]')?.getAttribute("aria-pressed")==="true",null,{timeout:15000});
    await page.locator('.aoHeritageWorldReset').tap();
    await page.waitForFunction(()=>document.querySelector('[data-heritage-category="ALL"]')?.getAttribute("aria-pressed")==="true",null,{timeout:15000});
    assert.equal(await page.evaluate(()=>window.__EXPLORE_LAYOUT_MAP_MOUNTS__),1,
      width+"px searching, selecting and filtering remounted the map canvas");
    assert.deepEqual(errors,[],width+"px JavaScript errors: "+errors.slice(0,3).join(" | "));
    snapshots.push({screen:width+"x"+height,locale,mapHeight:Math.round(initial.map.height),
      searchWidth:Math.round(initial.searchWidth),cardHeight:Math.round(card.height),
      mapInteractive:card.worldAccessible,overflow:initial.overflow});
    // Switching collections is a real lens change; the active map may remount,
    // but the app shell and selectors must remain coherent, with no stale rail.
    await page.locator('.aoAtlasPrimaryTabs [data-find-filter="lens"][data-find-filter-value="tlm"]').tap();
    await page.waitForFunction(()=>Boolean(document.querySelector('.aoExploreSurface[data-atlas-mass="true"]')),
      null,{timeout:20000});
    const massTabs=await page.locator(".aoAtlasMassTabs > button").allTextContents();
    assert.equal(massTabs.length,2,width+"px TLM view has extra Atlas tabs");
    assert.ok(massTabs.some(t=>/TLM/.test(t))&&massTabs.some(t=>/Sacred Atlas|Atlas sacré/.test(t)));
    await page.locator('.aoAtlasMassTabs [data-atlas-mass-return="sacred"]').tap();
    await page.waitForFunction(()=>document.querySelector('.aoHeritageSurface')?.dataset.atlasEntry==="sacred",
      null,{timeout:20000});
    assert.equal(await page.locator(".aoAtlasPrimaryTabs > button").count(),2);
    assert.deepEqual(errors,[],width+"px Atlas switch errors: "+errors.slice(0,3).join(" | "));
    await context.close();
  }
  console.log("PASS Explore multi-width layout, category relevance and world reset "+JSON.stringify(snapshots));
}finally{
  await browser?.close().catch(()=>{});
  await new Promise(resolve=>server.close(resolve));
}
