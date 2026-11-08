/**
 * Integration phone acceptance: seven already-existing guided routes appear
 * under original nine theological subjects, then open source-owned readers.
 */
import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {PRAYER_SUBJECT_GUIDED_LINKS_V1,guidedPrayerLinksForSubject} from "../src/pray/prayer-subject-guided-links.v1.js";
import {internalPrayerView} from "../src/pray/internal-route-owner.js";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
  const bytes=await readFile(path);res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream","cache-control":"no-store"});res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((yes,no)=>{server.once("error",no);server.listen(0,"127.0.0.1",yes)});
const views={};
for(const v of PRAYER_SUBJECT_GUIDED_LINKS_V1)views[v.id]=internalPrayerView(v.id);
let browser,checked=0;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390])for(const ui of ["en","fr"]){
  const ctx=await browser.newContext({viewport:{width,height:width===320?700:844},isMobile:true,hasTouch:true,locale:ui==="fr"?"fr-FR":"en-GB",serviceWorkers:"block",reducedMotion:"reduce"});
  const page=await ctx.newPage(),errors=[];page.on("pageerror",e=>errors.push(String(e.message)));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().installed===true&&typeof globalThis.AO_APP_SHELL_V1?.navigate==="function",null,{timeout:45000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("settings")))?.ok,true);
   await page.locator('#ao-settings-modular-root [data-settings-route="/settings/language-reading"]').click();
   await page.locator('#ao-settings-modular-root [data-pref-path="general.uiLanguage"][data-pref-value="'+ui+'"]').click();
   await page.waitForFunction(x=>document.documentElement.lang===x,ui,{timeout:10000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("pray")))?.ok,true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
   const scope="#aoPray435930.open ";
   for(const item of PRAYER_SUBJECT_GUIDED_LINKS_V1){
    assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.library",{returnContext:null})),true);
    const summary=page.locator(scope+'[data-ao-prayer-subject-browser] summary');
    if(!(await page.locator(scope+'[data-ao-prayer-subject-browser]').evaluate(el=>el.open)))await summary.evaluate(el=>el.click());
    await page.locator(scope+'[data-p435930-lib-subject="'+item.subject+'"]').evaluate(el=>el.click());
    const candidates=guidedPrayerLinksForSubject(item.subject);
    assert.equal(await page.locator(scope+'[data-ao-prayer-subject-guided="'+item.subject+'"] [data-p435930-own]').count(),candidates.length,item.subject+" guided catalogue count");
    const link=page.locator(scope+'[data-ao-prayer-subject-guided] [data-p435930-own="'+item.id+'"]');
    assert.equal(await link.count(),1,"Missing source-owned guided link "+item.id);
    assert.ok((await link.innerText()).includes(ui==="fr"?item.fr:item.en),"Source-owned guided link title language failed "+item.id);
    await link.evaluate(el=>el.click());
    await page.waitForFunction(view=>document.querySelector("#aoPray435930.open .aoP435930Mount")?.dataset.aoPrayView===view,views[item.id],{timeout:15000});
    assert.equal(await page.locator(scope+".aoP435930Body").count(),1,"Source reader failed to render "+item.id);
    checked++;
   }
   // No special links are suggested under unrelated subjects.
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.library",{returnContext:null})),true);
   await page.locator(scope+'[data-ao-prayer-subject-browser] summary').evaluate(el=>el.click());
   await page.locator(scope+'[data-p435930-lib-subject="I"]').evaluate(el=>el.click());
   assert.equal(await page.locator(scope+"[data-ao-prayer-subject-guided]").count(),0);
   assert.deepEqual(errors,[],"Javascript page error in "+ui+"/"+width+" mobile");
   console.log("PASS "+width+"px "+ui+" seven existing guided readers routed from subject Library");
  }finally{await ctx.close()}
 }
 assert.equal(checked,28);
 console.log("PASS 28 original-reader navigations in 4 mobile EN/FR contexts; no new prayer body imported");
}finally{await browser?.close().catch(()=>{});await new Promise(done=>server.close(done))}
