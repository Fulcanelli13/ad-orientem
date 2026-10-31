import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const types={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".json":"application/json",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp",".jpg":"image/jpeg"};
const server=http.createServer(async(req,res)=>{
  try{
    const path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    const file=resolve(root,"."+path);
    if(!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
    const data=await readFile(file);
    res.writeHead(200,{"content-type":types[extname(file)]??"application/octet-stream","cache-control":"no-store"});res.end(data);
  }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e));}
});
await new Promise(ok=>server.listen(4193,"127.0.0.1",ok));
const output=resolve(root,"artifacts/preferences-book-phone");
await mkdir(output,{recursive:true});
const chapters=["accessibility","language-reading","mass","local-customs","prayer","general","privacy-data","about-sources"];
let browser;
try{
  browser=await chromium.launch({headless:true});
  for(const width of [320,390]){
    const ctx=await browser.newContext({viewport:{width,height:width===320?568:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
    const page=await ctx.newPage(),errors=[];
    page.on("pageerror",e=>errors.push(e.message));
    await page.goto("http://127.0.0.1:4193/index.html",{waitUntil:"domcontentloaded",timeout:90000});
    await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.()?.installed===true,null,{timeout:30000});
    await page.evaluate(()=>globalThis.AO_SETTINGS_APP_V1.open("/settings"));
    const panel=page.locator("#ao-settings-modular-root");
    await panel.waitFor({state:"visible",timeout:15000});
    const rect=await panel.boundingBox();
    assert.ok(rect?.width>=width-2&&rect?.width<=width+2,"Settings must span phone viewport");
    assert.equal(await panel.locator("[data-settings-close]").count(),1);
    assert.equal(await panel.locator(".aoPrefContents [data-settings-route]").count(),8);
    await page.screenshot({path:resolve(output,"contents-"+width+".png"),animations:"disabled"});
    await panel.locator("[data-settings-contents]").click();
    assert.equal(await panel.locator("[data-settings-toc]").isVisible(),true);
    await page.keyboard.press("Escape");
    assert.equal(await panel.locator("[data-settings-toc]").isVisible(),false);
    for(const id of chapters){
      const route="/settings/"+id;
      await panel.locator('.aoPrefContents [data-settings-route="'+route+'"]').click();
      await page.waitForFunction(r=>globalThis.AO_SETTINGS_APP_V1?.status?.().path===r,route);
      assert.equal(await panel.locator("[data-settings-close]").count(),1,"One close: "+id);
      assert.equal(await panel.locator(".aoPrefChapter").count(),1,"Chapter missing: "+id);
      assert.equal(await panel.locator("select").count(),0,"Native select in "+id);
      const horizontal=await page.evaluate(()=>({
        outer:document.getElementById("ao-settings-modular-root").scrollWidth,viewport:innerWidth
      }));
      assert.ok(horizontal.outer<=horizontal.viewport+2,"Horizontal overflow: "+id);
      if(width===390||["accessibility","mass","prayer","privacy-data"].includes(id))
        await page.screenshot({path:resolve(output,id+"-"+width+".png"),animations:"disabled"});
      await panel.locator("[data-settings-back]").click();
      await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1.status().route==="/settings");
    }
    await panel.locator('.aoPrefContents [data-settings-route="/settings/accessibility"]').click();
    await panel.locator('[data-pref-path="appearance.sacredArt"][data-pref-value="subtle"]').click();
    await page.waitForFunction(()=>document.documentElement.dataset.aoSacredArtV1==="subtle");
    assert.equal(await page.locator("#ao-global-painting-preference").count(),1);
    await panel.locator('[data-pref-path="accessibility.textScale"][data-pref-value="large"]').click();
    assert.match(await panel.locator(".aoPrefSpecimen").getAttribute("style"),/21\.5px/);
    await panel.locator("[data-settings-back]").click();
    await panel.locator('.aoPrefContents [data-settings-route="/settings/mass"]').click();
    await panel.locator('[data-pref-path="mass.defaultForm"][data-pref-value="solemn"]').click();
    await panel.locator('[data-pref-path="mass.preparationDepth"][data-pref-value="none"]').click();
    await panel.locator("[data-settings-back]").click();
    await panel.locator('.aoPrefContents [data-settings-route="/settings/prayer"]').click();
    assert.equal(await panel.locator("[data-pref-family]").count(),9);
    await panel.locator('[data-pref-family="3"]').click();
    await panel.locator('[data-pref-path="prayer.novenas.layout"][data-pref-value="page"]').click();
    await panel.locator("[data-settings-back]").click();
    const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem("ao2:preferences:v1")));
    assert.equal(stored.appearance.sacredArt,"subtle");
    assert.equal(stored.mass.defaultForm,"solemn");
    assert.equal(stored.mass.preparationDepth,"none");
    assert.equal(stored.prayer.novenas.layout,"page");
    await panel.locator('.aoPrefContents [data-settings-route="/settings/privacy-data"]').click();
    assert.equal(await panel.locator("[data-settings-reset-confirm]").count(),0);
    await panel.locator("[data-settings-reset-ask]").click();
    assert.equal(await panel.locator("[data-settings-reset-confirm]").count(),1);
    await panel.locator("[data-settings-reset-cancel]").click();
    assert.equal(await panel.locator("[data-settings-reset-confirm]").count(),0);
    assert.equal(await page.evaluate(()=>globalThis.AO_SETTINGS_DONOR_V4359.snapshot().preferences.mass.defaultForm),"solemn");
    await panel.locator("[data-settings-back]").click();
    await panel.locator('.aoPrefContents [data-settings-route="/settings/accessibility"]').click();
    // The user explicitly chose manual folio turns. A vertical gesture must
    // not change chapter, while an unmistakable horizontal gesture does.
    await page.evaluate(()=>{
      const h=document.querySelector("#ao-settings-modular-root .aoPrefChapter h2");
      h.dispatchEvent(new PointerEvent("pointerdown",{bubbles:true,pointerId:42,clientX:170,clientY:220}));
      h.dispatchEvent(new PointerEvent("pointerup",{bubbles:true,pointerId:42,clientX:172,clientY:120}));
    });
    assert.equal(await page.evaluate(()=>globalThis.AO_SETTINGS_APP_V1.status().path),"/settings/accessibility","Vertical pan turned a page");
    await page.evaluate(()=>{
      const h=document.querySelector("#ao-settings-modular-root .aoPrefChapter h2");
      h.dispatchEvent(new PointerEvent("pointerdown",{bubbles:true,pointerId:43,clientX:280,clientY:220}));
      h.dispatchEvent(new PointerEvent("pointerup",{bubbles:true,pointerId:43,clientX:120,clientY:220}));
    });
    await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1.status().path==="/settings/language-reading");
    await panel.locator("[data-settings-contents]").click();
    await panel.locator('[data-settings-book-route="/settings/about-sources"]').click();
    await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1.status().path==="/settings/about-sources");
    await panel.locator("[data-settings-close]").click();
    assert.equal(await page.locator("#ao-settings-modular-root").count(),0);
    assert.equal(await page.locator("#ao-global-painting-preference").count(),1);
    assert.deepEqual(errors,[],"Browser errors: "+errors.join("; "));
    await ctx.close();
    console.log("PASS "+width+"px: 8 chapters, specimen, underlined controls, stored Mass/Prayer/art, protected reset and ribbon");
  }
}finally{
  await browser?.close();
  await new Promise(ok=>server.close(ok));
}
