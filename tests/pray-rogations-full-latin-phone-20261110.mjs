import assert from "node:assert/strict";
import http from "node:http";
import {readFile,readFileSync} from "node:fs";
import {promisify} from "node:util";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {rogationsLatinPrayerStages} from "../src/pray/rogations-latin-prayer.v1.js";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const payload=JSON.parse(readFileSync(resolve(root,"data/presentation/reader-rogations.v1.json"),"utf8"));
const sections=rogationsLatinPrayerStages(payload);
const read=promisify(readFile);
const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".json":"application/json",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
  const data=await read(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});res.end(data);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e.message||e))}
});
await new Promise((ok,bad)=>{server.once("error",bad);server.listen(0,"127.0.0.1",ok)});
let browser,passed=0;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390])for(const language of ["en","fr"]){
  const ctx=await browser.newContext({viewport:{width,height:width===320?700:844},isMobile:true,hasTouch:true,serviceWorkers:"block",locale:language==="fr"?"fr-FR":"en-GB"});
  const page=await ctx.newPage(),errors=[],external=[];
  page.on("pageerror",e=>errors.push(e.message));
  page.on("request",r=>{if(/wikisource.org|icrspfrance.fr/.test(r.url()))external.push(r.url())});
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().installed===true&&typeof globalThis.AO_APP_SHELL_V1?.navigate==="function",null,{timeout:45000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("settings")))?.ok,true);
   await page.locator('#ao-settings-modular-root [data-settings-route="/settings/language-reading"]').click();
   await page.locator('#ao-settings-modular-root [data-pref-path="general.uiLanguage"][data-pref-value="'+language+'"]').click();
   await page.waitForFunction(value=>document.documentElement.lang===value,language,{timeout:10000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("pray")))?.ok,true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.litany_saints",{returnContext:null})),true);
   const base="#aoPray435930.open ";
   await page.locator(base+".aoPrivateLitanyEditionChooser > summary").waitFor({state:"attached",timeout:16000});
   await page.locator(base+".aoPrivateLitanyEditionChooser > summary").tap();
   await page.locator(base+"[data-p435930-lit-use='major']:visible").tap();
   const owner=base+'[data-ao-litany-use="major"][data-ao-rogations-source="R25_LATIN_UNCOLLATED"]';
   await page.locator(owner).waitFor({state:"attached",timeout:20000});
   await page.waitForFunction(()=>document.querySelectorAll('#aoPray435930.open [data-ao-litany-use="major"] .aoDevoSequenceTimeline [data-ao-devo-chapter]').length===14,null,{timeout:10000});
   assert.equal(await page.locator(owner+" [data-ao-rogations-source-hold='UNCOLLATED_ORIGINAL_PRINT']").count(),1);
   await ctx.setOffline(true);
   const result=[];
   for(let i=0;i<14;i++){
    if(i)await page.locator(owner+" .aoDevoSequenceTimeline [data-ao-devo-chapter='"+i+"']").evaluate(el=>el.click());
    await page.waitForFunction(index=>document.querySelector('#aoPray435930.open [data-ao-litany-use="major"] .aoDevoCardNumber')?.textContent?.trim().startsWith(String(index+1)+" /"),i,{timeout:15000});
    const actual=(await page.locator(owner+" [data-ao-rogations-latin-row]").allTextContents()).map(s=>s.trim().replace(/^[℣℟]\s*/,""));
    assert.deepEqual(actual,sections[i].rows.map(r=>r.latin),"Original Latin must remain unchanged at stage "+i);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=2,"Phone overflow at "+width+"/"+i);
    result.push(...actual);
   }
   assert.equal(result.length,186);
   assert.equal(external.length,0,"Reading must not fetch Wikisource/ICRSP");
   assert.equal(await page.locator(owner+" [data-p435930-rog-done]").count(),1);
   assert.deepEqual(errors,[]);
   passed++;
   console.log("PASS Rogations 186 Latin entries 14 stages offline after load "+width+"px "+language);
  }finally{await ctx.close()}
 }
 assert.equal(passed,4);
}finally{await browser?.close().catch(()=>{});await new Promise(done=>server.close(done))}
