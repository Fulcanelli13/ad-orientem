import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const target=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(target!==root&&!target.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return;}
  const bytes=await readFile(target);
  res.writeHead(200,{"content-type":mime[extname(target)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error.message??error));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok);});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390,430]){
  const page=await browser.newPage({viewport:{width,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,serviceWorkers:"block"});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
     {waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.()?.visibleOwner===true&&
     globalThis.AO_SCRIPTURE_CONTEXT_V1?.open!=null,null,{timeout:45000});
   const state=await page.evaluate(async()=>{
    const corpus=await (await fetch("/data/learn/formation-canonical-sourcefirst-batch5-2026-10-09.v1.json")).json();
    const entry=corpus.source_registry.find(s=>s.id==="BIBLE-1COR11");
    const {formationSourceBibleMarkup}=await import("/src/learn/formation-scripture-source.js");
    const container=document.createElement("div");
    container.id="formation-scripture-phone-fixture";
    container.className="rrSources";
    container.style.cssText="position:fixed;top:84px;left:12px;right:12px;z-index:14000;background:#080c12;color:white;padding:12px";
    container.innerHTML='<a href="'+entry.url+'" target="_blank" rel="noopener noreferrer">Original Catholic Bible source</a>'+
     formationSourceBibleMarkup(entry,{french:false});
    document.body.append(container);
    return {reference:container.querySelector("[data-ao-scripture-context]")?.getAttribute("data-ao-scripture-context"),
      originalUrl:container.querySelector("a")?.href,source:entry.url};
   });
   assert.equal(state.reference,"1 Corinthians 11:23–32");
   assert.equal(state.originalUrl,state.source,"Original Catholic Bible citation was lost");
   const trigger=page.locator("#formation-scripture-phone-fixture [data-ao-scripture-context]");
   await trigger.tap();
   const reader=page.locator("#ao-scripture-overlay");
   await reader.waitFor({state:"visible",timeout:10000});
   assert.equal(await reader.locator(".aoScriptureReading h3").innerText(),"1Corinthians 11:23–32",
     "The native Bible reader displays the canonical Catholic book ID without a space");
   await reader.locator(".aoScriptureVerse").first().waitFor({state:"visible",timeout:12000});
   assert.equal(await reader.locator('[data-scripture-witness-unreviewed="dr-challoner"]').count(),1,
     "Uncollated historical edition disclosure may not be hidden");
   await reader.locator('[data-scripture-context-depth="chapter"]').tap();
   assert.ok(await reader.locator(".aoScriptureVerse").count()>20,
     "Full original chapter not available from Formation reference");
   await reader.locator("[data-scripture-close]").tap();
   assert.equal(await trigger.evaluate(el=>el===document.activeElement),true,
     "Must return focus to the source-owned Formation passage button");
   assert.deepEqual(errors.filter(s=>/ReferenceError|SyntaxError|TypeError/.test(s)),[],
     "Formation Scripture journey raised browser errors");
   console.log("PASS "+width+"px Formation source -> Scripture passage -> chapter -> source-focus return");
  }finally{await page.close();}
 }
}finally{await browser?.close();await new Promise(ok=>server.close(ok));}
