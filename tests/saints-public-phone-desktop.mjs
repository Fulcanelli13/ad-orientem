import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import http from "node:http";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const requests=[];
const server=http.createServer(async(req,res)=>{
  try{
    const name=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    requests.push(name);
    const filepath=resolve(root,"."+name);
    if(filepath!==root&&!filepath.startsWith(root+sep)){res.writeHead(403);res.end();return;}
    const file=await readFile(filepath);
    res.writeHead(200,{"content-type":mime[extname(filepath)]||"application/octet-stream","cache-control":"no-store"});
    res.end(file);
  }catch(e){if(!res.headersSent)res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e.message||e));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4236,"127.0.0.1",ok);});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const size of [{name:"phone",width:390,height:844,touch:true},{name:"desktop",width:1280,height:800,touch:false}]){
  const ctx=await browser.newContext({viewport:{width:size.width,height:size.height},isMobile:size.touch,hasTouch:size.touch,reducedMotion:"reduce"});
  const page=await ctx.newPage(),errors=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto("http://127.0.0.1:4236/index.html",{waitUntil:"domcontentloaded",timeout:90000});
  await page.locator('[data-ao-app-surface="find"]').waitFor({state:"visible",timeout:45000});
  await page.locator('[data-ao-app-surface="find"]').click();
  await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().lens==="heritage"&&
    globalThis.AO_FIND_APP_V1?.status?.().loadState==="ready",null,{timeout:70000});
  const tab=page.locator('#ao-find-modular-root .aoHeritageCategories [data-find-filter="lens"][data-find-filter-value="saints"]');
  assert.equal(await tab.count(),1,"Saints doorway not visible on canonical homepage");
  await tab.click();
  await page.waitForFunction(()=>document.querySelector('#ao-find-modular-root .aoFindResultMeta strong')?.textContent==="6"&&
    !!document.querySelector('#ao-find-modular-root [data-find-view="list"][data-explore-lens="saints"]'),null,{timeout:25000});
  assert.equal(await page.locator('#ao-find-modular-root .aoFindList [data-explore-item]').count(),6);
  assert.equal(await page.locator('#ao-find-modular-root [data-find-filter="saintScope"]').count(),0);
  assert.equal(await page.locator('#ao-find-modular-root [data-find-filter="saintCategory"]').count(),0);
  assert((await page.locator('#ao-find-modular-root .aoSaintScopeNote').innerText()).includes("Six source-linked Saints pilot profiles"));
  const search=page.locator('#ao-find-modular-root [data-find-query]');
  await search.fill("Lisieux");
  await page.waitForFunction(()=>document.querySelector('#ao-find-modular-root .aoFindResultMeta strong')?.textContent==="1");
  await page.locator('#ao-find-modular-root .aoFindList [data-explore-item]').first().click();
  const biography=page.locator('#ao-find-modular-root .aoSaintPlaceSheet');
  await biography.waitFor({state:"visible",timeout:12000});
  assert.equal(await biography.locator('[data-saint-id="saint:therese-of-lisieux"]').count(),1);
  assert.equal(await biography.locator('img').count(),0,"Unapproved portrait visible");
  assert.equal(await biography.locator('[data-explore-calendar-date="2026-10-03"]').count(),1);
  assert.equal(await biography.locator('[data-saint-crosslink-target]').count(),0);
  await biography.locator('button[data-find-close-detail]').click();
  await search.fill("Laval");
  await page.waitForFunction(()=>document.querySelector('#ao-find-modular-root .aoFindResultMeta strong')?.textContent==="1");
  await page.locator('#ao-find-modular-root .aoFindList [data-explore-item]').first().click();
  const blessed=page.locator('#ao-find-modular-root .aoSaintPlaceSheet');
  await blessed.waitFor({state:"visible"});
  assert((await blessed.innerText()).includes("Blessed · not canonized"));
  await blessed.locator('button[data-find-close-detail]').click();
  await search.fill("");
  await page.waitForFunction(()=>document.querySelector('#ao-find-modular-root .aoFindResultMeta strong')?.textContent==="6");
  await page.locator('#ao-find-modular-root [data-find-filter="view"][data-find-filter-value="map"]').click();
  await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().counts?.saints===9&&
    !!document.querySelector('#ao-find-modular-root [data-find-view="map"][data-explore-lens="saints"]'),null,{timeout:25000});
  assert.equal(errors.length,0,"Runtime errors on "+size.name+": "+errors.join(" | "));
  await ctx.close();
 }
 const leaks=requests.filter(url=>/holiness-first-eight-doctors|holiness-first-sixteen-cross-vocation|read-only-calendar-art-index/.test(url));
 assert.deepEqual(leaks,[],"A public browser tried to fetch research-only Saints JSON");
 console.log("PASS public Saints native browser: phone+desktop six profiles, Blessed correctly scoped, 9 Places, no draft indexes, artwork or private data fetches");
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(ok=>server.close(ok));
}
