// Scoped, real-browser acceptance for the Saints lens in the original Explore.
// Runs against the repo's own index.html, not a standalone second app.
import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const destination=resolve(root,"artifacts/saints-visual-acceptance");
await mkdir(destination,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
  try{
    const p=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    const f=resolve(root,"."+p);
    if(f!==root&&!f.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return;}
    const payload=await readFile(f);
    res.writeHead(200,{"content-type":mime[extname(f)]||"application/octet-stream","cache-control":"no-store"});
    res.end(payload);
  }catch(error){if(!res.headersSent)res.writeHead(error?.code==="ENOENT"?404:500);if(!res.writableEnded)res.end(String(error?.message??error));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4211,"127.0.0.1",ok)});

let browser;
const report=[];
try{
 browser=await chromium.launch({headless:true});
 for(const config of [{name:"phone390",width:390,height:844,touch:true},{name:"desktop1280",width:1280,height:800,touch:false}]){
   const context=await browser.newContext({viewport:{width:config.width,height:config.height},deviceScaleFactor:1,isMobile:config.touch,hasTouch:config.touch,locale:"en-GB",reducedMotion:"reduce"});
   const page=await context.newPage(),errors=[];
   page.on("pageerror",e=>errors.push(String(e?.message??e)));
   await page.goto("http://127.0.0.1:4211/index.html",{waitUntil:"domcontentloaded",timeout:90000});
   await page.locator('[data-ao-app-surface="find"]').waitFor({state:"visible",timeout:45000});
   await page.locator('[data-ao-app-surface="find"]').click();
   await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().loadState==="ready"
      &&globalThis.AO_FIND_APP_V1?.status?.().lens==="heritage",null,{timeout:70000});
   if(config.name==="phone390"){
     const crosswalk=JSON.parse(await readFile(resolve(root,"data/saints/1962-observed-identity-crosswalk-pilot.v1.json"),"utf8"));
     assert.equal(crosswalk.candidate_general_1962.length,2);
     assert.equal(crosswalk.not_assigned_general_1962.length,4);
     const observations=await page.evaluate(async entries=>{
       const {observedCycle}=await import("/src/calendar/observed-cycle.js");
       const resolver=globalThis.AO_RUNTIME_V8?.resolver;
       if(typeof resolver?.resolveDay!=="function")throw Error("Canonical Calendar resolver unavailable");
       const results=[];
       for(const entry of entries){
         const date="2026-"+entry.month_day;
         const result=await resolver.resolveDay(date);
         const main=result?.day?.main??{},proper=result?.proper?.data??{};
         const titles=[proper.name,proper.nameFr,main.title,main.titleFr].filter(Boolean).map(String);
         results.push({saint_id:entry.saint_id,date,status:result?.status??"unknown",
           mainId:main.id??null,cycle:observedCycle(result),titles,
           commemorations:(result?.day?.commemorations??[]).map(x=>typeof x==="string"?x:x?.title||x?.name||"")});
       }
       return results;
     },crosswalk.candidate_general_1962);
     for(const row of observations){
       assert.notEqual(row.status,"failed",row.date+" Calendar resolver failed");
       assert(row.mainId,"Canonical observed day must include an identity "+row.date);
       const cue=crosswalk.candidate_general_1962.find(x=>x.saint_id===row.saint_id);
       const labels=[...row.titles,...row.commemorations].join(" ").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
       const match=cue.expected_title_tokens.some(token=>labels.includes(token.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()));
       assert(match,"Candidate must actually appear in principal or commemorations: "+JSON.stringify(row));
       assert.equal(row.cycle,"sanctorale","1962 date candidate displaced by a temporal day; do not bind automatically: "+row.date);
     }
     console.log("Observed two source-resolved Calendar identity candidates without modifying Calendar: "+JSON.stringify(observations));
   }
   const nav=page.locator('#ao-find-modular-root .aoHeritageCategories [data-find-filter="lens"][data-find-filter-value="saints"]');
   assert.equal(await nav.count(),1,"Single native Saints entry required");
   const rect=await nav.boundingBox();
   assert(rect?.height>=39&&rect.width>=44,"Saints filter too small for touch");
   await nav.click();
   await page.waitForFunction(()=>document.querySelector('#ao-find-modular-root [data-find-view="list"][data-explore-lens="saints"]')
     &&document.querySelector('#ao-find-modular-root .aoFindResultMeta strong')?.textContent==="6",null,{timeout:30000});
   assert.equal(await page.locator('#ao-find-modular-root .aoFindList [data-explore-item]').count(),6,
     "List should show first 24 of 30 canonical people");
   assert((await page.locator('#ao-find-modular-root .aoSaintScopeNote').innerText()).includes("Six source-linked Saints pilot profiles"));
   await page.screenshot({path:resolve(destination,config.name+"-00-catalogue-list.png"),fullPage:false});
   assert.equal(await page.locator('#ao-find-modular-root [data-find-filter="saintScope"]').count(),0,
     "No draft-only history or Doctor tabs in public pilot");
   assert.equal(await page.locator('#ao-find-modular-root [data-find-filter="saintCategory"]').count(),0,
     "No draft-only research filters in public pilot");
   assert(!((await page.locator('#ao-find-modular-root .aoFindSurface').innerText()).includes("John Chrysostom")),
     "Uncertified biography exposed in public pilot");
   await page.screenshot({path:resolve(destination,config.name+"-00b-public-release-gate.png"),fullPage:false});
   await page.locator('#ao-find-modular-root [data-find-filter="view"][data-find-filter-value="map"]').click();
   await page.waitForFunction(()=>{
     const s=globalThis.AO_FIND_APP_V1?.status?.();
     return s?.lens==="saints"&&s?.counts?.saints===9
       &&!!document.querySelector('#ao-find-modular-root [data-find-view="map"][data-explore-lens="saints"]');
   },null,{timeout:30000});
   const initial=await page.evaluate(()=>{
     const find=document.querySelector("#ao-find-modular-root");
     const box=find?.querySelector("[data-find-map]")?.getBoundingClientRect();
     return {status:globalThis.AO_FIND_APP_V1.status(),mapWidth:box?.width,mapHeight:box?.height,
       overflow:document.documentElement.scrollWidth-innerWidth,scope:find?.querySelector(".aoSaintScopeNote")?.textContent||""};
   });
   assert(initial.scope.includes("Map shows verified physical places"),"Map scope should identify physical Place pins");
   assert(initial.mapWidth>250&&initial.mapHeight>=300,"Saints map collapsed");
   assert(initial.overflow<=1,"Saints map causes horizontal overflow");
   await page.waitForFunction(()=>{
     const map=document.querySelector('#ao-find-modular-root [data-explore-lens="saints"] [data-find-map]');
     return !!map&&(!!map.querySelector("canvas")||(map.textContent||"").trim().length>=15);
   },null,{timeout:25000});
   await page.waitForFunction(()=>{
     const map=document.querySelector('#ao-find-modular-root [data-explore-lens="saints"] [data-find-map]');
     return ["ready","stalled","unavailable","empty"].includes(map?.dataset?.aoMapState);
   },null,{timeout:30000});
   const mapMode=await page.evaluate(()=>{
     const map=document.querySelector('#ao-find-modular-root [data-explore-lens="saints"] [data-find-map]');
     return {canvas:!!map?.querySelector("canvas"),mapState:map?.dataset?.aoMapState||"",
       fallback:(map?.querySelector(".aoExploreMapStalled,.aoFindMapFallback")?.textContent||"").trim()};
   });
   if(mapMode.mapState!=="ready")assert(mapMode.fallback.length>=20,"Map fallback missing");
   else await page.waitForTimeout(1200);
   await page.screenshot({path:resolve(destination,config.name+"-01-native-map.png"),fullPage:false});
   await page.locator('#ao-find-modular-root [data-find-filter="view"][data-find-filter-value="list"]').click();
   await page.waitForFunction(()=>document.querySelector('#ao-find-modular-root .aoFindResultMeta strong')?.textContent==="6");
   const query=page.locator('#ao-find-modular-root [data-find-query]');
   await query.fill("Lisieux");
   await page.waitForFunction(()=>document.querySelector('#ao-find-modular-root .aoFindResultMeta strong')?.textContent==="1");
   await page.locator("#ao-find-modular-root .aoFindList [data-explore-item]").first().click();
   const thSheet=page.locator("#ao-find-modular-root .aoSaintPlaceSheet");
   await thSheet.waitFor({state:"visible",timeout:12000});
   assert.equal(await thSheet.locator('[data-saint-id="saint:therese-of-lisieux"] .aoSaintCalendarContext').count(),1);
   assert.match(await thSheet.locator(".aoSaintCalendarContext").innerText(),/3 October 2026/);
   assert.match(await thSheet.locator(".aoSaintCalendarCaution").innerText(),/not a timeless feast date/);
   assert.equal(await thSheet.locator("img").count(),0,"No unapproved portrait");
   await page.screenshot({path:resolve(destination,config.name+"-02-therese-calendar.png"),fullPage:false});
   await thSheet.locator("button[data-find-close-detail]").click();
   await page.waitForFunction(()=>!document.querySelector("#ao-find-modular-root .aoFindSheetBackdrop"),null,{timeout:12000});
   await query.fill("Paray");
   await page.waitForFunction(()=>document.querySelector('#ao-find-modular-root .aoFindResultMeta strong')?.textContent==="2");
   await page.locator('#ao-find-modular-root [data-explore-item="saints:person:saint:margaret-mary-alacoque"]').click();
   const sheet=page.locator("#ao-find-modular-root .aoSaintPlaceSheet");
   await sheet.waitFor({state:"visible",timeout:12000});
   assert.equal(await sheet.locator(".aoSaintBiography").count(),1,"Canonical person is a single catalogue profile");
   assert.match(await sheet.innerText(),/Margaret Mary/);
   assert.equal(await sheet.locator(".aoSaintLifeEvents").count(),1);
   assert.equal(await sheet.locator(".aoSaintLife").count(),1);
   assert.equal(await sheet.locator('[data-saint-category="MYSTIC"]').count(),1);
   assert.equal(await sheet.locator('[data-saint-event="event:margaret-mary:paray-sacred-heart"]').count(),1);
   assert.equal(await sheet.locator("img").count(),0);
   const reading=sheet.locator("details.aoSaintReading");
   assert.equal(await reading.count(),1);
   assert.equal(await reading.getAttribute("open"),null);
   await reading.locator("summary").click();
   const links=await reading.locator('a[href]').evaluateAll(nodes=>nodes.map(x=>({href:x.href,target:x.target,rel:x.rel})));
   assert(links.length>0);
   for(const source of links){
     assert.match(source.href,/^https:\/\/www\.vatican\.va\//);
     assert.equal(source.target,"_blank");
     assert(source.rel.split(/\s+/).includes("noopener"));
   }
   assert((await sheet.boundingBox())?.height<config.height*0.88);
   await page.screenshot({path:resolve(destination,config.name+"-03-margaret-profile.png"),fullPage:false});
   await sheet.locator("[data-explore-open-place]").click();
   await page.locator("#ao-find-modular-root .aoHeritagePreview, #ao-find-modular-root .aoExplorePlaceSheet").first().waitFor({state:"visible",timeout:15000});
   await page.screenshot({path:resolve(destination,config.name+"-04-original-place.png"),fullPage:false});
   await page.locator("#ao-find-modular-root [data-find-close-place]").first().click();
   await page.waitForFunction(()=>!document.querySelector("#ao-find-modular-root .aoFindSheet"),null,{timeout:10000});
   await page.locator('#ao-find-modular-root [data-find-query]').fill("Laval");
   await page.waitForFunction(()=>document.querySelector('#ao-find-modular-root .aoFindResultMeta strong')?.textContent==="1");
   await page.locator("#ao-find-modular-root .aoFindList [data-explore-item]").first().click();
   const laval=page.locator("#ao-find-modular-root .aoSaintPlaceSheet");
   await laval.waitFor({state:"visible"});
   assert((await laval.innerText()).includes("Blessed · not canonized"),"Blessed Laval remains beatified");
   await page.screenshot({path:resolve(destination,config.name+"-05-blessed-laval.png"),fullPage:false});
   await page.locator("#ao-find-modular-root button[data-find-close-detail]").click();
   await page.waitForFunction(()=>!document.querySelector("#ao-find-modular-root .aoFindSheetBackdrop"),null,{timeout:12000});
   await page.locator('#ao-find-modular-root .aoFindHeader [data-find-close]').click();
   await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().lens==="heritage",null,{timeout:15000});
   assert.equal(errors.length,0,"Explore Saints phone/desktop runtime error: "+errors.join(" | "));
   report.push({viewport:config.name,mapMode,physicalPlaces:9,mappedPlaces:8,sourceLinks:links.length,overflow:initial.overflow,errors});
   await context.close();
 }
 console.log("PASS native Explore Saints visual acceptance: "+JSON.stringify(report));
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(resolve=>server.close(resolve));
}
