import assert from "node:assert/strict";
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml"};
const server=http.createServer(async(req,res)=>{
  try{
    const p=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    const file=resolve(root,"."+p);
    if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
    const data=await readFile(file);
    res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream","cache-control":"no-store"});
    res.end(data);
  }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message??error));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4182,"127.0.0.1",ok)});

let browser;
try{
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",error=>errors.push(String(error?.message??error)));
  await page.goto("http://127.0.0.1:4182/index.html",{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>
    globalThis.AO_APP_SHELL_V1?.installed===true &&
    globalThis.AO_APP_SHELL_V1?.status?.().visibleRibbonOwned===true &&
    globalThis.AO_APP_SHELL_V1?.status?.().legacyRibbonClickNeutralized===true,
    null,{timeout:30000});

  const initial=await page.evaluate(()=>({
    passive:globalThis.AO_APP_SHELL_V1.passive,
    status:globalThis.AO_APP_SHELL_V1.status(),
    dataset:document.documentElement.dataset.aoAppShellOwner??null,
    ribbonOwner:document.getElementById("ao-global-ribbon")?.getAttribute("data-ao-app-owner")??null,
    active:globalThis.AO_APP_SHELL_V1.getActive(),
    donorButtons:document.querySelectorAll("#ao-global-ribbon [data-ao-ribbon]").length,
    modularButtons:document.querySelectorAll("#ao-global-ribbon [data-ao-app-surface]").length,
  }));
  assert.equal(initial.passive,false);
  assert.equal(initial.status?.visibleRibbonOwned,true);
  assert.equal(initial.status?.legacyRibbonClickNeutralized,true);
  assert.equal(initial.dataset,"modular");
  assert.equal(initial.ribbonOwner,"modular");
  assert.equal(initial.active,"home");
  assert.equal(initial.donorButtons,0,"historical ribbon click attributes were not neutralized");
  assert.equal(initial.modularButtons,6,"modular shell did not adopt all six ribbon buttons");

  async function clickSurface(surface){
    const button=page.locator(`[data-ao-app-surface="${surface}"]`);
    await button.waitFor({state:"visible",timeout:15000});
    await button.click();
    await page.waitForFunction(s=>globalThis.AO_APP_SHELL_V1?.getActive?.()===s,surface,{timeout:10000});
    return page.evaluate(s=>({
      active:globalThis.AO_APP_SHELL_V1.getActive(),
      current:[...document.querySelectorAll("[data-ao-app-surface]")].filter(x=>x.getAttribute("aria-current")==="page").map(x=>x.getAttribute("data-ao-app-surface")),
      donorButtons:document.querySelectorAll("#ao-global-ribbon [data-ao-ribbon]").length,
      modularButtons:document.querySelectorAll("#ao-global-ribbon [data-ao-app-surface]").length,
      route:globalThis.AO_RUNTIME_V8?.store?.getState?.()?.route??null,
      requested:s,
    }),surface);
  }

  for(const surface of ["pray","learn","calendar","home","settings"]){
    const state=await clickSurface(surface);
    assert.equal(state.active,surface);
    assert.equal(state.donorButtons,0,`legacy ribbon click hooks returned on ${surface}`);
    assert.equal(state.modularButtons,6,`modular ribbon adoption drifted on ${surface}`);
    assert.deepEqual(state.current,[surface],`visible ribbon aria-current drifted on ${surface}`);
  }

  assert.deepEqual(errors,[],"uncaught page errors during modular ribbon journey: "+JSON.stringify(errors));
  await context.close();
  console.log("app visible shell ownership: PASS — donor ribbon presentation retained; legacy click hooks neutralized; AO_APP_SHELL_V1 owns navigation.");
}finally{
  await browser?.close();
  await new Promise(ok=>server.close(ok));
}
