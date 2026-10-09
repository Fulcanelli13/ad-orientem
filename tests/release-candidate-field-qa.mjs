import assert from "node:assert/strict";
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={
  ".html":"text/html; charset=utf-8",
  ".js":"text/javascript; charset=utf-8",
  ".mjs":"text/javascript; charset=utf-8",
  ".json":"application/json; charset=utf-8",
  ".css":"text/css; charset=utf-8",
  ".svg":"image/svg+xml",
  ".png":"image/png",
  ".jpg":"image/jpeg",
  ".jpeg":"image/jpeg",
  ".webp":"image/webp",
  ".woff":"font/woff",
  ".woff2":"font/woff2",
};

const server=http.createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    const file=resolve(root,"."+pathname);
    if(file!==root&&!file.startsWith(root+sep)){
      res.writeHead(403);
      res.end("forbidden");
      return;
    }
    const data=await readFile(file);
    res.writeHead(200,{
      "content-type":mime[extname(file)]??"application/octet-stream",
      "cache-control":"no-store",
    });
    res.end(data);
  }catch(error){
    res.writeHead(error?.code==="ENOENT"?404:500);
    res.end(String(error?.message??error));
  }
});
await new Promise((ok,fail)=>{
  server.once("error",fail);
  server.listen(4192,"127.0.0.1",ok);
});

const viewports=[
  {width:320,height:700},
  {width:360,height:780},
  {width:390,height:844},
  {width:430,height:900},
];

function meaningfulConsoleError(text){
  const value=String(text??"");
  return value &&
    !/favicon\.ico/i.test(value) &&
    !/ResizeObserver loop limit exceeded/i.test(value);
}

async function visible(page,selector){
  return page.evaluate(sel=>{
    const node=document.querySelector(sel);
    if(!node)return false;
    const style=getComputedStyle(node);
    const rect=node.getBoundingClientRect();
    return style.display!=="none" &&
      style.visibility!=="hidden" &&
      style.opacity!=="0" &&
      rect.width>0 &&
      rect.height>0;
  },selector);
}

async function assertViewportFit(page,label,width){
  const fit=await page.evaluate(()=>({
    innerWidth:window.innerWidth,
    htmlWidth:document.documentElement.scrollWidth,
    bodyWidth:document.body?.scrollWidth??0,
  }));
  assert.ok(
    fit.htmlWidth<=fit.innerWidth+1,
    width+"px "+label+" causes document horizontal overflow: "+fit.htmlWidth+" > "+fit.innerWidth
  );
  assert.ok(
    fit.bodyWidth<=fit.innerWidth+1,
    width+"px "+label+" causes body horizontal overflow: "+fit.bodyWidth+" > "+fit.innerWidth
  );
}

async function assertSingleRoots(page,width){
  const counts=await page.evaluate(()=>({
    home:document.querySelectorAll(".homeScreen").length,
    calendar:document.querySelectorAll("#ao-calendar-modular-root").length,
    pray:document.querySelectorAll("#aoPray435930").length,
    learn:document.querySelectorAll("#ao-learn-modular-root").length,
    settings:document.querySelectorAll("#ao-settings-modular-root").length,
    shell:[...document.querySelectorAll("[data-ao-app-shell]")].length,
  }));
  for(const [name,count] of Object.entries(counts)){
    if(name==="shell"){
      assert.ok(count<=1,width+"px route cycling duplicated app shell roots: "+count);
      continue;
    }
    assert.ok(count<=1,width+"px route cycling duplicated "+name+" root: "+count);
  }
}

