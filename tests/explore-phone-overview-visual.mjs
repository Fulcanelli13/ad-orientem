// Actual MapLibre browser capture, not a synthetic map canvas.
// The independent map-state contract prevents treating source-data readiness as
// proof that the background or marker layers have painted.
import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/explore-phone-overview");
await mkdir(output,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".webmanifest":"application/manifest+json"};
const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,"http://127.0.0.1");
    const file=resolve(root,"."+decodeURIComponent(url.pathname));
    if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("Forbidden");return;}
    const bytes=await readFile(file);
    res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
    res.end(bytes);
  }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e.message));}
});
await new Promise((ok,no)=>{server.once("error",no);server.listen(0,"127.0.0.1",ok);});
const origin="http://127.0.0.1:"+server.address().port;
const cases=[320,390,430].flatMap(width=>["en","fr"].map(language=>({
  width,language,height:width===320?700:width===390?844:932,
})));
let browser;
const results=[];
try{
 browser=await chromium.launch({headless:true});
 for(const {width,height,language} of cases){
  const ctx=await browser.newContext({viewport:{width,height},hasTouch:true,
    isMobile:true,deviceScaleFactor:1,locale:language==="fr"?"fr-FR":"en-GB",reducedMotion:"reduce"});
  const page=await ctx.newPage();
  const errors=[];
  page.on("pageerror",e=>errors.push(String(e.message||e)));
  try{
    await page.goto(origin+"/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:90000});
    await page.waitForFunction(()=>window.AO_APP_SHELL_V1?.status?.().visibleOwner===true
      &&!!document.querySelector(".homeScreen"),null,{timeout:45000});
    await page.waitForFunction(()=>!document.getElementById("ao-cinema-boot"),null,{timeout:20000});
    if(language==="fr"){
      await page.evaluate(()=>window.AO_SETTINGS_APP_V1.open("/settings/language-reading"));
      await page.locator('[data-pref-path="general.uiLanguage"][data-pref-value="fr"]').click();
      await page.waitForFunction(()=>window.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr",null,{timeout:15000});
      await page.locator("#ao-settings-modular-root [data-settings-close]").click();
    }
    await page.locator('[data-ao-app-surface="find"]').click();
    await page.waitForFunction(()=>window.AO_FIND_APP_V1?.status?.().loadState==="ready",null,{timeout:35000});
    await page.waitForFunction(()=>document.querySelector(".aoFindMap")?.dataset.aoMapState==="ready"
      &&!!document.querySelector(".aoFindMap .maplibregl-canvas"),null,{timeout:35000});
    // Style "load" precedes paint for asynchronously sourced clusters.
    await page.waitForTimeout(1250);
    const metrics=await page.evaluate(()=>{
      const rect=selector=>{
        const el=document.querySelector(selector);
        if(!el)return null;
        const r=el.getBoundingClientRect();
        return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom};
      };
      return {
        map:rect(".aoFindMap"),hint:rect(".aoHeritageMapHint"),
        nearby:rect(".aoHeritageNearby"),
        attribution:rect(".aoFindMap .maplibregl-ctrl-attrib"),
        canvas:rect(".aoFindMap .maplibregl-canvas"),
        world:rect(".aoHeritageWorldReset"),
        state:document.querySelector(".aoFindMap")?.dataset.aoMapState,
        language:window.AO_RUNTIME_V8?.store?.getState?.()?.language,
        overflow:document.documentElement.scrollWidth-innerWidth,
      };
    });
    const overlaps=(a,b)=>a&&b&&a.x<b.right&&b.x<a.right&&a.y<b.bottom&&b.y<a.bottom;
    assert.equal(metrics.state,"ready");
    assert.equal(await page.locator(".aoFindMap").getAttribute("data-ao-cartography"),"enhanced-dark",
      "Real EN/FR map screenshots require the applied country and sea/land contrast palette");
    assert.equal(metrics.language,language);
    assert.ok(metrics.map?.w>=width-25,"Map viewport collapsed at "+width);
    assert.ok(metrics.attribution?.w>10&&metrics.attribution?.h>10,
      "Legally required MapLibre/OSM attribution missing on "+language+" "+width);
    assert.ok(metrics.nearby?.w>=44&&metrics.nearby?.h>=44,
      "Near me target below 44px on "+language+" "+width);
    assert.ok(!overlaps(metrics.hint,metrics.attribution),
      "Map hint occludes attribution on "+language+" "+width);
    assert.ok(!overlaps(metrics.nearby,metrics.attribution),
      "Near me button occludes attribution on "+language+" "+width);
    assert.ok(!overlaps(metrics.hint,metrics.nearby),
      "Map hint overlaps Near me on "+language+" "+width);
    assert.ok(metrics.overflow<=1,"Horizontal page overflow on "+language+" "+width);
    assert.deepEqual(errors,[],"Browser errors: "+errors.slice(0,3).join("; "));
    const name=language+"-"+width+"-explore.png";
    await page.screenshot({path:resolve(output,name),animations:"disabled"});
    // The two-collection selector replaces the older Discover / Sacred /
    // Latin Mass trio. Actual tiles/markers are used rather than a map stub.
    const atlasTabLabels=await page.locator(".aoAtlasPrimaryTabs > button").allTextContents();
    assert.equal(atlasTabLabels.length,2,language+" "+width+"px Atlas navigation is not binary");
    assert.ok(atlasTabLabels.some(t=>/TLM/.test(t))&&
      atlasTabLabels.some(t=>/Sacred Atlas|Atlas sacré/.test(t)),
      "Atlas labels do not match the two collections: "+atlasTabLabels.join(" | "));
    await page.locator('.aoAtlasPrimaryTabs [data-atlas-entry-tab="sacred"]').click();
    await page.waitForFunction(()=>document.querySelector('.aoHeritageSurface')?.dataset.atlasEntry==="sacred",null,{timeout:15000});
    const rail=page.locator('.aoHeritageSurface[data-atlas-entry="sacred"] .aoMapcnDiscoverRail');
    await rail.waitFor({state:"visible",timeout:15000});
    const closed=await rail.evaluate(el=>({height:el.getBoundingClientRect().height,
      expanded:el.dataset.discoverExpanded,
      aria:el.querySelector('[data-mapcn-discover-toggle]')?.getAttribute("aria-expanded")}));
    assert.equal(closed.expanded,"false",language+" "+width+"px Sacred Places should open map-first");
    assert.equal(closed.aria,"false",language+" "+width+"px rail aria does not match its state");
    assert.ok(closed.height>=72&&closed.height<=100,
      language+" "+width+"px closed rail covers the real map: "+JSON.stringify(closed));
    await page.screenshot({path:resolve(output,language+"-"+width+"-sacred-closed-real.png"),animations:"disabled"});
    await rail.locator('[data-mapcn-discover-toggle]').click();
    await page.waitForFunction(()=>{const rail=document.querySelector('.aoHeritageSurface[data-atlas-entry="sacred"] .aoMapcnDiscoverRail');return rail?.dataset.discoverExpanded==="true"&&rail.getBoundingClientRect().height>=170;},null,{timeout:15000});
    const opened=await rail.evaluate(el=>({height:el.getBoundingClientRect().height,
      aria:el.querySelector('[data-mapcn-discover-toggle]')?.getAttribute("aria-expanded")}));
    assert.equal(opened.aria,"true",language+" "+width+"px expanded results rail not accessible");
    assert.ok(opened.height>closed.height+90&&opened.height<=Math.min(height*.48,420)+3,
      language+" "+width+"px expanded rail geometry wrong: "+JSON.stringify(opened));
    // The first two worldwide Place photographs have priority because they
    // are visible in the initial photographic rail. A blank image is not an
    // acceptable screenshot, nor is a missing approved cover silently okay.
    await page.waitForFunction(()=>{
      const rail=document.querySelector('.aoHeritageSurface[data-atlas-entry="sacred"] .aoMapcnDiscoverRail');
      const images=[...(rail?.querySelectorAll('.aoMapcnEditorialCard img')||[])].slice(0,2);
      return images.length===2&&images.every(img=>img.complete&&img.naturalWidth>0);
    },null,{timeout:20000});
    // naturalWidth becomes non-zero before decode and composition finish.
    // Wait for the two above-the-fold approved images to actually decode,
    // then allow two paint frames. The previous test accepted an empty card.
    await page.evaluate(async()=>{
      const images=[...document.querySelectorAll('.aoHeritageSurface[data-atlas-entry="sacred"] .aoMapcnEditorialCard img')].slice(0,2);
      await Promise.all(images.map(img=>img.decode()));
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    });
    await page.screenshot({path:resolve(output,language+"-"+width+"-sacred-expanded-real.png"),animations:"disabled"});
    results.push({language,width,...metrics,file:name,railClosed:closed.height,railExpanded:opened.height,
      sacredScreenshots:[language+"-"+width+"-sacred-closed-real.png",language+"-"+width+"-sacred-expanded-real.png"]});
    console.log("PASS Explore actual map "+name+"; attribution and hint separate");
  }finally{await ctx.close();}
 }
 await writeFile(resolve(output,"metrics.json"),JSON.stringify(results,null,2));
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(ok=>server.close(ok));
}
