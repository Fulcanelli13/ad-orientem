import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
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
    assert.ok(initial.chips.every(h=>h>=44),width+"px category chip too small");
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
    await page.locator('[data-explore-collapse-place]').tap();
    await page.locator('.aoHeritageCardLayer .aoHeritagePreview').waitFor({state:"visible"});
    await page.locator('.aoHeritageWorldReset').tap();
    await page.waitForFunction(()=>!document.querySelector('.aoHeritageCardLayer')&&
      document.querySelector('[data-heritage-category="ALL"]')?.getAttribute("aria-pressed")==="true"&&
      document.querySelector('.aoHeritageSurface [data-find-query]')?.value==="",null,{timeout:15000});
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
    await context.close();
  }
  console.log("PASS Explore multi-width layout, category relevance and world reset "+JSON.stringify(snapshots));
}finally{
  await browser?.close().catch(()=>{});
  await new Promise(resolve=>server.close(resolve));
}
