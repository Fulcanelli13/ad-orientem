import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {buildBibleAtlas} from "../src/find/bible-atlas.js";
import {atlasReadingChapters} from "../src/find/bible-atlas-reading-chapters.js";
import {readFileSync} from "node:fs";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const places=JSON.parse(readFileSync(new URL("../data/explore/bible-places-compact.v1.json",import.meta.url),"utf8"));
const stops=buildBibleAtlas(places.entries),chapters=atlasReadingChapters(stops);
assert.equal(chapters.length,37);
const target=chapters.find(x=>x.era==="ISRAEL");
assert.ok(target);
const port=4319;
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
 ".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const p=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname),file=resolve(root,"."+p);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message||error));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(port,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,locale:"en-GB"});
 const page=await context.newPage(),errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 await page.goto("http://127.0.0.1:"+port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 async function enter(){
  await page.locator('[data-ao-app-surface="find"]').tap({timeout:30000});
  await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().loadState==="ready",null,{timeout:60000});
  await page.locator("#ao-find-modular-root details.aoHeritageMore > summary").tap({timeout:15000});
  await page.locator("#ao-find-modular-root .aoHeritageMore[open] [data-bible-atlas-open]").waitFor({state:"visible",timeout:15000});
  await page.waitForTimeout(300);
  await page.locator("#ao-find-modular-root [data-bible-atlas-open]").tap({timeout:15000});
  await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().bibleAtlas===true,null,{timeout:20000});
 }
 await enter();
 assert.equal(await page.locator("#ao-find-modular-root [data-bible-step]").count(),151);
 assert.equal(await page.locator("#ao-find-modular-root [data-bible-map]").count(),1);
 assert.equal(await page.locator("#ao-find-modular-root [data-bible-reading-toggle]").count(),1);
 assert.equal(await page.locator("#ao-find-modular-root [data-bible-reading-panel]").count(),1);
 assert.equal(await page.locator("#ao-find-modular-root [data-bible-reading-panel]").isVisible(),false);
 const folder=resolve(root,"test-output/atlas-reading-chapters");
 await mkdir(folder,{recursive:true});
 const toggle=page.locator("#ao-find-modular-root [data-bible-reading-toggle]"),
       panel=page.locator("#ao-find-modular-root [data-bible-reading-panel]");
 await toggle.tap({timeout:15000});
 assert.equal(await toggle.getAttribute("aria-expanded"),"true");
 assert.equal(await panel.isVisible(),true);
 assert.equal(await panel.locator("[data-bible-reading-start]").count(),37);
 assert.match(await panel.innerText(),/not an abridged or complete Bible/);
 for(const width of [320,390,768]){
  await page.setViewportSize({width,height:width===768?1024:844});
  await page.waitForTimeout(90);
  const geometry=await page.evaluate(()=>{
   const panel=document.querySelector("#ao-find-modular-root [data-bible-reading-panel]");
   return {viewport:innerWidth,docWidth:document.documentElement.scrollWidth,
    panelWidth:panel?.getBoundingClientRect().width,panelHeight:panel?.getBoundingClientRect().height};
  });
  assert.ok(geometry.docWidth<=geometry.viewport+1,"horizontal document overflow "+JSON.stringify(geometry));
  assert.ok(geometry.panelHeight>100&&geometry.panelHeight<320,"reading chooser must not displace whole map "+JSON.stringify(geometry));
  await page.screenshot({path:resolve(folder,"reading-chapters-"+width+".png"),animations:"disabled"});
 }
 await page.setViewportSize({width:390,height:844});
 await panel.locator('[data-bible-reading-start="'+target.start+'"]').tap({timeout:15000});
 await page.waitForFunction(index=>globalThis.AO_FIND_APP_V1?.status?.().bibleIndex===index,target.start,{timeout:15000});
 assert.equal(await panel.isVisible(),false);
 assert.equal(await toggle.getAttribute("aria-expanded"),"false");
 await toggle.tap();
 assert.equal(await panel.locator('[data-bible-reading-start="'+target.start+'"]').getAttribute("aria-pressed"),"true");
 await toggle.tap();
 await page.locator("#ao-find-modular-root [data-bible-context-open]").tap({timeout:15000});
 const reader=page.locator("#ao-find-modular-root [data-bible-detail] [data-ao-scripture-context]");
 assert.equal(await reader.count(),1);
 await reader.tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_SCRIPTURE_APP_V1?.status?.().open===true,null,{timeout:15000});
 await page.locator("#ao-scripture-overlay [data-scripture-close]").first().tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_SCRIPTURE_APP_V1?.status?.().open===false,null,{timeout:15000});
 await page.locator("#ao-find-modular-root [data-bible-atlas-close]").tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().bibleAtlas===false,null,{timeout:15000});
 await page.locator("#ao-find-modular-root details.aoHeritageMore > summary").tap({timeout:15000});
 await page.waitForTimeout(300);
 await page.locator("#ao-find-modular-root [data-bible-atlas-open]").tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().bibleAtlas===true,null,{timeout:15000});
 assert.equal((await page.evaluate(()=>globalThis.AO_FIND_APP_V1?.status?.().bibleIndex)),target.start,
  "Reopening Atlas must restore source-owned exact canonical scene");
 assert.deepEqual(errors,[],"Runtime errors: "+errors.join(" | "));
 console.log("PASS normal unflagged 37-chapter chooser, 320/390/768, no overflow, native Scripture, saved exact scene");
 await context.close();
}finally{await browser?.close().catch(()=>{});await new Promise(ok=>server.close(ok))}
