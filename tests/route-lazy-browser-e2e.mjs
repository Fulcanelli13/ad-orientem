import assert from "node:assert/strict";
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const MIME = {".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".webp":"image/webp",".png":"image/png",".jpg":"image/jpeg"};
const hits = [];
const server = http.createServer(async (req,res) => {
  try {
    const path = decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    const file = resolve(root,"."+path);
    if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return;}
    const data = await readFile(file);
    hits.push({path,bytes:data.length});
    res.writeHead(200,{"content-type":MIME[extname(file)]??"application/octet-stream",
      "cache-control":path==="/index.html"?"no-cache":"public, max-age=86400"});
    res.end(data);
  } catch(error) {
    res.writeHead(error?.code==="ENOENT"?404:500);
    res.end(String(error?.message??error));
  }
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4193,"127.0.0.1",ok)});
let browser;
try {
  browser = await chromium.launch({headless:true});
  const context = await browser.newContext({
    viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,
    serviceWorkers:"block"
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror",e=>errors.push(String(e?.message??e)));
  const t0=Date.now();
  await page.goto("http://127.0.0.1:4193/index.html",{
    waitUntil:"domcontentloaded",timeout:90000
  });
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.()?.visibleOwner===true,null,{timeout:20000});
  await page.waitForSelector(".homeScreen",{state:"visible",timeout:20000});
  const coldMs=Date.now()-t0;
  const coldHits=hits.slice();
  assert.equal(coldHits.some(row=>row.path==="/src/find/browser-entry.js"),false,
    "Explore corpus was eagerly imported on Home");
  assert.equal(coldHits.some(row=>row.path==="/src/apostolate/browser-entry.js"),false,
    "Apostolate corpus was eagerly imported on Home");
  const statusBefore=await page.evaluate(()=>({
    find:typeof globalThis.AO_FIND_APP_V1,apostolate:typeof globalThis.AO_APOSTOLATE_APP_V1,
    mass:Boolean(globalThis.AO_R17_BROWSER_ENTRY),
    pray:Boolean(globalThis.AO_PRAY_APP_V1),
  }));
  assert.equal(statusBefore.find,"undefined");
  assert.equal(statusBefore.apostolate,"undefined");
  assert.equal(statusBefore.mass,true,"Native Mass bridge missing");
  assert.equal(statusBefore.pray,true,"PRAY boot bridge missing");

  const find=await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("find"));
  assert.equal(find.ok,true,"Lazy Explore failed to navigate: "+JSON.stringify(find));
  assert.ok(hits.some(row=>row.path==="/src/find/browser-entry.js"),"Explore dynamic import not requested");
  const findLoaded=await page.evaluate(()=>globalThis.AO_FIND_APP_V1?.status?.()?.installed===true);
  assert.equal(findLoaded,true,"Explore modular owner not installed");

  const back=await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("home"));
  assert.equal(back.ok,true,"Home route failed after lazy Explore");
  const apostolate=await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("apostolate"));
  assert.equal(apostolate.ok,true,"Lazy Apostolate failed to navigate: "+JSON.stringify(apostolate));
  assert.ok(hits.some(row=>row.path==="/src/apostolate/browser-entry.js"),"Apostolate dynamic import not requested");
  assert.equal(await page.evaluate(()=>globalThis.AO_APOSTOLATE_APP_V1?.status?.()?.installed===true),true,
    "Apostolate owner was not installed");
  assert.equal(await page.evaluate(()=>globalThis.AO_R17_BROWSER_ENTRY?.status?.()?.presentationOwner),
    "R17_NATIVE_PRODUCTION","Mass owner regressed after lazy routes");

  // A second Home visit must not refetch either module entry.
  const firstFindRequests=hits.filter(x=>x.path==="/src/find/browser-entry.js").length;
  const firstApostolateRequests=hits.filter(x=>x.path==="/src/apostolate/browser-entry.js").length;
  await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("home"));
  await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("find"));
  assert.equal(hits.filter(x=>x.path==="/src/find/browser-entry.js").length,firstFindRequests);
  assert.equal(hits.filter(x=>x.path==="/src/apostolate/browser-entry.js").length,firstApostolateRequests);
  assert.deepEqual(errors.filter(x=>/Loading module|import|Failed to fetch dynamically/i.test(x)),[]);

  // Instrument cold-start, not a brittle fixed-duration gate: runner speed is variable.
  const timing=await page.evaluate(()=>({
    navigation:performance.getEntriesByType("navigation").map(x=>({
      dclMs:Math.round(x.domContentLoadedEventEnd-x.startTime),
      loadMs:Math.round(x.loadEventEnd-x.startTime),
      transferred:x.transferSize,decoded:x.decodedBodySize
    })),
    resources:performance.getEntriesByType("resource").length
  }));
  console.log("PASS route-lazy browser acceptance: cold Home did not load Explore/Apostolate; first visits installed canonical owners; re-entry reused them.");
  console.log("BOOT_OBSERVATION="+JSON.stringify({
    coldHomeReadyMs:coldMs,
    coldRequests:coldHits.length,
    coldBytesServed:coldHits.reduce((n,x)=>n+x.bytes,0),
    coldFindRequests:0,coldApostolateRequests:0,
    resourceTiming:timing,
  }));
} finally {
  await browser?.close();
  await new Promise(ok=>server.close(ok));
}
