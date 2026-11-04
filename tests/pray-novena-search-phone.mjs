import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

// Full live Pray -> canonical Novena -> same search path, no alternate reader.
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/pray-novena-search");
await mkdir(output,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".css":"text/css",".json":"application/json",
 ".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end()}
  const bytes=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(err){res.writeHead(err?.code==="ENOENT"?404:500);res.end(String(err))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390])for(const language of ["en","fr"]){
  const context=await browser.newContext({viewport:{width,height:width===320?640:844},
   isMobile:true,hasTouch:true,deviceScaleFactor:1,reducedMotion:"reduce",serviceWorkers:"block"});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",err=>errors.push(err.message));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
    {waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.().visibleOwner===true&&
    globalThis.AO_SETTINGS_APP_V1?.status?.().installed===true,null,{timeout:45000});
   const nav=async id=>{
    const res=await page.evaluate(id=>globalThis.AO_APP_SHELL_V1.navigate(id),id);
    assert.equal(res?.ok,true,"Cannot navigate to "+id+": "+JSON.stringify(res));
   };
   await nav("settings");
   await page.locator('#ao-settings-modular-root [data-settings-route="/settings/language-reading"]').click();
   await page.locator('#ao-settings-modular-root [data-pref-path="general.uiLanguage"][data-pref-value="'+language+'"]').click();
   await page.locator("#ao-settings-modular-root [data-settings-close]").click();
   await page.waitForFunction(lang=>document.documentElement.lang===lang,language,{timeout:12000});
   await nav("pray");
   await page.waitForFunction(()=>typeof globalThis.AO_NOVENAS_V3?.open==="function",null,{timeout:15000});
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.hub",{returnContext:null})),true);
   const base="#aoPray435930.open";
   assert.equal(await page.locator(base+" [data-ao-pray-pilot-tile]").count(),9);
   const search=page.locator(base+" [data-p435930-pilot-search]");
   const corpus=await page.evaluate(()=>Object.fromEntries(["christmas","st_michael"].map(id=>[
    id,window.AO_NOVENAS_V3.corpus[id].title
   ])));
   assert.ok(corpus.christmas.en&&corpus.christmas.fr&&corpus.st_michael.en&&corpus.st_michael.fr);
   assert.equal(await page.locator(base+" [data-p435930-pilot-novena]").count(),16,
    "The exact canonical sixteen must appear once each in search");
   // Every novena is read from its canonical corpus title, not a second catalogue.
   for(const id of ["christmas","st_michael"]){
    const title=corpus[id][language];
    await search.fill(title);
    assert.equal(await page.locator(base+" [data-ao-pray-pilot-mosaic]").isVisible(),false);
    const hit=page.locator(base+' [data-p435930-pilot-novena="'+id+'"]');
    await hit.waitFor({state:"visible",timeout:10000});
    assert.equal((await hit.locator("b").textContent()).trim(),title);
    const novenaFacet=page.locator(base+' [data-p435930-pilot-facet="novena"]');
    await novenaFacet.click();
    assert.equal(await novenaFacet.getAttribute("aria-pressed"),"true");
    assert.equal(await hit.isVisible(),true);
    const latinFacet=page.locator(base+' [data-p435930-pilot-facet="la"]');
    await latinFacet.click();
    assert.equal(await hit.isVisible(),false,"Novena search cannot invent a full Latin witness");
    await latinFacet.click();
    assert.equal(await hit.isVisible(),true);
    await hit.tap({timeout:10000});
    await page.waitForFunction(id=>globalThis.AO_NOVENAS_V3?.state?.()?.id===id&&
     globalThis.AO_NOVENAS_V3?.state?.()?.screen==="day",id,{timeout:15000});
    assert.equal(await page.locator(base+" [data-ao-novena-deck]").count(),1,
     "Search result must open the canonical day reader directly");
    assert.equal(await page.locator(base+" [data-n1-begin]").count(),0,
     "No second Novena setup/Begin screen after search");
    if(id==="christmas")await page.screenshot({path:resolve(output,language+"-"+width+"-christmas-day.png"),animations:"disabled"});
    await page.locator(base+" [data-n1-about]").tap({timeout:10000});
    assert.equal(await page.evaluate(()=>globalThis.AO_NOVENAS_V3.state().screen),"detail");
    await page.locator(base+" [data-n1-back]").tap({timeout:10000});
    assert.equal(await page.evaluate(()=>globalThis.AO_NOVENAS_V3.state().screen),"day",
     "About Back must return to same canonical day");
    await page.locator(base+" [data-n1-back]").tap({timeout:10000});
    await search.waitFor({state:"visible",timeout:10000});
    assert.equal(await search.inputValue(),title,"Novena Back must restore the exact search query");
    assert.equal(await novenaFacet.getAttribute("aria-pressed"),"true",
     "The Novenas facet must survive return from its canonical reader");
    assert.equal(await hit.isVisible(),true);
    assert.equal(await page.locator(base+" [data-ao-pray-pilot-tile]").count(),9,
     "Nine approved doors must remain in search origin");
    await novenaFacet.click();
   }
   await search.fill("zzyy-no-such-novena");
   assert.equal(await page.locator(base+" [data-ao-pilot-result-count]").textContent(),"0");
   await search.fill("");
   assert.equal(await page.locator(base+" [data-ao-pray-pilot-mosaic]").isVisible(),true);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),true,
    "Prayer Novena search overflows the "+width+"px screen");
   assert.deepEqual(errors,[],"Browser errors: "+errors.join("; "));
   console.log("PASS "+width+"px "+language+": bilingual direct Novena search, canonical day, About, Back, facet and nine-door retention");
  }finally{await context.close()}
 }
}finally{
 await browser?.close();
 await new Promise(done=>server.close(done));
}