async function assertNoLegacyLeak(page,label,width){
  const leak=await page.evaluate(()=>({
    prayerBook:(()=>{
      const node=document.getElementById("aoPrayerBookRoot");
      if(!node)return false;
      const style=getComputedStyle(node);
      const rect=node.getBoundingClientRect();
      return (node.classList.contains("open")||node.getAttribute("aria-hidden")==="false") &&
        style.display!=="none" && style.visibility!=="hidden" && rect.width>0 && rect.height>0;
    })(),
    v37:(()=>{
      const node=document.getElementById("ao-v37-root");
      if(!node)return false;
      const style=getComputedStyle(node);
      const rect=node.getBoundingClientRect();
      return node.classList.contains("aoV37ShellOpen") &&
        style.display!=="none" && style.visibility!=="hidden" && rect.width>0 && rect.height>0;
    })(),
    legacyRibbon:[...document.querySelectorAll("[data-v37-domain],.aoV37DomainDock")].some(node=>{
      const style=getComputedStyle(node);
      const rect=node.getBoundingClientRect();
      return style.display!=="none" && style.visibility!=="hidden" && rect.width>0 && rect.height>0;
    }),
    historicalSettings:globalThis.AO_SETTINGS_APP_V1?.status?.().historicalSettingsVisible??false,
    embeddedHomeSettings:globalThis.AO_SETTINGS_APP_V1?.status?.().embeddedHomeSettingsVisible??false,
  }));
  assert.equal(leak.prayerBook,false,width+"px "+label+" exposed legacy Prayer Book");
  assert.equal(leak.v37,false,width+"px "+label+" exposed legacy V37 shell");
  assert.equal(leak.legacyRibbon,false,width+"px "+label+" exposed historical V37 navigation");
  assert.equal(leak.historicalSettings,false,width+"px "+label+" exposed historical Settings");
  assert.equal(leak.embeddedHomeSettings,false,width+"px "+label+" exposed embedded Home Settings");
}

async function openSurface(page,surface,width){
  if(surface==="settings"){
    // Settings is contextual, never an extra permanent destination.
    await page.evaluate(()=>globalThis.AO_APP_SHELL_V1?.navigate?.("settings"));
  }else if(surface==="calendar"){
    // Calendar is reached through Today, from every preceding surface.
    await page.locator("[data-ao-app-surface='home']").first().click();
    await page.waitForSelector(".homeScreen",{state:"visible",timeout:10000});
    const calendar=page.locator(".homeScreen [data-home-calendar]");
    assert.equal(await calendar.count(),1,width+"px Today is missing its full Calendar action");
    await calendar.click();
  }else{
    const nav=page.locator("[data-ao-app-surface='"+surface+"']").first();
    assert.equal(await nav.count(),1,width+"px missing "+surface+" top-level navigation control");
    await nav.click();
  }

  if(surface==="home"){
    await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="home",null,{timeout:10000});
    await page.waitForSelector(".homeScreen",{state:"visible",timeout:10000});
  }else if(surface==="calendar"){
    await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="calendar",null,{timeout:10000});
    await page.waitForSelector("#ao-calendar-modular-root",{state:"visible",timeout:10000});
  }else if(surface==="pray"){
    await page.waitForFunction(()=>globalThis.AO_PRAY_APP_V1?.status?.().open===true,null,{timeout:10000});
    await page.waitForSelector("#aoPray435930.open",{state:"visible",timeout:10000});
  }else if(surface==="learn"){
    await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="learn",null,{timeout:10000});
    await page.waitForSelector("#ao-learn-modular-root",{state:"visible",timeout:10000});
  }else if(surface==="settings"){
    await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="settings",null,{timeout:10000});
    await page.waitForSelector("#ao-settings-modular-root",{state:"visible",timeout:10000});
  }
  await page.waitForTimeout(80);
  await assertViewportFit(page,surface,width);
  await assertNoLegacyLeak(page,surface,width);
  await assertSingleRoots(page,width);
}

