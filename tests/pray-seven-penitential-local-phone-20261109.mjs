import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {PENITENTIAL_PSALMS_VULGATE} from "../src/pray/penitential-psalms-source.js";
import {localPenitentialPsalmWitness} from "../src/pray/penitential-psalms-local-witnesses.v1.js";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
  const body=await readFile(file);res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});res.end(body);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((yes,no)=>{server.once("error",no);server.listen(0,"127.0.0.1",yes)});
let browser;let states=0;
const normalize=x=>String(x).normalize("NFC").replace(/\s+/g," ").trim();
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390])for(const ui of ["en","fr"]){
  const ctx=await browser.newContext({viewport:{width,height:width===320?700:844},isMobile:true,hasTouch:true,locale:ui==="fr"?"fr-FR":"en-GB",serviceWorkers:"block",reducedMotion:"reduce"});
  const page=await ctx.newPage();const errors=[];page.on("pageerror",e=>errors.push(e.message));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().installed===true&&typeof globalThis.AO_APP_SHELL_V1?.navigate==="function",null,{timeout:45000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("settings")))?.ok,true);
   await page.locator('#ao-settings-modular-root [data-settings-route="/settings/language-reading"]').click();
   await page.locator('#ao-settings-modular-root [data-pref-path="general.uiLanguage"][data-pref-value="'+ui+'"]').click();
   await page.waitForFunction(x=>document.documentElement.lang===x,ui,{timeout:10000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("pray")))?.ok,true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.penitential_psalms",{returnContext:null})),true);
   await page.locator("#aoPray435930.open [data-ao-devo-chapter='0']").waitFor({state:"attached",timeout:15000});
   // Simulate a lost connection while the reader is open: source bodies must remain available.
   await ctx.setOffline(true);
   const scope="#aoPray435930.open ";
   for(let i=0;i<7;i++){
    if(i>0)await page.locator(scope+'[data-ao-devo-chapter="'+i+'"]').evaluate(el=>el.click());
    await page.locator(scope+'[data-ao-penitential-local-witness]').waitFor({state:"attached",timeout:15000});
    const original=localPenitentialPsalmWitness(PENITENTIAL_PSALMS_VULGATE[i].trad,ui);
    assert.equal(await page.locator(scope+'[data-ao-penitential-local-witness]').getAttribute("data-ao-penitential-local-witness"),original.editionId);
    const rows=await page.locator(scope+'[data-ao-penitential-local-witness] .aoP435930ScriptureVerse').evaluateAll(els=>els.map(el=>{
     const label=el.querySelector("sup")?.textContent||"";
     return {verse:Number(label),text:(el.textContent||"").slice(label.length)};
    }));
    assert.equal(rows.length,original.rows.length,ui+" Psalm "+original.sourceChapter);
    assert.deepEqual(rows.map(x=>[x.verse,normalize(x.text)]),original.rows.map(x=>[x.verse,normalize(x.text)]));
    assert.equal(await page.locator(scope+'[data-ao-penitential-source-status="UNCOLLATED_SOURCE_WITNESS"]').count(),1);
    assert.ok((await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth))<=2,"Horizontal overflow on "+width+" "+ui+" Psalm "+original.sourceChapter);
    states++;
   }
   assert.deepEqual(errors,[],"No browser exceptions "+width+" "+ui);
   console.log("PASS seven original source Psalms offline "+width+"px "+ui);
  }finally{await ctx.close()}
 }
 assert.equal(states,28);
 console.log("PASS 28/28 original-content offline reader states (7 Psalms x EN/FR x 320/390px)");
}finally{await browser?.close().catch(()=>{});await new Promise(ok=>server.close(ok))}
