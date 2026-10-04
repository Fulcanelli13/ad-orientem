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
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4181,"127.0.0.1",ok)});

let browser;
try{
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const page=await context.newPage();
  await page.goto("http://127.0.0.1:4181/index.html",{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForTimeout(1800);
  const result=await page.evaluate(()=>{
    const wanted=/^(home|mass|pray|learn|calendar|settings|accueil|messe|prier|apprendre|calendrier|réglages|paramètres)$/i;
    const all=[...document.querySelectorAll("button,a,[role='button']")];
    const matches=all.filter(el=>wanted.test((el.textContent??"").trim())).map(el=>({
      tag:el.tagName,
      text:(el.textContent??"").trim(),
      id:el.id||null,
      className:typeof el.className==="string"?el.className:null,
      attrs:Object.fromEntries([...el.attributes].map(a=>[a.name,a.value]).filter(([k])=>/data-|aria-|href|role/.test(k))),
      visible:Boolean(el.getClientRects().length),
      html:el.outerHTML.slice(0,1200),
    }));
    const globals=["AO_GLOBAL_RIBBON_V4323","AO_APP_SHELL_V1","AO_NAV_V362","AO_V37_SHELL","AO_SETTINGS_V4359","AO_PRAY_V435930"];
    const owners=Object.fromEntries(globals.map(name=>[name,globalThis[name]?{
      type:typeof globalThis[name],
      keys:Object.keys(globalThis[name]).sort().slice(0,80),
    }:null]));
    return {
      title:document.title,
      route:globalThis.AO_RUNTIME_V8?.store?.getState?.()?.route??null,
      appBridge:document.documentElement.dataset.aoAppShellBridge??null,
      matches,
      owners,
      scripts:[...document.scripts].map(s=>s.src).filter(x=>/browser-entry|app\/|mass\//.test(x)),
    };
  });
  console.log("APP_SHELL_DISCOVERY "+JSON.stringify(result,null,2));
  await context.close();
}finally{
  await browser?.close();
  await new Promise(ok=>server.close(ok));
}
