import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {PRELIMINARY_R49_TOTAL,PUBLISHED_PROVISIONAL_MASS_SITES_EXPECTED} from "../src/find/preliminary-directory-r49.js";
const APPROVED_MASS_MAP_TOTAL=PRELIMINARY_R49_TOTAL+PUBLISHED_PROVISIONAL_MASS_SITES_EXPECTED;

// This acceptance captures the actual traditional Mass screen, which the
// general app visual suite does not cover. No fake map data or synthetic UI.
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/visual-acceptance/explore");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
  ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
  ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
  ".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
await mkdir(output,{recursive:true});
const server=http.createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    const file=resolve(root,"."+pathname);
    if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("Forbidden");return}
    const bytes=await readFile(file);
    res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream",
      "cache-control":"no-store"});
    res.end(bytes);
  }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(error?.message??"Error")}
});
await new Promise((ok,fail)=>{
  server.once("error",fail);server.listen(4217,"127.0.0.1",ok);
});
const observations=[];
let browser;
try{
  browser=await chromium.launch({headless:true});
  for(const config of [
    {name:"desktop-1440",width:1440,height:900,locale:"en-GB",mobile:false},
    {name:"phone-390",width:390,height:844,locale:"en-GB",mobile:true},
    {name:"phone-fr-320",width:320,height:640,locale:"fr-FR",mobile:true},
  ]){
    const context=await browser.newContext({
      viewport:{width:config.width,height:config.height},
      locale:config.locale,hasTouch:config.mobile,isMobile:config.mobile,
      deviceScaleFactor:config.mobile?2:1,
      reducedMotion:"reduce",
    });
    const page=await context.newPage(),errors=[];
    page.on("pageerror",e=>errors.push(String(e?.message??e)));
    await page.goto("http://127.0.0.1:4217/index.html",
      {waitUntil:"domcontentloaded",timeout:90000});
    // The app language is owned by Settings, not by browser locale. A fr-FR
    // browser alone still renders the English UI; exercise the real French mode.
    if(config.locale==="fr-FR"){
      await page.waitForFunction(()=>Boolean(window.AO_SETTINGS_DONOR_V4359?.setPath),null,{timeout:30000});
      await page.evaluate(()=>window.AO_SETTINGS_DONOR_V4359.setPath("general.uiLanguage","fr"));
      await page.waitForFunction(()=>window.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr",null,{timeout:10000});
    }
    await page.locator('[data-ao-app-surface="find"]').waitFor({state:"visible",timeout:30000});
    if(config.mobile)await page.locator('[data-ao-app-surface="find"]').tap();
    else await page.locator('[data-ao-app-surface="find"]').click();
    await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().loadState==="ready"
      &&document.querySelector('.aoHeritageMassShortcut'),null,{timeout:60000});
    // Heritage loads MapLibre lazily. Wait for the actual module before
    // wrapping the Mass map constructor, or the first import bypasses the hook.
    await page.waitForFunction(()=>Boolean(window.AO_FIND_MAPLIBRE_MODULE?.Map),
      null,{timeout:30000});
    // Observe the real MapLibre Mass instance rather than inferring rendering
    // from a canvas and an unrelated "tiles ready" status.
    await page.evaluate(()=>{
      const mod=window.AO_FIND_MAPLIBRE_MODULE;
      if(!mod?.Map)return;
      window.AO_FIND_MAPLIBRE_MODULE={...mod,Map:new Proxy(mod.Map,{
        construct(target,args,newTarget){
          const map=Reflect.construct(target,args,newTarget);
          window.__EXPLORE_MASS_MAP=map;
          window.__EXPLORE_MASS_ERRORS=[];
          map.on("error",e=>window.__EXPLORE_MASS_ERRORS.push(
            String(e?.error?.message??e?.message??"Unknown map error")));
          return map;
        },
      })};
    });
    const mass=page.locator('.aoHeritageMassShortcut');
    if(config.mobile)await mass.tap();
    else await mass.click();
    await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().lens==="tlm"
      &&document.querySelector('#ao-find-modular-root [data-explore-lens="tlm"][data-find-view="map"]'),
      null,{timeout:30000});
    await page.waitForFunction(expected=>Number(document.querySelector(
      '#ao-find-modular-root .aoFindResultMeta strong')?.textContent)===expected,
      APPROVED_MASS_MAP_TOTAL,{timeout:30000});
    // Give the external free map engine a bounded opportunity to render.
    await Promise.race([
      page.waitForSelector('.aoFindMap[data-ao-map-state="ready"]',
        {state:"attached",timeout:11000}).catch(()=>null),
      page.waitForTimeout(11000),
    ]);
    await page.waitForTimeout(1100);
    const mapDiagnostics=await page.evaluate(()=>{
      const map=window.__EXPLORE_MASS_MAP;
      if(!map)return {captured:false,errors:window.__EXPLORE_MASS_ERRORS??[]};
      const layers=map.getStyle?.()?.layers?.map(x=>x.id).filter(x=>x.startsWith("ao-explore"))??[];
      const source=map.getSource?.("ao-explore-items");
      const featureCounts=()=>{try{
        const features=map.querySourceFeatures?.("ao-explore-items")??[];
        return {all:features.length,clusters:features.filter(f=>f.properties?.cluster===true).length,
          points:features.filter(f=>!f.properties?.cluster).length};
      }catch(e){return {error:String(e)}}};
      const rendered=id=>{try{return map.getLayer?.(id)?
        map.queryRenderedFeatures?.({layers:[id]})?.length??0:null;
      }catch(e){return {error:String(e)}}};
      return {captured:true,loaded:map.loaded?.()??null,zoom:map.getZoom?.(),
        layers,sourcePresent:!!source,sourceFeatures:featureCounts(),
        badgeImage:map.hasImage?.("ao-explore-cluster-badge-MIXED")??false,
        badges:rendered("ao-explore-cluster-badges"),
        compactCountOnly:JSON.stringify(map.getLayoutProperty?.("ao-explore-cluster-badges","text-field"))===
          JSON.stringify(["get","point_count_abbreviated"]),
        plainClusters:rendered("ao-explore-clusters"),
        individualPoints:rendered("ao-explore-points"),
        errors:window.__EXPLORE_MASS_ERRORS??[]};
    });
    const shot=resolve(output,config.name+".png");
    await page.screenshot({path:shot,fullPage:false});
    const data=await page.evaluate(()=>{
      const root=document.querySelector("#ao-find-modular-root .aoExploreSurface");
      const rect=element=>{
        const r=element?.getBoundingClientRect?.();
        return r?{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom}:null;
      };
      const controls=[...root.querySelectorAll('.aoTlmProviderStrip [data-find-affiliation]')];
      const card=root.querySelector('.aoFindMap');
      const img=controls.filter(x=>x.querySelector('img'));
      return {
        pageWidth:document.documentElement.scrollWidth,
        viewportWidth:innerWidth,
        surface:rect(root),
        header:rect(root.querySelector(".aoFindHeader")),
        toolbar:rect(root.querySelector(".aoTlmToolbar")),
        search:rect(root.querySelector(".aoTlmToolbar [data-find-query]")),
        map:rect(card),
        mapStatus:card?.dataset?.aoMapState??"unknown",
        mapCanvas:!!card?.querySelector('.maplibregl-canvas'),
        emblemFilterCount:img.length,
        visibleAffiliations:controls.length,
        allDefault:root.querySelector('[data-find-filter="directoryGroup"][data-find-filter-value="ALL"]')?.classList.contains("active"),
        reset:rect(root.querySelector("[data-explore-map-reset]")),
        caution:rect(root.querySelector(".aoPreliminaryDirectoryNotice")),
        sourceLinksBelowMap:!!root.querySelector(".aoFindBody + .aoFindExternalSource"),
        stickyToolbar:getComputedStyle(root.querySelector(".aoTlmToolbar")).position,
      };
    });
    observations.push({...config,...data,mapDiagnostics,errors,screenshot:shot});
    console.log("EXPLORE MASS MAP RENDERING",config.name,JSON.stringify(mapDiagnostics));
    if(config.locale==="fr-FR")assert.match(
      await page.locator('#ao-find-modular-root .aoPreliminaryDirectoryNotice > summary').innerText(),
      /provisoire|vérif|sources/i,config.name+": French map copy was never activated");
    assert.equal(data.allDefault,true,config.name+": first visit filtered venues");
    assert.equal(data.visibleAffiliations,6,config.name+": institute controls missing");
    assert.ok(data.emblemFilterCount>=4,config.name+": four sourced institute emblems absent from filter row");
    // The legacy stacked directory used a sticky toolbar. The approved
    // map-first Explore layout deliberately floats it absolutely above the
    // canvas; either is persistent, provided the floating search is visible
    // immediately below the header and remains inside the map viewport.
    assert.ok(["sticky","absolute"].includes(data.stickyToolbar),
      config.name+": map search lost its persistent positioning");
    if(data.stickyToolbar==="absolute"){
      assert.ok(data.toolbar&&data.header&&data.map&&data.search
        &&data.toolbar.y>=data.header.bottom-2
        &&data.toolbar.y<=data.header.bottom+30
        &&data.toolbar.bottom<data.map.bottom
        &&data.search.right<=data.viewportWidth+1,
        config.name+": map-first floating search must remain in the visible top map area: "+JSON.stringify(data));
    }
    assert.equal(data.sourceLinksBelowMap,true,config.name+": external links crowd the map");
    assert.ok(data.map&&data.search,config.name+": map or search missing");
    assert.ok(data.map.width>=config.width-45,config.name+": map too narrow");
    assert.ok(data.map.y<(config.mobile?560:410),
      config.name+": excessive controls leave most of first screen empty");
    assert.ok(data.pageWidth<=config.width+1,config.name+": unwanted horizontal page overflow");
    assert.ok(data.map.height>=(config.mobile?400:430),config.name+": map too short");
    assert.ok(data.reset&&data.reset.height>=40,
      config.name+": fit-results control missing or too small");
    assert.equal(mapDiagnostics.captured,true,
      config.name+": MapLibre Mass map instance was not instrumented");
    assert.equal(mapDiagnostics.sourcePresent,true,
      config.name+": No GeoJSON source was mounted");
    assert.equal(mapDiagnostics.badgeImage,true,
      config.name+": Cluster sprite is missing");
    assert.ok((mapDiagnostics.badges??0)>0,
      config.name+": No clusters are visible despite 1,879 source locations; "+JSON.stringify(mapDiagnostics));
    assert.equal(mapDiagnostics.compactCountOnly,true,
      config.name+": Map markers must show only a compact count, never affiliation text boxes");
    assert.equal(errors.length,0,config.name+": browser runtime errors: "+errors.join("; "));
    await context.close();
  }
}finally{
  await writeFile(resolve(output,"report.json"),JSON.stringify(observations,null,2));
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
console.log("PASS Explore Mass map screenshot geometry and institutional controls",JSON.stringify(observations));
