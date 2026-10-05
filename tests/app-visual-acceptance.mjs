import assert from "node:assert/strict";
import http from "node:http";
import { mkdir, readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/visual-acceptance");
await mkdir(out,{recursive:true});

const mime={
  ".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",
  ".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
  ".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",
};
const server=http.createServer(async(req,res)=>{
  try{
    const p=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    const file=resolve(root,"."+p);
    if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return;}
    const data=await readFile(file);
    res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream","cache-control":"no-store"});
    res.end(data);
  }catch(error){
    res.writeHead(error?.code==="ENOENT"?404:500);
    res.end(String(error?.message??error));
  }
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4186,"127.0.0.1",ok)});

let browser;
try{
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({
    viewport:{width:390,height:844},
    deviceScaleFactor:2,
    isMobile:true,
    hasTouch:true,
    locale:"en-GB",
  });
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",error=>errors.push(String(error?.message??error)));
  await page.goto("http://127.0.0.1:4186/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.().visibleOwner===true,null,{timeout:30000});
  await page.waitForSelector(".homeScreen",{state:"visible",timeout:30000});
  await page.waitForSelector("[data-ao-home-enricher-owner='modular-home-enrichers-v1']",{state:"visible",timeout:10000});
  await page.waitForFunction(()=>!document.getElementById("ao-cinema-boot"),null,{timeout:8000});
  const homeAudit=await page.evaluate(()=>({
    release:document.documentElement.dataset.aoRelease??null,
    suppressed:document.documentElement.dataset.aoHomeSuppressed??null,
    icons:[...document.querySelectorAll(".aoHomeCuIcon use")].map(use=>use.getAttribute("href")),
  }));
  assert.equal(homeAudit.release,"43.59.30");
  assert.equal(homeAudit.suppressed,"false");
  assert.ok(homeAudit.icons.length>=3,"Home Coming Up did not render canonical SVG symbols");
  assert.ok(homeAudit.icons.every(x=>String(x||"").startsWith("#")),"Home Coming Up symbol reference is malformed");

  const shot=async(name)=>page.screenshot({path:resolve(out,name+".png"),fullPage:true});
  const assertHomeHidden=async(surface)=>{
    const state=await page.evaluate(()=>({
      suppressed:document.documentElement.dataset.aoHomeSuppressed??null,
      display:getComputedStyle(document.querySelector(".homeScreen")).display,
    }));
    assert.equal(state.suppressed,"true",surface+" did not mark Home suppressed");
    assert.equal(state.display,"none",surface+" exposed Home beneath the active surface");
  };

  await shot("01-home");

  await page.locator("[data-ao-app-surface='calendar']").click();
  await page.waitForSelector("#ao-calendar-modular-root",{state:"visible",timeout:10000});
  await assertHomeHidden("Calendar");
  assert.equal(await page.locator("#ao-calendar-modular-root [data-cal-input]").count(),1);
  assert.equal(await page.locator("#ao-calendar-modular-root [data-cal-native]").count(),0);
  await shot("02-calendar");

  await page.locator("[data-ao-app-surface='pray']").click();
  await page.waitForFunction(()=>globalThis.AO_PRAY_APP_V1?.status?.().open===true,null,{timeout:10000});
  await assertHomeHidden("PRAY");
  await shot("03-pray");

  await page.locator("[data-ao-app-surface='learn']").click();
  await page.waitForSelector("#ao-learn-modular-root",{state:"visible",timeout:10000});
  await assertHomeHidden("Learn");
  await shot("04-learn");

  await page.locator("[data-ao-app-surface='settings']").click();
  await page.waitForSelector("#ao-settings-modular-root",{state:"visible",timeout:10000});
  await assertHomeHidden("Settings");
  assert.equal(await page.locator("#ao-settings-modular-root [data-settings-close]").count(),1,"Settings main has duplicate exit controls");
  await shot("05-settings");

  const report=await page.evaluate(()=>({
    shell:globalThis.AO_APP_SHELL_V1?.status?.()??null,
    viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},
    release:document.documentElement.dataset.aoRelease??null,
    appOwner:document.documentElement.dataset.aoAppShellOwner??null,
    surfaces:[...document.querySelectorAll("[data-ao-app-surface]")].map(node=>({
      surface:node.dataset.aoAppSurface,
      assetId:node.dataset.aoAssetId||null,
      rect:node.getBoundingClientRect().toJSON(),
      text:node.textContent?.trim()||"",
    })),
  }));
  await import("node:fs/promises").then(({writeFile})=>writeFile(resolve(out,"report.json"),JSON.stringify({report,errors},null,2)));
  console.log("visual acceptance capture: PASS",JSON.stringify({errors,report},null,2));
}finally{
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
