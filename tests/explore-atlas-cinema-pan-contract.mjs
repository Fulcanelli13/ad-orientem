import assert from "node:assert/strict";
import http from "node:http";
import {readFile,readFileSync} from "node:fs";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {buildBibleAtlas} from "../src/find/bible-atlas.js";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const data=JSON.parse(readFileSync(new URL("../data/explore/bible-places-compact.v1.json",import.meta.url),"utf8"));
const stops=buildBibleAtlas(data.entries);
const firstMapped=stops.find(s=>s.geo);
assert.ok(firstMapped&&firstMapped.index>0,"Review requires a source-qualified opening scene after Creation");
const secondMapped=stops.find(s=>s.geo&&s.index>firstMapped.index+2&&s.geo.key!==firstMapped.geo.key);
assert.ok(secondMapped,"Need distinct mapped geography to assert Follow");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer((req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+path);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  readFile(file,(err,bytes)=>{
   if(err){res.writeHead(err?.code==="ENOENT"?404:500);res.end(String(err.message));return;}
   res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
   res.end(bytes);
  });
 }catch(e){res.writeHead(500);res.end(String(e));}
});
await new Promise((ok,no)=>{server.once("error",no);server.listen(4298,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,locale:"en-GB"});
 await context.addInitScript(()=>{
  window.__atlasMapHarness=[];
  class Map {
   constructor(options){
    this.container=options.container;this.center=options.center??[35,31];
    this.zoom=options.zoom??3.6;this.calls=[];this.sources={};this.handlers={};this.removed=false;
    const canvas=document.createElement("canvas");canvas.className="maplibregl-canvas";
    canvas.width=500;canvas.height=500;canvas.style.cssText="height:100%;width:100%;touch-action:none;display:block;background:linear-gradient(135deg,#14212c,#243c46)";
    this.container.append(canvas);this.canvas=canvas;
    let start=null,moved=false;
    canvas.addEventListener("pointerdown",event=>{start=[event.clientX,event.clientY];moved=false;});
    canvas.addEventListener("pointermove",event=>{
     if(!start||moved)return;
     if(Math.abs(event.clientX-start[0])+Math.abs(event.clientY-start[1])>12){
      moved=true;this.fire("dragstart");}
    });
    canvas.addEventListener("pointerup",()=>{start=null;});
    canvas.addEventListener("pointercancel",()=>{start=null;});
    window.__atlasMapHarness.push(this);
    setTimeout(()=>{if(!this.removed){this.ready=true;this.fire("load")}},50);
   }
   on(type,layerOrCallback,callback){
    if(typeof layerOrCallback==="function")(this.handlers[type]??=[]).push(layerOrCallback);
    else if(typeof callback==="function")(this.handlers[type+":"+layerOrCallback]??=[]).push(callback);
    return this;
   }
   once(type,callback){const fn=(...args)=>{this.off(type,fn);callback(...args)};this.on(type,fn);}
   off(type,callback){this.handlers[type]=(this.handlers[type]||[]).filter(fn=>fn!==callback);}
   fire(type,arg={}){(this.handlers[type]||[]).forEach(fn=>fn(arg));}
   loaded(){return Boolean(this.ready)}
   addControl(){}
   addSource(id,value){
    this.sources[id]={...value,updates:0,
      setData(data){this.data=data;this.updates++},
      getClusterExpansionZoom:async()=>8,getClusterLeaves:async()=>[]};}
   getSource(id){return this.sources[id]??null}
   addLayer(){}
   getLayer(){return null}
   getCanvas(){return this.canvas}
   setPaintProperty(){}
   getStyle(){return {layers:[
    {id:"country_label",type:"symbol"},
    {id:"admin-country-boundary",type:"line"},
    {id:"terrain-water",type:"fill"},
    {id:"ao-explore-points",type:"circle"}
   ]}}
   setLayoutProperty(id,property,value){(this.hiddenLayers??=[]).push({id,property,value})}
   hasImage(){return true}
   addImage(){}
   loadImage(url,cb){cb(new Error("stubbed image"))}
   setFilter(){}
   fitBounds(){}
   jumpTo(x){this.center=x.center??this.center;this.calls.push({kind:"jump",center:this.center})}
   easeTo(x){this.center=x.center??this.center;this.zoom=x.zoom??this.zoom;this.calls.push({kind:"ease",center:[...this.center],zoom:this.zoom})}
   resize(){}
   getCenter(){return {lng:this.center[0],lat:this.center[1]}}
   getZoom(){return this.zoom}
   getBounds(){return {getWest:()=>-180,getEast:()=>180,getSouth:()=>-85,getNorth:()=>85}}
   remove(){this.removed=true}
  }
  class NavigationControl{}
  class FullscreenControl{}
  window.AO_FIND_MAPLIBRE_MODULE={Map,NavigationControl,FullscreenControl};
 });
 const page=await context.newPage(),errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 await page.goto("http://127.0.0.1:4298/index.html?atlasCinema=1",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForSelector('[data-ao-app-surface="find"]',{state:"visible",timeout:30000});
 await page.locator('[data-ao-app-surface="find"]').tap();
 await page.waitForFunction(()=>window.AO_FIND_APP_V1?.status?.().loadState==="ready",null,{timeout:30000});
 await page.locator("#ao-find-modular-root details.aoHeritageMore > summary").tap();
 await page.locator("#ao-find-modular-root [data-bible-atlas-open]").waitFor({state:"visible"});
 await page.waitForTimeout(360);
 await page.locator("#ao-find-modular-root [data-bible-atlas-open]").tap();
 await page.waitForFunction(n=>window.AO_FIND_APP_V1?.status?.().bibleAtlas===true&&
   window.AO_FIND_APP_V1?.status?.().bibleIndex===n,firstMapped.index,{timeout:20000});
 await page.waitForFunction(()=>window.__atlasMapHarness.some(m=>m.container.closest("[data-ao-bible-atlas]")&&
  m.getSource("ao-explore-items")),{timeout:15000});
 const info=()=>page.evaluate(()=>{
  const m=window.__atlasMapHarness.find(m=>!m.removed&&m.container.closest("[data-ao-bible-atlas]"));
  return {active:m!=null,camera:m?.center,sequence:m?.calls.map(c=>c.kind),
    easing:m?.calls.filter(c=>c.kind==="ease").length,
    sourceUpdates:m?.getSource("ao-explore-items")?.updates??0,
    hiddenLayers:m?.hiddenLayers??[],
    pinCount:m?.getSource("ao-explore-items")?.data?.features?.length??0,
    following:document.querySelector("[data-bible-follow]")?.getAttribute("aria-pressed"),
    current:window.AO_FIND_APP_V1?.status?.().bibleIndex};
 });
 const opened=await info();
 assert.equal(opened.current,firstMapped.index);
 assert.equal(opened.following,"true");
 assert.ok(opened.pinCount>0,"Review starts with source-qualified pins and no invented geography");
 const hidden=new Set(opened.hiddenLayers.filter(x=>x.property==="visibility"&&x.value==="none").map(x=>x.id));
 assert.ok(hidden.has("country_label")&&hidden.has("admin-country-boundary"),
  "Review suppresses modern country labels and administrative boundaries");
 assert.ok(!hidden.has("terrain-water")&&!hidden.has("ao-explore-points"),
  "Review preserves the land/water context and all source-backed application pins");
 assert.deepEqual(opened.camera,[firstMapped.geo.lng,firstMapped.geo.lat]);
 const canvas=page.locator("#ao-find-modular-root [data-bible-map] canvas");
 await canvas.scrollIntoViewIfNeeded();
 const box=await canvas.boundingBox();
 assert.ok(box&&box.width>120&&box.height>120,"Harness map canvas visible");
 await page.mouse.move(box.x+box.width*.45,box.y+box.height*.35);
 await page.mouse.down();
 await page.mouse.move(box.x+box.width*.7,box.y+box.height*.49,{steps:14});
 await page.mouse.up();
 await page.waitForFunction(()=>document.querySelector("[data-bible-follow]")?.getAttribute("aria-pressed")==="false");
 const dragged=await info();
 assert.equal(dragged.following,"false","Map drag suspends camera following");
 await page.locator('#ao-find-modular-root [data-bible-step="'+secondMapped.index+'"]').tap();
 await page.waitForFunction(n=>window.AO_FIND_APP_V1?.status?.().bibleIndex===n,secondMapped.index);
 const free=await info();
 assert.equal(free.following,"false");
 assert.deepEqual(free.camera,dragged.camera,"Selecting another scene must not seize a manually dragged map");
 assert.equal(free.easing,dragged.easing,"No camera easing when Follow is off");
 assert.ok(free.sourceUpdates>dragged.sourceUpdates,"Pins still update while panning freely");
 await page.locator("#ao-find-modular-root [data-bible-follow]").tap();
 await page.waitForFunction(()=>document.querySelector("[data-bible-follow]")?.getAttribute("aria-pressed")==="true");
 const restored=await info();
 assert.deepEqual(restored.camera,[secondMapped.geo.lng,secondMapped.geo.lat],"Follow re-centres selected mapped event");
 assert.ok(restored.easing>free.easing,"Follow causes a camera transition");
 // The original beginning remains available without an artificial Creation pin.
 await page.locator('#ao-find-modular-root [data-bible-chapter="0"]').tap();
 await page.waitForFunction(()=>window.AO_FIND_APP_V1?.status?.().bibleIndex===0);
 assert.equal(await page.locator("#ao-find-modular-root [data-bible-unlocated-note]").isVisible(),true);
 assert.equal(await page.locator('#ao-find-modular-root [data-bible-step="0"]').getAttribute("aria-pressed"),"true");
 assert.equal(errors.length,0,errors.join(" | "));
 console.log("PASS deterministic in-browser MapLibre adapter: map-first entry, native drag/free, pinned-source update, Follow restoration, Creation reachable");
 console.log(JSON.stringify({initialScene:firstMapped.index,secondScene:secondMapped.index,panned:dragged.following==="false",
  correctPanContract:true,geographyUnmodified:true,externalMapLibreUsed:false}));
 await context.close();
}finally{await browser?.close().catch(()=>{});await new Promise(ok=>server.close(ok))}
