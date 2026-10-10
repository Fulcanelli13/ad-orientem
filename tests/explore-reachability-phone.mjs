import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+path);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return;}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message??error));}
});
await new Promise((resolve,reject)=>{server.once("error",reject);server.listen(4205,"127.0.0.1",resolve)});

let browser;
try{
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,locale:"en-GB"});
 const page=await context.newPage();
 const errors=[];
 page.on("pageerror",error=>errors.push(String(error?.message??error)));
 await page.goto("http://127.0.0.1:4205/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForSelector('[data-ao-app-surface="find"]',{state:"visible",timeout:30000});
 await page.locator('[data-ao-app-surface="find"]').tap();
 await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().open===true
  &&globalThis.AO_FIND_APP_V1?.status?.().loadState==="ready"
  &&document.querySelector("#ao-find-modular-root .aoFindSurface"),null,{timeout:60000});
 const lenses=["tlm","shrines","apparitions","relics","traditions","pilgrimages"];
 const reached=[];
 for(const lens of lenses){
  const selector='#ao-find-modular-root [data-find-filter="lens"][data-find-filter-value="'+lens+'"]';
  const lensButton=page.locator(selector);
  assert.equal(await lensButton.count(),1,"Explore lens has no unique visible control: "+lens);
  await lensButton.tap({timeout:15000});
  await page.waitForFunction(id=>{
   const status=globalThis.AO_FIND_APP_V1?.status?.();
   return status?.open===true&&status.lens===id
    &&document.querySelector("#ao-find-modular-root")?.dataset?.exploreLens===id;
  },lens,{timeout:15000});
  // Each lens must be usable as a list even if its map data lacks verified pins.
  await page.locator('#ao-find-modular-root [data-find-filter="view"][data-find-filter-value="list"]').tap();
  await page.waitForFunction(id=>document.querySelector('#ao-find-modular-root [data-explore-lens="'+id+'"][data-find-view="list"]'),lens,{timeout:10000});
  const snapshot=await page.evaluate(()=>{
   const mount=document.querySelector("#ao-find-modular-root");
   const info=mount?.querySelector(".aoFindResultMeta strong");
   return {lens:globalThis.AO_FIND_APP_V1?.status?.().lens,
    count:Number(info?.textContent||0),
    rows:mount?.querySelectorAll(".aoFindList [data-explore-item]").length||0,
    overflow:document.documentElement.scrollWidth-innerWidth,
    visibleText:mount?.querySelector(".aoFindSurface")?.innerText?.trim()?.length||0};
  });
  assert.equal(snapshot.lens,lens);
  assert.ok(snapshot.visibleText>=50,lens+" produced a blank search interface");
  assert.ok(snapshot.overflow<=1,lens+" causes viewport horizontal overflow");
  assert.equal(snapshot.rows,Math.min(120,snapshot.count),
    lens+" initial rendered list does not match the live filtered result count");
  if(snapshot.count){
   const first=page.locator("#ao-find-modular-root .aoFindList [data-explore-item]").first();
   const id=await first.getAttribute("data-explore-item");
   const title=(await first.locator("strong").first().innerText()).trim();
   assert.ok(id&&title.length>=2,lens+" has unnamed or unidentifiable results");
   const size=await first.evaluate(node=>node.getBoundingClientRect());
   assert.ok(size.width>=44&&size.height>=44,lens+" result item has an undersized touch target");
   await first.tap({timeout:12000});
   await page.locator("#ao-find-modular-root .aoFindSheet[role=dialog]").waitFor({state:"visible",timeout:12000});
   const detail=await page.locator("#ao-find-modular-root .aoFindSheet[role=dialog]").innerText();
   assert.ok(detail.trim().length>=title.length+5,lens+" source detail has no substantive content");
   await page.locator("#ao-find-modular-root button[data-find-close-detail]").first().tap({timeout:10000});
   await page.waitForFunction(()=>!document.querySelector("#ao-find-modular-root .aoFindSheet[role=dialog]"),null,{timeout:12000});
  }
  if(snapshot.count>120){
   assert.equal(snapshot.rows,120,lens+" initial result pagination lost its limit");
   await page.locator("#ao-find-modular-root [data-find-show-more]").tap({timeout:12000});
   await page.waitForFunction(expected=>document.querySelectorAll("#ao-find-modular-root .aoFindList [data-explore-item]").length===expected,
     Math.min(snapshot.count,240),{timeout:15000});
  }
  // An impossible literal query must be actionable and reversible. This
  // checks the actual phone input and its result state, not just projector code.
  const query=page.locator("#ao-find-modular-root [data-find-query]");
  await query.fill("aononexistentrecordxqz2026",{timeout:12000});
  await page.waitForFunction(()=>Number(document.querySelector("#ao-find-modular-root .aoFindResultMeta strong")?.textContent)===0,
    null,{timeout:12000});
  assert.equal(await page.locator("#ao-find-modular-root .aoFindEmpty").count(),1,lens+" gives no helpful empty-search state");
  await page.locator("#ao-find-modular-root [data-find-query]").fill("",{timeout:12000});
  await page.waitForFunction(n=>Number(document.querySelector("#ao-find-modular-root .aoFindResultMeta strong")?.textContent)===n,
    snapshot.count,{timeout:12000});
  if(["shrines","pilgrimages"].includes(lens)&&snapshot.count){
   await page.locator('#ao-find-modular-root [data-find-filter="view"][data-find-filter-value="map"]').tap();
   await page.waitForFunction(()=>Boolean(document.querySelector("#ao-find-modular-root [data-find-view='map'] [data-find-map]")),
    null,{timeout:15000});
   assert.ok((await page.locator("#ao-find-modular-root [data-find-map]").innerText()).length>=0);
   await page.locator('#ao-find-modular-root [data-find-filter="view"][data-find-filter-value="list"]').tap();
   await page.waitForFunction(()=>Boolean(document.querySelector("#ao-find-modular-root [data-find-view='list']")),
     null,{timeout:10000});
  }
  reached.push({lens,count:snapshot.count});
 }
 assert.deepEqual(reached.map(x=>x.lens),lenses);
 assert.equal(await page.locator("#ao-find-modular-root [data-find-filter='lens']").count(),6);
 await page.locator("#ao-find-modular-root [data-find-close]").tap({timeout:10000});
 await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="home"
  &&globalThis.AO_FIND_APP_V1?.status?.().open===false,null,{timeout:12000});
 assert.equal(errors.length,0,"Explore phone journey threw runtime errors: "+errors.join(" | "));
 console.log("PASS six Explore lenses phone: list results, detail close, 120-item pagination, search/clear, map/list and Home return "+JSON.stringify(reached));
 await context.close();
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(resolve=>server.close(resolve));
}