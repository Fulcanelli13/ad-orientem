// Browser-only acceptance: source-bounded Customs variants live inside published Calendar articles
// as historical parent context only, never as new day events or canonical Customs.
import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/calendar-customs-existing22-preview");
await mkdir(output,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const u=new URL(req.url,"http://127.0.0.1");
  const p=resolve(root,"."+decodeURIComponent(u.pathname));
  if(p!==root&&!p.startsWith(root+sep)){res.writeHead(403);res.end("Forbidden");return;}
  res.writeHead(200,{"content-type":mime[extname(p)]||"application/octet-stream","cache-control":"no-store"});
  res.end(await readFile(p));
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
const base="http://127.0.0.1:"+server.address().port;
let browser;
try{
 browser=await chromium.launch({headless:true});
 const cases=[320,390].flatMap(width=>["en","fr"].flatMap(lang=>[false,true].map(live=>({width,lang,live}))));
 for(const {width,lang,live} of cases){
   const page=await browser.newPage({viewport:{width,height:width===320?740:844},
    isMobile:true,hasTouch:true,deviceScaleFactor:1,reducedMotion:"reduce",
    locale:lang==="fr"?"fr-FR":"en-GB"});
   const errors=[];
   page.on("pageerror",e=>errors.push(String(e?.message||e)));
   try{
    await page.goto(base+"/index.html?aoR17Reader=native"+(live?"":"&customsHistorical=off"),
      {waitUntil:"domcontentloaded",timeout:90000});
    await page.waitForFunction(()=>window.AO_APP_SHELL_V1?.status?.().visibleOwner===true,
      null,{timeout:45000});
    if(lang==="fr"){
      await page.evaluate(()=>globalThis.AO_APP_SHELL_V1?.navigate?.("settings"));
      await page.locator("#ao-settings-modular-root").waitFor({state:"visible",timeout:20000});
      await page.locator('[data-settings-route="/settings/language-reading"]').click();
      await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().route==="/settings/language-reading");
      await page.locator('[data-pref-path="general.uiLanguage"][data-pref-value="fr"]').click();
      await page.waitForFunction(()=>globalThis.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr");
      await page.evaluate(()=>globalThis.AO_SETTINGS_APP_V1?.close?.());
    }
    const opened=await page.evaluate(async()=>{
     const {installCalendarBrowserOwner}=await import("/src/calendar/calendar-runtime.js");
     return installCalendarBrowserOwner(globalThis).open();
    });
    assert.equal(opened,true,"Calendar must open through its actual owner");
    const cal=page.locator("#ao-calendar-modular-root");
    await cal.locator(".aoCalCustomCatalogue").waitFor({state:"visible",timeout:60000});
    // Calendar's asynchronous 1962-day paints replace the complete article DOM.
    // Open the native disclosure nodes synchronously rather than letting a
    // Playwright stability wait target a detached old <summary>.
    await page.evaluate(()=>{
      const root=document.querySelector("#ao-calendar-modular-root");
      root?.querySelector(".aoCalCustomCatalogue")?.setAttribute("open","");
      root?.querySelector('[data-cal-custom-id="ADVT-001"]')?.setAttribute("open","");
    });
    const parent=cal.locator('[data-cal-custom-id="ADVT-001"]');
    assert.equal(await parent.count(),1,"The existing Advent wreath article must remain one canonical card");
    const variant=cal.locator('[data-cal-custom-variant="AO-CUST-VAR-003"]');
    const count=await variant.count();
    assert.equal(count,live?1:0,"Historical details must be released by default, absent in QA baseline");
    assert.equal(await cal.locator(".aoCalCustomCatalogue [data-cal-custom-variant]").count(),live?22:0,
      "All 22 details should be nested under the 35 canonical articles, without duplicate cards");
    if(live){
      assert.equal(await cal.locator('[data-cal-customs-variants-preview="ADVT-001"]').count(),1);
      assert.match(await variant.textContent(),lang==="fr"?/Jean ou Jeanne/:/John or Joan/);
      await page.evaluate(()=>document.querySelector('[data-cal-custom-variant="AO-CUST-VAR-003"]')?.setAttribute("open",""));
      assert.match(await variant.textContent(),/1958|Weiser|Advent/);
      const source=variant.locator('a[href^="https://www.fisheaters.com/srpdf/"]');
      assert.equal(await source.count(),1,"A source link must accompany historical variant");
      assert.ok((await source.getAttribute("href")).endsWith(".pdf"));
    }
    if(live){
      const patronal=await cal.locator('[data-cal-custom-id="PATR-001"]').textContent();
      assert.ok(!patronal.includes("Attach this as regional history"),
        "Internal editorial instructions must never be rendered as public copy");
      assert.ok(!patronal.includes("Rattacher cette variante historique"),
        "Internal French editorial instructions must not appear in Calendar");
    }
    const dimensions=await page.evaluate(()=>{
     const el=document.querySelector("#ao-calendar-modular-root");
     return {width:innerWidth,documentScroll:document.documentElement.scrollWidth,
      articleScroll:el?.scrollWidth,articleClient:el?.clientWidth,
      canonicalArticles:el?.querySelectorAll("[data-cal-custom-id]").length};
    });
    assert.equal(dimensions.canonicalArticles,35,"35 original published articles plus single PENT-001 proposal");
    assert.ok(dimensions.articleScroll<=dimensions.articleClient+2,
      "Calendar horizontal overflow at "+width+": "+JSON.stringify(dimensions));
    assert.ok(errors.length===0,"Browser errors: "+errors.join(" | "));
    // The Calendar can repaint between frames; scrolling a Playwright locator
    // with a stability wait can target an obsolete node. Resolve the live node.
    await page.evaluate(()=>{
      const node=document.querySelector('[data-cal-custom-id="ADVT-001"]');
      node?.scrollIntoView({block:"start",behavior:"instant"});
    });
    await page.screenshot({path:resolve(output,`calendar-customs-${live?"historical":"baseline"}-${lang}-${width}.png`),
      fullPage:false,animations:"disabled"});
    console.log("PASS browser Calendar Customs: "+lang+" "+width+"px, "+(live?"historical":"baseline")+
      ", published=35, variant="+count+", no Calendar overflow");
   }finally{await page.close();}
  }
}finally{await browser?.close();await new Promise(ok=>server.close(ok));}
