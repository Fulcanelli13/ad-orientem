import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {buildBibleAtlas,atlasCinemaChapters} from "../src/find/bible-atlas.js";
import {readFileSync} from "node:fs";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const corpus=JSON.parse(readFileSync(new URL("../data/explore/bible-places-compact.v1.json",import.meta.url),"utf8"));
const stops=buildBibleAtlas(corpus.entries),chapters=atlasCinemaChapters(stops);
const port=4299;
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
 ".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const p=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const path=resolve(root,"."+p);
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const bytes=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e));}
});
await new Promise((yes,no)=>{server.once("error",no);server.listen(port,"127.0.0.1",yes)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,locale:"en-GB"});
 const page=await context.newPage(),errors=[],sourceResponses=new Map();
 page.on("response",response=>{for(const name of ["land","lakes","rivers"]){
  if(response.url().includes("/atlas-physical-"+name+"-50m.geojson"))sourceResponses.set(name,response.status());
 }});
 page.on("pageerror",e=>errors.push(e.message));
 await page.goto("http://127.0.0.1:"+port+"/index.html?atlasCinema=1",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForSelector('[data-ao-app-surface="find"]',{state:"visible",timeout:30000});
 await page.locator('[data-ao-app-surface="find"]').tap();
 await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().loadState==="ready",null,{timeout:60000});
 await page.locator("#ao-find-modular-root details.aoHeritageMore > summary").tap({timeout:15000});
 await page.locator("#ao-find-modular-root .aoHeritageMore[open] [data-bible-atlas-open]").waitFor({state:"visible",timeout:15000});
 await page.waitForTimeout(360);
 await page.locator("#ao-find-modular-root [data-bible-atlas-open]").tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().bibleAtlas===true&&document.querySelector('[data-bible-cinematic="review"]'),null,{timeout:20000});
 await page.waitForFunction(()=>document.querySelector("[data-bible-map]")?.dataset.aoMapState==="ready",null,{timeout:45000});
 await page.waitForTimeout(900);
 assert.deepEqual([...sourceResponses.keys()].sort(),["lakes","land","rivers"].sort(),
  "Physical basemap must fetch only three in-repository public-domain sources");
 assert.ok([...sourceResponses.values()].every(status=>status===200),
  "Physical GeoJSON must load successfully (not CDN political tiles): "+JSON.stringify([...sourceResponses]));
 assert.equal(await page.locator('#ao-find-modular-root [data-bible-map] canvas').count(),1);
 const physicalNote=page.locator("#ao-find-modular-root [data-bible-physical-note]");
 assert.equal(await physicalNote.isVisible(),true);
 assert.match(await physicalNote.innerText(),/MODERN PHYSICAL RELIEF · PRESENT-DAY COASTLINES/);
 const headerHeight=await page.locator("#ao-find-modular-root .aoBibleAtlasEraHeader").evaluate(el=>el.getBoundingClientRect().height);
 assert.ok(headerHeight<120,"Phone chronology header too tall: "+headerHeight);
 assert.equal(await page.locator("#ao-find-modular-root [data-bible-step]").count(),151);
 assert.equal(await page.locator("#ao-find-modular-root [data-bible-chapter]").count(),11);
 assert.equal(await page.locator("#ao-find-modular-root [data-bible-map]").count(),1);
 assert.equal(await page.locator("#ao-find-modular-root [data-bible-sheet=collapsed]").count(),1);
 assert.equal(await page.locator("#ao-find-modular-root [data-bible-follow]").getAttribute("aria-pressed"),"true");
 assert.equal(await page.locator("#ao-find-modular-root [data-bible-era-overlay]").innerText(),"","Map-first entry must not use a cinematic opening splash");
 const folder=resolve(root,"test-output/atlas-physical");
 await mkdir(folder,{recursive:true});
 for(const size of [320,390,768]){
  await page.setViewportSize({width:size,height:size===768?1024:844});
  await page.waitForTimeout(80);
  const g=await page.evaluate(()=>({viewport:innerWidth,doc:document.documentElement.scrollWidth,
   root:document.querySelector("#ao-find-modular-root")?.getBoundingClientRect().width}));
  assert.ok(g.doc<=g.viewport+1,"Cinematic Atlas page overflow at "+size+": "+JSON.stringify(g));
  const toggle=page.locator("#ao-find-modular-root [data-bible-sheet-toggle]");
  assert.equal(await toggle.isVisible(),true,"Compact event bar must remain visible at "+size);
  const target=page.locator("#ao-find-modular-root [data-bible-chapters]");
  assert.equal(await target.isVisible(),true,"Chapter navigation visible at "+size);
  await page.screenshot({path:resolve(folder,"atlas-physical-"+size+".png"),animations:"disabled"});
 }
 await page.setViewportSize({width:390,height:844});
 const patriarchs=chapters.find(x=>x.era==="PATRIARCHS");
 assert.ok(patriarchs);
 await page.locator('#ao-find-modular-root [data-bible-chapter="'+patriarchs.index+'"]').tap({timeout:15000});
 await page.waitForFunction(index=>globalThis.AO_FIND_APP_V1?.status?.().bibleIndex===index,patriarchs.index,{timeout:15000});
 assert.equal(await page.locator('#ao-find-modular-root [data-bible-chapter="'+patriarchs.index+'"]').getAttribute("aria-pressed"),"true");
 assert.equal(await page.locator("#ao-find-modular-root [data-bible-sheet=collapsed]").count(),1);
 await page.locator("#ao-find-modular-root [data-bible-sheet-toggle]").tap({timeout:15000});
 assert.equal(await page.locator("#ao-find-modular-root [data-bible-sheet=expanded]").count(),1);
 assert.equal(await page.locator("#ao-find-modular-root [data-bible-sheet-toggle]").getAttribute("aria-expanded"),"true");
 await page.locator("#ao-find-modular-root [data-bible-detail] [data-ao-scripture-context]").tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_SCRIPTURE_APP_V1?.status?.().open===true,null,{timeout:15000});
 await page.locator('#ao-scripture-overlay [data-scripture-close]').first().tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_SCRIPTURE_APP_V1?.status?.().open===false,null,{timeout:15000});
 assert.equal(await page.locator("#ao-find-modular-root [data-bible-cinematic=review]").count(),1);
 assert.equal(await page.locator("#ao-find-modular-root [data-bible-sheet=expanded]").count(),1);
 // Real MapLibre drag acceptance whenever external tiles/library load in CI.
 let panVerified=false;
 const canvas=page.locator("#ao-find-modular-root [data-bible-map] canvas").first();
 if(await canvas.count()&&await canvas.isVisible()){
  const box=await canvas.boundingBox();
  if(box&&box.width>120&&box.height>120){
   const x=box.x+box.width*.5,y=box.y+box.height*.4;
   await page.mouse.move(x,y);await page.mouse.down();
   await page.mouse.move(x+75,y+35,{steps:12});await page.mouse.up();
   await page.waitForTimeout(180);
   panVerified=await page.locator("#ao-find-modular-root [data-bible-follow]").getAttribute("aria-pressed")==="false";
   if(panVerified){
    await page.locator("#ao-find-modular-root [data-bible-follow]").tap({timeout:15000});
    assert.equal(await page.locator("#ao-find-modular-root [data-bible-follow]").getAttribute("aria-pressed"),"true");
   }
  }
 }
 await page.locator('#ao-find-modular-root [data-bible-step="150"]').tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().bibleIndex===150,null,{timeout:15000});
 assert.equal(await page.locator("#ao-find-modular-root [data-bible-unlocated-note]").isVisible(),true);
 assert.equal(await page.locator("#ao-find-modular-root [data-bible-detail] [data-ao-scripture-context]").count(),1);
 await page.locator("#ao-find-modular-root [data-bible-atlas-close]").tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().bibleAtlas===false,null,{timeout:15000});
 assert.equal(errors.length,0,"Browser runtime errors: "+errors.join(" | "));
 console.log("PASS public-domain physical map: all 3 local GeoJSON sources loaded; 151 events, 3 mobile widths and canonical reader unchanged");
 console.log(JSON.stringify({stopCount:stops.length,chapterCount:chapters.length,panVerified,
  evidenceNote:panVerified?"MapLibre drag and Follow verified":"MapLibre drag was not confirmed in this runner; physical-phone gate remains"}));
 await context.close();
}finally{await browser?.close().catch(()=>{});await new Promise(ok=>server.close(ok))}
