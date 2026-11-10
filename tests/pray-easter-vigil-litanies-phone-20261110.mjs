import assert from "node:assert/strict";
import http from "node:http";
import {readFileSync} from "node:fs";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {easterVigilTwoLitaniesStages} from "../src/pray/easter-vigil-two-litanies.v1.js";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const source=JSON.parse(readFileSync(resolve(root,"data/presentation/reader-easter-vigil.v1.json"),"utf8"));
const stages=easterVigilTwoLitaniesStages(source);
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".json":"application/json",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp",".woff2":"font/woff2"};
const srv=http.createServer(async(req,res)=>{
 try{
  const f=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(f!==root&&!f.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
  const b=await readFile(f);res.writeHead(200,{"content-type":mime[extname(f)]||"application/octet-stream","cache-control":"no-store"});res.end(b);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((ok,bad)=>{srv.once("error",bad);srv.listen(0,"127.0.0.1",ok)});
let browser,pass=0;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390])for(const language of ["en","fr"]){
  const context=await browser.newContext({viewport:{width,height:width===320?700:844},hasTouch:true,isMobile:true,locale:language==="fr"?"fr-FR":"en-GB",serviceWorkers:"block"});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  try{
   await page.goto("http://127.0.0.1:"+srv.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().installed===true&&typeof globalThis.AO_APP_SHELL_V1?.navigate==="function",null,{timeout:45000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("settings")))?.ok,true);
   await page.locator('#ao-settings-modular-root [data-settings-route="/settings/language-reading"]').click();
   await page.locator('#ao-settings-modular-root [data-pref-path="general.uiLanguage"][data-pref-value="'+language+'"]').click();
   await page.waitForFunction(x=>document.documentElement.lang===x,language,{timeout:10000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("pray")))?.ok,true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.litany_saints",{returnContext:null})),true);
   const base="#aoPray435930.open ";
   await page.locator(base+".aoPrivateLitanyEditionChooser > summary").waitFor({state:"attached",timeout:15000});
   await page.locator(base+".aoPrivateLitanyEditionChooser > summary").tap();
   await page.locator(base+"[data-p435930-lit-use='vigil']:visible").tap();
   const owner=base+'[data-ao-litany-use="vigil"][data-ao-easter-vigil-litanies="R33_TWO_PARTS_NOT_PRINT_CERTIFIED"]';
   await page.locator(owner).waitFor({state:"attached",timeout:20000});
   await page.waitForFunction(()=>document.querySelectorAll('#aoPray435930.open [data-ao-litany-use="vigil"] .aoDevoSequenceTimeline [data-ao-devo-chapter]').length===7,null,{timeout:10000});
   assert.equal(await page.locator(owner+' [data-ao-vigil-source-hold="RECOVERED_DONOR_NOT_PRINT_COLLATED"]').count(),1);
   await context.setOffline(true);
   let count=0;
   for(let i=0;i<7;i++){
    if(i)await page.locator(owner+' .aoDevoSequenceTimeline [data-ao-devo-chapter="'+i+'"]').evaluate(el=>el.click());
    await page.waitForFunction(index=>document.querySelector('#aoPray435930.open [data-ao-litany-use="vigil"] .aoDevoCardNumber')?.textContent?.trim().startsWith(String(index+1)+" /"),i,{timeout:15000});
    const rows=await page.locator(owner+" [data-ao-vigil-litany-row]").evaluateAll(els=>els.map(e=>({
     part:e.getAttribute("data-ao-vigil-part"),
     lat:e.querySelector(".aoVigilLatin")?.textContent?.trim().replace(/^[℣℟]\s*/,""),
     other:e.querySelector(".aoVigilTranslation")?.textContent?.trim().replace(/^[℣℟]\s*/,"")
    })));
    assert.deepEqual(rows.map(r=>r.lat),stages[i].rows.map(r=>r.latin),"Latin source card "+i);
    assert.deepEqual(rows.map(r=>r.other),stages[i].rows.map(r=>language==="fr"?r.french:r.english),"Actual EN/FR source card "+i);
    assert.ok(rows.every(r=>r.part===stages[i].part));
    assert.equal(await page.locator(owner+' [data-ao-vigil-rite-boundary="'+stages[i].part+'"]').count(),1);
    count+=rows.length;
    assert.ok((await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth))<=2,"Horizontal overflow "+width+"/"+language+"/"+i);
   }
   assert.equal(count,152);
   assert.equal(await page.locator(owner+" [data-p435930-vigil-lit-done]").count(),1);
   assert.deepEqual(errors,[]);
   pass++;
   console.log("PASS Easter Vigil both R33 Litanies 7 complete cards / 152 bilingual lines "+width+"px "+language+" after going offline");
  }finally{await context.close()}
 }
 assert.equal(pass,4);
}finally{await browser?.close().catch(()=>{});await new Promise(ok=>srv.close(ok))}
