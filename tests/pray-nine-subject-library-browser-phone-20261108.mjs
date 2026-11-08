import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {prayerSubjectCounts} from "../src/pray/prayer-subject-index.v1.js";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
  const body=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream","cache-control":"no-store"});res.end(body);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((ok,bad)=>{server.once("error",bad);server.listen(0,"127.0.0.1",ok)});
const expected=prayerSubjectCounts(Object.values(PRAY_CANONICAL_DATA_V435930.prayers));
let browser,contexts=0;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390])for(const ui of ["en","fr"]){
  const ctx=await browser.newContext({viewport:{width,height:width===320?700:844},isMobile:true,hasTouch:true,locale:ui==="fr"?"fr-FR":"en-GB",serviceWorkers:"block",reducedMotion:"reduce"});
  const page=await ctx.newPage(),errs=[];page.on("pageerror",e=>errs.push(e.message));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().installed===true&&typeof globalThis.AO_APP_SHELL_V1?.navigate==="function",null,{timeout:45000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("settings")))?.ok,true);
   await page.locator('#ao-settings-modular-root [data-settings-route="/settings/language-reading"]').click();
   await page.locator('#ao-settings-modular-root [data-pref-path="general.uiLanguage"][data-pref-value="'+ui+'"]').click();
   await page.waitForFunction(x=>document.documentElement.lang===x,ui,{timeout:10000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("pray")))?.ok,true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.library",{returnContext:null})),true);
   const scope="#aoPray435930.open ";
   const browse=page.locator(scope+"[data-ao-prayer-subject-browser]");
   assert.equal(await browse.count(),1,"Library subject browser missing");
   assert.equal(await page.locator(scope+"[data-p435930-lib-subject]").count(),10,"Nine families + All must exist");
   await browse.locator("summary").click();
   assert.equal(await browse.evaluate(el=>el.open),true);
   const rows=()=>page.locator(scope+"[data-p435930-lib-open]").count();
   assert.equal(await rows(),48,"Initial Library retains all original 48 canonical prayer cards");
   for(const id of ["I","II","III","IV","V","VI","VII","VIII","IX"]){
    await page.locator(scope+'[data-p435930-lib-subject="'+id+'"]').evaluate(el=>el.click());
    assert.equal(await page.locator(scope+"[data-ao-prayer-subject-results]").getAttribute("data-ao-prayer-subject-results"),id);
    assert.equal(await rows(),expected.counts[id],id+" source-index count mismatch");
    assert.equal(await page.locator(scope+'[data-p435930-lib-subject="'+id+'"]').getAttribute("aria-pressed"),"true");
    assert.equal(await browse.evaluate(el=>el.open),true,"Browser must retain open state through filter rerender");
   }
   await page.locator(scope+'[data-p435930-lib-subject="VIII"]').evaluate(el=>el.click());
   const search=page.locator(scope+"[data-p435930-lib-search]");
   await search.evaluate(el=>{el.value="Magnificat";el.dispatchEvent(new Event("input",{bubbles:true}))});
   assert.equal(await rows(),1,"Search within Scripture family must find the Magnificat exactly");
   await page.locator(scope+'[data-p435930-lib-subject="all"]').evaluate(el=>el.click());
   assert.equal(await rows(),1,"All subjects preserves active text search");
   await page.locator(scope+"[data-p435930-lib-search]").evaluate(el=>{el.value="";el.dispatchEvent(new Event("input",{bubbles:true}))});
   assert.equal(await rows(),48,"Clear search restores existing whole Library");
   // Read the original canonical prayer through the original Library reader.
   await page.locator(scope+'[data-p435930-lib-subject="IV"]').evaluate(el=>el.click());
   await page.locator(scope+'[data-p435930-lib-open="sacrament_come_holy_spirit"]').evaluate(el=>el.click());
   assert.equal(await page.locator(scope+'.aoP435930LibraryReader [data-ao-devo-card="sacrament_come_holy_spirit"]').count(),1);
   assert.ok((await page.locator(scope+'.aoP435930LibraryReader').innerText()).length>100);
   assert.deepEqual(errs,[],"Browser error(s) "+width+"/"+ui);
   contexts++;console.log("PASS Prayer subject browsing "+width+"px "+ui+" — nine families, search, 48 canonical cards, original reader");
  }finally{await ctx.close()}
 }
 assert.equal(contexts,4);
 console.log("PASS: 4/4 mobile EN/FR subject browse and existing canonical reader contexts, with nine-family filters and no source/body substitutions.");
}finally{await browser?.close().catch(()=>{});await new Promise(done=>server.close(done))}
