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
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.installed===true,{timeout:30000});

  const initial=await page.evaluate(()=>{
    globalThis.__AO_DOWNSTREAM_RIBBON_CLICKS=0;
    document.addEventListener("click",event=>{
      if(event.target?.closest?.("[data-ao-ribbon]"))globalThis.__AO_DOWNSTREAM_RIBBON_CLICKS++;
    },true);
    return {
      passive:globalThis.AO_APP_SHELL_V1.passive,
      owner:globalThis.AO_APP_SHELL_V1.status().visibleRibbonOwner,
      dataset:document.documentElement.dataset.aoAppShellOwner??null,
      active:globalThis.AO_APP_SHELL_V1.getActive(),
    };
  });
  assert.equal(initial.passive,false);
  assert.equal(initial.owner,"AO_APP_SHELL_V1");
  assert.equal(initial.dataset,"modular");
  assert.equal(initial.active,"home");

  async function clickSurface(surface){
    const button=page.locator(`[data-ao-ribbon="${surface}"]`);
    await button.waitFor({state:"visible",timeout:15000});
    await button.click();
    await page.waitForFunction(s=>globalThis.AO_APP_SHELL_V1?.getActive?.()===s,surface,{timeout:10000});
    return page.evaluate(s=>({
      active:globalThis.AO_APP_SHELL_V1.getActive(),
      downstream:globalThis.__AO_DOWNSTREAM_RIBBON_CLICKS,
      current:[...document.querySelectorAll("[data-ao-ribbon]")].filter(x=>x.getAttribute("aria-current")==="page").map(x=>x.getAttribute("data-ao-ribbon")),
      route:globalThis.AO_RUNTIME_V8?.store?.getState?.()?.route??null,
      requested:s,
    }),surface);
  }

  for(const surface of ["pray","learn","calendar","home","settings"]){
    const state=await clickSurface(surface);
    assert.equal(state.active,surface);
    assert.equal(state.downstream,0,`historical ribbon listener received ${surface} click`);
    assert.deepEqual(state.current,[surface],`visible ribbon aria-current drifted on ${surface}`);
  }

  assert.deepEqual(errors,[],"uncaught page errors during modular ribbon journey: "+JSON.stringify(errors));
  await context.close();
  console.log("app visible shell ownership: PASS — AO_APP_SHELL_V1 owns real ribbon clicks on actual index.html.");
}finally{
  await browser?.close();
  await new Promise(ok=>server.close(ok));
}
