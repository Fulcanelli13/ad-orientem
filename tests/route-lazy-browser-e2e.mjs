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

  // Daily Rule remains actionable even if its legacy static-sheet handler
  // explicitly rejects opening. The fallback must dispatch Rosary.
  const homeRule=await page.evaluate(()=>{
    const oldRule=globalThis.AO_RULE_V411,oldRegistry=globalThis.AO_MODULES;
    const calls=[];
    try{
      globalThis.AO_RULE_V411={...oldRule,openStatic:()=>false};
      globalThis.AO_MODULES={...oldRegistry,open:id=>{calls.push(id);return{ok:true}}};
      const button=document.createElement("button");
      button.type="button";button.dataset.homeCuStatic="rosary";
      document.querySelector(".homeScreen").append(button);
      button.click();button.remove();
      return calls;
    }finally{
      globalThis.AO_RULE_V411=oldRule;
      globalThis.AO_MODULES=oldRegistry;
    }
  });
  assert.deepEqual(homeRule,["pray.rosary"],"Home Daily Rule became inert when the legacy owner failed");

  const find=await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("find"));
  assert.equal(find.ok,true,"Lazy Explore failed to navigate: "+JSON.stringify(find));
  assert.ok(hits.some(row=>row.path==="/src/find/browser-entry.js"),"Explore dynamic import not requested");
  const findLoaded=await page.evaluate(()=>globalThis.AO_FIND_APP_V1?.status?.()?.installed===true);
  assert.equal(findLoaded,true,"Explore modular owner not installed");
  // First-use contextual Glossary must work before visiting Formation.
  await page.locator("#ao-find-modular-root [data-find-glossary]").click();
  await page.waitForFunction(()=>globalThis.AO_GLOSSARY_V1?.status?.()?.open===true,null,{timeout:30000});
  await page.waitForFunction(()=>globalThis.AO_GLOSSARY_V1?.status?.()?.loaded===true
    &&globalThis.AO_GLOSSARY_V1?.status?.()?.view==="context",null,{timeout:30000});
  assert.ok(await page.evaluate(()=>globalThis.AO_GLOSSARY_V1?.status?.()?.entries>0),
    "Explore Glossary must load sourced entries before the contextual definitions appear");
  await page.evaluate(()=>globalThis.AO_GLOSSARY_V1.close());

  // Exercise visible Explore controls rather than only its lazy owner.
  // Search rerenders the complete result surface: keyboard focus and caret
  // must survive successive input events so users can enter a full query.
  await page.evaluate(()=>globalThis.AO_FIND_APP_V1.open({lens:"shrines",view:"list",query:""}));
  const search=page.locator("#ao-find-modular-root [data-find-query]");
  await search.click();
  await page.keyboard.type("Lourdes",{delay:30});
  await page.waitForFunction(()=>document.querySelector("#ao-find-modular-root [data-find-query]")?.value==="Lourdes");
  assert.equal(await page.evaluate(()=>document.activeElement?.matches?.("#ao-find-modular-root [data-find-query]")),true,
    "Explore search loses focus after repaint: users cannot type beyond the first character");
  const lourdesCard=page.locator("#ao-find-modular-root [data-explore-item]").first();
  await lourdesCard.waitFor({state:"visible",timeout:12000});
  await lourdesCard.click();
  const detail=page.locator("#ao-find-modular-root [data-find-close-detail].aoFindSheetBackdrop");
  await detail.waitFor({state:"visible"});
  const placeAction=page.locator("#ao-find-modular-root [data-explore-open-place]").first();
  await placeAction.waitFor({state:"visible"});
  await placeAction.click();
  const place=page.locator("#ao-find-modular-root [data-explore-place-owner]");
  await place.waitFor({state:"visible",timeout:12000});
  assert.equal(await detail.count(),0,
    "Explore Place-page click was swallowed by the detail backdrop dismissal handler");
  // A Place-page novena launches on the first Prayer visit; the heavy
  // PRAY donor is intentionally not loaded by the cold Home or Explore.
  const novenaAction=page.locator("#ao-find-modular-root [data-explore-open-novena]").first();
  await novenaAction.waitFor({state:"visible",timeout:12000});
  const selectedNovena=await novenaAction.getAttribute("data-explore-open-novena");
  await novenaAction.click();
  await page.waitForFunction(()=>globalThis.AO_PRAY_APP_V1?.status?.().readerLoaded===true,null,{timeout:20000});
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="pray",null,{timeout:15000});
  assert.equal(await page.evaluate(()=>document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset?.aoPrayView==="novenas"),true,
    "Explore clicked Novena without opening the Novenas reader");
  assert.equal(await page.locator("#aoPray435930 [data-n1-begin]").count(),1,
    "Explore launched the Novenas overview instead of its selected novena");
  assert.ok(selectedNovena,"Place novena action has no linked ID");
  // The reverse Novena → Explore link must navigate through the app shell,
  // rather than opening the old Explore owner behind the Prayer sheet.
  const crossLink=page.locator("#aoPray435930 [data-n1-explore]").first();
  const customDetails=page.locator("#aoPray435930 details").filter({has:crossLink});
  await customDetails.locator("summary").click();
  await crossLink.click();
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="find",null,{timeout:15000});
  await page.locator("#ao-find-modular-root [data-find-query]").waitFor({state:"visible",timeout:15000});
  await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("find"));
  await page.evaluate(()=>globalThis.AO_FIND_APP_V1.open({
    lens:"shrines",view:"list",query:"Lourdes",
    placeId:"place:FR:sanctuaire-notre-dame-de-lourdes"
  }));
  await page.locator("#ao-find-modular-root [data-explore-place-owner]").waitFor({state:"visible",timeout:12000});
  const dateButton=page.locator("#ao-find-modular-root [data-explore-calendar-date]").first();
  await dateButton.waitFor({state:"visible",timeout:12000});
  const linkedDate=await dateButton.getAttribute("data-explore-calendar-date");
  assert.match(linkedDate,/^\d{4}-\d{2}-\d{2}$/);
  await dateButton.click();
  await page.locator("#ao-calendar-modular-root").waitFor({state:"visible",timeout:20000});
  await page.waitForFunction(date=>
    globalThis.AO_CALENDAR_APP_V1?.status?.().selectedDate===date,
    linkedDate,{timeout:20000});
  assert.equal(await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.getActive()),"calendar",
    "Explore Calendar deep link failed to activate the Calendar surface");

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
