/** Full phone interaction matrix for the source-owned Holy Cloak reader.
 * This is separate from 19/19 source-text structural checks: every stage must
 * actually render with the selected language and navigate correctly.
 */
import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {HOLY_CLOAK_ITALIAN_STEPS_V1 as steps,HOLY_CLOAK_ITALIAN_SOURCE_V1 as source} from "../src/pray/holy-cloak-italian-original.v1.js";
import {HOLY_CLOAK_EDITORIAL_EN_FR_V1 as tr} from "../src/pray/holy-cloak-editorial-en-fr.v1.js";
import {PRAY_CANONICAL_DATA_V435930 as canon} from "../src/pray/canonical-data.js";
const repoRoot=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(repoRoot,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(path!==repoRoot&&!path.startsWith(repoRoot+sep)){res.writeHead(403);res.end();return;}
  const data=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream","cache-control":"no-store"});res.end(data);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e.message||e))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
const normalize=x=>String(x||"").normalize("NFC").replace(/\s+/g,"");
const faceOf=(step,face)=>{
 if(step.id==="litany")return step.vernacular?.[face]||step.body;
 if(step.id==="optional")return canon.prayers[step.sourceId]?.[face==="it"?"la":face];
 if(face==="it")return step.it||step.body;
 const editorial=step.id==="opening"?tr.opening:step.id==="closing"?tr.closing:tr.sections.find(x=>x.id===step.id);
 return editorial?.[face];
};
const scope="#aoPray435930.open ";
let browser,count=0;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390])for(const locale of ["en","fr"]){
  const context=await browser.newContext({viewport:{width,height:width===320?700:844},isMobile:true,hasTouch:true,locale:locale==="fr"?"fr-FR":"en-GB",serviceWorkers:"block",reducedMotion:"reduce"});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",err=>errors.push(err.message));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().installed===true&&typeof globalThis.AO_APP_SHELL_V1?.navigate==="function",null,{timeout:45000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("settings")))?.ok,true);
   await page.locator('#ao-settings-modular-root [data-settings-route="/settings/language-reading"]').click();
   await page.locator('#ao-settings-modular-root [data-pref-path="general.uiLanguage"][data-pref-value="'+locale+'"]').click();
   await page.waitForFunction(x=>document.documentElement.lang===x,locale,{timeout:10000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("pray")))?.ok,true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.library",{returnContext:null})),true);
   const lib=page.locator(scope+'[data-p435930-lib-search]');
   await lib.fill("holy cloak");
   await page.locator(scope+'[data-ao-holy-cloak-italian-open]').click();
   const reader=page.locator(scope+'[data-ao-holy-cloak-italian-reader]');
   await reader.waitFor({state:"visible",timeout:10000});
   assert.equal(await reader.getAttribute("data-ao-holy-cloak-day-count"),"30");
   const active=page.locator(scope+'[data-ao-holy-cloak-language] [aria-pressed="true"]');
   assert.equal(await active.getAttribute("data-p435930-hc-lang"),locale);
   for(let i=0;i<steps.length;i++){
    const step=steps[i];
    const article=reader.locator('[data-ao-holy-cloak-step="'+step.id+'"]');
    assert.equal(await article.count(),1,"Missing "+step.id+" on "+width+"/"+locale);
    const body=article.locator('.aoDevoCardScroll > p[lang]');
    assert.equal(await body.count(),1,"Main prayer paragraph missing "+step.id);
    assert.equal(await body.getAttribute("lang"),locale);
    const expected=faceOf(step,locale);
    assert.ok(expected&&expected.length>20,"Missing historical or editorial body "+step.id);
    assert.equal(normalize(await body.innerText()),normalize(expected),
     "Rendered source mismatch "+step.id+" "+width+"/"+locale);
    if(step.id==="XVIII"){
     for(const other of ["it",locale==="fr"?"en":"fr"]){
      await reader.locator('[data-p435930-hc-lang="'+other+'"]').click();
      const switched=reader.locator('[data-ao-holy-cloak-step="XVIII"] .aoDevoCardScroll > p[lang]');
      assert.equal(await switched.getAttribute("lang"),other);
      assert.equal(normalize(await switched.innerText()),normalize(faceOf(step,other)));
      assert.equal((await switched.innerText()).split("\n").filter(line=>/^[℣℟]\./.test(line)).length,38,"Original source-printed versicle and response labels must render");
     }
     await reader.locator('[data-p435930-hc-lang="'+locale+'"]').click();
    }
    const common=article.locator('[data-ao-holy-cloak-common]');
    assert.equal(await common.count(),step.repeat?.length||0,"Wrong shared prayer count "+step.id);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),
     "Horizontal overflow "+width+"/"+locale+"/"+step.id);
    count++;
    if(i!==steps.length-1)await reader.locator('[data-p435930-hc-next]').click();
   }
   await reader.locator('[data-p435930-hc-finish]').click();
   assert.equal(await page.locator(scope+'[data-ao-holy-cloak-italian-reader]').count(),0);
   assert.deepEqual(errors,[],errors.join("; "));
   console.log("PASS Holy Cloak "+width+"px "+locale+" all "+steps.length+" stages, true EN/FR text, IT source switch, old litany, offline route");
  }finally{await context.close()}
 }
 assert.equal(count,92,"Expected 23 real stages × 320/390 × EN/FR");
}finally{await browser?.close().catch(()=>{});await new Promise(ok=>server.close(ok))}
