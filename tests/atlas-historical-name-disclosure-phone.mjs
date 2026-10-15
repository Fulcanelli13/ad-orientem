import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {readFileSync} from "node:fs";
import {chromium} from "@playwright/test";
import {buildBibleAtlas} from "../src/find/bible-atlas.js";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const corpus=JSON.parse(readFileSync(new URL("../data/explore/bible-places-compact.v1.json",import.meta.url),"utf8"));
const stops=buildBibleAtlas(corpus.entries),site=stops.find(s=>s.geo?.key==="samaria"&&s.era==="ISRAEL");
assert.ok(site,"Samaria/Israel episode must exist in canonical chronology");
const port=4312;
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
 ".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const p=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname),file=resolve(root,"."+p);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e));}
});
await new Promise((yes,no)=>{server.once("error",no);server.listen(port,"127.0.0.1",yes)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,locale:"en-GB"});
 const page=await context.newPage(),errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 await page.goto("http://127.0.0.1:"+port+"/index.html?atlasCinema=1&atlasHistory=1",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForSelector('[data-ao-app-surface="find"]',{state:"visible",timeout:30000});
 await page.locator('[data-ao-app-surface="find"]').tap();
 await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().loadState==="ready",null,{timeout:60000});
 await page.locator("#ao-find-modular-root details.aoHeritageMore > summary").tap({timeout:15000});
 await page.locator("#ao-find-modular-root .aoHeritageMore[open] [data-bible-atlas-open]").waitFor({state:"visible",timeout:15000});
 await page.waitForTimeout(360);
 await page.locator("#ao-find-modular-root [data-bible-atlas-open]").tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().bibleAtlas===true,null,{timeout:20000});
 assert.equal(await page.locator("#ao-find-modular-root [data-bible-step]").count(),151);
 assert.equal(await page.locator("#ao-find-modular-root [data-bible-map]").count(),1);
 assert.equal(await page.locator("#ao-find-modular-root [data-bible-history-note]").count(),0,
  "Initial selection without historical note must remain uncluttered");
 await page.locator('#ao-find-modular-root [data-bible-step="'+site.index+'"]').tap({timeout:15000});
 await page.waitForFunction(index=>globalThis.AO_FIND_APP_V1?.status?.().bibleIndex===index,site.index,{timeout:15000});
 await page.locator("#ao-find-modular-root [data-bible-sheet-toggle]").tap({timeout:15000});
 const detail=page.locator("#ao-find-modular-root [data-bible-detail]");
 const disclosure=detail.locator('[data-bible-history-note="samaria"]');
 assert.equal(await disclosure.count(),1);
 assert.equal(await disclosure.getAttribute("open"),null,"Historical note should default collapsed");
 await disclosure.locator("summary").tap({timeout:15000});
 assert.equal(await disclosure.getAttribute("open"),"","User can expand note without navigating");
 assert.match(await disclosure.locator("p").innerText(),/Herod.*Sebaste/);
 assert.equal(await disclosure.locator('a[href^="https://"]').count()>=2,true,"Direct original and historical citations");
 assert.equal(await disclosure.locator('a').first().getAttribute("target"),"_blank");
 assert.equal(await disclosure.locator('a').first().getAttribute("rel"),"noopener noreferrer");
 const folder=resolve(root,"test-output/atlas-history-review");
 await mkdir(folder,{recursive:true});
 for(const width of [320,390,768]){
  await page.setViewportSize({width,height:width===768?1024:844});
  await page.waitForTimeout(70);
  const metrics=await page.evaluate(()=>{
   const detail=document.querySelector("#ao-find-modular-root [data-bible-detail]");
   const note=document.querySelector("#ao-find-modular-root [data-bible-history-note]");
   return {viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,
     noteWidth:note?.getBoundingClientRect().width||0,
     detailWidth:detail?.getBoundingClientRect().width||0,
     sheetExpanded:document.querySelector("[data-bible-sheet=expanded]")!==null};
  });
  assert.ok(metrics.documentWidth<=metrics.viewport+1,"Viewport horizontal overflow "+JSON.stringify(metrics));
  assert.ok(metrics.noteWidth<=metrics.detailWidth+1,"Historical note horizontal overflow "+JSON.stringify(metrics));
  assert.equal(metrics.sheetExpanded,true);
  assert.ok(metrics.noteWidth>180);
  await page.screenshot({path:resolve(folder,"history-samaria-"+width+".png"),animations:"disabled"});
 }
 // Switching to a stop without a proposed historical name removes the disclosure in place.
 const other=stops.find(s=>s.geo?.key==="nazareth"&&s.era==="INFANCY");
 assert.ok(other);
 await page.locator('#ao-find-modular-root [data-bible-step="'+other.index+'"]').tap({timeout:15000});
 await page.waitForFunction(index=>globalThis.AO_FIND_APP_V1?.status?.().bibleIndex===index,other.index,{timeout:15000});
 assert.equal(await detail.locator("[data-bible-history-note]").count(),0);
 assert.equal(await detail.locator("[data-ao-scripture-context]").count(),1);
 await detail.locator("[data-ao-scripture-context]").tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_SCRIPTURE_APP_V1?.status?.().open===true,null,{timeout:15000});
 await page.locator("#ao-scripture-overlay [data-scripture-close]").first().tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_SCRIPTURE_APP_V1?.status?.().open===false,null,{timeout:15000});
 assert.equal(errors.length,0,"Runtime errors: "+errors.join(" | "));
 console.log("PASS real Chromium 320/390/768, source links, disclosure toggle, stop handoff and native Scripture reader");
 await context.close();
}finally{await browser?.close().catch(()=>{});await new Promise(ok=>server.close(ok))}