let browser;
try{
  browser=await chromium.launch({headless:true});

  for(const viewport of viewports){
    const context=await browser.newContext({
      viewport,
      deviceScaleFactor:2,
      isMobile:true,
      hasTouch:true,
      locale:"en-GB",
    });
    const page=await context.newPage();
    const pageErrors=[];
    const consoleErrors=[];
    const failedResources=[];

    page.on("pageerror",error=>pageErrors.push(String(error?.message??error)));
    page.on("console",msg=>{
      if(msg.type()==="error" && meaningfulConsoleError(msg.text()))consoleErrors.push(msg.text());
    });
    page.on("response",response=>{
      const status=response.status();
      if(status<400)return;
      const request=response.request();
      const type=request.resourceType();
      if(!["script","stylesheet","image","font","document","fetch","xhr"].includes(type))return;
      const url=response.url();
      if(/favicon\.ico(?:\?|$)/i.test(url))return;
      failedResources.push({status,type,url});
    });

    await page.goto("http://127.0.0.1:4192/index.html?aoR17Reader=native",{
      waitUntil:"domcontentloaded",
      timeout:90000,
    });
    await page.waitForFunction(
      ()=>globalThis.AO_APP_SHELL_V1?.status?.().visibleOwner===true,
      null,
      {timeout:30000},
    );
    await page.waitForSelector(".homeScreen",{state:"visible",timeout:30000});
    await page.waitForFunction(()=>!document.getElementById("ao-cinema-boot"),null,{timeout:10000});

    const release=await page.evaluate(()=>({
      status:document.documentElement.dataset.aoReleaseAuthority??null,
      active:globalThis.AO_APP_SHELL_V1?.getActive?.()??null,
      destinations:[...document.querySelectorAll("[data-ao-app-surface]")]
        .map(x=>x.getAttribute("data-ao-app-surface"))
        .filter(Boolean),
    }));
    assert.equal(release.status,"AO_APP_SHELL_V1",viewport.width+"px app shell lost release authority");
    assert.equal(release.active,"home",viewport.width+"px cold launch did not land on Home");
    assert.deepEqual(
      [...new Set(release.destinations)],
      ["home","mass","pray","learn","find"],
      viewport.width+"px five-destination ribbon contract changed",
    );

    await assertViewportFit(page,"Home cold launch",viewport.width);
    await assertNoLegacyLeak(page,"Home cold launch",viewport.width);

    // Stress the actual shell, not isolated module harnesses. Reopening the same
    // destinations catches duplicate roots, stale donor surfaces and route-state
    // accumulation that a single happy-path journey does not.
    for(let cycle=1;cycle<=3;cycle++){
      for(const surface of ["calendar","pray","learn","settings","home"]){
        await openSurface(page,surface,viewport.width);
      }
    }

    // Mass entry is included without starting a liturgy: RC geometry must prove
    // that the production selection/preflight surface itself still fits every
    // supported phone width.
    const massNav=page.locator("[data-ao-app-surface='mass']").first();
    await massNav.click();
    await page.waitForSelector("#ao-mass-flow-v1 .aoMassFlowBackdrop",{state:"visible",timeout:10000});
    await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="mass",null,{timeout:10000});
    assert.equal(await visible(page,"#ao-mass-flow-v1 .aoMassFlowBackdrop"),true);
    await assertViewportFit(page,"Mass preflight",viewport.width);
    await assertNoLegacyLeak(page,"Mass preflight",viewport.width);

    const preflight=await page.evaluate(()=>({
      count:document.querySelectorAll("#ao-mass-flow-v1").length,
      nativeMounted:Boolean(document.getElementById("ao-r17-native-reader-preview")?.isConnected),
      legacyReader:document.documentElement.dataset.aoMassReaderUi==="LEGACY",
    }));
    assert.equal(preflight.count,1,viewport.width+"px Mass routing duplicated the preflight root");
    assert.equal(preflight.nativeMounted,false,viewport.width+"px fresh Mass entry bypassed preflight");
    assert.equal(preflight.legacyReader,false,viewport.width+"px fresh Mass entry exposed legacy reader ownership");

    await page.locator("#ao-mass-flow-v1 [data-ao-close]").last().click();
    await page.waitForFunction(()=>!document.getElementById("ao-mass-flow-v1"),null,{timeout:5000});
    await openSurface(page,"home",viewport.width);

    if(consoleErrors.length||failedResources.length)console.log("RC field QA resource diagnostics",JSON.stringify({viewport:viewport.width,consoleErrors,failedResources},null,2));
    assert.deepEqual(pageErrors,[],viewport.width+"px assembled app emitted page errors");
    assert.deepEqual(consoleErrors,[],viewport.width+"px assembled app emitted console errors");
    assert.deepEqual(failedResources,[],viewport.width+"px assembled app requested missing production resources");

    await context.close();
  }

  console.log("RC field QA PASS — 320/360/390/430px assembled shell, repeated six-surface routing, Mass preflight geometry, no legacy leakage, no duplicate roots, no uncaught errors, no failed production resources.");
}finally{
  await browser?.close();
  await new Promise(resolveClose=>server.close(()=>resolveClose()));
}
