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
    results.push({language,width,...metrics,file:name});
    console.log("PASS Explore actual map "+name+"; attribution and hint separate");
  }finally{await ctx.close();}
 }
 await writeFile(resolve(output,"metrics.json"),JSON.stringify(results,null,2));
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(ok=>server.close(ok));
}
