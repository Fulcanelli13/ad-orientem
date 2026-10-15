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
   const nav=page.locator('#ao-find-modular-root .aoHeritageCategories [data-find-filter="lens"][data-find-filter-value="saints"]');
   assert.equal(await nav.count(),1,"Native Heritage must expose a single Saints map filter");
   const rect=await nav.boundingBox();
   assert(rect?.height>=39&&rect.width>=44,"Saints filter too small for touch");
   await nav.click();
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
   assert(initial.scope.includes("Six source-linked pilot biographies"),"Unfinished atlas is not editorially labelled");
   assert(initial.mapWidth>250&&initial.mapHeight>=300,"Saints map collapsed");
   assert(initial.overflow<=1,"Saints map causes horizontal viewport overflow");
   // A blocked external tile/CDN is not proof of coordinate failure:
   // maps must have an explicit fallback, never an unexplained blank region.
   await page.waitForFunction(()=>{
     const map=document.querySelector('#ao-find-modular-root [data-explore-lens="saints"] [data-find-map]');
     return !!map&&(!!map.querySelector("canvas")||(map.textContent||"").trim().length>=15);
   },null,{timeout:25000});
   const mapMode=await page.evaluate(()=>({
     canvas:!!document.querySelector('#ao-find-modular-root [data-explore-lens="saints"] [data-find-map] canvas'),
     mapState:document.querySelector('#ao-find-modular-root [data-explore-lens="saints"] [data-find-map]')?.dataset?.aoMapState||"",
   }));
   await page.screenshot({path:resolve(destination,config.name+"-01-native-map.png"),fullPage:false});

   await page.locator('#ao-find-modular-root [data-find-filter="view"][data-find-filter-value="list"]').click();
   await page.waitForFunction(()=>document.querySelector('#ao-find-modular-root [data-find-view="list"][data-explore-lens="saints"]'));
   assert.equal(await page.locator('#ao-find-modular-root .aoFindList [data-explore-item]').count(),9,"List has not retained nine physical Places");
   await page.screenshot({path:resolve(destination,config.name+"-02-places-list.png"),fullPage:false});

   const query=page.locator('#ao-find-modular-root [data-find-query]');
   await query.fill("Therese");
   await page.waitForFunction(()=>document.querySelector('#ao-find-modular-root .aoFindResultMeta strong')?.textContent==="2",null,{timeout:10000});
   assert.equal(await page.locator('#ao-find-modular-root .aoFindList [data-explore-item]').count(),2,"Accented/unaccented French saint search regressed");
   await page.locator('#ao-find-modular-root [data-find-query]').fill("Paray");
   await page.waitForFunction(()=>document.querySelector('#ao-find-modular-root .aoFindResultMeta strong')?.textContent==="1",null,{timeout:10000});
   const paray=page.locator('#ao-find-modular-root .aoFindList [data-explore-item]');
   assert.equal(await paray.count(),1,"Two Paray saint lives must share one physical Place");
   await paray.first().click();
   await page.locator("#ao-find-modular-root .aoSaintPlaceSheet").waitFor({state:"visible",timeout:12000});
   assert.equal(await page.locator("#ao-find-modular-root .aoSaintPlaceSheet .aoSaintBiography").count(),2,"Both saint biographies must survive one shared pin");
   const sheet=page.locator("#ao-find-modular-root .aoSaintPlaceSheet");
   const text=await sheet.innerText();
   assert.match(text,/Margaret Mary/);
   assert.match(text,/Claude/);
   assert.match(text,/Sources & further reading/);
   assert.equal(await sheet.locator("img").count(),0,"Non-approved artwork must not be published in a saint biography");
   const reading=sheet.locator("details.aoSaintReading");
   assert.equal(await reading.count(),2);
   assert.equal(await reading.first().getAttribute("open"),null,"Dense sources must be collapsed by default");
   await reading.first().locator("summary").click();
   const links=await reading.first().locator('a[href]').evaluateAll(nodes=>nodes.map(x=>({href:x.href,target:x.target,rel:x.rel})));
   assert(links.length>0,"Opening Further reading should give actual links");
   for(const source of links){
     assert.match(source.href,/^https:\/\/www\.vatican\.va\//);
     assert.equal(source.target,"_blank");
     assert(source.rel.split(/\s+/).includes("noopener"));
   }
   assert((await sheet.boundingBox())?.height<config.height*0.88,"Saints sheet obscures excessive viewport space");
   await page.screenshot({path:resolve(destination,config.name+"-03-paray-two-saints.png"),fullPage:false});
   await sheet.locator("[data-explore-open-place]").click();
   await page.locator("#ao-find-modular-root .aoHeritagePreview, #ao-find-modular-root .aoExplorePlaceSheet").first().waitFor({state:"visible",timeout:15000});
   await page.screenshot({path:resolve(destination,config.name+"-04-existing-place-return.png"),fullPage:false});
   await page.locator("#ao-find-modular-root [data-find-close-place]").first().click();
   await page.waitForFunction(()=>!document.querySelector("#ao-find-modular-root .aoFindSheet"),null,{timeout:10000});
   await page.locator('#ao-find-modular-root [data-find-query]').fill("Laval");
   await page.waitForFunction(()=>document.querySelector('#ao-find-modular-root .aoFindResultMeta strong')?.textContent==="1",null,{timeout:10000});
   await page.locator("#ao-find-modular-root .aoFindList [data-explore-item]").first().click();
   const laval=page.locator("#ao-find-modular-root .aoSaintPlaceSheet");
   await laval.waitFor({state:"visible"});
   assert((await laval.innerText()).includes("Blessed · not canonized"),"Beatification has been confused with canonization");
   await page.screenshot({path:resolve(destination,config.name+"-05-blessed-laval.png"),fullPage:false});
   await page.locator("#ao-find-modular-root [data-find-close-detail]").first().click();
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
