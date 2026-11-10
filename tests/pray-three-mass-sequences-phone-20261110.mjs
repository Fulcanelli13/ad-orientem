import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {MASS_SEQUENCE_PRAYER_WORKS} from "../src/pray/mass-sequences-from-proper.v1.js";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json",
 ".css":"text/css",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp",
 ".woff2":"font/woff2",".webmanifest":"application/manifest+json"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+path);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);return res.end()}
  const data=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream",
   "cache-control":"no-store"});res.end(data);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message||error))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390])for(const language of ["en","fr"]){
  const context=await browser.newContext({viewport:{width,height:width===320?700:844},
   isMobile:true,hasTouch:true,locale:language==="fr"?"fr-FR":"en-GB",serviceWorkers:"block"});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
    {waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>typeof globalThis.AO_APP_SHELL_V1?.navigate==="function"&&
    globalThis.AO_SETTINGS_APP_V1?.status?.().installed===true,null,{timeout:45000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("settings")))?.ok,true);
   await page.locator('#ao-settings-modular-root [data-settings-route="/settings/language-reading"]').click();
   await page.locator('#ao-settings-modular-root [data-pref-path="general.uiLanguage"][data-pref-value="'+language+'"]').click();
   await page.waitForFunction(x=>document.documentElement.lang===x,language,{timeout:15000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("pray")))?.ok,true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.library",{returnContext:null})),true);
   const selector="#aoPray435930.open ";
   await page.locator(selector+"[data-ao-mass-sequence-library]").waitFor({timeout:15000});
   assert.equal(await page.locator(selector+"[data-p435930-mass-sequence-open]").count(),3);
   for(const work of MASS_SEQUENCE_PRAYER_WORKS){
    const entry=page.locator(selector+'[data-p435930-mass-sequence-open="'+work.id+'"]');
    await entry.tap();
    const owner=selector+'[data-ao-pray-mass-sequence="'+work.id+'"]';
    await page.locator(owner).waitFor({state:"attached",timeout:10000});
    try{
     await page.locator(owner+" [data-ao-mass-sequence-complete='true']")
      .waitFor({state:"attached",timeout:45000});
    }catch(error){
     const diagnosis=await page.evaluate(async ({id,date})=>{
      const result=await globalThis.AO_RUNTIME_V8.resolver.resolveDay(date);
      return {id,date,owner:document.querySelector('#aoPray435930 [data-ao-pray-mass-sequence="'+id+'"]')?.innerText?.slice(0,600),
       status:result?.status,properStatus:result?.proper?.status,
       sourcePath:result?.proper?.data?.sourcePath,sequenceType:typeof result?.proper?.data?.sequence,
       sequenceKeys:Object.keys(result?.proper?.data?.sequence??{}),
       latinOpening:String(result?.proper?.data?.sequence?.lat??"").slice(0,90)};
     },{id:work.id,date:work.date});
     throw Error("ACTUAL_MASS_SEQUENCE_DIAGNOSIS="+JSON.stringify(diagnosis)+" "+error);
    }
    assert.equal(await page.locator(owner+' [data-ao-mass-sequence-source]').getAttribute("data-ao-mass-sequence-source"),
      work.sourcePath);
    const latin=await page.locator(owner+' [data-ao-mass-sequence-language="la"]').innerText();
    const other=await page.locator(owner+' [data-ao-mass-sequence-language="'+language+'"]').innerText();
    assert.ok(latin.length>=work.minLatin,"Complete Latin source too short "+work.id);
    assert.ok(other.length>=Math.floor(work.minLatin*.6),"Complete EN/FR source too short "+work.id);
    assert.equal(await page.locator(owner+' a[href*="gregobase"]').count(),0,
      "Unapproved musical score must not be published by Prayer");
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=2,
      "Sequence reader overflow "+work.id+" "+width+" "+language);
    assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.library",{returnContext:null})),true);
    await page.locator(selector+"[data-ao-mass-sequence-library]").waitFor({timeout:10000});
    console.log("PASS actual Mass Sequentia in PRAY "+work.id+" "+width+"px "+language+" ("+latin.length+"/"+other.length+")");
   }
   assert.deepEqual(errors,[],"Prayer browser errors");
  }finally{await context.close()}
 }
}finally{await browser?.close().catch(()=>{});await new Promise(ok=>server.close(ok))}
