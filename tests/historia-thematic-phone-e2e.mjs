import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",
 ".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",
 ".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(request,response)=>{
 try{
  const pathname=decodeURIComponent(new URL(request.url,"http://127.0.0.1").pathname);
  const target=resolve(root,"."+pathname);
  if(target!==root&&!target.startsWith(root+sep)){
   response.writeHead(403);response.end();return;
  }
  const bytes=await readFile(target);
  response.writeHead(200,{"content-type":mime[extname(target)]||"application/octet-stream",
   "cache-control":"no-store"});
  response.end(bytes);
 }catch(error){
  response.writeHead(error?.code==="ENOENT"?404:500);
  response.end(String(error?.message??error));
 }
});
await new Promise((ok,fail)=>{
 server.once("error",fail);
 server.listen(0,"127.0.0.1",ok);
});
const base="http://127.0.0.1:"+server.address().port;
let browser;
const results=[];
try{
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,
  hasTouch:true,deviceScaleFactor:1,serviceWorkers:"block"});
 const page=await context.newPage();
 const errors=[];
 page.on("pageerror",e=>errors.push(String(e.message)));
 const output=resolve(root,"test-output/historia-thematic");
 await mkdir(output,{recursive:true});

 // First check standalone mode loads authentic source-owned Scripture.
 await page.goto(base+"/research/historia-thematic-collections-preview.html",
  {waitUntil:"domcontentloaded",timeout:90000});
 const standalone=page.locator("#episode-reading");
 await standalone.locator(".aoHistoriaCurrentReading").count(); // Noncanonical class must not drive acceptance.
 await page.locator("#episode-index > li > button").first().waitFor({timeout:25000});
 assert.equal(await page.locator("#episode-index > li > button").count(),7);
 await page.locator("#collections button").filter({hasText:"Miracles of Our Lord"}).click();
 assert.equal(await page.locator("#episode-index > li > button").count(),6);
 await page.screenshot({path:resolve(output,"before-storm-tap-390.png"),animations:"disabled"});
 const hitGeometry=await page.evaluate(()=>{
  const btn=[...document.querySelectorAll("#episode-index > li > button")]
   .find(x=>x.textContent.includes("Calming of the storm"));
  const list=document.querySelector("#episode-index");
  const parent=document.querySelector(".hist-index");
  const header=document.querySelector(".hist-header");
  const rect=el=>el?.getBoundingClientRect().toJSON();
  const b=btn.getBoundingClientRect();
  const hit=document.elementFromPoint(b.x+b.width/2,b.y+b.height/2);
  return {target:rect(btn),list:rect(list),index:rect(parent),header:rect(header),
   windowScroll:{x:scrollX,y:scrollY,innerWidth,innerHeight},
   listScroll:{left:list.scrollLeft,width:list.scrollWidth,clientWidth:list.clientWidth},
   hitTarget:{tag:hit?.tagName,text:hit?.textContent?.slice(0,90)},
   computed:{listDisplay:getComputedStyle(list).display,indexDisplay:getComputedStyle(parent).display,
    rootScrollBehavior:getComputedStyle(document.documentElement).scrollBehavior}};
 });
 console.log("HISTORIA_CLICK_GEOMETRY",JSON.stringify(hitGeometry));
 await page.locator("#episode-index > li > button").filter({hasText:"Calming of the storm"}).click();
 await page.locator("#episode-reading .verse").first().waitFor({timeout:30000});
 assert.equal(await page.locator("#episode-reading .verse").count(),7);
 await page.locator("#episode-reading select").selectOption("crampon-1923");
 await page.locator("#episode-reading .verse").first().waitFor({timeout:30000});
 await page.locator("#episode-reading .source-gap").waitFor({timeout:30000});
 assert.match(await page.locator("#episode-reading .source-gap").innerText(),/41/);
 results.push("standalone: collections + original witnesses + missing Mark 4:41");
 await page.screenshot({path:resolve(output,"standalone-miracles-390.png"),animations:"disabled"});

 // The production entry MUST NOT show the collections without explicit opt-in.
 const standard=await context.newPage();
 await standard.goto(base+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await standard.waitForFunction(()=>Boolean(globalThis.AO_SCRIPTURE_APP_V1),null,{timeout:45000});
 const unflagged=await standard.evaluate(()=>globalThis.AO_SCRIPTURE_APP_V1.openThematicEpisode("hist-omitted-159"));
 assert.equal(unflagged,false,"Research episodes must not be enabled in production mode");
 assert.equal(await standard.locator("#ao-scripture-overlay [data-historia-episode]").count(),0);
 results.push("unflagged app: research navigation unavailable");
 await standard.close();

 // Real Home -> canonical Scripture -> covenantal manuscript -> return journey.
 const original=await context.newPage();
 original.on("pageerror",e=>errors.push(String(e.message)));
 await original.goto(base+"/index.html?ao_historia_collections=1#hist-omitted-159",
  {waitUntil:"domcontentloaded",timeout:90000});
 await original.waitForFunction(()=>
  globalThis.AO_SCRIPTURE_APP_V1?.status?.().reader?.thematicEpisodeId==="hist-omitted-159",
  null,{timeout:65000});
 assert.equal(await original.locator("#ao-scripture-overlay").isVisible(),true);
 assert.equal(await original.locator('[data-historia-active-episode="hist-omitted-159"]').count(),1);
 const scripture=original.locator("#ao-scripture-overlay");
 await scripture.locator(".aoScriptureVerse").first().waitFor({timeout:45000});
 assert.match(await scripture.locator(".aoScriptureReading h3").innerText(),/Luke 15:11/);
 const outbound=scripture.locator('[data-historia-context-link="hist-omitted-159"]');
 assert.equal(await outbound.count(),1);
 const url=await outbound.getAttribute("href");
 assert.match(url,/hs_context=HS-M24/);
 assert.match(url,/episode=hist-omitted-159/);
 results.push("in-app research deep-link: Luke 15:11–32 exact source passage");

 const popupPromise=context.waitForEvent("page",{timeout:25000});
 await outbound.click();
 const manuscript=await popupPromise;
 manuscript.on("pageerror",e=>errors.push(String(e.message)));
 await manuscript.waitForLoadState("domcontentloaded",{timeout:30000});
 await manuscript.locator("#historia-source-bridge").waitFor({timeout:25000});
 assert.match(await manuscript.locator("#historia-source-bridge").innerText(),/not claimed to occur within/i);
 assert.equal(await manuscript.locator("#movement-24").count(),1);
 const back=manuscript.locator("#historia-source-bridge a");
 assert.match(await back.getAttribute("href"),/ao_historia_collections=1/);
 assert.match(await back.getAttribute("href"),/#hist-omitted-159/);
 await back.click();
 await manuscript.waitForFunction(()=>
  globalThis.AO_SCRIPTURE_APP_V1?.status?.().reader?.thematicEpisodeId==="hist-omitted-159",
  null,{timeout:65000});
 assert.equal(await manuscript.locator("#ao-scripture-overlay").isVisible(),true);
 results.push("real reciprocal journey: P3 movement 24 -> Prodigal Son restored");

 // Long multi-chapter reading and edition lock.
 assert.equal(await manuscript.evaluate(()=>
  globalThis.AO_SCRIPTURE_APP_V1.openThematicEpisode("hist-omitted-092")),true);
 await manuscript.waitForFunction(()=>globalThis.AO_SCRIPTURE_APP_V1.status().reader?.passage?.chapter===4);
 const next=manuscript.locator("#ao-scripture-overlay [data-historia-next]");
 await next.click();
 await manuscript.waitForFunction(()=>globalThis.AO_SCRIPTURE_APP_V1.status().reader?.passage?.chapter===5);
 assert.equal(await manuscript.evaluate(()=>
  globalThis.AO_SCRIPTURE_APP_V1.openThematicEpisode("hist-omitted-094")),true);
 await manuscript.waitForFunction(()=>globalThis.AO_SCRIPTURE_APP_V1.status().reader?.editionId==="dr-challoner");
 assert.equal(await manuscript.locator("#ao-scripture-overlay .aoScriptureNav select").first()
  .locator('option[value="fr"]').isDisabled(),true);
 results.push("chapter navigation: Tobit 4 -> 5; Esther uses Challoner only");
 await manuscript.screenshot({path:resolve(output,"inapp-historia-390.png"),animations:"disabled"});

 // Judith: no fabricated chronological navigation.
 assert.equal(await manuscript.evaluate(()=>
  globalThis.AO_SCRIPTURE_APP_V1.openThematicEpisode("hist-omitted-093")),true);
 assert.equal(await manuscript.locator('[data-historia-context-link="hist-omitted-093"]').count(),0);
 results.push("Judith: no unsupported chronology link");

 assert.deepEqual(errors.filter(s=>/ReferenceError|SyntaxError|TypeError/.test(s)),[],
  "Browser runtime failures: "+errors.join(" | "));
 await original.close();await manuscript.close();await page.close();
 await context.close();
 console.log("PASS Historia thematic actual Chromium: "+results.join("; "));
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(ok=>server.close(ok));
}
